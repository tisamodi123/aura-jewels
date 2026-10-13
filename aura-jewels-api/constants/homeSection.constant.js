export const HOME_SECTION_KEYS = {
    HERO_SLIDER: "heroSlider",
    CHAPTERS_OF_LIGHT: "chaptersOfLight",
    SIGNATURE_SHOWCASE: "signatureShowcase",
    TRENDING_BRILLIANCE: "trendingBrilliance",
    COLLECTIONS_OF_NOTE: "collectionsOfNote",
    BESPOKE_EXPERIENCE: "bespokeExperience",
    SHOP_BY_BUDGET: "shopByBudget",
    SHOP_BY_SEGMENT: "shopBySegment",
    GIFTS_OCCASION: "giftsOccasion",
    INSTAGRAM_SOCIAL: "instagramSocial",
    DIAMOND_SHAPES: "diamondShapes",
    CUSTOMER_REFLECTIONS: "customerReflections",
    PRECIOUS_FOREVER: "preciousForever",
    FROM_THE_BLOG: "fromTheBlog",
    ENDLESS_MEMORIES: "endlessMemories"
};

export const HOME_SECTION_KEY_LIST = Object.values(HOME_SECTION_KEYS);

export const REDIRECT_TYPE = {
    DIRECT: "direct",
    LIST: "list",
    PRODUCT: "product",
    // Curated static website page chosen from the PAGE_REGISTRY
    // (Home, Cart, About, policy pages, …). See menu.constant.js.
    PAGE: "page",
    NONE: "none",
    ALL_TYPES: ["direct", "list", "product", "page", "none"]
};

export const REDIRECT_LIST_OF = {
    ALL: "all",
    CATEGORY: "category",
    COLLECTION: "collection",
    // Newer list targets used by the admin-authored mega menu. Offers
    // resolve to /offer/<slug>; tags resolve to the unified /shop list
    // pre-filtered by tag id.
    OFFER: "offer",
    TAG: "tag",
    ALL_TYPES: ["all", "category", "collection", "offer", "tag"]
};

export const FEATURED_SOURCE_TYPE = {
    BEST_SELLING: "best-selling",
    TRENDING: "trending",
    CATEGORY: "category",
    COLLECTION: "collection",
    ALL_TYPES: ["best-selling", "trending", "category", "collection"]
};

export default {
    HOME_SECTION_KEYS,
    HOME_SECTION_KEY_LIST,
    REDIRECT_TYPE,
    REDIRECT_LIST_OF,
    FEATURED_SOURCE_TYPE
};
