"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Sidebar from "@/app/components/sidebar";
import { METRIC_COLUMNS } from "./metric-columns";

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
};

/* ================================================================== */
/*  Workflow steps                                                     */
/* ================================================================== */
const STEPS = [
  { number: 1, label: "Document" },
  { number: 2, label: "Approval" },
];

/* ================================================================== */
/*  Interfaces                                                         */
/* ================================================================== */
interface StatementForValidation {
  id: string;
  document_id: string | null;
  document_name: string | null;
  statement_type: string | null;
  statement_title: string | null;
  period_end_date: string | null;
  period_end_year: number | null;
  period_end_month: string | null;
  counterparty_id: string | null;
  counterparty_name: string | null;
  validation_status: string | null;
  user_edited_columns: string[];
  storage_url: string | null;
  confidence: number | null;
  [key: string]: any;
}

interface ProFormaStatement {
  pro_forma_statement_id: string;
  document_id: string | null;
  document_name: string | null;
  statement_type: string | null;
  pro_forma_statement_title: string | null;
  period_end_year: number | null;
  period_type: string | null;
  scenario_type: string | null;
  counterparty_id: string | null;
  validation_status: string | null;
  storage_url: string | null;
  [key: string]: any;
}

interface DealInfo {
  deal_id: string;
  deal_name: string | null;
  counterparty_id: string | null;
  counterparty_name: string | null;
  historical_statements: StatementForValidation[];
  pro_forma_statements: ProFormaStatement[];
  [key: string]: any;
}

interface CounterpartyInfo {
  counterparty_id: string;
  counterparty_name: string | null;
  [key: string]: any;
}

interface MetricRow {
  column: string;
  label: string;
  category: string;
  value: number | null;
  isEdited: boolean;
}

/* ================================================================== */
/*  Root component                                                     */
/* ================================================================== */
export default function StatementAnalysisClient() {
  // Data state
  const [deals, setDeals] = useState<DealInfo[]>([]);
  const [counterparties, setCounterparties] = useState<Record<string, CounterpartyInfo>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection state
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [selectedStatementId, setSelectedStatementId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"historical" | "pro_forma">("historical");
  const [selectedMetricColumn, setSelectedMetricColumn] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // UI state
  const [activeStep, setActiveStep] = useState(1);

  // Mutation state
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [reverting, setReverting] = useState(false);
  const [validatedStatementIds, setValidatedStatementIds] = useState<Set<string>>(new Set());
  const [editedColumns, setEditedColumns] = useState<Set<string>>(new Set());

  // Derived data
  const selectedDeal = useMemo(
    () => deals.find((d) => d.deal_id === selectedDealId) ?? null,
    [deals, selectedDealId]
  );

  const statements = useMemo(() => {
    if (!selectedDeal) return [];
    return activeTab === "historical"
      ? selectedDeal.historical_statements
      : selectedDeal.pro_forma_statements;
  }, [selectedDeal, activeTab]);

  const selectedStatement = useMemo(() => {
    if (!selectedStatementId || !statements.length) return null;
    const idKey = activeTab === "historical"
      ? "id"
      : "pro_forma_statement_id";
    return statements.find((s: any) => s[idKey] === selectedStatementId) ?? null;
  }, [statements, selectedStatementId, activeTab]);

  const statementIdKey = activeTab === "historical"
    ? "id"
    : "pro_forma_statement_id";

  const metrics: MetricRow[] = useMemo(() => {
    if (!selectedStatement) return [];
    return METRIC_COLUMNS
      .filter((mc) => selectedStatement[mc.column] != null)
      .map((mc) => ({
        column: mc.column,
        label: mc.label,
        category: mc.category,
        value: selectedStatement[mc.column],
        isEdited: editedColumns.has(mc.column),
      }));
  }, [selectedStatement, editedColumns]);

  const selectedMetric = useMemo(
    () => metrics.find((m) => m.column === selectedMetricColumn) ?? null,
    [metrics, selectedMetricColumn]
  );

  const metricValueChanged = useMemo(() => {
    if (!selectedMetric) return false;
    const originalValue = selectedMetric.value?.toString() ?? "";
    return editValue !== originalValue;
  }, [editValue, selectedMetric]);

  const counterpartyName = useMemo(() => {
    const cpId = selectedDeal?.counterparty_id;
    if (!cpId) return selectedDeal?.counterparty_name ?? "";
    return counterparties[cpId]?.counterparty_name ?? selectedDeal?.counterparty_name ?? "";
  }, [selectedDeal, counterparties]);

  const periodLabel = useMemo(() => {
    if (!selectedStatement) return "";
    return selectedStatement.period_end_year ? `FY ${selectedStatement.period_end_year}` : "";
  }, [selectedStatement]);

  const isValidated = useMemo(() => {
    if (!selectedStatement) return false;
    return validatedStatementIds.has(selectedStatement[statementIdKey]);
  }, [selectedStatement, validatedStatementIds, statementIdKey]);

  // Fetch data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/statement-analysis");
        if (!res.ok) throw new Error("Failed to load data");
        const data = await res.json();
        setDeals(data.deals ?? []);
        setCounterparties(data.counterparties ?? {});

        // Initialize validated sets from existing data
        const vIds = new Set<string>();
        for (const deal of data.deals ?? []) {
          for (const s of deal.historical_statements ?? []) {
            if (s.validation_status === "VALIDATED") vIds.add(s.id);
          }
          for (const s of deal.pro_forma_statements ?? []) {
            if (s.validation_status === "VALIDATED") vIds.add(s.pro_forma_statement_id);
          }
        }
        if (vIds.size > 0) setValidatedStatementIds(vIds);

        // Auto-select first deal and statement
        if (data.deals?.length) {
          const firstDeal = data.deals[0];
          setSelectedDealId(firstDeal.deal_id);
          const hist = firstDeal.historical_statements ?? [];
          if (hist.length) {
            setSelectedStatementId(hist[0].id);
            setEditedColumns(new Set(hist[0].user_edited_columns ?? []));
            // Auto-select first metric with a value
            const firstMetric = METRIC_COLUMNS.find((mc) => hist[0][mc.column] != null);
            if (firstMetric) {
              setSelectedMetricColumn(firstMetric.column);
              setEditValue(hist[0][firstMetric.column]?.toString() ?? "");
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

  // Handlers
  const handleSelectDeal = useCallback(
    (dealId: string) => {
      setSelectedDealId(dealId);
      const deal = deals.find((d) => d.deal_id === dealId);
      const stmts = activeTab === "historical"
        ? (deal?.historical_statements ?? [])
        : (deal?.pro_forma_statements ?? []);
      const idKey = activeTab === "historical"
        ? "id"
        : "pro_forma_statement_id";
      if (stmts.length) {
        setSelectedStatementId(stmts[0][idKey]);
        setEditedColumns(new Set(stmts[0].user_edited_columns ?? []));
        const firstMetric = METRIC_COLUMNS.find((mc) => stmts[0][mc.column] != null);
        if (firstMetric) {
          setSelectedMetricColumn(firstMetric.column);
          setEditValue(stmts[0][firstMetric.column]?.toString() ?? "");
        } else {
          setSelectedMetricColumn(null);
          setEditValue("");
        }
      } else {
        setSelectedStatementId(null);
        setSelectedMetricColumn(null);
        setEditValue("");
        setEditedColumns(new Set());
      }
    },
    [deals, activeTab]
  );

  const handleTabChange = useCallback(
    (tab: "historical" | "pro_forma") => {
      setActiveTab(tab);
      const stmts = tab === "historical"
        ? (selectedDeal?.historical_statements ?? [])
        : (selectedDeal?.pro_forma_statements ?? []);
      const idKey = tab === "historical"
        ? "id"
        : "pro_forma_statement_id";
      if (stmts.length) {
        setSelectedStatementId(stmts[0][idKey]);
        setEditedColumns(new Set(stmts[0].user_edited_columns ?? []));
        const firstMetric = METRIC_COLUMNS.find((mc) => stmts[0][mc.column] != null);
        if (firstMetric) {
          setSelectedMetricColumn(firstMetric.column);
          setEditValue(stmts[0][firstMetric.column]?.toString() ?? "");
        } else {
          setSelectedMetricColumn(null);
          setEditValue("");
        }
      } else {
        setSelectedStatementId(null);
        setSelectedMetricColumn(null);
        setEditValue("");
        setEditedColumns(new Set());
      }
    },
    [selectedDeal]
  );

  const handleSelectStatement = useCallback(
    (stmtId: string) => {
      setSelectedStatementId(stmtId);
      const idKey = activeTab === "historical"
        ? "id"
        : "pro_forma_statement_id";
      const stmt = statements.find((s: any) => s[idKey] === stmtId);
      if (stmt) {
        setEditedColumns(new Set((stmt as any).user_edited_columns ?? []));
        const firstMetric = METRIC_COLUMNS.find((mc) => stmt[mc.column] != null);
        if (firstMetric) {
          setSelectedMetricColumn(firstMetric.column);
          setEditValue(stmt[firstMetric.column]?.toString() ?? "");
        } else {
          setSelectedMetricColumn(null);
          setEditValue("");
        }
      }
    },
    [statements, activeTab]
  );

  const handleSelectMetric = useCallback(
    (column: string) => {
      setSelectedMetricColumn(column);
      if (selectedStatement) {
        setEditValue(selectedStatement[column]?.toString() ?? "");
      }
    },
    [selectedStatement]
  );

  // Confirm metric value edit
  const handleConfirmEdit = useCallback(async () => {
    if (!selectedStatement || !selectedMetricColumn || !metricValueChanged || saving) return;
    if (activeTab !== "historical") return; // Only historical statements support editing
    setSaving(true);
    try {
      const res = await fetch("/api/statement-analysis/metrics", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedStatement.id,
          column_name: selectedMetricColumn,
          value: editValue,
        }),
      });
      if (res.ok) {
        // Optimistic update
        const numValue = editValue === "" ? null : Number(editValue);
        setDeals((prev) =>
          prev.map((deal) =>
            deal.deal_id === selectedDealId
              ? {
                  ...deal,
                  historical_statements: deal.historical_statements.map((s) =>
                    s.id === selectedStatement.id
                      ? { ...s, [selectedMetricColumn]: numValue }
                      : s
                  ),
                }
              : deal
          )
        );
        setEditedColumns((prev) => {
          const next = new Set(prev);
          next.add(selectedMetricColumn);
          return next;
        });
      }
    } finally {
      setSaving(false);
    }
  }, [selectedStatement, selectedMetricColumn, metricValueChanged, saving, editValue, selectedDealId, activeTab]);

  // Validate financial statement
  const handleValidate = useCallback(async () => {
    if (!selectedStatement || validating || activeTab !== "historical") return;
    setValidating(true);
    try {
      const res = await fetch("/api/statement-analysis/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedStatement.id,
          counterparty_id: selectedDeal?.counterparty_id,
        }),
      });
      if (res.ok) {
        setValidatedStatementIds((prev) => {
          const next = new Set(prev);
          next.add(selectedStatement.id);
          return next;
        });
      }
    } finally {
      setValidating(false);
    }
  }, [selectedStatement, validating, selectedDeal, activeTab]);

  // Revert validation
  const handleRevert = useCallback(async () => {
    if (!selectedStatement || reverting || activeTab !== "historical") return;
    setReverting(true);
    try {
      const res = await fetch("/api/statement-analysis/revert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedStatement.id,
        }),
      });
      if (res.ok) {
        setValidatedStatementIds((prev) => {
          const next = new Set(prev);
          next.delete(selectedStatement.id);
          return next;
        });
      }
    } finally {
      setReverting(false);
    }
  }, [selectedStatement, reverting, activeTab]);

  // Dropdown options
  const dealOptions = useMemo(
    () => deals.map((d) => ({ label: d.deal_id, value: d.deal_id })),
    [deals]
  );

  const statementOptions = useMemo(() => {
    return statements.map((s: any) => {
      const id = s[statementIdKey];
      let label: string;
      if (activeTab === "historical") {
        const docLabel = s.document_name?.replace(/\.pdf$/i, "").replace(/_/g, " ") ?? "";
        const yearLabel = s.period_end_year ? ` (FY ${s.period_end_year})` : "";
        label = docLabel + yearLabel || id;
      } else {
        label = [s.scenario_type, s.period_type, s.period_end_year ? `FY ${s.period_end_year}` : ""]
          .filter(Boolean).join(" — ") || id;
      }
      return { label, value: id };
    });
  }, [statements, statementIdKey, activeTab]);

  const statementLabel = useMemo(() => {
    if (!selectedStatement) return "";
    return selectedStatement.id
      ?? selectedStatement.pro_forma_statement_id
      ?? "";
  }, [selectedStatement]);

  const metricsCount = metrics.length;

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

        {/* ── Loading / Error / Empty states ── */}
        {loading && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: ds.fontBody, fontSize: 14, color: ds.textMuted }}>Loading statement data...</span>
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
                deals={deals}
                selectedDealId={selectedDealId}
                selectedStatementId={selectedStatementId}
                selectedDeal={selectedDeal}
                selectedStatement={selectedStatement}
                activeTab={activeTab}
                metrics={metrics}
                selectedMetricColumn={selectedMetricColumn}
                editValue={editValue}
                saving={saving}
                validating={validating}
                reverting={reverting}
                metricValueChanged={metricValueChanged}
                editedColumns={editedColumns}
                isValidated={isValidated}
                counterpartyName={counterpartyName}
                periodLabel={periodLabel}
                statementLabel={statementLabel}
                metricsCount={metricsCount}
                dealOptions={dealOptions}
                statementOptions={statementOptions}
                statementIdKey={statementIdKey}
                onSelectDeal={handleSelectDeal}
                onSelectStatement={handleSelectStatement}
                onTabChange={handleTabChange}
                onSelectMetric={handleSelectMetric}
                onEditValueChange={setEditValue}
                onConfirmEdit={handleConfirmEdit}
                onValidate={handleValidate}
                onRevert={handleRevert}
              />
            )}
            {activeStep === 2 && <ComingSoon label="Approval" />}
          </>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  STEP 1 — Document                                                  */
/* ================================================================== */

function DocumentStep({
  deals,
  selectedDealId,
  selectedStatementId,
  selectedDeal,
  selectedStatement,
  activeTab,
  metrics,
  selectedMetricColumn,
  editValue,
  saving,
  validating,
  reverting,
  metricValueChanged,
  editedColumns,
  isValidated,
  counterpartyName,
  periodLabel,
  statementLabel,
  metricsCount,
  dealOptions,
  statementOptions,
  statementIdKey,
  onSelectDeal,
  onSelectStatement,
  onTabChange,
  onSelectMetric,
  onEditValueChange,
  onConfirmEdit,
  onValidate,
  onRevert,
}: {
  deals: DealInfo[];
  selectedDealId: string | null;
  selectedStatementId: string | null;
  selectedDeal: DealInfo | null;
  selectedStatement: any;
  activeTab: "historical" | "pro_forma";
  metrics: MetricRow[];
  selectedMetricColumn: string | null;
  editValue: string;
  saving: boolean;
  validating: boolean;
  reverting: boolean;
  metricValueChanged: boolean;
  editedColumns: Set<string>;
  isValidated: boolean;
  counterpartyName: string;
  periodLabel: string;
  statementLabel: string;
  metricsCount: number;
  dealOptions: { label: string; value: string }[];
  statementOptions: { label: string; value: string }[];
  statementIdKey: string;
  onSelectDeal: (id: string) => void;
  onSelectStatement: (id: string) => void;
  onTabChange: (t: "historical" | "pro_forma") => void;
  onSelectMetric: (column: string) => void;
  onEditValueChange: (v: string) => void;
  onConfirmEdit: () => void;
  onValidate: () => void;
  onRevert: () => void;
}) {
  const documentName = selectedStatement?.document_name ?? null;
  const selectedMetric = metrics.find((m) => m.column === selectedMetricColumn) ?? null;

  return (
    <>
      {/* Row 2: Title LEFT — Deal dropdown, Tabs, Statement dropdown RIGHT */}
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
          {/* Deal dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: ds.fontMono, fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textMuted }}>
              Deal to Process
            </span>
            <DropdownChip
              label={selectedDealId ?? ""}
              dotColor={ds.green}
              options={dealOptions}
              selectedValue={selectedDealId}
              onSelect={onSelectDeal}
            />
          </div>

          {/* Historical / Pro Forma tabs */}
          <div style={{ display: "flex", gap: 0 }}>
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

          {/* Statement dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: ds.fontMono, fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textMuted }}>
              {activeTab === "historical" ? "Statement to Process" : "Pro Forma to Process"}
            </span>
            <DropdownChip
              label={statementOptions.find((o) => o.value === selectedStatementId)?.label ?? "None"}
              dotColor={ds.green}
              options={statementOptions}
              selectedValue={selectedStatementId}
              onSelect={onSelectStatement}
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
          { label: "STATEMENT", value: statementLabel },
          { label: "COUNTERPARTY", value: counterpartyName },
          { label: "PERIOD", value: periodLabel },
          { label: "METRICS", value: `${metricsCount} extracted` },
        ]} />

        {/* Validate / Validated+Revert button group */}
        {activeTab === "historical" && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: 20, flexShrink: 0 }}>
            {isValidated ? (
              <>
                <button
                  disabled
                  style={{
                    padding: "7px 14px",
                    borderRadius: ds.radius,
                    fontFamily: ds.fontBody,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    background: ds.green,
                    color: "#0d1017",
                    border: "none",
                    cursor: "default",
                    whiteSpace: "nowrap",
                  }}
                >
                  ✓ Statement Validated
                </button>
                <button
                  onClick={onRevert}
                  disabled={reverting}
                  style={{
                    padding: "7px 14px",
                    borderRadius: ds.radius,
                    fontFamily: ds.fontBody,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    background: "transparent",
                    color: ds.coral,
                    border: `1px solid ${ds.coral}`,
                    cursor: reverting ? "not-allowed" : "pointer",
                    whiteSpace: "nowrap",
                    opacity: reverting ? 0.6 : 1,
                  }}
                >
                  {reverting ? "Reverting..." : "Revert"}
                </button>
              </>
            ) : (
              <button
                onClick={onValidate}
                disabled={validating || metricsCount === 0}
                style={{
                  padding: "7px 14px",
                  borderRadius: ds.radius,
                  fontFamily: ds.fontBody,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  background: metricsCount === 0 ? ds.goldDim : ds.gold,
                  color: metricsCount === 0 ? ds.textMuted : "#18140a",
                  border: "none",
                  cursor: validating || metricsCount === 0 ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap",
                  opacity: validating ? 0.6 : 1,
                }}
              >
                {validating ? "Validating..." : "Validate Financial Statement →"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Three-panel content */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* LEFT: PDF Viewer */}
        <PdfPanel
          storageUrl={selectedStatement?.storage_url ?? null}
          documentName={documentName}
        />

        {/* MIDDLE: Extracted metrics table */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: `1px solid ${ds.border}`, minWidth: 0 }}>
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
              Financial Statement — {periodLabel}
            </span>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {metrics.length === 0 && (
              <div style={{ padding: 32, textAlign: "center", color: ds.textMuted, fontFamily: ds.fontSerif, fontStyle: "italic" }}>
                No metrics extracted for this statement
              </div>
            )}
            {metrics.map((metric) => {
              const isSelected = selectedMetricColumn === metric.column;
              return (
                <button
                  key={metric.column}
                  onClick={() => onSelectMetric(metric.column)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "9px 16px",
                    textAlign: "left",
                    background: isSelected ? ds.surfaceRaised : "transparent",
                    cursor: "pointer",
                    border: "none",
                    borderBottom: `1px solid ${ds.border}`,
                    transition: "background 0.1s",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {/* Edited indicator dot */}
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: metric.isEdited ? ds.green : ds.blue,
                        flexShrink: 0,
                      }}
                    />
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
                      {metric.label}
                    </span>
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
                    {formatNumber(metric.value)}
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
            <GhostButtonSm label="Edit Terms" />
          </div>

          {selectedMetric ? (
            <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontFamily: ds.fontMono, fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textMuted, marginBottom: 4 }}>
                  Metric
                </label>
                <p style={{ fontFamily: ds.fontBody, fontSize: 13, color: ds.text }}>{selectedMetric.label}</p>
              </div>

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

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontFamily: ds.fontMono, fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textMuted, marginBottom: 4 }}>
                  Period
                </label>
                <p style={{ fontFamily: ds.fontMono, fontSize: 13, color: ds.textDim }}>{periodLabel}</p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontFamily: ds.fontMono, fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textMuted, marginBottom: 4 }}>
                  Source Document
                </label>
                <p style={{ fontFamily: ds.fontMono, fontSize: 12, color: ds.textDim }}>
                  {documentName ?? "Unknown source"}
                </p>
              </div>

              {/* Status */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontFamily: ds.fontMono, fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textMuted, marginBottom: 4 }}>
                  Status
                </label>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: ds.fontMono, fontSize: 12, fontWeight: 600 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: selectedMetric.isEdited ? ds.green : ds.blue }} />
                  <span style={{ color: selectedMetric.isEdited ? ds.green : ds.amber }}>
                    {selectedMetric.isEdited ? "EDITED" : "PENDING"}
                  </span>
                </span>
              </div>

              {/* Action buttons */}
              {activeTab === "historical" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button
                    onClick={onConfirmEdit}
                    disabled={!metricValueChanged || saving}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: ds.radius,
                      fontFamily: ds.fontBody,
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      background: !metricValueChanged ? ds.goldDim : ds.gold,
                      color: !metricValueChanged ? ds.textMuted : "#18140a",
                      border: "none",
                      cursor: !metricValueChanged || saving ? "not-allowed" : "pointer",
                      opacity: saving ? 0.6 : 1,
                    }}
                  >
                    {saving ? "Saving..." : "Confirm Value Edit"}
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
              )}
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
          <FooterMeta label="Statement" value={statementLabel} />
          <FooterMeta label="Period" value={periodLabel} />
          <FooterMeta label="Counterparty" value={counterpartyName} />
          <FooterMeta label="Metrics" value={`${metricsCount} extracted`} valueColor={ds.green} />
        </div>
        <GhostButtonWarn label="Reject Statement" />
      </div>
    </>
  );
}

/* ================================================================== */
/*  PDF Panel                                                          */
/* ================================================================== */

function PdfPanel({
  storageUrl,
  documentName,
}: {
  storageUrl: string | null;
  documentName: string | null;
}) {
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!storageUrl) {
      setPdfBlobUrl(null);
      return;
    }
    let revoked = false;
    setPdfLoading(true);
    fetch(storageUrl)
      .then((r) => r.blob())
      .then((blob) => {
        if (revoked) return;
        const pdfBlob = new Blob([blob], { type: "application/pdf" });
        setPdfBlobUrl(URL.createObjectURL(pdfBlob));
      })
      .catch(() => {})
      .finally(() => {
        if (!revoked) setPdfLoading(false);
      });
    return () => {
      revoked = true;
      setPdfBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [storageUrl]);

  return (
    <div style={{ width: "45%", flexShrink: 0, display: "flex", flexDirection: "column", borderRight: `1px solid ${ds.border}` }}>
      {/* Toolbar */}
      <div
        style={{
          padding: "6px 12px",
          borderBottom: `1px solid ${ds.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: ds.fontMono,
          fontSize: 12,
          color: ds.textDim,
          minHeight: 34,
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {documentName ?? "(no document)"}
        </span>
        {pdfBlobUrl && (
          <button
            onClick={() => {
              if (iframeRef.current) {
                const el = iframeRef.current as any;
                if (el.requestFullscreen) el.requestFullscreen();
              }
            }}
            style={{
              padding: "2px 6px",
              borderRadius: 4,
              background: "transparent",
              border: `1px solid ${ds.border}`,
              color: ds.textMuted,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <FullscreenIcon />
          </button>
        )}
      </div>

      {/* Content */}
      {pdfLoading && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: ds.textMuted }}>
          Loading document...
        </div>
      )}
      {!pdfLoading && pdfBlobUrl && (
        <iframe
          ref={iframeRef}
          src={pdfBlobUrl}
          style={{ flex: 1, border: "none", background: "#fff" }}
          title={documentName ?? "Document preview"}
        />
      )}
      {!pdfLoading && !pdfBlobUrl && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: ds.textMuted, fontFamily: ds.fontSerif, fontStyle: "italic" }}>
          No document available for preview
        </div>
      )}
    </div>
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

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
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
          maxWidth: 320,
        }}
      >
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
        <ChevronDownIcon />
      </button>
      {open && options.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: 4,
            background: ds.surfaceRaised,
            border: `1px solid ${ds.borderAccent}`,
            borderRadius: ds.radius,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            zIndex: 100,
            minWidth: 220,
            maxWidth: 420,
            maxHeight: 260,
            overflowY: "auto",
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
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
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
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
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
            <span style={{ width: 1, height: 18, background: ds.borderAccent, margin: "0 14px", flexShrink: 0 }} />
          )}
          <span style={{ fontFamily: ds.fontMono, fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textMuted, marginRight: 6 }}>
            {item.label}
          </span>
          <span style={{ fontFamily: ds.fontMono, fontSize: 13, fontWeight: 500, color: ds.text, letterSpacing: "0.02em" }}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function formatNumber(value: number | null): string {
  if (value == null) return "—";
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
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

function FullscreenIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  );
}
