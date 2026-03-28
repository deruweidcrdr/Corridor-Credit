# Next.js Application — Contract with Railway Service

This document describes how the Next.js frontend interacts with Supabase
tables that this service reads from. It exists so that Railway service
sessions understand what triggers their dispatch steps without needing
access to the Next.js codebase.

## What Next.js Validate Routes Do

Each validate route follows the same three-step pattern:
1. Promote a `_for_validation` record to a canonical/ontology table
2. Set a status column to `PENDING` on the `_for_validation` record (or related table)
3. Call `POST /api/wake` on this Railway service (fire-and-forget)

Next.js validate routes NEVER specify which transform to run.

## Validate Actions and Their Effects on Supabase

### Workflow Validation (Inbox)
- Route: `POST /api/workflows/validate`
- Reads from: `workflow_for_validation`
- Writes to: `workflow` (canonical)
- Status effect: `extraction_status` is set to `PENDING` by A4 during intake,
  NOT by this validate route. The validate route confirms/corrects
  classification. If the user changes `content_flags`, `extraction_status`
  is reset to `PENDING` to trigger re-extraction.

### Contract Validation (Contract Analysis)
- Route: `POST /api/contract-analysis/validate`
- Reads from: `contract_for_validation` + `term_for_validation`
- Writes to: `contract` + `term` (canonical)
- Status effect: Sets `contract_for_validation.obligation_extraction_status = 'PENDING'`
- Calls: `POST /api/wake`

### Statement Validation (Statement Analysis)
- Route: `POST /api/statement-analysis/validate`
- Reads from: `financial_statement_for_validation`
- Writes to: `financial_statement` (canonical)
- Status effect: Sets `financial_statement_for_validation.profile_assignment_status = 'PENDING'`
- Calls: `POST /api/wake`

## Tables Railway Reads (written by Next.js or by Railway intake)

| Table                                | Who Creates Rows              | Status Column Railway Watches   |
|--------------------------------------|-------------------------------|---------------------------------|
| `workflow_for_validation`            | Railway intake (A4)           | `extraction_status`             |
| `contract_for_validation`            | Railway extraction (TE → ECV) | `obligation_extraction_status`  |
| `financial_statement_for_validation` | Railway extraction (FE → ESV) | `profile_assignment_status`     |
| `counterparty_profile_assignment`    | Railway (APP)                 | `projection_status`             |

**Filter:** Extraction dispatch must exclude `workflow_for_validation` records
where `is_archived = true`. Archived workflows are user-dismissed items that
should never be processed.

## Tables Railway NEVER Writes To

These canonical tables are written exclusively by Next.js validate routes:
- `workflow`
- `contract`
- `term` (contract terms)
- `counterparty`
- `obligation` (canonical)
- `financial_statement` (canonical)

## Inbox Triage Actions (no pipeline effect)

The inbox provides three actions that do NOT trigger Railway processing:
- **EDIT WORKFLOW**: Metadata correction. Only triggers re-extraction if `content_flags` change.
- **ARCHIVE**: Soft-delete (`is_archived = true`). Railway should skip archived records.
- **MARK REVIEWED**: Audit timestamp only. No pipeline effect.

## Global Header Status Display

The Next.js global header has two status indicators:

1. **Polling toggle** — Calls Railway `GET /api/polling/status` to display the
   current polling state. Response shape: `{"polling":"enabled"}` or
   `{"polling":"disabled"}`. The toggle calls `POST /api/polling/start` or
   `POST /api/polling/stop` to change state. It does NOT control which
   transforms run.

2. **Pipeline status indicator** — Calls Next.js `GET /api/pipeline/status`
   (15-second interval) to show aggregate counts across the four staging tables
   Railway polls. This route queries Supabase directly — it does not call Railway.
   Response shape: `{"pending":0,"in_progress":0,"error":0,"complete":0,"total":0,"untracked":0}`.
   Visual states: IDLE (green), N STAGED (green), N COMPLETE (green),
   N QUEUED (gold), N PROCESSING (amber, pulsing), N ERROR (coral).
