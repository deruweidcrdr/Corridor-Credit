-- Organization and User Profile tables for Corridor Credit
-- Run in the Supabase SQL editor

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  org_type TEXT CHECK (org_type IN ('CORRIDOR_FUND', 'BANK_PARTNER')),
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  org_id UUID REFERENCES organizations(id),
  role TEXT CHECK (role IN (
    'FUND_MANAGER', 'ANALYST', 'COMPLIANCE_OFFICER',
    'BANK_ADMIN', 'BANK_CREDIT_OFFICER', 'BANK_ANALYST',
    'BANK_VIEWER', 'SUPER_ADMIN'
  )),
  is_corridor_staff BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed: Create the Corridor Credit organization
INSERT INTO organizations (name, org_type)
VALUES ('Corridor Credit', 'CORRIDOR_FUND')
ON CONFLICT DO NOTHING;

-- To link an existing auth user, run:
-- INSERT INTO user_profiles (id, email, full_name, org_id, role, is_corridor_staff)
-- SELECT
--   '<auth-user-uuid>',
--   'elliott@corridor.credit',
--   'Elliott',
--   o.id,
--   'FUND_MANAGER',
--   true
-- FROM organizations o WHERE o.name = 'Corridor Credit';
