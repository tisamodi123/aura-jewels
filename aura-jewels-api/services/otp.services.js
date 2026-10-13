// OTP delivery.
//
// Real SMS goes through the DB-configured gateway (Nimbus by default) via
// utils/sendSms.js — credentials are managed from the admin panel. The
// contract is unchanged so callers don't branch on the provider:
//
//   sendOtpToPhone({ countryCode, phone, otp }) -> Promise<{ ok, providerMessageId?, error? }>
//
// If the SMS gateway is disabled/misconfigured we fall back to the console
// log so dev/staging stays exercisable. During OTP_TEST_MODE the controller
// may still expose the OTP in its response — that MUST be off in production.

import { sendSms, buildOtpMessage } from "../utils/sendSms.js";
import SmsConfig from "../models/smsConfig.model.js";

// Fail-CLOSED: OTP is only echoed in responses when explicitly enabled for QA
// (OTP_TEST_MODE=true). Any other value (or unset) keeps it OFF in production.
export const OTP_TEST_MODE = process.env.OTP_TEST_MODE === "true";

// Single source of truth for OTP validity. Was inconsistent (5 vs 10 min)
// across files — now 3 minutes everywhere.
export const OTP_VALIDITY_MS = 3 * 60 * 1000;

// Generates a 6-digit numeric OTP. Avoids leading-zero ambiguity that
// would otherwise turn the OTP into a 5-character string after `Number()`
// round-trips, while keeping the visible space at exactly 6 chars.
export const generateOtpCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Tiny helper used by request validators / controllers to canonicalise
// what a user typed in the phone field. Strips spaces / dashes / parens
// so "+91 98765-43210" and "9876543210" both store the same way.
export const normalisePhone = (raw) => {
    if (raw === undefined || raw === null) return "";
    const s = String(raw).replace(/[^\d]/g, "");
    return s;
};

// Same for country code — keep the leading "+" and digits only.
export const normaliseCountryCode = (raw) => {
    if (!raw) return "+91";
    const s = String(raw).trim();
    if (!s) return "+91";
    return s.startsWith("+") ? `+${s.slice(1).replace(/[^\d]/g, "")}` : `+${s.replace(/[^\d]/g, "")}`;
};

// Trim and lowercase the email address.
export const normaliseEmail = (raw) => {
    if (raw === undefined || raw === null) return "";
    return String(raw).trim().toLowerCase();
};

// Dispatches the OTP via the configured SMS gateway. Falls back to a console
// log when the gateway is not enabled, so the flow still works in dev.
export const sendOtpToPhone = async ({ countryCode, phone, otp, purpose = "login" }) => {
    try {
        const cc = normaliseCountryCode(countryCode);
        const num = normalisePhone(phone);
        if (!num) {
            return { ok: false, error: "Phone number required" };
        }

        // Only attempt the real gateway when an admin has enabled it.
        const cfg = await SmsConfig.findOne().select("enabled messageTemplate").lean();
        if (cfg?.enabled) {
            const message = buildOtpMessage(cfg.messageTemplate, otp);
            const result = await sendSms({ countryCode: cc, phone: num, message });
            if (result.ok) {
                return { ok: true, providerMessageId: result.providerMessageId };
            }
            // Gateway failed — log and surface the error (don't silently succeed).
            console.error(`[otp] gateway send failed (${purpose} -> ${cc} ${num}): ${result.error}`);
            return { ok: false, error: result.error };
        }

        // Fallback (gateway disabled): log so dev/staging can complete the flow.
        // eslint-disable-next-line no-console
        console.log(`[otp] ${purpose} -> ${cc} ${num} : ${otp} (gateway disabled, test mode = ${OTP_TEST_MODE})`);
        return { ok: true, providerMessageId: `stub-${Date.now()}`, otp: OTP_TEST_MODE ? otp : undefined };
    } catch (error) {
        console.error("sendOtpToPhone error:", error);
        return { ok: false, error: error?.message || "Failed to send OTP" };
    }
};
