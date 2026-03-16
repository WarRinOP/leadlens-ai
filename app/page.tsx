export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/25 text-[#3b82f6] text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
          Phase 1 Complete — Analyzer UI Coming in Phase 3
        </span>
        <h1 className="text-4xl font-bold text-[#e2e8f0] tracking-tight">
          LeadLens
        </h1>
        <p className="text-[#94a3b8] max-w-md">
          AI-powered inbound lead intelligence. Paste a lead email and get an
          instant quality score, intent signals, a drafted reply, and next
          steps.
        </p>
      </div>
    </div>
  );
}
