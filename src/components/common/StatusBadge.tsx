import React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "purple"
  | "coral"
  | "outline";

interface StatusBadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  size?: "sm" | "md";
  dot?: boolean;
  className?: string;
}

export function StatusBadge({
  variant = "neutral",
  children,
  size = "md",
  dot = true,
  className,
}: StatusBadgeProps) {
  const variantStyles: Record<BadgeVariant, { bg: string; text: string; dotColor: string; border: string }> = {
    success: {
      bg: "bg-[#18B978]/10",
      text: "text-[#18B978]",
      dotColor: "bg-[#18B978]",
      border: "border-[#18B978]/20",
    },
    warning: {
      bg: "bg-[#F5A623]/10",
      text: "text-[#F5A623]",
      dotColor: "bg-[#F5A623]",
      border: "border-[#F5A623]/20",
    },
    error: {
      bg: "bg-[#F05A55]/10",
      text: "text-[#F05A55]",
      dotColor: "bg-[#F05A55]",
      border: "border-[#F05A55]/20",
    },
    coral: {
      bg: "bg-[#F05A55]/10",
      text: "text-[#F05A55]",
      dotColor: "bg-[#F05A55]",
      border: "border-[#F05A55]/20",
    },
    info: {
      bg: "bg-[#27A9E8]/10",
      text: "text-[#27A9E8]",
      dotColor: "bg-[#27A9E8]",
      border: "border-[#27A9E8]/20",
    },
    purple: {
      bg: "bg-[#7656E8]/10",
      text: "text-[#7656E8]",
      dotColor: "bg-[#7656E8]",
      border: "border-[#7656E8]/20",
    },
    neutral: {
      bg: "bg-slate-100",
      text: "text-slate-700",
      dotColor: "bg-slate-400",
      border: "border-slate-200",
    },
    outline: {
      bg: "bg-transparent",
      text: "text-slate-600",
      dotColor: "bg-slate-400",
      border: "border-slate-300",
    },
  };

  const style = variantStyles[variant] || variantStyles.neutral;

  return (
    <span
      className={cn(
        "inline-flex items-center font-bold rounded-full border transition-colors whitespace-nowrap",
        style.bg,
        style.text,
        style.border,
        size === "sm" ? "px-2 py-0.5 text-[10px] gap-1" : "px-2.5 py-1 text-[11px] gap-1.5",
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "rounded-full shrink-0",
            style.dotColor,
            size === "sm" ? "w-1.5 h-1.5" : "w-1.5 h-1.5"
          )}
        />
      )}
      {children}
    </span>
  );
}
