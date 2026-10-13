import HomeSection from "../models/homeSection.model.js";
import Category from "../models/category.model.js";
import Collection from "../models/collection.model.js";
import ProductMaster from "../models/product.model.js";
import {
    HOME_SECTION_KEY_LIST,
    HOME_SECTION_KEYS
} from "../constants/homeSection.constant.js";
import { HOME_SECTION_DEFAULTS } from "../constants/homeSectionDefaults.js";
import { decorateRedirects } from "../utils/homeRedirect.js";
import Constant from "../constants/user.constant.js";

let seedPromise = null;

// Seed the 11 fixed sections on first read. Idempotent: only inserts rows
// whose `key` is missing. Concurrent callers share the same promise.
export const ensureHomeSectionsSeeded = async () => {
    if (seedPromise) return seedPromise;
    seedPromise = (async () => {
        const existing = await HomeSection.find({}, { key: 1 }).lean();
        const have = new Set(existing.map((s) => s.key));
        const missing = HOME_SECTION_KEY_LIST.filter((k) => !have.has(k));
        if (!missing.length) return;
        const docs = missing.map((key, idx) => ({
            key,
            title: HOME_SECTION_DEFAULTS[key]?.title || key,
            enabled: true,
            content: HOME_SECTION_DEFAULTS[key]?.content || {},
            sort: HOME_SECTION_KEY_LIST.indexOf(key) >= 0 ? HOME_SECTION_KEY_LIST.indexOf(key) : idx
        }));
        await HomeSection.insertMany(docs, { ordered: false });
    })().catch((err) => {
        // Allow retry on next call if seeding failed transiently.
        seedPromise = null;
        throw err;
    });
    return seedPromise;
};

export const list_home_sections_db = async () => {
    await ensureHomeSectionsSeeded();
    return HomeSection.find({}).sort({ sort: 1, key: 1 }).lean();
};

export const get_home_section_by_key_db = async (key) => {
    await ensureHomeSectionsSeeded();
    return HomeSection.findOne({ key }).lean();
};

export const update_home_section_db = async (key, patch, userId) => {
    await ensureHomeSectionsSeeded();
    const update = { updatedBy: userId || null };
    if (patch.content !== undefined) update.content = patch.content;
    if (patch.enabled !== undefined) update.enabled = !!patch.enabled;
    if (patch.title !== undefined) update.title = patch.title;
    if (patch.sort !== undefined) update.sort = Number(patch.sort) || 0;
    return HomeSection.findOneAndUpdate({ key }, update, { new: true }).lean();
};

// Formats a numeric price into the storefront-display string used by the
// FeaturedProducts card. Keeping this in one place so the price text stays
// consistent with the rest of the catalog UI.
const formatPrice = (value) => {
    if (value === null || value === undefined || value === "") return "";
    const num = Number(value);
    if (!Number.isFinite(num)) return "";
    return `Rs. ${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Product image MediaLocation is stored as either a full CDN URL or a bare
// filename — bare values need the CloudFront product-list prefix the same way
// `utils/imageUrl.appendMediaUrls` does in aggregation pipelines.
const resolveProductImageUrl = (loc) => {
    if (!loc) return "";
    if (/^https?:\/\//i.test(loc)) return loc;
    return `${Constant.PRODUCT_AWS_ZOOM_IMAGE_URL}${loc}`;
};

const pickMainImage = (images) => {
    if (!Array.isArray(images) || images.length === 0) return "";
    const main = images.find((img) => img?.IsMainMedia);
    return resolveProductImageUrl((main || images[0])?.MediaLocation);
};

// Resolves a single product doc to the FeaturedProducts card shape consumed
// by the storefront. Falls back gracefully when fields are missing.
const productToCard = (doc) => {
    if (!doc) return null;
    return {
        id: doc._id?.toString(),
        name: doc.productTitle || "",
        price: formatPrice(doc.finalPrice),
        image: pickMainImage(doc.images),
        redirect: {
            type: "product",
            productId: doc._id?.toString(),
            href: doc.slug ? `/product/${doc.slug}` : ""
        }
    };
};

// Walks every section's content, collects redirect target IDs, fetches the
// referenced category/collection/product docs in batched queries, and returns
// each section's content with `href` strings attached to every redirect and
// asset paths rewritten to absolute URLs using `assetBaseUrl`. Featured
// Products tabs additionally have their `productIds` arrays resolved to
// full card objects so the storefront stays a pure render layer.
export const get_home_payload_db = async (assetBaseUrl) => {
    await ensureHomeSectionsSeeded();
    const sections = await HomeSection.find({ enabled: true })
        .sort({ sort: 1, key: 1 })
        .lean();

    const categoryIds = new Set();
    const collectionIds = new Set();
    const productIds = new Set();

    const walk = (v) => {
        if (!v) return;
        if (Array.isArray(v)) return v.forEach(walk);
        if (typeof v !== "object") return;
        if (v.type && (v.refId || v.productId)) {
            if (v.type === "list" && v.listOf === "category" && v.refId) categoryIds.add(v.refId.toString());
            if (v.type === "list" && v.listOf === "collection" && v.refId) collectionIds.add(v.refId.toString());
            if (v.type === "product" && v.productId) productIds.add(v.productId.toString());
        }
        Object.values(v).forEach(walk);
    };

    sections.forEach((s) => walk(s.content));

    // Also collect productIds referenced from FeaturedProducts tabs so we
    // can batch-fetch them in the same query.
    const featured = sections.find((s) => s.key === "featuredProducts");
    if (featured?.content?.tabs && Array.isArray(featured.content.tabs)) {
        featured.content.tabs.forEach((tab) => {
            if (!Array.isArray(tab?.productIds)) return;
            tab.productIds.forEach((id) => {
                if (id) productIds.add(id.toString());
            });
        });
    }

    const [categories, collections, products] = await Promise.all([
        categoryIds.size
            ? Category.find({ _id: { $in: Array.from(categoryIds) } }, { _id: 1, slug: 1, categoryName: 1 }).lean()
            : [],
        collectionIds.size
            ? Collection.find({ _id: { $in: Array.from(collectionIds) } }, { _id: 1, slug: 1, collectionName: 1 }).lean()
            : [],
        productIds.size
            ? ProductMaster.find(
                { _id: { $in: Array.from(productIds) } },
                { _id: 1, slug: 1, productTitle: 1, finalPrice: 1, images: 1 }
            ).lean()
            : []
    ]);

    const maps = {
        categoryById: new Map(categories.map((c) => [c._id.toString(), c])),
        collectionById: new Map(collections.map((c) => [c._id.toString(), c])),
        productById: new Map(products.map((p) => [p._id.toString(), p]))
    };

    const out = {};
    for (const s of sections) {
        let content = decorateRedirects(s.content, maps, assetBaseUrl);
        if (s.key === "featuredProducts" && content?.tabs && Array.isArray(content.tabs)) {
            content = {
                ...content,
                tabs: content.tabs.map((tab) => {
                    // CMS-saved tabs hold productIds; legacy/seeded tabs may
                    // still carry a manual products array — keep both working
                    // so freshly seeded sections don't render blank.
                    if (Array.isArray(tab?.productIds) && tab.productIds.length) {
                        return {
                            ...tab,
                            products: tab.productIds
                                .map((id) => productToCard(maps.productById.get(id?.toString())))
                                .filter(Boolean)
                        };
                    }
                    return tab;
                })
            };
        }
        out[s.key] = {
            key: s.key,
            title: s.title,
            enabled: s.enabled,
            content
        };
    }
    return {
        order: sections.map((s) => s.key),
        sections: out
    };
};

// ─── Per-section fetch ────────────────────────────────────────────────────────
// Fetches, decorates, and returns exactly ONE section by key.
// Used by GET /home/section/:key so the storefront can load sections
// independently and render them progressively as they arrive.
export const get_single_section_payload_db = async (key, assetBaseUrl) => {
    await ensureHomeSectionsSeeded();
    const s = await HomeSection.findOne({ key, enabled: true }).lean();
    if (!s) return null;

    const categoryIds = new Set();
    const collectionIds = new Set();
    const productIds = new Set();

    const walk = (v) => {
        if (!v) return;
        if (Array.isArray(v)) return v.forEach(walk);
        if (typeof v !== "object") return;
        if (v.type && (v.refId || v.productId)) {
            if (v.type === "list" && v.listOf === "category" && v.refId) categoryIds.add(v.refId.toString());
            if (v.type === "list" && v.listOf === "collection" && v.refId) collectionIds.add(v.refId.toString());
            if (v.type === "product" && v.productId) productIds.add(v.productId.toString());
        }
        Object.values(v).forEach(walk);
    };
    walk(s.content);

    // featuredProducts tabs carry their product ids inside the content.
    if (s.key === "featuredProducts" && Array.isArray(s.content?.tabs)) {
        s.content.tabs.forEach((tab) => {
            (tab?.productIds || []).forEach((id) => { if (id) productIds.add(id.toString()); });
        });
    }

    const [categories, collections, products] = await Promise.all([
        categoryIds.size
            ? Category.find({ _id: { $in: Array.from(categoryIds) } }, { _id: 1, slug: 1, categoryName: 1 }).lean()
            : [],
        collectionIds.size
            ? Collection.find({ _id: { $in: Array.from(collectionIds) } }, { _id: 1, slug: 1, collectionName: 1 }).lean()
            : [],
        productIds.size
            ? ProductMaster.find(
                { _id: { $in: Array.from(productIds) } },
                { _id: 1, slug: 1, productTitle: 1, finalPrice: 1, images: 1 }
            ).lean()
            : []
    ]);

    const maps = {
        categoryById: new Map(categories.map((c) => [c._id.toString(), c])),
        collectionById: new Map(collections.map((c) => [c._id.toString(), c])),
        productById: new Map(products.map((p) => [p._id.toString(), p]))
    };

    let content = decorateRedirects(s.content, maps, assetBaseUrl);

    if (s.key === "featuredProducts" && Array.isArray(content?.tabs)) {
        content = {
            ...content,
            tabs: content.tabs.map((tab) => {
                if (Array.isArray(tab?.productIds) && tab.productIds.length) {
                    return {
                        ...tab,
                        products: tab.productIds
                            .map((id) => productToCard(maps.productById.get(id?.toString())))
                            .filter(Boolean)
                    };
                }
                return tab;
            })
        };
    }

    return { key: s.key, title: s.title, enabled: s.enabled, content };
};
