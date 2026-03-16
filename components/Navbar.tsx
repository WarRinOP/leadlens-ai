"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { HowItWorksModal } from "@/components/HowItWorksModal";

export function Navbar() {
  const pathname = usePathname();
  const [totalLeads, setTotalLeads] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function fetchCount() {
      const { count } = await supabase
        .from("ll_leads")
        .select("*", { count: "exact", head: true });
      setTotalLeads(count ?? 0);
    }
    fetchCount();
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  const links = [
    { href: "/", label: "Analyzer" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  return (
    <>
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

          {/* Center nav links — hidden on mobile */}
          <div className="hidden sm:flex items-center gap-1">
            {links.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    "px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 relative",
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

          {/* Right side */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* How It Works button */}
            <button
              onClick={() => setShowModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#1c2028] border border-[#252a35] transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How It Works
            </button>

            {/* Leads count chip — hidden on very small screens */}
            <div className="hidden xs:flex">
              {totalLeads !== null ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1c2028] border border-[#252a35] text-xs text-[#94a3b8]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
                  {totalLeads.toLocaleString()} leads
                </span>
              ) : (
                <span className="w-20 h-6 rounded-full bg-[#1c2028] animate-pulse" />
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="sm:hidden w-8 h-8 flex items-center justify-center rounded-lg text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#1c2028] transition-colors"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="sm:hidden border-t border-[#252a35] bg-[#0a0c10] px-4 py-3 flex flex-col gap-1">
            {links.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMenu}
                  className={[
                    "px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150",
                    active
                      ? "text-[#e2e8f0] bg-[#1c2028]"
                      : "text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#13161c]",
                  ].join(" ")}
                >
                  {label}
                </Link>
              );
            })}
            {/* How It Works — mobile */}
            <button
              onClick={() => { setShowModal(true); closeMenu(); }}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-left text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#13161c] transition-colors"
            >
              How It Works
            </button>
            {totalLeads !== null && (
              <div className="px-3 py-1 mt-1">
                <span className="text-xs text-[#475569]">
                  {totalLeads.toLocaleString()} leads analyzed
                </span>
              </div>
            )}
          </div>
        )}
      </header>

      {showModal && <HowItWorksModal onClose={() => setShowModal(false)} />}
    </>
  );
}
