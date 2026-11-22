"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, RotateCw, ArrowRight } from "lucide-react";
import { toast } from "@/components/common";

export default function VerifyOtpPage() {
  const router = useRouter();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(30);

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

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otp.join("");
    if (entered.length < 6) {
      toast.error("Please enter complete 6-digit verification code.");
      return;
    }

    toast.success("Phone verified successfully!", "Mobile Verified");
    router.push("/onboarding");
  };

  const handleResend = () => {
    setCountdown(30);
    toast.info("A fresh OTP has been sent via SMS.");
  };

  return (
    <div className="bg-white rounded-3xl p-8 sm:p-10 border border-purple-100 shadow-xl space-y-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto shadow-xs border border-purple-100">
        <ShieldCheck className="w-7 h-7" />
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Verify Phone Number
        </h1>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          Enter the 6-digit one-time password sent to <strong className="text-slate-700">+91 98765 *****</strong>
        </p>
      </div>

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
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className="w-11 h-13 text-center text-xl font-bold border border-slate-200 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 text-slate-900 shadow-xs"
            />
          ))}
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <span>Verify & Proceed to Onboarding</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="pt-2 text-xs text-slate-500">
        {countdown > 0 ? (
          <span>Resend code in <strong className="text-purple-600">{countdown}s</strong></span>
        ) : (
          <button
            onClick={handleResend}
            className="font-bold text-purple-600 hover:underline inline-flex items-center gap-1"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Resend OTP Code</span>
          </button>
        )}
      </div>
    </div>
  );
}

