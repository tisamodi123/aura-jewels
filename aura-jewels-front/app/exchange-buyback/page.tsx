import ShippingReturns from "@/app/shipping-returns/_components/ShippingReturns";
import PolicyLayout from "@/components/common/PolicyLayout";
import { SWITCH_MODERN_DESIGN } from "@/config/policyConfig";

const Page = () => {
    return SWITCH_MODERN_DESIGN ? (
        <PolicyLayout defaultSlug="lifetime-exchange-policy" />
    ) : (
        <ShippingReturns defaultSlug="lifetime-exchange-policy" />
    );
};

export default Page;
