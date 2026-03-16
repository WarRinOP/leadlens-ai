import { NextRequest, NextResponse } from "next/server";
import { analyzeLeadEmail } from "@/lib/claude";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  // ── 1. Parse + Validate ───────────────────────────────────────────────────
  let body: { businessType?: string; brandName?: string; emailContent?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { businessType, brandName, emailContent } = body;

  if (!businessType?.trim()) {
    return NextResponse.json(
      { error: "businessType is required" },
      { status: 400 }
    );
  }
  if (!brandName?.trim()) {
    return NextResponse.json(
      { error: "brandName is required" },
      { status: 400 }
    );
  }
  if (!emailContent?.trim()) {
    return NextResponse.json(
      { error: "emailContent is required" },
      { status: 400 }
    );
  }

  // ── 2. Call Claude ────────────────────────────────────────────────────────
  let analysis;
  try {
    analysis = await analyzeLeadEmail(
      businessType.trim(),
      brandName.trim(),
      emailContent.trim()
    );
  } catch (err) {
    console.error("[analyze] Claude error:", err);
    return NextResponse.json(
      {
        error: "Failed to analyze lead with Claude",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }

  // ── 3. Validate Claude response shape ────────────────────────────────────
  const requiredFields = [
    "score",
    "tier",
    "reason",
    "intent",
    "urgency",
    "budget_signal",
    "reply",
    "next_steps",
  ];
  const missing = requiredFields.filter(
    (f) => analysis[f as keyof typeof analysis] === undefined
  );
  if (missing.length > 0) {
    console.error("[analyze] Claude returned incomplete JSON:", analysis);
    return NextResponse.json(
      { error: `Claude response missing fields: ${missing.join(", ")}` },
      { status: 500 }
    );
  }

  // ── 4. Save to Supabase ───────────────────────────────────────────────────
  const supabase = createServerSupabaseClient();

  const { data: lead, error: dbError } = await supabase
    .from("ll_leads")
    .insert({
      business_type: businessType.trim(),
      brand_name: brandName.trim(),
      email_content: emailContent.trim(),
      score: analysis.score,
      tier: analysis.tier,
      reason: analysis.reason,
      intent: analysis.intent,
      urgency: analysis.urgency,
      budget_signal: analysis.budget_signal,
      drafted_reply: analysis.reply,
      next_steps: analysis.next_steps,
    })
    .select()
    .single();

  if (dbError) {
    console.error("[analyze] Supabase insert error:", dbError);
    return NextResponse.json(
      { error: "Failed to save lead to database", details: dbError.message },
      { status: 500 }
    );
  }

  // ── 5. Return full record ─────────────────────────────────────────────────
  return NextResponse.json({ lead, analysis }, { status: 200 });
}
