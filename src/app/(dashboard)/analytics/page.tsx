"use client";

import React from "react";
import { Download } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  PageHeader,
  ChartCard,
  toast,
} from "@/components/common";
import {
  monthlySalesData,
  categoryPerformance,
  orderStatusData,
  topProducts,
} from "@/mock/data";
import { formatCurrency } from "@/lib/utils";

export default function AnalyticsPage() {
  const customerRetentionData = [
    { month: "Jun", newCust: 32, returningCust: 68 },
    { month: "Jul", newCust: 40, returningCust: 75 },
    { month: "Aug", newCust: 45, returningCust: 85 },
    { month: "Sep", newCust: 52, returningCust: 95 },
    { month: "Oct", newCust: 58, returningCust: 110 },
    { month: "Nov", newCust: 64, returningCust: 125 },
  ];

  const aovTrendData = [
    { month: "Jun", aov: 720 },
    { month: "Jul", aov: 745 },
    { month: "Aug", aov: 780 },
    { month: "Sep", aov: 810 },
    { month: "Oct", aov: 825 },
    { month: "Nov", aov: 832 },
  ];

  const handleExport = () => {
    toast.success("Comprehensive business analytics report downloaded.", "Analytics Exported");
  };

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Store Analytics & Insights"
        subtitle="Deep dive into sales velocity, order frequency, basket sizes and product performance metrics."
      >
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export Analytics CSV</span>
        </button>
      </PageHeader>

      {/* Row 1: Revenue & Order Trends (2 Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Revenue Growth Trend"
          subtitle="Monthly gross billing over calendar year"
          showFilters
          filterOptions={["6 Months", "1 Year", "All Time"]}
          defaultFilter="1 Year"
        >
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₹${v / 1000}k`}
                />
                <Tooltip
                  formatter={(v: unknown) => [formatCurrency(Number(v)), "Revenue"]}
                  contentStyle={{
                    backgroundColor: "#1e1b4b",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                    border: "none",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#7c3aed"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#7c3aed" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Order Volume Trajectory"
          subtitle="Monthly count of orders fulfilled"
          showFilters
          filterOptions={["6 Months", "1 Year"]}
          defaultFilter="1 Year"
        >
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(v: unknown) => [`${v} orders`, "Volume"]}
                  contentStyle={{
                    backgroundColor: "#1e1b4b",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                    border: "none",
                  }}
                />
                <Bar dataKey="orders" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Row 2: Category Breakdown & Order Status (2 Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <ChartCard
            title="Revenue Contribution by Product Department"
            subtitle="Total sales distribution across merchandise categories"
          >
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(v) => `₹${v / 1000}k`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#475569"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={90}
                  />
                  <Tooltip
                    formatter={(v: unknown) => [formatCurrency(Number(v)), "Revenue"]}
                    contentStyle={{
                      backgroundColor: "#1e1b4b",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                      border: "none",
                    }}
                  />
                  <Bar dataKey="revenue" fill="#6d28d9" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div className="lg:col-span-4">
          <ChartCard
            title="Order Fulfillment Split"
            subtitle="Overall status completion share"
          >
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={String(entry.fill || "#7c3aed")} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e1b4b",
                      borderRadius: "10px",
                      color: "#fff",
                      fontSize: "12px",
                      border: "none",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Row 3: Customer Trends (New vs Returning) & Average Order Value */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Customer Acquisition & Retention Velocity"
          subtitle="New neighbourhood buyers vs repeat shoppers"
        >
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerRetentionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e1b4b",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                    border: "none",
                  }}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="newCust" name="First-time Shoppers" fill="#c4b5fd" radius={[4, 4, 0, 0]} />
                <Bar dataKey="returningCust" name="Repeat Shoppers" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Average Order Value (AOV) Expansion"
          subtitle="Mean rupee spend per checkout basket"
        >
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={aovTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₹${v}`}
                  domain={[600, 900]}
                />
                <Tooltip
                  formatter={(v: unknown) => [formatCurrency(Number(v)), "Avg Basket Value"]}
                  contentStyle={{
                    backgroundColor: "#1e1b4b",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                    border: "none",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="aov"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#10b981" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Row 4: Top Performing Products Leaderboard Table */}
      <div className="bg-white rounded-2xl p-6 border border-purple-100/70 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Best-Selling Product Rankings</h3>
            <p className="text-xs text-slate-400">Products contributing highest unit velocity and revenue</p>
          </div>
          <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
            Top 5 SKUs
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-center">Units Sold</th>
                <th className="py-2.5 px-3 text-right">Gross Revenue Generated</th>
                <th className="py-2.5 px-3 text-right">Remaining Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topProducts.map((prod, idx) => (
                <tr key={prod.name} className="text-xs hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-3 font-black text-purple-700">#{idx + 1}</td>
                  <td className="py-3.5 px-3 font-bold text-slate-900">{prod.name}</td>
                  <td className="py-3.5 px-3 text-slate-500">{prod.category}</td>
                  <td className="py-3.5 px-3 text-center font-extrabold text-slate-800">
                    {prod.sold} units
                  </td>
                  <td className="py-3.5 px-3 text-right font-black text-slate-900">
                    {formatCurrency(prod.revenue)}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {prod.stock} in stock
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
