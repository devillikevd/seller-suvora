"use client";

import React from "react";
import { create } from "zustand";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastState {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { ...toast, id, duration: toast.duration || 4000 };
    set((state) => ({ toasts: [...state.toasts, newToast] }));

    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, newToast.duration);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (message: string, title = "Success") =>
    useToastStore.getState().addToast({ type: "success", title, message }),
  error: (message: string, title = "Error") =>
    useToastStore.getState().addToast({ type: "error", title, message }),
  warning: (message: string, title = "Warning") =>
    useToastStore.getState().addToast({ type: "warning", title, message }),
  info: (message: string, title = "Info") =>
    useToastStore.getState().addToast({ type: "info", title, message }),
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
          info: <Info className="w-5 h-5 text-purple-600 shrink-0" />,
        };

        const bgBorders = {
          success: "bg-emerald-50/95 border-emerald-200 text-emerald-950",
          error: "bg-rose-50/95 border-rose-200 text-rose-950",
          warning: "bg-amber-50/95 border-amber-200 text-amber-950",
          info: "bg-purple-50/95 border-purple-200 text-purple-950",
        };

        return (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300 animate-in slide-in-from-bottom-2",
              bgBorders[t.type]
            )}
          >
            {icons[t.type]}
            <div className="flex-1 min-w-0">
              {t.title && <h5 className="font-semibold text-sm leading-tight">{t.title}</h5>}
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-md hover:bg-black/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
