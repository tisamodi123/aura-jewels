import React from 'react';
import ProductCardSkeleton from '../ProductCardSkeleton';

const HomeSkeleton: React.FC = () => {
    return (
        <div className="w-full bg-white space-y-16 pb-20 animate-pulse">
            {/* Hero Slider Skeleton */}
            <div className="relative w-full h-[60vh] md:h-[80vh] bg-stone-100 flex items-center px-6 md:px-16">
                <div className="max-w-xl space-y-6">
                    <div className="h-4 bg-stone-200 rounded w-1/3"></div>
                    <div className="space-y-3">
                        <div className="h-8 md:h-12 bg-stone-200 rounded w-11/12"></div>
                        <div className="h-8 md:h-12 bg-stone-200 rounded w-8/12"></div>
                    </div>
                    <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                    <div className="flex gap-4 pt-2">
                        <div className="h-10 bg-stone-200 rounded w-32"></div>
                        <div className="h-10 bg-stone-200 rounded w-32"></div>
                    </div>
                </div>
                {/* Carousel indicators indicator */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-stone-200"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-stone-200"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-stone-200"></div>
                </div>
            </div>

            {/* Chapters of Light (Categories) Skeleton */}
            <div className="mx-auto px-6 md:px-12 space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                    <div className="space-y-3 w-full md:w-1/2">
                        <div className="h-8 bg-stone-100 rounded w-2/3"></div>
                        <div className="h-4 bg-stone-100 rounded w-full"></div>
                    </div>
                    <div className="flex gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-stone-100"></div>
                        <div className="w-10 h-10 rounded-full bg-stone-100"></div>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="aspect-[4/5] bg-stone-100 rounded-sm relative overflow-hidden flex flex-col justify-end p-6">
                            <div className="w-12 h-0.5 bg-stone-200 mb-2"></div>
                            <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Signature Showcase Skeleton */}
            <div className="mx-auto px-6 md:px-12">
                <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
                    {/* Left: Large Lifestyle Showcase */}
                    <div className="w-full lg:w-5/12 aspect-[4/5] bg-stone-100 rounded-sm relative p-8 md:p-12 flex flex-col justify-end">
                        <div className="space-y-4">
                            <div className="h-3 bg-stone-200 rounded w-1/3"></div>
                            <div className="h-8 bg-stone-200 rounded w-3/4"></div>
                            <div className="h-10 bg-stone-200 rounded w-32 pt-2"></div>
                        </div>
                    </div>

                    {/* Right: Product Carousel Showcase */}
                    <div className="w-full lg:w-7/12 space-y-8">
                        <div className="flex justify-between items-center">
                            <div className="h-4 bg-stone-100 rounded w-1/4"></div>
                            <div className="flex gap-2.5">
                                <div className="w-10 h-10 rounded-full bg-stone-100"></div>
                                <div className="w-10 h-10 rounded-full bg-stone-100"></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <ProductCardSkeleton key={i} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Trending Brilliance Skeleton */}
            <div className="mx-auto px-6 md:px-12 space-y-8">
                <div className="flex flex-col items-center text-center space-y-3">
                    <div className="h-8 bg-stone-100 rounded w-1/3"></div>
                    <div className="h-4 bg-stone-100 rounded w-1/2"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <ProductCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomeSkeleton;
