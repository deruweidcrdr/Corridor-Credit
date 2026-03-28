# Corridor Credit — Railway Pipeline Service Reference

## What This Service Does

The Railway service is the single pipeline orchestrator for the Corridor Credit platform.
It runs a background polling loop that discovers work by scanning Supabase tables for
PENDING status values, executes the appropriate transforms, and writes results back
to Supabase. The Next.js frontend never tells this service which transform to run —
it discovers work autonomously.

## Polling Loop Architecture

### Toggle & Interval

- Polling interval: 120 seconds (`POLL_INTERVAL_SECONDS` in `server.py`)
- Default on startup: OFF (`POLLING_ENABLED` env var, defaults to `"false"`)
- Runtime toggle: `POST /api/polling/start`, `POST /api/polling/stop`
- Status check: `GET /api/polling/status`
- Wake signal: `POST /api/wake` — interrupts the sleep timer to force exactly one
  polling cycle, **regardless of whether polling is enabled**. Does not enable
  continuous polling.
- All toggle state is in-memory only — does not persist across restarts

### Dispatch Order (each polling cycle)

The polling loop executes these steps sequentially. Intake runs first via
`_poll_intake()`, then the four status-driven dispatchers run in dependency order
via `_run_all_status_dispatches()`:

1. **INTAKE** (`_poll_intake`, `server.py`)
   - Scans `raw-emails` storage bucket for new files
   - Runs: A1 → A3 → A4 → A5 → CPC → LDC
   - No status column — tracks seen files in memory (`_intake_known_files`)
   - On first startup, runs the full intake regardless of bucket contents

2. **EXTRACTION DISPATCH** (`_dispatch_pending_extractions`, `server.py`)
   - Table: `workflow_for_validation`
   - Status column: `extraction_status`
   - Trigger: `PENDING`
   - Routes by `document_content_flags`:
     - `TERMS` → `[te, ecv]`
     - `FINANCIALS` → `[fe, esv]`
     - `TERMS_AND_FINANCIALS` → `[te, fe, pfe, ecv, esv, epf]`
   - Lifecycle: `PENDING → IN_PROGRESS → COMPLETE` (or `ERROR`)

3. **OBLIGATION DISPATCH** (`_dispatch_pending_obligations`, `server.py`)
   - Table: `contract_for_validation`
   - Status column: `obligation_extraction_status`
   - Trigger: `PENDING`
   - Reads `source_document_id` from the contract row (fallback to `document_id`)
   - Runs: `[eo, eotsv]`
   - Lifecycle: `PENDING → IN_PROGRESS → COMPLETE` (or `ERROR`)

4. **PROFILE ASSIGNMENT DISPATCH** (`_dispatch_pending_profile_assignments`, `server.py`)
   - Table: `financial_statement_for_validation`
   - Status column: `profile_assignment_status`
   - Trigger: `PENDING`
   - Groups by `counterparty_id` — runs once per counterparty, not per statement
   - Runs: `[app]`
   - Lifecycle: `PENDING → IN_PROGRESS → COMPLETE` (or `ERROR`)

5. **PROJECTION DISPATCH** (`_dispatch_pending_projections`, `server.py`)
   - Table: `counterparty_profile_assignment`
   - Status column: `projection_status`
   - Trigger: `PENDING`
   - Runs: `[gcp]` — called once with `document_id=None`, processes all
     IN_PROGRESS counterparties internally
   - Lifecycle: `PENDING → IN_PROGRESS → COMPLETE` (or `ERROR`)

### Pipeline Stage Codes

| Code  | Name                                          | File                                                        |
|-------|-----------------------------------------------|-------------------------------------------------------------|
| A1    | Email Processing                              | `pipeline/email_processing.py`                              |
| A3    | Document Processing (A2 storage + A3b PDF)    | `pipeline/document_processing.py`                           |
| A4    | Workflow Validation (LLM classification)      | `pipeline/workflow_validation.py`                           |
| A5    | Deal Orchestrator                             | `pipeline/deal_orchestrator.py`                             |
| CPC   | Consolidate Prospective Counterparties        | `pipeline/consolidate_counterparties.py`                    |
| LDC   | Link Document Chunks                          | `pipeline/link_document_chunks.py`                          |
| TE    | Terms Extraction (6-pass parallel)            | `pipeline/terms_extraction.py`                              |
| FE    | Financial Extraction                          | `pipeline/financial_extraction.py`                          |
| PFE   | Pro Forma Extraction                          | `pipeline/pro_forma_extraction.py`                          |
| EO    | Extract Obligations                           | `pipeline/extract_obligations.py`                           |
| ECV   | Establish Contract for Validation             | `pipeline/establish_contract_validation.py`                 |
| ESV   | Establish Statement for Validation            | `pipeline/establish_statement_validation.py`                |
| EPF   | Establish Pro Forma for Validation            | `pipeline/establish_proforma_validation.py`                 |
| EOTSV | Establish Obligation Term Structure Validation| `pipeline/establish_obligation_term_structure_validation.py` |
| APP   | Assign Projection Profile                     | `pipeline/assign_projection_profile.py`                     |
| GCP   | Generate Counterparty Projections             | `pipeline/generate_projections.py`                          |

### Intake Pipeline Stages

The intake pipeline (`FULL_PIPELINE_ORDER` in `main.py`) runs these stages in order:
`A1 → A3 → A4 → A5 → CPC → LDC`

A4 creates `workflow_for_validation` records with `extraction_status = 'PENDING'`,
which causes the extraction dispatch step to pick them up on the same or next cycle.

## API Endpoints

### Active

| Method | Path                  | Purpose                                                    |
|--------|-----------------------|------------------------------------------------------------|
| GET    | `/health`             | Health check                                               |
| POST   | `/api/polling/start`  | Enable continuous polling                                  |
| POST   | `/api/polling/stop`   | Disable continuous polling                                 |
| GET    | `/api/polling/status` | Check polling state (`enabled` / `disabled`)               |
| POST   | `/api/wake`           | Force one immediate poll cycle (works even when polling off)|
| POST   | `/api/process`        | Run arbitrary stages for a document (used by tests/admin)  |
| GET    | `/api/debug/query`    | Query safe-listed Supabase tables (temporary debug tool)   |

### Deprecated (functional but log warnings)

| Method | Path                               | Replacement                                            |
|--------|------------------------------------|---------------------------------------------------------|
| POST   | `/api/extract`                     | Set `extraction_status='PENDING'` + `POST /api/wake`   |
| POST   | `/api/dispatch-obligations`        | Set `obligation_extraction_status='PENDING'` + wake     |
| POST   | `/api/dispatch-profile-assignment` | Set `profile_assignment_status='PENDING'` + wake        |

## Status-Driven Dispatch Contract

The Next.js application sets status columns to `PENDING` on Supabase records.
This service discovers those PENDING records and processes them.
This service **NEVER** receives instructions about which transform to run from
the frontend — it reads the data and determines the appropriate action.

### What Sets PENDING Values

| Status Column                                                  | What Sets It                                          |
|----------------------------------------------------------------|-------------------------------------------------------|
| `workflow_for_validation.extraction_status`                    | A4 (workflow validation) during intake                |
| `contract_for_validation.obligation_extraction_status`         | Next.js `/api/contract-analysis/validate`             |
| `financial_statement_for_validation.profile_assignment_status` | Next.js statement validation                          |
| `counterparty_profile_assignment.projection_status`            | APP stage on completion                               |

### Pipeline-Overwrite Protection

This service writes to `_for_validation` staging tables only.
It **NEVER** writes to canonical/ontology tables (`workflow`, `contract`,
`counterparty`, `obligation`, `financial_statement`).
Canonical tables are written exclusively by Next.js validate routes
when the user promotes validated data.

## What NOT to Do

- Don't create new imperative endpoints that accept document_ids or parameters
  telling the service what to process. The polling loop discovers work via status columns.
- Don't write to canonical tables. Write to `_for_validation` staging tables only.
- Don't skip the `IN_PROGRESS` status write before starting a transform.
- Don't leave status as `PENDING` after processing — always set `COMPLETE` or `ERROR`.
- Don't change `_poll_cycle()` dispatch order — it reflects the pipeline dependency chain.

## Key Files

| File           | Purpose                                                         |
|----------------|-----------------------------------------------------------------|
| `server.py`    | FastAPI app, polling loop, all dispatch logic, API endpoints    |
| `main.py`      | Stage registry (`STAGES`), `FULL_PIPELINE_ORDER`, CLI runner   |
| `config.py`    | Environment variable loading (dotenv)                           |
| `db.py`        | Supabase client, `read_table`, `upsert_rows`, `list_files`     |
| `pipeline/`    | One module per pipeline stage                                   |
