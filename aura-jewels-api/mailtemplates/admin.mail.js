import { MAIL } from "../config/mail.config.js";
import { baseLayout, heading, paragraph, button, infoRows } from "./layout.mail.js";

// Rendered without decimals, matching the customer site and the order emails.
const money = (order) => {
    const amt = order?.total ?? order?.paidAmount ?? 0;
    return `₹${Math.round(Number(amt) || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })}`;
};

// New order → internal team.
export const newOrderAdminEmail = (order) =>
    baseLayout({
        title: `New Order — ${order?.orderId || ""}`,
        preheader: `New order ${order?.orderId || ""} received`,
        bodyHtml:
            heading("New Order Received") +
            paragraph("A new order has just been placed.") +
            infoRows([
                ["Order No.", order?.orderId || order?._id || "-"],
                ["Customer", order?.customerName || order?.shippingAddress?.firstName || "-"],
                ["Items", Array.isArray(order?.items) ? order.items.length : "-"],
                ["Total", money(order)],
                ["Coupon", order?.coupon?.code || "-"],
            ]),
    });

// New product/order inquiry → internal team.
export const newInquiryAdminEmail = (inquiry) =>
    baseLayout({
        title: "New Inquiry",
        preheader: `New inquiry from ${inquiry?.name || inquiry?.email || "a customer"}`,
        bodyHtml:
            heading("New Inquiry Received") +
            paragraph("A customer has submitted an inquiry.") +
            infoRows([
                ["Name", inquiry?.name || "-"],
                ["Email", inquiry?.email || "-"],
                ["Phone", inquiry?.phone || inquiry?.mobile || "-"],
                ["Product", inquiry?.productTitle || inquiry?.productName || "-"],
                ["Message", inquiry?.message || inquiry?.query || "-"],
            ]),
    });
