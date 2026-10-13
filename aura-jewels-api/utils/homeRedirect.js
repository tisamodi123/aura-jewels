import {
    REDIRECT_TYPE,
    REDIRECT_LIST_OF
} from "../constants/homeSection.constant.js";
import {
    PAGE_PATH_BY_KEY,
    STOREFRONT_PATHS,
    FILTER_PARAM_KEYS,
} from "../constants/menu.constant.js";

// Serialises a redirect's filters into storefront query-param pairs. Accepts
// both the newer nested `redirect.filters` object and the legacy flat
// minPrice/maxPrice fields (home sections) so old data keeps resolving.
const buildFilterParams = (redirect) => {
    const params = [];
    const f = (redirect.filters && typeof redirect.filters === "object") ? redirect.filters : {};

    const pushList = (key, val) => {
        const arr = Array.isArray(val) ? val : (val !== undefined && val !== null && val !== "" ? [val] : []);
        const cleaned = arr.map((v) => String(v).trim()).filter(Boolean);
        if (cleaned.length) params.push(`${key}=${encodeURIComponent(cleaned.join(","))}`);
    };
    const pushNum = (key, val) => {
        if (val !== undefined && val !== null && val !== "") params.push(`${key}=${encodeURIComponent(val)}`);
    };

    pushList(FILTER_PARAM_KEYS.metals, f.metals);
    pushList(FILTER_PARAM_KEYS.shapes, f.shapes);
    pushList(FILTER_PARAM_KEYS.tags, f.tags);
    pushList(FILTER_PARAM_KEYS.gender, f.gender);
    // Collection filter — lets a category link narrow to products that are ALSO
    // in a given collection (e.g. Rings ∩ "Daily & Office Wear" collection).
    pushList(FILTER_PARAM_KEYS.collectionId, f.collectionId);
    // Price/weight live under filters on new data, but fall back to the
    // legacy flat fields used by existing home-section redirects.
    pushNum(FILTER_PARAM_KEYS.minPrice, f.minPrice ?? redirect.minPrice);
    pushNum(FILTER_PARAM_KEYS.maxPrice, f.maxPrice ?? redirect.maxPrice);
    pushNum(FILTER_PARAM_KEYS.minWeight, f.minWeight ?? redirect.minWeight);
    pushNum(FILTER_PARAM_KEYS.maxWeight, f.maxWeight ?? redirect.maxWeight);

    return params;
};

const withParams = (basePath, params) =>
    params.length > 0 ? `${basePath}?${params.join("&")}` : basePath;

// Builds a storefront-relative href string from a stored redirect object plus
// the resolved slug maps. Falls back to "" when the target is missing so the
// frontend can decide whether to render the link at all.
export const resolveRedirectHref = (redirect, maps = {}) => {
    if (!redirect || typeof redirect !== "object") return "";
    const { categoryById, collectionById, productById, offerById, productByItemCode } = maps;
    const type = redirect.type;

    if (type === REDIRECT_TYPE.DIRECT) {
        return redirect.url || "";
    }

    // Curated static page chosen from PAGE_REGISTRY.
    if (type === REDIRECT_TYPE.PAGE) {
        return PAGE_PATH_BY_KEY[redirect.pageKey] || "";
    }

    if (type === REDIRECT_TYPE.LIST) {
        const listOf = redirect.listOf;
        let basePath = "";
        // True when this is a bare category link (no subcategory) whose admin
        // asked for the product list rather than the editorial landing page.
        // A bare /<slug> renders the category LANDING page; adding any query
        // param flips it to the product list — so we append ?view=all.
        let bareCategoryProducts = false;
        // Raw category ids to push onto the /shop list when the admin selected
        // MORE THAN ONE category (a single slug can't represent two categories).
        let multiCategoryIds = null;

        if (listOf === REDIRECT_LIST_OF.ALL) {
            // Unified storefront listing that reads all filters from the URL.
            basePath = STOREFRONT_PATHS.SHOP;
        } else if (listOf === REDIRECT_LIST_OF.CATEGORY) {
            // categoryIds[] (multi-select) is the source of truth; fall back to
            // the legacy single refId for older redirects.
            const catIds = (Array.isArray(redirect.categoryIds) && redirect.categoryIds.length)
                ? redirect.categoryIds.filter(Boolean).map((id) => id.toString())
                : (redirect.refId ? [redirect.refId.toString()] : []);

            if (catIds.length > 1) {
                // Multiple categories → unified /shop list filtered by their ids.
                basePath = STOREFRONT_PATHS.SHOP;
                multiCategoryIds = catIds;
            } else if (catIds.length === 1) {
                // Single category → slug-at-root, matching the live storefront
                // routes (/rings-bands, /rings-bands/solitaire).
                const cat = categoryById?.get(catIds[0]);
                if (cat?.slug) {
                    basePath = `/${cat.slug}`;
                    const sub = redirect.subCategoryId ? categoryById?.get(redirect.subCategoryId.toString()) : null;
                    if (sub?.slug) {
                        basePath += `/${sub.slug}`;
                    } else if (redirect.categoryView === "products") {
                        // No subcategory + admin chose "All products" → force the
                        // product list instead of the landing page. Unset/"landing"
                        // keeps today's bare-slug landing behaviour.
                        bareCategoryProducts = true;
                    }
                }
            }
        } else if (listOf === REDIRECT_LIST_OF.COLLECTION) {
            const col = redirect.refId ? collectionById?.get(redirect.refId.toString()) : null;
            basePath = col?.slug ? `${STOREFRONT_PATHS.COLLECTION}/${col.slug}` : "";
        } else if (listOf === REDIRECT_LIST_OF.OFFER) {
            const offer = redirect.refId ? offerById?.get(redirect.refId.toString()) : null;
            const offerSlug = offer ? (offer.slug || offer.code || offer._id?.toString()) : null;
            basePath = offerSlug ? `${STOREFRONT_PATHS.OFFER}/${offerSlug}` : "";
        } else if (listOf === REDIRECT_LIST_OF.TAG) {
            // Tag lists land on the unified /shop list pre-filtered by tag id.
            const tagId = redirect.refId ? redirect.refId.toString() : "";
            return tagId ? `${STOREFRONT_PATHS.SHOP}?${FILTER_PARAM_KEYS.tags}=${encodeURIComponent(tagId)}` : "";
        }

        if (!basePath) return "";
        const params = buildFilterParams(redirect);
        // Multi-category → /shop?category=<ids>. Put it first so the URL reads
        // naturally, before any metal/price/etc. filters.
        if (multiCategoryIds && multiCategoryIds.length) {
            params.unshift(`${FILTER_PARAM_KEYS.category || "category"}=${encodeURIComponent(multiCategoryIds.join(","))}`);
        }
        // Only the bare category case needs the sentinel; any real filter
        // already flips the page to the product list on its own.
        if (bareCategoryProducts && params.length === 0) {
            params.push("view=all");
        }
        return withParams(basePath, params);
    }

    if (type === REDIRECT_TYPE.PRODUCT) {
        // Resolve by id, then by SKU (itemCode), then accept an explicit slug
        // the admin typed in manually.
        let slug = "";
        if (redirect.productId) {
            slug = productById?.get(redirect.productId.toString())?.slug || "";
        }
        if (!slug && redirect.itemCode) {
            slug = productByItemCode?.get(String(redirect.itemCode))?.slug || "";
        }
        if (!slug && redirect.slug) {
            slug = String(redirect.slug);
        }
        return slug ? `${STOREFRONT_PATHS.PRODUCT}/${slug}` : "";
    }

    return "";
};

// Keys whose string values are server-relative asset paths that need an
// absolute URL prefix so the storefront can render them directly without
// any client-side host resolution.
const ASSET_KEYS = new Set(["image", "imageMobile", "icon", "video", "thumbnail"]);

const isAbsoluteUrl = (s) => /^https?:\/\//i.test(s);

// True when `value` is a plain `{}` object the walkers can safely
// descend into. Returns false for ObjectId / Date / Buffer / Map / Set /
// Mongoose Documents — those have their own internal state (e.g.
// ObjectId.id is a 12-byte Buffer) and recursing into them would
// shred them into garbage like `{buffer: {0: 106, 1: 6, ...}}` which
// Mongoose then can't cast back. Treat as opaque leaves.
const isPlainObject = (value) => {
    if (!value || typeof value !== "object") return false;
    const proto = Object.getPrototypeOf(value);
    return proto === null || proto === Object.prototype;
};

// Rewrites an asset string to an absolute URL when it's a server-relative
// `uploads/...` path. Leaves data: URIs, absolute URLs, and `images/...`
// (storefront /public) paths untouched. Exported for callers that hold
// single image strings (not whole content trees).
export const absolutizeAsset = (str, assetBaseUrl) => {
    if (!str || typeof str !== "string") return str;
    if (isAbsoluteUrl(str)) return str;
    if (str.startsWith("data:") || str.startsWith("blob:")) return str;
    // AWS
    const useAWS = process.env.AWS_ACCESS_KEY_ID && process.env.DEVELOPER_MODE !== 'true';
    const filename = str.split("/").pop();
    if (useAWS) {
        const uploadPath = process.env.AWS_UPLOAD_PATH;
        const videoExtensions = [".mp4", ".webm", ".avi", ".mov", ".m4v", ".mkv"];
        if (videoExtensions.some(ext => filename.toLowerCase().endsWith(ext)) || str.includes("video")) {
            return `${uploadPath}videos/${filename}`;
        }
        return `${uploadPath}website-assets/cms/${filename}`;
    }
    // LOCAL 
    if (!assetBaseUrl) return filename;

    const base = assetBaseUrl.endsWith("/") ? assetBaseUrl.slice(0, -1) : assetBaseUrl;

    const videoExtensions = [".mp4", ".webm", ".avi", ".mov", ".m4v", ".mkv"];
    if (videoExtensions.some(ext => filename.toLowerCase().endsWith(ext)) || str.includes("video")) {
        return `${base}/uploads/videos/${filename}`;
    }
    return `${base}/uploads/cmsImages/${filename}`;
};

// Walks a value tree and absolutizes every string under a known image key
// (image, imageMobile, icon, video, thumbnail). Use this for payloads that
// only need image-path normalization — when the tree also has `redirect`
// objects that need an `href`, use `decorateRedirects` instead.
//
// Keeping image normalization on the server side means the storefront
// never has to inspect or rewrite DB-served image URLs.
//
// The `seen` WeakSet protects against circular structures. Mongoose
// subdocs carry a `$__.parent` back-ref that points at the owning doc;
// without this guard the prior implementation recursed forever and the
// API died with "Maximum call stack size exceeded". Callers that pass
// `.lean()` POJOs don't strictly need this, but it costs nothing and
// shields us from any future shape that has a cycle.
export const absolutizeImages = (value, assetBaseUrl, seen = new WeakSet()) => {
    if (value === null || value === undefined) return value;

    if (Array.isArray(value)) {
        if (seen.has(value)) return value;
        seen.add(value);
        return value.map((v) => absolutizeImages(v, assetBaseUrl, seen));
    }

    // Non-plain objects (ObjectId, Date, Buffer, Mongoose Documents) get
    // passed through unchanged — descending into their internal state
    // breaks the value's identity (e.g. ObjectId → `{buffer: {...}}`)
    // and round-trip writes then fail with CastError.
    if (typeof value === "object" && !isPlainObject(value)) {
        return value;
    }

    if (typeof value === "object") {
        if (seen.has(value)) return value;
        seen.add(value);
        const out = {};
        for (const [k, v] of Object.entries(value)) {
            if (ASSET_KEYS.has(k) && typeof v === "string") {
                out[k] = absolutizeAsset(v, assetBaseUrl);
            } else {
                out[k] = absolutizeImages(v, assetBaseUrl, seen);
            }
        }
        return out;
    }

    return value;
};

// Walks a section content tree and, for every leaf `redirect` object it finds,
// attaches a resolved `href` string. Also rewrites known asset string fields
// (image, imageMobile, icon, video, thumbnail) under `uploads/...` to absolute
// URLs using `assetBaseUrl`. Original redirect data is preserved for admin
// round-tripping.
//
// `seen` guards against circular references — Mongoose subdocs carry a
// `$__.parent` back-ref to the owning doc, which caused
// "Maximum call stack size exceeded" before this protection existed.
export const decorateRedirects = (value, maps, assetBaseUrl, seen = new WeakSet()) => {
    if (value === null || value === undefined) return value;

    if (Array.isArray(value)) {
        if (seen.has(value)) return value;
        seen.add(value);
        return value.map((v) => decorateRedirects(v, maps, assetBaseUrl, seen));
    }

    // ObjectId / Date / Buffer / Mongoose Document — leaf, return as-is.
    // Without this guard ObjectIds get shredded into `{buffer: {...}}`
    // shapes that Mongoose can't cast back to ObjectId on write.
    if (typeof value === "object" && !isPlainObject(value)) {
        return value;
    }

    if (typeof value === "object") {
        if (seen.has(value)) return value;
        seen.add(value);
        const out = {};
        for (const [k, v] of Object.entries(value)) {
            // Match the canonical `redirect` key OR any sibling that ends
            // with "Redirect" (e.g. `ctaRedirect`, `viewAllRedirect`).
            // Sections with more than one redirect on the same object
            // were silently missing `href` because this only accepted the
            // literal "redirect" key — the Featured Products per-tab CTA
            // and the section-level View-All button were both invisible.
            const isRedirectKey = k === "redirect" || /Redirect$/.test(k);
            if (isRedirectKey && v && typeof v === "object" && v.type) {
                out[k] = { ...v, href: resolveRedirectHref(v, maps) };
            } else if (ASSET_KEYS.has(k) && typeof v === "string") {
                out[k] = absolutizeAsset(v, assetBaseUrl);
            } else {
                out[k] = decorateRedirects(v, maps, assetBaseUrl, seen);
            }
        }
        return out;
    }

    return value;
};

export const cleanCmsAsset = (str) => {
    if (!str || typeof str !== "string") return str;
    if (str.startsWith("data:") || str.startsWith("blob:")) return str;
    return str.split("/").pop();
};

// WeakSet is used to avoid circular references. if obj is null or undefined, js garbage collector will clean it.
// not like Set that will hold the reference and cause memory leak.
// A WeakSet can only contain objects

export const stripAssetImages = (value, seen = new WeakSet()) => {
    if (value === null || value === undefined) return value;

    if (Array.isArray(value)) {
        if (seen.has(value)) return value;
        seen.add(value);
        return value.map((v) => stripAssetImages(v, seen));
    }

    if (typeof value === "object" && !isPlainObject(value)) {
        return value;
    }

    if (typeof value === "object") {
        if (seen.has(value)) return value;
        seen.add(value);
        const out = {};
        for (const [k, v] of Object.entries(value)) {
            if (ASSET_KEYS.has(k) && typeof v === "string") {
                out[k] = cleanCmsAsset(v);
            } else {
                out[k] = stripAssetImages(v, seen);
            }
        }
        return out;
    }

    return value;
};
