
import Image from 'next/image';
import { PREFIX } from '@/lib/constants';
import Link from 'next/link';

const BespokeSection = ({ customCTA }: { customCTA?: any }) => {
    if (!customCTA || customCTA.status === 'SUSPENDED') {
        return null;
    }

    const title = customCTA.title || customCTA.name;
    const subTitle = customCTA.description || customCTA.subTitle || customCTA.bannerSubTitle;
    const imageSrc = customCTA.image || customCTA.bannerImage || customCTA.bannerImage1;
    const buttonText = customCTA.buttonText || customCTA.btnText1;
    const buttonLink = customCTA.buttonLink || customCTA.btnLink1;

    return (
        <section className="flex flex-col md:flex-row w-full min-h-[350px] md:min-h-[400px]">
            {/* Left Side: Image — guarded: Next <Image> throws on an empty src,
                which would blank the whole section if the CTA has no image. */}
            <div className="w-full md:w-1/2 relative min-h-[300px] md:min-h-full bg-stone-100">
                {imageSrc && (
                    <Image
                        src={imageSrc}
                        alt={title || ''}
                        fill
                        className="object-cover"
                        unoptimized
                    />
                )}
            </div>

            {/* Right Side: Content */}
            <div className="w-full md:w-1/2 bg-[#F2F2F2] flex flex-col justify-center items-center md:items-start p-10 md:p-16 lg:px-24 text-center md:text-left">
                <div className="max-w-md">
                    <h2 className="text-3xl md:text-4xl lg:text-3xl serif mb-5 text-[#1A1A1A] leading-tight">
                        {title}
                    </h2>
                    {subTitle && (
                        <p className="text-[13px] md:text-[14px] lg:text-[15px] text-gray-600 dm-sans font-light mb-8 leading-relaxed">
                            {subTitle}
                        </p>
                    )}
                    {buttonText && (
                        <Link href={buttonLink || "#"}>
                            <button className="bg-[#013D3D] text-white px-8 py-2.5 text-[14px] font-medium hover:bg-[#012A2A] transition-colors tracking-wide">
                                {buttonText}
                            </button>
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
};

export default BespokeSection;
