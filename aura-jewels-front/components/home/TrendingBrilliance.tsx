'use client';

import React, { useRef, useState, useEffect } from 'react';
import CommonSlider, { SwiperType } from '@/components/common/CommonSlider';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import { getProductsByTags } from '@/services/productService';

interface TrendingBrillianceProps {
    data?: any;
}

const TrendingBrilliance: React.FC<TrendingBrillianceProps> = ({ data }) => {
    const [tagGroups, setTagGroups] = useState<any[]>([]);
    const [activeTabId, setActiveTabId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [slidesPerView, setSlidesPerView] = useState(1.2);
    const swiperRef = useRef<SwiperType | null>(null);

    const breakpoints: { [width: number]: { slidesPerView: number } } = {
        480: { slidesPerView: 1 },
        540: { slidesPerView: 1.5 },
        640: { slidesPerView: 1.8 },
        768: { slidesPerView: 3 },
        1024: { slidesPerView: 5 },
        1280: { slidesPerView: 5.5 },
    };

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            let spv = 1.2;
            const sortedBps = Object.keys(breakpoints).map(Number).sort((a, b) => b - a);
            for (const bp of sortedBps) {
                if (width >= bp) {
                    spv = breakpoints[bp].slidesPerView;
                    break;
                }
            }
            setSlidesPerView(spv);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const tagIds = data?.content?.tags || [];
        if (tagIds.length > 0) {
            setLoading(true);
            getProductsByTags(tagIds)
                .then((res: any) => {
                    if (res && (res.status === 200 || res.errorCode === 200) && res.data) {
                        setTagGroups(res.data);
                        if (res.data.length > 0) {
                            setActiveTabId(res.data[0]._id);
                        }
                    }
                })
                .catch((err: any) => {
                    console.error("Error fetching products by tags:", err);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [data?.content?.tags]);

    if (!data?.enabled) return null;

    const activeGroup = tagGroups.find(g => g._id === activeTabId);
    const displayedProducts = activeGroup?.products || [];
    const heading = data?.content?.heading || "Trending Brilliance";
    const canSlide = displayedProducts.length > slidesPerView;

    if (loading) {
        return (
            <section className="py-10 px-6 md:px-12 mx-auto overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-start md:mb-16 gap-8 md:gap-10">
                    <div className="w-full">
                        <h2 className="text-3xl md:text-5xl serif mb-6 md:mb-8 text-center md:text-left">{heading}</h2>
                        <div className="flex justify-center md:justify-start space-x-8 md:space-x-12 text-[11px] uppercase tracking-[0.3em] font-bold font-jakarta">
                            <div className="h-4 bg-stone-100 rounded w-24 animate-pulse"></div>
                            <div className="h-4 bg-stone-100 rounded w-24 animate-pulse"></div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <ProductCardSkeleton key={i} />
                    ))}
                </div>
            </section>
        );
    }

    if (tagGroups.length === 0) {
        return null;
    }

    return (
        <section className="py-10 px-6 md:px-12 mx-auto overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:mb-16 gap-8 md:gap-10">
                <div className="w-full">
                    <h2 className="text-3xl md:text-5xl serif mb-6 md:mb-8 text-center md:text-left">{heading}</h2>
                    <div className="flex justify-center md:justify-start space-x-8 md:space-x-12 text-[11px] uppercase tracking-[0.3em] font-bold font-jakarta">
                        {tagGroups.map((group) => (
                            <button
                                key={group._id}
                                onClick={() => { setActiveTabId(group._id); swiperRef.current?.slideTo(0); }}
                                className={`pb-3 border-b-2 transition-all ${activeTabId === group._id ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-gray-400 hover:text-black'}`}
                            >
                                {group.name}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center justify-between w-full md:w-auto md:justify-end space-x-6 md:space-x-8 md:mt-0">
                    <div className="flex space-x-4 hidden md:flex">
                        <button disabled={!canSlide} onClick={() => swiperRef.current?.slidePrev()} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#1A1A1A] hover:text-white transition-all group bg-white disabled:opacity-50 disabled:pointer-events-none">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button disabled={!canSlide} onClick={() => swiperRef.current?.slideNext()} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#1A1A1A] hover:text-white transition-all group bg-white disabled:opacity-50 disabled:pointer-events-none">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
            </div>

            <div className="relative">
                {displayedProducts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">No products found</div>
                ) : (
                    <CommonSlider
                        items={displayedProducts}
                        renderItem={(product) => <ProductCard product={product} />}
                        onSwiper={(swiper) => { swiperRef.current = swiper; }}
                        loop={canSlide}
                        autoplay={false}
                        slidesPerView={1.2}
                        breakpoints={breakpoints}
                    />
                )}
            </div>
        </section>
    );
};

export default TrendingBrilliance;