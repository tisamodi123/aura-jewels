import SmsConfig from "../models/smsConfig.model.js";
import { decryptSecret } from "./cryptoUtil.js";

// Sends a transactional SMS (OTP) via the configured gateway (Nimbus by default).
// Config + credentials come from the DB (admin-editable), not env — only the
// encryption key lives in env. Contract mirrors the old stub so callers are
// unchanged: returns { ok, providerMessageId?, error? }.

// Small cache so we don't hit Mongo + scrypt-decrypt on every OTP.
let _cache = null;
let _cacheAt = 0;
const CACHE_TTL_MS = 60 * 1000;

export const clearSmsConfigCache = () => {
    _cache = null;
    _cacheAt = 0;
};

const loadConfig = async () => {
    const now = Date.now();
    if (_cache && now - _cacheAt < CACHE_TTL_MS) return _cache;
    _cache = await SmsConfig.findOne().lean();
    _cacheAt = now;
    return _cache;
};

// Strips a leading country code / plus so the gateway gets a bare 10-digit number.
const toLocalNumber = (phone, countryCode) => {
    let p = String(phone || "").trim();
    const cc = String(countryCode || "").replace(/[^0-9]/g, ""); // "+91" -> "91"
    p = p.replace(/[^0-9]/g, "");
    if (cc && p.startsWith(cc) && p.length > 10) p = p.slice(cc.length);
    if (p.length > 10 && p.startsWith("91")) p = p.slice(2);
    return p;
};

export const sendSms = async ({ countryCode, phone, message }) => {
    try {
        const cfg = await loadConfig();
        if (!cfg) return { ok: false, error: "SMS config not set up" };
        if (!cfg.enabled) return { ok: false, error: "SMS sending is disabled" };

        const phno = toLocalNumber(phone, countryCode);
        if (!phno) return { ok: false, error: "Invalid phone number" };

        // Staging guard — don't dispatch real SMS.
        if (cfg.testMode) {
            console.log(`[SMS test-mode] to=${phno} msg="${message}"`);
            return { ok: true, providerMessageId: "test-mode" };
        }

        const password = decryptSecret(cfg.password);
        if (!cfg.userId || !password) return { ok: false, error: "SMS credentials incomplete" };

        const params = new URLSearchParams({
            UserID: cfg.userId,
            Password: password,
            SenderID: cfg.senderId || "",
            Phno: phno,
            Msg: message,
            EntityID: cfg.entityId || "",
            TemplateID: cfg.templateId || "",
            FlashMsg: "0",
        });

        const url = `${cfg.apiUrl}?${params.toString()}`;
        const res = await fetch(url, { method: "GET" });
        const text = await res.text();

        // Always log the gateway reply — DLT rejections come back with HTTP 200
        // but an error body (e.g. "Template Mismatch"), so this is the only way
        // to diagnose non-delivery.
        console.log("url",url)
        console.log(`[sendSms] to=${phno} status=${res.status} response=${(text || "").trim()}`);

        if (!res.ok) {
            return { ok: false, error: `Gateway HTTP ${res.status}: ${text?.slice(0, 200)}` };
        }
        return { ok: true, providerMessageId: text?.trim()?.slice(0, 120) || "sent" };
    } catch (error) {
        console.error("[sendSms] error:", error?.message);
        return { ok: false, error: error?.message || "SMS send failed" };
    }
};

// Formats a date as "DD-MM-YYYY HH:MM" in Asia/Kolkata (matches the PHP sample).
const fmtIST = (date) => {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: false,
    }).formatToParts(date);
    const get = (t) => parts.find((p) => p.type === t)?.value || "";
    return `${get("day")}-${get("month")}-${get("year")} ${get("hour")}:${get("minute")}`;
};

// Builds the OTP message from the configured DLT template. Supported placeholders:
//   {otp}        -> the 6-digit code
//   {validTill}  -> now + 2 minutes (IST)   e.g. "05-07-2026 18:32"
//   {generated}  -> now (IST)
export const buildOtpMessage = (template, otp) => {
    const now = new Date();
    return String(template || "{otp} is your OTP for Aura Jewels.")
        .replace(/\{otp\}/gi, String(otp))
        .replace(/\{validTill\}/gi, fmtIST(new Date(now.getTime() + 2 * 60 * 1000)))
        .replace(/\{generated\}/gi, fmtIST(now));
};
