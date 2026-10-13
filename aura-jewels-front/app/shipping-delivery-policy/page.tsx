import ShippingReturns from '@/app/shipping-returns/_components/ShippingReturns';
import PolicyLayout from '@/components/common/PolicyLayout';
import { SWITCH_MODERN_DESIGN } from '@/config/policyConfig';

export default function Page() {
  return SWITCH_MODERN_DESIGN ? (
    <PolicyLayout defaultSlug="shipping-delivery-policy" />
  ) : (
    <ShippingReturns defaultSlug="shipping-delivery-policy" />
  );
}
