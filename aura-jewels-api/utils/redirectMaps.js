import Category from "../models/category.model.js";
import Collection from "../models/collection.model.js";
import ProductMaster from "../models/product.model.js";
import Offer from "../models/offer.model.js";

// Walks every leaf object in `value` collecting redirect targets so they
// can be batch-resolved once, instead of per-redirect lookups.
//
// `seen` short-circuits circular structures. Mongoose subdocs carry a
// `$__.parent` ref to the owning doc; without this guard the recursion
// blew the stack with "Maximum call stack size exceeded". Callers that
// pass `.lean()` POJOs don't strictly need this, but the guard costs
// nothing and prevents the next regression.
// Same plain-object guard the decorators use — ObjectId / Date / Buffer
// have internal state that the walker would otherwise descend into and
// scatter into the result.
const isPlainObject = (value) => {
    if (!value || typeof value !== "object") return false;
    const proto = Object.getPrototypeOf(value);
    return proto === null || proto === Object.prototype;
};

const collectRedirectIds = (value, sets, seen = new WeakSet()) => {
    if (!value) return;
    if (Array.isArray(value)) {
        if (seen.has(value)) return;
        seen.add(value);
        for (const v of value) collectRedirectIds(v, sets, seen);
        return;
    }
    if (typeof value !== "object") return;
    // Non-plain object (ObjectId etc.) — opaque leaf, nothing to collect.
    if (!isPlainObject(value)) return;
    if (seen.has(value)) return;
    seen.add(value);
    if (value.type) {
        if (value.type === "list" && value.listOf === "category" && value.refId) {
            sets.categoryIds.add(value.refId.toString());
        }
        // Multi-select category redirects carry an ids array (single-category
        // still resolves via refId above; multi uses raw ids in the URL, but
        // collecting them is harmless and future-proof).
        if (value.type === "list" && value.listOf === "category" && Array.isArray(value.categoryIds)) {
            value.categoryIds.forEach((id) => id && sets.categoryIds.add(id.toString()));
        }
        if (value.type === "list" && value.listOf === "collection" && value.refId) {
            sets.collectionIds.add(value.refId.toString());
        }
        if (value.type === "list" && value.listOf === "offer" && value.refId) {
            sets.offerIds.add(value.refId.toString());
        }
        // A category list may deep-link to a subcategory (also a Category doc),
        // so its slug needs resolving too.
        if (value.type === "list" && value.subCategoryId) {
            sets.categoryIds.add(value.subCategoryId.toString());
        }
        if (value.type === "product") {
            if (value.productId) sets.productIds.add(value.productId.toString());
            // Product picked by SKU (itemCode) instead of id — resolve to slug.
            if (value.itemCode) sets.itemCodes.add(String(value.itemCode));
        }
    }
    for (const v of Object.values(value)) collectRedirectIds(v, sets, seen);
};

// Builds the {categoryById, collectionById, productById} maps that
// `decorateRedirects` needs in order to resolve refId/productId → slug.
// Pass any value tree(s) — usually the array(s) of sideCards / banners
// you're about to decorate. Returns empty maps if no redirects reference
// any target.
export const buildRedirectMaps = async (...trees) => {
    const sets = {
        categoryIds: new Set(),
        collectionIds: new Set(),
        productIds: new Set(),
        offerIds: new Set(),
        itemCodes: new Set(),
    };
    for (const t of trees) collectRedirectIds(t, sets);

    const [cats, cols, prods, offers, prodsByCode] = await Promise.all([
        sets.categoryIds.size
            ? Category.find(
                  { _id: { $in: Array.from(sets.categoryIds) } },
                  { _id: 1, slug: 1, categoryName: 1, image: 1 },
              ).lean()
            : [],
        sets.collectionIds.size
            ? Collection.find(
                  { _id: { $in: Array.from(sets.collectionIds) } },
                  { _id: 1, slug: 1, collectionName: 1, image: 1, pageBanner: 1 },
              ).lean()
            : [],
        sets.productIds.size
            ? ProductMaster.find(
                  { _id: { $in: Array.from(sets.productIds) } },
                  { _id: 1, slug: 1, productTitle: 1 },
              ).lean()
            : [],
        sets.offerIds.size
            ? Offer.find(
                  { _id: { $in: Array.from(sets.offerIds) } },
                  { _id: 1, slug: 1, code: 1, name: 1 },
              ).lean()
            : [],
        sets.itemCodes.size
            ? ProductMaster.find(
                  { itemCode: { $in: Array.from(sets.itemCodes) } },
                  { _id: 1, slug: 1, itemCode: 1 },
              ).lean()
            : [],
    ]);

    return {
        categoryById: new Map(cats.map((c) => [c._id.toString(), c])),
        collectionById: new Map(cols.map((c) => [c._id.toString(), c])),
        productById: new Map(prods.map((p) => [p._id.toString(), p])),
        offerById: new Map(offers.map((o) => [o._id.toString(), o])),
        productByItemCode: new Map(prodsByCode.map((p) => [String(p.itemCode), p])),
    };
};
