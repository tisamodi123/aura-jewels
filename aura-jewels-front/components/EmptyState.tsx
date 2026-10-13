'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon, ShoppingBag } from 'lucide-react';

interface EmptyStateProps {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    buttonLink?: string;
    icon?: LucideIcon;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    title = "YOUR SELECTION IS EMPTY",
    subtitle = "Browse our inventory to add jewelry to your selection for inquiry.",
    buttonText = "CONTINUE SHOPPING",
    buttonLink = "/all",
    icon: Icon = ShoppingBag
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            {/* Circular Icon Container */}
            <div className="w-24 h-24 md:w-32 md:h-32 bg-[#F5F5F5] rounded-full flex items-center justify-center mb-10 transition-transform hover:scale-105 duration-500">
                <Icon
                    size={40}
                    strokeWidth={1}
                    className="text-[#999999]"
                />
            </div>

            {/* Title */}
            <h2 className="text-[24px] md:text-[32px] font-serif mb-4 tracking-[0.05em] text-[#1A1A1A] uppercase">
                {title}
            </h2>

            {/* Subtitle */}
            <p className="text-[14px] md:text-[16px] text-[#666666] max-w-[450px] mb-12 leading-relaxed">
                {subtitle}
            </p>

            {/* Button */}
            <Link
                href={buttonLink}
                className="inline-block bg-[#A96D56] text-white px-12 py-4 text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-[#A96D56] transition-all duration-300 shadow-sm hover:shadow-lg transform hover:-translate-y-0.5"
            >
                {buttonText}
            </Link>
        </div>
    );
};

export default EmptyState;
