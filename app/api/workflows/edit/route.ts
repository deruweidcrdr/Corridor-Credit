import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Fields that trigger re-extraction when changed
const CLASSIFICATION_FIELDS = [
  "document_content_flags",
  "counterparty_id",
  "document_type",
] as const;

interface EditRequest {
  workflowForValidationId: string;
  updates: Record<string, unknown>;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EditRequest;
    const { workflowForValidationId, updates } = body;

    if (!workflowForValidationId) {
      return NextResponse.json(
        { error: "workflowForValidationId is required" },
        { status: 400 }
      );
    }

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No updates provided" },
        { status: 400 }
      );
    }

    // 1. Fetch current record to compare classification fields
    const { data: current, error: fetchErr } = await supabase
      .from("workflow_for_validation")
      .select("*")
      .eq("workflow_for_validation_id", workflowForValidationId)
      .single();

    if (fetchErr || !current) {
      return NextResponse.json(
        { error: fetchErr?.message ?? "Record not found" },
        { status: 404 }
      );
    }

    // 2. Check if any classification-relevant field changed
    const classificationChanged = CLASSIFICATION_FIELDS.some(
      (field) =>
        field in updates &&
        updates[field] !== undefined &&
        updates[field] !== current[field]
    );

    // 3. Build the update payload
    const payload: Record<string, unknown> = { ...updates };

    if (classificationChanged) {
      // Reset extraction status so Railway re-runs extraction
      payload.extraction_status = "PENDING";
      // Reset workflow stage back to CLASSIFIED so it re-enters the pipeline
      payload.workflow_stage = "CLASSIFIED";
      payload.workflow_status = "PENDING_VALIDATION";
    }

    // 4. Apply the update
    const { error: updateErr } = await supabase
      .from("workflow_for_validation")
      .update(payload)
      .eq("workflow_for_validation_id", workflowForValidationId);

    if (updateErr) {
      console.error("Edit workflow error:", updateErr);
      return NextResponse.json(
        { error: updateErr.message },
        { status: 500 }
      );
    }

    // 5. Fire-and-forget wake if re-extraction needed
    let pipelineWaked = false;
    if (classificationChanged) {
      const railwayUrl = process.env.RAILWAY_PIPELINE_URL;
      if (railwayUrl) {
        fetch(`${railwayUrl}/api/wake`, { method: "POST" }).catch(() => {});
        pipelineWaked = true;
      }
    }

    return NextResponse.json({
      success: true,
      workflowForValidationId,
      classificationChanged,
      pipelineWaked,
    });
  } catch (err) {
    console.error("Edit workflow endpoint error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
