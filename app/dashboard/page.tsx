import type { Metadata } from "next";
import DashboardPageClient from "./DashboardPageClient";

export const metadata: Metadata = {
  title: "Pipeline Dashboard — LeadLens",
  description:
    "View, filter, and export all analyzed inbound leads in your LeadLens pipeline.",
};

export default function DashboardPage() {
  return <DashboardPageClient />;
}
