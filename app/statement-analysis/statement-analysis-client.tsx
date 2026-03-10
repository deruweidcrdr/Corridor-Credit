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
  { number: 2, label: "Approval" },
];

/* ------------------------------------------------------------------ */
/*  Mock extracted financial metrics                                   */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/*  Root component                                                     */
/* ------------------------------------------------------------------ */
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
        {activeStep === 2 && <ApprovalPlaceholder />}
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
      {/* Toolbar row */}
      <div className={`px-5 py-2.5 border-b ${BORDER} shrink-0`}>
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
        </div>

        {/* Historical / Pro Forma tabs */}
        <div className="flex items-center gap-0 mt-2">
          <button
            onClick={() => onTabChange("historical")}
            className={`text-sm px-3 py-1.5 border-b-2 transition-colors ${
              activeTab === "historical"
                ? "border-blue-400 text-blue-400 font-medium"
                : `border-transparent ${TEXT3} hover:text-[#8b9bb4]`
            }`}
          >
            Historical
          </button>
          <button
            onClick={() => onTabChange("pro_forma")}
            className={`text-sm px-3 py-1.5 border-b-2 transition-colors ${
              activeTab === "pro_forma"
                ? "border-blue-400 text-blue-400 font-medium"
                : `border-transparent ${TEXT3} hover:text-[#8b9bb4]`
            }`}
          >
            Pro Forma
          </button>
        </div>
      </div>

      {/* Statement selector row */}
      <div
        className={`px-5 py-2.5 border-b ${BORDER} flex items-center justify-between shrink-0`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-medium ${TEXT3} uppercase tracking-wide`}
          >
            Statement to Process
          </span>
          <span className="text-sm bg-[#1a2a40] text-blue-400 px-3 py-1 rounded font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            Financial_Statements_Meridian_Precision.pdf
            <ChevronDownIcon />
          </span>
        </div>
        <button
          className="text-sm px-4 py-1.5 rounded font-medium transition-colors border"
          style={{
            backgroundColor: GOLD,
            borderColor: GOLD,
            color: "#0b0f15",
          }}
        >
          Validate Financial Statement
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
              <div className="mb-8">
                <h2 className="text-gray-900 text-lg font-bold uppercase tracking-wide text-center">
                  Financial Statements
                </h2>
                <p className="text-gray-600 text-sm mt-4 font-semibold">
                  Historical and Projected
                </p>
                <p className="text-gray-800 text-sm mt-6 font-bold uppercase tracking-wide">
                  Meridian Precision Manufacturing, LLC
                </p>
                <p className="text-blue-600 text-sm mt-3 italic">
                  For the Fiscal Years Ended December 31
                </p>
              </div>

              {/* Period/Type/Basis table */}
              <div className="mt-8 border border-gray-300 text-sm">
                <div className="grid grid-cols-3">
                  <div className="bg-[#1a3a5c] text-white px-3 py-2 font-semibold text-center text-xs">
                    Period
                  </div>
                  <div className="bg-[#1a3a5c] text-white px-3 py-2 font-semibold text-center text-xs">
                    Type
                  </div>
                  <div className="bg-[#1a3a5c] text-white px-3 py-2 font-semibold text-center text-xs">
                    Basis
                  </div>
                </div>
                {[
                  {
                    period: "FY 2022",
                    type: "Historical",
                    typeColor: "#d4a843",
                    basis: "Audited - Thompson & Associates, CPAs",
                  },
                  {
                    period: "FY 2023",
                    type: "Historical",
                    typeColor: "#d4a843",
                    basis: "Audited - Thompson & Associates, CPAs",
                  },
                  {
                    period: "FY 2024",
                    type: "Historical",
                    typeColor: "#d4a843",
                    basis: "Audited - Thompson & Associates, CPAs",
                  },
                  {
                    period: "FY 2025",
                    type: "Projected",
                    typeColor: "#3b82f6",
                    basis: "Management Forecast",
                  },
                  {
                    period: "FY 2026",
                    type: "Projected",
                    typeColor: "#3b82f6",
                    basis: "Management Forecast",
                  },
                  {
                    period: "FY 2027",
                    type: "Projected",
                    typeColor: "#3b82f6",
                    basis: "Management Forecast",
                  },
                ].map((row, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-3 border-t border-gray-200"
                  >
                    <div className="px-3 py-1.5 text-center text-gray-700 text-xs">
                      {row.period}
                    </div>
                    <div
                      className="px-3 py-1.5 text-center text-xs font-medium"
                      style={{ color: row.typeColor }}
                    >
                      {row.type}
                    </div>
                    <div className="px-3 py-1.5 text-center text-gray-500 text-xs">
                      {row.basis}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE: Extracted metrics table */}
        <div className={`flex-1 flex flex-col border-r ${BORDER} min-w-0`}>
          {/* Table header with action buttons */}
          <div
            className={`px-4 py-2.5 border-b ${BORDER} flex items-center justify-between`}
          >
            <div className="flex items-center gap-4">
              <span className={`text-sm font-medium ${TEXT1}`}>
                Metric Name
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${TEXT1}`}>
                Financial Statement - FY 2023
              </span>
            </div>
          </div>

          {/* Metric rows */}
          <div className="flex-1 overflow-y-auto">
            {MOCK_METRICS.map((metric) => {
              const isSelected = selectedMetric?.id === metric.id;
              return (
                <button
                  key={metric.id}
                  onClick={() => onSelectMetric(metric)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-left border-b border-[#1e2d3d]/50 transition-colors ${
                    isSelected ? "bg-[#1c2940]" : "hover:bg-[#151d28]"
                  }`}
                >
                  <span
                    className={`text-sm truncate ${
                      isSelected ? TEXT1 : TEXT2
                    }`}
                  >
                    {metric.name}
                  </span>
                  <span
                    className={`text-sm font-mono shrink-0 ml-4 ${
                      isSelected ? TEXT1 : TEXT2
                    }`}
                  >
                    {metric.value}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Action & edit panel */}
        <div className="w-[260px] shrink-0 flex flex-col">
          <div
            className={`px-4 py-2.5 border-b ${BORDER} flex items-center justify-end`}
          >
            <button className="text-sm border border-[#3b4f6b] text-blue-400 px-3 py-1 rounded hover:bg-[#1a2a40] transition-colors">
              Edit Financial Statement
            </button>
          </div>

          {selectedMetric ? (
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {/* Metric name */}
              <div>
                <label
                  className={`block text-xs font-medium ${TEXT3} mb-1 uppercase tracking-wide`}
                >
                  Metric
                </label>
                <p className={`text-sm ${TEXT1}`}>{selectedMetric.name}</p>
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

              {/* Period */}
              <div>
                <label
                  className={`block text-xs font-medium ${TEXT3} mb-1 uppercase tracking-wide`}
                >
                  Period
                </label>
                <p className={`text-sm ${TEXT2}`}>FY 2023</p>
              </div>

              {/* Source */}
              <div>
                <label
                  className={`block text-xs font-medium ${TEXT3} mb-1 uppercase tracking-wide`}
                >
                  Source
                </label>
                <p className={`text-sm ${TEXT2}`}>
                  Financial_Statements_Meridian_Precision.pdf
                </p>
                <p className={`text-xs ${TEXT3} mt-0.5`}>
                  Page {currentPage}, extracted via LLM
                </p>
              </div>

              {/* Action buttons */}
              <div className="pt-2 space-y-2">
                <button className="w-full text-sm bg-[#1a2a40] text-blue-400 px-3 py-2 rounded hover:bg-[#1f3350] transition-colors">
                  Confirm Value
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
                Select a metric to edit
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ================================================================== */
/*  STEP 2 — Approval (placeholder)                                    */
/* ================================================================== */

function ApprovalPlaceholder() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <span className={`text-lg ${TEXT3}`}>
          Approval workflow — coming soon
        </span>
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
