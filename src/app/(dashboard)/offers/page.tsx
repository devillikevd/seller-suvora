"use client";

import React, { useState } from "react";
import {
  Tag,
  Plus,
  Copy,
  Check,
  TrendingUp,
  Trash2,
  Sparkles,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  PageHeader,
  StatusBadge,
  ConfirmDialog,
  FormField,
  toast,
} from "@/components/common";
import { useOffersStore } from "@/lib/store";
import { formatCurrency, formatDate, generateId } from "@/lib/utils";
import type { Offer, DiscountType } from "@/types";

export default function OffersPage() {
  const { offers, addOffer, toggleOffer, deleteOffer } = useOffersStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteOfferId, setDeleteOfferId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("percentage");
  const [discountValue, setDiscountValue] = useState<number>(15);
  const [minimumOrder, setMinimumOrder] = useState<number>(300);
  const [maxUsage, setMaxUsage] = useState<number>(500);
  const [startDate, setStartDate] = useState("2026-11-20");
  const [endDate, setEndDate] = useState("2027-03-31");

  const handleCopyCode = (promoCode: string) => {
    navigator.clipboard.writeText(promoCode);
    setCopiedCode(promoCode);
    toast.success(`Coupon code "${promoCode}" copied to clipboard.`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim()) {
      toast.error("Please fill in coupon title and promo code.");
      return;
    }

    if (Number(discountValue) <= 0) {
      toast.error("Discount value must be greater than zero.");
      return;
    }

    if (discountType === "percentage" && Number(discountValue) > 100) {
      toast.error("Percentage discount cannot exceed 100%.");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      toast.error("Expiration date cannot be earlier than start date.");
      return;
    }

    const newOffer: Offer = {
      id: generateId("off"),
      title,
      description,
      code: code.toUpperCase().trim(),
      discountType,
      discountValue: Number(discountValue),
      minimumOrder: Number(minimumOrder),
      maxUsage: Number(maxUsage),
      usedCount: 0,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      status: "active",
      createdAt: new Date().toISOString(),
    };

    addOffer(newOffer);
    toast.success(`Coupon "${newOffer.code}" published for store customers!`);
    setIsModalOpen(false);
    setTitle("");
    setCode("");
  };

  const handleDelete = () => {
    if (deleteOfferId) {
      deleteOffer(deleteOfferId);
      toast.success("Offer deleted.");
      setDeleteOfferId(null);
    }
  };

  const activeOffersCount = offers.filter((o) => o.status === "active").length;
  const totalRedemptions = offers.reduce((sum, o) => sum + o.usedCount, 0);

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Offers, Coupons & Discounts"
        subtitle="Create seasonal promo codes, basket size thresholds and cart savings to boost local sales."
      >
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Offer</span>
        </button>
      </PageHeader>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-purple-100/70 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Live Promotions</p>
            <h3 className="text-2xl font-black text-purple-700 mt-1">{activeOffersCount} active</h3>
            <span className="text-[11px] text-emerald-600 font-semibold">Running on storefront</span>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
            <Tag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-purple-100/70 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Total Coupon Redemptions</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{totalRedemptions}</h3>
            <span className="text-[11px] text-slate-400">Times redeemed by shoppers</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-purple-100/70 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Campaign Attributed Sales</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">₹78,400</h3>
            <span className="text-[11px] text-slate-400">Driven by promo codes</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-100 text-slate-700">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Offers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => {
          const usagePercent = Math.min(
            100,
            Math.round((offer.usedCount / offer.maxUsage) * 100)
          );

          return (
            <div
              key={offer.id}
              className={`bg-white rounded-2xl p-6 border transition-all flex flex-col justify-between shadow-sm hover:shadow-md ${
                offer.status === "active"
                  ? "border-purple-200/80"
                  : "border-slate-200 opacity-70"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-extrabold text-slate-900">{offer.title}</h3>
                  <StatusBadge
                    variant={
                      offer.status === "active"
                        ? "success"
                        : offer.status === "expired"
                        ? "neutral"
                        : "error"
                    }
                    size="sm"
                  >
                    {offer.status.toUpperCase()}
                  </StatusBadge>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {offer.description}
                </p>

                {/* Coupon Code Pill */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/80 border border-purple-100">
                  <span className="font-mono font-black text-purple-700 text-sm tracking-wider">
                    {offer.code}
                  </span>
                  <button
                    onClick={() => handleCopyCode(offer.code)}
                    className="p-1 text-purple-600 hover:text-purple-800 rounded-md hover:bg-purple-100 transition-colors"
                    title="Copy code"
                  >
                    {copiedCode === offer.code ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Discount Badge and Min Order */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-bold text-slate-900">
                    {offer.discountType === "percentage"
                      ? `${offer.discountValue}% OFF`
                      : `₹${offer.discountValue} FLAT OFF`}
                  </span>
                  <span className="text-slate-400">
                    Min order: {formatCurrency(offer.minimumOrder)}
                  </span>
                </div>

                {/* Usage Progress */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                    <span>Redemptions</span>
                    <span>
                      {offer.usedCount} / {offer.maxUsage} used
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full transition-all"
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 pt-1">
                  Valid until {formatDate(offer.endDate)}
                </p>
              </div>

              {/* Actions Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => toggleOffer(offer.id)}
                  className={`font-semibold transition-colors ${
                    offer.status === "active"
                      ? "text-amber-600 hover:text-amber-700"
                      : "text-emerald-600 hover:text-emerald-700"
                  }`}
                >
                  {offer.status === "active" ? "Pause Offer" : "Resume Offer"}
                </button>

                <button
                  onClick={() => setDeleteOfferId(offer.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Offer Modal */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm animate-in fade-in-0 duration-200" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in-0 zoom-in-95 duration-200 focus:outline-none">
            <Dialog.Title className="text-lg font-bold text-slate-900 mb-1">
              Create Promotional Offer
            </Dialog.Title>
            <Dialog.Description className="text-xs text-slate-400 mb-4">
              Configure coupon discounts for shoppers in your local radius.
            </Dialog.Description>

            <form onSubmit={handleCreateOffer} className="space-y-4">
              <FormField label="Campaign Title" required>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Weekend Grocery Bonanza"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </FormField>

              <FormField label="Offer Description">
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Flat 15% off on staples and vegetables"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Coupon Promo Code" required>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. WEEKEND15"
                    className="w-full px-3.5 py-2 text-sm font-mono font-bold uppercase border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </FormField>

                <FormField label="Discount Type" required>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="percentage">Percentage (%) Discount</option>
                    <option value="fixed">Fixed Rupee (₹) Off</option>
                  </select>
                </FormField>

                <FormField label="Discount Amount / %" required>
                  <input
                    type="number"
                    min={1}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl font-bold"
                  />
                </FormField>

                <FormField label="Minimum Cart Order (₹)" required>
                  <input
                    type="number"
                    min={0}
                    value={minimumOrder}
                    onChange={(e) => setMinimumOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl"
                  />
                </FormField>

                <FormField label="Maximum Total Redemptions" required>
                  <input
                    type="number"
                    min={1}
                    value={maxUsage}
                    onChange={(e) => setMaxUsage(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl"
                  />
                </FormField>

                <FormField label="Start Date" required>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl"
                  />
                </FormField>

                <FormField label="End Expiration Date" required>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl"
                  />
                </FormField>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Launch Offer
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteOfferId)}
        onOpenChange={(open) => !open && setDeleteOfferId(null)}
        title="Delete Promotion"
        description="Are you sure you want to delete this promo code? Customers will no longer be able to redeem this coupon at checkout."
        confirmText="Delete Promotion"
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
}

