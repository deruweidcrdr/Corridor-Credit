import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ---------------------------------------------------------------------------
// POST /api/projections/validate
//
// 1. Marks obligation_for_validation rows as VALIDATED
// 2. Promotes the parent contract_for_validation → canonical `contract`
// 3. Promotes each obligation_for_validation → canonical `obligation`
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

    // ── Fetch the staging obligation records ────────────────────────────
    const { data: stagingRows, error: fetchErr } = await supabase
      .from("obligation_for_validation")
      .select("*")
      .in("obligation_for_validation_id", obligation_for_validation_ids);

    if (fetchErr || !stagingRows || stagingRows.length === 0) {
      console.error("Failed to fetch obligation_for_validation rows:", fetchErr);
      return NextResponse.json(
        { error: `Failed to fetch staging rows: ${fetchErr?.message ?? "no rows found"}` },
        { status: 500 }
      );
    }

    // ── Mark staging rows as VALIDATED ─────────────────────────────────
    const { error: updateErr } = await supabase
      .from("obligation_for_validation")
      .update({ validation_status: "VALIDATED" })
      .in("obligation_for_validation_id", obligation_for_validation_ids);

    if (updateErr) {
      console.error("Failed to validate obligations:", updateErr);
      return NextResponse.json(
        { error: `Failed to validate obligations: ${updateErr.message}` },
        { status: 500 }
      );
    }

    // ── Resolve staging contract IDs → canonical contract IDs ──────────
    // The canonical `contract` table already exists with proper CNT_ IDs.
    // Look up via source_contract_for_validation_id to get the real FK.
    const contractForValidationIds = [
      ...new Set(stagingRows.map((s: any) => s.contract_for_validation_id).filter(Boolean)),
    ];

    const cfvToCanonicalContract: Record<string, string> = {};
    if (contractForValidationIds.length > 0) {
      const { data: contracts, error: contractLookupErr } = await supabase
        .from("contract")
        .select("contract_id, source_contract_for_validation_id")
        .in("source_contract_for_validation_id", contractForValidationIds);

      if (contractLookupErr) {
        console.error("Failed to look up canonical contracts:", contractLookupErr);
      }
      for (const c of contracts ?? []) {
        if (c.source_contract_for_validation_id) {
          cfvToCanonicalContract[c.source_contract_for_validation_id] = c.contract_id;
        }
      }
    }

    // Check that all staging contracts resolved to a canonical contract
    const unmapped = contractForValidationIds.filter((id) => !cfvToCanonicalContract[id]);
    if (unmapped.length > 0) {
      console.error("No canonical contract found for staging IDs:", unmapped);
      return NextResponse.json(
        { error: `No canonical contract found for: ${unmapped.join(", ")}. Promote contracts first.` },
        { status: 422 }
      );
    }

    // ── Promote to canonical obligation table ──────────────────────────
    const now = new Date().toISOString();
    const canonicalRows = stagingRows.map((s: any) => ({
      obligation_id: s.obligation_for_validation_id,
      contract_id: cfvToCanonicalContract[s.contract_for_validation_id] ?? null,
      counterparty_id: s.counterparty_id ?? null,
      obligation_type: s.obligation_type ?? null,
      obligation_subtype: s.obligation_subtype ?? null,
      obligation_name: s.obligation_name ?? null,
      obligation_description: s.obligation_description ?? null,
      status: "ACTIVE",
      frequency: s.payment_frequency_value ?? s.measurement_frequency ?? null,
      threshold_value: s.threshold_value ?? null,
      threshold_operator: s.threshold_operator ?? null,
      threshold_unit: s.threshold_unit ?? null,
      measurement_metric: s.measurement_metric ?? null,
      is_key_obligation: s.is_key_obligation ?? null,
      next_due_date: s.next_due_date ?? null,
      source_term_id: s.term_identity ?? null,
      creation_date: now,
    }));

    const { error: insertErr } = await supabase
      .from("obligation")
      .upsert(canonicalRows, { onConflict: "obligation_id" });

    if (insertErr) {
      console.error("Failed to promote obligations to canonical table:", insertErr);
      return NextResponse.json(
        { error: `Staging marked VALIDATED but canonical insert failed: ${insertErr.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      validated: obligation_for_validation_ids.length,
      promoted: canonicalRows.length,
    });
  } catch (err) {
    console.error("Obligation validate error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
