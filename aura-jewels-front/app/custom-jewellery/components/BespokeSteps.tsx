'use client';

import React from 'react';

export default function BespokeSteps() {
    const steps = [
        {
            num: 1,
            title: 'Share Your Inspiration',
            desc: 'Upload images, videos, or links that best represent your desired design.',
        },
        {
            num: 2,
            title: 'Tell Us Your Requirements',
            desc: 'Select your preferred jewellery type, metal, size, engraving, and estimated budget.',
        },
        {
            num: 3,
            title: 'Design Consultation',
            desc: 'Our jewellery experts will review your request and contact you to discuss design details, pricing, and timelines.',
        },
        {
            num: 4,
            title: 'Crafting Your Masterpiece',
            desc: 'Once approved, our artisans begin creating your bespoke jewellery with exceptional precision and care.',
        },
    ];

    return (
        <div className="w-full bg-[#FAF9F6] py-16 md:py-20 px-6 md:px-12">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="font-el-messiri text-3xl md:text-4xl text-[#B57A5A] font-normal mb-4">
                        How It Works
                    </h2>
                    <p className="text-xs uppercase tracking-[0.3em] font-semibold text-[#C5A880] font-dm-sans mb-3">
                        Our seamless digital bespoke luxury experience brings the master atelier directly to you in four steps.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {steps.map((step) => (
                        <div
                            key={step.num}
                            className="bg-white border border-stone-200/60 p-8 pt-12 relative flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 min-h-[220px]"
                        >
                            {/* Small Step Indicator Top-Left */}
                            <div className="absolute top-6 left-6 w-8 h-8 bg-[#B57A5A] flex items-center justify-center text-white text-xs font-bold font-dm-sans rounded-[2px]">
                                {step.num}
                            </div>

                            {/* Large Watermark Number Bottom-Right */}
                            <div className="absolute -bottom-6 -right-2 text-[10rem] font-el-messiri font-normal text-stone-100 select-none pointer-events-none leading-none opacity-85">
                                {step.num}
                            </div>

                            {/* Content */}
                            <div className="relative z-10 mt-6 space-y-3">
                                <h3 className="font-el-messiri text-lg text-[#1A1A1A] font-medium leading-snug">
                                    {step.title}
                                </h3>
                                <p className="text-[13px] font-dm-sans font-light text-stone-500 leading-relaxed pr-4">
                                    {step.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
