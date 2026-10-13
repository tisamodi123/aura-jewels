import mongoose from "mongoose";
import { sendConversionEvent } from "../../utils/metaConversionsApi.js";
import { STATUS_CODE } from "../../constants/statusCode.constant.js";
import { MESSAGES } from "../../constants/messages.constant.js";

const IS_DEBUG = process.env.DEBUG === "true" || process.env.NODE_ENV === "development";

const sanitizeRequestBody = (body) => {
    if (!body) return body;
    try {
        const sanitized = JSON.parse(JSON.stringify(body));
        if (sanitized.userData) {
            const piiFields = ["email", "em", "phone", "ph", "firstName", "fn", "lastName", "surname", "ln"];
            piiFields.forEach(field => {
                if (sanitized.userData[field]) sanitized.userData[field] = "[MASKED]";
            });
        }
        if (sanitized.formData) {
            const piiFields = ["email", "phone", "name", "firstName", "lastName"];
            piiFields.forEach(field => {
                if (sanitized.formData[field]) sanitized.formData[field] = "[MASKED]";
            });
        }
        return sanitized;
    } catch (e) {
        return { error: "Failed to sanitize log payload" };
    }
};

/**
 * Resolves a product's full details (including category and diamond information) from the database and URL.
 * @param {string} productId
 * @param {string} sourceUrl
 * @returns {Promise<Object|null>}
 */
const getEnrichedProductDetails = async (productId, sourceUrl) => {
    if (!productId) return null;
    try {
        const ProductMaster = mongoose.model("ProductMaster");
        let query;
        if (mongoose.Types.ObjectId.isValid(productId)) {
            query = { _id: productId, isDeleted: 0 };
        } else {
            query = { itemCode: productId.toString().trim(), isDeleted: 0 };
        }

        const dbProduct = await ProductMaster.findOne(query)
            .populate("categoryId")
            .lean();

        if (!dbProduct) return null;

        // Fetch stones details
        const ProductStone = mongoose.model("ProductStone");
        const stones = await ProductStone.find({ productId: dbProduct._id, status: "ACTIVE" }).lean();

        // Fetch shapes
        let diamondShapes = "";
        const shapeIds = stones.map(s => s.shape).filter(Boolean);
        if (shapeIds.length > 0) {
            const Parameter = mongoose.model("Parameter");
            const shapes = await Parameter.find({ _id: { $in: shapeIds } }).lean();
            const shapeMap = {};
            shapes.forEach(s => {
                shapeMap[s._id.toString()] = s.name || s.code || "";
            });
            const shapesList = stones.map(s => s.shape && shapeMap[s.shape.toString()]).filter(Boolean);
            diamondShapes = Array.from(new Set(shapesList)).join(", ");
        }

        const totalCarat = stones.reduce((sum, s) => sum + (s.totalCarat || s.weight || 0), 0);
        const diamondColors = Array.from(new Set(stones.map(s => s.color).filter(Boolean))).join(", ");
        const diamondClarities = Array.from(new Set(stones.map(s => s.clarity).filter(Boolean))).join(", ");
        const diamondOrigins = Array.from(new Set(stones.map(s => s.origin).filter(Boolean))).join(", ");

        // Parse selection overrides from source URL
        let selectedDiamondOrigin = diamondOrigins;
        let selectedStoneQuality = "";
        let selectedRingSize = "";

        if (sourceUrl) {
            try {
                const parsedUrl = new URL(sourceUrl);
                const urlOrigin = parsedUrl.searchParams.get("diamond_origin");
                const urlQuality = parsedUrl.searchParams.get("stone_quality");
                const urlRingSize = parsedUrl.searchParams.get("ringsize");

                if (urlOrigin) selectedDiamondOrigin = urlOrigin;
                if (urlQuality) selectedStoneQuality = urlQuality;
                if (urlRingSize) selectedRingSize = urlRingSize;
            } catch (err) {
                // Ignore URL parse errors
            }
        }

        return {
            id: dbProduct._id.toString(),
            title: dbProduct.productTitle || "",
            price: dbProduct.discountedPrice || dbProduct.finalPrice || 0,
            currency: "INR",
            category: dbProduct.categoryId?.categoryName || "",
            diamond_shape: diamondShapes,
            diamond_carat: totalCarat || undefined,
            diamond_color: diamondColors,
            diamond_clarity: diamondClarities,
            diamond_origin: selectedDiamondOrigin,
            stone_quality: selectedStoneQuality,
            ring_size: selectedRingSize,
            itemCode: dbProduct.itemCode || ""
        };
    } catch (err) {
        console.error("[Meta Track API] Error fetching product from DB:", err);
        return null;
    }
};

/**
 * Generic event tracker endpoint.
 * Accepts eventName, eventId, userData, and customData in request body.
 */
export const trackEvent = async (req, res) => {
    try {
        if (IS_DEBUG) {
            console.log("[Meta Track API] Received trackEvent call. req.body:", JSON.stringify(req.body, null, 2));
        } else {
            console.log("[Meta Track API] Received trackEvent call. req.body:", JSON.stringify(sanitizeRequestBody(req.body), null, 2));
        }
        const { eventName, eventId, userData = {}, customData = {}, testEventCode } = req.body;

        if (!eventName || !eventId) {
            return res.status(STATUS_CODE.BAD_REQUEST || 400).json({
                errorCode: STATUS_CODE.BAD_REQUEST || 400,
                message: "eventName and eventId are required."
            });
        }

        const fbc = userData.fbc || req.cookies?.["_fbc"] || undefined;
        const fbp = userData.fbp || req.cookies?.["_fbp"] || undefined;
        const userAgent = userData.userAgent || userData.clientUserAgent || userData.client_user_agent || req.headers["user-agent"] || undefined;
        const externalId = userData.externalId || userData.external_id || undefined;

        const enrichedUserData = {
            ...userData,
            fbc,
            fbp,
            userAgent,
            externalId
        };

        // Enrich customData if it contains product IDs (e.g. AddToCart, InitiateCheckout)
        let enrichedCustomData = { ...customData };
        if (customData && (customData.content_type === "product" || eventName === "AddToCart" || eventName === "InitiateCheckout" || eventName === "AddPaymentInfo")) {
            const contentIds = customData.content_ids || [];
            const contentsList = customData.contents || [];

            // Collect any valid IDs (ObjectIds or string SKUs/itemCodes)
            const productIds = new Set();
            contentIds.forEach(id => {
                if (id && typeof id === "string" && id.trim()) {
                    productIds.add(id.trim());
                }
            });
            contentsList.forEach(item => {
                if (item && item.id && typeof item.id === "string" && item.id.trim()) {
                    productIds.add(item.id.trim());
                }
            });

            if (productIds.size > 0) {
                const enrichedProducts = [];
                for (const id of Array.from(productIds)) {
                    const ep = await getEnrichedProductDetails(id, userData.sourceUrl || req.headers.referer);
                    if (ep) {
                        enrichedProducts.push(ep);
                    }
                }

                if (enrichedProducts.length > 0) {
                    const productMap = {};
                    enrichedProducts.forEach(p => {
                        productMap[p.id] = p;
                        if (p.itemCode) {
                            productMap[p.itemCode] = p;
                        }
                    });

                    // Set standard content category / content name for single item event
                    if (enrichedProducts.length === 1) {
                        if (!customData.content_name) {
                            enrichedCustomData.content_name = enrichedProducts[0].title;
                        }
                        enrichedCustomData.content_category = enrichedProducts[0].category;
                        enrichedCustomData.category = enrichedProducts[0].category;
                        enrichedCustomData.sku = enrichedProducts[0].itemCode || undefined;
                        enrichedCustomData.diamond_shape = enrichedProducts[0].diamond_shape || undefined;
                        enrichedCustomData.diamond_carat = enrichedProducts[0].diamond_carat || undefined;
                        enrichedCustomData.diamond_color = enrichedProducts[0].diamond_color || undefined;
                        enrichedCustomData.diamond_clarity = enrichedProducts[0].diamond_clarity || undefined;
                        enrichedCustomData.diamond_origin = enrichedProducts[0].diamond_origin || undefined;
                        enrichedCustomData.stone_quality = enrichedProducts[0].stone_quality || undefined;
                        enrichedCustomData.ring_size = enrichedProducts[0].ring_size || undefined;
                    }

                    let calculatedValue = 0;
                    const enrichedContents = contentsList.map(item => {
                        const dbP = productMap[item.id];
                        if (dbP) {
                            const price = dbP.price || 0;
                            calculatedValue += price * (Number(item.quantity) || 1);
                            return {
                                id: dbP.id,
                                sku: dbP.itemCode || undefined,
                                quantity: Number(item.quantity) || 1,
                                item_price: price
                            };
                        }
                        return item;
                    });

                    if (enrichedContents.length === 0) {
                        enrichedProducts.forEach(dbP => {
                            const price = dbP.price || 0;
                            calculatedValue += price;
                            enrichedContents.push({
                                id: dbP.id,
                                sku: dbP.itemCode || undefined,
                                quantity: 1,
                                item_price: price
                            });
                        });
                    }

                    enrichedCustomData.contents = enrichedContents;
                    enrichedCustomData.content_ids = enrichedProducts.map(p => p.id);
                    if (!customData.value || customData.value === "0") {
                        enrichedCustomData.value = String(calculatedValue);
                    }
                }
            }
        }

        const result = await sendConversionEvent({
            eventName,
            eventId,
            userData: enrichedUserData,
            customData: enrichedCustomData,
            req,
            testEventCode: testEventCode || req.body.testEventCode || req.body.test_event_code
        });

        if (!result.success) {
            return res.status(STATUS_CODE.BAD_REQUEST || 400).json({
                errorCode: STATUS_CODE.BAD_REQUEST || 400,
                message: result.error || "Failed to send tracking event to Meta"
            });
        }

        return res.status(STATUS_CODE.OK || 200).json({ success: true });
    } catch (error) {
        console.error("[Meta Track API] trackEvent error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR || 500).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR || 500,
            message: error?.message || MESSAGES?.COMMON?.INTERNAL_ERROR || "Internal Server Error"
        });
    }
};

/**
 * Dedicated endpoint for tracking product view-content events.
 */
export const trackViewContent = async (req, res) => {
    try {
        if (IS_DEBUG) {
            console.log("[Meta Track API] Received trackViewContent call. req.body:", JSON.stringify(req.body, null, 2));
        } else {
            console.log("[Meta Track API] Received trackViewContent call. req.body:", JSON.stringify(sanitizeRequestBody(req.body), null, 2));
        }
        const { eventId, product, userData = {}, testEventCode } = req.body;

        if (!eventId || !product) {
            return res.status(STATUS_CODE.BAD_REQUEST || 400).json({
                errorCode: STATUS_CODE.BAD_REQUEST || 400,
                message: "eventId and product details are required."
            });
        }

        // Fetch full product details from DB if only ID or partial product is passed
        const productId = typeof product === "string" ? product : (product.id || product._id);
        const productObj = await getEnrichedProductDetails(productId, userData.sourceUrl || req.headers.referer);

        if (!productObj) {
            return res.status(STATUS_CODE.BAD_REQUEST || 400).json({
                errorCode: STATUS_CODE.BAD_REQUEST || 400,
                message: "Invalid product ID or product could not be retrieved."
            });
        }

        const fbc = userData.fbc || req.cookies?.["_fbc"] || undefined;
        const fbp = userData.fbp || req.cookies?.["_fbp"] || undefined;
        const userAgent = userData.userAgent || userData.clientUserAgent || userData.client_user_agent || req.headers["user-agent"] || undefined;
        const externalId = userData.externalId || userData.external_id || undefined;

        const enrichedUserData = {
            ...userData,
            fbc,
            fbp,
            userAgent,
            externalId
        };

        const customData = {
            content_ids: [productObj.id],
            content_type: "product",
            content_name: productObj.title,
            value: String(productObj.price),
            currency: productObj.currency || "INR",
            content_category: productObj.category,
            category: productObj.category,
            sku: productObj.itemCode || undefined,
            diamond_shape: productObj.diamond_shape || undefined,
            diamond_carat: productObj.diamond_carat || undefined,
            diamond_color: productObj.diamond_color || undefined,
            diamond_clarity: productObj.diamond_clarity || undefined,
            diamond_origin: productObj.diamond_origin || undefined,
            stone_quality: productObj.stone_quality || undefined,
            ring_size: productObj.ring_size || undefined,
            contents: [
                {
                    id: productObj.id,
                    sku: productObj.itemCode || undefined,
                    quantity: 1,
                    item_price: Number(productObj.price)
                }
            ]
        };

        const result = await sendConversionEvent({
            eventName: "ViewContent",
            eventId,
            userData: enrichedUserData,
            customData,
            req,
            testEventCode: testEventCode || req.body.testEventCode || req.body.test_event_code
        });

        if (!result.success) {
            return res.status(STATUS_CODE.BAD_REQUEST || 400).json({
                errorCode: STATUS_CODE.BAD_REQUEST || 400,
                message: result.error
            });
        }

        return res.status(STATUS_CODE.OK || 200).json({ success: true });
    } catch (error) {
        console.error("[Meta Track API] trackViewContent error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR || 500).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR || 500,
            message: error?.message || MESSAGES?.COMMON?.INTERNAL_ERROR || "Internal Server Error"
        });
    }
};

/**
 * Dedicated endpoint for tracking contact events.
 */
export const trackContact = async (req, res) => {
    try {
        if (IS_DEBUG) {
            console.log("[Meta Track API] Received trackContact call. req.body:", JSON.stringify(req.body, null, 2));
        } else {
            console.log("[Meta Track API] Received trackContact call. req.body:", JSON.stringify(sanitizeRequestBody(req.body), null, 2));
        }
        const { eventId, page, userData = {}, testEventCode } = req.body;

        if (!eventId) {
            return res.status(STATUS_CODE.BAD_REQUEST || 400).json({
                errorCode: STATUS_CODE.BAD_REQUEST || 400,
                message: "eventId is required."
            });
        }

        const fbc = userData.fbc || req.cookies?.["_fbc"] || undefined;
        const fbp = userData.fbp || req.cookies?.["_fbp"] || undefined;
        const userAgent = userData.userAgent || userData.clientUserAgent || userData.client_user_agent || req.headers["user-agent"] || undefined;
        const externalId = userData.externalId || userData.external_id || undefined;

        const enrichedUserData = {
            ...userData,
            fbc,
            fbp,
            userAgent,
            externalId
        };

        const customData = {
            content_name: page || "Contact Button"
        };

        const result = await sendConversionEvent({
            eventName: "Contact",
            eventId,
            userData: enrichedUserData,
            customData,
            req,
            testEventCode: testEventCode || req.body.testEventCode || req.body.test_event_code
        });

        if (!result.success) {
            return res.status(STATUS_CODE.BAD_REQUEST || 400).json({
                errorCode: STATUS_CODE.BAD_REQUEST || 400,
                message: result.error
            });
        }

        return res.status(STATUS_CODE.OK || 200).json({ success: true });
    } catch (error) {
        console.error("[Meta Track API] trackContact error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR || 500).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR || 500,
            message: error?.message || MESSAGES?.COMMON?.INTERNAL_ERROR || "Internal Server Error"
        });
    }
};

/**
 * Dedicated endpoint for tracking lead-submitted events.
 */
export const trackLeadSubmitted = async (req, res) => {
    try {
        if (IS_DEBUG) {
            console.log("[Meta Track API] Received trackLeadSubmitted call. req.body:", JSON.stringify(req.body, null, 2));
        } else {
            console.log("[Meta Track API] Received trackLeadSubmitted call. req.body:", JSON.stringify(sanitizeRequestBody(req.body), null, 2));
        }
        const { eventId, formData = {}, userData = {}, messagingChannel, pageId, testEventCode } = req.body;

        if (!eventId) {
            return res.status(STATUS_CODE.BAD_REQUEST || 400).json({
                errorCode: STATUS_CODE.BAD_REQUEST || 400,
                message: "eventId is required."
            });
        }

        const fbc = userData.fbc || req.cookies?.["_fbc"] || undefined;
        const fbp = userData.fbp || req.cookies?.["_fbp"] || undefined;
        const userAgent = userData.userAgent || userData.clientUserAgent || userData.client_user_agent || req.headers["user-agent"] || undefined;
        const externalId = userData.externalId || userData.external_id || undefined;

        // Merge form details and tracking tokens into user data for better Meta matching
        const mergedUserData = {
            email: formData.email || userData.email || "",
            phone: formData.phone || userData.phone || "",
            firstName: formData.name || formData.firstName || userData.firstName || "",
            lastName: formData.lastName || userData.lastName || "",
            fbc,
            fbp,
            userAgent,
            externalId,
            ...userData
        };

        const customData = {
            messaging_channel: messagingChannel || "website_form",
            page_id: pageId || undefined
        };

        const result = await sendConversionEvent({
            eventName: "LeadSubmitted",
            eventId,
            userData: mergedUserData,
            customData,
            req,
            testEventCode: testEventCode || req.body.testEventCode || req.body.test_event_code
        });

        if (!result.success) {
            return res.status(STATUS_CODE.BAD_REQUEST || 400).json({
                errorCode: STATUS_CODE.BAD_REQUEST || 400,
                message: result.error
            });
        }

        return res.status(STATUS_CODE.OK || 200).json({ success: true });
    } catch (error) {
        console.error("[Meta Track API] trackLeadSubmitted error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR || 500).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR || 500,
            message: error?.message || MESSAGES?.COMMON?.INTERNAL_ERROR || "Internal Server Error"
        });
    }
};
