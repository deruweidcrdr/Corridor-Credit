import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ---------------------------------------------------------------------------
// POST /api/statement-analysis/revert
//
// Reverts a validated financial statement: deletes the promoted canonical
// record and resets the pipeline record back to PENDING.
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    // 1. Find and delete the canonical financial_statement
    const { data: canonicalRecords } = await supabase
      .from("financial_statement")
      .select("statement_id")
      .eq("source_id", id);

    let statementsDeleted = 0;
    for (const rec of canonicalRecords ?? []) {
      const { error } = await supabase
        .from("financial_statement")
        .delete()
        .eq("statement_id", rec.statement_id);
      if (!error) statementsDeleted++;
    }

    // 2. Reset pipeline record status
    await supabase
      .from("financial_statement_for_validation")
      .update({ validation_status: "PENDING" })
      .eq("id", id);

    return NextResponse.json({
      success: true,
      id,
      statementsDeleted,
    });
  } catch (err) {
    console.error("Statement revert error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
