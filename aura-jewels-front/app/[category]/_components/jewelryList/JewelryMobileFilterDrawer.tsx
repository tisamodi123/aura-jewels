'use client';

import React from 'react';
import { X } from 'lucide-react';
import AllFilter from '../AllFilter';

interface JewelryMobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: any;
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  totalCount: number;
  category?: string;
  subcategory?: string;
  allParams: any;
  styleList: any[];
  scope?: string;
}

const JewelryMobileFilterDrawer: React.FC<JewelryMobileFilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  totalCount,
  category,
  subcategory,
  allParams,
  styleList,
  scope,
}) => {
  return (
    <div
      className={`lg:hidden fixed inset-0 z-[110] flex transition-all duration-300 ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
    >
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        onClick={onClose}
      />
      <div
        className={`relative ml-auto w-full h-full bg-white flex flex-col transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-50">
          <h3 className="text-lg font-serif text-gray-900">Filters</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setFilters({})}
              className="text-[11px] font-jakarta font-bold text-gray-400 hover:text-[#013D3D] transition-colors tracking-widest uppercase border-b border-transparent hover:border-[#013D3D]"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
        <div className="flex-grow overflow-y-auto px-6">
          <AllFilter
            className="mt-8 flex-grow"
            filters={filters}
            setFilters={setFilters}
            hideHeader={true}
            category={category}
            subcategory={subcategory}
            allParams={allParams}
            styleList={styleList}
            scope={scope}
          />
        </div>
        <div className="p-6 border-t border-gray-50 bg-gray-50/50">
          <button
            onClick={onClose}
            className="w-full bg-[#A96D56] text-white py-4 rounded-md text-[13px] font-jakarta font-bold tracking-widest hover:bg-[#8F5A40] transition-all"
          >
            VIEW RESULTS ({totalCount})
          </button>
        </div>
      </div>
    </div>
  );
};

export default JewelryMobileFilterDrawer;
