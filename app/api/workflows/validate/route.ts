import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use an untyped Supabase client so we can query both ontology tables
// (which have generated types) and pipeline tables (which don't).
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ---------------------------------------------------------------------------
// POST /api/workflows/validate
//
// Promotes a WorkflowForValidation record into the canonical object graph:
//   1. Counterparty reconciliation  (upsert into counterparties pipeline table)
//   2. Create Workflow              (ontology workflow table)
//   3. Create WorkflowEvent         (ontology workflow_event table)
//   4. Create Alert                 (ontology alert table)
//   5. Relink documents             (ontology document table → set workflow_id)
//   6. Update WorkflowForValidation (pipeline table → mark VALIDATED / SUCCESS)
//
// Mirrors the original Foundry Action: validateWorkflow.ts
// ---------------------------------------------------------------------------

interface ValidateRequest {
  workflowForValidationId: string;
  assignedToId: string;
}

export async function POST(req: NextRequest) {
  let body: ValidateRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { workflowForValidationId, assignedToId } = body;
  if (!workflowForValidationId) {
    return NextResponse.json(
      { error: "workflowForValidationId is required" },
      { status: 400 }
    );
  }
  if (!assignedToId) {
    return NextResponse.json(
      { error: "assignedToId (banker) is required" },
      { status: 400 }
    );
  }

  // ── Fetch the WorkflowForValidation record ──────────────────────────
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

  if (!wfv.counterparty_id) {
    return NextResponse.json(
      { error: "WorkflowForValidation must have a counterparty_id" },
      { status: 422 }
    );
  }

  // ── Generate IDs ────────────────────────────────────────────────────
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 11);
  const workflowId = `WF_${ts}_${rand}`;
  const alertId = `AL_${ts}_${rand}`;

  const events: Array<{
    workflow_event_id: string;
    workflow_id: string;
    event_timestamp: string;
    event_type: string;
    old_value: string | null;
    new_value: string | null;
    changed_by_banker_id: string;
    event_notes: string;
  }> = [];

  // =====================================================================
  // STEP 1: COUNTERPARTY RECONCILIATION
  // Check if counterparty exists; if not, create in counterparties table
  // =====================================================================

  let counterpartyCreated = false;
  const counterpartyName =
    wfv.apparent_counterparty || "Unknown Counterparty";
  const relationshipStatus = wfv.relationship_status || "PROSPECT";

  try {
    const { data: existing } = await supabase
      .from("counterparties")
      .select("counterparty_id")
      .eq("counterparty_id", wfv.counterparty_id)
      .maybeSingle();

    if (!existing) {
      const { error: cpInsertErr } = await supabase
        .from("counterparties")
        .insert({
          counterparty_id: wfv.counterparty_id,
          counterparty_name: counterpartyName,
          status: "PROSPECT",
          relationship_status: relationshipStatus,
          kyc_status: "PENDING_REVIEW",
          source_workflow_id: workflowId,
          counterparty_type: wfv.counterparty_type ?? null,
          primary_banker_id: assignedToId || null,
          onboarding_date: new Date().toISOString().slice(0, 10),
          watchlist_status: false,
          total_exposure: 0,
          is_parent_company: false,
          notes: `Auto-created during workflow validation. Source: ${workflowForValidationId}`,
        });

      if (cpInsertErr) throw cpInsertErr;

      counterpartyCreated = true;

      events.push({
        workflow_event_id: `EVT_${workflowId}_COUNTERPARTY_CREATED`,
        workflow_id: workflowId,
        event_timestamp: new Date().toISOString(),
        event_type: "COUNTERPARTY_CREATED",
        old_value: "NEW_COUNTERPARTY",
        new_value: wfv.counterparty_id,
        changed_by_banker_id: assignedToId,
        event_notes: `New counterparty created: ${counterpartyName} (${wfv.counterparty_id}). Status: PROSPECT. KYC Status: PENDING_REVIEW. Assigned to: ${assignedToId}`,
      });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Counterparty reconciliation error:", msg);

    events.push({
      workflow_event_id: `EVT_${workflowId}_COUNTERPARTY_ERROR`,
      workflow_id: workflowId,
      event_timestamp: new Date().toISOString(),
      event_type: "COUNTERPARTY_CHECK_ERROR",
      old_value: wfv.counterparty_id,
      new_value: "ERROR",
      changed_by_banker_id: assignedToId,
      event_notes: `Error checking/creating counterparty: ${msg}`,
    });
  }

  // =====================================================================
  // STEP 2: CREATE WORKFLOW
  // =====================================================================

  const { error: wfInsertErr } = await supabase.from("workflow").insert({
    workflow_id: workflowId,
    source_workflow_for_validation_id: workflowForValidationId,
    counterparty_id: wfv.counterparty_id,
    source_email_id: wfv.source_email_id ?? null,
    created_date: wfv.created_date ?? new Date().toISOString().slice(0, 10),
    assigned_to_id: assignedToId || null,
    workflow_stage: "VALIDATED",
    workflow_status: "SUCCESS",
    extraction_status: "PENDING",
    workflow_type: wfv.workflow_type ?? null,
    workflow_subtype: wfv.workflow_subtype ?? null,
    priority: wfv.priority ?? null,
    notes: wfv.notes ?? null,
    initiated_by_id: wfv.initiated_by_id ?? null,
    workflow_name: wfv.workflow_name ?? null,
    obligation_id: wfv.matched_obligation_id ?? null,
    successor_workflow_id: wfv.successor_workflow_id ?? null,
    deal_id: wfv.deal_id ?? null,
    requires_financial_extraction: wfv.requires_financial_extraction ?? null,
    document_content_flags: wfv.document_content_flags ?? null,
    document_type: wfv.document_type ?? null,
  });

  if (wfInsertErr) {
    console.error("Workflow insert error:", wfInsertErr);
    return NextResponse.json(
      { error: `Failed to create workflow: ${wfInsertErr.message}` },
      { status: 500 }
    );
  }

  // =====================================================================
  // STEP 3: CREATE WORKFLOW EVENT — workflow created
  // =====================================================================

  events.push({
    workflow_event_id: `EVT_${workflowId}_CREATED`,
    workflow_id: workflowId,
    event_timestamp: new Date().toISOString(),
    event_type: "WORKFLOW_CREATED_FROM_VALIDATION",
    old_value: "CLASSIFIED",
    new_value: "VALIDATED",
    changed_by_banker_id: assignedToId,
    event_notes: `Workflow created from WorkflowForValidation ${workflowForValidationId}. Counterparty: ${counterpartyName} (${counterpartyCreated ? "NEW" : "EXISTING"}). Assigned to: ${assignedToId}. Stage: VALIDATED / Status: SUCCESS`,
  });

  // =====================================================================
  // STEP 4: CREATE ALERT
  // =====================================================================

  const severity =
    wfv.priority === "High"
      ? "HIGH"
      : wfv.priority === "Medium"
        ? "MEDIUM"
        : "LOW";

  const { error: alertErr } = await supabase.from("alert").insert({
    alert_id: alertId,
    alert_title: `New Workflow Created: ${wfv.workflow_type || "Unknown Type"}${counterpartyCreated ? " (New Counterparty)" : ""}`,
    alert_subject: `Workflow ${workflowId} has been created from validation`,
    alert_body: `A new workflow has been created from WorkflowForValidation ${workflowForValidationId}. Counterparty: ${counterpartyName}${counterpartyCreated ? " (NEW - Requires KYC Review)" : ""}. Type: ${wfv.workflow_type || "Unknown Type"}. Priority: ${wfv.priority || "Unknown Priority"}. Assigned to: ${assignedToId}`,
    alert_type: "WORKFLOW_CREATED",
    alert_status: "ACTIVE",
    severity,
    alert_priority_score:
      wfv.priority === "High" ? 3 : wfv.priority === "Medium" ? 2 : 1,
    generated_timestamp: new Date().toISOString(),
    generated_by: assignedToId,
    requires_action: true,
    auto_dismiss_on_action: false,
    directed_to_banker_id: assignedToId || null,
    source_workflow_id: workflowId,
    source_counterparty_id: wfv.counterparty_id,
    action_label: "View Workflow",
    action_url: `/workflow/${workflowId}`,
  });

  if (alertErr) {
    console.error("Alert insert error:", alertErr);
    // Non-fatal — continue
  }

  // =====================================================================
  // STEP 5: RELINK DOCUMENTS
  // =====================================================================

  if (wfv.document_id) {
    try {
      const { data: doc } = await supabase
        .from("document")
        .select("document_id")
        .eq("document_id", wfv.document_id)
        .maybeSingle();

      if (doc) {
        await supabase
          .from("document")
          .update({ workflow_id: workflowId })
          .eq("document_id", wfv.document_id);

        events.push({
          workflow_event_id: `EVT_${workflowId}_DOCS_LINKED`,
          workflow_id: workflowId,
          event_timestamp: new Date().toISOString(),
          event_type: "DOCUMENTS_RELINKED",
          old_value: `WFV_${workflowForValidationId}`,
          new_value: workflowId,
          changed_by_banker_id: assignedToId,
          event_notes: `Document ${wfv.document_id} relinked from WorkflowForValidation to Workflow ${workflowId}`,
        });
      } else {
        // Also try the pipeline documents table
        const { data: pipelineDoc } = await supabase
          .from("documents")
          .select("document_id")
          .eq("document_id", wfv.document_id)
          .maybeSingle();

        if (pipelineDoc) {
          await supabase
            .from("documents")
            .update({ workflow_id: workflowId })
            .eq("document_id", wfv.document_id);

          events.push({
            workflow_event_id: `EVT_${workflowId}_DOCS_LINKED`,
            workflow_id: workflowId,
            event_timestamp: new Date().toISOString(),
            event_type: "DOCUMENTS_RELINKED",
            old_value: `WFV_${workflowForValidationId}`,
            new_value: workflowId,
            changed_by_banker_id: assignedToId,
            event_notes: `Pipeline document ${wfv.document_id} relinked to Workflow ${workflowId}`,
          });
        } else {
          events.push({
            workflow_event_id: `EVT_${workflowId}_DOC_NOT_FOUND`,
            workflow_id: workflowId,
            event_timestamp: new Date().toISOString(),
            event_type: "DOCUMENT_NOT_FOUND",
            old_value: wfv.document_id,
            new_value: "NOT_FOUND",
            changed_by_banker_id: assignedToId,
            event_notes: `Document ${wfv.document_id} not found in document or documents table`,
          });
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      events.push({
        workflow_event_id: `EVT_${workflowId}_DOCS_ERROR`,
        workflow_id: workflowId,
        event_timestamp: new Date().toISOString(),
        event_type: "DOCUMENT_LINKING_ERROR",
        old_value: wfv.document_id,
        new_value: "ERROR",
        changed_by_banker_id: assignedToId,
        event_notes: `Failed to relink document: ${msg}`,
      });
    }
  } else {
    events.push({
      workflow_event_id: `EVT_${workflowId}_NO_DOC_ID`,
      workflow_id: workflowId,
      event_timestamp: new Date().toISOString(),
      event_type: "NO_DOCUMENT_ID",
      old_value: workflowForValidationId,
      new_value: "NO_DOCUMENT_ID",
      changed_by_banker_id: assignedToId,
      event_notes: `No documentId found for WorkflowForValidation ${workflowForValidationId}`,
    });
  }

  // =====================================================================
  // STEP 6: INSERT ALL WORKFLOW EVENTS
  // =====================================================================

  if (events.length > 0) {
    const { error: evtErr } = await supabase
      .from("workflow_event")
      .insert(events);

    if (evtErr) {
      console.error("WorkflowEvent insert error:", evtErr);
      // Non-fatal — the workflow was already created
    }
  }

  // =====================================================================
  // STEP 7: UPDATE WORKFLOW FOR VALIDATION
  // =====================================================================

  const { error: wfvUpdateErr } = await supabase
    .from("workflow_for_validation")
    .update({
      workflow_id: workflowId,
      workflow_stage: "VALIDATED",
      workflow_status: "SUCCESS",
    })
    .eq("workflow_for_validation_id", workflowForValidationId);

  if (wfvUpdateErr) {
    console.error("WFV update error:", wfvUpdateErr);
    // Non-fatal — the workflow was already created
  }

  // =====================================================================
  // STEP 8: WAKE RAILWAY (fire-and-forget latency optimization)
  // Railway discovers PENDING work by polling — this just nudges it.
  // =====================================================================

  const pipelineUrl = process.env.PIPELINE_SERVICE_URL;
  if (pipelineUrl) {
    fetch(`${pipelineUrl}/api/wake`, { method: "POST" }).catch(() => {});
  }

  return NextResponse.json({
    success: true,
    workflowId,
    alertId,
    counterpartyCreated,
    eventsCreated: events.length,
    pipelineWaked: !!pipelineUrl,
  });
}
