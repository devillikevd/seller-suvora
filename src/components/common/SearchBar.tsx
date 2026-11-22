"use client";

import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  debounceMs?: number;
}

export function SearchBar({
  placeholder = "Search...",
  value: controlledValue,
  onChange,
  className,
  debounceMs = 250,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(controlledValue || "");
  const [prevControlled, setPrevControlled] = useState(controlledValue);

  if (controlledValue !== undefined && controlledValue !== prevControlled) {
    setPrevControlled(controlledValue);
    setInternalValue(controlledValue);
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      if (onChange && internalValue !== controlledValue) {
        onChange(internalValue);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [internalValue, debounceMs, onChange, controlledValue]);

  const handleClear = () => {
    setInternalValue("");
    if (onChange) onChange("");
  };

  return (
    <div className={cn("relative flex items-center", className)}>
      <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-slate-800 shadow-sm"
      />
      {internalValue && (
        <button
          onClick={handleClear}
          className="absolute right-2.5 text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-md hover:bg-slate-100"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
