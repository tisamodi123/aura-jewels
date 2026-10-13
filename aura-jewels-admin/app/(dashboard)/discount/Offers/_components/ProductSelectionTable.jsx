"use client";

import React, { useEffect, useState, useRef } from "react";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { callApi } from "@/lib/callApi";
import { API_URL } from "@/lib/APIUrl";
import { OFFER_FILTER_TYPE, STATUS_CODE } from "@/lib/Constant";
import { showError } from "@/lib/toast";
import { getToken } from "@/lib/auth";
import { useOfferStore } from "@/lib/stores/offerStore";
import { useFilterStore } from "@/lib/stores/filterStore";
import TablePagination from "@/components/TablePagination";
import CommonProductTable from "./CommonProductTable";
import SearchFilters from "./SearchFilters";

export default function ProductSelectionTable({
    selectedProducts = [],
    onChange,
    priceRange,
    editRowData,
    selectedCats,
    setSelectedCats,
    selectedSubs,
    setSelectedSubs,
    selectedColls,
    setSelectedColls,
    selectedTags,
    setSelectedTags,
    categories,
    subCategories,
    collections,
    tags,
}) {
    const token = getToken();

    const { filterType, customeMode } = useOfferStore();
    const { setCatagoryIds, setSubCatagoryIds, setCollectionIds, setTagsIds } = useFilterStore();

    // Products Listing & Filtering states
    const [productsList, setProductsList] = useState([]);
    const [isProductsLoading, setIsProductsLoading] = useState(false);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [totalProducts, setTotalProducts] = useState(0);

    // Dynamic Filter State
    const [skuFilter, setSkuFilter] = useState("");
    const [slugFilter, setSlugFilter] = useState("");
    const [minPrice, setMinPrice] = useState(priceRange?.from);
    const [maxPrice, setMaxPrice] = useState(priceRange?.to);

    // Reset pagination to first page when filterType or customMode changes (Derived state)
    const [prevFilterType, setPrevFilterType] = useState(filterType);
    const [prevCustomeMode, setPrevCustomeMode] = useState(customeMode);

    if (filterType !== prevFilterType || customeMode !== prevCustomeMode) {
        setPrevFilterType(filterType);
        setPrevCustomeMode(customeMode);
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }

    // Fetch Products List & Sync to Zustand Store
    useEffect(() => {
        // Sync local selected filters with the Zustand store
        setCatagoryIds(selectedCats.map(c => c.value));
        setSubCatagoryIds(selectedSubs.map(s => s.value));
        setCollectionIds(selectedColls.map(c => c.value));
        setTagsIds(selectedTags.map(t => t.value));

        const fetchFilteredProducts = async () => {
            setIsProductsLoading(true);
            try {
                const formdata = new FormData();
                formdata.append("page", pagination.pageIndex + 1);
                formdata.append("limit", pagination.pageSize);
                formdata.append("category", JSON.stringify(selectedCats.map(c => c.value)));
                formdata.append("subCategory", JSON.stringify(selectedSubs.map(s => s.value)));
                formdata.append("collectionId", JSON.stringify(selectedColls.map(col => col.value)));
                formdata.append("tags", JSON.stringify(selectedTags.map(t => t.value)));

                if (skuFilter) {
                    formdata.append("search", skuFilter);
                }
                if (minPrice) {
                    formdata.append("minPrice", Number(minPrice));
                }
                if (maxPrice) {
                    formdata.append("maxPrice", Number(maxPrice));
                }
                if (filterType) {
                    formdata.append("applicableType", filterType);
                }
                if (filterType === OFFER_FILTER_TYPE[1]?.value) {
                    formdata.append("customMode", customeMode);
                }

                const res = await callApi(API_URL.GET_ALL_PRODUCTS_LIST, "POST", formdata, token);
                if (res?.errorCode === STATUS_CODE.OK) {
                    const rawData = res.data || {};
                    const products = Array.isArray(rawData) ? rawData : (rawData.products || []);
                    const total = rawData.pagination?.total !== undefined
                        ? rawData.pagination.total
                        : (rawData.total !== undefined ? rawData.total : (res.pagination?.total || res.totalCount || 0));
                    setProductsList(products);
                    setTotalProducts(total);
                } else {
                    showError(res?.message || "Failed to load products list");
                }
            } catch (err) {
                console.log("Error loading products", err);
            } finally {
                setIsProductsLoading(false);
            }
        };

        fetchFilteredProducts();
    }, [
        pagination.pageIndex,
        pagination.pageSize,
        selectedCats,
        selectedSubs,
        selectedColls,
        selectedTags,
        skuFilter,
        slugFilter,
        minPrice,
        maxPrice,
        filterType,
        customeMode,
        setCatagoryIds,
        setSubCatagoryIds,
        setCollectionIds,
        setTagsIds,
        token
    ]);

    // Selection helpers
    const toggleProductSelection = (productId) => {
        const current = [...selectedProducts];
        let nextSelected;
        if (current.includes(productId)) {
            nextSelected = current.filter(id => id !== productId);
        } else {
            nextSelected = [...current, productId];
        }
        if (onChange) {
            onChange(nextSelected);
        }
    };

    const handleSelectAllOnPage = (checked) => {
        const currentPageIds = productsList.map(p => p._id);
        const currentSelected = [...selectedProducts];
        let nextSelected;

        if (checked) {
            nextSelected = [...currentSelected];
            currentPageIds.forEach(id => {
                if (!nextSelected.includes(id)) {
                    nextSelected.push(id);
                }
            });
        } else {
            nextSelected = currentSelected.filter(id => !currentPageIds.includes(id));
        }

        if (onChange) {
            onChange(nextSelected);
        }
    };

    const isAllSelectedOnPage = () => {
        if (productsList.length === 0) return false;
        return productsList?.every(p => selectedProducts.includes(p._id));
    };

    const totalPages = Math.ceil(totalProducts / pagination.pageSize) || 1;

    return (
        <div className="space-y-6">
            {/* Advanced Search & Filtering Controls */}
            <SearchFilters
                categories={categories}
                subCategories={subCategories}
                collections={collections}
                tags={tags}
                selectedCats={selectedCats}
                setSelectedCats={setSelectedCats}
                selectedSubs={selectedSubs}
                setSelectedSubs={setSelectedSubs}
                selectedColls={selectedColls}
                setSelectedColls={setSelectedColls}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
                skuFilter={skuFilter}
                setSkuFilter={setSkuFilter}
                slugFilter={slugFilter}
                setSlugFilter={setSlugFilter}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                setPagination={setPagination}
            />

            {/* Products Selection Listing Table */}
            <div className="bg-white border border-[#E4E8EE] rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50/30">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Matching Products ({totalProducts})</span>
                    <span className="text-[11px] text-zinc-500 font-semibold bg-white border px-3 py-1 rounded-full shadow-sm">
                        Page {pagination.pageIndex + 1} of {totalPages}
                    </span>
                </div>

                <div className="overflow-x-auto min-h-[300px]">
                    {isProductsLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
                            <Loader2 size={32} className="animate-spin text-zinc-400 mb-2" />
                            <p className="text-xs font-medium">Fetching jewellery list...</p>
                        </div>
                    ) : productsList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
                            <ImageIcon size={32} className="stroke-[1.5] text-zinc-300 mb-2" />
                            <p className="text-xs font-medium">No products match selection filters</p>
                            <p className="text-[10px] text-zinc-400">Adjust search parameters to widen the query</p>
                        </div>
                    ) : (
                        <CommonProductTable
                            products={productsList}
                            selectedProducts={selectedProducts}
                            onToggleSelect={toggleProductSelection}
                            onSelectAll={handleSelectAllOnPage}
                            isAllSelected={isAllSelectedOnPage()}
                            loading={isProductsLoading}
                        />
                    )}
                </div>

                {/* Pagination Controls */}
                {productsList.length > 0 && (
                    <TablePagination
                        pagination={pagination}
                        setPagination={setPagination}
                        totalRows={totalProducts}
                    />
                )}
            </div>
        </div>
    );
}
