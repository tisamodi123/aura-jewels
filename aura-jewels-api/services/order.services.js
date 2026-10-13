import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import OrderItem from "../models/orderItem.model.js";
import RefundTransaction from "../models/refundTransaction.model.js";
import { supportsTransactions } from "../utils/mongoTransaction.js";
import Constant from "../constants/user.constant.js";
import { credit_wallet_db, debit_wallet_db, _round2 as round2 } from "./wallet.services.js";
import { redeem_coupon_db, coupon_redeemable_at_finalize_db, release_coupon_if_order_terminal } from "./coupon.services.js";
import { refundPayment, fetchGatewayOrderPayments, fetchGatewayPaymentLink } from "./payment.services.js";
import { normalizeSelection } from "../utils/lineIdentity.js";
import { sendOrderConfirmationEmail } from "../utils/orderMailer.js";
import { shipmentDaysUpperBound } from "../utils/shipmentDays.js";
import { generateOrderReceipt, generateOrderDetailReceipt } from "../utils/generateReciept.js";
import { uploadBufferToS3 } from "../utils/multer.js";
import path from "path";
import fs from "fs";
import { sendMetaPurchaseEvent } from "./metaConversion.services.js";

// Feature Switches
export const SWITCH_AUTO_CALCULATE_ESTIMATED_DELIVERY = Constant.SWITCHES.SWITCH_AUTO_CALCULATE_ESTIMATED_DELIVERY;
export const SWITCH_SAVE_REFUND_DETAILS = Constant.SWITCHES.SWITCH_SAVE_REFUND_DETAILS;
export const SWITCH_ENFORCE_ORDER_STATE_SEQUENCE = Constant.SWITCHES.SWITCH_ENFORCE_ORDER_STATE_SEQUENCE;

// Statuses for which an admin-supplied refund (wallet / bank / gateway) is
// actually processed. The admin's Reject/Cancel modal collects refund details on
// ANY of these — previously the refund only ran on "Refunded", so rejecting or
// cancelling a paid order recorded nothing and never issued the gateway/wallet
// refund. All refund actions remain idempotent (walletCredited / gatewayRefundId
// guards), so re-saving a status never double-refunds.
const REFUND_TRIGGER_STATES = [
    Constant.ORDER_STATUS.REFUNDED,
    Constant.ORDER_STATUS.REJECTED,
    Constant.ORDER_STATUS.CANCELLED,
    Constant.ORDER_STATUS.CANCELLED_APPROVED,
    Constant.ORDER_STATUS.RETURNED_APPROVED,
];

// Forward-fulfilment statuses never change what the customer owes, so the order
// total must NOT be recomputed on these — the placed total stays immutable.
// Totals are only ever recomputed when an item leaves/re-enters the billable set
// (cancellation, return, rejection, refund) via `statusAffectsBilling`.
const FULFILMENT_ONLY_STATUSES = [
    Constant.ORDER_STATUS.PENDING,
    Constant.ORDER_STATUS.APPROVED,
    Constant.ORDER_STATUS.RECEIVED,
    Constant.ORDER_STATUS.CONFIRMED,
    Constant.ORDER_STATUS.IN_PRODUCTION,
    Constant.ORDER_STATUS.READY_TO_SHIP,
    Constant.ORDER_STATUS.SHIPPED,
    Constant.ORDER_STATUS.DELIVERED,
];
const statusAffectsBilling = (status) => !!status && !FULFILMENT_ONLY_STATUSES.includes(status);

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

// Creates the Order + N OrderItem docs in one transaction so a mid-flight
// failure doesn't leak orphan OrderItem rows. Also soft-deletes the user's
// cart inside the same transaction so a successful order can't coexist
// with a non-empty cart (which would let the user double-checkout).
//
// Falls back to non-transactional sequential writes on standalone MongoDB
// (where startTransaction throws). On standalone there's a small window
// where a crash between OrderItem.create and Order.create would leak rows;
// acceptable trade-off vs. requiring a replica set.
export const create_order_db = async (userId, orderData) => {
    const useTxn = await supportsTransactions(mongoose);

    if (useTxn) {
        const session = await mongoose.startSession();
        try {
            let createdOrder = null;
            await session.withTransaction(async () => {
                createdOrder = await runCreate(userId, orderData, session);
            });
            return createdOrder;
        } finally {
            await session.endSession();
        }
    }
    return runCreate(userId, orderData, null);
};

export const generateAndSaveOrderReceipts = async (orderId) => {
    const populatedOrder = await Order.findById(orderId)
        .populate("user", "firstName lastName email phone")
        .populate({ path: "items", populate: { path: "sizeId" } });
    if (!populatedOrder) return null;

    const receiptFilename = `receipt-${populatedOrder.orderId || populatedOrder._id.toString()}.pdf`;
    const detailFilename = `detail-${populatedOrder.orderId || populatedOrder._id.toString()}.pdf`;
    const receiptDir = path.join(process.cwd(), 'uploads', 'receipts');
    if (!fs.existsSync(receiptDir)) {
        fs.mkdirSync(receiptDir, { recursive: true });
    }
    const receiptPath = path.join(receiptDir, receiptFilename);
    const detailPath = path.join(receiptDir, detailFilename);

    let receiptGenerated = false;
    let detailGenerated = false;

    try {
        await generateOrderReceipt(populatedOrder, receiptPath);
        receiptGenerated = true;
    } catch (err) {
        console.error("Failed to generate order receipt PDF:", err);
    }

    try {
        await generateOrderDetailReceipt(populatedOrder, detailPath);
        detailGenerated = true;
    } catch (err) {
        console.error("Failed to generate order detail receipt PDF:", err);
    }

    const useAWS = process.env.AWS_ACCESS_KEY_ID && process.env.DEVELOPER_MODE !== "true";

    try {
        if (useAWS) {
            if (receiptGenerated && fs.existsSync(receiptPath)) {
                const buffer = fs.readFileSync(receiptPath);
                await uploadBufferToS3({
                    buffer,
                    fileName: receiptFilename,
                    contentType: "application/pdf",
                    folder: "website-assets/receipts"
                });
            }
            if (detailGenerated && fs.existsSync(detailPath)) {
                const buffer = fs.readFileSync(detailPath);
                await uploadBufferToS3({
                    buffer,
                    fileName: detailFilename,
                    contentType: "application/pdf",
                    folder: "website-assets/receipts"
                });
            }
        }

        const receiptsArray = [];
        if (receiptGenerated) {
            receiptsArray.push({
                type: Constant.RECEIPT_TYPES.RECEIPT,
                fileName: receiptFilename
            });
        }
        if (detailGenerated) {
            receiptsArray.push({
                type: Constant.RECEIPT_TYPES.DETAIL_RECEIPT,
                fileName: detailFilename
            });
        }

        populatedOrder.receipts = receiptsArray;
        await populatedOrder.save();
    } catch (uploadErr) {
        console.error("Failed to upload receipts to S3/save to DB:", uploadErr);
    }

    return {
        receipts: populatedOrder.receipts
    };
};

// Apply the one-time side-effects of a successful payment: mark the order PAID,
// debit the reserved store-wallet amount, redeem the coupon, and clear the cart.
// Atomically flips paymentStatus PENDING→PAID as a lock, so concurrent callers
// (checkout verify + webhook) can't double-apply. Returns the order on the
// winning call, null if it was already finalized (idempotent no-op).
export const finalize_paid_order_db = async (orderId, { gatewayPaymentId = "", signature = "", method = "" } = {}) => {
    const order = await Order.findOneAndUpdate(
        { _id: orderId, paymentStatus: Constant.PAYMENT_STATUS.PENDING, isDelete: false },
        {
            $set: {
                paymentStatus: Constant.PAYMENT_STATUS.PAID,
                "payment.gatewayPaymentId": gatewayPaymentId,
                "payment.signature": signature,
                "payment.method": method,
                "payment.capturedAt": new Date(),
            },
        },
        { new: true }
    );
    if (!order) return null; // already finalized / not found — nothing to do

    // Each side-effect is best-effort and independently logged: the payment has
    // already succeeded, so a hiccup here must never throw the customer back an
    // error. But a benefit that can no longer be honoured (wallet already spent,
    // coupon limit reached between placement and payment) must NOT be silently
    // absorbed as a loss — it is recorded on `settlementReview` for the admin to
    // reconcile (e.g. collect the wallet shortfall or void the discount).
    const review = { needed: false, walletSettled: true, couponHonored: true, reasons: [] };

    if (Number(order.walletUsed) > 0) {
        try {
            // Atomic debit: refuses to drive the balance negative, so a wallet
            // already spent by another order throws here rather than double-spending.
            await debit_wallet_db({
                userId: order.user,
                amount: order.walletUsed,
                source: "order",
                orderId: order._id,
                note: `Applied to order ${order.orderId || order._id}`,
            });
        } catch (e) {
            console.error(`wallet settle failed for paid order ${order._id}:`, e?.message);
            review.needed = true;
            review.walletSettled = false;
            review.reasons.push(`wallet ${order.walletUsed} not settled: ${e?.message}`);
        }
    }

    if (order.coupon?.couponId) {
        // Re-check the usage caps at confirmation; only redeem if still valid so
        // a single-use coupon can't be honoured across many concurrent orders.
        const check = await coupon_redeemable_at_finalize_db({
            couponId: order.coupon.couponId,
            userId: order.user,
            // excludeOrderId: order._id,
        }).catch((e) => ({ ok: false, reason: e?.message || "re-check failed" }));

        if (!check.ok) {
            console.error(`coupon not honoured for paid order ${order._id}: ${check.reason}`);
            review.needed = true;
            review.couponHonored = false;
            review.reasons.push(`coupon ${order.coupon.code || ""} not honoured: ${check.reason}`);
        } else {
            try {
                await redeem_coupon_db({
                    couponId: order.coupon.couponId,
                    userId: order.user,
                    orderId: order._id,
                    code: order.coupon.code,
                    discountAmount: order.coupon.discountAmount,
                });
            } catch (e) {
                console.error(`coupon redeem failed for paid order ${order._id}:`, e?.message);
                review.needed = true;
                review.couponHonored = false;
                review.reasons.push(`coupon ${order.coupon.code || ""} redeem error: ${e?.message}`);
            }
        }
    }

    if (review.needed) {
        try {
            await Order.updateOne(
                { _id: order._id },
                {
                    $set: {
                        "settlementReview.needed": true,
                        "settlementReview.walletSettled": review.walletSettled,
                        "settlementReview.couponHonored": review.couponHonored,
                        "settlementReview.reason": review.reasons.join("; "),
                    },
                }
            );
        } catch (e) {
            console.error(`could not flag settlementReview for order ${order._id}:`, e?.message);
        }
    }
    try {
        if (order.user && !order.isGuest) {
            await Cart.updateMany({ userId: order.user, isDeleted: 0 }, { isDeleted: 1 });
        }
    } catch (e) {
        console.error(`cart clear failed for paid order ${order._id}:`, e?.message);
    }

    // Generate and upload/save receipts to S3 / DB
    try {
        await generateAndSaveOrderReceipts(order._id);
    } catch (e) {
        console.error(`Failed to generate/upload receipts for order ${order._id}:`, e?.message);
    }

    // Confirmation email — sent here, on the single winning PENDING→PAID flip, so
    // it fires exactly once regardless of which path confirmed payment (checkout
    // verify, webhook, wallet-at-placement, or admin reconcile). Fire-and-forget.
    sendOrderConfirmationEmail(order._id).catch((e) =>
        console.error(`order confirmation email failed for ${order._id}:`, e?.message)
    );

    // Send Meta Conversions API Purchase Event (fire-and-forget in background)
    sendMetaPurchaseEvent(order).catch((e) =>
        console.error(`[Meta CAPI] Purchase event trigger failed for ${order.orderId || order._id}:`, e?.message)
    );

    return order;
};

// Reconcile a stuck order against the gateway (admin "Re-check payment"). Asks
// Razorpay for the real status and resolves the order accordingly:
//   - a captured payment (checkout order OR payment link) → finalize (idempotent),
//     recovering a wrongly-FAILED order back to PAID first
//   - a payment still in flight (authorized/created/link unpaid) → leave PENDING
//   - genuinely no payment (nothing captured, nothing pending) → mark FAILED
// Never touches an order that is already PAID or in a fulfilment/terminal state.
export const reconcile_order_payment_db = async (orderId) => {
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");
    if (order.paymentStatus === Constant.PAYMENT_STATUS.PAID) {
        return { status: "already_paid", order };
    }

    const gatewayOrderId = order.payment?.gatewayOrderId || "";
    const paymentLinkId = order.payment?.paymentLinkId || "";
    if (!gatewayOrderId && !paymentLinkId) {
        return { status: "no_gateway_reference", order };
    }

    let captured = null;
    let anyPending = false;

    // 1) Direct checkout order — inspect its payment attempts.
    if (gatewayOrderId) {
        const payments = await fetchGatewayOrderPayments(gatewayOrderId);
        captured = payments.find(p => p.status === "captured") || null;
        anyPending = payments.some(p => p.status === "authorized" || p.status === "created");
    }

    // 2) Payment-link order — inspect the link.
    if (!captured && paymentLinkId) {
        const link = await fetchGatewayPaymentLink(paymentLinkId);
        if (link?.status === "paid" && link.paymentId) {
            captured = { id: link.paymentId, method: link.method, status: "captured" };
        } else if (link && (link.status === "created" || link.status === "partially_paid")) {
            anyPending = true;
        }
    }

    if (captured) {
        // Money was taken. If the order was previously (wrongly) marked FAILED,
        // reopen it to PENDING so finalize's PENDING-lock can act, then finalize.
        if (order.paymentStatus === Constant.PAYMENT_STATUS.FAILED) {
            await Order.updateOne(
                { _id: order._id, paymentStatus: Constant.PAYMENT_STATUS.FAILED },
                { $set: { paymentStatus: Constant.PAYMENT_STATUS.PENDING, status: Constant.ORDER_STATUS.PENDING } }
            );
            await OrderItem.updateMany(
                { _id: { $in: order.items }, status: Constant.ORDER_STATUS.FAILED },
                { $set: { status: Constant.ORDER_STATUS.PENDING } }
            );
        }
        const finalized = await finalize_paid_order_db(order._id, {
            gatewayPaymentId: captured.id,
            method: captured.method || "reconcile",
        });
        return { status: "finalized", order: finalized || await Order.findById(order._id) };
    }

    if (anyPending) {
        return { status: "pending", order }; // still in flight — leave as-is
    }

    // No capture and nothing in flight → the payment did not go through. Only a
    // PENDING order is marked FAILED here; a PAID/terminal order is never touched.
    if (order.paymentStatus === Constant.PAYMENT_STATUS.PENDING) {
        order.paymentStatus = Constant.PAYMENT_STATUS.FAILED;
        order.status = Constant.ORDER_STATUS.FAILED;
        await order.save();
        await OrderItem.updateMany(
            { _id: { $in: order.items }, status: { $nin: [Constant.ORDER_STATUS.FAILED, Constant.ORDER_STATUS.REFUNDED] } },
            { $set: { status: Constant.ORDER_STATUS.FAILED } }
        );
    }
    return { status: "failed", order: await Order.findById(order._id) };
};

const generateOrderId = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `ARN-${result}`;
};

// Retry until the generated id is unused (the DB unique index is the final
// guard, but this avoids the previous no-retry duplicate-key order failure).
const generateUniqueOrderId = async () => {
    for (let i = 0; i < 5; i++) {
        const id = generateOrderId();
        // eslint-disable-next-line no-await-in-loop
        const exists = await Order.exists({ orderId: id });
        if (!exists) return id;
    }
    return `${generateOrderId()}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
};

const runCreate = async (userId, orderData, session) => {
    const sessionOpt = session ? { session } : {};

    const itemIds = [];
    if (Array.isArray(orderData.items)) {
        for (const item of orderData.items) {
            const productDetails = {
                productTitle: item?.productTitle,
                itemCode: item?.itemCode,
                designNumber: item?.designNumber,
                slug: item?.slug,
                qty: item?.qty || 1,
                totalItemPrice: item?.totalItemPrice,
                size: item?.size,
                metalWeight: item?.metalWeight,
                categoryName: item?.categoryName,
                engraving: item?.engraving,
                engravingText: item?.engravingText,
                images: item?.images,
                metal: item?.metal,
                metalType: item?.metalType,
                metalStamp: item?.metalStamp,
                hasSize: !!item?.hasSize,
                offerDetails: item?.offerDetails,
                originalPrice: item?.originalPrice,
            };

            const [orderItem] = await OrderItem.create(
                [{
                    productId: item?.jewelleryId,
                    sizeId: item?.sizeId || null,
                    price: item?.price,
                    couponDiscountShare: round2(item?.couponDiscountShare || 0),
                    productDetails,
                    diamondDetails: item?.stoneDetails,
                    // Record WHICH diamond was bought, not just what it cost.
                    ...normalizeSelection(item),
                    status: Constant.ORDER_STATUS.PENDING,
                    lastDayToCancel: new Date(Date.now() + (Constant.MAX_CANCELLATION_DAYS || 1) * 24 * 60 * 60 * 1000),
                }],
                sessionOpt,
            );
            itemIds.push(orderItem._id);
        }
    }

    const orderId = await generateUniqueOrderId();

    const [order] = await Order.create(
        [{
            user: userId,
            orderId,
            ...orderData,
            status: Constant.ORDER_STATUS.PENDING,
            // Respect a caller-supplied paymentStatus (e.g. a wallet-fully-paid
            // order); default to PENDING for the normal no-gateway flow.
            paymentStatus: orderData.paymentStatus || Constant.PAYMENT_STATUS.PENDING,
            items: itemIds,
            createdBy: userId,
            lastDayToCancel: new Date(Date.now() + (Constant.MAX_CANCELLATION_DAYS || 1) * 24 * 60 * 60 * 1000),
        }],
        sessionOpt,
    );

    try {
        const User = mongoose.model("User");
        const user = await User.findById(userId).session(sessionOpt.session || null);
        if (user && (!user.addresses || user.addresses.length === 0) && orderData.shippingAddress) {
            const newAddr = {
                firstName: orderData.shippingAddress.firstName || user.name || "",
                lastName: orderData.shippingAddress.lastName || "",
                email: orderData.shippingAddress.email || user.email || "",
                phone: orderData.shippingAddress.phone || user.phone || "",
                country: orderData.shippingAddress.country || "",
                state: orderData.shippingAddress.state || "",
                city: orderData.shippingAddress.city || "",
                pincode: orderData.shippingAddress.zipCode || "",
                address: orderData.shippingAddress.address || "",
                isDefault: true
            };
            user.addresses = [newAddr];
            await user.save(sessionOpt);
        }
    } catch (err) {
        console.error("Failed to save shippingAddress as default user address:", err);
    }

    // Clear the cart only when NOT deferring it to payment confirmation. With a
    // real gateway the cart is cleared in finalize_paid_order_db once payment
    // succeeds, so an abandoned checkout leaves the cart intact for retry.
    if (orderData._deferCartClear !== true) {
        await Cart.updateMany(
            { userId: userId, isDeleted: 0 },
            { isDeleted: 1 },
            sessionOpt,
        );
    }

    return order;
};

// Admin-side listing — paginated already, kept as-is.
export const get_orders_list_db = async (filters = {}, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const total = await Order.countDocuments(filters);
    const data = await Order.find(filters)
        .populate("user", "firstName lastName email phone")
        .populate({ path: "items", populate: { path: "sizeId" } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const orderIds = data.map(o => o._id);
    const txs = await RefundTransaction.find({ orderId: { $in: orderIds } }).sort({ createdAt: -1 });
    const txMap = {};
    txs.forEach(tx => {
        const key = tx.orderId.toString();
        if (!txMap[key]) txMap[key] = [];
        txMap[key].push(tx);
    });
    data.forEach(order => {
        order.refundTransactions = txMap[order._id.toString()] || [];
    });

    return { total, data };
};

// Customer-side listing — paginated and populates the size doc so the UI
// can render the size label without an extra round-trip.
export const get_orders_by_user_db = async (userId, page = 1, limit = 10, status = null) => {
    const filter = { user: userId, isDelete: false };

    if (status && status !== 'All') {
        // Find order items matching the status exactly
        const items = await OrderItem.find({
            status: status
        }).select('_id');
        const itemIds = items.map(item => item._id);

        filter.$or = [
            { status: status },
            { items: { $in: itemIds } }
        ];
    }

    const skip = (Math.max(1, page) - 1) * limit;
    const total = await Order.countDocuments(filter);
    const data = await Order.find(filter)
        .populate({ path: "items", populate: { path: "sizeId" } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const orderIds = data.map(o => o._id);
    const txs = await RefundTransaction.find({ orderId: { $in: orderIds } }).sort({ createdAt: -1 });
    const txMap = {};
    txs.forEach(tx => {
        const key = tx.orderId.toString();
        if (!txMap[key]) txMap[key] = [];
        txMap[key].push(tx);
    });
    data.forEach(order => {
        order.refundTransactions = txMap[order._id.toString()] || [];
    });

    return { total, page, limit, data };
};

export const get_order_by_id_db = async (orderId, userId) => {
    const order = await Order.findOne({ _id: orderId, user: userId, isDelete: false })
        .populate({ path: "items", populate: { path: "sizeId" } });
    if (order) {
        order.refundTransactions = await RefundTransaction.find({ orderId: order._id }).sort({ createdAt: -1 });
    }
    return order;
};
function applyStatusDates(doc, status) {
    const now = new Date();

    switch (status) {
        case Constant.ORDER_STATUS.APPROVED:
            doc.approvedAt = now;
            break;

        case Constant.ORDER_STATUS.CANCELLED:
        case Constant.ORDER_STATUS.CANCELLED_APPROVED:
            doc.cancelledAt = now;
            break;

        case Constant.ORDER_STATUS.RETURNED:
        case Constant.ORDER_STATUS.RETURNED_APPROVED:
            doc.returnedAt = now;
            break;

        case Constant.ORDER_STATUS.SHIPPED:
            doc.shippedAt = now;
            break;

        case Constant.ORDER_STATUS.DELIVERED:
            doc.deliveredAt = now;
            doc.lastDayToReturn = new Date(now.getTime() + (Constant.MAX_RETURN_DAYS || 2) * 24 * 60 * 60 * 1000);
            break;
    }
}

export const isPaidOrder = order => order?.paymentStatus === Constant.PAYMENT_STATUS.PAID;

export const mergeRefundDetails = (body = {}, existing = {}, remarks) => ({
    refundType:
        body.refundType ??
        existing.refundType ??
        "none",

    refundAmount:
        body.refundAmount ??
        body.amount ??
        existing.amount ??
        0,

    accountHolderName:
        body.accountHolderName ??
        existing.accountHolderName ??
        "",

    bankName:
        body.bankName ??
        existing.bankName ??
        "",

    accountNumber:
        body.accountNumber ??
        existing.accountNumber ??
        "",

    ifscCode:
        body.ifscCode ??
        existing.ifscCode ??
        "",

    refundRemarks:
        body.refundRemarks ??
        body.reason ??
        existing.refundRemarks ??
        remarks
});

export const update_order_status_db = async (id, resolvedStatus, userId, refundDetailsBody = null) => {
    const order = await Order.findOne({ _id: id, isDelete: false });
    if (!order) {
        throw new Error("Order not found");
    }

    const oldStatus = order.status;

    // Standardize: unpaid cancellation approvals are promoted to Cancelled Approved, not Refunded
    const paid = isPaidOrder(order);
    if (resolvedStatus === Constant.ORDER_STATUS.REFUNDED && !paid) {
        resolvedStatus = Constant.ORDER_STATUS.CANCELLED_APPROVED;
    }

    if (SWITCH_ENFORCE_ORDER_STATE_SEQUENCE && oldStatus !== resolvedStatus) {
        const allowed = ALLOWED_TRANSITIONS[oldStatus] || [];
        if (!allowed.includes(resolvedStatus)) {
            throw new Error(`Cannot transition status from ${oldStatus} to ${resolvedStatus}.`);
        }
    }

    // // Verify coupon validity if transitioning from terminal/releasing state back to active state,
    // // or if the order is transitioning to a paid status (Approved) when it wasn't already paid.
    // const wasTerminal = COUPON_RELEASING_STATUSES.includes(oldStatus);
    // const isNowActive = !COUPON_RELEASING_STATUSES.includes(resolvedStatus);
    // const isBecomingPaid = resolvedStatus === Constant.ORDER_STATUS.APPROVED && !paid;
    // if ((wasTerminal && isNowActive) || isBecomingPaid) {
    //     await reapply_coupon_if_order_active(order._id);
    // }

    const SWITCH_RESTRICT_CANCEL_REJECT_STATES = Constant.SWITCHES.SWITCH_RESTRICT_CANCEL_REJECT_STATES ?? true;
    const ALLOWED_CANCEL_STATES = Constant.SWITCHES.ALLOWED_CANCEL_STATES || ["Pending", "Approved"];
    const ALLOWED_REJECT_STATES = Constant.SWITCHES.ALLOWED_REJECT_STATES || ["Pending", "Approved", "In Production"];

    if (SWITCH_RESTRICT_CANCEL_REJECT_STATES) {
        if (resolvedStatus === Constant.ORDER_STATUS.CANCELLED && !ALLOWED_CANCEL_STATES.includes(oldStatus)) {
            throw new Error(`Order cancellation is not allowed when order status is ${oldStatus}.`);
        }
        if (resolvedStatus === Constant.ORDER_STATUS.REJECTED && !ALLOWED_REJECT_STATES.includes(oldStatus)) {
            throw new Error(`Order rejection is not allowed when order status is ${oldStatus}.`);
        }
    }

    // this status can not be updated if order is in terminal state
    const TERMINAL_STATES = [
        Constant.ORDER_STATUS.FAILED,
        Constant.ORDER_STATUS.REJECTED,
        Constant.ORDER_STATUS.RETURNED_REJECTED,
        Constant.ORDER_STATUS.REFUNDED,
        Constant.ORDER_STATUS.CANCELLED_APPROVED
    ];
    if (TERMINAL_STATES.includes(oldStatus)) {
        throw new Error(`Cannot update status. Order is in a terminal state: ${oldStatus}.`);
    }

    order.status = resolvedStatus;
    order.updatedBy = userId;

    // if (order.items && order.items.length > 0) {
    //     await OrderItem.updateMany(
    //         { _id: { $in: order.items } },
    //         { status: resolvedStatus }
    //     );
    // }

    // avoid changing status of terminal states of items
    const ITEM_TERMINAL_STATES = [
        Constant.ORDER_STATUS.CANCELLED,
        Constant.ORDER_STATUS.CANCELLED_APPROVED,
        Constant.ORDER_STATUS.REJECTED,
        Constant.ORDER_STATUS.REFUNDED,
        Constant.ORDER_STATUS.RETURNED_REJECTED,
        Constant.ORDER_STATUS.FAILED
    ];

    const isCancelResolution = [
        Constant.ORDER_STATUS.CANCELLED_APPROVED,
        Constant.ORDER_STATUS.CANCELLED_REJECTED
    ].includes(resolvedStatus);

    const activeItemsCountQuery = {
        _id: { $in: order.items }
    };
    if (isCancelResolution) {
        activeItemsCountQuery.status = Constant.ORDER_STATUS.CANCELLED;
    } else {
        activeItemsCountQuery.status = { $nin: ITEM_TERMINAL_STATES };
    }

    const activeItems = await OrderItem.countDocuments(activeItemsCountQuery);

    if (activeItems === 0) {
        throw new Error(
            isCancelResolution
                ? "Cannot update order status. No pending cancellation requests found on items."
                : "Cannot update order status. No active order items available."
        );
    }

    order.status = resolvedStatus;
    order.updatedBy = userId;

    applyStatusDates(order, resolvedStatus);

    const updateItemsQuery = {
        _id: { $in: order.items }
    };
    if (isCancelResolution) {
        updateItemsQuery.status = Constant.ORDER_STATUS.CANCELLED;
    } else {
        updateItemsQuery.status = { $nin: ITEM_TERMINAL_STATES };
    }

    const itemUpdateFields = { status: resolvedStatus };
    applyStatusDates(order, resolvedStatus);
    if (resolvedStatus === Constant.ORDER_STATUS.CANCELLED_APPROVED || resolvedStatus === Constant.ORDER_STATUS.REFUNDED || resolvedStatus === Constant.ORDER_STATUS.REJECTED) {
        itemUpdateFields.approvedAt = new Date();
        itemUpdateFields["refundDetails.approvedAt"] = new Date();
        itemUpdateFields["refundDetails.approvedBy"] = userId;

        const paid = isPaidOrder(order);
        const refundType = paid ? (refundDetailsBody?.refundType || order.refundDetails?.refundType || "none") : "none";
        itemUpdateFields["refundDetails.refundType"] = refundType;

        if (!paid) {
            itemUpdateFields["refundDetails.amount"] = 0;
            itemUpdateFields["refundDetails.chargePercentage"] = 0;
            itemUpdateFields["refundDetails.chargeAmount"] = 0;
            itemUpdateFields["refundDetails.refundStatus"] = Constant.REFUND_STATUS.SUCCESS;
        } else {
            if (refundType === "gateway") {
                itemUpdateFields["refundDetails.refundStatus"] = Constant.REFUND_STATUS.PROCESSING;
            } else {
                itemUpdateFields["refundDetails.refundStatus"] = Constant.REFUND_STATUS.SUCCESS;
            }
        }
    }

    if (resolvedStatus === Constant.ORDER_STATUS.DELIVERED) {
        itemUpdateFields.deliveredAt = new Date();
        itemUpdateFields.lastDayToReturn = new Date(Date.now() + (Constant.MAX_RETURN_DAYS || 2) * 24 * 60 * 60 * 1000);
    }

    await OrderItem.updateMany(
        updateItemsQuery,
        { $set: itemUpdateFields }
    );

    if (resolvedStatus === Constant.ORDER_STATUS.FAILED) {
        order.paymentStatus = Constant.PAYMENT_STATUS.FAILED;
    } else if (resolvedStatus === Constant.ORDER_STATUS.APPROVED) {
        order.paymentStatus = Constant.PAYMENT_STATUS.PAID;

        // Auto calculate delivery date
        if (SWITCH_AUTO_CALCULATE_ESTIMATED_DELIVERY) {
            let maxShipmentDays = 0;
            let hasShipmentDays = false;
            try {
                const populatedOrder = await Order.findById(id).populate({
                    path: 'items',
                    populate: { path: 'productId' }
                });
                if (populatedOrder && populatedOrder.items) {
                    for (const it of populatedOrder.items) {
                        // Range-aware: "15 to 17" must contribute 17, not
                        // parseInt's 15 — the estimate must be the conservative
                        // upper bound.
                        const upper = shipmentDaysUpperBound(it.productId?.shipmentDays);
                        if (upper > 0) {
                            maxShipmentDays = Math.max(maxShipmentDays, upper);
                            hasShipmentDays = true;
                        }
                    }
                }
            } catch (err) {
                console.error("Error reading shipmentDays from products:", err);
            }
            const finalDays = hasShipmentDays ? maxShipmentDays : 7;
            const date = new Date();
            date.setDate(date.getDate() + finalDays);
            order.estimatedDeliveryDate = date;
        }
    }

    let walletRefund = null;  // credited AFTER the order is safely saved
    let gatewayRefund = null; // pushed to the original payment source after save
    let refundTx = null;
    let targetRefundStatus = Constant.REFUND_STATUS.SUCCESS;
    let amount = 0;

    if (REFUND_TRIGGER_STATES.includes(resolvedStatus) && (refundDetailsBody || isPaidOrder(order)) && (SWITCH_SAVE_REFUND_DETAILS || Constant.SWITCHES.SWITCH_SIMULATE_REFUNDS)) {
        const paid = isPaidOrder(order);

        // Calculate eligible refund amount by skipping items that are already refunded or rejected
        const orderItems = await OrderItem.find({ _id: { $in: order.items } });
        let eligibleRefundAmount = 0;
        for (const item of orderItems) {
            const isAlreadyRefunded = [
                Constant.ORDER_STATUS.REFUNDED,
                Constant.ORDER_STATUS.CANCELLED_APPROVED,
                Constant.ORDER_STATUS.REJECTED
            ].includes(item.status);

            if (isAlreadyRefunded) continue;

            if (item.refundDetails && typeof item.refundDetails.amount === "number") {
                eligibleRefundAmount += item.refundDetails.amount;
            } else {
                const qty = Number(item.productDetails?.qty) || Number(item.qty) || 1;
                const itemLineValue = (Number(item.price) || 0) * qty - (Number(item.couponDiscountShare) || 0);
                const taxRate = Number(order.taxRate) || 0;
                const itemOriginalPayable = itemLineValue * (1 + taxRate);
                eligibleRefundAmount += itemOriginalPayable;
            }
        }
        eligibleRefundAmount = round2(eligibleRefundAmount);

        // Try to find a pending RefundTransaction for this order
        refundTx = await RefundTransaction.findOne({ orderId: order._id, refundStatus: Constant.REFUND_STATUS.PENDING });

        const refundType = paid ? (refundDetailsBody?.refundType || refundTx?.refundType || "none") : "none";
        const refundAmount = paid ? (refundDetailsBody?.refundAmount ?? refundDetailsBody?.amount ?? refundTx?.totalRefundAmount ?? eligibleRefundAmount) : 0;
        amount = Math.min(round2(refundAmount), eligibleRefundAmount);

        const alreadyCredited = refundTx ? !!refundTx.walletCredited : false;
        const alreadyGatewayRefunded = refundTx ? !!refundTx.gatewayRefundId : false;
        const willCreditWallet = paid && refundType === "wallet" && amount > 0 && !alreadyCredited;
        const willGatewayRefund = paid && refundType === "gateway" && amount > 0 && !alreadyGatewayRefunded && !!order.payment?.gatewayPaymentId;

        targetRefundStatus = (refundType === "none" || amount === 0)
            ? Constant.REFUND_STATUS.SUCCESS
            : (willCreditWallet || refundType === "bank")
                ? Constant.REFUND_STATUS.SUCCESS
                : Constant.REFUND_STATUS.PROCESSING;

        if (refundTx) {
            refundTx.refundType = refundType;
            refundTx.totalRefundAmount = amount;
            refundTx.refundStatus = targetRefundStatus;
            refundTx.walletCredited = willCreditWallet || alreadyCredited;
            refundTx.approvedAt = new Date();
            refundTx.approvedBy = userId;
            refundTx.refundedAt = new Date();
            if (refundDetailsBody?.remarks || refundDetailsBody?.reason) {
                refundTx.remarks = refundDetailsBody.remarks || refundDetailsBody.reason;
            }
            await refundTx.save();
        } else {
            const refundNumber = `RFD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
            refundTx = await RefundTransaction.create({
                refundNumber,
                orderId: order._id,
                userId: order.user,
                items: orderItems
                    .filter(item => ![Constant.ORDER_STATUS.REFUNDED, Constant.ORDER_STATUS.CANCELLED_APPROVED, Constant.ORDER_STATUS.REJECTED].includes(item.status))
                    .map(item => ({
                        orderItemId: item._id,
                        quantity: Number(item.productDetails?.qty) || Number(item.qty) || 1,
                        price: Number(item.price) || 0,
                        refundAmount: item.refundDetails?.amount || (amount / (orderItems.length || 1))
                    })),
                subTotal: amount,
                totalRefundAmount: amount,
                refundType,
                refundStatus: targetRefundStatus,
                walletCredited: willCreditWallet,
                bankDetails: {
                    accountHolderName: refundDetailsBody?.accountHolderName || "",
                    bankName: refundDetailsBody?.bankName || "",
                    accountNumber: refundDetailsBody?.accountNumber || "",
                    ifscCode: refundDetailsBody?.ifscCode || ""
                },
                remarks: refundDetailsBody?.refundRemarks || refundDetailsBody?.remarks || refundDetailsBody?.reason || "Admin order status change refund",
                requestedAt: new Date(),
                requestedBy: userId,
                approvedAt: new Date(),
                approvedBy: userId,
                refundedAt: new Date()
            });
        }

        order.refundDetails = {
            refundType,
            amount,
            walletCredited: willCreditWallet || alreadyCredited,
            gatewayRefundId: order.refundDetails?.gatewayRefundId || "",
            accountHolderName: paid ? (refundDetailsBody?.accountHolderName || order.refundDetails?.accountHolderName || "") : "",
            bankName: paid ? (refundDetailsBody?.bankName || order.refundDetails?.bankName || "") : "",
            accountNumber: paid ? (refundDetailsBody?.accountNumber || order.refundDetails?.accountNumber || "") : "",
            ifscCode: paid ? (refundDetailsBody?.ifscCode || order.refundDetails?.ifscCode || "") : "",
            refundRemarks: refundDetailsBody?.refundRemarks || refundDetailsBody?.remarks || refundDetailsBody?.reason || "Admin approved cancellation",
            refundedAt: new Date(),
            refundStatus: targetRefundStatus
        };

        if (willCreditWallet) walletRefund = { userId: order.user, amount };
        if (willGatewayRefund) gatewayRefund = { paymentId: order.payment.gatewayPaymentId, amount };
    }

    await order.save();
    if (gatewayRefund) {
        // Refund to the original payment source via the gateway. Non-fatal — the
        // status change stands; a failure is logged for manual reconciliation.
        try {
            const r = await refundPayment({ paymentId: gatewayRefund.paymentId, amount: gatewayRefund.amount, notes: { orderId: String(order._id) } });
            if (r?.id) {
                let finalRefundStatus = Constant.REFUND_STATUS.PROCESSING;
                if (r?.status === "processed" || r?.status === "success") {
                    finalRefundStatus = Constant.REFUND_STATUS.SUCCESS;
                } else if (r?.status === "failed") {
                    finalRefundStatus = Constant.REFUND_STATUS.FAILED;
                }

                console.log(`[GATEWAY REFUND RESPONSE] Order ID: ${order._id} | Payment ID: ${gatewayRefund.paymentId} | Amount: ${gatewayRefund.amount} | Mapped Refund Status: ${finalRefundStatus} | Gateway Status: ${r.status}`);

                if (refundTx) {
                    await RefundTransaction.updateOne({ _id: refundTx._id }, { $set: { gatewayRefundId: r.id, refundStatus: finalRefundStatus } });
                }

                const isRefundSuccess = finalRefundStatus === Constant.REFUND_STATUS.SUCCESS;
                const shouldTransition = isRefundSuccess && paid && amount > 0 && [Constant.ORDER_STATUS.CANCELLED_APPROVED, Constant.ORDER_STATUS.RETURNED_APPROVED, Constant.ORDER_STATUS.REFUNDED].includes(resolvedStatus);
                const finalStatus = shouldTransition ? Constant.ORDER_STATUS.REFUNDED : resolvedStatus;

                await Order.updateOne({ _id: order._id }, {
                    $set: {
                        status: finalStatus,
                        "refundDetails.gatewayRefundId": r.id,
                        "refundDetails.refundStatus": finalRefundStatus
                    }
                });
                await OrderItem.updateMany(
                    {
                        _id: { $in: order.items },
                        status: { $nin: [Constant.ORDER_STATUS.REFUNDED, Constant.ORDER_STATUS.CANCELLED_APPROVED, Constant.ORDER_STATUS.REJECTED] }
                    },
                    {
                        $set: {
                            status: shouldTransition ? Constant.ORDER_STATUS.REFUNDED : resolvedStatus,
                            "refundDetails.refundStatus": finalRefundStatus
                        }
                    }
                );
            }
        } catch (e) {
            console.error(`[GATEWAY REFUND ERROR] Order ID: ${order._id} | Payment ID: ${gatewayRefund.paymentId} | Amount: ${gatewayRefund.amount} | Error:`, e);
            if (refundTx) {
                await RefundTransaction.updateOne({ _id: refundTx._id }, { $set: { refundStatus: Constant.REFUND_STATUS.FAILED } });
            }
        }
    } else {
        // For wallet / bank, if targetRefundStatus is SUCCESS, update order and items status to REFUNDED
        const isRefundSuccess = (order.refundDetails?.refundStatus || targetRefundStatus) === Constant.REFUND_STATUS.SUCCESS;
        const shouldTransition = isRefundSuccess && paid && amount > 0 && [Constant.ORDER_STATUS.CANCELLED_APPROVED, Constant.ORDER_STATUS.RETURNED_APPROVED, Constant.ORDER_STATUS.REFUNDED].includes(resolvedStatus);
        if (shouldTransition) {
            await Order.updateOne({ _id: order._id }, { $set: { status: Constant.ORDER_STATUS.REFUNDED } });
            await OrderItem.updateMany(
                {
                    _id: { $in: order.items },
                    status: { $nin: [Constant.ORDER_STATUS.REFUNDED, Constant.ORDER_STATUS.CANCELLED_APPROVED, Constant.ORDER_STATUS.REJECTED] }
                },
                { $set: { status: Constant.ORDER_STATUS.REFUNDED } }
            );
        }
    }
    if (walletRefund) {
        // Non-fatal to the status change itself, but log loudly if it fails.
        try {
            await credit_wallet_db({
                userId: walletRefund.userId,
                amount: walletRefund.amount,
                source: "refund",
                orderId: order._id,
                note: `Refund for order ${order.orderId || order._id}`,
                createdBy: userId,
            });
        } catch (creditErr) {
            console.error("wallet refund credit failed:", creditErr?.message);
        }
    }
    // Only recompute the total when this transition changes the billable set
    // (cancel/return/reject/refund). Forward fulfilment leaves the placed total
    // untouched.
    if (statusAffectsBilling(resolvedStatus)) {
        await recalculate_order_totals_db(id);
    }
    // Free the coupon's usage slot if this order-level transition is terminal
    // (cancelled/returned/rejected/failed/refunded). No-op otherwise.
    await release_coupon_if_order_terminal(id, resolvedStatus);
    const updatedOrder = await Order.findById(id);
    return { order: updatedOrder, oldStatus };
};

export const update_order_item_status_db = async (id, resolvedStatus, userId, refundDetailsBody = null) => {
    const useTxn = await supportsTransactions(mongoose);

    const executeUpdate = async (session) => {
        const sessionOpt = session ? { session } : {};

        const orderItem = await OrderItem.findOne({ _id: id }, null, sessionOpt);
        if (!orderItem) {
            throw new Error("Order item not found");
        }

        const order = await Order.findOne({ items: orderItem._id, isDelete: false }, null, sessionOpt);
        if (order && (order.status === Constant.ORDER_STATUS.FAILED || order.paymentStatus === Constant.PAYMENT_STATUS.FAILED)) {
            throw new Error("Cannot update status. Parent order has failed and is in a terminal state.");
        }

        // Standardize: unpaid cancellation approvals are promoted to Cancelled Approved, not Refunded
        const paid = isPaidOrder(order);
        if (resolvedStatus === Constant.ORDER_STATUS.REFUNDED && !paid) {
            resolvedStatus = Constant.ORDER_STATUS.CANCELLED_APPROVED;
        }

        const oldStatus = orderItem.status || Constant.ORDER_STATUS.RECEIVED;

        if (SWITCH_ENFORCE_ORDER_STATE_SEQUENCE && oldStatus !== resolvedStatus) {
            const allowed = ALLOWED_TRANSITIONS_ITEM[oldStatus] || [];
            if (!allowed.includes(resolvedStatus)) {
                throw new Error(`Cannot transition item status from ${oldStatus} to ${resolvedStatus}.`);
            }
        }

        const TERMINAL_STATES = [
            Constant.ORDER_STATUS.FAILED,
            Constant.ORDER_STATUS.REJECTED,
            Constant.ORDER_STATUS.RETURNED_REJECTED,
            Constant.ORDER_STATUS.REFUNDED,
            Constant.ORDER_STATUS.CANCELLED_APPROVED
        ];
        if (TERMINAL_STATES.includes(oldStatus)) {
            throw new Error(`Cannot update status. Order item is in terminal state: ${oldStatus}.`);
        }

        orderItem.status = resolvedStatus;
        applyStatusDates(orderItem, resolvedStatus);

        let itemWalletRefund = null;
        let itemGatewayRefund = null;
        let refundTx = null;
        let amount = 0;

        if (REFUND_TRIGGER_STATES.includes(resolvedStatus) && (SWITCH_SAVE_REFUND_DETAILS || Constant.SWITCHES.SWITCH_SIMULATE_REFUNDS)) {
            const isPaidOrder = order && order.paymentStatus === Constant.PAYMENT_STATUS.PAID;

            refundTx = await RefundTransaction.findOne({
                orderId: order?._id,
                "items.orderItemId": orderItem._id,
                refundStatus: Constant.REFUND_STATUS.PENDING
            });

            const qty = Number(orderItem.productDetails?.qty) || Number(orderItem.qty) || 1;
            const itemLineValue = (Number(orderItem.price) || 0) * qty - (Number(orderItem.couponDiscountShare) || 0);
            const taxRate = Number(order?.taxRate) || 0;
            const itemOriginalPayable = itemLineValue * (1 + taxRate);

            const details = refundDetailsBody?.refundDetails || refundDetailsBody || {};
            const bank = details?.bankDetails || details || {};

            const defaultRefundAmount = (resolvedStatus === Constant.ORDER_STATUS.REJECTED || resolvedStatus === Constant.ORDER_STATUS.CANCELLED_APPROVED) ? itemOriginalPayable : 0;

            const mergedDetails = {
                refundType: details?.refundType || details?.refundMethod || refundTx?.refundType || "none",
                refundAmount: refundDetailsBody?.refundAmount ?? refundDetailsBody?.amount ?? details?.refundAmount ?? details?.amount ?? refundTx?.totalRefundAmount ?? defaultRefundAmount,
                accountHolderName: bank?.accountHolderName || bank?.accountholdername || refundTx?.bankDetails?.accountHolderName || "",
                bankName: bank?.bankName || bank?.bankname || refundTx?.bankDetails?.bankName || "",
                accountNumber: bank?.accountNumber || bank?.accountnumber || refundTx?.bankDetails?.accountNumber || "",
                ifscCode: bank?.ifscCode || bank?.ifsccode || refundTx?.bankDetails?.ifscCode || "",
                refundRemarks: refundDetailsBody?.refundRemarks || refundDetailsBody?.reason || details?.refundRemarks || details?.reason || refundTx?.remarks || "Item refund processed"
            };

            const { refundType, refundAmount, accountHolderName, bankName, accountNumber, ifscCode, refundRemarks } = mergedDetails;
            amount = isPaidOrder ? Math.min(round2(refundAmount), itemOriginalPayable) : 0;

            const alreadyCredited = refundTx ? !!refundTx.walletCredited : false;
            const alreadyGatewayRefunded = refundTx ? !!refundTx.gatewayRefundId : false;
            const willCreditWallet = isPaidOrder && refundType === "wallet" && amount > 0 && !alreadyCredited && !!order?.user;
            const willGatewayRefund = isPaidOrder && refundType === "gateway" && amount > 0 && !alreadyGatewayRefunded && !!order?.payment?.gatewayPaymentId;

            const targetRefundStatus = (refundType === "none" || amount === 0)
                ? Constant.REFUND_STATUS.SUCCESS
                : (willCreditWallet || refundType === "bank")
                    ? Constant.REFUND_STATUS.SUCCESS
                    : Constant.REFUND_STATUS.PROCESSING;

            if (refundTx) {
                refundTx.refundType = refundType;
                refundTx.totalRefundAmount = amount;
                refundTx.refundStatus = targetRefundStatus;
                refundTx.walletCredited = willCreditWallet || alreadyCredited;
                refundTx.approvedAt = new Date();
                refundTx.approvedBy = userId;
                refundTx.refundedAt = new Date();
                if (refundRemarks) refundTx.remarks = refundRemarks;
                await refundTx.save();
            } else {
                const refundNumber = `RFD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
                refundTx = await RefundTransaction.create({
                    refundNumber,
                    orderId: order?._id,
                    userId: order?.user,
                    items: [{
                        orderItemId: orderItem._id,
                        quantity: qty,
                        price: Number(orderItem.price) || 0,
                        couponDiscountShare: Number(orderItem.couponDiscountShare) || 0,
                        refundAmount: amount
                    }],
                    subTotal: itemOriginalPayable,
                    chargePercentage: 0,
                    chargeAmount: 0,
                    totalRefundAmount: amount,
                    refundType,
                    refundStatus: targetRefundStatus,
                    walletCredited: willCreditWallet,
                    bankDetails: {
                        accountHolderName: accountHolderName || "",
                        bankName: bankName || "",
                        accountNumber: accountNumber || "",
                        ifscCode: ifscCode || ""
                    },
                    remarks: refundRemarks,
                    requestedAt: new Date(),
                    requestedBy: userId || order?.user,
                    approvedAt: new Date(),
                    approvedBy: userId,
                    refundedAt: new Date()
                });
            }

            orderItem.refundDetails = {
                refundType,
                amount,
                walletCredited: willCreditWallet || alreadyCredited,
                gatewayRefundId: orderItem.refundDetails?.gatewayRefundId || "",
                accountHolderName: accountHolderName || "",
                bankName: bankName || "",
                accountNumber: accountNumber || "",
                ifscCode: ifscCode || "",
                refundRemarks: refundRemarks,
                refundedAt: new Date(),

                // Preserve cancellation/return fields
                requestedAt: orderItem.refundDetails?.requestedAt || null,
                requestedBy: orderItem.refundDetails?.requestedBy || null,
                approvedAt: new Date(),
                approvedBy: userId,
                cancellationReason: orderItem.refundDetails?.cancellationReason || refundRemarks,
                chargePercentage: orderItem.refundDetails?.chargePercentage || 0,
                chargeAmount: orderItem.refundDetails?.chargeAmount || 0,
                refundStatus: targetRefundStatus
            };

            if (willCreditWallet) itemWalletRefund = { userId: order.user, amount };
            if (willGatewayRefund) itemGatewayRefund = { paymentId: order.payment.gatewayPaymentId, amount, itemId: orderItem._id };
        }

        await orderItem.save(sessionOpt);

        if (itemGatewayRefund) {
            try {
                const r = await refundPayment({ paymentId: itemGatewayRefund.paymentId, amount: itemGatewayRefund.amount, notes: { orderItemId: String(itemGatewayRefund.itemId) } });
                if (r?.id) {
                    let finalRefundStatus = Constant.REFUND_STATUS.PROCESSING;
                    if (r?.status === "processed" || r?.status === "success") {
                        finalRefundStatus = Constant.REFUND_STATUS.SUCCESS;
                    } else if (r?.status === "failed") {
                        finalRefundStatus = Constant.REFUND_STATUS.FAILED;
                    }

                    console.log(`[GATEWAY ITEM REFUND RESPONSE] Item ID: ${itemGatewayRefund.itemId} | Payment ID: ${itemGatewayRefund.paymentId} | Amount: ${itemGatewayRefund.amount} | Mapped Refund Status: ${finalRefundStatus} | Gateway Status: ${r.status}`);

                    if (refundTx) {
                        await RefundTransaction.updateOne({ _id: refundTx._id }, { $set: { gatewayRefundId: r.id, refundStatus: finalRefundStatus } });
                    }

                    const isRefundSuccess = finalRefundStatus === Constant.REFUND_STATUS.SUCCESS;
                    const shouldTransition = isRefundSuccess && isPaidOrder && amount > 0 && [Constant.ORDER_STATUS.CANCELLED_APPROVED, Constant.ORDER_STATUS.RETURNED_APPROVED, Constant.ORDER_STATUS.REFUNDED].includes(resolvedStatus);
                    const finalStatus = shouldTransition ? Constant.ORDER_STATUS.REFUNDED : resolvedStatus;

                    await OrderItem.updateOne(
                        { _id: itemGatewayRefund.itemId },
                        {
                            $set: {
                                status: finalStatus,
                                "refundDetails.gatewayRefundId": r.id,
                                "refundDetails.refundStatus": finalRefundStatus
                            }
                        },
                        sessionOpt
                    );

                    orderItem.status = finalStatus;
                    if (orderItem.refundDetails) {
                        orderItem.refundDetails.gatewayRefundId = r.id;
                        orderItem.refundDetails.refundStatus = finalRefundStatus;
                    }
                }
            } catch (e) {
                console.error(`[GATEWAY ITEM REFUND ERROR] Item ID: ${itemGatewayRefund.itemId} | Payment ID: ${itemGatewayRefund.paymentId} | Amount: ${itemGatewayRefund.amount} | Error:`, e);
                if (refundTx) {
                    await RefundTransaction.updateOne({ _id: refundTx._id }, { $set: { refundStatus: Constant.REFUND_STATUS.FAILED } });
                }
            }
        } else {
            // For wallet / bank, if targetRefundStatus is SUCCESS, update item status to REFUNDED
            const isRefundSuccess = (orderItem.refundDetails?.refundStatus || targetRefundStatus) === Constant.REFUND_STATUS.SUCCESS;
            const shouldTransition = isRefundSuccess && isPaidOrder && amount > 0 && [Constant.ORDER_STATUS.CANCELLED_APPROVED, Constant.ORDER_STATUS.RETURNED_APPROVED, Constant.ORDER_STATUS.REFUNDED].includes(resolvedStatus);
            if (shouldTransition && [Constant.ORDER_STATUS.CANCELLED_APPROVED, Constant.ORDER_STATUS.RETURNED_APPROVED, Constant.ORDER_STATUS.REFUNDED].includes(resolvedStatus)) {
                await OrderItem.updateOne(
                    { _id: orderItem._id },
                    { $set: { status: Constant.ORDER_STATUS.REFUNDED } },
                    sessionOpt
                );
                orderItem.status = Constant.ORDER_STATUS.REFUNDED;
            }
        }

        if (itemWalletRefund) {
            try {
                await credit_wallet_db({
                    userId: itemWalletRefund.userId,
                    amount: itemWalletRefund.amount,
                    source: "refund",
                    orderId: order?._id || null,
                    note: `Refund for item in order ${order?.orderId || order?._id || ""}`.trim(),
                    createdBy: userId,
                }, session);
            } catch (creditErr) {
                console.error("wallet item-refund credit failed:", creditErr?.message);
            }
        }

        if (order) {
            let orderChanged = false;

            const FULFILLMENT_STATES = [
                Constant.ORDER_STATUS.APPROVED,
                Constant.ORDER_STATUS.IN_PRODUCTION,
                Constant.ORDER_STATUS.READY_TO_SHIP,
                Constant.ORDER_STATUS.SHIPPED,
                Constant.ORDER_STATUS.DELIVERED
            ];
            const IGNORED_TERMINAL_STATES = [
                Constant.ORDER_STATUS.CANCELLED,
                Constant.ORDER_STATUS.CANCELLED_APPROVED,
                Constant.ORDER_STATUS.CANCELLED_REJECTED,
                Constant.ORDER_STATUS.REJECTED,
                Constant.ORDER_STATUS.RETURNED_APPROVED,
                Constant.ORDER_STATUS.RETURNED_REJECTED,
                Constant.ORDER_STATUS.REFUNDED
            ];

            const siblingItems = await OrderItem.find({ _id: { $in: order.items } }, null, sessionOpt);
            // Sibling logic: if all items are in terminal cancel/refund/reject states, promote parent order status
            const terminalItems = siblingItems.filter(item =>
                [Constant.ORDER_STATUS.REFUNDED, Constant.ORDER_STATUS.CANCELLED_APPROVED, Constant.ORDER_STATUS.RETURNED_REJECTED, Constant.ORDER_STATUS.REJECTED].includes(item.status)
            );
            if (terminalItems.length === siblingItems.length) {
                const hasRefunded = siblingItems.some(item => item.status === Constant.ORDER_STATUS.REFUNDED);
                if (hasRefunded) {
                    if (order.status !== Constant.ORDER_STATUS.REFUNDED) {
                        order.status = Constant.ORDER_STATUS.REFUNDED;
                        applyStatusDates(order, Constant.ORDER_STATUS.REFUNDED);
                        orderChanged = true;
                    }
                } else {
                    const hasCancelledApproved = siblingItems.some(item => item.status === Constant.ORDER_STATUS.CANCELLED_APPROVED);
                    if (hasCancelledApproved) {
                        if (order.status !== Constant.ORDER_STATUS.CANCELLED_APPROVED) {
                            order.status = Constant.ORDER_STATUS.CANCELLED_APPROVED;
                            applyStatusDates(order, Constant.ORDER_STATUS.CANCELLED_APPROVED);
                            orderChanged = true;
                        }
                    }
                }
            }

            const totalRefundAmount = siblingItems.reduce((acc, sibling) => acc + (sibling.refundDetails?.amount || 0), 0);
            if (totalRefundAmount > 0) {
                if (order.refundDetails) {
                    order.refundDetails.amount = round2(totalRefundAmount);
                    if (!order.refundDetails.refundType || order.refundDetails.refundType === "none") {
                        order.refundDetails.refundType = orderItem.refundDetails?.refundType || "none";
                    }
                } else {
                    order.refundDetails = {
                        refundType: orderItem.refundDetails?.refundType || "none",
                        amount: round2(totalRefundAmount),
                        walletCredited: orderItem.refundDetails?.walletCredited || false,
                        gatewayRefundId: orderItem.refundDetails?.gatewayRefundId || "",
                        refundRemarks: orderItem.refundDetails?.refundRemarks || "Refund processed",
                        refundedAt: new Date()
                    };
                }
                orderChanged = true;
            }

            let allSame = false;
            if (FULFILLMENT_STATES.includes(resolvedStatus)) {
                const activeItems = siblingItems.filter(item => !IGNORED_TERMINAL_STATES.includes(item.status));
                allSame = activeItems.length > 0 && activeItems.every(item => item.status === resolvedStatus);
            } else {
                allSame = siblingItems.every(item => item.status === resolvedStatus);
            }

            if (allSame) {
                order.status = resolvedStatus;
                if (resolvedStatus === Constant.ORDER_STATUS.APPROVED) {
                    order.paymentStatus = Constant.PAYMENT_STATUS.PAID;
                }
                applyStatusDates(order, resolvedStatus);
                orderChanged = true;
            }

            if (orderChanged) {
                await order.save(sessionOpt);
            }
            if (statusAffectsBilling(resolvedStatus)) {
                await recalculate_order_totals_db(order._id, session);
            }
            // Free the coupon only when the WHOLE order has become terminal
            // (every item cancelled/returned/rejected → order.status promoted).
            // A partial cancel leaves order.status non-terminal, so this no-ops
            // and the coupon stays applied to the remaining items.
            await release_coupon_if_order_terminal(order._id, order.status, session);
        }

        return { orderItem, oldStatus };
    };

    if (useTxn) {
        const session = await mongoose.startSession();
        try {
            let res = null;
            await session.withTransaction(async () => {
                res = await executeUpdate(session);
            });
            return res;
        } finally {
            await session.endSession();
        }
    } else {
        return await executeUpdate(null);
    }
};

export const change_order_item_status_db = async (payload) => {
    const { orderId, orderdetailId, resolvedStatus: rawResolvedStatus, refundDetailsBody = null, courier, trackingcode, trackingurl, userId = null } = payload;

    const orderItem = await OrderItem.findById(orderdetailId);
    if (!orderItem) {
        throw new Error("Order item not found");
    }

    const order = await Order.findOne({
        $or: [
            { _id: orderId || new mongoose.Types.ObjectId() },
            { items: orderItem._id }
        ],
        isDelete: false
    });

    const paid = isPaidOrder(order);
    let resolvedStatus = rawResolvedStatus;
    if (resolvedStatus === Constant.ORDER_STATUS.REFUNDED && !paid) {
        resolvedStatus = Constant.ORDER_STATUS.CANCELLED_APPROVED;
    }

    const oldStatus = orderItem.status || Constant.ORDER_STATUS.RECEIVED;

    if (SWITCH_ENFORCE_ORDER_STATE_SEQUENCE && oldStatus !== resolvedStatus) {
        const allowed = ALLOWED_TRANSITIONS_ITEM[oldStatus] || [];
        if (!allowed.includes(resolvedStatus)) {
            throw new Error(`Cannot transition item status from ${oldStatus} to ${resolvedStatus}.`);
        }
    }

    const TERMINAL_STATES = [
        Constant.ORDER_STATUS.FAILED,
        Constant.ORDER_STATUS.REJECTED,
        Constant.ORDER_STATUS.RETURNED_REJECTED,
        Constant.ORDER_STATUS.REFUNDED,
        Constant.ORDER_STATUS.CANCELLED_APPROVED
    ];
    if (TERMINAL_STATES.includes(oldStatus)) {
        throw new Error(`Cannot update status. Order item is in terminal state: ${oldStatus}.`);
    }

    orderItem.status = resolvedStatus;
    applyStatusDates(orderItem, resolvedStatus);

    let itemWalletRefund = null;
    let itemGatewayRefund = null;
    let refundTx = null;
    let amount = 0;

    if (REFUND_TRIGGER_STATES.includes(resolvedStatus) && (SWITCH_SAVE_REFUND_DETAILS || Constant.SWITCHES.SWITCH_SIMULATE_REFUNDS)) {
        const isPaidOrder = order && order.paymentStatus === Constant.PAYMENT_STATUS.PAID;

        refundTx = await RefundTransaction.findOne({
            orderId: order?._id,
            "items.orderItemId": orderItem._id,
            refundStatus: Constant.REFUND_STATUS.PENDING
        });

        const qty = Number(orderItem.productDetails?.qty) || Number(orderItem.qty) || 1;
        const itemLineValue = (Number(orderItem.price) || 0) * qty - (Number(orderItem.couponDiscountShare) || 0);
        const taxRate = Number(order?.taxRate) || 0;
        const itemOriginalPayable = itemLineValue * (1 + taxRate);

        const details = refundDetailsBody?.refundDetails || refundDetailsBody || {};
        const bank = details?.bankDetails || details || {};

        const defaultRefundAmount = (resolvedStatus === Constant.ORDER_STATUS.REJECTED || resolvedStatus === Constant.ORDER_STATUS.CANCELLED_APPROVED) ? itemOriginalPayable : 0;

        const mergedDetails = {
            refundType: details?.refundType || details?.refundMethod || refundTx?.refundType || "none",
            refundAmount: refundDetailsBody?.refundAmount ?? refundDetailsBody?.amount ?? details?.refundAmount ?? details?.amount ?? refundTx?.totalRefundAmount ?? defaultRefundAmount,
            accountHolderName: bank?.accountHolderName || bank?.accountholdername || refundTx?.bankDetails?.accountHolderName || "",
            bankName: bank?.bankName || bank?.bankname || refundTx?.bankDetails?.bankName || "",
            accountNumber: bank?.accountNumber || bank?.accountnumber || refundTx?.bankDetails?.accountNumber || "",
            ifscCode: bank?.ifscCode || bank?.ifsccode || refundTx?.bankDetails?.ifscCode || "",
            refundRemarks: refundDetailsBody?.refundRemarks || refundDetailsBody?.reason || details?.refundRemarks || details?.reason || refundTx?.remarks || "Item refund processed"
        };

        const { refundType, refundAmount, accountHolderName, bankName, accountNumber, ifscCode, refundRemarks } = mergedDetails;
        const chargeAmount = orderItem.refundDetails?.chargeAmount || 0;
        const maxRefundAllowed = Math.max(0, itemOriginalPayable - chargeAmount);
        amount = isPaidOrder ? Math.min(round2(refundAmount), maxRefundAllowed) : 0;

        const alreadyCredited = refundTx ? !!refundTx.walletCredited : false;
        const alreadyGatewayRefunded = refundTx ? !!refundTx.gatewayRefundId : false;
        const willCreditWallet = isPaidOrder && refundType === "wallet" && amount > 0 && !alreadyCredited && !!order?.user;
        const willGatewayRefund = isPaidOrder && refundType === "gateway" && amount > 0 && !alreadyGatewayRefunded && !!order?.payment?.gatewayPaymentId;

        const targetRefundStatus = (refundType === "none" || amount === 0)
            ? Constant.REFUND_STATUS.SUCCESS
            : (willCreditWallet || refundType === "bank")
                ? Constant.REFUND_STATUS.SUCCESS
                : Constant.REFUND_STATUS.PROCESSING;

        if (refundTx) {
            refundTx.refundType = refundType;
            refundTx.totalRefundAmount = amount;
            refundTx.refundStatus = targetRefundStatus;
            refundTx.walletCredited = willCreditWallet || alreadyCredited;
            refundTx.approvedAt = new Date();
            refundTx.approvedBy = userId;
            refundTx.refundedAt = new Date();
            if (orderItem.refundDetails?.chargePercentage) refundTx.chargePercentage = orderItem.refundDetails.chargePercentage;
            if (orderItem.refundDetails?.chargeAmount) refundTx.chargeAmount = orderItem.refundDetails.chargeAmount;
            if (refundRemarks) refundTx.remarks = refundRemarks;
            await refundTx.save();
        } else {
            const refundNumber = `RFD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
            refundTx = await RefundTransaction.create({
                refundNumber,
                orderId: order?._id,
                userId: order?.user,
                items: [{
                    orderItemId: orderItem._id,
                    quantity: qty,
                    price: Number(orderItem.price) || 0,
                    couponDiscountShare: Number(orderItem.couponDiscountShare) || 0,
                    refundAmount: amount
                }],
                subTotal: itemOriginalPayable,
                chargePercentage: orderItem.refundDetails?.chargePercentage || 0,
                chargeAmount: orderItem.refundDetails?.chargeAmount || 0,
                totalRefundAmount: amount,
                refundType,
                refundStatus: targetRefundStatus,
                walletCredited: willCreditWallet,
                bankDetails: {
                    accountHolderName: accountHolderName || "",
                    bankName: bankName || "",
                    accountNumber: accountNumber || "",
                    ifscCode: ifscCode || ""
                },
                remarks: refundRemarks,
                requestedAt: new Date(),
                requestedBy: userId || order?.user,
                approvedAt: new Date(),
                approvedBy: userId,
                refundedAt: new Date()
            });
        }

        orderItem.refundDetails = {
            refundType,
            amount,
            walletCredited: willCreditWallet || alreadyCredited,
            gatewayRefundId: orderItem.refundDetails?.gatewayRefundId || "",
            accountHolderName: accountHolderName || "",
            bankName: bankName || "",
            accountNumber: accountNumber || "",
            ifscCode: ifscCode || "",
            refundRemarks: refundRemarks,
            refundedAt: new Date(),

            // Preserve cancellation/return fields
            requestedAt: orderItem.refundDetails?.requestedAt || null,
            requestedBy: orderItem.refundDetails?.requestedBy || null,
            approvedAt: new Date(),
            approvedBy: userId,
            cancellationReason: orderItem.refundDetails?.cancellationReason || refundRemarks,
            chargePercentage: orderItem.refundDetails?.chargePercentage || 0,
            chargeAmount: orderItem.refundDetails?.chargeAmount || 0,
            refundStatus: targetRefundStatus
        };

        if (willCreditWallet) itemWalletRefund = { userId: order.user, amount };
        if (willGatewayRefund) itemGatewayRefund = { paymentId: order.payment.gatewayPaymentId, amount, itemId: orderItem._id };
    }

    await orderItem.save();

    if (itemGatewayRefund) {
        try {
            const r = await refundPayment({ paymentId: itemGatewayRefund.paymentId, amount: itemGatewayRefund.amount, notes: { orderItemId: String(itemGatewayRefund.itemId) } });
            if (r?.id) {
                let finalRefundStatus = Constant.REFUND_STATUS.PROCESSING;
                if (r?.status === "processed" || r?.status === "success") {
                    finalRefundStatus = Constant.REFUND_STATUS.SUCCESS;
                } else if (r?.status === "failed") {
                    finalRefundStatus = Constant.REFUND_STATUS.FAILED;
                }

                console.log(`[GATEWAY ITEM REFUND RESPONSE] Item ID: ${itemGatewayRefund.itemId} | Payment ID: ${itemGatewayRefund.paymentId} | Amount: ${itemGatewayRefund.amount} | Mapped Refund Status: ${finalRefundStatus} | Gateway Status: ${r.status}`);

                if (refundTx) {
                    await RefundTransaction.updateOne({ _id: refundTx._id }, { $set: { gatewayRefundId: r.id, refundStatus: finalRefundStatus } });
                }

                const isRefundSuccess = finalRefundStatus === Constant.REFUND_STATUS.SUCCESS;
                const shouldTransition = isRefundSuccess && isPaidOrder && amount > 0 && [Constant.ORDER_STATUS.CANCELLED_APPROVED, Constant.ORDER_STATUS.RETURNED_APPROVED, Constant.ORDER_STATUS.REFUNDED].includes(resolvedStatus);
                const finalStatus = shouldTransition ? Constant.ORDER_STATUS.REFUNDED : resolvedStatus;

                await OrderItem.updateOne(
                    { _id: itemGatewayRefund.itemId },
                    {
                        $set: {
                            status: finalStatus,
                            "refundDetails.gatewayRefundId": r.id,
                            "refundDetails.refundStatus": finalRefundStatus
                        }
                    }
                );

                orderItem.status = finalStatus;
                if (orderItem.refundDetails) {
                    orderItem.refundDetails.gatewayRefundId = r.id;
                    orderItem.refundDetails.refundStatus = finalRefundStatus;
                }
            }
        } catch (e) {
            console.error(`[GATEWAY ITEM REFUND ERROR] Item ID: ${itemGatewayRefund.itemId} | Payment ID: ${itemGatewayRefund.paymentId} | Amount: ${itemGatewayRefund.amount} | Error:`, e);
            if (refundTx) {
                await RefundTransaction.updateOne({ _id: refundTx._id }, { $set: { refundStatus: Constant.REFUND_STATUS.FAILED } });
            }
        }
    } else {
        // For wallet / bank, if targetRefundStatus is SUCCESS, update item status to REFUNDED
        const isRefundSuccess = (orderItem.refundDetails?.refundStatus || targetRefundStatus) === Constant.REFUND_STATUS.SUCCESS;
        const shouldTransition = isRefundSuccess && isPaidOrder && amount > 0 && [Constant.ORDER_STATUS.CANCELLED_APPROVED, Constant.ORDER_STATUS.RETURNED_APPROVED, Constant.ORDER_STATUS.REFUNDED].includes(resolvedStatus);
        if (shouldTransition && [Constant.ORDER_STATUS.CANCELLED_APPROVED, Constant.ORDER_STATUS.RETURNED_APPROVED, Constant.ORDER_STATUS.REFUNDED].includes(resolvedStatus)) {
            await OrderItem.updateOne(
                { _id: orderItem._id },
                { $set: { status: Constant.ORDER_STATUS.REFUNDED } }
            );
            orderItem.status = Constant.ORDER_STATUS.REFUNDED;
        }
    }

    if (itemWalletRefund) {
        try {
            await credit_wallet_db({
                userId: itemWalletRefund.userId,
                amount: itemWalletRefund.amount,
                source: "refund",
                orderId: order?._id || null,
                note: `Refund for item in order ${order?.orderId || order?._id || ""}`.trim(),
                createdBy: userId,
            });
        } catch (creditErr) {
            console.error("wallet item-refund credit failed:", creditErr?.message);
        }
    }

    if (order) {
        const FULFILLMENT_STATES = [
            Constant.ORDER_STATUS.APPROVED,
            Constant.ORDER_STATUS.IN_PRODUCTION,
            Constant.ORDER_STATUS.READY_TO_SHIP,
            Constant.ORDER_STATUS.SHIPPED,
            Constant.ORDER_STATUS.DELIVERED
        ];
        const IGNORED_TERMINAL_STATES = [
            Constant.ORDER_STATUS.CANCELLED,
            Constant.ORDER_STATUS.CANCELLED_APPROVED,
            Constant.ORDER_STATUS.CANCELLED_REJECTED,
            Constant.ORDER_STATUS.REJECTED,
            Constant.ORDER_STATUS.RETURNED_APPROVED,
            Constant.ORDER_STATUS.RETURNED_REJECTED,
            Constant.ORDER_STATUS.REFUNDED
        ];

        const siblingItems = await OrderItem.find({ _id: { $in: order.items } });
        // Sibling logic: if all items are in terminal cancel/refund/reject states, promote parent order status
        const terminalItems = siblingItems.filter(item =>
            [Constant.ORDER_STATUS.REFUNDED, Constant.ORDER_STATUS.CANCELLED_APPROVED, Constant.ORDER_STATUS.RETURNED_REJECTED, Constant.ORDER_STATUS.REJECTED].includes(item.status)
        );
        if (terminalItems.length === siblingItems.length) {
            const hasRefunded = siblingItems.some(item => item.status === Constant.ORDER_STATUS.REFUNDED);
            if (hasRefunded) {
                order.status = Constant.ORDER_STATUS.REFUNDED;
                applyStatusDates(order, Constant.ORDER_STATUS.REFUNDED);
            } else {
                const hasCancelledApproved = siblingItems.some(item => item.status === Constant.ORDER_STATUS.CANCELLED_APPROVED);
                if (hasCancelledApproved) {
                    order.status = Constant.ORDER_STATUS.CANCELLED_APPROVED;
                    applyStatusDates(order, Constant.ORDER_STATUS.CANCELLED_APPROVED);
                }
            }
        }

        const totalRefundAmount = siblingItems.reduce((acc, sibling) => acc + (sibling.refundDetails?.amount || 0), 0);
        if (totalRefundAmount > 0) {
            if (order.refundDetails) {
                order.refundDetails.amount = round2(totalRefundAmount);
                if (!order.refundDetails.refundType || order.refundDetails.refundType === "none") {
                    order.refundDetails.refundType = orderItem.refundDetails?.refundType || "none";
                }
            } else {
                order.refundDetails = {
                    refundType: orderItem.refundDetails?.refundType || "none",
                    amount: round2(totalRefundAmount),
                    walletCredited: orderItem.refundDetails?.walletCredited || false,
                    gatewayRefundId: orderItem.refundDetails?.gatewayRefundId || "",
                    refundRemarks: orderItem.refundDetails?.refundRemarks || "Refund processed",
                    refundedAt: new Date()
                };
            }
        }

        let allSame = false;
        if (FULFILLMENT_STATES.includes(resolvedStatus)) {
            const activeItems = siblingItems.filter(item => !IGNORED_TERMINAL_STATES.includes(item.status));
            allSame = activeItems.length > 0 && activeItems.every(item => item.status === resolvedStatus);
        } else {
            allSame = siblingItems.every(item => item.status === resolvedStatus);
        }

        if (allSame) {
            order.status = resolvedStatus;
            if (resolvedStatus === Constant.ORDER_STATUS.APPROVED) {
                order.paymentStatus = Constant.PAYMENT_STATUS.PAID;
            }
            applyStatusDates(order, resolvedStatus);
        }

        if (resolvedStatus === Constant.ORDER_STATUS.SHIPPED) {
            if (trackingcode) order.trackingNumber = trackingcode;
            if (courier) order.shippingCarrier = courier;
            if (trackingurl) order.trackingUrl = trackingurl;
        }

        await order.save();
        if (statusAffectsBilling(resolvedStatus)) {
            await recalculate_order_totals_db(order._id);
        }
        // Free the coupon when the whole order has become terminal (see note in
        // update_order_item_status_db). No-op on a partial cancel/return.
        await release_coupon_if_order_terminal(order._id, order.status);
    }

    return { orderItem, oldStatus };
};

export const update_order_tracking_db = async (id, trackingData, userId) => {
    const { trackingNumber, shippingCarrier, trackingUrl, estimatedDeliveryDate } = trackingData;

    const order = await Order.findOne({ _id: id, isDelete: false });
    if (!order) {
        throw new Error("Order not found");
    }

    if (order.status === Constant.ORDER_STATUS.FAILED || order.paymentStatus === Constant.PAYMENT_STATUS.FAILED) {
        throw new Error("Cannot update tracking for a failed order.");
    }

    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (shippingCarrier !== undefined) order.shippingCarrier = shippingCarrier;
    if (trackingUrl !== undefined) order.trackingUrl = trackingUrl;
    if (estimatedDeliveryDate !== undefined) order.estimatedDeliveryDate = estimatedDeliveryDate;

    order.updatedBy = userId;
    await order.save();
    return order;
};

export const change_order_payment_status_db = async (orderId, paymentStatus) => {
    const order = await Order.findOne({ _id: orderId, isDelete: false });
    if (!order) {
        throw new Error("Order not found");
    }

    const oldPaymentStatus = order.paymentStatus;

    // const wasTerminal = COUPON_RELEASING_STATUSES.includes(order.status) || oldPaymentStatus === "failed";
    // if (paymentStatus === "paid" && oldPaymentStatus !== "paid") {
    //     await reapply_coupon_if_order_active(order._id);
    //     if (order.status === Constant.ORDER_STATUS.FAILED) {
    //         order.status = Constant.ORDER_STATUS.PENDING;
    //         if (order.items && order.items.length > 0) {
    //             await OrderItem.updateMany(
    //                 { _id: { $in: order.items }, status: Constant.ORDER_STATUS.FAILED },
    //                 { status: Constant.ORDER_STATUS.PENDING }
    //             );
    //         }
    //     }
    // }

    order.paymentStatus = paymentStatus;

    const ITEM_TERMINAL_STATES = [
        Constant.ORDER_STATUS.CANCELLED,
        Constant.ORDER_STATUS.CANCELLED_APPROVED,
        Constant.ORDER_STATUS.REJECTED,
        Constant.ORDER_STATUS.REFUNDED,
        Constant.ORDER_STATUS.RETURNED_REJECTED,
        Constant.ORDER_STATUS.FAILED
    ];

    if (paymentStatus === "failed") {
        order.status = Constant.ORDER_STATUS.FAILED;

        if (order.items && order.items.length > 0) {
            await OrderItem.updateMany(
                {
                    _id: { $in: order.items },
                    status: { $nin: ITEM_TERMINAL_STATES }
                },
                {
                    status: Constant.ORDER_STATUS.FAILED
                }
            );
        }
    }

    await order.save();
    // A paid order flipped to failed frees the coupon slot; no-op if the coupon
    // was never redeemed (payment never finalized).
    await release_coupon_if_order_terminal(order._id, order.status);
    return { order, oldPaymentStatus };
};

export const cancel_order_item_customer_db = async (itemId, userId, refundDetailsBody = null) => {
    const orderItem = await OrderItem.findOne({ _id: itemId });
    if (!orderItem) {
        throw new Error("Order item not found");
    }

    const order = await Order.findOne({ items: orderItem._id, user: userId, isDelete: false });
    if (!order) {
        throw new Error("Order not found");
    }

    const maxCancelDays = Constant.MAX_CANCELLATION_DAYS;
    const elapsedDays = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    console.log("maxCancelDays", maxCancelDays)
    console.log("elapsedDays", elapsedDays)
    if (elapsedDays > maxCancelDays) {
        throw new Error(`Order item cannot be cancelled after ${maxCancelDays} days.`);
    }

    const ALLOWED_CANCEL_STATES = Constant.SWITCHES.ALLOWED_CANCEL_STATES || ["Pending", "Approved"];
    const oldStatus = orderItem.status || Constant.ORDER_STATUS.RECEIVED;
    if (!ALLOWED_CANCEL_STATES.includes(oldStatus)) {
        throw new Error(`Order item cannot be cancelled in its current state (${oldStatus}).`);
    }

    orderItem.status = Constant.ORDER_STATUS.CANCELLED;
    orderItem.cancelledAt = new Date();

    const hasPayment = order.paymentStatus === Constant.PAYMENT_STATUS.PAID;

    if (refundDetailsBody) {
        const details = refundDetailsBody.refundDetails || refundDetailsBody || {};
        const bank = details.bankDetails || details || {};
        const parsedAccountHolderName = bank.accountHolderName || bank.accountholdername || details.accountHolderName || "";
        const parsedBankName = bank.bankName || bank.bankname || details.bankName || "";
        const parsedAccountNumber = bank.accountNumber || bank.accountnumber || details.accountNumber || "";
        const parsedIfscCode = bank.ifscCode || bank.ifsccode || details.ifscCode || "";
        const parsedRefundType = details.refundType || details.refundMethod || "none";

        const chargePercent = hasPayment ? Constant.getCancellationChargePercentage(order.createdAt) : 0;
        const qty = Number(orderItem.productDetails?.qty) || Number(orderItem.qty) || 1;
        const itemLineValue = (Number(orderItem.price) || 0) * qty - (Number(orderItem.couponDiscountShare) || 0);
        const taxRate = Number(order.taxRate) || 0;
        const itemOriginalPayable = itemLineValue * (1 + taxRate);
        const itemChargeAmount = hasPayment ? round2(itemOriginalPayable * (chargePercent / 100)) : 0;
        const itemRefundAmount = hasPayment ? round2(Math.max(0, itemOriginalPayable - itemChargeAmount)) : 0;

        const refundNumber = `RFD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

        await RefundTransaction.create({
            refundNumber,
            orderId: order._id,
            userId,
            items: [{
                orderItemId: orderItem._id,
                quantity: qty,
                price: Number(orderItem.price) || 0,
                couponDiscountShare: Number(orderItem.couponDiscountShare) || 0,
                refundAmount: itemRefundAmount
            }],
            subTotal: itemOriginalPayable,
            chargePercentage: chargePercent,
            chargeAmount: itemChargeAmount,
            totalRefundAmount: itemRefundAmount,
            refundType: hasPayment ? parsedRefundType : "none",
            refundStatus: hasPayment ? Constant.REFUND_STATUS.PENDING : Constant.REFUND_STATUS.SUCCESS,
            bankDetails: {
                accountHolderName: hasPayment ? parsedAccountHolderName : "",
                bankName: hasPayment ? parsedBankName : "",
                accountNumber: hasPayment ? parsedAccountNumber : "",
                ifscCode: hasPayment ? parsedIfscCode : ""
            },
            reason: details.reason || "Customer item cancellation",
            requestedAt: new Date(),
            requestedBy: userId
        });

        orderItem.refundDetails = {
            refundType: hasPayment ? parsedRefundType : "none",
            amount: itemRefundAmount,
            walletCredited: false,
            gatewayRefundId: "",
            accountHolderName: hasPayment ? parsedAccountHolderName : "",
            bankName: hasPayment ? parsedBankName : "",
            accountNumber: hasPayment ? parsedAccountNumber : "",
            ifscCode: hasPayment ? parsedIfscCode : "",
            refundRemarks: details.reason || "Customer item cancellation",
            refundedAt: null,

            // Cancellation specific details
            requestedAt: new Date(),
            requestedBy: userId,
            cancellationReason: details.reason || "Customer item cancellation",
            chargePercentage: chargePercent,
            chargeAmount: itemChargeAmount,
            refundStatus: hasPayment ? Constant.REFUND_STATUS.PENDING : Constant.REFUND_STATUS.SUCCESS
        };
    }
    await orderItem.save();

    // Sibling logic: if all items are Cancelled, update parent order status
    const siblingItems = await OrderItem.find({ _id: { $in: order.items } });
    const allCancelled = siblingItems.every(item =>
        [Constant.ORDER_STATUS.CANCELLED, Constant.ORDER_STATUS.CANCELLED_APPROVED].includes(item.status)
    );
    if (allCancelled) {
        const hasPendingCancel = siblingItems.some(item => item.status === Constant.ORDER_STATUS.CANCELLED);
        order.status = hasPendingCancel
            ? Constant.ORDER_STATUS.CANCELLED
            : Constant.ORDER_STATUS.CANCELLED_APPROVED;
        order.cancelledAt = new Date();

        if (refundDetailsBody) {
            // Aggregate all item refunds
            const totalRefundAmount = siblingItems.reduce((acc, item) => acc + (item.refundDetails?.amount || 0), 0);
            order.refundDetails = {
                refundType: hasPayment ? (refundDetailsBody.refundType || "none") : "none",
                amount: round2(totalRefundAmount),
                walletCredited: false,
                gatewayRefundId: "",
                accountHolderName: hasPayment ? (refundDetailsBody.accountHolderName || "") : "",
                bankName: hasPayment ? (refundDetailsBody.bankName || "") : "",
                accountNumber: hasPayment ? (refundDetailsBody.accountNumber || "") : "",
                ifscCode: hasPayment ? (refundDetailsBody.ifscCode || "") : "",
                refundRemarks: refundDetailsBody.reason || "All items customer cancelled",
                refundedAt: null
            };
        }
    }

    await order.save();
    await recalculate_order_totals_db(order._id);
    return orderItem;
};

export const request_return_item_customer_db = async (itemId, userId, reason, refundDetailsBody = null) => {
    const orderItem = await OrderItem.findOne({ _id: itemId });
    if (!orderItem) {
        throw new Error("Order item not found");
    }

    const order = await Order.findOne({ items: orderItem._id, user: userId, isDelete: false });
    if (!order) {
        throw new Error("Order not found");
    }

    const maxReturnDays = Constant.MAX_RETURN_DAYS
    const deliveryDate = orderItem.deliveredAt || order.deliveredAt || order.createdAt;
    const elapsedDays = (Date.now() - new Date(deliveryDate).getTime()) / (1000 * 60 * 60 * 24);
    if (elapsedDays > maxReturnDays) {
        throw new Error(`Order item cannot be returned after ${maxReturnDays} days from delivery.`);
    }
    const isDeliveredItem = orderItem.status?.toLowerCase() === Constant.ORDER_STATUS.DELIVERED.toLowerCase();
    const isReturnRequested = orderItem.status?.toLowerCase() === Constant.ORDER_STATUS.RETURN_REQUEST.toLowerCase();
    const isDeliveredOrder = order.status?.toLowerCase() === Constant.ORDER_STATUS.DELIVERED.toLowerCase();

    if (!isDeliveredItem && !isReturnRequested && !isDeliveredOrder) {
        throw new Error("Only delivered items can be returned.");
    }

    orderItem.status = Constant.ORDER_STATUS.RETURN_REQUEST;
    if (!orderItem.productDetails) {
        orderItem.productDetails = {};
    }
    orderItem.productDetails.reason = reason || "N/A";
    orderItem.markModified("productDetails");

    const hasPayment = order.paymentStatus === Constant.PAYMENT_STATUS.PAID;

    if (refundDetailsBody) {
        const details = refundDetailsBody.refundDetails || refundDetailsBody || {};
        const bank = details.bankDetails || details || {};
        const parsedAccountHolderName = bank.accountHolderName || bank.accountholdername || details.accountHolderName || "";
        const parsedBankName = bank.bankName || bank.bankname || details.bankName || "";
        const parsedAccountNumber = bank.accountNumber || bank.accountnumber || details.accountNumber || "";
        const parsedIfscCode = bank.ifscCode || bank.ifsccode || details.ifscCode || "";
        const parsedRefundType = details.refundType || details.refundMethod || "none";

        const chargePercent = hasPayment ? Constant.getReturnChargePercentage(deliveryDate) : 0;
        const qty = Number(orderItem.productDetails?.qty) || Number(orderItem.qty) || 1;
        const itemLineValue = (Number(orderItem.price) || 0) * qty - (Number(orderItem.couponDiscountShare) || 0);
        const taxRate = Number(order.taxRate) || 0;
        const itemOriginalPayable = itemLineValue * (1 + taxRate);
        const itemChargeAmount = hasPayment ? round2(itemOriginalPayable * (chargePercent / 100)) : 0;
        const itemRefundAmount = hasPayment ? round2(Math.max(0, itemOriginalPayable - itemChargeAmount)) : 0;

        const refundNumber = `RFD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

        await RefundTransaction.create({
            refundNumber,
            orderId: order._id,
            userId,
            items: [{
                orderItemId: orderItem._id,
                quantity: qty,
                price: Number(orderItem.price) || 0,
                couponDiscountShare: Number(orderItem.couponDiscountShare) || 0,
                refundAmount: itemRefundAmount
            }],
            subTotal: itemOriginalPayable,
            chargePercentage: chargePercent,
            chargeAmount: itemChargeAmount,
            totalRefundAmount: itemRefundAmount,
            refundType: hasPayment ? parsedRefundType : "none",
            refundStatus: hasPayment ? Constant.REFUND_STATUS.PENDING : Constant.REFUND_STATUS.SUCCESS,
            bankDetails: {
                accountHolderName: hasPayment ? parsedAccountHolderName : "",
                bankName: hasPayment ? parsedBankName : "",
                accountNumber: hasPayment ? parsedAccountNumber : "",
                ifscCode: hasPayment ? parsedIfscCode : ""
            },
            reason: reason || details.reason || "Customer item return",
            requestedAt: new Date(),
            requestedBy: userId
        });

        orderItem.refundDetails = {
            refundType: hasPayment ? parsedRefundType : "none",
            amount: itemRefundAmount,
            walletCredited: false,
            gatewayRefundId: "",
            accountHolderName: hasPayment ? parsedAccountHolderName : "",
            bankName: hasPayment ? parsedBankName : "",
            accountNumber: hasPayment ? parsedAccountNumber : "",
            ifscCode: hasPayment ? parsedIfscCode : "",
            refundRemarks: reason || details.reason || "Customer item return",
            refundedAt: null,

            // Return specific details
            requestedAt: new Date(),
            requestedBy: userId,
            cancellationReason: reason || details.reason || "Customer item return",
            chargePercentage: chargePercent,
            chargeAmount: itemChargeAmount,
            refundStatus: hasPayment ? Constant.REFUND_STATUS.PENDING : Constant.REFUND_STATUS.SUCCESS
        };
    }
    await orderItem.save();

    // Sibling logic: if all items are Return Request, update the parent order status
    const siblingItems = await OrderItem.find({ _id: { $in: order.items } });
    const allSame = siblingItems.every(item => item.status === Constant.ORDER_STATUS.RETURN_REQUEST);
    if (allSame) {
        order.status = Constant.ORDER_STATUS.RETURN_REQUEST;

        if (refundDetailsBody) {
            const totalRefundAmount = siblingItems.reduce((acc, item) => acc + (item.refundDetails?.amount || 0), 0);
            order.refundDetails = {
                refundType: hasPayment ? (refundDetailsBody.refundType || "none") : "none",
                amount: round2(totalRefundAmount),
                walletCredited: false,
                gatewayRefundId: "",
                accountHolderName: hasPayment ? (refundDetailsBody.accountHolderName || "") : "",
                bankName: hasPayment ? (refundDetailsBody.bankName || "") : "",
                accountNumber: hasPayment ? (refundDetailsBody.accountNumber || "") : "",
                ifscCode: hasPayment ? (refundDetailsBody.ifscCode || "") : "",
                refundRemarks: reason || refundDetailsBody.reason || "All items customer returned",
                refundedAt: null
            };
        }
    }

    await order.save();
    await recalculate_order_totals_db(order._id);
    return { orderItem, order };
};

export const recalculate_order_totals_db = async (orderId, session = null) => {
    const sessionOpt = session ? { session } : {};
    const order = await Order.findById(orderId).populate("items", null, sessionOpt);
    if (!order) return null;
    // This ensures that the GST amount (taxAmount), taxable amount (taxableAmount), and gross totals remain calculated properly for display/historical integrity even after the order or its items have been refunded or cancelled.
    const PRICE_ACTIVE_STATES = [
        Constant.ORDER_STATUS.PENDING,
        Constant.ORDER_STATUS.APPROVED,
        Constant.ORDER_STATUS.RECEIVED,
        Constant.ORDER_STATUS.CONFIRMED,
        Constant.ORDER_STATUS.IN_PRODUCTION,
        Constant.ORDER_STATUS.READY_TO_SHIP,
        Constant.ORDER_STATUS.SHIPPED,
        Constant.ORDER_STATUS.DELIVERED,
        Constant.ORDER_STATUS.RETURN_REQUEST,
        Constant.ORDER_STATUS.ITEM_RECEIVED,
        Constant.ORDER_STATUS.QA_DONE,
        Constant.ORDER_STATUS.CANCELLED,
        Constant.ORDER_STATUS.CANCELLED_REJECTED,
        Constant.ORDER_STATUS.RETURNED_REJECTED,
        Constant.ORDER_STATUS.CANCELLED_APPROVED,
        Constant.ORDER_STATUS.RETURNED_APPROVED,
        Constant.ORDER_STATUS.REFUNDED,
        Constant.ORDER_STATUS.REJECTED
    ];

    let newTotal = 0;
    for (const item of order.items) {
        if (PRICE_ACTIVE_STATES.includes(item.status)) {
            const qty = Number(item.productDetails?.qty) || 1;
            const lineTotal = (Number(item.price) || 0) * qty;
            // Subtract this line's immutable coupon share so the recomputed total
            // keeps the discount and returned items are netted correctly. When no
            // item has been removed this equals the placed total (subTotal − discount).
            const share = Number(item.couponDiscountShare) || 0;
            newTotal += Math.max(0, lineTotal - share);
        }
    }
    // `newTotal` is the NET of coupon — i.e. the new TAXABLE value.
    const newTaxable = round2(newTotal);

    // Re-apply THIS ORDER'S snapshotted tax rate, not the live TAX_RATE
    // constant: an order placed at 3% must stay at 3% even if the rate is
    // changed later. Cancelling a line therefore also refunds the tax that was
    // charged on it, rather than leaving the customer taxed on goods they no
    // longer receive.
    const rate = Number(order.taxRate) || 0;
    const newTax = round2(newTaxable * rate);
    // Whole-rupee gross, matching placement (baseAmount = Math.round(taxable+tax))
    // so a re-billed order stays consistent with what was originally charged and
    // with every UI that rounds for display.
    const newGross = Math.round(newTaxable + newTax);

    order.taxableAmount = newTaxable;
    order.taxAmount = newTax;

    // total / baseAmount are the GROSS (tax-inclusive) payable.
    order.total = newGross;
    order.baseAmount = newGross;
    // Recompute the outstanding gateway amount (was left stale after a
    // billing-affecting transition). Wallet was applied at placement, so what's
    // still due is the new gross minus the wallet already consumed, floored at 0.
    order.amountDue = Math.max(0, Math.round(newGross - (Number(order.walletUsed) || 0)));
    order.paidAmount = order.displayCurrency === "INR"
        ? newGross
        : Math.round(newGross / (order.exchangeRate || 1));

    await order.save(sessionOpt);
    return order;
};
