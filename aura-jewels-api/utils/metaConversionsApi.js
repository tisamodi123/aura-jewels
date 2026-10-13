import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { sendEmail } from "./sendEmail.js";
import { MAIL } from "../config/mail.config.js";

const PIXEL_ID = process.env.META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CONVERSIONS_API_ACCESS_TOKEN || process.env.META_CONVERSION_API_ACCESS_TOKEN;
const TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE; // remove/omit in prod
const API_VERSION = "v20.0"; // latest version

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let lastAlertSentTime = 0;
const ALERT_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour cooldown to prevent spamming

/**
 * Send alert email for tracking failures.
 */
async function sendAlertEmail(eventName, eventId, errorMessage) {
  try {
    const now = Date.now();
    if (now - lastAlertSentTime < ALERT_COOLDOWN_MS) {
      console.log("[Meta CAPI Alert] Alert throttled (cooldown active).");
      return;
    }
    
    lastAlertSentTime = now;
    
    const adminEmail = MAIL.adminEmail || "support@aurajewels.com";
    const subject = `[ALERT] Meta Conversions API Tracking Failure - ${eventName}`;
    
    const htmlContent = `
      <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #d9534f; margin-top: 0;">Meta Conversions API Failure Alert</h2>
        <p>A permanent tracking failure has been logged for a Meta CAPI event.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee; width: 120px;">Event Name:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${eventName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Event ID:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${eventId}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Error Message:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #c9302c;">${errorMessage}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Timestamp:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date().toISOString()}</td>
          </tr>
        </table>
        <p style="font-size: 14px; color: #666; margin-top: 20px;">
          Please check the log file <code>logs/meta-capi-failures.log</code> on the server for full payload details and troubleshooting.
        </p>
      </div>
    `;
    
    await sendEmail(adminEmail, subject, htmlContent);
    console.log(`[Meta CAPI Alert] Sent tracking failure email alert to ${adminEmail}`);
  } catch (err) {
    console.error("[Meta CAPI Alert] Failed to send email alert:", err);
  }
}

/**
 * Log permanent tracking failures to a dedicated log file.
 */
function logTrackingFailure(eventName, eventId, errorMessage, payload) {
  try {
    const logDir = path.resolve(__dirname, "../../logs");
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const logFile = path.join(logDir, "meta-capi-failures.log");
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] EVENT: ${eventName} | ID: ${eventId} | ERROR: ${errorMessage} | PAYLOAD: ${JSON.stringify(payload)}\n`;
    fs.appendFileSync(logFile, logEntry);
    console.error(`[META-CAPI-ALERT] Permanent CAPI failure for ${eventName}: ${errorMessage}`);
    
    // Trigger email alert asynchronously
    sendAlertEmail(eventName, eventId, errorMessage).catch(err => {
      console.error("[Meta CAPI Alert] sendAlertEmail async error:", err);
    });
  } catch (err) {
    console.error("Failed to write to meta CAPI log file:", err);
  }
}

/**
 * Map country names to ISO 2-letter codes.
 * Meta Conversions API expects country in ISO 2-letter format (e.g., "US", "IN").
 * @param {string} country
 * @returns {string}
 */
function getCountryIsoCode(country) {
  if (!country) return country;
  const clean = String(country).trim().toLowerCase();
  
  const countryMap = {
    india: "in",
    ind: "in",
    "united states": "us",
    "united states of america": "us",
    usa: "us",
    "united kingdom": "gb",
    uk: "gb",
    canada: "ca",
    can: "ca",
    australia: "au",
    aus: "au",
    germany: "de",
    deu: "de",
    france: "fr",
    fra: "fr",
    italy: "it",
    ita: "it",
    spain: "es",
    esp: "es",
    japan: "jp",
    jpn: "jp",
    china: "cn",
    chn: "cn",
    singapore: "sg",
    sgp: "sg",
    "united arab emirates": "ae",
    uae: "ae",
  };

  if (countryMap[clean]) {
    return countryMap[clean];
  }

  if (clean.length === 2) {
    return clean.toUpperCase();
  }

  return country;
}

/**
 * SHA-256 hash helper for customer data normalization (required by Meta).
 * Values must be trimmed and lowercased before hashing.
 * Returns an array containing the hashed value, or undefined if value is empty.
 * @param {string} value
 * @param {boolean} isPhone - If true, normalizes to digits only (E.164 format without +)
 * @returns {string[]|undefined}
 */
function hashToArray(value, isPhone = false) {
  if (!value) return undefined;
  let normalized = String(value).trim().toLowerCase();
  if (isPhone) {
    normalized = normalized.replace(/\D/g, ""); // Digits only, no '+' or spaces
  }
  if (!normalized) return undefined;
  const hashed = crypto
    .createHash("sha256")
    .update(normalized)
    .digest("hex");
  return [hashed];
}

/**
 * Helper to extract cookie value by name from Express request headers.
 * @param {object} req - Express request object
 * @param {string} name - Cookie name
 * @returns {string|undefined}
 */
function getCookie(req, name) {
  const cookieHeader = req?.headers?.cookie;
  if (!cookieHeader) return undefined;
  
  const cookies = cookieHeader.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const parts = cookies[i].split("=");
    const key = parts[0].trim();
    if (key === name) {
      return decodeURIComponent(parts.slice(1).join("="));
    }
  }
  return undefined;
}

/**
 * Sends a server-side event to Meta Conversions API.
 * @param {string} eventName - e.g. "PageView", "Contact", "Purchase", "AddToCart", etc.
 * @param {string} eventId - MUST match the client-side Pixel event_id for the same action (dedup key)
 * @param {number} eventTime - Unix timestamp in seconds. Default is current time.
 * @param {object} userData - raw user data, will be hashed here (email, phone, firstName, etc.)
 * @param {object} customData - event-specific data (value, currency, content_ids, etc.)
 * @param {object} req - Express/Node.js request object (for IP + user agent + source URL)
 * @param {string} testEventCode - Optional dynamic test-event override from frontend or service
 * @param {string} actionSource - Optional action source override (e.g. 'system_generated')
 */
export async function sendConversionEvent({ eventName, eventId, eventTime, userData = {}, customData = {}, req, testEventCode, actionSource }) {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    // console.warn("[Meta CAPI] Missing META_PIXEL_ID or META_CONVERSION_API_ACCESS_TOKEN in env. Event skipped.");
    return { success: false, error: "Missing config credentials" };
  }

  const clientIp =
    req?.headers?.["x-forwarded-for"]?.split(",")[0] ||
    req?.socket?.remoteAddress ||
    req?.ip ||
    userData.client_ip_address ||
    userData.clientIpAddress ||
    undefined;

  const userAgent = 
    userData.userAgent ||
    userData.clientUserAgent ||
    userData.client_user_agent ||
    req?.headers?.["user-agent"] ||
    undefined;

  const fbc = userData.fbc || getCookie(req, "_fbc") || undefined;
  const fbp = userData.fbp || getCookie(req, "_fbp") || undefined;
  const externalId = userData.externalId || userData.external_id || undefined;

  const sourceUrl = userData.sourceUrl || req?.headers?.referer || "https://aurajewels.com";

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: eventTime || Math.floor(Date.now() / 1000),
        event_id: eventId, // critical for deduplication with browser Pixel
        event_source_url: sourceUrl,
        action_source: actionSource || "website",
        user_data: {
          client_ip_address: clientIp,
          client_user_agent: userAgent,
          em: hashToArray(userData.email || userData.em),
          ph: hashToArray(userData.phone || userData.ph, true),
          fn: hashToArray(userData.firstName || userData.fn),
          ln: hashToArray(userData.lastName || userData.surname || userData.ln),
          ct: hashToArray(userData.city || userData.town || userData.ct),
          st: hashToArray(userData.state || userData.region || userData.county || userData.st),
          zp: hashToArray(userData.zip || userData.postcode || userData.zipCode || userData.pincode || userData.zp),
          country: hashToArray(getCountryIsoCode(userData.country || userData.countryCode)),
          gen: hashToArray(userData.gender || userData.gen),
          db: hashToArray(userData.dateOfBirth || userData.dob || userData.db),
          external_id: externalId, // Sent UNHASHED per rules
          fbc: fbc, // Facebook click id cookie
          fbp: fbp, // Facebook browser id cookie
        },
        custom_data: customData,
      },
    ],
  };

  const finalTestEventCode = testEventCode || TEST_EVENT_CODE;
  if (finalTestEventCode) {
    payload.test_event_code = finalTestEventCode;
  }

  const IS_DEBUG = process.env.DEBUG === "true" || process.env.NODE_ENV === "development";

  if (IS_DEBUG) {
    // Print raw user data for debugging
    // console.log("[Meta CAPI Debug] Raw User Data (before hashing):\n", JSON.stringify(userData, null, 2));
    // Print the complete formatted payload for verification
    // console.log("[Meta CAPI] Dispatch Payload:\n", JSON.stringify(payload, null, 2));
  } else {
    // Strip sensitive fields
    const sanitizedUserData = { ...userData };
    const piiFields = ["email", "em", "phone", "ph", "firstName", "fn", "lastName", "surname", "ln"];
    piiFields.forEach(field => {
      if (sanitizedUserData[field]) sanitizedUserData[field] = "[MASKED]";
    });
    console.log("[Meta CAPI Debug] Raw User Data (before hashing - MASKED):\n", JSON.stringify(sanitizedUserData, null, 2));
    
    // Mask details in the dispatched payload log
    const sanitizedPayload = JSON.parse(JSON.stringify(payload));
    if (sanitizedPayload.data?.[0]?.user_data) {
      const uData = sanitizedPayload.data[0].user_data;
      const hashedFields = ["em", "ph", "fn", "ln"];
      hashedFields.forEach(field => {
        if (uData[field]) uData[field] = ["[MASKED_HASH]"];
      });
    }
    // console.log("[Meta CAPI] Dispatch Payload (MASKED):\n", JSON.stringify(sanitizedPayload, null, 2));
  }

  const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;

  let attempts = 2; // Retry once if it fails (total 2 attempts)
  let lastError = null;

  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) {
        lastError = result?.error?.message || "Meta API returned error";
        // console.warn(`[Meta CAPI] Attempt ${i + 1} failed:`, result);
        continue;
      }
      // console.log(`[Meta CAPI] Event "${eventName}" sent successfully for eventId: ${eventId}`);
      return { success: true, data: result };
    } catch (error) {
      lastError = error.message;
      // console.warn(`[Meta CAPI] Attempt ${i + 1} fetch error:`, error);
    }
  }

  // If we reach here, all attempts failed
  logTrackingFailure(eventName, eventId, lastError, payload);
  return { success: false, error: lastError };
}
