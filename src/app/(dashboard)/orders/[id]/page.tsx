"use client";

import React, { use, useState, Suspense } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  Phone,
  CheckCircle2,
  Package,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { StatusBadge, toast } from "@/components/common";
import { useOrdersStore } from "@/lib/store";
import { formatCurrency, formatDateTime, getInitials } from "@/lib/utils";
import type { OrderStatus } from "@/types";

function OrderDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { orders, updateOrderStatus } = useOrdersStore();
  const [isDeclineOpen, setIsDeclineOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("One or more items out of stock");

  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-purple-100 shadow-sm max-w-lg mx-auto mt-12">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Order Not Found</h2>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          The requested order ID does not exist in your store database.
        </p>
        <Link
          href="/orders"
          className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold"
        >
          Back to Orders Queue
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    toast.success(`Tax Invoice for ${order.orderNumber} sent to printer!`, "Invoice Downloaded");
  };

  const handleNextStatus = () => {
    const nextMap: Record<OrderStatus, OrderStatus | null> = {
      new: "accepted",
      accepted: "preparing",
      preparing: "ready",
      ready: "completed",
      completed: null,
      cancelled: null,
    };

    const next = nextMap[order.status];
    if (next) {
      updateOrderStatus(order.id, next);
      toast.success(`Order moved to ${next.toUpperCase()}`);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-100/70">
        <div className="flex items-center gap-3">
          <Link
            href="/orders"
            className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-purple-600 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {order.orderNumber}
              </h1>
              <StatusBadge
                variant={
                  order.status === "completed"
                    ? "success"
                    : order.status === "cancelled"
                    ? "error"
                    : "purple"
                }
              >
                {order.status.replace("_", " ").toUpperCase()}
              </StatusBadge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Placed on {formatDateTime(order.createdAt)} • {order.items.length} unique products
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Tax Invoice</span>
          </button>

          {order.status !== "completed" && order.status !== "cancelled" && (
            <>
              <button
                onClick={() => setIsDeclineOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold rounded-xl shadow-2xs transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Decline</span>
              </button>

              <button
                onClick={handleNextStatus}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {order.status === "new"
                    ? "Accept Order"
                    : order.status === "accepted"
                    ? "Mark as Preparing"
                    : order.status === "preparing"
                    ? "Ready for Handover"
                    : "Complete & Settle"}
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Ordered Items & Bill Summary */}
        <div className="lg:col-span-8 space-y-6">
          {/* Items Card */}
          <div className="bg-white rounded-2xl p-6 border border-purple-100/70 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Ordered Items
            </h3>

            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{item.productName}</p>
                      <p className="text-[11px] text-slate-400">
                        {formatCurrency(item.price)} × {item.quantity} units
                      </p>
                    </div>
                  </div>

                  <p className="font-bold text-slate-900 text-xs shrink-0">
                    {formatCurrency(item.total)}
                  </p>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-700">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Delivery Convenience Fee</span>
                <span className="font-semibold text-slate-700">
                  {order.deliveryFee === 0 ? "FREE" : formatCurrency(order.deliveryFee)}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Merchant Coupon Discount</span>
                  <span>- {formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Estimated GST Tax (5%)</span>
                <span className="font-semibold text-slate-700">{formatCurrency(order.tax)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-3 border-t border-slate-100">
                <span>Final Order Total</span>
                <span className="text-base text-purple-700">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Customer & Delivery Card */}
          <div className="bg-white rounded-2xl p-6 border border-purple-100/70 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Shopper & Fulfillment Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Customer Info */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase">Customer Profile</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-800 font-bold text-sm flex items-center justify-center shrink-0">
                    {getInitials(order.customer.name)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{order.customer.name}</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-purple-600" />
                      {order.customer.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase">Destination</p>
                {order.deliveryAddress ? (
                  <div className="text-xs text-slate-700 space-y-0.5 leading-relaxed">
                    <p className="font-semibold">{order.deliveryAddress.line1}</p>
                    <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}</p>
                    <span className="inline-block px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold text-[10px] mt-1">
                      Doorstep Dispatch
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-slate-700">
                    <p className="font-bold">Store Counter Pickup</p>
                    <p className="text-slate-400 text-[11px]">Customer will collect in shop</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Order Timeline & Payment */}
        <div className="lg:col-span-4 space-y-6">
          {/* Payment Status Card */}
          <div className="bg-white rounded-2xl p-6 border border-purple-100/70 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Payment Breakdown
            </h3>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Method</span>
              <span className="text-xs font-bold uppercase bg-slate-100 px-2.5 py-0.5 rounded-lg text-slate-800">
                {order.paymentMethod}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Payment Status</span>
              <StatusBadge
                variant={order.paymentStatus === "paid" ? "success" : "warning"}
                size="sm"
              >
                {order.paymentStatus.toUpperCase()}
              </StatusBadge>
            </div>

            <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100 text-xs text-purple-900">
              <p className="font-bold">Settlement Protection</p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Funds will be released in tomorrow morning&apos;s automated T+1 settlement batch.
              </p>
            </div>
          </div>

          {/* Order Lifecycle Timeline */}
          <div className="bg-white rounded-2xl p-6 border border-purple-100/70 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Order Event Timeline
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-purple-100">
              {order.timeline.map((step, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-purple-600 ring-4 ring-purple-100" />
                  <p className="text-xs font-bold text-slate-900 capitalize">
                    {step.status.replace("_", " ")}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {formatDateTime(step.timestamp)}
                  </p>
                  {step.note && (
                    <p className="text-[11px] text-rose-600 mt-0.5">{step.note}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Decline Order Dialog */}
      <Dialog.Root open={isDeclineOpen} onOpenChange={setIsDeclineOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm animate-in fade-in-0 duration-200" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in-0 zoom-in-95 duration-200 focus:outline-none">
            <Dialog.Title className="text-lg font-bold text-slate-900 mb-1">
              Decline Order {order.orderNumber}
            </Dialog.Title>
            <Dialog.Description className="text-xs text-slate-400 mb-4">
              Select the reason why your store cannot fulfill this order.
            </Dialog.Description>

            <div className="space-y-3">
              <select
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-white"
              >
                <option value="One or more items out of stock">One or more items out of stock</option>
                <option value="Store closing / staff offline">Store closing / staff offline</option>
                <option value="Customer delivery address unreachable">Customer delivery address unreachable</option>
                <option value="Catalog pricing error">Catalog pricing error</option>
              </select>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeclineOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateOrderStatus(order.id, "cancelled");
                    toast.warning(`Order declined (${declineReason})`);
                    setIsDeclineOpen(false);
                  }}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Confirm Decline
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading order dispatch details...</div>}>
      <OrderDetailContent params={params} />
    </Suspense>
  );
}
