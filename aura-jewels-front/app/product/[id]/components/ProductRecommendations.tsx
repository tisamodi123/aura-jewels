'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import ProductCard from '@/components/ProductCard';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ProductRecommendationsProps {
    recList: any[];
}

export default function ProductRecommendations({ recList }: ProductRecommendationsProps) {
    if (!recList || recList.length === 0) return null;

    return (
        <section className="max-w-[1500px] py-12 md:py-20 lg:py-10 px-6 md:px-12 mx-auto border-t border-gray-100">
            <h2 className="text-2xl md:text-3xl lg:text-4xl serif text-gray-900 mb-10 md:mb-16 text-center">You May Also Like</h2>
            <div className="relative px-4 md:px-8">
                <Swiper
                    modules={[Navigation, Pagination]}
                    spaceBetween={20}
                    slidesPerView={2}
                    navigation={{
                        prevEl: ".swiper-button-prev",
                        nextEl: ".swiper-button-next",
                    }}
                    breakpoints={{
                        640: {
                            slidesPerView: 2,
                            spaceBetween: 20,
                        },
                        768: {
                            slidesPerView: 3,
                            spaceBetween: 24,
                        },
                        1024: {
                            slidesPerView: 4,
                            spaceBetween: 30,
                        },
                    }}
                    className="w-full pb-12 !px-1 [&>.swiper-button-next]:text-[#013D3D] [&>.swiper-button-prev]:text-[#013D3D] [&>.swiper-pagination-bullet-active]:bg-[#013D3D]"
                >
                    {recList.map((p: any) => {
                        const key = typeof p._id === 'object' ? (p._id?.$oid || JSON.stringify(p._id)) : (p._id || p.id);
                        return (
                            <SwiperSlide key={key} className="h-auto flex">
                                <ProductCard product={p} />
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            </div>
        </section>
    );
}
