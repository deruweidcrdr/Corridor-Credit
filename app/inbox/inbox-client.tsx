"use client";

import { useState, useCallback, useEffect } from "react";
import type {
  Email,
  Attachment,
  InboxNotification,
} from "@/lib/inbox-data";
import DocumentShelf from "./document-modal";
import Sidebar from "@/app/components/sidebar";

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
  amberDim: "rgba(232,160,64,0.13)",
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
  emails: Email[];
  notifications: InboxNotification[];
}

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

/** Extract display-friendly sender name from email address */
function senderName(from: string): string {
  const name = from.split("@")[0].replace(/[._]/g, " ");
  return name
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** First ~80 chars of body as preview */
function bodyPreview(body: string): string {
  const clean = body.replace(/\s+/g, " ").trim();
  return clean.length > 80 ? clean.slice(0, 80) + "…" : clean;
}

/** Format sent_at to short form like "Feb 22 · 3:48 PM" */
function shortTime(sent: string): string {
  // sent_at is like "Feb 22, 2026, 3:48 PM"
  const parts = sent.split(", ");
  if (parts.length >= 3) return `${parts[0]} · ${parts[2]}`;
  return sent;
}

/** Derive a classification tag from attachment data */
function classTag(att: Attachment): { label: string; color: string; bg: string; borderColor: string } {
  const fn = att.file_name.toLowerCase();
  if (fn.includes("security")) {
    return { label: "SECURITY", color: ds.amber, bg: ds.amberDim, borderColor: "rgba(232,160,64,0.30)" };
  }
  if (att.classification.includes("CONTRACT")) {
    return { label: "TERMS", color: ds.gold, bg: ds.goldDim, borderColor: "rgba(200,168,75,0.30)" };
  }
  return { label: "FIN", color: ds.blue, bg: ds.blueDim, borderColor: "rgba(91,155,213,0.28)" };
}

/** Derive obligation mapping */
function obligationMapping(att: Attachment): string {
  const fn = att.file_name.toLowerCase();
  if (fn.includes("security")) return "COLLATERAL";
  if (fn.includes("financial")) return "FINANCIAL_DATA";
  return "CONTRACT_TERM";
}

/* ================================================================== */
/*  Root component                                                     */
/* ================================================================== */

export default function InboxClient({ emails, notifications }: Props) {
  const [selectedEmailId, setSelectedEmailId] = useState(emails[0]?.id ?? "");
  const [openAttachment, setOpenAttachment] = useState<Attachment | null>(null);
  const [validatedWfvIds, setValidatedWfvIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const e of emails) {
      for (const att of e.attachments) {
        if (att.workflow_for_validation_id && att.workflow_stage === "VALIDATED") {
          initial.add(att.workflow_for_validation_id);
        }
      }
    }
    return initial;
  });

  const [pollingOn, setPollingOn] = useState<boolean | null>(null); // null = loading

  useEffect(() => {
    fetch("https://email-processing-production-production.up.railway.app/api/polling/status")
      .then((r) => r.json())
      .then((d) => setPollingOn(d.polling_active ?? d.active ?? false))
      .catch(() => setPollingOn(false));
  }, []);

  const togglePolling = useCallback(async () => {
    const endpoint = pollingOn ? "stop" : "start";
    try {
      const r = await fetch(
        `https://email-processing-production-production.up.railway.app/api/polling/${endpoint}`,
        { method: "POST" }
      );
      if (r.ok) setPollingOn(!pollingOn);
    } catch {
      // silently fail
    }
  }, [pollingOn]);

  const selectedEmail = emails.find((e) => e.id === selectedEmailId) ?? null;
  const unreadCount = emails.filter((e) => !e.is_read).length;

  const closeShelf = useCallback(() => setOpenAttachment(null), []);

  const handleValidated = useCallback(() => {
    if (openAttachment?.workflow_for_validation_id) {
      setValidatedWfvIds((prev) => {
        const next = new Set(prev);
        next.add(openAttachment.workflow_for_validation_id!);
        return next;
      });
    }
  }, [openAttachment]);

  return (
    <>
      <div
        style={{
          display: "flex",
          height: "100vh",
          overflow: "hidden",
          background: ds.bg,
          color: ds.text,
          fontFamily: ds.fontBody,
        }}
      >
        {/* ── Sidebar (preserved as-is) ── */}
        <Sidebar />

        {/* ── Main area ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          {/* ── Topbar ── */}
          <div
            style={{
              height: 48,
              flexShrink: 0,
              background: ds.surfaceDeep,
              borderBottom: `1px solid ${ds.border}`,
              display: "flex",
              alignItems: "center",
              padding: "0 28px",
              gap: 16,
            }}
          >
            <div
              style={{
                fontFamily: ds.fontMono,
                fontSize: 11,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: ds.textMuted,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>Corridor Credit</span>
              <span style={{ color: ds.borderAccent }}>/</span>
              <span style={{ color: ds.gold }}>Inbox &amp; Alerts</span>
            </div>
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontFamily: ds.fontMono,
                fontSize: 11,
                color: ds.textMuted,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: ds.green,
                  boxShadow: `0 0 0 3px ${ds.greenDim}`,
                  display: "inline-block",
                }}
              />
              <span>Live · {unreadCount} unread</span>
            </div>
          </div>

          {/* ── Page header ── */}
          <div
            style={{
              padding: "22px 28px 16px",
              borderBottom: `1px solid ${ds.border}`,
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              flexShrink: 0,
              background: ds.bg,
            }}
          >
            <h1
              style={{
                margin: 0,
                fontFamily: ds.fontSerif,
                fontStyle: "italic",
                fontSize: 28,
                fontWeight: 400,
                color: ds.text,
                letterSpacing: "-0.01em",
                lineHeight: 1.15,
              }}
            >
              Inbox &amp; Alerts
            </h1>
            <div
              style={{
                fontFamily: ds.fontMono,
                fontSize: 11,
                color: ds.textMuted,
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <span>elliott@corridor.credit</span>
              {unreadCount > 0 && (
                <span
                  style={{
                    background: ds.coralDim,
                    color: ds.coral,
                    border: "1px solid rgba(224,112,96,0.30)",
                    fontFamily: ds.fontMono,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 3,
                    letterSpacing: "0.06em",
                  }}
                >
                  {unreadCount} Unread
                </span>
              )}
              <button
                onClick={togglePolling}
                disabled={pollingOn === null}
                style={{
                  fontFamily: ds.fontMono,
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 10,
                  border: `1px solid ${pollingOn ? "rgba(76,175,130,0.35)" : "rgba(255,255,255,0.12)"}`,
                  background: pollingOn ? ds.greenDim : "rgba(255,255,255,0.05)",
                  color: pollingOn ? ds.green : ds.textMuted,
                  cursor: pollingOn === null ? "wait" : "pointer",
                  letterSpacing: "0.06em",
                  transition: "all 0.15s ease",
                }}
              >
                {pollingOn === null ? "Polling: …" : pollingOn ? "Polling: ON" : "Polling: OFF"}
              </button>
            </div>
          </div>

          {/* ── Three-column workspace ── */}
          <div
            style={{
              flex: 1,
              display: "grid",
              gridTemplateColumns: "240px 1fr 298px",
              overflow: "hidden",
              minHeight: 0,
            }}
          >
            {/* Col 1: Email list + Alerts */}
            <EmailListColumn
              emails={emails}
              notifications={notifications}
              selectedId={selectedEmailId}
              onSelect={setSelectedEmailId}
            />

            {/* Col 2: Email body */}
            <EmailBodyColumn email={selectedEmail} />

            {/* Col 3: Attachments + Workflow actions */}
            <AttachmentColumn
              email={selectedEmail}
              onOpenAttachment={setOpenAttachment}
              activeAttachmentId={openAttachment?.id ?? null}
              validatedWfvIds={validatedWfvIds}
              onValidatedWfvId={(id: string) =>
                setValidatedWfvIds((prev) => {
                  const next = new Set(prev);
                  next.add(id);
                  return next;
                })
              }
            />
          </div>
        </div>
      </div>

      {/* ── Document shelf ── */}
      {openAttachment && (
        <DocumentShelf
          key={openAttachment.id}
          attachment={openAttachment}
          email={selectedEmail}
          onClose={closeShelf}
          onValidated={handleValidated}
          onReset={() => {
            if (openAttachment?.workflow_for_validation_id) {
              setValidatedWfvIds((prev) => {
                const next = new Set(prev);
                next.delete(openAttachment.workflow_for_validation_id!);
                return next;
              });
            }
          }}
          initialValidated={
            openAttachment.workflow_stage === "VALIDATED" ||
            (openAttachment.workflow_for_validation_id
              ? validatedWfvIds.has(openAttachment.workflow_for_validation_id)
              : false)
          }
        />
      )}
    </>
  );
}

/* ================================================================== */
/*  COL 1 — Email list + Alerts                                        */
/* ================================================================== */

function EmailListColumn({
  emails,
  notifications,
  selectedId,
  onSelect,
}: {
  emails: Email[];
  notifications: InboxNotification[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minHeight: 0,
      }}
    >
      {/* Column header */}
      <div
        style={{
          padding: "12px 18px",
          background: ds.surfaceRaised,
          borderBottom: `1px solid ${ds.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: ds.fontMono,
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: ds.textDim,
          }}
        >
          Inbox
        </span>
        <span
          style={{
            fontFamily: ds.fontMono,
            fontSize: 10,
            color: ds.textMuted,
          }}
        >
          {emails.length} items
        </span>
      </div>

      {/* Scrollable list */}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {/* Email items */}
        {emails.map((email) => {
          const active = email.id === selectedId;
          const tag = email.attachments.length > 0
            ? classTag(email.attachments[0])
            : null;

          return (
            <div
              key={email.id}
              onClick={() => onSelect(email.id)}
              style={{
                padding: "14px 18px",
                borderBottom: `1px solid ${ds.border}`,
                cursor: "pointer",
                transition: "background 0.12s",
                position: "relative",
                ...(active
                  ? {
                      background: "rgba(200,168,75,0.06)",
                      borderLeft: `3px solid ${ds.gold}`,
                      paddingLeft: 15,
                    }
                  : {}),
                ...(!email.is_read && !active ? { paddingLeft: 22 } : {}),
                ...(!email.is_read && active ? { paddingLeft: 19 } : {}),
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
              }}
            >
              {/* Unread dot */}
              {!email.is_read && (
                <span
                  style={{
                    position: "absolute",
                    left: active ? 10 : 7,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: ds.gold,
                  }}
                />
              )}
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: ds.text,
                  marginBottom: 3,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {senderName(email.from)}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: ds.textDim,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  marginBottom: 4,
                }}
              >
                {email.subject}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: ds.textMuted,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {bodyPreview(email.body)}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 5,
                }}
              >
                <span
                  style={{
                    fontFamily: ds.fontMono,
                    fontSize: 10,
                    color: ds.textMuted,
                  }}
                >
                  {shortTime(email.sent_at)}
                </span>
                {tag && (
                  <span
                    style={{
                      fontFamily: ds.fontMono,
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      padding: "1px 6px",
                      borderRadius: 3,
                      background: tag.bg,
                      color: tag.color,
                      border: `1px solid ${tag.borderColor}`,
                    }}
                  >
                    {tag.label}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Alerts section label */}
        <div
          style={{
            padding: "10px 18px 6px",
            fontFamily: ds.fontMono,
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: ds.textMuted,
            background: ds.surface,
            borderBottom: `1px solid ${ds.border}`,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ color: ds.coral, fontSize: 11 }}>⚑</span>
          Alerts
        </div>

        {/* Alert items */}
        {notifications.map((n) => {
          const isKyc = n.label.includes("KYC");
          return (
            <div
              key={n.id}
              style={{
                padding: "12px 18px",
                borderBottom: `1px solid ${ds.border}`,
                cursor: "pointer",
                transition: "background 0.12s",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  flexShrink: 0,
                  marginTop: 1,
                  color: isKyc ? ds.amber : ds.coral,
                }}
              >
                {isKyc ? "⚠" : "⊡"}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    color: ds.textDim,
                    lineHeight: 1.4,
                  }}
                >
                  <strong style={{ color: ds.text, fontWeight: 600 }}>
                    {n.type === "workflow"
                      ? "New Workflow Created: CONTRACT"
                      : n.label.split(":")[0] + ":"}
                  </strong>
                  {n.label.includes(":") && n.type !== "workflow" && (
                    <>{" "}{n.label.split(":").slice(1).join(":").trim()}</>
                  )}
                </div>
                <div
                  style={{
                    fontFamily: ds.fontMono,
                    fontSize: 10,
                    color: ds.textMuted,
                    whiteSpace: "nowrap",
                    marginTop: 3,
                  }}
                >
                  {shortTime(n.timestamp)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  COL 2 — Email body                                                 */
/* ================================================================== */

function EmailBodyColumn({ email }: { email: Email | null }) {
  if (!email) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          padding: 40,
          borderLeft: `1px solid ${ds.border}`,
        }}
      >
        <span style={{ fontSize: 32, opacity: 0.2 }}>✉</span>
        <span style={{ fontSize: 13, color: ds.textMuted }}>
          Select an email to view
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minHeight: 0,
        borderLeft: `1px solid ${ds.border}`,
      }}
    >
      {/* Email meta header */}
      <div
        style={{
          padding: "18px 24px",
          borderBottom: `1px solid ${ds.border}`,
          flexShrink: 0,
          background: ds.surface,
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: ds.text,
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {email.subject}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto 1fr",
            gap: "6px 16px",
          }}
        >
          <FieldLabel>To</FieldLabel>
          <FieldValue>{email.to}</FieldValue>
          <FieldLabel>From</FieldLabel>
          <FieldValue>{email.from}</FieldValue>
          <FieldLabel>Subject</FieldLabel>
          <FieldValue>{email.subject}</FieldValue>
          <FieldLabel>Sent</FieldLabel>
          <FieldValue>{email.sent_at}</FieldValue>
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        <div style={{ padding: 24 }}>
          <EmailBodyFormatted body={email.body} />
        </div>
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: ds.fontMono,
        fontSize: 10,
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.10em",
        color: ds.textMuted,
        display: "flex",
        alignItems: "center",
      }}
    >
      {children}
    </span>
  );
}

function FieldValue({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: ds.fontMono,
        fontSize: 12,
        color: ds.text,
      }}
    >
      {children}
    </span>
  );
}

/** Render email body with structured formatting */
function EmailBodyFormatted({ body }: { body: string }) {
  // Split body into paragraphs for structured rendering
  const paragraphs = body.split("\n\n").filter((p) => p.trim());
  const sectionHeads = [
    "TRANSACTION OVERVIEW",
    "ATTACHED DOCUMENTS",
    "KEY TERMS SUMMARY",
    "NEXT STEPS",
    "PROJECT OVERVIEW",
  ];

  return (
    <div
      style={{
        fontFamily: ds.fontBody,
        fontSize: 14,
        fontWeight: 400,
        color: ds.textDim,
        lineHeight: 1.8,
        fontStyle: "normal",
      }}
    >
      {paragraphs.map((para, i) => {
        const trimmed = para.trim();

        // Check if this paragraph starts with a section header
        const matchedHead = sectionHeads.find((h) => trimmed.startsWith(h));
        if (matchedHead) {
          const rest = trimmed.slice(matchedHead.length).trim();
          return (
            <div key={i}>
              <div
                style={{
                  color: ds.text,
                  fontWeight: 700,
                  fontSize: 11,
                  fontFamily: ds.fontMono,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  marginBottom: 8,
                  marginTop: i > 0 ? 20 : 0,
                }}
              >
                {matchedHead}
              </div>
              {rest && <p style={{ marginBottom: 16 }}>{rest}</p>}
            </div>
          );
        }

        // Check if first paragraph (salutation)
        if (i === 0 && trimmed.startsWith("Dear")) {
          return (
            <p
              key={i}
              style={{
                color: ds.text,
                fontWeight: 500,
                marginBottom: 20,
              }}
            >
              {trimmed}
            </p>
          );
        }

        // Check for signature block
        if (trimmed.startsWith("Best regards") || trimmed.startsWith("Sincerely")) {
          return (
            <div
              key={i}
              style={{
                color: ds.textMuted,
                fontSize: 13,
                marginTop: 20,
                borderTop: `1px solid ${ds.border}`,
                paddingTop: 16,
                whiteSpace: "pre-line",
                lineHeight: 1.6,
              }}
            >
              {trimmed.split("\n").map((line, j) => {
                const t = line.trim();
                // Bold the name line (usually second line of signature)
                if (j === 1 && t.length > 0 && !t.includes("@")) {
                  return (
                    <div key={j}>
                      <strong style={{ color: ds.textDim }}>{t}</strong>
                    </div>
                  );
                }
                return <div key={j}>{t}</div>;
              })}
            </div>
          );
        }

        // Check for confidentiality notice
        if (trimmed.includes("CONFIDENTIALITY NOTICE")) {
          return (
            <div
              key={i}
              style={{
                marginTop: 24,
                padding: "12px 16px",
                background: ds.surfaceRaised,
                border: `1px solid ${ds.border}`,
                borderRadius: ds.radius,
                fontSize: 11,
                color: ds.textMuted,
                fontFamily: ds.fontMono,
                lineHeight: 1.5,
                borderLeft: `3px solid ${ds.borderAccent}`,
              }}
            >
              {trimmed}
            </div>
          );
        }

        return (
          <p key={i} style={{ marginBottom: 16 }}>
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}

/* ================================================================== */
/*  COL 3 — Workflow actions + Attachments                             */
/* ================================================================== */

function AttachmentColumn({
  email,
  onOpenAttachment,
  activeAttachmentId,
  validatedWfvIds,
  onValidatedWfvId,
}: {
  email: Email | null;
  onOpenAttachment: (a: Attachment) => void;
  activeAttachmentId: string | null;
  validatedWfvIds: Set<string>;
  onValidatedWfvId: (id: string) => void;
}) {
  const [validating, setValidating] = useState(false);
  const [validateError, setValidateError] = useState<string | null>(null);

  // Find the first WFV id from this email's attachments
  const wfvId = email?.attachments.find((a) => a.workflow_for_validation_id)
    ?.workflow_for_validation_id;
  const isValidated = wfvId ? validatedWfvIds.has(wfvId) : false;

  const handleValidate = async () => {
    if (!wfvId) return;
    setValidating(true);
    setValidateError(null);
    try {
      const res = await fetch("/api/workflows/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowForValidationId: wfvId,
          assignedToId: "SYSTEM",
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      onValidatedWfvId(wfvId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setValidateError(msg);
    } finally {
      setValidating(false);
    }
  };
  if (!email) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minHeight: 0,
          borderLeft: `1px solid ${ds.border}`,
        }}
      />
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minHeight: 0,
        borderLeft: `1px solid ${ds.border}`,
      }}
    >
      {/* Workflow action buttons */}
      <div
        style={{
          padding: "16px 18px",
          background: ds.surfaceRaised,
          borderBottom: `1px solid ${ds.border}`,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: ds.fontMono,
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: ds.textDim,
            marginBottom: 6,
          }}
        >
          Workflow Actions
        </span>
        <div
          style={{
            fontFamily: ds.fontMono,
            fontSize: 10,
            color: ds.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.10em",
            marginBottom: 4,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          Workflow:{" "}
          <span
            style={{
              fontFamily: ds.fontMono,
              fontSize: 10,
              fontWeight: 500,
              color: ds.gold,
              background: ds.goldDim,
              border: "1px solid rgba(200,168,75,0.28)",
              padding: "1px 7px",
              borderRadius: 3,
            }}
          >
            WF_1772683175197
          </span>
        </div>

        {isValidated ? (
          <ActionButton variant="validated" disabled>
            ✓ Workflow Validated
          </ActionButton>
        ) : (
          <ActionButton
            variant="primary"
            onClick={handleValidate}
            disabled={validating || !wfvId}
          >
            {validating ? "Validating…" : "Confirm & Advance Workflow"}
            {!validating && <span style={{ fontSize: 14, opacity: 0.7 }}>→</span>}
          </ActionButton>
        )}
        <ActionButton variant="secondary">Edit Workflow</ActionButton>
        <ActionButton variant="warn">Archive or Reassign</ActionButton>
        {validateError && (
          <div
            style={{
              fontFamily: ds.fontMono,
              fontSize: 10,
              color: ds.coral,
              padding: "4px 0",
            }}
          >
            Error: {validateError}
          </div>
        )}
      </div>

      {/* Attachment cards */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          minHeight: 0,
          padding: 14,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div
          style={{
            fontFamily: ds.fontMono,
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: ds.textMuted,
            padding: "2px 0 8px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>Attachments · {email.attachments.length} files</span>
          <span style={{ flex: 1, height: 1, background: ds.border }} />
        </div>

        {email.attachments.map((att) => {
          const tag = classTag(att);
          const mapping = obligationMapping(att);
          const isActive = att.id === activeAttachmentId;
          const isFinancial = att.file_name.toLowerCase().includes("financial");

          return (
            <div
              key={att.id}
              onClick={() => onOpenAttachment(att)}
              style={{
                background: isActive
                  ? "rgba(200,168,75,0.05)"
                  : ds.surface,
                border: `1px solid ${isActive ? "rgba(200,168,75,0.35)" : ds.border}`,
                borderRadius: ds.radius,
                padding: "12px 14px",
                cursor: "pointer",
                transition: "all 0.15s",
                display: "flex",
                alignItems: "flex-start",
                gap: 11,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = ds.borderAccent;
                  e.currentTarget.style.background = ds.surfaceRaised;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = ds.border;
                  e.currentTarget.style.background = ds.surface;
                }
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 4,
                  background: ds.surfaceRaised,
                  border: `1px solid ${ds.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  flexShrink: 0,
                  marginTop: 1,
                  color: ds.textMuted,
                }}
              >
                {isFinancial ? "📊" : "📄"}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: ds.text,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    marginBottom: 3,
                  }}
                >
                  {att.file_name}
                </div>
                <div
                  style={{
                    fontFamily: ds.fontMono,
                    fontSize: 10,
                    color: ds.textMuted,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span>{att.pages} pages</span>
                  <span>·</span>
                  <span>{att.classification_role}</span>
                </div>
                <div
                  style={{
                    marginTop: 6,
                    paddingTop: 6,
                    borderTop: `1px solid ${ds.border}`,
                    fontFamily: ds.fontMono,
                    fontSize: 10,
                    color: ds.textMuted,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  Maps to: <span style={{ color: ds.blue }}>{mapping}</span>
                </div>
              </div>

              {/* Badge */}
              <span
                style={{
                  fontFamily: ds.fontMono,
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  padding: "2px 6px",
                  borderRadius: 3,
                  flexShrink: 0,
                  background: tag.bg,
                  color: tag.color,
                  border: `1px solid ${tag.borderColor}`,
                }}
              >
                {tag.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Action button                                                      */
/* ================================================================== */

function ActionButton({
  variant,
  children,
  onClick,
  disabled,
}: {
  variant: "primary" | "secondary" | "warn" | "validated";
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const baseStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    fontFamily: ds.fontBody,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    border: "none",
    borderRadius: ds.radius,
    cursor: disabled ? "default" : "pointer",
    transition: "all 0.13s",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    opacity: disabled && variant !== "validated" ? 0.6 : 1,
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: ds.gold,
      color: "#18140a",
    },
    validated: {
      background: ds.green,
      color: "#0d1017",
    },
    secondary: {
      background: "transparent",
      color: ds.textDim,
      border: `1px solid ${ds.borderAccent}`,
    },
    warn: {
      background: "transparent",
      color: ds.coral,
      border: "1px solid rgba(224,112,96,0.35)",
    },
  };

  const hoverBgs: Record<string, string> = {
    primary: "#d9b85a",
    validated: "#5bbf92",
    secondary: "rgba(255,255,255,0.04)",
    warn: ds.coralDim,
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...baseStyle, ...variants[variant] }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = hoverBgs[variant];
      }}
      onMouseLeave={(e) => {
        if (!disabled)
          e.currentTarget.style.background =
            variants[variant].background as string;
      }}
    >
      {children}
    </button>
  );
}
