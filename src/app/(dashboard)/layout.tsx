"use client";

import React, { Suspense, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { useAuthStore } from "@/lib/store";

const emptySubscribe = () => () => {};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);

  useEffect(() => {
    if (isClient && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isClient, isAuthenticated, router]);

  // Prevent access to protected layout if unauthenticated
  if (!isClient || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Checking authorization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-[#0F172A] antialiased selection:bg-blue-600/15 selection:text-blue-600 overflow-x-hidden w-full max-w-full">
      {/* 1. Full-Width Top Header with SUVORA Logo at TOP-LEFT */}
      <Suspense fallback={<div className="h-20 bg-white border-b border-slate-200" />}>
        <Header />
      </Suspense>

      {/* 2. Main Body: Sidebar + Workspace */}
      <div className="flex-1 flex flex-row min-w-0 w-full">
        {/* Left Vertical Fixed Sidebar (~250px) */}
        <Sidebar />

        {/* Mobile Navigation Drawer */}
        <MobileNav />

        {/* Workspace Content Canvas */}
        <main className="flex-1 p-5 sm:p-6 lg:p-8 max-w-[1540px] w-full mx-auto space-y-6 min-w-0 overflow-x-hidden">
          <Suspense fallback={<div className="p-12 text-center text-slate-500 font-medium text-xs">Loading workspace...</div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
