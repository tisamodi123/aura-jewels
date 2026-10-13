"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import { API_BASE_URL, ENDPOINTS } from '@/lib/Api_Url';
import { STATUS_CODE } from '@/lib/constants';

interface OfferMeta {
    name?: string;
    description?: string;
    image?: string;
    imageMobile?: string;
}

const LIMIT = 12;

export default function OfferView({ slug }: { slug: string }) {
    const [offer, setOffer] = useState<OfferMeta | null>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const load = useCallback(async (pageNum: number) => {
        setLoading(true);
        try {
            const url = `${ENDPOINTS.OFFER.GET_BY_SLUG(slug)}?page=${pageNum}&limit=${LIMIT}`;
            const res = await fetch(url).then((r) => r.json());
            if (res?.errorCode === STATUS_CODE.OK && res.data) {
                setOffer(res.data.offer || null);
                setTotal(res.data.pagination?.total || 0);
                setProducts((prev) => (pageNum === 1 ? (res.data.products || []) : [...prev, ...(res.data.products || [])]));
            } else {
                setNotFound(true);
            }
        } catch (err) {
            console.error('offer load error:', err);
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => { load(1); }, [load]);

    const hasMore = products.length < total;

    if (notFound) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-6">
                <h1 className="font-serif text-2xl text-stone-800 mb-2">Offer not found</h1>
                <p className="text-stone-500 text-sm">This offer may have expired or been removed.</p>
            </div>
        );
    }

    return (
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10 py-8">
            {/* Banner */}
            {(offer?.image || offer?.name) && (
                <div className="mb-8">
                    {offer?.image ? (
                        <div className="relative w-full aspect-[1585/300] overflow-hidden rounded-lg bg-stone-100">
                            <Image src={offer.image} alt={offer.name || 'Offer'} fill unoptimized priority sizes="100vw" className="object-cover" />
                        </div>
                    ) : null}
                    <div className="mt-5 text-center">
                        <h1 className="font-serif text-2xl lg:text-3xl text-stone-900">{offer?.name}</h1>
                        {offer?.description && (
                            <p className="text-stone-500 text-sm mt-2 max-w-2xl mx-auto">{offer.description}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Product grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {loading && products.length === 0
                    ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
                    : products.map((item, i) => <ProductCard key={item._id || item.id || i} product={item} />)}
            </div>

            {!loading && products.length === 0 && (
                <div className="text-center text-stone-400 py-16">No products in this offer yet.</div>
            )}

            {hasMore && (
                <div className="text-center mt-10">
                    <button
                        type="button"
                        disabled={loading}
                        onClick={() => { const next = page + 1; setPage(next); load(next); }}
                        className="inline-flex items-center gap-2 border border-stone-300 px-6 py-2.5 text-sm uppercase tracking-wider text-stone-700 hover:border-[#013D3D] hover:text-[#013D3D] transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Loading…' : 'Load more'}
                    </button>
                </div>
            )}
        </div>
    );
}
