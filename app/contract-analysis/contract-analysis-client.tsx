"use client";

import { useState } from "react";
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
/*  Mock extracted contract terms                                      */
/* ================================================================== */
interface ContractTerm {
  id: string;
  title: string;
  value: string;
}

const MOCK_TERMS: ContractTerm[] = [
  { id: "1", title: "Applicable Margin Spread", value: "275" },
  { id: "2", title: "Base Rate Index", value: "SOFR" },
  { id: "3", title: "Monthly Financials Required", value: "YES" },
  { id: "4", title: "Upfront Origination Fee", value: "1.0" },
  { id: "5", title: "Insurance Lender Loss Payee", value: "YES" },
  { id: "6", title: "Lien Priority", value: "FIRST_LIEN" },
  { id: "7", title: "Field Examination Frequency", value: "ANNUAL" },
  { id: "8", title: "Loan To Value Ratio", value: "87.7%" },
  { id: "9", title: "Compliance Certificates Required", value: "YES" },
  { id: "10", title: "Title Retention", value: "SECURITY_INTEREST" },
  { id: "11", title: "Effective Date", value: "2026-04-15" },
  { id: "12", title: "Facility Type", value: "TERM_LOAN" },
  { id: "13", title: "Annual Audited Statements Required", value: "YES" },
  { id: "14", title: "Quarterly Statements Required", value: "YES" },
  { id: "15", title: "Administrative Fee", value: "75000" },
  { id: "16", title: "Property Insurance Required", value: "YES" },
  { id: "17", title: "Maximum Facility Amount", value: "250000000" },
  { id: "18", title: "Maturity Date", value: "2033-04-15" },
  { id: "19", title: "DSCR Covenant Minimum", value: "1.25" },
  { id: "20", title: "Leverage Covenant Maximum", value: "3.25" },
  { id: "21", title: "FCCR Covenant Minimum", value: "1.15" },
  { id: "22", title: "Amortization Type", value: "SCULPTED" },
  { id: "23", title: "Payment Frequency", value: "SEMI_ANNUAL" },
];

/* ================================================================== */
/*  Counterparty properties                                            */
/* ================================================================== */
const COUNTERPARTY_PROPERTIES_LEFT: { label: string; value: string }[] = [
  { label: "Credit Score", value: "" },
  { label: "Requires KYC Review", value: "false" },
  { label: "Registration Number", value: "" },
  { label: "Counterparty Type", value: "BORROWER" },
  { label: "Prospective Counterparty ID", value: "PCTR_CTR_20260305_843506c11a" },
  { label: "Country Of Domicile", value: "" },
  { label: "Business Type", value: "" },
];

const COUNTERPARTY_PROPERTIES_RIGHT: { label: string; value: string }[] = [
  { label: "Notes", value: "Auto-created from workflow" },
  { label: "Validated Timestamp", value: "2026-03-07T05:59:36.909Z" },
  { label: "Industry Code", value: "" },
  { label: "Linked To Existing Counterparty ID", value: "" },
  { label: "Relationship Status", value: "PROSPECT" },
  { label: "Risk Rating", value: "" },
  { label: "Incorporation Date", value: "" },
];

/* ================================================================== */
/*  Root component                                                     */
/* ================================================================== */
export default function ContractAnalysisClient() {
  const [selectedTerm, setSelectedTerm] = useState<ContractTerm | null>(
    MOCK_TERMS[0]
  );
  const [editValue, setEditValue] = useState(MOCK_TERMS[0].value);
  const [activeStep, setActiveStep] = useState(1);
  const [zoom, setZoom] = useState(88);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 13;

  function handleSelectTerm(term: ContractTerm) {
    setSelectedTerm(term);
    setEditValue(term.value);
  }

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

        {/* ── Step content ── */}
        {activeStep === 1 && (
          <DocumentStep
            selectedTerm={selectedTerm}
            editValue={editValue}
            onSelectTerm={handleSelectTerm}
            onEditValueChange={setEditValue}
            zoom={zoom}
            onZoomChange={setZoom}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalPages={totalPages}
          />
        )}
        {activeStep === 2 && <CounterpartyStep />}
        {activeStep === 3 && <ComingSoon label="Approval" />}
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
  zoom,
  onZoomChange,
  currentPage,
  onPageChange,
  totalPages,
}: {
  selectedTerm: ContractTerm | null;
  editValue: string;
  onSelectTerm: (t: ContractTerm) => void;
  onEditValueChange: (v: string) => void;
  zoom: number;
  onZoomChange: (z: number) => void;
  currentPage: number;
  onPageChange: (p: number) => void;
  totalPages: number;
}) {
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
            <DropdownChip label="DEAL_20260126_48f8e7cf" dotColor={ds.green} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: ds.fontMono, fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textMuted }}>
              Contract to Process
            </span>
            <DropdownChip label="WF_1772683175197_hpghfbgk6" dotColor={ds.green} />
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
          { label: "DEAL", value: "DEAL_20260126_48f8e7cf" },
          { label: "COUNTERPARTY", value: "Solar Valley Holdings" },
          { label: "FACILITY", value: "$250MM Sr. Secured Term · SOFR + 275 bps" },
          { label: "TERMS", value: `${MOCK_TERMS.length} extracted` },
        ]} />
        <button
          style={{
            padding: "7px 14px",
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
            whiteSpace: "nowrap",
            flexShrink: 0,
            marginLeft: 20,
          }}
        >
          Validate Contract &amp; Terms →
        </button>
      </div>

      {/* Three-panel content */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* LEFT: PDF Viewer */}
        <div style={{ width: "45%", flexShrink: 0, display: "flex", flexDirection: "column", borderRight: `1px solid ${ds.border}` }}>
          {/* PDF toolbar */}
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
            <input
              type="text"
              value={currentPage}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                if (v >= 1 && v <= totalPages) onPageChange(v);
              }}
              style={{
                width: 36,
                textAlign: "center",
                background: ds.surface,
                border: `1px solid ${ds.border}`,
                borderRadius: 4,
                padding: "3px 0",
                color: ds.text,
                fontFamily: ds.fontMono,
                fontSize: 12,
                outline: "none",
              }}
            />
            <span>of {totalPages}</span>

            <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 8 }}>
              <ToolbarButton onClick={() => onZoomChange(Math.max(25, zoom - 12))} label="−" />
              <span style={{ width: 42, textAlign: "center", fontSize: 11, color: ds.textMuted }}>{zoom}%</span>
              <ToolbarButton onClick={() => onZoomChange(Math.min(200, zoom + 12))} label="+" />
            </div>

            <ToolbarButton label={<FitWidthIcon />} title="Fit width" style={{ marginLeft: 6 }} />
            <ToolbarButton label={<FitPageIcon />} title="Fit page" />
            <ToolbarButton label={<SearchIcon />} title="Search" style={{ marginLeft: "auto" }} />
            <ToolbarButton label="···" title="More" />
          </div>

          {/* PDF document area */}
          <div style={{ flex: 1, overflow: "auto", padding: 16, display: "flex", justifyContent: "center", background: ds.bg }}>
            <div
              style={{
                width: `${5.1 * (zoom / 100)}in`,
                minHeight: `${6.6 * (zoom / 100)}in`,
                padding: `${0.5 * (zoom / 100)}in`,
                background: "#ffffff",
                borderRadius: 4,
                boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 16, fontWeight: 600, color: "#c0392b", fontFamily: "serif" }}>
                  Confidential Information Memorandum
                </p>
                <h2 style={{ color: "#111827", fontSize: 18, fontWeight: 700, marginTop: 24, fontFamily: "serif" }}>
                  Solar Valley Renewable Energy Project
                </h2>
                <p style={{ color: "#4b5563", fontSize: 13, marginTop: 12, fontFamily: "serif" }}>
                  180 MW Solar Photovoltaic Facility
                </p>
                <p style={{ color: "#4b5563", fontSize: 13, fontFamily: "serif" }}>
                  Kern County, California
                </p>
              </div>

              {/* Key terms table */}
              <div style={{ marginTop: 32, border: "1px solid #d1d5db", fontSize: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
                  {["Senior Secured Term Loan", "Power Purchase Agreement", "Debt Service Coverage"].map((h) => (
                    <div key={h} style={{ background: "#1a3a5c", color: "#fff", padding: "8px 12px", fontWeight: 600, textAlign: "center", fontSize: 11 }}>
                      {h}
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid #d1d5db" }}>
                  <div style={{ padding: "8px 12px", textAlign: "center", color: "#111827", fontWeight: 700, fontSize: 13 }}>$250,000,000</div>
                  <div style={{ padding: "8px 12px", textAlign: "center", color: "#111827", fontWeight: 700, fontSize: 13, borderLeft: "1px solid #d1d5db", borderRight: "1px solid #d1d5db" }}>20-Year Fixed Price</div>
                  <div style={{ padding: "8px 12px", textAlign: "center", color: "#111827", fontWeight: 700, fontSize: 13 }}>1.45x Average (P50)</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid #e5e7eb" }}>
                  <div style={{ padding: "6px 12px", textAlign: "center", color: "#6b7280", fontSize: 11 }}>SOFR + 275 bps</div>
                  <div style={{ padding: "6px 12px", textAlign: "center", color: "#6b7280", fontSize: 11, borderLeft: "1px solid #e5e7eb", borderRight: "1px solid #e5e7eb" }}>Southern California Edison</div>
                  <div style={{ padding: "6px 12px", textAlign: "center", color: "#6b7280", fontSize: 11 }}>1.28x Minimum</div>
                </div>
              </div>

              <div style={{ marginTop: 40, color: "#374151", fontSize: 13 }}>
                <p style={{ fontWeight: 600, fontFamily: "serif" }}>Sponsored by</p>
                <p style={{ color: "#4b5563", fontFamily: "serif" }}>GreenHorizon Energy Partners</p>
                <p style={{ color: "#4b5563", fontFamily: "serif" }}>Denver, Colorado</p>
              </div>

              <div style={{ marginTop: 32, color: "#9ca3af", fontSize: 13, fontFamily: "serif" }}>January 2026</div>
            </div>
          </div>
        </div>

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
            {MOCK_TERMS.map((term) => {
              const isSelected = selectedTerm?.id === term.id;
              return (
                <button
                  key={term.id}
                  onClick={() => onSelectTerm(term)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "9px 16px",
                    textAlign: "left",
                    borderBottom: `1px solid ${ds.border}`,
                    background: isSelected ? ds.surfaceRaised : "transparent",
                    cursor: "pointer",
                    borderTop: "none",
                    borderRight: "none",
                    borderLeft: "none",
                    transition: "background 0.1s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: ds.blue }} />
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
                      {term.title}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: ds.fontMono,
                      fontSize: 13,
                      fontWeight: 500,
                      color: isSelected ? ds.text : ds.textDim,
                      flexShrink: 0,
                      marginLeft: 16,
                    }}
                  >
                    {term.value}
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
                <p style={{ fontFamily: ds.fontBody, fontSize: 13, color: ds.text }}>{selectedTerm.title}</p>
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
                  Credit_Agreement_Solar_Valley.pdf
                </p>
                <p style={{ fontFamily: ds.fontMono, fontSize: 11, color: ds.textMuted, marginTop: 2 }}>
                  Page {currentPage}, Section 2.1
                </p>
              </div>

              {/* Obligation mapping */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontFamily: ds.fontMono, fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textMuted, marginBottom: 4 }}>
                  Maps to Obligation
                </label>
                <p style={{ fontFamily: ds.fontMono, fontSize: 13, fontWeight: 500, color: ds.text }}>
                  {selectedTerm.title.includes("Covenant")
                    ? "FINANCIAL_COVENANT"
                    : selectedTerm.title.includes("Fee") ||
                        selectedTerm.title.includes("Payment")
                      ? "PAYMENT_OBLIGATION"
                      : "CONTRACT_TERM"}
                </p>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button
                  style={{
                    width: "100%",
                    padding: "8px 12px",
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
                  Confirm Term
                </button>
                <button
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: ds.radius,
                    fontFamily: ds.fontBody,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    background: "transparent",
                    color: ds.coral,
                    border: `1px solid rgba(224,112,96,0.38)`,
                    cursor: "pointer",
                  }}
                >
                  Flag for Review
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
          <FooterMeta label="Deal" value="DEAL_20260126_48f8e7cf" />
          <FooterMeta label="Facility" value="$250MM Sr. Secured Term" />
          <FooterMeta label="Terms" value={`${MOCK_TERMS.length} extracted`} valueColor={ds.green} />
          <FooterMeta label="Counterparty" value="Solar Valley Holdings" />
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

function CounterpartyStep() {
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
            { label: "COUNTERPARTY", value: "Meridian Precision Manufacturing, LLC" },
            { label: "TYPE", value: "BORROWER" },
            { label: "STATUS", value: "PROSPECT" },
            { label: "ID", value: "PCTR_CTR_20260305_843506c11a" },
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
              Prospect
            </span>
          </div>
          <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
            <div>
              {COUNTERPARTY_PROPERTIES_LEFT.map((prop) => (
                <PropertyRow key={prop.label} label={prop.label} value={prop.value} />
              ))}
            </div>
            <div>
              {COUNTERPARTY_PROPERTIES_RIGHT.map((prop) => (
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
          <FooterMeta label="Counterparty" value="Meridian Precision Mfg." />
          <FooterMeta label="Type" value="BORROWER" />
          <FooterMeta label="Status" value="PROSPECT" valueColor={ds.amber} />
          <FooterMeta label="KYC" value="Pending" valueColor={ds.textMuted} />
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

function DropdownChip({ label, dotColor }: { label: string; dotColor: string }) {
  return (
    <span
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
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: dotColor }} />
      {label}
      <ChevronDownIcon />
    </span>
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

function BuildingIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="9" y1="6" x2="9" y2="6.01" />
      <line x1="15" y1="6" x2="15" y2="6.01" />
      <line x1="9" y1="10" x2="9" y2="10.01" />
      <line x1="15" y1="10" x2="15" y2="10.01" />
      <line x1="9" y1="14" x2="9" y2="14.01" />
      <line x1="15" y1="14" x2="15" y2="14.01" />
      <path d="M9 18h6v4H9z" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function FitWidthIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
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

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
