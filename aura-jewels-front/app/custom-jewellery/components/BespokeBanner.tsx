'use client';

import React from 'react';
import Image from 'next/image';

export default function BespokeBanner() {
    return (
        <div className="w-full bg-[#B57A5A] text-white py-16 md:py-20 px-6 md:px-12 lg:px-24">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
                {/* Left Side: Content */}
                <div className="md:col-span-7 space-y-6">
                    <span className="block text-xs uppercase tracking-[0.4em] font-semibold text-[#C5A880] font-dm-sans">
                        The Bespoke Atelier
                    </span>
                    <h1 className="font-el-messiri text-4xl md:text-5xl lg:text-6xl font-normal leading-tight">
                        Design Your Dream Jewellery
                    </h1>
                    <div className="space-y-4 text-stone-200 font-dm-sans font-light text-sm md:text-base leading-relaxed max-w-2xl">
                        <p>
                            Every masterpiece begins with an idea. Whether you have a sketch, a photograph, a Pinterest link, or simply an inspiration, our expert designers will transform your vision into an exquisite piece of fine jewellery crafted exclusively for you.
                        </p>
                        <p>
                            From timeless engagement rings to one-of-a-kind heirloom pieces, we combine exceptional craftsmanship, certified diamonds, and premium precious metals to create jewellery that is uniquely yours.
                        </p>
                    </div>
                </div>

                {/* Right Side: Image with elegant border/shadow */}
                <div className="md:col-span-5 flex justify-center md:justify-end">
                    <div className="relative w-full max-w-[450px] aspect-[4/3] rounded-sm overflow-hidden border border-white/20 p-2 bg-white/5 shadow-2xl">
                        <div className="relative w-full h-full rounded-sm overflow-hidden">
                            <Image
                                src="/images/Jewellery-Design.png"
                                alt="Bespoke Jewellery Design"
                                fill
                                className="object-cover"
                                sizes="(max-w-768px) 100vw, 400px"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
