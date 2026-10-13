import Wishlist from "../models/wishlist.model.js";
import Sizes from "../models/sizes.model.js";
import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { calculateRingValue } from "../utils/calculateRingValue.js";

/**
 * Retrieve user wishlist items grouped by user.
 */
export const wishlist = async (req, res) => {
    try {
        const wishlists = await Wishlist.find({
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
        for (const item of wishlists) {
            if (!item.userId) continue;
            if (!item.jeweleryId) continue;                  // hard-deleted — populate resolved to null
            if (item.jeweleryId.isDeleted !== 0) continue;   // soft-deleted product
            const uid = item.userId._id.toString();
            if (!groups[uid]) {
                const nameParts = (item.userId.name || "").trim().split(/\s+/);
                const firstName = nameParts[0] || null;
                const lastName = nameParts.slice(1).join(" ") || null;

                groups[uid] = {
                    _id: uid,
                    totalItem: 0,
                    user_detail: [{
                        firstName,
                        lastName,
                        email: item.userId.email || null,
                        number: item.userId.phone || null
                    }],
                    jewelery: []
                };
            }
            groups[uid].totalItem += 1;

            const metalDetails = item.jeweleryId?.metalId;
            let activeSize = item.sizeId || item.jeweleryId?.defaultSize;
            if (!activeSize && item.jeweleryId?.categoryId?.hasSize && item.jeweleryId?.categoryId?._id) {
                activeSize = await Sizes.findOne({
                    category: item.jeweleryId.categoryId._id,
                    isDefault: true,
                    isDeleted: 0,
                }).lean();
            }
            const sizeLabel = activeSize?.name || activeSize?.code || "-";

            let itemPrice = item.jeweleryId?.finalPrice || 0;
            if (activeSize && item.jeweleryId && item.jeweleryId.categoryId?.hasSize) {
                const calc = await calculateRingValue({ product: item.jeweleryId, size: activeSize });
                if (calc && calc.finalPrice) {
                    itemPrice = calc.finalPrice;
                }
            }

            groups[uid].jewelery.push({
                _id: item._id,
                createdAt: item.createdAt,
                jeweleryprice: itemPrice,
                checkoutCurrency: item.checkoutCurrency || "INR",
                ProductDetails: item.jeweleryId ? [{
                    _id: item.jeweleryId._id,
                    itemCode: item.jeweleryId.itemCode || "N/A",
                    productTitle: item.jeweleryId.productTitle || "N/A",
                    metalstamp: metalDetails?.stamp || "",
                    metaltype: metalDetails?.type || "",
                    finalPrice: itemPrice
                }] : [],
                ringsize: activeSize ? [
                    {
                        paraMtrName: sizeLabel
                    }
                ] : [],
                sizeDetails: activeSize
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Wishlist fetched successfully",
            data: Object.values(groups)
        });
    } catch (error) {
        console.error("wishlist error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || "Internal server error"
        });
    }
};
