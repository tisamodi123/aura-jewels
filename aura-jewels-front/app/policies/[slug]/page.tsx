import React from 'react';
import ShippingReturns from '@/app/shipping-returns/_components/ShippingReturns';
import PolicyLayout from '@/components/common/PolicyLayout';
import { SWITCH_MODERN_DESIGN } from '@/config/policyConfig';
import policiesData from '@/data/policies';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return policiesData.map((policy) => ({
        slug: policy.slug,
    }));
}

export default async function Page({ params }: PageProps) {
    const { slug } = await params;
    const activeSlug = policiesData.some((p) => p.slug === slug) ? slug : policiesData[0].slug;
    return SWITCH_MODERN_DESIGN ? (
        <PolicyLayout defaultSlug={activeSlug} />
    ) : (
        <ShippingReturns defaultSlug={activeSlug} />
    );
}
