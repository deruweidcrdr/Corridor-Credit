import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface MarkReviewedRequest {
  workflowForValidationId: string;
  reviewedBy?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MarkReviewedRequest;
    const { workflowForValidationId, reviewedBy } = body;

    if (!workflowForValidationId) {
      return NextResponse.json(
        { error: "workflowForValidationId is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("workflow_for_validation")
      .update({
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewedBy ?? "SYSTEM",
      })
      .eq("workflow_for_validation_id", workflowForValidationId);

    if (error) {
      console.error("Mark reviewed error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      workflowForValidationId,
    });
  } catch (err) {
    console.error("Mark reviewed endpoint error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
