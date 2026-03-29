<!-- Source of truth: Corridor Credit Claude Chat project. Do not edit unilaterally — update via project context first, then push to both repos. -->

# Corridor Credit — Project Context for Claude Code

## What This Is

Corridor Credit is a private credit analytics and lending platform. The founder (Brent) has 20+ years of commercial lending experience spanning equipment finance, ABL, structured finance, and project finance at major financial institutions. The platform's purpose is to serve as proprietary analytical infrastructure for a private credit fund — the technology is the investment edge, not a product for sale.

The platform was originally built on Palantir Foundry over ~18 months. It is now being migrated to a hybrid architecture: this Next.js/Supabase application handles document processing, entity extraction, the user-facing interface, the projection engine and credit assessment workflows.

## Core Thesis

The fund exploits information asymmetries in middle market lending. The "iron law of asymmetric returns in credit investing: buy cheap, mark accurate." Regional banks are trapped as price takers on both origination and portfolio sales. Corridor's analytical infrastructure identifies temporal stress points in credit structures that other investors miss, enabling better pricing on distressed portfolio acquisitions.

## Credit Methodology — Local/Temporal Minimum Coverage

This is the intellectual core of the platform and the primary competitive differentiator. Corridor departs from Merton option theory-derived structural models (distance-to-default, asset volatility) in favor of directly measuring debt service capacity at specific temporal stress points.

**Key concept:** Identify WHEN coverage is most vulnerable across a loan's tenor, not just whether the borrower is solvent at a point in time. The minimum projected DSCR (Debt Service Coverage Ratio) through the projection period is more predictive than LLCR (Loan Life Coverage Ratio). The formula `(DSCR-1)/DSCR` represents the percentage buffer above breakeven — this "covenant cushion" can be tied to default probability and credit spreads.

**FUND/SYS Framework** — Five assessment dimensions:
- **PC**: Primary Coverage / DSCR (the temporal minimum)
- **PV**: Portfolio Value / LLCR
- **PB**: Obligor Business Trend / Gross Margin
- **PQ**: Obligor Liquidity / Current Ratio
- **PM**: Cost Structure

## Obligation-Driven Architecture

The architectural centerpiece. ALL contractual requirements flow through a unified Obligation abstraction layer:

```
Contract Terms → Obligations (single source of truth) → Downstream Analysis

Obligation Types:
  - PAYMENT_OBLIGATION → Payment schedules → Debt service → DSCR
  - FINANCIAL_COVENANT → Covenant testing at projection points
  - REPORTING_REQUIREMENT → Compliance monitoring
  - COLLATERAL_MONITORING → Field examination scheduling
  - NEGATIVE_COVENANT → Restriction tracking
```

Obligations have both temporal (schedulable) and conditional (tested at points) variants. The term_identity layer enables platform learning — as new contract structures are encountered, new terms map to new obligation types.

## Workflow Architecture

### Pipeline Overview

Documents flow through an automated pipeline. Extraction runs automatically — the user validates results after extraction, not before.

```
Email Received
  → INTAKE (email parsed, attachments extracted)
  → CLASSIFIED (LLM identifies counterparty, content type, intent)
  → EXTRACTED (contract terms and/or financial data extracted automatically)
  → USER VALIDATION (analyst reviews extracted data, corrects errors, promotes to canonical tables)
  → OBLIGATIONS_EXTRACTED (obligations generated from validated contract terms)
  → PROJECTIONS_COMPLETE (projection engine has run)
  → REVIEW_READY (credit assessment available for analyst review)
```

**Key design decision:** Extraction runs immediately after classification without waiting for user validation. The "ForValidation" staging tables (contract_for_validation, term_for_validation, statement_for_validation) protect canonical tables from bad data — extraction results sit in staging until the user explicitly promotes them. This means:

- The inbox is a **triage and exception queue**, not a mandatory gate
- Most documents flow through with no user action required before extraction
- The user validates extracted data in Contract Analysis and Statement Analysis, not in the inbox
- If the user disagrees with a classification, editing the workflow triggers re-extraction with corrected parameters

### Document Content Classification

Documents receive orthogonal content flags that determine pipeline routing:
- **TERMS**: Contains contractual terms (loan amounts, rates, covenants)
- **FINANCIALS**: Contains financial data (statements, projections, ratios)
- **TERMS_AND_FINANCIALS**: Contains both (e.g., CIMs, pitch decks) — these get routed through BOTH extraction pipelines

### Obligation Matching (for reporting workflows)

When documents arrive for existing relationships:
- **HIGH confidence**: Document types match AND reporting period aligns with obligation due date
- **MEDIUM confidence**: Document types match AND closest upcoming due date within window
- **LOW confidence**: Only due date proximity match

### Inbox Actions

The inbox workflow_for_validation screen provides three actions:
- **EDIT WORKFLOW** (gold, primary): Correct misclassifications, fix counterparty matches, reassign document type. If the edit changes content_flags or counterparty_id, this triggers re-extraction.
- **ARCHIVE** (coral/warning): Soft-delete junk, duplicates, auto-replies. Archived items are excluded from all downstream queries.
- **MARK REVIEWED** (ghost/muted): Lightweight acknowledgment for the audit trail. Clears the item from the unread count. Does not trigger any pipeline action.

## Status-Driven Dispatch — Next.js / Railway Contract

### The Core Pattern

The pipeline runs end-to-end without human gates. Status columns on staging tables
default to `'PENDING'` at the database level, so Railway picks up new records
automatically. Next.js validate routes reset status to `'PENDING'` when users
correct extraction results, causing re-processing with corrected data.

```
AUTO-FIRE (initial pipeline run — no human action):
  Railway stage creates _for_validation record
  → DB default sets {stage}_status = 'PENDING'
  → Next polling cycle picks up PENDING record
  → Railway runs the appropriate transform
  → Railway sets status = 'COMPLETE' or 'ERROR'

RE-TRIGGER (user corrects extraction results):
  User clicks "Validate" in Next.js
  → Next.js promotes _for_validation record to canonical table
  → Next.js resets {stage}_status = 'PENDING' on the _for_validation record
  → Next.js calls POST /api/wake on Railway (fire-and-forget)
  → Railway re-processes with corrected data
```

### Status Lifecycle

Every dispatch-triggering column follows the same enum:
`PENDING → IN_PROGRESS → COMPLETE → ERROR`

Railway sets IN_PROGRESS before starting (prevents duplicate processing), COMPLETE on success, ERROR with diagnostic info on failure.

### Dispatch Columns (on staging / dispatch tables)

| Table | Status Column | Initial Trigger | Re-trigger | Dispatches |
|-------|--------------|-----------------|------------|------------|
| `workflow_for_validation` | `extraction_status` | DB default `PENDING` (A4 creates row) | Inbox edit (content_flags change) | TE, FE, PFE depending on content_flags |
| `contract_for_validation` | `obligation_extraction_status` | DB default `PENDING` (ECV creates row) | Contract validate route | EO → EOTSV |
| `financial_statement_for_validation` | `profile_assignment_status` | DB default `PENDING` (ESV creates row) | Statement validate route | APP |
| `counterparty_profile_assignment` | `projection_status` | APP sets explicitly | — | GCP |

### What Next.js Does (and doesn't)

**Next.js validate routes DO:**
- Promote ForValidation records to canonical tables
- Reset the status column to 'PENDING' on the _for_validation record (re-triggering downstream processing with corrected data — NOT the initial dispatch trigger)
- Call `POST {PIPELINE_SERVICE_URL}/api/wake` (fire-and-forget, wrapped in try/catch)
- Return success to the UI

**Next.js validate routes DO NOT:**
- Call specific Railway transform endpoints (/api/extract, /api/dispatch-obligations, etc.)
- Pass document_ids, content_flags, or other parameters to Railway
- Run any computation, LLM calls, metric derivation, or profile matching
- Know which Railway transform will run — that's Railway's job

**Rule of thumb:** If a Next.js API route does anything more than read from Supabase, write a status flag to Supabase, and optionally call /api/wake, it's doing too much.

### The /api/wake Endpoint

A single POST endpoint on Railway that forces an immediate polling cycle. No parameters. This is a latency optimization only — the system works without it because the polling loop catches PENDING records on the next cycle regardless.

### Railway Polling Loop Order

The polling loop runs these dispatch checks sequentially on each cycle:
1. **Intake pipeline** (A1→A3→A4→A5→CPC→LDC) — processes new emails
2. **Extraction dispatch** — checks workflow_for_validation.extraction_status = 'PENDING'
3. **Obligation dispatch** — checks contract_for_validation.obligation_extraction_status = 'PENDING', reads source_document_id from the contract row
4. **Profile assignment dispatch** — checks financial_statement_for_validation.profile_assignment_status = 'PENDING'
5. **Projection dispatch** — checks counterparty_profile_assignment.projection_status = 'PENDING'

### Pipeline-Overwrite Protection

Any stage that can re-process records must not overwrite validated/user-edited data. The promote-on-validate pattern (ForValidation → canonical table) provides this protection inherently — pipeline outputs write to staging tables, canonical tables only receive data through explicit user validation actions.

## Data Model — Core Object Types

### Counterparty
The entity being analyzed. Can be a corporate borrower, project SPV, or guarantor.
- Primary key: `counterparty_id` (format: `CTR_YYYYMMDD_###`)
- Key fields: legal_name, industry_code, risk_rating, credit_score, watchlist_status
- Links to: contracts, obligations, financial statements, projections

### Contract
The lending agreement.
- Primary key: `contract_id` (format: `CNT_YYYYMMDD_###`)
- Key fields: contract_type (TERM_LOAN, REVOLVING, CONSTRUCTION, SYNDICATED), principal_amount, interest_rate, maturity_date
- Links to: counterparty, obligations, collateral, transactions

### Obligation
The unified abstraction for all contractual requirements.
- Primary key: `obligation_id` (format: `OBL_YYYYMMDD_###`)
- Key fields: obligation_type, obligation_subtype, term_identity, threshold_value, measurement_frequency
- Payment-specific: principal_amount, interest_rate_index, interest_rate_spread, payment_frequency_value, amortization_type_value
- Links to: contract, counterparty

### Obligation Term Structure (Payment Schedule)
Generated FROM obligations. One row per payment event.
- Key fields: payment_due_date, scheduled_principal, scheduled_interest, scheduled_total_payment, remaining_balance
- Primary key: `PMT_{contract_id}_{payment_number}`

### Financial Statement
GAAP financial data extracted from documents.
- Primary key: `statement_id` (format: `FIN_YYYYMMDD_###`)
- Types: BALANCE_SHEET, INCOME_STATEMENT, CASH_FLOW
- Contains structured line items (assets, liabilities, equity, revenue, operating metrics)

### Projection Profile
Templates that define HOW projections are generated. These learn over time through feedback.
- Contains growth rate assumptions, cost structure parameters, industry benchmarks
- Uses relative/percentage-based parameters (not absolute dollar amounts) to be reusable across companies of different sizes
- Seeded from RMA (Risk Management Association) industry time series data

### Counterparty Projection
The output of the projection engine. Wide/pivoted format — one row per counterparty with all periods as columns.
- Primary key: `counterparty_projection_id`
- Column pattern: `{metric}_y{year}_q{quarter}` (e.g., `revenue_y1_q1`, `dscr_corridor_y2_q3`)
- Granularity: Quarterly (3 years × 4 quarters = 12 periods)
- Metrics per period: revenue, COGS, gross profit, operating expenses, EBITDA, CFADS, debt service, DSCR (corridor, pari passu, total), capex, working capital change, borrowing base
- Non-periodic columns: `dscr_classification` (temporal minimum classification), `dscr_stress_driver` (what drives the minimum), `profile_id` (links to projection profile used), `projection_created_at`
- The temporal minimum DSCR across the projection horizon is the key output
- This is the Foundry-era wide schema. Do NOT normalize to one-row-per-period — the wide format matches the read access pattern (one row fetch for a full projection timeline).

### Counterparty Risk (Credit Assessment)
The final analytical output. Produced by the `assessCreditRisk` function using `CRDR_PROMPT_16`.
- Contains the five FUND/SYS dimension scores
- Contains the overall risk rating and narrative

### Workflow / WorkflowForValidation
Tracks document processing state. WorkflowForValidation is the "staging" version that users review before promoting to canonical objects.
- Fields: workflow_stage, workflow_status, counterparty_id, document_id, content_flags, apparent_counterparty, matched_obligation_id

### Organization
Represents Corridor Credit fund or a bank partner institution.
- Primary key: `id` (UUID)
- Key fields: name, org_type (CORRIDOR_FUND or BANK_PARTNER), config (JSONB for bank-specific settings)
- Foundation for multi-tenancy: all deal-level tables include `bank_partner_id` referencing this table

### User Profile
Links Supabase auth users to organizations and roles.
- Primary key: `id` (UUID, references auth.users)
- Key fields: email, full_name, org_id (references organizations), role, is_corridor_staff
- Roles: FUND_MANAGER, ANALYST, COMPLIANCE_OFFICER, BANK_ADMIN, BANK_CREDIT_OFFICER, BANK_ANALYST, BANK_VIEWER, SUPER_ADMIN
- The global header displays organization name, user email, and role from this table

## Architecture — What Lives Where

### This Application (Next.js + Supabase)
- All user-facing application UI (inbox, contract analysis, statement analysis, projections, credit analysis)
- Validation workflows (promote ForValidation → canonical tables, set PENDING status flags on _for_validation records)
- Projection engine calculations (multi-engine: revenue, costs, capital structure, working capital, CFADS, DSCR)
- Credit risk assessment (FUND/SYS scoring)
- Supabase Auth for authentication
- Organization and user profile management

### Railway Service (Python/FastAPI)
- Email ingestion and parsing (A1)
- Document processing and chunking (A3)
- LLM-powered entity extraction and counterparty matching (A4)
- Deal orchestration (A5)
- Counterparty consolidation (CPC)
- Document chunk linking (LDC)
- Contract term extraction — 6-pass parallel LLM (TE → ECV)
- Financial statement extraction — 34 GAAP line items (FE → ESV)
- Pro forma extraction (PFE → EPF)
- Obligation extraction from validated terms (EO)
- Obligation term structure / payment schedule generation (EOTSV)
- Projection profile assignment (APP)
- All LLM calls for data extraction
- Polling loop as single pipeline orchestrator

### Supabase
- PostgreSQL database (all tables)
- Auth (JWT, session management)
- Storage (document PDFs, attachments)
- Row-level security policies
- Organizations and user_profiles tables (multi-tenancy foundation)

### The Boundary Rule
Next.js is the UI layer and status-flag writer. Railway is the computation and extraction engine. The boundary is Supabase — both services read and write to it, but only Railway runs transforms and only Next.js handles user interactions.

## Solar Valley — Primary Demo Scenario

The end-to-end demo uses a solar energy project finance deal:
- **Borrower**: GreenHorizon Energy Partners / Solar Valley Holdings
- **Project**: 180-250 MW solar photovoltaic facility in Kern County, California
- **Financing**: $250MM senior secured credit facility, 7-year tenor from COD
- **Terms**: SOFR + 275 bps, 15-year sculpted amortization, semi-annual payments
- **Key covenant**: DSCR not less than 1.25x quarterly
- **PPA**: 20-25 year Power Purchase Agreement with Southern California Edison at ~$38/MWh
- **Stress point**: Winter Q1 (lowest solar irradiance) produces minimum DSCR of ~1.28x
- **Covenant cushion**: +2.4% at minimum — this is what the corridor analysis identifies

The demo shows the full pipeline: email arrives with CIM and term sheet → documents classified as TERMS_AND_FINANCIALS → counterparty identified → obligations extracted → payment schedule generated → projections run → temporal DSCR corridor visualized → credit assessment produced.

## UI Design Principles

- **Information density matters.** Credit analysts want to see deal terms, financial statements, obligation schedules, and projection output on a single screen. Don't spread information across too many pages.
- **Use shadcn/ui as the component library.** Tailwind CSS for styling.
- **Supabase Auth UI for authentication flows.** Don't build custom auth.
- **Dark theme preferred** (matching the current inbox design).
- **Navigation structure**: Inbox & Alerts, Statement Analysis, Contract Analysis, Projections, Credit Analysis, Approvals, Enterprise.
- **The Coverage Corridor Analysis chart is a signature visualization.** It shows DSCR across projection periods with the temporal minimum identified and covenant threshold marked. This is the visual representation of the platform's core analytical insight.

## Technical Conventions

- **Primary key formats**: `CTR_YYYYMMDD_###` (counterparties), `CNT_YYYYMMDD_###` (contracts), `OBL_YYYYMMDD_###` (obligations), `CPJ_YYYYMMDD_###` (projections), `PMT_{contract_id}_{payment_number}` (payment events), `FIN_YYYYMMDD_###` (financial statements)
- **LLM output formats**: Use pipe-delimited format for simple LLM extractions with fewer than 6 fields (counterparty extraction, document classification, workflow routing). Example: `COUNTERPARTY|CONTENT_FLAGS|PROSPECT_CAT|INTENT|PERIOD|DOC_TYPES`. Use shallow template-based JSON for structured data extraction (financial statements, contract entity extraction) where the LLM fills in values against a predefined schema. The Foundry-era difficulties with JSON parsing were platform-specific and do not apply when calling the Anthropic API directly. In both cases, always validate the output before writing to the database.
- **Validation-first pattern**: Data enters as "ForValidation" records. Users review and confirm before promoting to canonical objects.
- **Status-based filtering** with workflow_stage/workflow_status rather than incremental processing decorators. More portable across platforms.
- **Percentage/relative parameters in templates**, not absolute dollar amounts, so profiles are reusable across companies of different sizes.

## Key Financial Concepts for Context

- **DSCR** (Debt Service Coverage Ratio): Cash Flow Available for Debt Service / Total Debt Service. A DSCR of 1.25x means 25% more cash flow than needed to cover debt payments.
- **LLCR** (Loan Life Coverage Ratio): NPV of future cash flows / outstanding debt. Measures whether cumulative cash flow can repay the loan.
- **CFADS** (Cash Flow Available for Debt Service): EBITDA minus taxes, maintenance capex, working capital changes. The actual cash available to pay lenders.
- **Covenant cushion**: `(DSCR - covenant_threshold) / covenant_threshold`. Measures how close a borrower is to tripping a covenant.
- **ABL** (Asset-Based Lending): Lending secured by specific assets (receivables, inventory, equipment) with borrowing base calculations.
- **CIM** (Confidential Information Memorandum): Marketing document for a lending opportunity containing both deal terms and financial projections.

## What NOT to Do

- Don't use complex / nested JSON for LLM output parsing in pipelines. Use pipe-delimited for simple extractions, shallow JSON for structured extractions.
- Don't build overly complex solutions when simple ones work. Brent consistently prefers clean, maintainable code over clever abstractions.
- Don't create throwaway prototypes. Everything built here should be production-path code.
- Don't use generic placeholder data when Solar Valley scenario data is available.
- Don't spread related information across many small pages. Credit analysts need information density.
- Don't have Next.js API routes call specific Railway transform endpoints. Use the status-driven dispatch pattern: write PENDING to the _for_validation record in Supabase, call /api/wake.
- Don't run computation, LLM calls, or profile matching in Next.js API routes. That logic belongs in Railway.
- Don't treat the inbox as a mandatory gate before extraction. Extraction runs automatically; the inbox is for triage and exceptions.
- Don't create new imperative Railway endpoints for pipeline triggers. The polling loop discovers work via status columns.
- Don't normalize the counterparty_projection table to one-row-per-period. Keep the wide/pivoted format (one row per counterparty, columns named {metric}_y{n}_q{n}).
- Don't modify the global header or collapsible navigation layout without explicit direction. The current implementation (global header with polling/status indicators, collapsible nav with wordmark/monogram logo swap) is the intended design.
- Don't write PENDING status flags to canonical tables. PENDING is always set on the _for_validation (staging) record. Railway polls staging tables, not canonical tables.


## Design System

Apply the design system defined in DESIGN_SYSTEM.md. Use Syne for body/UI text, DM Mono for all data values and codes, and Instrument Serif italic for page-level screen titles only (never for narrative or prose text). Background #0d1017, surfaces #131920 / #1a2130. SAT = #4caf82, PW = #e8a040, WDW = #e07060. Gold #c8a84b for primary actions. Match panel, chip, button, and section divider patterns exactly as specified.
