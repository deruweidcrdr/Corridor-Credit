-- Add pipeline columns to existing financial_statement_for_validation table.
-- The table already exists with metric and reference columns.
-- This migration adds validation workflow tracking columns.

ALTER TABLE financial_statement_for_validation
  ADD COLUMN IF NOT EXISTS validation_status TEXT DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS is_user_override BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS user_edited_columns TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS override_justification TEXT,
  ADD COLUMN IF NOT EXISTS deal_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
