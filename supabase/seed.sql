-- Seed data: Solar Valley test scenario
-- Solar Valley Energy is a solar panel manufacturer applying for a credit facility.
-- This seeds a realistic inbox with documents at various workflow stages.

-- Counterparties
insert into counterparties (id, name, entity_type, industry, credit_rating, contact_email, phone, address) values
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Solar Valley Energy Inc.', 'company', 'Renewable Energy', 'BBB+', 'ap@solarvalley.com', '(408) 555-0142', '1200 Sunnyvale Blvd, San Jose, CA 95134'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Helios Panel Supply Co.', 'company', 'Manufacturing', 'BB', 'billing@heliospanel.com', '(503) 555-0198', '340 Industrial Way, Portland, OR 97201'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Pacific Grid Services LLC', 'company', 'Utilities', 'A-', 'finance@pacificgrid.com', '(213) 555-0177', '800 Energy Plaza, Los Angeles, CA 90015'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'Green Horizon Developments', 'company', 'Real Estate Development', 'BB+', 'accounts@greenhorizon.dev', '(602) 555-0134', '55 Desert View Dr, Phoenix, AZ 85004'),
  ('a1b2c3d4-0005-4000-8000-000000000005', 'Maria Chen', 'individual', null, null, 'maria.chen@email.com', '(415) 555-0163', '482 Oak Street, San Francisco, CA 94102');

-- Documents from Solar Valley Energy (primary scenario)
insert into documents (id, counterparty_id, file_name, document_type, content_classification, summary, received_at, source) values
  ('b1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001',
   'solar_valley_credit_application_2026.pdf', 'credit_application', 'credit_request',
   'Credit facility application for $2.5M revolving line to fund Q3-Q4 panel inventory purchases. Requesting 18-month term at prime + 2.5%.',
   '2026-03-03 09:15:00+00', 'email'),

  ('b1b2c3d4-0002-4000-8000-000000000002', 'a1b2c3d4-0001-4000-8000-000000000001',
   'solar_valley_2025_annual_financials.pdf', 'financial_statement', 'financial_report',
   'FY2025 audited financials showing $18.2M revenue (up 34% YoY), EBITDA margin of 12.1%, and current ratio of 1.8x. Net debt/EBITDA at 2.4x.',
   '2026-03-03 09:16:00+00', 'email'),

  ('b1b2c3d4-0003-4000-8000-000000000003', 'a1b2c3d4-0001-4000-8000-000000000001',
   'solar_valley_tax_return_2025.pdf', 'tax_return', 'tax_filing',
   'Federal corporate tax return for FY2025. Taxable income of $1.92M. No outstanding liens or tax disputes noted.',
   '2026-03-04 14:30:00+00', 'email'),

  ('b1b2c3d4-0004-4000-8000-000000000004', 'a1b2c3d4-0001-4000-8000-000000000001',
   'solar_valley_bank_statements_q4_2025.pdf', 'bank_statement', 'banking',
   'Q4 2025 business checking and savings statements from First Republic. Average daily balance of $820K, no overdrafts or NSF items.',
   '2026-03-04 14:32:00+00', 'email'),

  ('b1b2c3d4-0005-4000-8000-000000000005', 'a1b2c3d4-0001-4000-8000-000000000001',
   'solar_valley_supply_contract_helios.pdf', 'contract', 'legal_agreement',
   'Master supply agreement with Helios Panel Supply Co. for silicon wafer procurement. 3-year term, volume-based pricing tiers, 60-day payment terms.',
   '2026-03-05 10:00:00+00', 'portal_upload');

-- Documents from other counterparties
insert into documents (id, counterparty_id, file_name, document_type, content_classification, summary, received_at, source) values
  ('b1b2c3d4-0006-4000-8000-000000000006', 'a1b2c3d4-0002-4000-8000-000000000002',
   'helios_invoice_INV-2026-0892.pdf', 'invoice', 'accounts_payable',
   'Invoice for 4,200 monocrystalline silicon wafers. Total: $186,340. Payment due: April 15, 2026. References PO #SV-2026-0445.',
   '2026-03-05 11:20:00+00', 'email'),

  ('b1b2c3d4-0007-4000-8000-000000000007', 'a1b2c3d4-0003-4000-8000-000000000003',
   'pacific_grid_po_PG-7821.pdf', 'purchase_order', 'accounts_receivable',
   'Purchase order for 1,500 residential solar panel units at $420/unit. Total: $630,000. Delivery to LA distribution center by April 30, 2026.',
   '2026-03-06 08:45:00+00', 'portal_upload'),

  ('b1b2c3d4-0008-4000-8000-000000000008', 'a1b2c3d4-0004-4000-8000-000000000004',
   'green_horizon_installation_contract.pdf', 'contract', 'legal_agreement',
   'Proposed installation contract for 320-unit residential solar array in Scottsdale development. Contract value: $1.12M. Milestone-based payment schedule.',
   '2026-03-06 13:10:00+00', 'email'),

  ('b1b2c3d4-0009-4000-8000-000000000009', 'a1b2c3d4-0005-4000-8000-000000000005',
   'chen_personal_financial_statement.pdf', 'financial_statement', 'financial_report',
   'Personal financial statement for Maria Chen (guarantor). Total assets: $3.4M, total liabilities: $890K. Net worth: $2.51M.',
   '2026-03-06 16:00:00+00', 'email'),

  ('b1b2c3d4-0010-4000-8000-000000000010', 'a1b2c3d4-0001-4000-8000-000000000001',
   'solar_valley_ar_aging_feb_2026.xlsx', 'other', 'accounts_receivable',
   'Accounts receivable aging report as of Feb 28, 2026. Total AR: $2.1M. 82% current, 11% 30-60 days, 5% 60-90 days, 2% over 90 days.',
   '2026-03-07 07:30:00+00', 'email');

-- Inbox items with varying workflow statuses
insert into inbox_items (id, document_id, counterparty_id, workflow_status, priority, assigned_to, notes, reviewed_at, reviewed_by) values
  -- Solar Valley credit application - high priority, in review
  ('c1b2c3d4-0001-4000-8000-000000000001', 'b1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001',
   'in_review', 'high', 'Sarah Johnson',
   'Key application for Q1 pipeline. Need to cross-reference with financials and tax returns before credit committee.',
   null, null),

  -- Solar Valley financials - approved
  ('c1b2c3d4-0002-4000-8000-000000000002', 'b1b2c3d4-0002-4000-8000-000000000002', 'a1b2c3d4-0001-4000-8000-000000000001',
   'approved', 'high', 'Sarah Johnson',
   'Financials verified against audit report. Revenue growth and margins look solid. Leverage within acceptable range.',
   '2026-03-04 11:00:00+00', 'Sarah Johnson'),

  -- Solar Valley tax return - approved
  ('c1b2c3d4-0003-4000-8000-000000000003', 'b1b2c3d4-0003-4000-8000-000000000003', 'a1b2c3d4-0001-4000-8000-000000000001',
   'approved', 'medium', 'Sarah Johnson',
   'Tax return consistent with reported financials. No issues.',
   '2026-03-05 09:00:00+00', 'Sarah Johnson'),

  -- Solar Valley bank statements - needs more info
  ('c1b2c3d4-0004-4000-8000-000000000004', 'b1b2c3d4-0004-4000-8000-000000000004', 'a1b2c3d4-0001-4000-8000-000000000001',
   'needs_info', 'medium', 'Sarah Johnson',
   'Q4 statements received but need Q1-Q3 2025 statements to complete the trailing twelve-month analysis.',
   null, null),

  -- Solar Valley supply contract - pending review
  ('c1b2c3d4-0005-4000-8000-000000000005', 'b1b2c3d4-0005-4000-8000-000000000005', 'a1b2c3d4-0001-4000-8000-000000000001',
   'pending_review', 'medium', null,
   null, null, null),

  -- Helios invoice - pending review
  ('c1b2c3d4-0006-4000-8000-000000000006', 'b1b2c3d4-0006-4000-8000-000000000006', 'a1b2c3d4-0002-4000-8000-000000000002',
   'pending_review', 'low', null,
   null, null, null),

  -- Pacific Grid PO - approved
  ('c1b2c3d4-0007-4000-8000-000000000007', 'b1b2c3d4-0007-4000-8000-000000000007', 'a1b2c3d4-0003-4000-8000-000000000003',
   'approved', 'medium', 'Mike Torres',
   'PO validated against existing credit terms. Pacific Grid has A- rating and strong payment history.',
   '2026-03-06 14:30:00+00', 'Mike Torres'),

  -- Green Horizon contract - in review, urgent
  ('c1b2c3d4-0008-4000-8000-000000000008', 'b1b2c3d4-0008-4000-8000-000000000008', 'a1b2c3d4-0004-4000-8000-000000000004',
   'in_review', 'urgent', 'Sarah Johnson',
   'Large installation contract needs legal review for liability terms. Milestone payment schedule requires credit risk assessment.',
   null, null),

  -- Maria Chen PFS - pending review
  ('c1b2c3d4-0009-4000-8000-000000000009', 'b1b2c3d4-0009-4000-8000-000000000009', 'a1b2c3d4-0005-4000-8000-000000000005',
   'pending_review', 'high', null,
   null, null, null),

  -- Solar Valley AR aging - pending review (just arrived)
  ('c1b2c3d4-0010-4000-8000-000000000010', 'b1b2c3d4-0010-4000-8000-000000000010', 'a1b2c3d4-0001-4000-8000-000000000001',
   'pending_review', 'medium', null,
   null, null, null);
