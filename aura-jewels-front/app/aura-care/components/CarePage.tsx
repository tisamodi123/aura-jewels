'use client';

// Custom SVGs matching the brand and screenshots
const SparklesHeaderIcon = () => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    className="w-12 h-12 text-[#A96D56] stroke-[1.2]"
  >
    {/* Main Sparkle */}
    <path
      d="M24 6c0 9 3 12 12 12-9 0-12 3-12 12 0-9-3-12-12-12 9 0 12-3 12-12z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Small Sparkle */}
    <path
      d="M36 26c0 4 1 5 5 5-4 0-5 1-5 5 0-4-1-5-5-5 4 0 5-1 5-5z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SparklesIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    className="w-6 h-6 text-[#A96D56] stroke-[1.2]"
  >
    <path
      d="M12 3c0 4.5 1.5 6 6 6-4.5 0-6 1.5-6 6 0-4.5-1.5-6-6-6 4.5 0 6-1.5 6-6z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 13c0 2 .5 2.5 2.5 2.5-2 0-2.5.5-2.5 2.5 0-2-.5-2.5-2.5-2.5 2-.03 2.5-.5 2.5-2.5z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const HeartIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    className="w-6 h-6 text-[#A96D56] stroke-[1.2]"
  >
    <path
      d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BoxIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    className="w-6 h-6 text-[#A96D56] stroke-[1.2]"
  >
    {/* Hexagonal box outline representing jewellery storage box */}
    <path
      d="M12 2L2 7l10 5 10-5-10-5Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 17l10 5 10-5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 12l10 5 10-5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 12v10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AlertIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    className="w-6 h-6 text-[#A96D56] stroke-[1.2]"
  >
    <path
      d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="12"
      y1="9"
      x2="12"
      y2="13"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="12"
      y1="17"
      x2="12.01"
      y2="17"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CarePage = () => {
  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] py-16 px-6">
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-1000">

        {/* ─── Hero Header ─── */}
        <div className="text-center space-y-5">
          <div className="flex justify-center mb-2">
            <SparklesHeaderIcon />
          </div>
          <h1 className="text-3xl md:text-4xl font-el-messiri tracking-wide text-[#1A1A1A]">
            Aura Jewels Care
          </h1>
          <span className="text-xs tracking-[0.2em] text-[#A96D56] font-semibold uppercase block">
            A LIFETIME OF BRILLIANCE, BEAUTIFULLY PRESERVED
          </span>
          <p className="text-gray-500 font-jakarta leading-relaxed font-light text-sm md:text-lg max-w-3xl mx-auto pt-2">
            Every Aura Jewels creation is more than jewellery — it is a reflection of memories, milestones, and timeless emotions. Crafted with care and designed to last, your jewellery deserves thoughtful attention to preserve its brilliance for generations to come.
          </p>
          <p className="text-gray-500 font-jakarta leading-relaxed font-light text-sm md:text-lg max-w-3xl mx-auto">
            With a few mindful rituals, your treasured piece can continue to shine as beautifully as the moments it represents.
          </p>
        </div>

        {/* ─── Card 1: Everyday Care Rituals ─── */}
        <div className="bg-white border border-gray-200/60 rounded-sm p-8 md:p-12 shadow-[0_2px_12px_rgba(0,0,0,0.015)] space-y-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <HeartIcon />
              <h2 className="text-2xl font-el-messiri font-medium tracking-wide text-[#1A1A1A]">
                Everyday Care Rituals
              </h2>
            </div>
            <span className="text-xs tracking-[0.15em] text-gray-500 font-jakarta uppercase font-bold block">
              WEAR WITH LOVE, PRESERVE WITH CARE
            </span>
          </div>

          <p className="text-lg text-gray-500 font-jakarta leading-relaxed">
            To maintain the beauty and longevity of your jewellery, we recommend making it the <strong className="text-[#1A1A1A] font-semibold">last thing you wear and the first thing you remove.</strong>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pt-2 border-t border-gray-200/40">
            {/* Protect Its Beauty */}
            <div className="space-y-4">
              <h3 className="text-2xl font-el-messiri text-[#1A1A1A] tracking-wide">
                Protect Its Beauty
              </h3>
              <ul className="space-y-4 text-sm md:text-lg text-gray-500 font-jakarta list-disc pl-4 marker:text-gray-500 font-jakarta/70">
                <li className="leading-relaxed">
                  Avoid direct exposure to <strong className="text-[#1A1A1A] font-semibold">perfumes, lotions, cosmetics, chemicals, water, and moisture</strong>
                </li>
                <li className="leading-relaxed">
                  Remove jewellery before <strong className="text-[#1A1A1A] font-semibold">showering, swimming, exercising, household chores, or strenuous activities</strong>
                </li>
                <li className="leading-relaxed">
                  Prevent impact with <strong className="text-[#1A1A1A] font-semibold">hard surfaces</strong> to protect delicate settings
                </li>
              </ul>
            </div>

            {/* Preserve Its Brilliance */}
            <div className="space-y-4">
              <h3 className="text-2xl font-el-messiri text-[#1A1A1A] tracking-wide">
                Preserve Its Brilliance
              </h3>
              <ul className="space-y-4 text-sm md:text-lg text-gray-500 font-jakarta list-disc pl-4 marker:text-gray-500 font-jakarta/70">
                <li className="leading-relaxed">
                  Gently wipe your jewellery after every wear using a <strong className="text-[#1A1A1A] font-semibold">soft, lint-free cloth</strong> to remove oils and moisture
                </li>
                <li className="leading-relaxed">
                  Clean occasionally using <strong className="text-[#1A1A1A] font-semibold">mild soap and lukewarm water</strong>
                </li>
                <li className="leading-relaxed">
                  Dry thoroughly and handle <strong className="text-[#1A1A1A] font-semibold">with care</strong> to maintain its natural radiance
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ─── Card 2: Storing Your Treasures ─── */}
        <div className="bg-white border border-gray-200/60 rounded-sm p-8 md:p-12 shadow-[0_2px_12px_rgba(0,0,0,0.015)] space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BoxIcon />
              <h2 className="text-2xl font-el-messiri font-medium tracking-wide text-[#1A1A1A]">
                Storing Your Treasures
              </h2>
            </div>
            <span className="text-xs tracking-[0.15em] text-gray-500 font-jakarta uppercase font-bold block">
              EVERY PRECIOUS PIECE DESERVES ITS OWN PLACE
            </span>
          </div>

          <p className="text-sm md:text-lg text-gray-500 font-jakarta leading-relaxed">
            Proper storage helps preserve the beauty of your jewellery over time.
          </p>

          <ul className="space-y-4 text-sm md:text-lg text-gray-500 font-jakarta list-disc pl-4 marker:text-gray-500 font-jakarta/70 pt-2 border-t border-gray-200/40">
            <li className="leading-relaxed">
              Store each piece <strong className="text-[#1A1A1A] font-semibold">separately</strong> to prevent scratches and tangling
            </li>
            <li className="leading-relaxed">
              Keep jewellery in a <strong className="text-[#1A1A1A] font-semibold">cool, dry environment</strong>, away from humidity and direct sunlight
            </li>
            <li className="leading-relaxed">
              Use your <strong className="text-[#1A1A1A] font-semibold">Aura Jewels jewellery box or pouch</strong> for optimal protection and long-lasting care
            </li>
          </ul>
        </div>

        {/* ─── Card 3: The Nature Of Diamonds ─── */}
        <div className="bg-white border border-gray-200/60 rounded-sm p-8 md:p-12 shadow-[0_2px_12px_rgba(0,0,0,0.015)] space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <SparklesIcon />
              <h2 className="text-2xl font-el-messiri font-medium tracking-wide text-[#1A1A1A]">
                The Nature Of Diamonds
              </h2>
            </div>
            <span className="text-xs tracking-[0.15em] text-gray-500 font-jakarta uppercase font-bold block">
              TIMELESS, YET WORTH CARING FOR
            </span>
          </div>

          <div className="space-y-4 text-sm md:text-lg text-gray-500 font-jakarta leading-relaxed pt-2 border-t border-gray-200/40 font-light">
            <p>
              Diamonds are among nature&apos;s most enduring treasures, celebrated for their remarkable strength and brilliance. Yet, even the finest diamonds deserve gentle care.
            </p>
            <p>
              While highly durable, diamonds may chip or loosen under strong impact. Regular cleaning and mindful handling will help preserve their exceptional sparkle for years to come.
            </p>
          </div>
        </div>

        {/* ─── Card 4: Important Care Note ─── */}
        <div className="bg-white border border-gray-200/60 rounded-sm p-8 md:p-12 shadow-[0_2px_12px_rgba(0,0,0,0.015)] space-y-6">
          <div className="flex items-center gap-2">
            <AlertIcon />
            <h2 className="text-2xl font-el-messiri font-medium tracking-wide text-[#1A1A1A]">
              Important Care Note
            </h2>
          </div>

          <ul className="space-y-4 text-sm md:text-lg text-gray-500 font-jakarta list-disc pl-4 marker:text-gray-500 font-jakarta/70 pt-2 border-t border-gray-200/40">
            <li className="leading-relaxed">
              Natural signs of wear, minor scratches, or changes arising from everyday use are considered part of normal ageing and do not constitute manufacturing defects.
            </li>
            <li className="leading-relaxed">
              Aura Jewels shall not be liable for damage resulting from misuse, negligence, accidental impact, improper storage, or repairs undertaken by unauthorized third parties.
            </li>
          </ul>

          <div className="pt-8 px-8 border-t border-gray-200/40 text-center">
            <p className="text-lg md:text-2xl font-el-messiri text-gray-500 font-jakarta leading-relaxed">
              Care For Your Jewellery, And It Will Continue To Tell Your Story Beautifully — For A Lifetime
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CarePage;
