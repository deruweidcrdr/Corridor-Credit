import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/inbox/unread-count
// Lightweight endpoint for the global header unread badge.
export async function GET() {
  try {
    const { count, error } = await supabase
      .from("emails")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Unread count error:", error);
      return NextResponse.json({ count: 0 });
    }

    // All emails are currently treated as unread (is_read is hardcoded false)
    return NextResponse.json({ count: count ?? 0 });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
