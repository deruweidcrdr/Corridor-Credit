"use client";

import { useState } from "react";
import type { Attachment, Email } from "@/lib/inbox-data";

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
  coral: "#e07060",
  coralDim: "rgba(224,112,96,0.14)",
  blue: "#5b9bd5",
  text: "#e4e8f0",
  textDim: "#9aa4b2",
  textMuted: "#5e6a7a",
  fontBody: "'Syne', sans-serif",
  fontMono: "'DM Mono', monospace",
  fontSerif: "'Instrument Serif', serif",
  radius: 6,
  radiusLg: 10,
};

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
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(0,0,0,0.70)",
        display: "flex",
        flexDirection: "column",
        fontFamily: ds.fontBody,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* ── Top bar ── */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          gap: 16,
          padding: "16px 24px",
        }}
      >
        {/* Counterparty card */}
        <div
          style={{
            border: `1px solid ${ds.borderAccent}`,
            borderRadius: ds.radiusLg,
            padding: "12px 20px",
            background: `${ds.bg}cc`,
            backdropFilter: "blur(8px)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: ds.fontBody,
              fontSize: 14,
              fontWeight: 600,
              color: ds.text,
              lineHeight: 1.3,
            }}
          >
            {attachment.counterparty_name}
          </p>
          <p
            style={{
              margin: "3px 0 0",
              fontFamily: ds.fontMono,
              fontSize: 11,
              color: ds.textMuted,
            }}
          >
            {attachment.counterparty_type}
          </p>
        </div>

        {/* Classification card */}
        <div
          style={{
            border: `1px solid ${ds.borderAccent}`,
            borderRadius: ds.radiusLg,
            padding: "12px 20px",
            background: `${ds.bg}cc`,
            backdropFilter: "blur(8px)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: ds.fontBody,
              fontSize: 14,
              fontWeight: 600,
              color: ds.text,
              lineHeight: 1.3,
            }}
          >
            {attachment.classification}
          </p>
          <p
            style={{
              margin: "3px 0 0",
              fontFamily: ds.fontMono,
              fontSize: 11,
              color: ds.textMuted,
            }}
          >
            {attachment.classification_role}
          </p>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Actions + meta */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            alignItems: "flex-end",
          }}
        >
          <ActionButton
            label="Confirm & Advance Workflow"
            bg={ds.gold}
            hoverBg="#d9b85a"
            textColor="#18140a"
          />
          <ActionButton
            label="Edit Workflow"
            bg={ds.amber}
            hoverBg="#d4945a"
            textColor="#18140a"
          />
          <ActionButton
            label="Archive or Reassign"
            bg={ds.textDim}
            hoverBg="#8a94a8"
            textColor="#18140a"
          />
          {email && (
            <div
              style={{
                fontFamily: ds.fontMono,
                fontSize: 11,
                color: ds.textMuted,
                marginTop: 4,
                textAlign: "right",
                lineHeight: 1.5,
              }}
            >
              <p style={{ margin: 0 }}>{email.from}</p>
              <p style={{ margin: 0 }}>{email.sent_at}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── PDF viewer area ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          margin: "0 24px 24px",
          overflow: "hidden",
          borderRadius: ds.radiusLg,
          border: `1px solid ${ds.border}`,
          background: ds.surface,
        }}
      >
        {/* Toolbar */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 16px",
            borderBottom: `1px solid ${ds.border}`,
            background: ds.surfaceDeep,
          }}
        >
          {/* Page nav */}
          <input
            type="text"
            value={page}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v >= 1 && v <= attachment.pages) setPage(v);
            }}
            style={{
              width: 32,
              textAlign: "center",
              fontFamily: ds.fontMono,
              fontSize: 13,
              background: ds.surfaceRaised,
              border: `1px solid ${ds.borderAccent}`,
              borderRadius: 4,
              padding: "2px 4px",
              color: ds.text,
              outline: "none",
            }}
          />
          <span
            style={{
              fontFamily: ds.fontMono,
              fontSize: 13,
              color: ds.textDim,
            }}
          >
            of {attachment.pages}
          </span>

          <div
            style={{
              width: 1,
              height: 20,
              background: ds.borderAccent,
              margin: "0 4px",
            }}
          />

          {/* Zoom */}
          <ToolbarButton
            label="−"
            onClick={() => setZoom((z) => Math.max(50, z - 10))}
          />
          <span
            style={{
              fontFamily: ds.fontMono,
              fontSize: 13,
              color: ds.textDim,
              width: 40,
              textAlign: "center",
            }}
          >
            {zoom}%
          </span>
          <ToolbarButton
            label="+"
            onClick={() => setZoom((z) => Math.min(200, z + 10))}
          />

          <ToolbarButton icon={<ExpandIcon />} />

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Right toolbar icons */}
          <ToolbarButton icon={<SplitIcon />} />
          <ToolbarButton icon={<MoveIcon />} />
          <ToolbarButton icon={<SearchIcon />} />
          <ToolbarButton label="···" onClick={onClose} />
        </div>

        {/* Document preview */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            display: "flex",
            justifyContent: "center",
            padding: 32,
            background: ds.surfaceRaised,
          }}
        >
          <div
            style={{
              background: "white",
              color: "black",
              borderRadius: ds.radius,
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              width: `${Math.round(595 * (zoom / 100))}px`,
              minHeight: `${Math.round(842 * (zoom / 100))}px`,
              padding: `${Math.round(80 * (zoom / 100))}px ${Math.round(60 * (zoom / 100))}px`,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 40,
              }}
            >
              {/* Title */}
              <h1
                style={{
                  margin: 0,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  alignSelf: "center",
                  fontSize: `${Math.round(22 * (zoom / 100))}px`,
                }}
              >
                {attachment.mock_doc.title}
              </h1>

              {/* Date */}
              <p
                style={{
                  margin: 0,
                  fontSize: `${Math.round(14 * (zoom / 100))}px`,
                }}
              >
                dated as of {attachment.mock_doc.date}
              </p>

              {/* Parties */}
              {attachment.mock_doc.parties.map((party, i) => (
                <div key={i}>
                  <p
                    style={{
                      margin: "0 0 8px",
                      color: "#2563eb",
                      fontSize: `${Math.round(14 * (zoom / 100))}px`,
                    }}
                  >
                    {i === 0 ? "by" : "in favor of"}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      fontSize: `${Math.round(14 * (zoom / 100))}px`,
                    }}
                  >
                    {party.name}
                  </p>
                  <p
                    style={{
                      margin: 0,
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

/* ================================================================== */
/*  Shared sub-components                                              */
/* ================================================================== */

function ActionButton({
  label,
  bg,
  hoverBg,
  textColor,
}: {
  label: string;
  bg: string;
  hoverBg: string;
  textColor: string;
}) {
  return (
    <button
      style={{
        width: 224,
        borderRadius: ds.radius,
        padding: "7px 12px",
        fontFamily: ds.fontBody,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.04em",
        background: bg,
        color: textColor,
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = bg;
      }}
    >
      {label}
    </button>
  );
}

function ToolbarButton({
  label,
  icon,
  onClick,
}: {
  label?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 28,
        height: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 4,
        background: "transparent",
        border: "none",
        color: ds.textDim,
        fontSize: 16,
        cursor: "pointer",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = ds.surfaceRaised;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      {icon || label}
    </button>
  );
}

/* ── Toolbar SVG icons ── */

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
