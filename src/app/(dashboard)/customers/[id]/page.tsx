"use client";

import React, { use, Suspense } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingBag,
  Phone,
  Mail,
} from "lucide-react";
import { StatusBadge } from "@/components/common";
import { useCustomersStore, useOrdersStore } from "@/lib/store";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";

function CustomerDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { customers, setCustomers } = useCustomersStore();
  const { orders, setOrders } = useOrdersStore();
  const [loading, setLoading] = React.useState(customers.length === 0);

  React.useEffect(() => {
    async function loadData() {
      try {
        if (customers.length === 0) {
          const res = await fetch("/api/customers");
          if (res.ok) {
            const data = await res.json();
            if (data.customers) setCustomers(data.customers);
          }
        }
        if (orders.length === 0) {
          const resO = await fetch("/api/orders");
          if (resO.ok) {
            const dataO = await resO.json();
            if (dataO.orders) setOrders(dataO.orders);
          }
        }
      } catch (err) {
        console.error("Failed to load customer details", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [customers.length, orders.length, setCustomers, setOrders]);

  const customer = customers.find((c) => c.id === id);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 text-sm">
        Loading customer profile from database...
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-purple-100 max-w-md mx-auto mt-12">
        <h2 className="text-xl font-bold text-slate-900">Customer Profile Not Found</h2>
        <Link href="/customers" className="mt-4 inline-block text-xs font-bold text-purple-600">
          Back to Customer Directory
        </Link>
      </div>
    );
  }

  // Filter orders matching customer
  const customerOrders = orders.filter((o) => o.customer.id === customer.id);
  const aov = customer.totalOrders > 0 ? Math.round(customer.totalSpent / customer.totalOrders) : 0;

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center gap-3 pb-2">
        <Link
          href="/customers"
          className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-purple-600 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Customer Profile: {customer.name}
          </h1>
          <p className="text-xs text-slate-400">
            Neighbourhood shopper history & lifetime store patronage analytics
          </p>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100/70 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md">
            {getInitials(customer.name)}
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">{customer.name}</h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-mono">
                <Phone className="w-3.5 h-3.5 text-purple-600" />
                {customer.phone}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-purple-600" />
                {customer.email || "Email unverified"}
              </span>
              <span>•</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                Member since {formatDate(customer.joinedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* 3 Metric Pills */}
        <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
          <div className="text-center px-4 py-2 rounded-xl bg-purple-50/70 border border-purple-100">
            <p className="text-[10px] font-bold text-purple-900 uppercase">Total Orders</p>
            <p className="text-xl font-black text-purple-700">{customer.totalOrders}</p>
          </div>
          <div className="text-center px-4 py-2 rounded-xl bg-purple-50/70 border border-purple-100">
            <p className="text-[10px] font-bold text-purple-900 uppercase">Lifetime Spend</p>
            <p className="text-xl font-black text-slate-900">{formatCurrency(customer.totalSpent)}</p>
          </div>
          <div className="text-center px-4 py-2 rounded-xl bg-purple-50/70 border border-purple-100">
            <p className="text-[10px] font-bold text-purple-900 uppercase">Average Order</p>
            <p className="text-xl font-black text-slate-900">{formatCurrency(aov)}</p>
          </div>
        </div>
      </div>

      {/* Customer Purchase History */}
      <div className="bg-white rounded-2xl p-6 border border-purple-100/70 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-purple-600" />
            <h3 className="text-base font-bold text-slate-900">Purchase Order History</h3>
          </div>
          <span className="text-xs text-slate-400">
            Showing recorded orders from this shopper
          </span>
        </div>

        {customerOrders.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {customerOrders.map((ord) => (
              <div key={ord.id} className="py-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/orders/${ord.id}`}
                      className="font-bold text-purple-600 hover:underline text-xs"
                    >
                      {ord.orderNumber}
                    </Link>
                    <StatusBadge
                      variant={
                        ord.status === "completed"
                          ? "success"
                          : ord.status === "cancelled"
                          ? "error"
                          : "purple"
                      }
                      size="sm"
                    >
                      {ord.status.toUpperCase()}
                    </StatusBadge>
                  </div>
                  <p className="text-xs text-slate-600">
                    {ord.items.map((i) => `${i.productName} (${i.quantity})`).join(", ")}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Ordered on {formatDate(ord.createdAt)} via {ord.paymentMethod.toUpperCase()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">
                    {formatCurrency(ord.total)}
                  </p>
                  <Link
                    href={`/orders/${ord.id}`}
                    className="text-[11px] font-semibold text-purple-600 hover:underline"
                  >
                    View Invoice
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            No live active orders on file for this customer yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading customer profile...</div>}>
      <CustomerDetailContent params={params} />
    </Suspense>
  );
}
