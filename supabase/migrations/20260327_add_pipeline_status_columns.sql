-- Add pipeline status columns needed by the validation promote endpoints.
-- These columns signal to the Railway pipeline that downstream work is pending.

-- contract.obligation_extraction_status — tracks whether obligations have been
-- extracted from validated contract terms (used by /api/contract-analysis/validate)
ALTER TABLE contract ADD COLUMN IF NOT EXISTS obligation_extraction_status TEXT;

-- financial_statement.profile_assignment_status — tracks whether a projection
-- profile has been assigned (used by /api/statement-analysis/validate)
ALTER TABLE financial_statement ADD COLUMN IF NOT EXISTS profile_assignment_status TEXT;
