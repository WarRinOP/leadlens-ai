"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { getSessionId } from "@/lib/session";
import type { AnalysisResult } from "./ResultsPanel";

const BUSINESS_TYPES = [
  "Marketing Agency",
  "Real Estate",
  "SaaS/Software",
  "Consulting",
  "E-commerce",
  "Recruitment",
  "Legal Services",
  "Other",
];

const SAMPLE_LEAD = `Subject: Interested in your services

Hi,
My name is James Okafor, Head of Growth at NovaBridge — a Series A startup (~60 people). We've been evaluating vendors for a 6-month engagement starting next month. Budget is pre-approved at $15k-$20k. We saw your work via a mutual contact's recommendation.
Can we get on a 30-min call this week? We're comparing 2-3 providers and want to move fast.
James`;

interface AnalyzerFormProps {
  onResult: (result: AnalysisResult) => void;
  onError?: (message: string) => void;
  onLoading?: () => void;
  onRemaining?: (count: number) => void;
}

export function AnalyzerForm({ onResult, onError, onLoading, onRemaining }: AnalyzerFormProps) {
  const { toast } = useToast();

  const [businessType, setBusinessType] = useState("Marketing Agency");
  const [brandName, setBrandName] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Load saved settings from API on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const { settings } = await res.json();
          if (settings.default_business_type) setBusinessType(settings.default_business_type);
          if (settings.default_brand_name) setBrandName(settings.default_brand_name);
        }
      } catch {
        // Non-blocking — just use defaults
      }
    }
    loadSettings();
  }, []);

  async function saveSettings() {
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defaultBusinessType: businessType,
          defaultBrandName: brandName,
        }),
      });
    } catch {
      // Non-blocking
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    if (!emailContent.trim()) {
      setValidationError("Please paste a lead email before analyzing.");
      return;
    }
    if (!brandName.trim()) {
      setValidationError("Please enter your brand name.");
      return;
    }

    setLoading(true);
    onLoading?.();

    // Save settings in background
    saveSettings();

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessType, brandName, emailContent, sessionId: getSessionId() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Analysis failed. Please try again.");
      }

      // The API returns { lead, analysis } — we want the saved lead record
      const result: AnalysisResult = {
        id: data.lead.id,
        score: data.lead.score,
        tier: data.lead.tier,
        reason: data.lead.reason,
        intent: data.lead.intent,
        urgency: data.lead.urgency,
        budget_signal: data.lead.budget_signal,
        drafted_reply: data.lead.drafted_reply,
        next_steps: data.lead.next_steps,
      };

      onResult(result);

      // Propagate remaining count to parent for live badge update
      const remaining = data.remaining as number;
      onRemaining?.(remaining);

      // Show remaining count toast
      if (remaining === 0) {
        toast("Analysis complete — that was your last free analysis", "info");
      } else if (remaining === 1) {
        toast(`Analysis saved! 1 free analysis remaining`, "success");
      } else {
        toast(`Analysis saved! ${remaining} free analyses remaining`, "success");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      // Surface to parent for full error card display
      onError?.(msg);
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  function loadSample() {
    setEmailContent(SAMPLE_LEAD);
    setValidationError(null);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Business type */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="businessType"
          className="text-[11px] font-semibold uppercase tracking-widest text-[#475569]"
        >
          Business Type
        </label>
        <select
          id="businessType"
          value={businessType}
          onChange={(e) => setBusinessType(e.target.value)}
          disabled={loading}
          className="w-full h-10 px-3 rounded-lg bg-[#13161c] border border-[#252a35] text-sm text-[#e2e8f0] appearance-none cursor-pointer transition-colors hover:border-[#363d4d] focus:outline-none focus:border-[#3b82f6] disabled:opacity-50"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
            backgroundSize: "16px",
          }}
        >
          {BUSINESS_TYPES.map((t) => (
            <option key={t} value={t} className="bg-[#13161c]">
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Brand name */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="brandName"
          className="text-[11px] font-semibold uppercase tracking-widest text-[#475569]"
        >
          Brand / Company Name
        </label>
        <input
          id="brandName"
          type="text"
          placeholder="e.g. Apex Creative"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          disabled={loading}
          className="w-full h-10 px-3 rounded-lg bg-[#13161c] border border-[#252a35] text-sm text-[#e2e8f0] placeholder:text-[#475569] transition-colors hover:border-[#363d4d] focus:outline-none focus:border-[#3b82f6] disabled:opacity-50"
        />
      </div>

      {/* Lead email textarea */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="emailContent"
            className="text-[11px] font-semibold uppercase tracking-widest text-[#475569]"
          >
            Lead Email
          </label>
          <button
            type="button"
            onClick={loadSample}
            disabled={loading}
            className="text-[11px] text-[#3b82f6] hover:text-[#2563eb] transition-colors disabled:opacity-50 underline-offset-2 hover:underline"
          >
            Load sample lead
          </button>
        </div>
        <textarea
          id="emailContent"
          placeholder="Paste the inbound lead email here..."
          value={emailContent}
          onChange={(e) => setEmailContent(e.target.value)}
          disabled={loading}
          rows={8}
          className="w-full px-3 py-3 rounded-lg bg-[#13161c] border border-[#252a35] text-sm text-[#e2e8f0] placeholder:text-[#475569] resize-y transition-colors hover:border-[#363d4d] focus:outline-none focus:border-[#3b82f6] disabled:opacity-50 leading-relaxed"
          style={{ minHeight: "140px" }}
        />
      </div>

      {/* Error message — validation only (API errors go to parent error card) */}
      {validationError && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/30 text-sm text-[#ef4444]">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{validationError}</span>
        </div>
      )}

      {/* Submit button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        className="w-full"
      >
        {loading ? "Analyzing with Claude…" : "Analyze Lead →"}
      </Button>
    </form>
  );
}
