<!-- Source of truth: Corridor Credit Claude Chat project. Do not edit unilaterally — update via project context first, then push to both repos. -->

# Corridor Credit — Supabase Schema Reference

*Generated from live database introspection on 2026-03-28.*

## Schema Overview

**75 tables** in the `public` schema. No views. No RLS enabled on any table. Three private storage buckets. All user-defined tables follow a singular-noun naming convention (migration `20260413_singular_naming_convention.sql`).

**Table categories:**
- **Canonical tables (14):** Validated/promoted data — the system of record
- **Staging tables (7):** Pipeline output awaiting user validation (`_for_validation` suffix)
- **Pipeline / diagnostic tables (7):** Written by Railway stages during extraction
- **Credit assessment tables (8):** CRDR policy dimensions and assessment findings
- **Projection system tables (8):** Profile management, performance tracking, optimization
- **Deal / facility tables (3):** Deal structure and document tracking (`deal`, `facility`, `deal_document`)
- **Enterprise tables (15):** Foundry-era canonical objects (banker, committee, KYC, alerts, etc.)
- **Request tables (7):** Foundry-era document extraction framework
- **Reference / configuration tables (6):** Seeded or admin-managed

---

## Canonical Tables

These hold validated/promoted data. Populated when a user validates a `_for_validation` record in the Next.js UI.

### `counterparty`
The entity being analyzed. PK: `counterparty_id` (text, format `CTR_YYYYMMDD_###`).

| Column | Type | Notes |
|--------|------|-------|
| counterparty_id | text | PK, NOT NULL |
| counterparty_name | text | |
| counterparty_type | text | Default `'BORROWER'` |
| status | text | Default `'ACTIVE'` |
| relationship_status | text | |
| industry_code | text | NAICS |
| business_type | text | |
| size_category | text | |
| credit_score | int4 | |
| risk_rating | text | |
| total_exposure | numeric | |
| watchlist_status | bool | Default `false` |
| parent_company_id | text | FK → counterparty.counterparty_id (self-ref) |
| is_parent_company | bool | Default `false` |
| primary_banker_id | text | FK → corridor_banker.banker_id |
| projection_profile_id | text | |
| source_document_id | text | |
| source_workflow_id | text | |
| source_prospective_counterparty_id | text | |
| model_id, maturity_category, is_user_override, profile_confirmed_by_id | text/bool | Profile assignment metadata |
| onboarding_date | timestamptz | |
| created_at, updated_at | timestamptz | NOT NULL, default `now()` |

### `contract`
The lending agreement. PK: `contract_id` (text, format `CNT_YYYYMMDD_###`).

| Column | Type | Notes |
|--------|------|-------|
| contract_id | text | PK, NOT NULL |
| counterparty_id | text | FK → counterparty |
| deal_id | text | FK → deal |
| source_document_id | text | FK → document |
| workflow_id | text | FK → workflow |
| contract_title, contract_type, contract_subtype, contract_status | text | |
| currency | text | |
| origination_date, effective_date, maturity_date | date | |
| source_contract_for_validation_id | text | Traceability to staging row |
| obligation_extraction_status | text | **Dispatch column** — appears to be a leftover; canonical dispatch is on `contract_for_validation` |
| created_at, updated_at | timestamptz | NOT NULL |

### `term`
Validated contract terms. PK: `term_id` (text). Promotes from `term_for_validation`.

| Column | Type | Notes |
|--------|------|-------|
| term_id | text | PK, NOT NULL |
| contract_id | text | FK → contract |
| source_document_id | text | FK → document |
| term_name | text | |
| term_value | text | Stored as text by design |
| term_unit | text | USD, PERCENT, DAYS, etc. |
| term_description | text | |
| extraction_confidence | numeric | |
| is_key_term | bool | |
| validation_status | text | |
| term_identity_id | text | |
| source_term_for_validation_id | text | |
| created_at, updated_at | timestamptz | NOT NULL |

### `obligation`
Unified abstraction for contractual requirements. PK: `obligation_id` (text, format `OBL_YYYYMMDD_###`). Promotes from `obligation_for_validation`.

| Column | Type | Notes |
|--------|------|-------|
| obligation_id | text | PK, NOT NULL |
| contract_id | text | FK → contract |
| counterparty_id | text | FK → counterparty |
| source_term_id | text | FK → term |
| obligation_name | text | |
| obligation_type | text | FINANCIAL_COVENANT, REPORTING_REQUIREMENT, COLLATERAL_MONITORING, NEGATIVE_COVENANT, PAYMENT_OBLIGATION |
| obligation_subtype | text | e.g. MINIMUM_DSCR, PRINCIPAL_AMOUNT |
| status | text | |
| is_key_obligation | bool | |
| measurement_metric | text | DSCR, LEVERAGE_RATIO, etc. |
| threshold_value | numeric | |
| threshold_operator | text | `>=` or `<=` |
| threshold_unit | text | RATIO, USD, etc. |
| frequency | text | MONTHLY, QUARTERLY, etc. |
| due_timing_anchor, due_timing_description | text | |
| due_days_offset, grace_period_days | int4 | |
| next_due_date | date | |
| reporting_category, reporting_period_type | text | |
| expected_document_types, required_document_types | text[] | |
| delivery_method, submission_method, recipient_email | text | |
| last_met_date | date | |
| last_met_document_ids | text[] | |
| covenant_logic_id, certification_requirements | text | |
| required_certifications | text[] | |
| materiality_threshold | numeric | |
| overdue_alert_sent | bool | |
| creation_date | date | |
| created_at, updated_at | timestamptz | NOT NULL |

### `obligation_term_structure`
Payment schedule generated from obligations. PK: `obligation_event_id` (text, format `PMT_{contract_id}_{n}`). Promotes from `obligation_term_structure_for_validation`.

| Column | Type | Notes |
|--------|------|-------|
| obligation_event_id | text | PK, NOT NULL |
| contract_id | text | FK → contract |
| counterparty_id | text | FK → counterparty |
| facility_amount | numeric | |
| base_rate_index | text | e.g. SOFR, PRIME |
| applicable_margin_spread | numeric | |
| payment_frequency | text | |
| amortization_type | text | |
| origination_date, maturity_date | date | |
| payment_number | int4 | |
| payment_due_date | date | |
| scheduled_principal, scheduled_interest, scheduled_total_payment | numeric | |
| outstanding_principal_beginning, outstanding_principal_ending | numeric | |
| is_final_payment | bool | |
| days_until_payment | int4 | |
| payment_status | text | PAST_DUE, DUE_SOON, SCHEDULED |
| data_quality_score | numeric | |
| source_obligation_term_structure_for_validation_id | text | |
| generated_timestamp | timestamptz | |
| created_at, updated_at | timestamptz | NOT NULL |

### `financial_statement`
GAAP financial data. PK: `statement_id` (text, format `FIN_YYYYMMDD_###`). Promotes from `financial_statement_for_validation`.

| Column | Type | Notes |
|--------|------|-------|
| statement_id | text | PK, NOT NULL |
| counterparty_id | text | FK → counterparty |
| document_id | text | FK → document |
| obligation_id | text | FK → obligation |
| projection_profile_id | text | FK → projection_profile |
| workflow_id | text | FK → workflow |
| counterparty_name | text | |
| statement_title, statement_type | text | |
| period_end_date | date | |
| period_end_month | text | |
| period_end_year | int4 | |
| reporting_currency | text | |
| confidence | numeric | |
| **Income statement:** revenue, cogs, gross_profit, operating_expenses, sga, depreciation_amortization, operating_income, interest_expense, income_before_taxes, income_tax_expense, net_income, other_comprehensive_income | numeric | |
| **Balance sheet:** total_assets, total_current_assets, cash_and_equivalents, accounts_receivable, inventory, ppe, intangible_assets, goodwill, total_current_liabilities, accounts_payable, wages_payable, notes_payable, short_term_debt, long_term_debt, total_liabilities, equity, retained_earnings, common_stock, additional_paid_in_capital, treasury_stock | numeric | |
| source_financial_statement_for_validation_id | text | |
| projection_method, projection_profile | text | |
| template_assignment_date | date | |
| is_user_override | bool | |
| override_justification | text | |
| industry_code | int4 | |
| deal_id, contract_id, audit_id | text | |
| profile_assignment_status | text | Appears on canonical table — may be vestigial; dispatch is on `financial_statement_for_validation` |
| created_at, updated_at | timestamptz | NOT NULL |

### `pro_forma_financial_statement`
Pro forma projections extracted from CIMs. PK: `pro_forma_statement_id` (text). Promotes from `pro_forma_statement_for_validation`.

Same GAAP line items as `financial_statement`, plus: `as_of_date`, `assumption_notes`, `period_sequence`, `period_type`, `projection_period_start`, `projection_period_end`, `scenario_type`, `source_type`, `extraction_timestamp`, `validation_status`.

FKs: counterparty_id → counterparty, document_id → document, obligation_id → obligation, workflow_id → workflow.

### `workflow`
Canonical workflow records. PK: `workflow_id` (text). Promotes from `workflow_for_validation`.

| Column | Type | Notes |
|--------|------|-------|
| workflow_id | text | PK, NOT NULL |
| counterparty_id | text | FK → counterparty |
| deal_id | text | FK → deal |
| source_email_id | text | FK → email |
| obligation_id | text | FK → obligation |
| assigned_to_id | text | FK → corridor_banker |
| initiated_by_id | text | FK → corridor_banker |
| successor_workflow_id | text | FK → workflow (self-ref) |
| source_workflow_for_validation_id | text | |
| workflow_name, workflow_type, workflow_subtype | text | |
| workflow_stage, workflow_status | text | |
| document_type, document_content_flags | text | |
| requires_financial_extraction | bool | |
| priority, notes | text | |
| created_date, completed_date | date | |
| created_at, updated_at | timestamptz | NOT NULL |

### `collateral`
PK: `collateral_id`. FKs: contract_id → contract, counterparty_id → counterparty, source_document_id → document, workflow_id → workflow. Tracks collateral type, value, lien position, perfection status, filing info, valuation.

### `counterparty_risk`
Credit assessment output. PK: `counterparty_risk_id`. FKs: counterparty_id → counterparty, counterparty_projection_id → counterparty_projection. Contains DSCR summary metrics (min, avg, median, volatility, trajectory), LLCR, classification, period counts, model_version.

### `covenant_test_result`
PK: `test_result_id`. FKs: obligation_id → obligation, source_document_id → document. Tracks measured_value vs threshold_value, test_result, test_date, test_period, compliance_notes.

### `deal`
PK: `deal_id`. FKs: counterparty_id → counterparty, banker_id → corridor_banker. Tracks deal_name, deal_status, approval_stage, execution_status, facility/document counts, deal_group_id, counterparty_name. The legacy plural `deals` table was merged into this canonical table by migration `20260413_singular_naming_convention.sql`.

### `facility`
PK: `facility_id`. FKs: deal_id → deal, counterparty_id → counterparty. Tracks facility_name, facility_type, facility_status, project_name, deal_group_id, counterparty_name, facility_documents (int4). The legacy plural `facilities` table was merged into this canonical table by migration `20260413_singular_naming_convention.sql`, which also added `deal_group_id` and `counterparty_name` columns to align with the `deal` table.

---

## Staging Tables (_for_validation)

Pipeline output awaiting user validation. Each has a companion canonical table that receives promoted data.

### `workflow_for_validation`
**Promotes to:** `workflow`. **Dispatch column:** `extraction_status`.

PK: `workflow_for_validation_id` (text). FKs: counterparty_id → counterparty, source_email_id → email, document_id → document.

| Dispatch columns | |
|---|---|
| `extraction_status` | text, default `'PENDING'` — Railway watches for PENDING |
| `completed_at` | timestamptz |
| `error_details` | text |

Key columns: apparent_counterparty, counterparty_name, relationship_status, workflow_type/subtype, document_content_flags, document_type, initial_extraction_stage, requires_financial_extraction, has_contract_terms (bool, default `false`), has_historical_financials (bool, default `false`), has_pro_forma_financials (bool, default `false`), reporting_period, extracted_document_types, match_confidence, match_reason, workflow_stage (default `'CLASSIFIED'`), workflow_status (default `'SUCCESS'`), priority (default `'Medium'`), is_archived (default `false`), reviewed_at, reviewed_by.

### `contract_for_validation`
**Promotes to:** `contract` + `term` (via terms). **Dispatch column:** `obligation_extraction_status`.

PK: `contract_for_validation_id` (text). No FKs enforced at DB level (references are logical).

| Dispatch columns | |
|---|---|
| `obligation_extraction_status` | text, default `'PENDING'` — Railway watches for PENDING, runs EO → EOTSV |
| `completed_at` | timestamptz |
| `error_details` | text |

Key columns: workflow_for_validation_id, counterparty_id, document_id, document_name, contract_title, contract_type/subtype, contract_status (default `'DRAFT'`), currency, origination_date/effective_date/maturity_date (text), source_document_id, obligation_id, passes_completed, extraction_passes_used.

### `term_for_validation`
**Promotes to:** `term`. No dispatch column (promoted alongside contract validation).

PK: `term_for_validation_id` (text). FK: contract_for_validation_id → contract_for_validation.

Key columns: workflow_for_validation_id, counterparty_id, document_id, term_name (NOT NULL), term_value, term_unit, term_description, extraction_confidence, term_frequency, is_key_term, validation_status (default `'PENDING'`), term_identity_id, source_embedding_id.

### `financial_statement_for_validation`
**Promotes to:** `financial_statement`. **Dispatch column:** `profile_assignment_status`.

PK: `id` (text). No FKs enforced at DB level.

| Dispatch columns | |
|---|---|
| `profile_assignment_status` | text, default `'PENDING'` — Railway watches for PENDING, runs APP |
| `completed_at` | timestamptz |
| `error_details` | text |

Key columns: workflow_id, workflow_for_validation_id, counterparty_id, document_id, period_end_date (text), period_end_month/year (int4), statement_title, validation_status (default `'PENDING'`), is_user_override, user_edited_columns (text[]), override_justification, deal_id. All 34 GAAP line items as float8.

### `pro_forma_statement_for_validation`
**Promotes to:** `pro_forma_financial_statement`. No dispatch column.

PK: `id` (text). Same structure as `financial_statement_for_validation` plus deal_id.

### `obligation_for_validation`
**Promotes to:** `obligation`. No dispatch column (created by EO stage, promoted during obligation validation).

PK: `obligation_for_validation_id` (text). FK: contract_for_validation_id → contract_for_validation.

Full obligation fields: obligation_name (NOT NULL), obligation_type, obligation_subtype, status (default `'PENDING'`), measurement_metric, threshold_value/operator/unit, payment fields (principal_amount, interest_rate_index/spread, payment_frequency_value, amortization_type_value), timing fields (frequency, due_timing_anchor, due_days_offset, next_due_date, grace_period_days), reporting fields, contract dates, validation_status (default `'PENDING'`).

### `obligation_term_structure_for_validation`
**Promotes to:** `obligation_term_structure`. No dispatch column (created by EOTSV stage).

PK: `obligation_event_id` (text). FK: contract_for_validation_id → contract_for_validation.

Same payment event structure as canonical table. All monetary fields are float8. Dates stored as text. validation_status default `'PENDING'`.

---

## Pipeline / Dispatch Tables

Written by Railway stages during processing. Not directly user-facing.

### `email`
Parsed email metadata. PK: `email_id` (text). Written by A1 stage.

Columns: subject, from_address (NOT NULL), to_addresses/cc_addresses/bcc_addresses (text[]), body_plain/body_html (NOT NULL, default `''`), sent_timestamp, file_name, is_archived (default `false`).

### `attachment`
PK: `id` (int8, auto). FK: email_id → email. Written by A1 stage. Columns: attachment_name, file_name, sent_timestamp, file_type, content_transfer_encoding.

### `document`
PK: `document_id` (text). FKs: email_id → email (dual FK), workflow_for_validation_id → workflow_for_validation, workflow_id → workflow, deal_id → deal. Written by A3 stage.

Columns: document_name, file_type, complete_document_text, storage_path, pdf_storage_path, document_type, status, timestamp.

### `document_chunk`
PK: `contract_chunk_id` (text). FK: document_id → document. Written by A3 stage.

Columns: chunk_id, section_name, section_title, chunk_text, character_count, token_estimate, is_sub_chunk, sub_chunk_index, page_range (default `'full_document'`), document_name, email_id, workflow_id/counterparty_id/obligation_id/workflow_for_validation_id (text, default `''`).

### `linked_document_chunk`
PK: `contract_chunk_id` (text). Written by LDC stage. Same columns as `document_chunk`, plus workflow_type, workflow_subtype (default `''`).

### `enriched_workflow`
PK: `workflow_for_validation_id` (text). Written by A5/CPC stages. Denormalized view of workflow + counterparty data. Includes all workflow_for_validation fields plus deal_id, facility_id, document_status, document_version, is_execution_ready, error_details, completed_at.

### `contract_extraction_pass`
Diagnostic/audit layer for 6-pass term extraction. PK: `id` (text). Written by TE stage.

Columns: document_id (NOT NULL), workflow_for_validation_id (NOT NULL), pass_number (int4, NOT NULL; 1-6 for individual, 0 for MERGED), pass_name (NOT NULL), input_summary, raw_output, extracted_entities (jsonb, default `'{}'`), confidence_score (float8).

### `reporting_entity_extraction`
Diagnostic layer for financial extraction. PK: `id` (text). Written by FE stage. Columns: document_id, workflow_for_validation_id, counterparty_id, raw_output, extracted_entities (jsonb), extraction_status, extraction_confidence (float8), extraction_model.

### `pro_forma_entity_extraction`
Diagnostic layer for pro forma extraction. PK: `id` (text). Written by PFE stage. Same structure as `reporting_entity_extraction`.

### `counterparty_profile_assignment`
Profile assignment + projection dispatch. PK: `counterparty_id` (text). FK: counterparty_id → counterparty. Written by APP stage.

**Dispatch column for projections:**

| Dispatch columns | |
|---|---|
| `projection_status` | text — Railway watches for PENDING, runs GCP |
| `projection_error` | text |
| `projection_completed_at` | timestamptz |
| `completed_at` | timestamptz |
| `error_details` | text |

Key columns: counterparty_name, effective_profile_id, projection_method, status, assigned_profile_id, logical_profile_category, is_fallback_profile/fallback_reason. Factual drivers: resolved_industry_code, naics_prefix, industry_sector_label, revenue_size_bucket, annual_revenue, historical_period_count, data_quality_score/label, revenue_growth_rate/display, revenue_volatility/display/label, source_statement_date. Confidence decomposition: confidence_score, confidence_score_adjusted, confidence_{industry,size,volatility,growth}_contribution. Rationale: assignment_rationale_short/detailed. Profile metadata: profile_display_name, profile_description, profile_key_assumptions, profile_typical_industries, profile_revenue_growth_assumption, profile_margin_assumption, profile_capex_intensity. Override tracking: is_user_override, user_selected_profile, override_justification. semantic_version (int4).

### `counterparty_projection`
Wide-format projection output. PK: `counterparty_projection_id` (text). FK: counterparty_id → counterparty. Written by GCP stage.

**Non-periodic columns:** counterparty_name, profile_id, projection_created_at, min_dscr_value, min_dscr_period, dscr_classification, dscr_stress_driver.

**Periodic columns** (pattern `{metric}_y{1-3}_q{1-4}`, 12 periods each):

| Metric group | Column prefix | Type |
|---|---|---|
| Revenue | `revenue_` | numeric |
| Gross profit | `gross_profit_` | numeric |
| Operating expenses | `operating_expenses_` | numeric |
| Operating income | `operating_income_` | numeric |
| Income before taxes | `income_before_taxes_` | numeric |
| Income tax expense | `income_tax_expense_` | numeric |
| Interest expense | `interest_expense_` | numeric |
| Net income | `net_income_` | numeric |
| EBITDA | `ebitda_` | numeric |
| CFADS | `cfads_` | numeric |
| Capex | `capex_` | numeric |
| Total assets | `total_assets_` | numeric |
| Total current assets | `total_current_assets_` | numeric |
| Total current liabilities | `total_current_liabilities_` | numeric |
| Total liabilities | `total_liabilities_` | numeric |
| Total equity | `total_equity_` | numeric |
| Short-term debt | `short_term_debt_` | numeric |
| Long-term debt | `long_term_debt_` | numeric |
| Total debt | `total_debt_` | numeric |
| Corridor debt service | `corridor_debt_service_` | numeric |
| Third-party debt service | `third_party_debt_service_` | numeric |
| Total debt service | `total_debt_service_` | numeric |
| Quarter date | `quarter_date_` | text |
| DSCR Corridor | `dscr_corridor_` | float8 |
| DSCR Pari Passu | `dscr_pari_passu_` | float8 |
| DSCR Total | `dscr_total_` | float8 |
| Working capital change | `working_capital_change_` | float8 |
| Borrowing base | `borrowing_base_` | float8 |

**Total: ~340 columns.** Do NOT normalize to one-row-per-period.

### `counterparty_projection_summary`
One row per counterparty — DSCR/LLCR analysis summary. PK: `projection_summary_id` (text). UNIQUE: `counterparty_id`.

Columns: profile_id, min_dscr_value/period/date/driver/classification, dscr_buffer, avg_dscr, median_dscr, dscr_volatility, periods_below_guideline, periods_below_unity, total_periods, dscr_trajectory, llcr, projection_period_count, model_version (default `'1.0.0'`).

---

## Credit Assessment Tables

### `crdr_assessment_finding`
FUND/SYS credit assessment findings. PK: `finding_id` (text). FKs: counterparty_id → counterparty, deal_id → deal, policy_id → crdr_policy, skill_id → crdr_prompt, prior_finding_id → crdr_assessment_finding (self-ref).

Contains dimension scores in pattern `{dim}_{x|y|z}_{rating|value}` and `{dim}_composite_rating`, `{dim}_narrative` for dimensions: pc, pv, pb, pq, pm, iq, rm, sc, sd, so, sr, tc, tq, tr. Plus: composite_continuous_score, composite_rating, override_composite_rating/rationale, regulatory_classification, risk_factors, routing_recommendation, approval_path, synthesis_narrative, status, validated_by/date/notes, projection_date.

~130 columns total.

### `crdr_policy`
Risk rating policy configuration. PK: `policy_id` (text). Columns: policy_name, version, active, effective_date, superseded_date, approved_by, composite_method, composite_floor_rule, pass/watch/special_mention/substandard/doubtful/loss thresholds, escalation/enhanced_monitoring/committee/standard_approval limits.

### `policy_dimension_pc_debt_service_coverage`
### `policy_dimension_pv_loan_life_coverage`
### `policy_dimension_pb_obligor_trend`
### `policy_dimension_pq_obligor_liquidity`
### `policy_dimension_pm_cost_structure`

Five FUND/SYS dimension tables, all identical structure. PK: `dimension_id` (text). FK: policy_id → crdr_policy.

Columns per dimension: dimension_code, dimension_label, dimension_sequence, weight, sor_number/label, metric_source_{x,y,z}, metric_source_{x,y}_benchmark, x/y/z_{sat,pw,wdw}_{operator,threshold}, {sat,pw,wdw}_continuous_score, sat_rating_contribution, {sat,pw}_reg_score_max, z_reference_dimension, cross_ref_dimension, active, effective_date, notes.

~40 columns each.

---

## Projection System Tables

### `projection_profile`
Templates defining HOW projections are generated. PK: `projection_profile_id` (text).

Major column groups: profile_name, projection_type, industry, size, maturity. Revenue engine (revenue_method, revenue_base_growth_rate, seasonal q1-q4 factors, growth ceiling/floor/decay, volatility_factor). COGS engine (cogs_method, cogs_base_percentage, cogs_improvement_annual/floor). OpEx engine (opex_base_percentage, opex_fixed_amount, opex_scale_efficiency_factor). SGA engine (sga_method, sga_base_percentage, component percentages). Tax (tax_rate_effective, credits, loss carryforward). Working capital (ar_days, ap_days, inventory_days, cash_minimum_days). Capex (growth/maintenance percentages). Depreciation (straight_line/accelerated rates). Debt structure. Balance sheet. Monte Carlo. Cantillon layers. Evolution/optimization tracking.

~105 columns total.

### `projection_profile_performance`
PK: `performance_id` (text). FKs: profile_id → projection_profile, counterparty_id → counterparty, statement_id → financial_statement. Tracks revenue/cogs MAE and variance, overall_accuracy_score, meets_threshold, needs_profile_review.

### `profile_performance_aggregation`
PK: `performance_agg_id` (text). FK: profile_id → projection_profile. Aggregated accuracy metrics: avg_accuracy_score, revenue/cogs MAE avg, success_rate, usage_count, performance_tier, recommendation.

### `projection_feedback`
PK: `feedback_id` (text). FK: profile_id → projection_profile. Tracks projected vs actual variable costs, variance, divergence_trend, exceeds_threshold.

### `projection_learning_event`
PK: `learning_event_id` (text). FKs: profile_id → projection_profile, statement_id → financial_statement. Tracks event_type, impact_score, requires_analysis, cross_profile_relevant.

### `profile_optimization_suggestion`
PK: `profile_optimization_suggestion_id` (text). Tracks optimization recommendations: recommended_parameters, expected_improvement, confidence_level, risk_assessment, status.

### `profile_optimization_history`
PK: `profile_optimization_history_id` (text). FK: profile_optimization_suggestion_id. Tracks applied optimizations: parameter_changes, pre/post accuracy, effectiveness_score.

### `profile_usage_pattern`
PK: `usage_pattern_id` (text). Tracks pattern_type/category, primary_profile_used, usage_frequency, success_rate, manual_override_rate.

### `cross_profile_insight`
PK: `cross_profile_insight_id` (text). Tracks insight_title/description, insight_category, affected_profiles, confidence_level, priority_score, recommended_action, requires_action.

---

## Enterprise Tables

Foundry-era canonical objects. These support the full lending workflow UI (approvals, alerts, KYC, committees, etc.).

### `corridor_banker`
PK: `banker_id` (text). Internal users. Columns: full_name, title, department, role_name/id, access_level, permission_type, resource_type, employee_id, status, office_location, cost_center, industry_specializations, product_certifications, loan_approval_limit, assigned_relationships, manager_id, effective_date.

### `alert`
PK: `alert_id` (text). FKs: directed_to_banker_id → corridor_banker, related_document_id → document, source_counterparty_id → counterparty, source_kyc_due_diligence_id → kyc_due_diligence, source_workflow_id → workflow. Columns: alert_type, alert_title/subject/body, severity, alert_status, alert_priority_score, requires_action, auto_dismiss_on_action, cc_banker_ids (text[]), action_label/url, generated_by/timestamp, acknowledged/resolved_timestamp.

### `approval`
PK: `approval_id` (text). FKs: approver_banker_id → corridor_banker, committee_id → committee, committee_meeting_id → committee_meeting, contract_id → contract, workflow_id → workflow. Columns: approval_name/type/stage/status, required, conditions (text[]), requested/reviewed/approved_date, decision_notes.

### `committee`, `committee_meeting`, `committee_member`
Committee governance tables. PK: committee_id, meeting_id, member_id respectively. Standard committee structure with quorum, authority_level, voting_rights.

### `kyc_due_diligence`
PK: `kyc_due_diligence_id` (text). FK: counterparty_id → counterparty, source_workflow_id → workflow. Comprehensive KYC tracking: screening statuses (sanctions, PEP, adverse media, watchlist), document completeness, risk assessment, compliance approval flow, ~65 columns.

### `workflow_event`
PK: `workflow_event_id` (text). FKs: workflow_id → workflow, changed_by_banker_id → corridor_banker, kyc_due_diligence_id → kyc_due_diligence. Audit trail: event_type, old/new_value, event_notes, event_timestamp.

### `payment`
PK: `payment_id` (text). Payment tracking: counterparty_id/name, contract_id, obligation_id, payment_type/subtype/status/method, amounts, dates, frequency.

### `performance`
PK: `obligation_id` (text). Obligation performance dashboard: covenant/payment/reporting status and days past due, DSCR metrics (gdscr, gllcr, llcr, fcc, etc.), times past due counts.

### `relationship`
PK: `relationship_id` (text). Relationship-level view: counterparty_ids/names (text[]), primary_banker_id, relationship_type/state/status, total_exposure.

### `risk_event`
PK: `risk_event_id` (text). Risk event tracking: event_type, severity_level, detection_date, financial_impact, regulatory_impact, resolution.

### `reporting_schedule`
PK: `reporting_schedule_id` (text). Scheduled reporting obligations: frequency, next_due_date, due_dates (date[]), expected_document_types, compliance_status, last_received tracking.

### `reporting_submission`
PK: `submission_id` (text). FK: obligation_id → obligation, reviewed_by → corridor_banker. Individual submission records: submission_date/status/method, reporting_period, certification, review notes, days_early_late.

### `index_rate`
PK: `index_rate_id` (text). Reference interest rates: current_rate, current_rate_update timestamp, source.

---

## Migrated / Renamed Tables

The following tables were renamed or merged by migration `20260413_singular_naming_convention.sql` to enforce the singular-noun naming convention.

### Renamed (clean alter)

| Old name (plural) | New name (singular) |
|---|---|
| `attachments` | `attachment` |
| `contract_extraction_passes` | `contract_extraction_pass` |
| `counterparties` | `counterparty` |
| `deal_documents` | `deal_document` |
| `document_chunks` | `document_chunk` |
| `documents` | `document` |
| `emails` | `email` |
| `linked_document_chunks` | `linked_document_chunk` |
| `prompt_configs` | `prompt_config` |
| `prospective_counterparties` | `prospective_counterparty` |

### Merged (data copied into canonical, plural dropped)

| Old name (plural) | Merged into | Notes |
|---|---|---|
| `deals` | `deal` | 2 stub rows copied; `deal_document.deal_id` FK retargeted to `deal` |
| `facilities` | `facility` | 2 stub rows copied; `deal_group_id` and `counterparty_name` columns added to `facility` to preserve data |

### Dropped

| Old name | Reason |
|---|---|
| `obligations` | Empty Foundry-era duplicate. Canonical `obligation` table is the live one (5 incoming FKs, 56 rows). |

### `deal_document`
PK: `deal_document_id` (text). FK: deal_id → deal. Columns: facility_id, document_id/name/type/status/version, is_latest_version, is_execution_ready.

### `prospective_counterparty`
PK: `prospective_counterparty_id` (text). Written by CPC stage. Pre-counterparty entities before promotion. Columns: counterparty_id, counterparty_name, relationship_status, counterparty_type, data_quality_score, mention_count, potential_duplicate, validation_status (default `'PENDING_VALIDATION'`), source_document_id.

### `prompt_config`
PK: `id` (int8). Original prompt configuration table. Columns: prompt_type (NOT NULL), active (default `true`), prompt_text (NOT NULL). Superseded by `crdr_prompt` for extraction prompts.

---

## Request Tables (Foundry-Era Extraction Framework)

These tables are from the Foundry-era document extraction framework. They do not appear to be used by the current Railway pipeline.

| Table | PK | Purpose |
|-------|-----|---------|
| `request_process` | `process_id` | Extraction process definitions |
| `request_document` | `request_document_id` | Documents for extraction |
| `request_document_job` | `document_job_id` | Document processing jobs |
| `request_field_definition` | `field_definition_id` | Field schemas for extraction |
| `request_field_extraction_job` | `field_extraction_job_id` | Individual field extraction results |
| `request_field_option` | `field_option_id` | Enumerated options for fields |
| `request_identity` | `entity_id` | Entity/term identity definitions |

---

## Reference / Configuration Tables

### `crdr_prompt`
PK: `prompt_id` (text). Extraction and assessment prompts. Columns: prompt_name, prompt_type, prompt_text, entity_categories (text[]), version (numeric), active (bool), created (date).

### `projection_profile`
See Projection System Tables section above.

---

## Storage Buckets

| Bucket | Public | Created | Size Limit | Allowed Types |
|--------|--------|---------|------------|---------------|
| `attachments` | No | 2026-03-12 | None | Any |
| `pdf-documents` | No | 2026-03-12 | None | Any |
| `raw-emails` | No | 2026-03-12 | None | Any |

- **raw-emails**: Source email files (`.eml`). Intake pipeline scans this bucket for new files.
- **attachments**: Email attachment binaries extracted by A1 stage.
- **pdf-documents**: Extracted/converted PDF documents created by A3 stage.

---

## Dispatch Status Columns Summary

### Dual-Trigger Model

The pipeline runs end-to-end without human gates. All three staging table
dispatch columns default to `'PENDING'` at the database level, enabling
auto-fire when Railway creates new rows. Next.js validate routes reset
the status back to `'PENDING'` when the user corrects extraction results,
causing Railway to re-process with corrected data.

| Table | Status Column | Default | Initial Trigger (auto-fire) | Re-trigger (user correction) | Railway Stage | Companion Columns |
|-------|--------------|---------|---------------------------|------------------------------|---------------|-------------------|
| `workflow_for_validation` | `extraction_status` | `'PENDING'` | DB default on row creation by A4 | Inbox edit (content_flags change) | TE/FE/PFE → ECV/ESV/EPF (based on `document_content_flags`) | `completed_at`, `error_details` |
| `contract_for_validation` | `obligation_extraction_status` | `'PENDING'` | DB default on row creation by ECV | Next.js contract validate route | EO → EOTSV | `completed_at`, `error_details` |
| `financial_statement_for_validation` | `profile_assignment_status` | `'PENDING'` | DB default on row creation by ESV | Next.js statement validate route | APP | `completed_at`, `error_details` |
| `counterparty_profile_assignment` | `projection_status` | `NULL` | APP sets explicitly after profile assignment | — | GCP | `projection_error`, `projection_completed_at` |

**Status lifecycle:** `NULL → PENDING → IN_PROGRESS → COMPLETE | ERROR`

**Notes:**
- The first three status columns default to `'PENDING'` — newly created staging rows are immediately eligible for dispatch. This is the auto-fire mechanism that lets the pipeline run end-to-end from email to projections with no human gates.
- `counterparty_profile_assignment.projection_status` defaults to `NULL` — APP sets it to `PENDING` explicitly after successful profile assignment.
- `counterparty_profile_assignment` has two sets of companion columns: generic `completed_at`/`error_details` (for APP stage tracking) and `projection_completed_at`/`projection_error` (for GCP stage tracking).
- Validate routes reset status to `'PENDING'` as a re-trigger for corrected data. The idempotency guards (Guard A, Guard B in RAILWAY_SERVICE.md) protect validated data from being overwritten when re-processing occurs.

**Anomalies observed:**
- `contract.obligation_extraction_status` exists on the canonical table. Dispatch is only on `contract_for_validation`. This column is vestigial — candidate for removal.
- `financial_statement.profile_assignment_status` exists on the canonical table. Same — dispatch is only on `financial_statement_for_validation`. Vestigial, candidate for removal.

---

## Column Inventory

Full column listings are in the sections above. For tables with many columns, summary patterns are used (e.g., the `counterparty_projection` wide-format column pattern). For the complete column-level CSV, see the raw introspection data used to generate this document.

### Table Sizes (column counts)

| Table | Columns |
|-------|---------|
| counterparty_projection | ~340 |
| crdr_assessment_finding | ~130 |
| projection_profile | ~105 |
| kyc_due_diligence | ~65 |
| counterparty_profile_assignment | ~50 |
| pro_forma_financial_statement | ~50 |
| financial_statement | ~50 |
| financial_statement_for_validation | ~45 |
| obligation | ~38 |
| policy_dimension_* (×5) | ~40 each |
| obligation_for_validation | ~35 |
| enriched_workflow | ~35 |
| workflow_for_validation | ~35 |
| counterparty | ~30 |
| All others | <30 |

### RLS Status

**No tables have RLS enabled.** The SQL migration files include commented-out `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` statements but these have not been applied. All access control is currently handled at the application layer via Supabase Auth + service role key.
