import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Untyped client — pipeline tables don't have generated types
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ---------------------------------------------------------------------------
// GET /api/contract-analysis
//
// Returns all deals with their facilities, contracts (contract_for_validation),
// terms (term_for_validation), and counterparty data.
//
// Query chain:
//   deals → facilities (deal_id)
//   deals → deal_documents (deal_id) → contract_for_validation (document_id)
//   contract_for_validation → term_for_validation (contract_for_validation_id)
//   deals.counterparty_id → counterparties
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    // 1. Fetch all deals
    const { data: deals, error: dealsErr } = await supabase
      .from("deals")
      .select("*")
      .order("created_date", { ascending: false });

    if (dealsErr) {
      console.error("Failed to fetch deals:", dealsErr);
      return NextResponse.json({ deals: [], counterparties: {} });
    }

    if (!deals || deals.length === 0) {
      return NextResponse.json({ deals: [], counterparties: {} });
    }

    const dealIds = deals.map((d: any) => d.deal_id);

    // 2. Fetch facilities for these deals
    const { data: facilities } = await supabase
      .from("facilities")
      .select("*")
      .in("deal_id", dealIds);

    // 3. Fetch deal_documents to link documents to deals
    const { data: dealDocs } = await supabase
      .from("deal_documents")
      .select("*")
      .in("deal_id", dealIds);

    // 4. Fetch contract_for_validation for these documents
    const documentIds = (dealDocs ?? []).map((dd: any) => dd.document_id).filter(Boolean);
    let contracts: any[] = [];
    if (documentIds.length > 0) {
      const { data } = await supabase
        .from("contract_for_validation")
        .select("*")
        .in("document_id", documentIds);
      contracts = data ?? [];
    }

    // 5. Fetch term_for_validation for these contracts
    const contractIds = contracts.map((c: any) => c.contract_for_validation_id);
    let terms: any[] = [];
    if (contractIds.length > 0) {
      const { data } = await supabase
        .from("term_for_validation")
        .select("*")
        .in("contract_for_validation_id", contractIds);
      terms = data ?? [];
    }

    // 6. Fetch documents for signed URL generation
    let signedUrlMap: Record<string, string> = {};
    if (documentIds.length > 0) {
      const { data: docs } = await supabase
        .from("documents")
        .select("document_id, document_name, email_id")
        .in("document_id", documentIds);

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
      }
    }

    // 7. Fetch counterparties
    const counterpartyIds = [
      ...new Set(deals.map((d: any) => d.counterparty_id).filter(Boolean)),
    ];
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
    const facilitiesByDeal: Record<string, any[]> = {};
    for (const f of facilities ?? []) {
      (facilitiesByDeal[f.deal_id] ??= []).push(f);
    }

    // Map document_id → deal_id from deal_documents
    const docToDeal: Record<string, string> = {};
    for (const dd of dealDocs ?? []) {
      if (dd.document_id) docToDeal[dd.document_id] = dd.deal_id;
    }

    // Group terms by contract
    const termsByContract: Record<string, any[]> = {};
    for (const t of terms) {
      (termsByContract[t.contract_for_validation_id] ??= []).push(t);
    }

    // Group contracts by deal (through deal_documents)
    const contractsByDeal: Record<string, any[]> = {};
    for (const c of contracts) {
      const dealId = docToDeal[c.document_id];
      if (dealId) {
        const contractWithTerms = {
          ...c,
          terms: termsByContract[c.contract_for_validation_id] ?? [],
          storage_url: signedUrlMap[c.document_id] ?? null,
        };
        (contractsByDeal[dealId] ??= []).push(contractWithTerms);
      }
    }

    // -- Assemble response --
    const result = deals.map((deal: any) => ({
      ...deal,
      facilities: facilitiesByDeal[deal.deal_id] ?? [],
      contracts: contractsByDeal[deal.deal_id] ?? [],
    }));

    return NextResponse.json({ deals: result, counterparties: counterpartiesMap });
  } catch (err) {
    console.error("Contract analysis GET error:", err);
    return NextResponse.json({ deals: [], counterparties: {} });
  }
}
