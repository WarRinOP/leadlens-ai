import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

// ── Helpers ──────────────────────────────────────────────────────────────────

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

// ── GET /api/leads ────────────────────────────────────────────────────────────
// Query params:
//   ?tier=Hot|Warm|Cold   — filter by tier
//   ?search=text          — search email_content + brand_name
//   ?period=today|week|month|all — date range filter

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

  // Session filter — only show this session's leads
  if (sessionId?.trim()) {
    query = query.eq("session_id", sessionId.trim());
  }

  // Tier filter
  if (tier && ["Hot", "Warm", "Cold"].includes(tier)) {
    query = query.eq("tier", tier);
  }

  // Date range filter
  const periodStart = getPeriodStart(period);
  if (periodStart) {
    query = query.gte("created_at", periodStart);
  }

  // Text search (case-insensitive across brand_name and email_content)
  if (search?.trim()) {
    const term = search.trim();
    query = query.or(
      `brand_name.ilike.%${term}%,email_content.ilike.%${term}%`
    );
  }

  const { data: leads, error } = await query;

  if (error) {
    console.error("[leads GET] Supabase error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ leads }, { status: 200 });
}

// ── DELETE /api/leads ─────────────────────────────────────────────────────────
// Body: { id: string }

export async function DELETE(req: NextRequest) {
  let body: { id?: string; sessionId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { id } = body;
  if (!id?.trim()) {
    return NextResponse.json(
      { error: "id is required in request body" },
      { status: 400 }
    );
  }

  const supabase = createServerSupabaseClient();

  const { error } = await supabase
    .from("ll_leads")
    .delete()
    .eq("id", id.trim())
    .eq("session_id", body.sessionId?.trim() ?? "");

  if (error) {
    console.error("[leads DELETE] Supabase error:", error);
    return NextResponse.json(
      { error: "Failed to delete lead", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
