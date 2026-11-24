"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";

export default function VerificationStatusPage() {
  const router = useRouter();
  const { store } = useAuthStore();
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">(
    store?.verified ? "approved" : "approved"
  );

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/store");
        if (res.ok) {
          const data = await res.json();
          if (data.store) {
            setStatus(
              data.store.verificationStatus === "rejected"
                ? "rejected"
                : data.store.verificationStatus === "pending"
                ? "pending"
                : "approved"
            );
          }
        }
      } catch (err) {
        console.error("Verification status check error:", err);
      }
    }
    checkStatus();
  }, []);

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="bg-white rounded-3xl p-8 sm:p-10 border border-purple-100 shadow-xl space-y-6 max-w-xl mx-auto">
      {/* Real Verification Status: Approved */}
      {status === "approved" && (
        <div className="text-center space-y-4 animate-in fade-in">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase">
              Application Approved
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Storefront Verified & Live!
            </h1>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
              Congratulations! Your merchant account, storefront credentials, and local delivery radius have been verified on SUVORA Seller Hub.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-left space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-950 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Merchant Trust Badge Activated</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Your store is now authorized to list FMCG inventory, accept online UPI payments, and receive automated T+1 morning bank payouts.
            </p>
          </div>

          <button
            onClick={handleGoToDashboard}
            className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Enter Merchant Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Real Verification Status: Pending */}
      {status === "pending" && (
        <div className="text-center space-y-4 animate-in fade-in">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-xs">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-widest text-amber-600 uppercase">
              Review in Progress
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Verification Under Review
            </h1>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
              Our automated KYC engine is verifying your details. This usually completes within 10-15 minutes.
            </p>
          </div>
          <button
            onClick={handleGoToDashboard}
            className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed to Store Setup</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Real Verification Status: Rejected */}
      {status === "rejected" && (
        <div className="text-center space-y-4 animate-in fade-in">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200 shadow-xs">
            <XCircle className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-widest text-rose-600 uppercase">
              Action Required
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Documents Need Revision
            </h1>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
              Please review your store address and proprietor details in settings to complete verification.
            </p>
          </div>
          <Link
            href="/settings"
            className="w-full py-3.5 px-6 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer inline-flex"
          >
            <span>Update Store Information</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
