'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Truck, ShieldCheck, Diamond, Maximize } from 'lucide-react';
import ProductAccordions from '@/components/product/ProductAccordions';
import { formatPrice } from '@/lib/priceUtils';
import { getImageUrl } from '@/lib/utils';
import { withTax } from '@/lib/taxUtils';
import { useGlobleStore } from '@/store/globleStore';

interface ProductSidebarProps {
    product: any;
    displayPrice: number;
    offerDetails?: any;
    combineWithList: any[];
    handleAddToCart: (p: any) => void;
    selectedDiamondOrigin?: string;
}

export default function ProductSidebar({
    product,
    displayPrice,
    offerDetails,
    combineWithList,
    handleAddToCart,
    selectedDiamondOrigin
}: ProductSidebarProps) {
    const { country } = useGlobleStore();
    return (
        <div className="w-full space-y-8 flex flex-col pb-10 md:pb-12">
            {/* Accordions */}
            <ProductAccordions
                product={product}
                displayPrice={displayPrice}
                offerDetails={offerDetails}
                selectedDiamondOrigin={selectedDiamondOrigin}
            />

            {/* Shipping & Warranty Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-[#ECECEC] rounded-none py-5 px-4 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
                    <Truck className="w-6 h-6 text-[#B57A5A] flex-shrink-0" strokeWidth={1.5} />
                    <span className="text-[13px] font-medium text-[#1F1F1F] font-sans leading-tight">Free Shipping & Returns</span>
                </div>
                <div className="bg-white border border-[#ECECEC] rounded-none py-5 px-4 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
                    <ShieldCheck className="w-6 h-6 text-[#B57A5A] flex-shrink-0" strokeWidth={1.5} />
                    <span className="text-[13px] font-medium text-[#1F1F1F] font-sans leading-tight">Free Lifetime Warranty</span>
                </div>
                <div className="bg-white border border-[#ECECEC] rounded-none py-5 px-4 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
                    <Diamond className="w-6 h-6 text-[#B57A5A] flex-shrink-0" strokeWidth={1.5} />
                    <span className="text-[13px] font-medium text-[#1F1F1F] font-sans leading-tight">Lifetime Diamond Upgrade</span>
                </div>
                <div className="bg-white border border-[#ECECEC] rounded-none py-5 px-4 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
                    <Maximize className="w-6 h-6 text-[#B57A5A] flex-shrink-0" strokeWidth={1.5} />
                    <span className="text-[13px] font-medium text-[#1F1F1F] font-sans leading-tight">Free 1-Year Resizing</span>
                </div>
            </div>
            {/* Combine With Section */}
            {combineWithList.length > 0 && (
                <div className="space-y-6 !mt-5">
                    <h3 className="text-[14px] md:text-[16px] font-bold text-gray-900 uppercase tracking-[0.15em] text-center">COMBINE WITH</h3>
                    <div className="flex flex-col gap-6">
                        {combineWithList.map((p: any) => {
                            const key = typeof p._id === 'object' ? (p._id?.$oid || JSON.stringify(p._id)) : (p._id || p.id);
                            return (
                                <Link
                                    href={`/product/${p.slug}`}
                                    key={key}
                                    className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 group cursor-pointer"
                                >
                                    <div className="w-32 h-32 md:w-36 md:h-36 bg-[#F9F9F9] flex-shrink-0 relative overflow-hidden rounded-none border border-gray-100">
                                        <Image
                                            src={getImageUrl(p.images?.[0]?.MediaLocation || p.images?.[0] || '/placeholder-necklace.jpg')}
                                            alt={p.productTitle || p.title || ""}
                                            fill
                                            className="object-contain mix-blend-multiply p-2"
                                            sizes="160px"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2 text-center sm:text-left">
                                        <h4 className="text-[16px] md:text-[18px] font-bold text-gray-900 font-jakarta leading-tight group-hover:text-[#014242] transition-colors">
                                            {p.productTitle || p.title || p.name}
                                        </h4>
                                        <p className="text-[16px] md:text-[17px] font-bold text-gray-900 font-jakarta">
                                            {/* All-in (incl. GST) — same convention as every other price. */}
                                            {formatPrice(withTax(p.finalPrice || p.price, country))}
                                        </p>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleAddToCart(p);
                                            }}
                                            className="w-full sm:w-auto bg-[#014242] text-white px-6 md:px-8 py-3 text-[11px] md:text-[12px] font-bold uppercase tracking-widest hover:bg-black transition-all whitespace-nowrap"
                                        >
                                            ADD TO CART
                                        </button>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
