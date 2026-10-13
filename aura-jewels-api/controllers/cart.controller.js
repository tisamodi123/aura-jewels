import Cart from "../models/cart.model.js";
import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { purgeStaleCartItems } from "../services/cartCleanup.services.js";
import { purgeStaleWishlistItems } from "../services/wishlistCleanup.services.js";
import { calculateRingValue } from "../utils/calculateRingValue.js";
import { processWishlistReminders } from "../services/wishlistReminder.services.js";

/**
 * POST /dashboard/purge-stale-carts
 * Soft-deletes stale cart AND wishlist rows in one call.
 * Each collection is purged independently — separating them later means
 * splitting the two Promise.all entries into their own routes.
 * Pass ?dryRun=true to preview without writing anything.
 */
export const purgeCartItems = async (req, res) => {
    try {
        const dryRun = req.query.dryRun === "true";

        // Run both cleanups in parallel — fully independent.
        const [cartResult, wishlistResult] = await Promise.all([
            purgeStaleCartItems({ dryRun }),
            purgeStaleWishlistItems({ dryRun }),
        ]);

        const totalRemoved = (cartResult.removed || 0) + (wishlistResult.removed || 0);
        const totalWould = (cartResult.wouldRemove || 0) + (wishlistResult.wouldRemove || 0);

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: dryRun
                ? `Dry run: ${totalWould} stale item(s) would be removed (cart: ${cartResult.wouldRemove || 0}, wishlist: ${wishlistResult.wouldRemove || 0})`
                : `${totalRemoved} stale item(s) removed (cart: ${cartResult.removed}, wishlist: ${wishlistResult.removed})`,
            cart: cartResult,
            wishlist: wishlistResult,
        });
    } catch (error) {
        console.error("purgeCartItems error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || "Internal server error",
        });
    }
};

/**
 * Retrieve user cart items grouped by user.
 */
export const cartList = async (req, res) => {
    try {
        const carts = await Cart.find({
            isDeleted: 0,
            jeweleryId: { $exists: true, $ne: null },
        })
            .populate({
                path: "jeweleryId",
                populate: [
                    { path: "metalId" },
                    { path: "categoryId" },
                    { path: "defaultSize" }
                ]
            })
            .populate("sizeId")
            .populate("userId")
            .lean();

        const groups = {};
        for (const item of carts) {
            if (!item.userId) continue;
            if (!item.jeweleryId) continue;                  // hard-deleted — populate resolved to null
            if (item.jeweleryId.isDeleted !== 0) continue;   // soft-deleted product
            const uid = item.userId._id.toString();

            if (!groups[uid]) {
                groups[uid] = {
                    _id: uid,
                    totalItem: 0,
                    user_detail: {
                        name: item.userId.name || "",
                        email: item.userId.email || "",
                        phone: item.userId.phone || "",
                        phoneCountryCode: item.userId.phoneCountryCode || "",
                    },
                    jewellery: []
                };
            }

            groups[uid].totalItem += 1;

            const metal = item.jeweleryId?.metalId;
            const metalLabel = [metal?.stamp, metal?.type].filter(Boolean).join(" ") || "-";

            const activeSize = item.sizeId || item.jeweleryId?.defaultSize;
            const sizeLabel = activeSize?.name || activeSize?.code || "-";

            let itemPrice = item.lockedDisplayPrice || item.jeweleryId?.finalPrice || 0;
            if (activeSize && item.jeweleryId && item.jeweleryId.categoryId?.hasSize) {
                const calc = await calculateRingValue({ product: item.jeweleryId, size: activeSize });
                if (calc && calc.finalPrice) {
                    itemPrice = calc.finalPrice;
                }
            }

            groups[uid].jewellery.push({
                _id: item._id,
                itemCode: item.jeweleryId?.itemCode || "N/A",
                productTitle: item.jeweleryId?.productTitle || "N/A",
                metal: metalLabel,
                size: sizeLabel,
                qty: item.qty || 1,
                amount: itemPrice,
                checkoutCurrency: item.checkoutCurrency || "INR",
                // Stone selection (null = product default)
                origin: item.origin || null,
                color: item.color || null,
                clarity: item.clarity || null,
                // Engraving
                engraving: !!item.engraving,
                engravingText: item.engravingText || "",
                createdAt: item.createdAt,
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Cart list fetched successfully",
            data: Object.values(groups)
        });
    } catch (error) {
        console.error("cartList error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || "Internal server error"
        });
    }
};

/**
 * POST /dashboard/trigger-wishlist-reminders
 * Manually scans and sends pending wishlist reminders.
 */
export const triggerWishlistReminders = async (req, res) => {
    try {
        const result = await processWishlistReminders();
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Wishlist reminders process completed successfully",
            data: result
        });
    } catch (error) {
        console.error("triggerWishlistReminders error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || "Internal server error"
        });
    }
};
