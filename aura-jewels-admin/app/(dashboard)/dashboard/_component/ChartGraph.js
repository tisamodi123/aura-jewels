"use client";

import React, { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { API_URL } from "@/lib/APIUrl";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";
import {
  ResponsiveContainer,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import { Calendar } from "lucide-react";
import { getToken } from "@/lib/auth";

const chartData = [
  { date: "Dec 24", revenue: 20 },
  { date: "Dec 27", revenue: 25 },
  { date: "Dec 30", revenue: 32 },
  { date: "Jan 02", revenue: 10 },
  { date: "Jan 05", revenue: 18 },
  { date: "Jan 08", revenue: 15 },
  { date: "Jan 11", revenue: 10 },
  { date: "Jan 14", revenue: 30 },
  { date: "Jan 17", revenue: 12 },
  { date: "Jan 20", revenue: 14 },
];

export default function RevenueChartSection() {
  const [timeRange, setTimeRange] = useState("Last 30 Days");
  const token = getToken()
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

  console.log(dashboardData, "DashboardData")

  return (
    <>
      {" "}
      {/* Revenue Chart Section */}
      <div className="border border-gray-200 bg-white shadow-sm rounded-md p-4">
        {/* Header */}
        <div className="flex flex-wrap items-center pb-4 border-b">
          {/* Title on the left */}
          <div className="text-[0.96rem] font-semibold cursor-pointer pr-3 ">
            Total Revenue
          </div>

          {/* Move this section to the right */}
          <div className="flex flex-wrap items-center gap-3 text-[0.96rem] font-semibold text-gray-600 mr-auto">
            |
            <span>Total Sales:  ${dashboardData?.totalordersales
              ? dashboardData?.totalordersales
              : 0}</span> |<span>Total Orders –  {dashboardData?.totalorder
                ? dashboardData?.totalorder
                : 0}</span>{" "}

          </div>

          {/* Date Range Selector */}
          <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded shadow-sm hover:bg-gray-200 ml-4">
            <Calendar className="w-4 h-4" />
            {timeRange}
          </button>
        </div>

        {/* Chart */}
        <div className="w-full min-h-[275px] mt-4">
          <ResponsiveContainer width="100%" height={275}>
            <LineChart
              data={chartData}
              margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 14, fill: "#374151", dy: 10 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 14, fill: "#374151" }}
                domain={[0, 40]}
                tickMargin={10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                  padding: "10px",
                }}
                labelStyle={{ color: "#374151", fontWeight: "bold" }}
                itemStyle={{ color: "#6366F1" }}
              />
              <Line
                dataKey="revenue"
                type="monotone"
                stroke="#6366F1"
                strokeWidth={2}
                dot={{ r: 5, fill: "#6366F1" }}
                activeDot={{ r: 6, strokeWidth: 2, fill: "#4F46E5" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
