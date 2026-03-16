"use client";

import { useState } from "react";

interface ReplyBoxProps {
  reply: string;
}

export function ReplyBox({ reply }: ReplyBoxProps) {
  const [copied, setCopied] = useState(false);

  const wordCount = reply
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(reply);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = reply;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#475569]">
          Drafted Reply
        </span>
        <span className="text-[11px] text-[#475569]">~{wordCount} words</span>
      </div>

      {/* Scrollable reply text */}
      <div
        className="rounded-lg border border-[#252a35] bg-[#0a0c10] p-4 overflow-y-auto"
        style={{
          maxHeight: "260px",
          scrollbarWidth: "thin",
          scrollbarColor: "#252a35 #13161c",
        }}
      >
        <pre
          className="text-sm text-[#94a3b8] whitespace-pre-wrap font-sans leading-relaxed"
          style={{ fontFamily: "inherit" }}
        >
          {reply}
        </pre>
      </div>

      {/* Copy button */}
      <div className="flex justify-end">
        <button
          onClick={handleCopy}
          className={[
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium",
            "border transition-all duration-150",
            copied
              ? "bg-[#22c55e]/10 border-[#22c55e]/30 text-[#22c55e]"
              : "bg-[#1c2028] border-[#252a35] text-[#94a3b8] hover:text-[#e2e8f0] hover:border-[#363d4d]",
          ].join(" ")}
        >
          {copied ? (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              Copy reply
            </>
          )}
        </button>
      </div>
    </div>
  );
}
