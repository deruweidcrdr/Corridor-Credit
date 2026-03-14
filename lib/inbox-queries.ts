import { supabase } from "./supabase";
import type { Email, Attachment, InboxNotification } from "./inbox-data";
import type { AlertRow } from "./database.types";

// Row type matching the workflow_for_validation pipeline table
interface WfvRow {
  workflow_for_validation_id: string;
  apparent_counterparty: string | null;
  source_email_id: string | null;
  document_id: string | null;
  created_date: string | null;
  counterparty_id: string | null;
  counterparty_name: string | null;
  counterparty_type: string | null;
  relationship_status: string | null;
  workflow_type: string | null;
  matched_obligation_id: string | null;
  document_content_flags: string | null;
  document_type: string | null;
  initial_extraction_stage: string | null;
  requires_financial_extraction: boolean | null;
  reporting_period: string | null;
  extracted_document_types: string | null;
  match_confidence: string | null;
  match_reason: string | null;
  assigned_to_id: string | null;
  workflow_stage: string | null;
  workflow_status: string | null;
  workflow_subtype: string | null;
  priority: string | null;
  notes: string | null;
  initiated_by_id: string | null;
  workflow_name: string | null;
  successor_workflow_id: string | null;
  workflow_id: string | null;
}

// Row types matching the pipeline tables (emails, documents, counterparties)
interface PipelineEmailRow {
  email_id: string;
  subject: string | null;
  from_address: string | null;
  to_addresses: string[] | null;
  cc_addresses: string[] | null;
  bcc_addresses: string[] | null;
  body_plain: string | null;
  body_html: string | null;
  sent_timestamp: string | null;
  file_name: string | null;
}

interface PipelineDocumentRow {
  document_id: string;
  document_name: string | null;
  email_id: string | null;
  file_type: string | null;
  complete_document_text: string | null;
  timestamp: string | null;
  storage_path: string | null;
  pdf_storage_path: string | null;
  workflow_for_validation_id: string | null;
  workflow_id: string | null;
  document_type: string | null;
  status: string | null;
}

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
// Strip HTML duplicate & inline link artefacts from mailparser body
// ---------------------------------------------------------------------------
function cleanEmailBody(raw: string): string {
  // mailparser concatenates plain-text + HTML parts separated by a boundary
  const boundaryIdx = raw.indexOf("--- mail_boundary");
  let text = boundaryIdx > 0 ? raw.substring(0, boundaryIdx) : raw;

  // Fallback: if no boundary marker, cut at first <html tag
  if (boundaryIdx < 0) {
    const htmlIdx = text.indexOf("<html");
    if (htmlIdx > 0) text = text.substring(0, htmlIdx);
  }

  // Remove inline mailto/http link artefacts like <mailto:x@y.com> or <http://...>
  text = text.replace(/<mailto:[^>]+>/g, "");
  text = text.replace(/<https?:\/\/[^>]+>/g, "");

  // Normalize \r\n to \n, then insert paragraph breaks between lines.
  // mailparser uses single \n between what are logically separate paragraphs.
  // Keep bullet items (* ) and consecutive short lines (signature) grouped.
  text = text.replace(/\r\n/g, "\n");
  const lines = text.split("\n");
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    out.push(lines[i]);
    // Don't double-break after empty lines (already a break)
    if (lines[i].trim() === "") continue;
    const next = lines[i + 1];
    if (next === undefined) continue;
    // Keep bullet lists grouped (lines starting with *)
    if (next.trim().startsWith("*")) continue;
    if (lines[i].trim().startsWith("*") && next.trim() === "") continue;
    // Keep signature block lines together (short consecutive lines after "Best regards")
    const inSig = lines.slice(0, i + 1).some((l) => /^(Best regards|Sincerely)/i.test(l.trim()));
    if (inSig) continue;
    // Insert paragraph break between regular body paragraphs
    if (next.trim() !== "") out.push("");
  }
  text = out.join("\n");

  return text.trim();
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
    .from("emails")
    .select("*")
    .order("sent_timestamp", { ascending: false });

  if (emailErr) {
    console.error("Failed to fetch emails:", emailErr);
    return { emails: [], notifications: [] };
  }

  const emailRows = (rawEmails ?? []) as PipelineEmailRow[];
  if (emailRows.length === 0) {
    return { emails: [], notifications: [] };
  }

  const emailIds = emailRows.map((e) => e.email_id);

  // 2. Fetch documents (attachments) for these emails
  const { data: rawDocs, error: docErr } = await supabase
    .from("documents")
    .select("*")
    .in("email_id", emailIds);

  if (docErr) {
    console.error("Failed to fetch documents:", docErr);
  }
  const docRows = (rawDocs ?? []) as PipelineDocumentRow[];

  // 3. Fetch workflow_for_validation records linked to these emails
  const { data: rawWfs, error: wfErr } = await supabase
    .from("workflow_for_validation")
    .select("*")
    .in("source_email_id", emailIds);

  if (wfErr) {
    console.error("Failed to fetch workflows:", wfErr);
  }
  const wfRows = (rawWfs ?? []) as WfvRow[];

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
      .from("counterparties")
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

  // 5. Build a lookup: email_id → workflow_for_validation (take the first)
  const wfByEmail: Record<string, WfvRow> = {};
  for (const wf of wfRows) {
    if (wf.source_email_id && !wfByEmail[wf.source_email_id]) {
      wfByEmail[wf.source_email_id] = wf;
    }
  }

  // 6. Build a lookup: email_id → documents
  const docsByEmail: Record<string, PipelineDocumentRow[]> = {};
  for (const doc of docRows) {
    if (doc.email_id) {
      if (!docsByEmail[doc.email_id]) docsByEmail[doc.email_id] = [];
      docsByEmail[doc.email_id].push(doc);
    }
  }

  // 7. Generate signed storage URLs for all documents
  const signedUrlMap: Record<string, string> = {};
  const urlRequests = docRows.map(async (doc) => {
    if (!doc.email_id || !doc.document_name) return;
    const storagePath = `${doc.email_id}/${doc.document_name}`;
    const { data } = await supabase.storage
      .from("attachments")
      .createSignedUrl(storagePath, 3600);
    if (data?.signedUrl) {
      signedUrlMap[doc.document_id] = data.signedUrl;
    }
  });
  await Promise.all(urlRequests);

  // 8. Assemble Email[] with nested Attachment[]
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

      // Find the WFV record linked to this specific document
      const docWf = wfRows.find((w) => w.document_id === doc.document_id) ?? wf;

      return {
        id: doc.document_id,
        file_name: doc.document_name ?? "Untitled",
        counterparty_name: cpInfo?.name ?? "Unknown Counterparty",
        counterparty_type: cpInfo?.type ?? "UNKNOWN",
        classification,
        classification_role: "BORROWER",
        pages: 0,
        storage_url: signedUrlMap[doc.document_id],
        workflow_for_validation_id: docWf?.workflow_for_validation_id ?? wf?.workflow_for_validation_id ?? undefined,
        workflow_stage: docWf?.workflow_stage ?? wf?.workflow_stage ?? undefined,
        wfv_counterparty_type: docWf?.counterparty_type ?? wf?.counterparty_type ?? undefined,
        wfv_relationship_status: docWf?.relationship_status ?? wf?.relationship_status ?? undefined,
        wfv_document_type: docWf?.document_type ?? wf?.document_type ?? undefined,
        wfv_initial_extraction_stage: docWf?.initial_extraction_stage ?? wf?.initial_extraction_stage ?? undefined,
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
      from: row.from_address ?? "",
      to: Array.isArray(row.to_addresses) ? row.to_addresses[0] ?? "" : "",
      sent_at: formatTimestamp(row.sent_timestamp),
      body: cleanEmailBody(row.body_plain ?? row.body_html ?? ""),
      is_read: false,
      attachments,
    };
  });

  // 9. Build notifications from workflows + alerts
  const notifications: InboxNotification[] = [];

  // Workflow-based notifications
  for (const wf of wfRows) {
    const cpInfo = wf.counterparty_id
      ? counterpartyMap[wf.counterparty_id]
      : undefined;

    notifications.push({
      id: wf.workflow_for_validation_id,
      type: "workflow",
      label: `New Workflow Created: ${wf.document_type ?? wf.workflow_type ?? "DOCUMENT"}`,
      timestamp: formatTimestamp(wf.created_date),
    });

    // If there's a counterparty, add a KYC alert
    if (cpInfo) {
      notifications.push({
        id: `kyc-${wf.workflow_for_validation_id}`,
        type: "alert",
        label: `New Counterparty Requires KYC Review: ${cpInfo.name}`,
        timestamp: formatTimestamp(wf.created_date),
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
