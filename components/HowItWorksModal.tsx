"use client";

import { useEffect } from "react";

export function HowItWorksModal({ onClose }: { onClose: () => void }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: "#0f1117", border: "1px solid #252a35" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-[#252a35]" style={{ background: "#0f1117" }}>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#3b82f6] flex items-center justify-center text-white text-xs font-bold">LL</span>
            <span className="text-sm font-semibold text-[#e2e8f0]">What is LeadLens?</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#1c2028] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6 text-sm text-[#94a3b8] leading-relaxed">

          {/* Hero line */}
          <div className="p-4 rounded-xl" style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
            <p className="text-[#e2e8f0] font-medium text-base">
              LeadLens tells you, in seconds, whether a sales prospect is worth your time — before you send a single email.
            </p>
          </div>

          {/* The problem */}
          <div>
            <h3 className="text-[#e2e8f0] font-semibold mb-2 flex items-center gap-2">
              <span className="text-lg">😩</span> The Problem
            </h3>
            <p>
              Sales teams waste hours chasing people who were never going to buy. By the time you figure out a lead isn&apos;t a good fit, you&apos;ve already spent too much time on emails, calls, and follow-ups.
            </p>
          </div>

          {/* The fix */}
          <div>
            <h3 className="text-[#e2e8f0] font-semibold mb-2 flex items-center gap-2">
              <span className="text-lg">✅</span> What LeadLens Does
            </h3>
            <p>
              You paste in someone&apos;s LinkedIn bio, email, or any public information about them. LeadLens&apos;s AI reads it, understands it, and gives you:
            </p>
            <ul className="mt-3 space-y-2 pl-1">
              {[
                ["🎯", "A match score (0–100)", "How likely this person is a good fit"],
                ["🏷️", "A tier label", "Hot Lead, Warm Lead, Cold, or Not a Fit"],
                ["💡", "Key signals", "What stood out — good and bad"],
                ["✉️", "A ready-to-send email", "Personalized outreach written for you"],
              ].map(([icon, title, desc]) => (
                <li key={title as string} className="flex gap-3">
                  <span className="text-base flex-shrink-0">{icon}</span>
                  <span><span className="text-[#e2e8f0] font-medium">{title}</span> — {desc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* How to test */}
          <div>
            <h3 className="text-[#e2e8f0] font-semibold mb-3 flex items-center gap-2">
              <span className="text-lg">🚀</span> How to Try It Right Now
            </h3>
            <div className="space-y-3">
              {[
                ["1", "Go to the Analyzer tab (you&apos;re already here)"],
                ["2", "Paste any text about a person — their LinkedIn summary, a short bio, or just copy what you know about them"],
                ["3", "Hit Analyze Lead and wait about 5 seconds"],
                ["4", "See the score, read the signals, copy the outreach email"],
                ["5", "Check the Dashboard to see all your analyzed leads in one place"],
              ].map(([num, step]) => (
                <div key={num as string} className="flex gap-3 items-start">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1c2028] border border-[#252a35] flex items-center justify-center text-xs font-bold text-[#3b82f6]">{num}</span>
                  <span dangerouslySetInnerHTML={{ __html: step as string }} />
                </div>
              ))}
            </div>
          </div>

          {/* Who it's for */}
          <div>
            <h3 className="text-[#e2e8f0] font-semibold mb-2 flex items-center gap-2">
              <span className="text-lg">👥</span> Who Is This For?
            </h3>
            <p>
              Anyone who sells — freelancers, agencies, B2B startups, or in-house sales teams. If you spend time deciding whether someone is worth reaching out to, LeadLens cuts that decision down from 20 minutes to 5 seconds.
            </p>
          </div>

          {/* Demo note */}
          <div className="p-3 rounded-lg text-xs" style={{ background: "#13161c", border: "1px solid #252a35" }}>
            <span className="text-[#3b82f6] font-medium">Demo limit:</span> You can analyze up to 5 leads in this demo. Want unlimited access for your team?{" "}
            <span className="text-[#e2e8f0] font-medium">Reach out to Abrar Tajwar Khan</span> to get a custom build.
          </div>
        </div>
      </div>
    </div>
  );
}
