"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Download,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Package,
  ShoppingBag,
  IndianRupee,
  Clock,
  Star,
  Send,
} from "lucide-react";
import { toast } from "@/components/common";
import {
  useAuthStore,
  useOrdersStore,
} from "@/lib/store";
import type { OrderStatus } from "@/types";

export default function DashboardPage() {
  const { store, seller, updateStore } = useAuthStore();
  const { orders, updateOrderStatus } = useOrdersStore();

  const [dateRange, setDateRange] = useState<"all" | "today" | "week" | "month">("all");
  const [orderTab, setOrderTab] = useState<"all" | "new" | "preparing" | "ready" | "completed">("all");

  const isStoreOnline = store?.status === "online";

  const toggleStoreStatus = () => {
    const nextStatus = isStoreOnline ? "offline" : "online";
    updateStore({ status: nextStatus });
    if (nextStatus === "online") {
      toast.success("Store is now LIVE and accepting instant delivery orders.", "Store Online");
    } else {
      toast.warning("Store is paused. Customers cannot place new orders.", "Store Paused");
    }
  };

  // Filter orders by tab
  const activeOrders = orders.filter(
    (o) => o.status === "new" || o.status === "accepted" || o.status === "preparing" || o.status === "ready"
  );

  const displayedOrders = orders.filter((o) => {
    if (orderTab === "all") return o.status !== "cancelled";
    if (orderTab === "new") return o.status === "new" || o.status === "accepted";
    if (orderTab === "preparing") return o.status === "preparing";
    if (orderTab === "ready") return o.status === "ready";
    if (orderTab === "completed") return o.status === "completed";
    return true;
  });

  const newOrdersCount = orders.filter((o) => o.status === "new" || o.status === "accepted").length;
  const preparingCount = orders.filter((o) => o.status === "preparing").length;
  const readyCount = orders.filter((o) => o.status === "ready").length;
  const completedCount = orders.filter((o) => o.status === "completed").length;

  // Bredar Signature Customer Avatars for Engagement Banner
  const bannerCustomers = [
    {
      name: "Courtney Henry",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80",
    },
    {
      name: "Jenny Wilson",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80",
    },
    {
      name: "Cameron Williamson",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80",
    },
    {
      name: "Priya Sharma",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&auto=format&fit=crop&q=80",
    },
  ];

  // Bredar Top Products list
  const topProducts = [
    {
      name: "Fortune Sunlite Oil (5L)",
      category: "Edible Oil & Ghee",
      price: "₹650.00",
      stock: 8,
      sold: 412,
      image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100&auto=format&fit=crop&q=80",
    },
    {
      name: "India Gate Basmati Rice (5kg)",
      category: "Rice & Grains",
      price: "₹450.00",
      stock: 18,
      sold: 384,
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80",
    },
    {
      name: "Amul Fresh Butter (500g)",
      category: "Dairy & Eggs",
      price: "₹275.00",
      stock: 14,
      sold: 215,
      image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=100&auto=format&fit=crop&q=80",
    },
    {
      name: "Surf Excel Liquid (1L)",
      category: "Household Cleaning",
      price: "₹220.00",
      stock: 44,
      sold: 196,
      image: "https://images.unsplash.com/photo-1585842378054-ee2e52f94ba2?w=100&auto=format&fit=crop&q=80",
    },
  ];

  // Quick order status transition
  const handleQuickStatusUpdate = (orderId: string, currentStatus: OrderStatus) => {
    let nextStatus: OrderStatus = "accepted";
    if (currentStatus === "new" || currentStatus === "accepted") {
      nextStatus = "preparing";
      toast.success(`Order #${orderId} marked as Packing in store.`, "Order In Progress");
    } else if (currentStatus === "preparing") {
      nextStatus = "ready";
      toast.success(`Order #${orderId} packed and sealed. Ready for Rider Handover.`, "Ready for Handover");
    } else if (currentStatus === "ready") {
      nextStatus = "completed";
      toast.success(`Order #${orderId} handed over to SUVORA Express Rider.`, "Order Completed");
    }
    updateOrderStatus(orderId, nextStatus);
  };

  const handleExport = () => {
    toast.success("GST Sales Summary & Order Log downloaded as CSV.", "Report Exported");
  };

  const handleSendMessage = () => {
    toast.success("Personalized discount offer broadcasted to 291 active shoppers!", "Message Sent");
  };

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. BREDAR DASHBOARD HEADER                                      */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <button
              onClick={toggleStoreStatus}
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all border ${
                isStoreOnline
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
              }`}
              title="Click to toggle store live status"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isStoreOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                }`}
              />
              {isStoreOnline ? "Store is Live" : "Store Paused"}
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Welcome back, <span className="font-semibold text-slate-800">{seller?.name || "Rajesh Kumar"}</span> 👋 • Managing {store?.name || "FreshMart General Store"}, Koramangala Hub
          </p>
        </div>

        {/* Right side controls matching Bredar */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as "all" | "today" | "week" | "month")}
              className="appearance-none bg-white text-slate-800 text-xs font-semibold px-3.5 py-2 pr-8 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
            >
              <option value="all">All time</option>
              <option value="today">Today</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
          </button>

          <Link
            href="/products/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add product</span>
          </Link>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. BREDAR 4-CARD METRIC OVERVIEW ROW                            */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">₹48,250</span>
            <span className="inline-flex items-center text-xs font-bold text-emerald-600">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +37.8%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">vs ₹40,740 last month</p>
        </div>

        {/* Metric 2: Total Orders */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">1,842</span>
            <span className="inline-flex items-center text-xs font-bold text-emerald-600">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +12.4%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">68 today • 16 in progress</p>
        </div>

        {/* Metric 3: Avg Order Value */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Avg Order Value (AOV)</span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold text-xs">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">₹709.50</span>
            <span className="inline-flex items-center text-xs font-bold text-emerald-600">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +6.8%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">4.6 items average cart size</p>
        </div>

        {/* Metric 4: Dispatch SLA */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Dispatch SLA Speed</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">8.4 mins</span>
            <span className="inline-flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              ⚡ Fast SLA
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">SUVORA Target: &lt;15 mins</p>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. SIGNATURE BREDAR HERO COMPONENT: TOTAL CUSTOMERS & SPLINE   */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Hero Card (8 of 12 Cols): Total Customers & Spline Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">Total customers</span>
                <div className="flex items-baseline gap-3 mt-1.5">
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    68,192 customers
                  </h2>
                  <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                    ▲ 37.8% vs. Sept 8, 2021
                  </span>
                </div>
              </div>

              {/* Legends matching Bredar (2022 Blue line vs 2021 Dashed Yellow) */}
              <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-blue-600 rounded-full" />
                  This Year (2022)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-b border-dashed border-amber-500" />
                  Last Year (2021)
                </span>
              </div>
            </div>

            {/* Signature Bredar Spline Chart with Tooltip */}
            <div className="relative h-56 w-full pt-4">
              <svg viewBox="0 0 600 180" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="bredarBlueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                <line x1="0" y1="30" x2="600" y2="30" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="80" x2="600" y2="80" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="130" x2="600" y2="130" stroke="#F1F5F9" strokeWidth="1" />

                {/* 2021 Dashed Yellow Curve */}
                <path
                  d="M 10 130 Q 80 145 150 115 T 300 100 T 450 75 T 590 60"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  strokeOpacity="0.75"
                />

                {/* 2022 Primary Smooth Blue Curve */}
                <path
                  d="M 10 120 Q 80 135 150 90 T 300 65 T 450 85 T 590 40 L 590 170 L 10 170 Z"
                  fill="url(#bredarBlueGrad)"
                />
                <path
                  d="M 10 120 Q 80 135 150 90 T 300 65 T 450 85 T 590 40"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Highlight Point at May (x=300, y=65) */}
                <circle cx="300" cy="65" r="5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2.5" />
              </svg>

              {/* Floating Tooltip Card like Bredar */}
              <div
                className="absolute top-8 left-[45%] -translate-x-1/2 bg-white rounded-xl p-2.5 border border-slate-200 shadow-md text-xs pointer-events-none z-10"
              >
                <div className="font-bold text-slate-800 border-b border-slate-100 pb-1 mb-1">
                  May 2022
                </div>
                <div className="space-y-0.5 text-[11px]">
                  <div className="flex items-center justify-between gap-3 text-slate-600">
                    <span className="flex items-center gap-1 font-semibold text-blue-600">
                      ● 2022:
                    </span>
                    <span className="font-bold text-slate-900">3,500</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-slate-600">
                    <span className="flex items-center gap-1 font-semibold text-amber-500">
                      ● 2021:
                    </span>
                    <span className="font-bold text-slate-900">2,100</span>
                  </div>
                </div>
              </div>

              {/* Horizontal Month labels */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium px-2 mt-2">
                <span>Jan</span>
                <span>Mar</span>
                <span>May</span>
                <span>Jul</span>
                <span>Sep</span>
                <span>Nov</span>
              </div>
            </div>
          </div>

          {/* SIGNATURE BREDAR BOTTOM BANNER INSIDE CARD */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
            <div className="flex items-center gap-3">
              {/* Avatars group */}
              <div className="flex -space-x-2 overflow-hidden shrink-0">
                {bannerCustomers.map((c, i) => (
                  <img
                    key={i}
                    src={c.avatar}
                    alt={c.name}
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  />
                ))}
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-800">
                  Welcome 291 customers with a personal offer 😎
                </p>
                <p className="text-[11px] text-slate-500">Active shoppers in Koramangala &amp; HSR Hub</p>
              </div>
            </div>

            <button
              onClick={handleSendMessage}
              className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-2xs shrink-0 self-end sm:self-auto"
            >
              <Send className="w-3 h-3" />
              <span>Send message</span>
            </button>
          </div>
        </div>

        {/* Right Card (4 of 12 Cols): New Customers / Order Donut (Bredar Signature Donut) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900">New customers</h3>
              <span className="text-xs font-semibold text-slate-400">All time</span>
            </div>
            <p className="text-xs text-slate-500">Customer acquisition &amp; repeat ratio</p>

            {/* Signature Bredar Donut Chart */}
            <div className="relative h-48 w-full flex items-center justify-center my-4">
              <svg viewBox="0 0 100 100" className="w-40 h-40 transform -rotate-90">
                {/* Background Track */}
                <circle cx="50" cy="50" r="38" stroke="#F1F5F9" strokeWidth="12" fill="none" />
                {/* Returning Customers (Blue - 63%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#2563EB"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray="150 240"
                  strokeDashoffset="0"
                  strokeLinecap="round"
                />
                {/* New Customers (Yellow - 25%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#F59E0B"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray="60 240"
                  strokeDashoffset="-155"
                  strokeLinecap="round"
                />
                {/* Inactive / Dropoff (Coral - 12%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#EF4444"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray="25 240"
                  strokeDashoffset="-220"
                  strokeLinecap="round"
                />
              </svg>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-extrabold text-slate-900 leading-none">68%</span>
                <span className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                  Repeat
                </span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  Repeat Shoppers
                </span>
                <span className="font-bold text-slate-900">63%</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  New Customers
                </span>
                <span className="font-bold text-slate-900">25%</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  Inactive / Re-engage
                </span>
                <span className="font-bold text-slate-900">12%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. URGENT OPERATIONAL DISPATCH STRIP (Compact & Clean)         */}
      {/* ============================================================== */}
      <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-blue-100 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-800">10 Orders to Pack</span>
            <span className="text-[10px] text-slate-500">• SLA &lt; 15m</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-blue-100 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs font-bold text-slate-800">3 Low Stock Alerts</span>
            <span className="text-[10px] text-slate-500">• Fortune Oil, Tata Tea</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-blue-100 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span className="text-xs font-bold text-slate-800">3 Orders Ready</span>
            <span className="text-[10px] text-slate-500">• Rider arriving 3m</span>
          </div>
        </div>

        <button
          onClick={() => setOrderTab("new")}
          className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors self-end md:self-auto shrink-0"
        >
          <span>Process Active Orders Now</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ============================================================== */}
      {/* 5. MAIN WORKSPACE: TWO COLUMNS (7 of 12 Left, 5 of 12 Right)   */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 7 OF 12 (Live Orders Pipeline Table) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">Live Orders Pipeline</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-600">Real-time</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Fulfill incoming store requests instantly.</p>
              </div>

              {/* Status Tabs matching Bredar */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600 self-start sm:self-auto overflow-x-auto gap-1">
                <button
                  onClick={() => setOrderTab("all")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    orderTab === "all"
                      ? "bg-white text-slate-900 font-bold shadow-2xs"
                      : "hover:text-slate-900"
                  }`}
                >
                  All ({activeOrders.length})
                </button>
                <button
                  onClick={() => setOrderTab("new")}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    orderTab === "new"
                      ? "bg-white text-blue-600 font-bold shadow-2xs"
                      : "hover:text-slate-900"
                  }`}
                >
                  <span>New</span>
                  {newOrdersCount > 0 && (
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {newOrdersCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setOrderTab("preparing")}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    orderTab === "preparing"
                      ? "bg-white text-amber-600 font-bold shadow-2xs"
                      : "hover:text-slate-900"
                  }`}
                >
                  <span>Packing</span>
                  {preparingCount > 0 && (
                    <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {preparingCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setOrderTab("ready")}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    orderTab === "ready"
                      ? "bg-white text-emerald-600 font-bold shadow-2xs"
                      : "hover:text-slate-900"
                  }`}
                >
                  <span>Ready</span>
                  {readyCount > 0 && (
                    <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {readyCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setOrderTab("completed")}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    orderTab === "completed"
                      ? "bg-white text-slate-800 font-bold shadow-2xs"
                      : "hover:text-slate-900"
                  }`}
                >
                  <span>Completed</span>
                  {completedCount > 0 && (
                    <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {completedCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Orders Table Rows */}
            <div className="mt-3 divide-y divide-slate-100">
              {displayedOrders.slice(0, 4).map((order) => {
                const isNew = order.status === "new" || order.status === "accepted";
                const isPacking = order.status === "preparing";
                const isReady = order.status === "ready";

                return (
                  <div key={order.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 uppercase tracking-wider ${
                          isNew
                            ? "bg-blue-50 text-blue-600 border border-blue-200"
                            : isPacking
                            ? "bg-amber-50 text-amber-600 border border-amber-200"
                            : isReady
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {isNew ? "NEW" : isPacking ? "PACK" : isReady ? "READY" : "DONE"}
                      </span>
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-slate-900 block">
                          {order.orderNumber} • {order.customer.name}
                        </span>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {order.items.map((it) => `${it.productName} (${it.quantity}x)`).join(", ")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900 block">
                          ₹{order.total.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-600">
                          {order.paymentMethod.toUpperCase()} Paid
                        </span>
                      </div>

                      {isNew && (
                        <button
                          onClick={() => handleQuickStatusUpdate(order.id, order.status)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-2xs"
                        >
                          Accept
                        </button>
                      )}
                      {isPacking && (
                        <button
                          onClick={() => handleQuickStatusUpdate(order.id, order.status)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 transition-all shadow-2xs"
                        >
                          Pack
                        </button>
                      )}
                      {isReady && (
                        <button
                          onClick={() => handleQuickStatusUpdate(order.id, order.status)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-2xs"
                        >
                          Handover
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                Showing {Math.min(displayedOrders.length, 4)} of {orders.length} orders
              </span>
              <Link href="/orders" className="font-bold text-blue-600 hover:underline flex items-center gap-1 text-xs">
                <span>Open Dedicated Orders Manager</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 5 OF 12 (Top Products & Feedback Widget) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Top Selling Products */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Product views &amp; sales</h3>
              <Link href="/products" className="text-xs font-semibold text-blue-600 hover:underline">
                See all
              </Link>
            </div>

            {/* Table Header: Item | Stock | Solds */}
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 pb-2 border-b border-slate-100">
              <span className="flex-1">Item</span>
              <span className="w-16 text-center">Stock</span>
              <span className="w-16 text-right">Solds</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-100">
              {topProducts.map((prod, i) => (
                <div key={i} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-9 h-9 rounded-xl object-cover shrink-0 ring-1 ring-slate-100"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate leading-tight">
                        {prod.name}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{prod.price}</p>
                    </div>
                  </div>

                  <span
                    className={`w-16 text-center font-bold text-xs ${
                      prod.stock < 10 ? "text-red-600 bg-red-50 py-0.5 rounded-md" : "text-slate-800"
                    }`}
                  >
                    {prod.stock}
                  </span>

                  <span className="w-16 text-right font-bold text-xs text-slate-900">
                    {prod.sold}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Verified Customer Feedback (Bredar Comments Widget) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900">Recent Customer Review</span>
              <div className="flex items-center text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                alt="Reviewer"
                className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-100"
              />
              <div className="min-w-0 text-xs">
                <span className="font-bold text-slate-900">Priya Sharma</span>
                <span className="text-[10px] text-slate-400 ml-1.5">• Verified Quick Delivery</span>
                <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">
                  &ldquo;Fortune Oil and Basmati rice delivered in 11 minutes flat! Best grocery store in Koramangala.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
