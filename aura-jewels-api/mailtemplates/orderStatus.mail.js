import { MAIL } from "../config/mail.config.js";
import { baseLayout, heading, paragraph, button, panel, infoRows } from "./layout.mail.js";

const hi = (name) => (name ? `Dear ${name},` : "Hello,");
const orderNo = (order) => order?.orderId || order?._id || "your order";
// Rendered without decimals, matching the customer site and the order emails.
const money = (order) => {
    const amt = order?.total ?? order?.paidAmount ?? 0;
    const sym = (order?.displayCurrency || "INR") === "INR" ? "₹" : "";
    return `${sym}${Math.round(Number(amt) || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })}`;
};
const ordersUrl = () => `${MAIL.storefrontUrl}/my-account/my-order`;

export const orderShippedEmail = (order, { trackingId = "", courier = "" } = {}) =>
    baseLayout({
        title: `${MAIL.brandName} — Your order has shipped`,
        preheader: `Order ${orderNo(order)} is on its way`,
        bodyHtml:
            heading("Your Order Is On Its Way") +
            paragraph(hi(order?.customerName)) +
            paragraph(`Great news — your order <strong>${orderNo(order)}</strong> has been shipped.`) +
            infoRows([
                ["Order", orderNo(order)],
                ...(courier ? [["Courier", courier]] : []),
                ...(trackingId ? [["Tracking No.", trackingId]] : []),
                ["Order Total", money(order)],
            ]) +
            button("Track Your Order", ordersUrl()),
    });

export const orderDeliveredEmail = (order) =>
    baseLayout({
        title: `${MAIL.brandName} — Your order has been delivered`,
        preheader: `Order ${orderNo(order)} has been delivered`,
        bodyHtml:
            heading("Delivered With Care") +
            paragraph(hi(order?.customerName)) +
            paragraph(`Your order <strong>${orderNo(order)}</strong> has been delivered. We hope you love it.`) +
            panel("We'd be honoured if you shared your experience. Simply reply to this email with your feedback.") +
            button("View Order", ordersUrl()),
    });

export const orderCancelledEmail = (order, reason = "") =>
    baseLayout({
        title: `${MAIL.brandName} — Order cancelled`,
        preheader: `Order ${orderNo(order)} has been cancelled`,
        bodyHtml:
            heading("Your Order Was Cancelled") +
            paragraph(hi(order?.customerName)) +
            paragraph(`Your order <strong>${orderNo(order)}</strong> has been cancelled.`) +
            (reason ? panel(`Reason: ${reason}`) : "") +
            paragraph(`Any eligible refund will be processed to your original payment method. Questions? Email <a href="mailto:${MAIL.supportEmail}" style="color:#8E6C3F;">${MAIL.supportEmail}</a>.`),
    });

export const paymentFailedEmail = (order) =>
    baseLayout({
        title: `${MAIL.brandName} — Payment could not be completed`,
        preheader: `We couldn't process payment for order ${orderNo(order)}`,
        bodyHtml:
            heading("Payment Not Completed") +
            paragraph(hi(order?.customerName)) +
            paragraph(`We were unable to process the payment for order <strong>${orderNo(order)}</strong>. Your items are still saved — you can retry checkout.`) +
            button("Retry Payment", `${MAIL.storefrontUrl}/cart`),
    });

export const refundInitiatedEmail = (order) =>
    baseLayout({
        title: `${MAIL.brandName} — Refund initiated`,
        preheader: `A refund has been initiated for order ${orderNo(order)}`,
        bodyHtml:
            heading("Your Refund Is On Its Way") +
            paragraph(hi(order?.customerName)) +
            paragraph(`We've initiated a refund for order <strong>${orderNo(order)}</strong>. It may take a few business days to reflect in your account.`) +
            infoRows([["Order", orderNo(order)], ["Refund Amount", money(order)]]),
    });

// Generic lifecycle-update email used for the transitions that don't have a
// bespoke template (Approved / Confirmed / In Production / Ready to Ship /
// Received / Rejected). Caller supplies the headline + message.
export const orderStatusUpdateEmail = (order, { headline, message, note = "" } = {}) =>
    baseLayout({
        title: `${MAIL.brandName} — ${headline}`,
        preheader: `Update on your order ${orderNo(order)}`,
        bodyHtml:
            heading(headline) +
            paragraph(hi(order?.customerName)) +
            paragraph(message) +
            (note ? panel(note) : "") +
            infoRows([["Order", orderNo(order)], ["Order Total", money(order)]]) +
            button("View Order", ordersUrl()),
    });

// Item-level status update — names the SPECIFIC item affected. Used when a
// single line of a multi-item order is cancelled / rejected / shipped etc., so
// the mail never implies the WHOLE order changed. Caller supplies the copy.
export const orderItemStatusEmail = (order, itemName, { headline, message, note = "" } = {}) =>
    baseLayout({
        title: `${MAIL.brandName} — ${headline}`,
        preheader: `Update on an item in your order ${orderNo(order)}`,
        bodyHtml:
            heading(headline) +
            paragraph(hi(order?.customerName)) +
            paragraph(message) +
            (note ? panel(note) : "") +
            infoRows([["Order", orderNo(order)], ["Item", itemName || "—"]]) +
            button("View Order", ordersUrl()),
    });

export const refundCompletedEmail = (order) =>
    baseLayout({
        title: `${MAIL.brandName} — Refund completed`,
        preheader: `Your refund for order ${orderNo(order)} is complete`,
        bodyHtml:
            heading("Refund Completed") +
            paragraph(hi(order?.customerName)) +
            paragraph(`Your refund for order <strong>${orderNo(order)}</strong> has been completed.`) +
            infoRows([["Order", orderNo(order)], ["Refund Amount", money(order)]]),
    });

export const cancelRequestRejectedEmail = (order) => 
    baseLayout({
        title: `${MAIL.brandName} — Cancellation request rejected`,
        preheader: `Cancellation request rejected for order ${orderNo(order)}`,
        bodyHtml:
            heading("Cancellation Request Rejected") +
            paragraph(hi(order?.customerName)) +
            paragraph(`Your cancellation request for order <strong>${orderNo(order)}</strong> has been rejected.`) +
            infoRows([["Order", orderNo(order)], ["Order Total", money(order)]]) +
            button("View Order", ordersUrl()),
    });

export const cancelItemRequestRejectedEmail = (order, itemName) => 
    baseLayout({
        title: `${MAIL.brandName} — Item cancellation request rejected`,
        preheader: `Cancellation request rejected for item in order ${orderNo(order)}`,
        bodyHtml:
            heading("Item Cancellation Request Rejected") +
            paragraph(hi(order?.customerName)) +
            paragraph(`Your cancellation request for <strong>${itemName || "an item"}</strong> in order <strong>${orderNo(order)}</strong> has been rejected.`) +
            infoRows([["Order", orderNo(order)], ["Item", itemName || "—"]]) +
            button("View Order", ordersUrl()),
    });