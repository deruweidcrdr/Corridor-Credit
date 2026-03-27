-- Add soft-delete archive flag to the emails table so archived emails
-- can be filtered from the inbox list.
ALTER TABLE emails ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_emails_is_archived ON emails(is_archived);
