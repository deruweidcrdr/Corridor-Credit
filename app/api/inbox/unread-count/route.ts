import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/inbox/unread-count
// Unread = workflow_for_validation records that are NOT archived AND NOT reviewed.
// Gracefully degrades if is_archived/reviewed_at columns don't exist yet.
export async function GET() {
  try {
    // Try to select triage columns
    const { data, error } = await supabase
      .from("workflow_for_validation")
      .select("workflow_for_validation_id, is_archived, reviewed_at");

    if (error) {
      // Columns likely don't exist yet — fall back to counting all WFV rows
      const { count, error: fallbackErr } = await supabase
        .from("workflow_for_validation")
        .select("*", { count: "exact", head: true });
      if (fallbackErr) return NextResponse.json({ count: 0 });
      return NextResponse.json({ count: count ?? 0 });
    }

    const unread = (data ?? []).filter(
      (row: Record<string, unknown>) => !row.is_archived && !row.reviewed_at
    );

    return NextResponse.json({ count: unread.length });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
