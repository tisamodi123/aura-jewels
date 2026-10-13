import { Suspense } from 'react';
import OfferView from './OfferView';

type Props = {
    params: Promise<{ slug: string }>;
};

// Storefront offer landing page (/offer/<slug>). Menu links built with a
// "list → offer" redirect resolve here. slug | code | id all work.
export default async function OfferPage({ params }: Props) {
    const { slug } = await params;
    return (
        <div className="bg-white min-h-screen">
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center bg-white">
                    <div className="text-stone-400 font-medium animate-pulse">Loading Offer…</div>
                </div>
            }>
                <OfferView slug={slug} />
            </Suspense>
        </div>
    );
}
