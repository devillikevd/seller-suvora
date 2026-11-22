"use client";

import React, { useState } from "react";
import {
  IndianRupee,
  Download,
  CreditCard,
  CheckCircle2,
  ArrowDownLeft,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  PageHeader,
  StatusBadge,
  ChartCard,
  toast,
} from "@/components/common";
import { useFinanceStore } from "@/lib/store";
import { earningsChartData } from "@/mock/data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function EarningsPage() {
  const { transactions, settlements } = useFinanceStore();
  const [filterType, setFilterType] = useState<string>("all");

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === "all") return true;
    return t.type === filterType;
  });

  const handleDownload = () => {
    toast.success("GST and Earnings statement downloaded (PDF & CSV).", "Statement Exported");
  };

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Earnings & Settlements"
        subtitle="Transparent accounting of gross marketplace sales, platform commissions, refunds, and T+1 automated payouts."
      >
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Download Financial Report</span>
        </button>
      </PageHeader>


      {/* 7 Financial KPI Cards (2 Rows) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-purple-100/70 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Gross Sales</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">₹2,84,500</h3>
            <span className="text-[11px] text-emerald-600 font-semibold">+12.5% vs last month</span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-purple-100/70 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Platform Fee (5%)</p>
            <h3 className="text-2xl font-black text-slate-700 mt-1">₹14,225</h3>
            <span className="text-[11px] text-slate-400">Fixed merchant commission</span>
          </div>
          <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-purple-100/70 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Customer Refunds</p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">₹4,200</h3>
            <span className="text-[11px] text-slate-400">1.4% refund rate</span>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-gradient-to-tr from-purple-900 to-indigo-900 text-white p-5 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-purple-200 uppercase">Net Merchant Payout</p>
            <h3 className="text-2xl font-black text-white mt-1">₹2,66,075</h3>
            <span className="text-[11px] text-emerald-300 font-medium">93.5% realization</span>
          </div>
          <div className="p-3 bg-white/10 text-white rounded-xl backdrop-blur-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          </div>
        </div>
      </div>

      {/* Row 2 Settlement Sub-KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase">Pending Next Settlement</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-black text-amber-600">₹52,100</span>
            <span className="text-xs text-slate-400">(T+1 releasing tomorrow)</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase">Completed Bank Payouts</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-black text-emerald-600">₹2,13,975</span>
            <span className="text-xs text-slate-400">Direct NEFT transfers</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase">Registered Bank Account</p>
          <p className="text-xs font-bold text-slate-800 mt-1">
            HDFC Bank ••••••4521 (IFSC: HDFC0001234)
          </p>
        </div>
      </div>

      {/* Earnings Overview Area Chart */}
      <ChartCard
        title="Weekly Earnings Realization (Gross vs Net)"
        subtitle="Shows revenue before and after platform commission deduction"
        showFilters
        filterOptions={["This Month", "Last Quarter", "Year to Date"]}
        defaultFilter="This Month"
      >
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={earningsChartData}>
              <defs>
                <linearGradient id="grossGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `₹${val / 1000}k`}
              />
              <Tooltip
                formatter={(val: unknown) => [formatCurrency(Number(val)), ""]}
                contentStyle={{
                  backgroundColor: "#1e1b4b",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "12px",
                  border: "none",
                }}
              />
              <Legend verticalAlign="top" height={36} />
              <Area
                type="monotone"
                dataKey="gross"
                name="Gross Sales"
                stroke="#7c3aed"
                strokeWidth={2.5}
                fill="url(#grossGrad)"
              />
              <Area
                type="monotone"
                dataKey="net"
                name="Net Earnings"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#netGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Transactions Ledger */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-purple-100/70 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Transaction Ledger</h3>
              <p className="text-xs text-slate-400">Order-level debit and credit audit entries</p>
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5"
            >
              <option value="all">All Types</option>
              <option value="sale">Sales Only</option>
              <option value="commission">Commissions</option>
              <option value="refund">Refunds</option>
              <option value="payout">Bank Payouts</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Ref ID</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.slice(0, 8).map((txn) => {
                  const isCredit = txn.type === "sale" || txn.type === "payout";

                  return (
                    <tr key={txn.id} className="text-xs hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3 text-slate-400">
                        {formatDate(txn.date)}
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-700">
                        {txn.id}
                      </td>
                      <td className="py-3 px-3">
                        <span className="capitalize font-semibold text-slate-700 px-2 py-0.5 rounded-md bg-slate-100">
                          {txn.type}
                        </span>
                      </td>
                      <td className={`py-3 px-3 text-right font-bold ${
                        isCredit ? "text-emerald-700" : "text-rose-600"
                      }`}>
                        {isCredit ? "+" : "-"} {formatCurrency(txn.amount)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <StatusBadge
                          variant={txn.status === "completed" ? "success" : "warning"}
                          size="sm"
                        >
                          {txn.status.toUpperCase()}
                        </StatusBadge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (5 cols): Settlement Cycles */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-purple-100/70 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Settlement Cycles</h3>
            <p className="text-xs text-slate-400">Weekly bank transfer releases</p>
          </div>

          <div className="space-y-3">
            {settlements.map((stl) => (
              <div
                key={stl.id}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900">{stl.period}</p>
                    <StatusBadge
                      variant={stl.status === "completed" ? "success" : "warning"}
                      size="sm"
                    >
                      {stl.status.toUpperCase()}
                    </StatusBadge>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {stl.transactionCount} orders aggregated
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">
                    {formatCurrency(stl.amount)}
                  </p>
                  {stl.paidAt && (
                    <p className="text-[10px] text-emerald-600 font-semibold">
                      Paid on {formatDate(stl.paidAt)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

