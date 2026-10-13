'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';

interface GiftsOccasionProps {
    giftsOccasionData: {
        info: {
            title?: string;
            description?: string;
            marqueeItems?: string[];
            status?: string;
        };
        items?: Array<{
            title?: string;
            subTitle?: string;
            description?: string;
            image?: string;
            imageMobile?: string;
            buttonlink1?: string;
            buttontext1?: string;
            status?: string;
        }>;
    };
}

const GiftsOccasion: React.FC<GiftsOccasionProps> = ({ giftsOccasionData }) => {
    if (!giftsOccasionData || !giftsOccasionData.info || giftsOccasionData.info.status !== 'ACTIVE') {
        return null;
    }

    const info = giftsOccasionData.info;
    const items = giftsOccasionData.items || [];
    const activeItems = items.filter((item: any) => !item.status || item.status === 'ACTIVE');

    if (activeItems.length === 0) {
        return null;
    }

    // The first item is the static Intro Content (Title, Description, and Main Image)
    const introItem = activeItems[0];

    const defaultTestimonials = [
        {
            title: "_Michelle Campbell",
            description: "Designing my engagement ring was a dream experience. The team guided me through every detail, from selecting the perfect stone to refining the setting. The final piece was beyond anything I imagined elegant, timeless, and uniquely mine."
        },
        {
            title: "_Sophia Lauren",
            description: "The craftsmanship is remarkable. Each piece carries an air of quiet luxury and distinction. I receive endless compliments whenever I wear my custom necklace."
        },
        {
            title: "_Elena Rostova",
            description: "Extremely thoughtful service and breathtaking designs. From the initial sketch to the finished heirloom, the entire process was seamless and unforgettable."
        }
    ];

    // The rest of the items are Client Testimonials (fallback to defaults if CMS only has intro item)
    const cmsTestimonials = activeItems.slice(1);
    const testimonials = cmsTestimonials.length > 0 ? cmsTestimonials : defaultTestimonials;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);

    // Auto-play testimonials slider
    useEffect(() => {
        if (testimonials.length <= 1) return;
        const interval = setInterval(() => {
            handleNext();
        }, 6000);
        return () => clearInterval(interval);
    }, [currentIndex, testimonials.length]);

    const handleNext = () => {
        if (testimonials.length === 0) return;
        setIsFading(true);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length);
            setIsFading(false);
        }, 300);
    };

    const handlePrev = () => {
        if (testimonials.length === 0) return;
        setIsFading(true);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
            setIsFading(false);
        }, 300);
    };

    const handleDotClick = (index: number) => {
        if (index === currentIndex) return;
        setIsFading(true);
        setTimeout(() => {
            setCurrentIndex(index);
            setIsFading(false);
        }, 300);
    };

    const currentTestimonial = testimonials[currentIndex] || null;

    const getItemText = (item: any) => {
        if (!item) return '';
        const sub = (item.subTitle || '').trim();
        const desc = (item.description || '').trim();
        return desc || sub || '';
    };

    const introText = getItemText(introItem);
    const testimonialText = currentTestimonial
        ? (getItemText(currentTestimonial) || "Designing my engagement ring was a dream experience. The team guided me through every detail, from selecting the perfect stone to refining the setting. The final piece was beyond anything I imagined elegant, timeless, and uniquely mine.")
        : '';

    const marqueeWords = (info.marqueeItems || [])
        .map((t: string) => t.trim())
        .filter(Boolean);

    const marqueeContent = marqueeWords.length > 0 ? (
        <div className="flex shrink-0 items-center gap-8 md:gap-12 text-white text-[14px] md:text-[16px] tracking-wide font-instrument-sans font-medium pr-8 md:pr-12">
            {Array(8).fill(marqueeWords).flat().map((word, idx) => (
                <React.Fragment key={idx}>
                    <span>{word}</span>
                    <span className="text-white text-xs md:text-sm">✦</span>
                </React.Fragment>
            ))}
        </div>
    ) : null;

    return (
        <>
            <section className="bg-white py-6 min-[370px]:py-12 md:py-24 px-2 min-[370px]:px-6 md:px-12 border-t border-stone-100 overflow-hidden relative select-none">
                <style dangerouslySetInnerHTML={{ __html: `
                    @media (min-width: 768px) {
                        .testimonial-card-container {
                            margin-left: -96px !important;
                            width: calc(100% + 96px) !important;
                        }
                    }
                    @media (min-width: 1024px) {
                        .testimonial-card-container {
                            margin-left: -144px !important;
                            width: calc(100% + 144px) !important;
                        }
                    }
                    @media (min-width: 1280px) {
                        .testimonial-card-container {
                            margin-left: -192px !important;
                            width: calc(100% + 192px) !important;
                        }
                    }
                `}} />
                <div className="max-w-[1400px] mx-auto flex flex-col items-center">
                    {/* Top Section Header */}
                    <div className="text-center max-w-4xl mx-auto mb-4 min-[370px]:mb-8 md:mb-16">
                        {info.description && (
                            <p className="text-[8px] min-[370px]:text-[11px] uppercase tracking-[0.25em] min-[370px]:tracking-[0.45em] text-stone-500 font-bold mb-1.5 min-[370px]:mb-4 font-instrument-sans">
                                {info.description}
                            </p>
                        )}
                        {info.title && (
                            <h2 className="text-lg min-[370px]:text-2xl md:text-3xl lg:text-[36px] xl:text-[38px] leading-[1.3] text-[#1A1A1A] font-cormorant-garamond font-light max-w-2xl mx-auto px-1">
                                {info.title}
                            </h2>
                        )}
                    </div>

                    {/* Main Content Area */}
                    <div className="relative w-full px-0 md:px-6 lg:px-16">
                        {/* Navigation Left Arrow */}
                        <button
                            onClick={handlePrev}
                            className="hidden md:flex absolute md:left-2 lg:left-4 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-11 lg:h-11 rounded-full border border-stone-200 items-center justify-center bg-white/95 hover:bg-white transition-all shadow-md cursor-pointer z-30 text-stone-700 hover:scale-105 active:scale-95"
                            aria-label="Previous testimonial"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {/* Navigation Right Arrow */}
                        <button
                            onClick={handleNext}
                            className="hidden md:flex absolute md:right-2 lg:right-4 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-11 lg:h-11 rounded-full border border-stone-200 items-center justify-center bg-white/95 hover:bg-white transition-all shadow-md cursor-pointer z-30 text-stone-700 hover:scale-105 active:scale-95"
                            aria-label="Next testimonial"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 12h14m-7 7 7-7-7-7" />
                            </svg>
                        </button>

                        <div className="grid grid-cols-12 gap-0 md:gap-4 items-center">
                            {/* Left Column: Intro Info Block */}
                            <div className="col-span-12 md:col-span-3 flex flex-col justify-center text-left pt-0 pr-0 md:pr-4 lg:pr-8 mb-6 md:mb-0">
                                <h3 className="text-xl sm:text-2xl lg:text-[32px] font-light text-[#1A1A1A] font-cormorant-garamond leading-tight mb-2 sm:mb-4">
                                    {introItem.title || "Stories From Our Clients"}
                                </h3>
                                <p className="text-[12px] lg:text-[14px] text-stone-500 font-instrument-sans leading-relaxed font-light max-w-xl">
                                    {introText || "Our clients cherish the calm, care, and transformation they experience with us. Every interaction is guided by trust, attention, & deeply personal approach."}
                                </p>
                            </div>

                            {/* Center Column: Main Cover Image */}
                            <div className="col-span-12 md:col-span-4 w-full flex justify-center relative z-20 my-0 mb-6 md:mb-0 max-w-sm md:max-w-none mx-auto">
                                <div className="relative w-full aspect-[4/5] overflow-hidden bg-stone-50 border border-stone-100 shadow-md rounded-xs">
                                    <Image
                                        src={getImageUrl(introItem.image)}
                                        alt={introItem.title || "Stories Cover"}
                                        fill
                                        unoptimized
                                        className="object-cover"
                                        priority
                                    />
                                </div>
                            </div>

                            {/* Right Column: Testimonial Slide Container */}
                            <div className="testimonial-card-container col-span-12 md:col-span-5 w-full relative z-10 md:-top-12 lg:-top-20 xl:-top-24 max-w-sm md:max-w-none mx-auto">
                                {currentTestimonial ? (
                                    <div className="bg-[#F5F2EC] p-5 sm:p-7 md:p-8 lg:p-12 md:pl-28 lg:pl-40 xl:pl-56 relative flex flex-col justify-between min-h-[180px] sm:min-h-[320px] md:min-h-[360px] border border-[#ECE7DF] shadow-xs rounded-xs">
                                        <div className="flex-grow">
                                            {/* Card Top Row: Quote Icon & Mobile Controls */}
                                            <div className="flex items-center justify-between mb-2 sm:mb-5">
                                                {/* Terracotta Double Quote Icon */}
                                                <svg className="w-3.5 h-3 sm:w-5 sm:h-4" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M0 18V10.8C0 7.44 0.96 4.68 2.88 2.52C4.8 0.36 7.44 -0.36 10.8 0.36V4.32C9.12 4.32 7.8 4.8 6.84 5.76C5.88 6.72 5.4 8.04 5.4 9.72H10.8V18H0ZM13.2 18V10.8C13.2 7.44 14.16 4.68 16.08 2.52C18 0.36 20.64 -0.36 24 0.36V4.32C22.32 4.32 21 4.8 20.04 5.76C19.08 6.72 18.6 8.04 18.6 9.72H24V18H13.2Z" fill="#A96D56" />
                                                </svg>
                                            </div>

                                            <div className={`transition-all duration-300 ${isFading ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
                                                }`}>
                                                <p className="text-[10px] sm:text-[13.5px] md:text-[14px] lg:text-[15px] text-stone-700 font-instrument-sans leading-relaxed mb-2 sm:mb-6 font-light text-left line-clamp-4 min-[370px]:line-clamp-none">
                                                    "{testimonialText}"
                                                </p>
                                            </div>
                                        </div>

                                        <div className="relative z-10 flex flex-col space-y-1 sm:space-y-3 pt-1">
                                            <h4 className={`text-sm sm:text-lg md:text-xl lg:text-2xl font-cormorant-garamond font-light text-stone-900 transition-all duration-300 text-left ${isFading ? 'opacity-0' : 'opacity-100'
                                                }`}>
                                                _{currentTestimonial.title?.replace(/^_/, '')}
                                            </h4>

                                            {/* Dot Indicators */}
                                            {testimonials.length > 1 && (
                                                <div className="flex space-x-1 sm:space-x-2 pt-0.5 sm:pt-1 items-center">
                                                    {testimonials.map((_, dotIdx) => (
                                                        <button
                                                            key={dotIdx}
                                                            onClick={() => handleDotClick(dotIdx)}
                                                            className={`transition-all duration-300 cursor-pointer ${dotIdx === currentIndex
                                                                ? 'w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 bg-[#A96D56]'
                                                                : 'w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 border border-[#A96D56] bg-transparent'
                                                                }`}
                                                            aria-label={`Go to testimonial slide ${dotIdx + 1}`}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-[#F5F2EC] p-8 md:p-12 flex items-center justify-center text-center min-h-[300px]">
                                        <p className="text-sm text-stone-400 font-jakarta font-light">No testimonials available.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Infinite Marquee Bar */}
            {marqueeContent && (
                <div className="w-full bg-[#A96D56] py-2 min-[370px]:py-4 md:py-5 my-12 md:my-20 overflow-hidden select-none relative z-10">
                    <div className="flex whitespace-nowrap animate-marquee hover:[animation-play-state:paused]">
                        {marqueeContent}
                        {marqueeContent}
                    </div>
                </div>
            )}

            {/* Endless Memories Reels Section (Now handled in HomePage) */}

        </>
    );
};

export default GiftsOccasion;

