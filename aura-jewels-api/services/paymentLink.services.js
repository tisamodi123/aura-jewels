import Order from "../models/order.model.js";
import CustomJewellery from "../models/customJewellery.model.js";
import Constant from "../constants/user.constant.js";
import { createPaymentLink } from "./payment.services.js";
import { finalize_paid_order_db } from "./order.services.js";

const round2 = (n) => parseFloat((Number(n) || 0).toFixed(2));
const rand = () => Math.random().toString(36).slice(2, 8);
const frontend = () => (process.env.FRONTEND_URL || Constant.URL?.FRONTEND || "https://Aura Jewels.co").replace(/\/$/, "");

// Create a Razorpay payment link for a PENDING order (ad-hoc "request payment").
// reference_id encodes the target so the webhook can route the paid event:
// "order_<orderId>_<rand>".
export const create_order_payment_link_db = async (orderId, amountOverride) => {
    const order = await Order.findById(orderId).populate("user", "firstName lastName email phone");
    if (!order) throw new Error("Order not found");
    if (order.paymentStatus === Constant.PAYMENT_STATUS.PAID) throw new Error("Order is already paid");

    const amount = round2(amountOverride || order.amountDue || order.total);
    if (!(amount > 0)) throw new Error("Nothing to charge for this order");

    const addr = order.shippingAddress || {};
    const link = await createPaymentLink({
        amount,
        description: `Payment for order ${order.orderId || order._id}`,
        referenceId: `order_${order._id}_${rand()}`,
        customer: {
            name: `${addr.firstName || order.user?.firstName || ""} ${addr.lastName || order.user?.lastName || ""}`.trim(),
            email: addr.email || order.user?.email || "",
            contact: addr.phone || order.user?.phone || "",
        },
        callbackUrl: `${frontend()}/my-account/my-order`,
        notes: { kind: "order", orderId: String(order._id) },
    });

    await Order.updateOne({ _id: order._id }, { $set: { "payment.provider": "razorpay", "payment.paymentLinkId": link.id } });
    return { url: link.url, id: link.id, amount };
};

// Create a payment link for a custom (bespoke) order after the admin quotes it.
export const create_custom_payment_link_db = async (customId, amount) => {
    const custom = await CustomJewellery.findById(customId);
    if (!custom) throw new Error("Custom order not found");
    const amt = round2(amount || custom.quotedPrice);
    if (!(amt > 0)) throw new Error("Set a quoted price greater than zero first");

    const link = await createPaymentLink({
        amount: amt,
        description: `Aura Jewels bespoke order ${custom._id}`,
        referenceId: `custom_${custom._id}_${rand()}`,
        customer: {
            name: `${custom.firstName || ""} ${custom.lastName || ""}`.trim(),
            email: custom.email || "",
            contact: custom.mobileNumber || "",
        },
        callbackUrl: `${frontend()}/my-account/my-custom-orders`,
        notes: { kind: "custom", customId: String(custom._id) },
    });

    custom.quotedPrice = amt;
    custom.paymentStatus = "pending";
    custom.paymentLink = { id: link.id, url: link.url, gatewayPaymentId: "", paidAt: null };
    await custom.save();
    return { url: link.url, id: link.id, amount: amt };
};

// Mark a custom order paid (from the payment_link.paid webhook). Idempotent.
export const mark_custom_order_paid_db = async (customId, { paymentId = "", linkId = "" } = {}) => {
    const custom = await CustomJewellery.findOneAndUpdate(
        { _id: customId, paymentStatus: { $ne: "paid" } },
        {
            $set: {
                paymentStatus: "paid",
                "paymentLink.gatewayPaymentId": paymentId,
                "paymentLink.id": linkId || undefined,
                "paymentLink.paidAt": new Date(),
            },
        },
        { new: true }
    );
    return custom;
};

// Route a payment_link.paid webhook to the right target using notes/reference_id.
export const handle_payment_link_paid = async ({ referenceId = "", notes = {}, paymentId = "", linkId = "" }) => {
    const kind = notes.kind || String(referenceId).split("_")[0];
    if (kind === "order") {
        const orderId = notes.orderId || String(referenceId).split("_")[1];
        if (orderId) await finalize_paid_order_db(orderId, { gatewayPaymentId: paymentId, method: "payment_link" });
    } else if (kind === "custom") {
        const customId = notes.customId || String(referenceId).split("_")[1];
        if (customId) await mark_custom_order_paid_db(customId, { paymentId, linkId });
    }
};
