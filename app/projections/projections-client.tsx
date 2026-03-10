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

/* ------------------------------------------------------------------ */
/*  Colour / style tokens                                              */
/* ------------------------------------------------------------------ */
const BG = "bg-[#0b0f15]";
const SURFACE = "bg-[#111820]";
const BORDER = "border-[#1e2d3d]";
const TEXT1 = "text-[#e2e8f0]";
const TEXT2 = "text-[#8b9bb4]";
const TEXT3 = "text-[#5a6a7e]";
const GOLD = "#d4a843";

/* ------------------------------------------------------------------ */
/*  Workflow steps                                                     */
/* ------------------------------------------------------------------ */
const STEPS = [
  { number: 1, label: "Obligation Term Structure" },
  { number: 2, label: "Projections" },
  { number: 3, label: "Coverage" },
  { number: 4, label: "Approval" },
];

/* ------------------------------------------------------------------ */
/*  Mock obligation term structure data                                */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/*  Obligation summary properties                                     */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/*  Mock projection profile properties                                 */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/*  Mock DSCR corridor projection data                                 */
/* ------------------------------------------------------------------ */
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

  // Base DSCR trajectory: stable → stress → recovery → stabilize
  const baseDscr = [
    1.48, 1.46, 1.44, 1.45, 1.43, 1.41,   // Q3-Q4 2026: stable
    1.38, 1.35, 1.31, 1.27, 1.24, 1.18,   // Q1-Q2 2027: pressure building
    1.14, 1.11, 1.08, 1.12, 1.16, 1.21,   // Q3-Q4 2027: stress trough → early recovery
    1.25, 1.28, 1.31, 1.34, 1.37, 1.39,   // Q1-Q2 2028: recovery
    1.41, 1.43, 1.44, 1.46, 1.47, 1.48,   // Q3-Q4 2028: stabilizing
    1.49, 1.50, 1.51, 1.50, 1.52, 1.53,   // Q1-Q2 2029: stable maturity
  ];

  // Corridor width: narrow during stable, wide during uncertainty
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

/* ------------------------------------------------------------------ */
/*  Root component                                                     */
/* ------------------------------------------------------------------ */
export default function ProjectionsClient() {
  const [activeStep, setActiveStep] = useState(1);
  const [selectedPayment, setSelectedPayment] =
    useState<ObligationPayment | null>(null);

  return (
    <div className={`flex h-screen overflow-hidden ${BG} ${TEXT1}`}>
      <Sidebar />

      {/* Main workbench area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Step indicator bar */}
        <div className="flex shrink-0">
          {STEPS.map((step, i) => {
            const isActive = step.number === activeStep;
            const isPast = step.number < activeStep;
            const isLast = i === STEPS.length - 1;
            return (
              <button
                key={step.number}
                onClick={() => setActiveStep(step.number)}
                className={`flex-1 flex items-center gap-2.5 px-5 py-2.5 text-sm font-medium transition-colors relative ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : isPast
                      ? "bg-[#1a2a40] text-blue-300"
                      : "bg-[#151d28] text-[#5a6a7e]"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isActive
                      ? "bg-white text-blue-600"
                      : isPast
                        ? "bg-blue-400/30 text-blue-300"
                        : "bg-[#1e2d3d] text-[#5a6a7e]"
                  }`}
                >
                  {step.number}
                </span>
                {step.label}
                {/* Chevron separator */}
                {!isLast && (
                  <div className="absolute right-0 top-0 bottom-0 flex items-center">
                    <svg
                      width="20"
                      height="40"
                      viewBox="0 0 20 40"
                      className="translate-x-[10px] z-10"
                    >
                      <path
                        d="M0 0 L15 20 L0 40"
                        fill={
                          isActive
                            ? "#2563eb"
                            : isPast
                              ? "#1a2a40"
                              : "#151d28"
                        }
                        stroke={isActive ? "#2563eb" : "#1e2d3d"}
                        strokeWidth="1"
                      />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Step content */}
        {activeStep === 1 && (
          <ObligationTermStructureStep
            selectedPayment={selectedPayment}
            onSelectPayment={setSelectedPayment}
          />
        )}
        {activeStep === 2 && <ProjectionsStep />}
        {activeStep === 3 && <ComingSoonPlaceholder label="Coverage" />}
        {activeStep === 4 && <ComingSoonPlaceholder label="Approval" />}
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
      {/* Toolbar row */}
      <div className={`px-5 py-2 border-b ${BORDER} shrink-0`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-medium ${TEXT3} uppercase tracking-wide`}
              >
                Deal to Process
              </span>
              <span className="text-sm bg-[#1a2a40] text-blue-400 px-3 py-1 rounded font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                DEAL_20260222_49346d04
                <ChevronDownIcon />
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="text-sm px-3 py-1.5 rounded font-medium transition-colors border"
              style={{
                backgroundColor: GOLD,
                borderColor: GOLD,
                color: "#0b0f15",
              }}
            >
              Validate Obligation Term Structure
            </button>
            <button className="text-sm border border-blue-400/50 text-blue-400 px-3 py-1.5 rounded font-medium hover:bg-[#1a2a40] transition-colors">
              Edit Term Structure
            </button>
            <button className="text-sm border border-red-400/50 text-red-400 px-3 py-1.5 rounded font-medium hover:bg-[#2a1a1a] transition-colors">
              Flag Term Structure
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Counterparty header card */}
        <div className={`px-5 py-4 border-b ${BORDER}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <BuildingIcon />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-base font-medium ${TEXT1}`}>
                  Meridian Precision Manufacturing, LLC
                </span>
                <StarIcon />
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-sm ${TEXT3}`}>
                  Obligation Term Structure &mdash; Payment Schedule Validation
                </span>
                <LockIcon />
              </div>
            </div>
          </div>
        </div>

        {/* Obligation properties section */}
        <div className={`px-5 py-4 border-b ${BORDER}`}>
          <div className="flex items-center gap-2 mb-4">
            <PropertiesIcon />
            <span className={`text-sm font-semibold ${TEXT1}`}>
              Obligation Summary
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-1">
            <div className="space-y-1 min-w-0">
              {OBLIGATION_PROPERTIES_LEFT.map((prop) => (
                <PropertyRow
                  key={prop.label}
                  label={prop.label}
                  value={prop.value}
                />
              ))}
            </div>
            <div className="space-y-1 min-w-0">
              {OBLIGATION_PROPERTIES_RIGHT.map((prop) => (
                <PropertyRow
                  key={prop.label}
                  label={prop.label}
                  value={prop.value}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Payment schedule table */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TableIcon />
              <span className={`text-sm font-semibold ${TEXT1}`}>
                Payment Schedule
              </span>
              <span className={`text-xs ${TEXT3} ml-2`}>
                {MOCK_PAYMENTS.length} of 60 payments shown
              </span>
            </div>
          </div>

          <div className={`border ${BORDER} rounded overflow-hidden`}>
            {/* Table header */}
            <div
              className={`grid grid-cols-[60px_1fr_140px_140px_140px_160px] ${SURFACE} border-b ${BORDER}`}
            >
              <div
                className={`px-3 py-2.5 text-xs font-semibold ${TEXT2} uppercase tracking-wide`}
              >
                #
              </div>
              <div
                className={`px-3 py-2.5 text-xs font-semibold ${TEXT2} uppercase tracking-wide`}
              >
                Payment Due Date
              </div>
              <div
                className={`px-3 py-2.5 text-xs font-semibold ${TEXT2} uppercase tracking-wide text-right`}
              >
                Principal
              </div>
              <div
                className={`px-3 py-2.5 text-xs font-semibold ${TEXT2} uppercase tracking-wide text-right`}
              >
                Interest
              </div>
              <div
                className={`px-3 py-2.5 text-xs font-semibold ${TEXT2} uppercase tracking-wide text-right`}
              >
                Total Payment
              </div>
              <div
                className={`px-3 py-2.5 text-xs font-semibold ${TEXT2} uppercase tracking-wide text-right`}
              >
                Remaining Balance
              </div>
            </div>

            {/* Table rows */}
            {MOCK_PAYMENTS.map((payment) => {
              const isSelected = selectedPayment?.id === payment.id;
              return (
                <button
                  key={payment.id}
                  onClick={() => onSelectPayment(payment)}
                  className={`w-full grid grid-cols-[60px_1fr_140px_140px_140px_160px] border-b border-[#1e2d3d]/50 transition-colors text-left ${
                    isSelected ? "bg-[#1c2940]" : "hover:bg-[#151d28]"
                  }`}
                >
                  <div
                    className={`px-3 py-2.5 text-sm font-mono ${isSelected ? TEXT1 : TEXT3}`}
                  >
                    {payment.paymentNumber}
                  </div>
                  <div
                    className={`px-3 py-2.5 text-sm ${isSelected ? TEXT1 : TEXT2}`}
                  >
                    {payment.paymentDueDate}
                  </div>
                  <div
                    className={`px-3 py-2.5 text-sm font-mono text-right ${isSelected ? TEXT1 : TEXT2}`}
                  >
                    {formatCurrency(payment.scheduledPrincipal)}
                  </div>
                  <div
                    className={`px-3 py-2.5 text-sm font-mono text-right ${isSelected ? TEXT1 : TEXT2}`}
                  >
                    {formatCurrency(payment.scheduledInterest)}
                  </div>
                  <div
                    className={`px-3 py-2.5 text-sm font-mono text-right font-medium ${isSelected ? "text-blue-300" : "text-blue-400"}`}
                  >
                    {formatCurrency(payment.scheduledTotalPayment)}
                  </div>
                  <div
                    className={`px-3 py-2.5 text-sm font-mono text-right ${isSelected ? TEXT1 : TEXT2}`}
                  >
                    {formatCurrency(payment.remainingBalance)}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Summary row */}
          <div
            className={`mt-4 grid grid-cols-2 gap-4`}
          >
            <div className={`border ${BORDER} rounded p-4`}>
              <div className={`text-xs ${TEXT3} uppercase tracking-wide mb-2`}>
                Total Debt Service (Shown)
              </div>
              <div className="flex items-baseline gap-4">
                <div>
                  <span className={`text-xs ${TEXT3}`}>Principal: </span>
                  <span className={`text-sm font-mono ${TEXT1}`}>
                    {formatCurrency(
                      MOCK_PAYMENTS.reduce(
                        (sum, p) => sum + p.scheduledPrincipal,
                        0
                      )
                    )}
                  </span>
                </div>
                <div>
                  <span className={`text-xs ${TEXT3}`}>Interest: </span>
                  <span className={`text-sm font-mono ${TEXT1}`}>
                    {formatCurrency(
                      MOCK_PAYMENTS.reduce(
                        (sum, p) => sum + p.scheduledInterest,
                        0
                      )
                    )}
                  </span>
                </div>
                <div>
                  <span className={`text-xs ${TEXT3}`}>Total: </span>
                  <span className="text-sm font-mono text-blue-400 font-medium">
                    {formatCurrency(
                      MOCK_PAYMENTS.reduce(
                        (sum, p) => sum + p.scheduledTotalPayment,
                        0
                      )
                    )}
                  </span>
                </div>
              </div>
            </div>
            <div className={`border ${BORDER} rounded p-4`}>
              <div className={`text-xs ${TEXT3} uppercase tracking-wide mb-2`}>
                Balance Trajectory
              </div>
              <div className="flex items-baseline gap-4">
                <div>
                  <span className={`text-xs ${TEXT3}`}>Starting: </span>
                  <span className={`text-sm font-mono ${TEXT1}`}>
                    $8,500,000
                  </span>
                </div>
                <div>
                  <span className={`text-xs ${TEXT3}`}>After Pmt 18: </span>
                  <span className={`text-sm font-mono ${TEXT1}`}>
                    {formatCurrency(
                      MOCK_PAYMENTS[MOCK_PAYMENTS.length - 1].remainingBalance
                    )}
                  </span>
                </div>
                <div>
                  <span className={`text-xs ${TEXT3}`}>Paydown: </span>
                  <span className="text-sm font-mono text-green-400">
                    {(
                      ((8500000 -
                        MOCK_PAYMENTS[MOCK_PAYMENTS.length - 1]
                          .remainingBalance) /
                        8500000) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
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
      {/* Toolbar row */}
      <div className={`px-5 py-2 border-b ${BORDER} shrink-0`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${TEXT3} uppercase tracking-wide`}>
              Projection Profile
            </span>
            <span className="text-sm bg-[#1a2a40] text-blue-400 px-3 py-1 rounded font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              PRF_MFG_MID_GRW_01
              <ChevronDownIcon />
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="text-sm px-3 py-1.5 rounded font-medium transition-colors border"
              style={{
                backgroundColor: GOLD,
                borderColor: GOLD,
                color: "#0b0f15",
              }}
            >
              Confirm Profile Assignment
            </button>
            <button className="text-sm border border-blue-400/50 text-blue-400 px-3 py-1.5 rounded font-medium hover:bg-[#1a2a40] transition-colors">
              Override Profile Assignment
            </button>
            <button className="text-sm border border-red-400/50 text-red-400 px-3 py-1.5 rounded font-medium hover:bg-[#2a1a1a] transition-colors">
              Create Scenario
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Counterparty header card */}
        <div className={`px-5 py-4 border-b ${BORDER}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <BuildingIcon />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-base font-medium ${TEXT1}`}>
                  Meridian Precision Manufacturing, LLC
                </span>
                <StarIcon />
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-sm ${TEXT3}`}>
                  Projection Profile Assignment &mdash; Coverage Corridor
                  Analysis
                </span>
                <LockIcon />
              </div>
            </div>
          </div>
        </div>

        {/* Profile properties section */}
        <div className={`px-5 py-4 border-b ${BORDER}`}>
          <div className="flex items-center gap-2 mb-4">
            <PropertiesIcon />
            <span className={`text-sm font-semibold ${TEXT1}`}>
              Projection Profile Properties
            </span>
            <span
              className="ml-2 text-xs px-2 py-0.5 rounded"
              style={{
                backgroundColor: "rgba(34,197,94,0.15)",
                color: "#22c55e",
              }}
            >
              System-Assigned
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-1">
            <div className="space-y-1 min-w-0">
              {PROFILE_PROPERTIES_LEFT.map((prop) => (
                <PropertyRow
                  key={prop.label}
                  label={prop.label}
                  value={prop.value}
                />
              ))}
            </div>
            <div className="space-y-1 min-w-0">
              {PROFILE_PROPERTIES_RIGHT.map((prop) => (
                <PropertyRow
                  key={prop.label}
                  label={prop.label}
                  value={prop.value}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Coverage Corridor Chart */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ChartIcon />
              <span className={`text-sm font-semibold ${TEXT1}`}>
                Coverage Ratio Projection Corridors
              </span>
            </div>

            {/* Temporal minimum callout */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded px-3 py-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs text-red-400">
                  Temporal Min: {TEMPORAL_MIN.dscrBase.toFixed(2)}x at{" "}
                  {TEMPORAL_MIN.period}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-[#d4a843]/10 border border-[#d4a843]/30 rounded px-3 py-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: GOLD }}
                />
                <span className="text-xs" style={{ color: GOLD }}>
                  Covenant: 1.25x
                </span>
              </div>
            </div>
          </div>

          {/* Scenario tabs + ratio selector */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-0.5">
              {scenarioTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveScenario(tab.key)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-t transition-colors ${
                    activeScenario === tab.key
                      ? "bg-[#1a2a40] text-blue-400 border border-[#1e2d3d] border-b-transparent"
                      : `${TEXT3} hover:text-[#8b9bb4]`
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              {ratioButtons.map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => setActiveRatio(btn.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
                    activeRatio === btn.key
                      ? "bg-blue-600 text-white border-blue-600"
                      : `${SURFACE} ${TEXT2} ${BORDER} hover:bg-[#1a2332]`
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chart area */}
          <div
            className={`border ${BORDER} rounded-lg p-4`}
            style={{ backgroundColor: "#0d1219" }}
          >
            <div style={{ width: "100%", height: 420 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={CORRIDOR_DATA}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1e2d3d"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="period"
                    tick={{ fill: "#5a6a7e", fontSize: 11 }}
                    tickLine={{ stroke: "#1e2d3d" }}
                    axisLine={{ stroke: "#1e2d3d" }}
                    interval={2}
                    angle={-30}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis
                    domain={[0.6, 2.0]}
                    tick={{ fill: "#5a6a7e", fontSize: 11 }}
                    tickLine={{ stroke: "#1e2d3d" }}
                    axisLine={{ stroke: "#1e2d3d" }}
                    tickFormatter={(v: number) => `${v.toFixed(1)}x`}
                    width={50}
                  />
                  <Tooltip content={<CorridorTooltip />} />

                  {/* Corridor band (shaded area between upper and lower) */}
                  <Area
                    dataKey="corridor"
                    fill="#3b82f6"
                    fillOpacity={0.12}
                    stroke="none"
                  />

                  {/* Covenant threshold */}
                  <ReferenceLine
                    y={1.25}
                    stroke={GOLD}
                    strokeDasharray="8 4"
                    strokeWidth={1.5}
                    label={{
                      value: "Covenant 1.25x",
                      position: "right",
                      fill: GOLD,
                      fontSize: 11,
                    }}
                  />

                  {/* Breakeven line */}
                  <ReferenceLine
                    y={1.0}
                    stroke="#ef4444"
                    strokeWidth={1.5}
                    label={{
                      value: "B/E 1.0x",
                      position: "right",
                      fill: "#ef4444",
                      fontSize: 11,
                    }}
                  />

                  {/* Stress zone highlight */}
                  <ReferenceArea
                    x1="May 2027"
                    x2="Nov 2027"
                    fill="#ef4444"
                    fillOpacity={0.06}
                    strokeOpacity={0}
                  />

                  {/* Upper corridor boundary */}
                  <Line
                    dataKey="dscrUpper"
                    stroke="#3b82f6"
                    strokeWidth={1}
                    strokeDasharray="4 3"
                    dot={false}
                    opacity={0.5}
                  />

                  {/* Lower corridor boundary */}
                  <Line
                    dataKey="dscrLower"
                    stroke="#3b82f6"
                    strokeWidth={1}
                    strokeDasharray="4 3"
                    dot={false}
                    opacity={0.5}
                  />

                  {/* Base case DSCR line */}
                  <Line
                    dataKey="dscrBase"
                    stroke="#60a5fa"
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
                            fill="#ef4444"
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
                      fill: "#60a5fa",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Chart legend */}
            <div className="flex items-center justify-center gap-6 mt-2 pt-3 border-t border-[#1e2d3d]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-0.5 bg-[#60a5fa] rounded" />
                <span className={`text-xs ${TEXT2}`}>DSCR (Base Case)</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-3 rounded opacity-30"
                  style={{ backgroundColor: "#3b82f6" }}
                />
                <span className={`text-xs ${TEXT2}`}>Projection Corridor</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-0.5 rounded"
                  style={{
                    backgroundColor: GOLD,
                    backgroundImage: `repeating-linear-gradient(90deg, ${GOLD} 0px, ${GOLD} 5px, transparent 5px, transparent 8px)`,
                  }}
                />
                <span className={`text-xs ${TEXT2}`}>Covenant Threshold</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-0.5 bg-red-500 rounded" />
                <span className={`text-xs ${TEXT2}`}>Breakeven</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white" />
                <span className={`text-xs ${TEXT2}`}>Temporal Minimum</span>
              </div>
            </div>
          </div>

          {/* Key metrics summary below chart */}
          <div className="mt-4 grid grid-cols-4 gap-4">
            <MetricCard
              label="Temporal Min DSCR"
              value={`${TEMPORAL_MIN.dscrBase.toFixed(2)}x`}
              sub={TEMPORAL_MIN.period}
              accent="red"
            />
            <MetricCard
              label="Covenant Cushion"
              value={`${(((TEMPORAL_MIN.dscrBase - 1.25) / 1.25) * 100).toFixed(1)}%`}
              sub="At temporal minimum"
              accent={TEMPORAL_MIN.dscrBase < 1.25 ? "red" : "gold"}
            />
            <MetricCard
              label="Average DSCR"
              value={`${(CORRIDOR_DATA.reduce((s, d) => s + d.dscrBase, 0) / CORRIDOR_DATA.length).toFixed(2)}x`}
              sub="36-month projection"
              accent="blue"
            />
            <MetricCard
              label="Max Corridor Width"
              value={`${(Math.max(...CORRIDOR_DATA.map((d) => d.dscrUpper - d.dscrLower))).toFixed(2)}x`}
              sub="Peak uncertainty spread"
              accent="blue"
            />
          </div>
        </div>
      </div>
    </>
  );
}

/* ================================================================== */
/*  Chart sub-components                                               */
/* ================================================================== */

interface DotProps {
  cx: number;
  cy: number;
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
      className="rounded-lg px-4 py-3 shadow-xl border"
      style={{
        backgroundColor: "#111820",
        borderColor: "#1e2d3d",
      }}
    >
      <p className="text-xs font-medium text-[#e2e8f0] mb-2">{label}</p>
      {baseVal !== undefined && (
        <p className="text-sm">
          <span className="text-[#5a6a7e]">DSCR: </span>
          <span
            className={`font-mono font-semibold ${baseVal < 1.25 ? "text-red-400" : "text-blue-400"}`}
          >
            {baseVal.toFixed(2)}x
          </span>
          {isMin && (
            <span className="ml-2 text-xs text-red-400 font-medium">
              TEMPORAL MIN
            </span>
          )}
        </p>
      )}
      {corridorVal && (
        <p className="text-sm">
          <span className="text-[#5a6a7e]">Corridor: </span>
          <span className="font-mono text-[#8b9bb4]">
            {corridorVal[0].toFixed(2)}x – {corridorVal[1].toFixed(2)}x
          </span>
        </p>
      )}
      {baseVal !== undefined && (
        <p className="text-sm">
          <span className="text-[#5a6a7e]">Covenant Cushion: </span>
          <span
            className={`font-mono ${baseVal < 1.25 ? "text-red-400" : "text-green-400"}`}
          >
            {(((baseVal - 1.25) / 1.25) * 100).toFixed(1)}%
          </span>
        </p>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: "red" | "gold" | "blue" | "green";
}) {
  const accentColors = {
    red: "text-red-400",
    gold: `text-[${GOLD}]`,
    blue: "text-blue-400",
    green: "text-green-400",
  };
  return (
    <div className={`border ${BORDER} rounded p-4`}>
      <div className={`text-xs ${TEXT3} uppercase tracking-wide mb-1`}>
        {label}
      </div>
      <div className={`text-lg font-mono font-semibold ${accentColors[accent]}`}>
        {value}
      </div>
      <div className={`text-xs ${TEXT3} mt-0.5`}>{sub}</div>
    </div>
  );
}

/* ================================================================== */
/*  Coming Soon placeholder                                            */
/* ================================================================== */

function ComingSoonPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <span className={`text-lg ${TEXT3}`}>
          {label} &mdash; coming soon
        </span>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function formatCurrency(amount: number): string {
  return "$" + amount.toLocaleString("en-US");
}

function PropertyRow({ label, value }: { label: string; value: string }) {
  const isEmpty = !value;
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
    <div className="flex items-baseline gap-3 py-1.5">
      <span className="text-sm text-blue-400 w-[180px] shrink-0 truncate">
        {label}
      </span>
      {isEmpty ? (
        <span className={`text-sm italic ${TEXT3}`}>No value</span>
      ) : isHighlighted ? (
        <span className="text-sm font-semibold text-[#e2e8f0]">{value}</span>
      ) : (
        <span className={`text-sm ${TEXT2}`}>{value}</span>
      )}
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

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5a6a7e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d4a843" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function PropertiesIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b9bb4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function TableIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b9bb4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b9bb4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );
}

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
