import { verifyWebhook } from "../../services/payment.services.js";
import { finalize_paid_order_db } from "../../services/order.services.js";
import { handle_payment_link_paid } from "../../services/paymentLink.services.js";
import Order from "../../models/order.model.js";
import OrderItem from "../../models/orderItem.model.js";
import Constant from "../../constants/user.constant.js";
import { STATUS_CODE } from "../../constants/statusCode.constant.js";

// Razorpay webhook. The untouched request bytes are captured on `req.rawBody`
// by the global JSON parser (see app.js) so the HMAC matches byte-for-byte.
// This is the authoritative confirmation path (the client-side verify is a
// fast-path); both funnel through the same idempotent finalize_paid_order_db,
// so a payment is confirmed exactly once.
export const paymentWebhook = async (req, res) => {
    try {
        // Prefer the exact captured bytes; never re-serialise for the signature —
        // JSON.stringify of the parsed object will not reproduce the wire bytes
        // and the HMAC would never match.
        const raw = Buffer.isBuffer(req.rawBody)
            ? req.rawBody.toString("utf8")
            : (Buffer.isBuffer(req.body) ? req.body.toString("utf8") : JSON.stringify(req.body || {}));
        const signature = req.headers["x-razorpay-signature"];

        const { ok } = await verifyWebhook(raw, signature);
        if (!ok) {
            return res.status(STATUS_CODE.UNAUTHORIZED || 401).json({ received: false, message: "Invalid webhook signature" });
        }

        // Signature is valid past this point, so the body is authentic. A parse
        // failure here is a malformed-but-signed payload we can never process —
        // 200 it so the gateway stops retrying (logged for ops).
        let event;
        try {
            event = JSON.parse(raw);
        } catch (parseErr) {
            console.error("paymentWebhook: signed body failed to parse:", parseErr?.message);
            return res.status(STATUS_CODE.OK).json({ received: true, ignored: "unparseable" });
        }
        const type = event?.event;

        if (type === "payment.captured" || type === "order.paid") {
            const payment = event?.payload?.payment?.entity || {};
            const gatewayOrderId = payment.order_id;
            if (gatewayOrderId) {
                const order = await Order.findOne({ "payment.gatewayOrderId": gatewayOrderId });
                if (order) {
                    // Idempotent: only finalizes if still PENDING.
                    await finalize_paid_order_db(order._id, {
                        gatewayPaymentId: payment.id || "",
                        method: payment.method || "",
                    });
                }
            }
        } else if (type === "payment.failed") {
            const payment = event?.payload?.payment?.entity || {};
            const gatewayOrderId = payment.order_id;
            if (gatewayOrderId) {
                const order = await Order.findOne({ "payment.gatewayOrderId": gatewayOrderId, paymentStatus: Constant.PAYMENT_STATUS.PENDING });
                if (order) {
                    order.paymentStatus = Constant.PAYMENT_STATUS.FAILED;
                    order.status = Constant.ORDER_STATUS.FAILED;
                    order.set("payment.gatewayPaymentId", payment.id || "");
                    await order.save();
                    await OrderItem.updateMany(
                        { _id: { $in: order.items }, status: { $nin: [Constant.ORDER_STATUS.FAILED, Constant.ORDER_STATUS.REFUNDED] } },
                        { status: Constant.ORDER_STATUS.FAILED }
                    );
                }
            }
        } else if (type === "payment_link.paid") {
            const link = event?.payload?.payment_link?.entity || {};
            const payment = event?.payload?.payment?.entity || {};
            await handle_payment_link_paid({
                referenceId: link.reference_id || "",
                notes: link.notes || {},
                paymentId: payment.id || "",
                linkId: link.id || "",
            });
        }

        // Always 200 on a validated webhook so the gateway stops retrying.
        return res.status(STATUS_CODE.OK).json({ received: true });
    } catch (error) {
        console.error("paymentWebhook error:", error?.message);
        // A genuine post-verification processing failure (e.g. a transient DB
        // error during finalize). Return non-2xx so Razorpay RETRIES and a paid
        // order is not silently left unfinalized.
        return res.status(STATUS_CODE.INTERNAL_ERROR || 500).json({ received: false, error: error?.message });
    }
};
