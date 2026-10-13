'use client';

import React from 'react';
import { X } from 'lucide-react';

interface JewelryMobileSortModalProps {
  isOpen: boolean;
  onClose: () => void;
  sortOptions: { value: string; label: string }[];
  selectedSortValue: string;
  onSelectSort: (value: string) => void;
}

const JewelryMobileSortModal: React.FC<JewelryMobileSortModalProps> = ({
  isOpen,
  onClose,
  sortOptions,
  selectedSortValue,
  onSelectSort,
}) => {
  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-[110] animate-fadeIn">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 animate-slideUp">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-serif text-gray-900">Sort By</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="space-y-1">
          {sortOptions.map((option) => {
            const isSelected = selectedSortValue === option.value;
            return (
              <button
                key={option.value}
                onClick={() => {
                  onSelectSort(option.value);
                  onClose();
                }}
                className={`w-full text-left py-4 px-4 rounded-xl text-[14px] font-sans transition-all flex items-center justify-between ${isSelected ? 'bg-[#A96D56]/10 text-[#A96D56] font-bold' : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {option.label}
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#A96D56]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default JewelryMobileSortModal;
