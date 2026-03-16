import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "LeadLens — AI Sales Intelligence Dashboard",
  description:
    "Paste inbound lead emails and get instant AI-powered quality scores, intent signals, drafted replies, and next steps. Built for sales teams that move fast.",
  keywords: ["lead scoring", "AI sales", "inbound leads", "sales intelligence"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <Navbar />
          <main className="min-h-[calc(100dvh-56px)]">{children}</main>
          <footer className="border-t border-[#1c2028] py-5 text-center text-[13px] text-[#475569]">
            Built by <span className="text-[#94a3b8] font-medium">Abrar Tajwar Khan</span>
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
