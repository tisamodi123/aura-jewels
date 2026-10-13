import geoip from "geoip-lite";
import { STATUS_CODE } from "../constants/statusCode.constant.js";

// Enforce India-only access by CLIENT IP.
//
// KILL-SWITCH: only active when ENFORCE_INDIA_ONLY=true, so it can be turned off
// instantly (flip the env + restart) if it ever misbehaves.
//
// FAIL-OPEN: if the country cannot be POSITIVELY determined (private/localhost
// IP, geo miss, any error), the request is ALLOWED. A detection failure must
// never lock out a real customer — only a request whose country is known AND is
// not India is blocked.
//
// Country source, most-trusted first:
//   1. A CDN/edge country header (Cloudflare / CloudFront / Vercel / GCP). These
//      are stamped by the infrastructure from the true client IP and are the most
//      reliable signal when the app sits behind such an edge.
//   2. Offline GeoIP lookup (geoip-lite) on the real client IP — no network call.

const ENABLED = String(process.env.ENFORCE_INDIA_ONLY || "").toLowerCase() === "true";
const ALLOWED_COUNTRIES = new Set(["IN"]);

// Never geo-block these: CORS preflight, server-to-server callbacks, health probe.
const isExempt = (req) => {
    if (req.method === "OPTIONS") return true;
    const p = String(req.originalUrl || req.path || "");
    return p.includes("/payment/webhook")   // Razorpay webhook (not a browser)
        || p.includes("/checkuser")          // health / uptime probe
        || p === "/" || p === "";
};

const isPrivateIp = (ip) =>
    !ip
    || ip === "::1"
    || ip.startsWith("127.")
    || ip.startsWith("10.")
    || ip.startsWith("192.168.")
    || /^172\.(1[6-9]|2\d|3[01])\./.test(ip)
    || ip.startsWith("169.254.");

// The first PUBLIC IP in the x-forwarded-for chain (the real client), unwrapping
// IPv4-mapped IPv6. Falls back to req.ip / socket address.
const clientIp = (req) => {
    const xff = req.headers["x-forwarded-for"];
    const chain = (Array.isArray(xff) ? xff.join(",") : String(xff || ""))
        .split(",").map((s) => s.trim()).filter(Boolean);
    for (let ip of [...chain, req.ip, req.socket?.remoteAddress]) {
        if (!ip) continue;
        ip = String(ip).replace(/^::ffff:/, "");
        if (!isPrivateIp(ip)) return ip;
    }
    return null;
};

const countryOf = (req) => {
    const hdr = (h) => String(req.headers[h] || "").trim().toUpperCase();
    const headerCountry =
        hdr("cf-ipcountry") ||               // Cloudflare
        hdr("cloudfront-viewer-country") ||  // AWS CloudFront
        hdr("x-vercel-ip-country") ||        // Vercel
        hdr("x-appengine-country") ||        // GCP App Engine
        hdr("x-geo-country");                // generic reverse proxy
    if (headerCountry && headerCountry.length === 2 && headerCountry !== "XX") return headerCountry;

    const ip = clientIp(req);
    if (!ip) return null;
    return geoip.lookup(ip)?.country || null;
};

export const enforceIndiaOnly = (req, res, next) => {
    if (!ENABLED) return next();
    if (isExempt(req)) return next();
    try {
        const country = countryOf(req);
        if (country && !ALLOWED_COUNTRIES.has(country)) {
            return res.status(STATUS_CODE.FORBIDDEN).json({
                errorCode: STATUS_CODE.FORBIDDEN,
                message: "Aura Jewels is currently available to customers in India only.",
            });
        }
    } catch (e) {
        // Fail-open on any error.
        console.error("geoBlock error (allowing request):", e?.message);
    }
    return next();
};

export default enforceIndiaOnly;
