"use client";
import React, { useCallback, useEffect, useState } from "react";
import { User, UserRoundCheck, IndianRupee } from "lucide-react";
import { API_URL } from "@/lib/APIUrl";
import { callApi } from "@/lib/callApi";
import { useRouter } from "next/navigation";
import { GiBigDiamondRing } from "react-icons/gi";
import { BsCartCheckFill } from "react-icons/bs";
import { STATUS_CODE } from "@/lib/Constant";
import { getToken } from "@/lib/auth";

// Compact e-commerce KPI row. Each card links to the relevant section.
function StatCard({ icon: Icon, label, value, accent, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all ${onClick ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5" : ""}`}
    >
      <div className="flex items-center justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${accent}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="mt-5 text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-[13px] font-medium text-gray-500">{label}</p>
    </div>
  );
}

export default function MetricSection() {
  const router = useRouter();
  const token = getToken();
  const [dashboardData, setDashboardData] = useState(null);

  const GetDashboardData = useCallback(async () => {
    try {
      const data = await callApi(`${API_URL.DASHBOARD_DATA}`, "GET", null, token);
      if (data.errorCode === STATUS_CODE.OK) {
        setDashboardData(data?.data);
      }
    } catch (err) {
      console.log("Error :", err);
    }
  }, [token]);

  useEffect(() => {
    GetDashboardData();
  }, [GetDashboardData]);

  const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
      <StatCard
        icon={BsCartCheckFill}
        label="Total Orders"
        value={dashboardData?.totalorder ?? 0}
        accent="bg-[#087B5D]/10 text-[#087B5D]"
        onClick={() => router.push("/orders")}
      />
      <StatCard
        icon={IndianRupee}
        label="Order Sales"
        value={inr(dashboardData?.totalordersales)}
        accent="bg-amber-100 text-amber-600"
      />
      <StatCard
        icon={GiBigDiamondRing}
        label="Total Jewellery"
        value={dashboardData?.totalJewelery ?? 0}
        accent="bg-indigo-100 text-indigo-600"
        onClick={() => router.push("/products/jewellery")}
      />
      <StatCard
        icon={User}
        label="Total Customers"
        value={dashboardData?.totalcustomer ?? 0}
        accent="bg-sky-100 text-sky-600"
        onClick={() => router.push("/customer-master")}
      />
      <StatCard
        icon={UserRoundCheck}
        label="Pending Verification"
        value={dashboardData?.pendingverifycustomer ?? 0}
        accent="bg-rose-100 text-rose-600"
      />
    </div>
  );
}
