"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { cn, getInitials } from "@/lib/utils";
import { useUIStore, useAuthStore, useNotificationsStore, useOrdersStore } from "@/lib/store";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number | string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { seller, store, logout } = useAuthStore();
  const { notifications } = useNotificationsStore();
  const { orders } = useOrdersStore();

  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const newOrdersCount = orders.filter((o) => o.status === "new" || o.status === "preparing").length;

  const navSections: NavSection[] = [
    {
      title: "OVERVIEW",
      items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
    },
    {
      title: "STORE",
      items: [
        { label: "My Store", href: "/store", icon: Store },
        { label: "Products", href: "/products", icon: Package },
        { label: "Categories", href: "/categories", icon: Grid3x3 },
        { label: "Inventory", href: "/inventory", icon: Warehouse },
      ],
    },
    {
      title: "COMMERCE",
      items: [
        {
          label: "Orders",
          href: "/orders",
          icon: ShoppingBag,
          badge: newOrdersCount > 0 ? newOrdersCount : undefined,
        },
        { label: "Customers", href: "/customers", icon: Users },
        { label: "Offers & Discounts", href: "/offers", icon: Tag },
      ],
    },
    {
      title: "BUSINESS",
      items: [
        { label: "Earnings & Payments", href: "/earnings", icon: IndianRupee },
        { label: "Analytics", href: "/analytics", icon: BarChart3 },
      ],
    },
    {
      title: "MANAGEMENT",
      items: [
        {
          label: "Notifications",
          href: "/notifications",
          icon: Bell,
          badge: unreadNotifs > 0 ? unreadNotifs : undefined,
        },
        { label: "Staff & Permissions", href: "/staff", icon: ShieldCheck },
        { label: "Settings", href: "/settings", icon: Settings },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <Tooltip.Provider delayDuration={150}>
      <aside
        className={cn(
          "hidden md:flex flex-col h-[calc(100vh-5rem)] sticky top-20 bg-white border-r border-[#EAEBEE] transition-all duration-200 z-20 select-none shrink-0",
          sidebarCollapsed ? "w-[72px]" : "w-[250px]"
        )}
      >
        {/* Store Active Hub Indicator */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
              <Store className="w-4 h-4" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <span className="font-bold text-xs text-slate-800 block truncate">
                  {store?.name || "FreshMart Store"}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live in Koramangala
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-0.5">
              {!sidebarCollapsed && (
                <p className="px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                const navLink = (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all group relative mx-1",
                      isActive
                        ? "bg-blue-600 text-white shadow-xs font-semibold"
                        : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600"
                      )}
                    />
                    {!sidebarCollapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}

                    {!sidebarCollapsed && item.badge !== undefined && (
                      <span
                        className={cn(
                          "px-2 py-0.5 text-[10px] font-bold rounded-full",
                          isActive
                            ? "bg-white text-blue-600"
                            : "bg-blue-50 text-blue-600"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}

                    {sidebarCollapsed && item.badge !== undefined && (
                      <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
                    )}
                  </Link>
                );

                if (sidebarCollapsed) {
                  return (
                    <Tooltip.Root key={item.href}>
                      <Tooltip.Trigger asChild>{navLink}</Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          side="right"
                          sideOffset={10}
                          className="z-50 px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 rounded-lg shadow-md"
                        >
                          {item.label}
                          <Tooltip.Arrow className="fill-slate-900" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  );
                }

                return <React.Fragment key={item.href}>{navLink}</React.Fragment>;
              })}
            </div>
          ))}
        </div>

        {/* Footer: User profile, Collapse, and Logout */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60">
          <div
            className={cn(
              "flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200 shadow-2xs",
              sidebarCollapsed ? "justify-center p-1.5" : ""
            )}
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {getInitials(seller?.name || "Rajesh Kumar")}
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                  {seller?.name || "Rajesh Kumar"}
                </p>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">
                  {store?.name || "FreshMart General Store"}
                </p>
              </div>
            )}
            {!sidebarCollapsed && (
              <button
                onClick={handleLogout}
                className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between px-1">
            <button
              onClick={toggleSidebar}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-blue-600 transition-colors"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  <span>Collapse menu</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </Tooltip.Provider>
  );
}
