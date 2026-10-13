'use client';

import React from 'react';
import Image from 'next/image';
import { PREFIX } from '@/lib/constants';

const DiamondHub: React.FC = () => {
    return (
        <section className="py-24 bg-[#FDFBF7] border-y border-[#F5ECE0]">
            <div className=" mx-auto px-6 md:px-12">
                <div className="mb-20">
                    <p className="text-[11px] uppercase tracking-[0.4em] text-[#A96D56] font-bold mb-4 font-jakarta">
                        The Diamond Hub
                    </p>
                    <h2 className="text-4xl md:text-6xl serif leading-tight max-w-2xl">
                        Fine Diamond Jewelry.
                    </h2>
                    <div className="w-16 h-[1px] bg-[#A96D56] mt-8"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">

                    {/* Natural Diamond Jewelry */}
                    <div className="group relative overflow-hidden bg-white border border-[#F5ECE0] flex flex-col md:flex-row min-h-[500px] shadow-sm">
                        <div className="w-full md:w-1/2 overflow-hidden order-1 md:order-2 relative">
                            <Image
                                src={`${PREFIX}/images/Natural-diamond.png`}
                                alt="Natural Diamond Jewelry"
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>

                        <div className="w-full md:w-1/2 p-12 lg:p-14 flex flex-col justify-center order-2 md:order-1">
                            <span className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold mb-4 font-jakarta">
                                Timeless Heritage
                            </span>

                            <h3 className="text-3xl serif mb-6">
                                Natural Diamond Jewelry
                            </h3>

                            <p className="text-[15px] text-gray-500 mb-10 leading-relaxed font-jakarta font-light">
                                Handcrafted rings, pendants, and earrings featuring natural diamonds formed over billions of years  designed for those who value rarity, tradition, and enduring beauty.
                            </p>

                            <span className="w-fit text-[11px] uppercase font-bold tracking-[0.2em] border-b border-black pb-2 font-jakarta cursor-pointer">
                                Explore Jewelry
                            </span>
                        </div>
                    </div>

                    {/* Lab-Grown Diamond Jewelry */}
                    <div className="group relative overflow-hidden bg-white border border-[#F5ECE0] flex flex-col md:flex-row min-h-[500px] shadow-sm">
                        <div className="w-full md:w-1/2 overflow-hidden order-1 relative">
                            <Image
                                src={`${PREFIX}/images/Lab-diamond.png`}
                                alt="Lab Grown Diamond Jewelry"
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>

                        <div className="w-full md:w-1/2 p-12 lg:p-14 flex flex-col justify-center order-2">
                            <span className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold mb-4 font-jakarta">
                                Modern Luxury
                            </span>

                            <h3 className="text-3xl serif mb-6">
                                Lab-Grown Diamond Jewelry
                            </h3>

                            <p className="text-[15px] text-gray-500 mb-10 leading-relaxed font-jakarta font-light">
                                Contemporary diamond jewelry created with advanced technology  offering exceptional brilliance, ethical sourcing, and remarkable value for today’s conscious buyer.
                            </p>

                            <span className="w-fit text-[11px] uppercase font-bold tracking-[0.2em] border-b border-black pb-2 font-jakarta cursor-pointer">
                                Shop Lab Jewelry
                            </span>
                        </div>
                    </div>

                </div>
            </div>
        </section>

    );
};

export default DiamondHub;
