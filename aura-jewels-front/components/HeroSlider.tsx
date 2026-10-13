'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';

interface Slide {
  id: string | number;
  image: string;
  overline: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaLink: string;
  status?: string;
}

const SLIDES: Slide[] = [
  // {
  //   id: 1,
  //   overline: 'Aura Jewels Fine Jewellery',
  //   image: `${PREFIX}/images/New folder/woman-gold-jewelry-red-dress.webp`,
  //   title: 'Fine Jewellery, Thoughtfully Crafted',
  //   subtitle: 'Natural & Lab-Grown Diamonds | Crafted in India',
  //   cta: 'Shop Jewellery',
  //   ctaLink: '/shop'
  // },
  // {
  //   id: 3,
  //   image: `${PREFIX}/images/banner03.png`,
  //   overline: 'Your Unique Story',
  //   title: 'Timeless Design. Modern Brilliance.',
  //   subtitle: 'Experience refined diamond jewelry designed for today’s confident and conscious buyer.',
  //   cta: 'View Designs',
  //   ctaLink: '/shop'
  // }
];

const formatTitle = (title: string) => {
  if (!title) return '';
  let formatted = title.replace(/\\n/g, '\n');
  if (!formatted.includes('\n')) {
    const match = formatted.match(/(Meant\s+for|Meant\s+For)/i);
    if (match && match.index !== undefined) {
      const idx = match.index;
      formatted = formatted.substring(0, idx).trim() + '\n' + formatted.substring(idx).trim();
    }
  }
  return formatted.replace(/\.\s+/g, '.\n');
};

interface HeroSliderProps {
  banners: any[];
  disableLink?: boolean;
}

const HeroSlider: React.FC<HeroSliderProps> = ({ banners, disableLink = false }) => {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const filteredBanners = Array.isArray(banners)
    ? banners.filter((banner: any) => banner.status === 'ACTIVE')
    : [];

  const activeSlides: Slide[] = filteredBanners.length > 0
    ? filteredBanners.map((banner: any, index: number) => ({
      id: banner.id || index.toString(),
      image: banner.image || '',
      overline: banner?.subdescription || '',
      title: banner.title || '',
      subtitle: banner.subTitle || banner.description || '',
      cta: banner.buttontext1 || '',
      ctaLink: banner.buttonlink1 || '/all',
      status: banner?.status
    }))
    : SLIDES;

  const displaySlides = activeSlides;

  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const nextSlide = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrent((prev) => (prev + 1) % displaySlides.length);
      setIsTransitioning(false);
    }, 800);
  }, [displaySlides.length]);

  useEffect(() => {
    if (!isVisible || displaySlides.length <= 1) return;
    const timer = setInterval(nextSlide, 7000);
    return () => clearInterval(timer);
  }, [nextSlide, isVisible, displaySlides.length]);

  return (
    <section className="relative h-[70vh] min-[412px]:h-[55vh] min-[540px]:h-[70vh] lg:h-[80vh] w-full overflow-hidden bg-[#1A1A1A]">
      {displaySlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
        >
          {/* Background Image with Ken Burns */}


          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={getImageUrl(slide.image)}
              alt={slide.title}
              fill
              unoptimized
              priority={index === 0}
              quality={90}
              className={`object-cover ${index === current ? 'animate-kenBurns' : ''}`}
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent z-[5]" />
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center justify-start text-left text-white px-8 md:px-24 lg:px-32 mx-auto z-10">
            <div className="max-w-3xl space-y-6">
              {index === current && (
                <>
                  <div className="flex flex-col items-start space-y-4">
                    <span className="text-[11px] tracking-[0.4em] uppercase font-bold text-[#FDFBF7] reveal-text font-sans">
                      <span className="reveal-text-content" style={{ animationDelay: '0.2s' }}>
                        {slide.overline}
                      </span>
                    </span>
                  </div>

                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-cormorant-garamond font-normal leading-[1.15] tracking-wide whitespace-pre-line reveal-text">
                    <span className="reveal-text-content" style={{ animationDelay: '0.4s' }}>
                      {formatTitle(slide.title)}
                    </span>
                  </h1>

                  {slide.subtitle && (
                    <p className="text-[12px] sm:text-[13px] md:text-[14px] font-sans tracking-wide opacity-90 max-w-lg reveal-text mt-2">
                      <span className="reveal-text-content" style={{ animationDelay: '0.6s' }}>
                        {slide.subtitle}
                      </span>
                    </p>
                  )}

                  {slide.cta && (
                    <div className="pt-6 reveal-text flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-start">
                      {disableLink ? (
                        <button
                          className="reveal-text-content px-10 py-4 bg-[#A96D56] text-white hover:bg-[#995e48] transition-all duration-500 text-[11px] tracking-[0.2em] uppercase font-bold font-sans inline-block cursor-default cursor-pointer w-fit"
                          style={{ animationDelay: '0.8s' }}
                        >
                          {slide.cta}
                        </button>
                      ) : (
                        <Link
                          href={slide.ctaLink}
                          className="reveal-text-content px-10 py-4 bg-[#A96D56] text-white hover:bg-[#995e48] transition-all duration-500 text-[11px] tracking-[0.2em] uppercase font-sans inline-block w-fit"
                          style={{ animationDelay: '0.8s' }}
                        >
                          {slide.cta}
                        </Link>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Slider Controls */}
      {displaySlides.length > 1 && (
        <div className="absolute bottom-12 right-8 md:right-24 z-20 flex items-center space-x-6">
          {displaySlides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setCurrent(i);
                  setIsTransitioning(false);
                }, 400);
              }}
              className="group relative py-4"
            >
              <div
                className={`h-[2px] transition-all duration-700 ${i === current ? 'w-12 bg-white' : 'w-6 bg-white/40 group-hover:bg-white/80'
                  }`}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSlider;
