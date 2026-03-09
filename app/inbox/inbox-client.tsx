"use client";

import { useState } from "react";
import type {
  Email,
  Attachment,
  InboxNotification,
} from "@/lib/inbox-data";
import DocumentModal from "./document-modal";
import Sidebar from "@/app/components/sidebar";

interface Props {
  emails: Email[];
  notifications: InboxNotification[];
}

/* ------------------------------------------------------------------ */
/*  Colour / style tokens                                              */
/* ------------------------------------------------------------------ */
const BG = "bg-[#0b0f15]";
const SURFACE = "bg-[#111820]";
const BORDER = "border-[#1e2d3d]";
const TEXT1 = "text-[#e2e8f0]";
const TEXT2 = "text-[#8b9bb4]";
const TEXT3 = "text-[#5a6a7e]";

/* ------------------------------------------------------------------ */
/*  Root component                                                     */
/* ------------------------------------------------------------------ */

export default function InboxClient({ emails, notifications }: Props) {
  const [selectedEmailId, setSelectedEmailId] = useState(emails[0]?.id ?? "");
  const [openAttachment, setOpenAttachment] = useState<Attachment | null>(null);

  const selectedEmail = emails.find((e) => e.id === selectedEmailId) ?? null;

  return (
    <>
      <div className={`flex h-screen overflow-hidden ${BG} ${TEXT1}`}>
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

/* Sidebar is imported from @/app/components/sidebar */

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
      className={`w-[290px] shrink-0 border-r ${BORDER} flex flex-col overflow-y-auto`}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-2">
        <MailIcon />
        <span className="text-blue-400 text-sm font-medium">Inbox</span>
      </div>

      {/* Email items */}
      <div className="px-2 space-y-0.5">
        {emails.map((email) => {
          const active = email.id === selectedId;
          return (
            <button
              key={email.id}
              onClick={() => onSelect(email.id)}
              className={`w-full text-left px-3 py-2.5 rounded transition-colors ${
                active ? "bg-[#1c2940]" : "hover:bg-[#151d28]"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                    email.is_read ? "bg-transparent" : "bg-blue-500"
                  }`}
                />
                <span
                  className={`text-[13px] leading-snug ${
                    active ? TEXT1 : TEXT2
                  }`}
                >
                  {email.subject}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Alerts header */}
      <div className="px-4 pt-5 pb-2 flex items-center gap-2">
        <BellIcon />
        <span className="text-red-400 text-sm font-medium">Alerts</span>
      </div>

      {/* Notification items */}
      <div className="px-2 space-y-0.5 pb-4">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`px-3 py-2 rounded flex items-start gap-2.5 hover:bg-[#151d28] transition-colors`}
          >
            {n.type === "workflow" ? (
              <span className="mt-0.5 w-5 h-5 rounded shrink-0 bg-[#3b1a2a] flex items-center justify-center">
                <DocMiniIcon />
              </span>
            ) : (
              <span className="mt-0.5 w-5 h-5 shrink-0 flex items-center justify-center">
                <BellIcon small />
              </span>
            )}
            <span className={`text-[13px] leading-snug ${TEXT2}`}>
              {n.label}
            </span>
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
      <div className="flex-1 flex items-center justify-center">
        <span className={TEXT3}>Select an email to view</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Subject bar */}
      <div
        className={`px-6 py-3 border-b ${BORDER} flex items-center justify-between shrink-0`}
      >
        <div className="flex items-center gap-3">
          <ListIcon />
          <h2 className="text-base font-medium">{email.subject}</h2>
        </div>
        <button className={`${TEXT3} text-xl leading-none px-2`}>
          &middot;&middot;&middot;
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {/* Metadata grid */}
        <div className={`grid grid-cols-2 border-b ${BORDER} text-sm`}>
          <MetaCell label="To" value={email.to} borderRight />
          <MetaCell label="From" value={email.from} />
          <MetaCell label="Subject" value={email.subject} borderRight borderTop />
          <MetaCell label="Sent" value={email.sent_at} borderTop />
        </div>

        {/* Body */}
        <div className="px-6 py-5 text-sm leading-relaxed whitespace-pre-wrap">
          {email.body}
        </div>

        {/* Attachments */}
        {email.attachments.length > 0 && (
          <div className="px-6 pb-6 grid grid-cols-2 gap-3">
            {email.attachments.map((att) => (
              <button
                key={att.id}
                onClick={() => onOpenAttachment(att)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg ${SURFACE} border ${BORDER} hover:bg-[#1a2332] transition-colors text-left`}
              >
                <AttachmentIcon />
                <span className="text-[13px] truncate">{att.file_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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
      className={`px-6 py-2 flex gap-4 ${borderRight ? `border-r ${BORDER}` : ""} ${borderTop ? `border-t ${BORDER}` : ""}`}
    >
      <span className={`${TEXT3} w-14 shrink-0`}>{label}</span>
      <span className={TEXT2}>{value}</span>
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
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-blue-400"
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
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-red-400"
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
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-red-300"
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
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={TEXT3}
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
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-[#5a6a7e] shrink-0"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
