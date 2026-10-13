'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl } from '@/lib/utils';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

import 'swiper/css';

export const DiamondShapes: React.FC<{ diamondShapesData?: any }> = ({ diamondShapesData }) => {
    if (!diamondShapesData) return null;

    const info = diamondShapesData.info || diamondShapesData.content || diamondShapesData || {};
    const rawItems = diamondShapesData.items || info.items || info.shapes || info.diamondShapes || info.list || [];

    const isSectionActive = !info.status || info.status === 'ACTIVE';
    if (!isSectionActive) return null;

    const activeItems = rawItems.filter((item: any) => !item.status || item.status === 'ACTIVE');
    if (activeItems.length === 0) return null;

    const rawTitle = (info.title || info.heading || "").trim();
    const rawSub = (info.description || info.subText || info.subTitle || "").trim();

    let topBadge = rawSub ? rawSub.toUpperCase() : "BROWSE DIAMONDS";
    let mainHeading = rawTitle || "Explore Every Diamond Shape To Match Your Style";

    // Dynamic Swiper items from Admin API (duplicate only if count is small for continuous loop)
    const displayShapes = activeItems.length < 12
        ? [...activeItems, ...activeItems, ...activeItems]
        : activeItems;

    return (
        <section className="bg-[#F5F2EC] py-14 lg:py-20 px-4 sm:px-6 lg:px-12 border-y border-stone-200/40 overflow-hidden">
            <div className="max-w-[1650px] mx-auto text-center">
                {/* Section Header */}
                <div className="max-w-5xl lg:max-w-6xl mx-auto mb-10 lg:mb-14 px-4">
                    {topBadge && (
                        <p className="text-[11px] lg:text-[12px] uppercase tracking-[0.3em] text-stone-500 font-semibold mb-3 font-instrument-sans">
                            {topBadge}
                        </p>
                    )}
                    {mainHeading && (
                        <h2 className="text-3xl md:text-4xl lg:text-[44px] leading-tight text-[#1A1A1A] font-cormorant-garamond font-light lg:whitespace-nowrap">
                            {mainHeading}
                        </h2>
                    )}
                </div>

                {/* Swiper Continuous Slider Section */}
                <div className="relative px-2 md:px-4 group/carousel">
                    <Swiper
                        modules={[Autoplay]}
                        spaceBetween={16}
                        slidesPerView={3.2}
                        breakpoints={{
                            480: { slidesPerView: 4.5, spaceBetween: 16 },
                            640: { slidesPerView: 6, spaceBetween: 20 },
                            768: { slidesPerView: 7.5, spaceBetween: 24 },
                            1024: { slidesPerView: 9, spaceBetween: 24 },
                            1280: { slidesPerView: 10, spaceBetween: 24 },
                        }}
                        loop={displayShapes.length > 3}
                        autoplay={{
                            delay: 2500,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: false,
                        }}
                        grabCursor={true}
                        className="w-full !py-2 px-1"
                    >
                        {displayShapes.map((shape: any, idx: number) => {
                            const shapeName = shape.title || shape.name || shape.label || shape.heading || '';
                            const rawImg = shape.image || shape.imageMobile || shape.imageDesktop || shape.src || shape.url || shape.icon || shape.MediaLocation;
                            const shapeImage = getImageUrl(rawImg);
                            const shapeLink = shape.link || shape.redirect?.href || shape.redirect?.url || (shapeName ? `/shop?shape=${encodeURIComponent(shapeName.toLowerCase())}` : '#');

                            return (
                                <SwiperSlide key={`${shapeName || idx}-${idx}`} className="h-auto">
                                    <Link
                                        href={shapeLink}
                                        className="group flex flex-col items-center gap-3 transition-all duration-300 hover:-translate-y-1.5 select-none p-2 rounded-xl"
                                    >
                                        <div className="relative w-16 h-16 sm:w-18 sm:h-18 xl:w-20 xl:h-20 flex items-center justify-center p-1">
                                            <Image
                                                src={shapeImage}
                                                alt={shapeName || 'Diamond Shape'}
                                                fill
                                                unoptimized
                                                className="object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-xs"
                                                sizes="(max-width: 768px) 64px, 80px"
                                            />
                                        </div>
                                        {shapeName && (
                                            <span className="text-[13px] xl:text-[14px] font-instrument-sans font-semibold text-[#2A2A2A] group-hover:text-[#A96D56] transition-colors text-center whitespace-nowrap">
                                                {shapeName}
                                            </span>
                                        )}
                                    </Link>
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>
                </div>
            </div>
        </section>
    );
};

export default DiamondShapes;