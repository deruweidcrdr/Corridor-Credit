import type {
  InboxItemWithRelations,
  WorkflowStatus,
  DocumentType,
  ContentClassification,
  Priority,
} from "./database.types";

// Local seed data used when Supabase is not connected.
// Mirrors supabase/seed.sql so the inbox page works without a running database.

const counterparties = [
  {
    id: "a1b2c3d4-0001-4000-8000-000000000001",
    name: "Solar Valley Energy Inc.",
    entity_type: "company" as const,
    industry: "Renewable Energy",
    credit_rating: "BBB+",
    contact_email: "ap@solarvalley.com",
    phone: "(408) 555-0142",
    address: "1200 Sunnyvale Blvd, San Jose, CA 95134",
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
  },
  {
    id: "a1b2c3d4-0002-4000-8000-000000000002",
    name: "Helios Panel Supply Co.",
    entity_type: "company" as const,
    industry: "Manufacturing",
    credit_rating: "BB",
    contact_email: "billing@heliospanel.com",
    phone: "(503) 555-0198",
    address: "340 Industrial Way, Portland, OR 97201",
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
  },
  {
    id: "a1b2c3d4-0003-4000-8000-000000000003",
    name: "Pacific Grid Services LLC",
    entity_type: "company" as const,
    industry: "Utilities",
    credit_rating: "A-",
    contact_email: "finance@pacificgrid.com",
    phone: "(213) 555-0177",
    address: "800 Energy Plaza, Los Angeles, CA 90015",
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
  },
  {
    id: "a1b2c3d4-0004-4000-8000-000000000004",
    name: "Green Horizon Developments",
    entity_type: "company" as const,
    industry: "Real Estate Development",
    credit_rating: "BB+",
    contact_email: "accounts@greenhorizon.dev",
    phone: "(602) 555-0134",
    address: "55 Desert View Dr, Phoenix, AZ 85004",
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
  },
  {
    id: "a1b2c3d4-0005-4000-8000-000000000005",
    name: "Maria Chen",
    entity_type: "individual" as const,
    industry: null,
    credit_rating: null,
    contact_email: "maria.chen@email.com",
    phone: "(415) 555-0163",
    address: "482 Oak Street, San Francisco, CA 94102",
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
  },
];

const documents = [
  {
    id: "b1b2c3d4-0001-4000-8000-000000000001",
    counterparty_id: "a1b2c3d4-0001-4000-8000-000000000001",
    file_name: "solar_valley_credit_application_2026.pdf",
    document_type: "credit_application" as DocumentType,
    content_classification: "credit_request" as ContentClassification,
    summary:
      "Credit facility application for $2.5M revolving line to fund Q3-Q4 panel inventory purchases. Requesting 18-month term at prime + 2.5%.",
    received_at: "2026-03-03T09:15:00Z",
    source: "email",
    created_at: "2026-03-03T09:15:00Z",
  },
  {
    id: "b1b2c3d4-0002-4000-8000-000000000002",
    counterparty_id: "a1b2c3d4-0001-4000-8000-000000000001",
    file_name: "solar_valley_2025_annual_financials.pdf",
    document_type: "financial_statement" as DocumentType,
    content_classification: "financial_report" as ContentClassification,
    summary:
      "FY2025 audited financials showing $18.2M revenue (up 34% YoY), EBITDA margin of 12.1%, and current ratio of 1.8x. Net debt/EBITDA at 2.4x.",
    received_at: "2026-03-03T09:16:00Z",
    source: "email",
    created_at: "2026-03-03T09:16:00Z",
  },
  {
    id: "b1b2c3d4-0003-4000-8000-000000000003",
    counterparty_id: "a1b2c3d4-0001-4000-8000-000000000001",
    file_name: "solar_valley_tax_return_2025.pdf",
    document_type: "tax_return" as DocumentType,
    content_classification: "tax_filing" as ContentClassification,
    summary:
      "Federal corporate tax return for FY2025. Taxable income of $1.92M. No outstanding liens or tax disputes noted.",
    received_at: "2026-03-04T14:30:00Z",
    source: "email",
    created_at: "2026-03-04T14:30:00Z",
  },
  {
    id: "b1b2c3d4-0004-4000-8000-000000000004",
    counterparty_id: "a1b2c3d4-0001-4000-8000-000000000001",
    file_name: "solar_valley_bank_statements_q4_2025.pdf",
    document_type: "bank_statement" as DocumentType,
    content_classification: "banking" as ContentClassification,
    summary:
      "Q4 2025 business checking and savings statements from First Republic. Average daily balance of $820K, no overdrafts or NSF items.",
    received_at: "2026-03-04T14:32:00Z",
    source: "email",
    created_at: "2026-03-04T14:32:00Z",
  },
  {
    id: "b1b2c3d4-0005-4000-8000-000000000005",
    counterparty_id: "a1b2c3d4-0001-4000-8000-000000000001",
    file_name: "solar_valley_supply_contract_helios.pdf",
    document_type: "contract" as DocumentType,
    content_classification: "legal_agreement" as ContentClassification,
    summary:
      "Master supply agreement with Helios Panel Supply Co. for silicon wafer procurement. 3-year term, volume-based pricing tiers, 60-day payment terms.",
    received_at: "2026-03-05T10:00:00Z",
    source: "portal_upload",
    created_at: "2026-03-05T10:00:00Z",
  },
  {
    id: "b1b2c3d4-0006-4000-8000-000000000006",
    counterparty_id: "a1b2c3d4-0002-4000-8000-000000000002",
    file_name: "helios_invoice_INV-2026-0892.pdf",
    document_type: "invoice" as DocumentType,
    content_classification: "accounts_payable" as ContentClassification,
    summary:
      "Invoice for 4,200 monocrystalline silicon wafers. Total: $186,340. Payment due: April 15, 2026. References PO #SV-2026-0445.",
    received_at: "2026-03-05T11:20:00Z",
    source: "email",
    created_at: "2026-03-05T11:20:00Z",
  },
  {
    id: "b1b2c3d4-0007-4000-8000-000000000007",
    counterparty_id: "a1b2c3d4-0003-4000-8000-000000000003",
    file_name: "pacific_grid_po_PG-7821.pdf",
    document_type: "purchase_order" as DocumentType,
    content_classification: "accounts_receivable" as ContentClassification,
    summary:
      "Purchase order for 1,500 residential solar panel units at $420/unit. Total: $630,000. Delivery to LA distribution center by April 30, 2026.",
    received_at: "2026-03-06T08:45:00Z",
    source: "portal_upload",
    created_at: "2026-03-06T08:45:00Z",
  },
  {
    id: "b1b2c3d4-0008-4000-8000-000000000008",
    counterparty_id: "a1b2c3d4-0004-4000-8000-000000000004",
    file_name: "green_horizon_installation_contract.pdf",
    document_type: "contract" as DocumentType,
    content_classification: "legal_agreement" as ContentClassification,
    summary:
      "Proposed installation contract for 320-unit residential solar array in Scottsdale development. Contract value: $1.12M. Milestone-based payment schedule.",
    received_at: "2026-03-06T13:10:00Z",
    source: "email",
    created_at: "2026-03-06T13:10:00Z",
  },
  {
    id: "b1b2c3d4-0009-4000-8000-000000000009",
    counterparty_id: "a1b2c3d4-0005-4000-8000-000000000005",
    file_name: "chen_personal_financial_statement.pdf",
    document_type: "financial_statement" as DocumentType,
    content_classification: "financial_report" as ContentClassification,
    summary:
      "Personal financial statement for Maria Chen (guarantor). Total assets: $3.4M, total liabilities: $890K. Net worth: $2.51M.",
    received_at: "2026-03-06T16:00:00Z",
    source: "email",
    created_at: "2026-03-06T16:00:00Z",
  },
  {
    id: "b1b2c3d4-0010-4000-8000-000000000010",
    counterparty_id: "a1b2c3d4-0001-4000-8000-000000000001",
    file_name: "solar_valley_ar_aging_feb_2026.xlsx",
    document_type: "other" as DocumentType,
    content_classification: "accounts_receivable" as ContentClassification,
    summary:
      "Accounts receivable aging report as of Feb 28, 2026. Total AR: $2.1M. 82% current, 11% 30-60 days, 5% 60-90 days, 2% over 90 days.",
    received_at: "2026-03-07T07:30:00Z",
    source: "email",
    created_at: "2026-03-07T07:30:00Z",
  },
];

interface SeedInboxItem {
  id: string;
  document_id: string;
  counterparty_id: string;
  workflow_status: WorkflowStatus;
  priority: Priority;
  assigned_to: string | null;
  notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

const inboxItems: SeedInboxItem[] = [
  {
    id: "c1b2c3d4-0001-4000-8000-000000000001",
    document_id: "b1b2c3d4-0001-4000-8000-000000000001",
    counterparty_id: "a1b2c3d4-0001-4000-8000-000000000001",
    workflow_status: "in_review",
    priority: "high",
    assigned_to: "Sarah Johnson",
    notes:
      "Key application for Q1 pipeline. Need to cross-reference with financials and tax returns before credit committee.",
    reviewed_at: null,
    reviewed_by: null,
    created_at: "2026-03-03T09:15:00Z",
    updated_at: "2026-03-03T10:00:00Z",
  },
  {
    id: "c1b2c3d4-0002-4000-8000-000000000002",
    document_id: "b1b2c3d4-0002-4000-8000-000000000002",
    counterparty_id: "a1b2c3d4-0001-4000-8000-000000000001",
    workflow_status: "approved",
    priority: "high",
    assigned_to: "Sarah Johnson",
    notes:
      "Financials verified against audit report. Revenue growth and margins look solid. Leverage within acceptable range.",
    reviewed_at: "2026-03-04T11:00:00Z",
    reviewed_by: "Sarah Johnson",
    created_at: "2026-03-03T09:16:00Z",
    updated_at: "2026-03-04T11:00:00Z",
  },
  {
    id: "c1b2c3d4-0003-4000-8000-000000000003",
    document_id: "b1b2c3d4-0003-4000-8000-000000000003",
    counterparty_id: "a1b2c3d4-0001-4000-8000-000000000001",
    workflow_status: "approved",
    priority: "medium",
    assigned_to: "Sarah Johnson",
    notes: "Tax return consistent with reported financials. No issues.",
    reviewed_at: "2026-03-05T09:00:00Z",
    reviewed_by: "Sarah Johnson",
    created_at: "2026-03-04T14:30:00Z",
    updated_at: "2026-03-05T09:00:00Z",
  },
  {
    id: "c1b2c3d4-0004-4000-8000-000000000004",
    document_id: "b1b2c3d4-0004-4000-8000-000000000004",
    counterparty_id: "a1b2c3d4-0001-4000-8000-000000000001",
    workflow_status: "needs_info",
    priority: "medium",
    assigned_to: "Sarah Johnson",
    notes:
      "Q4 statements received but need Q1-Q3 2025 statements to complete the trailing twelve-month analysis.",
    reviewed_at: null,
    reviewed_by: null,
    created_at: "2026-03-04T14:32:00Z",
    updated_at: "2026-03-04T15:00:00Z",
  },
  {
    id: "c1b2c3d4-0005-4000-8000-000000000005",
    document_id: "b1b2c3d4-0005-4000-8000-000000000005",
    counterparty_id: "a1b2c3d4-0001-4000-8000-000000000001",
    workflow_status: "pending_review",
    priority: "medium",
    assigned_to: null,
    notes: null,
    reviewed_at: null,
    reviewed_by: null,
    created_at: "2026-03-05T10:00:00Z",
    updated_at: "2026-03-05T10:00:00Z",
  },
  {
    id: "c1b2c3d4-0006-4000-8000-000000000006",
    document_id: "b1b2c3d4-0006-4000-8000-000000000006",
    counterparty_id: "a1b2c3d4-0002-4000-8000-000000000002",
    workflow_status: "pending_review",
    priority: "low",
    assigned_to: null,
    notes: null,
    reviewed_at: null,
    reviewed_by: null,
    created_at: "2026-03-05T11:20:00Z",
    updated_at: "2026-03-05T11:20:00Z",
  },
  {
    id: "c1b2c3d4-0007-4000-8000-000000000007",
    document_id: "b1b2c3d4-0007-4000-8000-000000000007",
    counterparty_id: "a1b2c3d4-0003-4000-8000-000000000003",
    workflow_status: "approved",
    priority: "medium",
    assigned_to: "Mike Torres",
    notes:
      "PO validated against existing credit terms. Pacific Grid has A- rating and strong payment history.",
    reviewed_at: "2026-03-06T14:30:00Z",
    reviewed_by: "Mike Torres",
    created_at: "2026-03-06T08:45:00Z",
    updated_at: "2026-03-06T14:30:00Z",
  },
  {
    id: "c1b2c3d4-0008-4000-8000-000000000008",
    document_id: "b1b2c3d4-0008-4000-8000-000000000008",
    counterparty_id: "a1b2c3d4-0004-4000-8000-000000000004",
    workflow_status: "in_review",
    priority: "urgent",
    assigned_to: "Sarah Johnson",
    notes:
      "Large installation contract needs legal review for liability terms. Milestone payment schedule requires credit risk assessment.",
    reviewed_at: null,
    reviewed_by: null,
    created_at: "2026-03-06T13:10:00Z",
    updated_at: "2026-03-06T14:00:00Z",
  },
  {
    id: "c1b2c3d4-0009-4000-8000-000000000009",
    document_id: "b1b2c3d4-0009-4000-8000-000000000009",
    counterparty_id: "a1b2c3d4-0005-4000-8000-000000000005",
    workflow_status: "pending_review",
    priority: "high",
    assigned_to: null,
    notes: null,
    reviewed_at: null,
    reviewed_by: null,
    created_at: "2026-03-06T16:00:00Z",
    updated_at: "2026-03-06T16:00:00Z",
  },
  {
    id: "c1b2c3d4-0010-4000-8000-000000000010",
    document_id: "b1b2c3d4-0010-4000-8000-000000000010",
    counterparty_id: "a1b2c3d4-0001-4000-8000-000000000001",
    workflow_status: "pending_review",
    priority: "medium",
    assigned_to: null,
    notes: null,
    reviewed_at: null,
    reviewed_by: null,
    created_at: "2026-03-07T07:30:00Z",
    updated_at: "2026-03-07T07:30:00Z",
  },
];

export function getSeedInboxItems(): InboxItemWithRelations[] {
  return inboxItems.map((item) => {
    const doc = documents.find((d) => d.id === item.document_id)!;
    const cp = counterparties.find((c) => c.id === item.counterparty_id)!;
    return {
      ...item,
      documents: doc,
      counterparties: cp,
    };
  });
}
