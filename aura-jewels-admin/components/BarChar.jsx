"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays,ChevronDown  } from 'lucide-react';

const data = [
  { date: "Dec 24", sales: 2.5, orders: 1 },
  { date: "Dec 27", sales: 2.5, orders: 1 },
  { date: "Dec 30", sales: 2.5, orders: 1 },
  { date: "Jan 2", sales: 2.5, orders: 1 },
  { date: "Jan 5", sales: 2.5, orders: 1 },
  { date: "Jan 8", sales: 2.5, orders: 1 },
  { date: "Jan 11", sales: 2.5, orders: 1 },
  { date: "Jan 14", sales: 2.5, orders: 1 },
  { date: "Jan 17", sales: 2.5, orders: 1 },
  { date: "Jan 20", sales: 2.5, orders: 1 },    
];

export default function CustomBarChart() {
  return (
    <div>
     <div className="flex justify-between items-center mb-9">
      <h1 className="text-lg font-semibold">Dashboard</h1>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-gray-600">
          <CalendarDays className="w-5 h-5" />
          <span>Last 30 Days</span>
        </button>
        <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-gray-600">
          <span>All Channels</span>
          <ChevronDown className= "w-5 h-5" />
        </button>
      </div>
    </div>

      <div className="grid grid-cols-2 gap-6">
        {[1, 2].map((key) => (
          <div key={key}>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <h2 className="text-sm font-semibold">Online Store Sessions</h2>
                  <p className="text-lg font-bold">1</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <h2 className="text-sm font-semibold">Total Sales</h2>
                  <p className="text-lg font-bold">₹10,618.82</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <h2 className="text-sm font-semibold">Total Orders</h2>
                  <p className="text-lg font-bold">1</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <h2 className="text-sm font-semibold">Conversion Rate</h2>
                  <p className="text-lg font-bold">0%</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#3B82F6" />
                    <Bar dataKey="orders" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
