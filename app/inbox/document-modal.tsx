"use client";

import { useState, useEffect, useRef } from "react";
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
  amber: "#e8a040",
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
};

interface Props {
  attachment: Attachment;
  email: Email | null;
  onClose: () => void;
}

/** Derive the classification badge */
function classTag(att: Attachment): { label: string; color: string; bg: string; borderColor: string; cls: string } {
  const fn = att.file_name.toLowerCase();
  if (fn.includes("security")) {
    return { label: "SECURITY", color: ds.amber, bg: "rgba(232,160,64,0.12)", borderColor: "rgba(232,160,64,0.30)", cls: "COLLATERAL" };
  }
  if (att.classification.includes("CONTRACT")) {
    return { label: "TERMS", color: ds.gold, bg: ds.goldDim, borderColor: "rgba(200,168,75,0.30)", cls: "CONTRACT_TERM" };
  }
  return { label: "FIN", color: ds.blue, bg: ds.blueDim, borderColor: "rgba(91,155,213,0.28)", cls: "FINANCIAL_DATA" };
}

export default function DocumentShelf({ attachment, email, onClose }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const tag = classTag(attachment);

  // Fetch the PDF as a blob so we can set the correct MIME type
  // (Supabase serves files as application/octet-stream)
  useEffect(() => {
    if (!attachment.storage_url) return;
    let revoked = false;
    fetch(attachment.storage_url)
      .then((r) => r.blob())
      .then((blob) => {
        if (revoked) return;
        const pdfBlob = new Blob([blob], { type: "application/pdf" });
        setPdfBlobUrl(URL.createObjectURL(pdfBlob));
      })
      .catch(() => {});
    return () => {
      revoked = true;
      setPdfBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [attachment.storage_url]);

  // Animate in on mount
  useEffect(() => {
    requestAnimationFrame(() => setIsOpen(true));
  }, []);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 280);
  };

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.50)",
          zIndex: 299,
          opacity: isOpen ? 1 : 0,
          transition: "opacity 0.28s",
          pointerEvents: isOpen ? "all" : "none",
        }}
        onClick={handleClose}
      />

      {/* Shelf panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 720,
          maxWidth: "55vw",
          background: ds.surfaceDeep,
          borderLeft: `1px solid ${ds.borderAccent}`,
          zIndex: 300,
          display: "flex",
          flexDirection: "column",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "-24px 0 80px rgba(0,0,0,0.6)",
          fontFamily: ds.fontBody,
        }}
      >
        {/* ── Shelf header ── */}
        <div
          style={{
            flexShrink: 0,
            borderBottom: `1px solid ${ds.border}`,
            background: ds.surfaceRaised,
          }}
        >
          {/* Top bar with doc name + close */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 20px",
              borderBottom: `1px solid ${ds.border}`,
            }}
          >
            <div
              style={{
                fontFamily: ds.fontMono,
                fontSize: 11,
                color: ds.textDim,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ color: ds.text, fontWeight: 500 }}>
                {attachment.file_name}
              </span>
              <span style={{ color: ds.textMuted }}>·</span>
              <span>{attachment.pages} pages</span>
              <span
                style={{
                  fontFamily: ds.fontMono,
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  padding: "2px 6px",
                  borderRadius: 3,
                  marginLeft: 4,
                  background: tag.bg,
                  color: tag.color,
                  border: `1px solid ${tag.borderColor}`,
                }}
              >
                {tag.label}
              </span>
            </div>
            <button
              onClick={handleClose}
              style={{
                background: "transparent",
                border: `1px solid ${ds.border}`,
                color: ds.textMuted,
                padding: "5px 12px",
                borderRadius: ds.radius,
                cursor: "pointer",
                fontSize: 12,
                fontFamily: ds.fontBody,
                fontWeight: 600,
                letterSpacing: "0.04em",
                transition: "all 0.13s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = ds.text;
                e.currentTarget.style.borderColor = ds.borderAccent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = ds.textMuted;
                e.currentTarget.style.borderColor = ds.border;
              }}
            >
              ✕ Close
            </button>
          </div>

          {/* Action buttons row */}
          <div
            style={{
              display: "flex",
              gap: 8,
              padding: "14px 20px",
            }}
          >
            <ShelfButton variant="gold">Confirm & Advance Workflow →</ShelfButton>
            <ShelfButton variant="ghost">Edit Workflow</ShelfButton>
          </div>
        </div>

        {/* ── Doc metadata strip ── */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: `1px solid ${ds.border}`,
            background: ds.surface,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <MetaItem label="Source Document" value={attachment.file_name} />
          <MetaItem
            label="Maps to Obligation"
            value={tag.cls}
            valueColor={ds.blue}
          />
          <MetaItem label="Party Role" value={attachment.classification_role} />
          <MetaItem
            label="Workflow Stage"
            value="TERMS_EXTRACTED"
            valueColor={ds.amber}
          />
        </div>

        {/* ── PDF viewer ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          {/* Toolbar */}
          <div
            style={{
              flexShrink: 0,
              background: ds.surface,
              borderBottom: `1px solid ${ds.border}`,
              padding: "8px 20px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontFamily: ds.fontMono,
              fontSize: 11,
              color: ds.textDim,
            }}
          >
            <span style={{ color: ds.text }}>{attachment.file_name}</span>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => iframeRef.current?.requestFullscreen?.()}
              style={{
                background: "transparent",
                border: `1px solid ${ds.border}`,
                color: ds.textDim,
                padding: "4px 10px",
                borderRadius: ds.radius,
                cursor: "pointer",
                fontSize: 11,
                fontFamily: ds.fontBody,
                fontWeight: 600,
                letterSpacing: "0.04em",
                transition: "all 0.13s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = ds.text;
                e.currentTarget.style.borderColor = ds.borderAccent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = ds.textDim;
                e.currentTarget.style.borderColor = ds.border;
              }}
            >
              Fullscreen
            </button>
          </div>

          {/* PDF iframe or fallback */}
          {pdfBlobUrl ? (
            <iframe
              ref={iframeRef}
              src={pdfBlobUrl}
              style={{
                flex: 1,
                width: "100%",
                border: "none",
                background: "#fff",
              }}
              title={attachment.file_name}
            />
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: ds.textMuted,
                fontFamily: ds.fontBody,
                fontSize: 14,
              }}
            >
              {attachment.storage_url ? "Loading PDF…" : "No PDF available in storage"}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ================================================================== */
/*  Shelf sub-components                                               */
/* ================================================================== */

function ShelfButton({
  variant,
  children,
}: {
  variant: "gold" | "ghost" | "coral";
  children: React.ReactNode;
}) {
  const styles: Record<string, React.CSSProperties> = {
    gold: { background: ds.gold, color: "#18140a", flex: 1 },
    ghost: {
      background: "transparent",
      color: ds.textDim,
      border: `1px solid ${ds.borderAccent}`,
    },
    coral: {
      background: "transparent",
      color: ds.coral,
      border: "1px solid rgba(224,112,96,0.35)",
    },
  };

  const hoverBgs: Record<string, string> = {
    gold: "#d9b85a",
    ghost: "rgba(255,255,255,0.04)",
    coral: ds.coralDim,
  };

  return (
    <button
      style={{
        padding: "10px 18px",
        borderRadius: ds.radius,
        fontFamily: ds.fontBody,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        cursor: "pointer",
        border: "none",
        transition: "all 0.13s",
        whiteSpace: "nowrap",
        ...styles[variant],
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = hoverBgs[variant];
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background =
          (styles[variant].background as string) ?? "transparent";
      }}
    >
      {children}
    </button>
  );
}

function MetaItem({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <span
        style={{
          fontFamily: ds.fontMono,
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.10em",
          color: ds.textMuted,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: ds.fontMono,
          fontSize: 12,
          color: valueColor ?? ds.text,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </span>
    </div>
  );
}
