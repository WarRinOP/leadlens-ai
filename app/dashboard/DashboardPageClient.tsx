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
  const [filters, setFilters] = useState<FilterState>({
    tier: "All",
    period: "all",
    search: "",
  });

  // ── Fetch leads from API ──────────────────────────────────────────────────
  const fetchLeads = useCallback(async (f: FilterState) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.tier !== "All") params.set("tier", f.tier);
      if (f.period !== "all") params.set("period", f.period);
      if (f.search.trim()) params.set("search", f.search.trim());
      const url = `/api/leads${params.toString() ? `?${params}` : ""}`;
      const res = await fetch(url);
      const { leads } = await res.json();
      setFilteredLeads(leads ?? []);

      // Always keep the unfiltered list for stats
      if (f.tier === "All" && f.period === "all" && !f.search) {
        setAllLeads(leads ?? []);
      }
    } catch {
      // keep previous state silently
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
          onChange={handleFilterChange}
          resultCount={filteredLeads.length}
        />
      </div>

      {/* ── Lead table ──────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-12 rounded-xl bg-[#13161c] border border-[#252a35] animate-pulse"
            />
          ))}
        </div>
      ) : (
        <LeadTable
          leads={filteredLeads}
          onLeadClick={(lead) => setSelectedLead(lead)}
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
