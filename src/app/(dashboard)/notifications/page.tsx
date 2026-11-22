"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  ShoppingBag,
  Package,
  CreditCard,
  Megaphone,
  ArrowRight,
} from "lucide-react";
import { PageHeader, toast } from "@/components/common";
import { useNotificationsStore } from "@/lib/store";
import { getRelativeTime } from "@/lib/utils";
import type { NotificationType } from "@/types";

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotificationsStore();
  const [activeTab, setActiveTab] = useState<NotificationType | "all">("all");

  // Notification Preferences State
  const [prefs, setPrefs] = useState({
    orderEmail: true,
    orderPush: true,
    inventoryEmail: true,
    inventoryPush: true,
    paymentEmail: true,
    paymentPush: true,
    platformPush: false,
  });

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true;
    return n.type === activeTab;
  });

  const unread = unreadCount();

  const handleMarkAll = () => {
    markAllAsRead();
    toast.success("All store alerts marked as read.");
  };

  const handleTogglePref = (key: keyof typeof prefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.info("Alert preference updated.");
  };

  const tabs: { label: string; value: NotificationType | "all" }[] = [
    { label: "All Alerts", value: "all" },
    { label: "Orders", value: "order" },
    { label: "Inventory", value: "inventory" },
    { label: "Payments", value: "payment" },
    { label: "Platform Announcements", value: "platform" },
  ];

  const getIconInfo = (type: NotificationType) => {
    switch (type) {
      case "order":
        return { icon: ShoppingBag, color: "bg-purple-100 text-purple-700" };
      case "inventory":
        return { icon: Package, color: "bg-amber-100 text-amber-700" };
      case "payment":
        return { icon: CreditCard, color: "bg-emerald-100 text-emerald-700" };
      case "platform":
        return { icon: Megaphone, color: "bg-blue-100 text-blue-700" };
      default:
        return { icon: Bell, color: "bg-slate-100 text-slate-700" };
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Notifications & Alerts"
        subtitle="Real-time operational updates on incoming customer orders, low shelf stock, and bank settlements."
        badge={
          unread > 0 ? (
            <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-xs font-bold">
              {unread} unread
            </span>
          ) : undefined
        }
      >
        {unread > 0 && (
          <button
            onClick={handleMarkAll}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-purple-600" />
            <span>Mark All as Read</span>
          </button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Notification Feed */}
        <div className="lg:col-span-8 space-y-4">
          {/* Tabs Filter */}
          <div className="bg-white p-2 rounded-2xl border border-purple-100/70 shadow-sm flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === tab.value
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-purple-50 hover:text-purple-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Feed List */}
          <div className="space-y-3">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => {
                const { icon: IconComponent, color } = getIconInfo(notif.type);

                return (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all flex items-start justify-between gap-4 cursor-pointer hover:shadow-md ${
                      !notif.read
                        ? "border-purple-300 bg-purple-50/20 shadow-xs"
                        : "border-purple-100/70 shadow-sm opacity-85"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`p-2.5 rounded-xl shrink-0 ${color}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                            {notif.title}
                          </h4>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {notif.message}
                        </p>
                        <p className="text-[11px] text-slate-400 pt-1">
                          {getRelativeTime(notif.createdAt)}
                        </p>
                      </div>
                    </div>

                    {notif.actionUrl && (
                      <Link
                        href={notif.actionUrl}
                        className="text-purple-600 hover:text-purple-800 p-2 rounded-lg hover:bg-purple-50 shrink-0"
                        title="View action"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-100 text-slate-400 text-xs">
                No notifications in this category.
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Notification Preferences */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-purple-100/70 shadow-sm space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Notification Settings</h3>
              <p className="text-xs text-slate-400">Configure alert channels</p>
            </div>

            <div className="space-y-3 text-xs">
              <p className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                Order Dispatches
              </p>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-700 font-medium">Email Alerts</span>
                <input
                  type="checkbox"
                  checked={prefs.orderEmail}
                  onChange={() => handleTogglePref("orderEmail")}
                  className="w-4 h-4 accent-purple-600 cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-700 font-medium">Mobile Push Ring</span>
                <input
                  type="checkbox"
                  checked={prefs.orderPush}
                  onChange={() => handleTogglePref("orderPush")}
                  className="w-4 h-4 accent-purple-600 cursor-pointer"
                />
              </div>

              <p className="font-bold text-slate-700 uppercase text-[10px] tracking-wider pt-2">
                Inventory Alerts
              </p>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-700 font-medium">Low Stock SMS</span>
                <input
                  type="checkbox"
                  checked={prefs.inventoryEmail}
                  onChange={() => handleTogglePref("inventoryEmail")}
                  className="w-4 h-4 accent-purple-600 cursor-pointer"
                />
              </div>

              <p className="font-bold text-slate-700 uppercase text-[10px] tracking-wider pt-2">
                Financial Payouts
              </p>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-700 font-medium">Settlement Credits</span>
                <input
                  type="checkbox"
                  checked={prefs.paymentEmail}
                  onChange={() => handleTogglePref("paymentEmail")}
                  className="w-4 h-4 accent-purple-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

