# Corridor Credit Platform — Design System Reference v3
# For Claude Code: apply this system to all CR/DR interface components.
# Source of truth: deal_value_v2.html · policy_analysis_page.html · yardbook_merged.html
# Updated: March 2026

---

## ⚠ GLOBAL HEADER & NAVIGATION — DO NOT CHANGE

The global header bar and collapsible navigation panel as currently implemented
are **correct and final**. Do not alter the following:

### Global Header (fixed, full-width, top of every page)
- Height: 44px, background: `var(--surface-deep)` (#090c13)
- Left: Hamburger toggle for nav collapse/expand
- Center-right: Platform status indicators (POLLING toggle, LIVE indicator, UNREAD badge) — uppercase, letter-spaced, DM Mono
- Far right: Organization name + user email from org context provider
- The header is independent of nav state — always full viewport width

### Collapsible Navigation Panel
- **Expanded (240px, default on load):** Full "CORRIDOR CREDIT" wordmark (CRDR_Logo_20.png) at top, nav items with lucide-react icons + text labels, "Workbench: [Section]" header in gold
- **Collapsed (60px):** CR/DR monogram (CRDR_Logo_21.png or SVG equivalent) at top, icons only with hover tooltips
- Toggle via hamburger icon in global header
- Logo PNGs have black backgrounds — use `mix-blend-mode: lighten` or SVG with CSS gradient
- Active item: left-border highlight (preserve current treatment)
- Nav item font, sizing, spacing, and background color: preserve as-is

If you need to add new nav items, do so while keeping the existing visual style intact.
Do not move status indicators out of the global header or back into individual pages.

---

## Fonts

Import from Google Fonts — all three families are required:

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Instrument+Serif:ital@0;1&family=Syne:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

| Role | Family | CSS Variable | Usage |
|---|---|---|---|
| UI / body | `'Syne', sans-serif` | `var(--font-body)` | All interface text, labels, buttons, nav, headers, narrative body text |
| Data / code | `'DM Mono', monospace` | `var(--font-mono)` | All numeric values, IDs, codes, badges, table headers, metadata |
| Page titles only | `'Instrument Serif', serif` | `var(--font-serif)` | **Page-level titles exclusively** — always italic — nowhere else |

### Italic rule — CRITICAL

**Instrument Serif italic is used in exactly one place: page-level screen titles.**

Examples of correct usage:
- ✅ "Deal Value Analysis" — `<h1>` at the top of a screen
- ✅ "Policy Alignment" — screen title
- ✅ "Yardbook Credit Narrative" — screen title

**Everything else is upright (non-italic) Syne or DM Mono:**
- ❌ Credit narratives / LLM-generated assessment text → `Syne`, `font-style: normal`
- ❌ Synthesis summaries → `Syne`, `font-style: normal`
- ❌ Risk factors body text → `Syne`, `font-style: normal`
- ❌ Conditions of approval → `Syne`, `font-style: normal`
- ❌ Exception rationale inputs → `Syne`, `font-style: normal`
- ❌ Any paragraph, textarea, or multi-line prose → `Syne`, `font-style: normal`

There is no other legitimate use of `font-style: italic` in the platform.

### Font size rules

| Element | Font | Size | Weight |
|---|---|---|---|
| Page title (screen header) | Instrument Serif italic | 28–30px | 400 |
| Deal subheader values | DM Mono | 13px | 500 |
| Deal subheader labels | DM Mono | 10px | 500 |
| Section dividers | DM Mono | 11px | 700 |
| Panel header titles | DM Mono | 11px | 700 |
| Panel sub-labels | DM Mono | 11px | 400 |
| Nav items | Syne | 13px | 500 |
| Market ribbon labels | DM Mono | 11px | 500 |
| Market ribbon values | DM Mono | 17px | 500 |
| Market ribbon deltas | DM Mono | 11px | 400 |
| Metric row labels | Syne | 13px | 400 |
| Metric row values | DM Mono | 15px | 500 |
| Metric row sub-labels | DM Mono | 11px | 400 |
| Collateral names | Syne | 13px | 600 |
| Collateral sub-text | DM Mono | 11px | 400 |
| Collateral amounts | DM Mono | 14px | 500 |
| Band chips (SAT/PW/WDW) | DM Mono | 11px | 700 |
| Stress callout text | Syne | 13px | 400 |
| Pricing box values | DM Mono | 22px | 500 |
| Derivation row labels | Syne | 13px | 400 |
| Derivation row values | DM Mono | 13px | 500 |
| Narrative body text | Syne | 14–15px | 400 |
| Button text | Syne | 12px | 700 |
| Footer metadata | DM Mono | 12px | 400 |
| Tooltip text | DM Mono | 11px | 400 |

**Never use** Inter, Roboto, Arial, system-ui, or any default sans-serif.

---

## CSS Variables — paste this `:root` block into every new component

```css
:root {
  /* ── Backgrounds — true near-black ── */
  --bg:             #0d1017;    /* page floor */
  --surface:        #131920;    /* cards, panels */
  --surface-raised: #1a2130;    /* panel headers, table rows, hover states */
  --surface-deep:   #090c13;    /* topbar, footer, sidebar chrome */
  --border:         rgba(255,255,255,0.07);
  --border-accent:  rgba(255,255,255,0.14);

  /* ── Brand ── */
  --gold:      #c8a84b;
  --gold-dim:  rgba(200,168,75,0.15);

  /* ── Status / semantic ── */
  --green:     #4caf82;  --green-dim:  rgba(76,175,130,0.13);
  --amber:     #e8a040;  --amber-dim:  rgba(232,160,64,0.13);
  --coral:     #e07060;  --coral-dim:  rgba(224,112,96,0.14);
  --blue:      #5b9bd5;  --blue-dim:   rgba(91,155,213,0.12);
  --violet:    #9b8fd4;  --violet-dim: rgba(155,143,212,0.12);

  /* ── Credit band system: SAT / PW / WDW ── */
  --sat-color: #4caf82;
  --sat-bg:    rgba(76,175,130,0.12);
  --sat-border:rgba(76,175,130,0.30);

  --pw-color:  #e8a040;
  --pw-bg:     rgba(232,160,64,0.12);
  --pw-border: rgba(232,160,64,0.32);

  --wdw-color: #e07060;
  --wdw-bg:    rgba(224,112,96,0.12);
  --wdw-border:rgba(224,112,96,0.30);

  /* ── Text hierarchy ── */
  --text:       #e4e8f0;    /* primary — values, titles, anything needing to be read */
  --text-dim:   #9aa4b2;    /* secondary — supporting labels, descriptions */
  --text-muted: #5e6a7a;    /* tertiary — section headers, placeholders, metadata */

  /* ── Shape ── */
  --radius:    6px;
  --radius-lg: 10px;

  /* ── Font shorthand ── */
  --font-mono:  'DM Mono', monospace;
  --font-body:  'Syne', sans-serif;
  --font-serif: 'Instrument Serif', serif;
}
```

---

## Layout Chrome

### Topbar (stage breadcrumb — page-specific, below global header)
- Height: `48px`, positioned below the 44px global header, left offset = current nav width (responds to collapse state)
- `background: var(--surface-deep)`, `border-bottom: 1px solid var(--border)`
- Not all pages have a topbar — it appears on pages with multi-step workflows (e.g., Contract Analysis: Document → Counterparty → Approval)
- Stage tabs: `font-family: var(--font-body)`, `font-size: 12px`, `font-weight: 700`, `text-transform: uppercase`, `letter-spacing: 0.07em`
- **Active stage:** `color: var(--text)`, `background: var(--bg)`, `border-bottom: 2px solid var(--gold)`
- **Done stage:** numbered circle `background: var(--green-dim)`, `color: var(--green)`, checkmark replaces number
- **Active stage circle:** `background: var(--gold)`, `color: #1a1a14`, `width/height: 22px`, `border-radius: 50%`
- **Inactive stage:** `color: var(--text-muted)`

### Content area
- `padding-top: 48px` (topbar clearance)
- Content padding: `28–32px` horizontal, `28px` top, `88px` bottom (footer clearance)
- Max content width: `1440px`

### Footer action bar
- Position: fixed bottom, left offset = current nav width (responds to collapse state)
- `background: var(--surface-deep)`, `border-top: 1px solid var(--border)`, `padding: 14px 32px`
- **Left side:** metadata strip — `font-family: var(--font-mono)`, `font-size: 12px`, `color: var(--text-muted)`, values in `var(--text-dim)`
- **Right side:** Decline (coral), secondary (ghost), primary advance (gold)

---

## Component Patterns

### Page title (screen header)
```css
.page-title {
  font-family: var(--font-serif);
  font-style: italic;           /* ONLY legitimate use of italic in the platform */
  font-weight: 400;
  font-size: 28–30px;
  color: var(--text);
  letter-spacing: -0.01em;
  line-height: 1.15;
}
```

### Deal subheader (below page title)
Labels small and muted; values at full contrast:
```css
.sub-label {
  font-family: var(--font-mono); font-size: 10px; font-weight: 500;
  text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted);
}
.sub-value {
  font-family: var(--font-mono); font-size: 13px; font-weight: 500;
  color: var(--text);              /* full brightness — NOT text-dim */
  letter-spacing: 0.02em;
}
border-bottom: 1px solid var(--border-accent);   /* underline the row */
```

### Panels / Cards
```css
.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);    /* 10px */
  overflow: hidden;
}
.panel-header {
  padding: 12–16px 18–22px;
  background: var(--surface-raised);
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
}
.panel-title {
  font-family: var(--font-mono);
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.12em;
  color: var(--text-dim);
}
.panel-sub {
  font-family: var(--font-mono);
  font-size: 11px; color: var(--text-muted);
}
```

### Section dividers
```css
.section-divider {
  font-family: var(--font-mono);
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.12em;
  color: var(--text-muted);
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 16px;
}
.section-divider::before { content:''; flex: 0 0 16px; height:1px; background: var(--border-accent); }
.section-divider::after  { content:''; flex: 1;         height:1px; background: var(--border); }
```

### Credit band chips
```css
.chip {
  font-family: var(--font-mono);
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.06em; text-transform: uppercase;
  padding: 3px 8px; border-radius: 3px;
}
.chip-sat { background: var(--sat-bg); color: var(--sat-color); border: 1px solid var(--sat-border); }
.chip-pw  { background: var(--pw-bg);  color: var(--pw-color);  border: 1px solid var(--pw-border);  }
.chip-wdw { background: var(--wdw-bg); color: var(--wdw-color); border: 1px solid var(--wdw-border); }
```

### Narrative / prose text blocks
All multi-line prose — credit assessment narratives, risk factors, synthesis summaries,
conditions of approval, exception rationales — uses the same upright treatment:
```css
.narrative-text {
  font-family: var(--font-body);    /* Syne — NOT Instrument Serif */
  font-style: normal;               /* upright — NOT italic */
  font-size: 14–15px;
  font-weight: 400;
  line-height: 1.75–1.8;
  color: var(--text-dim);
}
```

### Buttons
```css
.btn {
  font-family: var(--font-body);
  font-size: 12px; font-weight: 700;
  letter-spacing: 0.06em; text-transform: uppercase;
  padding: 8–10px 16–20px; border-radius: var(--radius);
  border: none; cursor: pointer; transition: all 0.15s;
}
.btn-gold  { background: var(--gold); color: #18140a; }
.btn-gold:hover  { background: #d9b85a; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(200,168,75,0.3); }
.btn-coral { background: var(--coral); color: #fff; }
.btn-coral:hover { background: #e87e6e; transform: translateY(-1px); }
.btn-ghost {
  background: transparent; color: var(--text-dim);
  border: 1px solid var(--border-accent);
}
.btn-ghost:hover { color: var(--text); border-color: rgba(255,255,255,0.28); background: var(--surface-raised); }
.btn-ghost-warn { background: transparent; color: var(--coral); border: 1px solid rgba(224,112,96,0.38); }
.btn-ghost-sm {
  font-family: var(--font-mono); font-size: 11px; font-weight: 600;
  letter-spacing: 0.06em; text-transform: uppercase;
  padding: 3px 9px; border-radius: 4px;
  background: transparent; color: var(--text-muted); border: 1px solid var(--border);
}
.btn-ghost-sm:hover { color: var(--gold); border-color: rgba(200,168,75,0.4); }
```

### Metric rows
```css
.metric-label { font-family: var(--font-body); font-size: 13px; color: var(--text-dim); }
.metric-value { font-family: var(--font-mono); font-size: 15px; font-weight: 500; color: var(--text); }
.metric-sub   { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); }
/* Row separator */ border-bottom: 1px solid var(--border);
```

### Entrance animations
```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.panel { animation: fadeUp 0.3s ease both; }
.panel:nth-child(2) { animation-delay: 0.05s; }
.panel:nth-child(3) { animation-delay: 0.10s; }
```

---

## Data Color Rules

| Condition | Color | Variable |
|---|---|---|
| SAT · positive · improving | green | `var(--sat-color)` `#4caf82` |
| PW · marginal · watch | amber | `var(--pw-color)` `#e8a040` |
| WDW · breach · deteriorating | coral/red | `var(--wdw-color)` `#e07060` |
| Primary brand action | gold | `var(--gold)` `#c8a84b` |
| Informational / neutral | blue | `var(--blue)` `#5b9bd5` |
| Primary text | — | `var(--text)` `#e4e8f0` |
| Secondary / supporting | — | `var(--text-dim)` `#9aa4b2` |
| Muted / labels / disabled | — | `var(--text-muted)` `#5e6a7a` |

**Critical rules:**
- SAT = green · PW = amber · WDW = coral. Never swap these.
- Gold is for primary user actions only — not for data status.
- Green is for SAT and validated states only — not for action buttons.
- Blue is informational/neutral — not a primary status color.

---

## The Four-Screen Workflow (Credit Analysis)

```
1 · Deal Value          2 · Policy             3 · Yardbook           4 · Approval
deal_value_v2.html      policy_analysis_page   yardbook_merged.html   (TBD)
────────────────────    ──────────────────────  ─────────────────────  ──────────
Market data ribbon      Policy match banner     Composite score banner
Coverage corridor       Variance chart (5 dim)  Five dimension cards
Collateral LTV ring     Threshold lock table    Narrative expansion
Pricing derivation      Exception workflow      Validation track
Policy preview strip    Yardbook gate           Override + conditions
```

Each screen: same topbar (stages 1–4) · sidebar (Claude Code — preserve as-is) ·
fixed footer (left metadata | Decline coral | Advance gold).

---

## Anti-patterns — Never Do These

| ❌ Don't | ✅ Do instead |
|---|---|
| Use Inter, Roboto, Arial, system fonts | Syne (UI/prose) · DM Mono (data) · Instrument Serif italic (page titles only) |
| Use italic for narrative or prose text | Upright Syne — `font-style: normal` |
| Use Instrument Serif for anything other than the screen-level page title | Syne for all prose and narrative |
| Use bright backgrounds | Page floor is `#0d1017`, deepest surface is `#090c13` |
| Use rounded pill buttons | `border-radius: 6px` max |
| Use bright white (`#fff`) for backgrounds | Darkest background is `var(--surface-deep)` `#090c13` |
| Use green for action buttons | Green = SAT/validated data only |
| Use generic blue as a status color | Blue = informational/neutral |
| Set any label to `font-size` below `11px` | `11px` is the floor across the system |
| Use `font-weight: 400` for labels | Minimum `500`; section headers and panel titles `700` |
| Use > 4px border-radius on chips | Keep chips crisp at `3–4px` |
| Dim the values in deal subheader | Sub-values at full `var(--text)` `#e4e8f0` brightness |
| Use `box-shadow` for layout depth | Border + surface-layer stacking instead |
| Put platform-level status indicators (polling, connection, unread) on individual pages | These belong in the global header — visible on every page |
| Use the gold button treatment for non-consequential actions | Gold = the single most important action on the screen. Triage/acknowledgment actions use ghost style |

---

## Quick-Reference Prompt Block for Claude Code Sessions

Prepend this to any Claude Code prompt where design alignment is needed:

> Apply the Corridor Credit Platform design system (DESIGN_SYSTEM_v3.md).
> **Preserve the global header, collapsible nav panel, and CR/DR logo system exactly — do not modify layout chrome.**
>
> Fonts: Syne for all UI text and all prose/narrative body text · DM Mono for all data values,
> codes, and metadata · Instrument Serif italic for page-level screen titles ONLY.
> No other use of italic anywhere in the platform.
>
> Backgrounds: page `#0d1017` · surface `#131920` · raised `#1a2130` · deep `#090c13`.
> Text: primary `#e4e8f0` · secondary `#9aa4b2` · muted `#5e6a7a`.
>
> Credit bands: SAT `#4caf82` · PW `#e8a040` · WDW `#e07060` · Gold `#c8a84b` for primary actions.
>
> Font floor: 11px minimum. Market values 17px. Metric values 15px. Narrative prose 14–15px.
> Page titles 28–30px Instrument Serif italic. All other text upright.
>
> Deal subheader values at full `#e4e8f0` contrast — labels muted, values bright.
> Section dividers: DM Mono 11px uppercase, flanked by 1px border lines.
> Band chips: 3–4px radius, DM Mono 11px, band-colored bg/border/text.
> Advance buttons: gold fill. Decline: coral fill. Secondary: ghost with border-accent.