"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Settings,
  User,
  Shield,
  Globe,
  HelpCircle,
  AlertTriangle,
  LogOut,
  Save,
  ChevronDown,
} from "lucide-react";
import {
  PageHeader,
  FormField,
  ConfirmDialog,
  toast,
} from "@/components/common";
import { useAuthStore } from "@/lib/store";

export default function SettingsPage() {
  const router = useRouter();
  const { seller, updateSeller, logout } = useAuthStore();

  const [activeTab, setActiveTab] = useState("account");

  // Account State
  const [name, setName] = useState(seller?.name || "Rajesh Kumar");
  const [email, setEmail] = useState(seller?.email || "rajesh@freshmart.in");
  const [phone, setPhone] = useState(seller?.phone || "+91 98765 43210");

  // Security State
  const [currPassword, setCurrPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // Preference State
  const [language, setLanguage] = useState("en");
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);

  // FAQ Accordion State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSeller({ name, email, phone });
    toast.success("Merchant profile updated successfully.");
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currPassword || !newPassword) {
      toast.error("Please enter current and new password.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    toast.success("Security password changed.");
    setCurrPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleDeactivateConfirm = () => {
    toast.error("Store deactivation request submitted to SUVORA operations.");
    setIsDeactivateOpen(false);
  };

  const faqs = [
    {
      q: "How does T+1 automated settlement work?",
      a: "All online orders completed on any business day are settled directly into your linked bank account by 9:00 AM the following morning.",
    },
    {
      q: "Can I limit order fulfillment to specific local pin codes?",
      a: "Yes, you can configure your delivery radius (in km) and serviceable areas in the 'My Store' settings tab.",
    },
    {
      q: "What commission does SUVORA charge per completed order?",
      a: "Standard local merchant tier commission is fixed at 5% flat of subtotal, covering payment gateway fees and customer support.",
    },
    {
      q: "How do I print GST tax invoices for my customers?",
      a: "Inside any order details page, click 'Print Tax Invoice' to generate a compliant GST formatted bill.",
    },
  ];

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Account & Store Settings"
        subtitle="Manage login security credentials, merchant profile, support documents and store administrative options."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Settings Navigation Bar (3 cols) */}
        <div className="lg:col-span-3 space-y-2">
          <div className="bg-white rounded-2xl p-2 border border-purple-100/70 shadow-sm space-y-1">
            <button
              onClick={() => setActiveTab("account")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === "account"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-purple-50 hover:text-purple-700"
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>Account & Profile</span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === "security"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-purple-50 hover:text-purple-700"
              }`}
            >
              <Shield className="w-4 h-4 shrink-0" />
              <span>Password & Security</span>
            </button>

            <Link
              href="/store"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-all text-left"
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Store Configuration →</span>
            </Link>

            <button
              onClick={() => setActiveTab("preferences")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === "preferences"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-purple-50 hover:text-purple-700"
              }`}
            >
              <Globe className="w-4 h-4 shrink-0" />
              <span>Language & Locale</span>
            </button>

            <button
              onClick={() => setActiveTab("help")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === "help"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-purple-50 hover:text-purple-700"
              }`}
            >
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>Help & FAQs</span>
            </button>
          </div>

          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out from Portal</span>
          </button>
        </div>

        {/* Right Settings Content Area (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          {/* TAB 1: Account Profile */}
          {activeTab === "account" && (
            <div className="bg-white rounded-2xl p-6 border border-purple-100/70 shadow-sm space-y-5">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Merchant User Profile</h3>
                <p className="text-xs text-slate-400">Personal owner contact and credentials</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
                <FormField label="Full Name" required>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </FormField>

                <FormField label="Email Address" required>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </FormField>

                <FormField label="Mobile Number">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl"
                  />
                </FormField>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Profile</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Security & Password */}
          {activeTab === "security" && (
            <div className="bg-white rounded-2xl p-6 border border-purple-100/70 shadow-sm space-y-6">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Password & Authentication</h3>
                <p className="text-xs text-slate-400">Keep your merchant portal account protected</p>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
                <FormField label="Current Password" required>
                  <input
                    type="password"
                    value={currPassword}
                    onChange={(e) => setCurrPassword(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl"
                  />
                </FormField>

                <FormField label="New Password" required>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl"
                  />
                </FormField>

                <FormField label="Confirm New Password" required>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl"
                  />
                </FormField>

                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Change Password
                </button>
              </form>

              {/* 2FA Toggle */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between p-4 rounded-xl bg-purple-50/50">
                <div>
                  <p className="text-xs font-bold text-slate-900">Two-Factor OTP Login Verification</p>
                  <p className="text-[11px] text-slate-500">Require SMS OTP code whenever signing in</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTwoFactorEnabled(!twoFactorEnabled);
                    toast.info(
                      !twoFactorEnabled ? "2FA Enabled" : "2FA Disabled"
                    );
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                    twoFactorEnabled
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  {twoFactorEnabled ? "Active" : "Disabled"}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Preferences */}
          {activeTab === "preferences" && (
            <div className="bg-white rounded-2xl p-6 border border-purple-100/70 shadow-sm space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Language & Regional Preferences</h3>
                <p className="text-xs text-slate-400">Portal display language and localization</p>
              </div>

              <div className="max-w-md space-y-4">
                <FormField label="Primary Dashboard Language">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="en">English (India)</option>
                    <option value="hi">हिंदी (Hindi - Coming Soon)</option>
                    <option value="kn">ಕನ್ನಡ (Kannada - Coming Soon)</option>
                    <option value="ta">தமிழ் (Tamil - Coming Soon)</option>
                  </select>
                </FormField>

                <FormField label="Currency & Number Formatting">
                  <input
                    type="text"
                    disabled
                    value="₹ INR (Indian Rupee, Lakhs & Crores)"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-500"
                  />
                </FormField>
              </div>
            </div>
          )}

          {/* TAB 4: Help & FAQs */}
          {activeTab === "help" && (
            <div className="bg-white rounded-2xl p-6 border border-purple-100/70 shadow-sm space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Merchant Help Center & FAQs</h3>
                <p className="text-xs text-slate-400">Common questions about local commerce on SUVORA</p>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-xl overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() =>
                        setExpandedFaq(expandedFaq === idx ? null : idx)
                      }
                      className="w-full p-4 text-left font-bold text-xs text-slate-800 flex items-center justify-between hover:bg-slate-50"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          expandedFaq === idx ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {expandedFaq === idx && (
                      <div className="p-4 pt-0 text-xs text-slate-600 bg-slate-50/50 leading-relaxed border-t border-slate-100">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 p-4 bg-purple-50/70 rounded-2xl text-xs text-purple-900">
                <p className="font-bold">Need dedicated seller support?</p>
                <p className="text-slate-600 mt-1">
                  Contact merchant support helpline: <strong>1800-SUVORA-SELLER</strong> or email <strong>sellersupport@suvora.in</strong>
                </p>
              </div>
            </div>
          )}

          {/* Danger Zone: Store Deactivation (Always visible at bottom) */}
          <div className="bg-white rounded-2xl p-6 border border-rose-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h4 className="text-sm font-bold text-slate-900">Danger Zone: Storefront Status</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Temporarily take your local store offline or permanently deactivate merchant listings. Pending orders must still be completed or refunded before deactivation.
            </p>
            <button
              type="button"
              onClick={() => setIsDeactivateOpen(true)}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl transition-colors"
            >
              Request Store Deactivation
            </button>
          </div>
        </div>
      </div>

      {/* Deactivate Confirm Dialog */}
      <ConfirmDialog
        open={isDeactivateOpen}
        onOpenChange={setIsDeactivateOpen}
        title="Confirm Store Deactivation"
        description="Are you sure you want to deactivate your store on SUVORA? Your products will no longer appear on customer mobile apps."
        confirmText="Confirm Deactivation"
        variant="danger"
        onConfirm={handleDeactivateConfirm}
      />
    </div>
  );
}

