"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import type { FilterState } from "./FilterBar";

interface ExportButtonProps {
  filters: FilterState;
}

export function ExportButton({ filters }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleExport() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.tier !== "All") params.set("tier", filters.tier);
      if (filters.period !== "all") params.set("period", filters.period);
      if (filters.search.trim()) params.set("search", filters.search.trim());

      const url = `/api/export${params.toString() ? `?${params}` : ""}`;
      const res = await fetch(url);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Export failed");
      }

      const blob = await res.blob();
      const dateStr = new Date().toISOString().split("T")[0];
      const filename = `leadlens-export-${dateStr}.csv`;
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      toast("Downloaded!", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Export failed, try again";
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border border-[#252a35] bg-[#1c2028] text-[#94a3b8] hover:text-[#e2e8f0] hover:border-[#363d4d] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      )}
      {loading ? "Exporting…" : "Export CSV"}
    </button>
  );
}
