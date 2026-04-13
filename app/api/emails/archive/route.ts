import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ArchiveRequest {
  emailId: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ArchiveRequest;
    const { emailId } = body;

    if (!emailId) {
      return NextResponse.json(
        { error: "emailId is required" },
        { status: 400 }
      );
    }

    // Archive the email itself
    const { error: emailError } = await supabase
      .from("email")
      .update({ is_archived: true })
      .eq("email_id", emailId);

    if (emailError) {
      console.error("Email archive error:", emailError);
      return NextResponse.json(
        { error: emailError.message },
        { status: 500 }
      );
    }

    // Cascade: archive all WFV records linked to this email (best-effort)
    const { error: wfvError } = await supabase
      .from("workflow_for_validation")
      .update({ is_archived: true })
      .eq("source_email_id", emailId);

    if (wfvError) {
      console.error("WFV cascade archive error (non-fatal):", wfvError);
    }

    return NextResponse.json({ success: true, emailId });
  } catch (err) {
    console.error("Email archive endpoint error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
