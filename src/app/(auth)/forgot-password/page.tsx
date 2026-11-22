"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { FormField, toast } from "@/components/common";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid registered email address.");
      return;
    }
    setIsSubmitted(true);
    toast.success("Password recovery instructions dispatched.");
  };

  return (
    <div className="bg-white rounded-3xl p-8 sm:p-10 border border-purple-100 shadow-xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Recover Password
        </h1>
        <p className="text-xs text-slate-400">
          We&apos;ll send a password recovery reset link to your verified email
        </p>
      </div>

      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Registered Email Address" required>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="merchant@suvora.in"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>
          </FormField>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <span>Send Password Reset Link</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-100 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-900">Recovery Email Dispatched</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Please check the inbox of <strong className="text-slate-800">{email}</strong> for your secure one-time password reset token.
          </p>
        </div>
      )}

      <div className="pt-2 text-center text-xs">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 font-bold text-purple-600 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Seller Sign In</span>
        </Link>
      </div>
    </div>
  );
}

