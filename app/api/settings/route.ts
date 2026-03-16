import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

const SETTINGS_ID = "00000000-0000-0000-0000-000000000001";

// ── GET /api/settings ─────────────────────────────────────────────────────────

export async function GET() {
  const supabase = createServerSupabaseClient();

  const { data: settings, error } = await supabase
    .from("ll_settings")
    .select("*")
    .eq("id", SETTINGS_ID)
    .single();

  if (error) {
    console.error("[settings GET] Supabase error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ settings }, { status: 200 });
}

// ── PUT /api/settings ─────────────────────────────────────────────────────────
// Body: { defaultBusinessType?: string; defaultBrandName?: string }

export async function PUT(req: NextRequest) {
  let body: {
    defaultBusinessType?: string;
    defaultBrandName?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const updates: Record<string, string> = {
    updated_at: new Date().toISOString(),
  };

  if (body.defaultBusinessType !== undefined) {
    updates.default_business_type = body.defaultBusinessType;
  }
  if (body.defaultBrandName !== undefined) {
    updates.default_brand_name = body.defaultBrandName;
  }

  if (Object.keys(updates).length === 1) {
    // only updated_at — nothing to actually update
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  const supabase = createServerSupabaseClient();

  const { data: settings, error } = await supabase
    .from("ll_settings")
    .update(updates)
    .eq("id", SETTINGS_ID)
    .select()
    .single();

  if (error) {
    console.error("[settings PUT] Supabase error:", error);
    return NextResponse.json(
      { error: "Failed to update settings", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ settings }, { status: 200 });
}
