-- Add triage columns to workflow_for_validation
-- is_archived: soft-delete flag (excluded from inbox + downstream queries)
-- reviewed_at / reviewed_by: audit trail for "mark reviewed" action

ALTER TABLE workflow_for_validation
  ADD COLUMN IF NOT EXISTS is_archived    BOOLEAN      DEFAULT false,
  ADD COLUMN IF NOT EXISTS reviewed_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by    TEXT;

-- Index for inbox query filtering (is_archived = false)
CREATE INDEX IF NOT EXISTS idx_wfv_is_archived
  ON workflow_for_validation (is_archived);

-- Index for unread count (is_archived = false AND reviewed_at IS NULL)
CREATE INDEX IF NOT EXISTS idx_wfv_unread
  ON workflow_for_validation (is_archived, reviewed_at)
  WHERE is_archived = false AND reviewed_at IS NULL;
