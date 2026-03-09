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

Documents flow through a staged pipeline:

```
Email Received
  → INTAKE (email parsed, attachments extracted)
  → CLASSIFIED (LLM identifies counterparty, content type, intent)
  → VALIDATED (user confirms/corrects classification)
  → TERMS_EXTRACTED (contract terms pulled from documents)
  → FINANCIALS_EXTRACTED (financial statement data extracted)
  → OBLIGATIONS_EXTRACTED (obligations generated from terms)
  → PROJECTIONS_COMPLETE (projection engine has run)
  → REVIEW_READY (credit assessment available for analyst review)
```

Each stage has a status: SUCCESS, SUCCESS_WITH_EDITS, FAILED, IN_PROGRESS, SKIPPED.

### Document Content Classification

Documents receive orthogonal content flags that determine pipeline routing:
- **TERMS**: Contains contractual terms (loan amounts, rates, covenants)
- **FINANCIALS**: Contains financial data (statements, projections, ratios)
- **TERMS_AND_FINANCIALS**: Contains both (e.g., CIMs, pitch decks) — these get routed through BOTH extraction pipelines sequentially

### Obligation Matching (for reporting workflows)

When documents arrive for existing relationships:
- **HIGH confidence**: Document types match AND reporting period aligns with obligation due date
- **MEDIUM confidence**: Document types match AND closest upcoming due date within window
- **LOW confidence**: Only due date proximity match

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
The output of the projection engine. 36 monthly periods of projected financials.
- Primary key: `CPJ_YYYYMMDD_###`
- Contains: revenue projections, cost projections, CFADS (Cash Flow Available for Debt Service), DSCR at each period
- The temporal minimum DSCR across the projection horizon is the key output

### Counterparty Risk (Credit Assessment)
The final analytical output. Produced by the `assessCreditRisk` function using `CRDR_PROMPT_16`.
- Contains the five FUND/SYS dimension scores
- Contains the overall risk rating and narrative

### Workflow / WorkflowForValidation
Tracks document processing state. WorkflowForValidation is the "staging" version that users review before promoting to canonical objects.
- Fields: workflow_stage, workflow_status, counterparty_id, document_id, content_flags, apparent_counterparty, matched_obligation_id

## Architecture — What Lives Where

### This Application (Next.js + Supabase)
- Email ingestion and parsing
- Document processing and chunking (using unstructured.io)
- Entity extraction and counterparty matching (LLM-powered)
- Document classification (TERMS / FINANCIALS / TERMS_AND_FINANCIALS)
- Workflow routing and validation UI
- Inbox interface and deal review screens
- All user-facing application UI
- Projection engine (multi-engine: revenue, costs, capital structure, working capital, CFADS, DSCR)
- Obligation term structure generation
- Credit risk assessment
- Projection profile learning/feedback loop
- Workshop-based analytical interfaces

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
- **LLM outputs use pipe-delimited format**, not JSON. Example: `COUNTERPARTY|CONTENT_FLAGS|PROSPECT_CAT|INTENT|PERIOD|DOC_TYPES`. This is a hard-won lesson from Foundry debugging — JSON parsing from LLMs is unreliable.
- **A JSON output is utilized for FINANCIAL STATEMENT entity extraction, but is kept to a single level of depth.
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

- Don't use complex / nested JSON for LLM output parsing in pipelines. Use pipe-delimited.
- Don't build overly complex solutions when simple ones work. Brent consistently prefers clean, maintainable code over clever abstractions.
- Don't create throwaway prototypes. Everything built here should be production-path code.
- Don't use generic placeholder data when Solar Valley scenario data is available.
- Don't spread related information across many small pages. Credit analysts need information density.