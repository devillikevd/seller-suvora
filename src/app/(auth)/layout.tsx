import React from "react";
import Link from "next/link";
import { ShieldCheck, TrendingUp, Store } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f8f7fc] flex flex-col lg:flex-row">
      {/* Left Branding Side (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative blur rings */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link href="/login" className="inline-flex items-center">
            <div className="bg-white rounded-2xl p-2 px-4 shadow-lg border border-white/20">
              <img
                src="/images/suvora-logo.png"
                alt="SUVORA - Everything You Need, Closer."
                className="h-10 w-auto object-contain"
              />
            </div>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-800/60 border border-purple-500/30 text-purple-200 text-xs font-semibold">
            <Store className="w-3.5 h-3.5 text-purple-300" />
            Connected Local Commerce Ecosystem
          </span>
          <h2 className="text-4xl font-extrabold leading-tight text-white">
            Grow your local retail business with smart digital tools.
          </h2>
          <p className="text-purple-200/80 text-base leading-relaxed">
            Manage your store inventory, fulfill orders instantly, retain loyal neighbourhood shoppers and track settlement earnings all in one unified platform.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-purple-800/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-800/50 text-purple-300 border border-purple-700/50">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Real-time Orders</p>
                <p className="text-xs text-purple-300">Instant customer requests</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-800/50 text-purple-300 border border-purple-700/50">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Fast Settlements</p>
                <p className="text-xs text-purple-300">T+1 automated payouts</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-purple-300/80 pt-6 border-t border-purple-900/60">
          <p>© 2026 SUVORA Technologies Inc.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Seller Help</a>
          </div>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
