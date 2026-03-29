"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
} from "recharts";

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
  { number: 1, label: "Obligation Term Structure" },
  { number: 2, label: "Projections" },
  { number: 3, label: "Collateral" },
  { number: 4, label: "Approval" },
];

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */
interface ObligationPayment {
  id: string;
  paymentNumber: number;
  paymentDueDate: string;
  scheduledPrincipal: number;
  scheduledInterest: number;
  scheduledTotalPayment: number;
  remainingBalance: number;
  paymentStatus?: string;
  validationStatus?: string;
}

interface ObligationProperties {
  obligationId: string;
  obligationType: string;
  obligationSubtype?: string;
  contractId: string;
  obligationName?: string;
  principalAmount: number;
  interestRateIndex: string;
  interestRateSpread: number;
  amortizationType: string;
  paymentFrequency: string;
  originationDate: string;
  maturityDate: string;
  nextDueDate?: string;
  totalPayments: number;
  thresholdValue?: number;
  isKeyObligation?: boolean;
  validationStatus?: string;
}

interface ContractData {
  contract_for_validation_id: string;
  contract_title?: string;
  contract_type?: string;
  contract_status?: string;
  document_id?: string;
  document_name?: string;
  counterparty_id?: string;
  obligations: any[];
  paymentSchedule: any[];
  obligationProperties: ObligationProperties | null;
}

interface DealData {
  deal_id: string;
  counterparty_id?: string;
  counterparty_name?: string;
  deal_name?: string;
  contracts: ContractData[];
}

/* ================================================================== */
/*  Profile property builders (from live Supabase data)                 */
/* ================================================================== */

function deriveMaturityLabel(category: string | undefined): string {
  if (!category) return "—";
  const c = category.toLowerCase();
  if (c.includes("growth") || c.includes("high")) return "GROWTH";
  if (c.includes("mature") || c.includes("stable")) return "MATURE";
  if (c.includes("decline") || c.includes("distress")) return "DECLINE";
  if (c.includes("startup") || c.includes("early")) return "STARTUP";
  return category.toUpperCase();
}

function deriveMarketOrientation(b2b?: number, b2c?: number): string {
  if (b2b == null && b2c == null) return "—";
  const b2bPct = b2b ?? 0;
  const b2cPct = b2c ?? 0;
  if (b2bPct >= 80) return "B2B";
  if (b2cPct >= 80) return "B2C";
  return "B2B / B2C";
}

function deriveRevenueCharacteristics(method?: string, relationship?: string): string {
  if (!method && !relationship) return "—";
  const parts = [method, relationship].filter(Boolean);
  return parts.join(" / ") || "—";
}

function deriveCapitalization(leverage?: number): string {
  if (leverage == null) return "—";
  if (leverage < 2) return "HIGH";
  if (leverage <= 4) return "MODERATE";
  return "LOW";
}

function formatLeverage(leverage?: number): string {
  if (leverage == null) return "—";
  const low = Math.max(leverage - 0.5, 0).toFixed(1);
  const high = (leverage + 0.5).toFixed(1);
  return `${low}x – ${high}x`;
}

function deriveCommodityRisk(cantillonLayer?: string, industry?: string): string {
  if (cantillonLayer) return cantillonLayer;
  if (!industry) return "—";
  const ind = industry.toLowerCase();
  if (ind.includes("manufacturing") || ind.includes("mining")) return "MODERATE (Metals / Raw Materials)";
  if (ind.includes("energy") || ind.includes("oil")) return "HIGH (Energy / Commodities)";
  if (ind.includes("tech") || ind.includes("software")) return "LOW";
  return "MODERATE";
}

function deriveFixedChargeExposure(fixedPct?: number): string {
  if (fixedPct == null) return "—";
  if (fixedPct >= 80) return "STRONG";
  if (fixedPct >= 50) return "ADEQUATE";
  return "WEAK";
}

function deriveWorkingCapitalIntensity(profile: any): string {
  const daysAr = profile?.working_capital_days_ar;
  const daysInv = profile?.working_capital_days_inventory;
  const daysAp = profile?.working_capital_days_ap;
  if (daysAr == null && daysInv == null && daysAp == null) return "—";
  const cycle = (daysAr ?? 0) + (daysInv ?? 0) - (daysAp ?? 0);
  if (cycle > 60) return "HIGH";
  if (cycle > 30) return "MODERATE";
  return "LOW";
}

function buildProfilePropertiesLeft(assignment: any, profile: any): { label: string; value: string }[] {
  const industrySector = assignment?.industry_sector_label ?? "";
  const profileName = profile?.profile_name ?? "";
  const industryDisplay = industrySector && profileName
    ? `${industrySector} — ${profileName}`
    : industrySector || profileName || "—";

  const revBucket = assignment?.revenue_size_bucket ?? "";
  const annualRev = assignment?.annual_revenue;
  const scaleDisplay = annualRev
    ? `${revBucket} ($${(annualRev / 1_000_000).toFixed(0)}M Rev)`
    : revBucket || "—";

  return [
    { label: "Profile ID", value: assignment?.effective_profile_id ?? "—" },
    { label: "Industry", value: industryDisplay },
    { label: "NAICS Code", value: assignment?.resolved_industry_code ?? "—" },
    { label: "Scale", value: scaleDisplay },
    { label: "Maturity Stage", value: deriveMaturityLabel(assignment?.logical_profile_category) },
    { label: "Market Orientation", value: deriveMarketOrientation(profile?.b2b_percentage, profile?.b2c_percentage) },
    { label: "Revenue Characteristics", value: deriveRevenueCharacteristics(profile?.revenue_method, profile?.revenue_relationship_type) },
  ];
}

function buildProfilePropertiesRight(assignment: any, profile: any): { label: string; value: string }[] {
  return [
    { label: "Typical Leverage", value: formatLeverage(profile?.debt_target_leverage_ratio) },
    { label: "Capitalization", value: deriveCapitalization(profile?.debt_target_leverage_ratio) },
    { label: "Commodity Risk Exposure", value: deriveCommodityRisk(profile?.cantillon_cost_layer, profile?.industry) },
    { label: "Fixed Charge Exposure", value: deriveFixedChargeExposure(profile?.interest_rate_fixed_exposure_percentage) },
    { label: "Working Capital Intensity", value: deriveWorkingCapitalIntensity(profile) },
    { label: "Revenue Cyclicality", value: (assignment?.volatility_label ?? "—").toUpperCase() },
    { label: "Assignment Confidence", value: assignment?.confidence_score != null ? Number(assignment.confidence_score).toFixed(2) : "—" },
  ];
}

/* ================================================================== */
/*  Mock DSCR corridor projection data (Step 2 — not wired yet)        */
/* ================================================================== */
interface CorridorDataPoint {
  period: string;
  month: number;
  dscrBase: number;
  dscrUpper: number;
  dscrLower: number;
  corridor: [number, number];
}

function generateCorridorData(): CorridorDataPoint[] {
  const data: CorridorDataPoint[] = [];
  const months = [
    "Jul 2026", "Aug 2026", "Sep 2026", "Oct 2026", "Nov 2026", "Dec 2026",
    "Jan 2027", "Feb 2027", "Mar 2027", "Apr 2027", "May 2027", "Jun 2027",
    "Jul 2027", "Aug 2027", "Sep 2027", "Oct 2027", "Nov 2027", "Dec 2027",
    "Jan 2028", "Feb 2028", "Mar 2028", "Apr 2028", "May 2028", "Jun 2028",
    "Jul 2028", "Aug 2028", "Sep 2028", "Oct 2028", "Nov 2028", "Dec 2028",
    "Jan 2029", "Feb 2029", "Mar 2029", "Apr 2029", "May 2029", "Jun 2029",
  ];

  const baseDscr = [
    1.48, 1.46, 1.44, 1.45, 1.43, 1.41,
    1.38, 1.35, 1.31, 1.27, 1.24, 1.18,
    1.14, 1.11, 1.08, 1.12, 1.16, 1.21,
    1.25, 1.28, 1.31, 1.34, 1.37, 1.39,
    1.41, 1.43, 1.44, 1.46, 1.47, 1.48,
    1.49, 1.50, 1.51, 1.50, 1.52, 1.53,
  ];

  const corridorWidth = [
    0.08, 0.08, 0.09, 0.09, 0.10, 0.11,
    0.12, 0.14, 0.16, 0.18, 0.20, 0.23,
    0.26, 0.28, 0.29, 0.27, 0.25, 0.22,
    0.20, 0.18, 0.17, 0.16, 0.15, 0.15,
    0.14, 0.14, 0.14, 0.14, 0.13, 0.13,
    0.13, 0.13, 0.13, 0.13, 0.12, 0.12,
  ];

  for (let i = 0; i < 36; i++) {
    const base = baseDscr[i];
    const width = corridorWidth[i];
    const upper = +(base + width).toFixed(2);
    const lower = +(base - width).toFixed(2);
    data.push({
      period: months[i],
      month: i + 1,
      dscrBase: base,
      dscrUpper: upper,
      dscrLower: lower,
      corridor: [lower, upper],
    });
  }
  return data;
}

const CORRIDOR_DATA = generateCorridorData();

const TEMPORAL_MIN = CORRIDOR_DATA.reduce(
  (min, d) => (d.dscrBase < min.dscrBase ? d : min),
  CORRIDOR_DATA[0]
);

// ---------------------------------------------------------------------------
// Build chart data from real projection output (wide-format row)
// ---------------------------------------------------------------------------
const QUARTER_LABELS = [
  "Y1 Q1", "Y1 Q2", "Y1 Q3", "Y1 Q4",
  "Y2 Q1", "Y2 Q2", "Y2 Q3", "Y2 Q4",
  "Y3 Q1", "Y3 Q2", "Y3 Q3", "Y3 Q4",
];

interface ProjectionChartPoint {
  period: string;
  dscrCorridor: number | null;
  dscrTotal: number | null;
  dscrPariPassu: number | null;
}

function buildProjectionChartData(projData: any): ProjectionChartPoint[] {
  const points: ProjectionChartPoint[] = [];
  for (let y = 1; y <= 3; y++) {
    for (let q = 1; q <= 4; q++) {
      const corridor = projData?.[`dscr_corridor_y${y}_q${q}`] ?? null;
      const total = projData?.[`dscr_total_y${y}_q${q}`] ?? null;
      const pariPassu = projData?.[`dscr_pari_passu_y${y}_q${q}`] ?? null;
      points.push({
        period: `Y${y} Q${q}`,
        dscrCorridor: corridor != null ? +corridor : null,
        dscrTotal: total != null ? +total : null,
        dscrPariPassu: pariPassu != null ? +pariPassu : null,
      });
    }
  }
  return points;
}

function getClassificationChip(classification: string | null | undefined) {
  if (!classification) return null;
  const c = classification.toUpperCase();
  if (c.includes("PASS") || c.includes("SAT") || c === "INVESTMENT_GRADE" || c === "STRONG" || c === "ADEQUATE") {
    return { label: classification, bg: ds.satBg, color: ds.satColor, border: ds.satBorder };
  }
  if (c.includes("WATCH") || c.includes("WARN") || c === "MARGINAL" || c === "NEAR_COVENANT") {
    return { label: classification, bg: ds.pwBg, color: ds.pwColor, border: ds.pwBorder };
  }
  if (c.includes("FAIL") || c.includes("BREACH") || c === "SUBSTANDARD" || c === "CRITICAL") {
    return { label: classification, bg: ds.wdwBg, color: ds.wdwColor, border: ds.wdwBorder };
  }
  return { label: classification, bg: ds.pwBg, color: ds.pwColor, border: ds.pwBorder };
}

/* ================================================================== */
/*  Root component                                                     */
/* ================================================================== */
export default function ProjectionsClient() {
  const [activeStep, setActiveStep] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<ObligationPayment | null>(null);

  // Data fetching state
  const [deals, setDeals] = useState<DealData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  // Profile assignment state
  const [profileAssignments, setProfileAssignments] = useState<Record<string, any>>({});
  const [profileDetails, setProfileDetails] = useState<Record<string, any>>({});
  const [allProfiles, setAllProfiles] = useState<any[]>([]);

  // Projection output state
  const [projectionData, setProjectionData] = useState<Record<string, any>>({});
  const [projectionSummary, setProjectionSummary] = useState<Record<string, any>>({});

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/projections");
      const json = await res.json();
      const fetchedDeals: DealData[] = json.deals ?? [];
      setDeals(fetchedDeals);
      setProfileAssignments(json.profileAssignments ?? {});
      setProfileDetails(json.profileDetails ?? {});
      setAllProfiles(json.allProfiles ?? []);
      setProjectionData(json.projectionData ?? {});
      setProjectionSummary(json.projectionSummary ?? {});

      // Auto-select first deal with contracts
      if (fetchedDeals.length > 0 && !selectedDealId) {
        const firstWithContracts = fetchedDeals.find((d) => d.contracts.length > 0) ?? fetchedDeals[0];
        setSelectedDealId(firstWithContracts.deal_id);
        if (firstWithContracts.contracts.length > 0) {
          setSelectedContractId(firstWithContracts.contracts[0].contract_for_validation_id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch projections data:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDealId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const selectedDeal = deals.find((d) => d.deal_id === selectedDealId) ?? null;
  const selectedContract = selectedDeal?.contracts.find(
    (c) => c.contract_for_validation_id === selectedContractId
  ) ?? null;

  // Map payment schedule to ObligationPayment shape
  const payments: ObligationPayment[] = (selectedContract?.paymentSchedule ?? []).map((row: any) => ({
    id: row.obligation_event_id,
    paymentNumber: row.payment_number,
    paymentDueDate: row.payment_due_date,
    scheduledPrincipal: row.scheduled_principal ?? 0,
    scheduledInterest: row.scheduled_interest ?? 0,
    scheduledTotalPayment: row.scheduled_total_payment ?? 0,
    remainingBalance: row.outstanding_principal_ending ?? 0,
    paymentStatus: row.payment_status,
    validationStatus: row.validation_status,
  }));

  const oblProps = selectedContract?.obligationProperties ?? null;

  // Build obligation properties arrays for the 2-column layout
  const obligationPropsLeft: { label: string; value: string }[] = oblProps
    ? [
        { label: "Obligation ID", value: oblProps.obligationId ?? "—" },
        { label: "Obligation Type", value: oblProps.obligationType ?? "—" },
        { label: "Contract ID", value: oblProps.contractId ?? "—" },
        { label: "Principal Amount", value: oblProps.principalAmount ? formatCurrency(oblProps.principalAmount) : "—" },
        { label: "Interest Rate Index", value: oblProps.interestRateIndex ?? "—" },
        { label: "Interest Rate Spread", value: oblProps.interestRateSpread ? `${oblProps.interestRateSpread} bps` : "—" },
        { label: "Amortization Type", value: oblProps.amortizationType ?? "—" },
      ]
    : [];

  const obligationPropsRight: { label: string; value: string }[] = oblProps
    ? [
        { label: "Payment Frequency", value: oblProps.paymentFrequency ?? "—" },
        { label: "Origination Date", value: oblProps.originationDate ?? "—" },
        { label: "Maturity Date", value: oblProps.maturityDate ?? "—" },
        { label: "Total Payments", value: oblProps.totalPayments ? String(oblProps.totalPayments) : "—" },
        { label: "Next Due Date", value: oblProps.nextDueDate ?? "—" },
        { label: "Key Obligation", value: oblProps.isKeyObligation ? "YES" : "NO" },
        { label: "Validation Status", value: oblProps.validationStatus ?? "PENDING" },
      ]
    : [];

  // Determine if obligations are pending (pipeline in progress)
  const hasContracts = (selectedDeal?.contracts.length ?? 0) > 0;
  const hasPaymentSchedule = payments.length > 0;
  const hasObligations = (selectedContract?.obligations?.length ?? 0) > 0;
  const obligationsPending = hasContracts && !hasPaymentSchedule && !hasObligations;

  // Auto-poll when obligations are pending (pipeline may be running)
  useEffect(() => {
    if (!obligationsPending) return;
    const interval = setInterval(() => {
      fetchData();
    }, 15000);
    return () => clearInterval(interval);
  }, [obligationsPending, fetchData]);

  const handleValidateObligations = async () => {
    if (!selectedContract) return;
    const ids = selectedContract.obligations.map((o: any) => o.obligation_for_validation_id);
    if (ids.length === 0) return;
    setValidating(true);
    try {
      await fetch("/api/projections/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ obligation_for_validation_ids: ids }),
      });
      await fetchData();
    } catch (err) {
      console.error("Validate obligations failed:", err);
    } finally {
      setValidating(false);
    }
  };

  const handleRevertObligations = async () => {
    if (!selectedContract) return;
    const ids = selectedContract.obligations.map((o: any) => o.obligation_for_validation_id);
    if (ids.length === 0) return;
    setValidating(true);
    try {
      await fetch("/api/projections/revert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ obligation_for_validation_ids: ids }),
      });
      await fetchData();
    } catch (err) {
      console.error("Revert obligations failed:", err);
    } finally {
      setValidating(false);
    }
  };

  const handleValidateTermStructure = async () => {
    if (!selectedContract) return;
    setValidating(true);
    try {
      await fetch("/api/projections/validate-term-structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contract_for_validation_id: selectedContract.contract_for_validation_id }),
      });
      await fetchData();
    } catch (err) {
      console.error("Validate term structure failed:", err);
    } finally {
      setValidating(false);
    }
  };

  const handleRevertTermStructure = async () => {
    if (!selectedContract) return;
    setValidating(true);
    try {
      await fetch("/api/projections/revert-term-structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contract_for_validation_id: selectedContract.contract_for_validation_id }),
      });
      await fetchData();
    } catch (err) {
      console.error("Revert term structure failed:", err);
    } finally {
      setValidating(false);
    }
  };

  // Check validation states
  const allObligationsValidated = selectedContract?.obligations?.length
    ? selectedContract.obligations.every((o: any) => o.validation_status === "VALIDATED")
    : false;
  const allTermStructureValidated = payments.length > 0
    ? payments.every((p) => p.validationStatus === "VALIDATED")
    : false;

  return (
    <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", height: "100%", background: ds.bg, color: ds.text, fontFamily: ds.fontBody, fontSize: 13 }}>
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
          loading ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: ds.fontMono, fontSize: 13, color: ds.textMuted }}>Loading obligation data...</span>
            </div>
          ) : !selectedDeal || !selectedContract ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
              <span style={{ fontFamily: ds.fontSerif, fontSize: 18, fontStyle: "italic", color: ds.textMuted }}>
                {deals.length === 0 ? "No deals found" : "Select a deal with contracts"}
              </span>
            </div>
          ) : obligationsPending ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: ds.amberDim,
                  border: `1px solid ${ds.pwBorder}`,
                  borderRadius: ds.radius,
                  padding: "10px 20px",
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: ds.amber }} />
                <span style={{ fontFamily: ds.fontMono, fontSize: 12, color: ds.amber }}>
                  Pipeline in progress
                </span>
              </div>
              <span style={{ fontFamily: ds.fontSerif, fontSize: 18, fontStyle: "italic", color: ds.textMuted }}>
                Obligation extraction in progress — data will appear automatically
              </span>
              <span style={{ fontFamily: ds.fontMono, fontSize: 11, color: ds.textMuted }}>
                Auto-refreshing every 15 seconds
              </span>
              <GhostButton label="Refresh Now" onClick={() => fetchData()} />
            </div>
          ) : (
            <ObligationTermStructureStep
              payments={payments}
              oblProps={oblProps}
              obligationPropsLeft={obligationPropsLeft}
              obligationPropsRight={obligationPropsRight}
              selectedPayment={selectedPayment}
              onSelectPayment={setSelectedPayment}
              selectedDeal={selectedDeal}
              selectedContract={selectedContract}
              allObligationsValidated={allObligationsValidated}
              allTermStructureValidated={allTermStructureValidated}
              validating={validating}
              onValidateObligations={handleValidateObligations}
              onRevertObligations={handleRevertObligations}
              onValidateTermStructure={handleValidateTermStructure}
              onRevertTermStructure={handleRevertTermStructure}
              deals={deals}
              selectedDealId={selectedDealId}
              selectedContractId={selectedContractId}
              onDealChange={(dealId: string) => {
                setSelectedDealId(dealId);
                const deal = deals.find((d) => d.deal_id === dealId);
                if (deal?.contracts.length) {
                  setSelectedContractId(deal.contracts[0].contract_for_validation_id);
                } else {
                  setSelectedContractId(null);
                }
                setSelectedPayment(null);
              }}
              onContractChange={(contractId: string) => {
                setSelectedContractId(contractId);
                setSelectedPayment(null);
              }}
            />
          )
        )}
        {activeStep === 2 && (
          <ProjectionsStep
            counterpartyId={selectedDeal?.counterparty_id}
            counterpartyName={selectedDeal?.counterparty_name}
            dealId={selectedDeal?.deal_id}
            profileAssignments={profileAssignments}
            profileDetails={profileDetails}
            allProfiles={allProfiles}
            projectionData={selectedDeal?.counterparty_id ? projectionData[selectedDeal.counterparty_id] ?? null : null}
            projectionSummary={selectedDeal?.counterparty_id ? projectionSummary[selectedDeal.counterparty_id] ?? null : null}
            onProfileUpdate={(updatedAssignment: any) => {
              setProfileAssignments((prev) => ({
                ...prev,
                [updatedAssignment.counterparty_id]: updatedAssignment,
              }));
            }}
            onProfileDetailUpdate={(profile: any) => {
              if (profile?.projection_profile_id) {
                setProfileDetails((prev) => ({
                  ...prev,
                  [profile.projection_profile_id]: profile,
                }));
              }
            }}
          />
        )}
        {activeStep === 3 && <ComingSoon label="Collateral" />}
        {activeStep === 4 && <ComingSoon label="Approval" />}
    </div>
  );
}

/* ================================================================== */
/*  STEP 1 — Obligation Term Structure                                 */
/* ================================================================== */

function ObligationTermStructureStep({
  payments,
  oblProps,
  obligationPropsLeft,
  obligationPropsRight,
  selectedPayment,
  onSelectPayment,
  selectedDeal,
  selectedContract,
  allObligationsValidated,
  allTermStructureValidated,
  validating,
  onValidateObligations,
  onRevertObligations,
  onValidateTermStructure,
  onRevertTermStructure,
  deals,
  selectedDealId,
  selectedContractId,
  onDealChange,
  onContractChange,
}: {
  payments: ObligationPayment[];
  oblProps: ObligationProperties | null;
  obligationPropsLeft: { label: string; value: string }[];
  obligationPropsRight: { label: string; value: string }[];
  selectedPayment: ObligationPayment | null;
  onSelectPayment: (p: ObligationPayment | null) => void;
  selectedDeal: DealData;
  selectedContract: ContractData;
  allObligationsValidated: boolean;
  allTermStructureValidated: boolean;
  validating: boolean;
  onValidateObligations: () => void;
  onRevertObligations: () => void;
  onValidateTermStructure: () => void;
  onRevertTermStructure: () => void;
  deals: DealData[];
  selectedDealId: string | null;
  selectedContractId: string | null;
  onDealChange: (dealId: string) => void;
  onContractChange: (contractId: string) => void;
}) {
  const startingBalance = oblProps?.principalAmount ?? (payments.length > 0 ? payments[0].remainingBalance + payments[0].scheduledPrincipal : 0);
  const lastPayment = payments.length > 0 ? payments[payments.length - 1] : null;

  return (
    <>
      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px 80px" }}>
        {/* Page header */}
        <div style={{ marginBottom: 20 }}>
          {/* Status badges row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, marginBottom: 10 }}>
            {selectedContract.obligations.length > 0 && (
              <ValidationBadge validated={allObligationsValidated} label="Obligations" />
            )}
            {payments.length > 0 && (
              <ValidationBadge validated={allTermStructureValidated} label="Term Structure" />
            )}
          </div>
          {/* Title + dropdowns row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontFamily: ds.fontSerif, fontSize: 28, fontStyle: "italic", color: ds.text, letterSpacing: "-0.01em", lineHeight: 1.15 }}>
              Obligation Term Structure
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <label style={{ fontFamily: ds.fontMono, fontSize: 11, color: ds.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Deal
              </label>
              <select
                value={selectedDealId ?? ""}
                onChange={(e) => onDealChange(e.target.value)}
                style={{
                  background: ds.surfaceRaised,
                  color: ds.text,
                  border: `1px solid ${ds.borderAccent}`,
                  borderRadius: ds.radius,
                  padding: "5px 10px",
                  fontFamily: ds.fontMono,
                  fontSize: 12,
                  minWidth: 220,
                }}
              >
                {deals.map((d) => (
                  <option key={d.deal_id} value={d.deal_id}>
                    {d.counterparty_name ?? d.deal_name ?? d.deal_id}
                  </option>
                ))}
              </select>
              {(selectedDeal?.contracts.length ?? 0) > 0 && (
                <>
                  <label style={{ fontFamily: ds.fontMono, fontSize: 11, color: ds.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Contract
                  </label>
                  <select
                    value={selectedContractId ?? ""}
                    onChange={(e) => onContractChange(e.target.value)}
                    style={{
                      background: ds.surfaceRaised,
                      color: ds.text,
                      border: `1px solid ${ds.borderAccent}`,
                      borderRadius: ds.radius,
                      padding: "5px 10px",
                      fontFamily: ds.fontMono,
                      fontSize: 12,
                      minWidth: 220,
                    }}
                  >
                    {selectedDeal?.contracts.map((c) => (
                      <option key={c.contract_for_validation_id} value={c.contract_for_validation_id}>
                        {c.contract_title?.trim() || c.contract_type?.trim() || c.document_name?.replace(/\.pdf$/i, "").replace(/_/g, " ").trim() || c.contract_for_validation_id}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </div>
          <DealSubheader items={[
            { label: "DEAL", value: selectedDeal.deal_id },
            { label: "COUNTERPARTY", value: selectedDeal.counterparty_name ?? "—" },
            { label: "CONTRACT", value: selectedContract.contract_for_validation_id },
            ...(oblProps ? [{ label: "OBLIGATION", value: oblProps.obligationId }] : []),
          ]} />
        </div>

        {/* ── Obligation Summary ── */}
        {oblProps && (
          <>
            <SectionDivider label="Obligation Summary" />
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
                  Obligation Properties
                </span>
                <span style={{ fontFamily: ds.fontMono, fontSize: 11, color: ds.textMuted }}>
                  {oblProps.obligationType}{oblProps.amortizationType ? ` · ${oblProps.amortizationType}` : ""}
                </span>
              </div>
              <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
                <div>
                  {obligationPropsLeft.map((prop) => (
                    <PropertyRow key={prop.label} label={prop.label} value={prop.value} />
                  ))}
                </div>
                <div>
                  {obligationPropsRight.map((prop) => (
                    <PropertyRow key={prop.label} label={prop.label} value={prop.value} />
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Payment Schedule ── */}
        {payments.length > 0 ? (
          <>
            <SectionDivider label="Payment Schedule" />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontFamily: ds.fontMono, fontSize: 11, color: ds.textMuted }}>
                {payments.length} payment{payments.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div
              style={{
                background: ds.surface,
                border: `1px solid ${ds.border}`,
                borderRadius: ds.radiusLg,
                overflow: "hidden",
                marginBottom: 20,
              }}
            >
              {/* Table header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 1fr 100px 140px 140px 140px 160px",
                  background: ds.surfaceRaised,
                  borderBottom: `1px solid ${ds.border}`,
                }}
              >
                {["#", "Payment Due Date", "Status", "Principal", "Interest", "Total Payment", "Remaining Balance"].map((h, i) => (
                  <div
                    key={h}
                    style={{
                      padding: "10px 14px",
                      fontFamily: ds.fontMono,
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: ds.textDim,
                      textAlign: i >= 3 ? "right" : "left",
                    }}
                  >
                    {h}
                  </div>
                ))}
              </div>

              {/* Table rows */}
              {payments.map((payment) => {
                const isSelected = selectedPayment?.id === payment.id;
                return (
                  <button
                    key={payment.id}
                    onClick={() => onSelectPayment(payment)}
                    style={{
                      width: "100%",
                      display: "grid",
                      gridTemplateColumns: "60px 1fr 100px 140px 140px 140px 160px",
                      borderBottom: `1px solid ${ds.border}`,
                      background: isSelected ? ds.surfaceRaised : "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      border: "none",
                      borderBlockEnd: `1px solid ${ds.border}`,
                      transition: "background 0.1s",
                      fontFamily: ds.fontMono,
                    }}
                  >
                    <div style={{ padding: "10px 14px", fontSize: 13, fontWeight: 500, color: isSelected ? ds.text : ds.textMuted }}>
                      {payment.paymentNumber}
                    </div>
                    <div style={{ padding: "10px 14px", fontSize: 13, fontWeight: 500, color: isSelected ? ds.text : ds.textDim, fontFamily: ds.fontMono }}>
                      {payment.paymentDueDate}
                    </div>
                    <div style={{ padding: "10px 14px" }}>
                      <PaymentStatusChip status={payment.paymentStatus} />
                    </div>
                    <div style={{ padding: "10px 14px", fontSize: 13, fontWeight: 500, color: isSelected ? ds.text : ds.textDim, textAlign: "right" }}>
                      {formatCurrency(payment.scheduledPrincipal)}
                    </div>
                    <div style={{ padding: "10px 14px", fontSize: 13, fontWeight: 500, color: isSelected ? ds.text : ds.textDim, textAlign: "right" }}>
                      {formatCurrency(payment.scheduledInterest)}
                    </div>
                    <div style={{ padding: "10px 14px", fontSize: 13, fontWeight: 500, color: isSelected ? ds.gold : ds.amber, textAlign: "right" }}>
                      {formatCurrency(payment.scheduledTotalPayment)}
                    </div>
                    <div style={{ padding: "10px 14px", fontSize: 13, fontWeight: 500, color: isSelected ? ds.text : ds.textDim, textAlign: "right" }}>
                      {formatCurrency(payment.remainingBalance)}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ background: ds.surface, border: `1px solid ${ds.border}`, borderRadius: ds.radiusLg, padding: 16 }}>
                <div style={{ fontFamily: ds.fontMono, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textMuted, marginBottom: 10 }}>
                  Total Debt Service
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
                  <div>
                    <span style={{ fontFamily: ds.fontMono, fontSize: 11, color: ds.textMuted }}>Principal: </span>
                    <span style={{ fontFamily: ds.fontMono, fontSize: 15, fontWeight: 500, color: ds.text }}>
                      {formatCurrency(payments.reduce((sum, p) => sum + p.scheduledPrincipal, 0))}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontFamily: ds.fontMono, fontSize: 11, color: ds.textMuted }}>Interest: </span>
                    <span style={{ fontFamily: ds.fontMono, fontSize: 15, fontWeight: 500, color: ds.text }}>
                      {formatCurrency(payments.reduce((sum, p) => sum + p.scheduledInterest, 0))}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontFamily: ds.fontMono, fontSize: 11, color: ds.textMuted }}>Total: </span>
                    <span style={{ fontFamily: ds.fontMono, fontSize: 15, fontWeight: 500, color: ds.gold }}>
                      {formatCurrency(payments.reduce((sum, p) => sum + p.scheduledTotalPayment, 0))}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ background: ds.surface, border: `1px solid ${ds.border}`, borderRadius: ds.radiusLg, padding: 16 }}>
                <div style={{ fontFamily: ds.fontMono, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textMuted, marginBottom: 10 }}>
                  Balance Trajectory
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
                  <div>
                    <span style={{ fontFamily: ds.fontMono, fontSize: 11, color: ds.textMuted }}>Starting: </span>
                    <span style={{ fontFamily: ds.fontMono, fontSize: 15, fontWeight: 500, color: ds.text }}>
                      {formatCurrency(startingBalance)}
                    </span>
                  </div>
                  {lastPayment && (
                    <>
                      <div>
                        <span style={{ fontFamily: ds.fontMono, fontSize: 11, color: ds.textMuted }}>After Pmt {lastPayment.paymentNumber}: </span>
                        <span style={{ fontFamily: ds.fontMono, fontSize: 15, fontWeight: 500, color: ds.text }}>
                          {formatCurrency(lastPayment.remainingBalance)}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontFamily: ds.fontMono, fontSize: 11, color: ds.textMuted }}>Paydown: </span>
                        <span style={{ fontFamily: ds.fontMono, fontSize: 15, fontWeight: 500, color: ds.green }}>
                          {startingBalance > 0
                            ? (((startingBalance - lastPayment.remainingBalance) / startingBalance) * 100).toFixed(1)
                            : "0.0"}%
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* No payment schedule yet but has obligations */
          selectedContract.obligations.length > 0 && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <span style={{ fontFamily: ds.fontSerif, fontSize: 16, fontStyle: "italic", color: ds.textMuted }}>
                Obligations extracted — payment schedule pending
              </span>
            </div>
          )
        )}
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
          <FooterMeta label="Contract" value={selectedContract.contract_for_validation_id} />
          {oblProps && (
            <>
              <FooterMeta label="Obligation" value={oblProps.obligationId} />
              <FooterMeta label="Principal" value={oblProps.principalAmount ? formatCurrency(oblProps.principalAmount) : "—"} />
              {oblProps.interestRateIndex && oblProps.interestRateSpread && (
                <FooterMeta
                  label="Rate"
                  value={`${oblProps.interestRateIndex} + ${oblProps.interestRateSpread} bps`}
                  valueColor={ds.amber}
                />
              )}
            </>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {/* Revert buttons */}
          {allObligationsValidated && (
            <GhostButtonWarn label="Revert Obligations" onClick={onRevertObligations} disabled={validating} />
          )}
          {allTermStructureValidated && (
            <GhostButtonWarn label="Revert Term Structure" onClick={onRevertTermStructure} disabled={validating} />
          )}

          {/* Validate buttons */}
          {!allObligationsValidated && selectedContract.obligations.length > 0 && (
            <button
              onClick={onValidateObligations}
              disabled={validating}
              style={{
                padding: "8px 16px",
                borderRadius: ds.radius,
                fontFamily: ds.fontBody,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                background: validating ? ds.textMuted : ds.gold,
                color: "#18140a",
                border: "none",
                cursor: validating ? "wait" : "pointer",
              }}
            >
              {validating ? "..." : "Validate Obligations"}
            </button>
          )}
          {allObligationsValidated && payments.length > 0 && !allTermStructureValidated && (
            <button
              onClick={onValidateTermStructure}
              disabled={validating}
              style={{
                padding: "8px 16px",
                borderRadius: ds.radius,
                fontFamily: ds.fontBody,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                background: validating ? ds.textMuted : ds.gold,
                color: "#18140a",
                border: "none",
                cursor: validating ? "wait" : "pointer",
              }}
            >
              {validating ? "..." : "Validate Structure →"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

/* ================================================================== */
/*  STEP 2 — Projections (Coverage Corridor) — unchanged / mock data   */
/* ================================================================== */

function ProjectionsStep({
  counterpartyId,
  counterpartyName,
  dealId,
  profileAssignments,
  profileDetails,
  allProfiles,
  projectionData,
  projectionSummary,
  onProfileUpdate,
  onProfileDetailUpdate,
}: {
  counterpartyId?: string;
  counterpartyName?: string;
  dealId?: string;
  profileAssignments: Record<string, any>;
  profileDetails: Record<string, any>;
  allProfiles: any[];
  projectionData: any | null;
  projectionSummary: any | null;
  onProfileUpdate: (updatedAssignment: any) => void;
  onProfileDetailUpdate?: (profile: any) => void;
}) {
  const [activeScenario, setActiveScenario] = useState<
    "base" | "stress" | "optimistic"
  >("base");
  const [activeRatio, setActiveRatio] = useState<
    "DSCR" | "LLCR" | "GDSCR" | "All"
  >("DSCR");
  const [profileActionLoading, setProfileActionLoading] = useState(false);
  const [revertingProfile, setRevertingProfile] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);

  // Look up assignment and profile for the selected counterparty
  const assignment = counterpartyId ? profileAssignments[counterpartyId] : null;
  const profile = assignment?.effective_profile_id
    ? profileDetails[assignment.effective_profile_id]
    : null;

  const profilePropsLeft = assignment
    ? buildProfilePropertiesLeft(assignment, profile)
    : buildProfilePropertiesLeft(null, null);
  const profilePropsRight = assignment
    ? buildProfilePropertiesRight(assignment, profile)
    : buildProfilePropertiesRight(null, null);

  // Assign profile — creates the initial assignment by matching counterparty to best profile
  const handleAssignProfile = async () => {
    if (!counterpartyId) return;
    setAssignLoading(true);
    try {
      const res = await fetch("/api/projections/profile-assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ counterparty_id: counterpartyId }),
      });
      const json = await res.json();
      if (json.success && json.assignment) {
        onProfileUpdate(json.assignment);
        // Also update profileDetails if a new profile was returned
        if (json.profile) {
          onProfileDetailUpdate?.(json.profile);
        }
      }
    } catch (err) {
      console.error("Profile assignment failed:", err);
    } finally {
      setAssignLoading(false);
    }
  };

  // Profile action handlers (confirm/flag/override existing assignment)
  const handleProfileAction = async (action: string, extra?: Record<string, any>) => {
    if (!counterpartyId) return;
    setProfileActionLoading(true);
    try {
      const res = await fetch("/api/projections/profile-assignment", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ counterparty_id: counterpartyId, action, ...extra }),
      });
      const json = await res.json();
      if (json.success && json.assignment) {
        onProfileUpdate(json.assignment);
      }
    } catch (err) {
      console.error("Profile action failed:", err);
    } finally {
      setProfileActionLoading(false);
    }
  };

  const handleRevertProfile = async () => {
    if (!counterpartyId || revertingProfile) return;
    setRevertingProfile(true);
    try {
      const res = await fetch("/api/projections/profile-assignment", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ counterparty_id: counterpartyId, action: "REVERT" }),
      });
      const json = await res.json();
      if (json.success && json.assignment) {
        onProfileUpdate(json.assignment);
      }
    } catch (err) {
      console.error("Profile revert failed:", err);
    } finally {
      setRevertingProfile(false);
    }
  };

  const scenarioTabs = [
    { key: "base" as const, label: "Base Case" },
    { key: "stress" as const, label: "Stress Case" },
    { key: "optimistic" as const, label: "Optimistic Case" },
  ];

  const ratioButtons = [
    { key: "DSCR" as const, label: "DSCR" },
    { key: "LLCR" as const, label: "LLCR" },
    { key: "GDSCR" as const, label: "GDSCR" },
    { key: "All" as const, label: "All Ratios" },
  ];

  const projStatus = assignment?.projection_status ?? null;

  const handleRetryProjection = async () => {
    if (!counterpartyId) return;
    setProfileActionLoading(true);
    try {
      const res = await fetch("/api/projections/profile-assignment", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ counterparty_id: counterpartyId, action: "RETRY_PROJECTION" }),
      });
      const json = await res.json();
      if (json.success && json.assignment) {
        onProfileUpdate(json.assignment);
      }
    } catch (err) {
      console.error("Retry projection failed:", err);
    } finally {
      setProfileActionLoading(false);
    }
  };

  return (
    <>
      <style>{`@keyframes pulse-opacity{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px 80px" }}>
        {/* Page header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontFamily: ds.fontSerif, fontSize: 28, fontStyle: "italic", color: ds.text, letterSpacing: "-0.01em", lineHeight: 1.15 }}>
              Coverage Corridor Analysis
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {!assignment ? (
                <button
                  onClick={handleAssignProfile}
                  disabled={assignLoading || !counterpartyId}
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
                    cursor: assignLoading || !counterpartyId ? "not-allowed" : "pointer",
                    opacity: assignLoading || !counterpartyId ? 0.6 : 1,
                    transition: "all 0.15s",
                  }}
                >
                  {assignLoading ? "Assigning..." : "Assign Profile"}
                </button>
              ) : (
                <GhostButton label="Override Profile Assignment" onClick={() => setShowOverrideModal(true)} />
              )}
              <GhostButton label="Create Scenario" />
            </div>
          </div>
          <DealSubheader items={[
            { label: "DEAL", value: dealId ?? "—" },
            { label: "COUNTERPARTY", value: counterpartyName ?? "—" },
            { label: "PROFILE", value: assignment?.effective_profile_id ?? "Not Assigned" },
            { label: "HORIZON", value: "36 months" },
          ]} />
        </div>

        {/* ── Coverage Corridor Chart ── */}
        <SectionDivider label="Coverage Ratio Projection Corridors" />

        {projStatus === "ERROR" ? (
          <div
            style={{
              background: ds.wdwBg,
              border: `1px solid ${ds.wdwBorder}`,
              borderRadius: ds.radiusLg,
              padding: "40px 20px",
              marginBottom: 24,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span style={{ fontFamily: ds.fontMono, fontSize: 13, fontWeight: 700, color: ds.wdwColor, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Projection Failed
            </span>
            <span style={{ fontFamily: ds.fontMono, fontSize: 12, color: ds.textDim, textAlign: "center", maxWidth: 500 }}>
              {assignment?.projection_error ?? "Unknown error"}
            </span>
            <button
              onClick={handleRetryProjection}
              disabled={profileActionLoading}
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
                cursor: profileActionLoading ? "not-allowed" : "pointer",
                opacity: profileActionLoading ? 0.6 : 1,
              }}
            >
              {profileActionLoading ? "Retrying..." : "Retry Projection"}
            </button>
          </div>
        ) : projStatus === "PENDING" || projStatus === "IN_PROGRESS" ? (
          <div
            style={{
              background: ds.surface,
              border: `1px solid ${ds.border}`,
              borderRadius: ds.radiusLg,
              padding: "60px 20px",
              marginBottom: 24,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              style={{
                fontFamily: ds.fontMono,
                fontSize: 13,
                fontWeight: 500,
                color: ds.gold,
                animation: "pulse-opacity 1.5s ease-in-out infinite",
              }}
            >
              Generating projections...
            </span>
            <span style={{ fontFamily: ds.fontMono, fontSize: 11, color: ds.textMuted }}>
              The projection engine is running. Results will appear when complete.
            </span>
          </div>
        ) : projStatus !== "COMPLETE" && !projStatus ? (
          <div
            style={{
              background: ds.surface,
              border: `1px solid ${ds.border}`,
              borderRadius: ds.radiusLg,
              padding: "60px 20px",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontFamily: ds.fontMono, fontSize: 12, color: ds.textMuted }}>
              Confirm profile to generate projections
            </span>
          </div>
        ) : (
        <CoverageCorridorChart
          projectionData={projectionData}
          projectionSummary={projectionSummary}
          scenarioTabs={scenarioTabs}
          activeScenario={activeScenario}
          setActiveScenario={setActiveScenario}
          ratioButtons={ratioButtons}
          activeRatio={activeRatio}
          setActiveRatio={setActiveRatio}
        />
        )}

        {/* ── Profile Properties ── */}
        <SectionDivider label="Projection Profile Properties" />
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
              Profile Assignment
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ProfileStatusBadge assignment={assignment} />
              <ProjectionStatusBadge assignment={assignment} />
            </div>
          </div>
          {!assignment ? (
            <div style={{ padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <span style={{ fontFamily: ds.fontSerif, fontSize: 18, fontStyle: "italic", color: ds.textMuted }}>
                No projection profile assigned
              </span>
              <span style={{ fontFamily: ds.fontMono, fontSize: 11, color: ds.textMuted, textAlign: "center", maxWidth: 440 }}>
                Assign a projection profile to match this counterparty to industry benchmarks, growth assumptions, and cost structure parameters.
              </span>
              <button
                onClick={handleAssignProfile}
                disabled={assignLoading || !counterpartyId}
                style={{
                  marginTop: 8,
                  padding: "10px 24px",
                  borderRadius: ds.radius,
                  fontFamily: ds.fontBody,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  background: ds.gold,
                  color: "#18140a",
                  border: "none",
                  cursor: assignLoading || !counterpartyId ? "not-allowed" : "pointer",
                  opacity: assignLoading || !counterpartyId ? 0.6 : 1,
                  transition: "all 0.15s",
                }}
              >
                {assignLoading ? "Matching Profile..." : "Assign Projection Profile"}
              </button>
            </div>
          ) : (
            <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
              <div>
                {profilePropsLeft.map((prop) => (
                  <PropertyRow key={prop.label} label={prop.label} value={prop.value} />
                ))}
              </div>
              <div>
                {profilePropsRight.map((prop) => (
                  <PropertyRow key={prop.label} label={prop.label} value={prop.value} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Override modal */}
      {showOverrideModal && (
        <OverrideModal
          allProfiles={allProfiles}
          onClose={() => setShowOverrideModal(false)}
          onSubmit={(profileId, justification) => {
            setShowOverrideModal(false);
            handleProfileAction("OVERRIDE", {
              user_selected_profile: profileId,
              override_justification: justification,
            });
          }}
        />
      )}

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
          <FooterMeta label="Profile" value={assignment?.effective_profile_id ?? "—"} />
          <FooterMeta label="Scenario" value="Base Case" />
          <FooterMeta label="Temporal Min" value={`${TEMPORAL_MIN.dscrBase.toFixed(2)}x`} valueColor={ds.wdwColor} />
          <FooterMeta label="Covenant Cushion" value={`${(((TEMPORAL_MIN.dscrBase - 1.25) / 1.25) * 100).toFixed(1)}%`} valueColor={TEMPORAL_MIN.dscrBase < 1.25 ? ds.wdwColor : ds.green} />
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {!assignment ? (
            <button
              onClick={handleAssignProfile}
              disabled={assignLoading || !counterpartyId}
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
                cursor: assignLoading || !counterpartyId ? "not-allowed" : "pointer",
                opacity: assignLoading || !counterpartyId ? 0.6 : 1,
              }}
            >
              {assignLoading ? "Assigning..." : "Assign Profile"}
            </button>
          ) : assignment.status === "CONFIRMED" ? (
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
                ✓ Profile Confirmed
              </button>
              <button
                onClick={handleRevertProfile}
                disabled={revertingProfile}
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
                  cursor: revertingProfile ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap",
                  opacity: revertingProfile ? 0.6 : 1,
                }}
              >
                {revertingProfile ? "Reverting..." : "Revert"}
              </button>
            </>
          ) : assignment.status === "FLAGGED" ? (
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
                  background: ds.coral,
                  color: "#fff",
                  border: "none",
                  cursor: "default",
                  whiteSpace: "nowrap",
                }}
              >
                Flagged for Review
              </button>
              <button
                onClick={handleRevertProfile}
                disabled={revertingProfile}
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
                  cursor: revertingProfile ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap",
                  opacity: revertingProfile ? 0.6 : 1,
                }}
              >
                {revertingProfile ? "Reverting..." : "Revert"}
              </button>
            </>
          ) : (
            <>
              <GhostButton label="Override Profile" onClick={() => setShowOverrideModal(true)} />
              <button
                onClick={() => handleProfileAction("FLAGGED")}
                disabled={profileActionLoading}
                style={{
                  padding: "8px 14px",
                  borderRadius: ds.radius,
                  fontFamily: ds.fontBody,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  background: ds.coral,
                  color: "#fff",
                  border: "none",
                  cursor: profileActionLoading ? "not-allowed" : "pointer",
                  opacity: profileActionLoading ? 0.6 : 1,
                }}
              >
                {profileActionLoading ? "Flagging..." : "Flag for Review"}
              </button>
              <button
                onClick={() => handleProfileAction("CONFIRMED")}
                disabled={profileActionLoading}
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
                  cursor: profileActionLoading ? "not-allowed" : "pointer",
                  opacity: profileActionLoading ? 0.6 : 1,
                }}
              >
                {profileActionLoading ? "Confirming..." : "Confirm Profile →"}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ================================================================== */
/*  Chart sub-components                                               */
/* ================================================================== */

interface DotProps {
  cx?: number;
  cy?: number;
  payload?: CorridorDataPoint;
}

/* ================================================================== */
/*  Coverage Corridor Chart — real projection data                      */
/* ================================================================== */
function CoverageCorridorChart({
  projectionData,
  projectionSummary,
  scenarioTabs,
  activeScenario,
  setActiveScenario,
  ratioButtons,
  activeRatio,
  setActiveRatio,
}: {
  projectionData: any | null;
  projectionSummary: any | null;
  scenarioTabs: { key: string; label: string }[];
  activeScenario: string;
  setActiveScenario: (s: any) => void;
  ratioButtons: { key: string; label: string }[];
  activeRatio: string;
  setActiveRatio: (s: any) => void;
}) {
  // Build chart data from wide-format projection row
  const chartData = projectionData ? buildProjectionChartData(projectionData) : [];
  const hasData = chartData.length > 0 && chartData.some((d) => d.dscrCorridor != null);

  // Summary values
  const minDscr = projectionSummary?.min_dscr_value ?? null;
  const minPeriod = projectionSummary?.min_dscr_period ?? null;
  const avgDscr = projectionSummary?.avg_dscr ?? null;
  const llcr = projectionSummary?.llcr ?? null;
  const dscrBuffer = projectionSummary?.dscr_buffer ?? null;
  const dscrClassification = projectionSummary?.dscr_classification ?? null;
  const classChip = getClassificationChip(dscrClassification);

  // Covenant threshold (default 1.25x)
  const covenantThreshold = 1.25;

  // Determine Y-axis domain from data
  const allVals = chartData
    .flatMap((d) => [d.dscrCorridor, d.dscrTotal, d.dscrPariPassu])
    .filter((v): v is number => v != null);
  const yMin = allVals.length > 0 ? Math.floor((Math.min(...allVals) - 0.2) * 10) / 10 : 0.6;
  const yMax = allVals.length > 0 ? Math.ceil((Math.max(...allVals) + 0.2) * 10) / 10 : 2.0;

  // Color function for DSCR segments
  const getDscrColor = (val: number | null) => {
    if (val == null) return ds.textMuted;
    if (val < covenantThreshold) return ds.wdwColor;
    if (val < covenantThreshold + (dscrBuffer ?? 0.1)) return ds.pwColor;
    return ds.satColor;
  };

  // Format min period label
  const minPeriodLabel = minPeriod
    ? minPeriod.replace(/_/g, " ").replace(/y(\d)/i, "Y$1").replace(/q(\d)/i, " Q$1")
    : "—";

  if (!hasData) {
    // Fallback: use mock data if no real projection data
    return (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: ds.wdwBg, border: `1px solid ${ds.wdwBorder}`, borderRadius: 4, padding: "5px 12px" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: ds.wdwColor }} />
              <span style={{ fontFamily: ds.fontMono, fontSize: 11, fontWeight: 500, color: ds.wdwColor }}>
                Temporal Min: {TEMPORAL_MIN.dscrBase.toFixed(2)}x at {TEMPORAL_MIN.period}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: ds.goldDim, border: "1px solid rgba(200,168,75,0.30)", borderRadius: 4, padding: "5px 12px" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: ds.gold }} />
              <span style={{ fontFamily: ds.fontMono, fontSize: 11, fontWeight: 500, color: ds.gold }}>Covenant: {covenantThreshold}x</span>
            </div>
          </div>
        </div>
        <div style={{ background: ds.surface, border: `1px solid ${ds.border}`, borderRadius: ds.radiusLg, padding: 20, marginBottom: 20 }}>
          <div style={{ width: "100%", height: 420 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={CORRIDOR_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={ds.border} vertical={false} />
                <XAxis dataKey="period" tick={{ fill: ds.textMuted, fontSize: 11, fontFamily: ds.fontMono }} tickLine={{ stroke: ds.border }} axisLine={{ stroke: ds.border }} interval={2} angle={-30} textAnchor="end" height={50} />
                <YAxis domain={[0.6, 2.0]} tick={{ fill: ds.textMuted, fontSize: 11, fontFamily: ds.fontMono }} tickLine={{ stroke: ds.border }} axisLine={{ stroke: ds.border }} tickFormatter={(v: number) => `${v.toFixed(1)}x`} width={50} />
                <Tooltip content={<CorridorTooltip />} />
                <Area dataKey="corridor" fill={ds.blue} fillOpacity={0.12} stroke="none" />
                <ReferenceLine y={covenantThreshold} stroke={ds.gold} strokeDasharray="8 4" strokeWidth={1.5} label={{ value: `Covenant ${covenantThreshold}x`, position: "right", fill: ds.gold, fontSize: 11 }} />
                <ReferenceLine y={1.0} stroke={ds.coral} strokeWidth={1.5} label={{ value: "B/E 1.0x", position: "right", fill: ds.coral, fontSize: 11 }} />
                <Line dataKey="dscrUpper" stroke={ds.blue} strokeWidth={1} strokeDasharray="4 3" dot={false} opacity={0.5} />
                <Line dataKey="dscrLower" stroke={ds.blue} strokeWidth={1} strokeDasharray="4 3" dot={false} opacity={0.5} />
                <Line dataKey="dscrBase" stroke={ds.blue} strokeWidth={2.5} dot={(props: DotProps) => {
                  const { cx, cy, payload } = props;
                  if (payload && payload.dscrBase === TEMPORAL_MIN.dscrBase && payload.period === TEMPORAL_MIN.period) {
                    return <circle key={`min-${payload.period}`} cx={cx} cy={cy} r={6} fill={ds.coral} stroke="#fff" strokeWidth={2} />;
                  }
                  return <circle key={`dot-${payload?.period}`} cx={cx} cy={cy} r={0} fill="transparent" />;
                }} activeDot={{ r: 5, fill: ds.blue, stroke: "#fff", strokeWidth: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, marginTop: 8, paddingTop: 12, borderTop: `1px solid ${ds.border}` }}>
            <LegendItem color={ds.blue} label="DSCR (Base Case)" type="line" />
            <LegendItem color={ds.blue} label="Projection Corridor" type="area" />
            <LegendItem color={ds.gold} label="Covenant Threshold" type="dashed" />
            <LegendItem color={ds.coral} label="Breakeven" type="line" />
            <LegendItem color={ds.coral} label="Temporal Minimum" type="dot" />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
          <MetricCard label="Temporal Min DSCR" value={`${TEMPORAL_MIN.dscrBase.toFixed(2)}x`} sub={TEMPORAL_MIN.period} accent={ds.wdwColor} />
          <MetricCard label="Covenant Cushion" value={`${(((TEMPORAL_MIN.dscrBase - covenantThreshold) / covenantThreshold) * 100).toFixed(1)}%`} sub="At temporal minimum" accent={TEMPORAL_MIN.dscrBase < covenantThreshold ? ds.wdwColor : ds.gold} />
          <MetricCard label="Average DSCR" value={`${(CORRIDOR_DATA.reduce((s, d) => s + d.dscrBase, 0) / CORRIDOR_DATA.length).toFixed(2)}x`} sub="36-month projection" accent={ds.blue} />
          <MetricCard label="Max Corridor Width" value={`${(Math.max(...CORRIDOR_DATA.map((d) => d.dscrUpper - d.dscrLower))).toFixed(2)}x`} sub="Peak uncertainty spread" accent={ds.amber} />
        </div>
      </>
    );
  }

  // ─── Real projection data chart ───
  return (
    <>
      {/* Temporal minimum + covenant callout */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {minDscr != null && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: minDscr < covenantThreshold ? ds.wdwBg : ds.satBg, border: `1px solid ${minDscr < covenantThreshold ? ds.wdwBorder : ds.satBorder}`, borderRadius: 4, padding: "5px 12px" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: minDscr < covenantThreshold ? ds.wdwColor : ds.satColor }} />
              <span style={{ fontFamily: ds.fontMono, fontSize: 11, fontWeight: 500, color: minDscr < covenantThreshold ? ds.wdwColor : ds.satColor }}>
                Temporal Min: {(+minDscr).toFixed(2)}x at {minPeriodLabel}
              </span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: ds.goldDim, border: "1px solid rgba(200,168,75,0.30)", borderRadius: 4, padding: "5px 12px" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: ds.gold }} />
            <span style={{ fontFamily: ds.fontMono, fontSize: 11, fontWeight: 500, color: ds.gold }}>Covenant: {covenantThreshold}x</span>
          </div>
        </div>
      </div>

      {/* Ratio selector */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { key: "corridor", label: "DSCR Corridor" },
            { key: "total", label: "DSCR Total" },
            { key: "pariPassu", label: "Pari Passu" },
          ].map((btn) => (
            <button
              key={btn.key}
              onClick={() => setActiveRatio(btn.key as any)}
              style={{
                padding: "5px 12px",
                fontFamily: ds.fontMono,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                borderRadius: 4,
                border: activeRatio === btn.key ? `1px solid ${ds.gold}` : `1px solid ${ds.border}`,
                background: activeRatio === btn.key ? ds.goldDim : "transparent",
                color: activeRatio === btn.key ? ds.gold : ds.textMuted,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart panel */}
      <div style={{ background: ds.surface, border: `1px solid ${ds.border}`, borderRadius: ds.radiusLg, padding: 20, marginBottom: 20 }}>
        <div style={{ width: "100%", height: 420 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={ds.border} vertical={false} />
              <XAxis
                dataKey="period"
                tick={{ fill: ds.textMuted, fontSize: 11, fontFamily: ds.fontMono }}
                tickLine={{ stroke: ds.border }}
                axisLine={{ stroke: ds.border }}
                height={40}
              />
              <YAxis
                domain={[Math.max(yMin, 0), yMax]}
                tick={{ fill: ds.textMuted, fontSize: 11, fontFamily: ds.fontMono }}
                tickLine={{ stroke: ds.border }}
                axisLine={{ stroke: ds.border }}
                tickFormatter={(v: number) => `${v.toFixed(1)}x`}
                width={50}
              />
              <Tooltip
                content={({ active, payload, label }: any) => {
                  if (!active || !payload?.length) return null;
                  const corridor = payload.find((p: any) => p.dataKey === "dscrCorridor");
                  const total = payload.find((p: any) => p.dataKey === "dscrTotal");
                  const pp = payload.find((p: any) => p.dataKey === "dscrPariPassu");
                  const isMin = label === minPeriodLabel || label === minPeriod;
                  return (
                    <div style={{ borderRadius: ds.radiusLg, padding: "12px 16px", background: ds.surfaceRaised, border: `1px solid ${ds.borderAccent}` }}>
                      <p style={{ fontFamily: ds.fontMono, fontSize: 11, fontWeight: 500, color: ds.text, marginBottom: 8 }}>{label}</p>
                      {corridor?.value != null && (
                        <p style={{ fontSize: 13, marginBottom: 4 }}>
                          <span style={{ fontFamily: ds.fontMono, fontSize: 11, color: ds.textMuted }}>DSCR Corridor: </span>
                          <span style={{ fontFamily: ds.fontMono, fontSize: 15, fontWeight: 500, color: getDscrColor(corridor.value) }}>{(+corridor.value).toFixed(2)}x</span>
                          {isMin && <span style={{ marginLeft: 8, fontFamily: ds.fontMono, fontSize: 11, fontWeight: 700, color: ds.wdwColor }}>TEMPORAL MIN</span>}
                        </p>
                      )}
                      {total?.value != null && (
                        <p style={{ fontSize: 13, marginBottom: 4 }}>
                          <span style={{ fontFamily: ds.fontMono, fontSize: 11, color: ds.textMuted }}>DSCR Total: </span>
                          <span style={{ fontFamily: ds.fontMono, fontSize: 13, color: ds.textDim }}>{(+total.value).toFixed(2)}x</span>
                        </p>
                      )}
                      {pp?.value != null && (
                        <p style={{ fontSize: 13, marginBottom: 4 }}>
                          <span style={{ fontFamily: ds.fontMono, fontSize: 11, color: ds.textMuted }}>Pari Passu: </span>
                          <span style={{ fontFamily: ds.fontMono, fontSize: 13, color: ds.textDim }}>{(+pp.value).toFixed(2)}x</span>
                        </p>
                      )}
                      {corridor?.value != null && (
                        <p style={{ fontSize: 13 }}>
                          <span style={{ fontFamily: ds.fontMono, fontSize: 11, color: ds.textMuted }}>Covenant Cushion: </span>
                          <span style={{ fontFamily: ds.fontMono, fontSize: 13, fontWeight: 500, color: corridor.value < covenantThreshold ? ds.wdwColor : ds.green }}>
                            {(((corridor.value - covenantThreshold) / covenantThreshold) * 100).toFixed(1)}%
                          </span>
                        </p>
                      )}
                    </div>
                  );
                }}
              />

              {/* Covenant threshold */}
              <ReferenceLine y={covenantThreshold} stroke={ds.gold} strokeDasharray="8 4" strokeWidth={1.5} label={{ value: `Covenant ${covenantThreshold}x`, position: "right", fill: ds.gold, fontSize: 11 }} />

              {/* Breakeven line */}
              <ReferenceLine y={1.0} stroke={ds.coral} strokeWidth={1} label={{ value: "B/E 1.0x", position: "right", fill: ds.coral, fontSize: 11 }} />

              {/* DSCR Total line (dimmer) */}
              <Line dataKey="dscrTotal" stroke={ds.textMuted} strokeWidth={1} strokeDasharray="4 3" dot={false} connectNulls />

              {/* Pari Passu line (dimmer) */}
              <Line dataKey="dscrPariPassu" stroke={ds.blue} strokeWidth={1} strokeDasharray="4 3" dot={false} opacity={0.4} connectNulls />

              {/* Primary DSCR Corridor line — color-coded segments */}
              <Line
                dataKey="dscrCorridor"
                stroke={ds.satColor}
                strokeWidth={2.5}
                connectNulls
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  if (!payload || payload.dscrCorridor == null) return <circle key={`e-${payload?.period}`} cx={cx} cy={cy} r={0} fill="transparent" />;
                  const val = payload.dscrCorridor;
                  const isMinPoint = payload.period === minPeriodLabel || payload.period === minPeriod;
                  const dotColor = getDscrColor(val);
                  if (isMinPoint) {
                    return (
                      <g key={`min-${payload.period}`}>
                        <circle cx={cx} cy={cy} r={7} fill={ds.wdwColor} stroke="#fff" strokeWidth={2} />
                        <text x={cx} y={(cy ?? 0) - 14} textAnchor="middle" fill={ds.wdwColor} fontSize={11} fontFamily={ds.fontMono} fontWeight={700}>
                          {(+val).toFixed(2)}x
                        </text>
                      </g>
                    );
                  }
                  return <circle key={`dot-${payload.period}`} cx={cx} cy={cy} r={3} fill={dotColor} stroke={ds.surface} strokeWidth={1.5} />;
                }}
                activeDot={{ r: 5, fill: ds.satColor, stroke: "#fff", strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Chart legend */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, marginTop: 8, paddingTop: 12, borderTop: `1px solid ${ds.border}` }}>
          <LegendItem color={ds.satColor} label="DSCR Corridor" type="line" />
          <LegendItem color={ds.textMuted} label="DSCR Total" type="dashed" />
          <LegendItem color={ds.gold} label="Covenant Threshold" type="dashed" />
          <LegendItem color={ds.coral} label="Temporal Minimum" type="dot" />
        </div>
      </div>

      {/* Key metrics summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 24 }}>
        <MetricCard
          label="Temporal Min DSCR"
          value={minDscr != null ? `${(+minDscr).toFixed(2)}x` : "—"}
          sub={minPeriodLabel}
          accent={minDscr != null && minDscr < covenantThreshold ? ds.wdwColor : ds.satColor}
        />
        <MetricCard
          label="Average DSCR"
          value={avgDscr != null ? `${(+avgDscr).toFixed(2)}x` : "—"}
          sub="12-quarter projection"
          accent={ds.blue}
        />
        <MetricCard
          label="LLCR"
          value={llcr != null ? `${(+llcr).toFixed(2)}x` : "—"}
          sub="Loan life coverage"
          accent={ds.blue}
        />
        <MetricCard
          label="Buffer"
          value={dscrBuffer != null ? `${((+dscrBuffer) * 100).toFixed(1)}%` : "—"}
          sub="Above covenant threshold"
          accent={dscrBuffer != null && dscrBuffer < 0 ? ds.wdwColor : ds.gold}
        />
        <div style={{ background: ds.surface, border: `1px solid ${ds.border}`, borderRadius: ds.radiusLg, padding: 16 }}>
          <div style={{ fontFamily: ds.fontMono, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textMuted, marginBottom: 4 }}>
            Classification
          </div>
          {classChip ? (
            <span style={{
              fontFamily: ds.fontMono, fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
              padding: "4px 10px", borderRadius: 3,
              background: classChip.bg, color: classChip.color, border: `1px solid ${classChip.border}`,
            }}>
              {classChip.label}
            </span>
          ) : (
            <div style={{ fontFamily: ds.fontMono, fontSize: 22, fontWeight: 500, color: ds.textMuted }}>—</div>
          )}
          <div style={{ fontFamily: ds.fontMono, fontSize: 11, color: ds.textMuted, marginTop: 2 }}>DSCR band</div>
        </div>
      </div>
    </>
  );
}

function CorridorTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number | [number, number]; dataKey: string }[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  const base = payload.find((p) => p.dataKey === "dscrBase");
  const corridor = payload.find((p) => p.dataKey === "corridor");
  const corridorVal = corridor?.value as [number, number] | undefined;
  const baseVal = base?.value as number | undefined;

  const isMin =
    baseVal !== undefined &&
    baseVal === TEMPORAL_MIN.dscrBase &&
    label === TEMPORAL_MIN.period;

  return (
    <div
      style={{
        borderRadius: ds.radiusLg,
        padding: "12px 16px",
        background: ds.surfaceRaised,
        border: `1px solid ${ds.borderAccent}`,
      }}
    >
      <p style={{ fontFamily: ds.fontMono, fontSize: 11, fontWeight: 500, color: ds.text, marginBottom: 8 }}>{label}</p>
      {baseVal !== undefined && (
        <p style={{ fontSize: 13, marginBottom: 4 }}>
          <span style={{ fontFamily: ds.fontMono, fontSize: 11, color: ds.textMuted }}>DSCR: </span>
          <span
            style={{
              fontFamily: ds.fontMono,
              fontSize: 15,
              fontWeight: 500,
              color: baseVal < 1.25 ? ds.wdwColor : ds.blue,
            }}
          >
            {baseVal.toFixed(2)}x
          </span>
          {isMin && (
            <span style={{ marginLeft: 8, fontFamily: ds.fontMono, fontSize: 11, fontWeight: 700, color: ds.wdwColor }}>
              TEMPORAL MIN
            </span>
          )}
        </p>
      )}
      {corridorVal && (
        <p style={{ fontSize: 13, marginBottom: 4 }}>
          <span style={{ fontFamily: ds.fontMono, fontSize: 11, color: ds.textMuted }}>Corridor: </span>
          <span style={{ fontFamily: ds.fontMono, fontSize: 13, color: ds.textDim }}>
            {corridorVal[0].toFixed(2)}x – {corridorVal[1].toFixed(2)}x
          </span>
        </p>
      )}
      {baseVal !== undefined && (
        <p style={{ fontSize: 13 }}>
          <span style={{ fontFamily: ds.fontMono, fontSize: 11, color: ds.textMuted }}>Covenant Cushion: </span>
          <span
            style={{
              fontFamily: ds.fontMono,
              fontSize: 13,
              fontWeight: 500,
              color: baseVal < 1.25 ? ds.wdwColor : ds.green,
            }}
          >
            {(((baseVal - 1.25) / 1.25) * 100).toFixed(1)}%
          </span>
        </p>
      )}
    </div>
  );
}

function LegendItem({ color, label, type }: { color: string; label: string; type: "line" | "area" | "dashed" | "dot" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {type === "line" && (
        <div style={{ width: 20, height: 2, background: color, borderRadius: 1 }} />
      )}
      {type === "area" && (
        <div style={{ width: 20, height: 12, background: color, opacity: 0.3, borderRadius: 2 }} />
      )}
      {type === "dashed" && (
        <div style={{ width: 20, height: 2, borderRadius: 1, backgroundImage: `repeating-linear-gradient(90deg, ${color} 0px, ${color} 5px, transparent 5px, transparent 8px)` }} />
      )}
      {type === "dot" && (
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, border: "2px solid #fff" }} />
      )}
      <span style={{ fontFamily: ds.fontMono, fontSize: 11, color: ds.textDim }}>{label}</span>
    </div>
  );
}

function MetricCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: string }) {
  return (
    <div style={{ background: ds.surface, border: `1px solid ${ds.border}`, borderRadius: ds.radiusLg, padding: 16 }}>
      <div style={{ fontFamily: ds.fontMono, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textMuted, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontFamily: ds.fontMono, fontSize: 22, fontWeight: 500, color: accent }}>
        {value}
      </div>
      <div style={{ fontFamily: ds.fontMono, fontSize: 11, color: ds.textMuted, marginTop: 2 }}>{sub}</div>
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
  const isHighlighted =
    value === "PAYMENT_OBLIGATION" ||
    value === "STRAIGHT_LINE" ||
    value === "MONTHLY" ||
    value === "GROWTH" ||
    value === "MATURE" ||
    value === "DECLINE" ||
    value === "STARTUP" ||
    value === "B2B" ||
    value === "B2C" ||
    value === "B2B / B2C" ||
    value === "MODERATE" ||
    value === "ADEQUATE" ||
    value === "STRONG" ||
    value === "WEAK" ||
    value === "HIGH" ||
    value === "LOW" ||
    value === "YES" ||
    value === "VALIDATED" ||
    value.startsWith("OBL_") ||
    value.startsWith("CNT_") ||
    value.startsWith("PRF_");

  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "5px 0", borderBottom: `1px solid ${ds.border}` }}>
      <span style={{ fontFamily: ds.fontBody, fontSize: 13, fontWeight: 400, color: ds.textDim, width: 200, flexShrink: 0 }}>{label}</span>
      <span style={{ fontFamily: ds.fontMono, fontSize: 13, fontWeight: isHighlighted ? 500 : 400, color: isHighlighted ? ds.text : ds.textDim }}>
        {value}
      </span>
    </div>
  );
}

function GhostButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{ padding: "8px 16px", borderRadius: ds.radius, fontFamily: ds.fontBody, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: "transparent", color: ds.textDim, border: `1px solid ${ds.borderAccent}`, cursor: "pointer", whiteSpace: "nowrap" }}>
      {label}
    </button>
  );
}

function GhostButtonWarn({ label, onClick, disabled }: { label: string; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "8px 16px",
        borderRadius: ds.radius,
        fontFamily: ds.fontBody,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        background: "transparent",
        color: disabled ? ds.textMuted : ds.coral,
        border: `1px solid ${disabled ? ds.border : "rgba(224,112,96,0.38)"}`,
        cursor: disabled ? "not-allowed" : "pointer",
        whiteSpace: "nowrap",
      }}
    >
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

function ValidationBadge({ validated, label }: { validated: boolean; label: string }) {
  return (
    <span
      style={{
        fontFamily: ds.fontMono,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        padding: "3px 8px",
        borderRadius: 3,
        background: validated ? ds.satBg : ds.pwBg,
        color: validated ? ds.satColor : ds.pwColor,
        border: `1px solid ${validated ? ds.satBorder : ds.pwBorder}`,
      }}
    >
      {label}: {validated ? "Validated" : "Pending"}
    </span>
  );
}

function ProfileStatusBadge({ assignment }: { assignment: any }) {
  let label = "System-Assigned";
  let bg = ds.satBg;
  let color = ds.satColor;
  let border = ds.satBorder;

  if (assignment?.is_user_override) {
    label = "User Override";
    bg = ds.pwBg;
    color = ds.pwColor;
    border = ds.pwBorder;
  } else if (assignment?.status === "CONFIRMED") {
    label = "Confirmed";
    bg = ds.satBg;
    color = ds.satColor;
    border = ds.satBorder;
  } else if (assignment?.status === "FLAGGED") {
    label = "Flagged";
    bg = ds.wdwBg;
    color = ds.wdwColor;
    border = ds.wdwBorder;
  }

  return (
    <span
      style={{
        fontFamily: ds.fontMono,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        padding: "3px 8px",
        borderRadius: 3,
        background: bg,
        color,
        border: `1px solid ${border}`,
      }}
    >
      {label}
    </span>
  );
}

function ProjectionStatusBadge({ assignment }: { assignment: any }) {
  const projStatus = assignment?.projection_status;
  if (!projStatus) return null;

  let label = "";
  let bg = "";
  let color = "";
  let border = "";
  let pulse = false;

  if (projStatus === "PENDING") {
    label = "Projection Queued";
    bg = ds.goldDim;
    color = ds.gold;
    border = "rgba(200,168,75,0.30)";
  } else if (projStatus === "IN_PROGRESS") {
    label = "Projecting...";
    bg = ds.pwBg;
    color = ds.pwColor;
    border = ds.pwBorder;
    pulse = true;
  } else if (projStatus === "COMPLETE") {
    label = "Projected";
    bg = ds.satBg;
    color = ds.satColor;
    border = ds.satBorder;
  } else if (projStatus === "ERROR") {
    label = "Projection Error";
    bg = ds.wdwBg;
    color = ds.wdwColor;
    border = ds.wdwBorder;
  } else {
    return null;
  }

  const completedAt = assignment?.projection_completed_at;
  let relativeTime = "";
  if (projStatus === "COMPLETE" && completedAt) {
    const diff = Date.now() - new Date(completedAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) relativeTime = "just now";
    else if (mins < 60) relativeTime = `${mins} min ago`;
    else if (mins < 1440) relativeTime = `${Math.floor(mins / 60)}h ago`;
    else relativeTime = `${Math.floor(mins / 1440)}d ago`;
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          fontFamily: ds.fontMono,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          padding: "3px 8px",
          borderRadius: 3,
          background: bg,
          color,
          border: `1px solid ${border}`,
          animation: pulse ? "pulse-opacity 1.5s ease-in-out infinite" : undefined,
        }}
      >
        {label}
      </span>
      {relativeTime && (
        <span style={{ fontFamily: ds.fontMono, fontSize: 10, color: ds.textMuted }}>
          {relativeTime}
        </span>
      )}
    </span>
  );
}

function OverrideModal({
  allProfiles,
  onClose,
  onSubmit,
}: {
  allProfiles: any[];
  onClose: () => void;
  onSubmit: (profileId: string, justification: string) => void;
}) {
  const [profileId, setProfileId] = useState("");
  const [justification, setJustification] = useState("");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: ds.surfaceRaised,
          border: `1px solid ${ds.borderAccent}`,
          borderRadius: ds.radiusLg,
          padding: 24,
          width: 420,
          maxWidth: "90vw",
        }}
      >
        <div style={{ fontFamily: ds.fontMono, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textDim, marginBottom: 16 }}>
          Override Profile Assignment
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontFamily: ds.fontBody, fontSize: 13, color: ds.textDim, display: "block", marginBottom: 4 }}>
            Profile ID
          </label>
          <select
            value={profileId}
            onChange={(e) => setProfileId(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              fontFamily: ds.fontMono,
              fontSize: 12,
              background: ds.surface,
              border: `1px solid ${ds.borderAccent}`,
              borderRadius: ds.radius,
              color: ds.text,
              outline: "none",
              boxSizing: "border-box",
              cursor: "pointer",
            }}
          >
            <option value="" disabled>— Select a profile —</option>
            {allProfiles.map((p) => (
              <option key={p.projection_profile_id} value={p.projection_profile_id}>
                {p.profile_name}{p.size && p.maturity ? ` · ${p.size} · ${p.maturity}` : ""}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontFamily: ds.fontBody, fontSize: 13, color: ds.textDim, display: "block", marginBottom: 4 }}>
            Justification
          </label>
          <textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            rows={3}
            placeholder="Reason for override..."
            style={{
              width: "100%",
              padding: "8px 12px",
              fontFamily: ds.fontSerif,
              fontStyle: "italic",
              fontSize: 14,
              background: ds.surface,
              border: `1px solid ${ds.borderAccent}`,
              borderRadius: ds.radius,
              color: ds.text,
              outline: "none",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <GhostButton label="Cancel" onClick={onClose} />
          <button
            onClick={() => { if (profileId.trim()) onSubmit(profileId.trim(), justification.trim()); }}
            disabled={!profileId.trim()}
            style={{
              padding: "8px 16px",
              borderRadius: ds.radius,
              fontFamily: ds.fontBody,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              background: !profileId.trim() ? ds.textMuted : ds.gold,
              color: "#18140a",
              border: "none",
              cursor: !profileId.trim() ? "not-allowed" : "pointer",
            }}
          >
            Apply Override
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentStatusChip({ status }: { status?: string }) {
  if (!status) return null;
  const upper = status.toUpperCase();
  let bg = ds.surfaceRaised;
  let color = ds.textMuted;
  let border = ds.border;

  if (upper === "PAST_DUE") {
    bg = ds.wdwBg;
    color = ds.wdwColor;
    border = ds.wdwBorder;
  } else if (upper === "DUE_SOON") {
    bg = ds.pwBg;
    color = ds.pwColor;
    border = ds.pwBorder;
  } else if (upper === "SCHEDULED") {
    bg = ds.surfaceRaised;
    color = ds.textMuted;
    border = ds.border;
  }

  return (
    <span
      style={{
        fontFamily: ds.fontMono,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        padding: "2px 6px",
        borderRadius: 3,
        background: bg,
        color,
        border: `1px solid ${border}`,
      }}
    >
      {status}
    </span>
  );
}

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function formatCurrency(amount: number): string {
  return "$" + amount.toLocaleString("en-US");
}
