import React from "react";
import Link from "next/link";
import { Sparkles, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8f7fc] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-purple-100 text-purple-700 flex items-center justify-center mb-6 shadow-sm border border-purple-200">
        <Sparkles className="w-8 h-8" />
      </div>
      <span className="text-sm font-bold tracking-widest text-purple-600 uppercase mb-2">
        Error 404
      </span>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
        Page Not Found
      </h1>
      <p className="text-slate-500 text-sm max-w-md mb-8 leading-relaxed">
        The page you are looking for doesn&apos;t exist or has been relocated to another section of the SUVORA Seller Portal.
      </p>
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-sm transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Go to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
