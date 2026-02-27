# Landing Page Redesign

**Last Updated:** 2026-02-24
**Status:** In progress

## Current State

The landing page has five sections with proper visual rhythm:

```text
Hero (light)        — left text + CTAs, right TerminalDemo
Features (gray)     — "What it checks" — 6 static cards
PromptDemo (dark)   — "Works where you already code" — animated Claude Code UI
Install CTA (dark)  — "npx claudelint check-all" + copy button
Footer (dark)       — 5-column link grid
```

Components: `TerminalDemo.vue`, `FeaturesSection.vue`, `PromptDemo.vue`, `InstallCTA.vue`, `HomeFooter.vue`

## Completed

- [x] TerminalDemo: animated `claudelint check-all --verbose` output
- [x] PromptDemo: cycling prompts with morph effect, spinning star indicator, line-by-line response
- [x] FeaturesSection: 6-card grid with validator categories
- [x] InstallCTA: dark section with copy-able install command
- [x] Section flow: light → gray → dark → dark → dark visual rhythm

## Next: Interactive Features Section

### Goal

Replace the static 6-card grid with an interactive tabbed component that showcases actual rules from each validator category. Users select a category to see real rule cards, giving them a concrete sense of what claudelint catches.

### Data Approach

**Curated IDs, live content.** Hardcode a curated list of 3 rule IDs per category (18 total). At build time, import the actual rule metadata (`meta.docs.summary`, `severity`, `fixable`, `category`) from the rule source files via a VitePress data loader. This keeps the showcase editorially curated while content stays in sync with the codebase.

**VitePress data loader pattern:**

```text
website/data/showcase-rules.data.ts
  → imports curated rule IDs
  → loads each rule's meta from src/rules/
  → exports { category, rules[] } for the component
```

The component consumes this at build time — no runtime data fetching.

### Categories to Show

Consolidate 10 categories into 6 tabs:

| Tab Label | Source Categories | Rule Count | Showcase Rules (3 per tab) |
|-----------|------------------|------------|---------------------------|
| CLAUDE.md | claude-md | 15 | `claude-md-size`, `claude-md-import-missing`, `claude-md-import-circular` |
| Skills | skills | 43 | `skill-dangerous-command`, `skill-hardcoded-secrets`, `skill-description-quality` |
| Agents | agents | 12 | `agent-description`, `agent-model`, `agent-skills-not-found` |
| MCP | mcp | 11 | `mcp-invalid-transport`, `mcp-http-invalid-url`, `mcp-sse-transport-deprecated` |
| Plugins | plugin | 12 | `plugin-invalid-version`, `plugin-missing-file`, `plugin-description-required` |
| Hooks & Settings | hooks, settings | 8 | `hooks-invalid-event`, `settings-invalid-permission`, `settings-invalid-env-var` |

### Navigation Component

**Recommended: Underline tabs with progress fill.**

A row of category names. The active tab has an underline that fills left-to-right over 5 seconds, acting as both the active indicator and the auto-advance timer. When the fill completes, the next tab activates.

**Behavior:**

- Click a tab: switches immediately, resets timer
- Hover over tab area: pauses the timer
- Leave hover: resumes timer
- Mobile: tabs scroll horizontally or wrap to 2 rows

**Why underline tabs over other options:**

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Underline tabs** | Minimal, progress fill is dual-purpose, matches existing nav | Needs 5-7 items max | Recommended |
| Pills | Clear active state, compact | Cluttered at 6+, heavy chrome | Good alternative |
| Segmented control | Cohesive, iOS-native feel | Too tight for 6 items | Too constrained |
| Chip carousel | Handles many items | Hides items off-screen | Overkill for 6 |
| Progress dots | Minimal, content-focused | Can't see categories without clicking | Too hidden |
| Vertical sidebar | Editorial feel | Too much space, bad on mobile | Wrong context |

### Card Animation

When a tab is selected (or auto-advances), the 3 rule cards:

1. Previous cards fade out instantly (opacity 0)
2. New cards stagger in: fade up + slide from 4px below
3. Delay between cards: 120ms
4. Each card animation duration: 250ms ease

This matches the PromptDemo's line-reveal pattern for visual consistency.

### Card Design

Use a simplified version of the existing `RuleCard.vue`:

- Rule ID in monospace code style
- One-line description from `meta.docs.summary`
- Severity dot (error/warning/info) with label
- Fixable badge if applicable
- Entire card links to the rule's documentation page

### Section Layout

```text
┌─────────────────────────────────────────────────────┐
│                   VALIDATORS                         │  ← eyebrow
│              What it checks                          │  ← heading
│  claudelint validates every part of your...          │  ← subtitle
│                                                      │
│  CLAUDE.md   Skills   Agents   MCP   Plugins   H&S  │  ← tabs
│  ████████░░░░░░░░░░                                  │  ← progress fill
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │ rule-id  │  │ rule-id  │  │ rule-id  │           │  ← 3 cards
│  │ desc...  │  │ desc...  │  │ desc...  │           │
│  │ ● error  │  │ ● warn   │  │ ● warn   │           │
│  └──────────┘  └──────────┘  └──────────┘           │
│                                                      │
│              114 rules across 10 categories →        │  ← link to rules overview
└─────────────────────────────────────────────────────┘
```

### Implementation Steps

1. **Create data loader** (`website/data/showcase-rules.data.ts`)
   - Define curated rule IDs per category
   - Import rule meta from `src/rules/` at build time
   - Export structured data for the component

2. **Create `ShowcaseCard.vue`**
   - Simplified rule card for the landing page
   - Props: ruleId, description, severity, fixable, link
   - Lighter styling than the full RuleCard

3. **Rewrite `FeaturesSection.vue`**
   - Replace static 6-card grid with tabbed interface
   - Underline tabs with progress fill animation
   - Card grid with stagger animation
   - Auto-advance timer (5s) with pause-on-hover
   - "114 rules across 10 categories →" link at bottom

4. **Responsive behavior**
   - Desktop: 3-column card grid, tabs in a row
   - Tablet: 2-column cards, tabs scroll
   - Mobile: 1-column cards, tabs wrap or scroll

---

## Future Iterations

### PromptDemo Enhancements

- Add more scenarios (currently 3, full list of 9 skills available)
- Pause animation on hover for reading
- "Try it yourself" CTA below terminal linking to getting-started
- Mobile: static version showing 3-4 prompt examples as cards

### Install CTA Enhancements

- Tab between npm/npx/pnpm install commands
- "Works with" badges (Claude Code, CI/CD, npm scripts)

### Additional Sections (if needed)

- **Before/After** — show broken CLAUDE.md → claudelint output → fixed version
- **Trust bar** — GitHub stars, npm downloads, rule count
- **Testimonials** — developer quotes (when available)
- **Integration logos** — Claude Code, GitHub Actions, npm

### Design System Notes

- Terracotta accent (#d97757) used ONLY in hero name + dark mode nav indicators
- Card patterns: 8px radius, 1px divider border, hover shadow lift
- Heading font: Source Serif 4 (serif)
- Monospace: SF Mono / Cascadia Code / Fira Code
- Severity colors: error #dc2626, warning #d97706, info #64748b
- Dark section bg: #1e1b18 (PromptDemo, InstallCTA), footer: #1a1a19
