<!-- Source of truth: Corridor Credit Claude Chat project. Do not edit unilaterally — update via project context first, then push to both repos. -->

# Next.js Application — Contract with Railway Service

This document describes how the Next.js frontend interacts with Supabase
tables that this service reads from. It exists so that Railway service
sessions understand what triggers their dispatch steps without needing
access to the Next.js codebase.

## Auto-Fire Pipeline and the Dual-Trigger Model

The pipeline runs end-to-end from email ingestion to projections without
human gates. All three dispatch status columns on staging tables default
to `'PENDING'` at the database level:

| Table | Status Column | DB Default |
|-------|--------------|------------|
| `workflow_for_validation` | `extraction_status` | `'PENDING'` |
| `contract_for_validation` | `obligation_extraction_status` | `'PENDING'` |
| `financial_statement_for_validation` | `profile_assignment_status` | `'PENDING'` |

This means Railway picks up newly created staging records automatically —
no human action is required for the initial pipeline run.

**Two triggers set PENDING on each status column:**

1. **Initial trigger (DB default):** When a Railway stage creates a staging
   record, the default value fires the next dispatch stage automatically.
   A4 creates `workflow_for_validation` → extraction auto-fires.
   ECV creates `contract_for_validation` → obligation extraction auto-fires.
   ESV creates `financial_statement_for_validation` → profile assignment auto-fires.

2. **Re-trigger (validate route):** When a user reviews extracted data, corrects
   errors, and clicks Validate, the Next.js route promotes the record to a
   canonical table and resets the status column to `'PENDING'`. This causes
   Railway to re-process with the corrected data.

The validate routes are a **correction and promotion mechanism**, not the
initial dispatch trigger.

## What Next.js Validate Routes Do

Each validate route follows the same pattern:
1. Promote a `_for_validation` record to a canonical/ontology table
2. Reset the status column to `'PENDING'` on the `_for_validation` record
   (re-triggering downstream processing with corrected data)
3. Call `POST /api/wake` on this Railway service (fire-and-forget)

Next.js validate routes NEVER specify which transform to run.

## Validate Actions and Their Effects on Supabase

### Workflow Validation (Inbox)
- Route: `POST /api/workflows/validate`
- Reads from: `workflow_for_validation`
- Writes to: `workflow` (canonical)
- Status effect: `extraction_status` is set to `PENDING` by DB default during
  intake (auto-fire), NOT by this validate route. The validate route
  confirms/corrects classification. If the user changes `content_flags`,
  `extraction_status` is reset to `PENDING` to re-trigger extraction.

#### Boolean Content Flags

Railway dispatch routes extraction stages using three independent boolean
columns on `workflow_for_validation`, not the `document_content_flags` enum:

| Column | Controls | Stages |
|--------|----------|--------|
| `has_contract_terms` | Whether TE runs | `[te, ecv]` |
| `has_historical_financials` | Whether FE runs | `[fe, esv]` |
| `has_pro_forma_financials` | Whether PFE runs | `[pfe, epf]` |

When a user edits `content_flags` via the inbox, the application must also
update the three booleans to match:

| content_flags | has_contract_terms | has_historical_financials | has_pro_forma_financials |
|---------------|-------------------|--------------------------|------------------------|
| `TERMS` | `true` | `false` | `false` |
| `FINANCIALS` | `false` | `true` | `false` |
| `TERMS_AND_FINANCIALS` | `true` | `true` | `true` |

**Future UI enhancement:** Expose the three booleans as checkboxes in the
inbox edit modal, allowing more precise routing than the enum alone. This
enables combinations the enum cannot express (e.g., terms + pro forma but
no historicals for a CIM, or historicals + pro forma but no terms for a
compliance package with forward projections).

### Contract Validation (Contract Analysis)
- Route: `POST /api/contract-analysis/validate`
- Reads from: `contract_for_validation` + `term_for_validation`
- Writes to: `contract` (canonical, status `ACTIVE`) + `term` (canonical, status `CONFIRMED`)
- Status effects on staging tables:
  - `contract_for_validation.contract_status = 'VALIDATED'`
  - `contract_for_validation.obligation_extraction_status = 'PENDING'`
    (re-trigger — obligation extraction already ran via DB default auto-fire;
    this reset causes re-processing with user-corrected terms)
  - `term_for_validation.validation_status = 'VALIDATED'` (except `FLAGGED` terms, which are skipped)
- Calls: `POST /api/wake`

### Statement Validation (Statement Analysis)
- Route: `POST /api/statement-analysis/validate`
- Reads from: `financial_statement_for_validation`
- Writes to: `financial_statement` (canonical)
- Status effects on staging tables:
  - `financial_statement_for_validation.validation_status = 'VALIDATED'`
  - `financial_statement_for_validation.profile_assignment_status = 'PENDING'`
    (re-trigger — profile assignment already ran via DB default auto-fire;
    this reset causes re-processing with user-corrected financials)
- Calls: `POST /api/wake`

## Tables Railway Reads (written by Next.js or by Railway intake)

| Table                                | Who Creates Rows              | Status Column Railway Watches   | Initial Trigger       | Re-trigger                    |
|--------------------------------------|-------------------------------|---------------------------------|-----------------------|-------------------------------|
| `workflow_for_validation`            | Railway intake (A4)           | `extraction_status`             | DB default `PENDING`  | Inbox edit (content_flags change) |
| `contract_for_validation`            | Railway extraction (TE → ECV) | `obligation_extraction_status`  | DB default `PENDING`  | Contract validate route       |
| `financial_statement_for_validation` | Railway extraction (FE → ESV) | `profile_assignment_status`     | DB default `PENDING`  | Statement validate route      |
| `counterparty_profile_assignment`    | Railway (APP)                 | `projection_status`             | APP sets explicitly   | —                             |

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
