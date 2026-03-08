-- Corridor Credit: Inbox Workflow Schema
-- Run this against your Supabase project to create the tables.

-- Enum types
create type workflow_status as enum (
  'pending_review',
  'in_review',
  'approved',
  'rejected',
  'needs_info'
);

create type document_type as enum (
  'invoice',
  'credit_application',
  'financial_statement',
  'purchase_order',
  'contract',
  'tax_return',
  'bank_statement',
  'other'
);

create type content_classification as enum (
  'accounts_receivable',
  'accounts_payable',
  'credit_request',
  'financial_report',
  'legal_agreement',
  'tax_filing',
  'banking',
  'other'
);

create type priority as enum ('low', 'medium', 'high', 'urgent');

-- Counterparties: companies or individuals that submit documents
create table counterparties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  entity_type text not null check (entity_type in ('company', 'individual')),
  industry text,
  credit_rating text,
  contact_email text,
  phone text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Documents: files received from counterparties
create table documents (
  id uuid primary key default gen_random_uuid(),
  counterparty_id uuid not null references counterparties(id) on delete cascade,
  file_name text not null,
  document_type document_type not null,
  content_classification content_classification not null,
  summary text,
  received_at timestamptz not null default now(),
  source text,
  created_at timestamptz not null default now()
);

-- Inbox items: workflow tracking for each document
create table inbox_items (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  counterparty_id uuid not null references counterparties(id) on delete cascade,
  workflow_status workflow_status not null default 'pending_review',
  priority priority not null default 'medium',
  assigned_to text,
  notes text,
  reviewed_at timestamptz,
  reviewed_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for common queries
create index idx_documents_counterparty on documents(counterparty_id);
create index idx_inbox_items_status on inbox_items(workflow_status);
create index idx_inbox_items_priority on inbox_items(priority);
create index idx_inbox_items_document on inbox_items(document_id);
create index idx_inbox_items_counterparty on inbox_items(counterparty_id);

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger counterparties_updated_at
  before update on counterparties
  for each row execute function update_updated_at();

create trigger inbox_items_updated_at
  before update on inbox_items
  for each row execute function update_updated_at();
