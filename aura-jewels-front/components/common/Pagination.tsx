'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always include page 1
            pages.push(1);

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            if (start > 2) {
                pages.push('ellipsis-start');
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (end < totalPages - 1) {
                pages.push('ellipsis-end');
            }

            // Always include the last page
            pages.push(totalPages);
        }
        return pages;
    };

    const pages = getPageNumbers();

    return (
        <div className="flex items-center justify-center gap-2 mt-8 py-4 font-jakarta">
            {/* Prev Button */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-sm hover:border-[#013D3D] hover:text-[#013D3D] disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-inherit transition-all duration-300 cursor-pointer disabled:cursor-not-allowed"
                aria-label="Previous page"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Buttons */}
            <div className="flex items-center gap-1.5">
                {pages.map((page, idx) => {
                    if (typeof page === 'string') {
                        return (
                            <span
                                key={`ellipsis-${idx}`}
                                className="px-3 py-1.5 text-xs text-gray-400 font-medium select-none"
                            >
                                &bull;&bull;&bull;
                            </span>
                        );
                    }

                    const isActive = page === currentPage;

                    return (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`
                                min-w-[34px] h-[34px] px-2.5 text-xs font-bold rounded-sm border transition-all duration-300 cursor-pointer
                                ${isActive 
                                    ? 'bg-[#013D3D] border-[#013D3D] text-white font-extrabold shadow-sm' 
                                    : 'border-gray-200 text-gray-700 hover:border-[#013D3D] hover:text-[#013D3D] bg-white'
                                }
                            `}
                        >
                            {page}
                        </button>
                    );
                })}
            </div>

            {/* Next Button */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-sm hover:border-[#013D3D] hover:text-[#013D3D] disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-inherit transition-all duration-300 cursor-pointer disabled:cursor-not-allowed"
                aria-label="Next page"
            >
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
};

export default Pagination;
