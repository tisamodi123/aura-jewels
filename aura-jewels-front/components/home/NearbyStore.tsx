'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LocateFixed } from 'lucide-react';
import { PREFIX } from '@/lib/constants';
import { getImageUrl } from '@/lib/utils';

interface NearbyStoreProps {
  data?: any;
}

export const NearbyStore: React.FC<NearbyStoreProps> = ({ data }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const contentObj = data?.content || data || {};

  const rawSubTitle = (contentObj?.subTitle || contentObj?.subtitle || contentObj?.subText || "").trim();
  const rawHeading = (contentObj?.heading || contentObj?.title || "").trim();

  // Smart title assignment to match Admin Panel inputs
  let topSubTitle = "NEAR BY STORE";
  let mainHeading = "Experience Luxury And Elegance At A Showroom Near You";

  if (rawSubTitle || rawHeading) {
    if (rawHeading && rawHeading.toLowerCase().includes("near")) {
      topSubTitle = rawHeading.toUpperCase();
      if (rawSubTitle) mainHeading = rawSubTitle;
    } else if (rawSubTitle && rawSubTitle.toLowerCase().includes("near")) {
      topSubTitle = rawSubTitle.toUpperCase();
      if (rawHeading) mainHeading = rawHeading;
    } else if (rawSubTitle && rawSubTitle.length < 35) {
      topSubTitle = rawSubTitle.toUpperCase();
      if (rawHeading) mainHeading = rawHeading;
    } else if (rawHeading && rawHeading.length < 35) {
      topSubTitle = rawHeading.toUpperCase();
      if (rawSubTitle) mainHeading = rawSubTitle;
    } else {
      if (rawSubTitle) topSubTitle = rawSubTitle.toUpperCase();
      if (rawHeading) mainHeading = rawHeading;
    }
  }

  const placeholder = contentObj?.placeholderText || contentObj?.placeholder || contentObj?.searchPlaceholder || "Enter Pincode or city";
  const buttonText = contentObj?.ctaText || contentObj?.buttonText || contentObj?.buttontext1 || "View All Stores";

  const rawLink = contentObj?.redirect?.href || contentObj?.redirect?.url || contentObj?.redirect || contentObj?.buttonLink || contentObj?.buttonlink1;
  const buttonLink = typeof rawLink === 'string' && rawLink.trim() ? rawLink : (rawLink?.href || rawLink?.url || "/stores");

  const rawDesktopImg = contentObj?.image || contentObj?.desktopImage || contentObj?.bannerImage || contentObj?.bgImage;
  const rawMobileImg = contentObj?.imageMobile || contentObj?.mobileImage;

  const desktopImageSrc = rawDesktopImg ? getImageUrl(rawDesktopImg) : 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&q=80&w=1200';
  const mobileImageSrc = rawMobileImg ? getImageUrl(rawMobileImg) : desktopImageSrc;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/stores?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push(buttonLink);
    }
  };

  return (
    <section className="relative w-full overflow-hidden select-none my-0">
      {/* Background Image Container */}
      <div className="relative w-full py-16 sm:py-20 md:py-24 lg:py-28 px-4 flex items-center justify-center min-h-[420px] md:min-h-[480px]">
        {/* Desktop Image */}
        <div className="absolute inset-0 hidden sm:block">
          <Image
            src={desktopImageSrc}
            alt="Luxury Showroom Near You"
            fill
            priority
            className="object-cover object-center"
            unoptimized
          />
        </div>

        {/* Mobile Image */}
        <div className="absolute inset-0 block sm:hidden">
          <Image
            src={mobileImageSrc}
            alt="Luxury Showroom Near You"
            fill
            priority
            className="object-cover object-center"
            unoptimized
          />
        </div>

        {/* Overlay for Contrast */}
        <div className="absolute inset-0 " />

        {/* Content Container */}
        <div className="relative z-10 text-center max-w-4xl mx-auto text-white flex flex-col items-center">
          {/* Subtitle */}
          {topSubTitle && (
            <p className="text-[11px] sm:text-[12px] md:text-[13px] uppercase tracking-[0.35em] sm:tracking-[0.45em] text-stone-300 font-bold mb-4 font-instrument-sans">
              {topSubTitle}
            </p>
          )}

          {/* Heading */}
          {mainHeading && (
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[44px] xl:text-[50px] leading-[1.2] font-cormorant-garamond font-light text-white mb-8 sm:mb-10 max-w-3xl px-2 tracking-normal">
              {mainHeading}
            </h2>
          )}

          {/* Search Box Form */}
          <form onSubmit={handleSearchSubmit} className="w-full max-w-xl mx-auto mb-7 sm:mb-8 px-2">
            <div className="relative flex items-center">
              <LocateFixed className="absolute left-4 w-4 h-4 text-stone-300 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white/10 backdrop-blur-[2px] border border-stone-400/70 focus:border-white text-white placeholder:text-stone-300/90 text-xs sm:text-[13.5px] font-instrument-sans pl-11 pr-4 py-3 sm:py-3.5 focus:outline-none transition-colors rounded-[2px]"
              />
            </div>
          </form>

          {/* Action Button */}
          {buttonText && (
            <Link
              href={buttonLink}
              className="border border-white/80 hover:border-white bg-transparent hover:bg-white text-white hover:text-black px-7 sm:px-9 py-3 sm:py-3.5 text-xs font-instrument-sans font-medium uppercase tracking-[0.18em] transition-all duration-300 rounded-[2px] shadow-xs inline-flex items-center justify-center"
            >
              {buttonText}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default NearbyStore;
