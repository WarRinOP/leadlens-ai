"use client";

import { useEffect, useState } from "react";

interface Stats {
  total: number;
  avgScore: number;
  hotLeads: number;
  thisWeek: number;
}

function SkeletonCard() {
  return (
    <div className="bg-[#13161c] border border-[#252a35] rounded-xl p-4 flex flex-col gap-2">
      <div className="h-8 w-16 rounded-md bg-[#1c2028] animate-pulse" />
      <div className="h-3 w-24 rounded bg-[#1c2028] animate-pulse" />
    </div>
  );
}

function avgColor(score: number): string {
  if (score >= 70) return "#22c55e";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}

interface StatCardProps {
  value: number | string;
  label: string;
  color: string;
  suffix?: string;
}

function StatCard({ value, label, color, suffix }: StatCardProps) {
  return (
    <div className="bg-[#13161c] border border-[#252a35] rounded-xl p-4 flex flex-col gap-1 hover:border-[#363d4d] transition-colors duration-150">
      <div className="flex items-end gap-1">
        <span
          className="font-mono font-medium leading-none"
          style={{ fontSize: "28px", color }}
        >
          {value}
        </span>
        {suffix && (
          <span className="text-xs text-[#475569] mb-1 font-mono">{suffix}</span>
        )}
      </div>
      <span className="text-[11px] font-semibold uppercase tracking-widest text-[#475569]">
        {label}
      </span>
    </div>
  );
}

interface PipelineStatsProps {
  /** Pass an external leads array to avoid a duplicate fetch */
  leads?: { score: number; tier: string; created_at: string }[];
}

function computeStats(leads: { score: number; tier: string; created_at: string }[]): Stats {
  const total = leads.length;
  const avgScore =
    total > 0 ? Math.round(leads.reduce((s, l) => s + l.score, 0) / total) : 0;
  const hotLeads = leads.filter((l) => l.tier === "Hot").length;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const thisWeek = leads.filter(
    (l) => new Date(l.created_at).getTime() >= weekAgo
  ).length;
  return { total, avgScore, hotLeads, thisWeek };
}

export function PipelineStats({ leads: externalLeads }: PipelineStatsProps) {
  const [fetchedStats, setFetchedStats] = useState<Stats | null>(null);

  // When external leads provided, derive directly (no setState in effect)
  const derivedStats = externalLeads ? computeStats(externalLeads) : null;

  // Fetch only when no external leads are provided
  useEffect(() => {
    if (externalLeads) return;
    fetch("/api/leads")
      .then((r) => r.json())
      .then(({ leads }) => setFetchedStats(computeStats(leads ?? [])))
      .catch(() => setFetchedStats({ total: 0, avgScore: 0, hotLeads: 0, thisWeek: 0 }));
  }, [externalLeads]);

  const stats = derivedStats ?? fetchedStats;

  if (!stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard value={stats.total} label="Total Leads" color="#3b82f6" />
      <StatCard
        value={stats.avgScore}
        label="Avg Score"
        color={avgColor(stats.avgScore)}
        suffix="/100"
      />
      <StatCard value={stats.hotLeads} label="Hot Leads" color="#22c55e" />
      <StatCard value={stats.thisWeek} label="This Week" color="#3b82f6" />
    </div>
  );
}
