export default {
  SWITCHES: {
    SWITCH_ENFORCE_ORDER_STATE_SEQUENCE: true,
    SWITCH_LOG_ORDER_TRANSITIONS: false,
    SWITCH_AUTO_CALCULATE_ESTIMATED_DELIVERY: true,
    SWITCH_SAVE_REFUND_DETAILS: true,
    SWITCH_SIMULATE_REFUNDS: true,
    SWITCH_RESTRICT_CANCEL_REJECT_STATES: true,
    ALLOWED_CANCEL_STATES: ["Pending", "Approved", "In Production", "Cancelled Rejected"],
    ALLOWED_REJECT_STATES: ["Pending", "Approved", "In Production"],
  },
  MAX_CANCELLATION_DAYS: 7,
  MAX_RETURN_DAYS: 10,
  CANCELLATION_RULES: [
    { maxHours: 12, chargePercentage: 0 },
    { maxHours: 24, chargePercentage: 5 },
    { maxHours: 48, chargePercentage: 10 },
    { maxHours: Infinity, chargePercentage: 100 }
  ],
  getCancellationChargePercentage: (createdAt) => {
    if (!createdAt) return 10; // Default fallback
    const elapsedHours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    const rules = [
      { maxHours: 12, chargePercentage: 0 },
      { maxHours: 24, chargePercentage: 5 },
      { maxHours: 48, chargePercentage: 10 },
      { maxHours: Infinity, chargePercentage: 100 }
    ];
    const rule = rules.find(r => elapsedHours <= r.maxHours);
    return rule ? rule.chargePercentage : 10;
  },
  RETURN_RULES: [
    { maxHours: 12, chargePercentage: 5 },
    { maxHours: 24, chargePercentage: 10 },
    { maxHours: 48, chargePercentage: 15 },
    { maxHours: Infinity, chargePercentage: 100 }
  ],
  getReturnChargePercentage: (deliveryDate) => {
    if (!deliveryDate) return 10; // Default fallback
    const elapsedHours = (Date.now() - new Date(deliveryDate).getTime()) / (1000 * 60 * 60);
    const rules = [
      { maxHours: 12, chargePercentage: 5 },
      { maxHours: 24, chargePercentage: 10 },
      { maxHours: 48, chargePercentage: 15 },
      { maxHours: Infinity, chargePercentage: 100 }
    ];
    const rule = rules.find(r => elapsedHours <= r.maxHours);
    return rule ? rule.chargePercentage : 10;
  },
  STATUS: {
    PENDING: "PENDING",
    ACTIVE: "ACTIVE",
    SUSPENDED: "SUSPENDED",
  },
  WHATSAPP_STATUS: {
    SENT: "sent",
    FAILED: "failed",
    DELIVERED: "delivered",
    READ: "read",
    ALL_TYPES: ["sent", "failed", "delivered", "read"]
  },
  CAMPAIGN_TEMPLATE_NAME: {
    WELCOME: "Aura Jewels - Welcome",
    FIRST_ORDER_OFFER: "Aura Jewels - First Order Offer",
    WISHLIST_REMINDER: "Aura Jewels - Wishlist Reminder",
    CART_REMINDER1: "Aura Jewels - Cart Reminder 1",
    CART_REMINDER2: "Aura Jewels - Cart Reminder 2",
    CART_REMINDER3: "Aura Jewels - Cart Reminder 3",
  },
  CAMPAIGN_IMAGE_URL: {
    WELCOME: `https://d3jt6ku4g6z5l8.cloudfront.net/IMAGE/6353da2e153a147b991dd812/4958901_highanglekidcheatingschooltestmin.jpg`,
    FIRST_ORDER_OFFER: `https://d3jt6ku4g6z5l8.cloudfront.net/IMAGE/6353da2e153a147b991dd812/4958901_highanglekidcheatingschooltestmin.jpg`,
    WISHLIST_REMINDER: `https://d3jt6ku4g6z5l8.cloudfront.net/IMAGE/6353da2e153a147b991dd812/4958901_highanglekidcheatingschooltestmin.jpg`,
  },
  WISHLIST_REMINDER_MINUTES: 60,
  WISHLIST_REMINDER_MAX_AGE_MINUTES: 1440,
  ROLES: {
    SUPER_ADMIN: "super_admin",
    ADMIN: "admin",
    SALES: "sales",
    INVENTORY: "inventory",
    CUSTOMER: "customer",
    STAFF_ROLES: ["admin", "sales", "inventory"],
    ALL_ROLES: ["super_admin", "admin", "sales", "inventory", "customer"],
  },
  PRODUCT_STATUS: {
    AVALIABLE: "available",
    AVAILABLE: "available",
    HOLD: "hold",
  },

  // --------------------
  // CHNAGES BY SMIT_K86
  // --------------------

  PAYMENT_STATUS: {
    PENDING: "pending",
    PAID: "paid",
    FAILED: "failed",
    ALL_TYPES: [
      "pending",
      "paid",
      "failed",
    ]
  },

  REFUND_STATUS: {
    PENDING: "Pending",
    PROCESSING: "Processing",
    FAILED: "Failed",
    SUCCESS: "Success",
    ALL_TYPES: [
      "Pending",
      "Processing",
      "Success",
      "Failed"
    ]
  },

  REFUND_METHODS: {
    WALLET: "wallet",
    BANK: "bank",
    GATEWAY: "gateway",
    NONE: "none",
    ALL_TYPES: ["wallet", "bank", "gateway", "none"]
  },

  RECEIPT_TYPES: {
    RECEIPT: "receipt",
    DETAIL_RECEIPT: "detailReceipt",
    ALL_TYPES: ["receipt", "detailReceipt"]
  },

  PARA_TYPES: {
    SHAPE: "shape",
    COLOR: "color",
    CLARITY: "clarity",
    CUT: "cut",
    CARAT: "carat",
    POLISH: "polish",
    FLUORESCENCE: "fluorescence",
    SYMMETRY: "symmetry",
    TABLE: "table",
    DEPTH: "depth",
    LAB: "lab",
    ALL_TYPES: ["shape", "color", "clarity", "cut", "carat", "polish", "fluorescence", "symmetry", "table", "depth", "lab"]
  },

  OFFER_APPLICABLE_TYPE: {
    ALL: "all",
    CUSTOM: "custom",
    ALL_TYPES: ["all", "custom"]
  },

  OFFER_CUSTOM_MODE: {
    DESIGN: "design",
    SKU: "sku",
    ALL_TYPES: ["design", "sku"]
  },

  OFFER_STATUS: {
    ACTIVE: "active",
    INACTIVE: "inactive",
    ALL_TYPES: ["active", "inactive"]
  },

  OFFER_DISCOUNT_TYPE: {
    PERCENTAGE: "percentage",
    ABSOLUTE: "absolute",
    ALL_TYPES: ["percentage", "absolute"]
  },

  OFFER_APPLIED_ON: {
    PRODUCT: "product",
    DIAMOND: "diamond",
    MAKING_CHARGE: "making charge",
    // Combined: a separate % on making charge AND on diamond price at once
    // (e.g. 5% making + 10% diamond). Uses makingChargePercent/diamondPercent
    // instead of the single discountType/discountValue.
    COMBINED: "combined",
    ALL_TYPES: ["product", "diamond", "making charge", "combined"]
  },

  COUPON_TYPE: {
    PUBLIC: "public",
    PRIVATE: "private",
    ASSIGNEE_ONLY: "assigneeOnly",
    ALL_TYPES: ["public", "private", "assigneeOnly"]
  },

  COUPON_STATUS: {
    ACTIVE: "active",
    INACTIVE: "inactive",
    ALL_TYPES: ["active", "inactive"]
  },

  // Coupon discount types. "combined" applies a separate % to the cart's total
  // making-charge and total diamond value (e.g. 5% making + 10% diamond),
  // instead of one % / flat amount on the order subtotal.
  COUPON_DISCOUNT_TYPE: {
    PERCENTAGE: "percentage",
    ABSOLUTE: "absolute",
    COMBINED: "combined",
    ALL_TYPES: ["percentage", "absolute", "combined"]
  },

  // What a coupon's discount applies to — mirrors OFFER_APPLIED_ON so coupons can
  // target the same cost components as product offers:
  //   total          -> % / flat on the order subtotal (the classic coupon)
  //   diamond        -> % / flat on the cart's total diamond value
  //   making charge  -> % / flat on the cart's total making charge
  //   combined       -> separate % on making + diamond (makingChargePercent / diamondPercent)
  COUPON_APPLIED_ON: {
    TOTAL: "total",
    DIAMOND: "diamond",
    MAKING_CHARGE: "making charge",
    COMBINED: "combined",
    ALL_TYPES: ["total", "diamond", "making charge", "combined"]
  },

  DIAMOND_TYPES: {
    DIAMOND: "diamond",
    GEMSTONE: "color stone",
    ALL_TYPES: ["diamond", "color stone"]
  },

  DIA_TYPES: {
    NATURAL: "natural",
    LAB_GROWN: "lab grown",
    ALL_TYPES: ["natural", "lab grown"]
  },

  GEM_TYPES: {
    RUBY: "ruby",
    SAPPHIRE: "sapphire",
    MOZANITE: "mozanite",
    EMERALD: "emerald",
    ALL_TYPES: ["ruby", "sapphire", "emerald", "mozanite"]
  },

  CHARGE_TYPE: {
    MAKING: "making",
    OTHER: "other",
    ALL_TYPE: ["making", "other"]
  },
  CHARGE_MODE: {
    FIXED: "fixed",
    DYNAMIC: "dynamic",
    ALL_TYPE: ["fixed", "dynamic"]
  },

  METAL_PRICE_TYPE: {
    GOLD: "gold",
    SILVER: "silver",
    PLATINUM: "platinum",
    ALL_TYPES: ["gold", "silver", "platinum"]
  },

  CATEGORY_LANDING_SECTIONS: [
    'hero-banner',
    'explore-by-style',
    'double-promo-grid-title',
    'double-promo-grid',
    'popular-designs',
    'custom-cta',
    'featured-collection',
    'words-of-trust'
  ],
  ORDER_STATUS: {
    PENDING: "Pending",
    APPROVED: "Approved",
    FAILED: "Failed",
    RECEIVED: "Received",
    CONFIRMED: "Confirmed",
    IN_PRODUCTION: "In Production",
    READY_TO_SHIP: "Ready to Ship",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    CANCELLED_APPROVED: "Cancelled Approved",
    CANCELLED_REJECTED: "Cancelled Rejected",
    REJECTED: "Rejected",
    RETURN_REQUEST: "Return Request",
    ITEM_RECEIVED: "Item Received",
    QA_DONE: "QA Done",
    RETURNED_APPROVED: "Returned Approved",
    RETURNED_REJECTED: "Returned Rejected",
    REFUNDED: "Refunded",
    ALL_TYPES: [
      "Pending",
      "Approved",
      "Failed",
      "Received",
      "Confirmed",
      "In Production",
      "Ready to Ship",
      "Shipped",
      "Delivered",
      "Cancelled",
      "Cancelled Approved",
      "Cancelled Rejected",
      "Rejected",
      "Return Request",
      "Item Received",
      "QA Done",
      "Returned Approved",
      "Returned Rejected",
      "Refunded",
    ]
  },
  INQUIRY_STATUS: {
    NEW: "NEW",
    CONTACTED: "CONTACTED",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
    ALL_TYPES: ["NEW", "CONTACTED", "COMPLETED", "CANCELLED"]
  },
  // Subjects offered by the storefront "Get in Touch" form. The stored value is
  // the label itself, so these strings must stay in sync with the <select> on
  // web/app/get-in-touch/components/ContactForm.tsx — changing one without the
  // other makes existing rows fail the enum on any later save().
  CONTACT_SUBJECT: {
    BESPOKE_CONSULTATION: "Bespoke Consultation",
    ORDER_INQUIRY: "Order Inquiry",
    AFTERCARE_SERVICE: "Aftercare Service",
    GENERAL_QUESTION: "General Question",
    ALL_TYPES: [
      "Bespoke Consultation",
      "Order Inquiry",
      "Aftercare Service",
      "General Question",
    ]
  },
  PAYMENT_STATUS: {
    PENDING: "pending",
    PAID: "paid",
    FAILED: "failed",
    ALL_TYPES: [
      "pending",
      "paid",
      "failed"
    ]
  },

  PARA_TYPES: {
    SHAPE: "shape",
    COLOR: "color",
    CLARITY: "clarity",
    CUT: "cut",
    CARAT: "carat",
    POLISH: "polish",
    FLUORESCENCE: "fluorescence",
    SYMMETRY: "symmetry",
    TABLE: "table",
    DEPTH: "depth",
    LAB: "lab",
    ALL_TYPES: [
      "shape",
      "color",
      "clarity",
      "cut",
      "carat",
      "polish",
      "fluorescence",
      "symmetry",
      "table",
      "depth",
      "lab",
    ],
  },
  STONE_PRICE_SOURCE: {
    NATURAL: "natural_price",
    LGD: "lgd_price",
  },
  DEFAULT_PRICE_SOURCE: "lgd_price",

  DIAMOND_TYPES: {
    DIAMOND: "diamond",
    GEMSTONE: "color stone",
    ALL_TYPES: ["diamond", "color stone"],
  },

  STONE_TYPES: {
    NATURAL_DIAMOND: "natural diamond",
    LAB_GROWN_DIAMOND: "lab grown diamond",
    GEMSTONE: "gemstone",
    ALL_TYPES: ["natural diamond", "lab grown diamond", "gemstone"],
  },

  CUSTOM_ORDER_STATUS: {
    NEW: "New",
    PENDING: "Pending",
    APPROVED: "Approved",
    REJECT: "Reject",
    IN_PROGRESS: "In Progress",
    READY_TO_SHIP: "Ready to Ship",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    ALL_TYPES: [
      "New",
      "Pending",
      "Approved",
      "Reject",
      "In Progress",
      "Ready to Ship",
      "Shipped",
      "Delivered",
      "Cancelled",
    ],
  },

  QUOTATION_STATUS: {
    PENDING: "Pending",
    APPROVED: "Approved",
    IN_PROGRESS: "In Progress",
    REJECT: "Reject",
    COMPLETE: "Complete",
    ACCEPT: "Accept",
    ALL_TYPES: [
      "Pending",
      "Approved",
      "In Progress",
      "Reject",
      "Complete",
      "Accept",
    ],
  },

  DIA_TYPES: {
    NATURAL: "natural",
    LAB_GROWN: "lab grown",
    ALL_TYPES: ["natural", "lab grown"],
  },

  GEM_TYPES: {
    RUBY: "ruby",
    SAPPHIRE: "sapphire",
    MOZANITE: "mozanite",
    EMERALD: "emerald",
    ALL_TYPES: ["ruby", "sapphire", "emerald", "mozanite"],
  },

  CHARGE_TYPE: {
    MAKING: "making",
    OTHER: "other",
    ALL_TYPE: ["making", "other"],
  },
  CHARGE_MODE: {
    FIXED: "fixed",
    DYNAMIC: "dynamic",
    ALL_TYPE: ["fixed", "dynamic"],
  },

  METAL_PRICE_TYPE: {
    GOLD: "gold",
    SILVER: "silver",
    PLATINUM: "platinum",
    ALL_TYPES: ["gold", "silver", "platinum"],
  },

  CATEGORY_LANDING_SECTIONS: [
    "hero-banner",
    "explore-by-style",
    "double-promo-grid-title",
    "double-promo-grid",
    "popular-designs",
    "custom-cta",
    "featured-collection",
    "words-of-trust",
  ],

  // --------------------
  // END OF LINE
  // --------------------

  PARATYPES: {
    SHAPE: "shape",
    COLOR: "color",
    CLARITY: "clarity",
    CUT: "cut",
    CARAT: "carat",
    POLISH: "polish",
    FLUORESCENCE: "fluorescence",
    SYMMETRY: "symmetry",
    TABLE: "table",
    DEPTH: "depth",
    LAB: "lab",
    paratype: [
      "shape",
      "color",
      "clarity",
      "cut",
      "carat",
      "polish",
      "fluorescence",
      "symmetry",
      "table",
      "depth",
      "lab",
    ],
  },
  GENDER: {
    MALE: "Male",
    FEMALE: "Female",
    TRANSGENDER: "Transgender",
    WOMEN: "Women",
    MEN: "Men",
    OTHER: "Other",
    // The admin product form offers "Unisex" and the import sheet ships
    // "UNISEX". Without this the product enum rejected a validated save.
    UNISEX: "Unisex",
    COUPLE: "Couple",
    PREFER_NOT_TO_SAY: "PREFER_NOT_TO_SAY",
  },
  ALLOWEDTYPES: [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
    "application/vnd.ms-excel",
  ],
  ALLOWEDIMAGES: ["image/jpeg", "image/png", "image/gif", "image/svg+xml"],
  ALLOWEDVIDEOS: [
    "video/mp4",
    "video/avi",
    "video/mpeg",
    "video/quicktime",
    "video/x-matroska",
    "video/webm",
  ],
  PRICEIN: {
    DOLLER: "DOLLER",
    RUPEE: "RUPEE",
  },
  MAPPINGTYPE: {
    EXCEL: "EXCEL",
    JSON: "JSON",
  },
  // DIAMONDTYPE: {
  //     NATURAL: "Natural",
  //     LAB_GROWN: "Lab Grown",
  // },
  ROUND: [
    "RD",
    "ROUND",
    "round",
    "Round",
    "rd",
    "RB",
    "rb",
    "Round Brilliant",
    "RBC",
    "rbc",
    "Rbc",
  ],
  SHAPE: {
    ROUND: "681ef883f4f7a61a2120abcc",
  },
  PLUSVALUES: {
    VG: "VG",
    GD: "GD",
    EX: "EX",
  },
  MIMETYPE: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/svg",
    "image/svg+xml",
    "image/jpg",
    "image/gif",
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ],
  FIELDNAMES: [
    "col_image1",
    "col_image2",
    "col_image3",
    "categoryImage",
    "image",
    "mobile_img",
  ],
  TYPE: {
    JEWELLERY: "JEWELLERY",
    DIAMOND: "DIAMOND",
  },
  PARATYPEID: {
    MetalType: "681ef80ef4f7a61a2120abbd",
    SHAPE: "681ef80ef4f7a61a2120abb2",
    METALSTAMP: "681ef80ef4f7a61a2120abbe",
    SETTINGTYPE: "681ef80ef4f7a61a2120abbf",
    TAGS: "681ef80ef4f7a61a2120abc1",
  },
  STONETYPE: {
    DIAMOND: "DIAMOND",
    GEMSTONE: "GEMSTONE",
  },
  PRODUCTSTONETYPE: {
    CENTER: ["Center", "center", "CENTER"],
    SIDE: ["Side", "side", "SIDE"],
    GEM: ["GEM", "Gem", "gem"],
  },
  HAVECHAIN: {
    YES: ["yes", "YES", "Yes"],
    NO: ["no", "NO", "No"],
  },
  PRODUCTTYPE: {
    FINISHED: "Finished",
    SEMINFINISHED: "Semi-Finished",
  },
  ISLOGIN: {
    YES: "Yes",
    NO: "No",
  },
  CURRENCY: {
    DOLLAR: "doller",
    INR: "inr",
  },
  ADDRESSTYPE: {
    SHIPPING: "SHIPPING",
    BILLING: "BILLING",
    BOTH: "BOTH",
  },
  DIAMOND_STATUS: {
    SOLD: "SOLD",
    AVAILABLE: "AVAILABLE",
  },
  COMPANY_DETAILS: {
    get PHONE() {
      return process.env.COMPANY_PHONE || "";
    },
    get COMPANY_NAME() {
      return process.env.COMPANY_NAME || "Aura Jewels";
    },
    get EMAIL() {
      return process.env.COMPANY_EMAIL || "";
    },
  },
  URL: {
    get FRONTEND() {
      return process.env.FRONTEND_URL || "";
    },
  },
  VENDORID: {
    VAMDIAM: "68b5811630e73a612e656a16",
  },
  NATURAL_VALUE: ["yes"],
  CLASSIC_API: {
    USERNAME: process.env.CLASSIC_API_USERNAME || "",
    PASSWORD: process.env.CLASSIC_API_PASSWORD || "",
    TOKEN_URL:
      "https://cgd-api.classicgrowndiamonds.com/api/v1/supplier/generateToken",
    CATEGORY_URL:
      "https://cgd-api.classicgrowndiamonds.com/api/v1/supplier/GetCategory",
    JEWELERYLIST_URL:
      "https://cgd-api.classicgrowndiamonds.com/api/v1/supplier/GetProductListWithPrice",
    DEFAULT_CENTERSTONE_PRICE: 100,
  },
  RAZORPAY: {
    KEY: process.env.RAZORPAY_KEY || "",
    SECRET_KEY: process.env.RAZORPAY_SECRET_KEY || "",
  },
  get CHECKOUT_URL() {
    return process.env.CHECKOUT_URL || "";
  },
  get THANK_YOU_URL() {
    return process.env.THANK_YOU_URL || "";
  },
  get PRODUCT_AWS_ZOOM_IMAGE_URL() {
    return process.env.PRODUCT_AWS_ZOOM_IMAGE_URL;
  },
  get PRODUCT_AWS_VIDEO_URL() {
    return process.env.PRODUCT_AWS_VIDEO_URL;
  },
};
