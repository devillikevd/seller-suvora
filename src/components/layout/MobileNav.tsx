"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Package,
  Grid3x3,
  Warehouse,
  ShoppingBag,
  Users,
  Tag,
  IndianRupee,
  BarChart3,
  Bell,
  ShieldCheck,
  Settings,
  X,
} from "lucide-react";
import { useUIStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const { sidebarMobileOpen, setSidebarMobileOpen } = useUIStore();

  if (!sidebarMobileOpen) return null;

  const links = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Store", href: "/store", icon: Store },
    { label: "Products", href: "/products", icon: Package },
    { label: "Categories", href: "/categories", icon: Grid3x3 },
    { label: "Inventory", href: "/inventory", icon: Warehouse },
    { label: "Orders", href: "/orders", icon: ShoppingBag },
    { label: "Customers", href: "/customers", icon: Users },
    { label: "Offers & Discounts", href: "/offers", icon: Tag },
    { label: "Earnings", href: "/earnings", icon: IndianRupee },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Staff & Permissions", href: "/staff", icon: ShieldCheck },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => setSidebarMobileOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-72 max-w-[80%] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
          <Link href="/dashboard" onClick={() => setSidebarMobileOpen(false)} className="flex items-center">
            <img
              src="/images/suvora-logo.png"
              alt="SUVORA"
              className="h-10 w-auto object-contain max-w-[170px]"
            />
          </Link>
          <button
            onClick={() => setSidebarMobileOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (link.href !== "/dashboard" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-purple-600 text-white font-semibold shadow-xs"
                    : "text-slate-600 hover:bg-purple-50 hover:text-purple-700"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-400")} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
