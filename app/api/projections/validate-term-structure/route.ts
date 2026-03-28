import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ---------------------------------------------------------------------------
// POST /api/projections/validate-term-structure
//
// 1. Marks obligation_term_structure_for_validation rows as VALIDATED
// 2. Promotes each into the canonical `obligation_term_structure` table
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

    // ── Fetch the staging records ──────────────────────────────────────
    const { data: stagingRows, error: fetchErr } = await supabase
      .from("obligation_term_structure_for_validation")
      .select("*")
      .eq("contract_for_validation_id", contract_for_validation_id)
      .order("payment_number", { ascending: true });

    if (fetchErr || !stagingRows || stagingRows.length === 0) {
      console.error("Failed to fetch term structure staging rows:", fetchErr);
      return NextResponse.json(
        { error: `Failed to fetch staging rows: ${fetchErr?.message ?? "no rows found"}` },
        { status: 500 }
      );
    }

    // ── Mark staging rows as VALIDATED ─────────────────────────────────
    const { error: updateErr } = await supabase
      .from("obligation_term_structure_for_validation")
      .update({ validation_status: "VALIDATED" })
      .eq("contract_for_validation_id", contract_for_validation_id);

    if (updateErr) {
      console.error("Failed to validate term structure:", updateErr);
      return NextResponse.json(
        { error: `Failed to validate term structure: ${updateErr.message}` },
        { status: 500 }
      );
    }

    // ── Resolve staging contract ID → canonical contract ID ────────────
    const { data: contractMatch } = await supabase
      .from("contract")
      .select("contract_id")
      .eq("source_contract_for_validation_id", contract_for_validation_id)
      .maybeSingle();

    if (!contractMatch) {
      console.error("No canonical contract found for:", contract_for_validation_id);
      return NextResponse.json(
        { error: `No canonical contract found for staging ID ${contract_for_validation_id}. Validate obligations first to promote the contract.` },
        { status: 422 }
      );
    }

    const canonicalContractId = contractMatch.contract_id;

    // ── Promote to canonical obligation_term_structure table ───────────
    const canonicalRows = stagingRows.map((s: any) => ({
      obligation_event_id: s.obligation_event_id,
      contract_id: canonicalContractId,
      counterparty_id: s.counterparty_id ?? null,
      payment_number: s.payment_number ?? null,
      payment_due_date: s.payment_due_date ?? null,
      scheduled_principal: s.scheduled_principal ?? null,
      scheduled_interest: s.scheduled_interest ?? null,
      scheduled_total_payment: s.scheduled_total_payment ?? null,
      outstanding_principal_beginning: s.outstanding_principal_beginning ?? null,
      outstanding_principal_ending: s.outstanding_principal_ending ?? null,
      days_until_payment: s.days_until_payment ?? null,
      is_final_payment: s.is_final_payment ?? null,
      payment_status: s.payment_status ?? "SCHEDULED",
      payment_frequency: s.payment_frequency ?? null,
      amortization_type: s.amortization_type ?? null,
      base_rate_index: s.base_rate_index ?? null,
      applicable_margin_spread: s.applicable_margin_spread ?? null,
      facility_amount: s.facility_amount ?? null,
      origination_date: s.origination_date ?? null,
      maturity_date: s.maturity_date ?? null,
      data_quality_score: s.data_quality_score ?? null,
      generated_timestamp: s.generated_timestamp ?? new Date().toISOString(),
      source_obligation_term_structure_for_validation_id: s.obligation_event_id,
    }));

    const { error: insertErr } = await supabase
      .from("obligation_term_structure")
      .upsert(canonicalRows, { onConflict: "obligation_event_id" });

    if (insertErr) {
      console.error("Failed to promote term structure to canonical table:", insertErr);
      return NextResponse.json(
        { error: `Staging marked VALIDATED but canonical insert failed: ${insertErr.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      validated: stagingRows.length,
      promoted: canonicalRows.length,
    });
  } catch (err) {
    console.error("Term structure validate error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
