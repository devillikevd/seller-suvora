"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Store, Loader2, Sparkles } from "lucide-react";
import { FormField, toast } from "@/components/common";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Ensure fresh registration fields
  React.useEffect(() => {
    setFullName("");
    setStoreName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setConfirmPassword("");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("Please enter proprietor full name.");
      return;
    }
    if (!email.trim() || !email.includes("@") || !email.includes(".")) {
      toast.error("Please provide a valid business email address.");
      return;
    }
    if (phone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match. Please verify.");
      return;
    }
    if (!agreeTerms) {
      toast.error("Please agree to the SUVORA Merchant Agreement.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          storeName: storeName.trim() || undefined,
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(
          data.error || "Failed to dispatch verification code.",
          "Registration Failed"
        );
        setIsLoading(false);
        return;
      }

      // Save pending verification info in sessionStorage for the /verify screen
      sessionStorage.setItem(
        "suvora_pending_verification",
        JSON.stringify({
          email: data.email,
          phone: data.phone,
          otp: data.otp,
        })
      );

      toast.success(
        "Verification code dispatched to your email and phone!",
        "OTP Dispatched"
      );
      router.push("/verify");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error. Please try again.";
      toast.error(msg, "Connection Error");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xl space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Quick Onboarding</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Create Seller Account
        </h1>
        <p className="text-xs text-slate-500">
          Join SUVORA and take your local store online in under 2 minutes
        </p>
      </div>

      <form onSubmit={handleSubmit} autoComplete="off" className="space-y-3.5">
        {/* Hidden decoy fields to defeat browser autofill */}
        <input type="text" name="decoy_username" tabIndex={-1} className="hidden" aria-hidden="true" autoComplete="off" />
        <input type="password" name="decoy_password" tabIndex={-1} className="hidden" aria-hidden="true" autoComplete="off" />

        <FormField label="Proprietor / Full Name" required>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              name="reg_proprietor_name"
              autoComplete="off"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ramesh Chandra"
              disabled={isLoading}
              className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 disabled:opacity-60"
            />
          </div>
        </FormField>

        <FormField label="Store / Business Name">
          <div className="relative">
            <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              name="reg_store_name"
              autoComplete="off"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder={fullName ? `${fullName}'s Store` : "e.g. Ramesh Kirana & Daily Needs"}
              disabled={isLoading}
              className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 disabled:opacity-60"
            />
          </div>
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <FormField label="Email Address" required>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="email"
                name="reg_business_email"
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="merchant@suvora.in"
                disabled={isLoading}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 disabled:opacity-60"
              />
            </div>
          </FormField>

          <FormField label="Mobile Phone Number" required>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="tel"
                name="reg_phone_number"
                autoComplete="off"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                disabled={isLoading}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 disabled:opacity-60"
              />
            </div>
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <FormField label="Create Password" required>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                name="reg_user_password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                disabled={isLoading}
                className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 disabled:opacity-60"
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

          <FormField label="Confirm Password" required>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="password"
                name="reg_confirm_password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                disabled={isLoading}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl text-slate-900 disabled:opacity-60"
              />
            </div>
          </FormField>
        </div>

        <div className="pt-1">
          <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 accent-blue-600 rounded mt-0.5"
            />
            <span>
              I agree to the SUVORA Merchant Agreement, Marketplace Policies, and Privacy Terms.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-xs transition-all active:scale-[0.99] flex items-center justify-center gap-2 mt-2 disabled:opacity-70 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending verification code...</span>
            </>
          ) : (
            <>
              <span>Verify Mobile & Email (OTP)</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
        Already registered as a seller?{" "}
        <Link href="/login" className="font-bold text-blue-600 hover:underline ml-1">
          Sign In
        </Link>
      </div>
    </div>
  );
}
