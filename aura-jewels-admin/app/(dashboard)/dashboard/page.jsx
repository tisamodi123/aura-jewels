import dynamic from "next/dynamic";

import MetricSection from "./_component/MetricSection";
import RevenueChartSection from "./_component/ChartGraph";
// import RecentOrderSection from "./_component/RecentOrder";
// import AbondendCheckoutSection from "./_component/AbondendCheckout";
import LazyLoader from "@/hooks/LazyLoader";
import CurrentWishlistTable from "./_component/CurrentWishlist";
import { getCurrencylist } from "@/lib/utils";
import { getToken } from "@/lib/auth";
const RecentOrderSection = dynamic(() => import("./_component/RecentOrder"));
const CurrentCartTable = dynamic(() => import("./_component/CurrentCarts"));
const AbondendCheckoutSection = dynamic(() =>
  import("./_component/AbondendCheckout")
);

export default function Dashboard() {

  return (
    <div className="min-h-screen space-y-6 pb-6">
      <MetricSection />
      {/* <RevenueChartSection /> */}

      <div className="space-y-6">
        <LazyLoader>
          <RecentOrderSection />
        </LazyLoader>
        <LazyLoader>
          <CurrentCartTable />
        </LazyLoader>
        <LazyLoader>
          <CurrentWishlistTable />
        </LazyLoader>
      </div>
    </div>
  );
}
