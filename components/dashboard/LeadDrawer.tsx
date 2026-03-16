"use client";

import { useEffect, useRef, useState } from "react";
import { ScoreRing } from "@/components/analyzer/ScoreRing";
import { TierBadge } from "@/components/analyzer/TierBadge";
import { SignalChips } from "@/components/analyzer/SignalChips";
import { ReplyBox } from "@/components/analyzer/ReplyBox";
import { NextSteps } from "@/components/analyzer/NextSteps";
import { useToast } from "@/components/ui/Toast";

export interface Lead {
  id: string;
  business_type: string;
  brand_name: string;
  email_content: string;
  score: number;
  tier: "Hot" | "Warm" | "Cold";
  reason: string;
  intent: string;
  urgency: string;
  budget_signal: string;
  drafted_reply: string;
  next_steps: string[];
  created_at: string;
}

interface LeadDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function LeadDrawer({ lead, onClose, onDelete }: LeadDrawerProps) {
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (lead) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [lead, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (lead) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [lead]);

  if (!lead) return null;

  async function handleDelete() {
    if (!lead) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lead.id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      onDelete(lead.id);
      onClose();
      toast("Lead deleted", "info");
    } catch {
      toast("Failed to delete lead", "error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className="animate-slide-in-right fixed right-0 top-0 z-50 h-full w-full sm:w-[480px] bg-[#13161c] border-l border-[#252a35] flex flex-col shadow-2xl"
      >
        {/* Sticky header inside drawer */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#252a35] flex-shrink-0">
          <span className="text-sm font-semibold text-[#e2e8f0]">Lead Details</span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#475569] hover:text-[#e2e8f0] hover:bg-[#1c2028] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
          {/* Header: score + tier + brand + date */}
          <div className="flex items-start gap-4">
            <ScoreRing score={lead.score} animated size={64} />
            <div className="flex flex-col gap-1.5 min-w-0 pt-1">
              <TierBadge tier={lead.tier} />
              <p className="text-base font-semibold text-[#e2e8f0] leading-tight truncate">
                {lead.brand_name}
              </p>
              <p className="text-xs text-[#475569]">
                {lead.business_type} · {formatDate(lead.created_at)}
              </p>
            </div>
          </div>

          {/* Signal chips */}
          <div className="rounded-xl border border-[#252a35] bg-[#1c2028] px-4 py-3">
            <SignalChips
              intent={lead.intent}
              urgency={lead.urgency}
              budgetSignal={lead.budget_signal}
            />
          </div>

          {/* Original email */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#475569]">
              Original Email
            </span>
            <div
              className="rounded-lg border border-[#252a35] bg-[#0a0c10] p-3 overflow-y-auto text-sm text-[#94a3b8] whitespace-pre-wrap leading-relaxed"
              style={{ maxHeight: "200px" }}
            >
              {lead.email_content}
            </div>
          </div>

          {/* Drafted reply */}
          <div className="flex flex-col gap-2">
            <ReplyBox reply={lead.drafted_reply} />
          </div>

          {/* Next steps */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#475569]">
              Next Steps
            </span>
            <div className="rounded-xl border border-[#252a35] bg-[#1c2028] px-4">
              <NextSteps steps={lead.next_steps} />
            </div>
          </div>

          {/* Reasoning */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#475569]">
              Reasoning
            </span>
            <p className="text-sm text-[#475569] italic leading-relaxed">
              &ldquo;{lead.reason}&rdquo;
            </p>
          </div>
        </div>

        {/* Footer — delete button */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-[#252a35]">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full h-10 flex items-center justify-center gap-2 rounded-lg text-sm font-medium border border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20 hover:border-[#ef4444]/50 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
            {deleting ? "Deleting…" : "Delete Lead"}
          </button>
        </div>
      </div>
    </>
  );
}
