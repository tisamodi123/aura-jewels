'use client';

import React, { useRef } from 'react';
import Slider from 'react-slick';
import { TESTIMONIALS } from '@/lib/constants';

const LovedByIndia: React.FC = () => {
    const sliderRef = useRef<Slider | null>(null);

    const settings = {
        dots: false,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 2000,
        speed: 700,
        slidesToShow: 3,
        slidesToScroll: 1,
        arrows: false,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                }
            }
        ]
    };

    const nextSlide = () => {
        sliderRef.current?.slickNext();
    };

    const prevSlide = () => {
        sliderRef.current?.slickPrev();
    };

    if (!TESTIMONIALS || TESTIMONIALS.length === 0) return null;

    return (
        <section className="py-20 px-6 md:px-12  mx-auto bg-white overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.5em] text-[#A96D56] font-bold mb-4 font-jakarta">Voices of Trust</p>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl serif">Loved by India</h2>
                    <div className="w-20 h-[1px] bg-[#A96D56] mt-8"></div>
                </div>

                <div className="flex space-x-4">
                    <button
                        onClick={prevSlide}
                        className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-[#1A1A1A] hover:text-white transition-all group bg-white shadow-sm"
                        aria-label="Previous testimonials"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button
                        onClick={nextSlide}
                        className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-[#1A1A1A] hover:text-white transition-all group bg-white shadow-sm"
                        aria-label="Next testimonials"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>

            <div className="relative -mx-4">
                <Slider ref={sliderRef} {...settings}>
                    {TESTIMONIALS.map((review, i) => (
                        <div key={i} className="px-4">
                            <div className="h-full p-10 bg-white border border-gray-200 relative flex flex-col shadow-sm group hover:border-[#F5ECE0] transition-all duration-500 min-h-[300px]">
                                <span className="text-8xl text-gray-50 absolute top-2 left-4 serif font-bold opacity-60 leading-none group-hover:text-[#F5ECE0] transition-colors">“</span>
                                <p className="text-[16px] text-gray-600 relative z-10 leading-relaxed pt-10 font-jakarta font-light">
                                    {review.text}
                                </p>
                                <div className="mt-10">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#A96D56] font-jakarta">— {review.name}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </Slider>
            </div>
        </section>
    );
};

export default LovedByIndia;
