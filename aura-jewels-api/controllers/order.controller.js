import mongoose from "mongoose";
import { supportsTransactions } from "../utils/mongoTransaction.js";
import {
    get_orders_list_db,
    update_order_status_db,
    update_order_item_status_db,
    change_order_item_status_db,
    update_order_tracking_db,
    change_order_payment_status_db,
    reconcile_order_payment_db
} from "../services/order.services.js";
import { sendMetaPurchaseEvent } from "../services/metaConversion.services.js";
import Order from "../models/order.model.js";
import OrderItem from "../models/orderItem.model.js";
import RefundTransaction from "../models/refundTransaction.model.js";
import Constant from "../constants/user.constant.js";
import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";
import ActivityLog from "../models/activityLog.model.js";
import Currency from "../models/currency.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import { ReturnAcceptedMailTemplate, ReturnRejectedMailTemplate } from "../mailtemplates/order.mail.js";
import { orderShippedEmail, orderDeliveredEmail, orderCancelledEmail, refundInitiatedEmail, refundCompletedEmail, orderStatusUpdateEmail, orderItemStatusEmail, cancelRequestRejectedEmail, cancelItemRequestRejectedEmail } from "../mailtemplates/orderStatus.mail.js";
import { MAIL } from "../config/mail.config.js";
import { reverse_coupon_usage_db } from "../services/coupon.services.js";
import { create_order_payment_link_db } from "../services/paymentLink.services.js";
import { resolveAssetUrl, stripAssetHost } from "../utils/uploadPaths.js";
import { uploadBufferToS3 } from "../utils/multer.js";
import baseUrl from "../constants/baseUrl.js";

// POST /order/:id/payment-link (admin) — generate a Razorpay payment link for a
// pending order so the customer can pay via a shared link. Confirmed by webhook.
export const requestOrderPaymentLink = async (req, res) => {
    try {
        const result = await create_order_payment_link_db(req.params.id, req.body?.amount);
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Payment link created",
            data: result,
        });
    } catch (error) {
        return res.status(STATUS_CODE.BAD_REQUEST).json({
            errorCode: STATUS_CODE.BAD_REQUEST,
            message: error?.message || "Could not create payment link",
        });
    }
};

// POST /order/:id/reconcile-payment (admin) — re-check a stuck order against the
// gateway and resolve it (finalize if genuinely paid, fail if not, leave pending
// if still in flight). Recovers "money debited but order not completed" cases.
export const reconcileOrderPayment = async (req, res) => {
    try {
        const result = await reconcile_order_payment_db(req.params.id);
        const messages = {
            finalized: "Payment found and confirmed. Order marked as paid.",
            already_paid: "Order is already paid.",
            pending: "Payment is still in progress at the gateway. Try again shortly.",
            failed: "No payment was captured. Order marked as failed.",
            no_gateway_reference: "This order has no gateway reference to reconcile.",
        };
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: messages[result.status] || "Reconciliation complete.",
            data: { status: result.status, order: result.order },
        });
    } catch (error) {
        return res.status(STATUS_CODE.BAD_REQUEST).json({
            errorCode: STATUS_CODE.BAD_REQUEST,
            message: error?.message || "Could not reconcile payment",
        });
    }
};

export const SWITCH_ENFORCE_ORDER_STATE_SEQUENCE = Constant.SWITCHES.SWITCH_ENFORCE_ORDER_STATE_SEQUENCE;
export const SWITCH_LOG_ORDER_TRANSITIONS = Constant.SWITCHES.SWITCH_LOG_ORDER_TRANSITIONS;
export const SWITCH_AUTO_CALCULATE_ESTIMATED_DELIVERY = Constant.SWITCHES.SWITCH_AUTO_CALCULATE_ESTIMATED_DELIVERY;
export const SWITCH_SAVE_REFUND_DETAILS = Constant.SWITCHES.SWITCH_SAVE_REFUND_DETAILS;

const ALLOWED_TRANSITIONS = {
    "Received": ["Approved", "Rejected", "Failed"],
    "Pending": ["Approved", "Rejected", "Failed", "Cancelled"],
    "Approved": ["In Production", "Rejected", "Failed", "Cancelled"],
    "In Production": ["Ready to Ship", "Rejected", "Failed"],
    "Ready to Ship": ["Shipped", "Rejected", "Failed"],
    "Shipped": ["Delivered", "Rejected", "Failed"],
    "Delivered": ["Rejected"],
    "Return Request": ["Item Received", "Returned Rejected", "Rejected", "Failed"],
    "Item Received": ["QA Done", "Rejected", "Failed"],
    "QA Done": ["Returned Approved", "Returned Rejected", "Rejected", "Failed"],
    "Returned Approved": ["Refunded", "Rejected", "Failed"],
    "Failed": ["Pending", "Rejected"],
    "Cancelled": ["Cancelled Approved", "Cancelled Rejected", "Rejected", "Failed"],
    "Cancelled Approved": ["Refunded", "Rejected"],
    "Cancelled Rejected": ["Approved", "Rejected", "Failed"],
    "Refunded": ["Rejected"]
};

const ALLOWED_TRANSITIONS_ITEM = {
    ...ALLOWED_TRANSITIONS,
    "Cancelled Rejected": ["Approved", "In Production", "Ready to Ship", "Shipped", "Delivered", "Rejected", "Failed"]
};

const resolveOrderStatus = (status) => {
    if (Constant.ORDER_STATUS[status]) return Constant.ORDER_STATUS[status];
    return status;
};

// const mapStatusForCustomer = (status) => {
//     const mapping = {
//         "Pending": "Pending",
//         "Approved": "Approved",
//         "Confirmed": "Confirmed",
//         "In Production": "In Production",
//         "Ready to Ship": "Ready to Ship",
//         "Shipped": "Shipped",
//         "Delivered": "Delivered",
//         "Cancelled": "Cancel Request",
//         "Cancelled Approved": "Cancelled",
//         "Cancelled Rejected": "Cancelled Rejected",
//         "Rejected": "Rejected",
//         "Return Request": "Return Requested",
//         "Returned Approved": "Return Request Accepted",
//         "Returned Rejected": "Return Request Rejected",
//         "Item Received": "Item Returned",
//         "QA Done": "Return QA Approved",
//         "Refunded": "Refunded",
//         "Failed": "Failed",
//         "Received": "Pending"
//     };
//     return mapping[status] || status;
// };

export const getOrdersList = async (req, res) => {
    try {
        const { search, orderStatusId, page = 1, limit = 10 } = req.body;
        const filters = { isDelete: false };

        if (orderStatusId) {
            let statusList = [];
            if (Array.isArray(orderStatusId)) {
                statusList = orderStatusId;
            } else if (typeof orderStatusId === 'string' && orderStatusId.trim() !== '') {
                statusList = orderStatusId.split(',').map(s => s.trim());
            }
            if (statusList.length > 0) {
                const conditions = [];
                statusList.forEach(status => {
                    if (status === "Payment Pending") {
                        conditions.push({ paymentStatus: "pending" });
                    } else if (status === "Failed Payment") {
                        conditions.push({ paymentStatus: "failed" });
                    } else if (status === "Pending") {
                        conditions.push({
                            status: "Pending",
                            paymentStatus: "paid"
                        });
                    } else {
                        conditions.push({ status });
                    }
                });
                filters.$or = conditions;
            }
        }

        if (search && search.trim() !== "") {
            const searchRegex = new RegExp(search.trim(), "i");
            filters.$or = (filters.$or || []).concat([
                { "shippingAddress.firstName": searchRegex },
                { "shippingAddress.lastName": searchRegex },
                { "shippingAddress.email": searchRegex },
                { "shippingAddress.phone": searchRegex }
            ]);
        }

        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;

        const { total, data: orders } = await get_orders_list_db(filters, pageNum, limitNum);

        const activeCurrencies = await Currency.find({ isActive: true });
        const currencyMap = {};
        activeCurrencies.forEach(c => {
            currencyMap[c.code.toUpperCase()] = c.symbol;
        });
        const getCurrencySignFromMap = (code) => currencyMap[String(code).toUpperCase()] || "₹";

        const formattedOrders = orders.map(order => {
            const user_detail = [{
                firstName: order.shippingAddress?.firstName || order.user?.firstName || "N/A",
                lastName: order.shippingAddress?.lastName || order.user?.lastName || "N/A",
                email: order.shippingAddress?.email || order.user?.email || "N/A",
                phone: order.shippingAddress?.phone || order.user?.phone || "N/A"
            }];

            return {
                _id: order._id,
                orderNumber: order.orderId || order._id.toString().substring(0, 8).toUpperCase(),
                createdAt: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A",
                currencysign: getCurrencySignFromMap(order.displayCurrency),
                totalamount: order.displayCurrency === "INR" ? (order.total || 0) : (order.paidAmount || 0),
                TotalItem: order.items ? order.items.length : 0,
                user_detail,
                status: order.status,
                paymentStatus: order.paymentStatus,
                payment_status: [{
                    adminstatuscaption: order.paymentStatus === "paid" ? "Success" : (order.paymentStatus === "failed" ? "Failed" : "Pending")
                }],
                trackingNumber: order.trackingNumber || "",
                shippingCarrier: order.shippingCarrier || "",
                trackingUrl: order.trackingUrl || "",
                estimatedDeliveryDate: order.estimatedDeliveryDate || null,
                shippingAddress: order.shippingAddress,
                billingAddress: order.billingAddress,
                hasBilling: order.hasBilling,
                refundTransactions: order.refundTransactions || [],
                invoiceUrl: (() => {
                    const url = baseUrl(req);
                    return order?.invoiceUrl ? resolveAssetUrl(order?.invoiceUrl, url, "uploads/invoices") : "";
                })(),
                receiptUrl: (() => {
                    const url = baseUrl(req);
                    const r = (order.receipts || []).find(x => x.type === Constant.RECEIPT_TYPES.RECEIPT);
                    return r ? resolveAssetUrl(r.fileName, url, "uploads/receipts") : "";
                })(),
                detailReceiptUrl: (() => {
                    const url = baseUrl(req);
                    const r = (order.receipts || []).find(x => x.type === Constant.RECEIPT_TYPES.DETAIL_RECEIPT);
                    return r ? resolveAssetUrl(r.fileName, url, "uploads/receipts") : "";
                })()
            };
        });

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.ORDER.LIST_FETCHED,
            data: formattedOrders,
            totalOrder: total
        });
    } catch (error) {
        console.error("getOrdersList error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const getRecentOrders = async (req, res) => {
    try {
        const page = parseInt(req.body.page || req.query.page, 10) || 1;
        const limit = Math.min(parseInt(req.body.limit || req.query.limit, 10) || 10, 50);
        const search = req.body.search || req.query.search || "";

        const matchQuery = {
            isDelete: false,
            paymentStatus: "paid",
            status: Constant.ORDER_STATUS.PENDING,
        };

        const basePipeline = [
            { $match: matchQuery },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "userDoc",
                },
            },
            { $unwind: { path: "$userDoc", preserveNullAndEmptyArrays: true } },
        ];

        if (search && search.trim() !== "") {
            const searchRegex = new RegExp(search.trim(), "i");
            basePipeline.push({
                $match: {
                    $or: [
                        { orderId: searchRegex },
                        { "shippingAddress.firstName": searchRegex },
                        { "shippingAddress.lastName": searchRegex },
                        { "shippingAddress.email": searchRegex },
                        { "shippingAddress.phone": searchRegex },
                        { "userDoc.name": searchRegex },
                        { "userDoc.email": searchRegex },
                        { "userDoc.phone": searchRegex },
                    ],
                },
            });
        }

        // Count total orders matching filter
        const countPipeline = [...basePipeline, { $count: "total" }];
        const countResult = await Order.aggregate(countPipeline);
        const total = countResult[0]?.total || 0;

        // Fetch paginated data
        const dataPipeline = [
            ...basePipeline,
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {

                $project: {
                    _id: 1,
                    orderId: 1,
                    status: 1,
                    paymentStatus: 1,
                    total: 1,
                    paidAmount: 1,
                    displayCurrency: 1,
                    baseCurrency: 1,
                    exchangeRate: 1,
                    itemCount: { $size: { $ifNull: ["$items", []] } },
                    createdAt: 1,
                    customer: {
                        name: {
                            $trim: {
                                input: {
                                    $concat: [
                                        { $ifNull: ["$shippingAddress.firstName", { $ifNull: ["$userDoc.name", ""] }] },
                                        " ",
                                        { $ifNull: ["$shippingAddress.lastName", ""] },
                                    ],
                                },
                            },
                        },
                        email: { $ifNull: ["$shippingAddress.email", { $ifNull: ["$userDoc.email", ""] }] },
                        phone: { $ifNull: ["$shippingAddress.phone", { $ifNull: ["$userDoc.phone", ""] }] },
                    },

                    payment: {
                        provider: { $ifNull: ["$payment.provider", ""] },
                        method: { $ifNull: ["$payment.method", ""] },
                        gatewayPaymentId: { $ifNull: ["$payment.gatewayPaymentId", ""] },
                        capturedAt: { $ifNull: ["$payment.capturedAt", null] },
                    },

                    settlementReview: 1,
                },
            },
        ];

        const orders = await Order.aggregate(dataPipeline);

        // Convert amount to display currency for convenience.
        const formatted = orders.map((o) => ({
            ...o,
            orderNumber: o.orderId || o._id.toString().substring(0, 8).toUpperCase(),
            amount: o.displayCurrency === "INR" ? (o.total || 0) : (o.paidAmount || 0),
        }));

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Recent orders fetched successfully",
            totalOrder: total,
            page,
            limit,
            data: formatted,
        });
    } catch (error) {
        console.error("getRecentOrders error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
        });
    }
};


// the product default (item.origin is null / empty) — derive it from the centre
// stone's stone-group type, or failing that its price track (lgd vs natural).
// Mirrors the storefront cart's origin resolution so both stay consistent.
const resolveDiamondOrigin = (item) => {
    const explicit = String(item?.origin || "").toLowerCase();
    if (explicit) {
        if (explicit === "lgd" || explicit === "labgrown" || explicit.includes("lab")) return "Lab Grown";
        if (explicit === "natural") return "Natural";
        return item.origin;
    }
    const dd = item?.diamondDetails;
    const arr = Array.isArray(dd) ? dd : (dd && typeof dd === "object" ? [dd] : []);
    const center = arr.find(s => String(s?.type || "").toLowerCase() === "center") || arr[0];
    if (!center) return "";
    const sgType = String(center.stoneGroup?.type || center.stoneGroup?.stoneType || "").toLowerCase();
    if (sgType.includes("lab") || sgType === "lgd") return "Lab Grown";
    if (sgType === "natural" || sgType === "natural diamond") return "Natural";
    const nat = Number(center.naturalPrice ?? center.stoneGroup?.natural_price) || 0;
    const lgd = Number(center.lgdPrice ?? center.stoneGroup?.lgd_price) || 0;
    if (nat > 0 && lgd <= 0) return "Natural";
    if (lgd > 0 && nat <= 0) return "Lab Grown";
    return ""; // undeterminable — don't fabricate an origin (UI shows N/A)
};

export const getOrderDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findOne({ _id: id, isDelete: false })
            .populate("user", "firstName lastName email phone")
            .populate({
                path: "items",
                populate: {
                    path: "productId",
                    populate: {
                        path: "categoryId"
                    }
                }
            });

        if (!order) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.ORDER.NOT_FOUND
            });
        }

        const txs = await RefundTransaction.find({ orderId: order._id }).sort({ createdAt: -1 });

        const orderDetailItems = (order.items || []).map(item => {
            const productDetails = item.productDetails || {};
            const diamondDetails = item.diamondDetails || {};
            const convertedPrice = order.displayCurrency === "INR"
                ? (item.price || 0)
                : parseFloat(((item.price || 0) / (order.exchangeRate || 1)).toFixed(2));
            const JeweleryDetail = [{
                itemCode: productDetails.itemCode || "N/A",
                productTitle: productDetails.productTitle || "N/A",
                finalPrice: convertedPrice,
                designCode: productDetails.designNumber || productDetails.designCode || (item.productId && item.productId.designNumber) || "N/A",
                category: productDetails.categoryName || (item.productId && item.productId.categoryId && item.productId.categoryId.categoryName) || "Jewelry",
                metalstamp: productDetails.metalStamp || productDetails.metalstamp || (productDetails.metal && (productDetails.metal.stamp || productDetails.metal.name)) || "N/A",
                metaltype: productDetails.metalType || productDetails.metaltype || (productDetails.metal && (productDetails.metal.type || productDetails.metal.name)) || "N/A",
                settingType: productDetails.settingType || "N/A",
                reason: productDetails.reason || item.reason || "N/A",
                images: productDetails.images || [],
                size: productDetails.size || "N/A",
                metalWeight: productDetails.metalWeight || "N/A",
                engravingText: productDetails.engravingText || "N/A",
                selectedOrigin: resolveDiamondOrigin(item) || "N/A",
                selectedColor: item.color || "N/A",
                selectedClarity: item.clarity || "N/A",
                trackingcode: item.trackingNumber || order.trackingNumber || "",
                trackingurl: item.trackingUrl || order.trackingUrl || "",
                jewelery_current_status: [{
                    status_id: item.status || Constant.ORDER_STATUS.RECEIVED,
                    adminstatuscaption: item.status || Constant.ORDER_STATUS.RECEIVED
                }]
            }];

            // Normalize diamondDetails to an array of stones
            let stones = [];
            if (Array.isArray(diamondDetails)) {
                stones = diamondDetails;
            } else if (diamondDetails && typeof diamondDetails === "object" && Object.keys(diamondDetails).length > 0) {
                stones = [diamondDetails];
            }

            const diamondDetail = stones.map(dia => {
                const shapeName = dia.shape?.name || (Array.isArray(dia.shape) ? (dia.shape[0]?.name || dia.shape[0]) : dia.shape) || "N/A";
                const colorName = dia.color?.name || (Array.isArray(dia.color) ? (dia.color[0]?.name || dia.color[0]) : dia.color) || "N/A";
                const clarityName = dia.clarity?.name || (Array.isArray(dia.clarity) ? (dia.clarity[0]?.name || dia.clarity[0]) : dia.clarity) || "N/A";

                const selectedOrigin = String(item.origin || "").toLowerCase();
                const isNatural = selectedOrigin === "natural";
                const rate = isNatural
                    ? (dia.stoneGroup?.natural_price || 0)
                    : (dia.stoneGroup?.lgd_price || 0);
                const weight = parseFloat(dia.weight || dia.totalCarat || 0);
                const calculatedPrice = Math.round(rate * weight);
                const basePrice = Math.round(dia.price || dia.finalamount || calculatedPrice || 0);

                const convertedDiaPrice = order.displayCurrency === "INR"
                    ? basePrice
                    : parseFloat((basePrice / (order.exchangeRate || 1)).toFixed(2));

                const isCenter = String(dia.type).toLowerCase() === "center";
                const displayColor = (isCenter && item.color) ? item.color : colorName;
                const displayClarity = (isCenter && item.clarity) ? item.clarity : clarityName;

                const originLabel = resolveDiamondOrigin(item);
                const displayType = isCenter
                    ? `Center${originLabel ? ` (${originLabel})` : ""}`
                    : (dia.type || "N/A");

                let pcs = dia.pieces;
                if (!pcs) {
                    const w = parseFloat(dia.weight || dia.totalCarat || 0);
                    const sz = parseFloat(dia.size || 0);
                    if (w > 0 && sz > 0) {
                        pcs = Math.round(w / sz);
                    } else {
                        pcs = String(dia.type).toLowerCase() === "center" ? 1 : 0;
                    }
                }

                return {
                    type: displayType,
                    weight: dia.weight || "N/A",
                    carat: dia.carat || dia.totalCarat || "N/A",
                    pieces: pcs,
                    shape: shapeName,
                    stockId: dia.stockId || dia.ref || dia.stoneCode || "N/A",
                    color: displayColor,
                    clarity: displayClarity,
                    finalamount: convertedDiaPrice,
                    reason: diamondDetails.reason || item.reason || "N/A",
                    trackingcode: item.trackingNumber || order.trackingNumber || "",
                    trackingurl: item.trackingUrl || order.trackingUrl || "",
                    diamond_current_status: [{
                        status_id: item.status || Constant.ORDER_STATUS.RECEIVED,
                        adminstatuscaption: item.status || Constant.ORDER_STATUS.RECEIVED
                    }]
                };
            });

            const itemRefundDetails = item.refundDetails ? {
                refundType: item.refundDetails.refundType || "none",
                amount: order.displayCurrency === "INR"
                    ? (item.refundDetails.amount || 0)
                    : parseFloat(((item.refundDetails.amount || 0) / (order.exchangeRate || 1)).toFixed(2)),
                walletCredited: item.refundDetails.walletCredited || false,
                gatewayRefundId: item.refundDetails.gatewayRefundId || "",
                accountHolderName: item.refundDetails.accountHolderName || "",
                bankName: item.refundDetails.bankName || "",
                accountNumber: item.refundDetails.accountNumber || "",
                ifscCode: item.refundDetails.ifscCode || "",
                refundRemarks: item.refundDetails.refundRemarks || "",
                refundedAt: item.refundDetails.refundedAt || null,
                // Cancellation and Return specific details
                requestedAt: item.refundDetails.requestedAt || null,
                requestedBy: item.refundDetails.requestedBy || null,
                approvedAt: item.refundDetails.approvedAt || null,
                approvedBy: item.refundDetails.approvedBy || null,
                cancellationReason: item.refundDetails.cancellationReason || "",
                chargePercentage: item.refundDetails.chargePercentage || 0,
                chargeAmount: order.displayCurrency === "INR"
                    ? (item.refundDetails.chargeAmount || 0)
                    : parseFloat(((item.refundDetails.chargeAmount || 0) / (order.exchangeRate || 1)).toFixed(2)),
                refundStatus: item.refundDetails.refundStatus || ""
            } : null;

            return {
                _id: item._id,
                qty: productDetails.qty || 1,
                price: convertedPrice,
                JeweleryDetail,
                diamondDetail,
                refundDetails: itemRefundDetails
            };
        });

        const activeCurrencies = await Currency.find({ isActive: true });
        const currencyMap = {};
        activeCurrencies.forEach(c => {
            currencyMap[c.code.toUpperCase()] = c.symbol;
        });
        const getCurrencySignFromMap = (code) => currencyMap[String(code).toUpperCase()] || "₹";

        const displayTotal = order.displayCurrency === "INR" ? (order.total || 0) : (order.paidAmount || 0);

        // Convert an INR-stored amount into the order's display currency (identity
        // for INR orders) so every money field below reconciles with displayTotal.
        const conv = (v) => order.displayCurrency === "INR"
            ? (Number(v) || 0)
            : parseFloat(((Number(v) || 0) / (order.exchangeRate || 1)).toFixed(2));

        // Derive the real payment type from the order (gateway / wallet) instead
        // of the legacy hardcoded "Cash on Delivery" — COD is not offered.
        const _walletUsed = Number(order.walletUsed) || 0;
        const _pay = order.payment || {};
        let paymentType, paymentTxnId;
        if (_pay.provider) {
            const method = _pay.method ? ` (${String(_pay.method).toUpperCase()})` : "";
            const label = _pay.provider === "razorpay" ? "Razorpay" : _pay.provider;
            paymentType = `${label}${method}${_walletUsed > 0 ? " + Wallet" : ""}`;
            paymentTxnId = _pay.gatewayPaymentId || _pay.gatewayOrderId || "—";
        } else if (_walletUsed > 0 && _walletUsed >= (Number(order.total) || 0)) {
            paymentType = "Store Wallet";
            paymentTxnId = "WALLET";
        } else {
            paymentType = "Online Payment";
            paymentTxnId = _pay.gatewayPaymentId || "—";
        }

        const orderDetailWrapper = {
            _id: order._id,
            orderNumber: order.orderId || order._id.toString().substring(0, 8).toUpperCase(),
            user_detail: [{
                firstName: order.shippingAddress?.firstName || order.user?.firstName || "N/A",
                lastName: order.shippingAddress?.lastName || order.user?.lastName || "N/A",
                email: order.shippingAddress?.email || order.user?.email || "N/A",
                phone: order.shippingAddress?.phone || order.user?.phone || "N/A"
            }],
            currencysign: getCurrencySignFromMap(order.displayCurrency),
            totalamount: displayTotal,
            payment_type: paymentType,
            orderPaymentDetails: [{ payment_transaction_id: paymentTxnId }],
            createdAt: order.createdAt || null,
            paymentStatus: order.paymentStatus,
            status: order.status,
            trackingNumber: order.trackingNumber || "",
            shippingCarrier: order.shippingCarrier || "",
            trackingUrl: order.trackingUrl || "",
            estimatedDeliveryDate: order.estimatedDeliveryDate || null,
            orderDetail: orderDetailItems,

            // Fields requested by admin dashboard (orderDetail.jsx)
            shippingAddress: {
                firstName: order.shippingAddress?.firstName || "",
                lastName: order.shippingAddress?.lastName || "",
                address: order.shippingAddress?.address || "",
                zipCode: order.shippingAddress?.zipCode || "",
                city: order.shippingAddress?.city || "",
                state: order.shippingAddress?.state || "",
                country: order.shippingAddress?.country || "",
                emailId: order.shippingAddress?.email || "",
                number: order.shippingAddress?.phone || ""
            },
            billingAddress: {
                firstName: order.billingAddress?.firstName || order.shippingAddress?.firstName || "",
                lastName: order.billingAddress?.lastName || order.shippingAddress?.lastName || "",
                address: order.billingAddress?.address || order.shippingAddress?.address || "",
                zipCode: order.billingAddress?.zipCode || order.shippingAddress?.zipCode || "",
                city: order.billingAddress?.city || order.shippingAddress?.city || "",
                state: order.billingAddress?.state || order.shippingAddress?.state || "",
                country: order.billingAddress?.country || order.shippingAddress?.country || "",
                emailId: order.billingAddress?.email || order.shippingAddress?.email || "",
                number: order.billingAddress?.phone || order.shippingAddress?.phone || ""
            },
            gstNo: order?.gstNo || "",
            companyName: order?.companyName || "",
            // Real values from the persisted order. Previously several of these
            // were hardcoded 0 / "N/A", which dropped tax, wallet, refund and the
            // full gateway details before the UI ever saw them.
            grossamount: conv(order.subTotal || order.total),
            discamount: conv(order.coupon?.discountAmount || 0),
            couponCode: order.coupon?.code || "",
            // GST / tax — persisted on the order; previously not returned at all,
            // so subtotal + discount + shipping never reconciled to the total.
            taxableAmount: conv(order.taxableAmount || 0),
            taxRate: Number(order.taxRate) || 0,
            taxAmount: conv(order.taxAmount || 0),
            shippingcharge: conv(order.shippingCharge || 0),
            walletAmount: conv(order.walletUsed || 0),
            netamount: displayTotal,
            remainingAmount: order.paymentStatus === "paid"
                ? 0
                : conv(order.amountDue != null ? order.amountDue : order.total),
            // Full payment / gateway details (previously collapsed to one txn id).
            paymentInfo: {
                provider: _pay.provider || "",
                method: _pay.method || "",
                gatewayOrderId: _pay.gatewayOrderId || "",
                gatewayPaymentId: _pay.gatewayPaymentId || "",
                paymentLinkId: _pay.paymentLinkId || "",
                capturedAt: _pay.capturedAt || null,
                walletUsed: conv(order.walletUsed || 0),
                amountDue: conv(order.amountDue || 0),
                paidAmount: conv(order.paidAmount || 0),
            },
            refundDetails: order.refundDetails || null,
            refundTransactions: txs || [],
            settlementReview: order.settlementReview || null,
            payment_status: [{
                adminstatuscaption: order.paymentStatus === "paid" ? "Success"
                    : order.paymentStatus === "failed" ? "Failed" : "Pending"
            }],
            invoiceUrl: order.invoiceUrl
                ? resolveAssetUrl(order.invoiceUrl, baseUrl(req), "uploads/invoices")
                : "",
            receiptUrl: (() => {
                const url = baseUrl(req);
                const r = (order.receipts || []).find(x => x.type === Constant.RECEIPT_TYPES.RECEIPT);
                return r ? resolveAssetUrl(r.fileName, url, "uploads/receipts") : "";
            })(),
            detailReceiptUrl: (() => {
                const url = baseUrl(req);
                const r = (order.receipts || []).find(x => x.type === Constant.RECEIPT_TYPES.DETAIL_RECEIPT);
                return r ? resolveAssetUrl(r.fileName, url, "uploads/receipts") : "";
            })(),
            orderComment: order.message || order.orderComment || "N/A",
            notes: order.notes || ""
        };

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.ORDER.DETAIL_FETCHED,
            data: [orderDetailWrapper]
        });
    } catch (error) {
        console.error("getOrderDetail error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

const sendReturnStatusEmail = async (orderId, newStatus, requestBody, returnedItemIds = null) => {
    try {
        const populatedOrder = await Order.findById(orderId)
            .populate("user", "firstName lastName email")
            .populate({ path: "items", populate: [{ path: "sizeId" }, { path: "productId" }] });
        if (!populatedOrder) return;
        const emailTo = populatedOrder.shippingAddress?.email || populatedOrder.user?.email;
        if (!emailTo) return;

        // If returnedItemIds is not provided, we filter order items that match the newStatus
        const itemIds = returnedItemIds || (populatedOrder.items || [])
            .filter(item => item.status === newStatus)
            .map(item => item._id);

        let mailHtml = "";
        let subject = "";

        if (newStatus === Constant.ORDER_STATUS.RETURNED_APPROVED) {
            mailHtml = ReturnAcceptedMailTemplate(populatedOrder, itemIds);
            subject = `Aura Jewels Return Request Approved - #${populatedOrder.orderId || populatedOrder._id.toString().substring(0, 8).toUpperCase()}`;
        } else if (newStatus === Constant.ORDER_STATUS.RETURNED_REJECTED) {
            const reason = requestBody?.reason || requestBody?.comment || "Product did not meet return guidelines.";
            mailHtml = ReturnRejectedMailTemplate(populatedOrder, reason, itemIds);
            subject = `Aura Jewels Return Update: Request Declined - #${populatedOrder.orderId || populatedOrder._id.toString().substring(0, 8).toUpperCase()}`;
        } else {
            return;
        }

        await sendEmail(emailTo, subject, mailHtml, { from: MAIL.senders.returns });
    } catch (err) {
        console.error("sendReturnStatusEmail error:", err);
    }
};

// Customer-facing emails for the main lifecycle transitions (shipped / delivered
// / cancel-approved). Non-fatal — never blocks the status update.
const sendOrderStatusEmail = async (orderId, newStatus, requestBody) => {
    try {
        const order = await Order.findById(orderId).populate("user", "firstName lastName email");
        if (!order) return;
        const emailTo = order.shippingAddress?.email || order.user?.email;
        if (!emailTo) return;
        const name = order.shippingAddress?.firstName
            ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName || ""}`.trim()
            : `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.trim();
        const o = { ...order.toObject(), customerName: name };
        const oid = order.orderId || order._id.toString().substring(0, 8).toUpperCase();
        const S = Constant.ORDER_STATUS;
        // Refund/cancel/reject lifecycle mails come from returns@; the rest from orders@.
        const senderFrom = (newStatus === S.REFUNDED || newStatus === S.CANCELLED_APPROVED || newStatus === S.REJECTED || newStatus === S.CANCELLED_REJECTED)
            ? MAIL.senders.returns
            : MAIL.senders.order;
        let html = "", subject = "";
        if (newStatus === S.SHIPPED) {
            html = orderShippedEmail(o, {
                // The order stores the tracking number under `trackingNumber` /
                // `shippingCarrier` (set by the update-tracking flow). Fall back
                // to those so a shipped mail always shows tracking even when this
                // status change didn't carry it in the request body.
                trackingId: requestBody?.trackingId || order.trackingNumber || "",
                courier: requestBody?.courier || order.shippingCarrier || "",
            });
            subject = `Your Aura Jewels order has shipped - #${oid}`;
        } else if (newStatus === S.DELIVERED) {
            html = orderDeliveredEmail(o);
            subject = `Your Aura Jewels order has been delivered - #${oid}`;
        } else if (newStatus === S.CANCELLED_APPROVED) {
            html = orderCancelledEmail(o, requestBody?.reason || requestBody?.rejectReason || "");
            subject = `Your Aura Jewels order was cancelled - #${oid}`;
            await sendEmail(emailTo, subject, html, { from: senderFrom });
            // Also confirm the refund is being processed.
            await sendEmail(emailTo, `Refund initiated for your Aura Jewels order - #${oid}`, refundInitiatedEmail(o), { from: MAIL.senders.returns });
            return;
        } else if (newStatus === S.CANCELLED_REJECTED) {
            html = cancelRequestRejectedEmail(o);
            subject = `Cancellation request declined for your Aura Jewels order - #${oid}`;
        } else if (newStatus === S.REFUNDED) {
            html = refundCompletedEmail(o);
            subject = `Refund completed for your Aura Jewels order - #${oid}`;
        } else if (newStatus === S.APPROVED || newStatus === S.CONFIRMED) {
            html = orderStatusUpdateEmail(o, {
                headline: "Your Order Is Confirmed",
                message: `We're delighted to confirm your order <strong>${oid}</strong>. Our artisans are preparing it with care — we'll keep you posted at every step.`,
            });
            subject = `Your Aura Jewels order is confirmed - #${oid}`;
        } else if (newStatus === S.IN_PRODUCTION) {
            html = orderStatusUpdateEmail(o, {
                headline: "Your Order Is In Production",
                message: `Your order <strong>${oid}</strong> is now in production. Each piece is crafted to order, so this is where the magic happens.`,
            });
            subject = `Your Aura Jewels order is in production - #${oid}`;
        } else if (newStatus === S.READY_TO_SHIP) {
            html = orderStatusUpdateEmail(o, {
                headline: "Your Order Is Ready To Ship",
                message: `Great news — your order <strong>${oid}</strong> is ready to ship and will be dispatched shortly. You'll receive tracking details as soon as it's on its way.`,
            });
            subject = `Your Aura Jewels order is ready to ship - #${oid}`;
        } else if (newStatus === S.RECEIVED) {
            html = orderStatusUpdateEmail(o, {
                headline: "We've Received Your Order",
                message: `Thank you — we've received your order <strong>${oid}</strong> and it's being reviewed by our team.`,
            });
            subject = `We've received your Aura Jewels order - #${oid}`;
        } else if (newStatus === S.REJECTED) {
            html = orderStatusUpdateEmail(o, {
                headline: "About Your Order",
                message: `We're sorry — we were unable to accept your order <strong>${oid}</strong>.`,
                note: `Any amount paid will be refunded to your original payment method. Questions? Email ${MAIL.supportEmail}.`,
            });
            subject = `Update on your Aura Jewels order - #${oid}`;
        } else {
            return;
        }
        await sendEmail(emailTo, subject, html, { from: senderFrom });
    } catch (err) {
        console.error("sendOrderStatusEmail error:", err);
    }
};

// Item-level customer email — names ONLY the affected line, for when a single
// item of an order is cancelled / rejected / shipped / delivered / returned /
// refunded (so the customer isn't told the WHOLE order changed). Non-fatal.
const sendOrderItemStatusEmail = async (orderItemId, newStatus, requestBody = {}) => {
    try {
        const item = await OrderItem.findById(orderItemId).lean();
        if (!item) return;
        const order = await Order.findOne({ items: orderItemId }).populate("user", "firstName lastName email");
        if (!order) return;
        const emailTo = order.shippingAddress?.email || order.user?.email;
        if (!emailTo) return;
        const name = order.shippingAddress?.firstName
            ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName || ""}`.trim()
            : `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.trim();
        const o = { ...order.toObject(), customerName: name };
        const oid = order.orderId || order._id.toString().substring(0, 8).toUpperCase();
        const itemName = item.productDetails?.productTitle || item.productDetails?.itemCode || "your item";
        const reason = requestBody?.reason || requestBody?.rejectReason || "";
        const S = Constant.ORDER_STATUS;

        let headline = "", message = "", note = "", subject = "", senderFrom = MAIL.senders.order;
        let html;
        if (newStatus === S.SHIPPED) {
            const tracking = requestBody?.trackingId || requestBody?.trackingcode || order.trackingNumber || "";
            const courier = requestBody?.courier || order.shippingCarrier || "";
            headline = "An Item Has Shipped";
            message = `Good news — <strong>${itemName}</strong> from your order <strong>${oid}</strong> has shipped${courier ? ` via ${courier}` : ""}${tracking ? ` (Tracking No. ${tracking})` : ""}.`;
            subject = `An item in your Aura Jewels order has shipped - #${oid}`;
        } else if (newStatus === S.DELIVERED) {
            headline = "An Item Was Delivered";
            message = `<strong>${itemName}</strong> from your order <strong>${oid}</strong> has been delivered. We hope you love it.`;
            subject = `An item in your Aura Jewels order was delivered - #${oid}`;
        } else if (newStatus === S.CANCELLED || newStatus === S.CANCELLED_APPROVED) {
            headline = "An Item Was Cancelled";
            message = `The following item from your order <strong>${oid}</strong> has been cancelled: <strong>${itemName}</strong>.`;
            note = `${reason ? `Reason: ${reason}. ` : ""}Any eligible refund for this item will be processed to your original payment method.`;
            subject = `An item in your Aura Jewels order was cancelled - #${oid}`;
            senderFrom = MAIL.senders.returns;
        } else if (newStatus === S.CANCELLED_REJECTED) {
            html = cancelItemRequestRejectedEmail(o, itemName);
            subject = `Cancellation update for an item in your Aura Jewels order - #${oid}`;
            senderFrom = MAIL.senders.returns;
        } else if (newStatus === S.REJECTED) {
            headline = "An Item Could Not Be Accepted";
            message = `We're sorry — the following item from your order <strong>${oid}</strong> could not be accepted: <strong>${itemName}</strong>.`;
            note = `${reason ? `Reason: ${reason}. ` : ""}Any amount paid for this item will be refunded. Questions? Email ${MAIL.supportEmail}.`;
            subject = `Update on an item in your Aura Jewels order - #${oid}`;
            senderFrom = MAIL.senders.returns;
        } else if (newStatus === S.RETURNED_APPROVED) {
            headline = "Return Approved";
            message = `Your return request for <strong>${itemName}</strong> (order <strong>${oid}</strong>) has been approved.`;
            note = `Any eligible refund will be processed to your original payment method.`;
            subject = `Return approved for an item in your Aura Jewels order - #${oid}`;
            senderFrom = MAIL.senders.returns;
        } else if (newStatus === S.RETURNED_REJECTED) {
            headline = "Return Request Declined";
            message = `Your return request for <strong>${itemName}</strong> (order <strong>${oid}</strong>) could not be approved.`;
            note = `Reason: ${reason || "Product did not meet return guidelines."}. Questions? Email ${MAIL.supportEmail}.`;
            subject = `Return update for an item in your Aura Jewels order - #${oid}`;
            senderFrom = MAIL.senders.returns;
        } else if (newStatus === S.REFUNDED) {
            headline = "Refund Completed";
            message = `Your refund for <strong>${itemName}</strong> (order <strong>${oid}</strong>) has been completed.`;
            subject = `Refund completed for an item in your Aura Jewels order - #${oid}`;
            senderFrom = MAIL.senders.returns;
        } else if (newStatus === S.APPROVED || newStatus === S.CONFIRMED) {
            headline = "An Item Is Confirmed";
            message = `<strong>${itemName}</strong> from your order <strong>${oid}</strong> is confirmed and being prepared with care.`;
            subject = `An item in your Aura Jewels order is confirmed - #${oid}`;
        } else {
            return; // Pending / Received / In-Production etc. — no per-item notification
        }

        if (!html) {
            html = orderItemStatusEmail(o, itemName, { headline, message, note });
        }
        await sendEmail(emailTo, subject, html, { from: senderFrom });
    } catch (err) {
        console.error("sendOrderItemStatusEmail error:", err);
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const resolvedStatus = resolveOrderStatus(req.body.status);

        if (!Constant.ORDER_STATUS.ALL_TYPES.includes(resolvedStatus)) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.ORDER.STATUS_INVALID
            });
        }

        const currentOrder = await Order.findOne({ _id: id, isDelete: false });
        if (!currentOrder) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.ORDER.NOT_FOUND
            });
        }

        if (SWITCH_ENFORCE_ORDER_STATE_SEQUENCE && currentOrder.status !== resolvedStatus) {
            const allowed = ALLOWED_TRANSITIONS[currentOrder.status] || [];
            if (!allowed.includes(resolvedStatus)) {
                return res.status(STATUS_CODE.BAD_REQUEST).json({
                    errorCode: STATUS_CODE.BAD_REQUEST,
                    message: `Cannot transition status from ${currentOrder.status} to ${resolvedStatus}.`
                });
            }
        }

        const SWITCH_RESTRICT_CANCEL_REJECT_STATES = Constant.SWITCHES.SWITCH_RESTRICT_CANCEL_REJECT_STATES ?? true;
        const ALLOWED_CANCEL_STATES = Constant.SWITCHES.ALLOWED_CANCEL_STATES || ["Pending", "Approved", "In Production"];
        const ALLOWED_REJECT_STATES = Constant.SWITCHES.ALLOWED_REJECT_STATES || ["Pending", "Approved", "In Production"];

        if (SWITCH_RESTRICT_CANCEL_REJECT_STATES) {
            if (resolvedStatus === Constant.ORDER_STATUS.CANCELLED && !ALLOWED_CANCEL_STATES.includes(currentOrder.status)) {
                return res.status(STATUS_CODE.BAD_REQUEST).json({
                    errorCode: STATUS_CODE.BAD_REQUEST,
                    message: `Order cancellation is not allowed when order status is ${currentOrder.status}.`
                });
            }
            if (resolvedStatus === Constant.ORDER_STATUS.REJECTED && !ALLOWED_REJECT_STATES.includes(currentOrder.status)) {
                return res.status(STATUS_CODE.BAD_REQUEST).json({
                    errorCode: STATUS_CODE.BAD_REQUEST,
                    message: `Order rejection is not allowed when order status is ${currentOrder.status}.`
                });
            }
        }

        const { order, oldStatus } = await update_order_status_db(id, resolvedStatus, req.user?.userId || null, req.body);

        // Coupon reversal on terminal transitions is handled centrally inside
        // update_order_status_db (and the item-level services), so every path —
        // order-level, item-level, Rejected/Failed — frees the usage slot.

        if (resolvedStatus === Constant.ORDER_STATUS.RETURNED_APPROVED || resolvedStatus === Constant.ORDER_STATUS.RETURNED_REJECTED) {
            sendReturnStatusEmail(order._id, resolvedStatus, req.body).catch((err) =>
                console.error("Send return status email failed:", err)
            );
        }

        // Customer lifecycle email. sendOrderStatusEmail maps each notable status
        // (Approved/Confirmed/In Production/Ready-to-Ship/Received/Shipped/
        // Delivered/Cancelled-Approved/Rejected/Refunded) and no-ops for the rest
        // (Pending/Failed, and the Returned states handled above), so it is safe
        // to call unconditionally on every transition.
        sendOrderStatusEmail(order._id, resolvedStatus, req.body).catch((err) =>
            console.error("Send order status email failed:", err)
        );

        if (SWITCH_LOG_ORDER_TRANSITIONS) {
            await ActivityLog.create({
                userId: req.user?.userId || null,
                action: "UPDATE_STATUS",
                module: "order",
                method: req.method,
                route: req.route?.path,
                apiUrl: req.originalUrl,
                targetId: order._id,
                message: `Order status transitioned from '${oldStatus}' to '${order.status}'`,
                userAgent: req.headers["user-agent"],
                ipAddress: req.ip,
            }).catch((err) => {
                console.error("Activity Log Error:", err.message);
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.ORDER.STATUS_UPDATED,
            data: { _id: order._id, status: order.status, paymentStatus: order.paymentStatus }
        });
    } catch (error) {
        console.error("updateOrderStatus error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const updateOrderItemStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const resolvedStatus = resolveOrderStatus(req.body.status);

        if (!Constant.ORDER_STATUS.ALL_TYPES.includes(resolvedStatus)) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.ORDER.STATUS_INVALID
            });
        }

        const orderItem = await OrderItem.findOne({ _id: id });
        if (!orderItem) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.ORDER.ITEM_NOT_FOUND
            });
        }

        const oldStatus = orderItem.status || Constant.ORDER_STATUS.RECEIVED;

        if (SWITCH_ENFORCE_ORDER_STATE_SEQUENCE && oldStatus !== resolvedStatus) {
            const allowed = ALLOWED_TRANSITIONS_ITEM[oldStatus] || [];
            if (!allowed.includes(resolvedStatus)) {
                return res.status(STATUS_CODE.BAD_REQUEST).json({
                    errorCode: STATUS_CODE.BAD_REQUEST,
                    message: `Cannot transition item status from ${oldStatus} to ${resolvedStatus}.`
                });
            }
        }

        const SWITCH_RESTRICT_CANCEL_REJECT_STATES = Constant.SWITCHES.SWITCH_RESTRICT_CANCEL_REJECT_STATES ?? true;
        const ALLOWED_CANCEL_STATES = Constant.SWITCHES.ALLOWED_CANCEL_STATES || ["Pending", "Approved"];
        const ALLOWED_REJECT_STATES = Constant.SWITCHES.ALLOWED_REJECT_STATES || ["Pending", "Approved", "In Production"];

        if (SWITCH_RESTRICT_CANCEL_REJECT_STATES) {
            if (resolvedStatus === Constant.ORDER_STATUS.CANCELLED && !ALLOWED_CANCEL_STATES.includes(oldStatus)) {
                return res.status(STATUS_CODE.BAD_REQUEST).json({
                    errorCode: STATUS_CODE.BAD_REQUEST,
                    message: `Order item cancellation is not allowed when current item status is ${oldStatus}.`
                });
            }
            // if (resolvedStatus === Constant.ORDER_STATUS.REJECTED && !ALLOWED_REJECT_STATES.includes(oldStatus)) {
            //     return res.status(STATUS_CODE.BAD_REQUEST).json({
            //         errorCode: STATUS_CODE.BAD_REQUEST,
            //         message: `Order item rejection is not allowed when current item status is ${oldStatus}.`
            //     });
            // }
        }

        const { orderItem: updatedItem } = await update_order_item_status_db(id, resolvedStatus, req.user?.userId || null, req.body);

        if (SWITCH_LOG_ORDER_TRANSITIONS) {
            await ActivityLog.create({
                userId: req.user?.userId || null,
                action: "UPDATE_STATUS",
                module: "orderItem",
                method: req.method,
                route: req.route?.path,
                apiUrl: req.originalUrl,
                targetId: updatedItem._id,
                message: `Order item transitioned from '${oldStatus}' to '${resolvedStatus}'`,
                userAgent: req.headers["user-agent"],
                ipAddress: req.ip,
            }).catch((err) => {
                console.error("Activity Log Error:", err.message);
            });
        }

        // Notify the customer about THIS specific item. If the change also rolled
        // the whole order up (all items now match), send the order-level email;
        // otherwise send an item-specific one that names only the affected line,
        // so a partial cancel/reject never implies the whole order changed.
        try {
            const parentOrder = await Order.findOne({ items: updatedItem._id });
            if (parentOrder) {
                if (resolvedStatus === Constant.ORDER_STATUS.RETURNED_APPROVED || resolvedStatus === Constant.ORDER_STATUS.RETURNED_REJECTED) {
                    sendReturnStatusEmail(parentOrder._id, resolvedStatus, req.body, [updatedItem._id]).catch((e) =>
                        console.error("Send return status email failed:", e?.message));
                } else if (parentOrder.status === resolvedStatus) {
                    sendOrderStatusEmail(parentOrder._id, resolvedStatus, req.body).catch((e) =>
                        console.error("Send order-status email failed:", e?.message));
                } else {
                    sendOrderItemStatusEmail(updatedItem._id, resolvedStatus, req.body).catch((e) =>
                        console.error("Send item-status email failed:", e?.message));
                }
            }
        } catch (e) { console.error("item-status email lookup failed:", e?.message); }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.ORDER.STATUS_UPDATED,
            data: { _id: updatedItem._id, status: updatedItem.status }
        });
    } catch (error) {
        console.error("updateOrderItemStatus error:", error);
        return res.status(STATUS_CODE.BAD_REQUEST).json({
            errorCode: STATUS_CODE.BAD_REQUEST,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const updateOrderTracking = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await update_order_tracking_db(id, req.body, req.user?.userId || null);

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Order tracking details updated successfully.",
            data: order
        });
    } catch (error) {
        console.error("updateOrderTracking error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const changeOrderItemStatus = async (req, res) => {
    try {
        const { orderId, orderdetailId, statusId, rejectReason, remark, courier, trackingcode, trackingurl } = req.body;

        if (!orderdetailId) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "orderdetailId (item ID) is required."
            });
        }

        const resolvedStatus = resolveOrderStatus(statusId);

        const orderItem = await OrderItem.findById(orderdetailId);
        if (!orderItem) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.ORDER.ITEM_NOT_FOUND
            });
        }

        const oldStatus = orderItem.status || Constant.ORDER_STATUS.RECEIVED;

        if (SWITCH_ENFORCE_ORDER_STATE_SEQUENCE && oldStatus !== resolvedStatus) {
            const allowed = ALLOWED_TRANSITIONS_ITEM[oldStatus] || [];
            if (!allowed.includes(resolvedStatus)) {
                return res.status(STATUS_CODE.BAD_REQUEST).json({
                    errorCode: STATUS_CODE.BAD_REQUEST,
                    message: `Cannot transition item status from ${oldStatus} to ${resolvedStatus}.`
                });
            }
        }

        const { orderItem: updatedItem } = await change_order_item_status_db({
            orderId,
            orderdetailId,
            resolvedStatus,
            refundDetailsBody: req.body,
            courier,
            trackingcode,
            trackingurl,
            userId: req.user?.userId || null
        });

        if (SWITCH_LOG_ORDER_TRANSITIONS) {
            await ActivityLog.create({
                userId: req.user?.userId || null,
                action: "UPDATE_STATUS",
                module: "orderItem",
                method: req.method,
                route: req.route?.path,
                apiUrl: req.originalUrl,
                targetId: updatedItem._id,
                message: `Compatibility update: item transitioned from '${oldStatus}' to '${resolvedStatus}'`,
                userAgent: req.headers["user-agent"],
                ipAddress: req.ip,
            }).catch((err) => {
                console.error("Activity Log Error:", err.message);
            });
        }

        // Notify the customer. Whole-order rollup → order-level email; otherwise
        // an item-specific email that names only the affected line.
        try {
            const emailBody = { ...req.body, reason: rejectReason, courier, trackingId: trackingcode, trackingcode };
            const parentOrder = await Order.findOne({ items: updatedItem._id });
            if (parentOrder) {
                if (resolvedStatus === Constant.ORDER_STATUS.RETURNED_APPROVED || resolvedStatus === Constant.ORDER_STATUS.RETURNED_REJECTED) {
                    sendReturnStatusEmail(parentOrder._id, resolvedStatus, emailBody, [updatedItem._id]).catch((e) =>
                        console.error("Send return status email failed:", e?.message));
                } else if (parentOrder.status === resolvedStatus) {
                    sendOrderStatusEmail(parentOrder._id, resolvedStatus, emailBody).catch((e) =>
                        console.error("Send order-status email failed:", e?.message));
                } else {
                    sendOrderItemStatusEmail(updatedItem._id, resolvedStatus, emailBody).catch((e) =>
                        console.error("Send item-status email failed:", e?.message));
                }
            }
        } catch (e) { console.error("item-status email lookup failed:", e?.message); }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.ORDER.ITEM_STATUS_UPDATED,
            data: { _id: updatedItem._id, status: updatedItem.status }
        });
    } catch (error) {
        console.error("changeOrderItemStatus error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const ChangeOrderPaymentStatus = async (req, res) => {
    try {
        const { orderId, paymentStatus, status_flag } = req.body;

        if (!orderId) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "orderId is required."
            });
        }

        let resolvedPaymentStatus = paymentStatus;
        if (status_flag) {
            resolvedPaymentStatus = status_flag === "success" ? "paid" : "failed";
        }

        if (!resolvedPaymentStatus) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "paymentStatus or status_flag is required."
            });
        }

        const { order, oldPaymentStatus } = await change_order_payment_status_db(orderId, resolvedPaymentStatus);

        if (SWITCH_LOG_ORDER_TRANSITIONS) {
            await ActivityLog.create({
                userId: req.user?.userId || null,
                action: "UPDATE_PAYMENT_STATUS",
                module: "order",
                method: req.method,
                route: req.route?.path,
                apiUrl: req.originalUrl,
                targetId: order._id,
                message: `Payment status updated from '${oldPaymentStatus}' to '${resolvedPaymentStatus}'`,
                userAgent: req.headers["user-agent"],
                ipAddress: req.ip,
            }).catch((err) => {
                console.error("Activity Log Error:", err.message);
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Order payment status updated successfully.",
            data: order
        });
    } catch (error) {
        console.error("ChangeOrderPaymentStatus error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const uploadOrderInvoice = async (req, res) => {
    console.log("id======>111111111111111111")
    try {
        const id = req.params.id;
        console.log("id======>", id)
        const order = await Order.findById(id);
        if (!order) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.ORDER.NOT_FOUND
            });
        }

        // Invoice upload only once the order has shipped.
        const ALLOWED_STATUSES = [
            Constant.ORDER_STATUS.SHIPPED,
            Constant.ORDER_STATUS.DELIVERED,
            Constant.ORDER_STATUS.RETURN_REQUEST,
            Constant.ORDER_STATUS.ITEM_RECEIVED,
            Constant.ORDER_STATUS.QA_DONE,
            Constant.ORDER_STATUS.RETURNED_APPROVED,
            Constant.ORDER_STATUS.RETURNED_REJECTED,
            Constant.ORDER_STATUS.REFUNDED
        ];
        if (!ALLOWED_STATUSES.includes(order.status)) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: `Invoice can only be uploaded once the order is Shipped or beyond. Current status: ${order.status}`
            });
        }

        // Accept either an uploaded file (via uploadMiddleware) or a plain
        // filename string in the body (re-use existing file without re-upload).
        let fileName = "";

        const uploadedFile = req.files?.find(f =>
            f.fieldname === "invoice" || f.mimetype === "application/pdf" || f.mimetype === "image/jpeg" || f.mimetype === "image/png" || f.mimetype === "image/jpg"
        );
        if (uploadedFile) {
            const useAWS = process.env.AWS_ACCESS_KEY_ID && process.env.DEVELOPER_MODE !== "true";
            if (useAWS) {
                // uploadFilesOnAWS already pushed to S3 and set file.filename
                fileName = uploadedFile.filename;
            } else {
                // uploadFiles (disk storage) set file.filename
                fileName = uploadedFile.filename;
            }
        } else if (req.body?.invoiceUrl) {
            // Allow passing an existing filename / URL — strip to just the name.
            fileName = stripAssetHost(req.body.invoiceUrl).split("/").pop();
        }

        if (!fileName) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "No invoice file provided. Upload a PDF with field name \"invoice\"."
            });
        }

        order.invoiceUrl = fileName;
        await order.save();

        const resolvedUrl = resolveAssetUrl(fileName, baseUrl(req), "uploads/invoices") || "";

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Invoice uploaded successfully.",
            data: {
                orderId: order._id,
                invoiceUrl: resolvedUrl
            }
        });
    } catch (error) {
        console.error("uploadOrderInvoice error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

// POST /api/admin/whatsapp-purchase
// Manually sync a WhatsApp-closed order to Meta Conversions API
export const whatsappPurchase = async (req, res) => {
    try {
        const { orderId } = req.body;
        if (!orderId) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "orderId is required."
            });
        }

        // Find the order and populate items so CAPI has all the product details
        const order = await Order.findOne({ orderId, isDelete: false }).populate("items");
        if (!order) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: "Order not found."
            });
        }

        // Trigger Meta Purchase event with action_source: 'system_generated'
        const result = await sendMetaPurchaseEvent(order, "system_generated");
        if (!result.success) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: result.error || "Failed to send Meta CAPI purchase event."
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "WhatsApp purchase event sent successfully.",
            data: result.data
        });
    } catch (error) {
        console.error("whatsappPurchase error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};
