'use client';

import React from 'react';
import { PREFIX } from '@/lib/constants';

const BespokeCTA: React.FC = () => {
    return (
        <section className="py-24 relative overflow-hidden bg-[#1A1A1A] text-white">
            {/* Background Video */}
            <video
                autoPlay
                loop
                muted
                playsInline
                poster={`${PREFIX}/images/Jewellery-Design.png`}
                className="absolute inset-0 w-full h-full object-cover opacity-60"
            >
                <source src={`${PREFIX}/videos/design.mp4`} type="video/mp4" />
            </video>

            {/* Overlay to ensure legibility */}
            <div className="absolute inset-0 " />
            <div className=" mx-auto px-6 md:px-12 flex flex-col items-center text-center relative z-10">
                <h2 className="text-5xl md:text-5xl serif leading-tight py-10">Finest Handmade.</h2>
            </div>
        </section>
    );
};

export default BespokeCTA;
