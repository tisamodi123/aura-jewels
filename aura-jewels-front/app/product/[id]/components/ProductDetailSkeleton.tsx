import React from 'react';

const ProductDetailSkeleton: React.FC = () => {
    return (
        <div className="bg-white min-h-screen animate-pulse">
            {/* 1. Breadcrumb Navigation Skeleton */}
            <div className="max-w-[1500px] mx-auto px-6 md:px-12 py-4 md:py-6">
                <div className="h-4 w-64 bg-gray-100 rounded-none" />
            </div>

            {/* Main Content Layout */}
            <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 flex flex-col lg:flex-row gap-8 lg:gap-12 mt-6 lg:items-start">
                
                {/* LEFT COLUMN: Gallery Skeleton (60%) */}
                <div className="w-full lg:w-[60%] lg:sticky lg:top-24 h-fit">
                    {/* Desktop Grid Gallery (2 columns) */}
                    <div className="hidden md:grid gap-4 md:grid-cols-2">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="aspect-square bg-gray-100 border border-gray-150/60 rounded-none w-full"
                            />
                        ))}
                    </div>

                    {/* Mobile Slider Gallery */}
                    <div className="md:hidden">
                        <div className="aspect-square bg-gray-100 border border-gray-150/60 rounded-none w-full" />
                        <div className="flex gap-3 mt-4 overflow-hidden">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-20 h-20 bg-gray-100 border border-gray-150/60 rounded-none flex-shrink-0"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Info & Customizer Skeleton (40%) */}
                <div className="w-full lg:w-[40%] flex flex-col space-y-8">
                    {/* Title & Price Details */}
                    <div className="space-y-4">
                        <div className="h-9 w-3/4 bg-gray-100 rounded-none" />
                        <div className="flex items-start flex-col gap-2">
                            <div className="h-8 w-1/3 bg-gray-100 rounded-none" />
                            <div className="h-4 w-1/2 bg-gray-100 rounded-none mt-1" />
                        </div>
                    </div>

                    {/* Customizer Attribute Selectors */}
                    <div className="space-y-6 pt-4 border-t border-gray-150/50">
                        {/* Metal Stamp Selector */}
                        <div className="space-y-2">
                            <div className="h-3 w-28 bg-gray-100 rounded-none" />
                            <div className="flex gap-2">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-9 w-16 bg-gray-100 border border-gray-150/40 rounded-none" />
                                ))}
                            </div>
                        </div>

                        {/* Metal Color Selector */}
                        <div className="space-y-2">
                            <div className="h-3 w-28 bg-gray-100 rounded-none" />
                            <div className="flex gap-3">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-gray-100 border border-gray-150/40" />
                                ))}
                            </div>
                        </div>

                        {/* Ring Size Selector */}
                        <div className="space-y-2">
                            <div className="h-3 w-28 bg-gray-100 rounded-none" />
                            <div className="h-10 w-full bg-gray-100 border border-gray-150/40 rounded-none" />
                        </div>

                        {/* Diamond Origin Selector */}
                        <div className="space-y-2">
                            <div className="h-3 w-28 bg-gray-100 rounded-none" />
                            <div className="flex gap-2">
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className="h-9 w-24 bg-gray-100 border border-gray-150/40 rounded-none" />
                                ))}
                            </div>
                        </div>

                        {/* Diamond Quality Selector */}
                        <div className="space-y-2">
                            <div className="h-3 w-28 bg-gray-100 rounded-none" />
                            <div className="h-9 w-28 bg-gray-100 border border-gray-150/40 rounded-none" />
                        </div>
                    </div>

                    {/* Action Buttons (Add to Cart / WhatsApp) */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-150/50">
                        <div className="h-10 bg-gray-100 rounded-none w-full" />
                        <div className="h-10 bg-gray-100 rounded-none w-full" />
                    </div>

                    {/* Disclaimer Block */}
                    <div className="pt-4 border-t border-gray-150/50 space-y-1.5">
                        <div className="h-3.5 w-full bg-gray-100 rounded-none" />
                        <div className="h-3.5 w-5/6 bg-gray-100 rounded-none" />
                    </div>
                </div>
            </div>

            {/* Bottom Content Skeleton */}
            <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 mt-16 space-y-16">
                
                {/* Recommended Products */}
                <div className="space-y-8">
                    <div className="h-6 w-48 bg-gray-100 rounded-none mx-auto" />
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="space-y-3">
                                <div className="aspect-square bg-gray-100 border border-gray-150/60 rounded-none" />
                                <div className="h-4 w-3/4 bg-gray-100 rounded-none" />
                                <div className="h-4 w-1/3 bg-gray-100 rounded-none" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bespoke CTA Block */}
                <div className="h-64 bg-gray-100 border border-gray-150/40 rounded-none w-full" />

                {/* Promises Section */}
                <div className="py-8 border-t border-b border-gray-150/50">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex flex-col items-center text-center space-y-2.5">
                                <div className="w-10 h-10 rounded-full bg-gray-100" />
                                <div className="h-3.5 w-2/3 bg-gray-100 rounded-none" />
                                <div className="h-3 w-5/6 bg-gray-100 rounded-none" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQs */}
                <div className="space-y-4 pb-16">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="h-12 bg-gray-100 border border-gray-150/30 rounded-none"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailSkeleton;