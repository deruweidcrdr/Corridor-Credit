import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ---------------------------------------------------------------------------
// POST /api/projections/validate-term-structure
//
// Updates obligation_term_structure_for_validation.validation_status
// to 'VALIDATED' for all rows matching the given contract_for_validation_id.
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contract_for_validation_id } = body;

    if (!contract_for_validation_id) {
      return NextResponse.json(
        { error: "contract_for_validation_id is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("obligation_term_structure_for_validation")
      .update({ validation_status: "VALIDATED" })
      .eq("contract_for_validation_id", contract_for_validation_id)
      .select("obligation_event_id");

    if (error) {
      console.error("Failed to validate term structure:", error);
      return NextResponse.json(
        { error: `Failed to validate term structure: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      validated: data?.length ?? 0,
    });
  } catch (err) {
    console.error("Term structure validate error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
