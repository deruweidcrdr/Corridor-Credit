"use client";

import { useState } from "react";
import Sidebar from "@/app/components/sidebar";
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
/*  Mock obligation term structure data                                */
/* ================================================================== */
interface ObligationPayment {
  id: string;
  paymentNumber: number;
  paymentDueDate: string;
  scheduledPrincipal: number;
  scheduledInterest: number;
  scheduledTotalPayment: number;
  remainingBalance: number;
}

const CONTRACT_ID = "CNT_20260305_001";

const MOCK_PAYMENTS: ObligationPayment[] = [
  { id: `PMT_${CONTRACT_ID}_1`, paymentNumber: 1, paymentDueDate: "2026-07-01", scheduledPrincipal: 118333, scheduledInterest: 60208, scheduledTotalPayment: 178541, remainingBalance: 8381667 },
  { id: `PMT_${CONTRACT_ID}_2`, paymentNumber: 2, paymentDueDate: "2026-08-01", scheduledPrincipal: 118333, scheduledInterest: 59369, scheduledTotalPayment: 177702, remainingBalance: 8263334 },
  { id: `PMT_${CONTRACT_ID}_3`, paymentNumber: 3, paymentDueDate: "2026-09-01", scheduledPrincipal: 118333, scheduledInterest: 58531, scheduledTotalPayment: 176864, remainingBalance: 8145001 },
  { id: `PMT_${CONTRACT_ID}_4`, paymentNumber: 4, paymentDueDate: "2026-10-01", scheduledPrincipal: 118333, scheduledInterest: 57694, scheduledTotalPayment: 176027, remainingBalance: 8026668 },
  { id: `PMT_${CONTRACT_ID}_5`, paymentNumber: 5, paymentDueDate: "2026-11-01", scheduledPrincipal: 118333, scheduledInterest: 56856, scheduledTotalPayment: 175189, remainingBalance: 7908335 },
  { id: `PMT_${CONTRACT_ID}_6`, paymentNumber: 6, paymentDueDate: "2026-12-01", scheduledPrincipal: 118333, scheduledInterest: 56017, scheduledTotalPayment: 174350, remainingBalance: 7790002 },
  { id: `PMT_${CONTRACT_ID}_7`, paymentNumber: 7, paymentDueDate: "2027-01-01", scheduledPrincipal: 118333, scheduledInterest: 55179, scheduledTotalPayment: 173512, remainingBalance: 7671669 },
  { id: `PMT_${CONTRACT_ID}_8`, paymentNumber: 8, paymentDueDate: "2027-02-01", scheduledPrincipal: 118333, scheduledInterest: 54341, scheduledTotalPayment: 172674, remainingBalance: 7553336 },
  { id: `PMT_${CONTRACT_ID}_9`, paymentNumber: 9, paymentDueDate: "2027-03-01", scheduledPrincipal: 118333, scheduledInterest: 53503, scheduledTotalPayment: 171836, remainingBalance: 7435003 },
  { id: `PMT_${CONTRACT_ID}_10`, paymentNumber: 10, paymentDueDate: "2027-04-01", scheduledPrincipal: 118333, scheduledInterest: 52664, scheduledTotalPayment: 170997, remainingBalance: 7316670 },
  { id: `PMT_${CONTRACT_ID}_11`, paymentNumber: 11, paymentDueDate: "2027-05-01", scheduledPrincipal: 118333, scheduledInterest: 51826, scheduledTotalPayment: 170159, remainingBalance: 7198337 },
  { id: `PMT_${CONTRACT_ID}_12`, paymentNumber: 12, paymentDueDate: "2027-06-01", scheduledPrincipal: 118333, scheduledInterest: 50988, scheduledTotalPayment: 169321, remainingBalance: 7080004 },
  { id: `PMT_${CONTRACT_ID}_13`, paymentNumber: 13, paymentDueDate: "2027-07-01", scheduledPrincipal: 118333, scheduledInterest: 50150, scheduledTotalPayment: 168483, remainingBalance: 6961671 },
  { id: `PMT_${CONTRACT_ID}_14`, paymentNumber: 14, paymentDueDate: "2027-08-01", scheduledPrincipal: 118333, scheduledInterest: 49312, scheduledTotalPayment: 167645, remainingBalance: 6843338 },
  { id: `PMT_${CONTRACT_ID}_15`, paymentNumber: 15, paymentDueDate: "2027-09-01", scheduledPrincipal: 118333, scheduledInterest: 48474, scheduledTotalPayment: 166807, remainingBalance: 6725005 },
  { id: `PMT_${CONTRACT_ID}_16`, paymentNumber: 16, paymentDueDate: "2027-10-01", scheduledPrincipal: 118333, scheduledInterest: 47635, scheduledTotalPayment: 165968, remainingBalance: 6606672 },
  { id: `PMT_${CONTRACT_ID}_17`, paymentNumber: 17, paymentDueDate: "2027-11-01", scheduledPrincipal: 118333, scheduledInterest: 46797, scheduledTotalPayment: 165130, remainingBalance: 6488339 },
  { id: `PMT_${CONTRACT_ID}_18`, paymentNumber: 18, paymentDueDate: "2027-12-01", scheduledPrincipal: 118333, scheduledInterest: 45959, scheduledTotalPayment: 164292, remainingBalance: 6370006 },
];

/* ================================================================== */
/*  Obligation summary properties                                     */
/* ================================================================== */
const OBLIGATION_PROPERTIES_LEFT: { label: string; value: string }[] = [
  { label: "Obligation ID", value: "OBL_20260305_001" },
  { label: "Obligation Type", value: "PAYMENT_OBLIGATION" },
  { label: "Contract ID", value: CONTRACT_ID },
  { label: "Principal Amount", value: "$8,500,000" },
  { label: "Interest Rate Index", value: "SOFR" },
  { label: "Interest Rate Spread", value: "350 bps" },
  { label: "Amortization Type", value: "STRAIGHT_LINE" },
];

const OBLIGATION_PROPERTIES_RIGHT: { label: string; value: string }[] = [
  { label: "Payment Frequency", value: "MONTHLY" },
  { label: "First Payment Date", value: "2026-07-01" },
  { label: "Maturity Date", value: "2031-06-01" },
  { label: "Total Payments", value: "60" },
  { label: "All-In Rate", value: "8.50%" },
  { label: "Total Interest", value: "$2,143,325" },
  { label: "Measurement Frequency", value: "MONTHLY" },
];

/* ================================================================== */
/*  Mock projection profile properties                                 */
/* ================================================================== */
const PROFILE_PROPERTIES_LEFT: { label: string; value: string }[] = [
  { label: "Profile ID", value: "PRF_MFG_MID_GRW_01" },
  { label: "Industry", value: "Manufacturing — Precision Components" },
  { label: "NAICS Code", value: "332710" },
  { label: "Scale", value: "Middle Market ($50-250M Rev)" },
  { label: "Maturity Stage", value: "GROWTH" },
  { label: "Market Orientation", value: "B2B" },
  { label: "Revenue Characteristics", value: "Contract / Order-Based" },
];

const PROFILE_PROPERTIES_RIGHT: { label: string; value: string }[] = [
  { label: "Typical Leverage", value: "2.5x – 3.5x" },
  { label: "Capitalization", value: "MODERATE" },
  { label: "Commodity Risk Exposure", value: "MODERATE (Metals / Raw Materials)" },
  { label: "Fixed Charge Exposure", value: "ADEQUATE" },
  { label: "Working Capital Intensity", value: "HIGH" },
  { label: "Revenue Cyclicality", value: "MODERATE" },
  { label: "Assignment Confidence", value: "0.87" },
];

/* ================================================================== */
/*  Mock DSCR corridor projection data                                 */
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

/* ================================================================== */
/*  Root component                                                     */
/* ================================================================== */
export default function ProjectionsClient() {
  const [activeStep, setActiveStep] = useState(1);
  const [selectedPayment, setSelectedPayment] =
    useState<ObligationPayment | null>(null);

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
          <ObligationTermStructureStep
            selectedPayment={selectedPayment}
            onSelectPayment={setSelectedPayment}
          />
        )}
        {activeStep === 2 && <ProjectionsStep />}
        {activeStep === 3 && <ComingSoon label="Collateral" />}
        {activeStep === 4 && <ComingSoon label="Approval" />}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  STEP 1 — Obligation Term Structure                                 */
/* ================================================================== */

function ObligationTermStructureStep({
  selectedPayment,
  onSelectPayment,
}: {
  selectedPayment: ObligationPayment | null;
  onSelectPayment: (p: ObligationPayment | null) => void;
}) {
  return (
    <>
      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px 80px" }}>
        {/* Page header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontFamily: ds.fontSerif, fontSize: 28, fontStyle: "italic", color: ds.text, letterSpacing: "-0.01em", lineHeight: 1.15 }}>
              Obligation Term Structure
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <GhostButton label="Edit Term Structure" />
              <GhostButtonWarn label="Flag Term Structure" />
            </div>
          </div>
          <DealSubheader items={[
            { label: "DEAL", value: "DEAL_20260222_49346d04" },
            { label: "COUNTERPARTY", value: "Meridian Precision Manufacturing, LLC" },
            { label: "CONTRACT", value: CONTRACT_ID },
            { label: "OBLIGATION", value: "OBL_20260305_001" },
          ]} />
        </div>

        {/* ── Obligation Summary ── */}
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
              PAYMENT_OBLIGATION · STRAIGHT_LINE
            </span>
          </div>
          <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
            <div>
              {OBLIGATION_PROPERTIES_LEFT.map((prop) => (
                <PropertyRow key={prop.label} label={prop.label} value={prop.value} />
              ))}
            </div>
            <div>
              {OBLIGATION_PROPERTIES_RIGHT.map((prop) => (
                <PropertyRow key={prop.label} label={prop.label} value={prop.value} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Payment Schedule ── */}
        <SectionDivider label="Payment Schedule" />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontFamily: ds.fontMono, fontSize: 11, color: ds.textMuted }}>
            {MOCK_PAYMENTS.length} of 60 payments shown
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
              gridTemplateColumns: "60px 1fr 140px 140px 140px 160px",
              background: ds.surfaceRaised,
              borderBottom: `1px solid ${ds.border}`,
            }}
          >
            {["#", "Payment Due Date", "Principal", "Interest", "Total Payment", "Remaining Balance"].map((h, i) => (
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
                  textAlign: i >= 2 ? "right" : "left",
                }}
              >
                {h}
              </div>
            ))}
          </div>

          {/* Table rows */}
          {MOCK_PAYMENTS.map((payment) => {
            const isSelected = selectedPayment?.id === payment.id;
            return (
              <button
                key={payment.id}
                onClick={() => onSelectPayment(payment)}
                style={{
                  width: "100%",
                  display: "grid",
                  gridTemplateColumns: "60px 1fr 140px 140px 140px 160px",
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
              Total Debt Service (Shown)
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
              <div>
                <span style={{ fontFamily: ds.fontMono, fontSize: 11, color: ds.textMuted }}>Principal: </span>
                <span style={{ fontFamily: ds.fontMono, fontSize: 15, fontWeight: 500, color: ds.text }}>
                  {formatCurrency(MOCK_PAYMENTS.reduce((sum, p) => sum + p.scheduledPrincipal, 0))}
                </span>
              </div>
              <div>
                <span style={{ fontFamily: ds.fontMono, fontSize: 11, color: ds.textMuted }}>Interest: </span>
                <span style={{ fontFamily: ds.fontMono, fontSize: 15, fontWeight: 500, color: ds.text }}>
                  {formatCurrency(MOCK_PAYMENTS.reduce((sum, p) => sum + p.scheduledInterest, 0))}
                </span>
              </div>
              <div>
                <span style={{ fontFamily: ds.fontMono, fontSize: 11, color: ds.textMuted }}>Total: </span>
                <span style={{ fontFamily: ds.fontMono, fontSize: 15, fontWeight: 500, color: ds.gold }}>
                  {formatCurrency(MOCK_PAYMENTS.reduce((sum, p) => sum + p.scheduledTotalPayment, 0))}
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
                <span style={{ fontFamily: ds.fontMono, fontSize: 15, fontWeight: 500, color: ds.text }}>$8,500,000</span>
              </div>
              <div>
                <span style={{ fontFamily: ds.fontMono, fontSize: 11, color: ds.textMuted }}>After Pmt 18: </span>
                <span style={{ fontFamily: ds.fontMono, fontSize: 15, fontWeight: 500, color: ds.text }}>
                  {formatCurrency(MOCK_PAYMENTS[MOCK_PAYMENTS.length - 1].remainingBalance)}
                </span>
              </div>
              <div>
                <span style={{ fontFamily: ds.fontMono, fontSize: 11, color: ds.textMuted }}>Paydown: </span>
                <span style={{ fontFamily: ds.fontMono, fontSize: 15, fontWeight: 500, color: ds.green }}>
                  {(((8500000 - MOCK_PAYMENTS[MOCK_PAYMENTS.length - 1].remainingBalance) / 8500000) * 100).toFixed(1)}%
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
          <FooterMeta label="Contract" value={CONTRACT_ID} />
          <FooterMeta label="Obligation" value="OBL_20260305_001" />
          <FooterMeta label="Principal" value="$8,500,000" />
          <FooterMeta label="All-in Rate" value="8.50%" valueColor={ds.amber} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <GhostButtonWarn label="Reject Structure" />
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
            Validate Structure →
          </button>
        </div>
      </div>
    </>
  );
}

/* ================================================================== */
/*  STEP 2 — Projections (Coverage Corridor)                           */
/* ================================================================== */

function ProjectionsStep() {
  const [activeScenario, setActiveScenario] = useState<
    "base" | "stress" | "optimistic"
  >("base");
  const [activeRatio, setActiveRatio] = useState<
    "DSCR" | "LLCR" | "GDSCR" | "All"
  >("DSCR");

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

  return (
    <>
      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px 80px" }}>
        {/* Page header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontFamily: ds.fontSerif, fontSize: 28, fontStyle: "italic", color: ds.text, letterSpacing: "-0.01em", lineHeight: 1.15 }}>
              Coverage Corridor Analysis
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <GhostButton label="Override Profile Assignment" />
              <GhostButton label="Create Scenario" />
            </div>
          </div>
          <DealSubheader items={[
            { label: "DEAL", value: "DEAL_20260222_49346d04" },
            { label: "COUNTERPARTY", value: "Meridian Precision Manufacturing, LLC" },
            { label: "PROFILE", value: "PRF_MFG_MID_GRW_01" },
            { label: "HORIZON", value: "36 months" },
          ]} />
        </div>

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
            <span
              style={{
                fontFamily: ds.fontMono,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                padding: "3px 8px",
                borderRadius: 3,
                background: ds.satBg,
                color: ds.satColor,
                border: `1px solid ${ds.satBorder}`,
              }}
            >
              System-Assigned
            </span>
          </div>
          <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
            <div>
              {PROFILE_PROPERTIES_LEFT.map((prop) => (
                <PropertyRow key={prop.label} label={prop.label} value={prop.value} />
              ))}
            </div>
            <div>
              {PROFILE_PROPERTIES_RIGHT.map((prop) => (
                <PropertyRow key={prop.label} label={prop.label} value={prop.value} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Coverage Corridor Chart ── */}
        <SectionDivider label="Coverage Ratio Projection Corridors" />

        {/* Temporal minimum + covenant callout */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: ds.wdwBg,
                border: `1px solid ${ds.wdwBorder}`,
                borderRadius: 4,
                padding: "5px 12px",
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: ds.wdwColor }} />
              <span style={{ fontFamily: ds.fontMono, fontSize: 11, fontWeight: 500, color: ds.wdwColor }}>
                Temporal Min: {TEMPORAL_MIN.dscrBase.toFixed(2)}x at {TEMPORAL_MIN.period}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: ds.goldDim,
                border: `1px solid rgba(200,168,75,0.30)`,
                borderRadius: 4,
                padding: "5px 12px",
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: ds.gold }} />
              <span style={{ fontFamily: ds.fontMono, fontSize: 11, fontWeight: 500, color: ds.gold }}>
                Covenant: 1.25x
              </span>
            </div>
          </div>
        </div>

        {/* Scenario tabs + ratio selector */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 2 }}>
            {scenarioTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveScenario(tab.key)}
                style={{
                  padding: "7px 16px",
                  fontFamily: ds.fontBody,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  borderRadius: `${ds.radius}px ${ds.radius}px 0 0`,
                  border: activeScenario === tab.key ? `1px solid ${ds.border}` : "1px solid transparent",
                  borderBottom: activeScenario === tab.key ? `1px solid ${ds.bg}` : `1px solid ${ds.border}`,
                  background: activeScenario === tab.key ? ds.surface : "transparent",
                  color: activeScenario === tab.key ? ds.gold : ds.textMuted,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {ratioButtons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => setActiveRatio(btn.key)}
                style={{
                  padding: "5px 12px",
                  fontFamily: ds.fontMono,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  borderRadius: 4,
                  border: activeRatio === btn.key
                    ? `1px solid ${ds.gold}`
                    : `1px solid ${ds.border}`,
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
        <div
          style={{
            background: ds.surface,
            border: `1px solid ${ds.border}`,
            borderRadius: ds.radiusLg,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <div style={{ width: "100%", height: 420 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={CORRIDOR_DATA}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={ds.border}
                  vertical={false}
                />
                <XAxis
                  dataKey="period"
                  tick={{ fill: ds.textMuted, fontSize: 11, fontFamily: ds.fontMono }}
                  tickLine={{ stroke: ds.border }}
                  axisLine={{ stroke: ds.border }}
                  interval={2}
                  angle={-30}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  domain={[0.6, 2.0]}
                  tick={{ fill: ds.textMuted, fontSize: 11, fontFamily: ds.fontMono }}
                  tickLine={{ stroke: ds.border }}
                  axisLine={{ stroke: ds.border }}
                  tickFormatter={(v: number) => `${v.toFixed(1)}x`}
                  width={50}
                />
                <Tooltip content={<CorridorTooltip />} />

                {/* Corridor band */}
                <Area
                  dataKey="corridor"
                  fill={ds.blue}
                  fillOpacity={0.12}
                  stroke="none"
                />

                {/* Covenant threshold */}
                <ReferenceLine
                  y={1.25}
                  stroke={ds.gold}
                  strokeDasharray="8 4"
                  strokeWidth={1.5}
                  label={{
                    value: "Covenant 1.25x",
                    position: "right",
                    fill: ds.gold,
                    fontSize: 11,
                  }}
                />

                {/* Breakeven line */}
                <ReferenceLine
                  y={1.0}
                  stroke={ds.coral}
                  strokeWidth={1.5}
                  label={{
                    value: "B/E 1.0x",
                    position: "right",
                    fill: ds.coral,
                    fontSize: 11,
                  }}
                />

                {/* Stress zone highlight */}
                <ReferenceArea
                  x1="May 2027"
                  x2="Nov 2027"
                  fill={ds.coral}
                  fillOpacity={0.06}
                  strokeOpacity={0}
                />

                {/* Upper corridor boundary */}
                <Line
                  dataKey="dscrUpper"
                  stroke={ds.blue}
                  strokeWidth={1}
                  strokeDasharray="4 3"
                  dot={false}
                  opacity={0.5}
                />

                {/* Lower corridor boundary */}
                <Line
                  dataKey="dscrLower"
                  stroke={ds.blue}
                  strokeWidth={1}
                  strokeDasharray="4 3"
                  dot={false}
                  opacity={0.5}
                />

                {/* Base case DSCR line */}
                <Line
                  dataKey="dscrBase"
                  stroke={ds.blue}
                  strokeWidth={2.5}
                  dot={(props: DotProps) => {
                    const { cx, cy, payload } = props;
                    if (
                      payload &&
                      payload.dscrBase === TEMPORAL_MIN.dscrBase &&
                      payload.period === TEMPORAL_MIN.period
                    ) {
                      return (
                        <circle
                          key={`min-${payload.period}`}
                          cx={cx}
                          cy={cy}
                          r={6}
                          fill={ds.coral}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      );
                    }
                    return (
                      <circle
                        key={`dot-${payload?.period}`}
                        cx={cx}
                        cy={cy}
                        r={0}
                        fill="transparent"
                      />
                    );
                  }}
                  activeDot={{
                    r: 5,
                    fill: ds.blue,
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Chart legend */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 24,
              marginTop: 8,
              paddingTop: 12,
              borderTop: `1px solid ${ds.border}`,
            }}
          >
            <LegendItem color={ds.blue} label="DSCR (Base Case)" type="line" />
            <LegendItem color={ds.blue} label="Projection Corridor" type="area" />
            <LegendItem color={ds.gold} label="Covenant Threshold" type="dashed" />
            <LegendItem color={ds.coral} label="Breakeven" type="line" />
            <LegendItem color={ds.coral} label="Temporal Minimum" type="dot" />
          </div>
        </div>

        {/* Key metrics summary */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
          <MetricCard
            label="Temporal Min DSCR"
            value={`${TEMPORAL_MIN.dscrBase.toFixed(2)}x`}
            sub={TEMPORAL_MIN.period}
            accent={ds.wdwColor}
          />
          <MetricCard
            label="Covenant Cushion"
            value={`${(((TEMPORAL_MIN.dscrBase - 1.25) / 1.25) * 100).toFixed(1)}%`}
            sub="At temporal minimum"
            accent={TEMPORAL_MIN.dscrBase < 1.25 ? ds.wdwColor : ds.gold}
          />
          <MetricCard
            label="Average DSCR"
            value={`${(CORRIDOR_DATA.reduce((s, d) => s + d.dscrBase, 0) / CORRIDOR_DATA.length).toFixed(2)}x`}
            sub="36-month projection"
            accent={ds.blue}
          />
          <MetricCard
            label="Max Corridor Width"
            value={`${(Math.max(...CORRIDOR_DATA.map((d) => d.dscrUpper - d.dscrLower))).toFixed(2)}x`}
            sub="Peak uncertainty spread"
            accent={ds.amber}
          />
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
          <FooterMeta label="Profile" value="PRF_MFG_MID_GRW_01" />
          <FooterMeta label="Scenario" value="Base Case" />
          <FooterMeta label="Temporal Min" value={`${TEMPORAL_MIN.dscrBase.toFixed(2)}x`} valueColor={ds.wdwColor} />
          <FooterMeta label="Covenant Cushion" value={`${(((TEMPORAL_MIN.dscrBase - 1.25) / 1.25) * 100).toFixed(1)}%`} valueColor={TEMPORAL_MIN.dscrBase < 1.25 ? ds.wdwColor : ds.green} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <GhostButton label="Override Profile" />
          <button
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
              cursor: "pointer",
            }}
          >
            Flag for Review
          </button>
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
            Confirm Profile →
          </button>
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
    value === "B2B" ||
    value === "MODERATE" ||
    value === "ADEQUATE" ||
    value === "HIGH" ||
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
/*  Helpers                                                            */
/* ================================================================== */

function formatCurrency(amount: number): string {
  return "$" + amount.toLocaleString("en-US");
}
