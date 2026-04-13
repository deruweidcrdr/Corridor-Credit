import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ---------------------------------------------------------------------------
// POST /api/storage/signed-url
//
// On-demand signed URL generation for a single document. Called when a user
// clicks to view a document, rather than eagerly on page load.
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { document_id } = body;

    if (!document_id) {
      return NextResponse.json(
        { error: "document_id is required" },
        { status: 400 }
      );
    }

    const { data: doc, error: docErr } = await supabase
      .from("document")
      .select("document_id, document_name, email_id")
      .eq("document_id", document_id)
      .maybeSingle();

    if (docErr || !doc) {
      return NextResponse.json(
        { error: `Document not found: ${docErr?.message ?? document_id}` },
        { status: 404 }
      );
    }

    if (!doc.email_id || !doc.document_name) {
      return NextResponse.json(
        { error: "Document missing email_id or document_name — cannot construct storage path" },
        { status: 404 }
      );
    }

    const storagePath = `${doc.email_id}/${doc.document_name}`;
    const { data } = await supabase.storage
      .from("attachments")
      .createSignedUrl(storagePath, 3600);

    if (!data?.signedUrl) {
      return NextResponse.json(
        { error: "Failed to generate signed URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
      documentName: doc.document_name,
    });
  } catch (err) {
    console.error("Signed URL error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
