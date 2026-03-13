// ---------------------------------------------------------------------------
// Inbox UI data – types and seed content matching the Meridian / Solar Valley
// scenarios shown in the Corridor Credit workbench.
// ---------------------------------------------------------------------------

export interface Email {
  id: string;
  subject: string;
  from: string;
  to: string;
  sent_at: string;
  body: string;
  is_read: boolean;
  attachments: Attachment[];
}

export interface Attachment {
  id: string;
  file_name: string;
  counterparty_name: string;
  counterparty_type: string;
  classification: string;
  classification_role: string;
  pages: number;
  storage_url?: string;
  mock_doc: MockDocument;
  /** Linked WorkflowForValidation ID (from pipeline) */
  workflow_for_validation_id?: string;
  /** Current workflow stage from the WFV record */
  workflow_stage?: string;
  /** WFV properties for the metadata strip */
  wfv_counterparty_type?: string;
  wfv_relationship_status?: string;
  wfv_document_type?: string;
  wfv_initial_extraction_stage?: string;
}

export interface MockDocument {
  title: string;
  date: string;
  parties: { name: string; role: string }[];
}

export interface InboxNotification {
  id: string;
  type: "alert" | "workflow";
  label: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Nav items for the sidebar
// ---------------------------------------------------------------------------

export const NAV_ITEMS = [
  "Inbox & Alerts",
  "Statement Analysis",
  "Contract Analysis",
  "Projections",
  "Credit Analysis",
  "Approvals",
  "Enterprise",
] as const;

// ---------------------------------------------------------------------------
// Emails
// ---------------------------------------------------------------------------

export const emails: Email[] = [
  {
    id: "email-1",
    subject: "Meridian opportunity",
    from: "elliott.brent@gmail.com",
    to: "elliott@corridor.credit",
    sent_at: "Feb 22, 2026, 3:48 PM",
    is_read: false,
    body: `Dear Corridor Credit Team,

I am writing on behalf of my client, Meridian Precision Manufacturing, LLC (\u201CMeridian\u201D or the \u201CCompany\u201D), in connection with the proposed $20 million senior secured credit facility. As discussed in our preliminary conversations, we are pleased to submit the transaction documentation for your review and consideration.

TRANSACTION OVERVIEW Meridian Precision Manufacturing is a Portland-based precision machining company serving aerospace, defense, and industrial customers throughout the Pacific Northwest. The Company is seeking financing to support working capital needs and fund planned equipment acquisitions to expand capacity. Proposed Facility Structure: - $8,000,000 Revolving Credit Facility (Pacific Northwest Bank, N.A.) - $12,000,000 Term Loan Facility (Corridor Credit Fund I, LP) The Company has strong fundamentals, with trailing twelve-month EBITDA of approximately $5.6 million and a seasoned management team led by CEO Marcus Chen, who founded the business in 2018.

ATTACHED DOCUMENTS Please find attached the following transaction documents for your review:

1. Credit Agreement - Contains the definitive terms for both the Revolving Credit Facility and Term Loan Facility, including financial covenants, reporting requirements, and conditions precedent. 2. Security Agreement - Details the collateral package, including equipment schedules, deposit account control arrangements, and UCC filing information. 3. Intercreditor Agreement - Establishes the split-collateral priority structure between the Revolver Lender and Term Loan Lender. 4. Financial Statements - Three years of audited historical financials (2022-2024) and three years of management projections (2025-2027), including covenant compliance analysis and sensitivity testing.

KEY TERMS SUMMARY Borrower: Meridian Precision Manufacturing, LLC Total Facilities: $20,000,000 Term Loan Rate: SOFR + 325 bps Revolver Rate: SOFR + 250 bps Term Loan Maturity: January 15, 2031 (5 years) Revolver Maturity: January 15, 2029 (3 years) Key Covenants: DSCR \u2265 1.25x, Leverage \u2264 3.25x, FCCR \u2265 1.15x

NEXT STEPS We would welcome the opportunity to schedule a call to discuss the transaction in greater detail and address any questions your team may have during the diligence process. The Company\u2019s management team is available to participate as needed. Please do not hesitate to contact me directly if you require any additional information or documentation.

Best regards,
Jennifer Morrison
Partner
Cascade Legal Partners LLP
1200 SW Fifth Avenue, Suite 2400
Portland, Oregon 97204
Direct: (503) 555-0142
Email: jmorrison@cascadelegal.com

\u2014 CONFIDENTIALITY NOTICE: This email and any attachments are for the exclusive and confidential use of the intended recipient. If you are not the intended recipient, please do not read, distribute, or take action based on this message.`,
    attachments: [
      {
        id: "att-1",
        file_name: "Security_Agreement_Meridian_Precision.pdf",
        counterparty_name: "Meridian Precision Manufacturing, LLC",
        counterparty_type: "PROSPECT",
        classification: "CONTRACT_EXTRACTION",
        classification_role: "BORROWER",
        pages: 6,
        mock_doc: {
          title: "SECURITY AGREEMENT",
          date: "January 15, 2026",
          parties: [
            {
              name: "MERIDIAN PRECISION MANUFACTURING, LLC",
              role: "as Grantor",
            },
            {
              name: "CORRIDOR CREDIT FUND I, LP",
              role: "as Collateral Agent for the Secured Parties",
            },
          ],
        },
      },
      {
        id: "att-2",
        file_name: "Intercreditor_Agreement_Meridian_Precision.pdf",
        counterparty_name: "Meridian Precision Manufacturing, LLC",
        counterparty_type: "PROSPECT",
        classification: "CONTRACT_EXTRACTION",
        classification_role: "LENDER",
        pages: 4,
        mock_doc: {
          title: "INTERCREDITOR AGREEMENT",
          date: "January 15, 2026",
          parties: [
            { name: "PACIFIC NORTHWEST BANK, N.A.", role: "as Revolving Lender" },
            { name: "CORRIDOR CREDIT FUND I, LP", role: "as Term Lender" },
          ],
        },
      },
      {
        id: "att-3",
        file_name: "Credit_Agreement_Meridian_Precision.pdf",
        counterparty_name: "Meridian Precision Manufacturing, LLC",
        counterparty_type: "PROSPECT",
        classification: "CONTRACT_EXTRACTION",
        classification_role: "BORROWER",
        pages: 12,
        mock_doc: {
          title: "CREDIT AGREEMENT",
          date: "January 15, 2026",
          parties: [
            {
              name: "MERIDIAN PRECISION MANUFACTURING, LLC",
              role: "as Borrower",
            },
            {
              name: "PACIFIC NORTHWEST BANK, N.A.",
              role: "as Revolving Lender and Administrative Agent",
            },
            { name: "CORRIDOR CREDIT FUND I, LP", role: "as Term Lender" },
          ],
        },
      },
      {
        id: "att-4",
        file_name: "Financial_Statements_Meridian_Precision.pdf",
        counterparty_name: "Meridian Precision Manufacturing, LLC",
        counterparty_type: "PROSPECT",
        classification: "FINANCIAL_EXTRACTION",
        classification_role: "BORROWER",
        pages: 24,
        mock_doc: {
          title: "AUDITED FINANCIAL STATEMENTS",
          date: "For the Years Ended December 31, 2022, 2023, and 2024",
          parties: [
            {
              name: "MERIDIAN PRECISION MANUFACTURING, LLC",
              role: "Together with Management Projections for 2025\u20132027",
            },
          ],
        },
      },
    ],
  },
  {
    id: "email-2",
    subject:
      "Introduction - $250MM Solar Valley Renewable Energy Project Financing Opportunity",
    from: "david.park@solarvalleyholdings.com",
    to: "elliott@corridor.credit",
    sent_at: "Feb 20, 2026, 10:15 AM",
    is_read: false,
    body: `Dear Corridor Credit Team,

I am writing to introduce an exciting renewable energy project financing opportunity on behalf of Solar Valley Holdings, LLC.

PROJECT OVERVIEW Solar Valley Holdings is developing a 250MW utility-scale solar photovoltaic project located in the Mojave Desert region of Southern California. The project has secured a 25-year Power Purchase Agreement (PPA) with Southern California Edison at a fixed rate of $38/MWh, providing strong long-term contracted cash flows.

Total project cost is estimated at $250 million, with a target debt-to-equity ratio of 75/25. We are seeking a senior secured construction-to-term loan facility of approximately $187.5 million.

The project benefits from strong solar irradiance (5.8 kWh/m\u00B2/day annual average), proven technology (LONGi Hi-MO 7 bifacial modules), and an experienced EPC contractor (SunBuild Engineering) with a guaranteed completion date.

We have attached the preliminary information memorandum, project financial model, draft term sheet, and environmental impact assessment for your review.

We would welcome the opportunity to discuss this opportunity in greater detail at your earliest convenience.

Best regards,
David Park
Managing Director
Solar Valley Holdings, LLC
Direct: (702) 555-0188
Email: david.park@solarvalleyholdings.com`,
    attachments: [
      {
        id: "att-5",
        file_name: "Solar_Valley_Information_Memorandum.pdf",
        counterparty_name: "Solar Valley Holdings, LLC",
        counterparty_type: "PROSPECT",
        classification: "FINANCIAL_EXTRACTION",
        classification_role: "BORROWER",
        pages: 42,
        mock_doc: {
          title: "CONFIDENTIAL INFORMATION MEMORANDUM",
          date: "February 2026",
          parties: [
            {
              name: "SOLAR VALLEY HOLDINGS, LLC",
              role: "250MW Mojave Solar PV Project",
            },
          ],
        },
      },
      {
        id: "att-6",
        file_name: "Solar_Valley_Financial_Model.xlsx",
        counterparty_name: "Solar Valley Holdings, LLC",
        counterparty_type: "PROSPECT",
        classification: "FINANCIAL_EXTRACTION",
        classification_role: "BORROWER",
        pages: 1,
        mock_doc: {
          title: "PROJECT FINANCIAL MODEL",
          date: "February 2026",
          parties: [
            {
              name: "SOLAR VALLEY HOLDINGS, LLC",
              role: "Base Case, Downside, and Stress Scenarios",
            },
          ],
        },
      },
      {
        id: "att-7",
        file_name: "Solar_Valley_Draft_Term_Sheet.pdf",
        counterparty_name: "Solar Valley Holdings, LLC",
        counterparty_type: "PROSPECT",
        classification: "CONTRACT_EXTRACTION",
        classification_role: "BORROWER",
        pages: 8,
        mock_doc: {
          title: "DRAFT TERM SHEET",
          date: "February 2026",
          parties: [
            {
              name: "SOLAR VALLEY HOLDINGS, LLC",
              role: "as Borrower",
            },
            {
              name: "CORRIDOR CREDIT FUND I, LP",
              role: "as Lead Arranger",
            },
          ],
        },
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Notifications (alerts & workflow items)
// ---------------------------------------------------------------------------

export const notifications: InboxNotification[] = [
  {
    id: "notif-1",
    type: "workflow",
    label: "New Workflow Created: CONTRACT",
    timestamp: "Feb 22, 2026, 3:50 PM",
  },
  {
    id: "notif-2",
    type: "workflow",
    label: "New Workflow Created: CONTRACT",
    timestamp: "Feb 22, 2026, 3:50 PM",
  },
  {
    id: "notif-3",
    type: "alert",
    label: "New Counterparty Requires KYC Review: Meridian Precision Manufacturing, LLC",
    timestamp: "Feb 22, 2026, 3:49 PM",
  },
  {
    id: "notif-4",
    type: "workflow",
    label: "New Workflow Created: CONTRACT",
    timestamp: "Feb 22, 2026, 3:49 PM",
  },
  {
    id: "notif-5",
    type: "workflow",
    label: "New Workflow Created: CONTRACT",
    timestamp: "Feb 22, 2026, 3:49 PM",
  },
  {
    id: "notif-6",
    type: "alert",
    label: "New Counterparty Requires KYC Review: Solar Valley Holdings, LLC",
    timestamp: "Feb 20, 2026, 10:17 AM",
  },
  {
    id: "notif-7",
    type: "workflow",
    label: "New Workflow Created: CONTRACT",
    timestamp: "Feb 20, 2026, 10:16 AM",
  },
];
