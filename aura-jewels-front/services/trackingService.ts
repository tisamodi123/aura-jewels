import callApi from "@/lib/commonApi";
import { ENDPOINTS } from "@/lib/Api_Url";
import { getUser } from "@/services/clientCookies";
import { useGlobleStore } from "@/store/globleStore";

/**
 * Reads a cookie by name.
 * Helper to read Meta's `_fbp` and `_fbc` cookies.
 */
export const getCookie = (name: string): string | undefined => {
    if (typeof document === "undefined") return undefined;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return undefined;
};

/**
 * Generate a unique event ID (UUID v4 style) for client-server event deduplication.
 * @returns {string}
 */
export const generateEventId = (): string => {
    if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
    }
    // Fallback if randomUUID is not supported (e.g. non-HTTPS dev environments)
    return 'ev_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
};

/**
 * Generates an anonymous ID for guest users on first visit.
 * Stores it in localStorage + a 2-year cookie (`Aura Jewels_anon_id`).
 * Reused as `external_id` for anyone not logged in.
 */
export const getOrCreateAnonymousId = (): string => {
    if (typeof window === "undefined") return "";
    const COOKIE_NAME = "aura_anon_id";
    let anonId: string | null = null;

    try {
        anonId = localStorage.getItem(COOKIE_NAME);
    } catch (e) {
        // localStorage might be disabled or blocked
    }

    if (!anonId) {
        anonId = getCookie(COOKIE_NAME) || null;
    }

    if (!anonId) {
        anonId = generateEventId();
        try {
            localStorage.setItem(COOKIE_NAME, anonId);
        } catch (e) {}
        
        const expires = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `${COOKIE_NAME}=${encodeURIComponent(anonId)}; expires=${expires}; path=/; SameSite=Lax`;
    } else {
        // Keep localStorage and cookie in sync
        try {
            localStorage.setItem(COOKIE_NAME, anonId);
        } catch (e) {}
        const expires = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `${COOKIE_NAME}=${encodeURIComponent(anonId)}; expires=${expires}; path=/; SameSite=Lax`;
    }

    return anonId;
};

/**
 * Helper to normalize country codes to 2-letter ISO alpha-2 uppercase codes (e.g., "India" -> "IN").
 */
const normalizeCountryCode = (countryStr?: string): string | undefined => {
    if (!countryStr) return undefined;
    const clean = countryStr.trim().toUpperCase();
    if (clean === "INDIA" || clean === "IN") return "IN";
    if (clean.length === 2) return clean;
    return countryStr;
};

/**
 * Helper to get Meta Test Event Code safely for QA testing.
 * Checks URL parameter `test_event_code`, sessionStorage, and env var.
 */
const getTestEventCode = (): string | undefined => {
    if (typeof window !== "undefined") {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const urlTestCode = urlParams.get("test_event_code") || urlParams.get("test_code");
            if (urlTestCode) {
                sessionStorage.setItem("fb_test_event_code", urlTestCode);
                return urlTestCode;
            }
            const sessionTestCode = sessionStorage.getItem("fb_test_event_code");
            if (sessionTestCode) return sessionTestCode;
        } catch (e) {}
    }
    if (process.env.NEXT_PUBLIC_FB_TEST_EVENT_CODE) {
        return process.env.NEXT_PUBLIC_FB_TEST_EVENT_CODE;
    }
    return undefined;
};

/**
 * Get normalized user data from cookies/browser for Meta attribution matching.
 * Includes userAgent, fbp, fbc, and guest externalId fallback.
 */
export const getNormalizedUserData = () => {
    const user = getUser();
    const sourceUrl = typeof window !== "undefined" ? window.location.href : undefined;
    const userAgent = typeof window !== "undefined" && typeof navigator !== "undefined" ? navigator.userAgent : undefined;
    const globalCountry = typeof window !== "undefined" ? useGlobleStore.getState().country : undefined;
    const fbp = getCookie("_fbp");
    const fbc = getCookie("_fbc");
    const externalId = user?.externalId || (user && (user._id || user.id)) || getOrCreateAnonymousId();

    const rawCountry = user?.country || globalCountry;

    return {
        email: user?.email || undefined,
        phone: user?.phone || undefined,
        firstName: user?.firstName || user?.name || undefined,
        lastName: user?.lastName || undefined,
        city: user?.city || undefined,
        state: user?.state || undefined,
        zip: user?.zipCode || user?.pincode || undefined,
        country: normalizeCountryCode(rawCountry),
        gender: user?.gender || undefined,
        dateOfBirth: user?.dateOfBirth || user?.dob || undefined,
        externalId: externalId || undefined,
        sourceUrl,
        userAgent,
        fbp,
        fbc,
    };
};

/**
 * Helper to execute client-side Facebook Pixel events.
 */
const firePixel = (eventName: string, customData: any, eventId: string) => {
    if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", eventName, customData, { eventID: eventId });
    }
};

export interface ProductTrackingParams {
    id?: string;
    _id?: string;
    itemCode?: string;
    sku?: string;
    productCode?: string;
    title: string;
    productTitle?: string;
    price: number;
    finalPrice?: number;
    currency?: string;
    category?: string;
}

export interface AddToCartTrackingParams extends ProductTrackingParams {
    qty?: number;
}

/**
 * Helper to resolve product identifier, prioritizing SKU/itemCode over DB _id for Meta Catalog matching.
 */
const resolveProductId = (product: any): string => {
    if (!product) return "";
    return product.itemCode || product.sku || product.productCode || product.id || product._id || "";
};

/**
 * Tracks the ViewContent event (user views a product).
 */
export const trackViewContent = async (product: ProductTrackingParams) => {
    try {
        console.log("[TrackingService] trackViewContent called for product:", product);
        const eventId = generateEventId();
        const pId = resolveProductId(product);
        const pTitle = product.title || product.productTitle || "";
        const pPrice = product.finalPrice !== undefined ? product.finalPrice : (product.price || 0);
        const pCurrency = product.currency || "INR";
        const pCategory = product.category;

        const roundedPrice = Math.round(pPrice);

        const customData: Record<string, any> = {
            content_ids: [pId],
            content_type: "product",
            content_name: pTitle,
            value: roundedPrice,
            currency: pCurrency
        };
        if (pCategory) {
            customData.content_category = pCategory;
        }

        // 1. Fire browser pixel
        firePixel("ViewContent", customData, eventId);

        // 2. Call conversions API on backend
        await callApi(ENDPOINTS.TRACK.VIEW_CONTENT, "POST", {
            eventId,
            product: {
                id: pId,
                title: pTitle,
                price: roundedPrice,
                currency: pCurrency,
                category: pCategory
            },
            customData,
            testEventCode: getTestEventCode(),
            userData: getNormalizedUserData()
        });
    } catch (err) {
        console.error("[Tracking] ViewContent error:", err instanceof Error ? err.message : "Unknown error");
    }
};

/**
 * Tracks the AddToCart event.
 */
export const trackAddToCart = async (product: AddToCartTrackingParams) => {
    try {
        const eventId = generateEventId();
        const pId = resolveProductId(product);
        const pTitle = product.title || product.productTitle || "";
        const pPrice = product.finalPrice !== undefined ? product.finalPrice : (product.price || 0);
        const qty = product.qty || 1;
        const pCurrency = product.currency || "INR";
        const pCategory = product.category;

        const totalVal = Math.round(pPrice * qty);

        const customData: Record<string, any> = {
            content_ids: [pId],
            content_type: "product",
            content_name: pTitle,
            value: totalVal,
            currency: pCurrency,
            contents: [{ id: pId, quantity: qty }]
        };
        if (pCategory) {
            customData.content_category = pCategory;
        }
3
        // 1. Fire browser pixel
        firePixel("AddToCart", customData, eventId);

        // 2. Call conversions API on backend
        await callApi(ENDPOINTS.TRACK.GENERIC, "POST", {
            eventName: "AddToCart",
            eventId,
            customData: {
                ...customData,
                value: String(totalVal)
            },
            testEventCode: getTestEventCode(),
            userData: getNormalizedUserData()
        });
    } catch (err) {
        console.error("[Tracking] AddToCart error:", err instanceof Error ? err.message : "Unknown error");
    }
};

/**
 * Tracks the AddToWishlist event.
 */
export const trackAddToWishlist = async (product: ProductTrackingParams) => {
    try {
        const eventId = generateEventId();
        const pId = resolveProductId(product);
        const pTitle = product.title || product.productTitle || "";
        const pPrice = product.finalPrice !== undefined ? product.finalPrice : (product.price || 0);
        const pCurrency = product.currency || "INR";
        const pCategory = product.category;

        const roundedPrice = Math.round(pPrice);

        const customData: Record<string, any> = {
            content_ids: [pId],
            content_type: "product",
            content_name: pTitle,
            value: roundedPrice,
            currency: pCurrency
        };
        if (pCategory) {
            customData.content_category = pCategory;
        }

        // 1. Fire browser pixel
        firePixel("AddToWishlist", customData, eventId);

        // 2. Call conversions API on backend
        await callApi(ENDPOINTS.TRACK.GENERIC, "POST", {
            eventName: "AddToWishlist",
            eventId,
            customData: {
                ...customData,
                value: String(roundedPrice)
            },
            testEventCode: getTestEventCode(),
            userData: getNormalizedUserData()
        });
    } catch (err) {
        console.error("[Tracking] AddToWishlist error:", err instanceof Error ? err.message : "Unknown error");
    }
};

/**
 * Tracks the InitiateCheckout event.
 */
export const trackInitiateCheckout = async (cartItems: any[], totalAmount: number, currency: string = "INR") => {
    try {
        const eventId = generateEventId();
        const contentIds = cartItems.map(item => resolveProductId(item)).filter(Boolean);
        const contents = cartItems.map(item => ({
            id: resolveProductId(item),
            quantity: Number(item.qty || item.quantity) || 1
        }));
        const numItems = cartItems.reduce((acc, item) => acc + (Number(item.qty || item.quantity) || 1), 0);

        const roundedTotal = Math.round(totalAmount);
        
        const customData: Record<string, any> = {
            content_ids: contentIds,
            content_type: "product",
            value: roundedTotal,
            currency: currency,
            contents: contents,
            num_items: numItems
        };

        // 1. Fire browser pixel
        firePixel("InitiateCheckout", customData, eventId);

        // 2. Call conversions API on backend
        await callApi(ENDPOINTS.TRACK.GENERIC, "POST", {
            eventName: "InitiateCheckout",
            eventId,
            customData: {
                ...customData,
                value: String(roundedTotal)
            },
            testEventCode: getTestEventCode(),
            userData: getNormalizedUserData()
        });
    } catch (err) {
        console.error("[Tracking] InitiateCheckout error:", err instanceof Error ? err.message : "Unknown error");
    }
};

/**
 * Tracks the Contact event (clicking phone calls or contact links).
 */
export const trackContact = async (page: string = "contact_via_phone") => {
    try {
        const eventId = generateEventId();
        const contentName = page.toLowerCase().includes("whatsapp") ? "contact_via_whatsapp" : "contact_via_phone";
        const channel = page.toLowerCase().includes("whatsapp") ? "whatsapp" : "phone";

        const customData = {
            content_name: contentName,
            channel: channel,
            button_location: page
        };

        // 1. Fire browser pixel standard Contact event
        firePixel("Contact", customData, eventId);

        // 2. Call conversions API on backend
        await callApi(ENDPOINTS.TRACK.CONTACT, "POST", {
            eventId,
            eventName: "Contact",
            page: contentName,
            channel,
            buttonLocation: page,
            customData,
            testEventCode: getTestEventCode(),
            userData: getNormalizedUserData()
        });
    } catch (err) {
        console.error("[Tracking] Contact error:", err instanceof Error ? err.message : "Unknown error");
    }
};

/**
 * Tracks Phone call clicks as standard Meta Contact event (contact_via_phone).
 */
export const trackPhoneClick = async (buttonLocation: string = "Unknown") => {
    try {
        const eventId = generateEventId();
        const customData = {
            content_name: "contact_via_phone",
            channel: "phone",
            button_location: buttonLocation
        };

        // 1. Fire browser pixel standard Contact event
        firePixel("Contact", customData, eventId);

        // 2. Call conversions API on backend
        await callApi(ENDPOINTS.TRACK.CONTACT, "POST", {
            eventId,
            eventName: "Contact",
            page: "contact_via_phone",
            channel: "phone",
            buttonLocation,
            customData,
            testEventCode: getTestEventCode(),
            userData: getNormalizedUserData()
        });
    } catch (err) {
        console.error("[Tracking] Phone click error:", err instanceof Error ? err.message : "Unknown error");
    }
};

/**
 * Tracks the LeadSubmitted event (filling out an inquiry or registration form).
 * @param formData Form values
 * @param messagingChannel Channel used (default "website_form")
 * @param pageId Optional Facebook Page ID (defaults to NEXT_PUBLIC_FB_PAGE_ID env var if not passed)
 */
export const trackLeadSubmitted = async (
    formData: { email?: string; phone?: string; name?: string; firstName?: string; lastName?: string },
    messagingChannel: string = "website_form",
    pageId?: string,
    contentName: string = "Lead Form Submission"
) => {
    try {
        const eventId = generateEventId();
        const envPageId = typeof process !== "undefined" ? process.env?.NEXT_PUBLIC_FB_PAGE_ID : undefined;
        const effectivePageId = pageId || envPageId;

        const customData: Record<string, any> = {
            content_name: contentName,
            messaging_channel: messagingChannel
        };
        if (effectivePageId) {
            customData.page_id = effectivePageId;
        }

        // 1. Fire browser pixel
        firePixel("Lead", customData, eventId);

        // 2. Call conversions API on backend
        await callApi(ENDPOINTS.TRACK.LEAD_SUBMITTED, "POST", {
            eventId,
            formData,
            messagingChannel,
            pageId: effectivePageId,
            contentName,
            testEventCode: getTestEventCode(),
            userData: getNormalizedUserData()
        });
    } catch (err) {
        console.error("[Tracking] LeadSubmitted error:", err instanceof Error ? err.message : "Unknown error");
    }
};

/**
 * Tracks WhatsApp clicks as standard Meta Contact event (contact_via_whatsapp).
 * @param buttonLocation Location tag (e.g. "Header", "Floating Widget", "Product Page", "Footer")
 * @param product Optional product details if clicked from a product page
 */
export const trackWhatsAppClick = async (
    buttonLocation: string = "Unknown",
    product?: ProductTrackingParams
) => {
    try {
        const eventId = generateEventId();
        const pId = product ? resolveProductId(product) : undefined;
        const pTitle = product?.title || product?.productTitle;
        const pPrice = product ? (product.finalPrice !== undefined ? product.finalPrice : product.price) : undefined;

        const customData: Record<string, any> = {
            content_name: "contact_via_whatsapp",
            channel: "whatsapp",
            button_location: buttonLocation,
            currency: "INR"
        };
        if (pId) {
            customData.content_ids = [pId];
        }
        if (pTitle) {
            customData.product_title = pTitle;
        }
        if (pPrice !== undefined && pPrice > 0) {
            customData.value = Math.round(pPrice);
        }

        // 1. Fire browser pixel standard Contact event
        firePixel("Contact", customData, eventId);

        // 2. Call conversions API on backend
        await callApi(ENDPOINTS.TRACK.CONTACT, "POST", {
            eventId,
            eventName: "Contact",
            page: "contact_via_whatsapp",
            channel: "whatsapp",
            buttonLocation,
            customData,
            testEventCode: getTestEventCode(),
            userData: getNormalizedUserData()
        });
    } catch (err) {
        console.error("[Tracking] WhatsApp click error:", err instanceof Error ? err.message : "Unknown error");
    }
};

/**
 * Tracks the Purchase event on the BROWSER ONLY (deduplicated against the server).
 * IMPORTANT: Do NOT call the Conversions API endpoint from the frontend here,
 * since the backend automatically sends the Purchase event when the payment is confirmed.
 */
export const trackPurchaseOnBrowser = (order: { orderId: string; items: any[]; total: number; currency?: string; displayCurrency?: string }) => {
    try {
        const currency = order.displayCurrency || order.currency || "INR";
        const contentIds = (order.items || []).map(item => resolveProductId(item)).filter(Boolean);
        const contents = (order.items || []).map(item => ({
            id: resolveProductId(item),
            quantity: Number(item.qty || item.quantity) || 1
        }));
        const numItems = (order.items || []).reduce((acc, item) => acc + (Number(item.qty || item.quantity) || 1), 0);

        // Fire browser pixel using the orderId from the backend as the deduplication key (eventID)
        firePixel("Purchase", {
            content_ids: contentIds,
            content_type: "product",
            value: order.total,
            currency: currency,
            contents: contents,
            num_items: numItems
        }, order.orderId);

        console.log(`[Tracking] Purchase event reported to browser for orderId: ${order.orderId}`);
    } catch (err) {
        console.error("[Tracking] trackPurchaseOnBrowser error:", err instanceof Error ? err.message : "Unknown error");
    }
};

/**
 * Tracks the AddPaymentInfo event.
 */
export const trackAddPaymentInfo = async (paymentDetails?: { value?: number; currency?: string }) => {
    try {
        const eventId = generateEventId();
        const value = paymentDetails?.value || 0;
        const currency = paymentDetails?.currency || "INR";

        // 1. Fire browser pixel
        firePixel("AddPaymentInfo", {
            value,
            currency
        }, eventId);

        // 2. Call conversions API on backend
        await callApi(ENDPOINTS.TRACK.GENERIC, "POST", {
            eventName: "AddPaymentInfo",
            eventId,
            customData: {
                value: String(value),
                currency
            },
            testEventCode: getTestEventCode(),
            userData: getNormalizedUserData()
        });
    } catch (err) {
        console.error("[Tracking] AddPaymentInfo error:", err instanceof Error ? err.message : "Unknown error");
    }
};

/**
 * Tracks the PageView event.
 */
export const trackPageView = async () => {
    try {
        console.log("[TrackingService] trackPageView called on:", typeof window !== "undefined" ? window.location.href : "");
        const eventId = generateEventId();

        // 1. Fire browser pixel
        if (typeof window !== "undefined" && (window as any).fbq) {
            (window as any).fbq("track", "PageView", {}, { eventID: eventId });
        }

        // 2. Call conversions API on backend
        await callApi(ENDPOINTS.TRACK.GENERIC, "POST", {
            eventName: "PageView",
            eventId,
            testEventCode: getTestEventCode(),
            userData: getNormalizedUserData()
        });
    } catch (err) {
        console.error("[Tracking] PageView error:", err instanceof Error ? err.message : "Unknown error");
    }
};
