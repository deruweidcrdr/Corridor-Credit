import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// POST /api/projections/dispatch — DEPRECATED
//
// Railway now discovers PENDING work by polling status columns.
// Use POST /api/wake on Railway directly if you need to nudge the poll loop.
// ---------------------------------------------------------------------------

export async function POST() {
  return NextResponse.json(
    {
      error:
        "This endpoint is deprecated. Railway discovers PENDING work automatically via polling.",
    },
    { status: 410 }
  );
}
