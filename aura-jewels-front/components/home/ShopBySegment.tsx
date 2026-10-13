'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PREFIX } from '@/lib/constants';
import CommonSlider from '@/components/common/CommonSlider';

const DEFAULT_SEGMENT_DATA = {
    info: {
        status: 'ACTIVE',
        description: 'TRENDING COLLECTION',
        title: 'Curated Fine Jewellery For Every Occasion',
    },
    items: [
        {
            title: 'Engagement Rings',
            subTitle: 'Timeless solitaire and halo designs crafted to perfection.',
            image: `${PREFIX || ''}/images/Journal-1.jpg`,
            buttonlink1: '/rings',
            buttontext1: 'Browse Rings',
            status: 'ACTIVE',
        },
        {
            title: 'Fine Earrings',
            subTitle: 'Elegant studs and drop earrings in 18KT gold.',
            image: `${PREFIX || ''}/images/Journal-2.jpg`,
            buttonlink1: '/earrings',
            buttontext1: 'Browse Earrings',
            status: 'ACTIVE',
        },
        {
            title: 'Diamond Pendants',
            subTitle: 'Graceful solitaire pendants designed for everyday luxury.',
            image: `${PREFIX || ''}/images/Journal-3.jpg`,
            buttonlink1: '/pendants',
            buttontext1: 'Browse Pendants',
            status: 'ACTIVE',
        },
    ],
};

const ShopBySegment: React.FC<{ shopBySegmentData?: any }> = ({ shopBySegmentData }: any) => {
    const dataToUse = shopBySegmentData && shopBySegmentData.info ? shopBySegmentData : DEFAULT_SEGMENT_DATA;
    const info = dataToUse.info;
    const items = dataToUse.items || [];
    const activeItems = items.filter((item: any) => !item.status || item.status === 'ACTIVE');
    if (activeItems.length === 0) {
        return null;
    }

    const segments = activeItems.map((item: any) => ({
        label: item.title,
        desc: item.subTitle,
        image: item.image,
        imageMobile: item.imageMobile,
        link: item.buttonlink1,
        linktext: item.buttontext1
    }));

    const renderCard = (persona: any, idx: number) => {
        const isLightTheme = idx === 1; // Card 2 (index 1) has light background and black text
        return (
            <Link key={idx} href={persona.link || '#'} className="group relative block aspect-[4/5] overflow-hidden w-full cursor-pointer">
                {/* Image */}
                <Image
                    src={persona.imageMobile || persona.image}
                    alt={persona.label}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                />

                {/* Text Overlay */}
                <div className={`absolute inset-0 flex flex-col justify-end p-6 pb-10 md:p-8 md:pb-12 ${isLightTheme
                    ? 'bg-gradient-to-t from-white/10 via-transparent to-transparent text-[#1A1A1A]'
                    : 'bg-gradient-to-t from-black/85 via-black/25 to-transparent text-white'
                    } text-center transition-all duration-300`}>
                    <h3 className="text-2xl md:text-3xl font-cormorant-garamond font-normal mb-2 leading-snug">
                        {persona.label}
                    </h3>
                    <p className={`text-[12px] md:text-[13px] font-instrument-sans leading-relaxed mb-5 max-w-[260px] mx-auto font-light ${isLightTheme ? 'text-gray-800' : 'text-white/80'
                        }`}>
                        {persona.desc}
                    </p>
                    <div>
                        <span className={`text-[11px] uppercase tracking-[0.2em] font-semibold font-instrument-sans border-b pb-0.5 transition-all duration-300 ${isLightTheme
                            ? 'border-[#1A1A1A] text-[#1A1A1A] hover:text-[#A96D56] hover:border-[#A96D56]'
                            : 'border-white text-white hover:text-white/80 hover:border-white/80'
                            }`}>
                            {persona.linktext || "Browse Collection"}
                        </span>
                    </div>
                </div>
            </Link>
        );
    };

    return (
        <section className="bg-white py-16 lg:py-24 px-6 md:px-12 lg:px-16 mx-auto">
            {/* Centered Heading Section */}
            <div className="max-w-4xl mx-auto text-center px-4 mb-12 lg:mb-16">
                <span className="text-[11px] lg:text-[12px] tracking-[0.35em] uppercase font-bold text-stone-500 font-instrument-sans block mb-4">
                    {info.description || "TRENDING COLLECTION"}
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-[44px] leading-[1.3] text-[#1A1A1A] font-cormorant-garamond font-light max-w-4xl mx-auto">
                    {info.title}
                </h2>
            </div>

            {/* Tablet/Intermediate View: Swiper Slider (540px to 1024px) */}
            <div className="lg:hidden">
                <CommonSlider
                    items={segments}
                    renderItem={(persona, idx) => renderCard(persona, idx)}
                    spaceBetween={20}
                    slidesPerView={1.5}
                    breakpoints={{
                        640: { slidesPerView: 2 },
                        768: { slidesPerView: 2.2 },
                    }}
                    speed={800}
                    className="pb-10"
                />
            </div>

            {/* Desktop View: Grid (above 1024px) */}
            <div className="hidden lg:grid grid-cols-3 gap-8">
                {segments.map((persona: any, idx: number) => renderCard(persona, idx))}
            </div>
        </section>
    );
};

export default ShopBySegment;
