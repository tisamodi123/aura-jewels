"use client";

import { useEffect, useMemo, useState } from "react";
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/APIUrl";
import { callApi } from "@/lib/callApi";
import { REDIRECT_TYPE, REDIRECT_LIST_OF, STATUS_CODE } from "@/lib/Constant";
import { useRedirectOptions } from "./useRedirectOptions";
import LazyInput from "./LazyInput";
import MultiSelect from "./SearchableMultiSelect";

// The ONE shared destination picker — used by the mega-menu builder, the home
// CMS section editors, and the category/collection card editors. Stores a
// single structured `redirect` object the API resolves to an href:
//
//   { type: "none" | "direct" | "page" | "list" | "product",
//     url?, pageKey?,
//     listOf?: "all"|"category"|"collection"|"offer"|"tag",
//     refId?, categoryIds?, subCategoryId?, categoryView?: "landing"|"products",
//     filters?: { collectionId[], metals[], shapes[], tags[], minPrice, maxPrice, minWeight, maxWeight },
//     productId?, productLabel?, itemCode?, slug? }

const emptyRedirect = { type: REDIRECT_TYPE.NONE };

// Canonical gender chips. The API maps these onto the (overlapping) stored
// enum values — women→Women/Female, men→Men/Male, couple→Couple, unisex→Other.
const GENDER_OPTIONS = [
    { id: "women", label: "Women" },
    { id: "men", label: "Men" },
    { id: "couple", label: "Couple" },
    { id: "unisex", label: "Unisex" },
];

const pill = (active) =>
    `text-[0.72rem] px-3 py-1 rounded-full border transition ${active
        ? "bg-black text-white border-black"
        : "bg-white border-[#E4E8EE] text-zinc-700 hover:border-zinc-400"}`;

const fieldCls =
    "w-full px-3 py-2 border text-[0.8rem] text-zinc-900 bg-white border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500";

// Counts how many filters are set (for the collapsed summary).
const countFilters = (f = {}) =>
    (f.collectionId?.length || 0) + (f.metals?.length || 0) + (f.shapes?.length || 0) + (f.tags?.length || 0) + (f.gender?.length || 0) +
    ["minPrice", "maxPrice", "minWeight", "maxWeight"].filter((k) => f[k] !== undefined && f[k] !== null && f[k] !== "").length;

// ---- product/price/weight filter editor -----------------------------------
// Collapsed by default so the (heavy) metal/shape/tag checkbox lists aren't
// mounted unless the admin actually wants to add filters.
function FiltersEditor({ filters = {}, onChange }) {
    const { collections, metals, shapes, tags } = useRedirectOptions();
    const patch = (p) => onChange({ ...filters, ...p });
    const active = countFilters(filters);
    const [open, setOpen] = useState(active > 0);

    return (
        <div className="border-t border-[#E4E8EE] pt-3 mt-1">
            <button type="button" onClick={() => setOpen((o) => !o)}
                className="text-[0.72rem] font-semibold text-zinc-600 hover:text-zinc-900">
                {open ? "▾" : "▸"} Optional filters{active > 0 ? ` (${active} active)` : ""}
            </button>
            {open && (
                <div className="space-y-3 mt-3">
                    {/* Collection filter — narrows to products also in these
                        collection(s), e.g. Category Rings ∩ collection. */}
                    <MultiSelect label="Collection" items={collections} value={filters.collectionId} onChange={(v) => patch({ collectionId: v })}
                        getId={(c) => c._id} getLabel={(c) => c.collectionName} />
                    <MultiSelect label="Metal" items={metals} value={filters.metals} onChange={(v) => patch({ metals: v })}
                        getId={(m) => m._id} getLabel={(m) => m.name || `${m.type || ""} ${m.stamp || ""}`.trim()} />
                    <MultiSelect label="Shape" items={shapes} value={filters.shapes} onChange={(v) => patch({ shapes: v })}
                        getId={(s) => s.name || s.code} getLabel={(s) => s.name || s.code} />
                    <MultiSelect label="Tags" items={tags} value={filters.tags} onChange={(v) => patch({ tags: v })}
                        getId={(t) => t._id} getLabel={(t) => t.name} />
                    <MultiSelect label="Gender" items={GENDER_OPTIONS} value={filters.gender} onChange={(v) => patch({ gender: v })}
                        getId={(g) => g.id} getLabel={(g) => g.label} />
                    <div className="grid grid-cols-2 gap-3">
                        <LazyInput type="number" className={fieldCls} placeholder="Min Price" value={filters.minPrice ?? ""} onCommit={(v) => patch({ minPrice: v })} />
                        <LazyInput type="number" className={fieldCls} placeholder="Max Price" value={filters.maxPrice ?? ""} onCommit={(v) => patch({ maxPrice: v })} />
                        <LazyInput type="number" className={fieldCls} placeholder="Min Weight (g)" value={filters.minWeight ?? ""} onCommit={(v) => patch({ minWeight: v })} />
                        <LazyInput type="number" className={fieldCls} placeholder="Max Weight (g)" value={filters.maxWeight ?? ""} onCommit={(v) => patch({ maxWeight: v })} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default function RedirectPicker({ value, onChange, label = "Link destination" }) {
    const redirect = value || emptyRedirect;
    const { pages, categories, collections, offers, tags } = useRedirectOptions();

    const [productSearch, setProductSearch] = useState("");
    const [products, setProducts] = useState([]);
    const [productMode, setProductMode] = useState(redirect.slug ? "slug" : "search");

    const token = getToken();

    // Top-level categories (for the category list target) and their children.
    const topCategories = useMemo(
        () => (categories || []).filter((c) => !c.parentCategoryId),
        [categories]
    );
    const subCategories = useMemo(
        () => (categories || []).filter((c) => String(c.parentCategoryId) === String(redirect.refId)),
        [categories, redirect.refId]
    );

    // Product search (debounced) when in product/search mode.
    useEffect(() => {
        if (redirect.type !== REDIRECT_TYPE.PRODUCT || productMode !== "search") return;
        let cancelled = false;
        const handle = setTimeout(async () => {
            try {
                const body = { page: 1, limit: 20 };
                if (productSearch) body.search = productSearch;
                const res = await callApi(API_URL.HOME_SECTION_PRODUCT_SEARCH, "POST", body, token);
                if (!cancelled && res?.errorCode === STATUS_CODE.OK) {
                    const list = res?.data?.list || res?.data?.products || res?.data || [];
                    setProducts(Array.isArray(list) ? list : []);
                }
            } catch (err) {
                console.error("RedirectPicker product search error:", err);
            }
        }, 300);
        return () => { cancelled = true; clearTimeout(handle); };
    }, [redirect.type, productMode, productSearch, token]);

    const setType = (type) => onChange({ type });
    const update = (patch) => onChange({ ...redirect, ...patch });
    const setListOf = (listOf) => {
        const next = { type: REDIRECT_TYPE.LIST, listOf, refId: "", filters: redirect.filters };
        // New category picks default to the product list (the usual intent);
        // admin can switch to the editorial landing page.
        if (listOf === REDIRECT_LIST_OF.CATEGORY) {
            next.categoryView = "products";
            next.categoryIds = [];
        }
        onChange(next);
    };

    // Selected category ids (multi-select). Falls back to the legacy single
    // refId. Subcategory + landing/products only apply when exactly one is set.
    const selectedCatIds = (Array.isArray(redirect.categoryIds) && redirect.categoryIds.length)
        ? redirect.categoryIds
        : (redirect.refId ? [redirect.refId] : []);
    const singleCategory = selectedCatIds.length === 1;
    const setCategoryIds = (ids) => {
        const patch = { categoryIds: ids, refId: ids[0] || "" };
        if (ids.length !== 1) patch.subCategoryId = "";
        update(patch);
    };

    const showFilters =
        redirect.type === REDIRECT_TYPE.LIST &&
        [REDIRECT_LIST_OF.ALL, REDIRECT_LIST_OF.CATEGORY, REDIRECT_LIST_OF.COLLECTION].includes(redirect.listOf);

    return (
        <div className="border border-[#E4E8EE] rounded-md p-3 bg-zinc-50/50 space-y-3">
            <div className="text-[0.8rem] font-semibold">{label}</div>

            <div className="flex flex-wrap gap-2">
                {[
                    { key: REDIRECT_TYPE.NONE, label: "None" },
                    { key: REDIRECT_TYPE.DIRECT, label: "Custom URL" },
                    { key: REDIRECT_TYPE.PAGE, label: "Website Page" },
                    { key: REDIRECT_TYPE.LIST, label: "Product List" },
                    { key: REDIRECT_TYPE.PRODUCT, label: "Product Detail" },
                ].map((opt) => (
                    <button type="button" key={opt.key} onClick={() => setType(opt.key)} className={pill(redirect.type === opt.key)}>
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* DIRECT */}
            {redirect.type === REDIRECT_TYPE.DIRECT && (
                <LazyInput className={fieldCls} placeholder="https://... or /shop"
                    value={redirect.url || ""} onCommit={(v) => update({ url: v })} />
            )}

            {/* PAGE */}
            {redirect.type === REDIRECT_TYPE.PAGE && (
                <select className={fieldCls} value={redirect.pageKey || ""} onChange={(e) => update({ pageKey: e.target.value })}>
                    <option value="">— Select page —</option>
                    {(pages || []).map((p) => (
                        <option key={p.key} value={p.key}>{p.label} ({p.path})</option>
                    ))}
                </select>
            )}

            {/* LIST */}
            {redirect.type === REDIRECT_TYPE.LIST && (
                <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                        {[
                            { key: REDIRECT_LIST_OF.ALL, label: "All Products" },
                            { key: REDIRECT_LIST_OF.CATEGORY, label: "Category" },
                            { key: REDIRECT_LIST_OF.COLLECTION, label: "Collection" },
                            { key: REDIRECT_LIST_OF.OFFER, label: "Offer" },
                            { key: REDIRECT_LIST_OF.TAG, label: "Tag" },
                        ].map((opt) => (
                            <button type="button" key={opt.key} onClick={() => setListOf(opt.key)} className={pill(redirect.listOf === opt.key)}>
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {redirect.listOf === REDIRECT_LIST_OF.CATEGORY && (
                        <div className="space-y-3">
                            {/* Multi-select: pick one or more categories. Two or
                                more → the link opens /shop filtered by all of them. */}
                            <MultiSelect
                                label="Categories (pick one or more)"
                                items={topCategories}
                                value={selectedCatIds}
                                onChange={setCategoryIds}
                                getId={(c) => c._id}
                                getLabel={(c) => c.categoryName}
                            />
                            {selectedCatIds.length > 1 && (
                                <p className="text-[0.7rem] text-zinc-500">
                                    {selectedCatIds.length} categories selected → opens a combined product list (/shop).
                                </p>
                            )}

                            {/* Subcategory + landing/products only apply to a
                                single category. */}
                            {singleCategory && (
                                <div>
                                    <div className="text-[0.75rem] font-semibold mb-1">Subcategory (optional)</div>
                                    <select className={fieldCls} value={redirect.subCategoryId || ""}
                                        onChange={(e) => update({ subCategoryId: e.target.value })}>
                                        <option value="">— Any —</option>
                                        {subCategories.map((c) => (
                                            <option key={c._id} value={c._id}>{c.categoryName}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Landing vs product-list — single category, no
                                subcategory (a subcategory is always a list). */}
                            {singleCategory && !redirect.subCategoryId && (
                                <div>
                                    <div className="text-[0.75rem] font-semibold mb-1">When clicked, open</div>
                                    <div className="flex gap-2">
                                        {[
                                            { key: "products", label: "All products" },
                                            { key: "landing", label: "Category landing page" },
                                        ].map((opt) => {
                                            const current = redirect.categoryView || "landing";
                                            return (
                                                <button type="button" key={opt.key}
                                                    onClick={() => update({ categoryView: opt.key })}
                                                    className={pill(current === opt.key)}>
                                                    {opt.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {redirect.listOf === REDIRECT_LIST_OF.COLLECTION && (
                        <select className={fieldCls} value={redirect.refId || ""} onChange={(e) => update({ refId: e.target.value })}>
                            <option value="">— Select collection —</option>
                            {(collections || []).map((c) => (
                                <option key={c._id} value={c._id}>{c.collectionName}</option>
                            ))}
                        </select>
                    )}

                    {redirect.listOf === REDIRECT_LIST_OF.OFFER && (
                        <select className={fieldCls} value={redirect.refId || ""} onChange={(e) => update({ refId: e.target.value })}>
                            <option value="">— Select offer —</option>
                            {(offers || []).map((o) => (
                                <option key={o._id} value={o._id}>{o.name} ({o.code})</option>
                            ))}
                        </select>
                    )}

                    {redirect.listOf === REDIRECT_LIST_OF.TAG && (
                        <select className={fieldCls} value={redirect.refId || ""} onChange={(e) => update({ refId: e.target.value })}>
                            <option value="">— Select tag —</option>
                            {(tags || []).map((t) => (
                                <option key={t._id} value={t._id}>{t.name}</option>
                            ))}
                        </select>
                    )}

                    {showFilters && (
                        <FiltersEditor filters={redirect.filters || {}} onChange={(filters) => update({ filters })} />
                    )}
                </div>
            )}

            {/* PRODUCT */}
            {redirect.type === REDIRECT_TYPE.PRODUCT && (
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <button type="button" className={pill(productMode === "search")} onClick={() => setProductMode("search")}>By Search / SKU</button>
                        <button type="button" className={pill(productMode === "slug")} onClick={() => setProductMode("slug")}>By Slug</button>
                    </div>

                    {productMode === "search" ? (
                        <>
                            <input className={fieldCls} placeholder="Search by title or SKU"
                                value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
                            <select className={fieldCls} value={redirect.productId || ""}
                                onChange={(e) => {
                                    const id = e.target.value;
                                    const p = products.find((x) => String(x._id || x.id) === id);
                                    update({
                                        productId: id,
                                        itemCode: p?.itemCode || "",
                                        productLabel: p ? (p.productTitle || p.title || p.itemCode) : redirect.productLabel,
                                        slug: "",
                                    });
                                }}>
                                <option value="">— Select product —</option>
                                {redirect.productId && !products.some((x) => String(x._id || x.id) === String(redirect.productId)) && (
                                    <option value={redirect.productId}>{redirect.productLabel || redirect.itemCode || redirect.productId}</option>
                                )}
                                {products.map((p) => {
                                    const id = p._id || p.id;
                                    return <option key={id} value={id}>{p.productTitle || p.title || p.itemCode || id}</option>;
                                })}
                            </select>
                        </>
                    ) : (
                        <LazyInput className={fieldCls} placeholder="product-slug-here"
                            value={redirect.slug || ""} onCommit={(v) => update({ type: REDIRECT_TYPE.PRODUCT, slug: v, productId: "", itemCode: "" })} />
                    )}
                </div>
            )}
        </div>
    );
}
