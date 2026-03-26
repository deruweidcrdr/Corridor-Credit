-- ============================================================
-- Corridor Credit: PostgreSQL Schema
-- Generated from Foundry Ontology (56 core object types)
-- ============================================================

-- Trigger function for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE alert_status AS ENUM ('new', 'acknowledged', 'in_progress', 'resolved', 'dismissed');
CREATE TYPE alert_type AS ENUM ('covenant_breach', 'payment_due', 'document_expiry', 'kyc_review', 'risk_rating_change', 'workflow_action', 'system', 'compliance');
CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'deferred', 'withdrawn');
CREATE TYPE approval_type AS ENUM ('credit', 'risk', 'compliance', 'legal', 'committee');
CREATE TYPE collateral_type AS ENUM ('real_estate', 'equipment', 'inventory', 'accounts_receivable', 'securities', 'cash', 'intellectual_property', 'other');
CREATE TYPE collateral_status AS ENUM ('active', 'released', 'pending', 'impaired');
CREATE TYPE committee_type AS ENUM ('credit', 'risk', 'compliance', 'executive', 'special');
CREATE TYPE committee_status AS ENUM ('active', 'inactive', 'dissolved');
CREATE TYPE meeting_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'postponed');
CREATE TYPE member_status AS ENUM ('active', 'inactive', 'on_leave');
CREATE TYPE contract_type AS ENUM ('credit_agreement', 'guarantee', 'security_agreement', 'intercreditor', 'amendment', 'waiver', 'other');
CREATE TYPE contract_status AS ENUM ('draft', 'pending_review', 'active', 'expired', 'terminated', 'amended');
CREATE TYPE banker_status AS ENUM ('active', 'inactive', 'on_leave', 'terminated');
CREATE TYPE counterparty_type AS ENUM ('corporate', 'individual', 'government', 'financial_institution', 'special_purpose_vehicle');
CREATE TYPE counterparty_status AS ENUM ('active', 'inactive', 'prospect', 'watchlist', 'defaulted');
CREATE TYPE relationship_status_enum AS ENUM ('active', 'inactive', 'pending', 'terminated');
CREATE TYPE risk_rating AS ENUM ('aaa', 'aa', 'a', 'bbb', 'bb', 'b', 'ccc', 'cc', 'c', 'd');
CREATE TYPE kyc_status AS ENUM ('not_started', 'in_progress', 'under_review', 'approved', 'rejected', 'expired');
CREATE TYPE deal_status AS ENUM ('prospect', 'pipeline', 'proposal', 'negotiation', 'approved', 'closed', 'declined', 'withdrawn');
CREATE TYPE deal_type AS ENUM ('new', 'renewal', 'amendment', 'refinancing', 'syndication');
CREATE TYPE document_type AS ENUM ('credit_agreement', 'financial_statement', 'tax_return', 'appraisal', 'title', 'insurance', 'legal_opinion', 'correspondence', 'internal_memo', 'other');
CREATE TYPE document_status AS ENUM ('pending', 'received', 'under_review', 'approved', 'rejected', 'expired');
CREATE TYPE workflow_status AS ENUM ('not_started', 'in_progress', 'pending_review', 'pending_approval', 'approved', 'completed', 'cancelled', 'on_hold', 'failed');
CREATE TYPE workflow_type AS ENUM ('onboarding', 'annual_review', 'credit_request', 'document_processing', 'kyc_refresh', 'covenant_monitoring', 'amendment', 'collateral_review');
CREATE TYPE obligation_type AS ENUM ('term_loan', 'revolver', 'letter_of_credit', 'guarantee', 'swap', 'other');
CREATE TYPE obligation_status AS ENUM ('active', 'paid_off', 'defaulted', 'restructured', 'cancelled');
CREATE TYPE payment_status AS ENUM ('scheduled', 'pending', 'completed', 'failed', 'reversed', 'waived');
CREATE TYPE payment_type AS ENUM ('principal', 'interest', 'fee', 'penalty', 'prepayment');
CREATE TYPE facility_type AS ENUM ('term_loan', 'revolver', 'letter_of_credit', 'bridge', 'delayed_draw');
CREATE TYPE facility_status AS ENUM ('active', 'expired', 'cancelled', 'fully_drawn');
CREATE TYPE statement_type AS ENUM ('income_statement', 'balance_sheet', 'cash_flow', 'combined');
CREATE TYPE statement_period AS ENUM ('annual', 'semi_annual', 'quarterly', 'monthly');
CREATE TYPE reporting_status AS ENUM ('not_due', 'due', 'overdue', 'received', 'waived');
CREATE TYPE submission_status AS ENUM ('pending', 'received', 'under_review', 'accepted', 'rejected');
CREATE TYPE test_result_status AS ENUM ('pass', 'fail', 'waived', 'pending');
CREATE TYPE risk_event_type AS ENUM ('downgrade', 'default', 'covenant_breach', 'material_adverse_change', 'regulatory', 'market', 'operational');
CREATE TYPE risk_event_status AS ENUM ('open', 'under_review', 'mitigated', 'closed', 'escalated');
CREATE TYPE policy_status AS ENUM ('draft', 'active', 'under_review', 'archived', 'superseded');
CREATE TYPE finding_status AS ENUM ('identified', 'in_progress', 'resolved', 'accepted', 'escalated');
CREATE TYPE finding_severity AS ENUM ('info', 'low', 'medium', 'high', 'critical');
CREATE TYPE projection_status AS ENUM ('draft', 'active', 'superseded', 'archived');
CREATE TYPE profile_status AS ENUM ('draft', 'active', 'deprecated', 'archived');
CREATE TYPE event_type AS ENUM ('created', 'updated', 'status_changed', 'assigned', 'escalated', 'completed', 'comment_added', 'document_attached');

-- ============================================================
-- TABLES
-- ============================================================

-- CorridorBanker
CREATE TABLE corridor_banker (
  access_level TEXT,
  assigned_relationships TEXT,
  banker_id TEXT PRIMARY KEY,
  cost_center TEXT,
  department TEXT,
  effective_date DATE,
  employee_id TEXT,
  full_name TEXT,
  industry_specializations TEXT,
  loan_approval_limit INTEGER,
  manager_id TEXT,
  office_location TEXT,
  permission_type TEXT,
  product_certifications TEXT,
  resource_type TEXT,
  role_id TEXT,
  role_name TEXT,
  status TEXT,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_corridor_banker_permission_type ON corridor_banker(permission_type);
CREATE INDEX idx_corridor_banker_resource_type ON corridor_banker(resource_type);
CREATE INDEX idx_corridor_banker_status ON corridor_banker(status);
CREATE INDEX idx_corridor_banker_effective_date ON corridor_banker(effective_date);

CREATE TRIGGER set_corridor_banker_updated_at
  BEFORE UPDATE ON corridor_banker
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Counterparty
CREATE TABLE counterparty (
  assigned_team TEXT[],
  business_type TEXT,
  counterparty_id TEXT PRIMARY KEY,
  counterparty_name TEXT,
  counterparty_type TEXT,
  country_of_domicile TEXT,
  credit_score INTEGER,
  incorporation_date DATE,
  industry_code INTEGER,
  is_parent_company BOOLEAN,
  is_user_override BOOLEAN,
  kyc_status TEXT,
  last_review_date DATE,
  maturity_category TEXT,
  model_id TEXT,
  next_review_date DATE,
  notes TEXT,
  onboarding_date DATE,
  parent_company_id TEXT,
  primary_banker_id TEXT,
  profile_confirmed_by_id TEXT,
  projection_profile_id TEXT,
  registration_number TEXT,
  relationship_status TEXT,
  risk_rating TEXT,
  size_category TEXT,
  source_document_id TEXT,
  source_prospective_counterparty_id TEXT,
  source_workflow_id TEXT,
  status TEXT,
  tax_id TEXT,
  total_exposure NUMERIC,
  watchlist_status BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE counterparty
  ADD CONSTRAINT fk_counterparty_primary_banker_id
  FOREIGN KEY (primary_banker_id) REFERENCES corridor_banker(banker_id);

ALTER TABLE counterparty
  ADD CONSTRAINT fk_counterparty_parent_company_id
  FOREIGN KEY (parent_company_id) REFERENCES counterparty(counterparty_id);

CREATE INDEX idx_counterparty_primary_banker_id ON counterparty(primary_banker_id);
CREATE INDEX idx_counterparty_parent_company_id ON counterparty(parent_company_id);
CREATE INDEX idx_counterparty_business_type ON counterparty(business_type);
CREATE INDEX idx_counterparty_counterparty_type ON counterparty(counterparty_type);
CREATE INDEX idx_counterparty_kyc_status ON counterparty(kyc_status);
CREATE INDEX idx_counterparty_relationship_status ON counterparty(relationship_status);
CREATE INDEX idx_counterparty_status ON counterparty(status);
CREATE INDEX idx_counterparty_watchlist_status ON counterparty(watchlist_status);

CREATE TRIGGER set_counterparty_updated_at
  BEFORE UPDATE ON counterparty
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Email
CREATE TABLE email (
  bcc TEXT[],
  body_html TEXT,
  body_plain TEXT,
  cc TEXT[],
  email_id TEXT PRIMARY KEY,
  file_name TEXT,
  "from" TEXT,
  sent_timestamp TIMESTAMPTZ,
  subject TEXT,
  "to" TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TRIGGER set_email_updated_at
  BEFORE UPDATE ON email
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Deal
CREATE TABLE deal (
  approval_stage TEXT,
  banker_id TEXT,
  counterparty_id TEXT,
  counterparty_name TEXT,
  created_date TIMESTAMPTZ,
  deal_group_id TEXT,
  deal_id TEXT PRIMARY KEY,
  deal_initiated_date TIMESTAMPTZ,
  deal_name TEXT,
  deal_status TEXT,
  document_ids TEXT[],
  draft_documents BIGINT,
  executed_documents BIGINT,
  execution_status TEXT,
  facility_ids TEXT[],
  final_documents BIGINT,
  last_updated_date TIMESTAMPTZ,
  total_documents BIGINT,
  total_facilities BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE deal
  ADD CONSTRAINT fk_deal_counterparty_id
  FOREIGN KEY (counterparty_id) REFERENCES counterparty(counterparty_id);

ALTER TABLE deal
  ADD CONSTRAINT fk_deal_banker_id
  FOREIGN KEY (banker_id) REFERENCES corridor_banker(banker_id);

CREATE INDEX idx_deal_counterparty_id ON deal(counterparty_id);
CREATE INDEX idx_deal_banker_id ON deal(banker_id);
CREATE INDEX idx_deal_deal_status ON deal(deal_status);
CREATE INDEX idx_deal_execution_status ON deal(execution_status);
CREATE INDEX idx_deal_created_date ON deal(created_date);

CREATE TRIGGER set_deal_updated_at
  BEFORE UPDATE ON deal
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Contract
CREATE TABLE contract (
  contract_id TEXT PRIMARY KEY,
  contract_status TEXT,
  contract_subtype TEXT,
  contract_title TEXT,
  contract_type TEXT,
  counterparty_id TEXT,
  currency TEXT,
  deal_id TEXT,
  effective_date DATE,
  maturity_date DATE,
  origination_date DATE,
  source_contract_for_validation_id TEXT,
  source_document_id TEXT,
  workflow_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE contract
  ADD CONSTRAINT fk_contract_counterparty_id
  FOREIGN KEY (counterparty_id) REFERENCES counterparty(counterparty_id);

ALTER TABLE contract
  ADD CONSTRAINT fk_contract_source_document_id
  FOREIGN KEY (source_document_id) REFERENCES document(document_id);

ALTER TABLE contract
  ADD CONSTRAINT fk_contract_workflow_id
  FOREIGN KEY (workflow_id) REFERENCES workflow(workflow_id);

ALTER TABLE contract
  ADD CONSTRAINT fk_contract_deal_id
  FOREIGN KEY (deal_id) REFERENCES deal(deal_id);

CREATE INDEX idx_contract_counterparty_id ON contract(counterparty_id);
CREATE INDEX idx_contract_source_document_id ON contract(source_document_id);
CREATE INDEX idx_contract_workflow_id ON contract(workflow_id);
CREATE INDEX idx_contract_deal_id ON contract(deal_id);
CREATE INDEX idx_contract_contract_status ON contract(contract_status);
CREATE INDEX idx_contract_contract_type ON contract(contract_type);
CREATE INDEX idx_contract_effective_date ON contract(effective_date);
CREATE INDEX idx_contract_maturity_date ON contract(maturity_date);

CREATE TRIGGER set_contract_updated_at
  BEFORE UPDATE ON contract
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Term
CREATE TABLE term (
  contract_id TEXT,
  extraction_confidence NUMERIC,
  is_key_term BOOLEAN,
  source_document_id TEXT,
  source_term_for_validation_id TEXT,
  term_description TEXT,
  term_id TEXT PRIMARY KEY,
  term_identity_id TEXT,
  term_name TEXT,
  term_unit TEXT,
  term_value TEXT,
  validation_status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE term
  ADD CONSTRAINT fk_term_source_document_id
  FOREIGN KEY (source_document_id) REFERENCES document(document_id);

ALTER TABLE term
  ADD CONSTRAINT fk_term_contract_id
  FOREIGN KEY (contract_id) REFERENCES contract(contract_id);

CREATE INDEX idx_term_source_document_id ON term(source_document_id);
CREATE INDEX idx_term_contract_id ON term(contract_id);
CREATE INDEX idx_term_validation_status ON term(validation_status);

CREATE TRIGGER set_term_updated_at
  BEFORE UPDATE ON term
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Obligation
CREATE TABLE obligation (
  certification_requirements TEXT,
  contract_id TEXT,
  counterparty_id TEXT,
  covenant_logic_id TEXT,
  creation_date DATE,
  delivery_method TEXT,
  due_days_offset INTEGER,
  due_timing_anchor TEXT,
  due_timing_description TEXT,
  expected_document_types TEXT[],
  frequency TEXT,
  grace_period_days INTEGER,
  is_key_obligation BOOLEAN,
  last_met_date DATE,
  last_met_document_ids TEXT[],
  materiality_threshold NUMERIC,
  measurement_metric TEXT,
  next_due_date DATE,
  obligation_description TEXT,
  obligation_id TEXT PRIMARY KEY,
  obligation_name TEXT,
  obligation_subtype TEXT,
  obligation_type TEXT,
  overdue_alert_sent BOOLEAN,
  recipient_email TEXT,
  reporting_category TEXT,
  reporting_period_type TEXT,
  required_certifications TEXT[],
  required_document_types TEXT[],
  source_term_id TEXT,
  status TEXT,
  submission_method TEXT,
  threshold_operator TEXT,
  threshold_unit TEXT,
  threshold_value NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE obligation
  ADD CONSTRAINT fk_obligation_contract_id
  FOREIGN KEY (contract_id) REFERENCES contract(contract_id);

ALTER TABLE obligation
  ADD CONSTRAINT fk_obligation_counterparty_id
  FOREIGN KEY (counterparty_id) REFERENCES counterparty(counterparty_id);

ALTER TABLE obligation
  ADD CONSTRAINT fk_obligation_source_term_id
  FOREIGN KEY (source_term_id) REFERENCES term(term_id);

CREATE INDEX idx_obligation_contract_id ON obligation(contract_id);
CREATE INDEX idx_obligation_counterparty_id ON obligation(counterparty_id);
CREATE INDEX idx_obligation_source_term_id ON obligation(source_term_id);
CREATE INDEX idx_obligation_obligation_type ON obligation(obligation_type);
CREATE INDEX idx_obligation_reporting_period_type ON obligation(reporting_period_type);
CREATE INDEX idx_obligation_status ON obligation(status);
CREATE INDEX idx_obligation_next_due_date ON obligation(next_due_date);

CREATE TRIGGER set_obligation_updated_at
  BEFORE UPDATE ON obligation
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Workflow
CREATE TABLE workflow (
  assigned_to_id TEXT,
  completed_date DATE,
  counterparty_id TEXT,
  created_date DATE,
  deal_id TEXT,
  document_content_flags TEXT,
  document_type TEXT,
  initiated_by_id TEXT,
  notes TEXT,
  obligation_id TEXT,
  priority TEXT,
  requires_financial_extraction BOOLEAN,
  source_email_id TEXT,
  source_workflow_for_validation_id TEXT,
  successor_workflow_id TEXT,
  workflow_id TEXT PRIMARY KEY,
  workflow_name TEXT,
  workflow_stage TEXT,
  workflow_status TEXT,
  workflow_subtype TEXT,
  workflow_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE workflow
  ADD CONSTRAINT fk_workflow_deal_id
  FOREIGN KEY (deal_id) REFERENCES deal(deal_id);

ALTER TABLE workflow
  ADD CONSTRAINT fk_workflow_initiated_by_id
  FOREIGN KEY (initiated_by_id) REFERENCES corridor_banker(banker_id);

ALTER TABLE workflow
  ADD CONSTRAINT fk_workflow_assigned_to_id
  FOREIGN KEY (assigned_to_id) REFERENCES corridor_banker(banker_id);

ALTER TABLE workflow
  ADD CONSTRAINT fk_workflow_counterparty_id
  FOREIGN KEY (counterparty_id) REFERENCES counterparty(counterparty_id);

ALTER TABLE workflow
  ADD CONSTRAINT fk_workflow_source_email_id
  FOREIGN KEY (source_email_id) REFERENCES email(email_id);

ALTER TABLE workflow
  ADD CONSTRAINT fk_workflow_obligation_id
  FOREIGN KEY (obligation_id) REFERENCES obligation(obligation_id);

ALTER TABLE workflow
  ADD CONSTRAINT fk_workflow_successor_workflow_id
  FOREIGN KEY (successor_workflow_id) REFERENCES workflow(workflow_id);

CREATE INDEX idx_workflow_deal_id ON workflow(deal_id);
CREATE INDEX idx_workflow_initiated_by_id ON workflow(initiated_by_id);
CREATE INDEX idx_workflow_assigned_to_id ON workflow(assigned_to_id);
CREATE INDEX idx_workflow_counterparty_id ON workflow(counterparty_id);
CREATE INDEX idx_workflow_source_email_id ON workflow(source_email_id);
CREATE INDEX idx_workflow_obligation_id ON workflow(obligation_id);
CREATE INDEX idx_workflow_successor_workflow_id ON workflow(successor_workflow_id);
CREATE INDEX idx_workflow_document_type ON workflow(document_type);
CREATE INDEX idx_workflow_workflow_status ON workflow(workflow_status);
CREATE INDEX idx_workflow_workflow_type ON workflow(workflow_type);
CREATE INDEX idx_workflow_created_date ON workflow(created_date);

CREATE TRIGGER set_workflow_updated_at
  BEFORE UPDATE ON workflow
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Document
CREATE TABLE document (
  complete_document_text TEXT,
  deal_id TEXT,
  document_id TEXT PRIMARY KEY,
  document_name TEXT,
  document_type TEXT,
  email_id TEXT,
  file_type TEXT,
  media_item_rid TEXT,
  media_reference TEXT,
  path TEXT,
  pdf_media_reference TEXT,
  status TEXT,
  timestamp TIMESTAMPTZ,
  workflow_for_validation_id TEXT,
  workflow_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE document
  ADD CONSTRAINT fk_document_email_id
  FOREIGN KEY (email_id) REFERENCES email(email_id);

ALTER TABLE document
  ADD CONSTRAINT fk_document_workflow_id
  FOREIGN KEY (workflow_id) REFERENCES workflow(workflow_id);

ALTER TABLE document
  ADD CONSTRAINT fk_document_deal_id
  FOREIGN KEY (deal_id) REFERENCES deal(deal_id);

CREATE INDEX idx_document_email_id ON document(email_id);
CREATE INDEX idx_document_workflow_id ON document(workflow_id);
CREATE INDEX idx_document_deal_id ON document(deal_id);
CREATE INDEX idx_document_document_type ON document(document_type);
CREATE INDEX idx_document_file_type ON document(file_type);
CREATE INDEX idx_document_status ON document(status);

CREATE TRIGGER set_document_updated_at
  BEFORE UPDATE ON document
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- KycDueDiligence
CREATE TABLE kyc_due_diligence (
  additional_documents_required TEXT,
  adverse_media_screening_date DATE,
  adverse_media_screening_status TEXT,
  adverse_media_summary TEXT,
  analyst_notes TEXT,
  analyst_review_completed_date DATE,
  approved_by_compliance_officer_id TEXT,
  articles_of_association TEXT,
  assigned_to_analyst_id TEXT,
  assigned_to_compliance_officer_id TEXT,
  beneficial_ownership_info TEXT,
  certificate_of_incorporation TEXT,
  compliance_approval_date DATE,
  compliance_notes TEXT,
  conditional_approval_conditions TEXT,
  counterparty_id TEXT,
  created_by_banker_id TEXT,
  created_timestamp TIMESTAMPTZ,
  data_completeness_score NUMERIC,
  data_quality_issues TEXT,
  director_identification TEXT,
  document_completeness_score NUMERIC,
  escalated_to_id TEXT,
  expiry_date DATE,
  financial_statements TEXT,
  has_open_alerts BOOLEAN,
  initiated_date DATE,
  internal_risk_assessment TEXT,
  kyc_approval_status TEXT,
  kyc_due_diligence_id TEXT PRIMARY KEY,
  kyc_due_diligence_name TEXT,
  kyc_notes TEXT,
  kyc_priority TEXT,
  kyc_status TEXT,
  last_modified_by_banker_id TEXT,
  last_modified_timestamp TIMESTAMPTZ,
  last_review_date DATE,
  manager_review_completed_date DATE,
  missing_critical_fields TEXT,
  missing_required_fields TEXT,
  mitigation_measures TEXT,
  next_review_date DATE,
  overall_risk_rating TEXT,
  pep_screening_date DATE,
  pep_screening_status TEXT,
  proof_of_address TEXT,
  rejection_reason TEXT,
  requires_enhanced_due_diligence BOOLEAN,
  requires_ongoing_monitoring BOOLEAN,
  reviewed_by_manager_id TEXT,
  risk_factors_identified TEXT,
  sanctions_screening_date DATE,
  sanctions_screening_status TEXT,
  source_document_id TEXT,
  source_of_funds_documentation TEXT,
  source_prospective_counterparty_id TEXT,
  source_workflow_id TEXT,
  target_completion_date DATE,
  tax_identification_documents TEXT,
  watchlist_hits TEXT,
  watchlist_screening_date DATE,
  watchlist_screening_status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE kyc_due_diligence
  ADD CONSTRAINT fk_kyc_due_diligence_counterparty_id
  FOREIGN KEY (counterparty_id) REFERENCES counterparty(counterparty_id);

ALTER TABLE kyc_due_diligence
  ADD CONSTRAINT fk_kyc_due_diligence_source_workflow_id
  FOREIGN KEY (source_workflow_id) REFERENCES workflow(workflow_id);

CREATE INDEX idx_kyc_due_diligence_counterparty_id ON kyc_due_diligence(counterparty_id);
CREATE INDEX idx_kyc_due_diligence_source_workflow_id ON kyc_due_diligence(source_workflow_id);
CREATE INDEX idx_kyc_due_diligence_adverse_media_screening_status ON kyc_due_diligence(adverse_media_screening_status);
CREATE INDEX idx_kyc_due_diligence_kyc_approval_status ON kyc_due_diligence(kyc_approval_status);
CREATE INDEX idx_kyc_due_diligence_kyc_status ON kyc_due_diligence(kyc_status);
CREATE INDEX idx_kyc_due_diligence_pep_screening_status ON kyc_due_diligence(pep_screening_status);
CREATE INDEX idx_kyc_due_diligence_sanctions_screening_status ON kyc_due_diligence(sanctions_screening_status);
CREATE INDEX idx_kyc_due_diligence_watchlist_screening_status ON kyc_due_diligence(watchlist_screening_status);
CREATE INDEX idx_kyc_due_diligence_created_timestamp ON kyc_due_diligence(created_timestamp);

CREATE TRIGGER set_kyc_due_diligence_updated_at
  BEFORE UPDATE ON kyc_due_diligence
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Alert
CREATE TABLE alert (
  acknowledged_timestamp TIMESTAMPTZ,
  action_label TEXT,
  action_url TEXT,
  alert_body TEXT,
  alert_id TEXT PRIMARY KEY,
  alert_priority_score INTEGER,
  alert_status TEXT,
  alert_subject TEXT,
  alert_title TEXT,
  alert_type TEXT,
  auto_dismiss_on_action BOOLEAN,
  cc_banker_ids TEXT[],
  directed_to_banker_id TEXT,
  generated_by TEXT,
  generated_timestamp TIMESTAMPTZ,
  related_document_id TEXT,
  requires_action BOOLEAN,
  resolved_timestamp TIMESTAMPTZ,
  severity TEXT,
  source_counterparty_id TEXT,
  source_kyc_due_diligence_id TEXT,
  source_workflow_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE alert
  ADD CONSTRAINT fk_alert_directed_to_banker_id
  FOREIGN KEY (directed_to_banker_id) REFERENCES corridor_banker(banker_id);

ALTER TABLE alert
  ADD CONSTRAINT fk_alert_source_counterparty_id
  FOREIGN KEY (source_counterparty_id) REFERENCES counterparty(counterparty_id);

ALTER TABLE alert
  ADD CONSTRAINT fk_alert_related_document_id
  FOREIGN KEY (related_document_id) REFERENCES document(document_id);

ALTER TABLE alert
  ADD CONSTRAINT fk_alert_source_workflow_id
  FOREIGN KEY (source_workflow_id) REFERENCES workflow(workflow_id);

ALTER TABLE alert
  ADD CONSTRAINT fk_alert_source_kyc_due_diligence_id
  FOREIGN KEY (source_kyc_due_diligence_id) REFERENCES kyc_due_diligence(kyc_due_diligence_id);

CREATE INDEX idx_alert_directed_to_banker_id ON alert(directed_to_banker_id);
CREATE INDEX idx_alert_source_counterparty_id ON alert(source_counterparty_id);
CREATE INDEX idx_alert_related_document_id ON alert(related_document_id);
CREATE INDEX idx_alert_source_workflow_id ON alert(source_workflow_id);
CREATE INDEX idx_alert_source_kyc_due_diligence_id ON alert(source_kyc_due_diligence_id);
CREATE INDEX idx_alert_alert_status ON alert(alert_status);
CREATE INDEX idx_alert_alert_type ON alert(alert_type);
CREATE INDEX idx_alert_generated_timestamp ON alert(generated_timestamp);

CREATE TRIGGER set_alert_updated_at
  BEFORE UPDATE ON alert
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Committee
CREATE TABLE committee (
  authority_level TEXT,
  chairperson_banker_id TEXT,
  committee_id TEXT PRIMARY KEY,
  committee_name TEXT,
  committee_type TEXT,
  create_date DATE,
  max_approval_amount NUMERIC,
  meeting_frequency TEXT,
  meeting_location TEXT,
  notes TEXT,
  quorum_requirement INTEGER,
  secretary_banker_id TEXT,
  status TEXT,
  typical_meeting_day TEXT,
  typical_meeting_time TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE committee
  ADD CONSTRAINT fk_committee_chairperson_banker_id
  FOREIGN KEY (chairperson_banker_id) REFERENCES corridor_banker(banker_id);

ALTER TABLE committee
  ADD CONSTRAINT fk_committee_secretary_banker_id
  FOREIGN KEY (secretary_banker_id) REFERENCES corridor_banker(banker_id);

CREATE INDEX idx_committee_chairperson_banker_id ON committee(chairperson_banker_id);
CREATE INDEX idx_committee_secretary_banker_id ON committee(secretary_banker_id);
CREATE INDEX idx_committee_committee_type ON committee(committee_type);
CREATE INDEX idx_committee_status ON committee(status);

CREATE TRIGGER set_committee_updated_at
  BEFORE UPDATE ON committee
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- CommitteeMeeting
CREATE TABLE committee_meeting (
  agenda_document_id TEXT,
  attendee_banker_ids TEXT[],
  committee_id TEXT,
  meeting_date DATE,
  meeting_id TEXT PRIMARY KEY,
  meeting_name TEXT,
  meeting_notes TEXT,
  meeting_status TEXT,
  minutes_document_id TEXT,
  quorum_met BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE committee_meeting
  ADD CONSTRAINT fk_committee_meeting_committee_id
  FOREIGN KEY (committee_id) REFERENCES committee(committee_id);

CREATE INDEX idx_committee_meeting_committee_id ON committee_meeting(committee_id);
CREATE INDEX idx_committee_meeting_meeting_status ON committee_meeting(meeting_status);
CREATE INDEX idx_committee_meeting_meeting_date ON committee_meeting(meeting_date);

CREATE TRIGGER set_committee_meeting_updated_at
  BEFORE UPDATE ON committee_meeting
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Approval
CREATE TABLE approval (
  approval_id TEXT PRIMARY KEY,
  approval_name TEXT,
  approval_stage TEXT,
  approval_status TEXT,
  approval_type TEXT,
  approved_date DATE,
  approver_banker_id TEXT,
  committee_id TEXT,
  committee_meeting_id TEXT,
  conditions TEXT[],
  contract_id TEXT,
  decision_notes TEXT,
  requested_date DATE,
  required BOOLEAN,
  reviewed_date DATE,
  workflow_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE approval
  ADD CONSTRAINT fk_approval_committee_id
  FOREIGN KEY (committee_id) REFERENCES committee(committee_id);

ALTER TABLE approval
  ADD CONSTRAINT fk_approval_committee_meeting_id
  FOREIGN KEY (committee_meeting_id) REFERENCES committee_meeting(meeting_id);

ALTER TABLE approval
  ADD CONSTRAINT fk_approval_contract_id
  FOREIGN KEY (contract_id) REFERENCES contract(contract_id);

ALTER TABLE approval
  ADD CONSTRAINT fk_approval_approver_banker_id
  FOREIGN KEY (approver_banker_id) REFERENCES corridor_banker(banker_id);

ALTER TABLE approval
  ADD CONSTRAINT fk_approval_workflow_id
  FOREIGN KEY (workflow_id) REFERENCES workflow(workflow_id);

CREATE INDEX idx_approval_committee_id ON approval(committee_id);
CREATE INDEX idx_approval_committee_meeting_id ON approval(committee_meeting_id);
CREATE INDEX idx_approval_contract_id ON approval(contract_id);
CREATE INDEX idx_approval_approver_banker_id ON approval(approver_banker_id);
CREATE INDEX idx_approval_workflow_id ON approval(workflow_id);
CREATE INDEX idx_approval_approval_status ON approval(approval_status);
CREATE INDEX idx_approval_approval_type ON approval(approval_type);

CREATE TRIGGER set_approval_updated_at
  BEFORE UPDATE ON approval
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Collateral
CREATE TABLE collateral (
  collateral_id TEXT PRIMARY KEY,
  collateral_name TEXT,
  collateral_type TEXT,
  contract_id TEXT,
  counterparty_id TEXT,
  current_value NUMERIC,
  expiration_date DATE,
  filing_date DATE,
  filing_jurisdiction TEXT,
  initial_value NUMERIC,
  lien_position INTEGER,
  next_valuation_date DATE,
  perfection_status BOOLEAN,
  source_collateral_for_validation_id TEXT,
  source_document_id TEXT,
  status TEXT,
  valuation_date DATE,
  valuation_method TEXT,
  workflow_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE collateral
  ADD CONSTRAINT fk_collateral_contract_id
  FOREIGN KEY (contract_id) REFERENCES contract(contract_id);

ALTER TABLE collateral
  ADD CONSTRAINT fk_collateral_counterparty_id
  FOREIGN KEY (counterparty_id) REFERENCES counterparty(counterparty_id);

ALTER TABLE collateral
  ADD CONSTRAINT fk_collateral_source_document_id
  FOREIGN KEY (source_document_id) REFERENCES document(document_id);

ALTER TABLE collateral
  ADD CONSTRAINT fk_collateral_workflow_id
  FOREIGN KEY (workflow_id) REFERENCES workflow(workflow_id);

CREATE INDEX idx_collateral_contract_id ON collateral(contract_id);
CREATE INDEX idx_collateral_counterparty_id ON collateral(counterparty_id);
CREATE INDEX idx_collateral_source_document_id ON collateral(source_document_id);
CREATE INDEX idx_collateral_workflow_id ON collateral(workflow_id);
CREATE INDEX idx_collateral_collateral_type ON collateral(collateral_type);
CREATE INDEX idx_collateral_perfection_status ON collateral(perfection_status);
CREATE INDEX idx_collateral_status ON collateral(status);

CREATE TRIGGER set_collateral_updated_at
  BEFORE UPDATE ON collateral
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- CommitteeMember
CREATE TABLE committee_member (
  committee_id TEXT,
  corridor_banker_id TEXT,
  end_date DATE,
  member_id TEXT PRIMARY KEY,
  role TEXT,
  start_date DATE,
  status TEXT,
  voting_rights BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE committee_member
  ADD CONSTRAINT fk_committee_member_committee_id
  FOREIGN KEY (committee_id) REFERENCES committee(committee_id);

ALTER TABLE committee_member
  ADD CONSTRAINT fk_committee_member_corridor_banker_id
  FOREIGN KEY (corridor_banker_id) REFERENCES corridor_banker(banker_id);

CREATE INDEX idx_committee_member_committee_id ON committee_member(committee_id);
CREATE INDEX idx_committee_member_corridor_banker_id ON committee_member(corridor_banker_id);
CREATE INDEX idx_committee_member_status ON committee_member(status);

CREATE TRIGGER set_committee_member_updated_at
  BEFORE UPDATE ON committee_member
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- CounterpartyProfileAssignment
CREATE TABLE counterparty_profile_assignment (
  annual_revenue NUMERIC,
  assigned_profile_id TEXT,
  assignment_rationale_detailed TEXT,
  assignment_rationale_short TEXT,
  assignment_timestamp TIMESTAMPTZ,
  confidence_growth_contribution NUMERIC,
  confidence_industry_contribution NUMERIC,
  confidence_score NUMERIC,
  confidence_score_adjusted NUMERIC,
  confidence_size_contribution NUMERIC,
  confidence_volatility_contribution NUMERIC,
  counterparty_id TEXT PRIMARY KEY,
  counterparty_name TEXT,
  data_quality_label TEXT,
  data_quality_score NUMERIC,
  effective_profile_id TEXT,
  fallback_reason TEXT,
  historical_period_count BIGINT,
  industry_sector_label TEXT,
  is_fallback_profile BOOLEAN,
  is_user_override BOOLEAN,
  logical_profile_category TEXT,
  naics_prefix TEXT,
  override_justification TEXT,
  projection_method TEXT,
  resolved_industry_code TEXT,
  revenue_growth_rate NUMERIC,
  revenue_growth_rate_display TEXT,
  revenue_size_bucket TEXT,
  revenue_volatility NUMERIC,
  revenue_volatility_display TEXT,
  semantic_version INTEGER,
  source_statement_date DATE,
  status TEXT,
  user_selected_profile TEXT,
  volatility_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE counterparty_profile_assignment
  ADD CONSTRAINT fk_counterparty_profile_assignment_counterparty_id
  FOREIGN KEY (counterparty_id) REFERENCES counterparty(counterparty_id);

CREATE INDEX idx_counterparty_profile_assignment_counterparty_id ON counterparty_profile_assignment(counterparty_id);
CREATE INDEX idx_counterparty_profile_assignment_status ON counterparty_profile_assignment(status);

CREATE TRIGGER set_counterparty_profile_assignment_updated_at
  BEFORE UPDATE ON counterparty_profile_assignment
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- CounterpartyProjection
CREATE TABLE counterparty_projection (
  capex_y1_q1 NUMERIC,
  capex_y1_q2 NUMERIC,
  capex_y1_q3 NUMERIC,
  capex_y1_q4 NUMERIC,
  capex_y2_q1 NUMERIC,
  capex_y2_q2 NUMERIC,
  capex_y2_q3 NUMERIC,
  capex_y2_q4 NUMERIC,
  capex_y3_q1 NUMERIC,
  capex_y3_q2 NUMERIC,
  capex_y3_q3 NUMERIC,
  capex_y3_q4 NUMERIC,
  cfads_y1_q1 NUMERIC,
  cfads_y1_q2 NUMERIC,
  cfads_y1_q3 NUMERIC,
  cfads_y1_q4 NUMERIC,
  cfads_y2_q1 NUMERIC,
  cfads_y2_q2 NUMERIC,
  cfads_y2_q3 NUMERIC,
  cfads_y2_q4 NUMERIC,
  cfads_y3_q1 NUMERIC,
  cfads_y3_q2 NUMERIC,
  cfads_y3_q3 NUMERIC,
  cfads_y3_q4 NUMERIC,
  corridor_debt_service_y1_q1 NUMERIC,
  corridor_debt_service_y1_q2 NUMERIC,
  corridor_debt_service_y1_q3 NUMERIC,
  corridor_debt_service_y1_q4 NUMERIC,
  corridor_debt_service_y2_q1 NUMERIC,
  corridor_debt_service_y2_q2 NUMERIC,
  corridor_debt_service_y2_q3 NUMERIC,
  corridor_debt_service_y2_q4 NUMERIC,
  corridor_debt_service_y3_q1 NUMERIC,
  corridor_debt_service_y3_q2 NUMERIC,
  corridor_debt_service_y3_q3 NUMERIC,
  corridor_debt_service_y3_q4 NUMERIC,
  counterparty_id TEXT,
  counterparty_name TEXT,
  counterparty_projection_id TEXT PRIMARY KEY,
  ebitda_y1_q1 NUMERIC,
  ebitda_y1_q2 NUMERIC,
  ebitda_y1_q3 NUMERIC,
  ebitda_y1_q4 NUMERIC,
  ebitda_y2_q1 NUMERIC,
  ebitda_y2_q2 NUMERIC,
  ebitda_y2_q3 NUMERIC,
  ebitda_y2_q4 NUMERIC,
  ebitda_y3_q1 NUMERIC,
  ebitda_y3_q2 NUMERIC,
  ebitda_y3_q3 NUMERIC,
  ebitda_y3_q4 NUMERIC,
  gross_profit_y1_q1 NUMERIC,
  gross_profit_y1_q2 NUMERIC,
  gross_profit_y1_q3 NUMERIC,
  gross_profit_y1_q4 NUMERIC,
  gross_profit_y2_q1 NUMERIC,
  gross_profit_y2_q2 NUMERIC,
  gross_profit_y2_q3 NUMERIC,
  gross_profit_y2_q4 NUMERIC,
  gross_profit_y3_q1 NUMERIC,
  gross_profit_y3_q2 NUMERIC,
  gross_profit_y3_q3 NUMERIC,
  gross_profit_y3_q4 NUMERIC,
  income_before_taxes_y1_q1 NUMERIC,
  income_before_taxes_y1_q2 NUMERIC,
  income_before_taxes_y1_q3 NUMERIC,
  income_before_taxes_y1_q4 NUMERIC,
  income_before_taxes_y2_q1 NUMERIC,
  income_before_taxes_y2_q2 NUMERIC,
  income_before_taxes_y2_q3 NUMERIC,
  income_before_taxes_y2_q4 NUMERIC,
  income_before_taxes_y3_q1 NUMERIC,
  income_before_taxes_y3_q2 NUMERIC,
  income_before_taxes_y3_q3 NUMERIC,
  income_before_taxes_y3_q4 NUMERIC,
  income_tax_expense_y1_q1 NUMERIC,
  income_tax_expense_y1_q2 NUMERIC,
  income_tax_expense_y1_q3 NUMERIC,
  income_tax_expense_y1_q4 NUMERIC,
  income_tax_expense_y2_q1 NUMERIC,
  income_tax_expense_y2_q2 NUMERIC,
  income_tax_expense_y2_q3 NUMERIC,
  income_tax_expense_y2_q4 NUMERIC,
  income_tax_expense_y3_q1 NUMERIC,
  income_tax_expense_y3_q2 NUMERIC,
  income_tax_expense_y3_q3 NUMERIC,
  income_tax_expense_y3_q4 NUMERIC,
  interest_expense_y1_q1 NUMERIC,
  interest_expense_y1_q2 NUMERIC,
  interest_expense_y1_q3 NUMERIC,
  interest_expense_y1_q4 NUMERIC,
  interest_expense_y2_q1 NUMERIC,
  interest_expense_y2_q2 NUMERIC,
  interest_expense_y2_q3 NUMERIC,
  interest_expense_y2_q4 NUMERIC,
  interest_expense_y3_q1 NUMERIC,
  interest_expense_y3_q2 NUMERIC,
  interest_expense_y3_q3 NUMERIC,
  interest_expense_y3_q4 NUMERIC,
  long_term_debt_y1_q1 NUMERIC,
  long_term_debt_y1_q2 NUMERIC,
  long_term_debt_y1_q3 NUMERIC,
  long_term_debt_y1_q4 NUMERIC,
  long_term_debt_y2_q1 NUMERIC,
  long_term_debt_y2_q2 NUMERIC,
  long_term_debt_y2_q3 NUMERIC,
  long_term_debt_y2_q4 NUMERIC,
  long_term_debt_y3_q1 NUMERIC,
  long_term_debt_y3_q2 NUMERIC,
  long_term_debt_y3_q3 NUMERIC,
  long_term_debt_y3_q4 NUMERIC,
  net_income_y1_q1 NUMERIC,
  net_income_y1_q2 NUMERIC,
  net_income_y1_q3 NUMERIC,
  net_income_y1_q4 NUMERIC,
  net_income_y2_q1 NUMERIC,
  net_income_y2_q2 NUMERIC,
  net_income_y2_q3 NUMERIC,
  net_income_y2_q4 NUMERIC,
  net_income_y3_q1 NUMERIC,
  net_income_y3_q2 NUMERIC,
  net_income_y3_q3 NUMERIC,
  net_income_y3_q4 NUMERIC,
  operating_expenses_y1_q1 NUMERIC,
  operating_expenses_y1_q2 NUMERIC,
  operating_expenses_y1_q3 NUMERIC,
  operating_expenses_y1_q4 NUMERIC,
  operating_expenses_y2_q1 NUMERIC,
  operating_expenses_y2_q2 NUMERIC,
  operating_expenses_y2_q3 NUMERIC,
  operating_expenses_y2_q4 NUMERIC,
  operating_expenses_y3_q1 NUMERIC,
  operating_expenses_y3_q2 NUMERIC,
  operating_expenses_y3_q3 NUMERIC,
  operating_expenses_y3_q4 NUMERIC,
  operating_income_y1_q1 NUMERIC,
  operating_income_y1_q2 NUMERIC,
  operating_income_y1_q3 NUMERIC,
  operating_income_y1_q4 NUMERIC,
  operating_income_y2_q1 NUMERIC,
  operating_income_y2_q2 NUMERIC,
  operating_income_y2_q3 NUMERIC,
  operating_income_y2_q4 NUMERIC,
  operating_income_y3_q1 NUMERIC,
  operating_income_y3_q2 NUMERIC,
  operating_income_y3_q3 NUMERIC,
  operating_income_y3_q4 NUMERIC,
  projection_created_at TIMESTAMPTZ,
  quarter_date_y1_q1 NUMERIC,
  quarter_date_y1_q2 NUMERIC,
  quarter_date_y1_q3 NUMERIC,
  quarter_date_y1_q4 NUMERIC,
  quarter_date_y2_q1 NUMERIC,
  quarter_date_y2_q2 NUMERIC,
  quarter_date_y2_q3 NUMERIC,
  quarter_date_y2_q4 NUMERIC,
  quarter_date_y3_q1 NUMERIC,
  quarter_date_y3_q2 NUMERIC,
  quarter_date_y3_q3 NUMERIC,
  quarter_date_y3_q4 NUMERIC,
  revenue_y1_q1 NUMERIC,
  revenue_y1_q2 NUMERIC,
  revenue_y1_q3 NUMERIC,
  revenue_y1_q4 NUMERIC,
  revenue_y2_q1 NUMERIC,
  revenue_y2_q2 NUMERIC,
  revenue_y2_q3 NUMERIC,
  revenue_y2_q4 NUMERIC,
  revenue_y3_q1 NUMERIC,
  revenue_y3_q2 NUMERIC,
  revenue_y3_q3 NUMERIC,
  revenue_y3_q4 NUMERIC,
  short_term_debt_y1_q1 NUMERIC,
  short_term_debt_y1_q2 NUMERIC,
  short_term_debt_y1_q3 NUMERIC,
  short_term_debt_y1_q4 NUMERIC,
  short_term_debt_y2_q1 NUMERIC,
  short_term_debt_y2_q2 NUMERIC,
  short_term_debt_y2_q3 NUMERIC,
  short_term_debt_y2_q4 NUMERIC,
  short_term_debt_y3_q1 NUMERIC,
  short_term_debt_y3_q2 NUMERIC,
  short_term_debt_y3_q3 NUMERIC,
  short_term_debt_y3_q4 NUMERIC,
  third_party_debt_service_y1_q1 NUMERIC,
  third_party_debt_service_y1_q2 NUMERIC,
  third_party_debt_service_y1_q3 NUMERIC,
  third_party_debt_service_y1_q4 NUMERIC,
  third_party_debt_service_y2_q1 NUMERIC,
  third_party_debt_service_y2_q2 NUMERIC,
  third_party_debt_service_y2_q3 NUMERIC,
  third_party_debt_service_y2_q4 NUMERIC,
  third_party_debt_service_y3_q1 NUMERIC,
  third_party_debt_service_y3_q2 NUMERIC,
  third_party_debt_service_y3_q3 NUMERIC,
  third_party_debt_service_y3_q4 NUMERIC,
  total_assets_y1_q1 NUMERIC,
  total_assets_y1_q2 NUMERIC,
  total_assets_y1_q3 NUMERIC,
  total_assets_y1_q4 NUMERIC,
  total_assets_y2_q1 NUMERIC,
  total_assets_y2_q2 NUMERIC,
  total_assets_y2_q3 NUMERIC,
  total_assets_y2_q4 NUMERIC,
  total_assets_y3_q1 NUMERIC,
  total_assets_y3_q2 NUMERIC,
  total_assets_y3_q3 NUMERIC,
  total_assets_y3_q4 NUMERIC,
  total_current_assets_y1_q1 NUMERIC,
  total_current_assets_y1_q2 NUMERIC,
  total_current_assets_y1_q3 NUMERIC,
  total_current_assets_y1_q4 NUMERIC,
  total_current_assets_y2_q1 NUMERIC,
  total_current_assets_y2_q2 NUMERIC,
  total_current_assets_y2_q3 NUMERIC,
  total_current_assets_y2_q4 NUMERIC,
  total_current_assets_y3_q1 NUMERIC,
  total_current_assets_y3_q2 NUMERIC,
  total_current_assets_y3_q3 NUMERIC,
  total_current_assets_y3_q4 NUMERIC,
  total_current_liabilities_y1_q1 NUMERIC,
  total_current_liabilities_y1_q2 NUMERIC,
  total_current_liabilities_y1_q3 NUMERIC,
  total_current_liabilities_y1_q4 NUMERIC,
  total_current_liabilities_y2_q1 NUMERIC,
  total_current_liabilities_y2_q2 NUMERIC,
  total_current_liabilities_y2_q3 NUMERIC,
  total_current_liabilities_y2_q4 NUMERIC,
  total_current_liabilities_y3_q1 NUMERIC,
  total_current_liabilities_y3_q2 NUMERIC,
  total_current_liabilities_y3_q3 NUMERIC,
  total_current_liabilities_y3_q4 NUMERIC,
  total_debt_service_y1_q1 NUMERIC,
  total_debt_service_y1_q2 NUMERIC,
  total_debt_service_y1_q3 NUMERIC,
  total_debt_service_y1_q4 NUMERIC,
  total_debt_service_y2_q1 NUMERIC,
  total_debt_service_y2_q2 NUMERIC,
  total_debt_service_y2_q3 NUMERIC,
  total_debt_service_y2_q4 NUMERIC,
  total_debt_service_y3_q1 NUMERIC,
  total_debt_service_y3_q2 NUMERIC,
  total_debt_service_y3_q3 NUMERIC,
  total_debt_service_y3_q4 NUMERIC,
  total_debt_y1_q1 NUMERIC,
  total_debt_y1_q2 NUMERIC,
  total_debt_y1_q3 NUMERIC,
  total_debt_y1_q4 NUMERIC,
  total_debt_y2_q1 NUMERIC,
  total_debt_y2_q2 NUMERIC,
  total_debt_y2_q3 NUMERIC,
  total_debt_y2_q4 NUMERIC,
  total_debt_y3_q1 NUMERIC,
  total_debt_y3_q2 NUMERIC,
  total_debt_y3_q3 NUMERIC,
  total_debt_y3_q4 NUMERIC,
  total_equity_y1_q1 NUMERIC,
  total_equity_y1_q2 NUMERIC,
  total_equity_y1_q3 NUMERIC,
  total_equity_y1_q4 NUMERIC,
  total_equity_y2_q1 NUMERIC,
  total_equity_y2_q2 NUMERIC,
  total_equity_y2_q3 NUMERIC,
  total_equity_y2_q4 NUMERIC,
  total_equity_y3_q1 NUMERIC,
  total_equity_y3_q2 NUMERIC,
  total_equity_y3_q3 NUMERIC,
  total_equity_y3_q4 NUMERIC,
  total_liabilities_y1_q1 NUMERIC,
  total_liabilities_y1_q2 NUMERIC,
  total_liabilities_y1_q3 NUMERIC,
  total_liabilities_y1_q4 NUMERIC,
  total_liabilities_y2_q1 NUMERIC,
  total_liabilities_y2_q2 NUMERIC,
  total_liabilities_y2_q3 NUMERIC,
  total_liabilities_y2_q4 NUMERIC,
  total_liabilities_y3_q1 NUMERIC,
  total_liabilities_y3_q2 NUMERIC,
  total_liabilities_y3_q3 NUMERIC,
  total_liabilities_y3_q4 NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE counterparty_projection
  ADD CONSTRAINT fk_counterparty_projection_counterparty_id
  FOREIGN KEY (counterparty_id) REFERENCES counterparty(counterparty_id);

CREATE INDEX idx_counterparty_projection_counterparty_id ON counterparty_projection(counterparty_id);
CREATE INDEX idx_counterparty_projection_projection_created_at ON counterparty_projection(projection_created_at);

CREATE TRIGGER set_counterparty_projection_updated_at
  BEFORE UPDATE ON counterparty_projection
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- CounterpartyRisk
CREATE TABLE counterparty_risk (
  avg_dscr NUMERIC,
  computed_at TIMESTAMPTZ,
  counterparty_id TEXT,
  counterparty_name TEXT,
  counterparty_projection_id TEXT,
  counterparty_risk_id TEXT PRIMARY KEY,
  dscr_trajectory TEXT,
  dscr_volatility NUMERIC,
  llcr NUMERIC,
  median_dscr NUMERIC,
  min_dscr NUMERIC,
  min_dscr_classification TEXT,
  min_dscr_date DATE,
  min_dscr_driver TEXT,
  min_dscr_months_from_now INTEGER,
  min_dscr_period INTEGER,
  model_version TEXT,
  periods_below_guideline INTEGER,
  periods_below_unity INTEGER,
  total_periods INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE counterparty_risk
  ADD CONSTRAINT fk_counterparty_risk_counterparty_id
  FOREIGN KEY (counterparty_id) REFERENCES counterparty(counterparty_id);

ALTER TABLE counterparty_risk
  ADD CONSTRAINT fk_counterparty_risk_counterparty_projection_id
  FOREIGN KEY (counterparty_projection_id) REFERENCES counterparty_projection(counterparty_projection_id);

CREATE INDEX idx_counterparty_risk_counterparty_id ON counterparty_risk(counterparty_id);
CREATE INDEX idx_counterparty_risk_counterparty_projection_id ON counterparty_risk(counterparty_projection_id);

CREATE TRIGGER set_counterparty_risk_updated_at
  BEFORE UPDATE ON counterparty_risk
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- CovenantTestResult
CREATE TABLE covenant_test_result (
  certification_date DATE,
  certified_by TEXT,
  compliance_notes TEXT,
  measured_value NUMERIC,
  obligation_id TEXT,
  source_document_id TEXT,
  test_date DATE,
  test_period TEXT,
  test_result TEXT,
  test_result_id TEXT PRIMARY KEY,
  threshold_value NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE covenant_test_result
  ADD CONSTRAINT fk_covenant_test_result_source_document_id
  FOREIGN KEY (source_document_id) REFERENCES document(document_id);

ALTER TABLE covenant_test_result
  ADD CONSTRAINT fk_covenant_test_result_obligation_id
  FOREIGN KEY (obligation_id) REFERENCES obligation(obligation_id);

CREATE INDEX idx_covenant_test_result_source_document_id ON covenant_test_result(source_document_id);
CREATE INDEX idx_covenant_test_result_obligation_id ON covenant_test_result(obligation_id);

CREATE TRIGGER set_covenant_test_result_updated_at
  BEFORE UPDATE ON covenant_test_result
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- CrdrPolicy
CREATE TABLE crdr_policy (
  active BOOLEAN,
  approved_by TEXT,
  committee_min INTEGER,
  composite_floor_rule TEXT,
  composite_method TEXT,
  doubtful_max_composite INTEGER,
  effective_date DATE,
  enhanced_monitoring_min INTEGER,
  escalation_min INTEGER,
  loss_min_composite INTEGER,
  pass_max_composite INTEGER,
  policy_id TEXT PRIMARY KEY,
  policy_name TEXT,
  special_mention_max_composite INTEGER,
  standard_approval_max INTEGER,
  substandard_max_composite INTEGER,
  superseded_date DATE,
  version TEXT,
  watch_max_composite INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_crdr_policy_effective_date ON crdr_policy(effective_date);

CREATE TRIGGER set_crdr_policy_updated_at
  BEFORE UPDATE ON crdr_policy
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- CrdrPrompt
CREATE TABLE crdr_prompt (
  active BOOLEAN,
  created DATE,
  entity_categories TEXT[],
  prompt_id TEXT PRIMARY KEY,
  prompt_name TEXT,
  prompt_text TEXT,
  prompt_type TEXT,
  version NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_crdr_prompt_prompt_type ON crdr_prompt(prompt_type);
CREATE INDEX idx_crdr_prompt_created ON crdr_prompt(created);

CREATE TRIGGER set_crdr_prompt_updated_at
  BEFORE UPDATE ON crdr_prompt
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- CrdrAssessmentFinding
CREATE TABLE crdr_assessment_finding (
  approval_path TEXT,
  composite_continuous_score NUMERIC,
  composite_rating INTEGER,
  counterparty_id TEXT,
  created_by TEXT,
  created_date DATE,
  deal_id TEXT,
  finding_id TEXT PRIMARY KEY,
  iq_collateral_value NUMERIC,
  iq_composite_rating TEXT,
  iq_guarantor_value NUMERIC,
  iq_narrative TEXT,
  iq_obligor_value NUMERIC,
  iq_x_rating TEXT,
  iq_x_value NUMERIC,
  iq_y_rating TEXT,
  iq_y_value NUMERIC,
  iq_z_rating TEXT,
  iq_z_value TEXT,
  override_composite_rating INTEGER,
  override_rationale TEXT,
  pb_composite_rating TEXT,
  pb_narrative TEXT,
  pb_x_rating TEXT,
  pb_x_value NUMERIC,
  pb_y_rating TEXT,
  pb_y_value NUMERIC,
  pb_z_rating TEXT,
  pb_z_value NUMERIC,
  pc_composite_rating TEXT,
  pc_narrative TEXT,
  pc_x_rating TEXT,
  pc_x_value NUMERIC,
  pc_y_rating TEXT,
  pc_y_value NUMERIC,
  pc_z_rating TEXT,
  pc_z_value NUMERIC,
  pm_composite_rating TEXT,
  pm_narrative TEXT,
  pm_x_rating TEXT,
  pm_x_value NUMERIC,
  pm_y_rating TEXT,
  pm_y_value NUMERIC,
  pm_z_rating TEXT,
  pm_z_value NUMERIC,
  policy_id TEXT,
  pq_composite_rating TEXT,
  pq_narrative TEXT,
  pq_x_rating TEXT,
  pq_x_value NUMERIC,
  pq_y_rating TEXT,
  pq_y_value NUMERIC,
  pq_z_rating TEXT,
  pq_z_value NUMERIC,
  prior_finding_id TEXT,
  projection_date DATE,
  pv_composite_rating TEXT,
  pv_narrative TEXT,
  pv_x_rating TEXT,
  pv_x_value NUMERIC,
  pv_y_rating TEXT,
  pv_y_value NUMERIC,
  pv_z_rating TEXT,
  pv_z_value NUMERIC,
  regulatory_classification TEXT,
  risk_factors TEXT,
  rm_composite_rating TEXT,
  rm_narrative TEXT,
  rm_x_rating TEXT,
  rm_x_value NUMERIC,
  rm_y_rating TEXT,
  rm_y_value NUMERIC,
  rm_z_rating TEXT,
  rm_z_value NUMERIC,
  routing_recommendation TEXT,
  sc_composite_rating TEXT,
  sc_narrative TEXT,
  sc_x_rating TEXT,
  sc_x_value NUMERIC,
  sc_y_rating TEXT,
  sc_y_value NUMERIC,
  sc_z_rating TEXT,
  sc_z_value NUMERIC,
  sd_composite_rating TEXT,
  sd_narrative TEXT,
  sd_x_rating TEXT,
  sd_x_value NUMERIC,
  sd_y_rating TEXT,
  sd_y_value NUMERIC,
  sd_z_rating TEXT,
  sd_z_value NUMERIC,
  skill_id TEXT,
  so_composite_rating TEXT,
  so_narrative TEXT,
  so_x_rating TEXT,
  so_x_value NUMERIC,
  so_y_rating TEXT,
  so_y_value NUMERIC,
  so_z_rating TEXT,
  so_z_value NUMERIC,
  sr_composite_rating TEXT,
  sr_narrative TEXT,
  sr_x_rating TEXT,
  sr_x_value NUMERIC,
  sr_y_rating TEXT,
  sr_y_value NUMERIC,
  sr_z_rating TEXT,
  sr_z_value TEXT,
  status TEXT,
  synthesis_narrative TEXT,
  tc_composite_rating NUMERIC,
  tc_narrative TEXT,
  tc_x_rating TEXT,
  tc_x_value NUMERIC,
  tc_y_rating TEXT,
  tc_y_value NUMERIC,
  tc_z_rating TEXT,
  tq_composite_rating TEXT,
  tq_narrative TEXT,
  tq_x_rating TEXT,
  tq_x_value NUMERIC,
  tq_y_rating TEXT,
  tq_y_value NUMERIC,
  tq_z_rating TEXT,
  tq_z_value NUMERIC,
  tr_composite_rating TEXT,
  tr_narrative TEXT,
  tr_x_rating TEXT,
  tr_x_value NUMERIC,
  tr_y_rating TEXT,
  tr_y_value NUMERIC,
  tr_z_rating TEXT,
  tr_z_value NUMERIC,
  validated_by TEXT,
  validated_date DATE,
  validation_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE crdr_assessment_finding
  ADD CONSTRAINT fk_crdr_assessment_finding_policy_id
  FOREIGN KEY (policy_id) REFERENCES crdr_policy(policy_id);

ALTER TABLE crdr_assessment_finding
  ADD CONSTRAINT fk_crdr_assessment_finding_deal_id
  FOREIGN KEY (deal_id) REFERENCES deal(deal_id);

ALTER TABLE crdr_assessment_finding
  ADD CONSTRAINT fk_crdr_assessment_finding_counterparty_id
  FOREIGN KEY (counterparty_id) REFERENCES counterparty(counterparty_id);

ALTER TABLE crdr_assessment_finding
  ADD CONSTRAINT fk_crdr_assessment_finding_skill_id
  FOREIGN KEY (skill_id) REFERENCES crdr_prompt(prompt_id);

ALTER TABLE crdr_assessment_finding
  ADD CONSTRAINT fk_crdr_assessment_finding_prior_finding_id
  FOREIGN KEY (prior_finding_id) REFERENCES crdr_assessment_finding(finding_id);

CREATE INDEX idx_crdr_assessment_finding_policy_id ON crdr_assessment_finding(policy_id);
CREATE INDEX idx_crdr_assessment_finding_deal_id ON crdr_assessment_finding(deal_id);
CREATE INDEX idx_crdr_assessment_finding_counterparty_id ON crdr_assessment_finding(counterparty_id);
CREATE INDEX idx_crdr_assessment_finding_skill_id ON crdr_assessment_finding(skill_id);
CREATE INDEX idx_crdr_assessment_finding_prior_finding_id ON crdr_assessment_finding(prior_finding_id);
CREATE INDEX idx_crdr_assessment_finding_status ON crdr_assessment_finding(status);
CREATE INDEX idx_crdr_assessment_finding_created_date ON crdr_assessment_finding(created_date);

CREATE TRIGGER set_crdr_assessment_finding_updated_at
  BEFORE UPDATE ON crdr_assessment_finding
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- CrossProfileInsight
CREATE TABLE cross_profile_insight (
  affected_profiles TEXT,
  analysis_date DATE,
  confidence_level TEXT,
  cross_profile_insight_id TEXT PRIMARY KEY,
  insight_category TEXT,
  insight_description TEXT,
  insight_title TEXT,
  priority_score INTEGER,
  recommended_action TEXT,
  requires_action BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TRIGGER set_cross_profile_insight_updated_at
  BEFORE UPDATE ON cross_profile_insight
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Facility
CREATE TABLE facility (
  counterparty_id TEXT,
  created_date DATE,
  deal_id TEXT,
  document_ids TEXT[],
  execution_ready_documents INTEGER,
  facility_documents INTEGER,
  facility_id TEXT PRIMARY KEY,
  facility_name TEXT,
  facility_status TEXT,
  facility_type TEXT,
  project_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE facility
  ADD CONSTRAINT fk_facility_counterparty_id
  FOREIGN KEY (counterparty_id) REFERENCES counterparty(counterparty_id);

ALTER TABLE facility
  ADD CONSTRAINT fk_facility_deal_id
  FOREIGN KEY (deal_id) REFERENCES deal(deal_id);

CREATE INDEX idx_facility_counterparty_id ON facility(counterparty_id);
CREATE INDEX idx_facility_deal_id ON facility(deal_id);
CREATE INDEX idx_facility_facility_status ON facility(facility_status);
CREATE INDEX idx_facility_facility_type ON facility(facility_type);
CREATE INDEX idx_facility_created_date ON facility(created_date);

CREATE TRIGGER set_facility_updated_at
  BEFORE UPDATE ON facility
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ProjectionProfile
CREATE TABLE projection_profile (
  b2b_percentage INTEGER,
  b2c_percentage INTEGER,
  balance_sheet_asset_turnover TEXT,
  balance_sheet_dividend_payout_ratio NUMERIC,
  balance_sheet_leverage_target TEXT,
  balance_sheet_share_buyback_amount TEXT,
  cantillon_capital_layer TEXT,
  cantillon_cost_layer TEXT,
  cantillon_revenue_layer TEXT,
  capex_growth_percentage NUMERIC,
  capex_maintenance_percentage NUMERIC,
  capex_one_time_amounts TEXT,
  cogs_base_percentage NUMERIC,
  cogs_fixed_portion_amount INTEGER,
  cogs_improvement_annual NUMERIC,
  cogs_improvement_floor NUMERIC,
  cogs_method TEXT,
  cogs_relationship_type TEXT,
  cogs_step_new_percentage TEXT,
  cogs_step_threshold_revenue TEXT,
  cogs_use_historical_base TEXT,
  cogs_variable_portion NUMERIC,
  contract_duration INTEGER,
  contract_percentage INTEGER,
  contract_termination INTEGER,
  counterparty_quality TEXT,
  customer_concentration TEXT,
  debt_amortization_periods INTEGER,
  debt_balloon_period INTEGER,
  debt_schedule_type TEXT,
  debt_target_leverage_ratio NUMERIC,
  depreciation_existing_base TEXT,
  depreciation_new_capex_rate TEXT,
  depreciation_policy TEXT,
  depreciation_rate_accelerated NUMERIC,
  depreciation_rate_straight_line NUMERIC,
  evolution_count INTEGER,
  fixed_rate_exposure INTEGER,
  industry TEXT,
  interest_rate_ceiling TEXT,
  interest_rate_fixed NUMERIC,
  interest_rate_floor TEXT,
  interest_rate_variable_base NUMERIC,
  interest_rate_variable_spread NUMERIC,
  last_evolution_date DATE,
  last_evolved_by TEXT,
  last_optimization_date DATE,
  maturity TEXT,
  monte_carlo_iterations TEXT,
  monte_carlo_std_deviation TEXT,
  operating_expenses_method TEXT,
  operating_expenses_relationship_type TEXT,
  opex_base_percentage NUMERIC,
  opex_fixed_amount INTEGER,
  opex_growth_independent_rate NUMERIC,
  opex_scale_efficiency_factor NUMERIC,
  opex_step_increase_amount INTEGER,
  opex_step_trigger_type TEXT,
  opex_step_trigger_value INTEGER,
  opex_variable_percentage NUMERIC,
  optimization_count INTEGER,
  profile_name TEXT,
  projection_profile_id TEXT PRIMARY KEY,
  projection_type TEXT,
  revenue_base_growth_rate NUMERIC,
  revenue_base_value INTEGER,
  revenue_growth_annual NUMERIC,
  revenue_growth_ceiling NUMERIC,
  revenue_growth_decay_rate NUMERIC,
  revenue_growth_floor NUMERIC,
  revenue_method TEXT,
  revenue_relationship_type TEXT,
  revenue_seasonal_q1_factor NUMERIC,
  revenue_seasonal_q2_factor NUMERIC,
  revenue_seasonal_q3_factor NUMERIC,
  revenue_seasonal_q4_factor NUMERIC,
  revenue_use_historical_base TEXT,
  revenue_volatility_factor INTEGER,
  scenario_confidence_decay_rate TEXT,
  scenario_stress_test_factor TEXT,
  scenario_volatility_override NUMERIC,
  sga_base_percentage NUMERIC,
  sga_g_and_a_percentage NUMERIC,
  sga_growth_rate TEXT,
  sga_marketing_percentage NUMERIC,
  sga_method TEXT,
  sga_r_and_d_percentage NUMERIC,
  sga_relationship_type TEXT,
  sga_sales_commission_rate NUMERIC,
  sga_use_components TEXT,
  size TEXT,
  tax_credits_annual_amount INTEGER,
  tax_loss_carryforward TEXT,
  tax_minimum_rate TEXT,
  tax_rate_effective NUMERIC,
  tax_rate_statutory TEXT,
  template_source_id TEXT,
  variable_rate_exposure INTEGER,
  working_capital_accrual_days TEXT,
  working_capital_ap_days INTEGER,
  working_capital_ar_days INTEGER,
  working_capital_cash_minimum_days INTEGER,
  working_capital_cash_target_percent TEXT,
  working_capital_inventory_days INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_projection_profile_cogs_relationship_type ON projection_profile(cogs_relationship_type);
CREATE INDEX idx_projection_profile_debt_schedule_type ON projection_profile(debt_schedule_type);
CREATE INDEX idx_projection_profile_operating_expenses_relationship_type ON projection_profile(operating_expenses_relationship_type);
CREATE INDEX idx_projection_profile_opex_step_trigger_type ON projection_profile(opex_step_trigger_type);
CREATE INDEX idx_projection_profile_revenue_relationship_type ON projection_profile(revenue_relationship_type);
CREATE INDEX idx_projection_profile_sga_relationship_type ON projection_profile(sga_relationship_type);

CREATE TRIGGER set_projection_profile_updated_at
  BEFORE UPDATE ON projection_profile
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- FinancialStatement
CREATE TABLE financial_statement (
  accounts_payable NUMERIC,
  accounts_receivable NUMERIC,
  additional_paid_in_capital NUMERIC,
  audit_id TEXT,
  cash_and_equivalents NUMERIC,
  cogs NUMERIC,
  common_stock NUMERIC,
  confidence NUMERIC,
  contract_id TEXT,
  counterparty_id TEXT,
  counterparty_name TEXT,
  deal_id TEXT,
  depreciation_amortization NUMERIC,
  document_id TEXT,
  equity NUMERIC,
  goodwill NUMERIC,
  gross_profit NUMERIC,
  income_before_taxes NUMERIC,
  income_tax_expense NUMERIC,
  industry_code INTEGER,
  intangible_assets NUMERIC,
  interest_expense NUMERIC,
  inventory NUMERIC,
  is_user_override BOOLEAN,
  long_term_debt NUMERIC,
  net_income NUMERIC,
  notes_payable NUMERIC,
  obligation_id TEXT,
  operating_expenses NUMERIC,
  operating_income NUMERIC,
  other_comprehensive_income NUMERIC,
  override_justification TEXT,
  period_end_date DATE,
  period_end_month TEXT,
  period_end_year INTEGER,
  ppe NUMERIC,
  projection_method TEXT,
  projection_profile TEXT,
  projection_profile_id TEXT,
  reporting_currency TEXT,
  retained_earnings NUMERIC,
  revenue NUMERIC,
  sga NUMERIC,
  short_term_debt NUMERIC,
  source_financial_statement_for_validation_id TEXT,
  statement_id TEXT PRIMARY KEY,
  statement_title TEXT,
  statement_type TEXT,
  template_assignment_date DATE,
  total_assets NUMERIC,
  total_current_assets NUMERIC,
  total_current_liabilities NUMERIC,
  total_liabilities NUMERIC,
  treasury_stock NUMERIC,
  wages_payable NUMERIC,
  workflow_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE financial_statement
  ADD CONSTRAINT fk_financial_statement_counterparty_id
  FOREIGN KEY (counterparty_id) REFERENCES counterparty(counterparty_id);

ALTER TABLE financial_statement
  ADD CONSTRAINT fk_financial_statement_projection_profile_id
  FOREIGN KEY (projection_profile_id) REFERENCES projection_profile(projection_profile_id);

ALTER TABLE financial_statement
  ADD CONSTRAINT fk_financial_statement_workflow_id
  FOREIGN KEY (workflow_id) REFERENCES workflow(workflow_id);

ALTER TABLE financial_statement
  ADD CONSTRAINT fk_financial_statement_obligation_id
  FOREIGN KEY (obligation_id) REFERENCES obligation(obligation_id);

ALTER TABLE financial_statement
  ADD CONSTRAINT fk_financial_statement_document_id
  FOREIGN KEY (document_id) REFERENCES document(document_id);

CREATE INDEX idx_financial_statement_counterparty_id ON financial_statement(counterparty_id);
CREATE INDEX idx_financial_statement_projection_profile_id ON financial_statement(projection_profile_id);
CREATE INDEX idx_financial_statement_workflow_id ON financial_statement(workflow_id);
CREATE INDEX idx_financial_statement_obligation_id ON financial_statement(obligation_id);
CREATE INDEX idx_financial_statement_document_id ON financial_statement(document_id);
CREATE INDEX idx_financial_statement_statement_type ON financial_statement(statement_type);

CREATE TRIGGER set_financial_statement_updated_at
  BEFORE UPDATE ON financial_statement
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- IndexRate
CREATE TABLE index_rate (
  current_rate NUMERIC,
  current_rate_update TIMESTAMPTZ,
  index_rate_id TEXT PRIMARY KEY,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TRIGGER set_index_rate_updated_at
  BEFORE UPDATE ON index_rate
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ObligationTermStructure
CREATE TABLE obligation_term_structure (
  amortization_type TEXT,
  applicable_margin_spread NUMERIC,
  base_rate_index TEXT,
  contract_id TEXT,
  counterparty_id TEXT,
  data_quality_score NUMERIC,
  days_until_payment INTEGER,
  facility_amount NUMERIC,
  generated_timestamp TIMESTAMPTZ,
  is_final_payment BOOLEAN,
  maturity_date DATE,
  obligation_event_id TEXT PRIMARY KEY,
  origination_date DATE,
  outstanding_principal_beginning NUMERIC,
  outstanding_principal_ending NUMERIC,
  payment_due_date DATE,
  payment_frequency TEXT,
  payment_number INTEGER,
  payment_status TEXT,
  scheduled_interest NUMERIC,
  scheduled_principal NUMERIC,
  scheduled_total_payment NUMERIC,
  source_obligation_term_structure_for_validation_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE obligation_term_structure
  ADD CONSTRAINT fk_obligation_term_structure_contract_id
  FOREIGN KEY (contract_id) REFERENCES contract(contract_id);

ALTER TABLE obligation_term_structure
  ADD CONSTRAINT fk_obligation_term_structure_counterparty_id
  FOREIGN KEY (counterparty_id) REFERENCES counterparty(counterparty_id);

CREATE INDEX idx_obligation_term_structure_contract_id ON obligation_term_structure(contract_id);
CREATE INDEX idx_obligation_term_structure_counterparty_id ON obligation_term_structure(counterparty_id);
CREATE INDEX idx_obligation_term_structure_amortization_type ON obligation_term_structure(amortization_type);
CREATE INDEX idx_obligation_term_structure_payment_status ON obligation_term_structure(payment_status);
CREATE INDEX idx_obligation_term_structure_generated_timestamp ON obligation_term_structure(generated_timestamp);
CREATE INDEX idx_obligation_term_structure_maturity_date ON obligation_term_structure(maturity_date);
CREATE INDEX idx_obligation_term_structure_payment_due_date ON obligation_term_structure(payment_due_date);

CREATE TRIGGER set_obligation_term_structure_updated_at
  BEFORE UPDATE ON obligation_term_structure
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Payment
CREATE TABLE payment (
  compliance_officer TEXT,
  contract_id TEXT,
  counterparty_id TEXT,
  counterparty_name TEXT,
  creation_date DATE,
  currency TEXT,
  default_interest_rate NUMERIC,
  due_days INTEGER,
  frequency TEXT,
  grace_period_days INTEGER,
  last_payment_amount NUMERIC,
  last_payment_date DATE,
  next_payment_date DATE,
  obligation_id TEXT,
  obligation_status TEXT,
  obligation_type TEXT,
  payment_date DATE,
  payment_days_pd INTEGER,
  payment_due_date DATE,
  payment_due_month TEXT,
  payment_due_year INTEGER,
  payment_id TEXT PRIMARY KEY,
  payment_method TEXT,
  payment_status TEXT,
  payment_subtype TEXT,
  payment_title TEXT,
  payment_type TEXT,
  required_certifications TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_obligation_status ON payment(obligation_status);
CREATE INDEX idx_payment_obligation_type ON payment(obligation_type);
CREATE INDEX idx_payment_payment_status ON payment(payment_status);
CREATE INDEX idx_payment_payment_type ON payment(payment_type);
CREATE INDEX idx_payment_payment_due_date ON payment(payment_due_date);

CREATE TRIGGER set_payment_updated_at
  BEFORE UPDATE ON payment
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Performance
CREATE TABLE performance (
  cap_ratio NUMERIC,
  ccr NUMERIC,
  contract_id TEXT,
  counterparty_id TEXT,
  counterparty_name TEXT,
  covenant_days_pd INTEGER,
  covenant_id TEXT,
  covenant_status TEXT,
  covenant_subtype TEXT,
  covenant_title TEXT,
  creation_date DATE,
  curr_ratio NUMERIC,
  fcc NUMERIC,
  gdscr NUMERIC,
  gecf INTEGER,
  gllcr NUMERIC,
  gpm NUMERIC,
  last_test_result TEXT,
  last_test_value NUMERIC,
  llccr NUMERIC,
  llcr NUMERIC,
  obligation_id TEXT PRIMARY KEY,
  obligation_status TEXT,
  obligation_title TEXT,
  obligation_type TEXT,
  payment_days_pd INTEGER,
  payment_id TEXT,
  payment_status TEXT,
  payment_title TEXT,
  reporting_days_pd INTEGER,
  reporting_id TEXT,
  reporting_status TEXT,
  reporting_title TEXT,
  times_30_pd INTEGER,
  times_60_pd INTEGER,
  times_covenant_pd INTEGER,
  times_payment_pd INTEGER,
  times_reporting_pd INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_performance_covenant_status ON performance(covenant_status);
CREATE INDEX idx_performance_obligation_status ON performance(obligation_status);
CREATE INDEX idx_performance_obligation_type ON performance(obligation_type);
CREATE INDEX idx_performance_payment_status ON performance(payment_status);
CREATE INDEX idx_performance_reporting_status ON performance(reporting_status);

CREATE TRIGGER set_performance_updated_at
  BEFORE UPDATE ON performance
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- PolicyDimensionPbObligorTrend
CREATE TABLE policy_dimension_pb_obligor_trend (
  active BOOLEAN,
  cross_ref_dimension TEXT,
  dimension_code TEXT,
  dimension_id TEXT PRIMARY KEY,
  dimension_label TEXT,
  dimension_sequence INTEGER,
  effective_date DATE,
  metric_source_x TEXT,
  metric_source_x_benchmark TEXT,
  metric_source_y TEXT,
  metric_source_y_benchmark TEXT,
  metric_source_z TEXT,
  notes TEXT,
  policy_id TEXT,
  pw_continuous_score NUMERIC,
  pw_reg_score_max INTEGER,
  sat_continuous_score NUMERIC,
  sat_rating_contribution INTEGER,
  sat_reg_score_max INTEGER,
  sor_label TEXT,
  sor_number INTEGER,
  wdw_continuous_score NUMERIC,
  weight NUMERIC,
  x_pw_operator TEXT,
  x_pw_threshold NUMERIC,
  x_sat_operator TEXT,
  x_sat_threshold NUMERIC,
  x_wdw_operator TEXT,
  x_wdw_threshold NUMERIC,
  y_pw_operator TEXT,
  y_pw_threshold NUMERIC,
  y_sat_operator TEXT,
  y_sat_threshold NUMERIC,
  z_pw_operator TEXT,
  z_pw_threshold NUMERIC,
  z_reference_dimension TEXT,
  z_sat_operator TEXT,
  z_sat_threshold NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE policy_dimension_pb_obligor_trend
  ADD CONSTRAINT fk_policy_dimension_pb_obligor_trend_policy_id
  FOREIGN KEY (policy_id) REFERENCES crdr_policy(policy_id);

CREATE INDEX idx_policy_dimension_pb_obligor_trend_policy_id ON policy_dimension_pb_obligor_trend(policy_id);
CREATE INDEX idx_policy_dimension_pb_obligor_trend_effective_date ON policy_dimension_pb_obligor_trend(effective_date);

CREATE TRIGGER set_policy_dimension_pb_obligor_trend_updated_at
  BEFORE UPDATE ON policy_dimension_pb_obligor_trend
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- PolicyDimensionPcDebtServiceCoverage
CREATE TABLE policy_dimension_pc_debt_service_coverage (
  active BOOLEAN,
  cross_ref_dimension TEXT,
  dimension_code TEXT,
  dimension_id TEXT PRIMARY KEY,
  dimension_label TEXT,
  dimension_sequence INTEGER,
  effective_date DATE,
  metric_source_x TEXT,
  metric_source_x_benchmark TEXT,
  metric_source_y TEXT,
  metric_source_y_benchmark TEXT,
  metric_source_z TEXT,
  notes TEXT,
  policy_id TEXT,
  pw_continuous_score NUMERIC,
  pw_reg_score_max INTEGER,
  sat_continuous_score NUMERIC,
  sat_rating_contribution INTEGER,
  sat_reg_score_max INTEGER,
  sor_label TEXT,
  sor_number INTEGER,
  wdw_continuous_score NUMERIC,
  weight NUMERIC,
  x_pw_operator TEXT,
  x_pw_threshold NUMERIC,
  x_sat_operator TEXT,
  x_sat_threshold NUMERIC,
  x_wdw_operator TEXT,
  x_wdw_threshold NUMERIC,
  y_pw_operator TEXT,
  y_pw_threshold NUMERIC,
  y_sat_operator TEXT,
  y_sat_threshold NUMERIC,
  z_pw_operator TEXT,
  z_pw_threshold NUMERIC,
  z_reference_dimension TEXT,
  z_sat_operator TEXT,
  z_sat_threshold NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE policy_dimension_pc_debt_service_coverage
  ADD CONSTRAINT fk_policy_dimension_pc_debt_service_coverage_policy_id
  FOREIGN KEY (policy_id) REFERENCES crdr_policy(policy_id);

CREATE INDEX idx_policy_dimension_pc_debt_service_coverage_policy_id ON policy_dimension_pc_debt_service_coverage(policy_id);
CREATE INDEX idx_policy_dimension_pc_debt_service_coverage_effective_date ON policy_dimension_pc_debt_service_coverage(effective_date);

CREATE TRIGGER set_policy_dimension_pc_debt_service_coverage_updated_at
  BEFORE UPDATE ON policy_dimension_pc_debt_service_coverage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- PolicyDimensionPmCostStructure
CREATE TABLE policy_dimension_pm_cost_structure (
  active BOOLEAN,
  cross_ref_dimension TEXT,
  dimension_code TEXT,
  dimension_id TEXT PRIMARY KEY,
  dimension_label TEXT,
  dimension_sequence INTEGER,
  effective_date DATE,
  metric_source_x TEXT,
  metric_source_x_benchmark TEXT,
  metric_source_y TEXT,
  metric_source_y_benchmark TEXT,
  metric_source_z TEXT,
  notes TEXT,
  policy_id TEXT,
  pw_continuous_score NUMERIC,
  pw_reg_score_max INTEGER,
  sat_continuous_score NUMERIC,
  sat_rating_contribution INTEGER,
  sat_reg_score_max INTEGER,
  sor_label TEXT,
  sor_number INTEGER,
  wdw_continuous_score NUMERIC,
  weight NUMERIC,
  x_pw_operator TEXT,
  x_pw_threshold NUMERIC,
  x_sat_operator TEXT,
  x_sat_threshold NUMERIC,
  x_wdw_operator TEXT,
  x_wdw_threshold NUMERIC,
  y_pw_operator TEXT,
  y_pw_threshold NUMERIC,
  y_sat_operator TEXT,
  y_sat_threshold NUMERIC,
  z_pw_operator TEXT,
  z_pw_threshold NUMERIC,
  z_reference_dimension TEXT,
  z_sat_operator TEXT,
  z_sat_threshold NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE policy_dimension_pm_cost_structure
  ADD CONSTRAINT fk_policy_dimension_pm_cost_structure_policy_id
  FOREIGN KEY (policy_id) REFERENCES crdr_policy(policy_id);

CREATE INDEX idx_policy_dimension_pm_cost_structure_policy_id ON policy_dimension_pm_cost_structure(policy_id);
CREATE INDEX idx_policy_dimension_pm_cost_structure_effective_date ON policy_dimension_pm_cost_structure(effective_date);

CREATE TRIGGER set_policy_dimension_pm_cost_structure_updated_at
  BEFORE UPDATE ON policy_dimension_pm_cost_structure
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- PolicyDimensionPqObligorLiquidity
CREATE TABLE policy_dimension_pq_obligor_liquidity (
  active BOOLEAN,
  cross_ref_dimension TEXT,
  dimension_code TEXT,
  dimension_id TEXT PRIMARY KEY,
  dimension_label TEXT,
  dimension_sequence INTEGER,
  effective_date DATE,
  metric_source_x TEXT,
  metric_source_x_benchmark TEXT,
  metric_source_y TEXT,
  metric_source_y_benchmark TEXT,
  metric_source_z TEXT,
  notes TEXT,
  policy_id TEXT,
  pw_continuous_score NUMERIC,
  pw_reg_score_max INTEGER,
  sat_continuous_score NUMERIC,
  sat_rating_contribution INTEGER,
  sat_reg_score_max INTEGER,
  sor_label TEXT,
  sor_number INTEGER,
  wdw_continuous_score NUMERIC,
  weight NUMERIC,
  x_pw_operator TEXT,
  x_pw_threshold NUMERIC,
  x_sat_operator TEXT,
  x_sat_threshold NUMERIC,
  x_wdw_operator TEXT,
  x_wdw_threshold NUMERIC,
  y_pw_operator TEXT,
  y_pw_threshold NUMERIC,
  y_sat_operator TEXT,
  y_sat_threshold NUMERIC,
  z_pw_operator TEXT,
  z_pw_threshold NUMERIC,
  z_reference_dimension TEXT,
  z_sat_operator TEXT,
  z_sat_threshold NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE policy_dimension_pq_obligor_liquidity
  ADD CONSTRAINT fk_policy_dimension_pq_obligor_liquidity_policy_id
  FOREIGN KEY (policy_id) REFERENCES crdr_policy(policy_id);

CREATE INDEX idx_policy_dimension_pq_obligor_liquidity_policy_id ON policy_dimension_pq_obligor_liquidity(policy_id);
CREATE INDEX idx_policy_dimension_pq_obligor_liquidity_effective_date ON policy_dimension_pq_obligor_liquidity(effective_date);

CREATE TRIGGER set_policy_dimension_pq_obligor_liquidity_updated_at
  BEFORE UPDATE ON policy_dimension_pq_obligor_liquidity
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- PolicyDimensionPvLoanLifeCoverage
CREATE TABLE policy_dimension_pv_loan_life_coverage (
  active BOOLEAN,
  cross_ref_dimension TEXT,
  dimension_code TEXT,
  dimension_id TEXT PRIMARY KEY,
  dimension_label TEXT,
  dimension_sequence INTEGER,
  effective_date DATE,
  metric_source_x TEXT,
  metric_source_x_benchmark TEXT,
  metric_source_y TEXT,
  metric_source_y_benchmark TEXT,
  metric_source_z TEXT,
  notes TEXT,
  policy_id TEXT,
  pw_continuous_score NUMERIC,
  pw_reg_score_max INTEGER,
  sat_continuous_score NUMERIC,
  sat_rating_contribution INTEGER,
  sat_reg_score_max INTEGER,
  sor_label TEXT,
  sor_number INTEGER,
  wdw_continuous_score NUMERIC,
  weight NUMERIC,
  x_pw_operator TEXT,
  x_pw_threshold NUMERIC,
  x_sat_operator TEXT,
  x_sat_threshold NUMERIC,
  x_wdw_operator TEXT,
  x_wdw_threshold NUMERIC,
  y_pw_operator TEXT,
  y_pw_threshold NUMERIC,
  y_sat_operator TEXT,
  y_sat_threshold NUMERIC,
  z_pw_operator TEXT,
  z_pw_threshold NUMERIC,
  z_reference_dimension TEXT,
  z_sat_operator TEXT,
  z_sat_threshold NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE policy_dimension_pv_loan_life_coverage
  ADD CONSTRAINT fk_policy_dimension_pv_loan_life_coverage_policy_id
  FOREIGN KEY (policy_id) REFERENCES crdr_policy(policy_id);

CREATE INDEX idx_policy_dimension_pv_loan_life_coverage_policy_id ON policy_dimension_pv_loan_life_coverage(policy_id);
CREATE INDEX idx_policy_dimension_pv_loan_life_coverage_effective_date ON policy_dimension_pv_loan_life_coverage(effective_date);

CREATE TRIGGER set_policy_dimension_pv_loan_life_coverage_updated_at
  BEFORE UPDATE ON policy_dimension_pv_loan_life_coverage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ProfileOptimizationSuggestion
CREATE TABLE profile_optimization_suggestion (
  analysis_date TIMESTAMPTZ,
  applied_by TEXT,
  applied_date TIMESTAMPTZ,
  confidence_level TEXT,
  expected_improvement NUMERIC,
  optimization_reasoning TEXT,
  performance_analysis TEXT,
  profile_id TEXT,
  profile_optimization_suggestion_id TEXT PRIMARY KEY,
  recommended_parameters TEXT[],
  rejection_reason TEXT,
  requires_user_approval BOOLEAN,
  risk_assessment TEXT,
  status TEXT,
  suggested_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profile_optimization_suggestion_status ON profile_optimization_suggestion(status);

CREATE TRIGGER set_profile_optimization_suggestion_updated_at
  BEFORE UPDATE ON profile_optimization_suggestion
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ProfileOptimizationHistory
CREATE TABLE profile_optimization_history (
  actual_post_optimization_accuracy NUMERIC,
  applied_by TEXT,
  business_justification TEXT,
  change_summary TEXT,
  expected_post_optimization_accuracy NUMERIC,
  optimization_date TIMESTAMPTZ,
  optimization_effectiveness_score NUMERIC,
  optimization_trigger TEXT,
  optimization_type TEXT,
  parameter_changes TEXT[],
  performance_data_source TEXT,
  pre_optimization_accuracy NUMERIC,
  profile_id TEXT,
  profile_optimization_history_id TEXT PRIMARY KEY,
  profile_optimization_suggestion_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profile_optimization_history
  ADD CONSTRAINT fk_profile_optimization_history_profile_optimization_suggestion_id
  FOREIGN KEY (profile_optimization_suggestion_id) REFERENCES profile_optimization_suggestion(profile_optimization_suggestion_id);

CREATE INDEX idx_profile_optimization_history_profile_optimization_suggestion_id ON profile_optimization_history(profile_optimization_suggestion_id);
CREATE INDEX idx_profile_optimization_history_optimization_type ON profile_optimization_history(optimization_type);

CREATE TRIGGER set_profile_optimization_history_updated_at
  BEFORE UPDATE ON profile_optimization_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ProfilePerformanceAggregation
CREATE TABLE profile_performance_aggregation (
  avg_accuracy_score NUMERIC,
  cogs_mae_avg NUMERIC,
  evaluation_end_date DATE,
  evaluation_start_date DATE,
  performance_agg_id TEXT PRIMARY KEY,
  performance_tier TEXT,
  profile_id TEXT,
  recommendation TEXT,
  revenue_mae_avg NUMERIC,
  success_rate NUMERIC,
  usage_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profile_performance_aggregation
  ADD CONSTRAINT fk_profile_performance_aggregation_profile_id
  FOREIGN KEY (profile_id) REFERENCES projection_profile(projection_profile_id);

CREATE INDEX idx_profile_performance_aggregation_profile_id ON profile_performance_aggregation(profile_id);

CREATE TRIGGER set_profile_performance_aggregation_updated_at
  BEFORE UPDATE ON profile_performance_aggregation
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ProfileUsagePattern
CREATE TABLE profile_usage_pattern (
  analysis_date DATE,
  analysis_period_days INTEGER,
  manual_override_rate NUMERIC,
  pattern_category TEXT,
  pattern_type TEXT,
  primary_profile_used TEXT,
  recommendation TEXT,
  success_rate NUMERIC,
  usage_frequency INTEGER,
  usage_pattern_id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profile_usage_pattern_pattern_type ON profile_usage_pattern(pattern_type);

CREATE TRIGGER set_profile_usage_pattern_updated_at
  BEFORE UPDATE ON profile_usage_pattern
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ProFormaFinancialStatement
CREATE TABLE pro_forma_financial_statement (
  accounts_payable NUMERIC,
  accounts_receivable NUMERIC,
  additional_paid_in_capital NUMERIC,
  as_of_date DATE,
  assumption_notes TEXT,
  audit_id TEXT,
  cash_and_equivalents NUMERIC,
  cogs NUMERIC,
  common_stock NUMERIC,
  confidence NUMERIC,
  contract_id TEXT,
  counterparty_id TEXT,
  counterparty_name TEXT,
  deal_id TEXT,
  depreciation_amortization NUMERIC,
  document_id TEXT,
  equity NUMERIC,
  extraction_timestamp TIMESTAMPTZ,
  goodwill NUMERIC,
  gross_profit NUMERIC,
  income_before_taxes NUMERIC,
  income_tax_expense NUMERIC,
  industry_code INTEGER,
  intangible_assets NUMERIC,
  interest_expense NUMERIC,
  inventory NUMERIC,
  long_term_debt NUMERIC,
  net_income NUMERIC,
  notes_payable NUMERIC,
  obligation_id TEXT,
  operating_expenses NUMERIC,
  operating_income NUMERIC,
  other_comprehensive_income NUMERIC,
  period_sequence INTEGER,
  period_type TEXT,
  ppe NUMERIC,
  pro_forma_statement_id TEXT PRIMARY KEY,
  pro_forma_statement_title TEXT,
  projection_method TEXT,
  projection_period_end DATE,
  projection_period_start DATE,
  projection_profile TEXT,
  projection_profile_id TEXT,
  reporting_currency TEXT,
  retained_earnings NUMERIC,
  revenue NUMERIC,
  scenario_type TEXT,
  sga NUMERIC,
  short_term_debt NUMERIC,
  source_financial_statement_for_validation_id TEXT,
  source_type TEXT,
  statement_type TEXT,
  template_assignment_date DATE,
  total_assets NUMERIC,
  total_current_assets NUMERIC,
  total_current_liabilities NUMERIC,
  total_liabilities NUMERIC,
  treasury_stock NUMERIC,
  validation_status TEXT,
  wages_payable NUMERIC,
  workflow_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE pro_forma_financial_statement
  ADD CONSTRAINT fk_pro_forma_financial_statement_document_id
  FOREIGN KEY (document_id) REFERENCES document(document_id);

ALTER TABLE pro_forma_financial_statement
  ADD CONSTRAINT fk_pro_forma_financial_statement_workflow_id
  FOREIGN KEY (workflow_id) REFERENCES workflow(workflow_id);

ALTER TABLE pro_forma_financial_statement
  ADD CONSTRAINT fk_pro_forma_financial_statement_obligation_id
  FOREIGN KEY (obligation_id) REFERENCES obligation(obligation_id);

ALTER TABLE pro_forma_financial_statement
  ADD CONSTRAINT fk_pro_forma_financial_statement_counterparty_id
  FOREIGN KEY (counterparty_id) REFERENCES counterparty(counterparty_id);

CREATE INDEX idx_pro_forma_financial_statement_document_id ON pro_forma_financial_statement(document_id);
CREATE INDEX idx_pro_forma_financial_statement_workflow_id ON pro_forma_financial_statement(workflow_id);
CREATE INDEX idx_pro_forma_financial_statement_obligation_id ON pro_forma_financial_statement(obligation_id);
CREATE INDEX idx_pro_forma_financial_statement_counterparty_id ON pro_forma_financial_statement(counterparty_id);
CREATE INDEX idx_pro_forma_financial_statement_period_type ON pro_forma_financial_statement(period_type);
CREATE INDEX idx_pro_forma_financial_statement_scenario_type ON pro_forma_financial_statement(scenario_type);
CREATE INDEX idx_pro_forma_financial_statement_source_type ON pro_forma_financial_statement(source_type);
CREATE INDEX idx_pro_forma_financial_statement_statement_type ON pro_forma_financial_statement(statement_type);
CREATE INDEX idx_pro_forma_financial_statement_validation_status ON pro_forma_financial_statement(validation_status);

CREATE TRIGGER set_pro_forma_financial_statement_updated_at
  BEFORE UPDATE ON pro_forma_financial_statement
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ProjectionFeedback
CREATE TABLE projection_feedback (
  actual_variable_costs NUMERIC,
  divergence_trend TEXT,
  exceeds_threshold BOOLEAN,
  feedback_id TEXT PRIMARY KEY,
  post_adjustment_divergence NUMERIC,
  profile_id TEXT,
  projected_variable_costs NUMERIC,
  reporting_period DATE,
  variance_amount NUMERIC,
  variance_percentage NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE projection_feedback
  ADD CONSTRAINT fk_projection_feedback_profile_id
  FOREIGN KEY (profile_id) REFERENCES projection_profile(projection_profile_id);

CREATE INDEX idx_projection_feedback_profile_id ON projection_feedback(profile_id);

CREATE TRIGGER set_projection_feedback_updated_at
  BEFORE UPDATE ON projection_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ProjectionLearningEvent
CREATE TABLE projection_learning_event (
  cross_profile_relevant BOOLEAN,
  event_description TEXT,
  event_metadata TEXT[],
  event_timestamp TIMESTAMPTZ,
  event_type TEXT,
  impact_score INTEGER,
  learning_event_id TEXT PRIMARY KEY,
  profile_id TEXT,
  requires_analysis BOOLEAN,
  statement_id TEXT,
  triggered_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE projection_learning_event
  ADD CONSTRAINT fk_projection_learning_event_statement_id
  FOREIGN KEY (statement_id) REFERENCES financial_statement(statement_id);

ALTER TABLE projection_learning_event
  ADD CONSTRAINT fk_projection_learning_event_profile_id
  FOREIGN KEY (profile_id) REFERENCES projection_profile(projection_profile_id);

CREATE INDEX idx_projection_learning_event_statement_id ON projection_learning_event(statement_id);
CREATE INDEX idx_projection_learning_event_profile_id ON projection_learning_event(profile_id);
CREATE INDEX idx_projection_learning_event_event_type ON projection_learning_event(event_type);

CREATE TRIGGER set_projection_learning_event_updated_at
  BEFORE UPDATE ON projection_learning_event
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ProjectionProfilePerformance
CREATE TABLE projection_profile_performance (
  cogs_mae NUMERIC,
  cogs_variance_pct NUMERIC,
  counterparty_id TEXT,
  evaluation_date TIMESTAMPTZ,
  evaluation_period DATE,
  meets_threshold BOOLEAN,
  needs_profile_review BOOLEAN,
  overall_accuracy_score NUMERIC,
  performance_id TEXT PRIMARY KEY,
  profile_id TEXT,
  revenue_mae NUMERIC,
  revenue_variance_pct NUMERIC,
  statement_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE projection_profile_performance
  ADD CONSTRAINT fk_projection_profile_performance_counterparty_id
  FOREIGN KEY (counterparty_id) REFERENCES counterparty(counterparty_id);

ALTER TABLE projection_profile_performance
  ADD CONSTRAINT fk_projection_profile_performance_statement_id
  FOREIGN KEY (statement_id) REFERENCES financial_statement(statement_id);

ALTER TABLE projection_profile_performance
  ADD CONSTRAINT fk_projection_profile_performance_profile_id
  FOREIGN KEY (profile_id) REFERENCES projection_profile(projection_profile_id);

CREATE INDEX idx_projection_profile_performance_counterparty_id ON projection_profile_performance(counterparty_id);
CREATE INDEX idx_projection_profile_performance_statement_id ON projection_profile_performance(statement_id);
CREATE INDEX idx_projection_profile_performance_profile_id ON projection_profile_performance(profile_id);

CREATE TRIGGER set_projection_profile_performance_updated_at
  BEFORE UPDATE ON projection_profile_performance
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Relationship
CREATE TABLE relationship (
  assigned_team TEXT[],
  counterparty_ids TEXT[],
  counterparty_names TEXT[],
  last_review_date DATE,
  onboarding_date DATE,
  primary_banker_id TEXT,
  primary_contacts TEXT[],
  relationship_id TEXT PRIMARY KEY,
  relationship_name TEXT,
  relationship_state TEXT,
  relationship_type TEXT,
  revenue_metrics TEXT,
  status TEXT,
  total_exposure INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_relationship_relationship_type ON relationship(relationship_type);
CREATE INDEX idx_relationship_status ON relationship(status);

CREATE TRIGGER set_relationship_updated_at
  BEFORE UPDATE ON relationship
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ReportingSchedule
CREATE TABLE reporting_schedule (
  compliance_status TEXT,
  contract_id TEXT,
  counterparty_id TEXT,
  due_dates DATE[],
  expected_document_types TEXT[],
  frequency TEXT,
  grace_period_days INTEGER,
  last_received_date DATE,
  last_received_document_ids TEXT[],
  last_received_workflow_id TEXT,
  next_due_date DATE,
  next_reporting_period TEXT,
  reporting_schedule_id TEXT PRIMARY KEY,
  reporting_schedule_title TEXT,
  schedule_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reporting_schedule_compliance_status ON reporting_schedule(compliance_status);
CREATE INDEX idx_reporting_schedule_schedule_type ON reporting_schedule(schedule_type);
CREATE INDEX idx_reporting_schedule_next_due_date ON reporting_schedule(next_due_date);

CREATE TRIGGER set_reporting_schedule_updated_at
  BEFORE UPDATE ON reporting_schedule
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ReportingSubmission
CREATE TABLE reporting_submission (
  certification_date DATE,
  certification_provided BOOLEAN,
  certified_by TEXT,
  compliance_notes TEXT,
  days_early_late INTEGER,
  due_date DATE,
  obligation_id TEXT,
  reporting_period TEXT,
  reporting_period_end DATE,
  reporting_period_start DATE,
  review_date DATE,
  review_notes TEXT,
  review_status TEXT,
  reviewed_by TEXT,
  submission_date DATE,
  submission_id TEXT PRIMARY KEY,
  submission_method TEXT,
  submission_status TEXT,
  submitted_by TEXT,
  submitted_document_ids TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE reporting_submission
  ADD CONSTRAINT fk_reporting_submission_reviewed_by
  FOREIGN KEY (reviewed_by) REFERENCES corridor_banker(banker_id);

ALTER TABLE reporting_submission
  ADD CONSTRAINT fk_reporting_submission_submitted_document_ids
  FOREIGN KEY (submitted_document_ids) REFERENCES document(document_id);

ALTER TABLE reporting_submission
  ADD CONSTRAINT fk_reporting_submission_obligation_id
  FOREIGN KEY (obligation_id) REFERENCES obligation(obligation_id);

CREATE INDEX idx_reporting_submission_reviewed_by ON reporting_submission(reviewed_by);
CREATE INDEX idx_reporting_submission_submitted_document_ids ON reporting_submission(submitted_document_ids);
CREATE INDEX idx_reporting_submission_obligation_id ON reporting_submission(obligation_id);
CREATE INDEX idx_reporting_submission_review_status ON reporting_submission(review_status);
CREATE INDEX idx_reporting_submission_submission_status ON reporting_submission(submission_status);
CREATE INDEX idx_reporting_submission_due_date ON reporting_submission(due_date);

CREATE TRIGGER set_reporting_submission_updated_at
  BEFORE UPDATE ON reporting_submission
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RequestDocument
CREATE TABLE request_document (
  attachment_base64 TEXT,
  attachment_name TEXT,
  communication_id TEXT,
  document_media_item_rid TEXT,
  document_media_reference TEXT,
  document_text_extraction TEXT[],
  file_type TEXT,
  note TEXT,
  path TEXT,
  processed_timestamp TIMESTAMPTZ,
  request_document_id TEXT PRIMARY KEY,
  request_document_type TEXT,
  request_support_document_type TEXT,
  request_type TEXT,
  sent_timestamp TIMESTAMPTZ,
  title TEXT,
  uploaded_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_request_document_file_type ON request_document(file_type);
CREATE INDEX idx_request_document_request_document_type ON request_document(request_document_type);
CREATE INDEX idx_request_document_request_support_document_type ON request_document(request_support_document_type);
CREATE INDEX idx_request_document_request_type ON request_document(request_type);

CREATE TRIGGER set_request_document_updated_at
  BEFORE UPDATE ON request_document
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RequestProcess
CREATE TABLE request_process (
  created_by TEXT,
  created_on TIMESTAMPTZ,
  description TEXT,
  process_id TEXT PRIMARY KEY,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_request_process_created_on ON request_process(created_on);

CREATE TRIGGER set_request_process_updated_at
  BEFORE UPDATE ON request_process
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RequestDocumentJob
CREATE TABLE request_document_job (
  document_id TEXT,
  document_job_id TEXT PRIMARY KEY,
  finished_timestamp TIMESTAMPTZ,
  process_id TEXT,
  started_by TEXT,
  started_timestamp TIMESTAMPTZ,
  state TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE request_document_job
  ADD CONSTRAINT fk_request_document_job_process_id
  FOREIGN KEY (process_id) REFERENCES request_process(process_id);

ALTER TABLE request_document_job
  ADD CONSTRAINT fk_request_document_job_document_id
  FOREIGN KEY (document_id) REFERENCES request_document(request_document_id);

CREATE INDEX idx_request_document_job_process_id ON request_document_job(process_id);
CREATE INDEX idx_request_document_job_document_id ON request_document_job(document_id);

CREATE TRIGGER set_request_document_job_updated_at
  BEFORE UPDATE ON request_document_job
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RequestFieldDefinition
CREATE TABLE request_field_definition (
  definition TEXT,
  description TEXT,
  field_definition_id TEXT PRIMARY KEY,
  parent_definition_id TEXT,
  process_id TEXT,
  title TEXT,
  type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE request_field_definition
  ADD CONSTRAINT fk_request_field_definition_field_definition_id
  FOREIGN KEY (field_definition_id) REFERENCES request_field_definition(field_definition_id);

ALTER TABLE request_field_definition
  ADD CONSTRAINT fk_request_field_definition_process_id
  FOREIGN KEY (process_id) REFERENCES request_process(process_id);

CREATE INDEX idx_request_field_definition_field_definition_id ON request_field_definition(field_definition_id);
CREATE INDEX idx_request_field_definition_process_id ON request_field_definition(process_id);

CREATE TRIGGER set_request_field_definition_updated_at
  BEFORE UPDATE ON request_field_definition
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RequestFieldExtractionJob
CREATE TABLE request_field_extraction_job (
  completed_timestamp TIMESTAMPTZ,
  document_id TEXT,
  document_job_id TEXT,
  field_definition_id TEXT,
  field_extraction_job_id TEXT PRIMARY KEY,
  parent_id TEXT,
  prompt TEXT,
  raw_llm_response TEXT,
  reasoning TEXT,
  started_timestamp TIMESTAMPTZ,
  state TEXT,
  value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE request_field_extraction_job
  ADD CONSTRAINT fk_request_field_extraction_job_document_job_id
  FOREIGN KEY (document_job_id) REFERENCES request_document_job(document_job_id);

ALTER TABLE request_field_extraction_job
  ADD CONSTRAINT fk_request_field_extraction_job_field_definition_id
  FOREIGN KEY (field_definition_id) REFERENCES request_field_definition(field_definition_id);

ALTER TABLE request_field_extraction_job
  ADD CONSTRAINT fk_request_field_extraction_job_field_extraction_job_id
  FOREIGN KEY (field_extraction_job_id) REFERENCES request_field_extraction_job(field_extraction_job_id);

ALTER TABLE request_field_extraction_job
  ADD CONSTRAINT fk_request_field_extraction_job_document_id
  FOREIGN KEY (document_id) REFERENCES request_document(request_document_id);

CREATE INDEX idx_request_field_extraction_job_document_job_id ON request_field_extraction_job(document_job_id);
CREATE INDEX idx_request_field_extraction_job_field_definition_id ON request_field_extraction_job(field_definition_id);
CREATE INDEX idx_request_field_extraction_job_field_extraction_job_id ON request_field_extraction_job(field_extraction_job_id);
CREATE INDEX idx_request_field_extraction_job_document_id ON request_field_extraction_job(document_id);

CREATE TRIGGER set_request_field_extraction_job_updated_at
  BEFORE UPDATE ON request_field_extraction_job
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RequestFieldOption
CREATE TABLE request_field_option (
  field_definition_id TEXT,
  field_option_id TEXT PRIMARY KEY,
  llm_context TEXT,
  name TEXT,
  parent_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE request_field_option
  ADD CONSTRAINT fk_request_field_option_field_definition_id
  FOREIGN KEY (field_definition_id) REFERENCES request_field_definition(field_definition_id);

ALTER TABLE request_field_option
  ADD CONSTRAINT fk_request_field_option_field_option_id
  FOREIGN KEY (field_option_id) REFERENCES request_field_option(field_option_id);

CREATE INDEX idx_request_field_option_field_definition_id ON request_field_option(field_definition_id);
CREATE INDEX idx_request_field_option_field_option_id ON request_field_option(field_option_id);

CREATE TRIGGER set_request_field_option_updated_at
  BEFORE UPDATE ON request_field_option
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RequestIdentity
CREATE TABLE request_identity (
  allowed_values TEXT,
  canonical_definition TEXT,
  entity_id TEXT PRIMARY KEY,
  entity_name TEXT,
  entity_summary TEXT,
  entity_summary_embedding TEXT,
  entity_synonyms TEXT,
  entity_type TEXT,
  validation_rules TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_request_identity_entity_type ON request_identity(entity_type);

CREATE TRIGGER set_request_identity_updated_at
  BEFORE UPDATE ON request_identity
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RiskEvent
CREATE TABLE risk_event (
  client_impact_level TEXT,
  collateral_id TEXT,
  contract_id TEXT,
  counterparty_id TEXT,
  detection_date DATE,
  event_type TEXT,
  financial_impact INTEGER,
  object_type TEXT,
  obligation_id TEXT,
  regulatory_impact BOOLEAN,
  regulatory_reporting TEXT[],
  reporting_date DATE,
  reputational_impact_score INTEGER,
  resolution TEXT[],
  risk_event_id TEXT PRIMARY KEY,
  severity_level TEXT,
  status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_risk_event_event_type ON risk_event(event_type);
CREATE INDEX idx_risk_event_object_type ON risk_event(object_type);
CREATE INDEX idx_risk_event_status ON risk_event(status);

CREATE TRIGGER set_risk_event_updated_at
  BEFORE UPDATE ON risk_event
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- WorkflowEvent
CREATE TABLE workflow_event (
  changed_by_banker_id TEXT,
  event_notes TEXT,
  event_timestamp TIMESTAMPTZ,
  event_type TEXT,
  kyc_due_diligence_id TEXT,
  new_value TEXT,
  old_value TEXT,
  workflow_event_id TEXT PRIMARY KEY,
  workflow_event_name TEXT,
  workflow_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE workflow_event
  ADD CONSTRAINT fk_workflow_event_kyc_due_diligence_id
  FOREIGN KEY (kyc_due_diligence_id) REFERENCES kyc_due_diligence(kyc_due_diligence_id);

ALTER TABLE workflow_event
  ADD CONSTRAINT fk_workflow_event_changed_by_banker_id
  FOREIGN KEY (changed_by_banker_id) REFERENCES corridor_banker(banker_id);

ALTER TABLE workflow_event
  ADD CONSTRAINT fk_workflow_event_workflow_id
  FOREIGN KEY (workflow_id) REFERENCES workflow(workflow_id);

CREATE INDEX idx_workflow_event_kyc_due_diligence_id ON workflow_event(kyc_due_diligence_id);
CREATE INDEX idx_workflow_event_changed_by_banker_id ON workflow_event(changed_by_banker_id);
CREATE INDEX idx_workflow_event_workflow_id ON workflow_event(workflow_id);
CREATE INDEX idx_workflow_event_event_type ON workflow_event(event_type);

CREATE TRIGGER set_workflow_event_updated_at
  BEFORE UPDATE ON workflow_event
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

