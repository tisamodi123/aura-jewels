import Wishlist from "../models/wishlist.model.js";
import ProductMaster from "../models/product.model.js"
import mongoose from "mongoose";
import { appendMediaUrls } from "../utils/imageUrl.js";
import { applyCustomStoneOverrides, STONE_OVERRIDE } from "./product.services.js";
import { calculateRingValue } from "../utils/calculateRingValue.js";
import Constant from "../constants/user.constant.js";
import { normalizeSelection, selectionFilter, lineKey } from "../utils/lineIdentity.js";
import sizesModel from "../models/sizes.model.js";
import Offer from "../models/offer.model.js";
import { resolveBestOfferForProduct } from "./offerCalculation.services.js";

const resolveActiveSize = async (categoryDetails, selectedSizeDoc) => {
    if (!categoryDetails?.hasSize) return null;
    if (selectedSizeDoc) return selectedSizeDoc;
    if (!categoryDetails?._id) return null;

    // Try to find size "18"
    let defaultSize = await sizesModel.findOne({
        category: categoryDetails._id,
        name: { $regex: new RegExp("^18$", "i") },
        isDeleted: 0,
    }).lean();

    // Try to find size "L"
    if (!defaultSize) {
        defaultSize = await sizesModel.findOne({
            category: categoryDetails._id,
            name: { $regex: new RegExp("^L$", "i") },
            isDeleted: 0,
        }).lean();
    }

    // Fallback to database default
    if (!defaultSize) {
        defaultSize = await sizesModel.findOne({
            category: categoryDetails._id,
            isDefault: true,
            isDeleted: 0,
        }).lean();
    }

    // Fallback to first available size
    if (!defaultSize) {
        defaultSize = await sizesModel.findOne({
            category: categoryDetails._id,
            isDeleted: 0,
        }).lean();
    }

    return defaultSize || null;
};

export const add_wishlist_db = async (param) => {
    return await Wishlist.create(param);
};

export const check_wishlist_exists = async (param) => {
    return await Wishlist.find(param);
};

export const update_wishlist_db = async (id, data) => {
    return await Wishlist.findByIdAndUpdate(id, data);
};

// Every stage AFTER the initial $match. Shared verbatim by the logged-in
// wishlist (seeded from the Wishlist collection) and by the guest preview
// (seeded from synthetic lines via $documents). Do not fork this.
//
// Built per call, NOT once at module load — see the note on the cart pipeline.
// appendMediaUrls() reads the CDN base from process.env, which is still empty
// while this module is being imported.
const buildWishlistPipelineStages = () => [
            // Product join
            {
                $lookup: {
                    from: "productmasters",
                    localField: "jeweleryId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            {
                $unwind: {
                    path: "$productDetails",
                    preserveNullAndEmptyArrays: true
                }
            },

            // Metal info for display
            {
                $lookup: {
                    from: "metals",
                    localField: "productDetails.metalId",
                    foreignField: "_id",
                    as: "metalDetails"
                }
            },
            { $unwind: { path: "$metalDetails", preserveNullAndEmptyArrays: true } },

            // Category lookup for parent categoryDetails
            {
                $lookup: {
                    from: "categories",
                    localField: "productDetails.categoryId",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            { $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true } },

            // The size the user picked (if any).
            {
                $lookup: {
                    from: "sizes",
                    localField: "sizeId",
                    foreignField: "_id",
                    as: "sizeDetails"
                }
            },
            { $unwind: { path: "$sizeDetails", preserveNullAndEmptyArrays: true } },

            // MetalType join
            // {
            //     $lookup: {
            //         from: "metaltypes",
            //         localField: "productDetails.metalType",
            //         foreignField: "_id",
            //         as: "metalTypeDetails"
            //     }
            // },

            // // MetalStamp join
            // {
            //     $lookup: {
            //         from: "metalstamps",
            //         localField: "productDetails.metalStamp",
            //         foreignField: "_id",
            //         as: "metalStampDetails"
            //     }
            // },

            // Stones join
            {
                $lookup: {
                    from: "productstones",
                    let: { productId: "$productDetails._id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$productId", "$$productId"]
                                }
                            }
                        },
                        // stoneGroup is a REF — populate so we can reprice the
                        // selected origin/quality (mirror of the cart).
                        {
                            $lookup: {
                                from: "stonegroups",
                                localField: "stoneGroup",
                                foreignField: "_id",
                                as: "stoneGroup"
                            }
                        },
                        { $unwind: { path: "$stoneGroup", preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: {
                                from: "parameters",
                                localField: "shape",
                                foreignField: "_id",
                                as: "shape"
                            }
                        },
                        { $unwind: { path: "$shape", preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: {
                                from: "parameters",
                                localField: "color",
                                foreignField: "_id",
                                as: "colorParam"
                            }
                        },
                        { $unwind: { path: "$colorParam", preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: {
                                from: "parameters",
                                localField: "clarity",
                                foreignField: "_id",
                                as: "clarityParam"
                            }
                        },
                        { $unwind: { path: "$clarityParam", preserveNullAndEmptyArrays: true } },
                        {
                            $project: {
                                type: 1,
                                shape: 1,
                                color: { $ifNull: ["$colorParam.name", "$color"] },
                                clarity: { $ifNull: ["$clarityParam.name", "$clarity"] },
                                // Per-piece carat — see the note on the cart pipeline.
                                // Needed to re-resolve the stone's bucket at a new grade.
                                size: 1,
                                weight: 1,
                                totalCarat: 1,
                                stoneGroup: 1,
                                pieces: 1
                            }
                        }
                    ],
                    as: "stoneDetails"
                }
            },

            // Flatten fields
            {
                $addFields: {
                    jewelleryId: "$productDetails._id",
                    metal: "$metalDetails",
                    productTitle: "$productDetails.productTitle",
                    itemCode: "$productDetails.itemCode",
                    finalPrice: "$productDetails.finalPrice",
                    offerPrice: "$productDetails.b2c_offerPrice",
                    images: "$productDetails.images",
                    videos: "$productDetails.videos",
                    slug: "$productDetails.slug",
                    appxMetalWgt: "$productDetails.appxMetalWgt",

                    // Price components — needed to reprice the selected origin/quality.
                    metalPrice: "$productDetails.metalPrice",
                    labourPrice: "$productDetails.labourPrice",
                    otherChargePrice: "$productDetails.otherChargePrice",
                    CenterDiamondPrice: "$productDetails.CenterDiamondPrice",
                    SideDiamondPrice: "$productDetails.SideDiamondPrice",
                    TotalDiamondPrice: "$productDetails.TotalDiamondPrice",

                    hasSize: { $ifNull: ["$categoryDetails.hasSize", false] },
                    categoryName: "$categoryDetails.categoryName",
                    sizeLabel: { $ifNull: ["$categoryDetails.sizeLabel", ""] }
                }
            },

            appendMediaUrls(),

            // Final response
            {
                $project: {
                    _id: 1,
                    qty: 1,
                    price: 1,
                    engraving: 1,
                    engravingText: 1,

                    jewelleryId: 1,
                    productTitle: 1,
                    itemCode: 1,
                    finalPrice: 1,
                    offerPrice: 1,
                    images: 1,
                    videos: 1,
                    slug: 1,

                    metal: 1,
                    productDetails: 1,
                    metalType: 1,
                    metalStamp: 1,
                    appxMetalWgt: 1,

                    // Saved selection + components for repricing/display.
                    origin: 1,
                    color: 1,
                    clarity: 1,
                    metalPrice: 1,
                    labourPrice: 1,
                    otherChargePrice: 1,
                    CenterDiamondPrice: 1,
                    SideDiamondPrice: 1,
                    TotalDiamondPrice: 1,

                    stoneDetails: 1,
                    sizeId: 1,
                    sizeDetails: 1,
                    hasSize: 1,
                    categoryName: 1,
                    sizeLabel: 1,
                    categoryDetails: 1,
                    checkoutCurrency: 1,
                    createdAt: 1
                }
            },

            {
                $sort: { createdAt: -1 }
            }

];

// Reprices + prunes wishlist rows. Returns the kept lines, everything that was
// dropped (with a reason) so a guest client can rewrite its cookie, and
const loadActiveOffers = async () => {
    const now = new Date();
    return Offer.find({
        status: "active",
        isActive: true,
        isDeleted: 0,
        startDate: { $lte: now },
        endDate: { $gte: now }
    }).lean();
};

// everything kept-but-altered (`adjusted`).
const decorateWishlistLines = async (rows, activeOffers = []) => {
        const wishlist = [];
        const removed = [];
        const adjusted = [];

        for (const item of (rows || [])) {
            const product = item.productDetails;
            const sku = item.itemCode || product?.itemCode || null;
            item.sku = sku;
            item.itemCode = sku;

            // ---- Availability. Silently dropped. ----
            if (!product) {
                removed.push({ sku, reason: "PRODUCT_NOT_FOUND" });
                continue;
            }
            if (product.isDeleted !== 0) {
                removed.push({ sku, reason: "PRODUCT_DELETED" });
                continue;
            }
            if (product.status !== Constant.PRODUCT_STATUS.AVAILABLE) {
                removed.push({ sku, reason: "PRODUCT_UNAVAILABLE" });
                continue;
            }

            // If the category has sizes, resolve the active size (the selected one or the default).
            const category = item.categoryDetails;
            let activeSize = null;
            if (category?.hasSize) {
                activeSize = await resolveActiveSize(category, item.sizeDetails);
                if (activeSize && product) {
                    item.size = activeSize.name || null;
                    item.sizeId = activeSize._id || null;
                    item.sizeDetails = activeSize || null;

                    // If a custom size was selected (i.e. not the default), recalculate the price.
                    if (item.sizeId && !activeSize.isDefault) {
                        const calc = await calculateRingValue({ product, size: activeSize });
                        if (calc && calc.finalPrice) {
                            item.finalPrice = calc.finalPrice;
                            item.metalPrice = calc.metalPrice;
                            item.labourPrice = calc.labourPrice;
                            item.otherChargePrice = calc.otherPrice;
                        }
                    }
                }
            } else {
                item.size = null;
                item.sizeId = null;
                item.sizeDetails = null;
            }

            let stoneVerdict = null;
            if ((item.origin || item.color || item.clarity) && Array.isArray(item.stoneDetails)) {
                try {
                    const baseObj = {
                        metalPrice: Number(item.metalPrice) || 0,
                        labourPrice: Number(item.labourPrice) || 0,
                        otherChargePrice: Number(item.otherChargePrice) || 0,
                        CenterDiamondPrice: Number(item.CenterDiamondPrice) || 0,
                        SideDiamondPrice: Number(item.SideDiamondPrice) || 0,
                        TotalDiamondPrice: Number(item.TotalDiamondPrice) || 0,
                        finalPrice: Number(item.finalPrice) || 0,
                        stoneDetails: item.stoneDetails
                    };
                    const before = baseObj.finalPrice;
                    stoneVerdict = await applyCustomStoneOverrides(baseObj, { origin: item.origin, color: item.color, clarity: item.clarity });
                    const delta = (Number(baseObj.finalPrice) || before) - before;
                    if (delta) item.finalPrice = parseFloat(((Number(item.finalPrice) || 0) + delta).toFixed(2));
                } catch (e) {
                    // A transient failure must NOT prune the line.
                    console.error("wishlist stone override error:", e?.message);
                    stoneVerdict = null;
                }
            }

            // The saved centre-stone variant cannot be priced. Keep the item —
            // a wishlist entry vanishing because a stone group went missing is a
            // data bug, not a customer action. Reset the selection to default.
            if (stoneVerdict === STONE_OVERRIDE.UNAVAILABLE || stoneVerdict === STONE_OVERRIDE.UNSUPPORTED) {
                // `lineId` identifies THIS line. A SKU can now appear twice (one
                // origin each); resetting by SKU alone would clear both.
                adjusted.push({ sku, lineId: item._id, reason: "STONE_VARIANT_UNAVAILABLE" });
                item.origin = null;
                item.color = null;
                item.clarity = null;
                item.stoneSelectionAdjusted = true;
            }

            // When the wishlist document stores null for origin/color/clarity it means
            // "user kept the product default". For the response we still need real
            // display values, so resolve them from the product's center-stone record.
            if (!item.origin || !item.color || !item.clarity) {
                const centerStone = Array.isArray(item.stoneDetails)
                    ? item.stoneDetails.find(s => (s.type || "").toLowerCase() === "center")
                    : null;
                if (centerStone) {
                    if (!item.color)   item.color   = centerStone.color   || null;
                    if (!item.clarity) item.clarity = centerStone.clarity || null;
                    if (!item.origin) {
                        // Derive origin from the stone group type stored on the stone.
                        // stoneGroup may be populated (object) or just an id.
                        const sgType = centerStone.stoneGroup?.type
                            || centerStone.stoneGroup?.stoneType
                            || "";
                        const lowerType = String(sgType).toLowerCase();
                        if (lowerType.includes("lab") || lowerType === "lgd") {
                            item.origin = "Lab Grown";
                        } else if (lowerType === "natural" || lowerType === "natural diamond") {
                            item.origin = "Natural";
                        } else {
                            // No type info on the stone — check the naturalPrice vs lgdPrice
                            // on the stone doc to infer the default pricing track.
                            const hasNatural = Number(centerStone.naturalPrice) > 0;
                            const hasLgd     = Number(centerStone.lgdPrice)     > 0;
                            if (hasNatural && !hasLgd) item.origin = "Natural";
                            else item.origin = "Lab Grown"; // default track
                        }
                    }
                }
            }

            // Calculate active offer details for this recalculated product
            let originalPrice = Number(item.finalPrice) || 0;
            let discountedPrice = originalPrice;
            let offerDetails = null;
            if (product) {
                const recalculatedProduct = {
                    ...product,
                    finalPrice: originalPrice,
                    labourPrice: Number(item.labourPrice) || 0,
                    TotalDiamondPrice: Number(item.TotalDiamondPrice) || 0,
                    otherChargePrice: Number(item.otherChargePrice) || 0
                };
                const bestDetails = resolveBestOfferForProduct(activeOffers, recalculatedProduct);
                if (bestDetails) {
                    offerDetails = bestDetails;
                    discountedPrice = bestDetails.discountedPrice;
                }
            }

            item.discountedPrice = discountedPrice;
            item.offerDetails = offerDetails;

            wishlist.push(item);
        }

        return { list: wishlist, removed, adjusted };
};

// Logged-in wishlist: seeded from the Wishlist collection.
export const get_wishlist_db = async (userId) => {
    const activeOffers = await loadActiveOffers();
    const rows = await Wishlist.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), isDeleted: 0 } },
        ...buildWishlistPipelineStages()
    ]);
    return decorateWishlistLines(rows, activeOffers);
};

// Guest wishlist: seeded from cookie-derived lines. Writes nothing.
export const preview_wishlist_db = async (lines) => {
    if (!Array.isArray(lines) || !lines.length) return { list: [], removed: [], adjusted: [] };
    const activeOffers = await loadActiveOffers();
    const rows = await mongoose.connection.db
        .aggregate([{ $documents: lines }, ...buildWishlistPipelineStages()])
        .toArray();
    return decorateWishlistLines(rows, activeOffers);
};

// Cookie items ({ sku, origin, color, clarity }) -> wishlist lines.
// `createdAt` is synthesized so the pipeline's $sort keeps cookie order.
export const resolve_wishlist_sku_lines = async (items) => {
    const lines = [];
    const removed = [];

    const skus = [...new Set(
        (items || []).map((i) => String(i?.sku || "").trim()).filter(Boolean)
    )];

    // Do not bail when `skus` is empty — legacy cookies carry only `jeweleryId`.
    const bySku = new Map();
    if (skus.length) {
        const products = await ProductMaster
            .find({ itemCode: { $in: skus }, isDeleted: 0 }, { itemCode: 1 })
            .sort({ createdAt: 1 })
            .lean();

        for (const p of products) {
            if (bySku.has(p.itemCode)) {
                console.warn(`resolve_wishlist_sku_lines: duplicate itemCode "${p.itemCode}" — using the oldest.`);
                continue;
            }
            bySku.set(p.itemCode, p._id);
        }
    }

    const toObjectId = (v) =>
        v && mongoose.Types.ObjectId.isValid(v) ? new mongoose.Types.ObjectId(v) : null;

    const base = Date.now();
    (items || []).forEach((it, idx) => {
        const sku = String(it?.sku || "").trim();
        const legacyId = toObjectId(it?.jeweleryId);
        if (!sku && !legacyId) return;

        const jeweleryId = sku ? bySku.get(sku) : legacyId;
        if (!jeweleryId) {
            removed.push({ sku, reason: "PRODUCT_NOT_FOUND" });
            return;
        }

        // Cast sizeId to ObjectId so the sizes $lookup in buildWishlistPipelineStages
        // matches correctly. If it stays a plain string the $lookup join misses and
        // resolveActiveSize falls back to the default size, making every size of the
        // same product collapse to one line in the preview response.
        const rawSizeId = it.sizeId || null;
        const resolvedSizeId = rawSizeId && mongoose.Types.ObjectId.isValid(rawSizeId)
            ? new mongoose.Types.ObjectId(rawSizeId)
            : null;

        lines.push({
            // Must be unique PER LINE, not per product: the same SKU wishlisted
            // in Natural and in Lab Grown are two rows, and the client uses this
            // id to remove exactly one of them.
            _id: lineKey({ sku: sku || String(jeweleryId), ...it }),
            jeweleryId,
            qty: 1,
            engraving: 0,
            engravingText: "",
            sizeId: resolvedSizeId,
            ...normalizeSelection(it),
            // $sort is { createdAt: -1 }, so earlier cookie entries must be newer.
            createdAt: new Date(base - idx),
        });
    });

    return { lines, removed };
};

export const syncWishlistData = async (userId, wishlistItems) => {
    if (!wishlistItems || !Array.isArray(wishlistItems)) return;
    try {
        // The guest cookie now stores `sku` (itemCode) instead of an id.
        // Older cookies still carry jeweleryId/id/_id and keep working.
        const skuToId = new Map();
        const pendingSkus = [...new Set(
            wishlistItems
                .filter((i) => !i?.jeweleryId && !i?.id && !i?._id && i?.sku)
                .map((i) => String(i.sku).trim())
                .filter(Boolean)
        )];
        if (pendingSkus.length) {
            const products = await ProductMaster
                .find({ itemCode: { $in: pendingSkus }, isDeleted: 0 }, { itemCode: 1 })
                .sort({ createdAt: 1 })
                .lean();
            for (const p of products) {
                if (!skuToId.has(p.itemCode)) skuToId.set(p.itemCode, p._id);
            }
        }

        for (const item of wishlistItems) {
            const jeweleryId = item.jeweleryId || item.id || item._id
                || (item.sku ? skuToId.get(String(item.sku).trim()) : null);
            if (!jeweleryId) continue;

            // Match on the full line identity, otherwise a guest who wishlisted a
            // design in both origins loses one of them on login.
            const exist = await Wishlist.findOne({
                userId,
                jeweleryId,
                isDeleted: 0,
                sizeId: item.sizeId || null,
                ...selectionFilter(item)
            });

            if (!exist) {
                await Wishlist.create({
                    userId,
                    jeweleryId,
                    qty: item.qty || item.quantity || 1,
                    engraving: item.engraving || 0,
                    engravingText: item.engravingText || "",
                    origin: item.origin || null,
                    color: item.color || null,
                    clarity: item.clarity || null,
                    sizeId: item.sizeId || undefined,
                    isDeleted: 0
                });
            }
        }
    } catch (error) {
        console.error("syncWishlistData error:", error);
        throw error;
    }
};