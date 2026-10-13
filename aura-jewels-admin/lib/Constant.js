// export const PARA_TYPES = {
//     diamond: {
//         SHAPE: "shape",
//         COLOR: "color",
//         CLARITY: "clarity",
//         CUT: "cut",
//         CARAT: "carat",
//         POLISH: "polish",
//         FLUORESCENCE: "fluorescence",
//         SYMMETRY: "symmetry",
//         TABLE: "table",
//         DEPTH: "depth",
//         LAB: "lab",
//         ALL_TYPES: ["shape", "color", "clarity", "cut", "carat", "polish", "fluorescence", "symmetry", "table", "depth", "lab"]
//     },
// }

// {
//     type: "Jewellery",
//     paratypes: {
//         METALTYPE: "metalType",
//         METALSTAMP: "metalStamp",
//     }
// }

export const STATUS_CODE = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_ERROR: 500
};

export const ROLES = {
    SUPER_ADMIN: "super_admin",
    ADMIN: "admin",
    SALES: "sales",
    INVENTORY: "inventory",
    CUSTOMER: "customer",
    ALL_ROLES: ["admin", "sales", "inventory", "customer"],
    STAFF_ROLES: ["admin", "sales", "inventory"],
}

export const STATUS = {
    PENDING: "PENDING",
    ACTIVE: "ACTIVE",
    SUSPENDED: "SUSPENDED",
    ALL_STATUS: ["PENDING", "ACTIVE", "SUSPENDED"],
}

export const PAYMENT_STATUS = {
    PENDING: "pending",
    PAID: "paid",
    FAILED: "failed",
    REFUND_PENDING: "refund pending",
    REFUND_PROCESSING: "refund processing",
    REFUND_SUCCESS: "refund success",
    ALL_TYPES: [
        "pending",
        "paid",
        "failed",
        "refund pending",
        "refund processing",
        "refund success"
    ]
};

export const REFUND_STATUS = {
    PENDING: "Pending",
    PROCESSING: "Processing",
    COMPLETED: "Completed",
    FAILED: "Failed",
    REJECTED: "Rejected",
    PENDING_LOWER: "pending",
    PROCESSING_LOWER: "processing",
    COMPLETED_LOWER: "completed",
    FAILED_LOWER: "failed",
    REJECTED_LOWER: "rejected",
    ALL_TYPES: [
        "Pending",
        "Processing",
        "Completed",
        "Failed",
        "Rejected",
        "pending",
        "processing",
        "completed",
        "failed",
        "rejected"
    ]
};


export const PARA_TYPES = [
    {
        name: "SHAPE",
        id: "shape",
        type: "DIAMOND",
    },
    {
        name: "COLOR",
        id: "color",
        type: "DIAMOND",
    },
    {
        name: "CLARITY",
        id: "clarity",
        type: "DIAMOND",
    },
    {
        name: "CUT",
        id: "cut",
        type: "DIAMOND",
    },

    {
        name: "POLISH",
        id: "polish",
        type: "DIAMOND",
    },
    {
        name: "FLUORESCENCE",
        id: "fluorescence",
        type: "DIAMOND",
    },
    {
        name: "SYMMETRY",
        id: "symmetry",
        type: "DIAMOND",
    },

    {
        name: "LAB",
        id: "lab",
        type: "DIAMOND",
    },
    {
        name: "MetalType",
        id: "metalType",
        href: '/metaltype',
        type: "JEWELLERY",
    },
    {
        name: "MetalStamp",
        id: "metalStamp",
        href: '/metalstamp',
        type: "JEWELLERY",
    },
    {
        name: "RingSize",
        id: "ringSize",
        href: '/ringsize',
        type: "JEWELLERY",
    },
    {
        name: "BraceletSize",
        id: "ringSize",
        href: '/ringsize',
        type: "JEWELLERY",
    },
    {
        name: "ProductType",
        id: "productType",
    },
    {
        name: "OrderStatus",
        id: "orderStatus",
    },
];
export const STONE_PRICE_SOURCE = {
    NATURAL: "natural_price",
    LGD: "lgd_price",
}
export const DEFAULT_PRICE_SOURCE = STONE_PRICE_SOURCE.LGD;

export const DIAMOND_TYPES = {
    DIAMOND: "diamond",
    GEMSTONE: "color stone",
    ALL_TYPES: ["diamond", "color stone"]
}

export const GENDER = {
    MALE: "Male",
    FEMALE: "Female",
    TRANSGENDER: "Transgender",
    WOMEN: "Women",
    MEN: "Men",
    OTHER: "Other",
    UNISEX: "Unisex",
    COUPLE: "Couple",
    PREFER_NOT_TO_SAY: "PREFER_NOT_TO_SAY",
};

export const GENDER_OPTIONS = [
    { value: "Women", label: "Women" },
    { value: "Men", label: "Men" },
    { value: "Unisex", label: "Unisex" },
    { value: "Couple", label: "Couple" },
    { value: "Female", label: "Female" },
    { value: "Male", label: "Male" },
    { value: "Transgender", label: "Transgender" },
    { value: "Other", label: "Other" },
    { value: "PREFER_NOT_TO_SAY", label: "Prefer Not To Say" },
];


export const GEM_TYPES = {
    RUBY: "ruby",
    SAPPHIRE: "sapphire",
    MOZANITE: "mozanite",
    EMERALD: "emerald",
    ALL_TYPES: ["ruby", "sapphire", "emerald", "mozanite"]
}

export const CHARGES_TYPE = {
    MAKING: "making",
    Other: "other",
    ALL_TYPE: ["making", "other"]
}
export const CHARGES_MODE = {
    FIXED: "fixed",
    DYNAMIC: "dynamic",
    ALL_TYPE: ["fixed", "dynamic"]
}

export const METAL_PRICE_TYPE = {
    GOLD: "gold",
    SILVER: "silver",
    PLATINUM: "platinum",
    ALL_TYPE: ["gold", "silver", "platinum"]
}

export const PRODUCT_STATUS = {
    AVALIABLE: "available",
    AVAILABLE: "available",
    HOLD: "hold"
}

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
    ENDLESS_MEMORIES: "endlessMemories",
    ALL_KEYS: [
        "heroSlider",
        "chaptersOfLight",
        "signatureShowcase",
        "trendingBrilliance",
        "collectionsOfNote",
        "bespokeExperience",
        "shopByBudget",
        "shopBySegment",
        "giftsOccasion",
        "instagramSocial",
        "diamondShapes",
        "customerReflections",
        "preciousForever",
        "fromTheBlog",
        "endlessMemories",
    ],
};

export const HOME_SECTION_LABELS = {
    heroSlider: "Hero Slider",
    chaptersOfLight: "Chapters Of Light",
    signatureShowcase: "Signature Showcase",
    trendingBrilliance: "Trending Brilliance",
    collectionsOfNote: "Collections Of Note",
    bespokeExperience: "Bespoke Experience",
    shopByBudget: "Shop By Budget",
    shopBySegment: "Shop By Segment",
    giftsOccasion: "Gifts That Speak The Occasion",
    instagramSocial: "From Our Instagram",
    diamondShapes: "Diamond Shapes",
    customerReflections: "Customer Reflections",
    preciousForever: "Precious Forever (Store Locator)",
    fromTheBlog: "From The Blog",
    endlessMemories: "Endless Memories",
};

export const REDIRECT_TYPE = {
    NONE: "none",
    DIRECT: "direct",
    LIST: "list",
    PRODUCT: "product",
    // Curated static website page (Home, Cart, About, …) — menu builder only.
    PAGE: "page",
    ALL_TYPES: ["none", "direct", "list", "product", "page"],
};

export const REDIRECT_LIST_OF = {
    ALL: "all",
    CATEGORY: "category",
    COLLECTION: "collection",
    // Newer list targets used by the mega-menu RedirectPicker.
    OFFER: "offer",
    TAG: "tag",
    ALL_TYPES: ["all", "category", "collection", "offer", "tag"],
};

// Mega-menu column render styles (must match api/constants/menu.constant.js).
export const MENU_COLUMN_LAYOUT = {
    LINKS: "links",
    GROUPED: "grouped",
    ALL_TYPES: ["links", "grouped"],
};

export const MENU_LOCATION = {
    HEADER: "header",
    FOOTER: "footer",
    ALL_TYPES: ["header", "footer"],
};

export const ORDER_STATUS_CAPTIONS = [
    { _id: "Pending", status_id: "Pending", adminstatuscaption: "Pending", parentid: "[]" },
    { _id: "Approved", status_id: "Approved", adminstatuscaption: "Approved", parentid: "[\"Pending\", \"Cancelled Rejected\"]" },
    { _id: "In Production", status_id: "In Production", adminstatuscaption: "In Production", parentid: "[\"Approved\", \"Cancelled Rejected\"]" },
    { _id: "Ready to Ship", status_id: "Ready to Ship", adminstatuscaption: "Ready to Ship", parentid: "[\"In Production\", \"Cancelled Rejected\"]" },
    { _id: "Shipped", status_id: "Shipped", adminstatuscaption: "Shipped", parentid: "[\"Ready to Ship\", \"Cancelled Rejected\"]" },
    { _id: "Delivered", status_id: "Delivered", adminstatuscaption: "Delivered", parentid: "[\"Shipped\", \"Cancelled Rejected\"]" },
    { _id: "Cancelled", status_id: "Cancelled", adminstatuscaption: "Cancel Request", parentid: "[]" },
    { _id: "Cancelled Approved", status_id: "Cancelled Approved", adminstatuscaption: "Cancelled Approved", parentid: "[\"Cancelled\"]" },
    { _id: "Cancelled Rejected", status_id: "Cancelled Rejected", adminstatuscaption: "Cancelled Rejected", parentid: "[\"Cancelled\"]" },
    { _id: "Rejected", status_id: "Rejected", adminstatuscaption: "Rejected", parentid: "[\"Pending\", \"Approved\", \"In Production\", \"Ready to Ship\", \"Cancelled Rejected\"]" },
    { _id: "Return Request", status_id: "Return Request", adminstatuscaption: "Return Request", parentid: "[]" },
    { _id: "Item Received", status_id: "Item Received", adminstatuscaption: "Item Received", parentid: "[\"Return Request\"]" },
    { _id: "QA Done", status_id: "QA Done", adminstatuscaption: "QA Done", parentid: "[\"Item Received\"]" },
    { _id: "Returned Approved", status_id: "Returned Approved", adminstatuscaption: "Return Request Accept", parentid: "[\"QA Done\"]" },
    { _id: "Returned Rejected", status_id: "Returned Rejected", adminstatuscaption: "Return Request Reject", parentid: "[\"QA Done\"]" },
    { _id: "Refunded", status_id: "Refunded", adminstatuscaption: "Refunded", parentid: "[]" },
];

export const FAILED_ORDER_STATUS_CAPTIONS = [
    { _id: "Payment Pending", status_id: "Payment Pending", adminstatuscaption: "Payment Pending", parentid: "[]" },
    { _id: "Failed Payment", status_id: "Failed Payment", adminstatuscaption: "Failed Payment", parentid: "[]" }
];

export const OFFER_STATUS = {
    ACTIVE: "active",
    INACTIVE: "inactive",
    ALL_TYPES: ["active", "inactive"]
};

export const OFFER_DISCOUNT_TYPE = {
    PERCENTAGE: "percentage",
    ABSOLUTE: "absolute",
    ALL_TYPES: ["percentage", "absolute"]
};

export const OFFER_APPLIED_ON = {
    PRODUCT: "product",
    DIAMOND: "diamond",
    MAKING_CHARGE: "making charge",
    COMBINED: "combined",
    ALL_TYPES: ["product", "diamond", "making charge", "combined"]
};


// Do not change the order of the array as it is used in the component
export const OFFER_FILTER_TYPE = [
    { label: "All", value: "all" },
    { label: "Custom ", value: "custom" },
]

// Do not change the order of the array as it is used in the component
export const OFFER_CUSTOM_MODE = [
    { label: "Design", value: "design" },
    { label: "SKU", value: "sku" },
]

export const OFFER_FILTER_TYPE_OPTIONS = [
    { value: "all", label: "ALL (Category / Collection / Subcategory / Tags)" },
    { value: "custom", label: "CUSTOM (Specific Products Selection)" }
];

export const OFFER_CUSTOM_MODE_OPTIONS = [
    { value: "design", label: "Design" },
    { value: "sku", label: "SKU" }
];

export const OFFER_DISCOUNT_TYPE_OPTIONS = [
    { value: "percentage", label: "PERCENTAGE (%)" },
    { value: "absolute", label: "ABSOLUTE (Fixed)" }
];

// Coupons additionally support a "combined" type (separate % on making charge
// and on diamond value across the cart).
export const COUPON_DISCOUNT_TYPE_OPTIONS = [
    { value: "percentage", label: "PERCENTAGE (%)" },
    { value: "absolute", label: "ABSOLUTE (Fixed)" },
    { value: "combined", label: "COMBINED (Making % + Diamond %)" }
];

export const OFFER_APPLIED_ON_OPTIONS = [
    { value: "product", label: "PRODUCT PRICE" },
    { value: "diamond", label: "DIAMOND PRICE" },
    { value: "making charge", label: "MAKING CHARGE" },
    { value: "combined", label: "COMBINED (Making % + Diamond %)" }
];

export const OFFER_STATUS_OPTIONS = [
    { value: "inactive", label: "INACTIVE" },
    { value: "active", label: "ACTIVE" }
];

export const INQUIRY_STATUS = {
    NEW: "NEW",
    CONTACTED: "CONTACTED",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
    ALL_TYPES: ["NEW", "CONTACTED", "COMPLETED", "CANCELLED"]
};

// Subjects offered by the storefront "Get in Touch" form. Must match
// api/constants/user.constant.js → CONTACT_SUBJECT.ALL_TYPES, since the API
// validates the filter value against that enum.
export const CONTACT_SUBJECT = {
    ALL_TYPES: [
        "Bespoke Consultation",
        "Order Inquiry",
        "Aftercare Service",
        "General Question",
    ]
};

export const COUPON_TYPE = {
    PUBLIC: "public",
    PRIVATE: "private",
    ASSIGNEE_ONLY: "assigneeOnly",
    ALL_TYPES: ["public", "private", "assigneeOnly"]
};

export const COUPON_STATUS = {
    ACTIVE: "active",
    INACTIVE: "inactive",
    ALL_TYPES: ["active", "inactive"]
};

export const COUPON_TYPE_OPTIONS = [
    { value: "public", label: "Public" },
    { value: "private", label: "Private" },
    { value: "assigneeOnly", label: "Assignee Only" }
];

export const COUPON_STATUS_OPTIONS = [
    { value: "inactive", label: "Inactive" },
    { value: "active", label: "Active" }
];