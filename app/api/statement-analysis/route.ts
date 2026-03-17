import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ---------------------------------------------------------------------------
// GET /api/statement-analysis
//
// Returns all deals with their financial statements (historical from
// financial_statement_for_validation, pro forma from pro_forma_financial_statement),
// signed URLs for document preview, and counterparty data.
//
// Query chain:
//   deals → deal_documents (deal_id) → financial_statement_for_validation (document_id)
//   deals → pro_forma_financial_statement (deal_id)
//   deals.counterparty_id → counterparties
//   documents → signed URLs for PDF preview
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    // 1. Fetch all deals
    const { data: deals, error: dealsErr } = await supabase
      .from("deals")
      .select("*")
      .order("created_date", { ascending: false });

    if (dealsErr || !deals?.length) {
      return NextResponse.json({ deals: [], counterparties: {} });
    }

    const dealIds = deals.map((d: any) => d.deal_id);

    // 2. Fetch deal_documents to link documents to deals
    const { data: dealDocs } = await supabase
      .from("deal_documents")
      .select("*")
      .in("deal_id", dealIds);

    // 3. Fetch financial_statement_for_validation via document_id + counterparty fallback
    const documentIds = (dealDocs ?? []).map((dd: any) => dd.document_id).filter(Boolean);
    const dealCounterpartyIds = deals.map((d: any) => d.counterparty_id).filter(Boolean);

    const [docResult, cpResult] = await Promise.all([
      documentIds.length > 0
        ? supabase.from("financial_statement_for_validation").select("*").in("document_id", documentIds)
        : Promise.resolve({ data: [] }),
      dealCounterpartyIds.length > 0
        ? supabase.from("financial_statement_for_validation").select("*").in("counterparty_id", dealCounterpartyIds)
        : Promise.resolve({ data: [] }),
    ]);

    // Merge & deduplicate
    const fsvMap = new Map<string, any>();
    for (const s of [...(docResult.data ?? []), ...(cpResult.data ?? [])]) {
      fsvMap.set(s.id, s);
    }
    const historicalStatements = Array.from(fsvMap.values());

    // 4. Fetch pro_forma_financial_statement by deal_id
    let proFormaStatements: any[] = [];
    {
      const { data } = await supabase
        .from("pro_forma_financial_statement")
        .select("*")
        .in("deal_id", dealIds);
      proFormaStatements = data ?? [];
    }

    // 5. Fetch documents for signed URL generation
    const allDocumentIds = [
      ...new Set([
        ...historicalStatements.map((s: any) => s.document_id),
        ...proFormaStatements.map((s: any) => s.document_id),
      ].filter(Boolean)),
    ];

    let signedUrlMap: Record<string, string> = {};
    let docNameMap: Record<string, string> = {};
    if (allDocumentIds.length > 0) {
      const { data: docs } = await supabase
        .from("documents")
        .select("document_id, document_name, email_id")
        .in("document_id", allDocumentIds);

      if (docs?.length) {
        const urlRequests = docs.map(async (doc: any) => {
          if (!doc.email_id || !doc.document_name) return;
          const storagePath = `${doc.email_id}/${doc.document_name}`;
          const { data } = await supabase.storage
            .from("attachments")
            .createSignedUrl(storagePath, 3600);
          if (data?.signedUrl) {
            signedUrlMap[doc.document_id] = data.signedUrl;
          }
        });
        await Promise.all(urlRequests);
        for (const doc of docs) {
          docNameMap[doc.document_id] = doc.document_name;
        }
      }
    }

    // 6. Fetch counterparties
    const counterpartyIds = [...new Set(deals.map((d: any) => d.counterparty_id).filter(Boolean))];
    let counterpartiesMap: Record<string, any> = {};
    if (counterpartyIds.length > 0) {
      const { data } = await supabase
        .from("counterparties")
        .select("*")
        .in("counterparty_id", counterpartyIds);
      for (const cp of data ?? []) {
        counterpartiesMap[cp.counterparty_id] = cp;
      }
    }

    // -- Build lookup maps --
    const docToDeal: Record<string, string> = {};
    for (const dd of dealDocs ?? []) {
      if (dd.document_id) docToDeal[dd.document_id] = dd.deal_id;
    }
    const cpToDeal: Record<string, string> = {};
    for (const deal of deals) {
      if (deal.counterparty_id) cpToDeal[deal.counterparty_id] = deal.deal_id;
    }

    // Group historical statements by deal
    const historicalByDeal: Record<string, any[]> = {};
    for (const s of historicalStatements) {
      const dealId = docToDeal[s.document_id] ?? cpToDeal[s.counterparty_id];
      if (dealId) {
        (historicalByDeal[dealId] ??= []).push({
          ...s,
          document_name: docNameMap[s.document_id] ?? null,
          storage_url: signedUrlMap[s.document_id] ?? null,
        });
      }
    }

    // Group pro forma statements by deal
    const proFormaByDeal: Record<string, any[]> = {};
    for (const s of proFormaStatements) {
      const dealId = s.deal_id ?? cpToDeal[s.counterparty_id];
      if (dealId) {
        (proFormaByDeal[dealId] ??= []).push({
          ...s,
          document_name: docNameMap[s.document_id] ?? null,
          storage_url: signedUrlMap[s.document_id] ?? null,
        });
      }
    }

    // -- Assemble response --
    const result = deals.map((deal: any) => ({
      ...deal,
      historical_statements: historicalByDeal[deal.deal_id] ?? [],
      pro_forma_statements: proFormaByDeal[deal.deal_id] ?? [],
    }));

    return NextResponse.json({ deals: result, counterparties: counterpartiesMap });
  } catch (err) {
    console.error("Statement analysis GET error:", err);
    return NextResponse.json({ deals: [], counterparties: {} });
  }
}
