"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, KeyRound } from "lucide-react";
import { FormField, toast } from "@/components/common";
import { useAuthStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Mandatory Email/Phone validation
    if (!emailOrPhone.trim()) {
      toast.error("Please enter your registered email or phone number.");
      return;
    }

    // 2. Mandatory Password validation (Cannot be empty!)
    if (!password || password.trim().length === 0) {
      toast.error("Password cannot be empty. Please enter your account password.", "Password Required");
      return;
    }

    // 3. Length validation
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.", "Invalid Password");
      return;
    }

    // 4. Mock credentials verification (password123, admin123, suvora123)
    if (password !== "password123" && password !== "admin123" && password !== "suvora123") {
      toast.error("Incorrect password! For demo use: password123", "Authentication Failed");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      login();
      setIsLoading(false);
      toast.success("Welcome back to SUVORA Seller Hub!", "Login Successful");
      router.push("/dashboard");
    }, 400);
  };

  const handleQuickFillDemo = () => {
    setEmailOrPhone("rajesh@freshmart.in");
    setPassword("password123");
    toast.info("Demo credentials filled: rajesh@freshmart.in / password123");
  };

  return (
    <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xl space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Merchant Portal Access</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Sign In to Your Store
        </h1>
        <p className="text-xs text-slate-500">
          Enter your registered seller phone number or business email
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Email or Mobile Number" required>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              placeholder="e.g. rajesh@freshmart.in or 9876543210"
              className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 transition-all placeholder:text-slate-400"
            />
          </div>
        </FormField>

        <FormField label="Password" required>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your account password"
              className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 transition-all placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </FormField>

        {/* Demo Credentials Helper Pill */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <KeyRound className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Demo: <strong className="text-slate-800">password123</strong></span>
          </div>
          <button
            type="button"
            onClick={handleQuickFillDemo}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Auto-fill
          </button>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="w-3.5 h-3.5 accent-blue-600 rounded"
            />
            <span>Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-blue-600 hover:text-blue-700 font-bold hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-xs transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70"
        >
          <span>{isLoading ? "Signing in..." : "Access Seller Dashboard"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
        New merchant to SUVORA?{" "}
        <Link
          href="/register"
          className="font-bold text-blue-600 hover:underline ml-1"
        >
          Register your store
        </Link>
      </div>
    </div>
  );
}
