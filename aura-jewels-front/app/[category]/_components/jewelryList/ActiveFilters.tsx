import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useGlobleStore } from '@/store/globleStore';
import { formatBudgetLabel } from '@/lib/priceUtils';
import { isIndiaCountry } from '@/lib/taxUtils';
import { price_ranges } from '@/components/commonts/constVariable';

const slugify = (text: any) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

interface ActiveFiltersProps {
  filters: any;
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  allParams: any;
  styleList: any[];
  scope?: string;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  filters,
  setFilters,
  allParams,
  styleList,
  scope = 'all',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { country } = useGlobleStore();
  const isIndia = isIndiaCountry(country);

  const removeFilter = (key: string, value?: any) => {
    setFilters((prev: any) => {
      const next = { ...prev };
      if (key === 'priceRangeGroup') {
        next.minPrice = undefined;
        next.maxPrice = undefined;
      } else if (Array.isArray(next[key])) {
        next[key] = next[key].filter((v: any) => v !== value);
      } else {
        next[key] = undefined;
      }
      return next;
    });
  };

  const getFilterLabel = (key: string, value: any) => {
    if (key === 'category' && allParams?.category) {
      return allParams.category.find((c: any) => c._id === value || c.slug === value)?.categoryName;
    }
    if (key === 'collectionId' && allParams?.collection) {
      const found = allParams.collection.find((c: any) => c._id === value || c.slug === value);
      return found?.name || found?.collectionName || '';
    }
    if (key === 'metals' && allParams?.metals) {
      return allParams.metals.find((m: any) => m._id === value || (m.name && slugify(m.name) === value))?.name;
    }
    if (key === 'subCategory') {
      if (styleList && styleList.length > 0) {
        const found = styleList.find((s: any) => s._id === value || s.slug === value);
        if (found) return found.categoryName || found.name;
      }
      if (allParams?.category) {
        for (const cat of allParams.category) {
          if (cat.subcategories) {
            const foundSub = cat.subcategories.find((s: any) => s._id === value || s.slug === value);
            if (foundSub) return foundSub.categoryName || foundSub.name;
          }
        }
      }
    }
    if (key === 'tags' && allParams?.tags) {
      const foundTag = allParams.tags.find((t: any) => t._id === value || (t.name && slugify(t.name) === value));
      return foundTag?.name || foundTag?.tagName || '';
    }
    if (key === 'gender') {
      const map: Record<string, string> = {
        women: 'Women',
        men: 'Men',
        couple: 'Couple',
        unisex: 'Unisex',
      };
      return map[String(value).toLowerCase()] || value;
    }
    if (key === 'minPrice') return `Min ${isIndia ? '₹' : '$'}${value}`;
    if (key === 'maxPrice') return `Max ${isIndia ? '₹' : '$'}${value}`;
    if (key === 'minWeight') return `Min ${value}g`;
    if (key === 'maxWeight') return `Max ${value}g`;
    return value.toString();
  };

  let implicitKey: string | null = null;
  if (scope === 'category') implicitKey = 'category';
  else if (scope === 'collection') implicitKey = 'collectionId';

  const activeItems: { key: string; value: any; label: string }[] = [];

  // Check if current minPrice/maxPrice matches one of the static price_ranges
  const matchedPriceRange = price_ranges.find(pr => {
    const minMatches = (pr.min || undefined) === filters.minPrice;
    const maxMatches = (pr.max || undefined) === filters.maxPrice;
    return minMatches && maxMatches;
  });

  if (matchedPriceRange) {
    activeItems.push({
      key: 'priceRangeGroup',
      value: 'priceRangeGroup',
      label: formatBudgetLabel(matchedPriceRange.filterName, isIndia),
    });
  }

  Object.entries(filters).forEach(([key, value]: [string, any]) => {
    if (key === implicitKey) return;
    // Skip individual minPrice/maxPrice if we matched a price range group
    if (matchedPriceRange && (key === 'minPrice' || key === 'maxPrice')) return;

    if (Array.isArray(value)) {
      value.forEach((v) => {
        const label = getFilterLabel(key, v);
        if (label) activeItems.push({ key, value: v, label });
      });
    } else if (value !== undefined && value !== null && value !== '') {
      if (key === 'sortPrice') return;
      const label = getFilterLabel(key, value);
      if (label) activeItems.push({ key, value, label });
    }
  });

  if (activeItems.length === 0) {
    if (isExpanded) setIsExpanded(false);
    return null;
  }

  const VISIBLE_COUNT = 4;
  const showMoreButton = activeItems.length > VISIBLE_COUNT;
  const displayedItems = isExpanded ? activeItems : activeItems.slice(0, VISIBLE_COUNT);

  return (
    <div className="flex flex-wrap items-center gap-2 animate-in fade-in duration-300 font-sans">
      {displayedItems.map((item, idx) => (
        <div
          key={`${item.key}-${idx}`}
          className="flex items-center gap-2 bg-white px-3 py-1.5 group hover:bg-gray-50 transition-all cursor-pointer flex-shrink-0"
        >
          <span className="text-[13px] font-medium text-[#1E1E1E] transition-colors whitespace-nowrap">
            {item.label}
          </span>
          <button
            onClick={() => removeFilter(item.key, item.value)}
            className="text-[#1E1E1E] hover:text-black transition-colors cursor-pointer flex-shrink-0"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      ))}
      
      {showMoreButton && !isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1.5 transition-all cursor-pointer flex-shrink-0"
        >
          <span className="text-[13px] font-medium text-white whitespace-nowrap">
            + {activeItems.length - VISIBLE_COUNT} More
          </span>
        </button>
      )}

      {showMoreButton && isExpanded && (
        <button
          onClick={() => setIsExpanded(false)}
          className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1.5 transition-all cursor-pointer flex-shrink-0"
        >
          <span className="text-[13px] font-medium text-white whitespace-nowrap">
            Show Less
          </span>
        </button>
      )}

      <button
        onClick={() => setFilters({})}
        className="text-[13px] font-medium text-white hover:text-gray-200 transition-colors ml-2 cursor-pointer self-center underline flex-shrink-0 whitespace-nowrap"
      >
        Clear All
      </button>
    </div>
  );
};

export default ActiveFilters;
