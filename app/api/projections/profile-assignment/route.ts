import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ---------------------------------------------------------------------------
// NAICS prefix → industry sector label mapping
// ---------------------------------------------------------------------------
const NAICS_SECTOR_MAP: Record<string, string> = {
  "11": "Agriculture",
  "21": "Mining & Extraction",
  "22": "Utilities",
  "23": "Construction",
  "31": "Manufacturing",
  "32": "Manufacturing",
  "33": "Manufacturing",
  "42": "Wholesale Trade",
  "44": "Retail Trade",
  "45": "Retail Trade",
  "48": "Transportation",
  "49": "Transportation",
  "51": "Information & Technology",
  "52": "Finance & Insurance",
  "53": "Real Estate",
  "54": "Professional Services",
  "55": "Management of Companies",
  "56": "Administrative Services",
  "61": "Education",
  "62": "Healthcare",
  "71": "Arts & Entertainment",
  "72": "Accommodation & Food",
  "81": "Other Services",
  "92": "Public Administration",
};

function naicsToSector(code: number | string | null | undefined): string {
  if (!code) return "General";
  const prefix = String(code).slice(0, 2);
  return NAICS_SECTOR_MAP[prefix] ?? "General";
}

function sizeToRevenueBucket(size: string | null | undefined): string {
  if (!size) return "UNKNOWN";
  const s = size.toLowerCase();
  if (s.includes("micro") || s.includes("very small")) return "MICRO";
  if (s.includes("small")) return "SMALL";
  if (s.includes("mid") || s.includes("medium")) return "MID-MARKET";
  if (s.includes("large") || s.includes("upper")) return "LARGE";
  return "MID-MARKET";
}

// ---------------------------------------------------------------------------
// POST /api/projections/profile-assignment
//
// Creates (or upserts) a counterparty_profile_assignment row by matching
// the counterparty to the best available projection profile.
// Body: { counterparty_id }
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { counterparty_id } = body;

    if (!counterparty_id) {
      return NextResponse.json(
        { error: "counterparty_id is required" },
        { status: 400 }
      );
    }

    // 1. Fetch the counterparty
    const { data: counterparty, error: cpErr } = await supabase
      .from("counterparty")
      .select("*")
      .eq("counterparty_id", counterparty_id)
      .single();

    if (cpErr || !counterparty) {
      return NextResponse.json(
        { error: "Counterparty not found" },
        { status: 404 }
      );
    }

    // 2. Fetch the most recent financial statement for revenue data
    const { data: statements } = await supabase
      .from("financial_statements")
      .select("revenue, statement_type, period_end_date, period_end_year")
      .eq("counterparty_id", counterparty_id)
      .eq("statement_type", "INCOME_STATEMENT")
      .order("period_end_date", { ascending: false })
      .limit(3);

    const latestRevenue = statements?.[0]?.revenue ?? null;

    // 3. Fetch all projection profiles
    const { data: profiles, error: profErr } = await supabase
      .from("projection_profile")
      .select("*");

    if (profErr || !profiles || profiles.length === 0) {
      return NextResponse.json(
        { error: "No projection profiles available" },
        { status: 500 }
      );
    }

    // 4. Score each profile against the counterparty
    const naicsPrefix = counterparty.industry_code
      ? String(counterparty.industry_code).slice(0, 2)
      : null;
    const cpIndustrySector = naicsToSector(counterparty.industry_code);
    const cpSize = counterparty.size_category?.toLowerCase() ?? "";
    const cpMaturity = counterparty.maturity_category?.toLowerCase() ?? "";

    const scored = profiles.map((p: any) => {
      let score = 0;
      let industryContrib = 0;
      let sizeContrib = 0;
      let growthContrib = 0;
      let volatilityContrib = 0;

      // Industry match (up to 0.40)
      const pIndustry = (p.industry ?? "").toLowerCase();
      const cpIndustryLower = cpIndustrySector.toLowerCase();
      if (pIndustry && cpIndustryLower) {
        if (pIndustry === cpIndustryLower) {
          industryContrib = 0.40;
        } else if (
          pIndustry.includes(cpIndustryLower) ||
          cpIndustryLower.includes(pIndustry)
        ) {
          industryContrib = 0.25;
        } else {
          industryContrib = 0.05;
        }
      } else {
        industryContrib = 0.10; // neutral when no data
      }
      score += industryContrib;

      // Size match (up to 0.25)
      const pSize = (p.size ?? "").toLowerCase();
      if (pSize && cpSize) {
        if (pSize === cpSize) {
          sizeContrib = 0.25;
        } else if (pSize.includes(cpSize) || cpSize.includes(pSize)) {
          sizeContrib = 0.15;
        } else {
          sizeContrib = 0.05;
        }
      } else {
        sizeContrib = 0.10;
      }
      score += sizeContrib;

      // Maturity match (up to 0.20)
      const pMaturity = (p.maturity ?? "").toLowerCase();
      if (pMaturity && cpMaturity) {
        if (pMaturity === cpMaturity) {
          growthContrib = 0.20;
        } else if (pMaturity.includes(cpMaturity) || cpMaturity.includes(pMaturity)) {
          growthContrib = 0.12;
        } else {
          growthContrib = 0.03;
        }
      } else {
        growthContrib = 0.08;
      }
      score += growthContrib;

      // Revenue alignment (up to 0.15)
      if (latestRevenue && p.revenue_base_value) {
        const ratio = latestRevenue / p.revenue_base_value;
        if (ratio >= 0.5 && ratio <= 2.0) {
          volatilityContrib = 0.15;
        } else if (ratio >= 0.25 && ratio <= 4.0) {
          volatilityContrib = 0.08;
        } else {
          volatilityContrib = 0.02;
        }
      } else {
        volatilityContrib = 0.05;
      }
      score += volatilityContrib;

      return {
        profile: p,
        score: Math.round(score * 100) / 100,
        industryContrib: Math.round(industryContrib * 100) / 100,
        sizeContrib: Math.round(sizeContrib * 100) / 100,
        growthContrib: Math.round(growthContrib * 100) / 100,
        volatilityContrib: Math.round(volatilityContrib * 100) / 100,
      };
    });

    // Sort by score descending
    scored.sort((a: any, b: any) => b.score - a.score);
    const best = scored[0];
    const bestProfile = best.profile;

    // 5. Compute revenue growth rate from financial statements
    let revenueGrowthRate: number | null = null;
    let revenueVolatility: number | null = null;
    if (statements && statements.length >= 2) {
      const revenues = statements
        .map((s: any) => s.revenue)
        .filter((r: any) => r != null && r > 0);
      if (revenues.length >= 2) {
        revenueGrowthRate = (revenues[0] - revenues[1]) / revenues[1];
        revenueGrowthRate = Math.round(revenueGrowthRate * 10000) / 10000;
      }
      if (revenues.length >= 3) {
        const mean = revenues.reduce((s: number, v: number) => s + v, 0) / revenues.length;
        const variance = revenues.reduce((s: number, v: number) => s + (v - mean) ** 2, 0) / revenues.length;
        revenueVolatility = Math.round((Math.sqrt(variance) / mean) * 10000) / 10000;
      }
    }

    // 6. Derive assignment metadata
    const revenueSizeBucket = sizeToRevenueBucket(counterparty.size_category);
    const logicalCategory = counterparty.maturity_category ?? bestProfile.maturity ?? "STABLE";
    const volatilityLabel = revenueVolatility != null
      ? revenueVolatility < 0.1 ? "LOW" : revenueVolatility < 0.25 ? "MODERATE" : "HIGH"
      : "UNKNOWN";

    const isFallback = best.score < 0.35;

    const assignmentRow: Record<string, any> = {
      counterparty_id,
      counterparty_name:
        counterparty.counterparty_name ?? counterparty.legal_name ?? null,
      assigned_profile_id: bestProfile.projection_profile_id,
      effective_profile_id: bestProfile.projection_profile_id,
      status: "PENDING",
      assignment_timestamp: new Date().toISOString(),
      confidence_score: best.score,
      confidence_score_adjusted: best.score,
      confidence_industry_contribution: best.industryContrib,
      confidence_size_contribution: best.sizeContrib,
      confidence_growth_contribution: best.growthContrib,
      confidence_volatility_contribution: best.volatilityContrib,
      industry_sector_label: cpIndustrySector,
      resolved_industry_code: counterparty.industry_code
        ? String(counterparty.industry_code)
        : null,
      naics_prefix: naicsPrefix,
      revenue_size_bucket: revenueSizeBucket,
      annual_revenue: latestRevenue,
      revenue_growth_rate: revenueGrowthRate,
      revenue_growth_rate_display: revenueGrowthRate != null
        ? `${(revenueGrowthRate * 100).toFixed(1)}%`
        : null,
      revenue_volatility: revenueVolatility,
      revenue_volatility_display: revenueVolatility != null
        ? `${(revenueVolatility * 100).toFixed(1)}%`
        : null,
      volatility_label: volatilityLabel,
      logical_profile_category: logicalCategory,
      historical_period_count: statements?.length ?? 0,
      source_statement_date: statements?.[0]?.period_end_date ?? null,
      is_fallback_profile: isFallback,
      fallback_reason: isFallback ? "Low match confidence — manual review recommended" : null,
      is_user_override: false,
      projection_method: bestProfile.projection_type ?? "DETERMINISTIC",
      data_quality_score: statements && statements.length >= 3 ? 0.85 : statements && statements.length >= 1 ? 0.55 : 0.25,
      data_quality_label: statements && statements.length >= 3 ? "GOOD" : statements && statements.length >= 1 ? "FAIR" : "LIMITED",
      semantic_version: 1,
      assignment_rationale_short: `Matched to ${bestProfile.profile_name ?? bestProfile.projection_profile_id} — ${cpIndustrySector}, ${revenueSizeBucket}`,
      assignment_rationale_detailed:
        `Industry: ${cpIndustrySector} (NAICS ${counterparty.industry_code ?? "N/A"}) → ` +
        `${bestProfile.industry ?? "General"} profile. ` +
        `Size: ${revenueSizeBucket}${latestRevenue ? ` ($${(latestRevenue / 1_000_000).toFixed(1)}M)` : ""}. ` +
        `Maturity: ${logicalCategory}. ` +
        `Confidence: ${(best.score * 100).toFixed(0)}% ` +
        `(Industry ${(best.industryContrib * 100).toFixed(0)}%, Size ${(best.sizeContrib * 100).toFixed(0)}%, ` +
        `Growth ${(best.growthContrib * 100).toFixed(0)}%, Volatility ${(best.volatilityContrib * 100).toFixed(0)}%).` +
        (isFallback ? " FALLBACK — low match confidence, manual review recommended." : ""),
    };

    // 7. Upsert the assignment row
    const { data, error } = await supabase
      .from("counterparty_profile_assignment")
      .upsert(assignmentRow, { onConflict: "counterparty_id" })
      .select()
      .single();

    if (error) {
      console.error("Profile assignment upsert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 8. Also update the counterparty's projection_profile_id
    await supabase
      .from("counterparty")
      .update({ projection_profile_id: bestProfile.projection_profile_id })
      .eq("counterparty_id", counterparty_id);

    return NextResponse.json({
      success: true,
      assignment: data,
      profile: bestProfile,
      matchDetails: {
        totalScore: best.score,
        candidatesEvaluated: profiles.length,
        topCandidates: scored.slice(0, 3).map((s: any) => ({
          profileId: s.profile.projection_profile_id,
          profileName: s.profile.profile_name,
          score: s.score,
        })),
      },
    });
  } catch (err) {
    console.error("Profile assignment POST error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/projections/profile-assignment
//
// Updates a counterparty_profile_assignment row.
// Body: { counterparty_id, action, user_selected_profile?, override_justification? }
//   action: "CONFIRMED" | "FLAGGED" | "OVERRIDE"
// ---------------------------------------------------------------------------

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { counterparty_id, action, user_selected_profile, override_justification } = body;

    if (!counterparty_id || !action) {
      return NextResponse.json({ error: "counterparty_id and action are required" }, { status: 400 });
    }

    let updatePayload: Record<string, any> = {};

    if (action === "CONFIRMED") {
      updatePayload = { status: "CONFIRMED", projection_status: "PENDING" };
    } else if (action === "FLAGGED") {
      updatePayload = { status: "FLAGGED" };
    } else if (action === "OVERRIDE") {
      if (!user_selected_profile) {
        return NextResponse.json({ error: "user_selected_profile is required for override" }, { status: 400 });
      }
      updatePayload = {
        status: "OVERRIDE",
        is_user_override: true,
        user_selected_profile,
        override_justification: override_justification || null,
        effective_profile_id: user_selected_profile,
        projection_status: "PENDING",
      };
    } else if (action === "RETRY_PROJECTION") {
      updatePayload = { projection_status: "PENDING", projection_error: null };
    } else if (action === "REVERT") {
      updatePayload = {
        status: "SYSTEM_ASSIGNED",
        is_user_override: false,
        user_selected_profile: null,
        override_justification: null,
        projection_status: null,
      };
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("counterparty_profile_assignment")
      .update(updatePayload)
      .eq("counterparty_id", counterparty_id)
      .select()
      .single();

    if (error) {
      console.error("Profile assignment update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fire-and-forget wake call for actions that set projection_status = PENDING
    if (action === "CONFIRMED" || action === "OVERRIDE" || action === "RETRY_PROJECTION") {
      const pipelineUrl = process.env.PIPELINE_SERVICE_URL;
      if (pipelineUrl) {
        fetch(`${pipelineUrl}/api/wake`, { method: "POST" }).catch(() => {});
      }
    }

    return NextResponse.json({ success: true, assignment: data });
  } catch (err) {
    console.error("Profile assignment PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
