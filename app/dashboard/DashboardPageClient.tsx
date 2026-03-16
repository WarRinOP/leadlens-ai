"use client";

import { useCallback, useEffect, useState } from "react";
import { PipelineStats } from "@/components/dashboard/PipelineStats";
import { FilterBar, type FilterState } from "@/components/dashboard/FilterBar";
import { LeadTable } from "@/components/dashboard/LeadTable";
import { LeadDrawer, type Lead } from "@/components/dashboard/LeadDrawer";
import { ExportButton } from "@/components/dashboard/ExportButton";

export default function DashboardPageClient() {
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [filterKey, setFilterKey] = useState(0);
  const defaultFilters: FilterState = { tier: "All", period: "all", search: "" };
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  // ── Fetch leads from API ──────────────────────────────────────────────────
  const fetchLeads = useCallback(async (f: FilterState) => {
    setLoading(true);
    setFetchError(false);
    try {
      const params = new URLSearchParams();
      if (f.tier !== "All") params.set("tier", f.tier);
      if (f.period !== "all") params.set("period", f.period);
      if (f.search.trim()) params.set("search", f.search.trim());
      const url = `/api/leads${params.toString() ? `?${params}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Fetch failed");
      const { leads } = await res.json();
      setFilteredLeads(leads ?? []);
      if (f.tier === "All" && f.period === "all" && !f.search) {
        setAllLeads(leads ?? []);
      }
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load — fetch all leads for stats
  useEffect(() => {
    fetchLeads({ tier: "All", period: "all", search: "" });
  }, [fetchLeads]);

  function handleFilterChange(f: FilterState) {
    setFilters(f);
    fetchLeads(f);
  }

  // Optimistic delete — remove from both lists
  function handleDelete(id: string) {
    setAllLeads((prev) => prev.filter((l) => l.id !== id));
    setFilteredLeads((prev) => prev.filter((l) => l.id !== id));
  }

  // Clear all filters
  function clearFilters() {
    setFilters(defaultFilters);
    setFilterKey((k) => k + 1);
    fetchLeads(defaultFilters);
  }

  const isFiltered =
    filters.tier !== "All" || filters.period !== "all" || filters.search !== "";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#e2e8f0] tracking-tight">
            Pipeline Dashboard
          </h1>
          <p className="text-[#94a3b8] mt-1">
            All analyzed leads in one place
          </p>
        </div>
        <div className="flex-shrink-0 pt-1">
          <ExportButton filters={filters} />
        </div>
      </div>

      {/* ── Stats row ───────────────────────────────────────────────── */}
      <div className="mb-6">
        <PipelineStats leads={allLeads} />
      </div>

      {/* ── Filter bar ──────────────────────────────────────────────── */}
      <div className="mb-4">
        <FilterBar
          key={filterKey}
          onChange={handleFilterChange}
          resultCount={filteredLeads.length}
        />
      </div>

      {/* ── Lead table + states ──────────────────────────────────── */}
      {loading ? (
        <div className="rounded-xl border border-[#252a35] overflow-hidden">
          <div className="h-10 bg-[#13161c] border-b border-[#252a35] animate-pulse" />
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-12 bg-[#13161c] border-b border-[#252a35] last:border-0 animate-pulse"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center rounded-xl border border-[#ef4444]/20 bg-[#ef4444]/5">
          <div className="w-12 h-12 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-[#e2e8f0] font-medium mb-1">Could not load leads</p>
            <p className="text-sm text-[#475569]">Check your connection and try again.</p>
          </div>
          <button
            onClick={() => fetchLeads(filters)}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <LeadTable
          leads={filteredLeads}
          onLeadClick={(lead) => setSelectedLead(lead)}
          hasFilters={isFiltered}
          onClearFilters={clearFilters}
        />
      )}

      {/* ── Lead drawer ─────────────────────────────────────────────── */}
      <LeadDrawer
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onDelete={handleDelete}
      />
    </div>
  );
}
