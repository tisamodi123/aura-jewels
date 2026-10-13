"use client";

import React, { useState } from "react";
import Select from "react-select";
import { Search, ChevronDown, ChevronUp, Filter } from "lucide-react";
import { OFFER_CUSTOM_MODE, OFFER_FILTER_TYPE } from "@/lib/Constant";
import { Switch } from "@/components/ui/switch";
import { useOfferStore } from "@/lib/stores/offerStore";
import { customSelectStyles } from "@/lib/utils";

export default function SearchFilters({
    categories,
    subCategories,
    collections,
    tags,
    selectedCats,
    setSelectedCats,
    selectedSubs,
    setSelectedSubs,
    selectedColls,
    setSelectedColls,
    selectedTags,
    setSelectedTags,
    skuFilter,
    setSkuFilter,
    slugFilter,
    setSlugFilter,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    setPagination,
}) {
    const [showFilters, setShowFilters] = useState(false);
    const { filterType, setFilterType, customeMode, setCustomeMode } = useOfferStore();

    const handleClearFilters = () => {
        setSelectedCats([]);
        setSelectedSubs([]);
        setSelectedColls([]);
        setSelectedTags([]);
        setSkuFilter("");
        setSlugFilter("");
        setMinPrice(minPrice);
        setMaxPrice(maxPrice);
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    };

    return (
        <div className="bg-white border border-[#E4E8EE] rounded-lg shadow-sm p-5">
            <div
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex justify-between items-center cursor-pointer select-none text-left"
            >
                <div className="flex items-center gap-2">
                    <Filter size={15} className="text-gray-700" />
                    <span className="text-sm font-bold uppercase tracking-wider text-gray-700">Search Filters</span>
                </div>
                {showFilters ? (
                    <div className="flex items-center gap-1 text-zinc-500 hover:text-zinc-800 text-xs font-semibold">
                        <span>Hide Filters</span>
                        <ChevronUp size={16} />
                    </div>
                ) : (
                    <div className="flex items-center gap-1 text-zinc-500 hover:text-zinc-800 text-xs font-semibold">
                        <span>Show Filters</span>
                        <ChevronDown size={16} />
                    </div>
                )}
            </div>

            {showFilters && (
                <div className="mt-4 pt-4 border-t space-y-4">

                    <div className="flex items-center gap-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={filterType === OFFER_FILTER_TYPE.at(1)?.value}
                                onCheckedChange={(checked) => setFilterType(checked ? OFFER_FILTER_TYPE.at(1)?.value : "all")}
                            />
                            <span className="text-xs font-semibold text-zinc-500">
                                {filterType === OFFER_FILTER_TYPE.at(1)?.value ? OFFER_FILTER_TYPE.at(1)?.label : OFFER_FILTER_TYPE.at(0)?.label}
                            </span>
                        </div>
                        {
                            filterType === OFFER_FILTER_TYPE.at(1)?.value && (
                                <div className="flex items-center gap-2 border-l border-zinc-200 pl-6">
                                    {OFFER_CUSTOM_MODE.map((mode) => (
                                        <button
                                            key={mode.value}
                                            type="button"
                                            onClick={() => setCustomeMode(mode.value)}
                                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                                                customeMode === mode.value
                                                    ? "bg-black text-white border-black shadow-sm"
                                                    : "bg-white text-zinc-500 border-[#E4E8EE] hover:bg-zinc-50"
                                            }`}
                                        >
                                            {mode.label}
                                        </button>
                                    ))}
                                </div>
                            )
                        }
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Category Multi-select */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-bold text-[#656B7B] uppercase tracking-wider">Category</label>
                            <Select
                                isMulti
                                value={selectedCats}
                                onChange={(options) => {
                                    setSelectedCats(options || []);
                                    setPagination(prev => ({ ...prev, pageIndex: 0 }));
                                }}
                                options={categories}
                                styles={customSelectStyles}
                                placeholder="All Categories"
                            />
                        </div>

                        {/* Subcategory Multi-select */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-bold text-[#656B7B] uppercase tracking-wider">Subcategory</label>
                            <Select
                                isMulti
                                value={selectedSubs}
                                onChange={(options) => {
                                    setSelectedSubs(options || []);
                                    setPagination(prev => ({ ...prev, pageIndex: 0 }));
                                }}
                                options={subCategories}
                                styles={customSelectStyles}
                                placeholder="All Subcategories"
                            />
                        </div>

                        {/* Collections Multi-select */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-bold text-[#656B7B] uppercase tracking-wider">Collection</label>
                            <Select
                                isMulti
                                value={selectedColls}
                                onChange={(options) => {
                                    setSelectedColls(options || []);
                                    setPagination(prev => ({ ...prev, pageIndex: 0 }));
                                }}
                                options={collections}
                                styles={customSelectStyles}
                                placeholder="All Collections"
                            />
                        </div>

                        {/* Tags Multi-select */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-bold text-[#656B7B] uppercase tracking-wider">Tags</label>
                            <Select
                                isMulti
                                value={selectedTags}
                                onChange={(options) => {
                                    setSelectedTags(options || []);
                                    setPagination(prev => ({ ...prev, pageIndex: 0 }));
                                }}
                                options={tags}
                                styles={customSelectStyles}
                                placeholder="All Tags"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-t pt-4">
                        {/* SKU Search */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-bold text-[#656B7B] uppercase tracking-wider">Search</label>
                            <div className="relative">
                                <Search size={14} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={skuFilter}
                                    onChange={(e) => {
                                        setSkuFilter(e.target.value);
                                        setPagination(prev => ({ ...prev, pageIndex: 0 }));
                                    }}
                                    placeholder="Enter SKU, SLUG"
                                    className="w-full pl-9 pr-3 py-2 border rounded-md text-xs focus:ring-0 focus:outline-none h-[38px]"
                                />
                            </div>
                        </div>

                        {/* Slug Search */}
                        {/* <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-bold text-[#656B7B] uppercase tracking-wider">Slug Name</label>
                            <div className="relative">
                                <Search size={14} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={slugFilter}
                                    onChange={(e) => {
                                        setSlugFilter(e.target.value);
                                        setPagination(prev => ({ ...prev, pageIndex: 0 }));
                                    }}
                                    placeholder="Enter Slug..."
                                    className="w-full pl-9 pr-3 py-2 border rounded-md text-xs focus:ring-0 focus:outline-none h-[38px]"
                                />
                            </div>
                        </div> */}

                        {/* Price Range Fields */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-bold text-[#656B7B] uppercase tracking-wider">Min Price</label>
                            <input
                                type="number"
                                value={minPrice}
                                onChange={(e) => {
                                    setMinPrice(e.target.value);
                                    setPagination(prev => ({ ...prev, pageIndex: 0 }));
                                }}
                                disabled={true}
                                placeholder="From price"
                                className="w-full px-3 py-2 border rounded-md text-xs focus:ring-0 focus:outline-none h-[38px] disabled:bg-zinc-50 disabled:text-zinc-400 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-bold text-[#656B7B] uppercase tracking-wider">Max Price</label>
                            <input
                                type="number"
                                value={maxPrice}
                                onChange={(e) => {
                                    setMaxPrice(e.target.value);
                                    setPagination(prev => ({ ...prev, pageIndex: 0 }));
                                }}
                                disabled={true}
                                placeholder="To price"
                                className="w-full px-3 py-2 border rounded-md text-xs focus:ring-0 focus:outline-none h-[38px] disabled:bg-zinc-50 disabled:text-zinc-400 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Reset Filter Button */}
                    <div className="flex justify-end gap-2 border-t pt-4">
                        <button
                            type="button"
                            onClick={handleClearFilters}
                            className="text-red-500 hover:text-red-700 text-xs font-semibold hover:bg-red-50/50 px-3 py-1.5 rounded transition-all"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
