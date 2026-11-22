"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Store,
  MapPin,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import { FormField, toast } from "@/components/common";

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Business Information
  const [storeName, setStoreName] = useState("FreshMart Local Essentials");
  const [storeCategory, setStoreCategory] = useState("Grocery & Daily Staples");
  const [gstNumber, setGstNumber] = useState("29ABCDE1234F1Z5");
  const [panNumber, setPanNumber] = useState("ABCDE1234F");

  // Step 2: Physical Address
  const [line1, setLine1] = useState("Shop No. 12, Sunrise Complex");
  const [line2, setLine2] = useState("80 Feet Road, 4th Block");
  const [city, setCity] = useState("Bangalore");
  const [state, setState] = useState("Karnataka");
  const [pincode, setPincode] = useState("560034");

  // Step 3: Documents Upload
  const [panUploaded, setPanUploaded] = useState(true);
  const [gstUploaded, setGstUploaded] = useState(true);
  const [fssaiUploaded, setFssaiUploaded] = useState(false);

  const steps = [
    { num: 1, label: "Business Info", icon: Store },
    { num: 2, label: "Store Address", icon: MapPin },
    { num: 3, label: "KYC Documents", icon: FileText },
    { num: 4, label: "Application Review", icon: CheckCircle2 },
  ];

  const handleNext = () => {
    if (currentStep === 1) {
      if (!storeName.trim() || !gstNumber.trim()) {
        toast.error("Please provide store name and GST / Trade number.");
        return;
      }
    } else if (currentStep === 2) {
      if (!line1.trim() || !city.trim() || !pincode.trim()) {
        toast.error("Please fill in complete street address and pincode.");
        return;
      }
    }
    setCurrentStep((s) => s + 1);
  };

  const handleFinalSubmit = () => {
    toast.success("Store registration submitted for merchant verification!");
    router.push("/verification-status");
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-purple-100 shadow-xl space-y-6 max-w-xl mx-auto">
      {/* Progress Steps Header */}
      <div className="space-y-4 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Store Registration Onboarding
          </h1>
          <p className="text-xs text-slate-400">
            Complete your merchant profile to launch on SUVORA local marketplace
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between">
          {steps.map((st) => {
            const isCompleted = currentStep > st.num;
            const isCurrent = currentStep === st.num;

            return (
              <div key={st.num} className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                      ? "bg-purple-600 text-white ring-4 ring-purple-100 shadow-xs"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : st.num}
                </div>
                <span
                  className={`text-[10px] font-bold text-center hidden sm:block ${
                    isCurrent ? "text-purple-700" : "text-slate-400"
                  }`}
                >
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Business Information */}
      {currentStep === 1 && (
        <div className="space-y-4 animate-in fade-in">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-purple-700">
            Step 1: Retail Business Details
          </h3>

          <FormField label="Official Store Trade Name" required>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </FormField>

          <FormField label="Primary Store Category" required>
            <select
              value={storeCategory}
              onChange={(e) => setStoreCategory(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-white"
            >
              <option value="Grocery & Daily Staples">Grocery & Daily Staples</option>
              <option value="Fresh Fruits & Vegetables">Fresh Fruits & Vegetables</option>
              <option value="Dairy & Bakery">Dairy & Bakery</option>
              <option value="Pharmacy & Health">Pharmacy & Health</option>
              <option value="Pet Care & Household">Pet Care & Household</option>
            </select>
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="GSTIN Identification" required>
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2 text-sm font-mono border border-slate-200 rounded-xl uppercase"
              />
            </FormField>

            <FormField label="Business PAN">
              <input
                type="text"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2 text-sm font-mono border border-slate-200 rounded-xl uppercase"
              />
            </FormField>
          </div>
        </div>
      )}

      {/* STEP 2: Physical Store Address */}
      {currentStep === 2 && (
        <div className="space-y-4 animate-in fade-in">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-purple-700">
            Step 2: Store Physical Location
          </h3>

          <FormField label="Address Line 1" required>
            <input
              type="text"
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl"
            />
          </FormField>

          <FormField label="Address Line 2 (Locality)">
            <input
              type="text"
              value={line2}
              onChange={(e) => setLine2(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl"
            />
          </FormField>

          <div className="grid grid-cols-3 gap-3">
            <FormField label="City" required>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl"
              />
            </FormField>
            <FormField label="State" required>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl"
              />
            </FormField>
            <FormField label="Pincode" required>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl"
              />
            </FormField>
          </div>
        </div>
      )}

      {/* STEP 3: Document Uploads */}
      {currentStep === 3 && (
        <div className="space-y-4 animate-in fade-in">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-purple-700">
            Step 3: Verification Documents (KYC)
          </h3>

          <div className="space-y-3">
            {/* PAN Card */}
            <div className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">Business PAN Card</p>
                <p className="text-[11px] text-slate-400">PDF or Clear photo</p>
              </div>
              <button
                type="button"
                onClick={() => setPanUploaded(!panUploaded)}
                className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                  panUploaded
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-purple-50 text-purple-700 border-purple-200"
                }`}
              >
                {panUploaded ? "✓ Attached" : "+ Upload"}
              </button>
            </div>

            {/* GST Certificate */}
            <div className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">GST Registration Certificate</p>
                <p className="text-[11px] text-slate-400">Mandatory for GST billing</p>
              </div>
              <button
                type="button"
                onClick={() => setGstUploaded(!gstUploaded)}
                className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                  gstUploaded
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-purple-50 text-purple-700 border-purple-200"
                }`}
              >
                {gstUploaded ? "✓ Attached" : "+ Upload"}
              </button>
            </div>

            {/* FSSAI License */}
            <div className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">FSSAI Food Safety License</p>
                <p className="text-[11px] text-slate-400">Required for food & grocery</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFssaiUploaded(!fssaiUploaded);
                  toast.success("FSSAI License document attached.");
                }}
                className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                  fssaiUploaded
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-purple-50 text-purple-700 border-purple-200"
                }`}
              >
                {fssaiUploaded ? "✓ Attached" : "+ Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Application Review & Submit */}
      {currentStep === 4 && (
        <div className="space-y-4 animate-in fade-in">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-purple-700">
            Step 4: Review Store Application
          </h3>

          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Store Name:</span>
              <span className="font-bold text-slate-800">{storeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Trade Category:</span>
              <span className="font-bold text-slate-800">{storeCategory}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">GST Number:</span>
              <span className="font-mono font-bold text-slate-800">{gstNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Location:</span>
              <span className="font-bold text-slate-800 text-right">{line1}, {city}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Documents Attached:</span>
              <span className="font-bold text-emerald-700">PAN & GST Verified</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            By submitting, you certify that all business registration credentials provided represent bona fide local commercial operations in compliance with marketplace vendor regulations.
          </p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={() => setCurrentStep((s) => s - 1)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous Step</span>
          </button>
        ) : (
          <div />
        )}

        {currentStep < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <span>Proceed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinalSubmit}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Submit Store Application</span>
          </button>
        )}
      </div>
    </div>
  );
}

