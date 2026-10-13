"use client";

import { useState } from "react";
import { ResponsiveContainer, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Calendar } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

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

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "#6366F1", // Soft blue
  },
};

export default function LineGraph() {
  const [timeRange, setTimeRange] = useState("Last 30 Days");

  return (
    <div className="flex flex-col border border-gray-200 bg-white shadow-sm rounded-md p-5">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b">
        <h2 className="text-lg font-semibold text-gray-700">Total Revenue</h2>
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <span>Online Store Sessions – 1</span> |
          <span>Total Sales: ₹10,618.82</span> |
          <span>Total Orders – 1</span> |
          <span>Conversion Rate: 0%</span>
        </div>
        {/* Date Range Selector */}
        <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded shadow-sm hover:bg-gray-200">
          <Calendar className="w-4 h-4" />
          {timeRange}
        </button>
      </div>

      {/* Chart Container - Fully Responsive */}
      <ChartContainer config={chartConfig} className="p-4 w-full h-auto">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              padding={{ left: 20, right: 20 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              domain={[0, 40]}
              ticks={[0, 10, 20, 30, 40]}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
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
      </ChartContainer>
    </div>
  );
}
