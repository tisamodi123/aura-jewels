'use client';

import React from 'react';
import Image from 'next/image';

interface JewelryHeroBannerProps {
  allParams: any;
  bannerImage: string;
  bannerImageMobile?: string;
  bannerHeading: string;
  bannerDescription: string;
}

const JewelryHeroBanner: React.FC<JewelryHeroBannerProps> = ({
  allParams,
  bannerImage,
  bannerImageMobile,
  bannerHeading,
  bannerDescription,
}) => {
  if (!allParams) {
    return (
      <div className="w-full h-[120px] md:h-[300px] bg-gray-150 animate-pulse relative">
        <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-center px-4">
          <div className="h-8 md:h-12 bg-gray-200 rounded-md w-48 mb-4" />
          <div className="h-4 bg-gray-200 rounded-md w-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[120px] md:h-[300px] overflow-hidden">
      {bannerImageMobile ? (
        <>
          <Image
            src={bannerImage}
            alt={`${bannerHeading} Hero`}
            fill
            unoptimized
            className="object-cover object-center hidden md:block"
            priority
            sizes="100vw"
          />
          <Image
            src={bannerImageMobile}
            alt={`${bannerHeading} Hero`}
            fill
            unoptimized
            className="object-cover object-center md:hidden"
            priority
            sizes="100vw"
          />
        </>
      ) : (
        <Image
          src={bannerImage}
          alt={`${bannerHeading} Hero`}
          fill
          unoptimized
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 bg-black/20">
        <h1 className="text-2xl md:text-3xl lg:text-5xl font-jakarta font-light text-white mb-4 tracking-tight capitalize max-w-4xl">
          {bannerHeading}
        </h1>
        <p className="text-[11px] md:text-base lg:text-base text-gray-200 font-jakarta max-w-lg leading-relaxed">
          {bannerDescription}
        </p>
      </div>
    </div>
  );
};

export default JewelryHeroBanner;
