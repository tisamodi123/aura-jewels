import { getImageUrl } from '@/lib/utils';
import Image from 'next/image';
import React from 'react';

const RulerHeaderIcon = () => (
  <svg
    viewBox="0 0 100 100"
    className="w-12 h-12 text-[#B57A5A] stroke-[1.2] transform -rotate-45"
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

// Full Indian ring-size master (inside diameter in mm). Diameters match the
// seeded size master so the guide is consistent with what's actually offered.
// Size 18 is the most common ladies' size.
//
// US and UK/AUS equivalents are derived from the same inside diameter:
//   US       diameter(mm) = 11.6306 + 0.81282 × size   (rounded to ¼ size)
//   UK / AUS letters step 0.4064 mm from A = 12.0396 mm (rounded to ½ letter)
// Australia uses the British alphabetical scale, so one column serves both.
// Because the Indian ladder steps 0.3 mm and the US/UK ladders step 0.81/0.41 mm,
// most rows land between international sizes — hence the ¼ / ½ values.
const SIZE_CHART = [
  { diameter: '14.6', size: 6, us: '3.75', uk: 'G½' },
  { diameter: '14.9', size: 7, us: '4', uk: 'H' },
  { diameter: '15.2', size: 8, us: '4.5', uk: 'I' },
  { diameter: '15.5', size: 9, us: '4.75', uk: 'I½' },
  { diameter: '15.8', size: 10, us: '5.25', uk: 'J½' },
  { diameter: '16.1', size: 11, us: '5.5', uk: 'K' },
  { diameter: '16.4', size: 12, us: '5.75', uk: 'K½' },
  { diameter: '16.7', size: 13, us: '6.25', uk: 'L½' },
  { diameter: '17.0', size: 14, us: '6.5', uk: 'M' },
  { diameter: '17.3', size: 15, us: '7', uk: 'N' },
  { diameter: '17.6', size: 16, us: '7.25', uk: 'N½' },
  { diameter: '17.9', size: 17, us: '7.75', uk: 'O½' },
  { diameter: '18.2', size: 18, us: '8', uk: 'P', },//common: true 
  { diameter: '18.5', size: 19, us: '8.5', uk: 'Q' },
  { diameter: '18.8', size: 20, us: '8.75', uk: 'Q½' },
  { diameter: '19.1', size: 21, us: '9.25', uk: 'R½' },
  { diameter: '19.4', size: 22, us: '9.5', uk: 'S' },
  { diameter: '19.7', size: 23, us: '10', uk: 'T' },
  { diameter: '20.0', size: 24, us: '10.25', uk: 'T½' },
  { diameter: '20.3', size: 25, us: '10.75', uk: 'U½' },
  { diameter: '20.6', size: 26, us: '11', uk: 'V' },
  { diameter: '20.9', size: 27, us: '11.5', uk: 'W' },
  { diameter: '21.2', size: 28, us: '11.75', uk: 'W½' },
  { diameter: '21.5', size: 29, us: '12.25', uk: 'X½' },
  { diameter: '21.8', size: 30, us: '12.5', uk: 'Y' },
];

const RingSizeGuidePage = () => {
  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] font-jakarta antialiased py-10 px-6">
      <div className="max-w-[760px] mx-auto space-y-12">

        {/* ─── Hero Header ─── */}
        <div className="text-center space-y-5">
          <div className="flex justify-center mb-2">
            <RulerHeaderIcon />
          </div>
          <h1 className="text-3xl md:text-4xl font-el-messiri font-medium tracking-wide text-[#1A1A1A]">
            Aura Jewels Ring Size Guide
          </h1>
          <span className="text-xs tracking-[0.2em] text-[#B57A5A] font-semibold uppercase block">
            FIND YOUR PERFECT FIT
          </span>
          <p className="text-gray-500 font-jakarta leading-relaxed font-light text-sm md:text-base max-w-2xl mx-auto pt-2">
            A perfectly fitted ring is designed to feel effortless — secure enough to stay in place, yet comfortable
            enough to wear every day. Your ring should slide on smoothly and fit snugly, with slight resistance
            when removed.
          </p>
          <p className="text-gray-500 font-jakarta leading-relaxed font-light text-sm md:text-base max-w-2xl mx-auto">
            Finding the right size ensures both comfort and confidence in every wear.
          </p>
        </div>

        {/* ─── Before You Measure Tips Box ─── */}
        <div className="bg-white border border-gray-200/60 rounded-sm p-8 md:p-12 shadow-[0_2px_12px_rgba(0,0,0,0.015)]">
          <h2 className="text-2xl font-el-messiri font-normal tracking-wide text-[#1A1A1A] mb-1">
            Before You Measure
          </h2>
          <span className="text-xs tracking-[0.15em] text-gray-500 font-jakarta uppercase font-bold block mb-6">
            A FEW HELPFUL TIPS
          </span>

          <p className="text-sm text-gray-500 font-jakarta mb-6 leading-relaxed">
            For the most accurate sizing experience, keep these essentials in mind:
          </p>

          <ul className="space-y-4 text-sm text-gray-500 font-jakarta">
            <li className="flex items-start gap-3">
              <span className="text-[#1A1A1A] font-semibold shrink-0">✓</span>
              <span>
                <strong className="text-[#1A1A1A] font-semibold">Measure at the end of the day</strong> — fingers naturally expand slightly over time
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#1A1A1A] font-semibold shrink-0">✓</span>
              <span>
                <strong className="text-[#1A1A1A] font-semibold">Avoid measuring when your hands are cold</strong>, as fingers may appear smaller than usual
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#1A1A1A] font-semibold shrink-0">✓</span>
              <span>
                <strong className="text-[#1A1A1A] font-semibold">Consider your knuckle size</strong>, especially for broader bands or statement rings
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#1A1A1A] font-semibold shrink-0">✓</span>
              <span>
                If choosing a wider ring, consider going <strong className="text-[#1A1A1A] font-semibold">slightly larger for added comfort</strong>
              </span>
            </li>
          </ul>
        </div>

        {/* ─── Method 1: Measure An Existing Ring ─── */}
        <div className="bg-white border border-gray-200/60 rounded-sm p-8 md:p-12 shadow-[0_2px_12px_rgba(0,0,0,0.015)]">
          <div className='flex flex-col md:flex-row md:items-start md:gap-6'>
            <div>
              <h2 className="text-2xl font-el-messiri font-normal tracking-wide text-[#1A1A1A] mb-1">
                Method 1: Measure An Existing Ring
              </h2>
              <span className="text-xs tracking-[0.15em] text-gray-500 font-jakarta uppercase font-bold block mb-6">
                THE EASIEST WAY TO FIND YOUR SIZE
              </span>

              <p className="text-sm text-gray-500 font-jakarta mb-6 leading-relaxed">
                Already have a ring that fits perfectly? Follow these simple steps:
              </p>

              <ol className="space-y-4 text-sm text-gray-500 font-jakarta">
                <li className="flex items-start gap-3">
                  <span className="text-gray-500 font-jakarta shrink-0">1.</span>
                  <span>Choose a ring that fits the intended finger comfortably</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-500 font-jakarta shrink-0">2.</span>
                  <span>
                    Measure the <strong className="text-[#1A1A1A] font-semibold">inner diameter</strong> of the ring in <strong className="text-[#1A1A1A] font-semibold">millimetres (mm)</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-500 font-jakarta shrink-0">3.</span>
                  <span>Match your measurement with the size chart below</span>
                </li>
              </ol>
            </div>
            {/* side image slot removed — shown in row below */}
          </div>

          {/* ── Two images in one row ── */}
          <div className="flex flex-col sm:flex-row my-6">
            <div className="relative flex-1 aspect-square rounded-lg overflow-hidden">
              <Image
                src={getImageUrl("/images/Aura Jewels-certif/RINGS5.jpg")}
                alt="How to measure ring size – diameter method"
                fill
                quality={100}
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-contain"
              />
            </div>
            <div className="relative flex-1 aspect-square rounded-lg overflow-hidden">
              <Image
                src={getImageUrl("/images/Aura Jewels-certif/RINGS6.jpg")}
                alt="Ring size chart reference"
                fill
                quality={100}
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-contain"
              />
            </div>
          </div>


          {/* Size Chart Header Title */}
          <h3 className="text-xl font-el-messiri font-normal text-[#1A1A1A] mb-2">
            Ring Size Chart (India · US · UK / AUS)
          </h3>
          <p className="text-xs text-gray-500 font-jakarta mb-6 leading-relaxed font-light">
            Australia uses the same alphabetical scale as the UK. Indian sizes step in
            0.3&nbsp;mm while the US and UK scales step in larger increments, so many rows
            fall between international sizes — these are shown as the nearest quarter
            (US) or half letter (UK&nbsp;/&nbsp;AUS).
          </p>

          {/* Size Chart Table — horizontally scrollable on narrow screens */}
          <div className="overflow-x-auto border border-gray-200/60 rounded-sm">
            <div className="min-w-[520px]">
              <div className="bg-gray-100 px-6 py-4 grid grid-cols-4 text-center border-b border-gray-200/60">
                <span className="text-xs font-bold tracking-wider text-[#1A1A1A] uppercase">Inner Diameter (mm)</span>
                <span className="text-xs font-bold tracking-wider text-[#1A1A1A] uppercase">India</span>
                <span className="text-xs font-bold tracking-wider text-[#1A1A1A] uppercase">US</span>
                <span className="text-xs font-bold tracking-wider text-[#1A1A1A] uppercase">UK / AUS</span>
              </div>
              <div className="divide-y divide-neutral-border/40">
                {SIZE_CHART.map((row) => (
                  <div
                    key={row.size}
                    className={`px-6 py-4 grid grid-cols-4 text-center text-sm text-[#1A1A1A] items-center `}
                  >
                    <span className="font-light text-gray-500 font-jakarta">{row.diameter}</span>
                    <span className="font-bold text-[#1A1A1A]">
                      {row.size}
                      {/* {row?.common && (
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#B57A5A]">
                          Most Common
                        </span>
                      )} */}
                    </span>
                    <span className="font-light text-gray-500 font-jakarta">{row.us}</span>
                    <span className="font-light text-gray-500 font-jakarta">{row.uk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 font-jakarta mt-4 leading-relaxed font-light italic">
            Conversions are approximate and provided for reference. International charts vary
            slightly between jewellers — where possible, confirm against the inner diameter in
            millimetres, which is exact.
          </p>
        </div>

        {/* ─── Method 2: Paper Strip Method ─── */}
        <div className="bg-white border border-gray-200/60 rounded-sm p-8 md:p-12 shadow-[0_2px_12px_rgba(0,0,0,0.015)]">
          <h2 className="text-2xl font-el-messiri font-normal tracking-wide text-[#1A1A1A] mb-1">
            Method 2: Paper Strip Method
          </h2>
          <span className="text-xs tracking-[0.15em] text-gray-500 font-jakarta uppercase font-bold block mb-6">
            MEASURE YOUR FINGER AT HOME
          </span>

          <p className="text-sm text-gray-500 font-jakarta mb-6 leading-relaxed">
            If you do not have an existing ring, you can easily measure your finger:
          </p>

          <ol className="space-y-4 text-sm text-gray-500 font-jakarta mb-6">
            <li className="flex items-start gap-3">
              <span className="text-gray-500 font-jakarta shrink-0">1.</span>
              <span>
                Wrap a <strong className="text-[#1A1A1A] font-semibold">thin strip of paper or string</strong> around the base of your finger
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gray-500 font-jakarta shrink-0">2.</span>
              <span>Mark the point where the ends overlap</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gray-500 font-jakarta shrink-0">3.</span>
              <span>
                Measure the length in <strong className="text-[#1A1A1A] font-semibold">millimetres (mm)</strong> using a ruler
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gray-500 font-jakarta shrink-0">4.</span>
              <span>Match the measurement to the corresponding ring size chart</span>
            </li>
          </ol>

          <p className="text-sm text-gray-500 font-jakarta font-light mt-6">
            For best accuracy, measure <strong className="text-[#1A1A1A] font-semibold">2–3 times</strong> and use the average result.
          </p>
        </div>

        {/* ─── Fit Guide & Resizing Info ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fit Guide Card */}
          <div className="bg-white border border-gray-200/60 rounded-sm p-8 shadow-[0_2px_12px_rgba(0,0,0,0.015)] flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-el-messiri font-normal tracking-wide text-[#1A1A1A] mb-1">
                Fit Guide
              </h3>
              <span className="text-xs tracking-[0.15em] text-gray-500 font-jakarta uppercase font-bold block mb-6">
                HOW YOUR RING SHOULD FEEL
              </span>

              <ul className="space-y-4 text-sm text-gray-500 font-jakarta">
                <li className="flex items-start gap-3">
                  <span className="text-[#B57A5A] shrink-0 mt-0.5 font-light">✧</span>
                  <span>
                    <strong className="text-[#1A1A1A] font-semibold">Perfect Fit:</strong> Slides on easily with slight resistance while removing
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#B57A5A] shrink-0 mt-0.5 font-light">✧</span>
                  <span>
                    <strong className="text-[#1A1A1A] font-semibold">Too Tight:</strong> Feels uncomfortable or leaves pressure marks
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#B57A5A] shrink-0 mt-0.5 font-light">✧</span>
                  <span>
                    <strong className="text-[#1A1A1A] font-semibold">Too Loose:</strong> Spins excessively or risks slipping off
                  </span>
                </li>
              </ul>
            </div>

            <p className="text-xs text-gray-500 font-jakarta mt-8 leading-relaxed border-t border-gray-200/40 pt-4 font-light">
              When in doubt, we recommend choosing a size that offers <strong className="text-[#1A1A1A] font-semibold">comfort without compromising security</strong>.
            </p>
          </div>

          {/* Resizing Info Card */}
          <div className="bg-white border border-gray-200/60 rounded-sm p-8 shadow-[0_2px_12px_rgba(0,0,0,0.015)] flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-el-messiri font-normal tracking-wide text-[#1A1A1A] mb-1">
                Resizing Information
              </h3>
              <span className="text-xs tracking-[0.15em] text-gray-500 font-jakarta uppercase font-bold block mb-6">
                DESIGNED TO FIT BEAUTIFULLY
              </span>

              <p className="text-sm text-gray-500 font-jakarta leading-relaxed mb-4 font-light">
                Certain ring designs may allow <strong className="text-[#1A1A1A] font-semibold">minor resizing</strong>, depending on the style and craftsmanship.
              </p>

              <p className="text-sm text-[#1A1A1A] font-medium mb-3">Please note:</p>

              <ul className="space-y-3 text-xs text-gray-500 font-jakarta leading-relaxed font-light">
                <li className="flex items-start gap-2">
                  <span className="text-[#1A1A1A] font-bold">•</span>
                  <span>Resizing eligibility may vary by design</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1A1A1A] font-bold">•</span>
                  <span>
                    Rings altered or resized by <strong className="text-[#1A1A1A] font-semibold">unauthorized third parties</strong> may not qualify for exchange or after-sales support
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ─── Brand Slogan Suffix ─── */}
        <div className="text-center pt-8 max-w-xl mx-auto">
          <p className="text-base font-el-messiri italic text-gray-500 font-jakarta leading-relaxed">
            Because Every Aura Jewels Ring Should Feel As Perfect As The Moment It Celebrates
          </p>
        </div>

      </div>
    </div>
  );
};

export default RingSizeGuidePage;
