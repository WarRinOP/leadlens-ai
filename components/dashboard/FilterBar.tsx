"use client";

import { useEffect, useRef, useState } from "react";

type Tier = "All" | "Hot" | "Warm" | "Cold";
type Period = "all" | "today" | "week" | "month";

export interface FilterState {
  tier: Tier;
  period: Period;
  search: string;
}

interface FilterBarProps {
  onChange: (filters: FilterState) => void;
  resultCount?: number;
}

const TIERS: Tier[] = ["All", "Hot", "Warm", "Cold"];
const PERIODS: { label: string; value: Period }[] = [
  { label: "All Time", value: "all" },
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
];

const tierActive: Record<Tier, string> = {
  All: "bg-[#3b82f6]/15 border-[#3b82f6]/40 text-[#3b82f6]",
  Hot: "bg-[#22c55e]/15 border-[#22c55e]/40 text-[#22c55e]",
  Warm: "bg-[#f59e0b]/15 border-[#f59e0b]/40 text-[#f59e0b]",
  Cold: "bg-[#ef4444]/15 border-[#ef4444]/40 text-[#ef4444]",
};

const tierInactive =
  "bg-[#1c2028] border-[#252a35] text-[#94a3b8] hover:border-[#363d4d] hover:text-[#e2e8f0]";

export function FilterBar({ onChange, resultCount }: FilterBarProps) {
  const [tier, setTier] = useState<Tier>("All");
  const [period, setPeriod] = useState<Period>("all");
  const [search, setSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Emit immediately on tier/period change
  useEffect(() => {
    onChange({ tier, period, search });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier, period]);

  // Debounce search 300ms
  function handleSearch(val: string) {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange({ tier, period, search: val });
    }, 300);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: Tier + Date pills + Result count */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Tier filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {TIERS.map((t) => (
            <button
              key={t}
              onClick={() => setTier(t)}
              className={[
                "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150",
                tier === t ? tierActive[t] : tierInactive,
              ].join(" ")}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="hidden sm:block w-px h-5 bg-[#252a35]" />

        {/* Date range filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {PERIODS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={[
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150",
                period === value
                  ? "bg-[#3b82f6]/15 border-[#3b82f6]/40 text-[#3b82f6]"
                  : tierInactive,
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Result count — pushed right */}
        {resultCount !== undefined && (
          <span className="sm:ml-auto text-xs text-[#475569] flex-shrink-0">
            {resultCount} lead{resultCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Row 2: Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by brand or email..."
          className="w-full h-9 pl-9 pr-3 rounded-lg bg-[#13161c] border border-[#252a35] text-sm text-[#e2e8f0] placeholder:text-[#475569] focus:outline-none focus:border-[#3b82f6] hover:border-[#363d4d] transition-colors"
        />
      </div>
    </div>
  );
}
