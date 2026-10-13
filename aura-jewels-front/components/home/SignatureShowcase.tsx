'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CommonSlider, { SwiperType } from '@/components/common/CommonSlider';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import { getImageUrl } from '@/lib/utils';
import { formatPrice } from '@/lib/priceUtils';
import { getAllProducts } from '@/services/productService';

const SHOWCASE_BREAKPOINTS = {
    480: { slidesPerView: 1.2 },
    640: { slidesPerView: 2 },
    768: { slidesPerView: 2.5 },
    1024: { slidesPerView: 4 }
};

const SignatureShowcase: React.FC<{ eleganceInEveryStyleData: any; productIds?: string[], productData: any }> = ({ eleganceInEveryStyleData, productIds = [], productData }: any) => {
    const swiperRef = useRef<SwiperType | null>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const idsKey = JSON.stringify({
        productIds,
        selectionType: productData?.selectionType,
        lastNDays: productData?.lastNDays,
        categoryIds: productData?.categoryIds,
        subCategoryIds: productData?.subCategoryIds,
        collectionIds: productData?.collectionIds,
        tags: productData?.tags
    });

    useEffect(() => {
        setLoading(true);
        const hasPicked = Array.isArray(productIds) && productIds.length > 0;

        const isCustom = productData?.selectionType === "custom" || !productData?.selectionType;
        const payload: any = isCustom && hasPicked
            ? { page: 1, limit: productIds.length, ids: productIds }
            : (productData?.selectionType === "dayWise"
                ? {
                    page: 1,
                    limit: 8,
                    lastNDays: productData?.lastNDays,
                    category: productData?.categoryIds || [],
                    subCategory: productData?.subCategoryIds || [],
                    collectionId: productData?.collectionIds || [],
                    tags: productData?.tags || [],
                    ...(productData?.lastNDays ? {
                        fromDate: (() => {
                            const date = new Date();
                            date.setDate(date.getDate() - Number(productData.lastNDays));
                            const yyyy = date.getFullYear();
                            const mm = String(date.getMonth() + 1).padStart(2, '0');
                            const dd = String(date.getDate()).padStart(2, '0');
                            return `${yyyy}/${mm}/${dd}`;
                        })()
                    } : {})
                }
                : { page: 1, limit: 8 }
            );

        getAllProducts(payload)
            .then((res: any) => {
                if (res && res.errorCode === 200 && Array.isArray(res.data)) {
                    let list = res.data;
                    const seen = new Set();
                    list = list.filter((p: any) => {
                        const id = String(p._id ?? p.id);
                        if (seen.has(id)) return false;
                        seen.add(id);
                        return true;
                    });
                    if (hasPicked && productData?.selectionType !== "dayWise") {
                        const order = new Map(productIds.map((id: string, i: number) => [String(id), i]));
                        list = [...list].sort((a, b) =>
                            (order.get(String(a._id ?? a.id)) ?? 999) - (order.get(String(b._id ?? b.id)) ?? 999));
                    }
                    setProducts(list);
                }
            })
            .catch((err) => {
                console.error("Error fetching products for signature showcase:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [idsKey]);

    if (!loading && products.length === 0) {
        return null;
    }

    // Determine correct top sub-title and main title to match 2nd image
    let topSubTitle = "OUR BEST SELLING PRODUCT";
    let mainHeading = "A Curated Selection Of Our Most Admired Creations Timeless In Appeal And Exceptional In Craftsmanship.";

    if (eleganceInEveryStyleData) {
        const rawTitle = (eleganceInEveryStyleData.title || "").trim();
        const rawSub = (eleganceInEveryStyleData.subTitle || eleganceInEveryStyleData.description || "").trim();

        if (rawTitle.toLowerCase().includes("best selling") || rawTitle.toLowerCase().includes("signature")) {
            topSubTitle = rawTitle.toUpperCase();
            if (rawSub) mainHeading = rawSub;
        } else if (rawSub.toLowerCase().includes("best selling")) {
            topSubTitle = rawSub.toUpperCase();
            if (rawTitle) mainHeading = rawTitle;
        } else {
            if (rawSub && rawSub.length < 40) {
                topSubTitle = rawSub.toUpperCase();
                if (rawTitle) mainHeading = rawTitle;
            } else if (rawTitle && rawTitle.length < 40) {
                topSubTitle = rawTitle.toUpperCase();
                if (rawSub) mainHeading = rawSub;
            }
        }
    }

    const renderShowcaseCard = (product: any) => {
        const activeVariant = product;
        const imageSrc = activeVariant.images && activeVariant.images.length > 0
            ? (activeVariant.images[0].MediaLocation || activeVariant.images[0].url || "")
            : (activeVariant.image || "");

        const displayTitle = activeVariant.productTitle || product.productTitle || product.title || product.name || "Timeless Cushion Solitaire";
        const productLink = `/product/${activeVariant.slug || product.slug || activeVariant._id || product._id}`;

        const priceVal = activeVariant.finalPrice || activeVariant.discountedPrice || product.finalPrice || product.discountedPrice || product.price || 0;
        const formattedPrice = formatPrice(priceVal);

        return (
            <Link href={productLink} className="group block text-center cursor-pointer">
                <div className="w-full aspect-[1/1.1] bg-[#F5F2EC] relative overflow-hidden mb-4 rounded-none">
                    {imageSrc ? (
                        <Image
                            src={getImageUrl(imageSrc)}
                            alt={displayTitle}
                            fill
                            unoptimized
                            className="object-contain mix-blend-multiply p-6 md:p-8 transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 50vw, 25vw"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No Image
                        </div>
                    )}
                </div>
                <h3 className="text-base md:text-lg font-cormorant-garamond font-normal text-[#1A1A1A] mb-1 leading-snug line-clamp-1 transition-colors group-hover:text-[#A96D56]">
                    {displayTitle}
                </h3>
                <p className="text-[13px] md:text-[14px] font-instrument-sans font-medium text-stone-600">
                    {formattedPrice}
                </p>
            </Link>
        );
    };

    return (
        <section className="bg-white py-16 lg:py-24 border-t border-gray-100 overflow-hidden">
            <div className="max-w-[1700px] px-6 md:px-12 lg:px-16 mx-auto">
                {/* Centered Header Section */}
                <div className="max-w-4xl mx-auto text-center px-4 mb-12 md:mb-16">
                    <span className="text-[11px] lg:text-[12px] tracking-[0.45em] uppercase font-bold text-stone-500 font-instrument-sans block mb-4">
                        {topSubTitle}
                    </span>
                    <h2 className="text-2xl md:text-3xl lg:text-[36px] xl:text-[38px] leading-[1.3] text-[#1A1A1A] font-cormorant-garamond font-light max-w-4xl mx-auto">
                        {mainHeading}
                    </h2>
                </div>

                {/* Slider Container with Navigation Arrows */}
                <div className="relative px-2 md:px-4 lg:px-6">
                    {/* Left Navigation Arrow */}
                    <button
                        onClick={() => swiperRef.current?.slidePrev()}
                        className="hidden md:flex absolute -left-3 lg:-left-5 top-[40%] -translate-y-1/2 z-20 w-10 h-10 md:w-11 md:h-11 rounded-full border border-gray-200 bg-white flex items-center justify-center shadow-xs hover:bg-stone-50 transition-colors"
                        aria-label="Previous slide"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-5 h-5 text-gray-700">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>

                    {/* Slider Component or Skeleton */}
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <ProductCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : (
                        <CommonSlider
                            items={products}
                            onSwiper={(swiper) => { swiperRef.current = swiper; }}
                            renderItem={(product) => renderShowcaseCard(product)}
                            spaceBetween={20}
                            slidesPerView={1.2}
                            breakpoints={SHOWCASE_BREAKPOINTS}
                            speed={800}
                            className="px-2"
                        />
                    )}

                    {/* Right Navigation Arrow */}
                    <button
                        onClick={() => swiperRef.current?.slideNext()}
                        className="hidden md:flex absolute -right-3 lg:-right-5 top-[40%] -translate-y-1/2 z-20 w-10 h-10 md:w-11 md:h-11 rounded-full border border-gray-200 bg-white flex items-center justify-center shadow-xs hover:bg-stone-50 transition-colors"
                        aria-label="Next slide"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-5 h-5 text-gray-700">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>
                </div>

                {/* View All Products button */}
                <div className="text-center mt-12 lg:mt-16">
                    <Link
                        href={eleganceInEveryStyleData?.buttonlink1 || "/shop"}
                        className="inline-block bg-[#A96D56] hover:bg-[#995e48] text-white px-8 py-3 rounded-none font-instrument-sans text-[11px] font-semibold tracking-widest uppercase transition-all duration-300 shadow-xs"
                    >
                        {eleganceInEveryStyleData?.buttontext1 || "View All Products"}
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default SignatureShowcase;

