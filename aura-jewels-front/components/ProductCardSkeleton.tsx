import React from 'react';

const ProductCardSkeleton: React.FC = () => {
    return (
        <div className="group flex flex-col h-full bg-white transition-all duration-300 animate-pulse">
            {/* Image Container */}
            <div className="relative aspect-square w-full bg-stone-100 overflow-hidden mb-4 rounded-sm"></div>

            {/* Content Area */}
            <div className="flex flex-col flex-1">
                {/* Title */}
                <div className="space-y-2 mb-3">
                    <div className="h-3.5 bg-stone-100 rounded w-11/12"></div>
                    <div className="h-3.5 bg-stone-100 rounded w-3/4"></div>
                </div>

                <div className="gap-x-2 gap-y-1.5 mt-auto">
                    {/* Price Row */}
                    <div className="h-4 bg-stone-100 rounded w-1/3 mb-3"></div>

                    {/* Metal & Karat Options Row */}
                    <div className="flex items-center justify-between gap-2.5 px-1 mt-1">
                        {/* Color Swatches */}
                        <div className="flex items-center gap-1.5">
                            <div className="w-[16px] h-[16px] rounded-full bg-stone-100 border border-stone-200/20" />
                            <div className="w-[16px] h-[16px] rounded-full bg-stone-100 border border-stone-200/20" />
                            <div className="w-[16px] h-[16px] rounded-full bg-stone-100 border border-stone-200/20" />
                        </div>

                        {/* Karat Selection */}
                        <div className="flex items-center gap-1">
                            <div className="w-8 h-4 bg-stone-100 border border-stone-200/20 rounded" />
                            <div className="w-8 h-4 bg-stone-100 border border-stone-200/20 rounded" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCardSkeleton;