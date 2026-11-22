"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, RotateCw, ArrowRight, Loader2, Sparkles, KeyRound } from "lucide-react";
import { toast } from "@/components/common";
import { useAuthStore } from "@/lib/store";

export default function VerifyOtpPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("suvora_pending_verification");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.otp) setGeneratedOtp(parsed.otp);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index: number, val: string) => {
    val = val.replace(/\D/g, "");
    if (val.length > 1) val = val.slice(-1);
    const updated = [...otp];
    updated[index] = val;
    setOtp(updated);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasted[i] || "";
      }
      setOtp(newOtp);
      const targetIndex = Math.min(pasted.length, 5);
      const nextInput = document.getElementById(`otp-${targetIndex}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleQuickFill = () => {
    const code = generatedOtp || "123456";
    const digits = code.split("").slice(0, 6);
    setOtp(digits);
    toast.info(`Filled verification OTP: ${code}`);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otp.join("");
    if (entered.length < 6) {
      toast.error("Please enter the complete 6-digit verification code.");
      return;
    }

    if (!email) {
      toast.error("Session expired. Please register again.");
      router.push("/register");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: entered,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Verification failed. Invalid code.", "Verification Failed");
        setIsLoading(false);
        return;
      }

      // Successful verification
      sessionStorage.removeItem("suvora_pending_verification");
      login(data.seller, data.store);

      toast.success(
        "Email and mobile phone verified! Welcome to SUVORA.",
        "Store Activated"
      );
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification error. Please try again.";
      toast.error(msg, "Network Error");
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setCountdown(30);
    toast.info("A fresh verification code is being sent...");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          phone,
          fullName: "Merchant",
          password: "placeholder-retained",
        }),
      });
      const data = await res.json();
      if (data.otp) {
        setGeneratedOtp(data.otp);
        toast.success(`New OTP dispatched! Code: ${data.otp}`);
      }
    } catch {
      toast.info("Please re-enter details if session expired.");
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xl space-y-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs border border-blue-100">
        <ShieldCheck className="w-7 h-7" />
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Verify Phone & Business Email
        </h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          Enter the 6-digit one-time password dispatched to{" "}
          <strong className="text-slate-800">{email || "your registered email"}</strong> and{" "}
          <strong className="text-slate-800">{phone || "mobile number"}</strong>
        </p>
      </div>

      {/* Helpful OTP Banner for immediate localhost testing */}
      {generatedOtp && (
        <div className="p-3 bg-blue-50/70 border border-blue-200/70 rounded-2xl flex items-center justify-between text-xs text-left max-w-xs mx-auto">
          <div className="flex items-center gap-2 text-slate-700">
            <KeyRound className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">Verification OTP</span>
              <strong className="text-sm font-mono tracking-widest text-blue-900">{generatedOtp}</strong>
            </div>
          </div>
          <button
            type="button"
            onClick={handleQuickFill}
            className="px-2.5 py-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
          >
            Fill Code
          </button>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-6">
        {/* 6 Digit Input Boxes */}
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              id={`otp-${idx}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              disabled={isLoading}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className="w-11 h-13 text-center text-xl font-bold border border-slate-200 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-slate-900 shadow-2xs transition-all disabled:opacity-60"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-xs transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying OTP code...</span>
            </>
          ) : (
            <>
              <span>Verify & Launch Store</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-2 text-xs text-slate-500">
        {countdown > 0 ? (
          <span>Resend code in <strong className="text-blue-600 font-bold">{countdown}s</strong></span>
        ) : (
          <button
            onClick={handleResend}
            className="font-bold text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Resend OTP Code</span>
          </button>
        )}
      </div>

      <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-400">
        Entered wrong details?{" "}
        <Link href="/register" className="text-blue-600 font-bold hover:underline">
          Edit registration details
        </Link>
      </div>
    </div>
  );
}
