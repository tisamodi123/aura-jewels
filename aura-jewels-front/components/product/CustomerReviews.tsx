'use client';

import React, { useState, useEffect } from 'react';

// Gold Star component
const GoldStar = () => (
    <svg className="w-3.5 h-3.5 text-amber-500 fill-current" viewBox="0 0 24 24">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
);

// Verified badge component
const VerifiedBadge = () => (
    <span className="inline-flex items-center gap-1">
        <svg className="w-3.5 h-3.5 text-green-600 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
        <span className="text-[9.5px] text-gray-500 font-jakarta font-semibold uppercase tracking-wider">Verified Buyer</span>
    </span>
);

interface Review {
    id: number;
    rating: number;
    text: string;
    author: string;
    date: string;
    verified: boolean;
}

const REVIEWS_DATA: Review[] = [
    {
        id: 1,
        rating: 5,
        text: "Stunning ring! The craftsmanship is exceptional the diamond sparkle beautifully. Packaging was premium and delivery was on time.",
        author: "Priya S.",
        date: "2 days ago",
        verified: true
    },
    {
        id: 2,
        rating: 5,
        text: "Absolutely in love with my ring. The customization process was smooth and the final piece is beyond my expectations.",
        author: "Rahul Mehta",
        date: "1 week ago",
        verified: true
    },
    {
        id: 3,
        rating: 5,
        text: "The quality and shine are amazing. Highly recommended for anyone looking for a luxurious ring.",
        author: "Ananya K.",
        date: "2 weeks ago",
        verified: true
    },
    {
        id: 4,
        rating: 5,
        text: "Exceptional diamond quality. The Aura Jewels team walked me through every customization option patiently.",
        author: "Vikram R.",
        date: "3 weeks ago",
        verified: true
    },
    {
        id: 5,
        rating: 5,
        text: "Outstanding customer service and a gorgeous presentation box. It was the perfect anniversary gift.",
        author: "Meera Patel",
        date: "1 month ago",
        verified: true
    },
    {
        id: 6,
        rating: 5,
        text: "Breathtaking design. The band is smooth, comfortable, and the stone has unbelievable fire.",
        author: "Sneha G.",
        date: "1 month ago",
        verified: true
    }
];

const RATINGS_DISTRIBUTION = [
    { stars: 5, count: 277, percentage: 84 },
    { stars: 4, count: 30, percentage: 9 },
    { stars: 3, count: 16, percentage: 5 },
    { stars: 2, count: 4, percentage: 1 },
    { stars: 1, count: 1, percentage: 0.3 }
];

export default function CustomerReviews() {
    const [activePage, setActivePage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(3);
    const [transitioning, setTransitioning] = useState(false);

    useEffect(() => {
        const updateItemsPerPage = () => {
            if (window.innerWidth >= 1024) {
                setItemsPerPage(3);
            } else if (window.innerWidth >= 640) {
                setItemsPerPage(2);
            } else {
                setItemsPerPage(1);
            }
        };

        updateItemsPerPage();
        window.addEventListener('resize', updateItemsPerPage);
        return () => window.removeEventListener('resize', updateItemsPerPage);
    }, []);

    const totalPages = Math.ceil(REVIEWS_DATA.length / itemsPerPage);

    useEffect(() => {
        if (activePage >= totalPages) {
            setActivePage(Math.max(0, totalPages - 1));
        }
    }, [itemsPerPage, totalPages, activePage]);

    const handlePageChange = (index: number) => {
        setTransitioning(true);
        setTimeout(() => {
            setActivePage(index);
            setTransitioning(false);
        }, 150);
    };

    const displayedReviews = REVIEWS_DATA.slice(
        activePage * itemsPerPage,
        (activePage + 1) * itemsPerPage
    );

    const handleWriteReview = () => {
        alert("Thank you for your interest! The review system is currently in preview mode.");
    };

    return (
        <section className="w-full py-10 md:py-16 border-t border-gray-100 max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
            <div className="border border-gray-150/80 rounded-lg bg-white p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 shadow-[0_2px_15px_rgba(0,0,0,0.015)]">
                {/* Column 1: Review Ratings Summary */}
                <div className="w-full md:w-[260px] flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-150/80 pb-6 md:pb-0 md:pr-6 lg:pr-8 flex flex-col justify-between">
                    <div>
                        <h4 className="text-[11px] font-extrabold text-gray-905 tracking-widest uppercase font-jakarta">
                            CUSTOMER REVIEWS
                        </h4>
                        
                        <div className="flex items-center gap-3.5 mt-4">
                            <span className="text-4xl font-serif text-[#1C1C1C] leading-none">4.9</span>
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <GoldStar key={i} />
                                    ))}
                                </div>
                                <span className="text-[11px] text-gray-400 font-jakarta">Based on 328 reviews</span>
                            </div>
                        </div>

                        {/* Distribution ratings bars */}
                        <div className="space-y-2 mt-6">
                            {RATINGS_DISTRIBUTION.map((dist) => (
                                <div key={dist.stars} className="flex items-center gap-2 text-[11px] text-gray-500 font-jakarta">
                                    <span className="w-3 text-center font-bold text-gray-700">{dist.stars}</span>
                                    <span className="text-[9px] text-gray-400">★</span>
                                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-amber-500 rounded-full transition-all duration-500"
                                            style={{ width: `${dist.percentage}%` }}
                                        />
                                    </div>
                                    <span className="w-8 text-right text-gray-400 font-medium">({dist.count})</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleWriteReview}
                        className="w-full mt-6 border border-[#013D3D] text-[#013D3D] hover:bg-[#013D3D] hover:text-white transition-all py-2 rounded-lg text-[11px] font-extrabold tracking-wider font-jakarta uppercase"
                    >
                        WRITE A REVIEW
                    </button>
                </div>

                {/* Columns 2-4: Interactive reviews slider */}
                <div className="flex-grow flex flex-col justify-between min-w-0">
                    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full flex-grow transition-opacity duration-150 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
                        {displayedReviews.map((review) => (
                            <div
                                key={review.id}
                                className="flex flex-col justify-between h-full pr-0 sm:pr-6 border-b sm:border-b-0 sm:border-r border-gray-150/60 last:border-r-0 last:pr-0 pb-6 sm:pb-0 last:pb-0 last:border-b-0"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(review.rating)].map((_, i) => (
                                            <GoldStar key={i} />
                                        ))}
                                    </div>
                                    <p className="text-[12px] md:text-[13px] text-gray-600 font-jakarta leading-relaxed font-normal">
                                        {review.text}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-150/40">
                                    <div className="flex items-center gap-3">
                                        {/* Avatar Fallback with Premium Aura Jewels Branding look */}
                                        <div className="w-[36px] h-[36px] rounded-full bg-[#f4ebe1] text-[#013D3D] flex items-center justify-center font-extrabold text-[12px] uppercase tracking-wide border border-gray-150/20 shadow-xs flex-shrink-0">
                                            {review.author.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[12px] font-bold text-gray-900 font-jakarta leading-tight">
                                                {review.author}
                                            </span>
                                            <VerifiedBadge />
                                        </div>
                                    </div>
                                    <span className="text-[11px] text-gray-400 font-medium font-jakarta">
                                        {review.date}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Navigation bar with Slider Dots & View All */}
                    <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-150/40">
                        <div className="flex-1 hidden sm:block" />

                        <div className="flex items-center gap-2 flex-grow sm:flex-grow-0 justify-center">
                            {Array.from({ length: totalPages }).map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handlePageChange(idx)}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                        idx === activePage
                                            ? 'bg-[#013D3D] w-4'
                                            : 'bg-gray-250 hover:bg-gray-400'
                                    }`}
                                    aria-label={`Go to page ${idx + 1}`}
                                />
                            ))}
                        </div>

                        <div className="flex-1 flex justify-end">
                            <button className="text-[11px] font-extrabold text-[#013D3D] hover:text-black uppercase tracking-widest font-jakarta flex items-center gap-1.5 transition-all whitespace-nowrap">
                                View All Reviews <span className="text-[12.5px] font-bold">→</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
