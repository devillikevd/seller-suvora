"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Menu,
  ChevronRight,
  Store,
  Settings,
  LogOut,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useAuthStore, useNotificationsStore, useUIStore } from "@/lib/store";
import { getInitials } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { seller, store, updateStore, logout } = useAuthStore();
  const { notifications } = useNotificationsStore();
  const { setSidebarMobileOpen } = useUIStore();

  const [searchQuery, setSearchQuery] = useState("");

  const isStoreOnline = store?.status === "online";
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const toggleStoreStatus = () => {
    updateStore({ status: isStoreOnline ? "offline" : "online" });
  };

  // Breadcrumbs generator
  const getBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0 || parts[0] === "dashboard") {
      return [{ label: "SUVORA", href: "/dashboard" }, { label: "Overview", href: "/dashboard" }];
    }
    const breadcrumbList = [{ label: "SUVORA", href: "/dashboard" }];
    let currentPath = "";
    for (const part of parts) {
      currentPath += `/${part}`;
      const formatted = part.charAt(0).toUpperCase() + part.slice(1).replace("-", " ");
      breadcrumbList.push({ label: formatted, href: currentPath });
    }
    return breadcrumbList;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 select-none shrink-0 shadow-2xs">
      {/* Left: Official SUVORA Logo at TOP-LEFT (1.5x Scaled) */}
      <div className="flex items-center gap-4 min-w-0 shrink-0">
        <button
          onClick={() => setSidebarMobileOpen(true)}
          className="md:hidden p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/dashboard" className="flex items-center group shrink-0 py-1">
          <img
            src="/images/suvora-logo.png"
            alt="SUVORA - Everything You Need, Closer."
            className="h-[68px] w-auto object-contain max-w-[290px] drop-shadow-xs hover:opacity-95 transition-opacity"
          />
        </Link>

        <div className="h-7 w-px bg-slate-200 hidden lg:block mx-1" />

        <nav className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 truncate">
          {breadcrumbs.map((b, idx) => (
            <React.Fragment key={b.href + idx}>
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
              <span
                className={
                  idx === breadcrumbs.length - 1
                    ? "font-bold text-slate-900 truncate"
                    : "hover:text-blue-600 cursor-pointer truncate"
                }
                onClick={() => router.push(b.href)}
              >
                {b.label}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Center: Global Command Search Field (Bredar Style) */}
      <div className="hidden sm:flex items-center flex-1 max-w-md mx-4 min-w-0">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim()) {
                router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
              }
            }}
            placeholder="Search or type a command (⌘K)..."
            className="w-full pl-9 pr-12 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900"
          />
          <kbd className="absolute right-2.5 top-2 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded-md pointer-events-none">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Actions: Add product, Store status, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <Link
          href="/products/new"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xs"
        >
          <span className="text-sm font-bold leading-none">+</span>
          <span>Add product</span>
        </Link>

        {/* Store Live / Closed Indicator Toggle */}
        <button
          onClick={toggleStoreStatus}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all border ${
            isStoreOnline
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70"
              : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
          }`}
          title="Click to toggle store availability"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isStoreOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
            }`}
          />
          <span className="hidden sm:inline">
            {isStoreOnline ? "Store is Live" : "Store Paused"}
          </span>
        </button>

        {/* Notifications Icon with Badge */}
        <Link
          href="/notifications"
          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors relative"
          title="Store Alerts"
        >
          <Bell className="w-4 h-4" />
          {unreadNotifs > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[15px] h-[15px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
              {unreadNotifs}
            </span>
          )}
        </Link>

        {/* Profile Avatar with Radix Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-2 p-1 pl-1.5 rounded-xl hover:bg-slate-100 border border-slate-200 transition-colors focus:outline-none">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {seller ? getInitials(seller.name) : "SV"}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  {seller?.name || "Merchant Owner"}
                </span>
                <span className="text-[10px] text-slate-500 leading-none">
                  Merchant Owner
                </span>
              </div>
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="z-50 w-52 bg-white rounded-2xl p-1.5 shadow-xl border border-[#E8EAED] text-xs animate-in fade-in-0 zoom-in-95"
            >
              <div className="px-3 py-2 border-b border-[#EFF1F4]">
                <p className="font-bold text-[#202124]">{seller?.name || "Merchant Owner"}</p>
                <p className="text-[11px] text-[#737780] truncate">{seller?.email || "merchant@suvora.in"}</p>
              </div>
              <div className="py-1">
                <DropdownMenu.Item asChild>
                  <Link
                    href="/store"
                    className="flex items-center gap-2 px-3 py-2 text-[#202124] rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    <Store className="w-4 h-4 text-[#737780]" />
                    <span>My Storefront</span>
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-3 py-2 text-[#202124] rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-[#737780]" />
                    <span>Account Settings</span>
                  </Link>
                </DropdownMenu.Item>
              </div>
              <div className="pt-1 border-t border-[#EFF1F4]">
                <DropdownMenu.Item
                  onClick={() => {
                    logout();
                    router.push("/login");
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-[#F05A55] rounded-xl hover:bg-rose-50 cursor-pointer font-bold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </DropdownMenu.Item>
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
