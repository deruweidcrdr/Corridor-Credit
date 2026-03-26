import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ---------------------------------------------------------------------------
// POST /api/contract-analysis/validate
//
// Promotes a contract_for_validation and its confirmed terms into the
// canonical ontology tables (contract, term).
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contract_for_validation_id, counterparty_id } = body;

    if (!contract_for_validation_id) {
      return NextResponse.json(
        { error: "contract_for_validation_id is required" },
        { status: 400 }
      );
    }

    // 1. Fetch the contract_for_validation record
    const { data: cfv, error: cfvErr } = await supabase
      .from("contract_for_validation")
      .select("*")
      .eq("contract_for_validation_id", contract_for_validation_id)
      .single();

    if (cfvErr || !cfv) {
      return NextResponse.json(
        { error: `Contract not found: ${cfvErr?.message}` },
        { status: 404 }
      );
    }

    // 2. Fetch all terms for this contract
    const { data: terms } = await supabase
      .from("term_for_validation")
      .select("*")
      .eq("contract_for_validation_id", contract_for_validation_id);

    // 3. Generate canonical contract_id
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.random().toString(36).substring(2, 8);
    const contractId = `CNT_${dateStr}_${rand}`;

    // 4. Insert into ontology contract table
    const { error: contractErr } = await supabase.from("contract").insert({
      contract_id: contractId,
      contract_title: cfv.contract_title ?? cfv.document_name,
      contract_type: cfv.contract_type,
      contract_subtype: cfv.contract_subtype,
      contract_status: "ACTIVE",
      obligation_extraction_status: "PENDING",
      counterparty_id: counterparty_id ?? cfv.counterparty_id,
      currency: cfv.currency,
      effective_date: cfv.effective_date,
      maturity_date: cfv.maturity_date,
      origination_date: cfv.origination_date,
      source_contract_for_validation_id: contract_for_validation_id,
      source_document_id: cfv.document_id,
    });

    if (contractErr) {
      console.error("Failed to create contract:", contractErr);
      return NextResponse.json(
        { error: `Failed to create contract: ${contractErr.message}` },
        { status: 500 }
      );
    }

    // 5. Insert all non-flagged terms into ontology term table
    //    Omnibus validation: all extracted terms are promoted unless flagged.
    //    Terms individually edited by the user will already have CONFIRMED status.
    let termsPromoted = 0;
    for (const tfv of terms ?? []) {
      if (tfv.validation_status === "FLAGGED") continue;

      const termRand = Math.random().toString(36).substring(2, 8);
      const termId = `TRM_${dateStr}_${termRand}`;

      const { error: termErr } = await supabase.from("term").insert({
        term_id: termId,
        contract_id: contractId,
        term_name: tfv.term_name,
        term_value: tfv.term_value,
        term_unit: tfv.term_unit,
        term_description: tfv.term_description,
        term_identity_id: tfv.term_identity_id,
        extraction_confidence: tfv.extraction_confidence,
        is_key_term: tfv.is_key_term,
        validation_status: "CONFIRMED",
        source_term_for_validation_id: tfv.term_for_validation_id,
        source_document_id: tfv.document_id,
      });

      if (termErr) {
        console.error(`Failed to promote term ${tfv.term_for_validation_id}:`, termErr);
      } else {
        termsPromoted++;
      }
    }

    // 6. Update contract_for_validation status
    await supabase
      .from("contract_for_validation")
      .update({ contract_status: "VALIDATED" })
      .eq("contract_for_validation_id", contract_for_validation_id);

    // 6b. Update term_for_validation.validation_status so the pipeline can find them
    await supabase
      .from("term_for_validation")
      .update({ validation_status: "VALIDATED" })
      .eq("contract_for_validation_id", contract_for_validation_id)
      .neq("validation_status", "FLAGGED");

    // 7. Wake Railway (fire-and-forget latency optimization)
    // Railway discovers PENDING work by polling — this just nudges it.
    const pipelineUrl = process.env.PIPELINE_SERVICE_URL;
    if (pipelineUrl) {
      fetch(`${pipelineUrl}/api/wake`, { method: "POST" }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      contract_id: contractId,
      termsPromoted,
      pipelineWaked: !!pipelineUrl,
    });
  } catch (err) {
    console.error("Contract validate error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
