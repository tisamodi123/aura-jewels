import React from 'react';
import ShippingReturns from './_components/ShippingReturns';
import PolicyLayout from '@/components/common/PolicyLayout';
import { SWITCH_MODERN_DESIGN } from '@/config/policyConfig';

const page = () => {
    return SWITCH_MODERN_DESIGN ? (
        <PolicyLayout defaultSlug="shipping-delivery-policy" />
    ) : (
        <ShippingReturns defaultSlug="shipping-delivery-policy" />
    );
};

export default page;