"use client";

import { useState } from "react";
import type {
  Email,
  Attachment,
  InboxNotification,
} from "@/lib/inbox-data";
import DocumentModal from "./document-modal";
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
  satColor: "#4caf82",
  satBg: "rgba(76,175,130,0.12)",
  satBorder: "rgba(76,175,130,0.30)",
  pwColor: "#e8a040",
  pwBg: "rgba(232,160,64,0.12)",
  pwBorder: "rgba(232,160,64,0.32)",
  wdwColor: "#e07060",
  wdwBg: "rgba(224,112,96,0.12)",
  wdwBorder: "rgba(224,112,96,0.30)",
};

interface Props {
  emails: Email[];
  notifications: InboxNotification[];
}

/* ================================================================== */
/*  Root component                                                     */
/* ================================================================== */

export default function InboxClient({ emails, notifications }: Props) {
  const [selectedEmailId, setSelectedEmailId] = useState(emails[0]?.id ?? "");
  const [openAttachment, setOpenAttachment] = useState<Attachment | null>(null);

  const selectedEmail = emails.find((e) => e.id === selectedEmailId) ?? null;

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
        {/* ---- Sidebar ---- */}
        <Sidebar />

        {/* ---- Message list ---- */}
        <MessageList
          emails={emails}
          notifications={notifications}
          selectedId={selectedEmailId}
          onSelect={setSelectedEmailId}
        />

        {/* ---- Email detail ---- */}
        <EmailDetail
          email={selectedEmail}
          onOpenAttachment={setOpenAttachment}
        />
      </div>

      {/* ---- Document modal ---- */}
      {openAttachment && (
        <DocumentModal
          attachment={openAttachment}
          email={selectedEmail}
          onClose={() => setOpenAttachment(null)}
        />
      )}
    </>
  );
}

/* ================================================================== */
/*  MESSAGE LIST                                                       */
/* ================================================================== */

function MessageList({
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
        width: 290,
        flexShrink: 0,
        borderRight: `1px solid ${ds.border}`,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        background: ds.surfaceDeep,
      }}
    >
      {/* ── Inbox header ── */}
      <div
        style={{
          padding: "14px 16px 8px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <MailIcon />
        <span
          style={{
            fontFamily: ds.fontMono,
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: ds.blue,
          }}
        >
          Inbox
        </span>
      </div>

      {/* ── Email items ── */}
      <div style={{ padding: "0 8px" }}>
        {emails.map((email) => {
          const active = email.id === selectedId;
          return (
            <button
              key={email.id}
              onClick={() => onSelect(email.id)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: ds.radius,
                border: "none",
                cursor: "pointer",
                transition: "background 0.15s",
                background: active ? ds.surfaceRaised : "transparent",
                display: "block",
                marginBottom: 2,
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = ds.surface;
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span
                  style={{
                    marginTop: 6,
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: email.is_read ? "transparent" : ds.gold,
                  }}
                />
                <span
                  style={{
                    fontFamily: ds.fontBody,
                    fontSize: 13,
                    lineHeight: 1.4,
                    color: active ? ds.text : ds.textDim,
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {email.subject}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Alerts section divider ── */}
      <div
        style={{
          padding: "20px 16px 8px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <BellIcon />
        <span
          style={{
            fontFamily: ds.fontMono,
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: ds.coral,
          }}
        >
          Alerts
        </span>
      </div>

      {/* ── Notification items ── */}
      <div style={{ padding: "0 8px", paddingBottom: 16 }}>
        {notifications.map((n) => (
          <div
            key={n.id}
            style={{
              padding: "8px 12px",
              borderRadius: ds.radius,
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = ds.surface;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            {n.type === "workflow" ? (
              <span
                style={{
                  marginTop: 2,
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  flexShrink: 0,
                  background: ds.coralDim,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <DocMiniIcon />
              </span>
            ) : (
              <span
                style={{
                  marginTop: 2,
                  width: 20,
                  height: 20,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BellIcon small />
              </span>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <span
                style={{
                  fontFamily: ds.fontBody,
                  fontSize: 13,
                  lineHeight: 1.4,
                  color: ds.textDim,
                  display: "block",
                }}
              >
                {n.label}
              </span>
              <span
                style={{
                  fontFamily: ds.fontMono,
                  fontSize: 11,
                  color: ds.textMuted,
                  marginTop: 2,
                  display: "block",
                }}
              >
                {n.timestamp}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  EMAIL DETAIL                                                       */
/* ================================================================== */

function EmailDetail({
  email,
  onOpenAttachment,
}: {
  email: Email | null;
  onOpenAttachment: (a: Attachment) => void;
}) {
  if (!email) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: ds.fontBody,
            fontSize: 14,
            color: ds.textMuted,
          }}
        >
          Select an email to view
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* ── Subject bar ── */}
      <div
        style={{
          padding: "12px 24px",
          borderBottom: `1px solid ${ds.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          background: ds.surfaceDeep,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ListIcon />
          <h2
            style={{
              margin: 0,
              fontFamily: ds.fontBody,
              fontSize: 15,
              fontWeight: 600,
              color: ds.text,
            }}
          >
            {email.subject}
          </h2>
        </div>
        <button
          style={{
            background: "none",
            border: "none",
            color: ds.textMuted,
            fontSize: 20,
            cursor: "pointer",
            padding: "0 8px",
          }}
        >
          &middot;&middot;&middot;
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Metadata grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            borderBottom: `1px solid ${ds.border}`,
          }}
        >
          <MetaCell label="To" value={email.to} borderRight />
          <MetaCell label="From" value={email.from} />
          <MetaCell label="Subject" value={email.subject} borderRight borderTop />
          <MetaCell label="Sent" value={email.sent_at} borderTop />
        </div>

        {/* Body */}
        <div
          style={{
            padding: "20px 24px",
            fontFamily: ds.fontBody,
            fontSize: 14,
            lineHeight: 1.75,
            whiteSpace: "pre-wrap",
            color: ds.textDim,
          }}
        >
          {email.body}
        </div>

        {/* ── Attachments section ── */}
        {email.attachments.length > 0 && (
          <div style={{ padding: "0 24px 24px" }}>
            {/* Section divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  flex: "0 0 16px",
                  height: 1,
                  background: ds.borderAccent,
                }}
              />
              <span
                style={{
                  fontFamily: ds.fontMono,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: ds.textMuted,
                  whiteSpace: "nowrap",
                }}
              >
                Attachments
              </span>
              <span
                style={{ flex: 1, height: 1, background: ds.border }}
              />
            </div>

            {/* Attachment cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {email.attachments.map((att) => (
                <button
                  key={att.id}
                  onClick={() => onOpenAttachment(att)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    borderRadius: ds.radiusLg,
                    background: ds.surface,
                    border: `1px solid ${ds.border}`,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = ds.surfaceRaised;
                    e.currentTarget.style.borderColor = ds.borderAccent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = ds.surface;
                    e.currentTarget.style.borderColor = ds.border;
                  }}
                >
                  <AttachmentIcon />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        fontFamily: ds.fontBody,
                        fontSize: 13,
                        color: ds.text,
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {att.file_name}
                    </span>
                    <span
                      style={{
                        fontFamily: ds.fontMono,
                        fontSize: 11,
                        color: ds.textMuted,
                        marginTop: 2,
                        display: "block",
                      }}
                    >
                      {att.pages} pages · {att.classification_role}
                    </span>
                  </div>
                  <ClassificationChip classification={att.classification} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Classification chip                                                */
/* ================================================================== */

function ClassificationChip({ classification }: { classification: string }) {
  const isContract = classification.includes("CONTRACT");
  const color = isContract ? ds.amber : ds.blue;
  const bg = isContract ? ds.amberDim : ds.blueDim;
  const borderColor = isContract
    ? "rgba(232,160,64,0.32)"
    : "rgba(91,155,213,0.28)";
  const label = isContract ? "TERMS" : "FIN";

  return (
    <span
      style={{
        fontFamily: ds.fontMono,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        padding: "3px 8px",
        borderRadius: 3,
        background: bg,
        color,
        border: `1px solid ${borderColor}`,
        flexShrink: 0,
      }}
    >
      {label}
    </span>
  );
}

/* ================================================================== */
/*  Meta cell                                                          */
/* ================================================================== */

function MetaCell({
  label,
  value,
  borderRight,
  borderTop,
}: {
  label: string;
  value: string;
  borderRight?: boolean;
  borderTop?: boolean;
}) {
  return (
    <div
      style={{
        padding: "8px 24px",
        display: "flex",
        gap: 16,
        ...(borderRight ? { borderRight: `1px solid ${ds.border}` } : {}),
        ...(borderTop ? { borderTop: `1px solid ${ds.border}` } : {}),
      }}
    >
      <span
        style={{
          fontFamily: ds.fontMono,
          fontSize: 11,
          fontWeight: 500,
          color: ds.textMuted,
          width: 56,
          flexShrink: 0,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: ds.fontBody,
          fontSize: 13,
          color: ds.textDim,
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* ================================================================== */
/*  ICONS                                                              */
/* ================================================================== */

function MailIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={ds.blue}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 7l-10 7L2 7" />
    </svg>
  );
}

function BellIcon({ small }: { small?: boolean }) {
  const size = small ? 14 : 16;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={ds.coral}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}

function DocMiniIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke={ds.coral}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke={ds.textMuted}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function AttachmentIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={ds.textMuted}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
