"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Sidebar from "@/app/components/sidebar";

/* ================================================================== */
/*  Design-system tokens (from DESIGN_SYSTEM.md v3)                    */
/* ================================================================== */
const ds = {
  bg: "#0d1017",
  surface: "#131920",
  surfaceRaised: "#1a2130",
  surfaceDeep: "#090c13",
  border: "rgba(255,255,255,0.07)",
  borderAccent: "rgba(255,255,255,0.14)",
  gold: "#c8a84b",
  goldDim: "rgba(200,168,75,0.15)",
  green: "#4caf82",
  greenDim: "rgba(76,175,130,0.13)",
  amber: "#e8a040",
  amberDim: "rgba(232,160,64,0.13)",
  coral: "#e07060",
  coralDim: "rgba(224,112,96,0.14)",
  blue: "#5b9bd5",
  blueDim: "rgba(91,155,213,0.12)",
  text: "#e4e8f0",
  textDim: "#9aa4b2",
  textMuted: "#5e6a7a",
  fontBody: "'Syne', sans-serif",
  fontMono: "'DM Mono', monospace",
  fontSerif: "'Instrument Serif', serif",
  radius: 6,
  radiusLg: 10,
  satColor: "#4caf82",
  satBg: "rgba(76,175,130,0.12)",
  satBorder: "rgba(76,175,130,0.30)",
  pwColor: "#e8a040",
  pwBg: "rgba(232,160,64,0.12)",
  pwBorder: "rgba(232,160,64,0.32)",
  wdwColor: "#e07060",
  wdwBg: "rgba(224,112,96,0.12)",
  wdwBorder: "rgba(224,112,96,0.30)",
};

/* ================================================================== */
/*  Workflow steps                                                     */
/* ================================================================== */
const STEPS = [
  { number: 1, label: "Document" },
  { number: 2, label: "Counterparty" },
  { number: 3, label: "Approval" },
];

/* ================================================================== */
/*  Data interfaces (matching API response)                            */
/* ================================================================== */
interface TermForValidation {
  term_for_validation_id: string;
  contract_for_validation_id: string;
  term_name: string | null;
  term_value: string | null;
  term_unit: string | null;
  extraction_confidence: number | null;
  is_key_term: boolean | null;
  validation_status: string | null;
  term_identity_id: string | null;
  document_id: string | null;
}

interface ContractForValidation {
  contract_for_validation_id: string;
  workflow_for_validation_id: string | null;
  document_id: string | null;
  document_name: string | null;
  contract_type: string | null;
  contract_status: string | null;
  maturity_date: string | null;
  counterparty_id: string | null;
  storage_url: string | null;
  terms: TermForValidation[];
}

interface FacilityInfo {
  facility_id: string;
  deal_id: string | null;
  facility_name: string | null;
  facility_type: string | null;
  facility_status: string | null;
}

interface DealInfo {
  deal_id: string;
  deal_name: string | null;
  counterparty_id: string | null;
  counterparty_name: string | null;
  deal_status: string | null;
  execution_status: string | null;
  total_facilities: number | null;
  total_documents: number | null;
  facilities: FacilityInfo[];
  contracts: ContractForValidation[];
}

interface CounterpartyInfo {
  counterparty_id: string;
  counterparty_name: string | null;
  counterparty_type: string | null;
  credit_score: number | null;
  risk_rating: string | null;
  kyc_status: string | null;
  registration_number: string | null;
  country_of_domicile: string | null;
  business_type: string | null;
  industry_code: number | null;
  incorporation_date: string | null;
  relationship_status: string | null;
  notes: string | null;
  status: string | null;
  source_prospective_counterparty_id: string | null;
  created_at: string | null;
}

/* ================================================================== */
/*  Helper: validation status → dot color                              */
/* ================================================================== */
function statusDotColor(status: string | null): string {
  switch (status) {
    case "CONFIRMED": return ds.green;
    case "FLAGGED": return ds.coral;
    default: return ds.blue;
  }
}

/* ================================================================== */
/*  Root component                                                     */
/* ================================================================== */
export default function ContractAnalysisClient() {
  // Data state
  const [deals, setDeals] = useState<DealInfo[]>([]);
  const [counterparties, setCounterparties] = useState<Record<string, CounterpartyInfo>>({});
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [activeStep, setActiveStep] = useState(1);
  // Tracks term IDs whose values have been edited and confirmed by the user
  const [editedTermIds, setEditedTermIds] = useState<Set<string>>(new Set());

  // Mutation state
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);

  // Derived data
  const selectedDeal = useMemo(
    () => deals.find((d) => d.deal_id === selectedDealId) ?? null,
    [deals, selectedDealId]
  );

  const selectedContract = useMemo(
    () => selectedDeal?.contracts.find((c) => c.contract_for_validation_id === selectedContractId) ?? null,
    [selectedDeal, selectedContractId]
  );

  const terms = useMemo(() => selectedContract?.terms ?? [], [selectedContract]);

  const selectedTerm = useMemo(
    () => terms.find((t) => t.term_for_validation_id === selectedTermId) ?? null,
    [terms, selectedTermId]
  );

  const counterparty = useMemo(
    () => (selectedDeal?.counterparty_id ? counterparties[selectedDeal.counterparty_id] : null) ?? null,
    [selectedDeal, counterparties]
  );

  const facilityLabel = useMemo(() => {
    if (!selectedDeal?.facilities.length) return "";
    const f = selectedDeal.facilities[0];
    return f.facility_name ?? f.facility_type ?? "";
  }, [selectedDeal]);

  // Fetch data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/contract-analysis");
        if (!res.ok) throw new Error("Failed to load data");
        const data = await res.json();
        setDeals(data.deals ?? []);
        setCounterparties(data.counterparties ?? {});

        // Auto-select first deal and contract
        if (data.deals?.length) {
          const firstDeal = data.deals[0];
          setSelectedDealId(firstDeal.deal_id);
          if (firstDeal.contracts?.length) {
            const firstContract = firstDeal.contracts[0];
            setSelectedContractId(firstContract.contract_for_validation_id);
            if (firstContract.terms?.length) {
              setSelectedTermId(firstContract.terms[0].term_for_validation_id);
              setEditValue(firstContract.terms[0].term_value ?? "");
            }
          }
        }
      } catch (err: any) {
        setError(err.message ?? "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Select term handler
  const handleSelectTerm = useCallback((term: TermForValidation) => {
    setSelectedTermId(term.term_for_validation_id);
    setEditValue(term.term_value ?? "");
  }, []);

  // Update a term in local state (for optimistic updates)
  const updateTermLocally = useCallback(
    (termId: string, updates: Partial<TermForValidation>) => {
      setDeals((prev) =>
        prev.map((deal) => ({
          ...deal,
          contracts: deal.contracts.map((contract) => ({
            ...contract,
            terms: contract.terms.map((term) =>
              term.term_for_validation_id === termId ? { ...term, ...updates } : term
            ),
          })),
        }))
      );
    },
    []
  );

  // Confirm term edit — only available when user has changed the value
  const termValueChanged = useMemo(
    () => selectedTerm ? editValue !== (selectedTerm.term_value ?? "") : false,
    [selectedTerm, editValue]
  );

  const handleConfirmTermEdit = useCallback(async () => {
    if (!selectedTerm || saving || !termValueChanged) return;
    setSaving(true);
    try {
      const res = await fetch("/api/contract-analysis/terms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          term_for_validation_id: selectedTerm.term_for_validation_id,
          validation_status: "CONFIRMED",
          term_value: editValue,
        }),
      });
      if (res.ok) {
        updateTermLocally(selectedTerm.term_for_validation_id, {
          validation_status: "CONFIRMED",
          term_value: editValue,
        });
        setEditedTermIds((prev) => new Set(prev).add(selectedTerm.term_for_validation_id));
      }
    } finally {
      setSaving(false);
    }
  }, [selectedTerm, editValue, saving, termValueChanged, updateTermLocally]);

  // Flag term
  const handleFlagTerm = useCallback(async () => {
    if (!selectedTerm || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/contract-analysis/terms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          term_for_validation_id: selectedTerm.term_for_validation_id,
          validation_status: "FLAGGED",
        }),
      });
      if (res.ok) {
        updateTermLocally(selectedTerm.term_for_validation_id, {
          validation_status: "FLAGGED",
        });
      }
    } finally {
      setSaving(false);
    }
  }, [selectedTerm, saving, updateTermLocally]);

  // Validate contract & all terms (omnibus — always available)
  const handleValidateContract = useCallback(async () => {
    if (!selectedContract || validating) return;
    setValidating(true);
    try {
      const res = await fetch("/api/contract-analysis/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contract_for_validation_id: selectedContract.contract_for_validation_id,
          counterparty_id: selectedDeal?.counterparty_id,
        }),
      });
      if (res.ok) {
        setActiveStep(2);
      }
    } finally {
      setValidating(false);
    }
  }, [selectedContract, selectedDeal, validating]);

  // Deal selection handler
  const handleSelectDeal = useCallback(
    (dealId: string) => {
      setSelectedDealId(dealId);
      const deal = deals.find((d) => d.deal_id === dealId);
      if (deal?.contracts.length) {
        setSelectedContractId(deal.contracts[0].contract_for_validation_id);
        if (deal.contracts[0].terms.length) {
          setSelectedTermId(deal.contracts[0].terms[0].term_for_validation_id);
          setEditValue(deal.contracts[0].terms[0].term_value ?? "");
        } else {
          setSelectedTermId(null);
          setEditValue("");
        }
      } else {
        setSelectedContractId(null);
        setSelectedTermId(null);
        setEditValue("");
      }
    },
    [deals]
  );

  // Contract selection handler
  const handleSelectContract = useCallback(
    (contractId: string) => {
      setSelectedContractId(contractId);
      const contract = selectedDeal?.contracts.find(
        (c) => c.contract_for_validation_id === contractId
      );
      if (contract?.terms.length) {
        setSelectedTermId(contract.terms[0].term_for_validation_id);
        setEditValue(contract.terms[0].term_value ?? "");
      } else {
        setSelectedTermId(null);
        setEditValue("");
      }
    },
    [selectedDeal]
  );

  // Counterparty properties for Step 2
  const counterpartyPropsLeft = useMemo(
    () =>
      counterparty
        ? [
            { label: "Credit Score", value: counterparty.credit_score?.toString() ?? "" },
            { label: "Requires KYC Review", value: counterparty.kyc_status ?? "" },
            { label: "Registration Number", value: counterparty.registration_number ?? "" },
            { label: "Counterparty Type", value: counterparty.counterparty_type ?? "" },
            { label: "Prospective Counterparty ID", value: counterparty.source_prospective_counterparty_id ?? counterparty.counterparty_id },
            { label: "Country Of Domicile", value: counterparty.country_of_domicile ?? "" },
            { label: "Business Type", value: counterparty.business_type ?? "" },
          ]
        : [],
    [counterparty]
  );

  const counterpartyPropsRight = useMemo(
    () =>
      counterparty
        ? [
            { label: "Notes", value: counterparty.notes ?? "" },
            { label: "Validated Timestamp", value: counterparty.created_at ?? "" },
            { label: "Industry Code", value: counterparty.industry_code?.toString() ?? "" },
            { label: "Linked To Existing Counterparty ID", value: "" },
            { label: "Relationship Status", value: counterparty.relationship_status ?? "" },
            { label: "Risk Rating", value: counterparty.risk_rating ?? "" },
            { label: "Incorporation Date", value: counterparty.incorporation_date ?? "" },
          ]
        : [],
    [counterparty]
  );

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: ds.bg,
        color: ds.text,
        fontFamily: ds.fontBody,
        fontSize: 13,
      }}
    >
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* ── Row 1: Topbar — stage breadcrumb only ── */}
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            height: 48,
            background: ds.surfaceDeep,
            borderBottom: `1px solid ${ds.border}`,
            flexShrink: 0,
          }}
        >
          {STEPS.map((step) => {
            const isActive = step.number === activeStep;
            const isDone = step.number < activeStep;
            return (
              <button
                key={step.number}
                onClick={() => setActiveStep(step.number)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "0 24px",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  fontFamily: ds.fontBody,
                  color: isActive ? ds.text : isDone ? ds.textDim : ds.textMuted,
                  background: isActive ? ds.bg : "transparent",
                  borderBottom: isActive ? `2px solid ${ds.gold}` : "2px solid transparent",
                  borderRight: `1px solid ${ds.border}`,
                  borderTop: "none",
                  borderLeft: "none",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: isDone ? 12 : 11,
                    fontWeight: 700,
                    fontFamily: ds.fontMono,
                    background: isActive ? ds.gold : isDone ? ds.greenDim : ds.surfaceRaised,
                    color: isActive ? "#1a1a14" : isDone ? ds.green : ds.textDim,
                  }}
                >
                  {isDone ? "✓" : step.number}
                </span>
                {step.label}
              </button>
            );
          })}
        </div>

        {/* ── Loading / Error / Empty states ── */}
        {loading && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: ds.fontBody, fontSize: 14, color: ds.textMuted }}>Loading contract data...</span>
          </div>
        )}
        {!loading && error && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <span style={{ fontFamily: ds.fontBody, fontSize: 14, color: ds.coral }}>{error}</span>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: "6px 14px", borderRadius: ds.radius, background: ds.surfaceRaised, border: `1px solid ${ds.border}`, color: ds.textDim, fontFamily: ds.fontBody, fontSize: 12, cursor: "pointer" }}
            >
              Retry
            </button>
          </div>
        )}
        {!loading && !error && deals.length === 0 && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: ds.fontBody, fontSize: 14, color: ds.textMuted }}>No deals found</span>
          </div>
        )}

        {/* ── Step content ── */}
        {!loading && !error && deals.length > 0 && (
          <>
            {activeStep === 1 && (
              <DocumentStep
                selectedTerm={selectedTerm}
                editValue={editValue}
                onSelectTerm={handleSelectTerm}
                onEditValueChange={setEditValue}
                terms={terms}
                deals={deals}
                selectedDealId={selectedDealId}
                selectedContractId={selectedContractId}
                selectedDeal={selectedDeal}
                selectedContract={selectedContract}
                facilityLabel={facilityLabel}
                saving={saving}
                validating={validating}
                termValueChanged={termValueChanged}
                editedTermIds={editedTermIds}
                onSelectDeal={handleSelectDeal}
                onSelectContract={handleSelectContract}
                onConfirmTermEdit={handleConfirmTermEdit}
                onFlagTerm={handleFlagTerm}
                onValidateContract={handleValidateContract}
              />
            )}
            {activeStep === 2 && (
              <CounterpartyStep
                counterparty={counterparty}
                counterpartyPropsLeft={counterpartyPropsLeft}
                counterpartyPropsRight={counterpartyPropsRight}
              />
            )}
            {activeStep === 3 && <ComingSoon label="Approval" />}
          </>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  PDF Panel — iframe viewer with blob URL (same pattern as Inbox)    */
/* ================================================================== */

function PdfPanel({
  storageUrl,
  documentName,
}: {
  storageUrl: string | null;
  documentName: string | null;
}) {
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Fetch the PDF as a blob so we can set the correct MIME type
  // (Supabase serves files as application/octet-stream)
  useEffect(() => {
    if (!storageUrl) {
      setPdfBlobUrl(null);
      return;
    }
    let revoked = false;
    setLoading(true);
    fetch(storageUrl)
      .then((r) => r.blob())
      .then((blob) => {
        if (revoked) return;
        const pdfBlob = new Blob([blob], { type: "application/pdf" });
        setPdfBlobUrl(URL.createObjectURL(pdfBlob));
      })
      .catch(() => {})
      .finally(() => {
        if (!revoked) setLoading(false);
      });
    return () => {
      revoked = true;
      setPdfBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [storageUrl]);

  const handleFullscreen = useCallback(() => {
    iframeRef.current?.requestFullscreen?.();
  }, []);

  return (
    <div style={{ width: "45%", flexShrink: 0, display: "flex", flexDirection: "column", borderRight: `1px solid ${ds.border}` }}>
      {/* Toolbar */}
      <div
        style={{
          padding: "6px 12px",
          borderBottom: `1px solid ${ds.border}`,
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: ds.fontMono,
          fontSize: 12,
          color: ds.textDim,
        }}
      >
        <span
          style={{
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: 12,
            color: ds.textDim,
          }}
          title={documentName ?? undefined}
        >
          {documentName ?? "No document"}
        </span>
        {pdfBlobUrl && (
          <ToolbarButton
            label={<FitPageIcon />}
            title="Fullscreen"
            onClick={handleFullscreen}
          />
        )}
      </div>

      {/* PDF content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: ds.bg }}>
        {!storageUrl && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: ds.fontBody, fontSize: 13, color: ds.textMuted }}>
              No document available
            </span>
          </div>
        )}
        {storageUrl && loading && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: ds.fontBody, fontSize: 13, color: ds.textMuted }}>
              Loading PDF...
            </span>
          </div>
        )}
        {pdfBlobUrl && (
          <iframe
            ref={iframeRef}
            src={pdfBlobUrl}
            style={{
              flex: 1,
              width: "100%",
              border: "none",
              background: "#fff",
            }}
            title={documentName ?? "Contract document"}
          />
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  STEP 1 — Document                                                  */
/* ================================================================== */

function DocumentStep({
  selectedTerm,
  editValue,
  onSelectTerm,
  onEditValueChange,
  terms,
  deals,
  selectedDealId,
  selectedContractId,
  selectedDeal,
  selectedContract,
  facilityLabel,
  saving,
  validating,
  termValueChanged,
  editedTermIds,
  onSelectDeal,
  onSelectContract,
  onConfirmTermEdit,
  onFlagTerm,
  onValidateContract,
}: {
  selectedTerm: TermForValidation | null;
  editValue: string;
  onSelectTerm: (t: TermForValidation) => void;
  onEditValueChange: (v: string) => void;
  terms: TermForValidation[];
  deals: DealInfo[];
  selectedDealId: string | null;
  selectedContractId: string | null;
  selectedDeal: DealInfo | null;
  selectedContract: ContractForValidation | null;
  facilityLabel: string;
  saving: boolean;
  validating: boolean;
  termValueChanged: boolean;
  editedTermIds: Set<string>;
  onSelectDeal: (id: string) => void;
  onSelectContract: (id: string) => void;
  onConfirmTermEdit: () => void;
  onFlagTerm: () => void;
  onValidateContract: () => void;
}) {
  const dealOptions = useMemo(
    () => deals.map((d) => ({ label: d.deal_id, value: d.deal_id })),
    [deals]
  );
  const contractOptions = useMemo(
    () =>
      (selectedDeal?.contracts ?? []).map((c) => ({
        label: c.document_name?.replace(/\.pdf$/i, "").replace(/_/g, " ") || c.contract_for_validation_id,
        value: c.contract_for_validation_id,
      })),
    [selectedDeal]
  );

  return (
    <>
      {/* Row 2: Page title LEFT — Deal/Contract selector chips RIGHT */}
      <div
        style={{
          padding: "18px 28px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: ds.fontSerif,
            fontStyle: "italic",
            fontSize: 28,
            fontWeight: 400,
            color: ds.text,
            letterSpacing: "-0.01em",
            lineHeight: 1.15,
          }}
        >
          Contract Analysis
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: ds.fontMono, fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textMuted }}>
              Deal to Process
            </span>
            <DropdownChip
              label={selectedDealId ?? "Select deal"}
              dotColor={ds.green}
              options={dealOptions}
              selectedValue={selectedDealId}
              onSelect={onSelectDeal}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: ds.fontMono, fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textMuted }}>
              Contract to Process
            </span>
            <DropdownChip
              label={contractOptions.find(o => o.value === selectedContractId)?.label ?? "Select contract"}
              dotColor={ds.green}
              options={contractOptions}
              selectedValue={selectedContractId}
              onSelect={onSelectContract}
            />
          </div>
        </div>
      </div>

      {/* Row 3: Deal metadata strip LEFT — Validate button RIGHT */}
      <div
        style={{
          padding: "0 28px 14px",
          borderBottom: `1px solid ${ds.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <DealSubheader items={[
          { label: "DEAL", value: selectedDealId ?? "" },
          { label: "COUNTERPARTY", value: selectedDeal?.counterparty_name ?? "" },
          { label: "FACILITY", value: facilityLabel },
          { label: "TERMS", value: `${terms.length} extracted` },
        ]} />
        <button
          onClick={onValidateContract}
          disabled={validating || terms.length === 0}
          style={{
            padding: "7px 14px",
            borderRadius: ds.radius,
            fontFamily: ds.fontBody,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            background: terms.length === 0 ? ds.goldDim : ds.gold,
            color: terms.length === 0 ? ds.textMuted : "#18140a",
            border: "none",
            cursor: validating || terms.length === 0 ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0,
            marginLeft: 20,
            opacity: validating ? 0.6 : 1,
          }}
        >
          {validating ? "Validating..." : "Validate Contract & Terms →"}
        </button>
      </div>

      {/* Three-panel content */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* LEFT: PDF Viewer */}
        <PdfPanel
          storageUrl={selectedContract?.storage_url ?? null}
          documentName={selectedContract?.document_name ?? null}
        />

        {/* MIDDLE: Extracted terms table */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: `1px solid ${ds.border}`, minWidth: 0 }}>
          {/* Table header */}
          <div
            style={{
              padding: "10px 16px",
              background: ds.surfaceRaised,
              borderBottom: `1px solid ${ds.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontFamily: ds.fontMono, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textDim }}>
              Title
            </span>
            <span style={{ fontFamily: ds.fontMono, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textDim }}>
              Term Value
            </span>
          </div>

          {/* Term rows */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {terms.length === 0 && (
              <div style={{ padding: 24, textAlign: "center", color: ds.textMuted, fontFamily: ds.fontBody }}>
                No terms extracted
              </div>
            )}
            {terms.map((term) => {
              const isSelected = selectedTerm?.term_for_validation_id === term.term_for_validation_id;
              const isEdited = editedTermIds.has(term.term_for_validation_id);
              return (
                <button
                  key={term.term_for_validation_id}
                  onClick={() => onSelectTerm(term)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "9px 16px",
                    textAlign: "left",
                    borderBottom: `1px solid ${ds.border}`,
                    background: isSelected ? ds.surfaceRaised : isEdited ? ds.amberDim : "transparent",
                    cursor: "pointer",
                    borderTop: "none",
                    borderRight: "none",
                    borderLeft: isEdited ? `3px solid ${ds.amber}` : "none",
                    transition: "background 0.1s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: isEdited ? ds.amber : statusDotColor(term.validation_status) }} />
                    <span
                      style={{
                        fontFamily: ds.fontBody,
                        fontSize: 13,
                        color: isSelected ? ds.text : ds.textDim,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {term.term_name}
                    </span>
                    {isEdited && (
                      <span
                        style={{
                          fontFamily: ds.fontMono,
                          fontSize: 10,
                          fontWeight: 600,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: ds.amber,
                          background: ds.amberDim,
                          border: `1px solid ${ds.pwBorder}`,
                          padding: "1px 5px",
                          borderRadius: 3,
                          flexShrink: 0,
                        }}
                      >
                        Edited
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontFamily: ds.fontMono,
                      fontSize: 13,
                      fontWeight: 500,
                      color: isEdited ? ds.amber : isSelected ? ds.text : ds.textDim,
                      flexShrink: 0,
                      marginLeft: 16,
                    }}
                  >
                    {term.term_value}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Edit panel */}
        <div style={{ width: 260, flexShrink: 0, display: "flex", flexDirection: "column" }}>
          <div
            style={{
              padding: "10px 16px",
              background: ds.surfaceRaised,
              borderBottom: `1px solid ${ds.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <GhostButtonSm label="Edit Terms" />
          </div>

          {selectedTerm ? (
            <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
              {/* Term title */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontFamily: ds.fontMono, fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textMuted, marginBottom: 4 }}>
                  Term
                </label>
                <p style={{ fontFamily: ds.fontBody, fontSize: 13, color: ds.text }}>{selectedTerm.term_name}</p>
              </div>

              {/* Editable value */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontFamily: ds.fontMono, fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textMuted, marginBottom: 4 }}>
                  Value
                </label>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => onEditValueChange(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: ds.radius,
                    background: ds.surface,
                    border: `1px solid ${ds.border}`,
                    color: ds.text,
                    fontFamily: ds.fontMono,
                    fontSize: 13,
                    outline: "none",
                  }}
                />
              </div>

              {/* Source document */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontFamily: ds.fontMono, fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textMuted, marginBottom: 4 }}>
                  Source Document
                </label>
                <p style={{ fontFamily: ds.fontMono, fontSize: 12, color: ds.textDim }}>
                  {selectedContract?.document_name ?? "Unknown"}
                </p>
                <p style={{ fontFamily: ds.fontMono, fontSize: 11, color: ds.textMuted, marginTop: 2 }}>
                  Contract source document
                </p>
              </div>

              {/* Obligation mapping */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontFamily: ds.fontMono, fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textMuted, marginBottom: 4 }}>
                  Maps to Obligation
                </label>
                <p style={{ fontFamily: ds.fontMono, fontSize: 13, fontWeight: 500, color: ds.text }}>
                  {selectedTerm.term_identity_id
                    ? selectedTerm.term_identity_id
                    : (selectedTerm.term_name ?? "").includes("Covenant")
                      ? "FINANCIAL_COVENANT"
                      : (selectedTerm.term_name ?? "").includes("Fee") ||
                          (selectedTerm.term_name ?? "").includes("Payment")
                        ? "PAYMENT_OBLIGATION"
                        : "CONTRACT_TERM"}
                </p>
              </div>

              {/* Status indicator */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontFamily: ds.fontMono, fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textMuted, marginBottom: 4 }}>
                  Status
                </label>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: ds.fontMono,
                    fontSize: 12,
                    fontWeight: 600,
                    color: statusDotColor(selectedTerm.validation_status),
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusDotColor(selectedTerm.validation_status) }} />
                  {selectedTerm.validation_status ?? "PENDING"}
                </span>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button
                  onClick={onConfirmTermEdit}
                  disabled={saving || !termValueChanged}
                  title={!termValueChanged ? "Edit the term value above to enable" : undefined}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: ds.radius,
                    fontFamily: ds.fontBody,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    background: !termValueChanged ? ds.goldDim : ds.gold,
                    color: !termValueChanged ? ds.textMuted : "#18140a",
                    border: "none",
                    cursor: saving || !termValueChanged ? "not-allowed" : "pointer",
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving ? "Saving..." : "Confirm Term Edit"}
                </button>
                <button
                  onClick={onFlagTerm}
                  disabled={saving || selectedTerm.validation_status === "FLAGGED"}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: ds.radius,
                    fontFamily: ds.fontBody,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    background: selectedTerm.validation_status === "FLAGGED" ? ds.coralDim : "transparent",
                    color: ds.coral,
                    border: selectedTerm.validation_status === "FLAGGED" ? "none" : `1px solid rgba(224,112,96,0.38)`,
                    cursor: saving || selectedTerm.validation_status === "FLAGGED" ? "not-allowed" : "pointer",
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {selectedTerm.validation_status === "FLAGGED" ? "Flagged" : "Flag for Review"}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: ds.fontBody, fontSize: 13, color: ds.textMuted }}>
                Select a term to edit
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer action bar */}
      <div
        style={{
          background: ds.surfaceDeep,
          borderTop: `1px solid ${ds.border}`,
          padding: "12px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <FooterMeta label="Deal" value={selectedDealId ?? ""} />
          <FooterMeta label="Facility" value={facilityLabel} />
          <FooterMeta label="Terms" value={`${terms.length} extracted`} valueColor={ds.green} />
          <FooterMeta label="Counterparty" value={selectedDeal?.counterparty_name ?? ""} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <GhostButtonWarn label="Reject Terms" />
        </div>
      </div>
    </>
  );
}

/* ================================================================== */
/*  STEP 2 — Counterparty                                              */
/* ================================================================== */

function CounterpartyStep({
  counterparty,
  counterpartyPropsLeft,
  counterpartyPropsRight,
}: {
  counterparty: CounterpartyInfo | null;
  counterpartyPropsLeft: { label: string; value: string }[];
  counterpartyPropsRight: { label: string; value: string }[];
}) {
  const cpName = counterparty?.counterparty_name ?? "Unknown";
  const cpType = counterparty?.counterparty_type ?? "";
  const cpStatus = counterparty?.relationship_status ?? counterparty?.status ?? "";
  const cpId = counterparty?.source_prospective_counterparty_id ?? counterparty?.counterparty_id ?? "";

  return (
    <>
      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px 80px" }}>
        {/* Page header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontFamily: ds.fontSerif, fontSize: 28, fontStyle: "italic", color: ds.text, letterSpacing: "-0.01em", lineHeight: 1.15 }}>
              Prospective Counterparty
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <GhostButton label="Edit Prospective Counterparty" />
              <GhostButtonWarn label="Flag Prospective Counterparty" />
            </div>
          </div>
          <DealSubheader items={[
            { label: "COUNTERPARTY", value: cpName },
            { label: "TYPE", value: cpType },
            { label: "STATUS", value: cpStatus },
            { label: "ID", value: cpId },
          ]} />
        </div>

        {/* ── Properties ── */}
        <SectionDivider label="Properties" />
        <div
          style={{
            background: ds.surface,
            border: `1px solid ${ds.border}`,
            borderRadius: ds.radiusLg,
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              padding: "12px 20px",
              background: ds.surfaceRaised,
              borderBottom: `1px solid ${ds.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontFamily: ds.fontMono, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textDim }}>
              Counterparty Properties
            </span>
            <span
              style={{
                fontFamily: ds.fontMono,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                padding: "3px 8px",
                borderRadius: 3,
                background: ds.pwBg,
                color: ds.pwColor,
                border: `1px solid ${ds.pwBorder}`,
              }}
            >
              {cpStatus || "Prospect"}
            </span>
          </div>
          <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
            <div>
              {counterpartyPropsLeft.map((prop) => (
                <PropertyRow key={prop.label} label={prop.label} value={prop.value} />
              ))}
            </div>
            <div>
              {counterpartyPropsRight.map((prop) => (
                <PropertyRow key={prop.label} label={prop.label} value={prop.value} />
              ))}
            </div>
          </div>
        </div>

        {/* ── KYC & Projections two-column ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* KYC */}
          <div>
            <SectionDivider label="Know Your Customer" />
            <div
              style={{
                background: ds.surface,
                border: `1px solid ${ds.border}`,
                borderRadius: ds.radiusLg,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "12px 20px",
                  background: ds.surfaceRaised,
                  borderBottom: `1px solid ${ds.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontFamily: ds.fontMono, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textDim }}>
                  KYC Due Diligence
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <GhostButtonSm label="Edit KYC Data" />
                </div>
              </div>
              <div style={{ padding: "32px 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: ds.fontBody, fontSize: 13, color: ds.textMuted }}>
                  No KYC records
                </span>
              </div>
            </div>
          </div>

          {/* Projections Workflow */}
          <div>
            <SectionDivider label="Projections Workflow" />
            <div
              style={{
                background: ds.surface,
                border: `1px solid ${ds.border}`,
                borderRadius: ds.radiusLg,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "12px 20px",
                  background: ds.surfaceRaised,
                  borderBottom: `1px solid ${ds.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontFamily: ds.fontMono, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textDim }}>
                  Counterparty Risk
                </span>
                <GhostButtonSm label="Request Risk Reassessment" />
              </div>
              <div style={{ padding: "32px 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: ds.fontBody, fontSize: 13, color: ds.textMuted }}>
                  No risk assessments
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer action bar */}
      <div
        style={{
          background: ds.surfaceDeep,
          borderTop: `1px solid ${ds.border}`,
          padding: "12px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <FooterMeta label="Counterparty" value={cpName} />
          <FooterMeta label="Type" value={cpType} />
          <FooterMeta label="Status" value={cpStatus} valueColor={ds.amber} />
          <FooterMeta label="KYC" value={counterparty?.kyc_status ?? "Pending"} valueColor={ds.textMuted} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <GhostButtonWarn label="Flag Counterparty" />
          <button
            style={{
              padding: "8px 16px",
              borderRadius: ds.radius,
              fontFamily: ds.fontBody,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              background: ds.gold,
              color: "#18140a",
              border: "none",
              cursor: "pointer",
            }}
          >
            Validate Counterparty →
          </button>
        </div>
      </div>
    </>
  );
}

/* ================================================================== */
/*  Coming Soon placeholder                                            */
/* ================================================================== */

function ComingSoon({ label }: { label: string }) {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontSize: 16, color: ds.textMuted, fontFamily: ds.fontSerif, fontStyle: "italic" }}>
        {label} — coming soon
      </span>
    </div>
  );
}

/* ================================================================== */
/*  Shared components                                                  */
/* ================================================================== */

function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
      <span style={{ flex: "0 0 16px", height: 1, background: ds.borderAccent }} />
      <span style={{ fontFamily: ds.fontMono, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textMuted, whiteSpace: "nowrap" }}>
        {label}
      </span>
      <span style={{ flex: 1, height: 1, background: ds.border }} />
    </div>
  );
}

function DealSubheader({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, paddingBottom: 12, borderBottom: `1px solid ${ds.borderAccent}` }}>
      {items.map((item, i) => (
        <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {i > 0 && <span style={{ width: 1, height: 18, background: ds.borderAccent, margin: "0 14px", flexShrink: 0 }} />}
          <span style={{ fontFamily: ds.fontMono, fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textMuted, marginRight: 6 }}>{item.label}</span>
          <span style={{ fontFamily: ds.fontMono, fontSize: 13, fontWeight: 500, color: ds.text, letterSpacing: "0.02em" }}>{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function PropertyRow({ label, value }: { label: string; value: string }) {
  const isEmpty = !value;
  const isHighlighted =
    value === "BORROWER" ||
    value === "PROSPECT" ||
    value.startsWith("PCTR_");

  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "5px 0", borderBottom: `1px solid ${ds.border}` }}>
      <span style={{ fontFamily: ds.fontBody, fontSize: 13, fontWeight: 400, color: ds.textDim, width: 220, flexShrink: 0 }}>{label}</span>
      {isEmpty ? (
        <span style={{ fontFamily: ds.fontBody, fontSize: 13, fontStyle: "italic", color: ds.textMuted }}>No value</span>
      ) : (
        <span style={{ fontFamily: ds.fontMono, fontSize: 13, fontWeight: isHighlighted ? 500 : 400, color: isHighlighted ? ds.text : ds.textDim }}>
          {value}
        </span>
      )}
    </div>
  );
}

function DropdownChip({
  label,
  dotColor,
  options,
  selectedValue,
  onSelect,
}: {
  label: string;
  dotColor: string;
  options: { label: string; value: string }[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontFamily: ds.fontMono,
          fontSize: 12,
          fontWeight: 500,
          color: ds.text,
          background: ds.surfaceRaised,
          border: `1px solid ${ds.border}`,
          padding: "4px 10px",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: dotColor }} />
        {label}
        <ChevronDownIcon />
      </button>

      {open && options.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            right: 0,
            minWidth: 260,
            maxHeight: 240,
            overflowY: "auto",
            background: ds.surfaceRaised,
            border: `1px solid ${ds.borderAccent}`,
            borderRadius: ds.radius,
            zIndex: 100,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onSelect(opt.value);
                setOpen(false);
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                fontFamily: ds.fontMono,
                fontSize: 12,
                color: opt.value === selectedValue ? ds.text : ds.textDim,
                background: opt.value === selectedValue ? ds.surface : "transparent",
                border: "none",
                borderBottom: `1px solid ${ds.border}`,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: opt.value === selectedValue ? ds.green : ds.textMuted, flexShrink: 0 }} />
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ToolbarButton({ label, onClick, title, style: extraStyle }: { label: React.ReactNode; onClick?: () => void; title?: string; style?: React.CSSProperties }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        padding: "3px 6px",
        borderRadius: 4,
        background: "transparent",
        color: ds.textDim,
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: ds.fontMono,
        fontSize: 13,
        ...extraStyle,
      }}
    >
      {label}
    </button>
  );
}

function GhostButton({ label }: { label: string }) {
  return (
    <button style={{ padding: "8px 16px", borderRadius: ds.radius, fontFamily: ds.fontBody, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: "transparent", color: ds.textDim, border: `1px solid ${ds.borderAccent}`, cursor: "pointer", whiteSpace: "nowrap" }}>
      {label}
    </button>
  );
}

function GhostButtonSm({ label }: { label: string }) {
  return (
    <button style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 4, background: "transparent", border: `1px solid ${ds.border}`, color: ds.textMuted, fontFamily: ds.fontMono, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}>
      {label}
    </button>
  );
}

function GhostButtonWarn({ label }: { label: string }) {
  return (
    <button style={{ padding: "8px 16px", borderRadius: ds.radius, fontFamily: ds.fontBody, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: "transparent", color: ds.coral, border: `1px solid rgba(224,112,96,0.38)`, cursor: "pointer", whiteSpace: "nowrap" }}>
      {label}
    </button>
  );
}

function FooterMeta({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ fontSize: 12, fontFamily: ds.fontMono, color: ds.textMuted }}>
      {label}: <strong style={{ color: valueColor || ds.textDim }}>{value}</strong>
    </div>
  );
}

/* ================================================================== */
/*  Icons                                                              */
/* ================================================================== */

function ChevronDownIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function FitPageIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  );
}

