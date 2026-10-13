import React from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';
import { PREFIX } from '@/lib/constants';

// ─── Reusable Sub-Components ──────────────────────────────────────────────────

interface ValuePropProps {
    title: string;
    description: string;
}

const ValueProp: React.FC<ValuePropProps> = ({ title, description }) => (
    <div className="flex flex-col">
        <h4 className="text-sm font-semibold uppercase font-jakarta  text-[#1A1A1A] mb-4">
            {title}
        </h4>
        <p className="text-sm text-gray-500 font-jakarta font-light leading-relaxed">
            {description}
        </p>
    </div>
);

interface ProcessSplitCardProps {
    /** Eyebrow label above the heading */
    tag: string;
    /** Section heading */
    heading: string;
    /** One or more body paragraphs */
    paragraphs: string[];
    /** Image src URL */
    image: string;
    /** Image alt text */
    imageAlt: string;
    /** When true the image appears on the right (text left). Default: image left */
    imageRight?: boolean;
}

const ProcessSplitCard: React.FC<ProcessSplitCardProps> = ({
    tag,
    heading,
    paragraphs,
    image,
    imageAlt,
    imageRight = false,
}) => {
    const imgEl = (
        <div className="relative aspect-[4/5] w-full bg-neutral-gray-light max-w-md mx-auto overflow-hidden">
            <Image src={image} alt={imageAlt} fill className="object-cover" />
        </div>
    );

    const textEl = (
        <div className="flex flex-col py-10">
            <span className="text-xs tracking-widest text-gray-500 font-jakarta font-medium uppercase mb-3">
                {tag}
            </span>
            <h3 className="text-2xl md:text-3xl el-messiri font-normal tracking-wide text-[#1A1A1A] mb-6">
                {heading}
            </h3>
            <div className="space-y-5 text-sm text-gray-500 dm-sans font-light leading-relaxed max-w-md">
                {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            </div>
        </div>
    );

    return (
        <section className="max-w-4xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
            {imageRight ? <>{textEl}{imgEl}</> : <>{imgEl}{textEl}</>}
        </section>
    );
};

// ─── Page ─────

const GrowingDiamondPage = () => {
    return (
        <div className="min-h-screen bg-white text-[#1A1A1A] antialiased">

            {/* SECTION 1: Banner Hero */}
            <section className="relative w-full overflow-hidden h-[280px] sm:h-[360px] md:h-[420px] lg:h-[480px]">
                <Image
                    src={getImageUrl("/images/Growing-Diamond-Hero.jpg")}
                    alt="Aura Jewels luxury lab-grown diamond rings and loose diamond diamonds"
                    fill
                    sizes="100vw"
                    className="object-cover object-center select-none pointer-events-none"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/40 to-transparent" />
                <div className="relative z-10 h-full max-w-[1440px] mx-auto px-6 sm:px-12 md:px-16 lg:px-24 flex flex-col justify-center">
                    <span className="text-xs tracking-widest text-gray-500 font-jakarta font-medium uppercase mb-3">
                        The Science Of Brilliance
                    </span>
                    <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl el-messiri font-normal tracking-wide text-[#1A1A1A] leading-tight">
                        Growing Diamonds
                    </h1>
                </div>
            </section>

            {/* SECTION 2: Central Philosophy Statement */}
            <section className="max-w-3xl mx-auto text-center px-6 py-8 md:py-12">
                <h2 className="text-3xl md:text-4xl el-messiri font-normal tracking-wide text-[#1A1A1A] mb-6 leading-snug">
                    Born From Technology, Indistinguishable By Nature.
                </h2>
                <p className="text-sm text-gray-500 font-jakarta font-light leading-relaxed max-w-2xl mx-auto">
                    Lab-grown diamonds are real diamonds. They are physically, chemically, and optically
                    identical to mined diamonds. The only difference is their origin—grown above ground using
                    cutting-edge technology that replicates the Earth's natural processes.
                </p>
            </section>

            {/* SECTION 3: CVD Process — image on right */}
            <ProcessSplitCard
                tag="The CVD Process"
                heading="Chemical Vapor Deposition"
                imageRight={true}
                image={PREFIX ? `${PREFIX}/images/Growing-Diamond-below-1.jpg` : `/images/Growing-Diamond-below-1.jpg`}
                imageAlt="CVD diamond growth chamber with plasma glow"
                paragraphs={[
                    "CVD begins with a tiny diamond 'seed' placed in a sealed chamber. The chamber is filled with carbon-rich gases (like methane) and heated to extreme temperatures.",
                    "Microwave energy breaks down the gases, causing carbon atoms to separate and rain down onto the diamond seed. Layer by layer, atom by atom, the diamond grows over several weeks into a beautiful, rough crystal.",
                ]}
            />

            {/* SECTION 4: HPHT Process — image on left */}
            <ProcessSplitCard
                tag="The HPHT Process"
                heading="High Pressure, High Temp"
                imageRight={false}
                image={PREFIX ? `${PREFIX}/images/Growing-Diamond-below-2.jpg` : `/images/Growing-Diamond-below-2.jpg`}
                imageAlt="Inspecting rough diamonds under a high-powered microscope"
                paragraphs={[
                    "HPHT mimics the exact extreme conditions that create diamonds deep within the Earth's mantle. A diamond seed is placed in a specialized press containing carbon material.",
                    "The press applies immense pressure (over 1.5 million pounds per square inch) and immense heat (over 2,600°F). The carbon melts and forms a crystalline structure around the seed, growing a diamond rough.",
                ]}
            />

            {/* SECTION 5: Benefits Grid */}
            <section className="max-w-5xl mx-auto px-6 md:px-6 py-10 md:py-12 mt-8">
                <h3 className="text-3xl el-messiri font-normal text-center tracking-wide text-[#1A1A1A] mb-6">
                    Why Choose Lab-Grown?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-12">
                    <ValueProp
                        title="Purity"
                        description="Type IIa diamonds are the purest form of diamonds, representing only 2% of mined diamonds. Almost all CVD lab-grown diamonds are Type IIa."
                    />
                    <ValueProp
                        title="Ethics & Environment"
                        description="Conflict-free guaranteed. They require significantly less land disruption and water usage compared to traditional mining operations."
                    />
                    <ValueProp
                        title="Value"
                        description="Because the supply chain is shorter and more efficient, lab-grown diamonds offer exceptional value, allowing you to choose larger, higher-quality diamonds."
                    />
                </div>
            </section>

        </div>
    );
};

export default GrowingDiamondPage;