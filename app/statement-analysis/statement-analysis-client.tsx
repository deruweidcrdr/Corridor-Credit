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
const GOLD = "text-[#d4a843]";

/* ------------------------------------------------------------------ */
/*  Mock extracted entities                                            */
/* ------------------------------------------------------------------ */
interface ExtractedEntity {
  id: string;
  title: string;
  value: string;
  status: "confirmed" | "pending" | "flagged";
}

const MOCK_ENTITIES: ExtractedEntity[] = [
  { id: "1", title: "Revenue", value: "24,500,000", status: "confirmed" },
  { id: "2", title: "Cost of Goods Sold", value: "14,700,000", status: "confirmed" },
  { id: "3", title: "Gross Profit", value: "9,800,000", status: "confirmed" },
  { id: "4", title: "Operating Expenses", value: "4,200,000", status: "pending" },
  { id: "5", title: "EBITDA", value: "5,600,000", status: "confirmed" },
  { id: "6", title: "Depreciation & Amort.", value: "1,100,000", status: "confirmed" },
  { id: "7", title: "Interest Expense", value: "850,000", status: "confirmed" },
  { id: "8", title: "Net Income", value: "2,740,000", status: "confirmed" },
  { id: "9", title: "Total Assets", value: "38,200,000", status: "pending" },
  { id: "10", title: "Total Liabilities", value: "22,100,000", status: "flagged" },
  { id: "11", title: "Shareholders' Equity", value: "16,100,000", status: "confirmed" },
  { id: "12", title: "Current Assets", value: "12,400,000", status: "confirmed" },
  { id: "13", title: "Current Liabilities", value: "7,800,000", status: "confirmed" },
  { id: "14", title: "Working Capital", value: "4,600,000", status: "confirmed" },
  { id: "15", title: "Current Ratio", value: "1.59x", status: "confirmed" },
  { id: "16", title: "Debt Service Coverage", value: "1.45x", status: "confirmed" },
];

/* ------------------------------------------------------------------ */
/*  Root component                                                     */
/* ------------------------------------------------------------------ */
export default function StatementAnalysisClient() {
  const [selectedEntity, setSelectedEntity] = useState<ExtractedEntity | null>(
    MOCK_ENTITIES[0]
  );
  const [editValue, setEditValue] = useState(MOCK_ENTITIES[0].value);
  const [zoom, setZoom] = useState(88);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 8;

  function handleSelectEntity(entity: ExtractedEntity) {
    setSelectedEntity(entity);
    setEditValue(entity.value);
  }

  return (
    <div className={`flex h-screen overflow-hidden ${BG} ${TEXT1}`}>
      <Sidebar />

      {/* Three-panel workbench area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top toolbar */}
        <div
          className={`px-5 py-2.5 border-b ${BORDER} flex items-center justify-between shrink-0`}
        >
          <div className="flex items-center gap-4">
            <span className={`text-sm font-medium ${TEXT2}`}>
              STATEMENT TO PROCESS
            </span>
            <span className="text-sm bg-[#1a2a40] text-blue-400 px-3 py-1 rounded font-mono">
              FIN_20260115_001
            </span>
            <span className={`text-sm font-medium ${TEXT2} ml-4`}>
              COUNTERPARTY
            </span>
            <span className="text-sm bg-[#1a2a40] text-blue-400 px-3 py-1 rounded font-mono">
              Solar Valley Holdings, LLC
            </span>
          </div>
          <button className="text-sm bg-[#d4a843] text-[#0b0f15] px-4 py-1.5 rounded font-medium hover:bg-[#c49a38] transition-colors">
            Validate Statement
          </button>
        </div>

        {/* Three-panel content */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: PDF Viewer */}
          <div
            className={`w-[45%] shrink-0 flex flex-col border-r ${BORDER}`}
          >
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
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-4">
                    Financial Statements
                  </p>
                  <h2 className="text-gray-900 text-lg font-semibold">
                    Solar Valley Holdings, LLC
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Annual Financial Statements
                  </p>
                  <p className="text-gray-500 text-sm">
                    For the Year Ended December 31, 2025
                  </p>
                </div>

                <div className="mt-8 space-y-2">
                  {[
                    "Consolidated Balance Sheet",
                    "Consolidated Income Statement",
                    "Consolidated Cash Flow Statement",
                    "Notes to Financial Statements",
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between text-gray-700 text-sm border-b border-gray-200 pb-1"
                    >
                      <span>{item}</span>
                      <span className="text-gray-400">{i + 2}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* MIDDLE: Extracted entities table */}
          <div
            className={`flex-1 flex flex-col border-r ${BORDER} min-w-0`}
          >
            {/* Table header */}
            <div
              className={`px-4 py-2.5 border-b ${BORDER} flex items-center justify-between`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${TEXT1}`}>Title</span>
              </div>
              <span className={`text-sm font-medium ${TEXT1}`}>Value</span>
            </div>

            {/* Entity rows */}
            <div className="flex-1 overflow-y-auto">
              {MOCK_ENTITIES.map((entity) => {
                const isSelected = selectedEntity?.id === entity.id;
                return (
                  <button
                    key={entity.id}
                    onClick={() => handleSelectEntity(entity)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-left border-b border-[#1e2d3d]/50 transition-colors ${
                      isSelected
                        ? "bg-[#1c2940]"
                        : "hover:bg-[#151d28]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <StatusDot status={entity.status} />
                      <span
                        className={`text-sm truncate ${
                          isSelected ? TEXT1 : TEXT2
                        }`}
                      >
                        {entity.title}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-mono shrink-0 ml-4 ${
                        isSelected ? TEXT1 : TEXT2
                      }`}
                    >
                      {entity.value}
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
                Edit Values
              </button>
            </div>

            {selectedEntity ? (
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {/* Entity title */}
                <div>
                  <label
                    className={`block text-xs font-medium ${TEXT3} mb-1 uppercase tracking-wide`}
                  >
                    Field
                  </label>
                  <p className={`text-sm ${TEXT1}`}>
                    {selectedEntity.title}
                  </p>
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

                {/* Status */}
                <div>
                  <label
                    className={`block text-xs font-medium ${TEXT3} mb-1 uppercase tracking-wide`}
                  >
                    Status
                  </label>
                  <div className="flex items-center gap-2">
                    <StatusDot status={selectedEntity.status} />
                    <span className={`text-sm ${TEXT2} capitalize`}>
                      {selectedEntity.status}
                    </span>
                  </div>
                </div>

                {/* Source reference */}
                <div>
                  <label
                    className={`block text-xs font-medium ${TEXT3} mb-1 uppercase tracking-wide`}
                  >
                    Source
                  </label>
                  <p className={`text-sm ${TEXT2}`}>
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
                  Select an entity to edit
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
/*  Small components                                                   */
/* ================================================================== */

function StatusDot({ status }: { status: "confirmed" | "pending" | "flagged" }) {
  const color =
    status === "confirmed"
      ? "bg-blue-500"
      : status === "pending"
        ? "bg-yellow-500"
        : "bg-red-500";
  return <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />;
}

/* ================================================================== */
/*  Icons                                                              */
/* ================================================================== */

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
