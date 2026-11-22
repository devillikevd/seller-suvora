"use client";

import React, { useState } from "react";
import {
  Store,
  MapPin,
  Clock,
  Truck,
  Upload,
  Phone,
  Mail,
  Edit2,
  Save,
  X,
  Info,
} from "lucide-react";
import { PageHeader, StatusBadge, toast } from "@/components/common";
import { useAuthStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

export default function StorePage() {
  const { store, updateStore } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: store?.name || "",
    description: store?.description || "",
    email: store?.email || "",
    phone: store?.phone || "",
    line1: store?.address.line1 || "",
    line2: store?.address.line2 || "",
    city: store?.address.city || "",
    state: store?.address.state || "",
    pincode: store?.address.pincode || "",
    landmark: store?.address.landmark || "",
    deliveryEnabled: store?.deliverySettings.deliveryEnabled ?? true,
    pickupEnabled: store?.deliverySettings.pickupEnabled ?? true,
    deliveryRadius: store?.deliverySettings.deliveryRadius || 5,
    minimumOrder: store?.deliverySettings.minimumOrder || 200,
    deliveryFee: store?.deliverySettings.deliveryFee || 30,
    freeDeliveryAbove: store?.deliverySettings.freeDeliveryAbove || 500,
  });

  const [operatingHours, setOperatingHours] = useState(
    store?.operatingHours || []
  );

  const handleToggleDay = (index: number) => {
    if (!isEditing) return;
    setOperatingHours((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, isOpen: !item.isOpen } : item
      )
    );
  };

  const handleTimeChange = (index: number, field: "open" | "close", val: string) => {
    if (!isEditing) return;
    setOperatingHours((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: val } : item
      )
    );
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Store name is required.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast.error("Valid email is required.");
      return;
    }

    updateStore({
      name: formData.name,
      description: formData.description,
      email: formData.email,
      phone: formData.phone,
      address: {
        line1: formData.line1,
        line2: formData.line2,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        landmark: formData.landmark,
      },
      deliverySettings: {
        deliveryEnabled: formData.deliveryEnabled,
        pickupEnabled: formData.pickupEnabled,
        deliveryRadius: Number(formData.deliveryRadius),
        minimumOrder: Number(formData.minimumOrder),
        deliveryFee: Number(formData.deliveryFee),
        freeDeliveryAbove: Number(formData.freeDeliveryAbove),
      },
      operatingHours,
    });

    setIsEditing(false);
    toast.success("Store configuration updated successfully!");
  };

  const handleCancel = () => {
    if (store) {
      setFormData({
        name: store.name,
        description: store.description,
        email: store.email,
        phone: store.phone,
        line1: store.address.line1,
        line2: store.address.line2 || "",
        city: store.address.city,
        state: store.address.state,
        pincode: store.address.pincode,
        landmark: store.address.landmark || "",
        deliveryEnabled: store.deliverySettings.deliveryEnabled,
        pickupEnabled: store.deliverySettings.pickupEnabled,
        deliveryRadius: store.deliverySettings.deliveryRadius,
        minimumOrder: store.deliverySettings.minimumOrder,
        deliveryFee: store.deliverySettings.deliveryFee,
        freeDeliveryAbove: store.deliverySettings.freeDeliveryAbove,
      });
      setOperatingHours(store.operatingHours);
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="My Store Profile"
        subtitle="Manage public storefront details, business hours, delivery preferences and serviceable radius."
        badge={
          <StatusBadge
            variant={store?.status === "online" ? "success" : "neutral"}
          >
            {store?.status === "online" ? "Store Live & Visible" : "Store Inactive"}
          </StatusBadge>
        }
      >
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Store Settings</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </PageHeader>

      {/* Store Banner & Brand Header */}
      <div className="bg-white rounded-3xl border border-purple-100/70 shadow-sm overflow-hidden">
        {/* Banner Area */}
        <div className="h-44 bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-950 relative flex items-center justify-center p-6 text-center">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 text-white max-w-md">
            <p className="text-xs font-semibold text-purple-200 uppercase tracking-widest mb-1">
              Storefront Banner
            </p>
            <p className="text-sm font-medium opacity-90">
              High resolution banner displayed on customer mobile application & web
            </p>
            {isEditing && (
              <button
                type="button"
                onClick={() => toast.info("Image upload dialog opened")}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-xs transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New Banner</span>
              </button>
            )}
          </div>
        </div>

        {/* Logo and Basic Info Strip */}
        <div className="p-6 pt-0 relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 sm:-mt-14">
          <div className="flex items-end gap-4">
            <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-xl flex items-center justify-center bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-2xl relative group">
              {formData.name.slice(0, 2).toUpperCase() || "FM"}
              {isEditing && (
                <button
                  type="button"
                  onClick={() => toast.info("Select new logo image")}
                  className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Upload className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="space-y-1 mb-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {formData.name || "Store Name"}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-purple-600" />
                  {formData.city}, {formData.state}
                </span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                  Verified Local Merchant
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              onClick={() =>
                updateStore({
                  status: store?.status === "online" ? "offline" : "online",
                })
              }
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                store?.status === "online"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-slate-100 border-slate-200 text-slate-700"
              }`}
            >
              {store?.status === "online" ? "Store Visible to Customers" : "Store Hidden"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Store Details, Address, Delivery */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section: General Store Information */}
          <div className="bg-white rounded-2xl p-6 border border-purple-100/70 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <Store className="w-4 h-4 text-purple-600" />
              <h3 className="text-base font-bold text-slate-900">General Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700">Store Display Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-900 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    {formData.name}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700">Store Bio / Description</label>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none"
                  />
                ) : (
                  <p className="text-sm text-slate-600 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                    {formData.description}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Store Contact Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                ) : (
                  <p className="text-sm text-slate-800 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-purple-600" />
                    <span>{formData.email}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Customer Helpline Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                ) : (
                  <p className="text-sm text-slate-800 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-purple-600" />
                    <span>{formData.phone}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section: Physical Address & Map Placeholder */}
          <div className="bg-white rounded-2xl p-6 border border-purple-100/70 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <MapPin className="w-4 h-4 text-purple-600" />
              <h3 className="text-base font-bold text-slate-900">Physical Store Location</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700">Address Line 1</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.line1}
                    onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl"
                  />
                ) : (
                  <p className="text-sm text-slate-800 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    {formData.line1}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Locality / Landmark</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl"
                  />
                ) : (
                  <p className="text-sm text-slate-800 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    {formData.landmark || "N/A"}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">City</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl"
                  />
                ) : (
                  <p className="text-sm text-slate-800 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    {formData.city}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">State</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl"
                  />
                ) : (
                  <p className="text-sm text-slate-800 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    {formData.state}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Postal Pincode</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl"
                  />
                ) : (
                  <p className="text-sm text-slate-800 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    {formData.pincode}
                  </p>
                )}
              </div>
            </div>

            {/* Interactive Map Placeholder */}
            <div className="mt-3 rounded-2xl bg-purple-50/60 border border-purple-100 p-5 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-white shadow-xs text-purple-600 flex items-center justify-center mb-2">
                <MapPin className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">GPS Geo-Coordinates Pinned</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Latitude: 12.9352° N, Longitude: 77.6245° E (Koramangala, Bangalore)
              </p>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => toast.info("Map pin calibration mode activated")}
                  className="mt-3 px-3 py-1.5 bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  Reposition Store Pin on Map
                </button>
              )}
            </div>
          </div>

          {/* Section: Delivery & Fulfillment Rules */}
          <div className="bg-white rounded-2xl p-6 border border-purple-100/70 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <Truck className="w-4 h-4 text-purple-600" />
              <h3 className="text-base font-bold text-slate-900">Delivery & Pickup Rules</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">Doorstep Delivery</p>
                  <p className="text-[11px] text-slate-500">Allow customers to request home delivery</p>
                </div>
                <input
                  type="checkbox"
                  disabled={!isEditing}
                  checked={formData.deliveryEnabled}
                  onChange={(e) => setFormData({ ...formData, deliveryEnabled: e.target.checked })}
                  className="w-4 h-4 accent-purple-600 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">In-Store Pickup</p>
                  <p className="text-[11px] text-slate-500">Allow customers to order and pick up</p>
                </div>
                <input
                  type="checkbox"
                  disabled={!isEditing}
                  checked={formData.pickupEnabled}
                  onChange={(e) => setFormData({ ...formData, pickupEnabled: e.target.checked })}
                  className="w-4 h-4 accent-purple-600 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Delivery Radius (km)</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={formData.deliveryRadius}
                    onChange={(e) => setFormData({ ...formData, deliveryRadius: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-900 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    Up to {formData.deliveryRadius} km from shop
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Minimum Order Amount</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={formData.minimumOrder}
                    onChange={(e) => setFormData({ ...formData, minimumOrder: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-900 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    {formatCurrency(formData.minimumOrder)}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Standard Delivery Charge</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={formData.deliveryFee}
                    onChange={(e) => setFormData({ ...formData, deliveryFee: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-900 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    {formatCurrency(formData.deliveryFee)}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Free Delivery Threshold</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={formData.freeDeliveryAbove}
                    onChange={(e) => setFormData({ ...formData, freeDeliveryAbove: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-900 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    Free on orders over {formatCurrency(formData.freeDeliveryAbove)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Operating Hours & Weekly Schedule */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-purple-100/70 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">Operating Hours</h3>
              </div>
              <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                7 Days Schedule
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Store will automatically reject orders outside configured opening hours.
            </p>

            <div className="space-y-2.5">
              {operatingHours.map((schedule, idx) => (
                <div
                  key={schedule.day}
                  className={`p-3 rounded-xl border transition-colors ${
                    schedule.isOpen
                      ? "bg-slate-50/80 border-slate-100"
                      : "bg-slate-50/30 border-slate-100 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900">{schedule.day}</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={schedule.isOpen}
                        disabled={!isEditing}
                        onChange={() => handleToggleDay(idx)}
                        className="w-3.5 h-3.5 accent-purple-600"
                      />
                      <span className="text-[11px] font-semibold text-slate-500">
                        {schedule.isOpen ? "Open" : "Closed"}
                      </span>
                    </label>
                  </div>

                  {schedule.isOpen && (
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <input
                            type="time"
                            value={schedule.open}
                            onChange={(e) => handleTimeChange(idx, "open", e.target.value)}
                            className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white"
                          />
                          <span className="text-xs text-slate-400">to</span>
                          <input
                            type="time"
                            value={schedule.close}
                            onChange={(e) => handleTimeChange(idx, "close", e.target.value)}
                            className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white"
                          />
                        </>
                      ) : (
                        <span className="text-xs font-medium text-slate-700">
                          {schedule.open} — {schedule.close}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Notice Card */}
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 text-xs text-purple-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-purple-950">
              <Info className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Merchant Verification Badge</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Your store has completed Level 2 GST & FSSAI document verification. Shoppers in your radius see the green trust checkmark on your listings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
