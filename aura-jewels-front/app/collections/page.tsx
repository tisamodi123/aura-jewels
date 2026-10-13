import type { Metadata } from 'next';
import Link from 'next/link';
import { getCollections } from '@/services/productService';
import { STATUS_CODE } from '@/lib/constants';

export const revalidate = 0;

export const metadata: Metadata = {
    title: "Jewellery Collections | Aura Jewels Luxury Lab-Grown Diamonds",
    description: "Explore Aura Jewels's curated luxury lab-grown diamond jewellery collections. Meticulously crafted rings, necklaces, earrings, and bespoke pieces.",
    openGraph: {
        title: "Jewellery Collections | Aura Jewels",
        description: "Explore Aura Jewels's curated luxury lab-grown diamond jewellery collections.",
        url: "https://Aura Jewels.co/collections",
        siteName: "Aura Jewels",
    },
};

interface CollectionItem {
    _id?: string;
    name?: string;
    slug?: string;
    image?: string;
    description?: string;
    pageBanner?: { image?: string; imageMobile?: string; heading?: string; subText?: string };
}

export default async function Collections() {
    let collections: CollectionItem[] = [];

    try {
        const res = await getCollections();
        if (res && (res.errorCode === STATUS_CODE.OK || res.status === STATUS_CODE.OK)) {
            collections = Array.isArray(res.data) ? res.data : [];
        }
    } catch (error) {
        console.error('Failed to load collections on server:', error);
    }

    return (
        <div className="animate-fadeIn bg-white pb-24">
            {/* Editorial Header */}
            <section className="py-24 md:py-32 bg-gray-50 border-b border-gray-100">
                <div className="mx-auto px-6 md:px-12 text-center">
                    <p className="text-[11px] tracking-[0.8em] uppercase text-[#013D3D] font-bold font-jakarta mb-8">Aura Jewels Anthologies</p>
                    <h1 className="text-5xl md:text-8xl serif leading-tight text-[#1A1A1A] mb-8">Curated Brilliance.</h1>
                    <p className="text-gray-400 font-jakarta text-[16px] md:text-[18px] leading-relaxed max-w-2xl mx-auto font-light">
                        Each collection is a distinct chapter in our design legacy, crafted with meticulous precision for the modern individual.
                    </p>
                </div>
            </section>

            {/* Collections Grid */}
            <section className="py-20 md:py-24 px-6 md:px-12 max-w-7xl mx-auto">
                {collections.length === 0 ? (
                    <div className="text-center py-24">
                        <p className="text-gray-400 font-jakarta text-lg mb-6">Our collections are being curated. Please check back soon.</p>
                        <Link href="/all" className="text-[11px] uppercase tracking-[0.4em] font-black text-[#013D3D] font-jakarta underline underline-offset-8">
                            Explore All Jewellery
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                        {collections.map((collection, idx) => {
                            const href = collection.slug ? `/collection/${collection.slug}` : '/all';
                            const image = collection.image || collection.pageBanner?.image || '';
                            const description = collection.description || collection.pageBanner?.subText || '';
                            return (
                                <Link
                                    key={collection._id || idx}
                                    href={href}
                                    className="group flex flex-col"
                                >
                                    {/* Square image */}
                                    <div className="relative aspect-square overflow-hidden bg-gray-100 shadow-sm">
                                        {image ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={image}
                                                alt={collection.name || 'Collection'}
                                                className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300 serif text-3xl text-center px-4">
                                                {collection.name}
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all" />
                                    </div>

                                    {/* Text */}
                                    <div className="pt-5 space-y-2">
                                        <h2 className="text-2xl md:text-[26px] serif leading-tight text-[#1A1A1A] group-hover:text-[#013D3D] transition-colors">
                                            {collection.name}
                                        </h2>
                                        {description && (
                                            <p className="text-gray-500 font-jakarta text-[14px] leading-relaxed font-light line-clamp-2">
                                                {description}
                                            </p>
                                        )}
                                        <span className="inline-flex items-center gap-3 pt-2 text-[10px] uppercase tracking-[0.35em] font-black text-[#1A1A1A] font-jakarta">
                                            Explore
                                            <span className="w-8 h-[1px] bg-gray-300 transition-all group-hover:w-14 group-hover:bg-[#013D3D]" />
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Bottom CTA */}
            <section className="py-32 bg-[#1A1A1A] text-white">
                <div className="mx-auto px-6 md:px-12 text-center space-y-12">
                    <p className="text-[11px] tracking-[0.6em] uppercase text-white/40 font-bold font-jakarta">Beyond the Anthology</p>
                    <h2 className="text-4xl md:text-6xl serif leading-tight">Can&apos;t find your story? <br />Let&apos;s write it together.</h2>
                    <Link
                        href="/custom-jewellery"
                        className="inline-block px-16 py-6 bg-white text-black font-black uppercase tracking-[0.4em] text-[11px] font-jakarta hover:bg-[#013D3D] hover:text-white transition-all shadow-2xl"
                    >
                        Start Your Bespoke Journey
                    </Link>
                </div>
            </section>
        </div>
    );
}
