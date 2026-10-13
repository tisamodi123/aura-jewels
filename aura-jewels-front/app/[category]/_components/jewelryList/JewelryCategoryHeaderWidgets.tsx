'use client';

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getImageUrl } from '@/lib/utils';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getResolvedSubcategories } from '@/lib/staticSubcategories';

import 'swiper/css';
import 'swiper/css/navigation';

interface JewelryCategoryHeaderWidgetsProps {
    category?: string;
    subcategory?: string;
    allParams?: any;
    styleList?: any[];
    filters: any;
    setFilters: (filters: any) => void;
}

export default function JewelryCategoryHeaderWidgets({
    category,
    subcategory,
    allParams,
    styleList = [],
    filters,
    setFilters,
}: JewelryCategoryHeaderWidgetsProps) {
    const router = useRouter();
    const prevRef = useRef<HTMLButtonElement>(null);
    const nextRef = useRef<HTMLButtonElement>(null);

    // Use dynamic images for 'rings' (if available), and curated distinct static images for all other categories
    const displayStyles = getResolvedSubcategories(category, styleList);

    if (displayStyles.length === 0) {
        return null;
    }

    const handleStyleClick = (st: any) => {
        if (category) {
            router.push(`/${category}/${st.slug}`);
        } else {
            const targetVal = st.id || st.slug || st.name;
            const currentSub = filters?.subCategory || [];
            const isSelected = currentSub.includes(targetVal) || currentSub.includes(st.slug) || currentSub.includes(st.name);

            if (isSelected) {
                setFilters({
                    ...filters,
                    subCategory: currentSub.filter((s: string) => s !== targetVal && s !== st.slug && s !== st.name),
                });
            } else {
                setFilters({
                    ...filters,
                    subCategory: [targetVal],
                });
            }
        }
    };

    return (
        <div className="w-full bg-white py-5 md:py-7 border-b border-gray-100">
            <div className="max-w-[1400px] mx-auto px-4 md:px-10 relative group/slider">
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
                    {displayStyles.map((st: any, idx: number) => {
                        const targetVal = st.id || st.slug || st.name;
                        const isSelected =
                            (filters?.subCategory || []).includes(targetVal) ||
                            (filters?.subCategory || []).includes(st.slug) ||
                            (filters?.subCategory || []).includes(st.name);

                        const imageSrc = getImageUrl(st.image);

                        return (
                            <SwiperSlide key={idx} className="h-auto">
                                <button
                                    onClick={() => handleStyleClick(st)}
                                    className="flex flex-col items-center group focus:outline-none w-full select-none"
                                >
                                    {/* Goldilocks Balanced Beige Square Box (#F5F2EC) */}
                                    <div
                                        className={`w-full aspect-square relative bg-[#F5F2EC] transition-all duration-300 flex items-center justify-center p-3 sm:p-4 overflow-hidden rounded-xs ${isSelected
                                            ? 'ring-2 ring-[#A96D56] shadow-md bg-[#ECE8DF]'
                                            : 'group-hover:bg-[#ECE8DF] group-hover:shadow-md'
                                            }`}
                                    >
                                        {imageSrc ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img
                                                src={imageSrc}
                                                alt={st.name}
                                                className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <span className="text-xs font-serif text-gray-400">{st.name}</span>
                                        )}
                                    </div>

                                    {/* Text Label Below */}
                                    <span
                                        className={`mt-2 text-[12px] sm:text-[13px] md:text-[14px] font-sans tracking-wide text-center leading-tight w-full truncate ${isSelected ? 'text-[#A96D56] font-bold' : 'text-[#222222] font-medium group-hover:text-[#A96D56]'
                                            }`}
                                    >
                                        {st.name}
                                    </span>
                                </button>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            </div>
        </div>
    );
}
