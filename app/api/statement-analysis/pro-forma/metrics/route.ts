import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { METRIC_COLUMN_NAMES } from "@/app/statement-analysis/metric-columns";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ---------------------------------------------------------------------------
// PATCH /api/statement-analysis/pro-forma/metrics
//
// Updates a single metric (column) on a pro_forma_statement_for_validation row.
// Appends the column name to user_edited_columns if not already present.
// ---------------------------------------------------------------------------

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, column_name, value } = body;

    if (!id || !column_name) {
      return NextResponse.json(
        { error: "id and column_name are required" },
        { status: 400 }
      );
    }

    if (!METRIC_COLUMN_NAMES.has(column_name)) {
      return NextResponse.json(
        { error: `Invalid column name: ${column_name}` },
        { status: 400 }
      );
    }

    const { data: current, error: fetchErr } = await supabase
      .from("pro_forma_statement_for_validation")
      .select("user_edited_columns")
      .eq("id", id)
      .single();

    if (fetchErr || !current) {
      return NextResponse.json(
        { error: `Pro forma statement not found: ${fetchErr?.message}` },
        { status: 404 }
      );
    }

    const editedCols: string[] = current.user_edited_columns ?? [];
    if (!editedCols.includes(column_name)) {
      editedCols.push(column_name);
    }

    const numericValue = value === "" || value === null ? null : Number(value);

    const { error: updateErr } = await supabase
      .from("pro_forma_statement_for_validation")
      .update({
        [column_name]: numericValue,
        is_user_override: true,
        user_edited_columns: editedCols,
      })
      .eq("id", id);

    if (updateErr) {
      return NextResponse.json(
        { error: `Failed to update metric: ${updateErr.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Pro forma metrics PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
