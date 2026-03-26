"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Attachment, Email } from "@/lib/inbox-data";
import { useSignedUrl } from "@/lib/hooks/use-signed-url";

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
  onArchived?: () => void;
  onReviewed?: () => void;
  onEdited?: () => void;
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

/** Banker option for the assignment dropdown */
interface BankerOption {
  banker_id: string;
  full_name: string;
  title: string;
}

export default function DocumentShelf({ attachment, email, onClose, onArchived, onReviewed, onEdited }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { signedUrl } = useSignedUrl(attachment.id);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Banker dropdown state
  const [bankers, setBankers] = useState<BankerOption[]>([]);
  const [selectedBankerId, setSelectedBankerId] = useState<string>("");

  // Fetch bankers on mount
  useEffect(() => {
    fetch("/api/bankers")
      .then((r) => r.json())
      .then((data: BankerOption[]) => {
        setBankers(data);
        if (data.length > 0) setSelectedBankerId(data[0].banker_id);
      })
      .catch(() => {});
  }, []);

  const tag = classTag(attachment);

  // Fetch the PDF as a blob so we can set the correct MIME type
  // (Supabase serves files as application/octet-stream)
  useEffect(() => {
    if (!signedUrl) return;
    let revoked = false;
    fetch(signedUrl)
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
  }, [signedUrl]);

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

  // ── Archive handler ──────────────────────────────────────────────
  const handleArchive = useCallback(async () => {
    if (!attachment.workflow_for_validation_id) return;
    if (!confirm("Archive this workflow? It will be hidden from the inbox and downstream analysis pages.")) return;

    setArchiving(true);
    setError(null);
    try {
      const res = await fetch("/api/workflows/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowForValidationId: attachment.workflow_for_validation_id }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      onArchived?.();
      handleClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setArchiving(false);
    }
  }, [attachment.workflow_for_validation_id, onArchived]);

  // ── Mark reviewed handler ──────────────────────────────────────────
  const handleMarkReviewed = useCallback(async () => {
    if (!attachment.workflow_for_validation_id) return;

    setReviewing(true);
    setError(null);
    try {
      const res = await fetch("/api/workflows/mark-reviewed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowForValidationId: attachment.workflow_for_validation_id }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      onReviewed?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setReviewing(false);
    }
  }, [attachment.workflow_for_validation_id, onReviewed]);

  // ── Edit workflow handler ──────────────────────────────────────────
  const handleEditWorkflow = useCallback(() => {
    setEditing(true);
  }, []);

  const handleSaveEdit = useCallback(async (updates: Record<string, unknown>) => {
    if (!attachment.workflow_for_validation_id) return;
    setError(null);
    try {
      const res = await fetch("/api/workflows/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowForValidationId: attachment.workflow_for_validation_id,
          updates,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      setEditing(false);
      onEdited?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [attachment.workflow_for_validation_id, onEdited]);

  const displayStage = attachment.workflow_stage || "TERMS_EXTRACTED";
  const stageColor = attachment.workflow_stage === "VALIDATED" ? ds.green : ds.amber;
  const isReviewed = !!attachment.wfv_reviewed_at;

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

          {/* Action buttons */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              padding: "14px 20px",
            }}
          >
            <ShelfButton
              variant="gold"
              onClick={handleEditWorkflow}
            >
              Edit Workflow
            </ShelfButton>
            <ShelfButton
              variant="coral"
              onClick={handleArchive}
              disabled={archiving}
            >
              {archiving ? "Archiving…" : "Archive"}
            </ShelfButton>
            <ShelfButton
              variant="ghost"
              onClick={handleMarkReviewed}
              disabled={reviewing || isReviewed}
            >
              {reviewing ? "Marking…" : isReviewed ? "✓ Reviewed" : "Mark Reviewed"}
            </ShelfButton>
          </div>

          {/* Error banner */}
          {error && (
            <div
              style={{
                padding: "8px 20px",
                background: ds.coralDim,
                borderTop: `1px solid rgba(224,112,96,0.30)`,
                fontFamily: ds.fontMono,
                fontSize: 11,
                color: ds.coral,
              }}
            >
              Error: {error}
            </div>
          )}
        </div>

        {/* ── Edit form (shown when editing) ── */}
        {editing && (
          <EditWorkflowForm
            attachment={attachment}
            onSave={handleSaveEdit}
            onCancel={() => setEditing(false)}
          />
        )}

        {/* ── Doc metadata strip ── */}
        {!editing && (
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
            <MetaItem
              label="Counterparty Type"
              value={attachment.wfv_counterparty_type ?? "—"}
            />
            <MetaItem
              label="Relationship Status"
              value={attachment.wfv_relationship_status ?? "—"}
              valueColor={
                attachment.wfv_relationship_status === "PROSPECT"
                  ? ds.amber
                  : attachment.wfv_relationship_status === "ACTIVE RELATIONSHIP"
                    ? ds.green
                    : undefined
              }
            />
            <MetaItem
              label="Document Type"
              value={attachment.wfv_document_type ?? "—"}
            />
            <MetaItem
              label="Extraction Stage"
              value={attachment.wfv_initial_extraction_stage ?? "—"}
            />
            <MetaItem
              label="Workflow Stage"
              value={displayStage}
              valueColor={stageColor}
            />

            {/* Banker assignment dropdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span
                style={{
                  fontFamily: ds.fontMono,
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.10em",
                  color: ds.textMuted,
                }}
              >
                Assign Banker
              </span>
              <select
                value={selectedBankerId}
                onChange={(e) => setSelectedBankerId(e.target.value)}
                style={{
                  fontFamily: ds.fontMono,
                  fontSize: 12,
                  color: ds.text,
                  background: ds.surfaceRaised,
                  border: `1px solid ${ds.borderAccent}`,
                  borderRadius: ds.radius,
                  padding: "4px 8px",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                {bankers.length === 0 && (
                  <option value="">Loading…</option>
                )}
                {bankers.map((b) => (
                  <option key={b.banker_id} value={b.banker_id}>
                    {b.full_name} — {b.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

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
              {signedUrl ? "Loading PDF…" : "Loading document…"}
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
  onClick,
  disabled,
}: {
  variant: "gold" | "ghost" | "coral" | "green";
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const styles: Record<string, React.CSSProperties> = {
    gold: { background: ds.gold, color: "#18140a", flex: 1 },
    green: { background: ds.green, color: "#0d1017", flex: 1 },
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
    green: "#5bbf92",
    ghost: "rgba(255,255,255,0.04)",
    coral: ds.coralDim,
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "10px 18px",
        borderRadius: ds.radius,
        fontFamily: ds.fontBody,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        cursor: disabled ? "default" : "pointer",
        border: "none",
        transition: "all 0.13s",
        whiteSpace: "nowrap",
        opacity: disabled && variant !== "green" ? 0.6 : 1,
        ...styles[variant],
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = hoverBgs[variant];
      }}
      onMouseLeave={(e) => {
        if (!disabled)
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

/* ── Inline edit form for classification fields ── */
const CONTENT_FLAGS_OPTIONS = ["TERMS", "FINANCIALS", "TERMS_AND_FINANCIALS"];
const DOCUMENT_TYPE_OPTIONS = [
  "CONTRACT",
  "FINANCIAL_STATEMENT",
  "SECURITY_AGREEMENT",
  "INTERCREDITOR_AGREEMENT",
  "TERM_SHEET",
  "CIM",
  "OTHER",
];

function EditWorkflowForm({
  attachment,
  onSave,
  onCancel,
}: {
  attachment: Attachment;
  onSave: (updates: Record<string, unknown>) => void;
  onCancel: () => void;
}) {
  const [contentFlags, setContentFlags] = useState(
    attachment.wfv_document_content_flags ?? ""
  );
  const [documentType, setDocumentType] = useState(
    attachment.wfv_document_type ?? ""
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    const updates: Record<string, unknown> = {};
    if (contentFlags !== (attachment.wfv_document_content_flags ?? "")) {
      updates.document_content_flags = contentFlags;
    }
    if (documentType !== (attachment.wfv_document_type ?? "")) {
      updates.document_type = documentType;
    }
    if (Object.keys(updates).length === 0) {
      onCancel();
      return;
    }
    await onSave(updates);
    setSaving(false);
  };

  const selectStyle: React.CSSProperties = {
    fontFamily: ds.fontMono,
    fontSize: 12,
    color: ds.text,
    background: ds.surfaceRaised,
    border: `1px solid ${ds.borderAccent}`,
    borderRadius: ds.radius,
    padding: "5px 8px",
    cursor: "pointer",
    outline: "none",
    width: "100%",
  };

  return (
    <div
      style={{
        padding: "16px 20px",
        borderTop: `1px solid ${ds.border}`,
        background: ds.surface,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <span
        style={{
          fontFamily: ds.fontMono,
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          color: ds.gold,
        }}
      >
        Edit Classification
      </span>

      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <span
          style={{
            fontFamily: ds.fontMono,
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.10em",
            color: ds.textMuted,
          }}
        >
          Content Flags
        </span>
        <select
          value={contentFlags}
          onChange={(e) => setContentFlags(e.target.value)}
          style={selectStyle}
        >
          <option value="">—</option>
          {CONTENT_FLAGS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <span
          style={{
            fontFamily: ds.fontMono,
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.10em",
            color: ds.textMuted,
          }}
        >
          Document Type
        </span>
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          style={selectStyle}
        >
          <option value="">—</option>
          {DOCUMENT_TYPE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
        <ShelfButton variant="gold" onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </ShelfButton>
        <ShelfButton variant="ghost" onClick={onCancel}>
          Cancel
        </ShelfButton>
      </div>
    </div>
  );
}
