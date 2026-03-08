"use client";

import { useState } from "react";
import type { Attachment, Email } from "@/lib/inbox-data";

interface Props {
  attachment: Attachment;
  email: Email | null;
  onClose: () => void;
}

export default function DocumentModal({ attachment, email, onClose }: Props) {
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(116);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex flex-col"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* ---- Top bar ---- */}
      <div className="shrink-0 flex flex-wrap items-start gap-4 px-6 py-4">
        {/* Counterparty card */}
        <div className="border border-[#3d4f63] rounded-lg px-5 py-3 bg-[#0b0f15]/80 backdrop-blur">
          <p className="text-white text-sm font-medium leading-tight">
            {attachment.counterparty_name}
          </p>
          <p className="text-[#5a6a7e] text-xs mt-0.5">
            {attachment.counterparty_type}
          </p>
        </div>

        {/* Classification card */}
        <div className="border border-[#3d4f63] rounded-lg px-5 py-3 bg-[#0b0f15]/80 backdrop-blur">
          <p className="text-white text-sm font-medium leading-tight">
            {attachment.classification}
          </p>
          <p className="text-[#5a6a7e] text-xs mt-0.5">
            {attachment.classification_role}
          </p>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions + meta */}
        <div className="flex flex-col gap-1.5 items-end">
          <button className="w-56 rounded px-3 py-1.5 text-sm font-medium bg-[#e8c84a] text-[#1a1a1a] hover:bg-[#d4b63e] transition-colors text-left">
            Confirm &amp; Advance Workflow
          </button>
          <button className="w-56 rounded px-3 py-1.5 text-sm font-medium bg-[#d4845a] text-[#1a1a1a] hover:bg-[#c0764e] transition-colors text-left">
            Edit Workflow
          </button>
          <button className="w-56 rounded px-3 py-1.5 text-sm font-medium bg-[#8b9bb4] text-[#1a1a1a] hover:bg-[#7d8da4] transition-colors text-left">
            Archive or Reassign
          </button>
          {email && (
            <div className="text-[11px] text-[#5a6a7e] mt-1 text-right">
              <p>{email.from}</p>
              <p>{email.sent_at}</p>
            </div>
          )}
        </div>
      </div>

      {/* ---- PDF viewer area ---- */}
      <div className="flex-1 flex flex-col mx-6 mb-6 overflow-hidden rounded-lg border border-[#1e2d3d] bg-[#111820]">
        {/* Toolbar */}
        <div className="shrink-0 flex items-center gap-3 px-4 py-2 border-b border-[#1e2d3d] bg-[#0d1219]">
          {/* Page nav */}
          <input
            type="text"
            value={page}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v >= 1 && v <= attachment.pages) setPage(v);
            }}
            className="w-8 text-center text-sm bg-[#1a2332] border border-[#2d3f52] rounded px-1 py-0.5 text-[#e2e8f0]"
          />
          <span className="text-sm text-[#8b9bb4]">
            of {attachment.pages}
          </span>

          <div className="w-px h-5 bg-[#1e2d3d] mx-1" />

          {/* Zoom */}
          <button
            onClick={() => setZoom((z) => Math.max(50, z - 10))}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#1a2332] text-[#8b9bb4] text-lg"
          >
            &minus;
          </button>
          <span className="text-sm text-[#8b9bb4] w-10 text-center">
            {zoom}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(200, z + 10))}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#1a2332] text-[#8b9bb4] text-lg"
          >
            +
          </button>

          <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#1a2332] text-[#8b9bb4]">
            <ExpandIcon />
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right toolbar icons */}
          <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#1a2332] text-[#8b9bb4]">
            <SplitIcon />
          </button>
          <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#1a2332] text-[#8b9bb4]">
            <MoveIcon />
          </button>
          <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#1a2332] text-[#8b9bb4]">
            <SearchIcon />
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#1a2332] text-[#8b9bb4]"
          >
            &middot;&middot;&middot;
          </button>
        </div>

        {/* Document preview */}
        <div className="flex-1 overflow-auto flex justify-center py-8 bg-[#1a2332]">
          <div
            className="bg-white text-black rounded shadow-2xl"
            style={{
              width: `${Math.round(595 * (zoom / 100))}px`,
              minHeight: `${Math.round(842 * (zoom / 100))}px`,
              padding: `${Math.round(80 * (zoom / 100))}px ${Math.round(60 * (zoom / 100))}px`,
            }}
          >
            <div className="flex flex-col items-start gap-10">
              {/* Title */}
              <h1
                className="font-bold tracking-wide self-center"
                style={{ fontSize: `${Math.round(22 * (zoom / 100))}px` }}
              >
                {attachment.mock_doc.title}
              </h1>

              {/* Date */}
              <p style={{ fontSize: `${Math.round(14 * (zoom / 100))}px` }}>
                dated as of {attachment.mock_doc.date}
              </p>

              {/* Parties */}
              {attachment.mock_doc.parties.map((party, i) => (
                <div key={i}>
                  {i === 0 && (
                    <p
                      className="text-blue-700 mb-2"
                      style={{
                        fontSize: `${Math.round(14 * (zoom / 100))}px`,
                      }}
                    >
                      by
                    </p>
                  )}
                  {i > 0 && (
                    <p
                      className="text-blue-700 mb-2"
                      style={{
                        fontSize: `${Math.round(14 * (zoom / 100))}px`,
                      }}
                    >
                      in favor of
                    </p>
                  )}
                  <p
                    className="font-bold"
                    style={{
                      fontSize: `${Math.round(14 * (zoom / 100))}px`,
                    }}
                  >
                    {party.name}
                  </p>
                  <p
                    style={{
                      fontSize: `${Math.round(13 * (zoom / 100))}px`,
                    }}
                  >
                    {party.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- Toolbar SVG icons ---- */

function ExpandIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

function SplitIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2" /><line x1="12" y1="2" x2="12" y2="22" />
    </svg>
  );
}

function MoveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="5 9 2 12 5 15" /><polyline points="9 5 12 2 15 5" />
      <polyline points="15 19 12 22 9 19" /><polyline points="19 9 22 12 19 15" />
      <line x1="2" y1="12" x2="22" y2="12" /><line x1="12" y1="2" x2="12" y2="22" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
