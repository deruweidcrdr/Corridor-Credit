import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ---------------------------------------------------------------------------
// POST /api/contract-analysis/revert-contract
//
// Reverts a validated contract: deletes the promoted canonical contract and
// term records, resets contract_for_validation status back to EXTRACTED.
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

    // 1. Find the canonical contract that was promoted from this cfv
    const { data: contracts } = await supabase
      .from("contract")
      .select("contract_id")
      .eq("source_contract_for_validation_id", contract_for_validation_id);

    let contractsDeleted = 0;
    let termsDeleted = 0;

    for (const c of contracts ?? []) {
      // 2. Delete promoted terms for this contract
      const { count } = await supabase
        .from("term")
        .delete({ count: "exact" })
        .eq("contract_id", c.contract_id);

      termsDeleted += count ?? 0;

      // 3. Delete the canonical contract
      const { error: delErr } = await supabase
        .from("contract")
        .delete()
        .eq("contract_id", c.contract_id);

      if (!delErr) contractsDeleted++;
    }

    // 4. Reset contract_for_validation status back to pre-validated state
    await supabase
      .from("contract_for_validation")
      .update({ contract_status: "EXTRACTED" })
      .eq("contract_for_validation_id", contract_for_validation_id);

    // 5. Reset all term validation_status back to PENDING
    await supabase
      .from("term_for_validation")
      .update({ validation_status: "PENDING" })
      .eq("contract_for_validation_id", contract_for_validation_id);

    return NextResponse.json({
      success: true,
      contract_for_validation_id,
      contractsDeleted,
      termsDeleted,
    });
  } catch (err) {
    console.error("Contract revert error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
