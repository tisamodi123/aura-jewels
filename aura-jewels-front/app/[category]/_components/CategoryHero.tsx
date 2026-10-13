
import Image from 'next/image';
import { PREFIX } from '@/lib/constants';
import Link from 'next/link';

const CategoryHero = ({ category, heroBanner }: { category: string; heroBanner?: any }) => {
    const banner = Array.isArray(heroBanner) ? heroBanner[0] : heroBanner;
    if (!banner || banner.status === 'SUSPENDED') {
        return null;
    }

    const eyebrow = banner.subtitle || banner.subTitle || banner.bannerSubTitle || "";
    const title = banner.title || banner.bannerTitle || banner.name;
    const description = banner.description || "";
    const desktopImage = banner.image || banner.bannerImage || banner.bannerImage1 || `${PREFIX}/images/categoryImage/banner.jpg`;
    const mobileImage = banner.mobile_img || desktopImage;

    // CTA — the CMS stores it as btnText1/btnLink1 (btnLink1 is already the
    // resolved href from the RedirectPicker, falling back to the raw URL).
    const btnText = banner.btnText1 || banner.buttontext1 || banner.buttonText1 || "";
    const btnLink = banner.btnLink1 || banner.buttonlink1 || banner.buttonLink1 || "";

    // Text position — CMS stores values like "top-left", "center-left",
    // "button-buttom-right" (note the legacy "buttom" typo). Parse to alignment.
    const pos = String(banner.textposition || "").toLowerCase();
    const tokens = pos.replace(/button-?/g, "").split(/[-_ ]+/).filter(Boolean);
    const vTok = tokens.find((t: string) => ["top", "bottom", "buttom", "center", "middle"].includes(t)) || "top";
    const hTok = [...tokens].reverse().find((t: string) => ["left", "right", "center", "middle"].includes(t)) || "left";
    const vClass = vTok === "bottom" || vTok === "buttom" ? "justify-end" : (vTok === "center" || vTok === "middle") ? "justify-center" : "justify-start";
    const hClass = hTok === "right" ? "items-end text-right" : (hTok === "center" || hTok === "middle") ? "items-center text-center" : "items-start text-left";

    return (
        <section className="relative w-full min-h-[280px] md:h-[300px] lg:h-[350px] overflow-hidden">
            {/* Desktop Background Image */}
            <Image
                src={desktopImage}
                alt={title || "Category Banner"}
                fill
                className="hidden md:block object-cover"
                priority
                sizes="100vw"
                unoptimized
            />
            {/* Mobile Background Image */}
            <Image
                src={mobileImage}
                alt={title || "Category Banner"}
                fill
                className="block md:hidden object-cover"
                priority
                sizes="100vw"
                unoptimized
            />

            {/* Subtle Overlay for readability */}
            <div className="absolute inset-0 bg-black/15" />

            {/* Content — position driven by CMS textposition */}
            <div className={`relative z-10 w-full h-full mx-auto px-6 md:px-12 py-8 md:py-16 flex flex-col ${vClass} ${hClass}`}>
                <div className="max-w-2xl">
                    {eyebrow && (
                        <p className="text-[10px] md:text-[11px] uppercase tracking-[0.35em] text-white/80 font-bold mb-3 font-jakarta">
                            {eyebrow}
                        </p>
                    )}
                    <h1 className="text-3xl md:text-4xl lg:text-5xl text-white mb-4 serif leading-[1.1] capitalize">
                        {title}
                    </h1>

                    {description && (
                        <p className="text-[14px] md:text-[16px] text-white/90 dm-sans font-light tracking-wide max-w-lg leading-relaxed">
                            {description}
                        </p>
                    )}

                    {btnText && (
                        <Link
                            href={btnLink || "#"}
                            className="inline-block mt-6 bg-white text-black text-[11px] uppercase tracking-widest font-bold px-8 py-3 hover:bg-[#013D3D] hover:text-white transition-all"
                        >
                            {btnText}
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
};

export default CategoryHero;
