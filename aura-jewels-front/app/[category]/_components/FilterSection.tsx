'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FilterOption {
    label: string;
    value: string;
    image?: string;
}

interface FilterSectionProps {
    title: string;
    options: FilterOption[];
    type?: 'checkbox' | 'radio';
    selectedValues: string[];
    onToggle: (value: string) => void;
    onClear: () => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
    title,
    options,    
    type = 'checkbox',
    selectedValues,
    onToggle,
    onClear
}) => {
    const [isOpen, setIsOpen] = useState(true);
    const [visibleCount, setVisibleCount] = useState(5);

    return (
        <div className="border-b border-gray-100 py-6">
            <div
                className="flex items-center justify-between w-full mb-1 cursor-pointer select-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2 text-left">
                    <span className="text-[14px] font-sans font-bold uppercase tracking-wider text-gray-900">
                        {title}
                        {selectedValues.length > 0 && (
                            <span className="ml-2 text-[#B57A5A] lowercase font-medium">
                                ({selectedValues.length})
                            </span>
                        )}
                    </span>
                    {isOpen ? (
                        <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    )}
                </div>

                {selectedValues.length > 0 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClear();
                        }}
                        className="text-[11px] font-sans font-bold text-gray-400 hover:text-[#B57A5A] transition-colors"
                    >
                        CLEAR
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="mt-4 space-y-3 px-0.5 animate-fadeIn">
                    {options.slice(0, visibleCount).map((option, index) => (
                        <label key={index} className="flex items-center group cursor-pointer">
                            <div className="relative flex items-center">
                                <input
                                    type={type}
                                    checked={selectedValues.includes(option.value)}
                                    onChange={() => onToggle(option.value)}
                                    className={`w-4 h-4 border-gray-300 rounded${type === 'radio' ? '-full' : ''} text-[#B57A5A] focus:ring-[#B57A5A] transition-colors cursor-pointer`}
                                />
                            </div>
                            {option.image && (
                                <img
                                    src={option.image}
                                    alt={option.label}
                                    className="ml-3 w-5 h-5 object-contain shrink-0"
                                    loading="lazy"
                                />
                            )}
                            <span className={`ml-3 text-[14px] font-sans transition-colors flex-grow ${selectedValues.includes(option.value) ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                {option.label}
                            </span>
                            {/* <span className="text-[12px] font-sans text-gray-400 tabular-nums">
                                ({option.count})
                            </span> */}
                        </label>
                    ))}

                    {options.length > 5 && (
                        <button
                            onClick={() => setVisibleCount(visibleCount === 5 ? options.length : 5)}
                            className="text-[13px] font-sans font-bold text-[#B57A5A] hover:underline mt-2 flex items-center gap-1"
                        >
                            {visibleCount === 5 ? `+ ${options.length - 5} MORE` : 'SHOW LESS'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default FilterSection;
