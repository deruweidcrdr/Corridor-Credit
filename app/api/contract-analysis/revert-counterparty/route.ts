import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ---------------------------------------------------------------------------
// POST /api/contract-analysis/revert-counterparty
//
// Reverts a validated counterparty: deletes KYC, WorkflowEvent, and Alert
// records created during validation, resets counterparty to PROSPECT status.
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { counterparty_id } = body;

    if (!counterparty_id) {
      return NextResponse.json(
        { error: "counterparty_id is required" },
        { status: 400 }
      );
    }

    // 1. Find and delete KYC records for this counterparty
    const { data: kycRecords } = await supabase
      .from("kyc_due_diligence")
      .select("kyc_due_diligence_id")
      .eq("counterparty_id", counterparty_id);

    const kycIds = (kycRecords ?? []).map((k: any) => k.kyc_due_diligence_id);
    let kycDeleted = 0;
    let eventsDeleted = 0;
    let alertsDeleted = 0;

    // 2. Delete workflow events referencing these KYC records
    if (kycIds.length > 0) {
      const { count: evtCount } = await supabase
        .from("workflow_event")
        .delete({ count: "exact" })
        .in("kyc_due_diligence_id", kycIds);
      eventsDeleted = evtCount ?? 0;
    }

    // 3. Delete alerts sourced from this counterparty validation
    const { count: alertCount } = await supabase
      .from("alert")
      .delete({ count: "exact" })
      .eq("source_counterparty_id", counterparty_id)
      .eq("alert_type", "KYC_REVIEW_REQUIRED");
    alertsDeleted = alertCount ?? 0;

    // 4. Delete KYC records
    if (kycIds.length > 0) {
      const { count: kycCount } = await supabase
        .from("kyc_due_diligence")
        .delete({ count: "exact" })
        .eq("counterparty_id", counterparty_id);
      kycDeleted = kycCount ?? 0;
    }

    // 5. Revert counterparty status back to PROSPECT
    await supabase
      .from("counterparty")
      .update({
        status: "PROSPECT",
        relationship_status: "PROSPECT",
        kyc_status: null,
      })
      .eq("counterparty_id", counterparty_id);

    return NextResponse.json({
      success: true,
      counterparty_id,
      kycDeleted,
      eventsDeleted,
      alertsDeleted,
    });
  } catch (err) {
    console.error("Counterparty revert error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
