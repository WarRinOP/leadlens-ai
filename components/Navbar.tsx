"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function Navbar() {
  const pathname = usePathname();
  const [totalLeads, setTotalLeads] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCount() {
      const { count } = await supabase
        .from("ll_leads")
        .select("*", { count: "exact", head: true });
      setTotalLeads(count ?? 0);
    }
    fetchCount();
  }, []);

  const links = [
    { href: "/", label: "Analyzer" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#252a35] bg-[#0a0c10]/95 backdrop-blur-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#3b82f6] text-white text-xs font-bold">
            LL
          </span>
          <span className="text-[15px] font-semibold text-[#e2e8f0] tracking-tight">
            LeadLens
          </span>
        </Link>

        {/* Center nav links */}
        <div className="flex items-center gap-1">
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150",
                  "relative",
                  active
                    ? "text-[#e2e8f0] bg-[#1c2028]"
                    : "text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#13161c]",
                ].join(" ")}
              >
                {label}
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#3b82f6] rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right — leads count chip */}
        <div className="flex-shrink-0">
          {totalLeads !== null ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1c2028] border border-[#252a35] text-xs text-[#94a3b8]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
              {totalLeads.toLocaleString()} leads
            </span>
          ) : (
            <span className="w-20 h-6 rounded-full bg-[#1c2028] animate-pulse" />
          )}
        </div>
      </nav>
    </header>
  );
}
