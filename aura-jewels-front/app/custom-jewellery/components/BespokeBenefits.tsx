'use client';

import React from 'react';
import { Sparkles, Award, ShieldCheck, UserCheck, Hammer, Truck } from 'lucide-react';

export default function BespokeBenefits() {
    const benefits = [
        {
            icon: Sparkles,
            title: 'Completely Custom Designed',
            desc: 'Crafted explicitly from zero, ensuring absolute unique status.',
        },
        {
            icon: Award,
            title: 'Certified Diamonds',
            desc: 'Every diamond is certified authentic, conflict-free, and custom-graded.',
        },
        {
            icon: ShieldCheck,
            title: 'BIS Hallmarked Gold',
            desc: 'Stamped with sovereign assays certifying authentic metal purity.',
        },
      
        {
            icon: Hammer,
            title: 'Handcrafted by Master Artisans',
            desc: 'Forged item-by-item with fine tools in our bespoke laboratory.',
        },
        {
            icon: Truck,
            title: 'Secure & Insured Delivery',
            desc: 'Fully insured, secure courier delivery.',
        },
    ];

    return (
        <div className="space-y-10">
            {/* Header info */}
            <div className="space-y-4">
                <h2 className="font-el-messiri text-4xl text-[#1A1A1A] font-normal leading-tight">
                    Bespoke Jewellery Request Form
                </h2>
                <p className="text-[13px] font-dm-sans font-light text-stone-500 leading-relaxed max-w-md">
                    Please build, refine and adjust all the specifications below. Our custom creation team will review, price, and provide a secure consultation setup tailored exactly around your timeline and vision.
                </p>
            </div>

            {/* Why Choose Us Card */}
            <div className="bg-[#FAF9F6] border border-stone-200/50 p-8 rounded-sm space-y-6 shadow-sm">
                <h3 className="font-el-messiri text-lg text-[#B57A5A] font-medium border-b border-stone-200 pb-3">
                    Why Choose Our Bespoke Service?
                </h3>
                <div className="space-y-5">
                    {benefits.map((b, idx) => {
                        const IconComponent = b.icon;
                        return (
                            <div key={idx} className="flex gap-4 items-start">
                                <div className="p-2 bg-[#B57A5A]/5 rounded-sm text-[#B57A5A] shrink-0 mt-0.5">
                                    <IconComponent className="w-4 h-4" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-dm-sans font-semibold text-[13px] text-[#1A1A1A]">
                                        {b.title}
                                    </h4>
                                    <p className="font-dm-sans font-light text-xs text-stone-500 leading-normal">
                                        {b.desc}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
