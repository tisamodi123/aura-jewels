'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PREFIX } from '@/lib/constants';
import { getImageUrl, formatTitle } from '@/lib/utils';

interface HeritageHeirloomsProps {
  data?: any;
}

export const HeritageHeirlooms: React.FC<HeritageHeirloomsProps> = ({ data }) => {
  const subTitle = formatTitle(data?.subTitle || data?.subtitle || data?.subText || data?.label || "HERITAGE HEIRLOOMS");
  let heading = formatTitle(data?.heading || data?.title || "Made For The Present.\nTreasured Forever.");

  if (heading && !heading.includes('\n')) {
    const match = heading.match(/treasured/i);
    if (match && match.index !== undefined) {
      const splitIndex = match.index;
      heading = heading.substring(0, splitIndex).trim() + '\n' + heading.substring(splitIndex).trim();
    }
  }

  const description = data?.description || data?.desc || "Born From Passion. Inspired By Heritage. Designed To Last Forever.";
  const ctaText = data?.ctaText || data?.buttonText || data?.buttontext1 || "Shop Now";

  const rawLink = data?.redirect?.href || data?.redirect?.url || data?.ctaLink || data?.buttonlink1 || data?.redirect || data?.link || "/shop";
  const ctaLink = typeof rawLink === 'string' ? rawLink : '/shop';

  const rawDesktopImg = data?.image || data?.desktopImage || data?.bannerImage || `${PREFIX || ''}/images/heritage-heirlooms.png`;
  const rawMobileImg = data?.imageMobile || data?.mobileImage || rawDesktopImg;

  const desktopImageSrc = getImageUrl(rawDesktopImg);
  const mobileImageSrc = getImageUrl(rawMobileImg);

  return (
    <section className="w-full bg-[#050505] text-white overflow-hidden select-none border-t border-stone-900/60">
      <div className="max-w-[1700px] mx-auto min-h-[300px] min-[370px]:min-h-[360px] md:min-h-[500px] lg:min-h-[560px] flex flex-row items-stretch">

        {/* Left Content Column */}
        <div className="w-1/2 p-3 min-[370px]:p-5 md:p-12 lg:p-16 xl:p-20 flex flex-col justify-center items-start z-10 bg-[#050505]">
          {subTitle && (
            <p className="text-[10px] min-[370px]:text-[11px] uppercase tracking-[0.35em] text-stone-300 font-bold mb-2 md:mb-5 font-instrument-sans">
              {subTitle}
            </p>
          )}

          {heading && (
            <h2 className="text-2xl min-[370px]:text-3xl md:text-4xl lg:text-[42px] xl:text-[50px] leading-[1.2] font-cormorant-garamond font-light text-white mb-3 md:mb-6 whitespace-pre-line tracking-normal">
              {heading}
            </h2>
          )}

          {description && (
            <p className="text-[11px] min-[370px]:text-[13px] md:text-[15px] text-stone-400 font-instrument-sans font-light leading-relaxed mb-4 md:mb-8 max-w-md">
              {description}
            </p>
          )}

          {ctaText && (
            <Link
              href={ctaLink}
              className="bg-[#A96D56] hover:bg-[#975843] text-white px-5 md:px-8 py-2.5 md:py-3 text-[10px] md:text-xs font-instrument-sans font-medium uppercase tracking-[0.18em] transition-all duration-300 shadow-sm hover:shadow-md inline-flex items-center justify-center rounded-[2px]"
            >
              {ctaText}
            </Link>
          )}
        </div>

        {/* Right Image Column */}
        <div className="w-1/2 relative bg-[#050505] overflow-hidden">
          {/* Always show Desktop-style Image on all screens */}
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={desktopImageSrc}
              alt={subTitle || "Heritage Heirlooms"}
              fill
              className="object-cover object-center"
              sizes="50vw"
              unoptimized
              priority
            />
          </div>

          {/* Soft Edge Gradient to blend left black container seamlessly with the right image */}
          <div className="absolute inset-y-0 left-0 w-8 md:w-24 bg-gradient-to-r from-[#050505] via-[#050505]/40 to-transparent pointer-events-none z-10" />
        </div>
      </div>
    </section>
  );
};

export default HeritageHeirlooms;
