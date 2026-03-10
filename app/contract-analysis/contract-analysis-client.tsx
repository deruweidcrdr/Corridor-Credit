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
                  if (v >= 1 && v <= totalPages) setCurrentPage(v);
                }}
                className={`w-10 text-center ${SURFACE} border ${BORDER} rounded py-0.5 ${TEXT1} text-sm`}
              />
              <span>of {totalPages}</span>

              <div className="flex items-center gap-1 ml-3">
                <button
                  onClick={() => setZoom(Math.max(25, zoom - 12))}
                  className={`px-1.5 py-0.5 rounded hover:bg-[#1a2332] ${TEXT2}`}
                >
                  &minus;
                </button>
                <span className="w-12 text-center text-xs">{zoom}%</span>
                <button
                  onClick={() => setZoom(Math.min(200, zoom + 12))}
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
                    onClick={() => handleSelectTerm(term)}
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
                    onChange={(e) => setEditValue(e.target.value)}
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
      </div>
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
