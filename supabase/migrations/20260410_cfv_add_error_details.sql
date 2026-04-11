-- Fix: contract_for_validation is missing the error_details column that
-- Railway's _set_status helper writes on every status transition.
--
-- Migration 20260328_add_missing_pipeline_columns.sql added completed_at
-- but omitted error_details.  Without it, every Railway dispatch against
-- this table fails with PGRST204 ("column not found in schema cache"),
-- blocking the entire obligation term structure pipeline (EO / EOTSV).

ALTER TABLE contract_for_validation
  ADD COLUMN IF NOT EXISTS error_details TEXT;
