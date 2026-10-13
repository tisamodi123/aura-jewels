
import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl } from '@/lib/utils';

// Renders the CMS "Featured Collection" landing section (image + copy + CTA).
// Previously configurable in the admin but never served/rendered.
const FeaturedCollection = ({ featured }: { featured?: any }) => {
    if (!featured || featured.status === 'SUSPENDED' || (!featured.title && !featured.image)) {
        return null;
    }

    const eyebrow = featured.subtitle || featured.subTitle || '';
    const title = featured.title || '';
    const description = featured.description || '';
    const btnText = featured.btnText1 || featured.buttontext1 || '';
    const btnLink = featured.btnLink1 || featured.buttonlink1 || '';
    const image = getImageUrl(featured.image || featured.bannerImage);

    return (
        <section className="w-full px-6 md:px-12 py-10 md:py-14">
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="relative w-full aspect-[647/480] overflow-hidden rounded-sm bg-stone-100 order-1 md:order-none">
                    {image ? (
                        <Image src={image} alt={title} fill unoptimized sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
                    ) : null}
                </div>
                <div className="flex flex-col">
                    {eyebrow && (
                        <p className="text-[11px] uppercase tracking-[0.35em] text-[#013D3D] font-bold mb-3 font-jakarta">{eyebrow}</p>
                    )}
                    {title && <h2 className="text-3xl md:text-4xl serif text-[#1A1A1A] mb-4 leading-tight">{title}</h2>}
                    {description && <p className="text-[15px] text-gray-600 leading-relaxed dm-sans mb-6 max-w-md">{description}</p>}
                    {btnText && (
                        <Link href={btnLink || '#'} className="inline-block w-fit bg-[#013D3D] text-white text-[11px] uppercase tracking-widest font-bold px-8 py-3 hover:bg-black transition-all">
                            {btnText}
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
};

export default FeaturedCollection;
