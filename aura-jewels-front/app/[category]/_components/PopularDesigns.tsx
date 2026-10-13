'use client';

import ProductCard from '@/components/ProductCard';

const PopularDesigns = ({ popularDesigns, info }: { popularDesigns?: any[]; info?: any }) => {
    if (!popularDesigns || !Array.isArray(popularDesigns) || popularDesigns.length === 0) {
        return null;
    }

    const heading = info?.title || 'Our Most Popular Designs';
    const description = info?.description || '';

    return (
        <section className="py-16 px-6 md:px-12 bg-white">
            <div className=" mx-auto">
                <div className="text-left mb-10">
                    <h2 className="text-3xl md:text-3xl serif">{heading}</h2>
                    {description && <p className="text-gray-500 text-sm mt-2 max-w-2xl dm-sans">{description}</p>}
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                    {popularDesigns.map((product: any, idx: number) => (
                        <ProductCard key={product.id || product._id || idx} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PopularDesigns;
