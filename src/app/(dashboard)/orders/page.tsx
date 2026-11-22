"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Eye,
  Clock,
  Truck,
  IndianRupee,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  PageHeader,
  SearchBar,
  StatusBadge,
  toast,
} from "@/components/common";
import { useOrdersStore } from "@/lib/store";
import { formatCurrency, getRelativeTime, getInitials } from "@/lib/utils";
import type { OrderStatus } from "@/types";

export default function OrdersPage() {
  const { orders, updateOrderStatus } = useOrdersStore();

  const [activeTab, setActiveTab] = useState<OrderStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectOrderId, setRejectOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("Item out of stock");

  // Summary counts
  const newOrdersCount = orders.filter((o) => o.status === "new").length;
  const acceptedCount = orders.filter((o) => o.status === "accepted").length;
  const preparingCount = orders.filter((o) => o.status === "preparing").length;
  const readyCount = orders.filter((o) => o.status === "ready").length;
  const completedCount = orders.filter((o) => o.status === "completed").length;
  const cancelledCount = orders.filter((o) => o.status === "cancelled").length;
  const completedTodayRev = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + o.total, 0);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesTab = activeTab === "all" || o.status === activeTab;
      const matchesSearch =
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer.phone.includes(searchQuery);

      return matchesTab && matchesSearch;
    });
  }, [orders, activeTab, searchQuery]);

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
    toast.success(`Order status updated to ${status.toUpperCase()}`);
  };

  const handleRejectConfirm = () => {
    if (rejectOrderId) {
      updateOrderStatus(rejectOrderId, "cancelled");
      toast.warning(`Order rejected (${rejectReason})`);
      setRejectOrderId(null);
    }
  };

  const tabs: { label: string; value: OrderStatus | "all"; count?: number }[] = [
    { label: "All Orders", value: "all", count: orders.length },
    { label: "New", value: "new", count: newOrdersCount },
    { label: "Accepted", value: "accepted", count: acceptedCount },
    { label: "Preparing", value: "preparing", count: preparingCount },
    { label: "Ready", value: "ready", count: readyCount },
    { label: "Completed", value: "completed", count: completedCount },
    { label: "Cancelled", value: "cancelled", count: cancelledCount },
  ];

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Orders Dispatch & Fulfillment"
        subtitle="Live local commerce order queue, status transitions and delivery rider handovers."
      />

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-purple-100/70 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Incoming Requests</p>
            <h3 className="text-2xl font-black text-purple-700 mt-0.5">{newOrdersCount}</h3>
            <span className="text-[11px] text-purple-600 font-medium">Awaiting acceptance</span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-100/70 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">In Kitchen / Packing</p>
            <h3 className="text-2xl font-black text-amber-600 mt-0.5">{preparingCount}</h3>
            <span className="text-[11px] text-amber-700 font-medium">Being prepared</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-100/70 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Ready for Pickup</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-0.5">{readyCount}</h3>
            <span className="text-[11px] text-emerald-700 font-medium">Ready at counter</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-100/70 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Dispatched Revenue</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">
              {formatCurrency(completedTodayRev)}
            </h3>
            <span className="text-[11px] text-slate-400">Completed today</span>
          </div>
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-purple-100/70 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    isActive
                      ? "bg-purple-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-purple-50 hover:text-purple-700"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        isActive
                          ? "bg-white text-purple-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="w-full lg:w-72">
            <SearchBar
              placeholder="Search Order # or customer..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-purple-100/70 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3.5">Order ID & Date</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Items Summary</th>
                <th className="px-5 py-3.5">Fulfillment</th>
                <th className="px-5 py-3.5">Total Amount</th>
                <th className="px-5 py-3.5">Payment</th>
                <th className="px-5 py-3.5">Workflow Status</th>
                <th className="px-5 py-3.5 text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const statusColors: Record<OrderStatus, "purple" | "info" | "warning" | "success" | "error" | "neutral"> = {
                    new: "purple",
                    accepted: "info",
                    preparing: "warning",
                    ready: "warning",
                    completed: "success",
                    cancelled: "error",
                  };

                  return (
                    <tr key={order.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="px-5 py-4">
                        <Link
                          href={`/orders/${order.id}`}
                          className="font-bold text-purple-600 hover:text-purple-800 hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                        <p className="text-[11px] text-slate-400">
                          {getRelativeTime(order.createdAt)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center shrink-0">
                            {getInitials(order.customer.name)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs leading-snug">
                              {order.customer.name}
                            </p>
                            <p className="text-[11px] text-slate-400">{order.customer.phone}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-xs font-semibold text-slate-800">
                          {order.items.length} {order.items.length === 1 ? "item" : "items"}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                          {order.items.map((i) => i.productName).join(", ")}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 capitalize">
                          {order.deliveryType}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-900 text-xs">
                        {formatCurrency(order.total)}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge
                          variant={order.paymentStatus === "paid" ? "success" : "warning"}
                          size="sm"
                        >
                          {order.paymentStatus.toUpperCase()}
                        </StatusBadge>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge variant={statusColors[order.status]} size="sm">
                          {order.status.replace("_", " ").toUpperCase()}
                        </StatusBadge>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {order.status === "new" && (
                            <>
                              <button
                                onClick={() => handleStatusChange(order.id, "accepted")}
                                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => setRejectOrderId(order.id)}
                                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {order.status === "accepted" && (
                            <button
                              onClick={() => handleStatusChange(order.id, "preparing")}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors"
                            >
                              Pack Order
                            </button>
                          )}

                          {order.status === "preparing" && (
                            <button
                              onClick={() => handleStatusChange(order.id, "ready")}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
                            >
                              Mark Ready
                            </button>
                          )}

                          {order.status === "ready" && (
                            <button
                              onClick={() => handleStatusChange(order.id, "completed")}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                            >
                              Handover
                            </button>
                          )}

                          <Link
                            href={`/orders/${order.id}`}
                            className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors ml-1"
                            title="View Full Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <ShoppingBag className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-800">No orders found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      No orders in the &ldquo;{activeTab}&rdquo; filter queue.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Order Reason Dialog */}
      <Dialog.Root open={Boolean(rejectOrderId)} onOpenChange={(open) => !open && setRejectOrderId(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm animate-in fade-in-0 duration-200" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in-0 zoom-in-95 duration-200 focus:outline-none">
            <Dialog.Title className="text-lg font-bold text-slate-900 mb-1">
              Decline Order
            </Dialog.Title>
            <Dialog.Description className="text-xs text-slate-400 mb-4">
              Select reason for rejecting this customer request.
            </Dialog.Description>

            <div className="space-y-3">
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-white"
              >
                <option value="Item out of stock">One or more items out of stock</option>
                <option value="Store closing soon">Store closing / kitchen offline</option>
                <option value="Delivery address out of radius">Delivery destination beyond range</option>
                <option value="Pricing mistake">Price / catalog revision required</option>
              </select>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectOrderId(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRejectConfirm}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Decline Order
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

