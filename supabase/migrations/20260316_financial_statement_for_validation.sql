-- Pipeline table for financial statement validation workflow.
-- Mirrors financial_statement with added validation tracking columns.
-- Promotes to canonical financial_statement on validation.

CREATE TABLE IF NOT EXISTS financial_statement_for_validation (
  financial_statement_for_validation_id TEXT PRIMARY KEY,

  -- Financial metrics (numeric columns)
  accounts_payable NUMERIC,
  accounts_receivable NUMERIC,
  additional_paid_in_capital NUMERIC,
  cash_and_equivalents NUMERIC,
  cogs NUMERIC,
  common_stock NUMERIC,
  depreciation_amortization NUMERIC,
  equity NUMERIC,
  goodwill NUMERIC,
  gross_profit NUMERIC,
  income_before_taxes NUMERIC,
  income_tax_expense NUMERIC,
  intangible_assets NUMERIC,
  interest_expense NUMERIC,
  inventory NUMERIC,
  long_term_debt NUMERIC,
  net_income NUMERIC,
  notes_payable NUMERIC,
  operating_expenses NUMERIC,
  operating_income NUMERIC,
  other_comprehensive_income NUMERIC,
  ppe NUMERIC,
  retained_earnings NUMERIC,
  revenue NUMERIC,
  sga NUMERIC,
  short_term_debt NUMERIC,
  total_assets NUMERIC,
  total_current_assets NUMERIC,
  total_current_liabilities NUMERIC,
  total_liabilities NUMERIC,
  treasury_stock NUMERIC,
  wages_payable NUMERIC,

  -- Reference columns
  audit_id TEXT,
  confidence NUMERIC,
  contract_id TEXT,
  counterparty_id TEXT,
  counterparty_name TEXT,
  deal_id TEXT,
  document_id TEXT,
  industry_code INTEGER,
  obligation_id TEXT,
  period_end_date DATE,
  period_end_month TEXT,
  period_end_year INTEGER,
  projection_method TEXT,
  projection_profile TEXT,
  projection_profile_id TEXT,
  reporting_currency TEXT,
  statement_title TEXT,
  statement_type TEXT,
  template_assignment_date DATE,
  workflow_id TEXT,

  -- Pipeline-specific columns
  validation_status TEXT DEFAULT 'PENDING',
  is_user_override BOOLEAN DEFAULT false,
  override_justification TEXT,
  user_edited_columns TEXT[] DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fsfv_document_id ON financial_statement_for_validation(document_id);
CREATE INDEX IF NOT EXISTS idx_fsfv_counterparty_id ON financial_statement_for_validation(counterparty_id);
CREATE INDEX IF NOT EXISTS idx_fsfv_deal_id ON financial_statement_for_validation(deal_id);
CREATE INDEX IF NOT EXISTS idx_fsfv_validation_status ON financial_statement_for_validation(validation_status);

CREATE TRIGGER set_fsfv_updated_at
  BEFORE UPDATE ON financial_statement_for_validation
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
