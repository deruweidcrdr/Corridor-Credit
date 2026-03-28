import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ---------------------------------------------------------------------------
// GET /api/pipeline/status
//
// Returns aggregate counts of PENDING, IN_PROGRESS, and ERROR records across
// the four staging tables that Railway's dispatchers poll. Read-only.
// ---------------------------------------------------------------------------

const TABLES = [
  { table: "workflow_for_validation", col: "extraction_status" },
  { table: "contract_for_validation", col: "obligation_extraction_status" },
  { table: "financial_statement_for_validation", col: "profile_assignment_status" },
  { table: "counterparty_profile_assignment", col: "projection_status" },
] as const;

const TRACKED_STATUSES = ["PENDING", "IN_PROGRESS", "ERROR", "COMPLETE"];

export async function GET() {
  try {
    const results = await Promise.all(
      TABLES.map(async ({ table, col }) => {
        try {
          const { data } = await supabase
            .from(table)
            .select(col)
            .in(col, TRACKED_STATUSES);
          return (data ?? []) as Record<string, string>[];
        } catch {
          return [] as Record<string, string>[];
        }
      })
    );

    // Total row counts per table (regardless of status)
    const totals = await Promise.all(
      TABLES.map(async ({ table }) => {
        try {
          const { count } = await supabase
            .from(table)
            .select("*", { count: "exact", head: true });
          return count ?? 0;
        } catch {
          return 0;
        }
      })
    );

    const counts = { pending: 0, in_progress: 0, error: 0, complete: 0 };

    for (const rows of results) {
      for (const row of rows) {
        const val = Object.values(row)[0] as string;
        if (val === "PENDING") counts.pending++;
        else if (val === "IN_PROGRESS") counts.in_progress++;
        else if (val === "ERROR") counts.error++;
        else if (val === "COMPLETE") counts.complete++;
      }
    }

    const total = totals.reduce((a, b) => a + b, 0);
    const tracked = counts.pending + counts.in_progress + counts.error + counts.complete;

    return NextResponse.json({ ...counts, total, untracked: total - tracked });
  } catch {
    return NextResponse.json({ pending: 0, in_progress: 0, error: 0, complete: 0, total: 0, untracked: 0 });
  }
}
