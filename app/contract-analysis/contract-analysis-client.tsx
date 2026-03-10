"use client";

import { useState } from "react";
import Sidebar from "@/app/components/sidebar";

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
  { number: 1, label: "Document" },
  { number: 2, label: "Counterparty" },
  { number: 3, label: "Approval" },
];

/* ------------------------------------------------------------------ */
/*  Mock extracted contract terms                                      */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/*  Root component                                                     */
/* ------------------------------------------------------------------ */
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
      {/* Toolbar row */}
      <div
        className={`px-5 py-2.5 border-b ${BORDER} flex items-center justify-between shrink-0`}
      >
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${TEXT3} uppercase tracking-wide`}>
              Deal to Process
            </span>
            <span className="text-sm bg-[#1a2a40] text-blue-400 px-3 py-1 rounded font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              DEAL_20260126_48f8e7cf
              <ChevronDownIcon />
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${TEXT3} uppercase tracking-wide`}>
              Contract to Process
            </span>
            <span className="text-sm bg-[#1a2a40] text-blue-400 px-3 py-1 rounded font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              WF_1772683175197_hpghfbgk6
              <ChevronDownIcon />
            </span>
          </div>
        </div>
        <button
          className="text-sm px-4 py-1.5 rounded font-medium transition-colors border"
          style={{
            backgroundColor: GOLD,
            borderColor: GOLD,
            color: "#0b0f15",
          }}
        >
          Validate Contract &amp; Terms
        </button>
      </div>

      {/* Three-panel content */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: PDF Viewer */}
        <div className={`w-[45%] shrink-0 flex flex-col border-r ${BORDER}`}>
          {/* PDF toolbar */}
          <div
            className={`px-3 py-2 border-b ${BORDER} flex items-center gap-2 text-sm ${TEXT2}`}
          >
            <input
              type="text"
              value={currentPage}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                if (v >= 1 && v <= totalPages) onPageChange(v);
              }}
              className={`w-10 text-center ${SURFACE} border ${BORDER} rounded py-0.5 ${TEXT1} text-sm`}
            />
            <span>of {totalPages}</span>

            <div className="flex items-center gap-1 ml-3">
              <button
                onClick={() => onZoomChange(Math.max(25, zoom - 12))}
                className={`px-1.5 py-0.5 rounded hover:bg-[#1a2332] ${TEXT2}`}
              >
                &minus;
              </button>
              <span className="w-12 text-center text-xs">{zoom}%</span>
              <button
                onClick={() => onZoomChange(Math.min(200, zoom + 12))}
                className={`px-1.5 py-0.5 rounded hover:bg-[#1a2332] ${TEXT2}`}
              >
                +
              </button>
            </div>

            <button
              className={`ml-2 p-1 rounded hover:bg-[#1a2332] ${TEXT2}`}
              title="Fit width"
            >
              <FitWidthIcon />
            </button>
            <button
              className={`p-1 rounded hover:bg-[#1a2332] ${TEXT2}`}
              title="Fit page"
            >
              <FitPageIcon />
            </button>
            <button
              className={`ml-auto p-1 rounded hover:bg-[#1a2332] ${TEXT2}`}
              title="Search"
            >
              <SearchIcon />
            </button>
            <button
              className={`p-1 rounded hover:bg-[#1a2332] ${TEXT2}`}
              title="More"
            >
              &middot;&middot;&middot;
            </button>
          </div>

          {/* PDF document area */}
          <div className="flex-1 overflow-auto p-4 flex justify-center">
            <div
              className="bg-white rounded shadow-lg"
              style={{
                width: `${5.1 * (zoom / 100)}in`,
                minHeight: `${6.6 * (zoom / 100)}in`,
                padding: `${0.5 * (zoom / 100)}in`,
              }}
            >
              <div className="text-center mb-6">
                <p
                  className="text-xs uppercase tracking-widest mb-4 font-semibold"
                  style={{ color: "#c0392b" }}
                >
                  Confidential Information Memorandum
                </p>
                <h2 className="text-gray-900 text-xl font-bold mt-6">
                  Solar Valley Renewable Energy Project
                </h2>
                <p className="text-gray-600 text-sm mt-3">
                  180 MW Solar Photovoltaic Facility
                </p>
                <p className="text-gray-600 text-sm">
                  Kern County, California
                </p>
              </div>

              {/* Key terms table */}
              <div className="mt-8 border border-gray-300 text-sm">
                <div className="grid grid-cols-3">
                  <div className="bg-[#1a3a5c] text-white px-3 py-2 font-semibold text-center text-xs">
                    Senior Secured Term Loan
                  </div>
                  <div className="bg-[#1a3a5c] text-white px-3 py-2 font-semibold text-center text-xs">
                    Power Purchase Agreement
                  </div>
                  <div className="bg-[#1a3a5c] text-white px-3 py-2 font-semibold text-center text-xs">
                    Debt Service Coverage
                  </div>
                </div>
                <div className="grid grid-cols-3 border-t border-gray-300">
                  <div className="px-3 py-2 text-center text-gray-900 font-bold text-sm">
                    $250,000,000
                  </div>
                  <div className="px-3 py-2 text-center text-gray-900 font-bold text-sm border-x border-gray-300">
                    20-Year Fixed Price
                  </div>
                  <div className="px-3 py-2 text-center text-gray-900 font-bold text-sm">
                    1.45x Average (P50)
                  </div>
                </div>
                <div className="grid grid-cols-3 border-t border-gray-200">
                  <div className="px-3 py-1.5 text-center text-gray-500 text-xs">
                    SOFR + 275 bps
                  </div>
                  <div className="px-3 py-1.5 text-center text-gray-500 text-xs border-x border-gray-200">
                    Southern California Edison
                  </div>
                  <div className="px-3 py-1.5 text-center text-gray-500 text-xs">
                    1.28x Minimum
                  </div>
                </div>
              </div>

              <div className="mt-10 text-gray-700 text-sm">
                <p className="font-semibold">Sponsored by</p>
                <p className="text-gray-600">GreenHorizon Energy Partners</p>
                <p className="text-gray-600">Denver, Colorado</p>
              </div>

              <div className="mt-8 text-gray-400 text-sm">January 2026</div>
            </div>
          </div>
        </div>

        {/* MIDDLE: Extracted terms table */}
        <div className={`flex-1 flex flex-col border-r ${BORDER} min-w-0`}>
          {/* Table header */}
          <div
            className={`px-4 py-2.5 border-b ${BORDER} flex items-center justify-between`}
          >
            <span className={`text-sm font-medium ${TEXT1}`}>Title</span>
            <span className={`text-sm font-medium ${TEXT1}`}>Term Value</span>
          </div>

          {/* Term rows */}
          <div className="flex-1 overflow-y-auto">
            {MOCK_TERMS.map((term) => {
              const isSelected = selectedTerm?.id === term.id;
              return (
                <button
                  key={term.id}
                  onClick={() => onSelectTerm(term)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-left border-b border-[#1e2d3d]/50 transition-colors ${
                    isSelected
                      ? "bg-[#1c2940]"
                      : "hover:bg-[#151d28]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-blue-500" />
                    <span
                      className={`text-sm truncate ${
                        isSelected ? TEXT1 : TEXT2
                      }`}
                    >
                      {term.title}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-mono shrink-0 ml-4 ${
                      isSelected ? TEXT1 : TEXT2
                    }`}
                  >
                    {term.value}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Edit panel */}
        <div className="w-[260px] shrink-0 flex flex-col">
          <div
            className={`px-4 py-2.5 border-b ${BORDER} flex items-center justify-end`}
          >
            <button className="text-sm border border-[#3b4f6b] text-blue-400 px-3 py-1 rounded hover:bg-[#1a2a40] transition-colors">
              Edit Terms
            </button>
          </div>

          {selectedTerm ? (
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {/* Term title */}
              <div>
                <label
                  className={`block text-xs font-medium ${TEXT3} mb-1 uppercase tracking-wide`}
                >
                  Term
                </label>
                <p className={`text-sm ${TEXT1}`}>{selectedTerm.title}</p>
              </div>

              {/* Editable value */}
              <div>
                <label
                  className={`block text-xs font-medium ${TEXT3} mb-1 uppercase tracking-wide`}
                >
                  Value
                </label>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => onEditValueChange(e.target.value)}
                  className={`w-full px-3 py-2 rounded ${SURFACE} border ${BORDER} ${TEXT1} text-sm focus:outline-none focus:border-blue-500`}
                />
              </div>

              {/* Source document */}
              <div>
                <label
                  className={`block text-xs font-medium ${TEXT3} mb-1 uppercase tracking-wide`}
                >
                  Source Document
                </label>
                <p className={`text-sm ${TEXT2}`}>
                  Credit_Agreement_Solar_Valley.pdf
                </p>
                <p className={`text-xs ${TEXT3} mt-0.5`}>
                  Page {currentPage}, Section 2.1
                </p>
              </div>

              {/* Obligation mapping */}
              <div>
                <label
                  className={`block text-xs font-medium ${TEXT3} mb-1 uppercase tracking-wide`}
                >
                  Maps to Obligation
                </label>
                <p className={`text-sm ${TEXT2}`}>
                  {selectedTerm.title.includes("Covenant")
                    ? "FINANCIAL_COVENANT"
                    : selectedTerm.title.includes("Fee") ||
                        selectedTerm.title.includes("Payment")
                      ? "PAYMENT_OBLIGATION"
                      : "CONTRACT_TERM"}
                </p>
              </div>

              {/* Action buttons */}
              <div className="pt-2 space-y-2">
                <button className="w-full text-sm bg-[#1a2a40] text-blue-400 px-3 py-2 rounded hover:bg-[#1f3350] transition-colors">
                  Confirm Term
                </button>
                <button
                  className={`w-full text-sm border ${BORDER} ${TEXT2} px-3 py-2 rounded hover:bg-[#1a2332] transition-colors`}
                >
                  Flag for Review
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <span className={`text-sm ${TEXT3}`}>
                Select a term to edit
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ================================================================== */
/*  STEP 2 — Counterparty                                              */
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

function CounterpartyStep() {
  return (
    <>
      {/* Toolbar row */}
      <div
        className={`px-5 py-2 border-b ${BORDER} shrink-0`}
      >
        <div className={`text-[10px] ${TEXT3} uppercase tracking-wide mb-1`}>
          Unnamed Object Dropdown
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${TEXT2}`}>Counterparty</span>
            <span className="text-sm bg-[#1a2a40] text-blue-400 px-3 py-1 rounded font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              Meridian Precision Manufacturing, LLC
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
              Validate Prospective Counterparty
            </button>
            <button className="text-sm border border-blue-400/50 text-blue-400 px-3 py-1.5 rounded font-medium hover:bg-[#1a2a40] transition-colors">
              Edit Prospective Counterparty
            </button>
            <button className="text-sm border border-red-400/50 text-red-400 px-3 py-1.5 rounded font-medium hover:bg-[#2a1a1a] transition-colors">
              Flag Prospective Counterparty
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
                  Prospective Counterparty For Validation
                </span>
                <LockIcon />
              </div>
            </div>
          </div>
        </div>

        {/* Properties section */}
        <div className={`px-5 py-4 border-b ${BORDER}`}>
          <div className="flex items-center gap-2 mb-4">
            <PropertiesIcon />
            <span className={`text-sm font-semibold ${TEXT1}`}>Properties</span>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-1">
            {/* Left column */}
            <div className="space-y-1">
              {COUNTERPARTY_PROPERTIES_LEFT.map((prop) => (
                <PropertyRow
                  key={prop.label}
                  label={prop.label}
                  value={prop.value}
                />
              ))}
            </div>
            {/* Right column */}
            <div className="space-y-1">
              {COUNTERPARTY_PROPERTIES_RIGHT.map((prop) => (
                <PropertyRow
                  key={prop.label}
                  label={prop.label}
                  value={prop.value}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom two-column section */}
        <div className="grid grid-cols-2">
          {/* Left: Know Your Customer */}
          <div className={`px-5 py-4 border-r ${BORDER}`}>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-sm font-semibold ${TEXT1}`}>
                Know Your Customer
              </span>
              <div className="flex items-center gap-2">
                <button
                  className="text-xs px-3 py-1.5 rounded font-medium transition-colors border"
                  style={{
                    backgroundColor: GOLD,
                    borderColor: GOLD,
                    color: "#0b0f15",
                  }}
                >
                  Submit KYC Data
                </button>
                <button className="text-xs border border-blue-400/50 text-blue-400 px-3 py-1.5 rounded font-medium hover:bg-[#1a2a40] transition-colors">
                  Edit KYC Data
                </button>
              </div>
            </div>

            {/* KYC Due Diligence table */}
            <div className={`border ${BORDER} rounded`}>
              <div className={`px-4 py-2.5 border-b ${BORDER}`}>
                <span className={`text-sm font-semibold ${TEXT1}`}>
                  KYC Due Diligence
                </span>
              </div>
              <div className={`px-4 py-2 border-b ${BORDER}`}>
                <span className={`text-xs font-medium ${TEXT2}`}>
                  Object Table
                </span>
              </div>
              <div className="px-4 py-2">
                <span className={`text-xs ${TEXT3}`}>Status</span>
              </div>
              {/* Empty state */}
              <div className="px-4 py-8 flex items-center justify-center">
                <span className={`text-sm ${TEXT3}`}>
                  No KYC records
                </span>
              </div>
            </div>
          </div>

          {/* Right: Projections Workflow */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-4">
              <span className={`text-sm font-semibold ${TEXT1}`}>
                Projections Workflow
              </span>
              <button className="text-xs border border-red-400/50 text-red-400 px-3 py-1.5 rounded font-medium hover:bg-[#2a1a1a] transition-colors">
                Request Risk Reassessment
              </button>
            </div>

            {/* Counterparty Risk table */}
            <div className={`border ${BORDER} rounded`}>
              <div className={`px-4 py-2.5 border-b ${BORDER}`}>
                <span className={`text-sm font-semibold ${TEXT1}`}>
                  Counterparty Risk
                </span>
              </div>
              <div className={`px-4 py-2 border-b ${BORDER}`}>
                <span className={`text-xs font-medium ${TEXT2}`}>
                  Object Table
                </span>
              </div>
              <div className="px-4 py-2">
                <span className={`text-xs ${TEXT3}`}>Status</span>
              </div>
              {/* Empty state */}
              <div className="px-4 py-8 flex items-center justify-center">
                <span className={`text-sm ${TEXT3}`}>
                  No risk assessments
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function PropertyRow({ label, value }: { label: string; value: string }) {
  const isEmpty = !value;
  const isHighlighted =
    value === "BORROWER" ||
    value === "PROSPECT" ||
    value.startsWith("PCTR_");
  return (
    <div className="flex items-baseline gap-4 py-1.5">
      <span className="text-sm text-blue-400 w-[220px] shrink-0 truncate">
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
