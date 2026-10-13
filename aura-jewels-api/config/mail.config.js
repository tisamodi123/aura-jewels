// Single source for brand/email config. All env-driven with safe public
// defaults so emails never render a LAN-IP logo or a wrong support address.
//
// Set these in the API .env for production:
//   EMAIL_ASSET_BASE_URL  — public https base that hosts the logo (NOT the LAN dev URL)
//   SUPPORT_EMAIL         — reply-to / footer support address
//   SMTP_FROM             — envelope "from" (e.g. "Aura Jewels <noreply@aurajewels.com>")
//   STOREFRONT_URL        — public storefront root (used for links/CTAs)

const clean = (u, fallback) => (u ? String(u).replace(/\/$/, "") : fallback);

export const MAIL = {
    brandName: process.env.BRAND_NAME || "Aura Jewels",
    brandTagline: process.env.BRAND_TAGLINE || "The Art of Exquisite Luxury",
    storefrontUrl: clean(process.env.STOREFRONT_URL || process.env.FRONTEND_URL, "http://localhost:3000"),
    // Prefer a dedicated public asset base for emails; fall back to storefront.
    get assetBaseUrl() {
        return clean(process.env.EMAIL_ASSET_BASE_URL || process.env.STOREFRONT_URL || process.env.FRONTEND_URL, this.storefrontUrl);
    },
    get logoUrl() {
        return `${this.assetBaseUrl}/images/logo.png`;
    },
    supportEmail: process.env.SUPPORT_EMAIL || "support@aurajewels.com",
    // Default envelope From (also the fallback for any un-typed send). SMTP still
    // AUTHENTICATES as SMTP_USER — only the visible From changes per email type.
    from: process.env.SMTP_FROM || `"Aura Jewels" <${process.env.SMTP_USER || "info@aurajewels.com"}>`,
    // Reply-To for all customer-facing mail (unless a send overrides it).
    replyTo: process.env.MAIL_REPLY_TO || `support@${process.env.MAIL_DOMAIN || "aurajewels.com"}`,
    // Per-type From addresses (professional sender names).
    senders: {
        order:     process.env.MAIL_FROM_ORDER     || `"Aura Jewels Orders" <orders@${process.env.MAIL_DOMAIN || "aurajewels.com"}>`,
        account:   process.env.MAIL_FROM_ACCOUNT   || `"Aura Jewels" <accounts@${process.env.MAIL_DOMAIN || "aurajewels.com"}>`,
        support:   process.env.MAIL_FROM_SUPPORT   || `"Aura Jewels Support" <support@${process.env.MAIL_DOMAIN || "aurajewels.com"}>`,
        returns:   process.env.MAIL_FROM_RETURNS   || `"Aura Jewels Returns" <returns@${process.env.MAIL_DOMAIN || "aurajewels.com"}>`,
        grievance: process.env.MAIL_FROM_GRIEVANCE || `"Aura Jewels" <grievance@${process.env.MAIL_DOMAIN || "aurajewels.com"}>`,
    },
    adminEmail: process.env.ADMIN_NOTIFY_EMAIL || process.env.SUPPORT_EMAIL || "admin@aurajewels.com",
    // Physical address + unsubscribe help with deliverability/compliance.
    companyAddress: process.env.COMPANY_ADDRESS || "Mumbai, India",
    unsubscribeUrl: process.env.EMAIL_UNSUBSCRIBE_URL || "",
};

export default MAIL;
