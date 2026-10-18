import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Total leads for the navbar badge. Counted on the server so the table
// can stay locked against the public browser key.
export async function GET() {
  const supabase = createServerSupabaseClient();
  const { count, error } = await supabase
    .from("ll_leads")
    .select("*", { count: "exact", head: true });
  if (error) return NextResponse.json({ count: 0 });
  return NextResponse.json({ count: count ?? 0 });
}
