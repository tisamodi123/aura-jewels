import { MAIL } from "../config/mail.config.js";
import { baseLayout, heading, paragraph, button } from "./layout.mail.js";

// Escapes special HTML characters
const esc = (v) =>
    String(v ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

export const subscriptionSuccessEmail = (email) => {
    return baseLayout({
        title: "Welcome to Aura Jewels",
        preheader: "Thank you for subscribing to the Aura Jewels Fine Jewelry newsletter.",
        bodyHtml:
            heading("Welcome to the Aura Jewels") +
            paragraph(`Dear ${email}`,) +
            paragraph(
                "Thank you for subscribing to our newsletter. You are now part of our exclusive inner circle."
            ) +
            paragraph(
                "As a member of Aura Jewels, you will receive priority access to our latest collections, bespoke craftsmanship updates, and exclusive invitation-only previews."
            ) +
            button("Explore Aura Jewels", MAIL.storefrontUrl) +
            paragraph(
                `If you have any questions or wish to design a custom piece, please do not hesitate to contact our concierge team at <a href="mailto:${MAIL.supportEmail}" style="color:#8E6C3F; text-decoration:none;">${MAIL.supportEmail}</a>.`
            ),
    });
};
