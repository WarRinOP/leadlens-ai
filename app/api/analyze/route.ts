import { NextRequest, NextResponse } from "next/server";
import { analyzeLeadEmail } from "@/lib/claude";
import { createServerSupabaseClient } from "@/lib/supabase";
import { reserveQuota, GuardConfig } from "@/lib/usage-guard";

const MAX_ANALYSES = 5;
const MAX_EMAIL_CHARS = 5000;
const GUARD: GuardConfig = { prefix: "ll", limit: MAX_ANALYSES, noun: "analyses" };

export async function POST(req: NextRequest) {
  // ── 1. Parse + Validate ───────────────────────────────────────────────────
  let body: {
    businessType?: string;
    brandName?: string;
    emailContent?: string;
    sessionId?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { businessType, brandName, emailContent, sessionId } = body;

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
  if (!sessionId?.trim()) {
    return NextResponse.json(
      { error: "sessionId is required" },
      { status: 400 }
    );
  }

  if (
    businessType.length > 100 ||
    brandName.length > 100 ||
    emailContent.length > MAX_EMAIL_CHARS
  ) {
    return NextResponse.json({ error: "Input is too long" }, { status: 400 });
  }

  // ── 2. Usage limit: atomic, per device and per network address ───────────
  const supabase = createServerSupabaseClient();
  const reservation = await reserveQuota(req, supabase, GUARD);
  if (!reservation.ok) return reservation.response;

  // ── 3. Call Claude ────────────────────────────────────────────────────────
  let analysis;
  try {
    analysis = await analyzeLeadEmail(
      businessType.trim(),
      brandName.trim(),
      emailContent.trim()
    );
  } catch (err) {
    console.error("[analyze] Claude error:", err);
    await reservation.refund();
    return reservation.respond(NextResponse.json(
      {
        error: "Failed to analyze lead with Claude",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    ));
  }

  // ── 4. Validate Claude response shape ────────────────────────────────────
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

  // ── 5. Save to Supabase ───────────────────────────────────────────────────
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
      session_id: sessionId.trim(),
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

  // ── 7. Return full record ─────────────────────────────────────────────────
  return reservation.respond(NextResponse.json(
    { lead, analysis, remaining: reservation.remaining },
    { status: 200 }
  ));
}
