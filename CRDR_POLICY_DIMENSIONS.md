# CRDR Policy Dimensions — Reference

Status: current-state reference for the FUND/SYS dimensional framework as implemented in the Corridor Credit schema. Intended to seed branch chats that touch `crdr_policy`, `policy_dimension_*`, or `crdr_assessment_finding`.

This document describes **what exists** and **how the pieces fit**. It does not cover scoring methodology derivations, threshold calibration rationale, or future-state dimensions beyond what is already provisioned in the schema. For schema ground truth, see `SUPABASE_SCHEMA.md`. For pipeline mechanics around `CrdrAssessmentFinding` writes, see `RAILWAY_SERVICE.md`.

---

## 1. Scope

Credit risk rating in Corridor Credit is organized around a **policy** — a versioned configuration record that holds thresholds, composite rules, and routing limits — and a set of **dimensions** attached to that policy. Each dimension scores one facet of the credit along three axes and produces a composite band. Dimension bands roll up, per the policy's composite rule, into a regulatory classification and routing recommendation.

The framework is called **FUND/SYS**. The currently wired dimensions represent Primary Source of Repayment ("FUND"). The `crdr_assessment_finding` table reserves columns for Secondary and Tertiary Source of Repayment dimensions ("SYS") that are not yet wired; see §8.

---

## 2. The Five Primary Dimensions

Each primary dimension has its own table (`policy_dimension_{code}_{label}`) and is identified by a two-letter code.

| Code | Table | Label (Display) | Metric | Source Object |
|------|-------|-----------------|--------|---------------|
| `PC` | `policy_dimension_pc_debt_service_coverage` | Primary Coverage | Temporal minimum DSCR | `counterparty_projection_summary.min_dscr_value` |
| `PV` | `policy_dimension_pv_loan_life_coverage` | Portfolio Value | LLCR | `counterparty_projection_summary.llcr` |
| `PB` | `policy_dimension_pb_obligor_trend` | Obligor Business Trend | Gross Profit Margin | Derived from `counterparty_projection` revenue/gross_profit series |
| `PQ` | `policy_dimension_pq_obligor_liquidity` | Obligor Liquidity | Current Ratio | Derived from `counterparty_projection` current assets/liabilities |
| `PM` | `policy_dimension_pm_cost_structure` | Cost Structure | Operating Cost Ratio | Derived from `counterparty_projection` opex/revenue |

**PC** is the system's analytical anchor — it reads the temporal minimum DSCR identified during the projection stage, not a point-in-time or average value. The `(DSCR−1)/DSCR` buffer-above-breakeven formula is the pricing intuition that sits behind PC's threshold structure but is not persisted on the dimension itself.

**PV** is the structural solvency check alongside PC's coverage focus. Where PC asks "can this credit service debt at its worst moment?", PV asks "does the aggregate projected cash flow over the loan's full tenor exceed the debt balance with margin?"

**PB, PQ, PM** are obligor-quality dimensions. They characterize the borrower's trajectory (PB), near-term financial flexibility (PQ), and cost base elasticity (PM). These dimensions are designed to surface structural issues that PC/PV might miss at a given band but that predict band migration over time.

---

## 3. The X/Y/Z Axis Structure

Every dimension is scored on three axes. The axes answer different questions about the same metric:

- **X — Level.** What is the current or stress-point value of the metric, evaluated against an absolute threshold?
- **Y — Trend.** How has the metric moved, or how is it projected to move, relative to its starting point? Usually a Y3-vs-Y1 percentage delta.
- **Z — Cross-reference.** How does the metric relate to another dimension's band? Z captures structural interactions (e.g., weak coverage combined with weak liquidity is worse than either alone).

Each axis is scored independently and assigned its own band (SAT / PW / WDW, see §4). The dimension's **composite band is the worst of X, Y, Z** — a WDW on any single axis drags the dimension to WDW.

Schema: each `policy_dimension_*` table carries

- `metric_source_x`, `metric_source_y`, `metric_source_z` — identifiers for where each axis's input value is sourced from
- `metric_source_x_benchmark`, `metric_source_y_benchmark` — reference values for X and Y thresholds (e.g., a guideline DSCR of 1.25x)
- `{x|y|z}_{sat|pw|wdw}_operator` / `_threshold` — the operator (`>=`, `<`, `<=`, etc.) and numeric threshold for each band on each axis
- `z_reference_dimension` — identifies which other dimension Z cross-references (e.g., PC's Z may reference PQ)
- `cross_ref_dimension` — free-text cross-reference notes

---

## 4. The SAT / PW / WDW Band System

Three bands, deterministically assigned from axis operators and thresholds:

- **SAT (Satisfactory).** The metric clears policy with meaningful headroom. Composite SAT is consistent with a regulatory PASS.
- **PW (Potential Weakness).** The metric is above the minimum but with limited headroom — vulnerable to downside variance. Composite PW is consistent with WATCH or SPECIAL MENTION.
- **WDW (Well-Defined Weakness).** The metric fails the threshold, or the value is null due to missing data. Composite WDW is consistent with SPECIAL MENTION, SUBSTANDARD, or worse.

Null handling: if a metric cannot be computed (e.g., missing projection data), the axis defaults to WDW — never SAT. This is a conservative-by-construction policy choice.

Score contributions are persisted on the dimension row:

- `sat_continuous_score`, `pw_continuous_score`, `wdw_continuous_score` — numeric scores each band contributes to the composite continuous score
- `sat_rating_contribution` — rating-scale contribution for SAT
- `sat_reg_score_max`, `pw_reg_score_max` — regulatory score caps for SAT and PW bands

---

## 5. Composite Logic

Two composite operations happen at distinct levels:

**Dimension composite** (per dimension): `composite_band = worst(x_band, y_band, z_band)`. Persisted as `{dim}_composite_rating` on `crdr_assessment_finding`.

**Policy composite** (across dimensions): governed by `crdr_policy.composite_method` and `crdr_policy.composite_floor_rule`. The policy record carries threshold columns for each regulatory tier (`pass_threshold`, `watch_threshold`, `special_mention_threshold`, `substandard_threshold`, `doubtful_threshold`, `loss_threshold`) and a composite floor rule that can force a classification down if any dimension is WDW regardless of overall score.

The floor rule is the mechanism that prevents a credit with one severely weak dimension from being averaged into a PASS classification.

---

## 6. Schema Tour

### `crdr_policy`

PK: `policy_id` (text). One row per policy version.

Core columns:

- `policy_name`, `version`, `active`, `effective_date`, `superseded_date`, `approved_by`
- `composite_method` — how dimension composites aggregate
- `composite_floor_rule` — minimum-classification enforcement
- Regulatory tier thresholds: `pass_threshold`, `watch_threshold`, `special_mention_threshold`, `substandard_threshold`, `doubtful_threshold`, `loss_threshold`
- Approval routing limits: `escalation_limit`, `enhanced_monitoring_limit`, `committee_approval_limit`, `standard_approval_limit`

Corridor currently operates with a single active policy. The architecture supports multiple policies co-existing (e.g., different policies for C&I vs. project finance), with dimensions attached via FK — but the routing logic that would select the applicable policy per deal is not yet wired.

### `policy_dimension_{code}_{label}`

Five tables, identical structure, one per primary dimension. PK: `dimension_id`. FK: `policy_id → crdr_policy`.

Columns (~40 each):

- Identity: `dimension_code`, `dimension_label`, `dimension_sequence`, `weight`, `sor_number`, `sor_label`
- Metric sourcing: `metric_source_x`, `metric_source_y`, `metric_source_z`, `metric_source_x_benchmark`, `metric_source_y_benchmark`
- Thresholds per axis per band: `{x|y|z}_{sat|pw|wdw}_{operator|threshold}`
- Scoring: `sat_continuous_score`, `pw_continuous_score`, `wdw_continuous_score`, `sat_rating_contribution`, `sat_reg_score_max`, `pw_reg_score_max`
- Cross-reference: `z_reference_dimension`, `cross_ref_dimension`
- Lifecycle: `active`, `effective_date`, `notes`

### `crdr_assessment_finding`

The output record — one row per credit assessment run. PK: `finding_id`. FKs: `counterparty_id → counterparty`, `deal_id → deal`, `policy_id → crdr_policy`, `skill_id → crdr_prompt`, `prior_finding_id → crdr_assessment_finding` (self-ref, for versioning assessments over time).

Column structure (~130 columns total):

**Per-dimension blocks** — for each dimension code in `{pc, pv, pb, pq, pm, iq, rm, sc, sd, so, sr, tc, tq, tr}`:

- `{dim}_x_rating`, `{dim}_x_value`
- `{dim}_y_rating`, `{dim}_y_value`
- `{dim}_z_rating`, `{dim}_z_value`
- `{dim}_composite_rating`
- `{dim}_narrative` — LLM-generated prose for this dimension

**Roll-up columns:**

- `composite_continuous_score`, `composite_rating`
- `override_composite_rating`, `override_composite_rationale` — human-in-the-loop override fields
- `regulatory_classification` — PASS, WATCH, SPECIAL MENTION, SUBSTANDARD, DOUBTFUL, LOSS
- `risk_factors`, `routing_recommendation`, `approval_path`
- `synthesis_narrative` — LLM-generated overall summary

**Provenance and state:**

- `status`, `validated_by`, `validated_date`, `validated_notes`, `projection_date`
- `prior_finding_id` — links to the prior assessment for this credit, enabling temporal comparison

---

## 7. Data Flow: How an Assessment is Produced

The `assessCreditRisk` function (current home: the credit-assessment stage, implementation in flux) consumes:

| Input | Source |
|-------|--------|
| Deal context | `deal` table |
| Coverage metrics | `counterparty_risk` (DSCR extrema, LLCR, trajectory) |
| Projection line items | `counterparty_projection` (for derived ratios — GPM, current ratio, opex ratio) |
| Five dimension specs | `policy_dimension_pc_*`, `policy_dimension_pv_*`, `policy_dimension_pb_*`, `policy_dimension_pq_*`, `policy_dimension_pm_*` |
| Prompt | `crdr_prompt` (the Yardbook skill) |

Processing sequence:

1. **Deterministic band assignment.** For each dimension, read `metric_source_*` and evaluate the X/Y/Z axis values against the dimension's operator/threshold pairs. Assign band per axis. Composite = worst of the three.
2. **Composite rating.** Roll dimension composites per `crdr_policy.composite_method`, apply `composite_floor_rule`, derive `regulatory_classification`.
3. **Narrative generation.** Single LLM call (Yardbook prompt) produces per-dimension narratives and a synthesis narrative. The LLM is instructed to interpret the deterministic band assignments, not recompute them.
4. **Routing derivation.** Map composite rating and regulatory classification against `crdr_policy` routing limits to produce `routing_recommendation` and `approval_path`.
5. **Write.** Single `crdr_assessment_finding` row created. All other inputs are read-only.

The deterministic step and the LLM step are kept separate by design: threshold evaluation is auditable and reproducible; narrative is a synthesis layer that can be regenerated without changing the underlying rating.

---

## 8. Extensibility: Reserved Slots for Secondary and Tertiary SOR Dimensions

`crdr_assessment_finding` provisions column blocks for dimension codes beyond the five currently implemented:

| Code | Reserved for | Status |
|------|--------------|--------|
| `IQ` | Information Quality | Not wired |
| `RM` | Risk Management | Not wired |
| `SC`, `SD`, `SO`, `SR` | Secondary Source of Repayment dimensions | Not wired |
| `TC`, `TQ`, `TR` | Tertiary Source of Repayment dimensions | Not wired |

Each reserved code has the same X/Y/Z/composite/narrative column block as the wired primary dimensions. Activating a reserved dimension requires:

1. Creating the corresponding `policy_dimension_{code}_{label}` table with the standard ~40-column schema
2. Attaching it to the active policy via `policy_id` FK
3. Extending the `assessCreditRisk` function to read the new dimension and populate the reserved columns on `crdr_assessment_finding`
4. Extending the Yardbook prompt to produce narratives for the new dimension

No schema migration is required on `crdr_assessment_finding` to add reserved dimensions — the columns already exist.

---

## 9. Regulatory Classification Mapping

The policy's composite logic resolves to one of six regulatory classifications. Indicative band-to-classification mapping:

| Regulatory | Typical composite condition |
|------------|----------------------------|
| PASS | All dimensions SAT |
| WATCH | Any dimension PW, no WDW |
| SPECIAL MENTION | One WDW, or multiple PW |
| SUBSTANDARD | Multiple WDW, or severe WDW on PC/PV |
| DOUBTFUL | Severe coverage failure with limited mitigation |
| LOSS | Coverage failure with no realistic recovery path |

Exact mapping is driven by `crdr_policy` threshold columns and composite rules — the above is descriptive of current parameters, not normative.

Claude should consult the active `crdr_policy` row and the composite rule for authoritative mapping in any given pipeline run.

---

## 10. Current Implementation State

### Wired

- Five `policy_dimension_*` tables exist with their full ~40-column schema
- `crdr_policy` exists with routing and composite columns populated for the active policy
- `crdr_assessment_finding` schema provisions all dimension column blocks (primary + reserved)
- Single active policy seeded

### Partially wired or in flux

- `assessCreditRisk` function is implemented in TS v2 and writes `crdr_assessment_finding`. Deterministic band assignment, LLM narrative generation, and composite logic all run. Cross-dimension Z-axis references are wired but under-tested.
- Yardbook prompt lives in `crdr_prompt` and produces per-dimension + synthesis narratives.
- Override fields (`override_composite_rating`, `override_composite_rationale`) exist on the finding row but the validation UI that writes them is partial.

### Not yet wired

- Multi-policy routing logic (all deals currently resolve to the single active policy)
- Secondary and Tertiary SOR dimensions (columns reserved on finding; no `policy_dimension_*` tables for them yet)
- Policy versioning workflow — `superseded_date` and `prior_finding_id` schema support is in place, but the process for cutting a new policy version and re-running historical findings is not defined
- Credit-type–specific dimension weights — `weight` column exists per dimension but aggregation currently treats dimensions as equally significant subject to floor rules

---

## 11. Cross-References

- `SUPABASE_SCHEMA.md` — ground truth for every column referenced here
- `CLAUDE.md` — top-level mention of the FUND/SYS framework in the context of the temporal minimum DSCR methodology
- `RAILWAY_SERVICE.md` — pipeline stage that triggers `crdr_assessment_finding` writes
- `NEXTJS_CONTRACT.md` — validate routes that promote findings and write override fields
- `OBLIGATION_DRIVEN_ARCHITECTURE.md` — upstream obligation structure that drives the projection series PC and PV read from

---

## 12. Known Ambiguities

- **Z-axis semantics.** The `z_reference_dimension` column identifies *which* other dimension Z cross-references, but the structural question of whether Z is meant to be a simple band read-across or a more nuanced interaction score is not resolved uniformly across the five dimensions. Treat per-dimension Z logic as dimension-specific until a general rule is documented.
- **Null metric handling.** Conservative default is WDW. Open question is whether a null on Z (where the referenced dimension itself is missing) should propagate WDW or be treated as not-applicable. Current behavior: propagate WDW.
- **Override lineage.** `override_composite_rating` replaces the composite but the per-dimension `{dim}_composite_rating` values are not overwritten. Downstream consumers need to decide whether to read override-or-composite when surfacing the rating.