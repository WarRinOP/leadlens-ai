import { NextRequest, NextResponse } from "next/server";
import { analyzeLeadEmail } from "@/lib/claude";
import { createServerSupabaseClient } from "@/lib/supabase";

const MAX_ANALYSES = 5;

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

  // ── 2. Rate limiting — check session + IP ─────────────────────────────────
  const supabase = createServerSupabaseClient();
  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  // Admin bypass
  const adminKey = req.headers.get("x-admin-key") || "";
  const isAdmin = adminKey && adminKey === process.env.ADMIN_SECRET;

  // Simulate block mode — must check BEFORE admin bypass
  if (req.headers.get("x-simulate-block") === "true" && adminKey === process.env.ADMIN_SECRET) {
    return NextResponse.json(
      {
        error: `You've used all ${MAX_ANALYSES} free analyses. This is a portfolio demo — reach out on Fiverr for unlimited access!`,
        code: "RATE_LIMIT",
      },
      { status: 429 }
    );
  }

  // Upsert session row
  const { data: session } = await supabase
    .from("ll_sessions")
    .upsert(
      { session_id: sessionId.trim(), ip_address: clientIp },
      { onConflict: "session_id" }
    )
    .select()
    .single();

  const currentCount = session?.usage_count ?? 0;

  if (!isAdmin && currentCount >= MAX_ANALYSES) {
    return NextResponse.json(
      {
        error: `You've used all ${MAX_ANALYSES} free analyses. This is a portfolio demo — reach out on Fiverr for unlimited access!`,
        code: "RATE_LIMIT",
      },
      { status: 429 }
    );
  }

  // Also check IP across all sessions (secondary limit)
  const { count: ipCount } = await supabase
    .from("ll_sessions")
    .select("usage_count", { count: "exact", head: false })
    .eq("ip_address", clientIp);

  // Sum all usage for this IP
  if (!isAdmin && ipCount !== null) {
    const { data: ipSessions } = await supabase
      .from("ll_sessions")
      .select("usage_count")
      .eq("ip_address", clientIp);

    const totalIpUsage =
      ipSessions?.reduce((sum, s) => sum + (s.usage_count ?? 0), 0) ?? 0;

    if (totalIpUsage >= MAX_ANALYSES) {
      return NextResponse.json(
        {
          error: `You've used all ${MAX_ANALYSES} free analyses. This is a portfolio demo — reach out on Fiverr for unlimited access!`,
          code: "RATE_LIMIT",
        },
        { status: 429 }
      );
    }
  }

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
    return NextResponse.json(
      {
        error: "Failed to analyze lead with Claude",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
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

  // ── 6. Increment usage count ──────────────────────────────────────────────
  await supabase
    .from("ll_sessions")
    .update({ usage_count: currentCount + 1 })
    .eq("session_id", sessionId.trim());

  // ── 7. Return full record ─────────────────────────────────────────────────
  return NextResponse.json(
    { lead, analysis, remaining: isAdmin ? 999 : MAX_ANALYSES - currentCount - 1 },
    { status: 200 }
  );
}
