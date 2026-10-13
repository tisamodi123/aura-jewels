'use client';

import React from 'react';
import { ArrowUpDown, SlidersHorizontal } from 'lucide-react';

interface JewelryMobileStickyBarProps {
  onOpenSort: () => void;
  onOpenFilter: () => void;
}

const JewelryMobileStickyBar: React.FC<JewelryMobileStickyBarProps> = ({
  onOpenSort,
  onOpenFilter,
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-[#F3F4F6] border-t border-gray-100 px-6 pt-4 pb-4 flex items-center gap-4 shadow-[0_-10px_30px_-5px_rgba(0,0,0,0.1)]">
      <button
        onClick={onOpenSort}
        className="flex-1 flex items-center justify-center gap-2.5 py-1 text-[13px] font-jakarta font-bold text-gray-900 border-r border-gray-100"
      >
        <ArrowUpDown className="w-4 h-4 text-[#013D3D]" />
        SORT BY
      </button>
      <button
        onClick={onOpenFilter}
        className="flex-1 flex items-center justify-center gap-2.5 py-1 text-[13px] font-jakarta font-bold text-gray-900"
      >
        <SlidersHorizontal className="w-4 h-4 text-[#013D3D]" />
        FILTER
      </button>
    </div>
  );
};

export default JewelryMobileStickyBar;
