-- Add columns that Railway expects to write but are missing from tables.
-- These cause PGRST204 errors ("column not found in schema cache").
--
-- Railway's _set_status helper writes completed_at and error_details on
-- every status transition, so every table Railway dispatches against needs
-- both columns.

-- ═══════════════════════════════════════════════════════════════════════
-- contract_for_validation — Obligation dispatch (EO / EOTSV)
-- ═══════════════════════════════════════════════════════════════════════
ALTER TABLE contract_for_validation
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- ═══════════════════════════════════════════════════════════════════════
-- workflow_for_validation — Extraction dispatch (TE / FE / PFE)
-- Without completed_at, extraction never marks COMPLETE → stays PENDING
-- → re-dispatches every cycle → ECV re-runs → overwrites validated data.
-- ═══════════════════════════════════════════════════════════════════════
ALTER TABLE workflow_for_validation
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

ALTER TABLE workflow_for_validation
  ADD COLUMN IF NOT EXISTS error_details TEXT;

-- ═══════════════════════════════════════════════════════════════════════
-- financial_statement_for_validation — Profile assignment dispatch (APP)
-- ═══════════════════════════════════════════════════════════════════════
ALTER TABLE financial_statement_for_validation
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- ═══════════════════════════════════════════════════════════════════════
-- enriched_workflow — A5 Deal Orchestrator writes error_details on failure.
-- Without it, the entire intake pipeline fails every polling cycle.
-- ═══════════════════════════════════════════════════════════════════════
ALTER TABLE enriched_workflow
  ADD COLUMN IF NOT EXISTS error_details TEXT;

ALTER TABLE enriched_workflow
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- ═══════════════════════════════════════════════════════════════════════
-- counterparty_profile_assignment — APP stage + projection dispatch
--
-- Railway's _join_profile_metadata copies 7 fields from projection_profile
-- into the assignment row. The original schema.sql didn't include these.
-- Also needs _set_status columns and projection_status for GCP dispatch.
--
-- Source: Railway pipeline/assign_projection_profile.py _join_profile_metadata()
-- ═══════════════════════════════════════════════════════════════════════

-- Profile metadata (7 columns from _join_profile_metadata)
ALTER TABLE counterparty_profile_assignment
  ADD COLUMN IF NOT EXISTS profile_capex_intensity NUMERIC;

ALTER TABLE counterparty_profile_assignment
  ADD COLUMN IF NOT EXISTS profile_description TEXT;

ALTER TABLE counterparty_profile_assignment
  ADD COLUMN IF NOT EXISTS profile_display_name TEXT;

ALTER TABLE counterparty_profile_assignment
  ADD COLUMN IF NOT EXISTS profile_key_assumptions TEXT;

ALTER TABLE counterparty_profile_assignment
  ADD COLUMN IF NOT EXISTS profile_typical_industries TEXT;

ALTER TABLE counterparty_profile_assignment
  ADD COLUMN IF NOT EXISTS profile_revenue_growth_assumption TEXT;

ALTER TABLE counterparty_profile_assignment
  ADD COLUMN IF NOT EXISTS profile_margin_assumption TEXT;

-- _set_status helper columns
ALTER TABLE counterparty_profile_assignment
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

ALTER TABLE counterparty_profile_assignment
  ADD COLUMN IF NOT EXISTS error_details TEXT;

-- GCP dispatch column
ALTER TABLE counterparty_profile_assignment
  ADD COLUMN IF NOT EXISTS projection_status TEXT;
