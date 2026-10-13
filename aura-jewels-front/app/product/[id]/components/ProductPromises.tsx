'use client';

import React from 'react';
import Link from 'next/link';
import { Promises } from '@/components/commonts/constVariable';
import CommonSlider from '@/components/common/CommonSlider';

export default function ProductPromises() {
    return (
        <section className="bg-gray-50 border-b border-t border-gray-100 w-full md:mt-0">
            <div className="mx-auto px-6 md:px-12 py-12 md:py-9">
                {/* Desktop Grid Layout */}
                {/* <div className="hidden lg:grid lg:grid-cols-5 gap-8 lg:gap-0">
                    {Promises.map((promise, idx) => (
                        <Link key={idx} href={`${promise.slug}`} className={`flex items-start gap-4 lg:gap-5 cursor-pointer group ${idx !== 0 ? 'lg:border-l lg:border-gray-200 lg:pl-6 xl:pl-8' : ''} ${idx !== Promises.length - 1 ? 'lg:pr-6 xl:pr-8' : ''}`}>
                            <div className="flex-shrink-0 w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-[#013D3D]/5 flex items-center justify-center text-[#013D3D] group-hover:bg-[#013D3D] group-hover:text-white transition-all duration-300">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d={promise.icon} />
                                </svg>
                            </div>
                            <div className="flex-1 mt-1">
                                <h4 className="el-messiri text-[15px] lg:text-[16px] xl:text-[17px] text-[#1A1A1A] font-semibold mb-1.5 leading-tight">{promise.title}</h4>
                                <p className="text-gray-600 text-[12px] lg:text-[13px] leading-[1.6] font-jakarta">{promise.sub}</p>
                            </div>
                        </Link>
                    ))}
                </div> */}

                {/* Mobile Swiper Layout */}
                <div className="lg:hidden">
                    <CommonSlider
                        items={Promises}
                        renderItem={(promise) => (
                            <Link href={`/policies/${promise.slug}`} className="flex flex-col items-center text-center gap-4 px-2 cursor-pointer group block">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#013D3D]/5 flex items-center justify-center text-[#013D3D] group-hover:bg-[#013D3D] group-hover:text-white transition-all duration-300">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d={promise.icon} />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-serif text-[14px] text-[#1A1A1A] font-semibold mb-1 leading-tight">{promise.title}</h4>
                                    <p className="text-gray-600 text-[11px] leading-tight font-jakarta">{promise.sub}</p>
                                </div>
                            </Link>
                        )}
                        spaceBetween={20}
                        slidesPerView={2}
                        breakpoints={{
                            768: { slidesPerView: 3 },
                            766: { slidesPerView: 2 }
                        }}
                        className="w-full"
                    />
                </div>
            </div>
        </section>
    );
}
