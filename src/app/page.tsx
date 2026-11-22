"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
      return;
    }

    // Verify if there is an active session cookie on the server
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Not authenticated");
      })
      .then((data) => {
        if (data?.authenticated && data.seller) {
          login(data.seller, data.store);
          router.replace("/dashboard");
        } else {
          router.replace("/login");
        }
      })
      .catch(() => {
        router.replace("/login");
      })
      .finally(() => {
        setChecking(false);
      });
  }, [isAuthenticated, login, router]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-3">
      <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-semibold text-slate-500">Loading SUVORA Seller Hub...</p>
    </div>
  );
}
