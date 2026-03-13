-- ============================================================
-- Migration: Consolidate ontology-derived tables with pipeline tables
-- Date: 2026-03-12
--
-- The Foundry ontology migration created tables (email, document,
-- counterparty) that duplicate tables the Railway pipeline actually
-- populates (emails, documents, counterparties). The ontology tables
-- are empty; the pipeline tables hold live data.
--
-- This migration:
--   1. Drops FK constraints referencing the empty ontology tables
--   2. Drops the empty ontology tables (CASCADE handles any stragglers)
--   3. Adds useful ontology-only columns to the pipeline tables
--   4. Recreates FK constraints so ontology-derived tables reference
--      the pipeline tables by their current names
-- ============================================================

BEGIN;

-- ============================================================
-- STEP 1: Drop FK constraints referencing the empty ontology tables
-- ============================================================

-- FKs ON the ontology tables themselves
ALTER TABLE document DROP CONSTRAINT IF EXISTS fk_document_email_id;
ALTER TABLE document DROP CONSTRAINT IF EXISTS fk_document_workflow_id;
ALTER TABLE document DROP CONSTRAINT IF EXISTS fk_document_deal_id;
ALTER TABLE counterparty DROP CONSTRAINT IF EXISTS fk_counterparty_primary_banker_id;
ALTER TABLE counterparty DROP CONSTRAINT IF EXISTS fk_counterparty_parent_company_id;

-- FKs referencing ontology "email"
ALTER TABLE workflow DROP CONSTRAINT IF EXISTS fk_workflow_source_email_id;

-- FKs referencing ontology "counterparty"
ALTER TABLE workflow DROP CONSTRAINT IF EXISTS fk_workflow_counterparty_id;
ALTER TABLE deal DROP CONSTRAINT IF EXISTS fk_deal_counterparty_id;
ALTER TABLE contract DROP CONSTRAINT IF EXISTS fk_contract_counterparty_id;
ALTER TABLE obligation DROP CONSTRAINT IF EXISTS fk_obligation_counterparty_id;
ALTER TABLE financial_statement DROP CONSTRAINT IF EXISTS fk_financial_statement_counterparty_id;
ALTER TABLE counterparty_projection DROP CONSTRAINT IF EXISTS fk_counterparty_projection_counterparty_id;
ALTER TABLE counterparty_risk DROP CONSTRAINT IF EXISTS fk_counterparty_risk_counterparty_id;
ALTER TABLE counterparty_profile_assignment DROP CONSTRAINT IF EXISTS fk_counterparty_profile_assignment_counterparty_id;
ALTER TABLE collateral DROP CONSTRAINT IF EXISTS fk_collateral_counterparty_id;
ALTER TABLE kyc_due_diligence DROP CONSTRAINT IF EXISTS fk_kyc_due_diligence_counterparty_id;
ALTER TABLE alert DROP CONSTRAINT IF EXISTS fk_alert_source_counterparty_id;
ALTER TABLE pro_forma_financial_statement DROP CONSTRAINT IF EXISTS fk_pro_forma_financial_statement_counterparty_id;
ALTER TABLE crdr_assessment_finding DROP CONSTRAINT IF EXISTS fk_crdr_assessment_finding_counterparty_id;
ALTER TABLE facility DROP CONSTRAINT IF EXISTS fk_facility_counterparty_id;
ALTER TABLE obligation_term_structure DROP CONSTRAINT IF EXISTS fk_obligation_term_structure_counterparty_id;
ALTER TABLE projection_profile_performance DROP CONSTRAINT IF EXISTS fk_projection_profile_performance_counterparty_id;

-- FKs referencing ontology "document"
ALTER TABLE term DROP CONSTRAINT IF EXISTS fk_term_source_document_id;
ALTER TABLE contract DROP CONSTRAINT IF EXISTS fk_contract_source_document_id;
ALTER TABLE collateral DROP CONSTRAINT IF EXISTS fk_collateral_source_document_id;
ALTER TABLE covenant_test_result DROP CONSTRAINT IF EXISTS fk_covenant_test_result_source_document_id;
ALTER TABLE financial_statement DROP CONSTRAINT IF EXISTS fk_financial_statement_source_document_id;
ALTER TABLE financial_statement DROP CONSTRAINT IF EXISTS fk_financial_statement_document_id;
ALTER TABLE alert DROP CONSTRAINT IF EXISTS fk_alert_related_document_id;
ALTER TABLE pro_forma_financial_statement DROP CONSTRAINT IF EXISTS fk_pro_forma_financial_statement_source_document_id;
ALTER TABLE pro_forma_financial_statement DROP CONSTRAINT IF EXISTS fk_pro_forma_financial_statement_document_id;
ALTER TABLE reporting_submission DROP CONSTRAINT IF EXISTS fk_reporting_submission_submitted_document_ids;

-- Drop triggers on ontology tables
DROP TRIGGER IF EXISTS set_email_updated_at ON email;
DROP TRIGGER IF EXISTS set_document_updated_at ON document;
DROP TRIGGER IF EXISTS set_counterparty_updated_at ON counterparty;

-- ============================================================
-- STEP 2: Drop the empty ontology tables
-- ============================================================

DROP TABLE IF EXISTS document CASCADE;
DROP TABLE IF EXISTS email CASCADE;
DROP TABLE IF EXISTS counterparty CASCADE;

-- ============================================================
-- STEP 3: Add useful ontology columns to pipeline tables
-- ============================================================

-- emails: add created_at / updated_at tracking
ALTER TABLE emails ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE emails ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- documents: add deal linkage column from ontology schema
ALTER TABLE documents ADD COLUMN IF NOT EXISTS deal_id TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE documents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- counterparties: add ontology columns for analytics and projections
ALTER TABLE counterparties ADD COLUMN IF NOT EXISTS is_user_override BOOLEAN;
ALTER TABLE counterparties ADD COLUMN IF NOT EXISTS profile_confirmed_by_id TEXT;
ALTER TABLE counterparties ADD COLUMN IF NOT EXISTS projection_profile_id TEXT;
ALTER TABLE counterparties ADD COLUMN IF NOT EXISTS source_prospective_counterparty_id TEXT;
ALTER TABLE counterparties ADD COLUMN IF NOT EXISTS total_exposure NUMERIC;
ALTER TABLE counterparties ADD COLUMN IF NOT EXISTS primary_banker_id TEXT;
ALTER TABLE counterparties ADD COLUMN IF NOT EXISTS assigned_team TEXT[];
ALTER TABLE counterparties ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE counterparties ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- ============================================================
-- STEP 4: Add updated_at triggers on pipeline tables
-- ============================================================

CREATE TRIGGER set_emails_updated_at
  BEFORE UPDATE ON emails
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_counterparties_updated_at
  BEFORE UPDATE ON counterparties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- STEP 5: Recreate FK constraints → pipeline tables
-- ============================================================

-- === FKs referencing emails ===

ALTER TABLE workflow
  ADD CONSTRAINT fk_workflow_source_email_id
  FOREIGN KEY (source_email_id) REFERENCES emails(email_id);

ALTER TABLE workflow_for_validation
  ADD CONSTRAINT fk_wfv_source_email_id
  FOREIGN KEY (source_email_id) REFERENCES emails(email_id);

-- === FKs referencing counterparties ===

ALTER TABLE workflow
  ADD CONSTRAINT fk_workflow_counterparty_id
  FOREIGN KEY (counterparty_id) REFERENCES counterparties(counterparty_id);

ALTER TABLE deal
  ADD CONSTRAINT fk_deal_counterparty_id
  FOREIGN KEY (counterparty_id) REFERENCES counterparties(counterparty_id);

ALTER TABLE contract
  ADD CONSTRAINT fk_contract_counterparty_id
  FOREIGN KEY (counterparty_id) REFERENCES counterparties(counterparty_id);

ALTER TABLE obligation
  ADD CONSTRAINT fk_obligation_counterparty_id
  FOREIGN KEY (counterparty_id) REFERENCES counterparties(counterparty_id);

ALTER TABLE financial_statement
  ADD CONSTRAINT fk_financial_statement_counterparty_id
  FOREIGN KEY (counterparty_id) REFERENCES counterparties(counterparty_id);

ALTER TABLE counterparty_projection
  ADD CONSTRAINT fk_counterparty_projection_counterparty_id
  FOREIGN KEY (counterparty_id) REFERENCES counterparties(counterparty_id);

ALTER TABLE counterparty_risk
  ADD CONSTRAINT fk_counterparty_risk_counterparty_id
  FOREIGN KEY (counterparty_id) REFERENCES counterparties(counterparty_id);

ALTER TABLE counterparty_profile_assignment
  ADD CONSTRAINT fk_counterparty_profile_assignment_counterparty_id
  FOREIGN KEY (counterparty_id) REFERENCES counterparties(counterparty_id);

ALTER TABLE collateral
  ADD CONSTRAINT fk_collateral_counterparty_id
  FOREIGN KEY (counterparty_id) REFERENCES counterparties(counterparty_id);

ALTER TABLE kyc_due_diligence
  ADD CONSTRAINT fk_kyc_due_diligence_counterparty_id
  FOREIGN KEY (counterparty_id) REFERENCES counterparties(counterparty_id);

ALTER TABLE alert
  ADD CONSTRAINT fk_alert_source_counterparty_id
  FOREIGN KEY (source_counterparty_id) REFERENCES counterparties(counterparty_id);

ALTER TABLE pro_forma_financial_statement
  ADD CONSTRAINT fk_pro_forma_financial_statement_counterparty_id
  FOREIGN KEY (counterparty_id) REFERENCES counterparties(counterparty_id);

ALTER TABLE crdr_assessment_finding
  ADD CONSTRAINT fk_crdr_assessment_finding_counterparty_id
  FOREIGN KEY (counterparty_id) REFERENCES counterparties(counterparty_id);

ALTER TABLE facility
  ADD CONSTRAINT fk_facility_counterparty_id
  FOREIGN KEY (counterparty_id) REFERENCES counterparties(counterparty_id);

ALTER TABLE obligation_term_structure
  ADD CONSTRAINT fk_obligation_term_structure_counterparty_id
  FOREIGN KEY (counterparty_id) REFERENCES counterparties(counterparty_id);

ALTER TABLE projection_profile_performance
  ADD CONSTRAINT fk_projection_profile_performance_counterparty_id
  FOREIGN KEY (counterparty_id) REFERENCES counterparties(counterparty_id);

-- counterparties self-reference (parent company)
ALTER TABLE counterparties
  ADD CONSTRAINT fk_counterparties_parent_company_id
  FOREIGN KEY (parent_company_id) REFERENCES counterparties(counterparty_id);

-- counterparties → corridor_banker
ALTER TABLE counterparties
  ADD CONSTRAINT fk_counterparties_primary_banker_id
  FOREIGN KEY (primary_banker_id) REFERENCES corridor_banker(banker_id);

-- workflow_for_validation → counterparties
ALTER TABLE workflow_for_validation
  ADD CONSTRAINT fk_wfv_counterparty_id
  FOREIGN KEY (counterparty_id) REFERENCES counterparties(counterparty_id);

-- === FKs referencing documents ===

ALTER TABLE documents
  ADD CONSTRAINT fk_documents_email_id
  FOREIGN KEY (email_id) REFERENCES emails(email_id);

ALTER TABLE documents
  ADD CONSTRAINT fk_documents_deal_id
  FOREIGN KEY (deal_id) REFERENCES deal(deal_id);

ALTER TABLE documents
  ADD CONSTRAINT fk_documents_workflow_id
  FOREIGN KEY (workflow_id) REFERENCES workflow(workflow_id);

ALTER TABLE documents
  ADD CONSTRAINT fk_documents_workflow_for_validation_id
  FOREIGN KEY (workflow_for_validation_id) REFERENCES workflow_for_validation(workflow_for_validation_id);

ALTER TABLE term
  ADD CONSTRAINT fk_term_source_document_id
  FOREIGN KEY (source_document_id) REFERENCES documents(document_id);

ALTER TABLE contract
  ADD CONSTRAINT fk_contract_source_document_id
  FOREIGN KEY (source_document_id) REFERENCES documents(document_id);

ALTER TABLE collateral
  ADD CONSTRAINT fk_collateral_source_document_id
  FOREIGN KEY (source_document_id) REFERENCES documents(document_id);

ALTER TABLE covenant_test_result
  ADD CONSTRAINT fk_covenant_test_result_source_document_id
  FOREIGN KEY (source_document_id) REFERENCES documents(document_id);

ALTER TABLE financial_statement
  ADD CONSTRAINT fk_financial_statement_source_document_id
  FOREIGN KEY (source_document_id) REFERENCES documents(document_id);

ALTER TABLE financial_statement
  ADD CONSTRAINT fk_financial_statement_document_id
  FOREIGN KEY (document_id) REFERENCES documents(document_id);

ALTER TABLE alert
  ADD CONSTRAINT fk_alert_related_document_id
  FOREIGN KEY (related_document_id) REFERENCES documents(document_id);

ALTER TABLE pro_forma_financial_statement
  ADD CONSTRAINT fk_pro_forma_financial_statement_source_document_id
  FOREIGN KEY (source_document_id) REFERENCES documents(document_id);

ALTER TABLE pro_forma_financial_statement
  ADD CONSTRAINT fk_pro_forma_financial_statement_document_id
  FOREIGN KEY (document_id) REFERENCES documents(document_id);

-- NOTE: reporting_submission.submitted_document_ids is TEXT[] (array),
-- so it cannot have a standard FK constraint. Skipped intentionally.

-- NOTE: relationship.counterparty_ids is TEXT[] (array),
-- so it cannot have a standard FK constraint. Skipped intentionally.

-- ============================================================
-- STEP 6: Indexes on pipeline tables
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_emails_sent_timestamp ON emails(sent_timestamp);

CREATE INDEX IF NOT EXISTS idx_documents_email_id ON documents(email_id);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_file_type ON documents(file_type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_deal_id ON documents(deal_id);
CREATE INDEX IF NOT EXISTS idx_documents_wfv_id ON documents(workflow_for_validation_id);

CREATE INDEX IF NOT EXISTS idx_counterparties_counterparty_type ON counterparties(counterparty_type);
CREATE INDEX IF NOT EXISTS idx_counterparties_status ON counterparties(status);
CREATE INDEX IF NOT EXISTS idx_counterparties_relationship_status ON counterparties(relationship_status);
CREATE INDEX IF NOT EXISTS idx_counterparties_kyc_status ON counterparties(kyc_status);
CREATE INDEX IF NOT EXISTS idx_counterparties_risk_rating ON counterparties(risk_rating);
CREATE INDEX IF NOT EXISTS idx_counterparties_watchlist_status ON counterparties(watchlist_status);
CREATE INDEX IF NOT EXISTS idx_counterparties_parent_company_id ON counterparties(parent_company_id);

CREATE INDEX IF NOT EXISTS idx_wfv_source_email_id ON workflow_for_validation(source_email_id);
CREATE INDEX IF NOT EXISTS idx_wfv_counterparty_id ON workflow_for_validation(counterparty_id);
CREATE INDEX IF NOT EXISTS idx_wfv_workflow_stage ON workflow_for_validation(workflow_stage);
CREATE INDEX IF NOT EXISTS idx_wfv_workflow_status ON workflow_for_validation(workflow_status);

COMMIT;
