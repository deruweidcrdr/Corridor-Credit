import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { METRIC_COLUMN_NAMES } from "@/app/statement-analysis/metric-columns";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ---------------------------------------------------------------------------
// POST /api/statement-analysis/validate
//
// Promotes a financial_statement_for_validation record to the canonical
// financial_statement table.
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, counterparty_id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    // 1. Fetch the for_validation record
    const { data: fsv, error: fsvErr } = await supabase
      .from("financial_statement_for_validation")
      .select("*")
      .eq("id", id)
      .single();

    if (fsvErr || !fsv) {
      return NextResponse.json(
        { error: `Statement not found: ${fsvErr?.message}` },
        { status: 404 }
      );
    }

    // 2. Generate canonical statement_id
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.random().toString(36).substring(2, 8);
    const statementId = `FIN_${dateStr}_${rand}`;

    // 3. Build canonical record — copy all metric and reference columns
    const canonicalRecord: Record<string, any> = {
      statement_id: statementId,
      source_id: id,
      counterparty_id: counterparty_id ?? fsv.counterparty_id,
      counterparty_name: fsv.counterparty_name,
      contract_id: fsv.contract_id,
      deal_id: fsv.deal_id,
      document_id: fsv.document_id,
      obligation_id: fsv.obligation_id,
      workflow_id: fsv.workflow_id,
      statement_type: fsv.statement_type,
      statement_title: fsv.statement_title,
      period_end_date: fsv.period_end_date,
      period_end_month: fsv.period_end_month,
      period_end_year: fsv.period_end_year,
      reporting_currency: fsv.reporting_currency,
      industry_code: fsv.industry_code,
      confidence: fsv.confidence,
      is_user_override: fsv.is_user_override,
      override_justification: fsv.override_justification,
      projection_method: fsv.projection_method,
      projection_profile: fsv.projection_profile,
      projection_profile_id: fsv.projection_profile_id,
      audit_id: fsv.audit_id,
    };

    // Copy all metric columns
    for (const col of METRIC_COLUMN_NAMES) {
      canonicalRecord[col] = fsv[col] ?? null;
    }

    // 4. Insert into canonical financial_statement
    const { error: insertErr } = await supabase
      .from("financial_statement")
      .insert(canonicalRecord);

    if (insertErr) {
      console.error("Failed to create financial statement:", insertErr);
      return NextResponse.json(
        { error: `Failed to create financial statement: ${insertErr.message}` },
        { status: 500 }
      );
    }

    // 5. Update pipeline record status
    await supabase
      .from("financial_statement_for_validation")
      .update({ validation_status: "VALIDATED" })
      .eq("id", id);

    return NextResponse.json({
      success: true,
      statement_id: statementId,
    });
  } catch (err) {
    console.error("Statement validate error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
