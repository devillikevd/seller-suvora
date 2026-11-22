"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Store,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";

export default function VerificationStatusPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [mockStatus, setMockStatus] = useState<"pending" | "approved" | "rejected">(
    "approved"
  );

  const handleGoToDashboard = () => {
    login();
    router.push("/dashboard");
  };

  return (
    <div className="bg-white rounded-3xl p-8 sm:p-10 border border-purple-100 shadow-xl space-y-6 max-w-xl mx-auto">
      {/* Simulation Toggle Bar */}
      <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs">
        <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wider pl-2">
          Demo State Toggle:
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setMockStatus("pending")}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
              mockStatus === "pending"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-slate-600 hover:bg-white"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setMockStatus("approved")}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
              mockStatus === "approved"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-white"
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setMockStatus("rejected")}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
              mockStatus === "rejected"
                ? "bg-rose-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-white"
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* STATE 1: Approved */}
      {mockStatus === "approved" && (
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
              Congratulations! Your GST identification, merchant address, and storefront credentials have been verified by SUVORA Compliance.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-left space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-950 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Merchant Trust Badge Activated</span>
            </div>
            <p className="text-emerald-800 text-[11px] leading-relaxed">
              Your listings now appear in the Koramangala local marketplace customer app with same-day delivery availability.
            </p>
          </div>

          <button
            onClick={handleGoToDashboard}
            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>Launch Seller Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STATE 2: Pending */}
      {mockStatus === "pending" && (
        <div className="text-center space-y-4 animate-in fade-in">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-xs">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-widest text-amber-600 uppercase">
              Under Review
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Verification in Progress
            </h1>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
              Our merchant onboarding team is verifying your GSTIN certificate and business address. Verification typically completes within 4 to 8 business hours.
            </p>
          </div>

          {/* Timeline */}
          <div className="p-4 rounded-2xl bg-slate-50 text-left text-xs space-y-3">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Application Submitted Successfully</span>
            </div>
            <div className="flex items-center gap-2 text-amber-700 font-semibold">
              <Clock className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Document Background Check (In Progress)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Store className="w-4 h-4 shrink-0" />
              <span>Merchant Catalog Live Activation</span>
            </div>
          </div>

          <button
            onClick={handleGoToDashboard}
            className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all inline-block"
          >
            Preview Dashboard in Sandbox Mode
          </button>
        </div>
      )}

      {/* STATE 3: Rejected */}
      {mockStatus === "rejected" && (
        <div className="text-center space-y-4 animate-in fade-in">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200 shadow-xs">
            <XCircle className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-widest text-rose-600 uppercase">
              Action Required
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Document Clarification Needed
            </h1>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
              We could not verify your trade registration because the uploaded GST certificate scan was blurry or mismatched with the business address.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-left text-xs text-rose-900 space-y-1">
            <p className="font-bold">Compliance Officer Note:</p>
            <p className="text-rose-800 text-[11px] leading-relaxed">
              &ldquo;Please re-upload a clear PDF copy of Form GST REG-06 showing legal name and principal place of business.&rdquo;
            </p>
          </div>

          <Link
            href="/onboarding"
            className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-md transition-all inline-block"
          >
            Re-Upload Required Documents
          </Link>
        </div>
      )}
    </div>
  );
}

