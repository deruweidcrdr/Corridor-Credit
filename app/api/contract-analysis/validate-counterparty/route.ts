import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ---------------------------------------------------------------------------
// POST /api/contract-analysis/validate-counterparty
//
// Validates a prospective counterparty, updating its status and creating
// downstream KYC Due Diligence, WorkflowEvent, and Alert records.
//
// Adapted from the legacy Foundry validateProspectiveCounterparty function.
//
// Flow:
//   Counterparty (PROSPECT status, shown in Workbench Step 2)
//       ↓
//   validateCounterparty() [triggered by "Validate Counterparty" button]
//       ↓
//   Updates: Counterparty (status → ACTIVE, kyc_status → PENDING_REVIEW)
//   Creates: KycDueDiligence + WorkflowEvent + Alert
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

    // 1. Fetch the counterparty record
    const { data: cpty, error: cptyErr } = await supabase
      .from("counterparties")
      .select("*")
      .eq("counterparty_id", counterparty_id)
      .single();

    if (cptyErr || !cpty) {
      return NextResponse.json(
        { error: `Counterparty not found: ${cptyErr?.message}` },
        { status: 404 }
      );
    }

    // Generate IDs
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const rand = () => Math.random().toString(36).substring(2, 8);
    const kycId = `KYC_${dateStr}_${rand()}`;
    const eventId = `EVT_${dateStr}_${rand()}`;
    const alertId = `AL_${dateStr}_${rand()}`;
    const todayStr = now.toISOString().split("T")[0];

    // 2. Update counterparty status: PROSPECT → ACTIVE
    const { error: updateErr } = await supabase
      .from("counterparties")
      .update({
        status: "ACTIVE",
        relationship_status: "ACTIVE",
        kyc_status: "PENDING_REVIEW",
        last_review_date: todayStr,
      })
      .eq("counterparty_id", counterparty_id);

    if (updateErr) {
      console.error("Failed to update counterparty:", updateErr);
      return NextResponse.json(
        { error: `Failed to update counterparty: ${updateErr.message}` },
        { status: 500 }
      );
    }

    // 3. Create KYC Due Diligence record
    const { error: kycErr } = await supabase
      .from("kyc_due_diligence")
      .insert({
        kyc_due_diligence_id: kycId,
        kyc_due_diligence_name: `KYC Review: ${cpty.counterparty_name}`,
        counterparty_id: counterparty_id,
        kyc_status: "PENDING_REVIEW",
        kyc_approval_status: "PENDING",
        initiated_date: todayStr,
        watchlist_screening_status: cpty.watchlist_status ? "FLAGGED" : "PENDING",
        sanctions_screening_status: "PENDING",
        pep_screening_status: "PENDING",
        adverse_media_screening_status: "PENDING",
        overall_risk_rating: cpty.risk_rating ?? null,
        requires_enhanced_due_diligence: cpty.watchlist_status ?? false,
        requires_ongoing_monitoring: true,
        has_open_alerts: true,
        source_workflow_id: cpty.source_workflow_id ?? null,
      });

    if (kycErr) {
      console.error("Failed to create KYC record:", kycErr);
      // Non-fatal — continue with event and alert
    }

    // 4. Create WorkflowEvent (audit trail)
    const { error: eventErr } = await supabase
      .from("workflow_event")
      .insert({
        workflow_event_id: eventId,
        workflow_event_name: `Counterparty Validated: ${cpty.counterparty_name}`,
        workflow_id: cpty.source_workflow_id ?? null,
        kyc_due_diligence_id: kycId,
        event_type: "COUNTERPARTY_VALIDATED",
        event_timestamp: now.toISOString(),
        old_value: "PROSPECT",
        new_value: "ACTIVE",
        event_notes: [
          `Counterparty validated: ${cpty.counterparty_name}`,
          `Action: Promoted from PROSPECT to ACTIVE`,
          `KYC Status: PENDING_REVIEW`,
          `KYC Record: ${kycId}`,
        ].join(" | "),
      });

    if (eventErr) {
      console.error("Failed to create workflow event:", eventErr);
    }

    // 5. Create Alert for KYC review
    const alertSeverity = cpty.watchlist_status ? "HIGH" : "MEDIUM";

    const { error: alertErr } = await supabase.from("alert").insert({
      alert_id: alertId,
      alert_title: `New Counterparty Requires KYC Review: ${cpty.counterparty_name}`,
      alert_subject: `KYC Due Diligence needed for ${counterparty_id}`,
      alert_body: [
        `Counterparty: ${cpty.counterparty_name}`,
        `Type: ${cpty.counterparty_type ?? "Unknown"}`,
        `Country: ${cpty.country_of_domicile ?? "Unknown"}`,
        cpty.watchlist_status ? "WATCHLIST FLAGGED" : null,
      ]
        .filter(Boolean)
        .join("\n"),
      alert_type: "KYC_REVIEW_REQUIRED",
      alert_status: "ACTIVE",
      severity: alertSeverity,
      alert_priority_score: alertSeverity === "HIGH" ? 3 : 2,
      generated_timestamp: now.toISOString(),
      generated_by: "SYSTEM_COUNTERPARTY_VALIDATION",
      requires_action: true,
      auto_dismiss_on_action: false,
      source_counterparty_id: counterparty_id,
      source_workflow_id: cpty.source_workflow_id ?? null,
      source_kyc_due_diligence_id: kycId,
      action_label: "Review KYC",
      action_url: `/kyc/${kycId}`,
    });

    if (alertErr) {
      console.error("Failed to create alert:", alertErr);
    }

    // 6. Update source workflow with counterparty link (if exists)
    if (cpty.source_workflow_id) {
      await supabase
        .from("workflow")
        .update({ counterparty_id: counterparty_id })
        .eq("workflow_id", cpty.source_workflow_id);
    }

    return NextResponse.json({
      success: true,
      counterparty_id,
      kyc_due_diligence_id: kycId,
      workflow_event_id: eventId,
      alert_id: alertId,
    });
  } catch (err) {
    console.error("Counterparty validate error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
