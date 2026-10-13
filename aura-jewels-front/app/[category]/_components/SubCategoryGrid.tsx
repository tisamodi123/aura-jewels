'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { getImageUrl } from '@/lib/utils';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/navigation';

interface SubCategoryGridProps {
    category: string;
    exploreByStyle?: {
        paraTypeName?: string;
        description?: string;
        subtitle?: string;
        styles?: Array<{
            name?: string;
            categoryName?: string;
            paraMtrName?: string;
            image?: string;
            image1?: string;
            slug?: string;
        }>;
    };
}

const SubCategoryGrid: React.FC<SubCategoryGridProps> = ({ category, exploreByStyle }) => {
    const prevRef = useRef<HTMLButtonElement>(null);
    const nextRef = useRef<HTMLButtonElement>(null);

    const stylesList = exploreByStyle?.styles || [];

    if (stylesList.length === 0) {
        return null;
    }

    const headingText = exploreByStyle?.paraTypeName || `${category.replace(/-/g, ' ')} By Style`;
    const descriptionText = exploreByStyle?.description || `Shop ${category.replace(/-/g, ' ')} from Our Curated Selection of Contemporary to Vintage Styles`;

    return (
        <section className="py-8 md:py-12 px-4 md:px-8 bg-white border-b border-gray-100">
            <div className="max-w-[1400px] mx-auto text-center">
                {/* Header Title & Subtitle */}
                <div className="mb-5 md:mb-7 px-4">
                    <h2 className="text-2xl md:text-3xl lg:text-[32px] font-serif font-normal text-[#1A1A1A] capitalize mb-2 tracking-wide">
                        {headingText}
                    </h2>
                    <p className="text-[13px] md:text-[14px] font-sans text-gray-500 font-light max-w-2xl mx-auto">
                        {descriptionText}
                    </p>
                </div>

                {/* Balanced Beige Square Cards Carousel */}
                <div className="relative px-4 md:px-10 group/slider">
                    {/* #A96D56 Color Left Arrow (Visible Only On Hover) */}
                    <button
                        ref={prevRef}
                        aria-label="Previous styles"
                        className="absolute left-0 md:left-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full border border-[#A96D56]/40 text-[#A96D56] flex items-center justify-center bg-white/90 backdrop-blur-xs shadow-md opacity-0 group-hover/slider:opacity-100 hover:bg-[#A96D56] hover:text-white transition-all duration-300 focus:outline-none"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* #A96D56 Color Right Arrow (Visible Only On Hover) */}
                    <button
                        ref={nextRef}
                        aria-label="Next styles"
                        className="absolute right-0 md:right-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full border border-[#A96D56]/40 text-[#A96D56] flex items-center justify-center bg-white/90 backdrop-blur-xs shadow-md opacity-0 group-hover/slider:opacity-100 hover:bg-[#A96D56] hover:text-white transition-all duration-300 focus:outline-none"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>

                    <Swiper
                        modules={[Navigation]}
                        navigation={{
                            prevEl: prevRef.current,
                            nextEl: nextRef.current,
                        }}
                        onBeforeInit={(swiper) => {
                            // @ts-ignore
                            swiper.params.navigation.prevEl = prevRef.current;
                            // @ts-ignore
                            swiper.params.navigation.nextEl = nextRef.current;
                        }}
                        spaceBetween={12}
                        slidesPerView={2.8}
                        breakpoints={{
                            480: { slidesPerView: 3.8, spaceBetween: 14 },
                            640: { slidesPerView: 4.8, spaceBetween: 14 },
                            768: { slidesPerView: 5.8, spaceBetween: 16 },
                            1024: { slidesPerView: 7, spaceBetween: 16 },
                        }}
                        grabCursor={true}
                        className="w-full !py-1"
                    >
                        {stylesList.map((style: any, idx: number) => {
                            const styleName = style.categoryName || style.paraMtrName || style.name || '';
                            const styleImage = getImageUrl(style.image || style.image1);
                            const styleSlug = style.slug || styleName.toLowerCase().replace(/\s+/g, '-');

                            return (
                                <SwiperSlide key={idx} className="h-auto">
                                    <Link
                                        href={`/${category}/${styleSlug}`}
                                        className="group flex flex-col items-center cursor-pointer w-full select-none"
                                    >
                                        {/* Goldilocks Balanced Beige Square Box (#F5F2EC) */}
                                        <div className="w-full aspect-square relative bg-[#F5F2EC] group-hover:bg-[#ECE8DF] transition-all duration-300 flex items-center justify-center p-3 sm:p-4 overflow-hidden rounded-xs group-hover:shadow-md">
                                            {styleImage && (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img
                                                    src={styleImage}
                                                    alt={styleName}
                                                    className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                                                />
                                            )}
                                        </div>

                                        {/* Text Label Below */}
                                        <h3 className="mt-2 text-center text-[12px] sm:text-[13px] md:text-[14px] font-sans font-medium text-[#222222] group-hover:text-[#A96D56] leading-tight w-full truncate">
                                            {styleName}
                                        </h3>
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

export default SubCategoryGrid;
