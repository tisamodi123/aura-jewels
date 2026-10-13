// Constants for the admin-authored, Shopify-style storefront mega menu.
//
// The menu is stored as a single document per LOCATION (currently just the
// header) holding an explicit tree: items[] (top bar) -> columns[] (mega-menu
// panels) -> links[] / groups[] (leaf links). Every leaf carries a `redirect`
// object resolved server-side to an absolute `href` (see utils/homeRedirect.js)
// so the storefront renders links with no client-side URL building.

export const MENU_LOCATION = {
    HEADER: "header",
    FOOTER: "footer",
    ALL_TYPES: ["header", "footer"],
};

// Column render style inside a mega-menu panel.
//   links   -> flat list of links (Shop By Style / Budget / Occasion / Collection)
//   grouped -> grouped swatch list (Shop By Metal: Yellow/Rose/White Gold,
//              each with karat options 9K/14K/18K)
export const MENU_COLUMN_LAYOUT = {
    LINKS: "links",
    GROUPED: "grouped",
    ALL_TYPES: ["links", "grouped"],
};

// Curated list of real storefront pages an admin can point a menu link or
// card at via the RedirectPicker ("page" redirect type). `key` is what gets
// stored on the redirect (`pageKey`); `path` is what the resolver emits.
// Keep `path` in sync with the actual route folders in web/app.
export const PAGE_REGISTRY = [
    { key: "home", label: "Home", path: "/" },
    { key: "shop", label: "Shop (All Products)", path: "/shop" },
    { key: "collections", label: "All Collections", path: "/collections" },
    { key: "custom-jewellery", label: "Custom Jewellery", path: "/custom-jewellery" },
    { key: "bespoke", label: "Bespoke Design", path: "/bespoke" },
    { key: "cart", label: "Cart", path: "/cart" },
    { key: "wishlist", label: "Wishlist", path: "/wishlist" },
    { key: "sign-in", label: "Sign In", path: "/sign-in" },
    { key: "sign-up", label: "Sign Up", path: "/sign-up" },
    { key: "about-us", label: "About Us", path: "/about-us" },
    { key: "story", label: "Our Story", path: "/story" },
    { key: "stores", label: "Stores", path: "/stores" },
    { key: "journal", label: "Journal", path: "/journal" },
    { key: "faq", label: "FAQ", path: "/faq" },
    { key: "get-in-touch", label: "Contact / Get In Touch", path: "/get-in-touch" },
    { key: "4cs-guide", label: "4Cs Guide", path: "/4cs-guide" },
    { key: "ring-size-guide", label: "Ring Size Guide", path: "/ring-size-guide" },
    { key: "bracelet-size-guide", label: "Bracelet Size Guide", path: "/bracelet-size-guide" },
    { key: "growing-diamonds", label: "Growing Diamonds", path: "/growing-diamonds" },
    { key: "exchange-buyback", label: "Exchange & Buyback", path: "/exchange-buyback" },
    { key: "aura-care", label: "Aura Care", path: "/aura-care" },
    { key: "shipping-delivery-policy", label: "Shipping & Delivery Policy", path: "/shipping-delivery-policy" },
    { key: "return-policy", label: "Return Policy", path: "/return-policy" },
    { key: "shipping-returns", label: "Shipping & Returns", path: "/shipping-returns" },
    { key: "payment-methods", label: "Payment Methods", path: "/payment-methods" },
    { key: "inquiry", label: "B2B Inquiry", path: "/inquiry" },
];

// Fast lookup: pageKey -> path.
export const PAGE_PATH_BY_KEY = PAGE_REGISTRY.reduce((acc, p) => {
    acc[p.key] = p.path;
    return acc;
}, {});

// Storefront base paths. Category lists are slug-at-root (e.g. /rings-bands,
// /rings-bands/solitaire) — matching the live storefront routes — NOT
// /category/<slug>. Collections keep their /collection/<slug> prefix.
export const STOREFRONT_PATHS = {
    SHOP: "/shop",
    COLLECTION: "/collection",
    OFFER: "/offer",
    PRODUCT: "/product",
};

// Maps a stored redirect `filters` object to storefront query-param names.
// These names mirror what web JewelryList reads from the URL.
//   metals    -> comma-joined metal ids
//   shape     -> comma-joined shape values (e.g. "Heart,Round")
//   tags      -> comma-joined tag ids
//   minPrice / maxPrice / minWeight / maxWeight -> numbers
export const FILTER_PARAM_KEYS = {
    category: "category",
    collectionId: "collectionId",
    metals: "metals",
    shapes: "shape",
    tags: "tags",
    gender: "gender",
    minPrice: "minPrice",
    maxPrice: "maxPrice",
    minWeight: "minWeight",
    maxWeight: "maxWeight",
};

export default {
    MENU_LOCATION,
    MENU_COLUMN_LAYOUT,
    PAGE_REGISTRY,
    PAGE_PATH_BY_KEY,
    STOREFRONT_PATHS,
    FILTER_PARAM_KEYS,
};
