"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  showFilters?: boolean;
  filterOptions?: string[];
  defaultFilter?: string;
  onFilterChange?: (filter: string) => void;
  action?: React.ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  subtitle,
  children,
  showFilters = false,
  filterOptions = ["Today", "7 Days", "30 Days", "90 Days"],
  defaultFilter = "7 Days",
  onFilterChange,
  action,
  className,
}: ChartCardProps) {
  const [activeFilter, setActiveFilter] = useState(defaultFilter);

  const handleFilterClick = (option: string) => {
    setActiveFilter(option);
    if (onFilterChange) onFilterChange(option);
  };

  return (
    <div
      className={cn(
        "bg-[#f8f7fc] rounded-[24px] p-5 sm:p-6 border border-slate-100/90 transition-all duration-300",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-2 border-b border-slate-50">
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          {showFilters && (
            <div className="flex items-center bg-slate-100/80 p-0.5 rounded-xl border border-slate-200/50">
              {filterOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleFilterClick(opt)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-semibold rounded-lg transition-all",
                    activeFilter === opt
                      ? "bg-white text-purple-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
          {action}
        </div>
      </div>

      <div className="pt-2">{children}</div>
    </div>
  );
}
