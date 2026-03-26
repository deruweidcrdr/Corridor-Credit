import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ArchiveRequest {
  workflowForValidationId: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ArchiveRequest;
    const { workflowForValidationId } = body;

    if (!workflowForValidationId) {
      return NextResponse.json(
        { error: "workflowForValidationId is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("workflow_for_validation")
      .update({ is_archived: true })
      .eq("workflow_for_validation_id", workflowForValidationId);

    if (error) {
      console.error("Archive error:", error);
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
    console.error("Archive endpoint error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
