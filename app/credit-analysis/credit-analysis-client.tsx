"use client";

import { useState } from "react";
import Sidebar from "@/app/components/sidebar";

/* ================================================================== */
/*  Design-system tokens (from DESIGN_SYSTEM.md)                       */
/* ================================================================== */
const ds = {
  bg: "#1e2128",
  surface: "#252930",
  surfaceRaised: "#2c3038",
  surfaceDeep: "#191c22",
  border: "rgba(255,255,255,0.07)",
  borderAccent: "rgba(255,255,255,0.14)",
  gold: "#c8a84b",
  goldDim: "rgba(200,168,75,0.14)",
  green: "#4caf82",
  greenDim: "rgba(76,175,130,0.12)",
  amber: "#e8a040",
  amberDim: "rgba(232,160,64,0.12)",
  coral: "#e07060",
  coralDim: "rgba(224,112,96,0.13)",
  blue: "#5b9bd5",
  blueDim: "rgba(91,155,213,0.12)",
  text: "#d8dce6",
  textDim: "#7a8494",
  textMuted: "#4e5568",
  fontBody: "'Syne', sans-serif",
  fontMono: "'DM Mono', monospace",
  fontSerif: "'Instrument Serif', serif",
  radius: 6,
  radiusLg: 10,
  /* SAT / PW / WDW */
  satColor: "#4caf82",
  satBg: "rgba(76,175,130,0.10)",
  satBorder: "rgba(76,175,130,0.28)",
  pwColor: "#e8a040",
  pwBg: "rgba(232,160,64,0.10)",
  pwBorder: "rgba(232,160,64,0.30)",
  wdwColor: "#e07060",
  wdwBg: "rgba(224,112,96,0.10)",
  wdwBorder: "rgba(224,112,96,0.28)",
};

/* ================================================================== */
/*  Workflow steps                                                     */
/* ================================================================== */
const STEPS = [
  { number: 1, label: "Deal Value" },
  { number: 2, label: "Policy" },
  { number: 3, label: "Yardbook" },
  { number: 4, label: "Approval" },
];

/* ================================================================== */
/*  Market data                                                        */
/* ================================================================== */
const MARKET_DATA = [
  { label: "SOFR (1M)", value: "4.33%", delta: "▼ 3 bps", dir: "down" as const },
  { label: "10Y UST", value: "4.61%", delta: "▲ 5 bps", dir: "up" as const },
  { label: "IG Credit Spread", value: "148 bps", delta: "▼ 2 bps", dir: "down" as const },
  { label: "LL Index Spread", value: "338 bps", delta: "▲ 7 bps", dir: "up" as const },
  { label: "Private Credit MM", value: "560 bps", delta: "— flat", dir: "flat" as const },
  { label: "Renew. PF (10Y)", value: "215 bps", delta: "▼ 5 bps", dir: "down" as const },
  { label: "VIX", value: "18.2", delta: "▲ 0.8", dir: "up" as const },
  { label: "Spread Dispersion", value: "155 bps", delta: "▲ 4 bps", dir: "up" as const },
  { label: "Sector EDF", value: "0.48%", delta: "— flat", dir: "flat" as const },
  { label: "SOFR Forward (1Y)", value: "4.15%", delta: "▼ est.", dir: "down" as const },
];

/* ================================================================== */
/*  Policy dimensions                                                  */
/* ================================================================== */
const POLICY_DIMS = [
  { code: "PC", name: "Primary Coverage", metric: "Min DSCR 1.28x", threshold: "≥ 1.25x", variance: "+0.03x", varDir: "warn" as const, band: "pw" as const },
  { code: "PV", name: "Portfolio Value", metric: "LLCR 1.45x", threshold: "≥ 1.20x", variance: "+0.25x", varDir: "pos" as const, band: "sat" as const },
  { code: "PB", name: "Business Trend", metric: "GPM 48.3%", threshold: "≥ 35%", variance: "Deteriorating", varDir: "warn" as const, band: "pw" as const },
  { code: "PQ", name: "Liquidity Quality", metric: "CR 1.62x", threshold: "≥ 1.50x", variance: "+0.12x", varDir: "pos" as const, band: "sat" as const },
  { code: "PM", name: "Cost Structure", metric: "OCR 67.8%", threshold: "≤ 65%", variance: "+2.8% over", varDir: "neg" as const, band: "wdw" as const },
];

/* ================================================================== */
/*  Root component                                                     */
/* ================================================================== */
export default function CreditAnalysisClient() {
  const [activeStep, setActiveStep] = useState(1);

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
            height: 44,
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
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  fontFamily: ds.fontBody,
                  color: isActive ? ds.text : ds.textMuted,
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
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    fontFamily: ds.fontMono,
                    background: isActive ? ds.gold : isDone ? ds.greenDim : ds.surfaceRaised,
                    color: isActive ? "#1a1a14" : isDone ? ds.green : ds.textDim,
                  }}
                >
                  {step.number}
                </span>
                {step.label}
              </button>
            );
          })}
        </div>

        {/* ── Step content ── */}
        {activeStep === 1 && <DealValueStep />}
        {activeStep === 2 && <PolicyStep />}
        {activeStep === 3 && <ComingSoon label="Yardbook Assembly" />}
        {activeStep === 4 && <ComingSoon label="Approval" />}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  STEP 1 — Deal Value                                                */
/* ================================================================== */
function DealValueStep() {
  return (
    <>
      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px 80px" }}>
        {/* Page header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 20,
            paddingBottom: 18,
            borderBottom: `1px solid ${ds.border}`,
          }}
        >
          <div>
            <div style={{ fontFamily: ds.fontSerif, fontSize: 22, fontStyle: "italic", color: ds.text }}>
              Deal Value Analysis
            </div>
            <div style={{ fontSize: 11, color: ds.textMuted, fontFamily: ds.fontMono, marginTop: 4, letterSpacing: "0.04em" }}>
              DEAL · GH-2026-0083 &nbsp;|&nbsp; GreenHorizon Energy LLC &nbsp;|&nbsp; 180 MW Solar · $250MM Construction + Term &nbsp;|&nbsp; RUN · 2026-02-26
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <GhostButton label="⤓ Export" />
            <GhostButton label="Request Collateral Reassessment" />
            <GhostButton label="Request Risk Reassessment" />
          </div>
        </div>

        {/* Market Data Ribbon */}
        <MarketDataRibbon />

        {/* Section divider */}
        <SectionDivider label="Workflow Inputs from Projections & Collateral" />

        {/* Three-column grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
          <CoveragePanel />
          <CollateralPanel />
          <DealValuePanel />
        </div>

        {/* Section divider */}
        <SectionDivider label="Policy Dimension Preview — Carries Forward to Step 2" />

        {/* Policy bridge */}
        <PolicyBridge />

        <div style={{ height: 60 }} />
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
          <FooterMeta label="Deal" value="GH-2026-0083" />
          <FooterMeta label="Facility" value="$250MM Const. + Term" />
          <FooterMeta label="All-in Rate" value="SOFR + 250 bps (6.83%)" />
          <FooterMeta label="Fund ROE" value="14.2%" valueColor={ds.green} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <GhostButton label="Request Collateral Reassessment" />
          <button
            style={{
              padding: "8px 14px",
              borderRadius: ds.radius,
              fontFamily: ds.fontBody,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              background: ds.coral,
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Recommend Decline
          </button>
          <button
            style={{
              padding: "8px 16px",
              borderRadius: ds.radius,
              fontFamily: ds.fontBody,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              background: ds.gold,
              color: "#18140a",
              border: "none",
              cursor: "pointer",
            }}
          >
            Advance for Policy →
          </button>
        </div>
      </div>
    </>
  );
}

/* ================================================================== */
/*  Market Data Ribbon                                                 */
/* ================================================================== */
function MarketDataRibbon() {
  return (
    <div
      style={{
        background: ds.surface,
        border: `1px solid ${ds.border}`,
        borderRadius: ds.radiusLg,
        overflow: "hidden",
        marginBottom: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 18px",
          background: ds.surfaceRaised,
          borderBottom: `1px solid ${ds.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: ds.textMuted, fontFamily: ds.fontMono }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: ds.green, boxShadow: `0 0 0 3px rgba(76,175,130,0.2)` }} />
          Market Data · MKT_20260226_001
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <SessionChip />
          <span style={{ fontSize: 9, fontFamily: ds.fontMono, color: ds.textMuted }}>Updated 07:30 EST</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 0, overflowX: "auto", padding: "14px 18px" }}>
        {MARKET_DATA.map((item, i) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              paddingRight: 20,
              borderRight: i < MARKET_DATA.length - 1 ? `1px solid ${ds.border}` : "none",
              marginRight: i < MARKET_DATA.length - 1 ? 20 : 0,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: ds.textMuted, fontFamily: ds.fontMono, fontWeight: 500 }}>
              {item.label}
            </div>
            <div style={{ fontFamily: ds.fontMono, fontSize: 14, fontWeight: 500, color: ds.text }}>
              {item.value}
            </div>
            <div style={{ fontFamily: ds.fontMono, fontSize: 9, color: item.dir === "up" ? ds.green : item.dir === "down" ? ds.coral : ds.textMuted }}>
              {item.delta}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Column 1: Counterparty Risk — Coverage                             */
/* ================================================================== */
function CoveragePanel() {
  const coverageMetrics = [
    { label: "Min DSCR (Stress Point)", value: "1.28x", sub: "Policy: ≥ 1.25x" },
    { label: "LLCR", value: "1.45x", sub: "Policy: ≥ 1.20x" },
    { label: "DSCR Buffer", value: "21.9%", sub: "→ 185–220 bps required spread", valueColor: ds.amber },
    { label: "Avg CFADS (Annual)", value: "$21.4MM", sub: "P50 generation basis" },
    { label: "Gross Margin Trend", value: "48.3%", sub: null, chip: { label: "Deteriorating", band: "pw" as const } },
    { label: "Current Ratio", value: "1.62x", sub: null, chip: { label: "Improving", band: "sat" as const } },
  ];

  return (
    <Panel title="Counterparty Risk — Coverage" sub="From: Workbench Projections · CPJ_20260226_083" action="↺ Reassess">
      {/* Mini corridor chart */}
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${ds.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: ds.textMuted, fontFamily: ds.fontMono, fontWeight: 500 }}>
            Coverage Corridor · 36 Periods
          </span>
          <Chip label="Min DSCR 1.28x" band="pw" />
        </div>
        <svg viewBox="0 0 320 90" preserveAspectRatio="none" style={{ width: "100%", display: "block" }}>
          <defs>
            <linearGradient id="corridorFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5b9bd5" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#5b9bd5" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <path d="M 0,20 L 40,16 L 80,30 L 120,14 L 160,18 L 200,28 L 240,12 L 280,15 L 320,18 L 320,50 L 280,46 L 240,42 L 200,54 L 160,44 L 120,40 L 80,56 L 40,42 L 0,46 Z" fill="url(#corridorFill)" stroke="none" />
          <line x1="0" y1="58" x2="320" y2="58" stroke={ds.amber} strokeWidth="1" strokeDasharray="4,3" opacity={0.6} />
          <line x1="0" y1="76" x2="320" y2="76" stroke={ds.coral} strokeWidth="1" opacity={0.4} />
          <path d="M 0,33 L 40,29 L 80,43 L 120,27 L 160,31 L 200,41 L 240,27 L 280,30 L 320,34" fill="none" stroke="#5b9bd5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={80} cy={43} r={4} fill={ds.amber} opacity={0.9} />
          <circle cx={200} cy={41} r={4} fill={ds.amber} opacity={0.9} />
          <text x="4" y="55" fontSize="7" fill={ds.amber} fontFamily="monospace" opacity={0.8}>1.25x</text>
          <text x="4" y="73" fontSize="7" fill={ds.coral} fontFamily="monospace" opacity={0.7}>1.00x</text>
          <text x="0" y="87" fontSize="6" fill={ds.textMuted} fontFamily="monospace">Y1</text>
          <text x="100" y="87" fontSize="6" fill={ds.textMuted} fontFamily="monospace">Y2</text>
          <text x="200" y="87" fontSize="6" fill={ds.textMuted} fontFamily="monospace">Y3</text>
          <text x="300" y="87" fontSize="6" fill={ds.textMuted} fontFamily="monospace">Y4+</text>
        </svg>

        {/* Stress callout */}
        <div style={{ background: "rgba(232,160,64,0.07)", border: "1px solid rgba(232,160,64,0.2)", borderRadius: ds.radius, padding: "10px 12px", marginTop: 12, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ color: ds.amber, fontSize: 13, flexShrink: 0, marginTop: 1 }}>⚠</span>
          <div style={{ fontSize: 11, color: ds.textDim, lineHeight: 1.5 }}>
            <strong style={{ color: ds.amber, fontWeight: 600 }}>Stress Point: Q1 annual trough.</strong> Seasonal irradiance minimum + semi-annual debt service. Min DSCR 1.28x — 24 bps headroom above 1.25x policy threshold.
          </div>
        </div>
      </div>

      {/* Coverage metrics */}
      <div style={{ padding: 16 }}>
        {coverageMetrics.map((m) => (
          <MetricRow key={m.label} label={m.label} value={m.value} sub={m.sub} valueColor={m.valueColor} chip={m.chip} />
        ))}
      </div>
    </Panel>
  );
}

/* ================================================================== */
/*  Column 2: Collateral Value                                         */
/* ================================================================== */
function CollateralPanel() {
  const collateral = [
    { icon: "☀", name: "Solar Project Assets", sub: "180 MW · Panels, inverters, racking · Depreciated RC", amount: "$198.0MM", ltv: "LTV 50.7%" },
    { icon: "📄", name: "Offtake Agreement (NPV)", sub: "20-yr PPA · IG counterparty · 2026–2046", amount: "$44.0MM", ltv: "Discounted at 6.5%" },
    { icon: "🏦", name: "DSCR Reserve Account", sub: "6 months P&I · Funded at close (condition)", amount: "$9.5MM", ltv: "Cash / 1st lien" },
  ];

  return (
    <Panel title="Collateral Value" sub="Appraisal: COLL_20251018_083 · 131 days old" action="↺ Reassess">
      {/* LTV Ring */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0 14px" }}>
        <div style={{ position: "relative", width: 90, height: 90 }}>
          <svg width="90" height="90" viewBox="0 0 90 90" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="45" cy="45" r="38" fill="none" stroke={ds.surfaceRaised} strokeWidth="8" />
            <circle cx="45" cy="45" r="38" fill="none" stroke={ds.green} strokeWidth="8" strokeDasharray="148 240" strokeLinecap="round" opacity={0.85} />
            <circle cx="45" cy="45" r="38" fill="none" stroke={ds.amber} strokeWidth="2" strokeDasharray="2 238" strokeDashoffset="-153" opacity={0.7} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: ds.fontMono, fontSize: 22, fontWeight: 500, color: ds.text, lineHeight: 1 }}>62%</div>
            <div style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: "0.1em", color: ds.textMuted, fontFamily: ds.fontMono, marginTop: 2 }}>LTV</div>
          </div>
        </div>
        <div style={{ fontSize: 10, color: ds.textDim, marginTop: 8, fontFamily: ds.fontMono }}>Policy limit: 65% &nbsp;|&nbsp; 3% headroom</div>
      </div>

      {/* Collateral items */}
      <div style={{ padding: "0 16px 16px" }}>
        {collateral.map((c) => (
          <div key={c.name} style={{ display: "flex", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${ds.border}`, gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0, background: ds.surfaceRaised, border: `1px solid ${ds.border}` }}>
              {c.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: ds.text }}>{c.name}</div>
              <div style={{ fontSize: 9, color: ds.textMuted, fontFamily: ds.fontMono, marginTop: 1 }}>{c.sub}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: ds.fontMono, fontSize: 12, fontWeight: 500, color: ds.text }}>{c.amount}</div>
              <div style={{ fontFamily: ds.fontMono, fontSize: 9, color: ds.textMuted, marginTop: 1 }}>{c.ltv}</div>
            </div>
          </div>
        ))}

        {/* Total row */}
        <div style={{ display: "flex", alignItems: "center", padding: "10px 0 0", gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0, background: ds.goldDim, border: `1px solid rgba(200,168,75,0.3)` }}>
            Σ
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: ds.gold }}>Total Collateral Value</div>
            <div style={{ fontSize: 9, color: ds.textMuted, fontFamily: ds.fontMono, marginTop: 1 }}>1st lien security interest · All assets</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: ds.fontMono, fontSize: 12, fontWeight: 500, color: ds.gold }}>$251.5MM</div>
            <div style={{ fontFamily: ds.fontMono, fontSize: 9, color: ds.gold, marginTop: 1 }}>LTV 62.0% ✓</div>
          </div>
        </div>
      </div>

      {/* Comparable bar */}
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${ds.border}` }}>
        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: ds.textMuted, fontFamily: ds.fontMono, fontWeight: 500, marginBottom: 10 }}>
          Sector LTV Comparable Range
        </div>
        <CompBar rangeLeft={20} rangeWidth={40} markerPos={55} labels={["40%", "Sector: 55–70%", "80%"]} rangeColor={ds.blueDim} labelColor={ds.blue} />
      </div>

      {/* Appraisal age warning */}
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${ds.border}` }}>
        <div style={{ background: "rgba(224,112,96,0.07)", border: "1px solid rgba(224,112,96,0.2)", borderRadius: ds.radius, padding: "10px 12px", display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ color: ds.coral, fontSize: 13, flexShrink: 0, marginTop: 1 }}>⚠</span>
          <div style={{ fontSize: 11, color: ds.textDim, lineHeight: 1.5 }}>
            <strong style={{ color: ds.coral, fontWeight: 600 }}>Appraisal age: 131 days.</strong> Policy maximum is 180 days. 49 days remaining — updated appraisal recommended as an approval condition.
          </div>
        </div>
      </div>
    </Panel>
  );
}

/* ================================================================== */
/*  Column 3: Deal Value Analysis                                      */
/* ================================================================== */
function DealValuePanel() {
  const returnMetrics = [
    { label: "Fund ROE (levered)", value: "14.2%", sub: "Policy min: 12.0%", valueColor: ds.green },
    { label: "IRR (unlevered)", value: "7.18%", sub: "Includes fee amortization" },
    { label: "Annual NII", value: "$14.6MM", sub: "$250MM × 5.83% net" },
    { label: "Market positioning", value: "+35 bps", sub: "vs. 215 bps sector avg", valueColor: ds.green },
    { label: "Risk-adj. spread", value: "202 bps", sub: "Net of 48 bps EL" },
  ];

  const derivation = [
    { label: "Min DSCR (stress point)", value: "1.28x" },
    { label: "DSCR Buffer = (1.28−1)/1.28", value: "21.9%" },
    { label: "Risk-implied spread (buffer × 10Y UST)", value: "~101 bps" },
    { label: "+ Sector / structure premium", value: "+75 bps" },
    { label: "+ Tenor / illiquidity premium", value: "+44 bps" },
  ];

  return (
    <Panel title="Deal Value Analysis" sub="Pricing · Returns · Market Positioning" chipRight={{ label: "PW Composite", band: "pw" as const }}>
      {/* Pricing section */}
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${ds.border}` }}>
        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: ds.textMuted, fontFamily: ds.fontMono, fontWeight: 500, marginBottom: 12 }}>
          Proposed vs. Corridor-Required Spread
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, alignItems: "center", marginBottom: 12 }}>
          <PricingBox label="Corridor Min" value="+220 bps" sub="from DSCR buffer" valueColor={ds.amber} />
          <div style={{ color: ds.textMuted, fontSize: 14, textAlign: "center" }}>→</div>
          <PricingBox label="Proposed" value="+250 bps" sub="+30 bps cushion" valueColor={ds.gold} highlight />
        </div>

        {/* Spread derivation */}
        <div style={{ background: ds.surfaceRaised, border: `1px solid ${ds.border}`, borderRadius: ds.radius, padding: "12px 14px" }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: ds.textMuted, fontFamily: ds.fontMono, fontWeight: 500, marginBottom: 10 }}>
            Corridor Pricing Derivation
          </div>
          {derivation.map((d) => (
            <div key={d.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px dashed ${ds.border}`, fontSize: 11 }}>
              <span style={{ color: ds.textDim }}>{d.label}</span>
              <span style={{ fontFamily: ds.fontMono, fontSize: 11, fontWeight: 500, color: ds.text }}>{d.value}</span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, marginTop: 2, borderTop: `1px solid ${ds.borderAccent}`, fontWeight: 700 }}>
            <span style={{ color: ds.textDim, fontSize: 11 }}>Corridor minimum spread</span>
            <span style={{ fontFamily: ds.fontMono, fontSize: 11, fontWeight: 500, color: ds.amber }}>220 bps</span>
          </div>
        </div>
      </div>

      {/* Return waterfall */}
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${ds.border}` }}>
        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: ds.textMuted, fontFamily: ds.fontMono, fontWeight: 500, marginBottom: 12 }}>
          Deal Return Composition
        </div>
        <WaterfallRow label="SOFR (1M)" width={52} value="4.33%" color={ds.blue} bgColor={ds.blueDim} />
        <WaterfallRow label="Credit spread" width={30} value="2.50%" color={ds.gold} bgColor={ds.goldDim} />
        <WaterfallRow label="Origination fee (ann.)" width={9} value="0.83%" color={ds.green} bgColor={ds.greenDim} small />
        <WaterfallRow label="Expected loss (−)" width={6} value="−0.48%" color={ds.coral} bgColor={ds.coralDim} small />
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${ds.border}` }}>
          <WaterfallRow label="All-in NII Yield" width={90} value="7.18%" color={ds.gold} bgColor={ds.goldDim} total />
        </div>
      </div>

      {/* Return metrics */}
      <div style={{ padding: 16 }}>
        {returnMetrics.map((m) => (
          <MetricRow key={m.label} label={m.label} value={m.value} sub={m.sub} valueColor={m.valueColor} />
        ))}
      </div>

      {/* Market positioning bar */}
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${ds.border}` }}>
        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: ds.textMuted, fontFamily: ds.fontMono, fontWeight: 500, marginBottom: 10 }}>
          Proposed Spread vs. Market Comparables
        </div>
        <CompBar rangeLeft={48} rangeWidth={18} markerPos={62} labels={["IG 148", "Renew PF 200–230", "LL 338"]} rangeColor="rgba(76,175,130,0.15)" rangeBorderColor="rgba(76,175,130,0.25)" labelColor={ds.green} />
      </div>
    </Panel>
  );
}

/* ================================================================== */
/*  Policy Bridge                                                      */
/* ================================================================== */
function PolicyBridge() {
  return (
    <div style={{ background: ds.surface, border: `1px solid ${ds.border}`, borderRadius: ds.radiusLg, overflow: "hidden", marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", background: ds.surfaceRaised, borderBottom: `1px solid ${ds.border}` }}>
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: ds.textMuted, fontFamily: ds.fontMono }}>
          Policy · CRD-POL-007 · Renewable Energy Project Finance
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 9, fontFamily: ds.fontMono, color: ds.textMuted }}>
            Variance computed against deal metrics above. Full policy alignment in Step 2.
          </span>
          <Chip label="PW Composite" band="pw" />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 0 }}>
        {POLICY_DIMS.map((dim, i) => (
          <div
            key={dim.code}
            style={{
              padding: "14px 16px",
              borderRight: i < POLICY_DIMS.length - 1 ? `1px solid ${ds.border}` : "none",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
          >
            <div style={{ fontFamily: ds.fontMono, fontSize: 10, fontWeight: 600, color: ds.gold, letterSpacing: "0.06em", marginBottom: 3 }}>
              {dim.code}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: ds.text, marginBottom: 6 }}>
              {dim.name}
            </div>
            <PolicyDimRow label="Metric" value={dim.metric} />
            <PolicyDimRow label="Threshold" value={dim.threshold} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 9, color: ds.textMuted, fontFamily: ds.fontMono }}>Variance</span>
              <span style={{ fontFamily: ds.fontMono, fontSize: 10, fontWeight: 600, color: dim.varDir === "pos" ? ds.green : dim.varDir === "neg" ? ds.coral : ds.amber }}>
                {dim.variance}
              </span>
            </div>
            <div style={{ marginTop: 8 }}>
              <Chip label={dim.band.toUpperCase()} band={dim.band} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  STEP 2 — Policy Analysis                                           */
/* ================================================================== */

/* Variance chart dimension data */
const VARIANCE_DIMS = [
  { code: "PC", name: "Primary Coverage", metric: "DSCR 1.28x / min 1.25x", threshold: "1.25x", pctVar: 2.4, dir: "positive" as const, band: "pw" as const, trend: null },
  { code: "PV", name: "Portfolio Value", metric: "LLCR 1.45x / min 1.20x", threshold: "1.20x", pctVar: 20.8, dir: "positive" as const, band: "sat" as const, trend: null },
  { code: "PB", name: "Business Trend", metric: "GPM 48.3% / min 35% · trend ↓", threshold: "35%", pctVar: 13.3, dir: "positive" as const, band: "pw" as const, trend: "↓ trend" },
  { code: "PQ", name: "Liquidity Quality", metric: "CR 1.62x / min 1.50x · trend ↑", threshold: "1.50x", pctVar: 8.0, dir: "positive" as const, band: "sat" as const, trend: "↑ improving" },
  { code: "PM", name: "Cost Structure", metric: "OCR 67.8% / max 65.0% · trend ↓", threshold: "65%", pctVar: 2.8, dir: "negative" as const, band: "wdw" as const, trend: "↓ trend" },
];

/* Policy match rules */
const MATCH_RULES = [
  { label: "Product Type", value: "Term Loan / Construction", match: "✓ match" },
  { label: "Collateral Class", value: "Renewable Energy / Project Finance", match: "✓ match" },
  { label: "Facility Size", value: "$250MM · Senior Secured", match: "✓ within scope" },
  { label: "Tenor", value: "7 years · within 10Y max", match: "✓ match" },
  { label: "Regulatory Tier", value: "Senior Credit Committee", match: "→ routed", matchColor: ds.amber },
  { label: "Alternative Policies", value: "None applicable", valueColor: ds.textMuted, match: null },
];

/* Threshold table rows */
const THRESHOLD_ROWS = [
  { dim: "PC", name: "Primary Coverage", axis: "X · Min DSCR", defaultThreshold: "≥ 1.25x", dealValue: "1.28x", dealColor: ds.pwColor, preConfirmed: true, isException: false },
  { dim: "PV", name: "Portfolio Value", axis: "X · LLCR", defaultThreshold: "≥ 1.20x", dealValue: "1.45x", dealColor: ds.satColor, preConfirmed: true, isException: false },
  { dim: "PB", name: "Business Trend", axis: "X · GPM · Y · Trend", defaultThreshold: "≥ 35%", dealValue: "48.3% ↓", dealColor: ds.pwColor, preConfirmed: true, isException: false },
  { dim: "PQ", name: "Liquidity Quality", axis: "X · Current Ratio", defaultThreshold: "≥ 1.50x", dealValue: "1.62x ↑", dealColor: ds.satColor, preConfirmed: false, isException: false },
  { dim: "PM", name: "Cost Structure", axis: "X · Op. Cost Ratio · Y · Trend", defaultThreshold: "≤ 65.0%", dealValue: "67.8% ↓", dealColor: ds.wdwColor, preConfirmed: false, isException: true },
];

/* Policy reference rows */
const POLICY_REFS = [
  { dim: "PC", section: "§3.1 · DSCR", text: "Minimum DSCR 1.25x at any point in the projection horizon. Marginal compliance (<1.30x) requires a funded DSCR reserve account equal to six months of scheduled P&I.", strongText: "Minimum DSCR 1.25x", flag: "Watch", flagBand: "pw" as const },
  { dim: "PB", section: "§3.3 · GPM", text: "Deteriorating gross margin trend triggers escalation to quarterly financial reporting covenant regardless of current level. Management commentary on cost drivers required at origination.", strongText: "Deteriorating gross margin trend", flag: "Watch", flagBand: "pw" as const },
  { dim: "PM", section: "§3.5 · OCR", text: "Operating cost ratio exceeding 65.0% constitutes a WDW breach. Approval requires formal exception with Senior Credit Committee sign-off and documented mitigant rationale.", strongText: "Operating cost ratio exceeding 65.0%", flag: "Exception Req'd", flagBand: "wdw" as const },
  { dim: "—", section: "§4.1 · Route", text: "Any deal with one or more WDW composite dimensions is routed to Senior Credit Committee regardless of composite score. Standard approval path does not apply.", strongText: "one or more WDW composite dimensions", flag: "SCC Required", flagBand: "wdw" as const },
  { dim: "—", section: "§5.2 · Future", text: "Secondary SOR dimensions (collateral coverage, covenant tightness) scheduled for v2.2. Will appear here when active.", strongText: null, flag: "Pending", flagBand: "neutral" as const, italic: true },
];

/* Gate checklist items */
const INITIAL_GATE = [
  { id: "policy", status: "ok" as const, text: "Policy assignment confirmed", detail: "CRD-POL-007 v2.1 governing" },
  { id: "dims", status: "ok" as const, text: "All five dimensions computed", detail: "PC, PV, PB, PQ, PM values available" },
  { id: "thresh", status: "warn" as const, text: "Thresholds:", detail: "3 / 5 confirmed — PQ and PM require confirmation" },
  { id: "exc", status: "block" as const, text: "PM exception:", detail: "Rationale and acknowledgment required before Yardbook can run" },
  { id: "routing", status: "ok" as const, text: "Routing confirmed", detail: "Senior Credit Committee path, 1 WDW dimension" },
];

function PolicyStep() {
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({
    PC: true, PV: true, PB: true, PQ: false, PM: false,
  });
  const [exceptionAcknowledged, setExceptionAcknowledged] = useState(false);
  const [rationale, setRationale] = useState("");
  const [escSCC, setEscSCC] = useState(false);
  const [escYardbook, setEscYardbook] = useState(false);
  const [rationaleError, setRationaleError] = useState(false);

  const confirmedCount = Object.values(confirmed).filter(Boolean).length;
  const allThreshConfirmed = confirmedCount === 5;
  const gateOpen = allThreshConfirmed && exceptionAcknowledged;
  const pendingCount = (allThreshConfirmed ? 0 : 1) + (exceptionAcknowledged ? 0 : 1);

  const confirmThreshold = (dim: string) => {
    setConfirmed((prev) => ({ ...prev, [dim]: true }));
  };

  const confirmAll = () => {
    setConfirmed({ PC: true, PV: true, PB: true, PQ: true, PM: true });
  };

  const acknowledgeException = () => {
    if (rationale.trim().length < 10) {
      setRationaleError(true);
      setTimeout(() => setRationaleError(false), 2000);
      return;
    }
    setExceptionAcknowledged(true);
  };

  return (
    <>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px 80px" }}>
        {/* Page header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 20,
            paddingBottom: 18,
            borderBottom: `1px solid ${ds.border}`,
          }}
        >
          <div>
            <div style={{ fontFamily: ds.fontSerif, fontSize: 22, fontStyle: "italic", color: ds.text }}>
              Policy Alignment
            </div>
            <div style={{ fontSize: 11, color: ds.textMuted, fontFamily: ds.fontMono, marginTop: 4, letterSpacing: "0.04em" }}>
              DEAL · GH-2026-0083 &nbsp;|&nbsp; GreenHorizon Energy LLC &nbsp;|&nbsp;
              Confirm policy assignment · Validate thresholds · Acknowledge exceptions before Yardbook
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <ProgressStrip confirmedCount={confirmedCount} allThresh={allThreshConfirmed} exceptionDone={exceptionAcknowledged} />
            <GhostButton label="Confirm All" onClick={confirmAll} />
          </div>
        </div>

        {/* ── Section 1: Policy Assignment ── */}
        <SectionDivider label="Policy Assignment" />
        <PolicyMatchBanner />

        {/* ── Section 2: Variance chart ── */}
        <SectionDivider label="Deal Variance to Policy Thresholds — All Dimensions" />
        <VarianceChart />

        {/* ── Section 3: Threshold + Policy ref ── */}
        <SectionDivider label="Threshold Confirmation & Policy Reference" />
        <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16, marginBottom: 20 }}>
          <ThresholdTable confirmed={confirmed} onConfirm={confirmThreshold} onConfirmAll={confirmAll} confirmedCount={confirmedCount} />
          <PolicyRefPanel />
        </div>

        {/* ── Section 4: Exception workflow ── */}
        <SectionDivider label="Exception Acknowledgment — Required Before Yardbook" />
        <ExceptionPanel
          acknowledged={exceptionAcknowledged}
          rationale={rationale}
          setRationale={setRationale}
          onAcknowledge={acknowledgeException}
          escSCC={escSCC}
          setEscSCC={setEscSCC}
          escYardbook={escYardbook}
          setEscYardbook={setEscYardbook}
          rationaleError={rationaleError}
        />

        {/* ── Section 5: Confirmation gate ── */}
        <ConfirmationGate
          allThreshConfirmed={allThreshConfirmed}
          exceptionAcknowledged={exceptionAcknowledged}
          confirmedCount={confirmedCount}
          gateOpen={gateOpen}
          pendingCount={pendingCount}
          onConfirmAll={confirmAll}
        />

        <div style={{ height: 60 }} />
      </div>

      {/* Footer */}
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
          <FooterMeta label="Policy" value="CRD-POL-007 v2.1" />
          <FooterMeta label="Dimensions" value="PC · PV · PB · PQ · PM" />
          <FooterMeta
            label="Exceptions"
            value={exceptionAcknowledged ? "1 acknowledged" : "1 pending"}
            valueColor={exceptionAcknowledged ? ds.amber : ds.wdwColor}
          />
          <FooterMeta label="Confirmed" value={`${confirmedCount} / 5`} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            style={{
              padding: "8px 14px",
              borderRadius: ds.radius,
              fontFamily: ds.fontBody,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              background: ds.coral,
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Recommend Decline
          </button>
          <GhostButton label="Confirm All Thresholds" onClick={confirmAll} />
          <button
            disabled={!gateOpen}
            style={{
              padding: "8px 16px",
              borderRadius: ds.radius,
              fontFamily: ds.fontBody,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              background: ds.gold,
              color: "#18140a",
              border: "none",
              cursor: gateOpen ? "pointer" : "not-allowed",
              opacity: gateOpen ? 1 : 0.4,
            }}
          >
            Advance to Yardbook →
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Progress strip ── */
function ProgressStrip({ confirmedCount, allThresh, exceptionDone }: { confirmedCount: number; allThresh: boolean; exceptionDone: boolean }) {
  const dots = THRESHOLD_ROWS.map((r) => {
    const isConfirmed = confirmedCount > ["PC", "PV", "PB", "PQ", "PM"].indexOf(r.dim);
    if (r.isException && !exceptionDone) return "warn";
    return isConfirmed ? "done" : "pending";
  });
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: ds.fontMono, fontSize: 9, color: ds.textMuted }}>
      {dots.map((d, i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: d === "done" ? ds.green : d === "warn" ? ds.amber : ds.surfaceRaised,
            border: `1px solid ${d === "done" ? ds.satBorder : d === "warn" ? ds.pwBorder : ds.border}`,
            boxShadow: d === "warn" ? "0 0 0 3px rgba(200,168,75,0.15)" : "none",
          }}
        />
      ))}
      <span style={{ marginLeft: 4 }}>{confirmedCount} / 5 thresholds confirmed</span>
    </span>
  );
}

/* ── Policy Match Banner ── */
function PolicyMatchBanner() {
  return (
    <div style={{ background: ds.surface, border: `1px solid ${ds.border}`, borderRadius: ds.radiusLg, overflow: "hidden", marginBottom: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "stretch" }}>
        {/* Policy ID */}
        <div style={{ padding: "20px 24px", borderRight: `1px solid ${ds.border}`, display: "flex", flexDirection: "column", justifyContent: "center", gap: 6, background: ds.surfaceRaised, minWidth: 240 }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textMuted, fontFamily: ds.fontMono, fontWeight: 500 }}>Applied Policy</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: ds.text, letterSpacing: "-0.01em" }}>Corridor Standard<br />Credit Policy</div>
          <div style={{ fontFamily: ds.fontMono, fontSize: 10, color: ds.gold, marginTop: 2 }}>CRD-POL-007 · v2.1 · Active</div>
          <div style={{ fontSize: 10, color: ds.textMuted, marginTop: 4 }}>Effective Feb 10, 2026 · No sunset date</div>
        </div>

        {/* Match logic */}
        <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", flexWrap: "wrap" }}>
          {MATCH_RULES.map((rule, i) => (
            <div key={rule.label} style={{ display: "flex", flexDirection: "column", gap: 3, padding: "0 20px", borderRight: i < MATCH_RULES.length - 1 ? `1px solid ${ds.border}` : "none", ...(i === 0 ? { paddingLeft: 0 } : {}) }}>
              <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: ds.textMuted, fontFamily: ds.fontMono, fontWeight: 500 }}>{rule.label}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: rule.valueColor || ds.text, display: "flex", alignItems: "center", gap: 5 }}>
                {rule.value}
                {rule.match && (
                  <span style={{ fontFamily: ds.fontMono, fontSize: 9, color: rule.matchColor || ds.green }}>{rule.match}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ padding: "16px 20px", borderLeft: `1px solid ${ds.border}`, display: "flex", flexDirection: "column", gap: 8, justifyContent: "center", background: ds.surfaceRaised, minWidth: 180 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: ds.fontMono, fontSize: 10, fontWeight: 600, color: ds.green, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: ds.green, boxShadow: "0 0 0 3px rgba(76,175,130,0.2)" }} />
            Policy Confirmed
          </div>
          <ReassessButton label="↗ Open Policy Admin" />
          <ReassessButton label="Change Policy" />
        </div>
      </div>
    </div>
  );
}

/* ── Variance Chart ── */
function VarianceChart() {
  const axisTicks = [
    { label: "−30%", color: ds.wdwColor },
    { label: "−20%", color: ds.textMuted },
    { label: "−10%", color: ds.textMuted },
    { label: "0 · threshold", color: ds.textDim, bold: true },
    { label: "+10%", color: ds.textMuted },
    { label: "+20%", color: ds.textMuted },
    { label: "+30%", color: ds.satColor },
  ];

  const legendItems = [
    { color: ds.satColor, label: "SAT — clear headroom" },
    { color: ds.pwColor, label: "PW — marginal" },
    { color: ds.wdwColor, label: "WDW — breach or adverse trend" },
    { color: "rgba(224,112,96,0.15)", border: "rgba(224,112,96,0.3)", label: "Breach zone" },
  ];

  return (
    <div style={{ background: ds.surface, border: `1px solid ${ds.border}`, borderRadius: ds.radiusLg, overflow: "hidden", marginBottom: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", background: ds.surfaceRaised, borderBottom: `1px solid ${ds.border}` }}>
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: ds.textDim, fontFamily: ds.fontMono }}>
          Normalized Distance to Threshold · 0 = policy minimum · Right = headroom · Left = breach
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {legendItems.map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9, fontFamily: ds.fontMono, color: ds.textMuted }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color, opacity: item.border ? 1 : 0.7, border: item.border ? `1px solid ${item.border}` : "none" }} />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Chart body */}
      <div style={{ padding: "24px 28px 20px", paddingRight: 100 }}>
        {/* Axis row */}
        <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", marginBottom: 0 }}>
          <div />
          <div style={{ display: "flex", justifyContent: "space-between", padding: "0 4px 10px", borderBottom: `1px solid ${ds.borderAccent}`, marginBottom: 18 }}>
            {axisTicks.map((t) => (
              <span key={t.label} style={{ fontFamily: ds.fontMono, fontSize: 9, color: t.color, fontWeight: t.bold ? 600 : 400 }}>
                {t.label}
              </span>
            ))}
          </div>
        </div>

        {/* Dimension rows */}
        {VARIANCE_DIMS.map((dim, i) => (
          <VarianceDimRow key={dim.code} dim={dim} isLast={i === VARIANCE_DIMS.length - 1} />
        ))}
      </div>
    </div>
  );
}

/* ── Variance dimension row ── */
function VarianceDimRow({ dim, isLast }: { dim: (typeof VARIANCE_DIMS)[number]; isLast: boolean }) {
  const maxPct = 30;
  const barWidthPct = (dim.pctVar / maxPct) * 50;
  const bandColors = {
    sat: { bg: "rgba(76,175,130,0.3)", border: ds.satBorder, labelColor: ds.satColor },
    pw: { bg: "rgba(232,160,64,0.22)", border: ds.pwBorder, labelColor: ds.pwColor },
    wdw: { bg: "rgba(224,112,96,0.4)", border: ds.wdwBorder, labelColor: ds.wdwColor },
  };
  const c = bandColors[dim.band];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", alignItems: "center", marginBottom: isLast ? 0 : 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingRight: 16 }}>
        <div style={{ fontFamily: ds.fontMono, fontSize: 11, fontWeight: 600, color: ds.gold, letterSpacing: "0.04em" }}>{dim.code}</div>
        <div style={{ fontSize: 10, color: ds.textDim }}>{dim.name}</div>
        <div style={{ fontFamily: ds.fontMono, fontSize: 9, color: ds.textMuted }}>{dim.metric}</div>
      </div>
      <div style={{ position: "relative", height: 32 }}>
        {/* Zero line */}
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: ds.borderAccent, zIndex: 1 }} />
        {/* Track bg */}
        <div style={{ position: "absolute", inset: "6px 0", background: ds.surfaceRaised, borderRadius: 3 }} />
        {/* Breach zone */}
        <div style={{ position: "absolute", top: 6, bottom: 6, left: 0, width: "50%", background: "rgba(224,112,96,0.04)", borderRadius: "3px 0 0 3px" }} />
        {/* Bar */}
        {dim.dir === "positive" ? (
          <div style={{ position: "absolute", top: 6, bottom: 6, left: "50%", width: `${barWidthPct}%`, background: c.bg, border: `1px solid ${c.border}`, borderRadius: "0 3px 3px 0", display: "flex", alignItems: "center" }}>
            {/* Trend overlay for PB */}
            {dim.code === "PB" && (
              <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "30%", background: "repeating-linear-gradient(135deg, transparent, transparent 2px, rgba(224,112,96,0.25) 2px, rgba(224,112,96,0.25) 4px)", borderRadius: "0 3px 3px 0" }} />
            )}
            <span style={{ position: "absolute", left: "calc(100% + 6px)", fontFamily: ds.fontMono, fontSize: 10, fontWeight: 600, whiteSpace: "nowrap", color: c.labelColor }}>
              +{dim.pctVar}%{dim.trend && <> <span style={{ color: dim.trend.includes("↓") ? ds.coral : ds.green }}>{dim.trend}</span></>}
            </span>
          </div>
        ) : (
          <div style={{ position: "absolute", top: 6, bottom: 6, right: "50%", width: `${barWidthPct}%`, background: c.bg, border: `1px solid ${c.border}`, borderRadius: "3px 0 0 3px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
            <span style={{ position: "absolute", right: "calc(100% + 6px)", fontFamily: ds.fontMono, fontSize: 10, fontWeight: 600, whiteSpace: "nowrap", color: ds.wdwColor }}>
              −{dim.pctVar}% breach{dim.trend && <> <span>{dim.trend}</span></>}
            </span>
          </div>
        )}
        {/* Threshold label */}
        <span style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", fontFamily: ds.fontMono, fontSize: 8, color: ds.textMuted, whiteSpace: "nowrap", background: ds.surface, padding: "0 4px" }}>
          {dim.threshold}
        </span>
        {/* Band chip */}
        <span style={{ position: "absolute", right: -80, top: "50%", transform: "translateY(-50%)" }}>
          <Chip label={dim.band.toUpperCase()} band={dim.band} />
        </span>
      </div>
    </div>
  );
}

/* ── Threshold Table ── */
function ThresholdTable({ confirmed, onConfirm, onConfirmAll, confirmedCount }: {
  confirmed: Record<string, boolean>;
  onConfirm: (dim: string) => void;
  onConfirmAll: () => void;
  confirmedCount: number;
}) {
  return (
    <Panel title="Threshold Confirmation" sub="These values will be locked into the Yardbook prompt. Edit requires rationale." chipRight={{ label: `${confirmedCount} / 5`, band: "neutral" }}>
      <div style={{ padding: 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${ds.border}` }}>
              {["Dim", "Dimension", "Axis", "Threshold", "Deal Value", "Status"].map((h, i) => (
                <th key={h} style={{ fontFamily: ds.fontMono, fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: ds.textMuted, padding: "0 8px 10px", textAlign: i === 5 ? "center" : "left", ...(i === 0 ? { paddingLeft: 18 } : {}), ...(i === 5 ? { paddingRight: 18 } : {}) }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {THRESHOLD_ROWS.map((row) => {
              const isConfirmed = confirmed[row.dim];
              return (
                <tr key={row.dim} style={{ borderBottom: `1px solid ${ds.border}` }}>
                  <td style={{ padding: "10px 8px", paddingLeft: 18 }}>
                    <span style={{ fontFamily: ds.fontMono, fontSize: 11, fontWeight: 600, color: ds.gold, letterSpacing: "0.04em" }}>{row.dim}</span>
                  </td>
                  <td style={{ padding: "10px 8px" }}>
                    <span style={{ fontSize: 11, fontWeight: 500, color: ds.text }}>{row.name}</span>
                  </td>
                  <td style={{ padding: "10px 8px" }}>
                    <span style={{ fontFamily: ds.fontMono, fontSize: 10, color: ds.textDim }}>{row.axis}</span>
                  </td>
                  <td style={{ padding: "10px 8px" }}>
                    <span style={{
                      fontFamily: ds.fontMono,
                      fontSize: 12,
                      fontWeight: 500,
                      color: isConfirmed ? ds.textDim : ds.text,
                      background: "transparent",
                      border: `1px solid ${isConfirmed ? "transparent" : ds.border}`,
                      borderRadius: 4,
                      padding: "3px 6px",
                      display: "inline-block",
                      textAlign: "center",
                      width: 80,
                    }}>
                      {row.defaultThreshold}
                    </span>
                  </td>
                  <td style={{ padding: "10px 8px" }}>
                    <span style={{ fontFamily: ds.fontMono, fontSize: 11, color: row.dealColor }}>{row.dealValue}</span>
                  </td>
                  <td style={{ padding: "10px 8px", paddingRight: 18, textAlign: "center" }}>
                    {isConfirmed ? (
                      row.isException ? (
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5, width: 80, height: 26, borderRadius: 4, fontFamily: ds.fontMono, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: ds.wdwBg, color: ds.wdwColor, border: `1px solid ${ds.wdwBorder}` }}>Exception</span>
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5, width: 80, height: 26, borderRadius: 4, fontFamily: ds.fontMono, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: ds.greenDim, color: ds.green, border: `1px solid ${ds.satBorder}` }}>✓ Locked</span>
                      )
                    ) : (
                      <button
                        onClick={() => onConfirm(row.dim)}
                        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 80, height: 26, borderRadius: 4, cursor: "pointer", fontFamily: ds.fontMono, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: ds.surfaceRaised, color: ds.textMuted, border: `1px solid ${ds.border}` }}
                      >
                        Confirm
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ padding: "12px 18px", borderTop: `1px solid ${ds.border}`, background: ds.surfaceRaised, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, color: ds.textMuted, fontFamily: ds.fontMono }}>
          Locked thresholds are read-only for this assessment run. Editing requires a rationale note.
        </span>
        <ReassessButton label="Unlock All for Edit" />
      </div>
    </Panel>
  );
}

/* ── Policy Reference Panel ── */
function PolicyRefPanel() {
  return (
    <Panel title="Policy Reference — Flagged Provisions" sub="Sections implicated by PW / WDW dimensions in this deal" action="↗ Full Policy Doc">
      <div style={{ padding: "16px 18px" }}>
        {POLICY_REFS.map((ref, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: i < POLICY_REFS.length - 1 ? `1px solid ${ds.border}` : "none" }}>
            <div style={{ fontFamily: ds.fontMono, fontSize: 10, fontWeight: 600, color: ref.dim === "—" ? ds.textMuted : ds.gold, width: 24, flexShrink: 0, paddingTop: 1 }}>{ref.dim}</div>
            <div style={{ fontSize: 9, fontFamily: ds.fontMono, color: ds.textMuted, width: 80, flexShrink: 0, paddingTop: 2 }}>{ref.section}</div>
            <div style={{ fontSize: 11, color: ref.italic ? ds.textMuted : ds.textDim, lineHeight: 1.5, flex: 1, fontStyle: ref.italic ? "italic" : "normal" }}>
              {ref.strongText ? (
                <>
                  <strong style={{ color: ds.text, fontWeight: 600 }}>{ref.strongText}</strong>{" "}
                  {ref.text.replace(ref.strongText, "").trim()}
                </>
              ) : ref.text}
            </div>
            <PolicyRefFlag label={ref.flag} band={ref.flagBand} />
          </div>
        ))}
      </div>
    </Panel>
  );
}

function PolicyRefFlag({ label, band }: { label: string; band: "sat" | "pw" | "wdw" | "neutral" }) {
  const styles: Record<string, { bg: string; color: string; border: string }> = {
    sat: { bg: ds.satBg, color: ds.satColor, border: ds.satBorder },
    pw: { bg: ds.pwBg, color: ds.pwColor, border: ds.pwBorder },
    wdw: { bg: ds.wdwBg, color: ds.wdwColor, border: ds.wdwBorder },
    neutral: { bg: "transparent", color: ds.textMuted, border: ds.border },
  };
  const s = styles[band];
  return (
    <span style={{ fontFamily: ds.fontMono, fontSize: 9, fontWeight: 600, textTransform: "uppercase", padding: "2px 6px", borderRadius: 3, flexShrink: 0, whiteSpace: "nowrap", marginTop: 1, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {label}
    </span>
  );
}

/* ── Exception Panel ── */
function ExceptionPanel({
  acknowledged,
  rationale,
  setRationale,
  onAcknowledge,
  escSCC,
  setEscSCC,
  escYardbook,
  setEscYardbook,
  rationaleError,
}: {
  acknowledged: boolean;
  rationale: string;
  setRationale: (v: string) => void;
  onAcknowledge: () => void;
  escSCC: boolean;
  setEscSCC: (v: boolean) => void;
  escYardbook: boolean;
  setEscYardbook: (v: boolean) => void;
  rationaleError: boolean;
}) {
  return (
    <div style={{ background: ds.surface, border: `1px solid ${ds.wdwBorder}`, borderRadius: ds.radiusLg, overflow: "hidden", marginBottom: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", background: "rgba(224,112,96,0.06)", borderBottom: `1px solid ${ds.wdwBorder}` }}>
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.wdwColor, fontFamily: ds.fontMono, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13 }}>⚠</span>
          WDW Exception · 1 dimension requires formal acknowledgment
        </div>
        <div style={{ fontFamily: ds.fontMono, fontSize: 10, color: acknowledged ? ds.amber : ds.wdwColor }}>
          {acknowledged ? "1 / 1 acknowledged" : "0 / 1 acknowledged"}
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr auto", alignItems: "stretch", borderBottom: "none" }}>
        {/* Dim info */}
        <div style={{ padding: "14px 18px", borderRight: `1px solid ${ds.border}`, display: "flex", flexDirection: "column", justifyContent: "center", gap: 4 }}>
          <div style={{ fontFamily: ds.fontMono, fontSize: 11, fontWeight: 600, color: ds.wdwColor }}>PM</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: ds.text }}>Cost Structure — OCR</div>
          <div style={{ fontSize: 10, color: ds.textDim, fontFamily: ds.fontMono, marginTop: 2 }}>
            Actual: <span style={{ color: ds.wdwColor, fontWeight: 600 }}>67.8%</span> / Policy max: <span style={{ color: ds.wdwColor, fontWeight: 600 }}>65.0%</span>
            <br />
            Breach: <span style={{ color: ds.wdwColor, fontWeight: 600 }}>+2.8 ppt</span> · Trend: <span style={{ color: ds.wdwColor, fontWeight: 600 }}>↓ deteriorating</span>
          </div>
        </div>

        {/* Rationale */}
        <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: ds.textMuted, fontFamily: ds.fontMono, fontWeight: 500 }}>
            Mitigant Rationale <span style={{ color: ds.wdwColor }}>*required</span>
          </div>
          <textarea
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder="Describe the structural mitigant or business justification that supports approval despite the OCR breach…"
            style={{
              background: ds.surfaceDeep,
              border: `1px solid ${rationaleError ? ds.wdwColor : rationale.length > 10 ? "rgba(232,160,64,0.35)" : ds.border}`,
              borderRadius: ds.radius,
              color: ds.text,
              fontFamily: ds.fontSerif,
              fontStyle: "italic",
              fontSize: 12,
              lineHeight: 1.6,
              padding: "8px 10px",
              outline: "none",
              resize: "none",
              minHeight: 56,
              width: "100%",
              ...(rationale.length > 10 ? { background: "rgba(232,160,64,0.04)" } : {}),
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 8, justifyContent: "center", borderLeft: `1px solid ${ds.border}`, minWidth: 160 }}>
          <div>
            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: ds.textMuted, fontFamily: ds.fontMono, marginBottom: 6 }}>Escalation</div>
            <ExcCheckbox label="Flag for SCC pre-discussion" checked={escSCC} onChange={() => setEscSCC(!escSCC)} />
          </div>
          <div>
            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: ds.textMuted, fontFamily: ds.fontMono, marginBottom: 6 }}>Yardbook context</div>
            <ExcCheckbox label="Pass rationale to Yardbook" checked={escYardbook} onChange={() => setEscYardbook(!escYardbook)} />
          </div>
          <button
            onClick={onAcknowledge}
            disabled={acknowledged}
            style={{
              width: "100%",
              padding: 7,
              borderRadius: ds.radius,
              cursor: acknowledged ? "default" : "pointer",
              fontFamily: ds.fontMono,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              border: "none",
              ...(acknowledged
                ? { background: ds.amberDim, color: ds.amber, border: `1px solid rgba(232,160,64,0.4)` }
                : { background: ds.wdwBg, color: ds.wdwColor, border: `1px solid ${ds.wdwBorder}` }),
            }}
          >
            {acknowledged ? "✓ Exception Acknowledged" : "Acknowledge Exception"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ExcCheckbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      style={{ display: "flex", alignItems: "center", gap: 7, background: ds.surfaceRaised, border: `1px solid ${ds.border}`, borderRadius: ds.radius, padding: "7px 10px", cursor: "pointer" }}
    >
      <div style={{
        width: 14,
        height: 14,
        borderRadius: 3,
        border: `1px solid ${checked ? "rgba(232,160,64,0.5)" : ds.border}`,
        background: checked ? ds.amberDim : ds.surfaceDeep,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 9,
        fontWeight: 700,
        color: ds.amber,
      }}>
        {checked && "✓"}
      </div>
      <div style={{ fontSize: 10, color: ds.textDim, fontFamily: ds.fontMono }}>{label}</div>
    </div>
  );
}

/* ── Confirmation Gate ── */
function ConfirmationGate({
  allThreshConfirmed,
  exceptionAcknowledged,
  confirmedCount,
  gateOpen,
  pendingCount,
  onConfirmAll,
}: {
  allThreshConfirmed: boolean;
  exceptionAcknowledged: boolean;
  confirmedCount: number;
  gateOpen: boolean;
  pendingCount: number;
  onConfirmAll: () => void;
}) {
  const gateItems = INITIAL_GATE.map((item) => {
    if (item.id === "thresh") {
      return allThreshConfirmed
        ? { ...item, status: "ok" as const, text: "All thresholds confirmed", detail: "locked for this assessment run" }
        : { ...item, status: "warn" as const, text: "Thresholds:", detail: `${confirmedCount} / 5 confirmed — ${["PC", "PV", "PB", "PQ", "PM"].filter((d) => !({ PC: true, PV: true, PB: true, PQ: confirmedCount >= 4, PM: confirmedCount >= 5 })[d]).join(", ") || "PM"} pending` };
    }
    if (item.id === "exc") {
      return exceptionAcknowledged
        ? { ...item, status: "ok" as const, text: "PM exception acknowledged", detail: "rationale captured, routing to SCC" }
        : item;
    }
    return item;
  });

  return (
    <div style={{ background: ds.surface, border: `1px solid ${ds.border}`, borderRadius: ds.radiusLg, overflow: "hidden", marginBottom: 20 }}>
      <div style={{ padding: "12px 18px", background: ds.surfaceRaised, borderBottom: `1px solid ${ds.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textDim, fontFamily: ds.fontMono }}>
          Yardbook Unlock Gate — All conditions must be met before advancing
        </div>
        <div style={{ fontFamily: ds.fontMono, fontSize: 10, color: gateOpen ? ds.green : ds.wdwColor }}>
          {gateOpen ? "READY — Yardbook unlocked" : `BLOCKED · ${pendingCount} item${pendingCount !== 1 ? "s" : ""} pending`}
        </div>
      </div>
      <div style={{ padding: "20px 18px", display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {gateItems.map((item) => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11 }}>
              <div style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: 9,
                fontWeight: 700,
                ...(item.status === "ok"
                  ? { background: ds.greenDim, color: ds.green, border: `1px solid ${ds.satBorder}` }
                  : item.status === "warn"
                    ? { background: ds.amberDim, color: ds.amber, border: `1px solid ${ds.pwBorder}` }
                    : { background: ds.wdwBg, color: ds.wdwColor, border: `1px solid ${ds.wdwBorder}` }),
              }}>
                {item.status === "ok" ? "✓" : item.status === "warn" ? "!" : "✕"}
              </div>
              <div style={{ color: ds.textDim }}>
                <strong style={{ color: ds.text, fontWeight: 600 }}>{item.text}</strong> — {item.detail}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 200 }}>
          <div style={{ fontSize: 10, color: ds.textMuted, fontFamily: ds.fontMono, marginBottom: 8, textAlign: "center", lineHeight: 1.5 }}>
            Confirming will lock thresholds<br />and pass exception context<br />to CRDR_PROMPT_16
          </div>
          <button
            disabled={!gateOpen}
            style={{
              padding: "8px 16px",
              borderRadius: ds.radius,
              fontFamily: ds.fontBody,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              background: ds.gold,
              color: "#18140a",
              border: "none",
              cursor: gateOpen ? "pointer" : "not-allowed",
              opacity: gateOpen ? 1 : 0.4,
            }}
          >
            Launch Yardbook →
          </button>
          <GhostButton label="Quick-confirm all thresholds" onClick={onConfirmAll} />
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Shared components                                                  */
/* ================================================================== */

function Panel({
  title,
  sub,
  action,
  chipRight,
  children,
}: {
  title: string;
  sub: string;
  action?: string;
  chipRight?: { label: string; band: "sat" | "pw" | "wdw" };
  children: React.ReactNode;
}) {
  return (
    <div style={{ background: ds.surface, border: `1px solid ${ds.border}`, borderRadius: ds.radiusLg, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: ds.surfaceRaised, borderBottom: `1px solid ${ds.border}`, flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: ds.textDim, fontFamily: ds.fontMono }}>
            {title}
          </div>
          <div style={{ fontSize: 9, color: ds.textMuted, fontFamily: ds.fontMono, marginTop: 2 }}>
            {sub}
          </div>
        </div>
        {action && <ReassessButton label={action} />}
        {chipRight && <Chip label={chipRight.label} band={chipRight.band} />}
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

function Chip({ label, band }: { label: string; band: "sat" | "pw" | "wdw" | "blue" | "gold" | "neutral" }) {
  const colors = {
    sat: { bg: ds.satBg, color: ds.satColor, border: ds.satBorder },
    pw: { bg: ds.pwBg, color: ds.pwColor, border: ds.pwBorder },
    wdw: { bg: ds.wdwBg, color: ds.wdwColor, border: ds.wdwBorder },
    blue: { bg: ds.blueDim, color: ds.blue, border: "rgba(91,155,213,0.28)" },
    gold: { bg: ds.goldDim, color: ds.gold, border: "rgba(200,168,75,0.3)" },
    neutral: { bg: "rgba(255,255,255,0.05)", color: ds.textDim, border: ds.border },
  };
  const c = colors[band];
  return (
    <span style={{ fontFamily: ds.fontMono, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 3, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      {label}
    </span>
  );
}

function MetricRow({
  label,
  value,
  sub,
  valueColor,
  chip,
}: {
  label: string;
  value: string;
  sub?: string | null;
  valueColor?: string;
  chip?: { label: string; band: "sat" | "pw" | "wdw" };
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${ds.border}` }}>
      <div style={{ fontSize: 11, color: ds.textDim }}>{label}</div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontFamily: ds.fontMono, fontSize: 12, fontWeight: 500, color: valueColor || ds.text }}>{value}</div>
        {sub && <div style={{ fontFamily: ds.fontMono, fontSize: 9, color: ds.textMuted, textAlign: "right", marginTop: 1 }}>{sub}</div>}
        {chip && <div style={{ marginTop: 2 }}><Chip label={chip.label} band={chip.band} /></div>}
      </div>
    </div>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: ds.textMuted, fontFamily: ds.fontMono, display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <span style={{ flex: "0 0 14px", height: 1, background: ds.borderAccent }} />
      {label}
      <span style={{ flex: 1, height: 1, background: ds.border }} />
    </div>
  );
}

function SessionChip() {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: ds.amberDim, border: "1px solid rgba(232,160,64,0.3)", fontFamily: ds.fontMono, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ds.amber }}>
      ⬡ Moderate Volatility Session
    </span>
  );
}

function GhostButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{ padding: "8px 16px", borderRadius: ds.radius, fontFamily: ds.fontBody, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: "transparent", color: ds.textDim, border: `1px solid ${ds.borderAccent}`, cursor: "pointer", whiteSpace: "nowrap" }}>
      {label}
    </button>
  );
}

function ReassessButton({ label }: { label: string }) {
  return (
    <button style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 4, background: "transparent", border: `1px solid ${ds.border}`, color: ds.textMuted, fontFamily: ds.fontMono, fontSize: 9, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}>
      {label}
    </button>
  );
}

function PricingBox({ label, value, sub, valueColor, highlight }: { label: string; value: string; sub: string; valueColor: string; highlight?: boolean }) {
  return (
    <div style={{ background: highlight ? ds.goldDim : ds.surfaceRaised, border: `1px solid ${highlight ? "rgba(200,168,75,0.3)" : ds.border}`, borderRadius: ds.radius, padding: "10px 12px", textAlign: "center" }}>
      <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: ds.textMuted, fontFamily: ds.fontMono, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: ds.fontMono, fontSize: 18, fontWeight: 500, color: valueColor }}>{value}</div>
      <div style={{ fontSize: 9, color: ds.textDim, fontFamily: ds.fontMono, marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function WaterfallRow({ label, width, value, color, bgColor, small, total }: { label: string; width: number; value: string; color: string; bgColor: string; small?: boolean; total?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <div style={{ fontSize: 11, color: total ? ds.text : ds.textDim, width: 140, flexShrink: 0, fontWeight: total ? 700 : 400 }}>{label}</div>
      <div style={{ flex: 1, height: 20, background: ds.surfaceRaised, borderRadius: 3, overflow: "hidden", position: "relative" }}>
        <div style={{ height: "100%", width: `${width}%`, borderRadius: 3, display: "flex", alignItems: "center", paddingLeft: 8, background: total ? `linear-gradient(90deg, ${bgColor}, rgba(200,168,75,0.08))` : bgColor, border: `1px solid ${color}22` }}>
          <span style={{ fontFamily: ds.fontMono, fontSize: total ? 13 : small ? 9 : 10, fontWeight: 600, whiteSpace: "nowrap", color }}>{value}</span>
        </div>
        {total && <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontFamily: ds.fontMono, fontSize: 9, color: ds.textMuted }}>annualized</span>}
      </div>
    </div>
  );
}

function CompBar({ rangeLeft, rangeWidth, markerPos, labels, rangeColor, rangeBorderColor, labelColor }: { rangeLeft: number; rangeWidth: number; markerPos: number; labels: string[]; rangeColor: string; rangeBorderColor?: string; labelColor?: string }) {
  return (
    <>
      <div style={{ position: "relative", height: 6, background: ds.surfaceRaised, borderRadius: 3, marginBottom: 5 }}>
        <div style={{ position: "absolute", height: "100%", borderRadius: 3, left: `${rangeLeft}%`, width: `${rangeWidth}%`, background: rangeColor, border: rangeBorderColor ? `1px solid ${rangeBorderColor}` : `1px solid rgba(91,155,213,0.3)` }} />
        <div style={{ position: "absolute", top: -3, width: 12, height: 12, borderRadius: "50%", background: ds.gold, border: `2px solid ${ds.bg}`, left: `${markerPos}%`, transform: "translateX(-50%)" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: ds.fontMono, fontSize: 9, color: ds.textMuted }}>
        <span>{labels[0]}</span>
        <span style={{ color: labelColor || ds.blue }}>{labels[1]}</span>
        <span>{labels[2]}</span>
      </div>
    </>
  );
}

function PolicyDimRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
      <span style={{ fontSize: 9, color: ds.textMuted, fontFamily: ds.fontMono }}>{label}</span>
      <span style={{ fontFamily: ds.fontMono, fontSize: 10, fontWeight: 500, color: ds.text }}>{value}</span>
    </div>
  );
}

function FooterMeta({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ fontSize: 10, fontFamily: ds.fontMono, color: ds.textMuted }}>
      {label}: <strong style={{ color: valueColor || ds.textDim }}>{value}</strong>
    </div>
  );
}

function ComingSoon({ label }: { label: string }) {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontSize: 16, color: ds.textMuted, fontFamily: ds.fontSerif, fontStyle: "italic" }}>
        {label} — coming soon
      </span>
    </div>
  );
}
