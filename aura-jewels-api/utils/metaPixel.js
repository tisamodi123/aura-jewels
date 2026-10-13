import crypto from "crypto";
import Order from "../models/order.model.js";

/**
 * Normalizes and hashes a value using SHA-256, as required by Meta.
 * If the value is already a 64-character SHA-256 hex string, it is returned as-is.
 */
export const hashSHA256 = (str) => {
    if (!str) return null;
    const cleanStr = String(str).trim().toLowerCase();
    if (/^[a-f0-9]{64}$/i.test(cleanStr)) {
        return cleanStr;
    }
    return crypto.createHash("sha256").update(cleanStr).digest("hex");
};

/**
 * Normalizes a phone number to digits only.
 * If it's a 10-digit number, prepends "91" (default storefront country code).
 */
const cleanPhone = (phone) => {
    if (!phone) return "";
    let p = String(phone).replace(/\D/g, "");
    if (p.length === 10) {
        p = "91" + p;
    }
    return p;
};

/**
 * Maps common country names to 2-letter ISO 3166-1 alpha-2 codes.
 */
const mapCountryCode = (country) => {
    if (!country) return "";
    const c = country.trim().toLowerCase();
    if (c === "india" || c === "ind") return "in";
    if (c === "united states" || c === "us" || c === "usa") return "us";
    if (c === "united kingdom" || c === "uk" || c === "gb" || c === "great britain") return "gb";
    if (c === "canada" || c === "ca") return "ca";
    if (c === "australia" || c === "au") return "au";
    if (c === "united arab emirates" || c === "uae" || c === "ae") return "ae";
    if (c.length === 2) return c;
    return c.substring(0, 2);
};

/**
 * Sends an event to Meta Conversions API.
 */
export const sendMetaConversionEvent = async (eventName, userData = {}, customData = {}, eventId = null) => {
    const pixelId = process.env.META_PIXEL_ID;
    const accessToken = process.env.META_CONVERSION_API_ACCESS_TOKEN;

    if (!pixelId || !accessToken) {
        console.warn("Meta Pixel: META_PIXEL_ID or META_CONVERSION_API_ACCESS_TOKEN is missing in env. Skipping event dispatch.");
        return { success: false, reason: "missing_credentials" };
    }

    const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`;

    const eventPayload = {
        data: [
            {
                event_name: eventName,
                event_time: Math.floor(Date.now() / 1000),
                action_source: "website",
                event_source_url: process.env.STOREFRONT_URL || "https://aurajewels.com",
                user_data: userData,
                custom_data: customData,
                ...(eventId && { event_id: eventId }),
            }
        ]
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(eventPayload)
        });
        const result = await response.json();
        if (result.error) {
            console.error("Meta Pixel API Error:", result.error);
            return { success: false, error: result.error };
        }
        return { success: true, result };
    } catch (err) {
        console.error("Meta Pixel Request Failure:", err.message);
        return { success: false, error: err.message };
    }
};

/**
 * Formats order data and triggers a Meta Conversions API "Purchase" event.
 */
export const trackOrderPurchase = async (orderId) => {
    try {
        const order = await Order.findById(orderId).populate("items").populate("user");
        if (!order) {
            console.error(`Meta Pixel tracking: Order ${orderId} not found.`);
            return;
        }

        const shipping = order.shippingAddress || {};
        const email = shipping.email || order.user?.email;
        const phone = shipping.phone || order.user?.phone;
        const firstName = shipping.firstName || order.user?.firstName || order.user?.name?.split(" ")[0];
        const lastName = shipping.lastName || order.user?.lastName || order.user?.name?.split(" ").slice(1).join(" ");
        const city = shipping.city;
        const state = shipping.state;
        const country = shipping.country;
        const zipCode = shipping.zipCode;

        // Construct user data using Meta's hashing standards
        const userData = {
            em: email ? [hashSHA256(email)] : [],
            ph: phone ? [hashSHA256(cleanPhone(phone))] : [],
            fn: firstName ? [hashSHA256(firstName)] : [],
            ln: lastName ? [hashSHA256(lastName)] : [],
            ct: city ? [hashSHA256(city)] : [],
            st: state ? [hashSHA256(state)] : [],
            zp: zipCode ? [hashSHA256(zipCode)] : [],
            country: country ? [hashSHA256(mapCountryCode(country))] : [],
        };

        if (order.creatorIp) {
            userData.client_ip_address = order.creatorIp;
        }

        // Construct custom data for e-commerce purchase event
        const value = order.paidAmount != null ? order.paidAmount : order.total;
        const currency = order.displayCurrency || "INR";

        const contents = (order.items || []).map(item => {
            const qty = Number(item.productDetails?.qty) || Number(item.qty) || 1;
            const price = Number(item.price) || 0;
            // Convert item unit price to the order's display currency
            const displayPrice = currency === "INR"
                ? price
                : Number((price / (order.exchangeRate || 1)).toFixed(2));

            return {
                id: String(item.productId || item._id),
                quantity: qty,
                item_price: displayPrice
            };
        });

        const contentIds = (order.items || []).map(item => String(item.productId || item._id));

        const customData = {
            currency,
            value: String(value),
            content_type: "product",
            contents,
            content_ids: contentIds
        };

        // Deduplication event ID is mapped to the public orderId (or fallback to _id)
        const eventId = order.orderId || String(order._id);

        const res = await sendMetaConversionEvent("Purchase", userData, customData, eventId);
        if (res.success) {
            console.log(`Meta Pixel Purchase tracking successful for Order ID: ${eventId}`);
        } else {
            console.error(`Meta Pixel Purchase tracking failed for Order ID: ${eventId}. Reason:`, res.error || res.reason);
        }
    } catch (err) {
        console.error(`Error during Meta Pixel Purchase tracking execution for order ${orderId}:`, err.message);
    }
};
