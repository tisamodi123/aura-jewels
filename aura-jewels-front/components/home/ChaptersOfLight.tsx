'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl } from '@/lib/utils';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

import 'swiper/css';

const ChaptersOfLight: React.FC<{ shopByCategoryData?: any }> = ({ shopByCategoryData }: any) => {
    const shopByCatagoryInfo = shopByCategoryData && !Array.isArray(shopByCategoryData) && shopByCategoryData.info
        ? shopByCategoryData.info
        : {};
    const shopByCatagoryItems = shopByCategoryData && !Array.isArray(shopByCategoryData) && shopByCategoryData.categories
        ? shopByCategoryData.categories
        : [];

    const isSectionActive = !shopByCatagoryInfo.status || shopByCatagoryInfo.status === 'ACTIVE';

    const activeInfo = Object.keys(shopByCatagoryInfo).length > 0 && isSectionActive
        ? shopByCatagoryInfo
        : {
            title: 'Each Piece Is Thoughtfully Handcrafted To Reflect Your Individuality Timeless In Spirit And Enduring In Beauty.',
            description: 'Discover our collections by category and find pieces that suit your taste and lifestyle.'
        };

    const activeItems = shopByCatagoryItems.length > 0 && isSectionActive
        ? shopByCatagoryItems.filter((cat: any) => !cat.status || cat.status === 'ACTIVE')
        : [];

    // Duplicate list if short to ensure smooth infinite loop sliding across wide screens
    const displayItems = activeItems.length > 0
        ? (activeItems.length < 8 ? [...activeItems, ...activeItems, ...activeItems] : activeItems)
        : [];

    if (!isSectionActive || activeItems.length === 0) {
        return null;
    }

    const renderCard = (cat: any, idx: number) => {
        const catLink = cat?.redirect?.href || '/shop';
        const catName = cat.title || cat.categoryName || cat.name || 'Category';
        return (
            <Link
                key={`${cat.id || catName}-${idx}`}
                href={catLink}
                className="group relative flex flex-col items-center bg-white cursor-pointer w-full select-none"
            >
                <div className="relative overflow-hidden aspect-[4/5] w-full bg-[#F5F2EC] rounded-none transition-all duration-300 group-hover:shadow-md">
                    <Image
                        src={getImageUrl(cat.imageMobile || cat.image)}
                        alt={catName}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 640px) 70vw, (max-width: 1024px) 30vw, 20vw"
                    />
                </div>
                <h3 className="text-[15px] md:text-[17px] lg:text-[18px] text-[#1A1A1A] font-sans font-medium text-center mt-4 mb-2 transition-colors duration-300 group-hover:text-[#A96D56]">
                    {catName}
                </h3>
            </Link>
        );
    };

    return (
        <section className="bg-white overflow-hidden py-12 lg:py-20">
            <div className="w-full px-4 sm:px-6 lg:px-12">
                {/* Centered Heading Section */}
                <div className="max-w-4xl mx-auto text-center mb-10 lg:mb-14 px-4">
                    <span className="text-[11px] lg:text-[12px] tracking-[0.3em] uppercase font-bold text-stone-500 font-sans block mb-3">
                        {activeInfo.subTitle || "ETERNAL EXPRESSION"}
                    </span>
                    <h2 className="text-2xl md:text-3xl lg:text-[34px] leading-[1.4] text-[#1A1A1A] font-cormorant-garamond font-normal mb-6">
                        {activeInfo.title && activeInfo.title !== "SHOP BY CATEGORY"
                            ? activeInfo.title
                            : "Each Piece Is Thoughtfully Handcrafted To Reflect Your Individuality Timeless In Spirit And Enduring In Beauty."}
                    </h2>
                    <div className="flex items-center justify-center gap-4">
                        <Link
                            href="/shop"
                            className="bg-[#A96D56] hover:bg-[#995e48] text-white px-7 py-2.5 rounded-none font-sans text-[12px] md:text-[13px] font-semibold tracking-wider uppercase transition-all duration-300 shadow-sm inline-block"
                        >
                            View All Collection
                        </Link>
                    </div>
                </div>

                {/* Desktop View: Static Grid of 5 items */}
                <div className="hidden lg:grid lg:grid-cols-5 lg:gap-6 px-4">
                    {activeItems.slice(0, 5).map((cat: any, idx: number) => renderCard(cat, idx))}
                </div>

                {/* Mobile/Tablet View: Swiper Carousel */}
                <div className="lg:hidden relative px-2 md:px-4 group/carousel">
                    <Swiper
                        modules={[Autoplay]}
                        spaceBetween={20}
                        slidesPerView={1.3}
                        breakpoints={{
                            480: { slidesPerView: 2, spaceBetween: 16 },
                            640: { slidesPerView: 2.8, spaceBetween: 20 },
                            768: { slidesPerView: 3.5, spaceBetween: 24 },
                        }}
                        loop={displayItems.length > 3}
                        autoplay={{
                            delay: 2800,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: false,
                        }}
                        grabCursor={true}
                        className="w-full !py-2 px-1"
                    >
                        {displayItems.map((cat: any, idx: number) => (
                            <SwiperSlide key={`${cat.id || idx}-${idx}`} className="h-auto">
                                {renderCard(cat, idx)}
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>
    );
};

export default ChaptersOfLight;