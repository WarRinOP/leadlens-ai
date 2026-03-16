import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { generateCSV, LeadRow } from "@/lib/export";

function getPeriodStart(period: string | null): string | null {
  if (!period || period === "all") return null;
  const now = new Date();
  if (period === "today") {
    now.setHours(0, 0, 0, 0);
    return now.toISOString();
  }
  if (period === "week") {
    now.setDate(now.getDate() - 7);
    return now.toISOString();
  }
  if (period === "month") {
    now.setDate(now.getDate() - 30);
    return now.toISOString();
  }
  return null;
}

// ── GET /api/export ───────────────────────────────────────────────────────────
// Same query params as /api/leads: ?tier=, ?search=, ?period=
// Returns a CSV file download

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tier = searchParams.get("tier");
  const search = searchParams.get("search");
  const period = searchParams.get("period");
  const sessionId = searchParams.get("sessionId");

  const supabase = createServerSupabaseClient();

  let query = supabase
    .from("ll_leads")
    .select("*")
    .order("created_at", { ascending: false });

  // Session filter
  if (sessionId?.trim()) {
    query = query.eq("session_id", sessionId.trim());
  }

  if (tier && ["Hot", "Warm", "Cold"].includes(tier)) {
    query = query.eq("tier", tier);
  }

  const periodStart = getPeriodStart(period);
  if (periodStart) {
    query = query.gte("created_at", periodStart);
  }

  if (search?.trim()) {
    const term = search.trim();
    query = query.or(
      `brand_name.ilike.%${term}%,email_content.ilike.%${term}%`
    );
  }

  const { data: leads, error } = await query;

  if (error) {
    console.error("[export GET] Supabase error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads for export", details: error.message },
      { status: 500 }
    );
  }

  if (!leads || leads.length === 0) {
    return NextResponse.json(
      { error: "No leads found matching the filters" },
      { status: 404 }
    );
  }

  const csv = generateCSV(leads as LeadRow[]);

  // Format date as YYYY-MM-DD for filename
  const dateStr = new Date().toISOString().split("T")[0];
  const filename = `leadlens-export-${dateStr}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
