import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ---------------------------------------------------------------------------
// PATCH /api/contract-analysis/terms
//
// Updates a term_for_validation record's validation_status and optionally
// its term_value (if the user edited it during review).
// ---------------------------------------------------------------------------

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { term_for_validation_id, validation_status, term_value } = body;

    if (!term_for_validation_id || !validation_status) {
      return NextResponse.json(
        { error: "term_for_validation_id and validation_status are required" },
        { status: 400 }
      );
    }

    if (!["CONFIRMED", "FLAGGED"].includes(validation_status)) {
      return NextResponse.json(
        { error: "validation_status must be CONFIRMED or FLAGGED" },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = { validation_status };
    if (term_value !== undefined) {
      updates.term_value = term_value;
    }

    const { error } = await supabase
      .from("term_for_validation")
      .update(updates)
      .eq("term_for_validation_id", term_for_validation_id);

    if (error) {
      console.error("Failed to update term:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Term PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
