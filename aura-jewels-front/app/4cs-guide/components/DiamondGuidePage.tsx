
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';

// ─── SVG DIAMOND LOGO/ICON ──────────────────────────────────────────────────
const DiamondHeaderIcon = () => (
    <svg viewBox="0 0 100 100" className="w-12 h-12 text-[#B57A5A] stroke-[1.2]" fill="none" stroke="currentColor">
        {/* Table & Crown */}
        <path d="M 30 25 L 70 25 L 90 45 L 10 45 Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 30 25 L 40 45 M 70 25 L 60 45 M 50 25 L 50 45" strokeLinecap="round" strokeLinejoin="round" />
        {/* Pavilion */}
        <path d="M 10 45 L 50 85 L 90 45" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 40 45 L 50 85 M 60 45 L 50 85" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// ─── HIGH-FIDELITY CUT DIAGRAM SVG ──────────────────────────────────────────
const CutDiagramSVG = () => {
    return (
        <div className="w-full bg-[#f6f5f0] border border-neutral-border/20 rounded-sm p-6 md:p-8 flex items-center justify-center aspect-[1.4] md:aspect-[1.5]">
            <svg viewBox="0 0 400 240" className="w-full h-full overflow-visible">
                {/* ─── SHALLOW CUT (LEFT) ─── */}
                <g transform="translate(10, 20)">
                    {/* Label */}
                    <text x="90" y="25" textAnchor="middle" className="text-xs font-jakarta tracking-widest fill-[#1A1A1A] font-medium uppercase">
                        SHALLOW
                    </text>

                    {/* Diamond Outline */}
                    {/* Table: 45,60 to 135,60 | Girdle Left: 20,95 | Girdle Right: 160,95 | Culet: 90,165 */}
                    <path d="M 45 60 L 135 60 L 160 95 L 90 165 L 20 95 Z" fill="none" stroke="#b5b4ad" strokeWidth="1.5" />

                    {/* Crown facets */}
                    <path d="M 45 60 L 60 95 M 135 60 L 120 95" stroke="#b5b4ad" strokeWidth="1.2" />
                    <path d="M 20 95 L 160 95" stroke="#b5b4ad" strokeWidth="1.2" />

                    {/* Pavilion facets */}
                    <path d="M 60 95 L 90 165 M 120 95 L 90 165" stroke="#b5b4ad" strokeWidth="1.2" />

                    {/* Light Rays */}
                    {/* Ray entering from top vertically, hitting left pavilion, and refracting down-left out of the diamond */}
                    <g>
                        {/* Downward light path */}
                        <path d="M 55 10 L 55 95 L 85 125 L 110 200" fill="none" stroke="#B57A5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                        {/* Direction Arrow */}
                        <path d="M 108 190 L 110 200 L 102 196" fill="none" stroke="#B57A5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                </g>

                {/* ─── IDEAL CUT (RIGHT) ─── */}
                <g transform="translate(210, 20)">
                    {/* Label */}
                    <text x="90" y="25" textAnchor="middle" className="text-xs font-jakarta tracking-widest fill-[#1A1A1A] font-medium uppercase">
                        IDEAL
                    </text>

                    {/* Diamond Outline */}
                    {/* Table: 45,60 to 135,60 | Girdle Left: 20,95 | Girdle Right: 160,95 | Culet: 90,175 */}
                    <path d="M 45 60 L 135 60 L 160 95 L 90 175 L 20 95 Z" fill="none" stroke="#b5b4ad" strokeWidth="1.5" />

                    {/* Crown facets */}
                    <path d="M 45 60 L 60 95 M 135 60 L 120 95" stroke="#b5b4ad" strokeWidth="1.2" />
                    <path d="M 20 95 L 160 95" stroke="#b5b4ad" strokeWidth="1.2" />

                    {/* Pavilion facets */}
                    <path d="M 60 95 L 90 175 M 120 95 L 90 175" stroke="#b5b4ad" strokeWidth="1.2" />

                    {/* Light Rays */}
                    {/* Ray entering from top vertically, bouncing horizontally off left pavilion to right pavilion, and reflecting out of the crown */}
                    <g>
                        {/* Reflecting light path */}
                        <path d="M 55 10 L 55 95 L 125 155 L 60 120 L 78 50 L 90 15" fill="none" stroke="#B57A5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                        {/* Direction Arrow */}
                        <path d="M 85 25 L 90 15 L 93 25" fill="none" stroke="#B57A5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                </g>
            </svg>
        </div>
    );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const DiamondGuidePage = () => {
    return (
        <div className="min-h-screen bg-white text-[#1A1A1A] font-jakarta antialiased">

            {/* ── HERO HEADER ── */}
            <section className="max-w-4xl mx-auto text-center px-6 pt-16 pb-12">
                <div className="flex justify-center mb-6">
                    <DiamondHeaderIcon />
                </div>
                <span className="text-md tracking-widest text-[#1A1A1A] font-jakarta font-medium uppercase">
                    Diamond Education
                </span>
                <h1 className="text-3xl md:text-4xl lg:text-5xl el-messiri font-normal tracking-wide text-[#1A1A1A] mt-3 mb-6">
                    The 4 Cs Explained
                </h1>
                <p className="text-md text-gray-500 leading-relaxed max-w-2xl mx-auto">
                    Understanding Cut, Color, Clarity, and Carat weight is essential to finding the perfect diamond.
                    Our guide demystifies the universal standard for assessing diamond quality.
                </p>
            </section>

            {/* ── THE 4CS SECTIONS ── */}
            <div className="max-w-5xl mx-auto px-6 pb-24 space-y-24">

                {/* 1. CUT SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center border-t border-neutral-border pt-12">
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-3xl md:text-4xl el-messiri font-normal text-[#1A1A1A] mb-1">
                                Cut
                            </h2>
                            <span className="text-sm tracking-widest text-[#1A1A1A] font-jakarta font-medium uppercase">
                                THE SPARKLE FACTOR
                            </span>
                        </div>
                        <p className="text-md text-gray-500 leading-relaxed">
                            Often considered the most important of the 4Cs, cut determines how well a diamond
                            interacts with light. An Excellent cut allows light to strike each pavilion facet,
                            bounce back, and exit the crown, creating optimal brilliance and fire.
                        </p>

                        {/* Cut Specifications Table */}
                        <div className="space-y-4 pt-2">
                            {[
                                { key: 'Excellent / Ideal:', val: 'Maximum brilliance.' },
                                { key: 'Very Good:', val: 'Superior sparkle.' },
                                { key: 'Good:', val: 'Good sparkle, larger size for the price.' }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 text-sm">
                                    <span className="font-semibold text-[#1A1A1A] w-full sm:w-36 flex-shrink-0">
                                        {item.key}
                                    </span>
                                    <span className="text-gray-500 font-light">
                                        {item.val}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cut Diagram Visual */}
                    <div className="order-1 md:order-2 relative aspect-[1.4] md:aspect-[1.2] w-full bg-stone-100 rounded-sm overflow-hidden border border-neutral-border/20">
                        <Image
                            src={getImageUrl("/images/Cut.jpg")}
                            alt="Colorless vs Yellow Diamond Comparison"
                            fill
                            className="object-cover"
                            sizes="(max-w-768px) 100vw, 50vw"
                        />
                    </div>
                </div>

                {/* 2. COLOR SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center border-t border-neutral-border pt-12">
                    {/* Visual on the Left */}
                    <div className="order-2 md:order-1 relative aspect-[1.4] md:aspect-[1.2] w-full bg-stone-100 rounded-sm overflow-hidden border border-neutral-border/20">
                        <Image
                            src={getImageUrl("/images/Color.jpg")}
                            alt="Colorless vs Yellow Diamond Comparison"
                            fill
                            className="object-cover"
                            sizes="(max-w-768px) 100vw, 50vw"
                        />
                    </div>

                    {/* Text on the Right */}
                    <div className="space-y-6 order-1 md:order-2">
                        <div>
                            <h2 className="text-3xl md:text-4xl el-messiri font-normal text-[#1A1A1A] mb-1">
                                Color
                            </h2>
                            <span className="text-sm tracking-widest text-[#1A1A1A] font-jakarta font-medium uppercase">
                                THE ABSENCE OF COLOR
                            </span>
                        </div>
                        <p className="text-md text-gray-500 leading-relaxed">
                            Diamond color is actually graded on the absence of color. The D–to–Z scale measures how close
                            a diamond is to being completely colorless. Less color means higher value and brighter appearance.
                        </p>

                        {/* Color Specifications Table */}
                        <div className="space-y-4 pt-2">
                            {[
                                { key: 'D, E, F:', val: 'Colorless. The rarest and highest quality.' },
                                { key: 'G, H, I, J:', val: 'Near Colorless. Excellent value, color is barely perceptible.' },
                                { key: 'K, L, M:', val: 'Faint Yellow. Noticeable warmth.' }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 text-sm">
                                    <span className="font-semibold text-[#1A1A1A] w-full sm:w-28 flex-shrink-0">
                                        {item.key}
                                    </span>
                                    <span className="text-gray-500 font-light">
                                        {item.val}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. CLARITY SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center border-t border-neutral-border pt-12">
                    {/* Text on the Left */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-3xl md:text-4xl el-messiri font-normal text-[#1A1A1A] mb-1">
                                Clarity
                            </h2>
                            <span className="text-sm tracking-widest text-[#1A1A1A] font-jakarta font-medium uppercase">
                                PURITY BENEATH THE SURFACE
                            </span>
                        </div>
                        <p className="text-md text-gray-500 leading-relaxed">
                            Clarity measures the presence of natural microscopic imperfections, known as inclusions
                            (internal) and blemishes (external). Flawless diamonds are exceedingly rare. Most inclusions
                            are invisible to the naked eye.
                        </p>

                        {/* Clarity Specifications Table */}
                        <div className="space-y-4 pt-2">
                            {[
                                { key: 'FL, IF:', val: 'Flawless, Internally Flawless. No visible inclusions under 10x magnification.' },
                                { key: 'VVS1, VVS2:', val: 'Very, Very Slightly Included. Minuscule inclusions.' },
                                { key: 'VS1, VS2:', val: 'Very Slightly Included. Eye-clean, excellent value.' },
                                { key: 'SI1, SI2:', val: 'Slightly Included. May be noticeable to the eye.' }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 text-sm">
                                    <span className="font-semibold text-[#1A1A1A] w-full sm:w-28 flex-shrink-0">
                                        {item.key}
                                    </span>
                                    <span className="text-gray-500 font-light">
                                        {item.val}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Visual on the Right */}
                    <div className="order-1 md:order-2  relative aspect-[1.4] md:aspect-[1.2] w-full bg-stone-100 rounded-sm overflow-hidden border border-neutral-border/20">
                        <Image
                            src={getImageUrl("/images/Clarity.jpg")}
                            alt="Flawless vs Included Diamond Under Tweezers"
                            fill
                            className="object-cover"
                            sizes="(max-w-768px) 100vw, 50vw"
                        />
                    </div>
                </div>

                {/* 4. CARAT SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center border-t border-neutral-border pt-12">
                    {/* Visual on the Left */}
                    <div className="order-2 md:order-1 relative aspect-[1.4] md:aspect-[1.2] w-full bg-stone-100 rounded-sm overflow-hidden border border-neutral-border/20">
                        <Image
                            src={getImageUrl("/images/Carat.jpg")}
                            alt="Carat Size Weight Comparison on Hand"
                            fill
                            className="object-cover"
                            sizes="(max-w-768px) 100vw, 50vw"
                        />
                    </div>

                    {/* Text on the Right */}
                    <div className="space-y-6 order-1 md:order-2">
                        <div>
                            <h2 className="text-3xl md:text-4xl el-messiri font-normal text-[#1A1A1A] mb-1">
                                Carat
                            </h2>
                            <span className="text-sm tracking-widest text-[#1A1A1A] font-jakarta font-medium uppercase">
                                MEASURE OF WEIGHT
                            </span>
                        </div>
                        <p className="text-md text-gray-500 leading-relaxed">
                            Carat is a measure of the diamond&apos;s weight, not its physical size or dimensions. While a higher
                            carat weight generally means a larger diamond, the cut also plays a massive role in how large a diamond appears.
                        </p>
                        <p className="text-md text-gray-500 leading-relaxed">
                            One carat is split into 100 &quot;points&quot;. For example, a 0.50 carat diamond is referred to as a &quot;50-pointer&quot;.
                            At Aura Jewels, lab-grown diamonds let you choose a bigger diamond for the same budget compared to a mined diamond.
                        </p>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default DiamondGuidePage;
