// Ordered list of financial statement metric columns.
// Used by both API routes and client to iterate over metric fields.

export const METRIC_COLUMNS: {
  column: string;
  label: string;
  category: string;
}[] = [
  // Income Statement
  { column: "revenue", label: "Revenue", category: "Income Statement" },
  { column: "cogs", label: "Cost of Goods Sold", category: "Income Statement" },
  { column: "gross_profit", label: "Gross Profit", category: "Income Statement" },
  { column: "operating_expenses", label: "Operating Expenses", category: "Income Statement" },
  { column: "sga", label: "SG&A", category: "Income Statement" },
  { column: "operating_income", label: "Operating Income", category: "Income Statement" },
  { column: "depreciation_amortization", label: "Depreciation & Amortization", category: "Income Statement" },
  { column: "interest_expense", label: "Interest Expense", category: "Income Statement" },
  { column: "income_before_taxes", label: "Income Before Taxes", category: "Income Statement" },
  { column: "income_tax_expense", label: "Income Tax Expense", category: "Income Statement" },
  { column: "net_income", label: "Net Income", category: "Income Statement" },

  // Balance Sheet — Assets
  { column: "cash_and_equivalents", label: "Cash & Equivalents", category: "Balance Sheet" },
  { column: "accounts_receivable", label: "Accounts Receivable", category: "Balance Sheet" },
  { column: "inventory", label: "Inventory", category: "Balance Sheet" },
  { column: "total_current_assets", label: "Total Current Assets", category: "Balance Sheet" },
  { column: "ppe", label: "Property, Plant & Equipment", category: "Balance Sheet" },
  { column: "goodwill", label: "Goodwill", category: "Balance Sheet" },
  { column: "intangible_assets", label: "Intangible Assets", category: "Balance Sheet" },
  { column: "total_assets", label: "Total Assets", category: "Balance Sheet" },

  // Balance Sheet — Liabilities
  { column: "accounts_payable", label: "Accounts Payable", category: "Balance Sheet" },
  { column: "notes_payable", label: "Notes Payable", category: "Balance Sheet" },
  { column: "short_term_debt", label: "Short-Term Debt", category: "Balance Sheet" },
  { column: "total_current_liabilities", label: "Total Current Liabilities", category: "Balance Sheet" },
  { column: "long_term_debt", label: "Long-Term Debt", category: "Balance Sheet" },
  { column: "total_liabilities", label: "Total Liabilities", category: "Balance Sheet" },

  // Balance Sheet — Equity
  { column: "common_stock", label: "Common Stock", category: "Balance Sheet" },
  { column: "additional_paid_in_capital", label: "Additional Paid-In Capital", category: "Balance Sheet" },
  { column: "retained_earnings", label: "Retained Earnings", category: "Balance Sheet" },
  { column: "treasury_stock", label: "Treasury Stock", category: "Balance Sheet" },
  { column: "other_comprehensive_income", label: "Other Comprehensive Income", category: "Balance Sheet" },
  { column: "equity", label: "Total Equity", category: "Balance Sheet" },
  { column: "wages_payable", label: "Wages Payable", category: "Balance Sheet" },
];

// Set for fast column name validation in API routes
export const METRIC_COLUMN_NAMES = new Set(METRIC_COLUMNS.map((m) => m.column));
