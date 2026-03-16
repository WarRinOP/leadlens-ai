import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lead Analyzer — LeadLens",
  description:
    "Paste an inbound lead email. Get an AI-powered quality score, intent signals, a drafted reply, and next steps in seconds.",
};

export default function AnalyzerPageShell() {
  return <AnalyzerPageClient />;
}

// Mark the interactive part as a client component
import AnalyzerPageClient from "./AnalyzerPageClient";
