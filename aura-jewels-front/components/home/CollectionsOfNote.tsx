'use client';

import React from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';
import Link from 'next/link';

const CollectionsOfNote: React.FC<{ collectionsOfNoteData: any; info?: any }> = ({ collectionsOfNoteData, info }) => {
    const heading = info?.heading;
    const subText = info?.subText;

    const items = collectionsOfNoteData || [];
    if (items.length === 0) return null;

    // Swap items to match mockup layout: Left is Bracelet (items[1]), Right is Ring (items[0])
    const leftItem = items.length > 1 ? items[1] : items[0];
    const rightItem = items.length > 1 ? items[0] : null;

    return (
        <section className="relative py-10 sm:py-12 md:py-20 lg:py-28 px-4 sm:px-8 md:px-10 lg:px-16 mx-auto bg-white overflow-hidden select-none">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
                {/* Concentric Circle Pattern */}
                <div className="absolute top-[18%] sm:top-[22%] md:top-[20%] left-[50%] md:left-[47%] -translate-x-1/2 -translate-y-1/2 w-[220px] sm:w-[280px] md:w-[320px] lg:w-[360px] aspect-square opacity-35 sm:opacity-45 md:opacity-60">
                    <Image
                        src="/images/Aura Jewels/Decorative Elements/Decoration-1.png"
                        alt="Decorative Target Circles"
                        fill
                        unoptimized
                        className="object-contain"
                    />
                </div>

                {/* Decorative Wave Line Left */}
                <div className="absolute left-0 top-[38%] w-[48vw] h-[180px] sm:h-[200px] md:h-[240px] opacity-20 sm:opacity-25 md:opacity-35">
                    <Image
                        src="/images/Aura Jewels/Decorative Elements/Decoration-2.png"
                        alt="Decorative Wave"
                        fill
                        unoptimized
                        className="object-contain object-left"
                    />
                </div>

                {/* Decorative Wave Line Right */}
                <div className="absolute right-0 bottom-[18%] w-[45vw] h-[180px] sm:h-[200px] md:h-[260px] opacity-20 sm:opacity-25 md:opacity-35">
                    <Image
                        src="/images/Aura Jewels/Decorative Elements/Decoration-3.png"
                        alt="Decorative Waves"
                        fill
                        unoptimized
                        className="object-contain object-right"
                    />
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto relative z-10">
                {/* Main Content Grid */}
                <div className="grid grid-cols-12 gap-y-10 gap-x-4 sm:gap-6 md:gap-8 lg:gap-12 items-stretch mt-1 sm:mt-2">
                    {/* Left Column (Heading + Left Card) */}
                    <div className="col-span-12 md:col-span-6 flex flex-col justify-between">
                        {/* Heading Section */}
                        <div className="block mb-6 md:mb-8 lg:mb-14">
                            <span className="text-[10px] min-[370px]:text-[11px] lg:text-[12px] tracking-[0.35em] uppercase font-bold text-stone-500 font-instrument-sans block mb-3">
                                {heading || "TIMELESS COLLECTION"}
                            </span>
                            <h2 className="text-xl min-[450px]:text-2xl md:text-3xl lg:text-[34px] xl:text-[36px] leading-[1.3] text-[#1A1A1A] font-cormorant-garamond font-light mb-4 min-[640px]:mb-6 lg:mb-8">
                                {subText || "We Design And Create Custom Jewels Tailored To Your Unique Vision."}
                            </h2>
                            <Link
                                href={info?.buttonlink || "#"}
                                className="inline-block bg-[#A96D56] hover:bg-[#965a45] text-white px-3 min-[370px]:px-4 min-[640px]:px-6 lg:px-7 py-2 min-[640px]:py-3 text-[9px] min-[370px]:text-[10px] min-[640px]:text-[11px] font-semibold tracking-widest uppercase transition-all duration-300 font-instrument-sans rounded-none shadow-xs w-fit"
                            >
                                {info?.buttontext || "View Collection"}
                            </Link>
                        </div>

                        {/* Left Card */}
                        <Link
                            href={leftItem?.buttonlink1 || "#"}
                            className="group block w-full mt-2 lg:mt-6 max-w-full md:max-w-[95%] lg:max-w-[90%] mx-auto md:mx-0"
                        >
                            <div className="aspect-[4/5] w-full relative overflow-hidden bg-stone-50 border border-stone-100 shadow-xs rounded-xs">
                                <Image
                                    src={getImageUrl(leftItem?.image)}
                                    alt={leftItem?.title || "Collection Item"}
                                    fill
                                    unoptimized
                                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>
                            <h3 className="text-center text-lg sm:text-xl md:text-[22px] lg:text-[24px] font-cormorant-garamond font-normal text-[#1A1A1A] mt-2.5 sm:mt-3 md:mt-5 transition-colors group-hover:text-[#A96D56]">
                                {leftItem?.title}
                            </h3>
                        </Link>
                    </div>

                    {/* Right Column (Right Card + Dot matrix) */}
                    {rightItem && (
                        <div className="col-span-12 md:col-span-6 flex flex-col justify-between pt-4 md:pt-6">
                            {/* Right Card */}
                            <Link
                                href={rightItem?.buttonlink1 || "#"}
                                className="group block w-full max-w-full md:max-w-[95%] lg:max-w-[90%] mx-auto md:ml-auto"
                            >
                                <div className="aspect-[4/5] w-full relative overflow-hidden bg-stone-50 border border-stone-100 shadow-xs rounded-xs">
                                    <Image
                                        src={getImageUrl(rightItem?.image)}
                                        alt={rightItem?.title || "Collection Item"}
                                        fill
                                        unoptimized
                                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                        sizes="50vw"
                                    />
                                </div>
                                <h3 className="text-center text-lg sm:text-xl md:text-[22px] lg:text-[24px] font-cormorant-garamond font-normal text-[#1A1A1A] mt-2.5 sm:mt-3 md:mt-5 transition-colors group-hover:text-[#A96D56]">
                                    {rightItem?.title}
                                </h3>
                            </Link>

                            {/* Dot Matrix Pattern */}
                            <div className="flex justify-center mt-6 lg:mt-12 opacity-35">
                                <svg width="220" height="40" viewBox="0 0 220 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <pattern id="dot-pattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                                        <circle cx="2" cy="2" r="1.5" fill="#A96D56" />
                                    </pattern>
                                    <rect width="220" height="40" fill="url(#dot-pattern)" />
                                </svg>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default CollectionsOfNote;
