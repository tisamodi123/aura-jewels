import mongoose from "mongoose";
import Constant from "../constants/user.constant.js";
import ProductMaster from "../models/product.model.js";
import Category from "../models/category.model.js";
import CollectionModel from "../models/collection.model.js";
import Metal from "../models/metal.model.js";
import Tag from "../models/tag.model.js";
import Parameter from "../models/parameter.model.js";
import Label from "../models/label.model.js";
import stoneGroupModel from "../models/stoneGroup.model.js";
import sizesModel from "../models/sizes.model.js";
import { calculateRingValue } from "../utils/calculateRingValue.js";
// Same carat-bucket and grade normalisation the price sync and the importer use.
import { normalizeColor, normalizeClarity, matchStoneGroupSize } from "../utils/stoneMatch.js";
import { appendMediaUrls } from "../utils/imageUrl.js";
import { resolveAssetUrl } from "../utils/uploadPaths.js";
import { convertCurrency, adjustPricesForCurrency } from "../utils/currencyConvertor.js";
import { get_active_dqm_for_selector } from "./stoneGroupDefault.services.js";
import { applyOfferToProduct, resolveBestOfferForProduct } from "./offerCalculation.services.js";
import Offer from "../models/offer.model.js";

// ─── Feature Switch ─────────────────────────────────────────────────────────
/**
 * Feature Switch: SWITCH_USE_DIAMOND_QUALITY_MASTER
 * 
 * - false: Derives color/clarity quality options for the selector per-product by scanning 
 *          and grouping the `StoneGroup` table rows matching that product's center stone 
 *          shape and carat.
 * 
 * - true:  Master/Unified Mode. Uses the globally defined `StoneGroupDefault` configuration 
 *          table. Loads one curated list of default qualities/settings for all products, 
 *          avoiding a heavy `StoneGroup` database scan on every product detail page load.
 */
const SWITCH_USE_DIAMOND_QUALITY_MASTER = true;
// ────────────────────────────────────────────────────────────────────────────

// Carats to grams. 5 ct = 1 g.
const CARAT_TO_GRAM = 0.2;

/**
 * Product-level weights, DERIVED from the stone rows rather than stored, so they
 * can never drift out of sync with them.
 *
 *   totalCarat  — total diamond weight in carats. Each ProductStone.totalCarat is
 *                 already that row's total (Size x Pieces), so a plain $sum works.
 *                 Falls back to `weight` (the same figure under an older name) for
 *                 rows whose totalCarat has not been backfilled yet, otherwise a
 *                 stale row silently contributes 0.
 *   grossWeight — metal (+ chain, on the same `haveChain === "yes"` condition the
 *                 price sync uses) + stones converted at 5 ct = 1 g.
 *
 * Must be inserted AFTER the `stoneDetails` lookup in whatever pipeline uses it.
 */
const stoneCaratSum = {
    $sum: {
        $map: {
            input: { $ifNull: ["$stoneDetails", []] },
            as: "s",
            in: { $ifNull: ["$$s.totalCarat", { $ifNull: ["$$s.weight", 0] }] }
        }
    }
};

const PRODUCT_WEIGHTS_STAGE = {
    $addFields: {
        totalCarat: { $round: [stoneCaratSum, 3] },
        grossWeight: {
            $round: [
                {
                    $add: [
                        { $ifNull: ["$appxMetalWgt", 0] },
                        {
                            $cond: [
                                { $eq: [{ $toLower: { $ifNull: ["$haveChain", ""] } }, "yes"] },
                                { $ifNull: ["$cWgt", 0] },
                                0
                            ]
                        },
                        { $multiply: [stoneCaratSum, CARAT_TO_GRAM] }
                    ]
                },
                3
            ]
        }
    }
};

/**
 * Builds the MongoDB match query object for finding a product by Slug, ObjectId, or itemCode.
 * @param {string} productSlug - The slug, itemCode or _id of the product.
 * @returns {object} The match query object.
 */
export function buildProductMatchQuery(productSlug) {
    const matchQuery = {
        isDeleted: 0,
        status: Constant.PRODUCT_STATUS.AVALIABLE
    };

    const escaped = productSlug.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const caseInsensitiveMatch = new RegExp(`^${escaped}$`, "i");

    if (mongoose.Types.ObjectId.isValid(productSlug)) {
        matchQuery.$or = [
            { _id: new mongoose.Types.ObjectId(productSlug) },
            { slug: caseInsensitiveMatch },
            { itemCode: caseInsensitiveMatch }
        ];
    } else {
        matchQuery.$or = [
            { slug: caseInsensitiveMatch },
            { itemCode: caseInsensitiveMatch }
        ];
    }
    return matchQuery;
}

/**
 * Fetches active label mappings from the database.
 * @returns {Promise<object>} Map of stoneType_color_clarity string keys to labelNames.
 */
export async function buildLabelMap() {
    // colour/clarity are free-text grades stored on the Label rule itself, so
    // they key directly against ProductStone.color / .clarity. They used to be
    // Parameter refs, which meant only grades that happened to exist in the
    // Parameter master could ever be labelled.
    const allLabels = await Label.find({ isDeleted: 0, status: "ACTIVE" }).lean();

    const labelMap = {};
    allLabels.forEach(lbl => {
        const colorCode = String(lbl.color || "").trim().toUpperCase();
        const clarityCode = String(lbl.clarity || "").trim().toUpperCase();
        if (colorCode && clarityCode) {
            labelMap[`${lbl.stoneType.toUpperCase()}_${colorCode}_${clarityCode}`] = lbl.labelName;
        }
    });
    return labelMap;
}

/**
 * Resolves center stone options and mappings for dropdown selector.
 * @param {object} productData - The product data to mutate.
 * @param {object} labelMap - Pre-resolved labels lookup map.
 */
export async function resolveCenterStoneOptions(productData, labelMap) {
    const centerStones = productData?.stoneDetails?.filter(
        s => s.type?.toLowerCase() === "center"
    ) || [];

    // Variation requires at least one centre stone. MULTIPLE centre stones are
    // now supported: shape and size stay fixed (the selector only offers quality
    // / stone-group), and a chosen grade is priced across EVERY centre + side
    // stone by applyCustomStoneOverrides.
    if (centerStones.length < 1) {
        return;
    }

    // Only diamond centres can vary quality; a colour/gem stone's grade is fixed
    // to the sheet's GemColor/GemClarity. For multiple centres, EVERY centre must
    // be a diamond — otherwise we'd offer a grade that can't apply to them all.
    const isColorStoneCentre = (cs) =>
        cs.stoneGroup?.stoneType?.toLowerCase() === "color stone" ||
        cs.stoneGroup?.stoneType?.toLowerCase() === "gemstone" ||
        cs.type?.toLowerCase() === "gem";
    if (centerStones.some(isColorStoneCentre)) {
        return;
    }

    const centerStone = centerStones[0]; // representative for the default label

    if (SWITCH_USE_DIAMOND_QUALITY_MASTER) {
        // ── Master mode ──────────────────────────────────────────────────────
        // Fetch the curated list from StoneGroupDefault; no per-product
        // stoneGroup scan needed. We still need pricing, so applyCustomStoneOverrides
        // will look up stoneGroup on selection (unchanged behaviour).
        const masterEntries = await get_active_dqm_for_selector();

        const selectorOptions = [];
        masterEntries.forEach(entry => {
            // origin "Both" expands to two options
            const origins = entry.origin === "Both"
                ? ["Lab Grown", "Natural"]
                : [entry.origin];

            origins.forEach(origin => {
                selectorOptions.push({
                    stoneGroupId: null, // not tied to a specific stoneGroup row
                    displayName: entry.displayName,
                    color: entry.color,
                    clarity: entry.clarity,
                    origin,
                    amount: 0  // price resolved on selection via applyCustomStoneOverrides
                });
            });
        });

        // Always ensure the product's own current stone color/clarity is visible
        // for EVERY origin that the selector supports. The master may have entries
        // only for some origins, or may be empty. Either way the user must always
        // see at least one quality option when they switch between Natural / Lab Grown.
        const currentColor = centerStone.color?.toUpperCase() || "";
        const currentClarity = centerStone.clarity?.toUpperCase() || "";

        if (currentColor && currentClarity) {
            const ORIGINS = ["Natural", "Lab Grown"];
            const toUnshift = [];

            ORIGINS.forEach(origin => {
                const presentForOrigin = selectorOptions.some(
                    o => o.color?.toUpperCase() === currentColor &&
                        o.clarity?.toUpperCase() === currentClarity &&
                        o.origin?.toLowerCase() === origin.toLowerCase()
                );
                if (!presentForOrigin) {
                    toUnshift.push({
                        stoneGroupId: null,
                        displayName: `${currentColor}/${currentClarity}`,
                        color: currentColor,
                        clarity: currentClarity,
                        origin,
                        amount: 0  // price resolved on selection via applyCustomStoneOverrides
                    });
                }
            });

            // Prepend missing origins so the product's default appears first
            if (toUnshift.length > 0) {
                selectorOptions.unshift(...toUnshift);
            }
        }

        // Mark every option that cannot actually be priced for THIS product.
        //
        // The master is a flat list of grades; it knows nothing about a given
        // ring's carat weights. A 3.00 ct centre stone has no GH/VVS rate at all
        // (the banded grades stop below 1 ct), and some grades are published for
        // one origin only. Offering those as if they were selectable meant a
        // click that silently did nothing.
        await annotateSelectorAvailability(productData, selectorOptions);

        productData.stoneSelector = selectorOptions;
        productData.stoneSelectorSource = "master"; // informational flag
        return;
    }

    // ── StoneGroup mode (default) ─────────────────────────────────────────
    if (centerStone?.stoneGroup) {
        const centerStoneOptions = await stoneGroupModel.find({
            stoneType: "diamond",
            shape: centerStone.stoneGroup.shape,
            carat: centerStone.stoneGroup.carat
        })
            .select("_id lgd_price natural_price type color clarity shape carat")
            .lean();

        productData.centerStoneOptions = centerStoneOptions;

        const selectorOptions = [];
        centerStoneOptions.forEach(option => {
            const colorCode = option.color?.toUpperCase() || "";
            const clarityCode = option.clarity?.toUpperCase() || "";
            const key = `CENTER_${colorCode}_${clarityCode}`;
            const labelName = labelMap[key] || `${option.color}/${option.clarity}`;

            if (option.lgd_price > 0) {
                selectorOptions.push({
                    stoneGroupId: option._id,
                    displayName: labelName,
                    color: option.color,
                    clarity: option.clarity,
                    origin: "Lab Grown",
                    amount: option.lgd_price
                });
            }
            if (option.natural_price > 0) {
                selectorOptions.push({
                    stoneGroupId: option._id,
                    displayName: labelName,
                    color: option.color,
                    clarity: option.clarity,
                    origin: "Natural",
                    amount: option.natural_price
                });
            }
        });

        productData.stoneSelector = selectorOptions;
        productData.stoneSelectorSource = "stoneGroup"; // informational flag
    }
}

/**
 * Applies price adjustments for custom center stone attributes (color, clarity, origin).
 *
 * Pricing behaviour is unchanged. It now also RETURNS a verdict describing
 * whether the requested selection could be honoured, so callers (the cart) can
 * tell "valid, already the default" apart from "that variant no longer exists":
 *
 *   NOT_APPLICABLE - nothing was selected
 *   DEFAULT        - selection equals the product's default centre stone (valid)
 *   APPLIED        - a matching stoneGroup was found and the price adjusted
 *   UNAVAILABLE    - a selection was made but no matching stoneGroup exists
 *   UNSUPPORTED    - the product cannot vary its centre stone (0/2+ centre
 *                    stones, or a colour stone)
 *
 * The return value is the verdict for the MAIN product; variants are still
 * mutated but do not affect it.
 *
 * @param {object} productData - The product data to mutate.
 * @param {object} queryParams - Input parameters { color, clarity, origin }.
 * @returns {Promise<"NOT_APPLICABLE"|"DEFAULT"|"APPLIED"|"UNAVAILABLE"|"UNSUPPORTED">}
 */
export const STONE_OVERRIDE = {
    NOT_APPLICABLE: "NOT_APPLICABLE",
    DEFAULT: "DEFAULT",
    APPLIED: "APPLIED",
    UNAVAILABLE: "UNAVAILABLE",
    UNSUPPORTED: "UNSUPPORTED",
};

// ─── Stone-grade helpers ─────────────────────────────────────────────────────
//
// A quality selection ("GH/VVS") applies to EVERY diamond in the piece, not just
// the centre stone — the product sheet grades all of a product's stones
// identically. Pricing therefore has to re-resolve each diamond against its own
// shape + carat bucket at the chosen grade, and a grade is only offerable when
// every one of them resolves to a published rate for the chosen origin.

/** Colour stones and gems never take part in the diamond quality selection. */
const isDiamondStone = (s) => {
    const groupType = s?.stoneGroup?.stoneType?.toLowerCase();
    if (groupType === "color stone" || groupType === "gemstone") return false;
    return s?.type?.toLowerCase() !== "gem";
};

/** Per-carat rate for an origin. `null`/0 means "not offered in this origin". */
const rateForOrigin = (group, origin) => {
    const value = String(origin || "").toLowerCase() === "natural"
        ? group?.natural_price
        : group?.lgd_price;
    return value > 0 ? value : 0;
};

/**
 * The stone group that prices `stone` at `color`/`clarity`.
 *
 * Matches on the stone's own SIZE, not on its current group's carat label:
 * bucket boundaries differ between grades (D/IF starts at 1.00 ct, EF/VVS ends
 * at 0.99), so reusing the old label finds nothing the moment the grade changes.
 */
// Strict range containment for a numeric carat, WITHOUT the 2-decimal rounding
// matchStoneGroupSize applies. Used only to break a multi-bucket tie for tiny
// melee sizes. Non-range labels ("4.40 x 2.70 MM") return false — those are
// handled by matchStoneGroupSize's exact-string path, never reach here ambiguous.
const strictSizeContains = (carat, size) => {
    const m = String(carat).match(/([\d.]+)\s*(?:-|TO)\s*([\d.]+)/i);
    if (!m) return false;
    const v = Number(size), min = Number(m[1]), max = Number(m[2]);
    return Number.isFinite(v) && v >= min - 1e-9 && v <= max + 1e-9;
};

const groupForGrade = (groups, stone, color, clarity) => {
    const shapeId = stone?.stoneGroup?.shape;
    if (!shapeId) return null;

    const wantColor = normalizeColor(color);
    const wantClarity = normalizeClarity(clarity);

    const sameGrade = groups.filter(
        (g) =>
            String(g.shape) === String(shapeId) &&
            normalizeColor(g.color) === wantColor &&
            normalizeClarity(g.clarity) === wantClarity
    );

    // Preferred: match the stone's own per-piece carat against the bucket.
    const size = stone.size;
    if (size !== undefined && size !== null && String(size).trim() !== "") {
        const sized = sameGrade.filter((g) => matchStoneGroupSize(g.carat, size));
        if (sized.length === 1) return sized[0];
        if (sized.length > 1) {
            // matchStoneGroupSize rounds to 2 decimals for Excel float noise, so
            // a sub-0.01 melee size (e.g. 0.008 → 0.01) can match its real bucket
            // AND the next one, reading as "ambiguous". Disambiguate by the STRICT
            // raw range (no rounding): well-formed buckets don't overlap, so the
            // true bucket is the one that literally contains the value.
            const strict = sized.filter((g) => strictSizeContains(g.carat, size));
            if (strict.length === 1) return strict[0];
        }
        // Genuinely ambiguous (duplicate rows) or no match → refuse.
        return null;
    }

    // Fallback for callers whose projection omits `size` (some cart/wishlist
    // pipelines historically did): match the current group's bucket LABEL. A
    // range like "0.70-0.89" is not a number, so it can never be matched by
    // carat — treating that as "unavailable" silently reset the customer's
    // selection to the product default, and re-priced their line.
    const label = stone.stoneGroup?.carat;
    if (!label) return null;
    const byLabel = sameGrade.filter((g) => String(g.carat).trim() === String(label).trim());
    return byLabel.length === 1 ? byLabel[0] : null;
};

/** Every diamond stone of a product, with the shape ids needed to price them. */
const diamondStonesOf = (prod) => (prod?.stoneDetails || []).filter(isDiamondStone);

/**
 * Record the product's OWN centre-stone grade, before any override is applied.
 *
 * applyCustomStoneOverrides stamps the selected grade onto `stoneDetails`, so
 * once it has run the stones no longer say what the product's default was. The
 * client needs that default to decide whether the customer actually chose
 * something: a selection equal to the default is stored as null on a cart or
 * wishlist line, so a "default" add never forks into a second line.
 *
 * Without this the client compared the selection against the ALREADY-OVERRIDDEN
 * stones, always found them equal, and stored no selection at all — so a cart
 * line chosen as IJ/VS was saved (and priced) as the product default.
 *
 * Must be called BEFORE applyCustomStoneOverrides.
 */
export function stampDefaultStoneSelection(prod) {
    if (!prod) return;

    const apply = (p) => {
        const centre = (p?.stoneDetails || []).find((s) => s.type?.toLowerCase() === "center");
        if (!centre || !isDiamondStone(centre)) {
            p.defaultStoneSelection = { origin: null, color: null, clarity: null };
            return;
        }
        p.defaultStoneSelection = {
            // Mirrors `defaultOrigin` in applyCustomStoneOverrides.
            origin: (centre.stoneGroup?.type || "").toLowerCase() === "natural" ? "Natural" : "Lab Grown",
            color: centre.color ?? null,
            clarity: centre.clarity ?? null,
        };
    };

    apply(prod);
    if (Array.isArray(prod.variants)) prod.variants.forEach(apply);
}

/**
 * Load every stone group that could price this product's diamonds. One query,
 * scoped to the handful of shapes the product actually uses.
 */
const loadGroupsForProduct = async (stones) => {
    const shapeIds = [...new Set(stones.map((s) => s.stoneGroup?.shape).filter(Boolean).map(String))];
    if (!shapeIds.length) return [];
    return await stoneGroupModel
        .find({ stoneType: "diamond", shape: { $in: shapeIds } })
        .select("_id shape color clarity carat lgd_price natural_price")
        .lean();
};

/**
 * Flag each selector option as available / unavailable for this product, with a
 * customer-readable reason. Mutates the options in place.
 *
 * An option is available only when EVERY diamond in the piece can be priced at
 * that grade in that origin — the same rule applyCustomStoneOverrides enforces,
 * so the selector can never offer something the pricing will then reject.
 */
async function annotateSelectorAvailability(productData, selectorOptions) {
    const stones = diamondStonesOf(productData);
    if (!stones.length || !selectorOptions.length) return;

    const groups = await loadGroupsForProduct(stones);

    for (const option of selectorOptions) {
        let reason = null;

        for (const stone of stones) {
            const group = groupForGrade(groups, stone, option.color, option.clarity);
            const label = `${stone.size ?? stone.weight} ct ${String(stone.shape || "").toLowerCase()}`;

            if (!group) {
                reason = `Not available for the ${label} stone`;
                break;
            }
            if (!rateForOrigin(group, option.origin)) {
                reason = `Not available as ${option.origin} for the ${label} stone`;
                break;
            }
        }

        option.available = !reason;
        option.unavailableReason = reason;
    }
}

/**
 * Price every diamond of `prod` at the given grade + origin.
 *
 * Returns null when ANY diamond cannot be priced — a half-applied grade would
 * show the customer one quality and charge them for another.
 */
const priceAllDiamondsAtGrade = (prod, groups, color, clarity, origin) => {
    const stones = diamondStonesOf(prod);
    if (!stones.length) return null;

    let centerTotal = 0;
    let sideTotal = 0;
    const priced = [];

    for (const stone of stones) {
        const group = groupForGrade(groups, stone, color, clarity);
        if (!group) return null;

        const rate = rateForOrigin(group, origin);
        if (!rate) return null;                      // grade exists, but not in this origin

        // `weight` is the row total (size x pieces); never multiply by pieces again.
        const weight = stone.weight || stone.totalCarat || 0;
        const value = rate * weight;

        if (String(stone.type).toUpperCase() === "CENTER") centerTotal += value;
        else sideTotal += value;

        priced.push({ stone, group, rate, value });
    }

    return { centerTotal, sideTotal, priced };
};

export async function applyCustomStoneOverrides(productData, queryParams) {
    const { color, clarity, origin } = queryParams;

    if (!color && !clarity && !origin) return STONE_OVERRIDE.NOT_APPLICABLE;

    // A selector value may arrive as the display name ("GH/VVS") rather than the
    // two fields; split it the same way the old code did.
    const wantColor = color ? (color.split("/")[0] || color) : null;
    const wantClarity = clarity ? (clarity.split("/")[1] || clarity) : null;

    const applyToProduct = async (prod) => {
        const centerStones = (prod?.stoneDetails || []).filter(
            s => s.type?.toLowerCase() === "center"
        );

        // Variation requires at least one centre stone. Multiple centres are
        // supported — the chosen grade is priced across every centre + side stone.
        if (centerStones.length < 1) {
            return STONE_OVERRIDE.UNSUPPORTED;
        }

        // Diamonds only — every centre must be a diamond. A colour stone's grade
        // comes from the sheet's GemColor/GemClarity and is never varied.
        if (centerStones.some(cs => !isDiamondStone(cs))) {
            return STONE_OVERRIDE.UNSUPPORTED;
        }

        const centerStone = centerStones[0]; // representative for target fallback

        // Selection equal to what the product already is? Only a no-op when EVERY
        // centre already carries the selected grade — then the stored prices (set
        // by the price sync at each stone's saved grade) are valid as-is. If the
        // centres differ, always take the full-reprice path below.
        const centreOrigin = (cs) => (cs.stoneGroup?.type || "").toLowerCase() === "natural" ? "natural" : "lab grown";
        const centreMatchesSelection = (cs) =>
            (!wantColor || normalizeColor(wantColor) === normalizeColor(cs.color || "")) &&
            (!wantClarity || normalizeClarity(wantClarity) === normalizeClarity(cs.clarity || "")) &&
            (!origin || origin.toLowerCase() === centreOrigin(cs));

        if (centerStones.every(centreMatchesSelection)) {
            return STONE_OVERRIDE.DEFAULT;
        }

        const targetColor = wantColor || centerStone.color || "";
        const targetClarity = wantClarity || centerStone.clarity || "";
        const targetOrigin = origin || centreOrigin(centerStone);

        const stones = diamondStonesOf(prod);
        if (!stones.length) return STONE_OVERRIDE.UNAVAILABLE;

        const groups = await loadGroupsForProduct(stones);
        const result = priceAllDiamondsAtGrade(prod, groups, targetColor, targetClarity, targetOrigin);

        // Not every diamond in the piece can be had at this grade/origin. Do not
        // half-apply it: the customer would see one quality and pay for another.
        if (!result) return STONE_OVERRIDE.UNAVAILABLE;

        prod.CenterDiamondPrice = parseFloat(result.centerTotal.toFixed(2));
        prod.SideDiamondPrice = parseFloat(result.sideTotal.toFixed(2));
        prod.TotalDiamondPrice = parseFloat((result.centerTotal + result.sideTotal).toFixed(2));
        prod.finalPrice = parseFloat((
            (prod.metalPrice || 0) + (prod.labourPrice || 0) + (prod.otherChargePrice || 0) + prod.TotalDiamondPrice
        ).toFixed(2));

        // Stamp the chosen grade onto the stones themselves, so the Centre and
        // Side Stone panels show what was actually selected and priced. Colour
        // stones are untouched.
        const upperColor = String(targetColor).toUpperCase();
        const upperClarity = String(targetClarity).toUpperCase();
        for (const { stone, group } of result.priced) {
            const weight = stone.weight || stone.totalCarat || 0;
            stone.color = upperColor;
            stone.clarity = upperClarity;
            stone.stoneGroup = group;
            stone.price = parseFloat((rateForOrigin(group, targetOrigin) * weight).toFixed(2));
            // The Price Breakup panel reads these cached per-origin line totals.
            // They were computed by the price sync at the product's DEFAULT grade,
            // so without refreshing them the breakup would contradict the price.
            stone.lgdPrice = parseFloat(((group.lgd_price > 0 ? group.lgd_price : 0) * weight).toFixed(2));
            stone.naturalPrice = parseFloat(((group.natural_price > 0 ? group.natural_price : 0) * weight).toFixed(2));
        }

        return STONE_OVERRIDE.APPLIED;
    };

    // Apply to main product
    const verdict = await applyToProduct(productData);

    // Apply to all variants
    if (productData.variants && Array.isArray(productData.variants)) {
        await Promise.all(productData.variants.map(variant => applyToProduct(variant)));
    }

    return verdict;
}

/**
 * Adjusts product and variant prices/weights based on the user-selected ringsize.
 * @param {object} productData - The product data to mutate.
 * @param {string} ringsize - Name, code or ID of the selected size.
 */
export async function applyRingSizeAdjustments(productData, ringsize) {
    if (!ringsize) return;

    let sizeDoc = null;
    if (mongoose.Types.ObjectId.isValid(ringsize)) {
        sizeDoc = await sizesModel.findOne({ _id: ringsize, isDeleted: 0, status: "ACTIVE" });
    }
    if (!sizeDoc) {
        if (productData.categoryId) {
            sizeDoc = await sizesModel.findOne({
                category: productData.categoryId,
                $or: [
                    { name: ringsize },
                    { code: ringsize }
                ],
                isDeleted: 0,
                status: "ACTIVE"
            });
        }
        if (!sizeDoc) {
            sizeDoc = await sizesModel.findOne({
                $or: [
                    { name: ringsize },
                    { code: ringsize }
                ],
                isDeleted: 0,
                status: "ACTIVE"
            });
        }
    }

    if (sizeDoc) {
        if (sizeDoc.isDefault) {
            return;
        }
        const mainPricePromise = calculateRingValue({ product: productData, size: sizeDoc });
        const variantPromises = (productData.variants || []).map(variant =>
            calculateRingValue({ product: variant, size: sizeDoc })
        );

        const [mainPriceResult, ...variantPriceResults] = await Promise.all([
            mainPricePromise,
            ...variantPromises
        ]);

        if (mainPriceResult) {
            productData.metalPrice = mainPriceResult.metalPrice;
            productData.labourPrice = mainPriceResult.labourPrice;
            productData.otherChargePrice = mainPriceResult.otherPrice;
            productData.finalPrice = mainPriceResult.finalPrice;
            productData.appxMetalWgt = mainPriceResult.metalWeight;
        }

        if (productData.variants && Array.isArray(productData.variants)) {
            productData.variants.forEach((variant, index) => {
                const varPriceResult = variantPriceResults[index];
                if (varPriceResult) {
                    variant.metalPrice = varPriceResult.metalPrice;
                    variant.labourPrice = varPriceResult.labourPrice;
                    variant.otherChargePrice = varPriceResult.otherPrice;
                    variant.finalPrice = varPriceResult.finalPrice;
                    variant.appxMetalWgt = varPriceResult.metalWeight;
                }
            });
        }
    }
}

/**
 * Formats image/video URLs with prefixes and assigns labels to stone details.
 * @param {object} productData - The product data to mutate.
 * @param {object} labelMap - Pre-resolved labels lookup map.
 * @param {string} baseUrl - Application base URL.
 */

export function formatMediaUrlsAndLabels(productData, labelMap, baseUrl) {
    if (productData.stoneDetails && Array.isArray(productData.stoneDetails)) {
        productData.stoneDetails = productData.stoneDetails.map(stone => {
            if (stone.shapeImage) {
                // Resolve like the admin does — full CloudFront URL in AWS mode,
                // legacy /uploads/parameterImages/ path locally. The old hardcoded
                // local path 404'd in prod (images live on S3).
                stone.shapeImage = resolveAssetUrl(stone.shapeImage, baseUrl, "uploads/parameterImages") || "";
            }

            const stoneType = (stone.type || "").toUpperCase();
            const colorVal = (stone.color || "").toUpperCase();
            const clarityVal = (stone.clarity || "").toUpperCase();
            const key = `${stoneType}_${colorVal}_${clarityVal}`;
            stone.labelName = labelMap[key] || "";
            return stone;
        });
    }

    if (productData.variants && Array.isArray(productData.variants)) {
        productData.variants = productData.variants.map(variant => {
            if (variant.shapeImage) {
                variant.shapeImage = resolveAssetUrl(variant.shapeImage, baseUrl, "uploads/parameterImages") || "";
            }
            if (variant.stoneDetails && Array.isArray(variant.stoneDetails)) {
                variant.stoneDetails = variant.stoneDetails.map(stone => {
                    const stoneType = (stone.type || "").toUpperCase();
                    const colorVal = (stone.color || "").toUpperCase();
                    const clarityVal = (stone.clarity || "").toUpperCase();
                    const key = `${stoneType}_${colorVal}_${clarityVal}`;
                    stone.labelName = labelMap[key] || "";
                    return stone;
                });
            }
            return variant;
        });
    }

    productData.stoneTypes = Constant.DIAMOND_TYPES.ALL_TYPES;
    productData.defaultPriceSource = Constant.DEFAULT_PRICE_SOURCE;
}

/**
 * Orchestrator service to fetch and process details of a product.
 * @param {object} params - Parameters object.
 * @param {string} params.slug - Slug, itemCode or ID.
 * @param {object} params.queryParams - Query options { ringsize, color, clarity, origin }.
 * @param {string} params.baseUrl - Request base URL.
 * @returns {Promise<object|null>} Processed product data or null if not found.
 */

export async function getProductDetailsService({ slug, queryParams, baseUrl, exchangeRate }) {
    const matchQuery = buildProductMatchQuery(slug);

    const pipeline = [
        { $match: matchQuery },
        // METAL
        {
            $lookup: {
                from: "metals",
                localField: "metalId",
                foreignField: "_id",
                as: "metalDetails"
            }
        },
        { $unwind: { path: "$metalDetails", preserveNullAndEmptyArrays: true } },

        // CATEGORY
        {
            $lookup: {
                from: "categories",
                localField: "categoryId",
                foreignField: "_id",
                as: "categoryDetails"
            }
        },
        { $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true } },

        // Sizes lookup by category
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
                            },
                            isDeleted: 0,
                            status: "ACTIVE"
                        }
                    },
                    { $sort: { sort: 1 } }
                ],
                as: "sizes"
            }
        },

        // SUBCATEGORY
        {
            $lookup: {
                from: "categories",
                localField: "subCategoryId",
                foreignField: "_id",
                as: "subCategoryDetails"
            }
        },

        // COLLECTION
        {
            $lookup: {
                from: "collections",
                localField: "collectionId",
                foreignField: "_id",
                as: "collectionDetails"
            }
        },

        // STONES
        {
            $lookup: {
                from: "productstones",
                localField: "_id",
                foreignField: "productId",
                pipeline: [
                    {
                        $lookup: {
                            from: "parameters",
                            localField: "shape",
                            foreignField: "_id",
                            as: "shapeParam"
                        }
                    },
                    { $unwind: { path: "$shapeParam", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "parameters",
                            let: { val: "$color" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: [{ $toString: "$_id" }, { $toString: "$$val" }]
                                        }
                                    }
                                }
                            ],
                            as: "colorParam"
                        }
                    },
                    { $unwind: { path: "$colorParam", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "parameters",
                            let: { val: "$clarity" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: [{ $toString: "$_id" }, { $toString: "$$val" }]
                                        }
                                    }
                                }
                            ],
                            as: "clarityParam"
                        }
                    },
                    { $unwind: { path: "$clarityParam", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "stonegroups",
                            localField: "stoneGroup",
                            foreignField: "_id",
                            as: "stoneGroupDetail"
                        }
                    },
                    { $unwind: { path: "$stoneGroupDetail", preserveNullAndEmptyArrays: true } },
                    {
                        $addFields: {
                            shape: { $ifNull: ["$shapeParam.code", "$shape"] },
                            shapeImage: { $ifNull: ["$shapeParam.image", ""] },
                            // ProductStone now saves ObjectId ref instead of string, so use colorParam.code
                            color: { $ifNull: ["$colorParam.code", "$stoneGroupDetail.color", "$color"] },
                            clarity: { $ifNull: ["$clarityParam.code", "$stoneGroupDetail.clarity", "$clarity"] },
                            stoneGroup: { $ifNull: ["$stoneGroupDetail", null] },
                            // ProductStone.price is ALREADY the line total
                            // (rate-per-carat x weight), so multiplying by
                            // weight again double-counted it. And StoneGroup has
                            // no `amount` field — that fallback was always 0.
                            // Prefer the stored total; recompute from the group's
                            // per-carat rate only when it is missing.
                            finalValue: {
                                $let: {
                                    vars: {
                                        storedTotal: { $ifNull: ["$price", 0] },
                                        rate: {
                                            $ifNull: [
                                                "$stoneGroupDetail.lgd_price",
                                                { $ifNull: ["$stoneGroupDetail.natural_price", 0] }
                                            ]
                                        },
                                        wt: {
                                            $ifNull: [
                                                "$weight",
                                                { $ifNull: ["$totalCarat", { $ifNull: ["$wgt", 0] }] }
                                            ]
                                        }
                                    },
                                    in: {
                                        $cond: [
                                            { $gt: ["$$storedTotal", 0] },
                                            "$$storedTotal",
                                            { $multiply: ["$$rate", "$$wt"] }
                                        ]
                                    }
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            shapeParam: 0,
                            // colorParam: 0,
                            // clarityParam: 0,
                            stoneGroupDetail: 0
                        }
                    }
                ],
                as: "stoneDetails"
            }
        },

        // Product-level weights (totalCarat, grossWeight) for the main product.
        PRODUCT_WEIGHTS_STAGE,

        // VARIANTS
        {
            $lookup: {
                from: "productmasters",
                let: {
                    itemCode: "$itemCode",
                    parentCode: "$parentItemCode",
                    parentId: "$_id",
                    parentCategoryId: "$categoryId",
                    parentSubCategoryId: "$subCategoryId",
                    parentCollectionId: "$collectionId",
                    parentTags: "$tags"
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [
                                    { $eq: ["$itemCode", "$$itemCode"] },
                                    { $eq: ["$parentItemCode", "$$itemCode"] },
                                    {
                                        $and: [
                                            { $ne: ["$$parentCode", ""] },
                                            { $ne: ["$$parentCode", null] },
                                            { $eq: ["$parentItemCode", "$$parentCode"] }
                                        ]
                                    },
                                    {
                                        $and: [
                                            { $ne: ["$$parentCode", ""] },
                                            { $ne: ["$$parentCode", null] },
                                            { $eq: ["$itemCode", "$$parentCode"] }
                                        ]
                                    }
                                ]
                            }
                        }
                    },
                    {
                        $match: {
                            isDeleted: 0,
                            status: Constant.PRODUCT_STATUS.AVALIABLE
                        }
                    },
                    {
                        $addFields: {
                            parentProductId: {
                                $cond: {
                                    if: { $eq: ["$parentItemCode", "$$itemCode"] },
                                    then: "$$parentId",
                                    else: null
                                }
                            },
                            categoryId: { $ifNull: ["$categoryId", "$$parentCategoryId"] },
                            subCategoryId: {
                                $cond: {
                                    if: { $gt: [{ $size: { $ifNull: ["$subCategoryId", []] } }, 0] },
                                    then: "$subCategoryId",
                                    else: "$$parentSubCategoryId"
                                }
                            },
                            collectionId: {
                                $cond: {
                                    if: { $gt: [{ $size: { $ifNull: ["$collectionId", []] } }, 0] },
                                    then: "$collectionId",
                                    else: "$$parentCollectionId"
                                }
                            },
                            tags: {
                                $cond: {
                                    if: { $gt: [{ $size: { $ifNull: ["$tags", []] } }, 0] },
                                    then: "$tags",
                                    else: "$$parentTags"
                                }
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: "metals",
                            localField: "metalId",
                            foreignField: "_id",
                            as: "metalDetails"
                        }
                    },
                    { $unwind: { path: "$metalDetails", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "productstones",
                            localField: "_id",
                            foreignField: "productId",
                            pipeline: [
                                {
                                    $lookup: {
                                        from: "parameters",
                                        localField: "shape",
                                        foreignField: "_id",
                                        as: "shapeParam"
                                    }
                                },
                                { $unwind: { path: "$shapeParam", preserveNullAndEmptyArrays: true } },
                                {
                                    $lookup: {
                                        from: "parameters",
                                        let: { val: "$color" },
                                        pipeline: [
                                            {
                                                $match: {
                                                    $expr: {
                                                        $eq: [{ $toString: "$_id" }, { $toString: "$$val" }]
                                                    }
                                                }
                                            }
                                        ],
                                        as: "colorParam"
                                    }
                                },
                                { $unwind: { path: "$colorParam", preserveNullAndEmptyArrays: true } },
                                {
                                    $lookup: {
                                        from: "parameters",
                                        let: { val: "$clarity" },
                                        pipeline: [
                                            {
                                                $match: {
                                                    $expr: {
                                                        $eq: [{ $toString: "$_id" }, { $toString: "$$val" }]
                                                    }
                                                }
                                            }
                                        ],
                                        as: "clarityParam"
                                    }
                                },
                                { $unwind: { path: "$clarityParam", preserveNullAndEmptyArrays: true } },
                                {
                                    $lookup: {
                                        from: "stonegroups",
                                        localField: "stoneGroup",
                                        foreignField: "_id",
                                        as: "stoneGroupDetail"
                                    }
                                },
                                { $unwind: { path: "$stoneGroupDetail", preserveNullAndEmptyArrays: true } },
                                {
                                    $project: {
                                        shape: { $ifNull: ["$shapeParam.code", "$shape"] },
                                        shapeImage: { $ifNull: ["$shapeParam.image", ""] },
                                        totalCarat: 1,
                                        color: { $ifNull: ["$colorParam.code", "$stoneGroupDetail.color", "$color"] },
                                        clarity: { $ifNull: ["$clarityParam.code", "$stoneGroupDetail.clarity", "$clarity"] },
                                        type: 1,
                                        pieces: 1,
                                        wgt: 1,
                                        weight: 1,
                                        price: 1,
                                        size: 1,
                                        stoneGroup: { $ifNull: ["$stoneGroupDetail", null] },
                                        // StoneGroup has no `amount` field, so this
                                        // line was hardcoded to 0 for every variant.
                                        // Use the stored line total; fall back to
                                        // the group's per-carat rate x weight.
                                        finalValue: {
                                            $let: {
                                                vars: {
                                                    storedTotal: { $ifNull: ["$price", 0] },
                                                    rate: {
                                                        $ifNull: [
                                                            "$stoneGroupDetail.lgd_price",
                                                            { $ifNull: ["$stoneGroupDetail.natural_price", 0] }
                                                        ]
                                                    },
                                                    wt: {
                                                        $ifNull: [
                                                            "$weight",
                                                            { $ifNull: ["$totalCarat", { $ifNull: ["$wgt", 0] }] }
                                                        ]
                                                    }
                                                },
                                                in: {
                                                    $cond: [
                                                        { $gt: ["$$storedTotal", 0] },
                                                        "$$storedTotal",
                                                        { $multiply: ["$$rate", "$$wt"] }
                                                    ]
                                                }
                                            }
                                        }
                                    }
                                }
                            ],
                            as: "stoneDetails"
                        }
                    },
                    // Each variant has its own metal weight and its own stones, so
                    // it needs its own weights — inheriting the parent's would
                    // report a 9KT ring's gross weight for an 18KT one.
                    PRODUCT_WEIGHTS_STAGE,
                    {
                        $addFields: {
                            stone: { $arrayElemAt: ["$stoneDetails", 0] }
                        }
                    },
                    appendMediaUrls(),
                    {
                        $project: {
                            productDesc: 1,
                            videos: 1,
                            appxMetalWgt: 1,
                            totalCarat: 1,
                            grossWeight: 1,
                            // Per-variant shipping lead time — the PDP shows it and
                            // variant switches (carat/metal) must carry their own.
                            shipmentDays: 1,
                            finalPrice: 1,
                            metalPrice: 1,
                            labourPrice: 1,
                            otherChargePrice: 1,
                            CenterDiamondPrice: 1,
                            SideDiamondPrice: 1,
                            TotalDiamondPrice: 1,
                            stoneDetails: 1,
                            sizes: 1,
                            _id: 1,
                            itemCode: 1,
                            parentItemCode: 1,
                            parentProductId: 1,
                            productTitle: 1,
                            offerDetails: 1,
                            discountedPrice: 1,
                            categoryId: 1,
                            subCategoryId: 1,
                            collectionId: 1,
                            tags: 1,
                            images: 1,
                            labourCode: 1,
                            otherChargeCode: 1,
                            width: 1,
                            length: 1,
                            height: 1,
                            slug: 1,
                            metalTypeDetail: {
                                _id: "$metalDetails._id",
                                metalName: "$metalDetails.type",
                                colorCode: "$metalDetails.color"
                            },
                            metalStampDetail: {
                                _id: "$metalDetails._id",
                                karat: "$metalDetails.stamp"
                            },
                            shape: "$stone.shape",
                            shapeImage: "$stone.shapeImage",
                            // NOTE: `totalCarat` is deliberately NOT re-mapped to
                            // "$stone.totalCarat" here. It is a duplicate key that
                            // silently overrode the product-level total computed by
                            // PRODUCT_WEIGHTS_STAGE, so a variant reported only its
                            // first stone's carat. Callers that want a single
                            // stone's carat read stoneDetails[] directly.
                            color: "$stone.color",
                            clarity: "$stone.clarity",
                        }
                    }
                ],
                as: "variants"
            }
        },
        appendMediaUrls(),
        {
            $project: {
                _id: 1,
                designNumber: 1,
                itemCode: 1,
                parentItemCode: 1,
                productTitle: 1,
                productDesc: 1,
                categoryId: 1,
                subCategoryId: 1,
                collectionId: 1,
                tags: 1,
                gender: 1,
                metalId: 1,
                appxMetalWgt: 1,
                // Derived by PRODUCT_WEIGHTS_STAGE above. This projection is a
                // WHITELIST — omitting them here drops them silently.
                totalCarat: 1,
                grossWeight: 1,
                qty: 1,
                height: 1,
                width: 1,
                length: 1,
                labourCode: 1,
                otherChargeCode: 1,
                isEngraving: 1,
                images: 1,
                videos: 1,
                slug: 1,
                haveChain: 1,
                cMetalId: 1,
                cWgt: 1,
                cLength: 1,
                shipmentDays: 1,
                SEODetails: 1,
                status: 1,
                isDeleted: 1,
                createdBy: 1,
                createdAt: 1,
                updatedAt: 1,
                offerDetails: 1,
                discountedPrice: 1,
                CenterDiamondPrice: 1,
                SideDiamondPrice: 1,
                TotalDiamondPrice: 1,
                finalPrice: 1,
                labourPrice: 1,
                metalPrice: 1,
                otherChargePrice: 1,
                metalTypeDetail: {
                    _id: "$metalDetails._id",
                    metalName: "$metalDetails.type",
                    colorCode: "$metalDetails.color"
                },
                metalStampDetail: {
                    _id: "$metalDetails._id",
                    karat: "$metalDetails.stamp"
                },
                metalDetails: 1,
                categoryDetails: 1,
                subCategoryDetails: 1,
                collectionDetails: 1,
                stoneDetails: 1,
                variants: 1,
                sizes: 1,
                similarProducts: 1,
                combineWith: 1,
            }
        }
    ];

    const result = await ProductMaster.aggregate(pipeline);
    if (!result.length) {
        return null;
    }

    const productData = result[0];
    const parentProductId = productData._id?.toString();
    const labelMap = await buildLabelMap();

    // Resolve selector options for center stones
    await resolveCenterStoneOptions(productData, labelMap);

    // Apply custom stone pricing overrides first (if query selects color/clarity/origin) so it overrides diamond price
    // Snapshot the product's own grade BEFORE the override stamps the
    // selected grade onto stoneDetails.
    stampDefaultStoneSelection(productData);

    await applyCustomStoneOverrides(productData, queryParams);

    // Then adjust prices for the user chosen ringsize using the overridden stone price
    await applyRingSizeAdjustments(productData, queryParams.ringsize);

    // Apply the best LIVE offer ALWAYS — not only when the customer changed a
    // selection. Previously this was gated behind `hasOverrides`, so a direct
    // load / refresh / SSR (which arrives without stone query-params) showed NO
    // offer and the undiscounted price, while client navigation (which does send
    // params) showed it. The customer saw the offer "disappear" on refresh.
    {
        const now = new Date();
        const activeOffers = await Offer.find({
            status: "active",
            isActive: true,
            isDeleted: 0,
            startDate: { $lte: now },
            endDate: { $gte: now }
        }).lean();

        // Build an in-memory parentItemCode -> parentProductId lookup
        // needed so that variant products can be matched in Design mode.
        const parentItemCode = productData.itemCode;
        const parentProductId = productData._id?.toString();

        const applyOfferDetails = (prod, isVariant = false) => {
            if (!prod) return;
            if (isVariant && parentProductId) {
                prod.parentProductId = prod.parentProductId || parentProductId;
            }

            const bestDetails = resolveBestOfferForProduct(activeOffers, prod);

            if (bestDetails) {
                prod.offerDetails = bestDetails;
                prod.discountedPrice = bestDetails.discountedPrice;
            } else {
                prod.offerDetails = null;
                prod.discountedPrice = prod.finalPrice;
            }
        };

        // // Resolve selector options for center stones
        // await resolveCenterStoneOptions(productData, labelMap);

        // // Apply custom stone pricing overrides first (if query selects color/clarity/origin) so it overrides diamond price
        // await applyCustomStoneOverrides(productData, queryParams);

        // // Then adjust prices for the user chosen ringsize using the overridden stone price
        // await applyRingSizeAdjustments(productData, queryParams.ringsize);

        // Calculate and apply offer details based on current price breakdown *before* currency conversion
        applyOfferDetails(productData, false);
        if (productData.variants && Array.isArray(productData.variants)) {
            productData.variants.forEach(variant => applyOfferDetails(variant, true));
        }
    }

    // Final formatting of assets and labels
    formatMediaUrlsAndLabels(productData, labelMap, baseUrl);

    // Convert prices to target currency at the very end
    const convertedProductData = adjustPricesForCurrency(productData, exchangeRate);

    // adjustPricesForCurrency already converts offerDetails fields (originalValue,
    // discountedValue, mrp, discountedPrice, discountAmount are all in priceKeys),
    // so they are ALREADY in the display currency. The previous code multiplied
    // them back by rate, cancelling the conversion — removed. Just keep the
    // top-level discountedPrice in sync with the (already-converted) offer.
    if (convertedProductData.offerDetails) {
        convertedProductData.discountedPrice = convertedProductData.offerDetails.discountedPrice;
    }

    if (convertedProductData.variants && Array.isArray(convertedProductData.variants)) {
        convertedProductData.variants.forEach(variant => {
            if (variant.offerDetails) {
                variant.discountedPrice = variant.offerDetails.discountedPrice;
            }
        });
    }

    return convertedProductData;
}

/**
 * Core orchestrator to retrieve the catalog listing page dataset.
 * Resolves slugs, shapes, and filters concurrently, then executes an index-optimized query.
 */
export async function getProductListService(params) {
    const {
        page = 1,
        limit = 12,
        metalType,
        metalStamp,
        metals,
        shape,
        category,
        categorySlug,
        collectionSlug,
        subCategory,
        subCategorySlug,
        search,
        minWeight,
        maxWeight,
        minPrice,
        maxPrice,
        sortPrice,
        collectionId,
        tags,
        gender,
        exchangeRate,
        ids,
        lastNDays
    } = params;

    // 1. Resolve slugs and shape parameters concurrently
    const shapes = (shape && shape.length > 0)
        ? (Array.isArray(shape) ? shape : shape.split(",")).map(s => s.trim().toLowerCase())
        : [];

    const categorySlugPromise = categorySlug
        ? Category.findOne({ slug: categorySlug }).select("_id").lean()
        : Promise.resolve(null);

    const collectionSlugPromise = collectionSlug
        ? CollectionModel.findOne({ slug: collectionSlug }).select("_id").lean()
        : Promise.resolve(null);

    const subCategorySlugPromise = subCategorySlug
        ? Category.findOne({ slug: subCategorySlug }).select("_id").lean()
        : Promise.resolve(null);

    const shapesPromise = shapes.length > 0
        ? Parameter.find({
            type: "shape",
            $or: [
                { name: { $in: shapes.map(s => new RegExp(`^${s}$`, "i")) } },
                { code: { $in: shapes.map(s => new RegExp(`^${s}$`, "i")) } }
            ]
        }).select("_id").lean()
        : Promise.resolve([]);

    const [catDoc, colDoc, shapeDocs, subCatDoc] = await Promise.all([
        categorySlugPromise,
        collectionSlugPromise,
        shapesPromise,
        subCategorySlugPromise
    ]);

    // 2. Build consolidated base match filters
    const matchFilter = {
        isDeleted: 0,
        status: Constant.PRODUCT_STATUS.AVALIABLE
    };


    // Filter by IDs if provided
    if (ids && ids.length > 0) {

        const productIds = ids.filter(Boolean).map(id => new mongoose.Types.ObjectId(id));
        console.log("productIds===========>", productIds)
        console.log("productIds===========>", ids)
        if (productIds.length > 0) {
            matchFilter._id = { $in: productIds };
        }
    }

    // Filter by creation date if lastNDays is provided
    if (lastNDays !== undefined && !isNaN(Number(lastNDays))) {
        const date = new Date();
        date.setDate(date.getDate() - Number(lastNDays));
        matchFilter.createdAt = { $gte: date };
    }

    // Filter by parentItemCode only if metal/weight filters are absent
    if ((!metals || metals.length === 0) && (!minWeight && !maxWeight)) {
        matchFilter.$or = [
            { parentItemCode: { $exists: false } },
            { parentItemCode: null },
            { parentItemCode: "" }
        ];
    }

    // Metal filter (handles raw ObjectIds or slugified metal names)
    if ((metals && metals.length > 0) || (metalType && metalType.length > 0) || (metalStamp && metalStamp.length > 0)) {
        const metalInputs = [
            ...(Array.isArray(metals) ? metals : []),
            ...(Array.isArray(metalType) ? metalType : []),
            ...(Array.isArray(metalStamp) ? metalStamp : [])
        ].filter(Boolean);

        const combinedMetalIds = [];
        const metalSlugs = [];
        metalInputs.forEach(item => {
            if (mongoose.Types.ObjectId.isValid(item)) {
                combinedMetalIds.push(new mongoose.Types.ObjectId(item));
            } else if (item) {
                metalSlugs.push(item);
            }
        });

        if (metalSlugs.length > 0) {
            const allMetals = await Metal.find({ isDeleted: 0 }).select("_id name").lean();
            const slugify = (text) => text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
            allMetals.forEach(m => {
                if (m.name && metalSlugs.includes(slugify(m.name))) {
                    combinedMetalIds.push(m._id);
                }
            });
        }

        if (combinedMetalIds.length > 0) {
            matchFilter.metalId = { $in: combinedMetalIds };
        }
    }

    // Slug category match
    if (categorySlug) {
        if (catDoc) {
            matchFilter.$and = matchFilter.$and || [];
            matchFilter.$and.push({
                $or: [
                    { categoryId: catDoc._id },
                    { subCategoryId: catDoc._id }
                ]
            });
        } else {
            // Impossible match for invalid slug
            matchFilter._id = null;
        }
    }

    // Slug subcategory match
    if (subCategorySlug) {
        if (subCatDoc) {
            matchFilter.$and = matchFilter.$and || [];
            matchFilter.$and.push({
                $or: [
                    { subCategoryId: subCatDoc._id },
                    { categoryId: subCatDoc._id }
                ]
            });
        } else {
            // Impossible match for invalid slug
            matchFilter._id = null;
        }
    }

    // Slug collection match
    if (collectionSlug) {
        if (colDoc) {
            matchFilter.collectionId = colDoc._id;
        } else {
            // Impossible match
            matchFilter._id = null;
        }
    }

    // Category ids or slugs match
    if (category && category.length > 0) {
        const categoryIds = [];
        const categorySlugs = [];
        category.forEach(item => {
            if (mongoose.Types.ObjectId.isValid(item)) {
                categoryIds.push(new mongoose.Types.ObjectId(item));
            } else if (item) {
                categorySlugs.push(item);
            }
        });

        if (categorySlugs.length > 0) {
            const resolvedCats = await Category.find({ slug: { $in: categorySlugs } }).select("_id").lean();
            resolvedCats.forEach(c => categoryIds.push(c._id));
        }

        if (categoryIds.length > 0) {
            matchFilter.$and = matchFilter.$and || [];
            matchFilter.$and.push({
                $or: [
                    { categoryId: { $in: categoryIds } },
                    { subCategoryId: { $in: categoryIds } }
                ]
            });
        }
    }

    // Subcategory (Style) match or slugs match
    if (subCategory && subCategory.length > 0) {
        const subIds = [];
        const subSlugs = [];
        subCategory.forEach(item => {
            if (mongoose.Types.ObjectId.isValid(item)) {
                subIds.push(new mongoose.Types.ObjectId(item));
            } else if (item) {
                subSlugs.push(item);
            }
        });

        if (subSlugs.length > 0) {
            const resolvedSubs = await Category.find({ slug: { $in: subSlugs } }).select("_id").lean();
            resolvedSubs.forEach(c => subIds.push(c._id));
        }

        if (subIds.length > 0) {
            matchFilter.$and = matchFilter.$and || [];
            matchFilter.$and.push({
                $or: [
                    { subCategoryId: { $in: subIds } },
                    { categoryId: { $in: subIds } }
                ]
            });
        }
    }

    // Free-text Search
    if (search && typeof search === "string" && search.trim()) {
        const term = search.trim();
        const safe = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const rx = new RegExp(safe, "i");
        matchFilter.$and = matchFilter.$and || [];
        matchFilter.$and.push({
            $or: [
                { productTitle: rx },
                { itemCode: rx },
                { designNumber: rx }
            ]
        });
    }

    // Weight range match
    if (minWeight !== undefined || maxWeight !== undefined) {
        matchFilter.appxMetalWgt = {};
        if (minWeight !== undefined) matchFilter.appxMetalWgt.$gte = parseFloat(minWeight);
        if (maxWeight !== undefined) matchFilter.appxMetalWgt.$lte = parseFloat(maxWeight);
    }

    // Price range match
    if (minPrice !== undefined || maxPrice !== undefined) {
        matchFilter.finalPrice = {};
        if (minPrice !== undefined) matchFilter.finalPrice.$gte = parseFloat(minPrice);
        if (maxPrice !== undefined) matchFilter.finalPrice.$lte = parseFloat(maxPrice);
    }

    // Collection ID or slugs match
    if (collectionId && collectionId.length > 0) {
        const collectionIds = [];
        const collectionSlugs = [];
        collectionId.forEach(item => {
            if (mongoose.Types.ObjectId.isValid(item)) {
                collectionIds.push(new mongoose.Types.ObjectId(item));
            } else if (item) {
                collectionSlugs.push(item);
            }
        });

        if (collectionSlugs.length > 0) {
            const resolvedCols = await CollectionModel.find({ slug: { $in: collectionSlugs } }).select("_id").lean();
            resolvedCols.forEach(c => collectionIds.push(c._id));
        }

        if (collectionIds.length > 0) {
            matchFilter.collectionId = { $in: collectionIds };
        }
    }

    // Tags match (handles raw ObjectIds or slugified tag names)
    if (tags && tags.length > 0) {
        const tagIds = [];
        const tagSlugs = [];
        tags.filter(Boolean).forEach(item => {
            if (mongoose.Types.ObjectId.isValid(item)) {
                tagIds.push(new mongoose.Types.ObjectId(item));
            } else if (item) {
                tagSlugs.push(item);
            }
        });

        if (tagSlugs.length > 0) {
            const allTags = await Tag.find({ status: Constant.STATUS.ACTIVE }).select("_id name").lean();
            const slugify = (text) => text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
            allTags.forEach(t => {
                if (t.name && tagSlugs.includes(slugify(t.name))) {
                    tagIds.push(t._id);
                }
            });
        }

        if (tagIds.length > 0) {
            matchFilter.tags = { $in: tagIds };
        }
    }

    // Gender match — the storefront/redirect sends canonical keys
    // (women/men/couple/unisex) which map onto the (overlapping) stored values
    // so one chip matches all its synonyms.
    //
    // The values are matched CASE-INSENSITIVELY: the product import writes the
    // sheet's raw text through bulkWrite (which bypasses the schema enum), so
    // the collection holds "UNISEX" while older rows used "Other" and the enum
    // declares "Unisex". A plain `$in` on exact strings matched none of them.
    if (gender && (Array.isArray(gender) ? gender.length : String(gender).trim())) {
        const GENDER_MAP = {
            women: ["Women", "Female"],
            men: ["Men", "Male"],
            couple: ["Couple"],
            unisex: ["Unisex", "Other"],
            // legacy alias — the stored value used to be "Other"
            other: ["Unisex", "Other"],
        };
        const keys = (Array.isArray(gender) ? gender : String(gender).split(","))
            .map((g) => String(g).trim().toLowerCase())
            .filter(Boolean);
        const storedValues = [...new Set(keys.flatMap((k) => GENDER_MAP[k] || []))];

        // An unrecognised gender must match NOTHING. Previously it left the
        // filter unset, so `?gender=other` silently returned the whole catalogue.
        matchFilter.gender = storedValues.length
            ? { $in: storedValues.map((v) => new RegExp(`^${escapeRegexV2(v)}$`, "i")) }
            : { $in: [] };
    }

    const pipeline = [
        { $match: matchFilter }
    ];

    // Shape filter (adds lookup matching parameters)
    if (shapes.length > 0) {
        const parameterIds = shapeDocs.map(p => p._id);
        pipeline.push(
            {
                $lookup: {
                    from: "productstones",
                    let: { productId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$productId", "$$productId"] } } },
                        {
                            $match: {
                                $expr: {
                                    $cond: {
                                        if: { $eq: [{ $type: "$shape" }, "objectId"] },
                                        then: { $in: ["$shape", parameterIds] },
                                        else: { $in: [{ $toLower: "$shape" }, shapes] }
                                    }
                                }
                            }
                        }
                    ],
                    as: "stoneDetails"
                }
            },
            { $match: { stoneDetails: { $ne: [] } } }
        );
    }

    // Sort setup
    let sortStage = { createdAt: -1 };
    if (sortPrice === "lowToHigh") {
        sortStage = { finalPrice: 1 };
    } else if (sortPrice === "highToLow") {
        sortStage = { finalPrice: -1 };
    }

    // Facet execution
    pipeline.push({
        $facet: {
            totalCount: [{ $count: "count" }],
            products: [
                { $sort: sortStage },
                { $skip: (page - 1) * limit },
                { $limit: Number(limit) },
                {
                    $lookup: {
                        from: "metals",
                        localField: "metalId",
                        foreignField: "_id",
                        as: "metalDetails"
                    }
                },
                { $unwind: { path: "$metalDetails", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "productmasters",
                        let: {
                            // The variant family this product belongs to:
                            // parentItemCode when present, else its own itemCode.
                            familyKey: {
                                $cond: [
                                    {
                                        $and: [
                                            { $ne: ["$parentItemCode", ""] },
                                            { $ne: ["$parentItemCode", null] }
                                        ]
                                    },
                                    "$parentItemCode",
                                    "$itemCode"
                                ]
                            },
                            parentCategoryId: "$categoryId",
                            parentSubCategoryId: "$subCategoryId",
                            parentCollectionId: "$collectionId",
                            parentTags: "$tags"
                        },
                        pipeline: [
                            {
                                // Indexed equality on the denormalised family key
                                // (familyItemCode + isDeleted + status index) —
                                // replaces the previous un-indexable $expr/$or
                                // scan while matching the exact same variant set:
                                // every product whose family is `familyKey`,
                                // including the product itself.
                                $match: {
                                    $expr: { $eq: ["$familyItemCode", "$$familyKey"] }
                                }
                            },
                            {
                                $match: {
                                    isDeleted: 0,
                                    status: Constant.PRODUCT_STATUS.AVALIABLE
                                }
                            },
                            {
                                $lookup: {
                                    from: "metals",
                                    localField: "metalId",
                                    foreignField: "_id",
                                    as: "metalDetails"
                                }
                            },
                            { $unwind: { path: "$metalDetails", preserveNullAndEmptyArrays: true } },
                            {

                                $lookup: {
                                    from: "sizes",
                                    let: {
                                        categoryId: { $ifNull: ["$categoryId", "$$parentCategoryId"] }
                                    },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $eq: ["$category", "$$categoryId"]
                                                },
                                                isDefault: true,
                                                status: "ACTIVE"
                                            }
                                        },
                                        { $limit: 1 }
                                    ],
                                    as: "sizeDetails"
                                }
                            },
                            {
                                $unwind: {
                                    path: "$sizeDetails",
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            appendMediaUrls(),
                            {
                                $project: {
                                    _id: 1,
                                    itemCode: 1,
                                    parentItemCode: 1,
                                    productTitle: 1,
                                    images: 1,
                                    slug: 1,
                                    finalPrice: 1,
                                    TotalDiamondPrice: 1,
                                    labourPrice: 1,
                                    otherChargePrice: 1,
                                    CenterDiamondPrice: 1,
                                    SideDiamondPrice: 1,
                                    offerDetails: 1,
                                    discountedPrice: 1,
                                    sizeDetails: 1,
                                    categoryId: { $ifNull: ["$categoryId", "$$parentCategoryId"] },
                                    subCategoryId: {
                                        $cond: {
                                            if: { $gt: [{ $size: { $ifNull: ["$subCategoryId", []] } }, 0] },
                                            then: "$subCategoryId",
                                            else: "$$parentSubCategoryId"
                                        }
                                    },
                                    collectionId: {
                                        $cond: {
                                            if: { $gt: [{ $size: { $ifNull: ["$collectionId", []] } }, 0] },
                                            then: "$collectionId",
                                            else: "$$parentCollectionId"
                                        }
                                    },
                                    tags: {
                                        $cond: {
                                            if: { $gt: [{ $size: { $ifNull: ["$tags", []] } }, 0] },
                                            then: "$tags",
                                            else: "$$parentTags"
                                        }
                                    },
                                    metalTypeDetail: {
                                        _id: "$metalDetails._id",
                                        metalName: "$metalDetails.type",
                                        colorCode: "$metalDetails.color"
                                    },
                                    metalStampDetail: {
                                        _id: "$metalDetails._id",
                                        karat: "$metalDetails.stamp"
                                    }
                                }
                            }
                        ],
                        as: "variants"
                    }
                },
                {

                    $lookup: {
                        from: "sizes",
                        let: {
                            categoryId: "$categoryId"
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ["$category", "$$categoryId"]
                                    },
                                    isDefault: true,
                                    status: "ACTIVE"
                                }
                            },
                            { $limit: 1 }
                        ],
                        as: "sizeDetails"
                    }
                },
                {
                    $unwind: {
                        path: "$sizeDetails",
                        preserveNullAndEmptyArrays: true
                    }
                },
                appendMediaUrls(),
                convertCurrency(exchangeRate),
                {
                    $project: {
                        _id: 1,
                        productTitle: 1,
                        slug: 1,
                        images: 1,
                        itemCode: 1,
                        finalPrice: 1,
                        TotalDiamondPrice: 1,
                        labourPrice: 1,
                        otherChargePrice: 1,
                        CenterDiamondPrice: 1,
                        SideDiamondPrice: 1,
                        appxMetalWgt: 1,
                        parentItemCode: 1,
                        offerDetails: 1,
                        discountedPrice: 1,
                        categoryId: 1,
                        subCategoryId: 1,
                        collectionId: 1,
                        sizeDetails: 1,
                        tags: 1,
                        metalTypeDetail: {
                            _id: "$metalDetails._id",
                            metalName: "$metalDetails.type",
                            colorCode: "$metalDetails.color"
                        },
                        metalStampDetail: {
                            _id: "$metalDetails._id",
                            karat: "$metalDetails.stamp"
                        },
                        variants: 1
                    }
                }
            ]
        }
    });

    const result = await ProductMaster.aggregate(pipeline);
    const total = result[0]?.totalCount[0]?.count || 0;
    const products = result[0]?.products || [];

    const rate = exchangeRate || 1;

    // Apply the best LIVE offer here too — NOT the materialized offerDetails the
    // pipeline projected. The stored value is a cache from the last sync and goes
    // stale the moment offer logic/config/prices change, so the LISTING card and
    // the PDP (which computes live) would show different discounts for the same
    // product. Computing live here guarantees list == detail == cart.
    //
    // Prices from the pipeline are already in the display currency, so the offer
    // is computed in that currency directly; the offer's priceRange (stored in
    // INR) is converted to the same currency for the eligibility comparison.
    const now = new Date();
    const activeOffers = (await Offer.find({
        status: "active",
        isActive: true,
        isDeleted: 0,
        startDate: { $lte: now },
        endDate: { $gte: now }
    }).lean()).map((o) => ({
        ...o,
        priceRange: {
            from: (Number(o.priceRange?.from) || 0) / rate,
            to: o.priceRange?.to != null ? Number(o.priceRange.to) / rate : o.priceRange?.to,
        },
    }));

    const applyLiveOffer = (prod, parentId = null) => {
        if (!prod) return;
        if (parentId) prod.parentProductId = prod.parentProductId || parentId;
        const best = resolveBestOfferForProduct(activeOffers, prod);
        if (best) {
            prod.offerDetails = best;
            prod.discountedPrice = best.discountedPrice;
        } else {
            prod.offerDetails = null;
            prod.discountedPrice = prod.finalPrice;
        }
    };

    products.forEach((prod) => {
        applyLiveOffer(prod);
        if (Array.isArray(prod.variants)) {
            const pid = prod._id?.toString();
            prod.variants.forEach((variant) => applyLiveOffer(variant, pid));
        }
    });

    return { total, products };
}

const toObjectIdsV2 = (arr = []) =>
    arr.filter(Boolean).map(id => new mongoose.Types.ObjectId(id));

const escapeRegexV2 = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const convertOfferCurrencyV2 = (item, rate) => {
    if (!item.offerDetails) {
        item.offerDetails = null;
        item.discountedPrice = item.finalPrice;
        return;
    }

    [
        "originalValue",
        "discountedValue",
        "mrp",
        "discountedPrice",
        "discountAmount"
    ].forEach(key => {
        if (typeof item.offerDetails[key] === 'number') {
            item.offerDetails[key] = parseFloat((item.offerDetails[key] * rate).toFixed(2));
        }
    });

    item.discountedPrice = item.offerDetails.discountedPrice;
};

async function resolveSlugsAndShapesV2(params) {
    const { shape, categorySlug, collectionSlug, subCategorySlug } = params;

    const shapes = (shape && shape.length > 0)
        ? (Array.isArray(shape) ? shape : shape.split(",")).map(s => s.trim().toLowerCase())
        : [];

    const categorySlugPromise = categorySlug
        ? Category.findOne({ slug: categorySlug }).select("_id").lean()
        : Promise.resolve(null);

    const collectionSlugPromise = collectionSlug
        ? CollectionModel.findOne({ slug: collectionSlug }).select("_id").lean()
        : Promise.resolve(null);

    const subCategorySlugPromise = subCategorySlug
        ? Category.findOne({ slug: subCategorySlug }).select("_id").lean()
        : Promise.resolve(null);

    const shapeRegex = shapes.map(s => new RegExp(`^${escapeRegexV2(s)}$`, "i"));
    const shapesPromise = shapes.length > 0
        ? Parameter.find({
            type: "shape",
            $or: [
                { name: { $in: shapeRegex } },
                { code: { $in: shapeRegex } }
            ]
        }).select("_id").lean()
        : Promise.resolve([]);

    const [catDoc, colDoc, shapeDocs, subCatDoc] = await Promise.all([
        categorySlugPromise,
        collectionSlugPromise,
        shapesPromise,
        subCategorySlugPromise
    ]);

    return { shapes, catDoc, colDoc, shapeDocs, subCatDoc };
}

function buildMatchFilterV2(params, catDoc, colDoc, subCatDoc) {
    const {
        metalType,
        metalStamp,
        metals,
        category,
        categorySlug,
        collectionSlug,
        subCategory,
        subCategorySlug,
        search,
        minWeight,
        maxWeight,
        minPrice,
        maxPrice,
        collectionId,
        tags,
        ids,
        lastNDays
    } = params;

    const matchFilter = {
        isDeleted: 0,
        status: Constant.PRODUCT_STATUS.AVALIABLE
    };

    if (ids && ids.length > 0) {
        const productIds = toObjectIdsV2(ids);
        if (productIds.length > 0) {
            matchFilter._id = { $in: productIds };
        }
    }

    if (lastNDays !== undefined && !isNaN(Number(lastNDays))) {
        const date = new Date();
        date.setDate(date.getDate() - Number(lastNDays));
        matchFilter.createdAt = { $gte: date };
    }

    const addAndFilter = (filter) => {
        matchFilter.$and ??= [];
        matchFilter.$and.push(filter);
    };

    if ((!metals || metals.length === 0) && (!minWeight && !maxWeight)) {
        matchFilter.$or = [
            { parentItemCode: { $exists: false } },
            { parentItemCode: null },
            { parentItemCode: "" }
        ];
    }

    const metalIds = toObjectIdsV2([
        ...(Array.isArray(metals) ? metals : []),
        ...(Array.isArray(metalType) ? metalType : []),
        ...(Array.isArray(metalStamp) ? metalStamp : [])
    ]);
    if (metalIds.length > 0) {
        matchFilter.metalId = { $in: metalIds };
    }

    if (categorySlug) {
        if (catDoc) {
            addAndFilter({
                $or: [
                    { categoryId: catDoc._id },
                    { subCategoryId: catDoc._id }
                ]
            });
        } else {
            matchFilter._id = null;
        }
    }

    if (subCategorySlug) {
        if (subCatDoc) {
            addAndFilter({
                $or: [
                    { subCategoryId: subCatDoc._id },
                    { categoryId: subCatDoc._id }
                ]
            });
        } else {
            matchFilter._id = null;
        }
    }

    if (collectionSlug) {
        if (colDoc) {
            matchFilter.collectionId = colDoc._id;
        } else {
            matchFilter._id = null;
        }
    }

    const categoryIds = toObjectIdsV2(category);
    if (categoryIds.length > 0) {
        addAndFilter({
            $or: [
                { categoryId: { $in: categoryIds } },
                { subCategoryId: { $in: categoryIds } }
            ]
        });
    }

    const subIds = toObjectIdsV2(subCategory);
    if (subIds.length > 0) {
        addAndFilter({
            $or: [
                { subCategoryId: { $in: subIds } },
                { categoryId: { $in: subIds } }
            ]
        });
    }

    if (search && typeof search === "string" && search.trim()) {
        const rx = new RegExp(escapeRegexV2(search.trim()), "i");
        addAndFilter({
            $or: [
                { productTitle: rx },
                { itemCode: rx },
                { designNumber: rx }
            ]
        });
    }

    if (minWeight !== undefined || maxWeight !== undefined) {
        matchFilter.appxMetalWgt = {};
        if (minWeight !== undefined) matchFilter.appxMetalWgt.$gte = parseFloat(minWeight);
        if (maxWeight !== undefined) matchFilter.appxMetalWgt.$lte = parseFloat(maxWeight);
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
        matchFilter.finalPrice = {};
        if (minPrice !== undefined) matchFilter.finalPrice.$gte = parseFloat(minPrice);
        if (maxPrice !== undefined) matchFilter.finalPrice.$lte = parseFloat(maxPrice);
    }

    const collectionIds = toObjectIdsV2(collectionId);
    if (collectionIds.length > 0) {
        matchFilter.collectionId = { $in: collectionIds };
    }

    const tagIds = toObjectIdsV2(tags);
    if (tagIds.length > 0) {
        matchFilter.tags = { $in: tagIds };
    }

    return matchFilter;
}

export function getProductListPipelineV2(matchFilter, shapes, shapeDocs, sortPrice, page, limit, exchangeRate) {
    const pipeline = [
        { $match: matchFilter }
    ];

    if (shapes.length > 0) {
        const parameterIds = shapeDocs.map(p => p._id);
        pipeline.push(
            {
                $lookup: {
                    from: "productstones",
                    let: { productId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$productId", "$$productId"] } } },
                        {
                            $match: {
                                $expr: {
                                    $cond: {
                                        if: { $eq: [{ $type: "$shape" }, "objectId"] },
                                        then: { $in: ["$shape", parameterIds] },
                                        else: { $in: [{ $toLower: "$shape" }, shapes] }
                                    }
                                }
                            }
                        }
                    ],
                    as: "stoneDetails"
                }
            },
            { $match: { stoneDetails: { $ne: [] } } }
        );
    }

    let sortStage = { createdAt: -1 };
    if (sortPrice === "lowToHigh") {
        sortStage = { finalPrice: 1 };
    } else if (sortPrice === "highToLow") {
        sortStage = { finalPrice: -1 };
    }

    pipeline.push(
        { $sort: sortStage },
        { $skip: (page - 1) * limit },
        { $limit: Number(limit) }
    );

    // 1. Metals lookup
    pipeline.push(
        {
            $lookup: {
                from: "metals",
                localField: "metalId",
                foreignField: "_id",
                as: "metalDetails"
            }
        },
        { $unwind: { path: "$metalDetails", preserveNullAndEmptyArrays: true } }
    );

    // 2. Append parent media URLs using the built-in stage
    pipeline.push(appendMediaUrls());

    // 3. Variants lookup using index-covered matching
    pipeline.push({
        $lookup: {
            from: "productmasters",
            let: {
                itemCode: "$itemCode",
                parentCategoryId: "$categoryId"
            },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ["$parentItemCode", "$$itemCode"] },
                                { $eq: ["$isDeleted", 0] },
                                { $eq: ["$status", "available"] }
                            ]
                        }
                    }
                },
                // metals lookup for variants
                {
                    $lookup: {
                        from: "metals",
                        localField: "metalId",
                        foreignField: "_id",
                        as: "metalDetails"
                    }
                },
                { $unwind: { path: "$metalDetails", preserveNullAndEmptyArrays: true } },
                // append variant media URLs
                appendMediaUrls(),
                // sizes lookup for variants
                {
                    $lookup: {
                        from: "sizes",
                        let: {
                            categoryId: { $ifNull: ["$categoryId", "$$parentCategoryId"] }
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ["$category", "$$categoryId"]
                                    },
                                    isDefault: true,
                                    status: "ACTIVE"
                                }
                            },
                            { $limit: 1 }
                        ],
                        as: "sizeDetails"
                    }
                },
                { $unwind: { path: "$sizeDetails", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        _id: 1,
                        itemCode: 1,
                        parentItemCode: 1,
                        productTitle: 1,
                        images: 1,
                        slug: 1,
                        finalPrice: 1,
                        TotalDiamondPrice: 1,
                        labourPrice: 1,
                        CenterDiamondPrice: 1,
                        SideDiamondPrice: 1,
                        offerDetails: 1,
                        discountedPrice: 1,
                        metalId: 1,
                        categoryId: 1,
                        subCategoryId: 1,
                        collectionId: 1,
                        tags: 1,
                        sizeDetails: 1,
                        metalTypeDetail: {
                            _id: "$metalDetails._id",
                            metalName: "$metalDetails.type",
                            colorCode: "$metalDetails.color"
                        },
                        metalStampDetail: {
                            _id: "$metalDetails._id",
                            karat: "$metalDetails.stamp"
                        }
                    }
                }
            ],
            as: "variants"
        }
    });

    // 3b. Sizes lookup matching parent categoryId
    pipeline.push(
        {
            $lookup: {
                from: "sizes",
                let: { categoryId: "$categoryId" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$category", "$$categoryId"]
                            },
                            isDefault: true,
                            status: "ACTIVE"
                        }
                    },
                    { $limit: 1 }
                ],
                as: "sizeDetails"
            }
        },
        { $unwind: { path: "$sizeDetails", preserveNullAndEmptyArrays: true } }
    );

    // 4. Flat projection stage
    pipeline.push(
        {
            $project: {
                _id: 1,
                productTitle: 1,
                slug: 1,
                images: 1,
                itemCode: 1,
                finalPrice: 1,
                TotalDiamondPrice: 1,
                labourPrice: 1,
                CenterDiamondPrice: 1,
                SideDiamondPrice: 1,
                appxMetalWgt: 1,
                parentItemCode: 1,
                offerDetails: 1,
                discountedPrice: 1,
                categoryId: 1,
                subCategoryId: 1,
                collectionId: 1,
                tags: 1,
                metalId: 1,
                variants: 1,
                sizeDetails: 1,
                metalTypeDetail: {
                    _id: "$metalDetails._id",
                    metalName: "$metalDetails.type",
                    colorCode: "$metalDetails.color"
                },
                metalStampDetail: {
                    _id: "$metalDetails._id",
                    karat: "$metalDetails.stamp"
                }
            }
        }
    );

    return pipeline;
}

export async function getProductListServiceV2(params) {
    const {
        page = 1,
        limit = 12,
        sortPrice,
        exchangeRate,
    } = params;

    const { shapes, catDoc, colDoc, shapeDocs, subCatDoc } = await resolveSlugsAndShapesV2(params);
    const matchFilter = buildMatchFilterV2(params, catDoc, colDoc, subCatDoc);

    const totalCountPromise = ProductMaster.countDocuments(matchFilter);
    const pipeline = getProductListPipelineV2(matchFilter, shapes, shapeDocs, sortPrice, page, limit, exchangeRate);
    const productsPromise = ProductMaster.aggregate(pipeline);

    const [total, products] = await Promise.all([
        totalCountPromise,
        productsPromise
    ]);

    const rate = exchangeRate || 1;

    let convertedProducts = products;
    if (rate !== 1) {
        if (products.length > 0) {
            convertedProducts = adjustPricesForCurrency(products, rate);
        }
    }

    convertedProducts.forEach(prod => {
        // adjustPricesForCurrency (above) already converted offerDetails fields
        // (÷rate). Just sync the top-level discountedPrice. The previous code
        // re-multiplied by rate here, cancelling the conversion.
        if (prod.offerDetails) {
            prod.discountedPrice = prod.offerDetails.discountedPrice;
        }

        if (prod.variants && Array.isArray(prod.variants)) {
            prod.variants.forEach(variant => {
                if (variant.offerDetails) {
                    variant.discountedPrice = variant.offerDetails.discountedPrice;
                }

                variant.categoryId = variant.categoryId || prod.categoryId;
                variant.subCategoryId = (variant.subCategoryId && variant.subCategoryId.length > 0) ? variant.subCategoryId : prod.subCategoryId;
                variant.collectionId = (variant.collectionId && variant.collectionId.length > 0) ? variant.collectionId : prod.collectionId;
                variant.tags = (variant.tags && variant.tags.length > 0) ? variant.tags : prod.tags;
                variant.sizeDetails = variant.sizeDetails || prod.sizeDetails;
            });
        }
    });

    return { total, products: convertedProducts };
}

export async function getProductDetailsServiceV2({ slug, queryParams, baseUrl, exchangeRate }) {
    const matchQuery = buildProductMatchQuery(slug);

    const pipeline = [
        { $match: matchQuery },
        // 1. Metals lookup for parent product
        {
            $lookup: {
                from: "metals",
                localField: "metalId",
                foreignField: "_id",
                as: "metalDetails"
            }
        },
        { $unwind: { path: "$metalDetails", preserveNullAndEmptyArrays: true } },

        // 2. Category lookup for parent categoryDetails
        {
            $lookup: {
                from: "categories",
                localField: "categoryId",
                foreignField: "_id",
                as: "categoryDetails"
            }
        },
        { $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true } },

        // 3. Sizes lookup matching parent categoryId
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
                                    { $eq: ["$isDeleted", 0] },
                                    { $eq: ["$status", "ACTIVE"] }
                                ]
                            }
                        }
                    },
                    { $sort: { sort: 1 } }
                ],
                as: "sizes"
            }
        },

        // 4. Subcategories lookup
        {
            $lookup: {
                from: "categories",
                localField: "subCategoryId",
                foreignField: "_id",
                as: "subCategoryDetails"
            }
        },

        // 5. Collections lookup
        {
            $lookup: {
                from: "collections",
                localField: "collectionId",
                foreignField: "_id",
                as: "collectionDetails"
            }
        },
        { $unwind: { path: "$collectionDetails", preserveNullAndEmptyArrays: true } },

        // 6. Parent product stones lookup with shape parameter code/image
        {
            $lookup: {
                from: "productstones",
                localField: "_id",
                foreignField: "productId",
                pipeline: [
                    {
                        $lookup: {
                            from: "parameters",
                            localField: "shape",
                            foreignField: "_id",
                            as: "shapeParam"
                        }
                    },
                    { $unwind: { path: "$shapeParam", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "parameters",
                            let: { val: "$color" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: [{ $toString: "$_id" }, { $toString: "$$val" }]
                                        }
                                    }
                                }
                            ],
                            as: "colorParam"
                        }
                    },
                    { $unwind: { path: "$colorParam", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "parameters",
                            let: { val: "$clarity" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: [{ $toString: "$_id" }, { $toString: "$$val" }]
                                        }
                                    }
                                }
                            ],
                            as: "clarityParam"
                        }
                    },
                    { $unwind: { path: "$clarityParam", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "stonegroups",
                            localField: "stoneGroup",
                            foreignField: "_id",
                            as: "stoneGroupDetail"
                        }
                    },
                    { $unwind: { path: "$stoneGroupDetail", preserveNullAndEmptyArrays: true } },
                    {
                        $addFields: {
                            shape: { $ifNull: ["$shapeParam.code", "$shape"] },
                            shapeImage: { $ifNull: ["$shapeParam.image", ""] },
                            color: { $ifNull: ["$colorParam.code", "$stoneGroupDetail.color", "$color"] },
                            clarity: { $ifNull: ["$clarityParam.code", "$stoneGroupDetail.clarity", "$clarity"] },
                            stoneGroup: { $ifNull: ["$stoneGroupDetail", null] },
                            // ProductStone.price is ALREADY the line total
                            // (rate-per-carat x weight), so multiplying by
                            // weight again double-counted it. And StoneGroup has
                            // no `amount` field — that fallback was always 0.
                            // Prefer the stored total; recompute from the group's
                            // per-carat rate only when it is missing.
                            finalValue: {
                                $let: {
                                    vars: {
                                        storedTotal: { $ifNull: ["$price", 0] },
                                        rate: {
                                            $ifNull: [
                                                "$stoneGroupDetail.lgd_price",
                                                { $ifNull: ["$stoneGroupDetail.natural_price", 0] }
                                            ]
                                        },
                                        wt: {
                                            $ifNull: [
                                                "$weight",
                                                { $ifNull: ["$totalCarat", { $ifNull: ["$wgt", 0] }] }
                                            ]
                                        }
                                    },
                                    in: {
                                        $cond: [
                                            { $gt: ["$$storedTotal", 0] },
                                            "$$storedTotal",
                                            { $multiply: ["$$rate", "$$wt"] }
                                        ]
                                    }
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            shapeParam: 0,
                            stoneGroupDetail: 0
                        }
                    }
                ],
                as: "stoneDetails"
            }
        },

        // 6b. Product-level weights (totalCarat, grossWeight).
        PRODUCT_WEIGHTS_STAGE,

        // 7. Media fields hydration using standard app image util
        appendMediaUrls(),

        // 8. Variants lookup (parent code or item code match)
        {
            $lookup: {
                from: "productmasters",
                let: {
                    itemCode: "$itemCode",
                    parentCode: "$parentItemCode",
                    parentId: "$_id",
                    parentCategoryId: "$categoryId",
                    parentSubCategoryId: "$subCategoryId",
                    parentCollectionId: "$collectionId",
                    parentTags: "$tags"
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$isDeleted", 0] },
                                    { $eq: ["$status", "available"] },
                                    {
                                        $or: [
                                            { $eq: ["$itemCode", "$$itemCode"] },
                                            { $eq: ["$parentItemCode", "$$itemCode"] },
                                            {
                                                $and: [
                                                    { $ne: ["$$parentCode", ""] },
                                                    { $ne: ["$$parentCode", null] },
                                                    { $eq: ["$parentItemCode", "$$parentCode"] }
                                                ]
                                            },
                                            {
                                                $and: [
                                                    { $ne: ["$$parentCode", ""] },
                                                    { $ne: ["$$parentCode", null] },
                                                    { $eq: ["$itemCode", "$$parentCode"] }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    },
                    {
                        $addFields: {
                            parentProductId: {
                                $cond: {
                                    if: { $eq: ["$parentItemCode", "$$itemCode"] },
                                    then: "$$parentId",
                                    else: null
                                }
                            },
                            categoryId: { $ifNull: ["$categoryId", "$$parentCategoryId"] },
                            subCategoryId: {
                                $cond: {
                                    if: { $gt: [{ $size: { $ifNull: ["$subCategoryId", []] } }, 0] },
                                    then: "$subCategoryId",
                                    else: "$$parentSubCategoryId"
                                }
                            },
                            collectionId: {
                                $cond: {
                                    if: { $gt: [{ $size: { $ifNull: ["$collectionId", []] } }, 0] },
                                    then: "$collectionId",
                                    else: "$$parentCollectionId"
                                }
                            },
                            tags: {
                                $cond: {
                                    if: { $gt: [{ $size: { $ifNull: ["$tags", []] } }, 0] },
                                    then: "$tags",
                                    else: "$$parentTags"
                                }
                            }
                        }
                    },
                    // metal lookup for variant
                    {
                        $lookup: {
                            from: "metals",
                            localField: "metalId",
                            foreignField: "_id",
                            as: "metalDetails"
                        }
                    },
                    { $unwind: { path: "$metalDetails", preserveNullAndEmptyArrays: true } },
                    // stones lookup for variant
                    {
                        $lookup: {
                            from: "productstones",
                            localField: "_id",
                            foreignField: "productId",
                            pipeline: [
                                {
                                    $lookup: {
                                        from: "parameters",
                                        localField: "shape",
                                        foreignField: "_id",
                                        as: "shapeParam"
                                    }
                                },
                                { $unwind: { path: "$shapeParam", preserveNullAndEmptyArrays: true } },
                                {
                                    $lookup: {
                                        from: "parameters",
                                        let: { val: "$color" },
                                        pipeline: [
                                            {
                                                $match: {
                                                    $expr: {
                                                        $eq: [{ $toString: "$_id" }, { $toString: "$$val" }]
                                                    }
                                                }
                                            }
                                        ],
                                        as: "colorParam"
                                    }
                                },
                                { $unwind: { path: "$colorParam", preserveNullAndEmptyArrays: true } },
                                {
                                    $lookup: {
                                        from: "parameters",
                                        let: { val: "$clarity" },
                                        pipeline: [
                                            {
                                                $match: {
                                                    $expr: {
                                                        $eq: [{ $toString: "$_id" }, { $toString: "$$val" }]
                                                    }
                                                }
                                            }
                                        ],
                                        as: "clarityParam"
                                    }
                                },
                                { $unwind: { path: "$clarityParam", preserveNullAndEmptyArrays: true } },
                                {
                                    $lookup: {
                                        from: "stonegroups",
                                        localField: "stoneGroup",
                                        foreignField: "_id",
                                        as: "stoneGroupDetail"
                                    }
                                },
                                { $unwind: { path: "$stoneGroupDetail", preserveNullAndEmptyArrays: true } },
                                {
                                    $project: {
                                        shape: { $ifNull: ["$shapeParam.code", "$shape"] },
                                        shapeImage: { $ifNull: ["$shapeParam.image", ""] },
                                        totalCarat: 1,
                                        color: { $ifNull: ["$colorParam.code", "$stoneGroupDetail.color", "$color"] },
                                        clarity: { $ifNull: ["$clarityParam.code", "$stoneGroupDetail.clarity", "$clarity"] },
                                        type: 1,
                                        pieces: 1,
                                        wgt: 1,
                                        weight: 1,
                                        price: 1,
                                        size: 1,
                                        stoneGroup: { $ifNull: ["$stoneGroupDetail", null] },
                                        // StoneGroup has no `amount` field, so this
                                        // line was hardcoded to 0 for every variant.
                                        // Use the stored line total; fall back to
                                        // the group's per-carat rate x weight.
                                        finalValue: {
                                            $let: {
                                                vars: {
                                                    storedTotal: { $ifNull: ["$price", 0] },
                                                    rate: {
                                                        $ifNull: [
                                                            "$stoneGroupDetail.lgd_price",
                                                            { $ifNull: ["$stoneGroupDetail.natural_price", 0] }
                                                        ]
                                                    },
                                                    wt: {
                                                        $ifNull: [
                                                            "$weight",
                                                            { $ifNull: ["$totalCarat", { $ifNull: ["$wgt", 0] }] }
                                                        ]
                                                    }
                                                },
                                                in: {
                                                    $cond: [
                                                        { $gt: ["$$storedTotal", 0] },
                                                        "$$storedTotal",
                                                        { $multiply: ["$$rate", "$$wt"] }
                                                    ]
                                                }
                                            }
                                        }
                                    }
                                }
                            ],
                            as: "stoneDetails"
                        }
                    },
                    // Per-variant weights; see the note on the V1 variant pipeline.
                    PRODUCT_WEIGHTS_STAGE,
                    {
                        $addFields: {
                            stone: { $arrayElemAt: ["$stoneDetails", 0] }
                        }
                    },
                    // Hydrate media locations for variants
                    appendMediaUrls(),
                    {
                        $project: {
                            productDesc: 1,
                            videos: 1,
                            appxMetalWgt: 1,
                            totalCarat: 1,
                            grossWeight: 1,
                            // Per-variant shipping lead time — the PDP shows it and
                            // variant switches (carat/metal) must carry their own.
                            shipmentDays: 1,
                            finalPrice: 1,
                            metalPrice: 1,
                            labourPrice: 1,
                            otherChargePrice: 1,
                            CenterDiamondPrice: 1,
                            SideDiamondPrice: 1,
                            TotalDiamondPrice: 1,
                            stoneDetails: 1,
                            sizes: 1,
                            _id: 1,
                            itemCode: 1,
                            parentItemCode: 1,
                            parentProductId: 1,
                            productTitle: 1,
                            offerDetails: 1,
                            discountedPrice: 1,
                            categoryId: 1,
                            subCategoryId: 1,
                            collectionId: 1,
                            tags: 1,
                            images: 1,
                            labourCode: 1,
                            otherChargeCode: 1,
                            width: 1,
                            length: 1,
                            height: 1,
                            slug: 1,
                            metalTypeDetail: {
                                _id: "$metalDetails._id",
                                metalName: "$metalDetails.type",
                                colorCode: "$metalDetails.color"
                            },
                            metalStampDetail: {
                                _id: "$metalDetails._id",
                                karat: "$metalDetails.stamp"
                            },
                            shape: "$stone.shape",
                            shapeImage: "$stone.shapeImage",
                            // NOTE: `totalCarat` is deliberately NOT re-mapped to
                            // "$stone.totalCarat" here. It is a duplicate key that
                            // silently overrode the product-level total computed by
                            // PRODUCT_WEIGHTS_STAGE, so a variant reported only its
                            // first stone's carat. Callers that want a single
                            // stone's carat read stoneDetails[] directly.
                            color: "$stone.color",
                            clarity: "$stone.clarity",
                        }
                    }
                ],
                as: "variants"
            }
        },

        // 9. Similar Products
        {
            $lookup: {
                from: "productmasters",
                let: { codes: { $ifNull: ["$similarProducts", []] } },
                pipeline: [
                    {
                        $match: {
                            $expr: { $in: ["$itemCode", "$$codes"] },
                            isDeleted: 0,
                            status: "available"
                        }
                    },
                    appendMediaUrls(),
                    {
                        $project: {
                            _id: 1, itemCode: 1, slug: 1,
                            productTitle: 1, finalPrice: 1,
                            images: { $slice: ["$images", 1] }
                        }
                    }
                ],
                as: "similarProductDetails"
            }
        },

        // 10. Combine With
        {
            $lookup: {
                from: "productmasters",
                let: { codes: { $ifNull: ["$combineWith", []] } },
                pipeline: [
                    {
                        $match: {
                            $expr: { $in: ["$itemCode", "$$codes"] },
                            isDeleted: 0,
                            status: "available"
                        }
                    },
                    appendMediaUrls(),
                    {
                        $project: {
                            _id: 1, itemCode: 1, slug: 1,
                            productTitle: 1, finalPrice: 1,
                            images: { $slice: ["$images", 1] }
                        }
                    }
                ],
                as: "combineWithDetails"
            }
        },

        // 11. Projections
        {
            $project: {
                _id: 1,
                designNumber: 1,
                itemCode: 1,
                parentItemCode: 1,
                productTitle: 1,
                productDesc: 1,
                categoryId: 1,
                subCategoryId: 1,
                collectionId: 1,
                tags: 1,
                gender: 1,
                metalId: 1,
                appxMetalWgt: 1,
                // Derived by PRODUCT_WEIGHTS_STAGE above. This projection is a
                // WHITELIST — omitting them here drops them silently.
                totalCarat: 1,
                grossWeight: 1,
                qty: 1,
                height: 1,
                width: 1,
                length: 1,
                labourCode: 1,
                otherChargeCode: 1,
                isEngraving: 1,
                images: 1,
                videos: 1,
                slug: 1,
                haveChain: 1,
                cMetalId: 1,
                cWgt: 1,
                cLength: 1,
                shipmentDays: 1,
                SEODetails: 1,
                status: 1,
                isDeleted: 1,
                createdBy: 1,
                createdAt: 1,
                updatedAt: 1,
                offerDetails: 1,
                discountedPrice: 1,
                CenterDiamondPrice: 1,
                SideDiamondPrice: 1,
                TotalDiamondPrice: 1,
                finalPrice: 1,
                labourPrice: 1,
                metalPrice: 1,
                otherChargePrice: 1,

                metalTypeDetail: {
                    _id: "$metalDetails._id",
                    metalName: "$metalDetails.type",
                    colorCode: "$metalDetails.color"
                },
                metalStampDetail: {
                    _id: "$metalDetails._id",
                    karat: "$metalDetails.stamp"
                },
                metalDetails: 1,
                categoryDetails: 1,
                subCategoryDetails: 1,
                collectionDetails: 1,
                stoneDetails: 1,
                variants: 1,
                sizes: 1,
                similarProducts: 1,
                combineWith: 1,
                similarProductDetails: 1,
                combineWithDetails: 1
            }
        }
    ];

    const result = await ProductMaster.aggregate(pipeline);
    if (!result.length) {
        return null;
    }

    const productData = result[0];
    const parentProductId = productData._id?.toString();

    // Fetch labelMap and activeOffers in parallel
    const now = new Date();
    const [labelMap, activeOffers] = await Promise.all([
        buildLabelMap(),
        Offer.find({
            status: "active",
            isActive: true,
            isDeleted: 0,
            startDate: { $lte: now },
            endDate: { $gte: now }
        }).lean()
    ]);

    // Resolve selector options for center stones
    await resolveCenterStoneOptions(productData, labelMap);

    // Apply custom stone pricing overrides first
    // Snapshot the product's own grade BEFORE the override stamps the
    // selected grade onto stoneDetails.
    stampDefaultStoneSelection(productData);

    await applyCustomStoneOverrides(productData, queryParams);

    // Then adjust prices for the user chosen ringsize
    await applyRingSizeAdjustments(productData, queryParams.ringsize);

    // Apply the best LIVE offer ALWAYS (see the V1 note above) — direct load,
    // refresh and SSR must show the same offer as client navigation.
    {
        const applyOfferDetails = (prod, isVariant = false) => {
            if (!prod) return;
            if (isVariant && parentProductId) {
                prod.parentProductId = prod.parentProductId || parentProductId;
            }

            const bestDetails = resolveBestOfferForProduct(activeOffers, prod);

            if (bestDetails) {
                prod.offerDetails = bestDetails;
                prod.discountedPrice = bestDetails.discountedPrice;
            } else {
                prod.offerDetails = null;
                prod.discountedPrice = prod.finalPrice;
            }
        };

        applyOfferDetails(productData, false);
        if (productData.variants && Array.isArray(productData.variants)) {
            productData.variants.forEach(variant => applyOfferDetails(variant, true));
        }
    }

    // Final formatting of assets and labels
    formatMediaUrlsAndLabels(productData, labelMap, baseUrl);

    // Convert prices to target currency
    const convertedProductData = adjustPricesForCurrency(productData, exchangeRate);

    // Adjust offerDetails currency values
    if (convertedProductData.offerDetails) {
        const rate = exchangeRate || 1;
        convertedProductData.offerDetails.originalValue = parseFloat((convertedProductData.offerDetails.originalValue * rate).toFixed(2));
        convertedProductData.offerDetails.discountedValue = parseFloat((convertedProductData.offerDetails.discountedValue * rate).toFixed(2));
        convertedProductData.offerDetails.mrp = parseFloat((convertedProductData.offerDetails.mrp * rate).toFixed(2));
        convertedProductData.offerDetails.discountedPrice = parseFloat((convertedProductData.offerDetails.discountedPrice * rate).toFixed(2));
        convertedProductData.offerDetails.discountAmount = parseFloat((convertedProductData.offerDetails.discountAmount * rate).toFixed(2));
        convertedProductData.discountedPrice = convertedProductData.offerDetails.discountedPrice;
    }

    if (convertedProductData.variants && Array.isArray(convertedProductData.variants)) {
        convertedProductData.variants.forEach(variant => {
            if (variant.offerDetails) {
                const rate = exchangeRate || 1;
                variant.offerDetails.originalValue = parseFloat((variant.offerDetails.originalValue * rate).toFixed(2));
                variant.offerDetails.discountedValue = parseFloat((variant.offerDetails.discountedValue * rate).toFixed(2));
                variant.offerDetails.mrp = parseFloat((variant.offerDetails.mrp * rate).toFixed(2));
                variant.offerDetails.discountedPrice = parseFloat((variant.offerDetails.discountedPrice * rate).toFixed(2));
                variant.offerDetails.discountAmount = parseFloat((variant.offerDetails.discountAmount * rate).toFixed(2));
                variant.discountedPrice = variant.offerDetails.discountedPrice;
            }
        });
    }

    return convertedProductData;
}
