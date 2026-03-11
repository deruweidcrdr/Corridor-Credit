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
  { number: 2, label: "Approval" },
];

/* ================================================================== */
/*  Mock extracted financial metrics                                   */
/* ================================================================== */
interface FinancialMetric {
  id: string;
  name: string;
  value: string;
}

const MOCK_METRICS: FinancialMetric[] = [
  { id: "1", name: "Revenue", value: "37,650,000" },
  { id: "2", name: "Gross Profit", value: "11,580,000" },
  { id: "3", name: "Long Term Debt", value: "3,280,000" },
  { id: "4", name: "Inventory", value: "3,765,000" },
  { id: "5", name: "Income Before Taxes", value: "4,702,000" },
  { id: "6", name: "Accounts Receivable", value: "5,270,000" },
  { id: "7", name: "Net Income", value: "3,526,000" },
  { id: "8", name: "Operating Expenses", value: "5,194,000" },
  { id: "9", name: "Depreciation & Amortization", value: "1,224,000" },
  { id: "10", name: "Total Assets", value: "19,919,000" },
  { id: "11", name: "Property, Plant & Equipment", value: "7,741,000" },
  { id: "12", name: "Operating Income", value: "5,162,000" },
  { id: "13", name: "Income Tax Expense", value: "1,176,000" },
  { id: "14", name: "Total Liabilities", value: "8,670,000" },
  { id: "15", name: "Total Current Assets", value: "11,513,000" },
  { id: "16", name: "Total Current Liabilities", value: "4,890,000" },
  { id: "17", name: "Shareholders' Equity", value: "11,249,000" },
  { id: "18", name: "Cost of Goods Sold", value: "26,070,000" },
  { id: "19", name: "Working Capital", value: "6,623,000" },
  { id: "20", name: "Current Ratio", value: "2.35x" },
];

/* ================================================================== */
/*  Root component                                                     */
/* ================================================================== */
export default function StatementAnalysisClient() {
  const [selectedMetric, setSelectedMetric] = useState<FinancialMetric | null>(
    MOCK_METRICS[0]
  );
  const [editValue, setEditValue] = useState(MOCK_METRICS[0].value);
  const [activeStep, setActiveStep] = useState(1);
  const [activeTab, setActiveTab] = useState<"historical" | "pro_forma">(
    "historical"
  );
  const [zoom, setZoom] = useState(88);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 11;

  function handleSelectMetric(metric: FinancialMetric) {
    setSelectedMetric(metric);
    setEditValue(metric.value);
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
        {/* ── Topbar / stage tabs ── */}
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
            selectedMetric={selectedMetric}
            editValue={editValue}
            onSelectMetric={handleSelectMetric}
            onEditValueChange={setEditValue}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            zoom={zoom}
            onZoomChange={setZoom}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalPages={totalPages}
          />
        )}
        {activeStep === 2 && <ComingSoon label="Approval" />}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  STEP 1 — Document                                                  */
/* ================================================================== */

function DocumentStep({
  selectedMetric,
  editValue,
  onSelectMetric,
  onEditValueChange,
  activeTab,
  onTabChange,
  zoom,
  onZoomChange,
  currentPage,
  onPageChange,
  totalPages,
}: {
  selectedMetric: FinancialMetric | null;
  editValue: string;
  onSelectMetric: (m: FinancialMetric) => void;
  onEditValueChange: (v: string) => void;
  activeTab: "historical" | "pro_forma";
  onTabChange: (t: "historical" | "pro_forma") => void;
  zoom: number;
  onZoomChange: (z: number) => void;
  currentPage: number;
  onPageChange: (p: number) => void;
  totalPages: number;
}) {
  return (
    <>
      {/* Row 2: Page title LEFT — Deal selector + Historical/Pro Forma tabs RIGHT */}
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
          Statement Analysis
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: ds.fontMono, fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textMuted }}>
              Deal to Process
            </span>
            <DropdownChip label="DEAL_20260222_49346d04" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: ds.fontMono, fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textMuted }}>
              Statement to Process
            </span>
            <DropdownChip label="Financial_Statements_Meridian_Precision.pdf" />
          </div>
          {/* Historical / Pro Forma tabs */}
          <div style={{ display: "flex", gap: 0, marginLeft: 4 }}>
            {(["historical", "pro_forma"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                style={{
                  padding: "6px 14px",
                  fontFamily: ds.fontBody,
                  fontSize: 12,
                  fontWeight: activeTab === tab ? 700 : 500,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: activeTab === tab ? ds.gold : ds.textMuted,
                  background: "transparent",
                  borderTop: "none",
                  borderRight: "none",
                  borderLeft: "none",
                  borderBottom: activeTab === tab ? `2px solid ${ds.gold}` : "2px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {tab === "historical" ? "Historical" : "Pro Forma"}
              </button>
            ))}
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
          { label: "STATEMENT", value: "FIN_20260305_001" },
          { label: "COUNTERPARTY", value: "Meridian Precision Mfg." },
          { label: "PERIOD", value: "FY 2023" },
          { label: "METRICS", value: `${MOCK_METRICS.length} extracted` },
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
          Validate Financial Statement →
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
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ color: "#111827", fontSize: 16, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "center", fontFamily: "serif" }}>
                  Financial Statements
                </h2>
                <p style={{ color: "#4b5563", fontSize: 13, marginTop: 16, fontWeight: 600, fontFamily: "serif" }}>
                  Historical and Projected
                </p>
                <p style={{ color: "#111827", fontSize: 13, marginTop: 24, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", fontFamily: "serif" }}>
                  Meridian Precision Manufacturing, LLC
                </p>
                <p style={{ color: "#2563eb", fontSize: 13, marginTop: 12, fontStyle: "italic", fontFamily: "serif" }}>
                  For the Fiscal Years Ended December 31
                </p>
              </div>

              {/* Period/Type/Basis table */}
              <div style={{ marginTop: 32, border: "1px solid #d1d5db", fontSize: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
                  {["Period", "Type", "Basis"].map((h) => (
                    <div key={h} style={{ background: "#1a3a5c", color: "#fff", padding: "8px 12px", fontWeight: 600, textAlign: "center", fontSize: 11 }}>
                      {h}
                    </div>
                  ))}
                </div>
                {[
                  { period: "FY 2022", type: "Historical", typeColor: ds.gold, basis: "Audited - Thompson & Associates, CPAs" },
                  { period: "FY 2023", type: "Historical", typeColor: ds.gold, basis: "Audited - Thompson & Associates, CPAs" },
                  { period: "FY 2024", type: "Historical", typeColor: ds.gold, basis: "Audited - Thompson & Associates, CPAs" },
                  { period: "FY 2025", type: "Projected", typeColor: ds.blue, basis: "Management Forecast" },
                  { period: "FY 2026", type: "Projected", typeColor: ds.blue, basis: "Management Forecast" },
                  { period: "FY 2027", type: "Projected", typeColor: ds.blue, basis: "Management Forecast" },
                ].map((row, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid #e5e7eb" }}>
                    <div style={{ padding: "6px 12px", textAlign: "center", color: "#374151", fontSize: 11 }}>{row.period}</div>
                    <div style={{ padding: "6px 12px", textAlign: "center", color: row.typeColor, fontSize: 11, fontWeight: 500 }}>{row.type}</div>
                    <div style={{ padding: "6px 12px", textAlign: "center", color: "#6b7280", fontSize: 11 }}>{row.basis}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE: Extracted metrics table */}
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
              Metric Name
            </span>
            <span style={{ fontFamily: ds.fontMono, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textDim }}>
              Financial Statement — FY 2023
            </span>
          </div>

          {/* Metric rows */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {MOCK_METRICS.map((metric) => {
              const isSelected = selectedMetric?.id === metric.id;
              return (
                <button
                  key={metric.id}
                  onClick={() => onSelectMetric(metric)}
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
                    border: "none",
                    borderBlockEnd: `1px solid ${ds.border}`,
                    transition: "background 0.1s",
                  }}
                >
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
                    {metric.name}
                  </span>
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
                    {metric.value}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Action & edit panel */}
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
            <GhostButtonSm label="Edit Financial Statement" />
          </div>

          {selectedMetric ? (
            <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
              {/* Metric name */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontFamily: ds.fontMono, fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textMuted, marginBottom: 4 }}>
                  Metric
                </label>
                <p style={{ fontFamily: ds.fontBody, fontSize: 13, color: ds.text }}>{selectedMetric.name}</p>
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

              {/* Period */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontFamily: ds.fontMono, fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textMuted, marginBottom: 4 }}>
                  Period
                </label>
                <p style={{ fontFamily: ds.fontMono, fontSize: 13, color: ds.textDim }}>FY 2023</p>
              </div>

              {/* Source */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontFamily: ds.fontMono, fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textMuted, marginBottom: 4 }}>
                  Source
                </label>
                <p style={{ fontFamily: ds.fontMono, fontSize: 12, color: ds.textDim }}>
                  Financial_Statements_Meridian_Precision.pdf
                </p>
                <p style={{ fontFamily: ds.fontMono, fontSize: 11, color: ds.textMuted, marginTop: 2 }}>
                  Page {currentPage}, extracted via LLM
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
                  Confirm Value
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
                Select a metric to edit
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
          <FooterMeta label="Statement" value="FIN_20260305_001" />
          <FooterMeta label="Period" value="FY 2023" />
          <FooterMeta label="Counterparty" value="Meridian Precision Mfg." />
          <FooterMeta label="Metrics" value={`${MOCK_METRICS.length} extracted`} valueColor={ds.green} />
        </div>
        <GhostButtonWarn label="Reject Statement" />
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

function DropdownChip({ label }: { label: string }) {
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
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: ds.green }} />
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

function DealSubheader({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      {items.map((item, i) => (
        <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {i > 0 && (
            <span
              style={{
                width: 1,
                height: 18,
                background: ds.borderAccent,
                margin: "0 14px",
                flexShrink: 0,
              }}
            />
          )}
          <span
            style={{
              fontFamily: ds.fontMono,
              fontSize: 10,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: ds.textMuted,
              marginRight: 6,
            }}
          >
            {item.label}
          </span>
          <span
            style={{
              fontFamily: ds.fontMono,
              fontSize: 13,
              fontWeight: 500,
              color: ds.text,
              letterSpacing: "0.02em",
            }}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  Icons                                                              */
/* ================================================================== */

function ChevronDownIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
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
