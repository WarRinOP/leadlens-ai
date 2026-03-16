"use client";

import { useState } from "react";
import { AnalyzerForm } from "@/components/analyzer/AnalyzerForm";
import { ResultsPanel, type AnalysisResult } from "@/components/analyzer/ResultsPanel";
import { Card } from "@/components/ui/Card";

// ── Results area skeleton ─────────────────────────────────────────────────────
function ResultsSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* Row 1: Score + reason skeleton */}
      <div className="bg-[#13161c] border border-[#252a35] rounded-xl p-4">
        <div className="flex items-start gap-5">
          {/* ScoreRing skeleton */}
          <div className="w-24 h-24 rounded-full border-4 border-[#252a35] bg-[#1c2028] animate-pulse flex-shrink-0" />
          <div className="flex-1 flex flex-col gap-2 pt-2">
            <div className="h-5 w-24 rounded-full bg-[#1c2028] animate-pulse" />
            <div className="h-3 w-full rounded bg-[#1c2028] animate-pulse" />
            <div className="h-3 w-4/5 rounded bg-[#1c2028] animate-pulse" />
            <div className="h-3 w-3/5 rounded bg-[#1c2028] animate-pulse" />
          </div>
        </div>
      </div>
      {/* Row 2: Signal chips skeleton */}
      <div className="bg-[#13161c] border border-[#252a35] rounded-xl p-4">
        <div className="flex gap-4 justify-around">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1">
              <div className="h-2.5 w-10 rounded bg-[#1c2028] animate-pulse" />
              <div className="h-6 w-16 rounded-full bg-[#1c2028] animate-pulse" />
            </div>
          ))}
        </div>
      </div>
      {/* Row 3: Reply skeleton */}
      <div className="bg-[#13161c] border border-[#252a35] rounded-xl p-4 flex flex-col gap-3">
        <div className="h-2.5 w-20 rounded bg-[#1c2028] animate-pulse" />
        <div className="flex flex-col gap-2">
          {[100, 95, 87, 70, 95, 60].map((w, i) => (
            <div key={i} className={`h-3 rounded bg-[#1c2028] animate-pulse`} style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
      {/* Row 4: Next steps skeleton */}
      <div className="bg-[#13161c] border border-[#252a35] rounded-xl p-4 flex flex-col gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 py-2 border-b border-[#252a35] last:border-0">
            <div className="w-8 h-5 rounded-full bg-[#1c2028] animate-pulse flex-shrink-0" />
            <div className="h-3 rounded bg-[#1c2028] animate-pulse flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Error card ────────────────────────────────────────────────────────────────
interface ErrorCardProps {
  message: string;
  onReset: () => void;
}

function ErrorCard({ message, onReset }: ErrorCardProps) {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center min-h-[320px] rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/5 gap-5 text-center px-8 py-10">
      <div className="w-14 h-14 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center">
        <svg className="w-6 h-6 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div>
        <p className="text-[#e2e8f0] font-semibold mb-2">Analysis failed</p>
        <p className="text-sm text-[#94a3b8] max-w-xs">
          {message}
        </p>
      </div>
      <button
        onClick={onReset}
        className="px-4 py-2 rounded-lg text-sm font-medium border border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
type PageState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: AnalysisResult }
  | { status: "error"; message: string };

export default function AnalyzerPageClient() {
  const [pageState, setPageState] = useState<PageState>({ status: "idle" });

  function handleResult(result: AnalysisResult) {
    setPageState({ status: "success", result });
  }

  function handleError(message: string) {
    setPageState({ status: "error", message });
  }

  function handleLoading() {
    setPageState({ status: "loading" });
  }

  function reset() {
    setPageState({ status: "idle" });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-[#3b82f6] text-[11px] font-semibold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
            AI-Powered
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e] text-[11px] font-semibold uppercase tracking-wider">
            5 Free Analyses
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#e2e8f0] tracking-tight">
          Lead Analyzer
        </h1>
        <p className="text-[#94a3b8] mt-1.5 max-w-xl">
          Paste an inbound lead email. Get a score, a reply, and next
          steps — powered by Claude. Each session includes 5 complimentary analyses.
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
            <AnalyzerForm
              onResult={handleResult}
              onError={handleError}
              onLoading={handleLoading}
            />
          </Card>

          {/* Tips card — only when idle */}
          {pageState.status === "idle" && (
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

        {/* Right col — Results / Skeleton / Error / Empty (60% on desktop) */}
        <div className="w-full lg:w-[60%]">
          {pageState.status === "loading" && <ResultsSkeleton />}

          {pageState.status === "success" && (
            <ResultsPanel result={pageState.result} />
          )}

          {pageState.status === "error" && (
            <ErrorCard message={pageState.message} onReset={reset} />
          )}

          {pageState.status === "idle" && (
            /* Empty state — desktop only */
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
