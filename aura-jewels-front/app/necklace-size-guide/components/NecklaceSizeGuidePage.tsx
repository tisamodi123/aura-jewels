import React from 'react';
import { AlertTriangle } from 'lucide-react';

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

// Standard necklace lengths. Length is measured end-to-end including the clasp;
// matches the seeded necklace size master. 18" (Princess) is the most common /
// default ladies' length.
//
// Necklaces have no separate US / UK / AUS scale — every market names the same
// style at the same length, quoting inches (US) or centimetres (India, UK, AUS).
// So the inches column below IS the US / UK / AUS size; a fourth column would
// only repeat it.
const NECKLACE_CHART = [
  { style: 'Choker', inches: 14, cm: '35.5', sits: 'Snug around the neck' },
  { style: 'Princess', inches: 16, cm: '40.6', sits: 'At the base of the neck' },
  { style: 'Princess +', inches: 18, cm: '45.7', sits: 'On the collarbone', common: true },
  { style: 'Matinee', inches: 20, cm: '50.8', sits: 'Just below the collarbone' },
  { style: 'Opera', inches: 24, cm: '61.0', sits: 'On the chest' },
  { style: 'Long', inches: 28, cm: '71.0', sits: 'Below the bust' },
  { style: 'Long Temple', inches: 30, cm: '76.0', sits: 'Statement / temple length' },
  { style: 'Long Temple', inches: 32, cm: '81.0', sits: 'Statement / temple length' },
  { style: 'Long Temple', inches: 36, cm: '91.0', sits: 'Longest / layered look' },
];

const NecklaceSizeGuidePage = () => {
  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] font-jakarta antialiased py-10 px-6">
      <div className="max-w-[760px] mx-auto space-y-12">

        {/* ─── Hero Header ─── */}
        <div className="text-center space-y-5">
          <div className="flex justify-center mb-2">
            <RulerHeaderIcon />
          </div>
          <h1 className="text-3xl md:text-4xl font-el-messiri font-normal tracking-wide text-[#1A1A1A]">
            Aura Jewels Necklace Size Guide
          </h1>
          <span className="text-xs tracking-[0.2em] text-[#013D3D] font-semibold uppercase block">
            FIND YOUR PERFECT LENGTH
          </span>
          <p className="text-gray-500 font-jakarta leading-relaxed font-light text-sm md:text-base max-w-2xl mx-auto pt-2">
            Unlike rings, necklaces aren't sized — they're chosen by length. The right length flatters your
            neckline, complements your outfit, and lets your pendant sit exactly where you love it.
          </p>
          <p className="text-gray-500 font-jakarta leading-relaxed font-light text-sm md:text-base max-w-2xl mx-auto">
            Use the chart below to find the drop that suits you best.
          </p>
        </div>

        {/* ─── How to Measure ─── */}
        <div className="bg-white border border-gray-200/60 rounded-sm p-8 md:p-12 shadow-[0_2px_12px_rgba(0,0,0,0.015)]">
          <h2 className="text-2xl font-el-messiri font-normal tracking-wide text-[#1A1A1A] mb-1">
            How to Find Your Length
          </h2>
          <span className="text-xs tracking-[0.15em] text-gray-500 font-jakarta uppercase font-bold block mb-6">
            TWO SIMPLE METHODS
          </span>

          <p className="text-sm text-[#1A1A1A] font-semibold mb-4">
            Method 1: Measure an existing necklace
          </p>
          <ol className="space-y-4 text-sm text-gray-500 font-jakarta mb-8">
            <li className="flex items-start gap-3">
              <span className="text-gray-500 font-jakarta shrink-0">1.</span>
              <span>Take a necklace that sits where you like it</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gray-500 font-jakarta shrink-0">2.</span>
              <span>
                Lay it flat and measure end-to-end (including the clasp) in <strong className="text-[#1A1A1A] font-semibold">inches or centimetres</strong>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gray-500 font-jakarta shrink-0">3.</span>
              <span>Match it to the length chart below</span>
            </li>
          </ol>

          <p className="text-sm text-[#1A1A1A] font-semibold mb-4">
            Method 2: Measure your neck
          </p>
          <ol className="space-y-4 text-sm text-gray-500 font-jakarta mb-10">
            <li className="flex items-start gap-3">
              <span className="text-gray-500 font-jakarta shrink-0">1.</span>
              <span>
                Wrap a <strong className="text-[#1A1A1A] font-semibold">soft tape or string</strong> around the base of your neck
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gray-500 font-jakarta shrink-0">2.</span>
              <span>
                Add <strong className="text-[#1A1A1A] font-semibold">5–10 cm (2–4 in)</strong> depending on how low you want the necklace to sit
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gray-500 font-jakarta shrink-0">3.</span>
              <span>Choose the closest length from the chart</span>
            </li>
          </ol>

          {/* Length Chart Title */}
          <h3 className="text-xl font-el-messiri font-normal text-[#1A1A1A] mb-2">
            Necklace Length Chart
          </h3>
          <p className="text-xs text-gray-500 font-jakarta mb-6 leading-relaxed font-light">
            Necklace lengths and style names are the same in India, the US, the UK and Australia —
            there is no separate size scale. The US typically quotes inches; India, the UK and
            Australia quote centimetres. Both are shown below.
          </p>

          {/* Length Chart Table */}
          <div className="overflow-hidden border border-gray-200/60 rounded-sm mb-4">
            <div className="bg-gray-100 px-6 py-4 grid grid-cols-4 text-center border-b border-gray-200/60">
              <span className="text-xs font-bold tracking-wider text-[#1A1A1A] uppercase">Style</span>
              <span className="text-xs font-bold tracking-wider text-[#1A1A1A] uppercase">Inches (US)</span>
              <span className="text-xs font-bold tracking-wider text-[#1A1A1A] uppercase">CM (India / UK / AUS)</span>
              <span className="text-xs font-bold tracking-wider text-[#1A1A1A] uppercase">Where It Sits</span>
            </div>
            <div className="divide-y divide-neutral-border/40">
              {NECKLACE_CHART.map((row, idx) => (
                <div
                  key={idx}
                  className={`px-6 py-4 grid grid-cols-4 text-center text-sm text-[#1A1A1A] items-center ${row.common ? 'bg-[#013D3D]/5' : ''}`}
                >
                  <span className="font-bold text-[#1A1A1A]">
                    {row.style}
                    {/* {row.common && (
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#013D3D]">
                        Most Common
                      </span>
                    )} */}
                  </span>
                  <span className="font-light text-gray-500 font-jakarta">{row.inches}"</span>
                  <span className="font-light text-gray-500 font-jakarta">{row.cm}</span>
                  <span className="font-light text-gray-500 font-jakarta text-xs md:text-sm">{row.sits}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-gray-500 font-jakarta text-center italic font-light">
            A pendant typically hangs about 1 inch below the chain length shown — size up if you prefer a lower drop.
          </p>
        </div>

        {/* ─── Choosing by Neckline & Occasion ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Neckline Card */}
          <div className="bg-white border border-gray-200/60 rounded-sm p-8 shadow-[0_2px_12px_rgba(0,0,0,0.015)] flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-el-messiri font-normal tracking-wide text-[#1A1A1A] mb-1">
                Pairing With Necklines
              </h3>
              <span className="text-xs tracking-[0.15em] text-gray-500 font-jakarta uppercase font-bold block mb-6">
                LET YOUR OUTFIT GUIDE YOU
              </span>

              <ul className="space-y-5 text-sm text-gray-500 font-jakarta leading-relaxed font-light">
                <li>
                  <strong className="text-[#1A1A1A] font-semibold">Choker / 14–16" –</strong> High necklines, collars and boat necks
                </li>
                <li>
                  <strong className="text-[#1A1A1A] font-semibold">Princess / 18" –</strong> The versatile everyday length for most necklines
                </li>
                <li>
                  <strong className="text-[#1A1A1A] font-semibold">Matinee / 20" –</strong> Business and ethnic wear, higher collars
                </li>
                <li>
                  <strong className="text-[#1A1A1A] font-semibold">Opera & Longer / 24"+ –</strong> Deep necklines, layering and statement looks
                </li>
              </ul>
            </div>
          </div>

          {/* Fit / Styling Card */}
          <div className="bg-white border border-gray-200/60 rounded-sm p-8 shadow-[0_2px_12px_rgba(0,0,0,0.015)] flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-el-messiri font-normal tracking-wide text-[#1A1A1A] mb-1">
                A Few Helpful Tips
              </h3>
              <span className="text-xs tracking-[0.15em] text-gray-500 font-jakarta uppercase font-bold block mb-6">
                FOR THE PERFECT DROP
              </span>

              <ul className="space-y-4 text-sm text-gray-500 font-jakarta">
                <li className="flex items-start gap-3">
                  <span className="text-[#013D3D] shrink-0 mt-0.5 font-light">✧</span>
                  <span>Petite frames are flattered by shorter lengths (14–18")</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#013D3D] shrink-0 mt-0.5 font-light">✧</span>
                  <span>Longer lengths (20"+) elongate and suit fuller necklines</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#013D3D] shrink-0 mt-0.5 font-light">✧</span>
                  <span>Layering? Choose lengths at least 2" apart so each piece is visible</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#013D3D] shrink-0 mt-0.5 font-light">✧</span>
                  <span>Heavier pendants sit slightly lower — consider a shorter chain</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ─── Important Sizing Note ─── */}
        <div className="bg-white border border-gray-200/60 rounded-sm p-8 md:p-12 shadow-[0_2px_12px_rgba(0,0,0,0.015)]">
          <h2 className="text-2xl font-el-messiri font-normal tracking-wide text-[#1A1A1A] mb-2 flex items-center justify-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#013D3D] shrink-0" />
            Important Sizing Note
          </h2>
          <p className="text-sm text-gray-500 font-jakarta text-center mb-6 leading-relaxed">
            Selecting the right length ensures your necklace sits and drapes exactly as intended.
          </p>

          <p className="text-sm text-[#1A1A1A] font-medium mb-3">Please note:</p>

          <ul className="space-y-3 text-xs text-gray-500 font-jakarta leading-relaxed font-light">
            <li className="flex items-start gap-2">
              <span className="text-[#1A1A1A] font-bold">•</span>
              <span>Chain lengths include the clasp; the finished drop may vary slightly by design and pendant weight</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#1A1A1A] font-bold">•</span>
              <span>
                Aura Jewels shall not be responsible for length issues resulting from incorrect measurement or selection made by the customer
              </span>
            </li>
          </ul>
        </div>

        {/* ─── Brand Slogan Suffix ─── */}
        <div className="text-center pt-8 max-w-xl mx-auto">
          <p className="text-base font-el-messiri italic text-gray-500 font-jakarta leading-relaxed">
            Because The Right Length Turns A Necklace Into A Signature.
          </p>
        </div>

      </div>
    </div>
  );
};

export default NecklaceSizeGuidePage;
