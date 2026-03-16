import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pipeline Dashboard — LeadLens",
  description: "View, filter, and export all analyzed inbound leads in your LeadLens pipeline.",
};

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/25 text-[#f59e0b] text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse" />
          Dashboard UI Coming in Phase 4
        </span>
        <h1 className="text-3xl font-bold text-[#e2e8f0] tracking-tight">
          Pipeline Dashboard
        </h1>
        <p className="text-[#94a3b8] max-w-md">
          Filter leads by tier, date range, and search — then export to CSV.
        </p>
      </div>
    </div>
  );
}
