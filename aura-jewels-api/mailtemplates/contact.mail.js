import { MAIL } from "../config/mail.config.js";
import { baseLayout, heading, paragraph, panel, infoRows } from "./layout.mail.js";

// The customer controls firstName / lastName / subject / message, and all four
// land inside an HTML email. Escape before interpolating so a submitted `<a>`
// or `<script>` renders as text rather than markup in the admin's inbox.
const esc = (v) =>
    String(v ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const nl2br = (v) => esc(v).replace(/\r?\n/g, "<br/>");

const refOf = (inquiry) => String(inquiry?._id || "").slice(-8).toUpperCase();

// Acknowledgement → the customer who submitted the form.
export const contactInquiryCustomerEmail = (inquiry) => {
    const name = [inquiry?.firstName, inquiry?.lastName].filter(Boolean).join(" ");
    return baseLayout({
        title: "We've received your message",
        preheader: `Reference #${refOf(inquiry)} — our concierge will respond within 24 hours.`,
        bodyHtml:
            heading("Thank You for Reaching Out") +
            paragraph(`Dear ${esc(name) || "Customer"},`) +
            paragraph(
                "We have received your message. A member of the Aura Jewels concierge team will respond within 24 hours."
            ) +
            infoRows([
                ["Reference", `#${refOf(inquiry)}`],
                ["Subject", esc(inquiry?.subject)],
            ]) +
            panel(`<strong>Your message</strong><br/><br/>${nl2br(inquiry?.message)}`) +
            paragraph(
                `If you need to add anything, simply reply to this email or write to <a href="mailto:${MAIL.supportEmail}" style="color:#8E6C3F;">${MAIL.supportEmail}</a>.`
            ),
    });
};

// Notification → the internal team.
export const contactInquiryAdminEmail = (inquiry) => {
    const name = [inquiry?.firstName, inquiry?.lastName].filter(Boolean).join(" ");
    return baseLayout({
        title: "New Contact Inquiry",
        // The preheader is rendered into a <span>, so it needs escaping just
        // like the body — the name is attacker-controlled.
        preheader: `New "${esc(inquiry?.subject)}" message from ${esc(name || inquiry?.email)}`,
        bodyHtml:
            heading("New Contact Inquiry") +
            paragraph("A visitor has submitted the Get in Touch form.") +
            infoRows([
                ["Reference", `#${refOf(inquiry)}`],
                ["Name", esc(name) || "-"],
                ["Email", esc(inquiry?.email) || "-"],
                ["Subject", esc(inquiry?.subject) || "-"],
            ]) +
            panel(`<strong>Message</strong><br/><br/>${nl2br(inquiry?.message)}`),
    });
};
