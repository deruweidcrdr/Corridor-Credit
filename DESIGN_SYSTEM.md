# Corridor Credit Platform — Design System Reference
# For Claude Code: apply this system to all CR/DR interface components.
# Source of truth: yardbook_package_assembly.html, deal_value_page.html, policy_analysis_page.html

---

## Fonts

Import from Google Fonts — include all three, all three are load-bearing:

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Instrument+Serif:ital@0;1&family=Syne:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

| Role | Font | Usage |
|---|---|---|
| `--font-body` | `'Syne', sans-serif` | Default body, nav, labels, buttons, all UI text |
| `--font-mono` | `'DM Mono', monospace` | All data values, IDs, codes, metadata, badges, table headers |
| `--font-serif` | `'Instrument Serif', serif` | LLM-generated narrative text, synthesis summaries, italic prose only |

**Rules:**
- Numeric data (DSCR, spreads, ratios, dates, IDs) → always `font-family: var(--font-mono)`
- Section labels and section titles → `var(--font-body)`, `font-weight: 700`, `text-transform: uppercase`, `letter-spacing: 0.12–0.14em`
- Credit narrative/assessment text → `var(--font-serif)`, `font-style: italic`
- Page titles → `var(--font-serif)`, `font-style: italic`, `font-size: 22px`
- Never use system fonts, Inter, Roboto, or Arial anywhere in the platform

---

## CSS Variables — paste this `:root` block into every component

```css
:root {
  /* Backgrounds */
  --bg:             #1e2128;   /* page background */
  --surface:        #252930;   /* cards, panels */
  --surface-raised: #2c3038;   /* panel headers, table headers, inputs on hover */
  --surface-deep:   #1a1d24;   /* sidebar, topbar, footer, inputs at rest */
  --border:         rgba(255,255,255,0.07);
  --border-accent:  rgba(255,255,255,0.14);

  /* Brand */
  --gold:      #c8a84b;
  --gold-dim:  rgba(200,168,75,0.14);

  /* Semantic status colors */
  --green:     #4caf82;  --green-dim:  rgba(76,175,130,0.12);
  --amber:     #e8a040;  --amber-dim:  rgba(232,160,64,0.12);
  --coral:     #e07060;  --coral-dim:  rgba(224,112,96,0.13);
  --blue:      #5b9bd5;  --blue-dim:   rgba(91,155,213,0.12);
  --violet:    #9b8fd4;  --violet-dim: rgba(155,143,212,0.12);

  /* Credit band system — SAT / PW / WDW */
  --sat-color: #4caf82;
  --sat-bg:    rgba(76,175,130,0.10);
  --sat-border:rgba(76,175,130,0.28);
  --pw-color:  #e8a040;
  --pw-bg:     rgba(232,160,64,0.10);
  --pw-border: rgba(232,160,64,0.30);
  --wdw-color: #e07060;
  --wdw-bg:    rgba(224,112,96,0.10);
  --wdw-border:rgba(224,112,96,0.28);

  /* Text hierarchy */
  --text:       #d8dce6;   /* primary text */
  --text-dim:   #7a8494;   /* secondary / metadata */
  --text-muted: #4e5568;   /* tertiary / disabled / labels */

  /* Shape */
  --radius:    6px;
  --radius-lg: 10px;

  /* Font shorthand */
  --font-mono:  'DM Mono', monospace;
  --font-body:  'Syne', sans-serif;
  --font-serif: 'Instrument Serif', serif;
}
```

---

## Layout Chrome

### Sidebar
- Width: `160px`, fixed left, `background: #191c22`, `border-right: 1px solid var(--border)`
- Logo mark: `font-family: var(--font-mono)`, gold text, gold border, `padding: 4px 7px`, `border-radius: 3px`
- Section label: `9px`, `font-weight: 700`, `text-transform: uppercase`, `letter-spacing: 0.1em`, `color: var(--gold)`
- Nav items: `12px`, `font-weight: 500`, `color: var(--text-dim)` at rest, `color: var(--gold)` when active

### Topbar
- Height: `44px`, fixed top (left: 160px), `background: #191c22`, `border-bottom: 1px solid var(--border)`
- Stage tabs: `11px`, `font-weight: 600`, `text-transform: uppercase`, `letter-spacing: 0.06em`
- Active stage: `color: var(--text)`, `background: var(--bg)`, `border-bottom: 2px solid var(--gold)`
- Done stages: numbered circle `background: var(--green-dim)`, `color: var(--green)`
- Active stage circle: `background: var(--gold)`, `color: #1a1a14`

### Footer action bar
- Fixed bottom (left: 160px), `background: #191c22`, `border-top: 1px solid var(--border)`, `padding: 12px 28px`
- Left: metadata in `var(--font-mono)` at `10px`
- Right: action buttons

### Content area
- `margin-left: 160px`, `padding-top: 44px`
- Content padding: `24–28px` horizontal, `24px` top, `80px` bottom (footer clearance)

---

## Component Patterns

### Panels / Cards
```css
.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);   /* 10px */
  overflow: hidden;
}
.panel-header {
  padding: 12px 16–18px;
  background: var(--surface-raised);
  border-bottom: 1px solid var(--border);
}
.panel-title {
  font-size: 9px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.12em; color: var(--text-dim);
  font-family: var(--font-mono);
}
```

### Section dividers
```css
.section-divider {
  font-size: 9px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.14em; color: var(--text-muted);
  font-family: var(--font-mono);
  display: flex; align-items: center; gap: 10px;
}
.section-divider::before { content:''; flex: 0 0 14px; height: 1px; background: var(--border-accent); }
.section-divider::after  { content:''; flex: 1; height: 1px; background: var(--border); }
```

### Credit band chips
```css
.chip {
  font-family: var(--font-mono); font-size: 9px; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase;
  padding: 2px 7px; border-radius: 3px;
}
/* Apply modifiers: */
.chip-sat { background: var(--sat-bg); color: var(--sat-color); border: 1px solid var(--sat-border); }
.chip-pw  { background: var(--pw-bg);  color: var(--pw-color);  border: 1px solid var(--pw-border); }
.chip-wdw { background: var(--wdw-bg); color: var(--wdw-color); border: 1px solid var(--wdw-border); }
```

### Buttons
```css
/* Primary (advance action) */
.btn-gold  { background: var(--gold); color: #18140a; }
/* Destructive */
.btn-coral { background: var(--coral); color: #fff; }
/* Ghost / secondary */
.btn-ghost {
  background: transparent; color: var(--text-dim);
  border: 1px solid var(--border-accent);
}
/* All buttons share: */
.btn {
  padding: 8px 16px; border-radius: var(--radius);
  font-family: var(--font-body); font-size: 11px; font-weight: 700;
  letter-spacing: 0.06em; text-transform: uppercase;
}
/* Small ghost (inline in panel headers): */
.btn-ghost-sm {
  font-family: var(--font-mono); font-size: 9px; font-weight: 600;
  letter-spacing: 0.06em; text-transform: uppercase;
  padding: 3px 9px; border-radius: 4px;
  background: transparent; color: var(--text-muted);
  border: 1px solid var(--border);
}
.btn-ghost-sm:hover { color: var(--gold); border-color: rgba(200,168,75,0.4); }
```

### Metric rows (data tables)
```css
.metric-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 0; border-bottom: 1px solid var(--border);
}
/* Label */  font-size: 11px; color: var(--text-dim);
/* Value */  font-family: var(--font-mono); font-size: 12px; font-weight: 500; color: var(--text);
/* Sub */    font-family: var(--font-mono); font-size: 9px; color: var(--text-muted);
```

### Entrance animations
```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* Stagger panels: animation-delay: 0.05s per child */
.panel { animation: fadeUp 0.3s ease both; }
```

---

## Data Hierarchy Color Rules

| Context | Color |
|---|---|
| SAT / positive / improving | `var(--green)` `#4caf82` |
| PW / marginal / watch | `var(--amber)` `#e8a040` |
| WDW / breach / deteriorating | `var(--coral)` `#e07060` |
| Primary brand action / gold accent | `var(--gold)` `#c8a84b` |
| Informational / neutral data | `var(--blue)` `#5b9bd5` |
| Primary text | `var(--text)` `#d8dce6` |
| Metadata, secondary labels | `var(--text-dim)` `#7a8494` |
| Disabled, muted, placeholder | `var(--text-muted)` `#4e5568` |

**Critical rule:** SAT = green, PW = amber, WDW = coral/red. Never swap these. They map to regulatory pass/watch/special mention respectively and must be consistent across every component.

---

## The Three-Screen Workflow (Credit Analysis)

The screens form a linear gate sequence. Each advances to the next:

```
Step 1: Deal Value       → Step 2: Policy         → Step 3: Yardbook       → Step 4: Approval
deal_value_page.html       policy_analysis_page.html  yardbook_package_assembly.html
Market data ribbon         Policy match banner         Composite rating banner    (TBD)
Coverage corridor mini     Variance chart              5 dimension cards
Collateral LTV ring        Threshold confirmation      Narrative panels
Pricing derivation         Exception workflow          Validation track
Policy dim preview strip   Gate / Yardbook unlock      Override mechanics
```

Each step's footer has: left metadata strip | Recommend Decline (coral) | Advance (gold).

---

## Anti-patterns — Never Do These

- Do not use Inter, Roboto, Arial, or system-ui anywhere
- Do not use purple gradient backgrounds
- Do not use rounded pill buttons (use `border-radius: 6px` max)
- Do not use bright white backgrounds — use `var(--bg)` `#1e2128` as the page floor
- Do not use generic blue for status (blue is informational only — `var(--blue)`)
- Do not use green for primary actions — green is SAT/positive data only
- Do not use `font-weight: 400` for labels — minimum `500`, headers `700`
- Do not use > 2px border-radius on chips/badges — keep them crisp (`3–4px`)
- Narrative text (Instrument Serif italic) is only for LLM-generated content — not for UI labels

---

## Referencing in Claude Code Sessions

Add to CLAUDE.md or prepend to any relevant prompt:

> "Apply the design system defined in DESIGN_SYSTEM.md. Use Syne for body/UI text, DM Mono for all data values and codes, and Instrument Serif italic for narrative/LLM-generated text only. Background #1e2128, surfaces #252930 / #2c3038. SAT = #4caf82, PW = #e8a040, WDW = #e07060. Gold #c8a84b for primary actions. Match panel, chip, button, and section divider patterns exactly as specified."
