import mongoose from "mongoose";
import { supportsTransactions } from "../../utils/mongoTransaction.js";
import { get_cartlist_db, preview_cartlist_db, resolve_sku_lines } from "../../services/cart.services.js";
import {
    create_order_db,
    finalize_paid_order_db,
    get_orders_by_user_db,
    get_order_by_id_db,
    cancel_order_item_customer_db,
    request_return_item_customer_db,
    recalculate_order_totals_db
} from "../../services/order.services.js";
import Order from "../../models/order.model.js";
import OrderItem from "../../models/orderItem.model.js";
import ProductMaster from "../../models/product.model.js";
import { sendEmail } from "../../utils/sendEmail.js";
import { OrderMailContentTemplate, ReturnRequestMailTemplate } from "../../mailtemplates/order.mail.js";
import { orderCancelledEmail, orderItemStatusEmail } from "../../mailtemplates/orderStatus.mail.js";
import { shipmentDaysUpperBound } from "../../utils/shipmentDays.js";
import Constant from "../../constants/user.constant.js";
import { initiatePayment, verifyPayment } from "../../services/payment.services.js";
import { getExchangeRateFromRequest } from "../../utils/currencyConvertor.js";
import { validate_and_apply_coupon, redeem_coupon_db, reverse_coupon_usage_db } from "../../services/coupon.services.js";
import { get_wallet_balance_db, debit_wallet_db, credit_wallet_db, _round2 as round2 } from "../../services/wallet.services.js";
import { computeTax } from "../../utils/tax.js";
import WalletTransaction from "../../models/walletTransaction.model.js";
import { newOrderAdminEmail } from "../../mailtemplates/admin.mail.js";
import { MAIL } from "../../config/mail.config.js";
import { resolveAssetUrl } from "../../utils/uploadPaths.js";
import baseUrl from "../../constants/baseUrl.js";

import { STATUS_CODE } from "../../constants/statusCode.constant.js";
import { MESSAGES } from "../../constants/messages.constant.js";
import userModel from "../../models/user.model.js";
import { maskEmail, maskPhone } from "../../utils/maskData.js";

// FEATURE SWITCHES
const SWITCH_CHECK_ITEM_AVAILABILITY = true;

export const placeOrder = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { shippingAddress, billingAddress, hasBilling = false, notes = "", isGst = false, gstNo,
            companyName } = req.body;

        // SECURITY: never trust a client-supplied exchange rate / currency — the
        // charged amount is derived from it. Resolve both server-side from the
        // session's x-currency header against the DB currency config.
        const { rate: serverRate, currency: serverCurrency } = await getExchangeRateFromRequest(req);
        const displayCurrency = serverCurrency || "INR";
        const exchangeRate = serverRate && serverRate > 0 ? serverRate : 1.0;

        let cartData;
        if (userId) {
            cartData = await get_cartlist_db(userId);
        } else {
            const items = Array.isArray(req.body?.items) ? req.body.items : [];
            if (items.length === 0) {
                return res.status(STATUS_CODE.BAD_REQUEST).json({
                    errorCode: STATUS_CODE.BAD_REQUEST,
                    message: MESSAGES.CART.EMPTY_ON_CHECKOUT
                });
            }
            const { lines, removed: unresolved } = await resolve_sku_lines(items);
            if (unresolved && unresolved.length > 0) {
                return res.status(STATUS_CODE.BAD_REQUEST).json({
                    errorCode: STATUS_CODE.BAD_REQUEST,
                    message: "Some items in your cart are no longer available. Please review your cart."
                });
            }
            const previewData = await preview_cartlist_db(lines);
            cartData = {
                list: previewData.list,
                total: previewData.total,
                components: previewData.components
            };
        }

        if (!cartData || !cartData.list || cartData.list.length === 0) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.CART.EMPTY_ON_CHECKOUT
            });
        }

        // Resolve or create user if this is guest checkout
        let targetUserId = userId;
        let isGuestOrder = false;

        if (!userId) {
            isGuestOrder = true;
            const guestEmail = shippingAddress?.email?.trim();
            const guestPhoneStr = shippingAddress?.phone?.trim();

            if (!guestEmail || !guestPhoneStr) {
                return res.status(STATUS_CODE.BAD_REQUEST).json({
                    errorCode: STATUS_CODE.BAD_REQUEST,
                    message: "Email and phone number are required to place an order.",
                    data: {
                        guestCheckout: true,
                        identityStatus: "MISSING_EMAIL_PHONE"
                    }
                });
            }

            // Normalize phone: strip non-digits, extract country code + 10 digit phone
            const digitsOnly = guestPhoneStr ? guestPhoneStr.replace(/\D/g, '') : '';
            let guestPhoneNum = null;
            let phoneCountryCode = "+91"; // Default to India

            if (digitsOnly) {
                if (digitsOnly.length > 10) {
                    const ccLength = digitsOnly.length - 10;
                    phoneCountryCode = "+" + digitsOnly.slice(0, ccLength);
                    guestPhoneNum = parseInt(digitsOnly.slice(-10), 10);
                } else {
                    guestPhoneNum = parseInt(digitsOnly, 10);
                }
            }

            if (!guestPhoneNum) {
                return res.status(STATUS_CODE.BAD_REQUEST).json({
                    errorCode: STATUS_CODE.BAD_REQUEST,
                    message: "A valid phone number is required to place an order.",
                    data: {
                        guestCheckout: true,
                        identityStatus: "MISSING_EMAIL_PHONE"
                    }
                });
            }

            let existingUser = null;

            // Step 1: Match BOTH email AND phone (most specific/ideal match)
            existingUser = await userModel.findOne({
                email: { $regex: new RegExp(`^${guestEmail}$`, "i") },
                phone: guestPhoneNum,
                isDeleted: 0
            });

            // Step 2: Match EITHER email OR phone individually and resolve conflicts
            if (!existingUser) {
                const userByPhone = await userModel.findOne({ phone: guestPhoneNum, isDeleted: 0 });
                const userByEmail = await userModel.findOne({ email: { $regex: new RegExp(`^${guestEmail}$`, "i") }, isDeleted: 0 });

                if (userByPhone && userByEmail) {
                    console.log(`[Guest Checkout] Email and phone belong to different users`);
                    return res.status(STATUS_CODE.BAD_REQUEST).json({
                        errorCode: STATUS_CODE.BAD_REQUEST,
                        message: "The email address and phone number belong to different accounts.",
                        data: {
                            guestCheckout: true,
                            identityStatus: "EMAIL_PHONE_DIFFERENT_USERS",
                            emailAccount: {
                                email: userByEmail.email,
                                phone: maskPhone(userByEmail.phone)
                            },
                            phoneAccount: {
                                phone: userByPhone.phone,
                                email: maskEmail(userByPhone.email)
                            }
                        }
                    });
                } else if (userByEmail) {
                    console.log(`[Guest Checkout] Email exists but phone mismatch`);
                    return res.status(STATUS_CODE.BAD_REQUEST).json({
                        errorCode: STATUS_CODE.BAD_REQUEST,
                        message: "This email is already registered with an account, but the phone number does not match.",
                        data: {
                            guestCheckout: true,
                            identityStatus: "EMAIL_EXISTS_PHONE_MISMATCH",
                            emailAccount: {
                                email: userByEmail.email,
                                phone: maskPhone(userByEmail.phone)
                            }
                        }
                    });
                } else if (userByPhone) {
                    console.log(`[Guest Checkout] Phone exists but email mismatch`);
                    return res.status(STATUS_CODE.BAD_REQUEST).json({
                        errorCode: STATUS_CODE.BAD_REQUEST,
                        message: "This phone number is already registered with an account, but the email address does not match.",
                        data: {
                            guestCheckout: true,
                            identityStatus: "PHONE_EXISTS_EMAIL_MISMATCH",
                            phoneAccount: {
                                phone: userByPhone.phone,
                                email: maskEmail(userByPhone.email)
                            }
                        }
                    });
                }
                
                console.log(`[Guest Checkout] Creating new guest user`);
            } else {
                console.log(`[Guest Checkout] Email + phone matched same user`);
            }

            if (existingUser) {
                targetUserId = existingUser._id;
            } else {
                const firstName = shippingAddress?.firstName || "";
                const lastName = shippingAddress?.lastName || "";
                const fullName = `${firstName} ${lastName}`.trim();

                existingUser = await userModel.create({
                    name: fullName,
                    email: guestEmail,
                    phone: guestPhoneNum,
                    phoneCountryCode: phoneCountryCode,
                    isGuest: true,
                    status: Constant.STATUS.PENDING,
                    phoneVerified: false,
                    emailVerified: false,
                    addresses: [{
                        firstName,
                        lastName,
                        email: guestEmail,
                        phone: guestPhoneStr,
                        country: shippingAddress?.country || "IN",
                        state: shippingAddress?.state || "Not Provided",
                        city: shippingAddress?.city || "Not Provided",
                        pincode: shippingAddress?.zipCode || "000000",
                        address: shippingAddress?.address || "Not Provided",
                        isDefault: true
                    }]
                });
                targetUserId = existingUser._id;
            }
        }

        // Snapshot every line at order time so later price/size/image edits
        // never alter the customer's order record. Size + metalWeight come
        // from the cart aggregation's size-aware recompute.
        const orderItems = cartData.list.map(item => ({
            jewelleryId: item.jewelleryId,
            productTitle: item.productTitle,
            itemCode: item.itemCode,
            designNumber: item.designNumber,
            slug: item.slug,
            price: item.price,
            qty: item.qty || item.quantity || 1,
            totalItemPrice: item.totalItemPrice,
            size: item.size,
            sizeId: item.sizeId,
            metalWeight: item.metalWeight,
            hasSize: item.hasSize,
            categoryName: item.categoryName,
            engraving: item.engraving,
            engravingText: item.engravingText,
            images: item.images,
            metal: item.metal,
            metalType: item.metalType,
            metalStamp: item.metalStamp,
            stoneDetails: item.stoneDetails,
            offerDetails: item.offerDetails,
            originalPrice: item.originalPrice,
            // The centre-stone selection this line was priced at. Carried through
            // so the OrderItem records WHICH diamond was bought, not just its cost.
            origin: item.origin ?? null,
            color: item.color ?? null,
            clarity: item.clarity ?? null
        }));

        const ipAddress = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || req.ip || "";

        const subTotal = cartData.total; // INR, pre-discount

        // Re-validate + apply the coupon SERVER-SIDE at placement. The cart's
        // applied coupon is advisory; this is the authoritative gate (active,
        // dates, min/max, eligibility, usage limits). If it's no longer valid we
        // REJECT rather than silently charge full price.
        let couponInfo = { couponId: null, code: null, discountAmount: 0 };
        let discountAmount = 0;
        const couponCode = req.body.couponCode || req.body.coupon;
        if (couponCode) {
            try {
                // Pass the cart's making/diamond component totals so a "combined"
                // coupon can compute its per-component discount server-side.
                const c = await validate_and_apply_coupon(couponCode, targetUserId, subTotal, cartData.components);
                couponInfo = { couponId: c.couponId, code: c.code, discountAmount: c.discountAmount };
                discountAmount = c.discountAmount;
            } catch (couponErr) {
                return res.status(STATUS_CODE.BAD_REQUEST).json({
                    errorCode: STATUS_CODE.BAD_REQUEST,
                    message: `Coupon "${couponCode}" could not be applied: ${couponErr?.message || "invalid coupon"}. Please review your cart.`
                });
            }
        }

        // Allocate the order-level coupon discount across line items in
        // proportion to each line total, and snapshot it immutably on the item.
        // The last line absorbs the rounding remainder so shares sum EXACTLY to
        // the discount. Downstream (refunds + total recompute) subtract this so a
        // returned item is refunded its NET price, not the pre-coupon price.
        if (discountAmount > 0 && orderItems.length) {
            const lineTotals = orderItems.map(it => round2((Number(it.price) || 0) * (Number(it.qty) || 1)));
            const lineSum = lineTotals.reduce((a, b) => a + b, 0);
            let allocated = 0;
            orderItems.forEach((it, i) => {
                let share;
                if (i === orderItems.length - 1) {
                    share = round2(discountAmount - allocated);
                } else {
                    share = lineSum > 0 ? round2(discountAmount * (lineTotals[i] / lineSum)) : 0;
                }
                allocated = round2(allocated + share);
                it.couponDiscountShare = share;
            });
        }

        // Sales tax (GST). Prices are tax-EXCLUSIVE, so tax is ADDED on top of
        // the post-coupon net — the coupon reduces the taxable value. Taxability
        // is decided by the SHIPPING country (the legally authoritative basis),
        // not the browsing locale the cart used for its estimate.
        const { taxRate, taxAmount, taxableAmount } = computeTax({
            taxableAmount: subTotal - discountAmount,
            country: shippingAddress?.country,
        });

        // Gross payable, tax included. Everything downstream (wallet, gateway,
        // refunds) works off this. ROUNDED TO A WHOLE RUPEE so the amount the
        // gateway charges is exactly what the customer sees (the UI shows whole
        // rupees via Math.round). Line items keep their decimal precision; only
        // this final payable is rounded — avoiding "shows ₹18, charged ₹17.64".
        const baseAmount = Math.round(taxableAmount + taxAmount);

        // Store-wallet (partial payment): validate the requested amount against
        // the live balance + order total. The wallet is a PAYMENT METHOD, so it
        // is applied AFTER tax, against the gross. It is NOT debited here — the
        // wallet debit, coupon redemption and cart clear ALL happen once payment
        // is confirmed (finalize_paid_order_db), so an abandoned checkout
        // consumes nothing. Never trust the client-supplied amount.
        let walletUsed = 0;
        const walletRequested = round2(req.body.walletAmount || 0);
        if (walletRequested > 0 && !isGuestOrder && targetUserId) {
            const { balance } = await get_wallet_balance_db(targetUserId);
            walletUsed = round2(Math.min(walletRequested, baseAmount, balance));
        }

        // Whole-rupee charge (baseAmount is already integer; wallet may be
        // fractional, so round the remainder the gateway actually collects).
        const amountDue = Math.round(baseAmount - walletUsed);
        const paidAmount = displayCurrency === "INR" ? amountDue : Math.round(amountDue / exchangeRate);

    
        const fbc = req.body.fbc || req.body.userData?.fbc || req.cookies?.["_fbc"] || "";
        const fbp = req.body.fbp || req.body.userData?.fbp || req.cookies?.["_fbp"] || "";
        const userAgentVal = req.body.userAgent || req.body.userData?.userAgent || req.body.clientUserAgent || req.body.userData?.clientUserAgent || req.headers["user-agent"] || "";
        const anonId = req.body.aura_anon_id || req.body.userData?.aura_anon_id || req.cookies?.["aura_anon_id"] || "";
        const externalIdVal = req.body.externalId || req.body.userData?.externalId || req.body.external_id || req.body.userData?.external_id || anonId || targetUserId?.toString() || "";

        const orderData = {
            items: orderItems,
            shippingAddress,
            hasBilling,
            billingAddress: hasBilling ? billingAddress : null,
            gstNo: isGst ? req.body.gstNo : "",
            companyName: isGst ? req.body.companyName : "",
            subTotal,
            coupon: couponInfo,
            total: baseAmount,
            baseCurrency: "INR",
            displayCurrency,
            exchangeRate,
            // Tax snapshot — so the invoice can always be reconstructed exactly
            // as charged, even if the rate changes later.
            taxableAmount,
            taxRate,
            taxAmount,
            baseAmount,
            walletUsed,
            amountDue,
            paidAmount,
            paymentStatus: Constant.PAYMENT_STATUS.PENDING,
            _deferCartClear: true, // cart is cleared only on confirmed payment
            notes,
            creatorIp: ipAddress,
            updatorIp: ipAddress,
            isGuest: isGuestOrder,
            userAgent: userAgentVal,
            fbc: fbc,
            fbp: fbp,
            externalId: externalIdVal
        };

        let order = await create_order_db(targetUserId, orderData);

        // Payment. If the store wallet covers the whole order there's nothing to
        // charge — confirm immediately (debits wallet, redeems coupon, clears
        // cart, marks PAID). Otherwise create a gateway checkout session for the
        // amount due; side-effects then apply on verify/webhook.
        let paymentDetails;
        if (amountDue <= 0) {
            await finalize_paid_order_db(order._id, { method: "wallet" });
            paymentDetails = { paymentGateway: "wallet", paid: true, amount: 0, message: "Paid in full from store wallet" };
        } else {
            paymentDetails = await initiatePayment(order);
            if (!paymentDetails.isDummy && paymentDetails.gatewayOrderId) {
                await Order.updateOne(
                    { _id: order._id },
                    { $set: { "payment.provider": paymentDetails.paymentGateway, "payment.gatewayOrderId": paymentDetails.gatewayOrderId } }
                );
            }
        }
        // Reflect finalize/payment updates in the returned order.
        order = await Order.findById(order._id);

        // NOTE: the customer order-CONFIRMATION email is sent from
        // finalize_paid_order_db on the winning PENDING→PAID flip (covers wallet
        // -at-placement, checkout verify, webhook and reconcile — exactly once,
        // only when money is actually taken). Do NOT send it here at placement.

        // Notify the internal team of the new order (non-blocking).
        sendEmail(MAIL.adminEmail, `New Order - ${order.orderId || order._id}`, newOrderAdminEmail(order))
            .catch((err) => console.error("Admin new-order email error:", err));

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.ORDER.PLACED,
            data: {
                order,
                paymentDetails
            }
        });
    } catch (error) {
        console.error("placeOrder error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const verifyPaymentStatus = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { orderId, paymentDetails } = req.body;

        const lookup = { _id: orderId, isDelete: false };
        if (userId) {
            lookup.user = userId;
        } else {
            lookup.isGuest = true;
        }

        const order = await Order.findOne(lookup)
            .populate("items");
        if (!order) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.ORDER.NOT_FOUND
            });
        }

        // State Machine validation: if already failed or paid, prevent updates
        if (order.paymentStatus === Constant.PAYMENT_STATUS.FAILED || order.paymentStatus === Constant.PAYMENT_STATUS.PAID) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "Order payment has already been processed and cannot be updated."
            });
        }

        // Verify signature / status via the active gateway.
        // Pass the loaded order so the callback is bound to THIS order's gateway
        // order id — a signature from another order must not finalize this one.
        const verification = await verifyPayment(order, paymentDetails || {});

        const ITEM_TERMINAL_STATES = [
            Constant.ORDER_STATUS.CANCELLED, Constant.ORDER_STATUS.CANCELLED_APPROVED,
            Constant.ORDER_STATUS.REJECTED, Constant.ORDER_STATUS.REFUNDED,
            Constant.ORDER_STATUS.RETURNED_REJECTED, Constant.ORDER_STATUS.FAILED,
        ];

        if (!verification.success) {
            // The browser-side confirmation could not verify this payment. This
            // is a FAST-PATH only and is UNRELIABLE (closed tab, flaky network,
            // a stale/foreign callback) — so it must NOT mark the order FAILED.
            //
            // Marking FAILED here used to POISON the order: finalize_paid_order_db
            // only acts on a PENDING order, so once the client wrongly flipped it
            // to FAILED, the authoritative `payment.captured` webhook could no
            // longer finalize a genuinely-paid order → money debited, order stuck.
            //
            // Leave the order PENDING. The webhook is the sole authority: it will
            // finalize on payment.captured, or mark FAILED on payment.failed. If
            // the webhook never arrives, the admin "Re-check payment" action
            // reconciles it against Razorpay.
            return res.status(STATUS_CODE.OK).json({
                errorCode: STATUS_CODE.OK,
                message: "We could not confirm your payment yet. If money was debited it will be confirmed shortly; otherwise please try again.",
                data: await Order.findById(orderId),
            });
        }

        // Payment verified — optionally re-check that every item is still sellable.
        if (SWITCH_CHECK_ITEM_AVAILABILITY) {
            const populated = await Order.findById(orderId).populate("items");
            let itemsAvailable = true;
            for (const item of populated.items) {
                const product = await ProductMaster.findOne({ _id: item.productId });
                if (!product || product.isDeleted !== 0 || product.status !== Constant.PRODUCT_STATUS.AVAILABLE) {
                    itemsAvailable = false;
                    break;
                }
            }
            if (!itemsAvailable) {
                // Paid, but an item is no longer available — record payment and
                // cancel for the admin to refund. Side-effects are intentionally
                // NOT applied (no coupon burn / cart clear).
                await Order.updateOne(
                    { _id: orderId },
                    {
                        $set: {
                            paymentStatus: Constant.PAYMENT_STATUS.PAID,
                            status: Constant.ORDER_STATUS.CANCELLED,
                            "payment.gatewayPaymentId": verification.transactionId || "",
                            "payment.capturedAt": new Date(),
                        },
                    }
                );
                return res.status(STATUS_CODE.OK).json({
                    errorCode: STATUS_CODE.OK,
                    message: "Payment succeeded but some items were unavailable. Order has been cancelled and will be refunded.",
                    data: await Order.findById(orderId),
                });
            }
        }

        // Confirm: mark PAID and apply the one-time side-effects (wallet debit,
        // coupon redemption, cart clear) atomically + idempotently.
        const finalized = await finalize_paid_order_db(orderId, {
            gatewayPaymentId: verification.transactionId,
            signature: paymentDetails?.razorpay_signature || paymentDetails?.signature || "",
            method: verification.method || paymentDetails?.method || "",
        });
        const finalOrder = finalized || await Order.findById(orderId);

        // Confirmation email is sent inside finalize_paid_order_db (single source,
        // exactly once) — not here.

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Payment successful. Order is pending admin review.",
            data: finalOrder,
        });
    } catch (error) {
        console.error("verifyPaymentStatus error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

// Re-initiate payment for an existing UNPAID order (customer "retry payment").
// Creates a FRESH gateway session for the amount still due and returns the same
// paymentDetails shape as placeOrder, so the storefront can reopen the Razorpay
// modal. A FAILED order is reopened to PENDING first; a PAID order is rejected.
export const retryOrderPayment = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        const order = await Order.findOne({ _id: id, user: userId, isDelete: false });
        if (!order) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.ORDER.NOT_FOUND
            });
        }
        if (order.paymentStatus === Constant.PAYMENT_STATUS.PAID) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "This order is already paid."
            });
        }

        const amount = order.amountDue != null ? order.amountDue : order.total;
        if (!(Number(amount) > 0)) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "Nothing left to pay on this order."
            });
        }

        // Fresh gateway session for the outstanding amount.
        const paymentDetails = await initiatePayment(order, amount);

        const set = {};
        if (!paymentDetails.isDummy && paymentDetails.gatewayOrderId) {
            set["payment.provider"] = paymentDetails.paymentGateway;
            set["payment.gatewayOrderId"] = paymentDetails.gatewayOrderId;
        }
        // Reopen a previously-FAILED order so the webhook/verify PENDING-lock can act.
        if (order.paymentStatus === Constant.PAYMENT_STATUS.FAILED) {
            set.paymentStatus = Constant.PAYMENT_STATUS.PENDING;
            set.status = Constant.ORDER_STATUS.PENDING;
        }
        if (Object.keys(set).length) {
            await Order.updateOne({ _id: order._id }, { $set: set });
            if (order.paymentStatus === Constant.PAYMENT_STATUS.FAILED) {
                await OrderItem.updateMany(
                    { _id: { $in: order.items }, status: Constant.ORDER_STATUS.FAILED },
                    { $set: { status: Constant.ORDER_STATUS.PENDING } }
                );
            }
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.ORDER.PLACED,
            data: {
                order: await Order.findById(order._id),
                paymentDetails
            }
        });
    } catch (error) {
        console.error("retryOrderPayment error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

const mapStatusForCustomer = (status) => {
    const mapping = {
        "Pending": "Pending",
        "Approved": "Approved",
        "Confirmed": "Confirmed",
        "In Production": "In Production",
        "Ready to Ship": "Ready to Ship",
        "Shipped": "Shipped",
        "Delivered": "Delivered",
        "Cancelled": "Cancel Request",
        "Cancelled Approved": "Cancelled",
        "Cancelled Rejected": "Cancelled Rejected",
        "Rejected": "Rejected",
        "Return Request": "Return Requested",
        "Returned Approved": "Return Request Accepted",
        "Returned Rejected": "Return Request Rejected",
        "Item Received": "Item Returned",
        "QA Done": "Return QA Approved",
        "Refunded": "Refunded",
        "Failed": "Failed",
        "Received": "Pending"
    };
    return mapping[status] || status
    // return status;
};

export const getMyOrders = async (req, res) => {
    try {
        const userId = req.user.userId;
        const page = Number(req.body.page || req.query.page) || 1;
        const limit = Number(req.body.limit || req.query.limit) || 10;
        const status = req.body.status || req.query.status || null;
        const result = await get_orders_by_user_db(userId, page, limit, status);

        const formattedData = (result.data || []).map(orderDoc => {
            const orderObj = orderDoc.toObject ? orderDoc.toObject() : orderDoc;
            orderObj.status = mapStatusForCustomer(orderObj.status);
            if (Array.isArray(orderObj.items)) {
                orderObj.items = orderObj.items.map(item => {
                    item.status = mapStatusForCustomer(item.status);
                    return item;
                });
            }
            orderObj.refundTransactions = orderDoc.refundTransactions || [];

            const url = baseUrl(req);
            const receiptItem = (orderObj.receipts || []).find(x => x.type === Constant.RECEIPT_TYPES.RECEIPT);
            const detailItem = (orderObj.receipts || []).find(x => x.type === Constant.RECEIPT_TYPES.DETAIL_RECEIPT);
            orderObj.invoiceUrl = orderObj?.invoiceUrl ? resolveAssetUrl(orderObj?.invoiceUrl, url, "uploads/invoices") : "";
            orderObj.receiptUrl = receiptItem ? resolveAssetUrl(receiptItem.fileName, url, "uploads/receipts") : "";
            orderObj.detailReceiptUrl = detailItem ? resolveAssetUrl(detailItem.fileName, url, "uploads/receipts") : "";

            return orderObj;
        });

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.ORDER.FETCHED,
            total: result.total,
            page: result.page,
            limit: result.limit,
            data: formattedData
        });
    } catch (error) {
        console.error("getMyOrders error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const userId = req.user && req.user?.userId;
        const { id } = req.params;

        const order = await get_order_by_id_db(id, userId);
        if (!order) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.ORDER.NOT_FOUND
            });
        }

        const orderObj = order.toObject ? order.toObject() : order;
        orderObj.status = mapStatusForCustomer(orderObj.status);
        if (Array.isArray(orderObj.items)) {
            orderObj.items = orderObj.items.map(item => {
                item.status = mapStatusForCustomer(item.status);
                return item;
            });
        }
        orderObj.refundTransactions = order.refundTransactions || [];

        const url = baseUrl(req);
        const receiptItem = (orderObj.receipts || []).find(x => x.type === Constant.RECEIPT_TYPES.RECEIPT);
        const detailItem = (orderObj.receipts || []).find(x => x.type === Constant.RECEIPT_TYPES.DETAIL_RECEIPT);
        orderObj.receiptUrl = receiptItem ? resolveAssetUrl(receiptItem.fileName, url, "uploads/receipts") : "";
        orderObj.detailReceiptUrl = detailItem ? resolveAssetUrl(detailItem.fileName, url, "uploads/receipts") : "";
        orderObj.invoiceUrl = orderObj.invoiceUrl
            ? resolveAssetUrl(orderObj.invoiceUrl, url, "uploads/invoices")
            : "";

        // Per-item shipping estimate: the product's lead time (raw — the client
        // normalises "15-17"/"15 to 17" for display) plus a conservative
        // expected-delivery date = order date + the UPPER bound of the range.
        // Attached as plain fields so item.productId stays a bare id.
        try {
            const ids = (orderObj.items || []).map((i) => i.productId).filter(Boolean);
            const prods = ids.length
                ? await ProductMaster.find({ _id: { $in: ids } }, { shipmentDays: 1 }).lean()
                : [];
            const daysById = new Map(prods.map((p) => [String(p._id), p.shipmentDays]));
            const placedAt = orderObj.createdAt ? new Date(orderObj.createdAt) : new Date();
            for (const item of orderObj.items || []) {
                const raw = daysById.get(String(item.productId)) ?? null;
                item.shipmentDays = raw;
                const upper = shipmentDaysUpperBound(raw);
                if (upper > 0) {
                    const d = new Date(placedAt);
                    d.setDate(d.getDate() + upper);
                    item.expectedDeliveryDate = d;
                } else {
                    item.expectedDeliveryDate = null;
                }
            }
        } catch (e) {
            console.error("getOrderById shipmentDays attach failed:", e?.message);
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.ORDER.DETAIL_FETCHED,
            data: orderObj
        });
    } catch (error) {
        console.error("getOrderById error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

// Customer-cancel confirmation emails. Non-fatal — a mail hiccup must never
// fail the cancel itself.
const nameOf = (order) =>
    order.shippingAddress?.firstName
        ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName || ""}`.trim()
        : `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.trim();

const sendCustomerCancelEmail = async (orderId) => {
    try {
        const order = await Order.findById(orderId).populate("user", "firstName lastName email");
        if (!order) return;
        const emailTo = order.shippingAddress?.email || order.user?.email;
        if (!emailTo) return;
        const o = { ...order.toObject(), customerName: nameOf(order) };
        const oid = order.orderId || order._id.toString().substring(0, 8).toUpperCase();
        await sendEmail(emailTo, `Your Aura Jewels order was cancelled - #${oid}`, orderCancelledEmail(o), { from: MAIL.senders.returns });
    } catch (err) { console.error("sendCustomerCancelEmail error:", err); }
};

const sendCustomerItemCancelEmail = async (orderItem) => {
    try {
        const order = await Order.findOne({ items: orderItem._id }).populate("user", "firstName lastName email");
        if (!order) return;
        const emailTo = order.shippingAddress?.email || order.user?.email;
        if (!emailTo) return;
        const o = { ...order.toObject(), customerName: nameOf(order) };
        const oid = order.orderId || order._id.toString().substring(0, 8).toUpperCase();
        const itemName = orderItem.productDetails?.productTitle || orderItem.productDetails?.itemCode || "your item";
        const html = orderItemStatusEmail(o, itemName, {
            headline: "An Item Was Cancelled",
            message: `The following item from your order <strong>${oid}</strong> has been cancelled: <strong>${itemName}</strong>.`,
            note: `Any eligible refund for this item will be processed to your original payment method.`,
        });
        await sendEmail(emailTo, `An item in your Aura Jewels order was cancelled - #${oid}`, html, { from: MAIL.senders.returns });
    } catch (err) { console.error("sendCustomerItemCancelEmail error:", err); }
};

export const cancelOrderCustomer = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const order = await Order.findOne({ _id: id, user: userId, isDelete: false });
        if (!order) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.ORDER.NOT_FOUND
            });
        }
        console.log("current ", Date.now())
        console.log("order date ", order.createdAt)

        const maxCancelDays = Constant.MAX_CANCELLATION_DAYS || 1;
        const elapsedDays = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        if (elapsedDays > maxCancelDays) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: `Order cannot be cancelled after ${maxCancelDays} days.`
            });
        }

        const ALLOWED_CANCEL_STATES = Constant.SWITCHES.ALLOWED_CANCEL_STATES || ["Pending", "Approved", "In Production"];
        if (!ALLOWED_CANCEL_STATES.includes(order.status)) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: `Order cannot be cancelled in its current state (${order.status}).`
            });
        }

        const hasPayment = order.paymentStatus !== "pending" && order.paymentStatus !== "failed";
        const chargePercent = hasPayment ? Constant.getCancellationChargePercentage(order.createdAt) : 0;

        const items = await OrderItem.find({ _id: { $in: order.items } });
        let totalRefundAmount = 0;
        for (const item of items) {
            if (!ALLOWED_CANCEL_STATES.includes(item.status)) continue;
            const qty = Number(item.productDetails?.qty) || Number(item.qty) || 1;
            const itemLineValue = (Number(item.price) || 0) * qty - (Number(item.couponDiscountShare) || 0);
            const taxRate = Number(order.taxRate) || 0;
            const itemOriginalPayable = itemLineValue * (1 + taxRate);
            const itemChargeAmount = hasPayment ? round2(itemOriginalPayable * (chargePercent / 100)) : 0;
            const itemRefundAmount = hasPayment ? round2(Math.max(0, itemOriginalPayable - itemChargeAmount)) : 0;
            totalRefundAmount += itemRefundAmount;
        }
        const refundAmount = hasPayment ? round2(totalRefundAmount) : 0;

        console.log("before order status ", order.status)
        order.status = Constant.ORDER_STATUS.CANCELLED;
        order.cancelledAt = new Date();

        order.refundDetails = {
            refundType: hasPayment ? (req.body.refundType) : "none",
            amount: refundAmount,
            walletCredited: false,
            gatewayRefundId: "",
            accountHolderName: hasPayment ? (req.body.accountHolderName || "") : "",
            bankName: hasPayment ? (req.body.bankName || "") : "",
            accountNumber: hasPayment ? (req.body.accountNumber || "") : "",
            ifscCode: hasPayment ? (req.body.ifscCode || "") : "",
            refundRemarks: req.body.reason || "Customer requested cancellation",
            refundedAt: null
        };
        await order.save();

        // Also update all order items status to Cancelled
        // await OrderItem.updateMany(
        //     { _id: { $in: order.items } },
        //     {
        //         status: Constant.ORDER_STATUS.CANCELLED,
        //         cancelledAt: new Date()
        //     }
        // );
        // Also update all order items status to Cancelled and compute item-level refund details
        for (const item of items) {
            console.log("odrer item id ", item._id, " status ", item.status, " cancelable status ", ALLOWED_CANCEL_STATES.includes(item.status))
            if (!ALLOWED_CANCEL_STATES.includes(item.status)) continue;
            const qty = Number(item.productDetails?.qty) || Number(item.qty) || 1;
            const itemLineValue = (Number(item.price) || 0) * qty - (Number(item.couponDiscountShare) || 0);
            const taxRate = Number(order.taxRate) || 0;
            const itemOriginalPayable = itemLineValue * (1 + taxRate);
            const itemChargeAmount = hasPayment ? round2(itemOriginalPayable * (chargePercent / 100)) : 0;
            const itemRefundAmount = hasPayment ? round2(Math.max(0, itemOriginalPayable - itemChargeAmount)) : 0;

            item.status = Constant.ORDER_STATUS.CANCELLED;
            item.cancelledAt = new Date();
            item.refundDetails = {
                refundType: hasPayment ? (req.body.refundType || "none") : "none",
                amount: itemRefundAmount,
                walletCredited: false,
                gatewayRefundId: "",
                accountHolderName: hasPayment ? (req.body.accountHolderName || "") : "",
                bankName: hasPayment ? (req.body.bankName || "") : "",
                accountNumber: hasPayment ? (req.body.accountNumber || "") : "",
                ifscCode: hasPayment ? (req.body.ifscCode || "") : "",
                refundRemarks: req.body.reason || "Customer requested cancellation",
                refundedAt: null,

                // Cancellation specific details
                requestedAt: new Date(),
                requestedBy: userId,
                cancellationReason: req.body.reason || "Customer requested cancellation",
                chargePercentage: hasPayment ? chargePercent : 0,
                chargeAmount: itemChargeAmount,
                refundStatus: hasPayment ? Constant.PAYMENT_STATUS.REFUND_PENDING : Constant.PAYMENT_STATUS.REFUND_SUCCESS
            };
            await item.save();
        }

        await recalculate_order_totals_db(order._id);
        const updatedOrder = await Order.findById(order._id);

        sendCustomerCancelEmail(order._id).catch((err) =>
            console.error("Customer cancel email error:", err));

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Order successfully cancelled.",
            data: updatedOrder
        });
    } catch (error) {
        console.error("cancelOrderCustomer error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

const sendReturnRequestEmail = async (orderId, reason, returnedItemIds = null) => {
    try {
        const populatedOrder = await Order.findById(orderId)
            .populate("user", "firstName lastName email")
            .populate({ path: "items", populate: [{ path: "sizeId" }, { path: "productId" }] });
        if (!populatedOrder) return;
        const emailTo = populatedOrder.shippingAddress?.email || populatedOrder.user?.email;
        if (!emailTo) return;
        const mailHtml = ReturnRequestMailTemplate(populatedOrder, reason, returnedItemIds);
        await sendEmail(
            emailTo,
            `Aura Jewels Return Request - #${populatedOrder.orderId || populatedOrder._id.toString().substring(0, 8).toUpperCase()}`,
            mailHtml
        );
    } catch (err) {
        console.error("sendReturnRequestEmail error:", err);
    }
};

export const requestReturnCustomer = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const { reason } = req.body;

        const order = await Order.findOne({ _id: id, user: userId, isDelete: false });
        if (!order) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.ORDER.NOT_FOUND
            });
        }

        const maxReturnDays = Constant.MAX_RETURN_DAYS || 7;
        const deliveryDate = order.deliveredAt || order.createdAt;
        const elapsedDays = (Date.now() - new Date(deliveryDate).getTime()) / (1000 * 60 * 60 * 24);
        console.log("maxReturnDays", maxReturnDays);
        console.log("elapsedDays", elapsedDays);
        if (elapsedDays > maxReturnDays) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: `Order cannot be returned after ${maxReturnDays} days from delivery.`
            });
        }

        if (order.status !== Constant.ORDER_STATUS.DELIVERED) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "Only delivered orders can be returned."
            });
        }
        //      order.status = Constant.ORDER_STATUS.RETURN_REQUEST;
        //         await order.save();

        //         // Also update order items status and set return reason
        //         await OrderItem.updateMany(
        //             { _id: { $in: order.items } },
        //             {
        //                 status: Constant.ORDER_STATUS.RETURN_REQUEST,
        //                 "productDetails.reason": reason || "N/A"
        //             }
        //         );
        const hasPayment = order.paymentStatus === Constant.PAYMENT_STATUS.PAID;
        const chargePercent = hasPayment ? Constant.getReturnChargePercentage(deliveryDate) : 0;

        const details = req.body.refundDetails || req.body || {};
        const bank = details.bankDetails || details || {};
        const parsedAccountHolderName = bank.accountHolderName || bank.accountholdername || details.accountHolderName || "";
        const parsedBankName = bank.bankName || bank.bankname || details.bankName || "";
        const parsedAccountNumber = bank.accountNumber || bank.accountnumber || details.accountNumber || "";
        const parsedIfscCode = bank.ifscCode || bank.ifsccode || details.ifscCode || "";
        const parsedRefundType = details.refundType || details.refundMethod || "none";

        const items = await OrderItem.find({ _id: { $in: order.items } });
        let totalRefundAmount = 0;

        for (const item of items) {
            const isDeliveredItem = item.status?.toLowerCase() === Constant.ORDER_STATUS.DELIVERED.toLowerCase();
            if (!isDeliveredItem) continue;

            const qty = Number(item.productDetails?.qty) || Number(item.qty) || 1;
            const itemLineValue = (Number(item.price) || 0) * qty - (Number(item.couponDiscountShare) || 0);
            const taxRate = Number(order.taxRate) || 0;
            const itemOriginalPayable = itemLineValue * (1 + taxRate);
            const itemChargeAmount = hasPayment ? round2(itemOriginalPayable * (chargePercent / 100)) : 0;
            const itemRefundAmount = hasPayment ? round2(Math.max(0, itemOriginalPayable - itemChargeAmount)) : 0;

            totalRefundAmount += itemRefundAmount;

            item.status = Constant.ORDER_STATUS.RETURN_REQUEST;
            item.refundDetails = {
                refundType: hasPayment ? parsedRefundType : "none",
                amount: itemRefundAmount,
                walletCredited: false,
                gatewayRefundId: "",
                accountHolderName: hasPayment ? parsedAccountHolderName : "",
                bankName: hasPayment ? parsedBankName : "",
                accountNumber: hasPayment ? parsedAccountNumber : "",
                ifscCode: hasPayment ? parsedIfscCode : "",
                refundRemarks: reason || details.reason || "Customer requested order return",
                refundedAt: null,

                // Return specific details
                requestedAt: new Date(),
                requestedBy: userId,
                cancellationReason: reason || details.reason || "Customer requested order return",
                chargePercentage: hasPayment ? chargePercent : 0,
                chargeAmount: itemChargeAmount,
                refundStatus: hasPayment ? Constant.REFUND_STATUS.PENDING : Constant.REFUND_STATUS.SUCCESS
            };
            item.productDetails = item.productDetails || {};
            item.productDetails.reason = reason || "N/A";
            item.markModified("productDetails");
            await item.save();
        }

        order.status = Constant.ORDER_STATUS.RETURN_REQUEST;
        order.refundDetails = {
            refundType: hasPayment ? parsedRefundType : "none",
            amount: round2(totalRefundAmount),
            walletCredited: false,
            gatewayRefundId: "",
            accountHolderName: hasPayment ? parsedAccountHolderName : "",
            bankName: hasPayment ? parsedBankName : "",
            accountNumber: hasPayment ? parsedAccountNumber : "",
            ifscCode: hasPayment ? parsedIfscCode : "",
            refundRemarks: reason || details.reason || "Customer requested order return",
            refundedAt: null
        };
        await order.save();

        await recalculate_order_totals_db(order._id);
        const updatedOrder = await Order.findById(order._id);

        const returnedItemIds = items.filter(item => item.status === Constant.ORDER_STATUS.RETURN_REQUEST).map(item => item._id);
        sendReturnRequestEmail(order._id, reason || "N/A", returnedItemIds).catch((err) =>
            console.error("Return request email error:", err)
        );

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Return request submitted successfully.",
            data: updatedOrder
        });
    } catch (error) {
        console.error("requestReturnCustomer error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const cancelOrderItemCustomer = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id: itemId } = req.params;
        // const orderItem = await cancel_order_item_customer_db(itemId, userId);
        const orderItem = await cancel_order_item_customer_db(itemId, userId, req.body);

        sendCustomerItemCancelEmail(orderItem).catch((err) =>
            console.error("Customer item-cancel email error:", err));

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Order item successfully cancelled.",
            data: orderItem
        });
    } catch (error) {
        console.error("cancelOrderItemCustomer error:", error);
        return res.status(STATUS_CODE.BAD_REQUEST).json({
            errorCode: STATUS_CODE.BAD_REQUEST,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const requestReturnItemCustomer = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id: itemId } = req.params;
        const { reason } = req.body;

        const { orderItem, order } = await request_return_item_customer_db(itemId, userId, reason, req.body);

        sendReturnRequestEmail(order._id, `Item ${orderItem.productDetails?.productTitle || orderItem._id}: ${reason || "N/A"}`, [itemId]).catch((err) =>
            console.error("Return request email error:", err)
        );

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Return request for the item submitted successfully.",
            data: orderItem
        });
    } catch (error) {
        console.error("requestReturnItemCustomer error:", error);
        return res.status(STATUS_CODE.BAD_REQUEST).json({
            errorCode: STATUS_CODE.BAD_REQUEST,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const deleteOrderCustomer = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        const order = await Order.findOne({ _id: id, user: userId, isDelete: false });
        if (!order) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.ORDER.NOT_FOUND
            });
        }

        await Order.updateOne({ _id: id }, { isDelete: true });

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Order deleted successfully.",
            data: order
        });
    } catch (error) {
        console.error("deleteOrderCustomer error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};