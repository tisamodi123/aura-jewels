'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl } from '@/lib/utils';

const BespokeExperience: React.FC<{ bespokeExperienceData?: any }> = ({ bespokeExperienceData }: any) => {
    const title = bespokeExperienceData?.title || "Build Your Perfect Ring";
    const subTitle = bespokeExperienceData?.subTitle;
    const description = bespokeExperienceData?.description;
    const imageSrc = getImageUrl(bespokeExperienceData?.image);
    const buttonText1 = bespokeExperienceData?.buttontext1;
    const buttonLink1 = bespokeExperienceData?.buttonlink1;
    const buttonText2 = bespokeExperienceData?.buttontext2;
    const buttonLink2 = bespokeExperienceData?.buttonlink2;

    return (
        <section className="w-full flex flex-row min-h-[300px] min-[370px]:min-h-[360px] md:min-h-[500px] lg:min-h-[550px] bg-white">
            {/* Left Side: Content Column with terracotta background */}
            <div className="w-1/2 bg-[#A96D56] p-2 min-[370px]:p-3.5 md:p-10 lg:p-14 xl:p-16 py-5 min-[370px]:py-8 md:py-12 flex flex-col justify-center relative min-h-[260px] min-[370px]:min-h-auto">
                {/* Thin inset border line */}
                <div className="absolute inset-1.5 min-[370px]:inset-2.5 md:inset-6 lg:inset-8 border border-white/25 pointer-events-none"></div>

                <div className="relative z-10 px-0.5 min-[370px]:px-1 md:px-6 text-white space-y-2 lg:space-y-6 my-auto">
                    {subTitle && (
                        <p className="text-[8px] min-[370px]:text-[9.5px] md:text-[11px] uppercase tracking-[0.2em] min-[370px]:tracking-[0.3em] text-white/80 font-semibold font-instrument-sans">
                            {subTitle}
                        </p>
                    )}

                    <h2 className="text-xs min-[370px]:text-[15px] md:text-[28px] lg:text-[36px] xl:text-[40px] leading-[1.25] font-cormorant-garamond font-light max-w-lg">
                        {title}
                    </h2>

                    {description && (
                        <div className="space-y-4 max-w-md">
                            <p className="text-[8.5px] min-[370px]:text-[10px] md:text-[13px] lg:text-[14px] leading-relaxed font-instrument-sans font-light text-white/95 whitespace-pre-line">
                                {description}
                            </p>
                        </div>
                    )}

                    {/* Side-by-Side Buttons */}
                    <div className="flex flex-row flex-wrap gap-1 min-[370px]:gap-2 pt-1 min-[370px]:pt-3 items-start">
                        {buttonText1 && (
                            <Link
                                href={buttonLink1 || "#"}
                                className="border border-white bg-transparent hover:bg-white hover:text-[#A96D56] text-white px-1.5 min-[370px]:px-2.5 md:px-5 lg:px-7 py-1 min-[370px]:py-2 rounded-none font-instrument-sans text-[7.5px] min-[370px]:text-[8.5px] md:text-[11px] font-semibold tracking-tighter min-[370px]:tracking-tight md:tracking-wide uppercase transition-all duration-300 inline-block text-center whitespace-normal md:whitespace-nowrap w-full min-[370px]:w-fit"
                            >
                                {buttonText1}
                            </Link>
                        )}
                        {buttonText2 && (
                            <Link
                                href={buttonLink2 || "#"}
                                className="border border-white bg-transparent hover:bg-white hover:text-[#A96D56] text-white px-1.5 min-[370px]:px-2.5 md:px-5 lg:px-7 py-1 min-[370px]:py-2 rounded-none font-instrument-sans text-[7.5px] min-[370px]:text-[8.5px] md:text-[11px] font-semibold tracking-tighter min-[370px]:tracking-tight md:tracking-wide uppercase transition-all duration-300 inline-block text-center whitespace-normal md:whitespace-nowrap w-full min-[370px]:w-fit"
                            >
                                {buttonText2}
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Side: Image Column */}
            <div className="w-1/2 relative bg-stone-100">
                {imageSrc ? (
                    <Image
                        src={imageSrc}
                        alt={title}
                        fill
                        className="object-cover"
                        sizes="50vw"
                        unoptimized
                        priority
                    />
                ) : (
                    <div className="absolute inset-0 bg-stone-200 flex items-center justify-center text-stone-400 font-instrument-sans text-sm">
                        Bespoke Image
                    </div>
                )}
            </div>
        </section>
    );
};

export default BespokeExperience;
