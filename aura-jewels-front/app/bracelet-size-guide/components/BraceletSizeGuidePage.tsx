import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';

const RulerHeaderIcon = () => (
  <svg
    viewBox="0 0 100 100"
    className="w-12 h-12 text-[#013D3D] stroke-[1.2] transform -rotate-45"
    fill="none"
    stroke="currentColor"
  >
    <rect x="10" y="38" width="80" height="24" rx="2" />
    <line x1="20" y1="38" x2="20" y2="48" />
    <line x1="28" y1="38" x2="28" y2="43" />
    <line x1="36" y1="38" x2="36" y2="43" />
    <line x1="44" y1="38" x2="44" y2="48" />
    <line x1="52" y1="38" x2="52" y2="43" />
    <line x1="60" y1="38" x2="60" y2="43" />
    <line x1="68" y1="38" x2="68" y2="48" />
    <line x1="76" y1="38" x2="76" y2="43" />
    <line x1="84" y1="38" x2="84" y2="48" />
  </svg>
);

// Bracelets are sized by length everywhere — the US, UK and Australia have no
// separate letter/number scale the way rings do. The US quotes inches, the UK
// and Australia use centimetres (inches interchangeably), so the inch column
// below IS the US / UK / AUS size. Inches = cm ÷ 2.54, to one decimal.
const BRACELET_CHART = [
  { wrist: '14–15 cm', wristIn: '5.5–5.9 in', bracelet: '16–17 cm', braceletIn: '6.3–6.7 in' },
  { wrist: '15–16 cm', wristIn: '5.9–6.3 in', bracelet: '17–18 cm', braceletIn: '6.7–7.1 in' },
  { wrist: '16–17 cm', wristIn: '6.3–6.7 in', bracelet: '18–19 cm', braceletIn: '7.1–7.5 in' },
  { wrist: '17–18 cm', wristIn: '6.7–7.1 in', bracelet: '19–20 cm', braceletIn: '7.5–7.9 in' },
];

const BraceletSizeGuidePage = () => {
  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] font-jakarta antialiased py-10 px-6">
      <div className="max-w-[760px] mx-auto space-y-12">

        {/* ─── Hero Header ─── */}
        <div className="text-center space-y-5">
          <div className="flex justify-center mb-2">
            <RulerHeaderIcon />
          </div>
          <h1 className="text-3xl md:text-4xl font-el-messiri font-normal tracking-wide text-[#1A1A1A]">
            Aura Jewels Bracelet Size Guide
          </h1>
          <span className="text-xs tracking-[0.2em] text-[#013D3D] font-semibold uppercase block">
            WHERE COMFORT MEETS ELEGANCE
          </span>
          <p className="text-gray-500 font-jakarta leading-relaxed font-light text-sm md:text-base max-w-2xl mx-auto pt-2">
            A perfectly fitted bracelet should feel effortless — secure enough to stay beautifully in place, yet comfortable
            enough for everyday wear. The ideal fit is neither too tight nor too loose, allowing graceful
            movement while feeling naturally comfortable on your wrist.
          </p>
        </div>

        {/* ─── Finding Your Perfect Bracelet Size Box ─── */}
        <div className="bg-white border border-gray-200/60 rounded-sm p-8 md:p-12 shadow-[0_2px_12px_rgba(0,0,0,0.015)]">
          <div className='flex flex-col md:flex-row md:items-start'>
            <div>
              <h2 className="text-2xl font-el-messiri font-normal tracking-wide text-[#1A1A1A] mb-1">
                Finding Your Perfect Bracelet Size
              </h2>
              <span className="text-xs tracking-[0.15em] text-gray-500 font-jakarta uppercase font-bold block mb-6">
                SIMPLE STEPS TO MEASURE AT HOME
              </span>

              <p className="text-sm text-[#1A1A1A] font-semibold mb-4">
                Method: Measure Your Wrist
              </p>

              <ol className="space-y-4 text-sm text-gray-500 font-jakarta mb-10">
                <li className="flex items-start gap-3">
                  <span className="text-gray-500 font-jakarta shrink-0">1.</span>
                  <span>
                    Wrap a <strong className="text-[#1A1A1A] font-semibold">measuring tape, thread, or strip of paper</strong> around your wrist, just below the wrist bone where you would naturally wear your bracelet
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-500 font-jakarta shrink-0">2.</span>
                  <span>Ensure the fit is snug but not tight</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-500 font-jakarta shrink-0">3.</span>
                  <span>
                    Note the wrist measurement in <strong className="text-[#1A1A1A] font-semibold">centimetres (cm)</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-500 font-jakarta shrink-0">4.</span>
                  <span>Add extra length depending on your preferred fit style</span>
                </li>
              </ol>
            </div>
            {/* commented-out side image slot removed */}
          </div>

          {/* ── Image row 1 ── */}
          <div className="w-full my-4">
            <Image
              src={getImageUrl("/images/Aura Jewels-certif/BAND5.png")}
              alt="How to measure bracelet size – step guide"
              width={1200}
              height={600}
              quality={100}
              sizes="(max-width: 640px) 100vw, 760px"
              className="w-full h-auto rounded-lg object-contain"
            />
          </div>

          {/* ── Image row 2 ── */}
          {/* <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden mb-4">
            <Image
              src={getImageUrl("/images/Aura Jewels-certif/BAND3.png")}
              alt="Bracelet size reference chart"
              fill
              quality={100}
              sizes="(max-width: 640px) 100vw, 760px"
              className="object-contain"
            />
          </div> */}

          {/* Size Chart Header Title */}
          <h3 className="text-xl font-el-messiri font-normal text-[#1A1A1A] mb-2">
            Bracelet Size Guide
          </h3>
          <p className="text-xs text-gray-500 font-jakarta mb-6 leading-relaxed font-light">
            Bracelets are sized by length in India, the US, the UK and Australia alike — there
            is no separate letter or number scale. Use centimetres or the inch equivalent below,
            whichever your local jeweller quotes.
          </p>

          {/* Size Chart Table — horizontally scrollable on narrow screens */}
          {/* <div className="overflow-x-auto border border-gray-200/60 rounded-sm mb-4">
            <div className="min-w-[560px]">
              <div className="bg-gray-100 px-6 py-4 grid grid-cols-4 text-center border-b border-gray-200/60">
                <span className="text-md font-medium tracking-wider text-[#1A1A1A] uppercase">Wrist Size (cm)</span>
                <span className="text-md font-medium tracking-wider text-[#1A1A1A] uppercase">Wrist Size (in)</span>
                <span className="text-md font-medium tracking-wider text-[#1A1A1A] uppercase">Bracelet Size (cm)</span>
                <span className="text-md font-medium tracking-wider text-[#1A1A1A] uppercase">Bracelet Size (in)</span>
              </div>
              <div className="divide-y divide-neutral-border/40">
                {BRACELET_CHART.map((row, idx) => (
                  <div
                    key={idx}
                    className="px-6 py-4 grid grid-cols-4 text-center text-sm text-[#1A1A1A] items-center"
                  >
                    <span className="font-light text-[#1A1A1A]/90">{row.wrist}</span>
                    <span className="font-light text-gray-500 font-jakarta">{row.wristIn}</span>
                    <span className="font-bold text-[#1A1A1A]">{row.bracelet}</span>
                    <span className="font-light text-gray-500 font-jakarta">{row.braceletIn}</span>
                  </div>
                ))}
              </div>
            </div>
          </div> */}

          <div className="overflow-x-auto border border-gray-200/60 rounded-sm">
            <div className="min-w-[480px]">
              <div className="bg-gray-100 px-6 py-4 grid grid-cols-4 text-center border-b border-gray-200/60">
                <span className="text-xs font-bold tracking-wider text-[#1A1A1A] uppercase">Wrist Size (cm)</span>
                <span className="text-xs font-bold tracking-wider text-[#1A1A1A] uppercase">Wrist Size (in)</span>
                <span className="text-xs font-bold tracking-wider text-[#1A1A1A] uppercase">Bracelet Size (cm)</span>
                <span className="text-xs font-bold tracking-wider text-[#1A1A1A] uppercase">Bracelet Size (in)</span>
              </div>
              <div className="divide-y divide-gray-200/60">
                {BRACELET_CHART.map((row, idx) => (
                  <div
                    key={idx}
                    className="px-6 py-4 grid grid-cols-4 text-center text-sm text-[#1A1A1A] items-center"
                  >
                    <span className="font-light text-gray-500 font-jakarta">{row.wrist}</span>
                    <span className="font-bold text-[#1A1A1A]">{row.wristIn}</span>
                    <span className="font-light text-gray-500 font-jakarta">{row.bracelet}</span>
                    <span className="font-light text-gray-500 font-jakarta">{row.braceletIn}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 font-jakarta text-center italic font-light mt-4">
            If you are between sizes, we recommend selecting the larger size for enhanced comfort.
          </p>
        </div>

        {/* ─── Fit Guide & Styling Recommendations ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fit Guide Card */}
          <div className="bg-white border border-gray-200/60 rounded-sm p-8 shadow-[0_2px_12px_rgba(0,0,0,0.015)] flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-el-messiri font-normal tracking-wide text-[#1A1A1A] mb-1">
                Choose Your Preferred Fit
              </h3>
              <span className="text-xs tracking-[0.15em] text-gray-500 font-jakarta uppercase font-bold block mb-6">
                TAILORED TO YOUR STYLE
              </span>

              <ul className="space-y-6 text-sm text-gray-500 font-jakarta">
                <li className="flex items-start gap-3">
                  <span className="text-[#013D3D] shrink-0 mt-0.5 font-light">✧</span>
                  <div>
                    <strong className="text-[#1A1A1A] font-semibold block mb-0.5">Snug Fit</strong>
                    For a close, sleek look <br />
                    <span className="text-xs">Add: <strong className="text-[#1A1A1A] font-semibold">1–1.5 cm</strong> to your wrist measurement</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#013D3D] shrink-0 mt-0.5 font-light">✧</span>
                  <div>
                    <strong className="text-[#1A1A1A] font-semibold block mb-0.5">Comfort Fit (Recommended)</strong>
                    Balanced for daily elegance and movement <br />
                    <span className="text-xs">Add: <strong className="text-[#1A1A1A] font-semibold">1.5–2 cm</strong> to your wrist measurement</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#013D3D] shrink-0 mt-0.5 font-light">✧</span>
                  <div>
                    <strong className="text-[#1A1A1A] font-semibold block mb-0.5">Loose Fit</strong>
                    For a relaxed, layered appearance <br />
                    <span className="text-xs">Add: <strong className="text-[#1A1A1A] font-semibold">2–2.5 cm</strong> to your wrist measurement</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Styling Recommendations Card */}
          <div className="bg-white border border-gray-200/60 rounded-sm p-8 shadow-[0_2px_12px_rgba(0,0,0,0.015)] flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-el-messiri font-normal tracking-wide text-[#1A1A1A] mb-1">
                Styling Recommendations
              </h3>
              <span className="text-xs tracking-[0.15em] text-gray-500 font-jakarta uppercase font-bold block mb-6">
                BECAUSE EVERY DESIGN WEARS DIFFERENTLY
              </span>

              <ul className="space-y-5 text-sm text-gray-500 font-jakarta leading-relaxed font-light">
                <li>
                  <strong className="text-[#1A1A1A] font-semibold">Tennis Bracelets –</strong> Best worn with a slightly snug fit for elegance and security
                </li>
                <li>
                  <strong className="text-[#1A1A1A] font-semibold">Charm Bracelets –</strong> Ideal with a slightly relaxed fit to allow natural movement
                </li>
                <li>
                  <strong className="text-[#1A1A1A] font-semibold">Everyday Wear –</strong> A comfort fit is recommended for all-day ease
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ─── Important Sizing Note Box ─── */}
        <div className="bg-white border border-gray-200/60 rounded-sm p-8 md:p-12 shadow-[0_2px_12px_rgba(0,0,0,0.015)]">
          <h2 className="text-2xl font-el-messiri font-normal tracking-wide text-[#1A1A1A] mb-2 flex items-center justify-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#013D3D] shrink-0" />
            Important Sizing Note
          </h2>
          <p className="text-sm text-gray-500 font-jakarta text-center mb-6 leading-relaxed">
            Selecting the correct bracelet size is essential for both comfort and durability.
          </p>

          <p className="text-sm text-[#1A1A1A] font-medium mb-3">Please note:</p>

          <ul className="space-y-3 text-xs text-gray-500 font-jakarta leading-relaxed font-light">
            <li className="flex items-start gap-2">
              <span className="text-[#1A1A1A] font-bold">•</span>
              <span>An incorrect fit may affect the bracelet's wearability, comfort, and longevity</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#1A1A1A] font-bold">•</span>
              <span>
                Aura Jewels shall not be responsible for sizing issues resulting from incorrect measurements or size selection made by the customer
              </span>
            </li>
          </ul>
        </div>

        {/* ─── Brand Slogan Suffix ─── */}
        <div className="text-center pt-8 max-w-xl mx-auto">
          <p className="text-base font-el-messiri italic text-gray-500 font-jakarta leading-relaxed">
            Crafted To Complement Your Style — Designed To Feel As Beautiful As It Looks
          </p>
        </div>

      </div>
    </div>
  );
};

export default BraceletSizeGuidePage;
