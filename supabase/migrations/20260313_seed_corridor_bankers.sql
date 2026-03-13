-- Seed corridor_banker table with Corridor Credit team members
-- Source: Corridor Banker.csv

BEGIN;

INSERT INTO corridor_banker (
  banker_id, full_name, title, status, employee_id, office_location,
  role_id, role_name, effective_date, permission_type, resource_type,
  access_level, manager_id, department, cost_center, loan_approval_limit,
  industry_specializations, product_certifications, assigned_relationships
) VALUES
(
  'BKR_20240101_001', 'Jennifer Martinez', 'Senior Relationship Manager', 'ACTIVE',
  'EMP123456', 'NEW_YORK', 'ROLE_001', 'SENIOR_RM', '2020-01-01',
  'CREDIT_APPROVAL', 'LOAN', 'APPROVE_TO_5000000', 'BKR_20240101_999',
  'COMMERCIAL_BANKING', 'NY_CB_001', 5000000,
  '[TECHNOLOGY,HEALTHCARE]',
  '[{product_type: TERM_LOAN,certification_date: 1/15/23,expiration_date: 1/15/24}]',
  '[REL_20240101_001]'
),
(
  'BKR_20240102_001', 'Robert Wilson', 'Senior Relationship Manager', 'ACTIVE',
  'EMP123457', 'CHICAGO', 'ROLE_001', 'SENIOR_RM', '2018-01-01',
  'CREDIT_APPROVAL', 'LOAN', 'APPROVE_TO_10000000', 'BKR_20240102_999',
  'COMMERCIAL_BANKING', 'CHI_CB_001', 10000000,
  '[AGRICULTURE,FOOD_PROCESSING]',
  '[{product_type: REVOLVING,certification_date: 2/15/23,expiration_date: 2/15/24}]',
  '[REL_20240102_001]'
)
ON CONFLICT (banker_id) DO NOTHING;

COMMIT;
