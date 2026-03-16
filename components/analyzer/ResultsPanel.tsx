"use client";

import { useEffect, useRef } from "react";
import { ScoreRing } from "./ScoreRing";
import { TierBadge } from "./TierBadge";
import { SignalChips } from "./SignalChips";
import { ReplyBox } from "./ReplyBox";
import { NextSteps } from "./NextSteps";
import { Card, CardHeader } from "@/components/ui/Card";

export interface AnalysisResult {
  id?: string;
  score: number;
  tier: "Hot" | "Warm" | "Cold";
  reason: string;
  intent: string;
  urgency: string;
  budget_signal: string;
  drafted_reply: string;
  next_steps: string[];
}

interface ResultsPanelProps {
  result: AnalysisResult | null;
}

export function ResultsPanel({ result }: ResultsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Scroll into view + animate on new result
  useEffect(() => {
    if (result && panelRef.current) {
      setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  }, [result]);

  if (!result) return null;

  return (
    <div
      ref={panelRef}
      className="animate-fade-in flex flex-col gap-4 scroll-mt-20"
    >
      {/* ── Row 1: Score + Tier + Reason ───────────────────────────── */}
      <Card padding="md">
        <div className="flex items-start gap-5">
          {/* Score ring */}
          <ScoreRing score={result.score} animated />

          {/* Tier + reason */}
          <div className="flex flex-col gap-2 min-w-0 pt-1">
            <TierBadge tier={result.tier} large />
            <p className="text-sm text-[#94a3b8] leading-relaxed">
              {result.reason}
            </p>
          </div>
        </div>
      </Card>

      {/* ── Row 2: Signal Chips ─────────────────────────────────────── */}
      <Card padding="md">
        <CardHeader title="Signals" />
        <SignalChips
          intent={result.intent}
          urgency={result.urgency}
          budgetSignal={result.budget_signal}
        />
      </Card>

      {/* ── Row 3: Drafted Reply ────────────────────────────────────── */}
      <Card padding="md">
        <ReplyBox reply={result.drafted_reply} />
      </Card>

      {/* ── Row 4: Next Steps ───────────────────────────────────────── */}
      <Card padding="none">
        <div className="px-5 pt-5">
          <CardHeader title="Next Steps" />
        </div>
        <div className="px-5 pb-2">
          <NextSteps steps={result.next_steps} />
        </div>
      </Card>
    </div>
  );
}
