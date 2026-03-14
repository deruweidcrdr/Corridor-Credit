import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ---------------------------------------------------------------------------
// POST /api/workflows/reset
//
// Rolls back a validated WorkflowForValidation to its pre-validation state.
// Development/testing tool for rerunning the validation & extraction pipeline.
//
//   1. Look up the WFV record and its linked workflow_id
//   2. Delete workflow_event rows for that workflow_id
//   3. Delete alert rows sourced from that workflow_id
//   4. Unlink documents (clear workflow_id FK)
//   5. Delete the workflow record itself
//   6. Reset the WFV back to CLASSIFIED / PENDING_VALIDATION
// ---------------------------------------------------------------------------

interface ResetRequest {
  workflowForValidationId: string;
}

export async function POST(req: NextRequest) {
  let body: ResetRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { workflowForValidationId } = body;
  if (!workflowForValidationId) {
    return NextResponse.json(
      { error: "workflowForValidationId is required" },
      { status: 400 }
    );
  }

  // ── Fetch the WFV record ─────────────────────────────────────────────
  const { data: wfv, error: wfvErr } = await supabase
    .from("workflow_for_validation")
    .select("*")
    .eq("workflow_for_validation_id", workflowForValidationId)
    .single();

  if (wfvErr || !wfv) {
    return NextResponse.json(
      { error: `WorkflowForValidation not found: ${wfvErr?.message}` },
      { status: 404 }
    );
  }

  const workflowId: string | null = wfv.workflow_id;

  const deleted = { events: 0, alerts: 0, workflow: false, docsUnlinked: 0 };

  // If there's a linked workflow, clean up the associated records.
  // If workflow_id is null (e.g. data inconsistency where stage is VALIDATED
  // but no workflow was created), skip straight to resetting the WFV record.
  if (workflowId) {
    // ── STEP 1: Delete workflow_event rows ─────────────────────────────
    const { data: deletedEvents, error: evtErr } = await supabase
      .from("workflow_event")
      .delete()
      .eq("workflow_id", workflowId)
      .select("workflow_event_id");

    if (evtErr) {
      console.error("Reset: workflow_event delete error:", evtErr);
    } else {
      deleted.events = deletedEvents?.length ?? 0;
    }

    // ── STEP 2: Delete alert rows ──────────────────────────────────────
    const { data: deletedAlerts, error: alertErr } = await supabase
      .from("alert")
      .delete()
      .eq("source_workflow_id", workflowId)
      .select("alert_id");

    if (alertErr) {
      console.error("Reset: alert delete error:", alertErr);
    } else {
      deleted.alerts = deletedAlerts?.length ?? 0;
    }

    // ── STEP 3: Unlink documents ───────────────────────────────────────
    // Clear workflow_id on any documents that were linked during validation
    for (const table of ["document", "documents"] as const) {
      const { data: unlinked, error: unlinkErr } = await supabase
        .from(table)
        .update({ workflow_id: null })
        .eq("workflow_id", workflowId)
        .select("document_id");

      if (!unlinkErr && unlinked) {
        deleted.docsUnlinked += unlinked.length;
      }
    }

    // ── STEP 4: Delete the workflow record ─────────────────────────────
    const { error: wfDelErr } = await supabase
      .from("workflow")
      .delete()
      .eq("workflow_id", workflowId);

    if (wfDelErr) {
      console.error("Reset: workflow delete error:", wfDelErr);
      return NextResponse.json(
        { error: `Failed to delete workflow: ${wfDelErr.message}` },
        { status: 500 }
      );
    }
    deleted.workflow = true;
  }

  // ── STEP 5: Reset WFV to pre-validation state ───────────────────────
  const { error: wfvUpdateErr } = await supabase
    .from("workflow_for_validation")
    .update({
      workflow_id: null,
      workflow_stage: "CLASSIFIED",
      workflow_status: "PENDING_VALIDATION",
    })
    .eq("workflow_for_validation_id", workflowForValidationId);

  if (wfvUpdateErr) {
    console.error("Reset: WFV update error:", wfvUpdateErr);
    return NextResponse.json(
      { error: `Failed to reset WFV: ${wfvUpdateErr.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    workflowForValidationId,
    workflowIdDeleted: workflowId ?? null,
    hadWorkflow: !!workflowId,
    ...deleted,
  });
}
