"use client";

import { useEffect, useState } from "react";
import { M } from "@/lib/messages";
import SectionShell from "../_components/SectionShell";
import TextField from "../_components/TextField";
import ImageField from "../_components/ImageField";
import RedirectPicker from "../_components/RedirectPicker";
import ProductPicker from "../_components/ProductPicker";

// Auth & API utilities from admin
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import { API_URL } from "@/lib/APIUrl";
import { STATUS_CODE } from "@/lib/Constant";
import { customSelectStyles } from "@/lib/utils";
import Select from "react-select";
import { X, Search, Loader2, Image as ImageIcon } from "lucide-react";

const defaults = {
    heading: "",
    subText: "",
    image: "",
    imageMobile: "",
    ctaText: "",
    redirect: { type: "direct", url: "" },
    // Product Selection
    productIds: [], // Active product IDs rendered on the storefront
    customProductIds: [], // Stores product IDs chosen under Custom tab
    dayWiseProductIds: [], // Stores product IDs checked under Day-wise tab
    selectionType: "custom", // "custom" | "dayWise"
    // Filtering Criteria for Day Wise mode
    lastNDays: "",
    categoryIds: [],
    subCategoryIds: [],
    collectionIds: [],
    tags: []
};

// DayWise Selection Functional Component
function DayWiseSelector({ content, setContent, token }) {
    const [categories, setCategories] = useState([]);
    const [allSubCategoriesList, setAllSubCategoriesList] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [collections, setCollections] = useState([]);
    const [tagsList, setTagsList] = useState([]);

    const [matchingProducts, setMatchingProducts] = useState([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Load static filter masters on mount
    useEffect(() => {
        let active = true;
        const loadFilterOptions = async () => {
            try {
                // Fetch categories
                const catRes = await callApi(API_URL.PARENT_CATEGORY_LIST, "GET", null, token);
                if (!active) return;
                if (catRes?.errorCode === STATUS_CODE.OK) {
                    const allCats = catRes.data || [];
                    const parentFormatted = allCats.map(c => ({ label: c.categoryName, value: c._id }));
                    setCategories(parentFormatted);
                }

                // Fetch collections
                const colRes = await callApi(API_URL.GET_COLLECTIONS_LIST, "GET", null, token);
                if (!active) return;
                if (colRes?.errorCode === STATUS_CODE.OK) {
                    const colFormatted = (colRes.data || []).map(c => ({ label: c.name || c.collectionName, value: c._id }));
                    setCollections(colFormatted);
                }

                // Fetch tags
                const tagRes = await callApi(API_URL.GET_TAGS, "GET", null, token);
                if (!active) return;
                if (tagRes?.errorCode === STATUS_CODE.OK) {
                    const tagFormatted = (tagRes.data || []).map(t => ({ label: t.name, value: t._id }));
                    setTagsList(tagFormatted);
                }
            } catch (err) {
                console.error("Error loading filter options:", err);
            }
        };

        loadFilterOptions();
        return () => {
            active = false;
        };
    }, [token]);

    // Load subcategories dynamically from category selection
    useEffect(() => {
        let active = true;
        const fetchSubcategories = async () => {
            const selectedCatsVal = content.categoryIds || [];
            if (selectedCatsVal.length === 0) {
                setSubCategories([]);
                return;
            }

            try {
                const results = await Promise.all(
                    selectedCatsVal.map((id) =>
                        callApi(`${API_URL.SUB_CATEGORY_LIST}/${id}`, "GET", null, token)
                    )
                );
                if (!active) return;

                const merged = results.reduce((acc, result) => {
                    if (result?.errorCode === STATUS_CODE.OK && result?.data) {
                        return [...acc, ...result.data];
                    }
                    return acc;
                }, []);

                const unique = merged.filter((item, index, self) =>
                    self.findIndex((t) => t._id === item._id) === index
                );

                const formattedSubs = unique.map(s => ({ label: s.categoryName, value: s._id }));
                setSubCategories(formattedSubs);
            } catch (error) {
                console.error("Error fetching subcategories dynamically:", error);
            }
        };

        fetchSubcategories();
        return () => {
            active = false;
        };
    }, [content.categoryIds, token]);

    // Query products list in real-time matching filters
    useEffect(() => {
        let active = true;
        const fetchMatching = async () => {
            try {
                setIsLoadingProducts(true);
                const payload = {
                    page: 1,
                    limit: 100, // Fetch up to 100 matching products
                    // category: content.categoryIds || [],
                    // subCategory: content.subCategoryIds || [],
                    // collectionId: content.collectionIds || [],
                    // tags: content.tags || [],
                    lastNDays: content.lastNDays || "",
                    // fromDate: "",
                    // toDate: "",
                    parantOnly: true,
                    search: searchQuery
                };

                if (content.lastNDays) {
                    const date = new Date();
                    date.setDate(date.getDate() - Number(content.lastNDays));
                    const yyyy = date.getFullYear();
                    const mm = String(date.getMonth() + 1).padStart(2, '0');
                    const dd = String(date.getDate()).padStart(2, '0');
                    payload.fromDate = `${yyyy}/${mm}/${dd}`;
                }

                const result = await callApi(API_URL.GET_JEWELLERY_LIST, "POST", payload, token);
                if (!active) return;

                if (result?.errorCode === STATUS_CODE.OK) {
                    setMatchingProducts(result?.data || []);
                } else {
                    setMatchingProducts([]);
                }
            } catch (err) {
                console.error("Error fetching matching products:", err);
            } finally {
                if (active) setIsLoadingProducts(false);
            }
        };

        const delayDebounce = setTimeout(() => {
            fetchMatching();
        }, 500);

        return () => {
            active = false;
            clearTimeout(delayDebounce);
        };
    }, [
        content.lastNDays,
        content.categoryIds,
        content.subCategoryIds,
        content.collectionIds,
        content.tags,
        searchQuery,
        token
    ]);

    const toggleProduct = (productId) => {
        const idStr = String(productId);
        const currentSelected = content.productIds || [];
        const next = currentSelected.includes(idStr)
            ? currentSelected.filter(id => id !== idStr)
            : [...currentSelected, idStr];
        setContent({ ...content, productIds: next, dayWiseProductIds: next });
    };

    const handleSelectAll = () => {
        const matchIds = matchingProducts.map(p => String(p._id || p.id));
        const currentSelected = content.productIds || [];
        const merged = Array.from(new Set([...currentSelected, ...matchIds]));
        setContent({ ...content, productIds: merged, dayWiseProductIds: merged });
    };

    const handleDeselectAll = () => {
        const matchIds = new Set(matchingProducts.map(p => String(p._id || p.id)));
        const currentSelected = content.productIds || [];
        const next = currentSelected.filter(id => !matchIds.has(id));
        setContent({ ...content, productIds: next, dayWiseProductIds: next });
    };

    return (
        <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Last N Days Input */}
                <div className="col-span-1">
                    <label className="block text-[0.80rem] font-semibold text-zinc-700 mb-1">Last N Days</label>
                    <input
                        type="number"
                        placeholder="e.g. 10"
                        value={content.lastNDays || ""}
                        onChange={(e) => setContent({
                            ...content,
                            lastNDays: e.target.value === "" ? "" : Number(e.target.value)
                        })}
                        className="w-full px-3 py-1.5 border placeholder:text-[#656B7B] text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-black h-[38px] bg-white"
                    />
                </div>

                {/* Category Multi-Select */}
                {/* <div className="col-span-1">
                    <label className="block text-[0.80rem] font-semibold text-zinc-700 mb-1">Category</label>
                    <Select
                        isMulti
                        instanceId="daywise-category-select"
                        placeholder="Select Categories"
                        options={categories}
                        value={categories.filter(c => (content.categoryIds || []).includes(c.value))}
                        onChange={(options) => setContent({
                            ...content,
                            categoryIds: (options || []).map(o => o.value),
                            subCategoryIds: []
                        })}
                        styles={customSelectStyles}
                    />
                </div> */}

                {/* Subcategory Multi-Select */}
                {/* <div className="col-span-1">
                    <label className="block text-[0.80rem] font-semibold text-zinc-700 mb-1">Subcategory</label>
                    <Select
                        isMulti
                        instanceId="daywise-subcategory-select"
                        placeholder="Select Subcategories"
                        options={subCategories}
                        value={subCategories.filter(s => (content.subCategoryIds || []).includes(s.value))}
                        onChange={(options) => setContent({
                            ...content,
                            subCategoryIds: (options || []).map(o => o.value)
                        })}
                        styles={customSelectStyles}
                    />
                </div> */}

                {/* Collection Multi-Select */}
                {/* <div className="col-span-1">
                    <label className="block text-[0.80rem] font-semibold text-zinc-700 mb-1">Collection</label>
                    <Select
                        isMulti
                        instanceId="daywise-collection-select"
                        placeholder="Select Collections"
                        options={collections}
                        value={collections.filter(c => (content.collectionIds || []).includes(c.value))}
                        onChange={(options) => setContent({
                            ...content,
                            collectionIds: (options || []).map(o => o.value)
                        })}
                        styles={customSelectStyles}
                    />
                </div> */}

                {/* Tag Multi-Select */}
                {/* <div className="col-span-1">
                    <label className="block text-[0.80rem] font-semibold text-zinc-700 mb-1">Tag</label>
                    <Select
                        isMulti
                        instanceId="daywise-tag-select"
                        placeholder="Select Tags"
                        options={tagsList}
                        value={tagsList.filter(t => (content.tags || []).includes(t.value))}
                        onChange={(options) => setContent({
                            ...content,
                            tags: (options || []).map(o => o.value)
                        })}
                        styles={customSelectStyles}
                    />
                </div> */}
            </div>

            {/* Results Title & Search within Results */}
            <div className="border-t border-zinc-200 pt-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <h4 className="font-semibold text-xs text-zinc-800">
                            Matching Products ({matchingProducts.length})
                        </h4>
                        <p className="text-[10px] text-zinc-500">
                            Preview of products matching filters. These are automatically selected on the storefront.
                        </p>
                    </div>

                    {/* <div className="flex items-center gap-2">
                        {matchingProducts.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-1 sm:mt-0">
                                <button
                                    type="button"
                                    onClick={handleSelectAll}
                                    className="px-2.5 py-1 text-[11px] font-semibold bg-black text-white hover:bg-zinc-800 rounded transition cursor-pointer"
                                >
                                    Select All
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeselectAll}
                                    className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50 rounded transition cursor-pointer"
                                >
                                    Deselect All
                                </button>
                            </div>
                        )}
                    </div> */}
                </div>

                {/* Search Input inside results */}
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search matching results by code or title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white pl-8 pr-8 text-xs text-zinc-700 border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black h-[34px]"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2.5 top-1/2 transform -translate-y-1/2 p-0.5 text-zinc-450 hover:text-zinc-650"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {/* Product List Checklist */}
                <div className="border rounded-md overflow-hidden bg-white max-h-[350px] overflow-y-auto min-h-[120px] relative">
                    {isLoadingProducts && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                            <span className="flex items-center gap-2 text-xs text-zinc-600 font-semibold">
                                <Loader2 className="h-4 w-4 animate-spin text-black" />
                                Loading matching products...
                            </span>
                        </div>
                    )}

                    {matchingProducts.length === 0 ? (
                        <div className="text-center py-10 text-xs text-zinc-400">
                            No matching products found. Adjust filters to search.
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-100">
                            {matchingProducts.map((product, index) => {
                                const idStr = String(product._id || product.id);
                                const isChecked = (content.productIds || []).includes(idStr);
                                const firstImage = product.image || product.images?.[0]?.MediaLocation;
                                const title = product.productTitle || product.title || product.name || "Untitled";
                                const itemCode = product.itemCode || "-";
                                const priceVal = product.finalPrice || product.overallPrice || product.sellingPrice || 0;
                                const priceStr = priceVal ? `₹${priceVal.toLocaleString()}` : "-";

                                return (
                                    <label
                                        key={idStr}
                                        className={`flex items-center gap-3 p-2.5 hover:bg-zinc-50/50 cursor-pointer transition select-none ${isChecked ? "bg-zinc-50/30" : ""
                                            }`}
                                    >
                                        {/* <input
                                            type="checkbox"
                                            className="h-3.5 w-3.5 border-zinc-300 rounded text-black focus:ring-black cursor-pointer"
                                            checked={isChecked}
                                            onChange={() => toggleProduct(idStr)}
                                        /> */}
                                        <div>
                                            <span>{index}</span>
                                        </div>

                                        {/* <div className="relative w-10 h-10 bg-zinc-100 border rounded-sm overflow-hidden flex-shrink-0 flex items-center justify-center">
                                            {firstImage ? (
                                                <img
                                                    src={firstImage}
                                                    alt={title}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = "none";
                                                    }}
                                                />
                                            ) : (
                                                <ImageIcon className="h-4 w-4 text-zinc-450" />
                                            )}
                                        </div> */}

                                        <div className="flex-1 min-w-0 pr-2">
                                            <p className="text-xs font-semibold text-zinc-800 truncate mb-0.5" title={title}>
                                                {title}
                                            </p>
                                            <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-medium">
                                                <span>Code: {itemCode}</span>
                                                <span>•</span>
                                                <span className="text-zinc-650">Price: {priceStr}</span>
                                            </div>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Selection Summary */}
                {/* <div className="flex items-center justify-between text-[11px] text-zinc-500 bg-zinc-50 p-2.5 rounded border border-zinc-100">
                    <span>
                        Selected from match: <strong>{matchingProducts.filter(p => (content.productIds || []).includes(String(p._id || p.id))).length}</strong> / {matchingProducts.length}
                    </span>
                    <span>
                        Total featured products: <strong>{(content.productIds || []).length}</strong>
                    </span>
                </div> */}
            </div>
        </div>
    );
}

export default function SignatureShowcaseEditor({ sectionKey, title }) {
    const token = getToken();

    return (
        <SectionShell
            sectionKey={sectionKey}
            title={title}
            defaults={defaults}
            renderContent={({ content, setContent }) => (
                <div className="space-y-6">
                    <div className="bg-zinc-50 p-4 border rounded-md space-y-4">
                        <h3 className="font-semibold text-sm text-zinc-800">Showcase Content</h3>
                        <TextField
                            label="Heading"
                            value={content.heading || ""}
                            onChange={(v) => setContent({ ...content, heading: v })}
                        />
                        <TextField
                            label="Subtext"
                            value={content.subText || ""}
                            onChange={(v) => setContent({ ...content, subText: v })}
                        />
                        <TextField
                            label="Description"
                            value={content.description || ""}
                            onChange={(v) => setContent({ ...content, description: v })}
                            textarea
                        />
                        <TextField
                            label="Button Text"
                            value={content.ctaText || ""}
                            onChange={(v) => setContent({ ...content, ctaText: v })}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <ImageField
                                label="Image (Desktop)"
                                value={content.image || ""}
                                onChange={(v) => setContent({ ...content, image: v })}
                                expectedWidth={556}
                                expectedHeight={696}
                            />
                            <ImageField
                                label="Image (Mobile)"
                                value={content.imageMobile || ""}
                                onChange={(v) => setContent({ ...content, imageMobile: v })}
                                hint={M.home.labels.imageMobileHint}
                                expectedWidth={368}
                                expectedHeight={460}
                            />
                        </div>
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Button Link</label>
                            <RedirectPicker
                                value={content.redirect || { type: "direct", url: "" }}
                                onChange={(redirect) => setContent({ ...content, redirect })}
                            />
                        </div>
                    </div>

                    <div className="bg-zinc-50 p-4 border rounded-md space-y-4">
                        <h3 className="font-semibold text-sm text-zinc-800">Featured Products Selection</h3>

                        <div className="flex border-b border-zinc-200">
                            <button
                                type="button"
                                onClick={() => setContent({
                                    ...content,
                                    selectionType: "custom",
                                    productIds: content.customProductIds || []
                                })}
                                className={`px-4 py-2 text-xs font-semibold border-b-2 -mb-[2px] transition-all cursor-pointer ${content.selectionType !== "dayWise"
                                    ? "border-black text-black"
                                    : "border-transparent text-zinc-400 hover:text-zinc-650"
                                    }`}
                            >
                                Custom Selection
                            </button>
                            <button
                                type="button"
                                onClick={() => setContent({
                                    ...content,
                                    selectionType: "dayWise",
                                    productIds: content.dayWiseProductIds || []
                                })}
                                className={`px-4 py-2 text-xs font-semibold border-b-2 -mb-[2px] transition-all cursor-pointer ${content.selectionType === "dayWise"
                                    ? "border-black text-black"
                                    : "border-transparent text-zinc-400 hover:text-zinc-650"
                                    }`}
                            >
                                Day Wise Selection
                            </button>
                        </div>

                        {content.selectionType !== "dayWise" ? (
                            <div className="pt-2 space-y-3">
                                <p className="text-xs text-zinc-500">Pick the products to feature in this carousel. Leave empty to auto-show the 8 newest products.</p>
                                <ProductPicker
                                    label={M.home?.labels?.products || "Products"}
                                    value={content.productIds || []}
                                    onChange={(productIds) => setContent({
                                        ...content,
                                        productIds,
                                        customProductIds: productIds
                                    })}
                                />
                            </div>
                        ) : (
                            <DayWiseSelector content={content} setContent={setContent} token={token} />
                        )}
                    </div>
                </div>
            )}
        />
    );
}
