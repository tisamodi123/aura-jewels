import React from 'react'
import FilterSection from './FilterSection'
import AllFilterSkeleton from './AllFilterSkeleton';
import { useGlobleStore } from '@/store/globleStore';
import { DEFAULT_COUNTRY } from '@/lib/Api_Url';
import { formatBudgetLabel } from '@/lib/priceUtils';

import { price_ranges } from '@/components/commonts/constVariable';

// Canonical gender chips. The API maps these onto the (overlapping) stored
// values, matched case-insensitively — women→Women/Female, men→Men/Male,
// couple→Couple, unisex→Unisex/UNISEX/Other.
export const GENDER_FILTER_OPTIONS = [
    { label: 'Women', value: 'women' },
    { label: 'Men', value: 'men' },
    { label: 'Couple', value: 'couple' },
    { label: 'Unisex', value: 'unisex' },
];

export const slugify = (text: any) => {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
};

export const STATIC_FILTERS = [
    {
        title: 'Weight Range',
        options: [
            { label: 'Upto 1 grams', min: null, max: 1 },
            { label: '1 grams - 2 grams', min: 1, max: 2 },
            { label: '2 grams - 3 grams', min: 2, max: 3 },
            { label: '3 grams - 4 grams', min: 3, max: 4 },
            { label: 'Above 4 grams ', min: 4, max: null }
        ]
    },
    {
        title: 'Price Range',
        options: price_ranges.map(pr => ({
            label: pr.filterName,
            min: pr.min || null,
            max: pr.max || null
        }))
    }
];

const AllFilter = ({
    className = "",
    filters,
    setFilters,
    hideHeader = false,
    category = "",
    subcategory = "",
    allParams,
    styleList,
    scope = "all"
}: {
    className?: string;
    filters: any;
    setFilters: React.Dispatch<React.SetStateAction<any>>;
    hideHeader?: boolean;
    category?: string;
    subcategory?: string;
    allParams: any;
    styleList: any[];
    scope?: string;
}) => {
    if (!allParams) {
        return (
            <AllFilterSkeleton hideHeader={hideHeader} className={className} />
        );
    }

    const filterGroups = [];

    // Gender — a fixed, canonical set (not data-driven). Shown first.
    filterGroups.push({
        title: 'Gender',
        key: 'gender',
        options: GENDER_FILTER_OPTIONS,
    });

    if (scope !== "category" && allParams?.category && allParams.category.length > 0) {
        filterGroups.push({
            title: 'Category',
            key: 'category',
            options: allParams.category.map((c: any) => ({
                label: c.categoryName || c.name || '',
                value: c.slug || c._id
            }))
        });
    }

    // if (scope !== "collection" && !subcategory && allParams?.collection && allParams.collection.length > 0) {
    //     filterGroups.push({
    //         title: 'Collection',
    //         key: 'collectionId',
    //         options: allParams.collection.map((c: any) => ({
    //             label: c.name || c.collectionName || '',
    //             value: c._id
    //         }))
    //     });
    // }

    // 1. Style (Subcategory)
    let subCategoryOptions: any[] = [];
    let subCategoryTitle = 'Style';

    if (scope !== "all" && !subcategory) {
        subCategoryTitle = category
            ? `${category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')} Type`
            : 'Ring Type';
        if (styleList && styleList.length > 0) {
            subCategoryOptions = styleList.map((style: any) => ({
                label: style.categoryName || style.paraMtrName || style.name || '',
                value: style.slug || style._id
            }));
        } else if (allParams?.category && category) {
            const foundCategory = allParams.category.find((cat: any) => 
                cat.slug?.toLowerCase() === category.toLowerCase()
            );
            if (foundCategory && foundCategory.subcategories && foundCategory.subcategories.length > 0) {
                subCategoryOptions = foundCategory.subcategories.map((sub: any) => ({
                    label: sub.categoryName || sub.name || '',
                    value: sub.slug || sub._id
                }));
            }
        }
    } else if (scope === "all" && filters.category && filters.category.length > 0 && allParams?.category) {
        // Collect subcategories for all selected categories
        const selectedCategories = allParams.category.filter((cat: any) => 
            filters.category.includes(cat.slug) || filters.category.includes(cat._id)
        );
        
        // Flatten all subcategories
        const allSubs: any[] = [];
        selectedCategories.forEach((cat: any) => {
            if (cat.subcategories && cat.subcategories.length > 0) {
                allSubs.push(...cat.subcategories);
            }
        });

        if (allSubs.length > 0) {
            subCategoryTitle = 'Style';
            subCategoryOptions = allSubs.map((sub: any) => ({
                label: sub.categoryName || sub.name || '',
                value: sub.slug || sub._id
            }));
        }
    }

    if (subCategoryOptions.length > 0) {
        filterGroups.push({
            title: subCategoryTitle,
            key: 'subCategory',
            options: subCategoryOptions
        });
    }

    // 2. Shape
    if (allParams?.shapes && allParams.shapes.length > 0) {
        filterGroups.push({
            title: 'Shape',
            key: 'shape',
            options: allParams.shapes.map((s: any) => ({
                label: s.name || s.shapeName || '',
                value: s.name || s.shapeName || '',
                image: s.image || ''
            }))
        });
    }

    // 3. Metal Type
    if (allParams?.metals && allParams.metals.length > 0) {
        filterGroups.push({
            title: 'Metal Type',
            key: 'metals',
            options: allParams.metals.map((m: any) => ({
                label: m.name || m.metalName || '',
                value: m.name ? slugify(m.name) : m._id
            }))
        });
    }

    // 4. Price & Weight Ranges (Statics)
    filterGroups.push({
        title: 'Weight Range',
        key: 'weightRange',
        options: STATIC_FILTERS[0].options.map(opt => ({ label: opt.label, value: opt.label }))
    });

    const { country } = useGlobleStore();
    const isIndia = (country || 'IN') === (DEFAULT_COUNTRY || 'IN');

    filterGroups.push({
        title: 'Price Range',
        key: 'priceRange',
        options: STATIC_FILTERS[1].options.map(opt => ({ label: formatBudgetLabel(opt.label, isIndia), value: opt.label }))
    });

    // 5. Tags
    if (allParams?.tags && allParams.tags.length > 0) {
        filterGroups.push({
            title: 'Tags',
            key: 'tags',
            options: allParams.tags.map((t: any) => ({
                label: t.name || t.tagName || '',
                value: t.name ? slugify(t.name) : t._id
            }))
        });
    }

    const handleToggle = (key: string, value: string) => {
        if (key === 'weightRange') {
            const option = STATIC_FILTERS[0].options.find(opt => opt.label === value);
            if (option) {
                setFilters((prev: any) => {
                    const isSelected = prev.minWeight === option.min && prev.maxWeight === option.max;
                    return {
                        ...prev,
                        minWeight: isSelected ? undefined : (option.min ?? undefined),
                        maxWeight: isSelected ? undefined : (option.max ?? undefined)
                    };
                });
            }
            return;
        }

        if (key === 'priceRange') {
            const option = STATIC_FILTERS[1].options.find(opt => opt.label === value);
            if (option) {
                setFilters((prev: any) => {
                    const isSelected = prev.minPrice === option.min && prev.maxPrice === option.max;
                    return {
                        ...prev,
                        minPrice: isSelected ? undefined : (option.min ?? undefined),
                        maxPrice: isSelected ? undefined : (option.max ?? undefined)
                    };
                });
            }
            return;
        }

        if (key === 'category') {
            setFilters((prev: any) => {
                const currentCategories = Array.isArray(prev.category) ? prev.category : [];
                const isSelected = currentCategories.includes(value);
                const nextCategories = isSelected
                    ? currentCategories.filter((v: any) => v !== value)
                    : [...currentCategories, value];

                // If a category was removed, clean up its subcategories from filters.subCategory
                let nextSubCategories = Array.isArray(prev.subCategory) ? prev.subCategory : [];
                if (isSelected && allParams?.category) {
                    // Find the category that was unchecked
                    const uncheckedCat = allParams.category.find((cat: any) => cat._id === value || cat.slug === value);
                    if (uncheckedCat && uncheckedCat.subcategories) {
                        const uncheckedSubIds = uncheckedCat.subcategories.map((sub: any) => sub.slug || sub._id);
                        nextSubCategories = nextSubCategories.filter((subId: any) => !uncheckedSubIds.includes(subId));
                    }
                }

                return {
                    ...prev,
                    category: nextCategories,
                    subCategory: nextSubCategories
                };
            });
            return;
        }

        setFilters((prev: any) => {
            const currentValues = Array.isArray(prev[key]) ? prev[key] : [];
            const isSelected = currentValues.includes(value);
            return {
                ...prev,
                [key]: isSelected
                    ? currentValues.filter((v: any) => v !== value)
                    : [...currentValues, value]
            };
        });
    };

    const handleClearSection = (key: string) => {
        if (key === 'weightRange') {
            setFilters((prev: any) => ({ ...prev, minWeight: undefined, maxWeight: undefined }));
            return;
        }
        if (key === 'priceRange') {
            setFilters((prev: any) => ({ ...prev, minPrice: undefined, maxPrice: undefined }));
            return;
        }
        if (key === 'category') {
            setFilters((prev: any) => ({ ...prev, category: [], subCategory: [] }));
            return;
        }
        setFilters((prev: any) => ({ ...prev, [key]: [] }));
    };

    const getSelectedValues = (key: string) => {
        if (key === 'weightRange') {
            const found = STATIC_FILTERS[0].options.find(opt => filters.minWeight === (opt.min ?? undefined) && filters.maxWeight === (opt.max ?? undefined));
            return found ? [found.label] : [];
        }
        if (key === 'priceRange') {
            const found = STATIC_FILTERS[1].options.find(opt => filters.minPrice === (opt.min ?? undefined) && filters.maxPrice === (opt.max ?? undefined));
            return found ? [found.label] : [];
        }
        return filters[key] || [];
    };

    return (
        <div className={`flex flex-col h-full bg-white divide-y divide-gray-100 ${className}`}>
            {!hideHeader && (
                <div className="flex items-center justify-between py-4 mb-2">
                    <span className="text-[14px] font-sans font-bold uppercase tracking-widest text-[#B57A5A]">
                        Filters
                    </span>
                    <button
                        onClick={() => setFilters({})}
                        className="text-[12px] font-sans font-semibold text-gray-400 hover:text-[#B57A5A] transition-colors border-b border-gray-400 hover:border-[#B57A5A]"
                    >
                        CLEAR ALL
                    </button>
                </div>
            )}

            <div className="overflow-y-auto lg:max-h-[calc(100vh-200px)] custom-scrollbar pr-2 flex-grow">
                {filterGroups.map((section, idx) => (
                    <FilterSection
                        key={idx}
                        title={section.title}
                        options={section.options}
                        type={['priceRange', 'weightRange'].includes(section.key) ? 'radio' : 'checkbox'}
                        selectedValues={getSelectedValues(section.key)}
                        onToggle={(val) => handleToggle(section.key, val)}
                        onClear={() => handleClearSection(section.key)}
                    />
                ))}
            </div>
        </div>
    )
}

export default AllFilter;
