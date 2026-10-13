import { MAIL } from "../config/mail.config.js";

// One branded 600px layout wrapping every email. Header (logo), body content,
// and a compliant footer (support email, address, optional unsubscribe).
// Use the helpers (button/panel/infoRows/otpBlock) to compose bodies.

const GOLD = "#8E6C3F";
const INK = "#1A1A1A";
const MUTED = "#8A8A8A";

export const baseLayout = ({ title = "Aura Jewels", preheader = "", bodyHtml = "" }) => {
    const year = new Date().getFullYear();
    return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${title}</title></head>
<body style="margin:0;padding:0;background-color:#F4F1EC;">
  <span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F1EC;">
    <tr><td align="center" style="padding:24px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:8px;overflow:hidden;">
        <tr><td height="5" style="background:linear-gradient(90deg,#DFD9CE,${GOLD},#DFD9CE);font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td align="center" style="padding:32px 0 16px 0;background-color:#FFFFFF;">
          <a href="${MAIL.storefrontUrl}" target="_blank" style="text-decoration:none;">
            <img src="${MAIL.logoUrl}" alt="${MAIL.brandName}" width="170" style="display:block;border:0;max-width:170px;height:auto;"/>
          </a>
        </td></tr>
        <tr><td style="padding:8px 40px 32px 40px;font-family:'Montserrat',Arial,sans-serif;color:${INK};">
          ${bodyHtml}
        </td></tr>
        <tr><td align="center" style="padding:32px 40px;background-color:#FBFAF7;border-top:1px solid #EEE9E0;text-align:center;">
          <p style="margin:0;font-family:'Playfair Display',Georgia,serif;font-size:15px;font-style:italic;color:${GOLD};">Exquisite Craftsmanship, Forever Captured.</p>
          <p style="margin:16px 0 0 0;font-family:'Montserrat',Arial,sans-serif;font-size:11px;line-height:18px;color:${MUTED};">
            Questions? Email us at <a href="mailto:${MAIL.supportEmail}" style="color:${GOLD};text-decoration:none;">${MAIL.supportEmail}</a>
          </p>
          <p style="margin:8px 0 0 0;font-family:'Montserrat',Arial,sans-serif;font-size:10px;color:#B0B0B0;">${MAIL.companyAddress}</p>
          ${MAIL.unsubscribeUrl ? `<p style="margin:8px 0 0 0;font-family:'Montserrat',Arial,sans-serif;font-size:10px;"><a href="${MAIL.unsubscribeUrl}" style="color:#B0B0B0;">Unsubscribe</a></p>` : ""}
          <p style="margin:14px 0 0 0;font-family:'Montserrat',Arial,sans-serif;font-size:10px;color:#B0B0B0;">© ${year} ${MAIL.brandName} Fine Jewelry. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
};

// ---- Composition helpers ---------------------------------------------------

export const heading = (text) =>
    `<h1 style="margin:0 0 12px 0;font-family:'Playfair Display',Georgia,serif;font-size:22px;font-weight:600;color:${INK};">${text}</h1>`;

export const paragraph = (html) =>
    `<p style="margin:0 0 14px 0;font-family:'Montserrat',Arial,sans-serif;font-size:14px;line-height:22px;color:#4A4A4A;">${html}</p>`;

export const button = (label, href) =>
    `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;"><tr><td align="center" bgcolor="${INK}" style="border-radius:2px;">
      <a href="${href}" target="_blank" style="display:inline-block;padding:12px 30px;font-family:'Montserrat',Arial,sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#FFFFFF;text-decoration:none;">${label}</a>
    </td></tr></table>`;

export const otpBlock = (otp) =>
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px 0;"><tr>
      <td align="center" style="padding:18px;background-color:#FBFAF7;border:1px dashed ${GOLD};border-radius:6px;">
        <div style="font-family:'Montserrat',Arial,sans-serif;font-size:30px;font-weight:700;letter-spacing:8px;color:${INK};">${otp}</div>
      </td></tr></table>`;

export const panel = (inner) =>
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;"><tr>
      <td style="padding:16px 18px;background-color:#FBFAF7;border:1px solid #EEE9E0;border-radius:6px;font-family:'Montserrat',Arial,sans-serif;font-size:13px;line-height:20px;color:#4A4A4A;">${inner}</td>
    </tr></table>`;

// rows: [[label, value], ...]
export const infoRows = (rows = []) =>
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:10px 0;font-family:'Montserrat',Arial,sans-serif;font-size:13px;">
      ${rows.map(([k, v]) => `<tr>
        <td style="padding:6px 0;color:${MUTED};width:42%;">${k}</td>
        <td style="padding:6px 0;color:${INK};font-weight:600;">${v ?? "-"}</td></tr>`).join("")}
    </table>`;
