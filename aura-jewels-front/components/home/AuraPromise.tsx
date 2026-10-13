'use client';

import React from 'react';
import Link from 'next/link';
import { Promises } from '../commonts/constVariable';

const AuraPromise: React.FC = () => {
  return (
    <section className="py-20 bg-stone-50/60 border-t border-gray-100 overflow-hidden">
      <div className="max-w-[1700px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-start justify-between mb-14 gap-8">
          <div className="max-w-xl">
            <p className="text-[11px] md:text-[12px] uppercase tracking-[0.45em] text-[#A96D56] font-bold mb-4 font-jakarta">
              UNCOMPROMISING STANDARDS
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-[40px] font-jakarta font-light text-[#1A1A1A] leading-tight">
              The Aura Promise
            </h2>
          </div>
          <div className="md:max-w-sm text-gray-500 text-[14px] md:text-[15px] font-jakarta pt-2 leading-relaxed font-light">
            Building trust through absolute transparency. Every piece we create is a testament to ethical luxury and refined craftsmanship.
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
          {Promises.map((item, i) => (
            <Link
              key={i}
              href={item.slug}
              className="group flex flex-col items-start text-left cursor-pointer p-6 md:p-8 bg-white border border-gray-100 hover:border-[#A96D56]/30 shadow-xs hover:shadow-md transition-all duration-300 rounded-sm"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#A96D56]/10 flex items-center justify-center mb-6 group-hover:bg-[#A96D56] transition-all duration-300 border border-[#A96D56]/20">
                <svg
                  className="w-6 h-6 md:w-7 md:h-7 text-[#A96D56] group-hover:text-white transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" d={item.icon} />
                </svg>
              </div>
              <h4 className="text-[16px] md:text-[17px] font-semibold text-[#1A1A1A] mb-2 font-jakarta tracking-tight group-hover:text-[#A96D56] transition-colors">
                {item.title}
              </h4>
              <p className="text-[13px] text-gray-500 leading-relaxed font-jakarta font-light">
                {item.sub}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AuraPromise;
