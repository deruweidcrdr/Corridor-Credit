import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Untyped client — pipeline tables don't have generated types
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ---------------------------------------------------------------------------
// GET /api/projections
//
// Returns all deals with their obligations (obligation_for_validation)
// and payment schedules (obligation_term_structure_for_validation).
//
// Query chain:
//   deals → deal_documents (deal_id) → contract_for_validation (document_id)
//   contract_for_validation → obligation_for_validation (contract_for_validation_id)
//   contract_for_validation → obligation_term_structure_for_validation (contract_for_validation_id)
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

    // 2. Fetch deal_documents to link documents to deals
    const { data: dealDocs } = await supabase
      .from("deal_documents")
      .select("*")
      .in("deal_id", dealIds);

    // 3. Fetch contract_for_validation via two paths:
    //    a) Through deal_documents (document_id join)
    //    b) Fallback: by counterparty_id match
    const documentIds = (dealDocs ?? []).map((dd: any) => dd.document_id).filter(Boolean);
    const dealCounterpartyIds = deals.map((d: any) => d.counterparty_id).filter(Boolean);

    const [docResult, cpResult] = await Promise.all([
      documentIds.length > 0
        ? supabase.from("contract_for_validation").select("*").in("document_id", documentIds)
        : Promise.resolve({ data: [] }),
      dealCounterpartyIds.length > 0
        ? supabase.from("contract_for_validation").select("*").in("counterparty_id", dealCounterpartyIds)
        : Promise.resolve({ data: [] }),
    ]);

    // Merge & deduplicate by contract_for_validation_id
    const contractMap = new Map<string, any>();
    for (const c of [...(docResult.data ?? []), ...(cpResult.data ?? [])]) {
      contractMap.set(c.contract_for_validation_id, c);
    }
    const contracts = Array.from(contractMap.values());

    // 4. Fetch obligation_for_validation for these contracts
    const contractIds = contracts.map((c: any) => c.contract_for_validation_id);
    let obligations: any[] = [];
    if (contractIds.length > 0) {
      const { data } = await supabase
        .from("obligation_for_validation")
        .select("*")
        .in("contract_for_validation_id", contractIds);
      obligations = data ?? [];
    }

    // 5. Fetch obligation_term_structure_for_validation for these contracts
    let termStructure: any[] = [];
    if (contractIds.length > 0) {
      const { data } = await supabase
        .from("obligation_term_structure_for_validation")
        .select("*")
        .in("contract_for_validation_id", contractIds)
        .order("payment_number", { ascending: true });
      termStructure = data ?? [];
    }

    // 6. Fetch document names from documents table
    //    (contract_for_validation.document_name is often empty — same pattern as contract-analysis)
    const allDocumentIds = [...new Set(contracts.map((c: any) => c.document_id).filter(Boolean))];
    let docNameMap: Record<string, string> = {};
    if (allDocumentIds.length > 0) {
      const { data: docs } = await supabase
        .from("documents")
        .select("document_id, document_name")
        .in("document_id", allDocumentIds);
      for (const doc of docs ?? []) {
        if (doc.document_name) {
          docNameMap[doc.document_id] = doc.document_name;
        }
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

    // 8. Fetch counterparty_profile_assignment rows for these counterparties
    let profileAssignmentsMap: Record<string, any> = {};
    if (counterpartyIds.length > 0) {
      const { data } = await supabase
        .from("counterparty_profile_assignment")
        .select("*")
        .in("counterparty_id", counterpartyIds);
      for (const pa of data ?? []) {
        profileAssignmentsMap[pa.counterparty_id] = pa;
      }
    }

    // 9. Fetch projection_profiles for the effective_profile_ids in assignments
    const effectiveProfileIds = [
      ...new Set(
        Object.values(profileAssignmentsMap)
          .map((pa: any) => pa.effective_profile_id)
          .filter(Boolean)
      ),
    ];
    let profileDetailsMap: Record<string, any> = {};
    if (effectiveProfileIds.length > 0) {
      const { data } = await supabase
        .from("projection_profile")
        .select("*")
        .in("projection_profile_id", effectiveProfileIds);
      for (const pp of data ?? []) {
        profileDetailsMap[pp.projection_profile_id] = pp;
      }
    }

    // 10. Fetch ALL projection profiles for the override dropdown
    const { data: allProfilesRaw } = await supabase
      .from("projection_profile")
      .select("projection_profile_id, profile_name, industry, size, maturity")
      .order("profile_name");
    const allProfiles = (allProfilesRaw ?? []).map((p: any) => ({
      projection_profile_id: p.projection_profile_id,
      profile_name: p.profile_name,
      industry: p.industry,
      size: p.size,
      maturity: p.maturity,
    }));

    // 11. Fetch counterparty_projection (wide-format, one row per counterparty)
    let projectionDataMap: Record<string, any> = {};
    if (counterpartyIds.length > 0) {
      const { data } = await supabase
        .from("counterparty_projection")
        .select("*")
        .in("counterparty_id", counterpartyIds);
      for (const p of data ?? []) {
        projectionDataMap[p.counterparty_id] = p;
      }
    }

    // 12. Fetch counterparty_projection_summary
    let projectionSummaryMap: Record<string, any> = {};
    if (counterpartyIds.length > 0) {
      const { data } = await supabase
        .from("counterparty_projection_summary")
        .select("*")
        .in("counterparty_id", counterpartyIds);
      for (const s of data ?? []) {
        projectionSummaryMap[s.counterparty_id] = s;
      }
    }

    // -- Build lookup maps --

    // Map document_id → deal_id from deal_documents
    const docToDeal: Record<string, string> = {};
    for (const dd of dealDocs ?? []) {
      if (dd.document_id) docToDeal[dd.document_id] = dd.deal_id;
    }

    // Map counterparty_id → deal_id for fallback grouping
    const cpToDeal: Record<string, string> = {};
    for (const deal of deals) {
      if (deal.counterparty_id) cpToDeal[deal.counterparty_id] = deal.deal_id;
    }

    // Group obligations by contract
    const obligationsByContract: Record<string, any[]> = {};
    for (const o of obligations) {
      (obligationsByContract[o.contract_for_validation_id] ??= []).push(o);
    }

    // Group term structure by contract
    const termStructureByContract: Record<string, any[]> = {};
    for (const ts of termStructure) {
      (termStructureByContract[ts.contract_for_validation_id] ??= []).push(ts);
    }

    // Group contracts by deal
    const contractsByDeal: Record<string, any[]> = {};
    for (const c of contracts) {
      const dealId = docToDeal[c.document_id] ?? cpToDeal[c.counterparty_id];
      if (dealId) {
        const contractObligations = obligationsByContract[c.contract_for_validation_id] ?? [];
        const paymentSchedule = termStructureByContract[c.contract_for_validation_id] ?? [];

        // Aggregate obligation properties from first PAYMENT_OBLIGATION
        const paymentObligation = contractObligations.find(
          (o: any) => o.obligation_type === "PAYMENT_OBLIGATION"
        );

        const obligationProperties = paymentObligation
          ? {
              obligationId: paymentObligation.obligation_for_validation_id,
              obligationType: paymentObligation.obligation_type,
              obligationSubtype: paymentObligation.obligation_subtype,
              contractId: paymentObligation.contract_for_validation_id,
              obligationName: paymentObligation.obligation_name,
              principalAmount: paymentObligation.principal_amount,
              interestRateIndex: paymentObligation.interest_rate_index,
              interestRateSpread: paymentObligation.interest_rate_spread,
              amortizationType: paymentObligation.amortization_type_value,
              paymentFrequency: paymentObligation.payment_frequency_value,
              originationDate: paymentObligation.origination_date,
              maturityDate: paymentObligation.maturity_date,
              nextDueDate: paymentObligation.next_due_date,
              totalPayments: paymentSchedule.length || null,
              thresholdValue: paymentObligation.threshold_value,
              isKeyObligation: paymentObligation.is_key_obligation,
              validationStatus: paymentObligation.validation_status,
            }
          : null;

        (contractsByDeal[dealId] ??= []).push({
          contract_for_validation_id: c.contract_for_validation_id,
          contract_title: c.contract_title,
          contract_type: c.contract_type,
          contract_status: c.contract_status,
          document_id: c.document_id,
          document_name: docNameMap[c.document_id] ?? c.document_name ?? null,
          counterparty_id: c.counterparty_id,
          obligations: contractObligations,
          paymentSchedule,
          obligationProperties,
        });
      }
    }

    // -- Assemble response --
    const result = deals.map((deal: any) => ({
      deal_id: deal.deal_id,
      counterparty_id: deal.counterparty_id,
      counterparty_name:
        counterpartiesMap[deal.counterparty_id]?.legal_name ??
        deal.counterparty_name ??
        deal.deal_name,
      deal_name: deal.deal_name,
      contracts: contractsByDeal[deal.deal_id] ?? [],
    }));

    return NextResponse.json({
      deals: result,
      counterparties: counterpartiesMap,
      profileAssignments: profileAssignmentsMap,
      profileDetails: profileDetailsMap,
      allProfiles,
      projectionData: projectionDataMap,
      projectionSummary: projectionSummaryMap,
    });
  } catch (err) {
    console.error("Projections GET error:", err);
    return NextResponse.json({ deals: [], counterparties: {} });
  }
}
