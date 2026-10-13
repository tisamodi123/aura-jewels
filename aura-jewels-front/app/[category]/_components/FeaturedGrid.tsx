
import Image from 'next/image';
import Link from 'next/link';

// const features = [
//     {
//         title: 'Signature Engagement Rings & Bands',
//         image: `${PREFIX}/images/subcategory/c7.jpg`,
//         size: 'md:col-span-1'
//     },
//     {
//         title: 'Designed For Him',
//         image: `${PREFIX}/images/subcategory/c8.jpg`,
//         size: 'md:col-span-1'
//     },
//     {
//         title: 'Rings As Beautiful As Her',
//         image: `${PREFIX}/images/subcategory/c9.jpg`,
//         size: 'md:col-span-1'
//     },
//     {
//         title: 'Forever Wedding Rings & Bands',
//         image: `${PREFIX}/images/subcategory/c10.jpg`,
//         size: 'md:col-span-1'
//     }
// ];

const FeaturedGrid = ({ promoGrid, promoGridTitle }: { promoGrid?: any[]; promoGridTitle?: string | { title?: string; description?: string } }) => {
    // Sub-Banner title/description is a SEPARATE CMS section ("Double Promo Grid
    // Title") from the grid tiles. Resolve both independently — the title must
    // still render even when no tiles have been added yet.
    const titleText = typeof promoGridTitle === 'object' ? promoGridTitle?.title : promoGridTitle;
    const descriptionText = typeof promoGridTitle === 'object' ? promoGridTitle?.description : null;

    const activePromos = Array.isArray(promoGrid)
        ? promoGrid.filter((p: any) => p.status !== 'SUSPENDED')
        : [];

    // Nothing authored at all → render nothing.
    if (!titleText && activePromos.length === 0) {
        return null;
    }

    // Reverse the array to show in chronological order of creation (oldest first)
    const displayedPromos = [...activePromos].reverse();

    return (
        <section className="w-full">
            {titleText && (
                <div className="text-center py-6 bg-white border-b border-gray-50">
                    <h2 className="text-2xl md:text-3xl text-gray-900 ">{titleText}</h2>
                    {descriptionText && (
                        <p className="text-gray-500 text-sm mt-1 max-w-2xl mx-auto px-4 font-jakarta">{descriptionText}</p>
                    )}
                </div>
            )}
            {displayedPromos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-2 gap-0">
                    {displayedPromos.map((feature: any, idx: number) => {
                        const title = feature.title || feature.name || '';
                        const imageSrc = feature.image || feature.bannerImage || feature.bannerImage1 || '';
                        const link = feature.btnLink1 || feature.buttonlink1 || '';

                        const inner = (
                            <>
                                {imageSrc && (
                                    <Image
                                        src={imageSrc}
                                        alt={title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        className="object-cover group-hover:scale-105 transition-transform duration-[2000ms] ease-out"
                                        unoptimized
                                    />
                                )}
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500" />
                                <div className="absolute bottom-10 left-0 right-0 px-6 z-10 text-center">
                                    <h3 className="text-2xl md:text-3xl lg:text-2xl text-white serif max-w-md mx-auto leading-tight min-h-[64px] flex items-end justify-center">
                                        {title}
                                    </h3>
                                </div>
                            </>
                        );
                        const cls = 'relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden group cursor-pointer md:col-span-1 block';

                        return link
                            ? <Link key={idx} href={link} className={cls}>{inner}</Link>
                            : <div key={idx} className={cls}>{inner}</div>;
                    })}
                </div>
            )}
        </section>
    );
};

export default FeaturedGrid;
