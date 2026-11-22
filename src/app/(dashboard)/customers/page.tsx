"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Eye,
  IndianRupee,
  Sparkles,
} from "lucide-react";
import { PageHeader, SearchBar } from "@/components/common";
import { useCustomersStore } from "@/lib/store";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";

export default function CustomersPage() {
  const { customers } = useCustomersStore();
  const [searchQuery, setSearchQuery] = useState("");

  const totalSpentAll = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgLifetimeSpend = customers.length > 0 ? Math.round(totalSpentAll / customers.length) : 0;
  const repeatCount = customers.filter((c) => c.totalOrders > 1).length;
  const repeatRate = customers.length > 0 ? ((repeatCount / customers.length) * 100).toFixed(1) : "0.0";

  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [customers, searchQuery]);

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Customer Directory"
        subtitle="Manage relationships with neighbourhood shoppers, frequent buyers and repeat customer profiles."
        badge={
          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
            {customers.length} verified shoppers
          </span>
        }
      />

      {/* Summary KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-purple-100/70 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Total Shoppers</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{customers.length}</h3>
            <span className="text-[11px] text-emerald-600 font-semibold">+14 new this month</span>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-purple-100/70 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Repeat Customer Rate</p>
            <h3 className="text-2xl font-black text-purple-700 mt-1">{repeatRate}%</h3>
            <span className="text-[11px] text-slate-400">Higher than city average</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-purple-100/70 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Avg Lifetime Spend</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(avgLifetimeSpend)}</h3>
            <span className="text-[11px] text-slate-400">Per registered customer</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-100 text-slate-700">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-purple-100/70 shadow-sm">
        <div className="w-full sm:w-80">
          <SearchBar
            placeholder="Search by customer name or phone..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-purple-100/70 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3.5">Customer Name</th>
                <th className="px-5 py-3.5">Contact (Masked)</th>
                <th className="px-5 py-3.5 text-center">Lifetime Orders</th>
                <th className="px-5 py-3.5 text-right">Total Spent</th>
                <th className="px-5 py-3.5">Last Order Placed</th>
                <th className="px-5 py-3.5">Customer Since</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((cust) => {
                  // Mask phone: +91 98*** **210
                  const maskedPhone =
                    cust.phone.length > 8
                      ? `${cust.phone.slice(0, 7)}***${cust.phone.slice(-3)}`
                      : cust.phone;

                  return (
                    <tr key={cust.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center shrink-0 border border-purple-200">
                            {getInitials(cust.name)}
                          </div>
                          <div>
                            <Link
                              href={`/customers/${cust.id}`}
                              className="font-bold text-slate-900 text-xs hover:text-purple-700 hover:underline"
                            >
                              {cust.name}
                            </Link>
                            {cust.email && (
                              <p className="text-[11px] text-slate-400">{cust.email}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-600 font-mono">
                        {maskedPhone}
                      </td>

                      <td className="px-5 py-4 text-center font-bold text-slate-900 text-xs">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800">
                          {cust.totalOrders} orders
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right font-black text-slate-900 text-xs">
                        {formatCurrency(cust.totalSpent)}
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-500">
                        {formatDate(cust.lastOrderDate)}
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-400">
                        {formatDate(cust.joinedAt)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/customers/${cust.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View History</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400">
                    No customers match your search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

