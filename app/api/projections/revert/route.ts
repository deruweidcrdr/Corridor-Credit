import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ---------------------------------------------------------------------------
// POST /api/projections/revert
//
// Reverts obligation_for_validation.validation_status back to 'PENDING'
// for the specified obligation IDs.
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { obligation_for_validation_ids } = body;

    if (!obligation_for_validation_ids || !Array.isArray(obligation_for_validation_ids) || obligation_for_validation_ids.length === 0) {
      return NextResponse.json(
        { error: "obligation_for_validation_ids (array) is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("obligation_for_validation")
      .update({ validation_status: "PENDING" })
      .in("obligation_for_validation_id", obligation_for_validation_ids);

    if (error) {
      console.error("Failed to revert obligations:", error);
      return NextResponse.json(
        { error: `Failed to revert obligations: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reverted: obligation_for_validation_ids.length,
    });
  } catch (err) {
    console.error("Obligation revert error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
