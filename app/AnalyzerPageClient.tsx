"use client";

import { useState } from "react";
import { AnalyzerForm } from "@/components/analyzer/AnalyzerForm";
import { ResultsPanel, type AnalysisResult } from "@/components/analyzer/ResultsPanel";
import { Card } from "@/components/ui/Card";

export default function AnalyzerPageClient() {
  const [result, setResult] = useState<AnalysisResult | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* ── Page header ────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-[#3b82f6] text-[11px] font-semibold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
            AI-Powered
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#e2e8f0] tracking-tight">
          Lead Analyzer
        </h1>
        <p className="text-[#94a3b8] mt-1.5 max-w-xl">
          Paste an inbound lead email. Get a score, a reply, and next
          steps — powered by Claude.
        </p>
      </div>

      {/* ── Two-column layout (lg) / stacked (mobile) ───────────────── */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Left col — Form (40% on desktop) */}
        <div className="w-full lg:w-[40%] lg:sticky lg:top-20">
          <Card padding="lg">
            <h2 className="text-[13px] font-semibold uppercase tracking-widest text-[#475569] mb-5">
              Paste Lead Email
            </h2>
            <AnalyzerForm onResult={(r) => setResult(r)} />
          </Card>

          {/* Tips card below the form on desktop */}
          {!result && (
            <div className="mt-4 rounded-xl border border-[#252a35] bg-[#13161c]/50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#475569] mb-3">
                What Claude analyzes
              </p>
              <ul className="space-y-1.5">
                {[
                  { icon: "🎯", text: "Lead quality score out of 100" },
                  { icon: "⚡", text: "Intent, urgency & budget signals" },
                  { icon: "✉️", text: "Personalized draft reply" },
                  { icon: "📋", text: "4 specific next steps to close" },
                ].map(({ icon, text }) => (
                  <li key={text} className="flex items-center gap-2 text-sm text-[#94a3b8]">
                    <span className="text-base leading-none">{icon}</span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right col — Results (60% on desktop) */}
        <div className="w-full lg:w-[60%]">
          {result ? (
            <ResultsPanel result={result} />
          ) : (
            /* Empty state — visible only on desktop */
            <div className="hidden lg:flex flex-col items-center justify-center min-h-[420px] rounded-xl border border-dashed border-[#252a35] gap-4 text-center px-8">
              <div className="w-14 h-14 rounded-full bg-[#1c2028] border border-[#252a35] flex items-center justify-center text-2xl">
                📊
              </div>
              <div>
                <p className="text-[#e2e8f0] font-medium mb-1">
                  Results appear here
                </p>
                <p className="text-sm text-[#475569]">
                  Paste a lead email and click Analyze Lead to get started.
                  <br />
                  Try the sample lead to see a demo.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
