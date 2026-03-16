"use client";

import { useState } from "react";
import Link from "next/link";
import { TierBadge } from "@/components/analyzer/TierBadge";
import type { Lead } from "./LeadDrawer";

const PAGE_SIZE = 10;

interface LeadTableProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fullDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

function signalColor(val: string): string {
  if (["High", "Strong"].includes(val)) return "#22c55e";
  if (["Medium", "Moderate"].includes(val)) return "#f59e0b";
  return "#ef4444";
}

function scoreColor(score: number) {
  if (score >= 70) return { bg: "bg-[#22c55e]/10", text: "text-[#22c55e]", border: "border-[#22c55e]/25" };
  if (score >= 40) return { bg: "bg-[#f59e0b]/10", text: "text-[#f59e0b]", border: "border-[#f59e0b]/25" };
  return { bg: "bg-[#ef4444]/10", text: "text-[#ef4444]", border: "border-[#ef4444]/25" };
}

export function LeadTable({ leads, onLeadClick }: LeadTableProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(leads.length / PAGE_SIZE);
  const pageLeads = leads.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 when leads list changes (filters)
  const prevLen = leads.length;
  if (page > 1 && (page - 1) * PAGE_SIZE >= prevLen) {
    setPage(1);
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center rounded-xl border border-dashed border-[#252a35]">
        <div className="w-12 h-12 rounded-full bg-[#1c2028] border border-[#252a35] flex items-center justify-center text-xl">
          📭
        </div>
        <div>
          <p className="text-[#e2e8f0] font-medium mb-1">No leads yet</p>
          <p className="text-sm text-[#475569]">
            Analyze your first lead to see it here, or{" "}
            <Link href="/" className="text-[#3b82f6] hover:underline">
              go to the Analyzer
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Table — horizontal scroll on mobile */}
      <div className="overflow-x-auto rounded-xl border border-[#252a35]">
        <table className="w-full min-w-[640px] text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#252a35]">
              {["Score", "Tier", "Brand", "Email Preview", "Intent", "Budget", "Date"].map((h) => (
                <th
                  key={h}
                  className="text-left text-[10px] font-semibold uppercase tracking-widest text-[#475569] px-4 py-3 bg-[#13161c] first:rounded-tl-xl last:rounded-tr-xl whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageLeads.map((lead, idx) => {
              const sc = scoreColor(lead.score);
              const isLast = idx === pageLeads.length - 1;
              return (
                <tr
                  key={lead.id}
                  onClick={() => onLeadClick(lead)}
                  className={[
                    "cursor-pointer transition-colors duration-100 hover:bg-[#1c2028]",
                    !isLast ? "border-b border-[#252a35]" : "",
                  ].join(" ")}
                >
                  {/* Score */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center justify-center w-10 h-7 rounded-md text-xs font-mono font-semibold border ${sc.bg} ${sc.text} ${sc.border}`}
                    >
                      {lead.score}
                    </span>
                  </td>
                  {/* Tier */}
                  <td className="px-4 py-3">
                    <TierBadge tier={lead.tier} />
                  </td>
                  {/* Brand */}
                  <td className="px-4 py-3 font-medium text-[#e2e8f0] whitespace-nowrap max-w-[140px] truncate">
                    {lead.brand_name}
                  </td>
                  {/* Email preview */}
                  <td className="px-4 py-3 text-[#94a3b8] max-w-[200px]">
                    <span className="block truncate">
                      {lead.email_content.replace(/\n/g, " ").slice(0, 60)}
                    </span>
                  </td>
                  {/* Intent */}
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium" style={{ color: signalColor(lead.intent) }}>
                      {lead.intent}
                    </span>
                  </td>
                  {/* Budget */}
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium" style={{ color: signalColor(lead.budget_signal) }}>
                      {lead.budget_signal}
                    </span>
                  </td>
                  {/* Date */}
                  <td className="px-4 py-3">
                    <span
                      className="text-xs text-[#475569] whitespace-nowrap"
                      title={fullDate(lead.created_at)}
                    >
                      {relativeTime(lead.created_at)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-[#475569]">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, leads.length)} of {leads.length} leads
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#252a35] bg-[#1c2028] text-[#94a3b8] hover:text-[#e2e8f0] hover:border-[#363d4d] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              ← Previous
            </button>
            <span className="text-xs text-[#475569] font-mono">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#252a35] bg-[#1c2028] text-[#94a3b8] hover:text-[#e2e8f0] hover:border-[#363d4d] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
