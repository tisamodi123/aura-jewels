'use client';

import React, { useRef, useState, useEffect } from 'react';
import Slider from 'react-slick';
import Image from 'next/image';
import { PREFIX } from '@/lib/constants';
import { Star } from 'lucide-react';

const REVIEWS = [
    {
        name: "Jenn Whill",
        title: "The Oval Eternity Band",
        text: "This piece exceeded all my expectations absolutely stunning and so comfortable to wear every day.",
        rating: 5,
        image: `${PREFIX}/images/subcategory/b2.jpg`,
    },
    {
        name: "Michele Jhon",
        title: "The Oval Eternity Band",
        text: "Aura Jewels has maintained a perfect balance between tradition and quality. The jewellery feels premium, authentic, and timeless.",
        rating: 5,
        image: `${PREFIX}/images/subcategory/b3.jpg`,
    },
    {
        name: "Elley Adam",
        title: "The Oval Eternity Band",
        text: "This is hands down my favorite piece of jewellery. It's stunning, lightweight, and always draws attention.",
        rating: 5,
        image: `${PREFIX}/images/subcategory/b4.jpg`,
    },
    {
        name: "Elley Adam",
        title: "The Oval Eternity Band",
        text: "This is hands down my favorite piece of jewellery. It's stunning, lightweight, and always draws attention.",
        rating: 5,
        image: `${PREFIX}/images/subcategory/b4.jpg`,
    },
    {
        name: "Elley Adam",
        title: "The Oval Eternity Band",
        text: "This is hands down my favorite piece of jewellery. It's stunning, lightweight, and always draws attention.",
        rating: 5,
        image: `${PREFIX}/images/subcategory/b4.jpg`,
    },
];


//Mobile Card — only the active one is rendered
const MobileReviews = ({ reviews }: { reviews: any[] }) => {
    const [current, setCurrent] = useState(0);
    const total = reviews.length;
    const review = reviews[current];

    const prev = () => setCurrent((c) => (c - 1 + total) % total);
    const next = () => setCurrent((c) => (c + 1) % total);

    /* touch / swipe */
    const touchStartX = useRef<number | null>(null);
    const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
    const onTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (diff > 40) next();
        else if (diff < -40) prev();
        touchStartX.current = null;
    };

    if (!review) return null;

    const name = review.CustName || review.name || review.subtitle || '';
    const title = review.Title || review.title || '';
    const text = review.Review || review.text || review.description || review.reviewText || '';
    const imageSrc = review.image || review.imageUrl || review.bannerImage || review.bannerImage1 || `${PREFIX}/images/subcategory/b2.jpg`;

    return (
        <div
            className="w-full flex flex-col items-center"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            {/* Card */}
            <div className="w-full max-w-sm mx-auto">
                <div className="relative bg-[#F9F9F9] rounded-2xl p-6 pt-28 pb-10 text-center shadow-lg">
                    {/* Top Image */}
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[85%] h-52 rounded-2xl overflow-hidden border-4 border-white shadow-sm z-10">
                        <Image
                            src={imageSrc}
                            alt={name}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>

                    <h3 className="text-[18px] font-serif font-bold text-gray-900 mb-3  h-[27px]">{title}</h3>
                    <p className="text-[13px] text-gray-500 font-jakarta font-light leading-relaxed min-h-[78px]">{text}</p>

                    <div className="mt-6">
                        <p className="font-bold text-gray-900 text-[13px] mb-1.5 font-jakarta uppercase tracking-wider">{name}</p>
                        <div className="flex justify-center space-x-1 text-[#EBC07E]">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={12} fill="currentColor" className="text-[#EBC07E]" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Dot indicators */}
            <div className="flex space-x-2 mt-8">
                {reviews.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${i === current ? 'bg-[#013D3D] w-5' : 'bg-gray-300'}`}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

//Desktop Slider — react-slick with centerMode
const DesktopReviews = ({ reviews }: { reviews: any[] }) => {
    const sliderRef = useRef<Slider | null>(null);

    const settings = {
        dots: false,
        infinite: reviews.length > 1,
        speed: 1000,
        slidesToShow: Math.min(3, reviews.length),
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        arrows: false,
        centerMode: reviews.length >= 3,
        centerPadding: '0',
        focusOnSelect: true,
        initialSlide: 0,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: Math.min(2, reviews.length),
                    centerMode: false,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    centerMode: false,
                }
            }
        ]
    };

    return (
        <div className="relative px-12 category-slider">
            <style jsx global>{`
                .category-slider .slick-list { overflow: visible !important; }
                .category-slider .slick-slide { transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1); opacity: 1; transform: scale(0.85); }
                .category-slider .slick-slide.slick-center { opacity: 1; transform: scale(1.15); z-index: 10; }
                .category-slider .slick-slide.slick-center .review-card { 
                    box-shadow: 0 20px 50px -15px rgba(0,0,0,0.08); 
                    padding-top: 7rem; 
                    padding-bottom: 2.5rem;
                    background-color: #F8FAFA;
                }
                .category-slider .review-card {
                    background-color: #F4F7F7;
                    padding-top: 2.5rem;
                    padding-bottom: 6.5rem;
                }
                .category-slider .top-image-wrapper { display: none; }
                .category-slider .bottom-image-wrapper { display: block; }
                .category-slider .slick-slide.slick-center .top-image-wrapper { display: block; }
                .category-slider .slick-slide.slick-center .bottom-image-wrapper { display: none; }
                .category-slider .slick-slide.slick-center .text-content { margin-top: 1.5rem; }
            `}</style>

            {/* Arrows */}
            <button
                onClick={() => sliderRef.current?.slickPrev()}
                className="absolute -left-10 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center border border-gray-100 hover:bg-[#013D3D] hover:text-white transition-all shadow-md group"
                aria-label="Previous slide"
            >
                <svg className="w-6 h-6 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button
                onClick={() => sliderRef.current?.slickNext()}
                className="absolute -right-10 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center border border-gray-100 hover:bg-[#013D3D] hover:text-white transition-all shadow-md group"
                aria-label="Next slide"
            >
                <svg className="w-6 h-6 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
                </svg>
            </button>

            <Slider ref={sliderRef} {...settings}>
                {reviews.map((review: any, idx: number) => {
                    const name = review.CustName || review.name || review.subtitle || '';
                    const title = review.Title || review.title || '';
                    const text = review.Review || review.text || review.description || review.reviewText || '';
                    const imageSrc = review.image || review.imageUrl || review.bannerImage || review.bannerImage1 || `${PREFIX}/images/subcategory/b2.jpg`;

                    return (
                        <div key={idx} className="px-6 pb-24 pt-24">
                            <div className="review-card relative rounded-2xl p-8 text-center flex flex-col items-center transition-all duration-700">
                                {/* TOP Image - Only visible for Center Slide */}
                                <div className="top-image-wrapper absolute -top-12 left-1/2 -translate-x-1/2 w-52 h-44 rounded-2xl overflow-hidden border-4 border-white shadow-md z-10">
                                    <Image src={imageSrc} alt={name} fill className="object-cover" unoptimized />
                                </div>

                                <div className="text-content">
                                    <h3 className="text-[17px] md:text-[20px] font-serif font-bold text-gray-900 mb-3 tracking-tight h-[28px]">{title}</h3>
                                    <p className="text-[13px] md:text-[14.5px] text-gray-500 font-jakarta font-normal leading-relaxed max-w-[280px] min-h-[88px]">{text}</p>
                                </div>

                                <div className="mt-6">
                                    <p className="font-bold text-gray-900 text-[14px] mb-2 font-jakarta">{name}</p>
                                    <div className="flex justify-center space-x-1.5 text-[#EBC07E]">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={13} fill="currentColor" className="text-[#EBC07E]" />
                                        ))}
                                    </div>
                                </div>

                                {/* BOTTOM Image - Visible for Side Slides */}
                                <div className="bottom-image-wrapper absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-md z-10">
                                    <Image src={imageSrc} alt="Detail View" fill className="object-cover" unoptimized />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </Slider>
        </div>
    );
};

/* ─────────────────────────────────────────────
   Main Component — renders Mobile or Desktop
   ───────────────────────────────────────────── */
const CategoryReviews = ({ wordsOfTrust }: { wordsOfTrust?: any[] }) => {
    if (!wordsOfTrust || !Array.isArray(wordsOfTrust) || wordsOfTrust.length === 0) {
        return null;
    }

    return (
        <section className="py-10 px-6 md:px-12 bg-white overflow-hidden relative">
            <div className=" mx-auto">
                <div className="text-center mb-20 md:mb-10">
                    <h2 className="text-3xl md:text-[32px] font-jakarta font-medium text-[#1A1A1A] uppercase tracking-[0.2em]">WORDS OF TRUST</h2>
                </div>

                <div className="block sm:hidden">
                    <MobileReviews reviews={wordsOfTrust || []} />
                </div>
                <div className="hidden sm:block">
                    <DesktopReviews reviews={wordsOfTrust || []} />
                </div>
            </div>
        </section>
    );
};

export default CategoryReviews;
