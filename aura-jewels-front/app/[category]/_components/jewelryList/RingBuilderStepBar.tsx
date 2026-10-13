'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PREFIX } from '@/lib/constants';

interface RingBuilderStepBarProps {
  currentStep?: 1 | 2 | 3;
  selectedSetting?: {
    name?: string;
    price?: number;
    image?: string;
  } | null;
  selectedDiamond?: {
    title?: string;
    price?: number;
    image?: string;
  } | null;
}

export const RingBuilderStepBar: React.FC<RingBuilderStepBarProps> = ({
  currentStep = 1,
  selectedSetting,
  selectedDiamond,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getStepUrl = (step: 1 | 2 | 3) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    params.set('mode', 'builder');
    params.set('builderStep', step.toString());

    if (step === 1) {
      return `/rings?${params.toString()}`;
    } else if (step === 2) {
      return `/diamonds?${params.toString()}`;
    } else {
      return `/complete?${params.toString()}`;
    }
  };

  const handleStepClick = (step: 1 | 2 | 3) => {
    router.push(getStepUrl(step));
  };

  return (
    <div className="w-full bg-white py-4 px-2 md:px-6 border-b border-stone-100">
      <div className="max-w-[1400px] mx-auto border border-stone-200/60 rounded-none overflow-hidden bg-white shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 items-stretch divide-y md:divide-y-0 divide-stone-100">

          {/* Box 0: Label */}
          <div className="relative bg-white py-4 px-5 md:pl-6 md:pr-8 flex items-center justify-center text-center">
            <h3 className="font-serif text-sm md:text-base font-semibold tracking-wide text-[#1E1E1E]">
              Design Your Ring
            </h3>

            {/* Chevron Divider */}
            <svg
              className="absolute top-0 left-full h-full w-[16px] z-20 pointer-events-none hidden md:block text-white"
              viewBox="0 0 16 100"
              preserveAspectRatio="none"
            >
              <path
                d="M 0 0 L 16 50 L 0 100 Z"
                fill="currentColor"
              />
              <path
                d="M 0 0 L 16 50 L 0 100"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="1.2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>

          {/* Step 1: Choose Setting */}
          <div
            className={`relative py-3.5 px-4 md:pl-8 md:pr-6 flex items-center justify-between transition-colors group cursor-pointer ${currentStep === 1 ? 'bg-[#F5F0EB]' : 'bg-white hover:bg-stone-50'
              }`}
            onClick={() => handleStepClick(1)}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-serif font-medium text-base md:text-lg text-[#1E1E1E]">
                1.
              </span>
              <div className="min-w-0">
                <h4 className="font-serif font-semibold text-xs md:text-sm text-[#1E1E1E]">
                  Choose Setting
                </h4>
                <p className="text-[11px] font-sans text-gray-500 truncate mt-0.5">
                  {selectedSetting?.name
                    ? `${selectedSetting.name} - $${selectedSetting.price || 2890}`
                    : 'Select Your Ring Style'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Link
                    href="/rings"
                    className="text-[11px] font-medium tracking-wide text-[#B38D63] hover:underline font-sans"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>

            {/* Thumbnail */}
            <div className="w-12 h-12 flex-shrink-0 relative flex items-center justify-center">
              <img
                src={
                  selectedSetting?.image ||
                  `${PREFIX || ''}/images/aura-jewels/Custom-Ring.jpg`
                }
                alt="Setting"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).setAttribute('src', `${PREFIX || ''}/images/aura-jewels/Custom-Ring.jpg`);
                }}
              />
            </div>

            {/* Chevron Divider */}
            <svg
              className={`absolute top-0 left-full h-full w-[16px] z-20 pointer-events-none hidden md:block ${currentStep === 1 ? 'text-[#F5F0EB]' : 'text-white group-hover:text-stone-50'
                }`}
              viewBox="0 0 16 100"
              preserveAspectRatio="none"
            >
              <path
                d="M 0 0 L 16 50 L 0 100 Z"
                fill="currentColor"
              />
              <path
                d="M 0 0 L 16 50 L 0 100"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="1.2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>

          {/* Step 2: Choose Diamond */}
          <div
            className={`relative py-3.5 px-4 md:pl-8 md:pr-6 flex items-center justify-between transition-colors group cursor-pointer ${currentStep === 2 ? 'bg-[#F5F0EB]' : 'bg-white hover:bg-stone-50'
              }`}
            onClick={() => handleStepClick(2)}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-serif font-medium text-base md:text-lg text-[#1E1E1E]">
                2.
              </span>
              <div className="min-w-0">
                <h4 className="font-serif font-semibold text-xs md:text-sm text-[#1E1E1E]">
                  Choose Diamond
                </h4>
                <p className="text-[11px] font-sans text-gray-500 truncate mt-0.5">
                  {selectedDiamond?.title
                    ? `${selectedDiamond.title} - $${selectedDiamond.price}`
                    : '1.01 Carat Oval - $4,530'}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <Link
                    href="/diamonds"
                    className="text-[11px] font-medium tracking-wide text-[#B38D63] hover:underline font-sans"
                  >
                    View
                  </Link>
                  <span className="text-gray-300">|</span>
                  <span className="text-[11px] font-medium tracking-wide text-gray-400 hover:text-black hover:underline font-sans">
                    Change
                  </span>
                </div>
              </div>
            </div>

            {/* Thumbnail */}
            <div className="w-12 h-12 flex-shrink-0 relative flex items-center justify-center">
              <img
                src={
                  selectedDiamond?.image ||
                  `${PREFIX || ''}/images/aura-jewels/Diamonds/Round Diamond.png`
                }
                alt="Diamond"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).setAttribute('src', `${PREFIX || ''}/images/aura-jewels/Diamonds/Round Diamond.png`);
                }}
              />
            </div>

            {/* Chevron Divider */}
            <svg
              className={`absolute top-0 left-full h-full w-[16px] z-20 pointer-events-none hidden md:block ${currentStep === 2 ? 'text-[#F5F0EB]' : 'text-white group-hover:text-stone-50'
                }`}
              viewBox="0 0 16 100"
              preserveAspectRatio="none"
            >
              <path
                d="M 0 0 L 16 50 L 0 100 Z"
                fill="currentColor"
              />
              <path
                d="M 0 0 L 16 50 L 0 100"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="1.2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>

          {/* Step 3: Complete Ring */}
          <div
            className={`relative py-3.5 px-4 md:pl-8 md:pr-6 flex items-center justify-between transition-colors group cursor-pointer ${currentStep === 3 ? 'bg-[#F5F0EB]' : 'bg-white hover:bg-stone-50'
              }`}
            onClick={() => handleStepClick(3)}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-serif font-medium text-base md:text-lg text-[#1E1E1E]">
                3.
              </span>
              <div className="min-w-0">
                <h4 className="font-serif font-semibold text-xs md:text-sm text-[#1E1E1E]">
                  Complete Ring
                </h4>
                <p className="text-[11px] font-sans text-gray-500 truncate mt-0.5">
                  Select Ring Size
                </p>
              </div>
            </div>

            {/* Thumbnail */}
            <div className="w-12 h-12 flex-shrink-0 relative flex items-center justify-center">
              <img
                src={
                  selectedSetting?.image ||
                  `${PREFIX || ''}/images/aura-jewels/Diamonds/Asscher Dimaond.png`
                }
                alt="Complete Ring"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).setAttribute('src', `${PREFIX || ''}/images/aura-jewels/Diamonds/Asscher Dimaond.png`);
                }}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RingBuilderStepBar;

