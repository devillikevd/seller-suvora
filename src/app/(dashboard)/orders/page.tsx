"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Eye,
  Clock,
  Truck,
  IndianRupee,
  Printer,
  Volume2,
  VolumeX,
  Receipt,
  X,
  CheckCircle2,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  PageHeader,
  SearchBar,
  StatusBadge,
  toast,
} from "@/components/common";
import { useOrdersStore, useAuthStore } from "@/lib/store";
import { formatCurrency, getRelativeTime, getInitials, formatDate } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

function playOrderChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.45);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.45);
  } catch {}
}

export default function OrdersPage() {
  const { orders, setOrders, updateOrderStatus } = useOrdersStore();
  const { store } = useAuthStore();

  const [activeTab, setActiveTab] = useState<OrderStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectOrderId, setRejectOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("Item out of stock");
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const previousNewCountRef = useRef(0);

  // Fetch real orders from database on mount & poll every 20s
  useEffect(() => {
    let isMounted = true;
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data.orders)) {
            const mappedOrders: Order[] = data.orders.map((o: any) => ({
              id: o.id,
              orderNumber: o.orderNumber,
              customer: {
                id: o.customer?.id || o.customerId,
                name: o.customer?.name || "Shopper",
                phone: o.customer?.phone || "+91 9000000000",
                address: o.customer?.address || "Customer delivery address",
                totalOrders: o.customer?.totalOrders || 1,
              },
              items: (o.items || []).map((it: any) => ({
                id: it.id,
                productId: it.productId,
                productName: it.productName,
                quantity: it.quantity,
                price: it.price,
                total: it.total,
              })),
              status: o.status as OrderStatus,
              deliveryType: "delivery",
              paymentMethod: o.paymentMethod || "upi",
              paymentStatus: o.paymentStatus || "paid",
              subtotal: o.subtotal,
              deliveryFee: o.deliveryFee,
              discount: o.discount || 0,
              tax: o.tax,
              total: o.total,
              timeline: o.timeline || [],
              createdAt: o.createdAt,
              updatedAt: o.updatedAt,
            }));

            setOrders(mappedOrders);

            // Check if new incoming orders arrived
            const currentNewCount = mappedOrders.filter((ord) => ord.status === "new").length;
            if (currentNewCount > previousNewCountRef.current) {
              if (soundEnabled) {
                playOrderChime();
                toast.info(`🔔 New order arrived! (${currentNewCount} pending)`, "Incoming Order Alert");
              }
            }
            previousNewCountRef.current = currentNewCount;
          }
        }
      } catch (err) {
        console.error("Failed to load orders from database:", err);
      }
    }

    fetchOrders();
    const interval = setInterval(fetchOrders, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [setOrders, soundEnabled]);

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

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        updateOrderStatus(orderId, status);
        toast.success(`Order status updated to ${status.toUpperCase()} in database!`);
      } else {
        toast.error("Failed to update order status in database.");
      }
    } catch {
      toast.error("Network error while updating order status.");
    }
  };

  const handleRejectConfirm = async () => {
    if (rejectOrderId) {
      try {
        const res = await fetch(`/api/orders/${rejectOrderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "cancelled", cancellationReason: rejectReason }),
        });
        if (res.ok) {
          updateOrderStatus(rejectOrderId, "cancelled");
          toast.warning(`Order rejected (${rejectReason})`);
        } else {
          toast.error("Failed to decline order.");
        }
      } catch {
        toast.error("Network error while declining order.");
      } finally {
        setRejectOrderId(null);
      }
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
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const nextState = !soundEnabled;
              setSoundEnabled(nextState);
              if (nextState) {
                playOrderChime();
                toast.success("Order audio chime enabled!");
              } else {
                toast.info("Order audio chime muted.");
              }
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              soundEnabled
                ? "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                : "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200"
            }`}
            title="Toggle incoming order audio siren alert"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-purple-600 animate-pulse" />
                <span>Audio Alert: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span>Audio Alert: OFF</span>
              </>
            )}
          </button>
        </div>
      </PageHeader>

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

                          <button
                            type="button"
                            onClick={() => setPrintOrder(order)}
                            className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors ml-1"
                            title="Print Thermal Bill / Packing KOT"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <Link
                            href={`/orders/${order.id}`}
                            className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
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

      {/* Thermal Bill & KOT Packing Slip Print Modal */}
      <Dialog.Root open={Boolean(printOrder)} onOpenChange={(open) => !open && setPrintOrder(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm animate-in fade-in-0 duration-200" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-sm translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in-0 zoom-in-95 duration-200 focus:outline-none">
            {printOrder && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-300">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-purple-600" />
                    <h3 className="text-sm font-bold text-slate-900">Thermal Packing Slip</h3>
                  </div>
                  <button
                    onClick={() => setPrintOrder(null)}
                    className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Printable 80mm Slip Format */}
                <div id="thermal-receipt" className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs space-y-3 text-slate-800">
                  <div className="text-center space-y-0.5 border-b border-dashed border-slate-300 pb-2">
                    <p className="font-extrabold text-sm uppercase">{store?.name || "SUVORA RETAIL STORE"}</p>
                    <p className="text-[10px] text-slate-500">{store?.address?.line1 || "Store Address"}</p>
                    <p className="text-[10px] text-slate-500">GSTIN: {store?.gstNumber || "29ABCDE1234F1Z5"} | FSSAI: {store?.fssaiNumber || "11223344556677"}</p>
                  </div>

                  <div className="text-[11px] space-y-0.5 border-b border-dashed border-slate-300 pb-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Order:</span>
                      <span className="font-bold">{printOrder.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date:</span>
                      <span>{new Date(printOrder.createdAt).toLocaleDateString("en-IN")} {new Date(printOrder.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Customer:</span>
                      <span className="font-bold">{printOrder.customer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Phone:</span>
                      <span>{printOrder.customer.phone}</span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-2">
                    <div className="flex justify-between font-bold text-[10px] text-slate-500">
                      <span>ITEM</span>
                      <span>QTY x PRICE</span>
                      <span>TOTAL</span>
                    </div>
                    {printOrder.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-[11px]">
                        <span className="truncate max-w-[120px]">{it.productName}</span>
                        <span>{it.quantity} x {formatCurrency(it.price)}</span>
                        <span className="font-bold">{formatCurrency(it.total)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-0.5 text-[11px] pt-1">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(printOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Delivery Fee:</span>
                      <span>{formatCurrency(printOrder.deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>GST (5% Included):</span>
                      <span>{formatCurrency(printOrder.tax)}</span>
                    </div>
                    <div className="flex justify-between font-black text-sm pt-1 border-t border-slate-300 text-slate-900">
                      <span>TOTAL PAID:</span>
                      <span>{formatCurrency(printOrder.total)}</span>
                    </div>
                  </div>

                  <div className="text-center pt-2 text-[10px] text-slate-400">
                    *** Thank you for shopping on SUVORA ***
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setPrintOrder(null)}
                    className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      window.print();
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Receipt Slip</span>
                  </button>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

