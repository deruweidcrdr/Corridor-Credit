export type WorkflowStatus =
  | "pending_review"
  | "in_review"
  | "approved"
  | "rejected"
  | "needs_info";

export type DocumentType =
  | "invoice"
  | "credit_application"
  | "financial_statement"
  | "purchase_order"
  | "contract"
  | "tax_return"
  | "bank_statement"
  | "other";

export type ContentClassification =
  | "accounts_receivable"
  | "accounts_payable"
  | "credit_request"
  | "financial_report"
  | "legal_agreement"
  | "tax_filing"
  | "banking"
  | "other";

export type Priority = "low" | "medium" | "high" | "urgent";

export interface Database {
  public: {
    Tables: {
      counterparties: {
        Row: {
          id: string;
          name: string;
          entity_type: "company" | "individual";
          industry: string | null;
          credit_rating: string | null;
          contact_email: string | null;
          phone: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          entity_type: "company" | "individual";
          industry?: string | null;
          credit_rating?: string | null;
          contact_email?: string | null;
          phone?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          entity_type?: "company" | "individual";
          industry?: string | null;
          credit_rating?: string | null;
          contact_email?: string | null;
          phone?: string | null;
          address?: string | null;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          counterparty_id: string;
          file_name: string;
          document_type: DocumentType;
          content_classification: ContentClassification;
          summary: string | null;
          received_at: string;
          source: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          counterparty_id: string;
          file_name: string;
          document_type: DocumentType;
          content_classification: ContentClassification;
          summary?: string | null;
          received_at?: string;
          source?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          counterparty_id?: string;
          file_name?: string;
          document_type?: DocumentType;
          content_classification?: ContentClassification;
          summary?: string | null;
          received_at?: string;
          source?: string | null;
        };
      };
      inbox_items: {
        Row: {
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
        };
        Insert: {
          id?: string;
          document_id: string;
          counterparty_id: string;
          workflow_status?: WorkflowStatus;
          priority?: Priority;
          assigned_to?: string | null;
          notes?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          counterparty_id?: string;
          workflow_status?: WorkflowStatus;
          priority?: Priority;
          assigned_to?: string | null;
          notes?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      workflow_status: WorkflowStatus;
      document_type: DocumentType;
      content_classification: ContentClassification;
      priority: Priority;
    };
  };
}

// Convenience types for use across the app
export type Counterparty =
  Database["public"]["Tables"]["counterparties"]["Row"];
export type Document = Database["public"]["Tables"]["documents"]["Row"];
export type InboxItem = Database["public"]["Tables"]["inbox_items"]["Row"];

export type InboxItemWithRelations = InboxItem & {
  documents: Document;
  counterparties: Counterparty;
};
