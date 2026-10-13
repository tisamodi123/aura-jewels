import Cart from "../models/cart.model.js"
import mongoose from "mongoose";
import { appendMediaUrls } from "../utils/imageUrl.js";
import { calculateRingValue } from "../utils/calculateRingValue.js";
import sizesModel from "../models/sizes.model.js";
import { applyOfferToProduct, resolveBestOfferForProduct } from "./offerCalculation.services.js";
import { applyCustomStoneOverrides, STONE_OVERRIDE } from "./product.services.js";
import Offer from "../models/offer.model.js";
import ProductMaster from "../models/product.model.js";
import Constant from "../constants/user.constant.js";
import Order from "../models/order.model.js";
import OrderItem from "../models/orderItem.model.js";
import { normalizeSelection, cartLineFilter, lineKey, sameSelection } from "../utils/lineIdentity.js";

export const check_cart_exists = async function (obj) {
    try {
        return await Cart.find(obj)
    } catch (error) {
        console.log(error);
    }
};

export const add_cart_db = async function (obj) {
    try {
        return await Cart.create(obj)
    } catch (error) {
        console.log(error);
    }
};

// Merges a guest's cookie cart into the user's DB cart on login. Mirrors
// syncWishlistData. Deduped by (jeweleryId + sizeId). Never throws — a merge
// hiccup must not block login.
export const syncCartData = async (userId, cartItems) => {
    if (!cartItems || !Array.isArray(cartItems)) return;
    try {
        // The guest cookie now stores `sku` (itemCode) instead of an id.
        // Resolve those up-front; older cookies still carry jeweleryId/id/_id
        // and keep working (7-day TTL overlap).
        const skuToId = new Map();
        const pendingSkus = [...new Set(
            cartItems
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

        for (const item of cartItems) {
            const jeweleryId = item.jeweleryId || item.id || item._id
                || (item.sku ? skuToId.get(String(item.sku).trim()) : null);
            if (!jeweleryId) continue;
            const sizeId = item.sizeId || null;
            try {
                // Full line identity: a guest who carted a design in both origins
                // keeps both after logging in.
                const exist = await Cart.findOne({
                    userId,
                    jeweleryId,
                    isDeleted: 0,
                    ...cartLineFilter({ ...item, sizeId: sizeId || null })
                });
                if (!exist) {
                    // Clamp to the same [1,99] integer bound every other entry
                    // point enforces — the login/merge body is not item-validated,
                    // so an untrusted cookie could otherwise persist qty: 1e9.
                    const rawQty = parseInt(item.qty ?? item.quantity ?? 1, 10);
                    const mergedQty = Math.min(99, Math.max(1, Number.isFinite(rawQty) ? rawQty : 1));
                    await Cart.create({
                        userId,
                        jeweleryId,
                        sizeId: sizeId || undefined,
                        qty: mergedQty,
                        engraving: item.engraving || 0,
                        engravingText: item.engravingText || "",
                        origin: item.origin || null,
                        color: item.color || null,
                        clarity: item.clarity || null,
                        isDeleted: 0,
                    });
                }
            } catch (perItemErr) {
                // Skip a bad row (e.g. invalid id) without aborting the merge.
                console.error("syncCartData item skipped:", perItemErr?.message);
            }
        }
    } catch (error) {
        console.error("syncCartData error:", error);
    }
};

export const update_cart_db = async function (id, data) {
    return Cart.findByIdAndUpdate(id, data);
};

export const find_cart_by_id = async function (id) {
    return Cart.findById(id).lean();
};

// Returns the size doc that should be used for pricing for a given product:
// - If the product's category is non-sized (hasSize=false), returns null.
// - Else uses the selectedSizeDoc when present, falling back to the default
//   size for that category. Returning null means "no recalc needed".
//
// Sizes.category is an ObjectId ref to Category (migrated from the old
// string-name convention). We pass the category _id from the looked-up
// categoryDetails so the default-size lookup hits the new field shape.
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

// Live offers — shared by the logged-in cart and the guest preview.
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

// Every stage AFTER the initial $match. Shared verbatim by the logged-in cart
// (seeded from the Cart collection) and by the guest preview (seeded from
// synthetic lines via $documents), so a guest is priced by exactly the same
// code path as a member. Do not fork this.
//
// Built per call, NOT once at module load: appendMediaUrls() reads the CDN base
// out of process.env, and this module is evaluated while server.js is still
// importing — before dotenv has run. Freezing the stages at import time baked an
// empty prefix in and produced relative, broken image URLs.
const buildCartPipelineStages = () => [
    {
        $lookup: {
            from: "productmasters",
            localField: "jeweleryId",
            foreignField: "_id",
            as: "productDetails"
        }
    },
    { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },

    // Lookup parent product to resolve parentProductId dynamically if it is a variant
    {
        $lookup: {
            from: "productmasters",
            let: { parentItemCode: "$productDetails.parentItemCode" },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $ne: ["$$parentItemCode", null] },
                                { $ne: ["$$parentItemCode", ""] },
                                { $eq: ["$itemCode", "$$parentItemCode"] }
                            ]
                        }
                    }
                },
                { $project: { _id: 1 } }
            ],
            as: "parentProductDetails"
        }
    },
    { $unwind: { path: "$parentProductDetails", preserveNullAndEmptyArrays: true } },
    {
        $addFields: {
            "productDetails.parentProductId": "$parentProductDetails._id"
        }
    },

    // Category — needed for size-list lookup and the hasSize signal
    {
        $lookup: {
            from: "categories",
            localField: "productDetails.categoryId",
            foreignField: "_id",
            as: "categoryDetails"
        }
    },
    { $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true } },

    // Available sizes for this product's category. Sizes.category
    // is an ObjectId ref to Category, matched against the joined
    // category's _id (the field was migrated from a string-name
    // shape and the comment used to reflect the old contract).
    {
        $lookup: {
            from: "sizes",
            let: { categoryId: "$categoryDetails._id" },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ["$category", "$$categoryId"] },
                                { $eq: ["$isDeleted", 0] }
                            ]
                        }
                    }
                },
                { $sort: { isDefault: -1, name: 1 } }
            ],
            as: "RingSizes"
        }
    },

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

    {
        $lookup: {
            from: "metaltypes",
            localField: "productDetails.metalType",
            foreignField: "_id",
            as: "metalTypeDetails"
        }
    },
    {
        $lookup: {
            from: "metalstamps",
            localField: "productDetails.metalStamp",
            foreignField: "_id",
            as: "metalStampDetails"
        }
    },

    // Stones
    {
        $lookup: {
            from: "productstones",
            let: { productId: "$productDetails._id" },
            pipeline: [
                { $match: { $expr: { $eq: ["$productId", "$$productId"] } } },
                {
                    $lookup: {
                        from: "parameters",
                        localField: "shape",
                        foreignField: "_id",
                        as: "shape"
                    }
                },
                { $unwind: { path: "$shape", preserveNullAndEmptyArrays: true } },
                // stoneGroup is a REF — populate it so applyCustomStoneOverrides
                // can read shape/carat/natural_price/lgd_price to reprice (H3).
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
                        type: 1, shape: 1, 
                        color: { $ifNull: ["$colorParam.name", "$color"] }, 
                        clarity: { $ifNull: ["$clarityParam.name", "$clarity"] },
                        // `size` is the per-piece carat. applyCustomStoneOverrides
                        // re-resolves each stone's bucket from it when the grade
                        // changes; without it a Natural selection could not be
                        // priced and was silently reset to the default grade.
                        size: 1,
                        weight: 1, totalCarat: 1,
                        stoneGroup: 1,
                        pieces: 1,
                        // Used by decorateCartLines to infer origin when stoneGroup
                        // has no explicit type field (natural vs lab pricing track).
                        lgdPrice: 1,
                        naturalPrice: 1
                    }
                }
            ],
            as: "stoneDetails"
        }
    },

    // Flatten everything the storefront needs; nothing computed here
    // because the JS step below does the size-aware re-pricing.
    {
        $addFields: {
            jewelleryId: "$productDetails._id",
            productTitle: "$productDetails.productTitle",
            itemCode: "$productDetails.itemCode",
            designNumber: "$productDetails.designNumber",
            slug: "$productDetails.slug",
            images: "$productDetails.images",
            videos: "$productDetails.videos",
            appxMetalWgt: "$productDetails.appxMetalWgt",

            metal: "$metalDetails",
            metalType: { $arrayElemAt: ["$metalTypeDetails.metalName", 0] },
            metalStamp: { $arrayElemAt: ["$metalStampDetails.karat", 0] },

            finalPrice: "$productDetails.finalPrice",
            sizeDetails: "$sizeDetails",
            RingSizes: "$RingSizes",
            hasSize: { $ifNull: ["$categoryDetails.hasSize", false] },
            categoryName: "$categoryDetails.categoryName",
            sizeLabel: { $ifNull: ["$categoryDetails.sizeLabel", ""] }
        }
    },

    appendMediaUrls(),

    {
        $project: {
            _id: 1,
            engraving: 1,
            engravingText: 1,
            appxMetalWgt: 1,
            qty: 1,
            // Selected center-stone quality/origin carried from the Cart doc.
            origin: 1,
            color: 1,
            clarity: 1,

            jewelleryId: 1,
            productTitle: 1,
            itemCode: 1,
            designNumber: 1,
            slug: 1,
            images: 1,
            videos: 1,
            metal: 1,
            metalType: 1,
            metalStamp: 1,

            finalPrice: 1,
            stoneDetails: 1,

            sizeId: 1,
            sizeDetails: 1,
            RingSizes: 1,
            hasSize: 1,
            categoryName: 1,
            productDetails: 1,
            categoryDetails: 1,
            sizeLabel: 1
        }
    }
];

// Prices a set of raw pipeline rows and prunes the ones that can no longer be
// honoured. Returns the kept lines, the grand total, everything dropped (with a
// reason) so a guest client can rewrite its cookie, and everything KEPT but
// altered (`adjusted`) — currently only lines whose centre-stone selection could
// not be priced and was reset to the product default.
const decorateCartLines = async (rows, activeOffers) => {
    const list = [];
    // Cart-wide component totals for a "combined" coupon (separate % on
    // making charge and on diamond value). Summed per line × qty.
    let componentMaking = 0;
    let componentDiamond = 0;
    const removed = [];
    const adjusted = [];
    let grandTotal = 0;

    for (const item of (rows || [])) {
        const product = item.productDetails;
        const category = item.categoryDetails;
        const sku = item.itemCode || product?.itemCode || null;
        item.sku = sku;
        item.itemCode = sku;

        // ---- Availability. Silently dropped (never priced). ----------
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

        // ---- Selection: the chosen size must still exist for this
        // product's category. The sizes $lookup matches on _id alone, so
        // a deleted / re-categorised size still resolves here.
        if (category?.hasSize && item.sizeId) {
            const sd = item.sizeDetails;
            const sizeOk = sd
                && sd.isDeleted === 0
                && (!sd.status || sd.status === "ACTIVE")
                && String(sd.category) === String(category._id);
            if (!sizeOk) {
                // Per-LINE condition (the chosen size), not product-level: a
                // SKU can hold several lines in different sizes. Carry lineId
                // so pruning drops only THIS line, not every line of the SKU.
                removed.push({ sku, lineId: item._id, reason: "SIZE_UNAVAILABLE" });
                continue;
            }
        }

        let price = Number(product?.finalPrice) || 0;
        let metalWeight = Number(product?.appxMetalWgt) || 0;
        let activeSize = null;
        let currentLabourPrice = Number(product?.labourPrice) || 0;
        let currentTotalDiamondPrice = Number(product?.TotalDiamondPrice) || 0;

        if (category?.hasSize) {
            // For sized categories, recompute against the user's pick or
            // the default size when none was chosen.
            activeSize = await resolveActiveSize(category, item.sizeDetails);
            if (activeSize && product) {
                const isDefault = !!activeSize.isDefault;
                if (!isDefault) {
                    const calc = await calculateRingValue({ product, size: activeSize });
                    if (calc) {
                        price = calc.finalPrice;
                        metalWeight = calc.metalWeight;
                        currentLabourPrice = calc.labourPrice;
                    }
                }
            }

        }

        // Reprice the selected center-stone origin/quality (H3). We compute the
        // diamond-price DELTA on the base product and add it to the (possibly
        // size-adjusted) price — preserving size adjustments and metal/labour.
        // No-op when nothing was selected or no matching stoneGroup is found.
        let stoneVerdict = null;
        if (product && (item.origin || item.color || item.clarity) && Array.isArray(item.stoneDetails)) {
            try {
                const baseObj = {
                    metalPrice: Number(product.metalPrice) || 0,
                    labourPrice: Number(product.labourPrice) || 0,
                    otherChargePrice: Number(product.otherChargePrice) || 0,
                    CenterDiamondPrice: Number(product.CenterDiamondPrice) || 0,
                    SideDiamondPrice: Number(product.SideDiamondPrice) || 0,
                    TotalDiamondPrice: Number(product.TotalDiamondPrice) || 0,
                    finalPrice: Number(product.finalPrice) || 0,
                    stoneDetails: item.stoneDetails
                };
                const before = baseObj.finalPrice;
                stoneVerdict = await applyCustomStoneOverrides(baseObj, { origin: item.origin, color: item.color, clarity: item.clarity });
                const delta = (Number(baseObj.finalPrice) || before) - before;
                if (delta) {
                    price = parseFloat((price + delta).toFixed(2));
                    // The override re-prices only the diamonds, so the whole delta is
                    // a diamond-value change — fold it into the diamond component so a
                    // diamond/combined COUPON discounts the selected stone, not the
                    // product default. (labour/metal are unaffected by the override.)
                    currentTotalDiamondPrice = parseFloat((currentTotalDiamondPrice + delta).toFixed(2));
                }
            } catch (e) {
                // A transient failure must NOT prune the line — leave the
                // base price and keep the item.
                console.error("cart stone override error:", e?.message);
                stoneVerdict = null;
            }
        }

        // The selected centre-stone variant cannot be priced — either the
        // combination no longer exists (UNAVAILABLE) or this product never
        // supported varying its centre stone (UNSUPPORTED, e.g. two centre
        // stones, or a colour stone).
        //
        // This must NOT delete the customer's item. A missing stone group is
        // our data problem, not theirs, and silently emptying a cart is far
        // worse than ignoring a selection. `applyCustomStoneOverrides` returns
        // these verdicts WITHOUT mutating the price, so `price` is already the
        // product's default. Keep the line at that price, drop the unusable
        // selection, and report it separately so the client can clear it.
        if (stoneVerdict === STONE_OVERRIDE.UNAVAILABLE || stoneVerdict === STONE_OVERRIDE.UNSUPPORTED) {
            // `lineId` identifies THIS line. A SKU can appear multiple times
            // (one origin/grade each); resetting by SKU alone would wipe the
            // still-valid selection off every sibling line.
            adjusted.push({ sku, lineId: item._id, reason: "STONE_VARIANT_UNAVAILABLE" });
            item.origin = null;
            item.color = null;
            item.clarity = null;
            item.stoneSelectionAdjusted = true;
        }

        // When the cart document stores null for origin/color/clarity it means
        // "user kept the product default" (the frontend intentionally omits them
        // to avoid creating duplicate lines). For the response we still need real
        // display values, so resolve them from the product's center-stone record.
        if (!item.origin || !item.color || !item.clarity) {
            const centerStone = Array.isArray(item.stoneDetails)
                ? item.stoneDetails.find(s => (s.type || "").toLowerCase() === "center")
                : null;
            if (centerStone) {
                if (!item.color) item.color = centerStone.color || null;
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
                        const hasLgd = Number(centerStone.lgdPrice) > 0;
                        if (hasNatural && !hasLgd) item.origin = "Natural";
                        else item.origin = "Lab Grown"; // default track
                    }
                }
            }
        }

        // Calculate active offer details for this recalculated product
        let originalPrice = price;
        let discountedPrice = price;
        let offerDetails = null;
        let bestDetails = null
        if (product) {
            const recalculatedProduct = {
                ...product,
                finalPrice: price,
                labourPrice: currentLabourPrice,
                TotalDiamondPrice: currentTotalDiamondPrice
            };
            bestDetails = resolveBestOfferForProduct(activeOffers, recalculatedProduct);
        }

        if (bestDetails) {
            offerDetails = bestDetails;
            discountedPrice = bestDetails.discountedPrice;
        }

        item.price = discountedPrice;
        item.originalPrice = originalPrice;
        item.offerDetails = offerDetails;
        item.quantity = item.qty || 1;
        item.totalItemPrice = discountedPrice * item.quantity;
        // Accumulate cart-wide component totals (× qty) for combined-coupon
        // maths. Kept as locals — not attached to the line — so they don't
        // pollute the payload or bypass currency conversion. These are the
        // size-adjusted base components; an offer's discount reduces the
        // line's overall price, not these, and the combined coupon is clamped
        // to the order subtotal, so it can never over-discount.
        componentMaking += (Number(currentLabourPrice) || 0) * item.quantity;
        // Diamond total INCLUDES other charges — matches how the diamond offer
        // bases its discount and how the storefront presents the Total Diamond
        // Value, so a combined coupon stays consistent.
        componentDiamond += ((Number(currentTotalDiamondPrice) || 0) + (Number(product?.otherChargePrice) || 0)) * item.quantity;
        item.metalWeight = metalWeight;
        item.size = activeSize?.name || null;
        item.sizeId = activeSize?._id || null;
        item.sizeDetails = activeSize || null;
        grandTotal += item.totalItemPrice;

        // The full product/category docs were only needed for re-pricing;
        // strip them before returning so the payload stays compact.
        delete item.productDetails;
        delete item.categoryDetails;

        // For non-sized categories, drop the size scaffolding entirely so
        // the storefront never renders a picker.
        if (!item.hasSize) {
            item.RingSizes = [];
            item.sizeDetails = null;
            item.sizeId = null;
            item.size = null;
        }

        list.push(item);
    }

    return {
        list,
        total: grandTotal,
        removed,
        adjusted,
        components: {
            making: parseFloat(componentMaking.toFixed(2)),
            diamond: parseFloat(componentDiamond.toFixed(2)),
        },
    };
};

// Logged-in cart: seeded from the Cart collection.
export const get_cartlist_db = async (userId) => {
    const activeOffers = await loadActiveOffers();
    const rows = await Cart.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), isDeleted: 0 } },
        ...buildCartPipelineStages()
    ]);
    return decorateCartLines(rows, activeOffers);
};

// `$documents` (MongoDB >= 5.1) lets us feed synthetic cart lines through the
// exact same stages without writing anything. Mongoose 9 already requires
// MongoDB 6+, but probe rather than assume — a silent mispricing would be worse
// than a clear failure.
let _supportsDocumentsStage = null;
const supportsDocumentsStage = async () => {
    if (_supportsDocumentsStage !== null) return _supportsDocumentsStage;
    try {
        await mongoose.connection.db.aggregate([{ $documents: [{ _probe: 1 }] }]).toArray();
        _supportsDocumentsStage = true;
    } catch {
        _supportsDocumentsStage = false;
    }
    return _supportsDocumentsStage;
};

// Guest cart: seeded from cookie-derived lines. Writes nothing.
export const preview_cartlist_db = async (lines) => {
    if (!Array.isArray(lines) || !lines.length) {
        return { list: [], total: 0, removed: [], adjusted: [] };
    }
    if (!(await supportsDocumentsStage())) {
        throw new Error("Guest cart pricing requires MongoDB 5.1+ ($documents aggregation stage).");
    }

    const activeOffers = await loadActiveOffers();
    const rows = await mongoose.connection.db
        .aggregate([{ $documents: lines }, ...buildCartPipelineStages()])
        .toArray();

    return decorateCartLines(rows, activeOffers);
};

// Turn cookie items ({ sku, qty, sizeId, origin, color, clarity }) into cart
// lines the pipeline understands. Unknown / deleted SKUs are reported, not
// guessed. Duplicate itemCodes (not DB-unique) resolve to the oldest match.
export const resolve_sku_lines = async (items) => {
    const lines = [];
    const removed = [];

    const skus = [...new Set(
        (items || []).map((i) => String(i?.sku || "").trim()).filter(Boolean)
    )];

    // NOTE: do not bail when `skus` is empty — a legacy cookie carries only
    // `jeweleryId`, and those lines must still resolve.
    const bySku = new Map();
    if (skus.length) {
        const products = await ProductMaster
            .find({ itemCode: { $in: skus }, isDeleted: 0 }, { itemCode: 1 })
            .sort({ createdAt: 1 })
            .lean();

        for (const p of products) {
            if (bySku.has(p.itemCode)) {
                console.warn(`resolve_sku_lines: duplicate itemCode "${p.itemCode}" — using the oldest.`);
                continue;
            }
            bySku.set(p.itemCode, p._id);
        }
    }

    const toObjectId = (v) =>
        v && mongoose.Types.ObjectId.isValid(v) ? new mongoose.Types.ObjectId(v) : null;

    for (const it of (items || [])) {
        const sku = String(it?.sku || "").trim();
        // Legacy cookies (written before the SKU-only change) carry a product
        // id instead. Honour it so a returning guest's cart still prices.
        const legacyId = toObjectId(it?.jeweleryId);

        if (!sku && !legacyId) continue;

        const jeweleryId = sku ? bySku.get(sku) : legacyId;
        if (!jeweleryId) {
            removed.push({ sku, reason: "PRODUCT_NOT_FOUND" });
            continue;
        }

        const sizeId = toObjectId(it.sizeId);
        lines.push({
            // Stable synthetic line id (the pipeline projects _id). It must
            // include the selection: the same SKU in the same size, in two
            // origins, are two lines, and the client uses this id to act on one.
            _id: lineKey({ sku: sku || String(jeweleryId), sizeId, ...it }),
            jeweleryId,
            sizeId,
            qty: Math.min(99, Math.max(1, Number(it.qty) || 1)),
            ...normalizeSelection(it),
            engraving: Number(it.engraving) || 0,
            engravingText: String(it.engravingText || ""),
        });
    }

    return { lines, removed };
};

export const move_failed_order_to_cart_db = async (orderId, userId) => {
    // 1. Fetch order and populate its items
    const order = await Order.findOne({ _id: orderId, isDelete: false }).populate("items");
    if (!order) {
        throw new Error("Order not found");
    }

    // 2. Validate owner
    if (String(order.user) !== String(userId)) {
        throw new Error("Unauthorized: This order does not belong to you");
    }

    // 3. Validate failed status
    const isFailed = order.paymentStatus !== Constant.PAYMENT_STATUS.PAID || order.status === Constant.ORDER_STATUS.FAILED;
    if (!isFailed) {
        throw new Error("Only failed orders can be moved to cart");
    }

    // 4. Fetch user's existing active cart items
    const existingCartItems = await Cart.find({ userId, isDeleted: 0 });

    // 5. Merge order items into the cart
    for (const orderItem of order.items) {
        const jeweleryId = orderItem.productId;
        const sizeId = orderItem.sizeId || null;

        // Resolve default center stone options to normalize values to null
        let centerStone = Array.isArray(orderItem.diamondDetails)
            ? orderItem.diamondDetails.find(s => (s.type || "").toLowerCase() === "center")
            : null;

        if (!centerStone) {
            const ProductStone = mongoose.model("ProductStone");
            centerStone = await ProductStone.findOne({
                productId: jeweleryId,
                type: /^center$/i
            }).populate("stoneGroup").lean();
        }

        let defaultOrigin = null;
        let defaultColor = null;
        let defaultClarity = null;

        if (centerStone) {
            defaultColor = centerStone.color || null;
            defaultClarity = centerStone.clarity || null;

            const sgType = centerStone.stoneGroup?.type
                || centerStone.stoneGroup?.stoneType
                || "";
            const lowerType = String(sgType).toLowerCase();
            if (lowerType.includes("lab") || lowerType === "lgd") {
                defaultOrigin = "Lab Grown";
            } else if (lowerType === "natural" || lowerType === "natural diamond") {
                defaultOrigin = "Natural";
            } else {
                const hasNatural = Number(centerStone.naturalPrice) > 0;
                const hasLgd = Number(centerStone.lgdPrice) > 0;
                if (hasNatural && !hasLgd) defaultOrigin = "Natural";
                else defaultOrigin = "Lab Grown";
            }
        }

        const originVal = orderItem.origin || null;
        const colorVal = orderItem.color || null;
        const clarityVal = orderItem.clarity || null;

        const targetOrigin = (originVal && defaultOrigin && originVal.toLowerCase() === defaultOrigin.toLowerCase()) ? null : originVal;
        const targetColor = (colorVal && defaultColor && colorVal.toLowerCase() === defaultColor.toLowerCase()) ? null : colorVal;
        const targetClarity = (clarityVal && defaultClarity && clarityVal.toLowerCase() === defaultClarity.toLowerCase()) ? null : clarityVal;

        const targetSelection = {
            origin: targetOrigin,
            color: targetColor,
            clarity: targetClarity
        };

        // Find match in existing cart based on line identity: jeweleryId, sizeId, selection (origin, color, clarity)
        const match = existingCartItems.find(c =>
            String(c.jeweleryId) === String(jeweleryId) &&
            String(c.sizeId || "") === String(sizeId || "") &&
            sameSelection(c, targetSelection)
        );

        const qty = Math.max(1, Math.min(99, Number(orderItem.productDetails?.qty) || 1));
        const engraving = Number(orderItem.productDetails?.engraving) || 0;
        const engravingText = String(orderItem.productDetails?.engravingText || "").trim();

        if (match) {
            // Override with order item details
            await Cart.updateOne(
                { _id: match._id },
                {
                    $set: {
                        qty,
                        engraving,
                        engravingText
                    }
                }
            );
        } else {
            // Add new cart item with order details
            await Cart.create({
                userId,
                jeweleryId,
                sizeId: sizeId || undefined,
                qty,
                engraving,
                engravingText,
                origin: targetOrigin,
                color: targetColor,
                clarity: targetClarity,
                isDeleted: 0
            });
        }
    }

    return { success: true };
};
