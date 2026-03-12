import { supabase } from "./supabase";
import type { Email, Attachment, InboxNotification } from "./inbox-data";
import type {
  EmailRow,
  DocumentRow,
  WorkflowRow,
  AlertRow,
} from "./database.types";

// ---------------------------------------------------------------------------
// Format a Supabase timestamp into the display format used by the inbox UI
// e.g. "Feb 22, 2026, 3:48 PM"
// ---------------------------------------------------------------------------
function formatTimestamp(ts: string | null): string {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ---------------------------------------------------------------------------
// Derive classification from document_type / content flags
// ---------------------------------------------------------------------------
function deriveClassification(
  documentType: string | null,
  contentFlags: string | null
): string {
  const dt = (documentType ?? "").toUpperCase();
  const cf = (contentFlags ?? "").toUpperCase();
  if (cf.includes("TERMS_AND_FINANCIALS") || cf.includes("TERMS_AND_FIN"))
    return "CONTRACT_AND_FINANCIAL_EXTRACTION";
  if (dt.includes("CONTRACT") || cf.includes("TERMS")) return "CONTRACT_EXTRACTION";
  if (dt.includes("FINANCIAL") || cf.includes("FINANCIAL")) return "FINANCIAL_EXTRACTION";
  return dt || "UNKNOWN";
}

// ---------------------------------------------------------------------------
// Fetch inbox data from Supabase
// ---------------------------------------------------------------------------
export async function fetchInboxData(): Promise<{
  emails: Email[];
  notifications: InboxNotification[];
}> {
  // 1. Fetch emails ordered by most recent first
  const { data: rawEmails, error: emailErr } = await supabase
    .from("email")
    .select("*")
    .order("sent_timestamp", { ascending: false });

  if (emailErr) {
    console.error("Failed to fetch emails:", emailErr);
    return { emails: [], notifications: [] };
  }

  const emailRows = (rawEmails ?? []) as EmailRow[];
  if (emailRows.length === 0) {
    return { emails: [], notifications: [] };
  }

  const emailIds = emailRows.map((e) => e.email_id);

  // 2. Fetch documents (attachments) for these emails
  const { data: rawDocs, error: docErr } = await supabase
    .from("document")
    .select("*")
    .in("email_id", emailIds);

  if (docErr) {
    console.error("Failed to fetch documents:", docErr);
  }
  const docRows = (rawDocs ?? []) as DocumentRow[];

  // 3. Fetch workflows linked to these emails for counterparty + classification info
  const { data: rawWfs, error: wfErr } = await supabase
    .from("workflow")
    .select("*")
    .in("source_email_id", emailIds);

  if (wfErr) {
    console.error("Failed to fetch workflows:", wfErr);
  }
  const wfRows = (rawWfs ?? []) as WorkflowRow[];

  // 4. Collect counterparty IDs from workflows and fetch counterparties
  const counterpartyIds = [
    ...new Set(
      wfRows
        .map((w) => w.counterparty_id)
        .filter((id): id is string => !!id)
    ),
  ];

  const counterpartyMap: Record<string, { name: string; type: string }> = {};

  if (counterpartyIds.length > 0) {
    const { data: cpRows, error: cpErr } = await supabase
      .from("counterparty")
      .select("counterparty_id, counterparty_name, counterparty_type")
      .in("counterparty_id", counterpartyIds);

    if (cpErr) {
      console.error("Failed to fetch counterparties:", cpErr);
    }

    for (const cp of (cpRows ?? []) as { counterparty_id: string; counterparty_name: string | null; counterparty_type: string | null }[]) {
      counterpartyMap[cp.counterparty_id] = {
        name: cp.counterparty_name ?? "Unknown",
        type: cp.counterparty_type ?? "UNKNOWN",
      };
    }
  }

  // 5. Build a lookup: email_id → workflow (take the first / most recent)
  const wfByEmail: Record<string, WorkflowRow> = {};
  for (const wf of wfRows) {
    if (wf.source_email_id && !wfByEmail[wf.source_email_id]) {
      wfByEmail[wf.source_email_id] = wf;
    }
  }

  // 6. Build a lookup: email_id → documents
  const docsByEmail: Record<string, DocumentRow[]> = {};
  for (const doc of docRows) {
    if (doc.email_id) {
      if (!docsByEmail[doc.email_id]) docsByEmail[doc.email_id] = [];
      docsByEmail[doc.email_id].push(doc);
    }
  }

  // 7. Assemble Email[] with nested Attachment[]
  const emails: Email[] = emailRows.map((row) => {
    const wf = wfByEmail[row.email_id];
    const cpInfo = wf?.counterparty_id
      ? counterpartyMap[wf.counterparty_id]
      : undefined;

    const docs = docsByEmail[row.email_id] ?? [];

    const attachments: Attachment[] = docs.map((doc) => {
      const classification = deriveClassification(
        doc.document_type,
        wf?.document_content_flags ?? null
      );

      return {
        id: doc.document_id,
        file_name: doc.document_name ?? doc.path ?? "Untitled",
        counterparty_name: cpInfo?.name ?? "Unknown Counterparty",
        counterparty_type: cpInfo?.type ?? "UNKNOWN",
        classification,
        classification_role: "BORROWER",
        pages: 0,
        mock_doc: {
          title: (doc.document_name ?? "Document").replace(/[_-]/g, " ").replace(/\.\w+$/, ""),
          date: formatTimestamp(doc.timestamp ?? row.sent_timestamp),
          parties: cpInfo
            ? [{ name: cpInfo.name.toUpperCase(), role: "as Borrower" }]
            : [],
        },
      };
    });

    return {
      id: row.email_id,
      subject: row.subject ?? "(No Subject)",
      from: row.from ?? "",
      to: Array.isArray(row.to) ? row.to[0] ?? "" : "",
      sent_at: formatTimestamp(row.sent_timestamp),
      body: row.body_plain ?? row.body_html ?? "",
      is_read: false,
      attachments,
    };
  });

  // 8. Build notifications from workflows + alerts
  const notifications: InboxNotification[] = [];

  // Workflow-based notifications
  for (const wf of wfRows) {
    const cpInfo = wf.counterparty_id
      ? counterpartyMap[wf.counterparty_id]
      : undefined;

    notifications.push({
      id: wf.workflow_id,
      type: "workflow",
      label: `New Workflow Created: ${wf.document_type ?? wf.workflow_type ?? "DOCUMENT"}`,
      timestamp: formatTimestamp(wf.created_at),
    });

    // If there's a counterparty, add a KYC alert
    if (cpInfo) {
      notifications.push({
        id: `kyc-${wf.workflow_id}`,
        type: "alert",
        label: `New Counterparty Requires KYC Review: ${cpInfo.name}`,
        timestamp: formatTimestamp(wf.created_at),
      });
    }
  }

  // Also fetch actual alerts from the alert table
  const { data: rawAlerts } = await supabase
    .from("alert")
    .select("alert_id, alert_type, alert_title, alert_body, generated_timestamp, alert_status")
    .order("generated_timestamp", { ascending: false })
    .limit(20);

  for (const alert of (rawAlerts ?? []) as Pick<AlertRow, "alert_id" | "alert_type" | "alert_title" | "alert_body" | "generated_timestamp" | "alert_status">[]) {
    notifications.push({
      id: alert.alert_id,
      type: "alert",
      label: alert.alert_title ?? alert.alert_body ?? "Alert",
      timestamp: formatTimestamp(alert.generated_timestamp),
    });
  }

  // Deduplicate KYC alerts by counterparty name
  const seen = new Set<string>();
  const dedupedNotifications = notifications.filter((n) => {
    if (n.label.includes("KYC Review:")) {
      const cpName = n.label.split(":").pop()?.trim() ?? "";
      if (seen.has(cpName)) return false;
      seen.add(cpName);
    }
    return true;
  });

  return { emails, notifications: dedupedNotifications };
}
