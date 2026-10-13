import Constant from "../constants/user.constant.js";

/**
 * Calculates discount and new price details for a given offer on a specific product field.
 *
 * @param {Object} offer - The Offer document/object from DB.
 * @param {Number} baseValue - The price field being discounted (finalPrice, TotalDiamondPrice, labourPrice).
 * @returns {Object} { discountAmount, discountedValue }
 */
export function calculateDiscount(offer, baseValue) {
    if (!offer || baseValue <= 0) {
        return { discountAmount: 0, discountedValue: baseValue };
    }

    let discountAmount = 0;
    if (offer.discountType === Constant.OFFER_DISCOUNT_TYPE.PERCENTAGE) {
        discountAmount = (baseValue * offer.discountValue) / 100;
    } else if (offer.discountType === Constant.OFFER_DISCOUNT_TYPE.ABSOLUTE) {
        discountAmount = offer.discountValue;
    }

    // Cap the discount by maxDiscountAmount if configured
    if (offer.maxDiscountAmount !== null && offer.maxDiscountAmount !== undefined && offer.maxDiscountAmount > 0) {
        discountAmount = Math.min(discountAmount, offer.maxDiscountAmount);
    }

    // Ensure discount does not exceed the base value itself
    discountAmount = Math.min(discountAmount, baseValue);

    const discountedValue = parseFloat((baseValue - discountAmount).toFixed(2));
    discountAmount = parseFloat(discountAmount.toFixed(2));

    return { discountAmount, discountedValue };
}

/**
 * Computes offer application details for a product.
 * Returns an offerDetails object if eligible, or null.
 *
 * @param {Object} offer - The Offer document.
 * @param {Object} product - The Product object containing finalPrice, TotalDiamondPrice, labourPrice, etc.
 * @returns {Object|null}
 */
export function applyOfferToProduct(offer, product) {
    if (!offer || !product) return null;

    // Fallback active status and date timeframe validation check
    const now = new Date();
    if (offer.status !== undefined && offer.status !== Constant.OFFER_STATUS.ACTIVE) {
        return null;
    }
    if (offer.isActive !== undefined && offer.isActive === false) {
        return null;
    }
    if (offer.isDeleted !== undefined && offer.isDeleted !== 0) {
        return null;
    }
    if (offer.startDate && new Date(offer.startDate) > now) {
        return null;
    }
    if (offer.endDate && new Date(offer.endDate) < now) {
        return null;
    }

    // 0. Applicable Type, Mode, and Scope Checks
    if (offer.applicableType === "all") {
        const appTo = offer.applicableTo || {};
        let matched = false;

        if (appTo.category && appTo.category.length > 0 && product.categoryId) {
            const catId = product.categoryId.toString();
            if (appTo.category.some(id => id.toString() === catId)) matched = true;
        }
        if (!matched && appTo.subCategory && appTo.subCategory.length > 0 && product.subCategoryId) {
            const subCatIds = Array.isArray(product.subCategoryId) ? product.subCategoryId : [product.subCategoryId];
            if (subCatIds.some(subCatId => appTo.subCategory.some(id => id.toString() === subCatId.toString()))) matched = true;
        }
        if (!matched && appTo.collections && appTo.collections.length > 0 && product.collectionId) {
            const colIds = Array.isArray(product.collectionId) ? product.collectionId : [product.collectionId];
            if (colIds.some(colId => appTo.collections.some(id => id.toString() === colId.toString()))) matched = true;
        }
        if (!matched && appTo.tags && appTo.tags.length > 0 && product.tags) {
            const tagIds = Array.isArray(product.tags) ? product.tags : [product.tags];
            if (tagIds.some(tagId => appTo.tags.some(id => id.toString() === tagId.toString()))) matched = true;
        }

        if (!matched) return null;
    } else {
        // custom mode (Design or SKU)
        const appProds = offer.applicableProducts || [];
        if (appProds.length > 0) {
            const productId = (product._id || product.jewelleryId || "").toString();

            if (offer.customMode && offer.customMode.toLowerCase() === "sku") {
                // SKU Mode: exact ID match only
                const isApplicable = appProds.some(id => id.toString() === productId);
                if (!isApplicable) return null;
            } else {
                // Design Mode (Default): match product ID, or if it is a variant, match if its parent is in the list
                const isApplicable = appProds.some(id => id.toString() === productId) ||
                    // (product.parentProductId && appProds.some(id => id.toString() === product.parentProductId.toString())) ||
                    // (product.offerDetails && product.offerDetails.offer && product.offerDetails.offer._id.toString() === offer._id.toString());

                    (product.parentProductId && appProds.some(id => id.toString() === product.parentProductId.toString()));

                if (!isApplicable) return null;
            }
        } else {
            return null;
        }
    }

    const finalPrice = product.finalPrice || 0;

    // 1. Eligibility Check: Check if finalPrice is within the offer's priceRange
    const minPrice = offer.priceRange?.from ?? 0;
    const maxPrice = offer.priceRange?.to ?? Infinity;

    if (finalPrice < minPrice || finalPrice > maxPrice) {
        return null; // Not eligible
    }

    // 2a. COMBINED: a separate % on the making charge AND on the diamond value.
    // Produces the same discountAmount / discountedPrice contract the cart and
    // order consume, plus a `components` breakdown for the storefront display.
    if (offer.appliedOn === Constant.OFFER_APPLIED_ON.COMBINED) {
        const round2 = (n) => parseFloat((Number(n) || 0).toFixed(2));
        const labour = Number(product.labourPrice) || 0;
        // The "diamond price" the customer sees INCLUDES other charges (the
        // storefront bundles otherChargePrice into the Total Diamond Value), so
        // the diamond discount is computed on that combined figure.
        const diamond = (Number(product.TotalDiamondPrice) || 0) + (Number(product.otherChargePrice) || 0);
        const makingPct = Number(offer.makingChargePercent) || 0;
        const diamondPct = Number(offer.diamondPercent) || 0;

        const makingCut = round2((labour * makingPct) / 100);
        const diamondCut = round2((diamond * diamondPct) / 100);
        let discountAmount = round2(makingCut + diamondCut);

        // Never discount more than the product is worth.
        if (discountAmount > finalPrice) discountAmount = round2(finalPrice);
        if (discountAmount <= 0) return null;

        const components = [];
        if (makingCut > 0) {
            components.push({ field: "labourPrice", label: "Making Charges", percent: makingPct, originalValue: round2(labour), amount: makingCut });
        }
        if (diamondCut > 0) {
            components.push({ field: "TotalDiamondPrice", label: "Diamond Price", percent: diamondPct, originalValue: round2(diamond), amount: diamondCut });
        }

        return {
            offer: {
                _id: offer._id,
                code: offer.code,
                name: offer.name,
                discountType: offer.discountType,
                discountValue: offer.discountValue,
                appliedOn: offer.appliedOn,
                makingChargePercent: makingPct,
                diamondPercent: diamondPct,
                images: offer.images || [],
                createdAt: offer.createdAt
            },
            discountAmount,
            targetField: "combined",
            components,
            originalValue: round2(finalPrice),
            discountedValue: round2(finalPrice - discountAmount),
            mrp: round2(finalPrice),
            discountedPrice: round2(finalPrice - discountAmount)
        };
    }

    // 2. Identify the target value based on offer.appliedOn
    let baseValue = 0;
    let targetField = "";

    if (offer.appliedOn === Constant.OFFER_APPLIED_ON.PRODUCT) {
        baseValue = finalPrice;
        targetField = "finalPrice";
    } else if (offer.appliedOn === Constant.OFFER_APPLIED_ON.DIAMOND) {
        // Diamond price INCLUDES other charges (bundled as diamond value for the
        // customer), so the discount base is TotalDiamondPrice + otherChargePrice.
        baseValue = (Number(product.TotalDiamondPrice) || 0) + (Number(product.otherChargePrice) || 0);
        targetField = "TotalDiamondPrice";
    } else if (offer.appliedOn === Constant.OFFER_APPLIED_ON.MAKING_CHARGE) {
        baseValue = product.labourPrice || 0;
        targetField = "labourPrice";
    } else {
        // Unknown appliedOn type
        return null;
    }

    if (baseValue <= 0) {
        return null; // Nothing to discount
    }

    // 3. Calculate discount
    const { discountAmount, discountedValue } = calculateDiscount(offer, baseValue);
    if (discountAmount <= 0) {
        return null;
    }

    // The discounted final price of the product overall
    const productDiscountedPrice = parseFloat((finalPrice - discountAmount).toFixed(2));

    return {
        offer: {
            _id: offer._id,
            code: offer.code,
            name: offer.name,
            discountType: offer.discountType,
            discountValue: offer.discountValue,
            appliedOn: offer.appliedOn,
            images: offer.images || [],
            createdAt: offer.createdAt
        },
        discountAmount,
        targetField,
        originalValue: baseValue,
        discountedValue,
        mrp: finalPrice,
        discountedPrice: productDiscountedPrice
    };
}

/**
 * Resolves the best eligible offer for a product from a list of active offers.
 * Central place to manage priority rules if a product has multiple qualifying offers.
 *
 * @param {Array<Object>} activeOffers - List of active Offer documents.
 * @param {Object} product - Product object to apply the offer to.
 * @returns {Object|null}
 */
export function resolveBestOfferForProduct(activeOffers, product) {
    if (!activeOffers || activeOffers.length === 0 || !product) {
        return null;
    }

    let bestDetails = null;

    for (const offer of activeOffers) {
        const details = applyOfferToProduct(offer, product);
        if (details) {
            // PRIORITY / SELECTION RULE — give the customer the BEST deal (the
            // largest discount / lowest resulting price). When two offers tie on
            // discount, prefer the newer one (later createdAt) as a stable
            // tie-break. Picking by "newest" alone could hand the customer a
            // worse discount than an older, better offer.
            if (!bestDetails) {
                bestDetails = details;
                continue;
            }
            const moreDiscount = details.discountAmount > bestDetails.discountAmount;
            const tie = details.discountAmount === bestDetails.discountAmount;
            const newer = new Date(details.offer?.createdAt || 0).getTime() >
                new Date(bestDetails.offer?.createdAt || 0).getTime();
            if (moreDiscount || (tie && newer)) {
                bestDetails = details;
            }
        }
    }

    return bestDetails;
}
