'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CommonSlider, { SwiperType } from '@/components/common/CommonSlider';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import { getImageUrl } from '@/lib/utils';
import { formatPrice } from '@/lib/priceUtils';
import { getAllProducts, getCategories } from '@/services/productService';

const BUDGET_BREAKPOINTS = {
    480: { slidesPerView: 1.5, spaceBetween: 14 },
    640: { slidesPerView: 2.2, spaceBetween: 16 },
    768: { slidesPerView: 2.8, spaceBetween: 18 },
    1024: { slidesPerView: 4, spaceBetween: 20 }
};

const ShopByBudget: React.FC<{ shopByBudgetData: any; productIds?: string[]; productData?: any }> = ({ shopByBudgetData, productIds = [], productData }: any) => {
    const swiperRef = useRef<SwiperType | null>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Rings");
    const [categoriesMap, setCategoriesMap] = useState<Record<string, string>>({});

    const tabs = ["Rings", "Earrings", "Necklaces", "Bracelets"];

    const idsKey = JSON.stringify({
        productIds,
        selectionType: productData?.selectionType,
        lastNDays: productData?.lastNDays,
        categoryIds: productData?.categoryIds,
        subCategoryIds: productData?.subCategoryIds,
        collectionIds: productData?.collectionIds,
        tags: productData?.tags
    });

    // Fetch categories on mount to map tab names to category IDs
    useEffect(() => {
        getCategories()
            .then((res: any) => {
                if (res && (res.errorCode === 200 || res.status === 200) && Array.isArray(res.data)) {
                    const map: Record<string, string> = {};
                    res.data.forEach((cat: any) => {
                        const name = (cat.categoryName || cat.name || cat.title || "").toLowerCase();
                        const id = String(cat._id || cat.id);
                        if (name.includes("earring")) {
                            map["Earrings"] = id;
                        } else if (name.includes("ring")) {
                            map["Rings"] = id;
                        } else if (name.includes("necklace") || name.includes("pendant")) {
                            map["Necklaces"] = id;
                        } else if (name.includes("bracelet") || name.includes("bangle")) {
                            map["Bracelets"] = id;
                        }
                    });
                    setCategoriesMap(map);
                }
            })
            .catch((err) => {
                console.error("Error fetching categories for tabs:", err);
            });
    }, []);

    // Fetch products whenever activeTab, productIds or filters change
    useEffect(() => {
        setLoading(true);
        const hasPicked = Array.isArray(productIds) && productIds.length > 0;
        const catId = categoriesMap[activeTab];

        const isCustom = productData?.selectionType === "custom" || !productData?.selectionType;
        const payload: any = (isCustom && hasPicked)
            ? { page: 1, limit: productIds.length, ids: productIds }
            : (productData?.selectionType === "dayWise"
                ? {
                    page: 1,
                    limit: 12,
                    lastNDays: productData?.lastNDays,
                    category: catId ? [catId] : (productData?.categoryIds || []),
                    subCategory: productData?.subCategoryIds || [],
                    collectionId: productData?.collectionIds || [],
                    tags: productData?.tags || []
                }
                : {
                    page: 1,
                    limit: 12,
                    ...(catId ? { category: [catId] } : { search: activeTab.toLowerCase().replace(/s$/, "") })
                }
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
                } else {
                    setProducts([]);
                }
            })
            .catch((err) => {
                console.error("Error fetching products for shop by budget:", err);
                setProducts([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [idsKey, activeTab, categoriesMap]);

    // Local filter fallback if products contain mixed items
    const filteredProducts = products.filter((p: any) => {
        const title = (p.productTitle || p.title || p.name || "").toLowerCase();
        const catName = (
            p.categoryName ||
            p.category?.categoryName ||
            p.categoryDetails?.categoryName ||
            p.parentCategoryName ||
            (typeof p.category === 'string' ? p.category : p.category?.name) ||
            ""
        ).toLowerCase();

        if (activeTab === "Rings") {
            const hasRing = catName.includes("ring") || title.includes("ring");
            const hasEarring = catName.includes("earring") || title.includes("earring");
            return hasRing && !hasEarring;
        }
        if (activeTab === "Earrings") {
            return catName.includes("earring") || title.includes("earring");
        }
        if (activeTab === "Necklaces") {
            return catName.includes("necklace") || catName.includes("pendant") || title.includes("necklace") || title.includes("pendant");
        }
        if (activeTab === "Bracelets") {
            return catName.includes("bracelet") || catName.includes("bangle") || title.includes("bracelet") || title.includes("bangle");
        }
        return true;
    });

    const displayProducts = filteredProducts;

    // Header title logic
    let topSubTitle = "INTENTIONAL CURATION";
    let mainHeading = "A Curated Selection Of Our Most Admired Creations Timeless In Appeal And Exceptional In Craftsmanship.";

    if (shopByBudgetData) {
        const rawTitle = (shopByBudgetData.title || shopByBudgetData.info?.title || "").trim();
        const rawSub = (shopByBudgetData.subTitle || shopByBudgetData.description || shopByBudgetData.info?.description || "").trim();

        if (rawSub) topSubTitle = rawSub.toUpperCase();
        if (rawTitle && rawTitle !== "SHOP BY BUDGET") mainHeading = rawTitle;
    }

    const renderCard = (product: any) => {
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
                <h3 className="text-lg md:text-xl font-cormorant-garamond font-normal text-[#1A1A1A] mb-1 leading-snug line-clamp-1">
                    {displayTitle}
                </h3>
                <p className="text-[13px] md:text-[14px] font-instrument-sans font-semibold text-[#1A1A1A]">
                    {formattedPrice}
                </p>
            </Link>
        );
    };

    return (
        <section className="bg-white py-12 md:py-16 lg:py-24 border-t border-gray-100 overflow-hidden">
            <div className="max-w-[1700px] px-4 sm:px-8 md:px-12 lg:px-16 mx-auto">
                {/* Centered Heading Section */}
                <div className="max-w-4xl mx-auto text-center px-2 mb-8 md:mb-12">
                    <span className="text-[11px] lg:text-[12px] tracking-[0.45em] uppercase font-bold text-stone-500 font-instrument-sans block mb-3 md:mb-4">
                        {topSubTitle}
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-[40px] leading-[1.3] text-[#1A1A1A] font-cormorant-garamond font-light max-w-4xl mx-auto">
                        {mainHeading}
                    </h2>
                </div>

                {/* Category Tabs */}
                <div className="w-full mb-8 md:mb-12 px-2">
                    <div className="flex flex-row flex-wrap justify-center items-center gap-1 min-[360px]:gap-2 md:gap-3 w-full">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`w-[70px] min-[360px]:w-[80px] md:w-[140px] py-2 text-[9px] min-[360px]:text-[10px] md:text-[11px] font-instrument-sans font-semibold uppercase tracking-wider transition-all duration-300 border rounded-none cursor-pointer whitespace-nowrap flex-shrink-0 text-center ${isActive
                                        ? "bg-[#A96D56] text-white border-[#A96D56]"
                                        : "bg-white text-gray-800 border-gray-200 hover:bg-[#995e48] hover:text-white hover:border-[#995e48]"
                                        }`}
                                >
                                    {tab}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Slider Wrapper Container with Nav Arrows */}
                <div className="relative px-2 sm:px-4 md:px-6 lg:px-8">
                    {/* Left Navigation Arrow */}
                    <button
                        onClick={() => swiperRef.current?.slidePrev()}
                        className="flex absolute -left-1 sm:-left-2 md:-left-4 lg:-left-5 top-[40%] -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full border border-gray-200 bg-white/95 hover:bg-white flex items-center justify-center shadow-md transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                        aria-label="Previous slide"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800">
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
                            items={displayProducts}
                            onSwiper={(swiper) => { swiperRef.current = swiper; }}
                            renderItem={(product) => renderCard(product)}
                            spaceBetween={16}
                            slidesPerView={1.2}
                            breakpoints={BUDGET_BREAKPOINTS}
                            speed={800}
                            className="px-1"
                        />
                    )}

                    {/* Right Navigation Arrow */}
                    <button
                        onClick={() => swiperRef.current?.slideNext()}
                        className="flex absolute -right-1 sm:-right-2 md:-right-4 lg:-right-5 top-[40%] -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full border border-gray-200 bg-white/95 hover:bg-white flex items-center justify-center shadow-md transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                        aria-label="Next slide"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>
                </div>

                {/* View All Products button */}
                <div className="text-center mt-10 md:mt-12 lg:mt-16">
                    <Link
                        href={shopByBudgetData?.buttonlink1 || "/shop"}
                        className="inline-block bg-[#A96D56] hover:bg-[#995e48] text-white px-8 py-3 rounded-none font-instrument-sans text-[11px] font-semibold tracking-widest uppercase transition-all duration-300 shadow-xs"
                    >
                        {shopByBudgetData?.buttontext1 || "View All Products"}
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default ShopByBudget;