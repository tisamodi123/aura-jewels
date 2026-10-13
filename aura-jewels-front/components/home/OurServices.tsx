'use client';

import React from 'react';
import { PREFIX } from '@/lib/constants';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

import 'swiper/css';

interface ServiceItem {
  title: string;
  icon: string;
}

const SERVICES: ServiceItem[] = [
  {
    title: 'Secure Payments',
    icon: 'secured-payment.svg',
  },
  {
    title: 'BIS Hallmarked',
    icon: 'BIS-Hallmark.svg',
  },
  {
    title: 'Hassle-free Returns',
    icon: 'Free Returns.svg',
  },
  {
    title: 'Purity Guarantee',
    icon: 'Purity guaranteed.svg',
  },
  {
    title: 'Free Shipping',
    icon: 'Shipping.svg',
  },
];

export const OurServices: React.FC = () => {
  // Duplicate services list for continuous smooth looping
  const displayServices = [...SERVICES, ...SERVICES, ...SERVICES];

  return (
    <section className="bg-white py-12 md:py-20 px-4 md:px-8 border-t border-gray-100 overflow-hidden select-none">
      <div className="max-w-[1700px] mx-auto">
        {/* Top Header */}
        <div className="text-center max-w-4xl mx-auto mb-10 md:mb-14">
          <p className="text-[11px] md:text-[12px] uppercase tracking-[0.45em] text-stone-500 font-bold mb-3 font-instrument-sans">
            OUR SERVICES
          </p>
          <h2 className="text-2xl md:text-3xl lg:text-[36px] xl:text-[38px] leading-[1.3] text-[#1A1A1A] font-cormorant-garamond font-light max-w-4xl mx-auto px-2">
            Discover A Range Of Thoughtfully Curated Services Designed To Elevate Your Jewellery Experience.
          </h2>
        </div>

        {/* Swiper Services Slider */}
        <div className="relative px-1 group/carousel">
          <Swiper
            modules={[Autoplay]}
            spaceBetween={16}
            slidesPerView={1.5}
            breakpoints={{
              480: { slidesPerView: 2.2, spaceBetween: 16 },
              640: { slidesPerView: 3, spaceBetween: 18 },
              768: { slidesPerView: 3.5, spaceBetween: 20 },
              1024: { slidesPerView: 4.5, spaceBetween: 20 },
              1280: { slidesPerView: 5, spaceBetween: 20 },
            }}
            loop={true}
            autoplay={{
              delay: 2800,
              disableOnInteraction: false,
              pauseOnMouseEnter: false,
            }}
            grabCursor={true}
            className="w-full !py-2"
          >
            {displayServices.map((service, index) => (
              <SwiperSlide key={`${service.title}-${index}`} className="h-auto">
                <div className="bg-[#F5F2EC] rounded-[2px] p-6 py-8 md:py-10 md:px-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-xs h-full border border-[#ECE7DF]">
                  <div className="w-11 h-11 md:w-13 md:h-13 mb-4 flex items-center justify-center">
                    <img
                      src={`${PREFIX || ''}/images/Aura Jewels/Aura Jewels-Icons/${service.icon}`}
                      alt={service.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="text-[13px] md:text-[14.5px] font-instrument-sans font-semibold text-[#1A1A1A] leading-snug">
                    {service.title}
                  </h3>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default OurServices;
