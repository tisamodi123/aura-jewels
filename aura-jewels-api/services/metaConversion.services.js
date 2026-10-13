import mongoose from "mongoose";
import { sendConversionEvent } from "../utils/metaConversionsApi.js";

/**
 * Send conversion events to the Meta Conversions API for a successful purchase.
 * @param {Object} order - The populated Mongoose order document
 * @param {string} [actionSource="website"] - The source of the event (e.g. 'website', 'system_generated')
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const sendMetaPurchaseEvent = async (order, actionSource = "website") => {
    try {
        const Order = mongoose.model("Order");
        const dbOrder = await Order.findById(order._id);
        if (!dbOrder) {
            // console.warn(`[Meta CAPI] Order ${order.orderId || order._id} not found in database. Skipping purchase event.`);
            return { success: false, error: "Order not found" };
        }

        if (dbOrder.metaEventSent) {
            // console.log(`[Meta CAPI] Purchase event already successfully sent for order ${dbOrder.orderId || dbOrder._id}. Skipping.`);
            return { success: true, message: "Already sent" };
        }

        // Ensure order items are populated for custom_data contents
        if (order.populate && order.items && order.items.length > 0 && !order.items[0].productDetails) {
            await order.populate("items");
        }

        // Prepare line item details if items are populated, enriching with DB details
        const contents = [];
        let totalValue = 0;
        let mainCategory = "";
        let mainDiamondShape = "";
        let mainDiamondColor = "";
        let mainDiamondClarity = "";
        let mainDiamondOrigin = "";

        if (Array.isArray(order.items)) {
            const ProductMaster = mongoose.model("ProductMaster");
            const ProductStone = mongoose.model("ProductStone");
            const Parameter = mongoose.model("Parameter");

            for (const item of order.items) {
                if (item) {
                    const productId = item.jewelleryId?.toString() || item.productId?.toString();
                    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
                        const dbProduct = await ProductMaster.findOne({ _id: productId, isDeleted: 0 })
                            .populate("categoryId")
                            .lean();

                        if (dbProduct) {
                            const stones = await ProductStone.find({ productId: dbProduct._id, status: "ACTIVE" }).lean();

                            let diamondShapes = "";
                            const shapeIds = stones.map(s => s.shape).filter(Boolean);
                            if (shapeIds.length > 0) {
                                const shapes = await Parameter.find({ _id: { $in: shapeIds } }).lean();
                                const shapeMap = {};
                                shapes.forEach(s => {
                                    shapeMap[s._id.toString()] = s.name || s.code || "";
                                });
                                const shapesList = stones.map(s => s.shape && shapeMap[s.shape.toString()]).filter(Boolean);
                                diamondShapes = Array.from(new Set(shapesList)).join(", ");
                            }

                            const diamondColors = Array.from(new Set(stones.map(s => s.color).filter(Boolean))).join(", ");
                            const diamondClarities = Array.from(new Set(stones.map(s => s.clarity).filter(Boolean))).join(", ");
                            const diamondOrigins = Array.from(new Set(stones.map(s => s.origin).filter(Boolean))).join(", ");

                            const price = Number(item.price) || dbProduct.discountedPrice || dbProduct.finalPrice || 0;
                            const qty = Number(item.qty || item.productDetails?.qty || item.quantity) || 1;
                            totalValue += price * qty;

                            contents.push({
                                id: dbProduct._id.toString(),
                                quantity: qty,
                                item_price: price
                            });

                            if (!mainCategory) {
                                mainCategory = dbProduct.categoryId?.categoryName || "";
                                mainDiamondShape = diamondShapes;
                                mainDiamondColor = diamondColors;
                                mainDiamondClarity = diamondClarities;
                                mainDiamondOrigin = diamondOrigins;
                            }
                        }
                    } else {
                        // Fallback if item does not have a valid jewelleryId object
                        const rawId = item.jewelleryId?.toString() || item.productId?.toString() || item.productDetails?.itemCode || "";
                        if (rawId) {
                            contents.push({
                                id: rawId,
                                quantity: Number(item.qty || item.productDetails?.qty || item.quantity) || 1,
                                item_price: Number(item.price) || 0
                            });
                        }
                    }
                }
            }
        }

        const userData = {
            email: order.shippingAddress?.email || "",
            phone: order.shippingAddress?.phone || "",
            firstName: order.shippingAddress?.firstName || "",
            lastName: order.shippingAddress?.lastName || "",
            city: order.shippingAddress?.city || "",
            state: order.shippingAddress?.state || "",
            zip: order.shippingAddress?.zipCode || order.shippingAddress?.zip || "",
            country: order.shippingAddress?.country || "",
            clientIpAddress: order.creatorIp || undefined,
            clientUserAgent: order.userAgent || order.clientUserAgent || undefined,
            fbc: order.fbc || undefined,
            fbp: order.fbp || undefined,
            externalId: order.externalId || order.external_id || order.user?.toString() || undefined,
        };

        const contentIds = contents.map(c => c.id).filter(Boolean);
        const numItems = contents.reduce((sum, item) => sum + item.quantity, 0);

        const customData = {
            currency: order.displayCurrency || order.baseCurrency || "INR",
            value: String(totalValue || order.total || 0),
            contents: contents,
            content_ids: contentIds,
            num_items: numItems,
            content_type: "product",
            content_category: mainCategory || undefined,
            category: mainCategory || undefined,
            diamond_shape: mainDiamondShape || undefined,
            diamond_color: mainDiamondColor || undefined,
            diamond_clarity: mainDiamondClarity || undefined,
            diamond_origin: mainDiamondOrigin || undefined
        };

        // Determine event_time safely bounded by 7 days to avoid Meta batch rejection
        let eventTime = Math.floor(new Date(order.createdAt || Date.now()).getTime() / 1000);
        const sevenDaysAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60) + 60; // 7 days ago plus 1 minute safety buffer
        if (eventTime < sevenDaysAgo) {
            eventTime = Math.floor(Date.now() / 1000); // Fallback to current time if older than 7 days
        }

        const result = await sendConversionEvent({
            eventName: "Purchase",
            eventId: order.orderId, // Crucial for deduplicating with browser Pixel events
            eventTime,
            userData,
            customData,
            req: null, // Called in background, rely on userData fallbacks
            actionSource
        });

        if (!result.success) {
            // console.error(`[Meta CAPI] Error sending purchase event for order ${order.orderId}:`, result.error);
            return { success: false, error: result.error };
        }

        // Mark event as sent in the database
        await Order.updateOne({ _id: order._id }, { $set: { metaEventSent: true } });

        // console.log(`[Meta CAPI] Success: Sent purchase event for order ${order.orderId}`);
        return { success: true, data: result.data };
    } catch (err) {
        // console.error("[Meta CAPI] Exception during event dispatch:", err);
        return { success: false, error: err.message };
    }
};
