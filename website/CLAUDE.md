# Website (VitePress Documentation Site)

## Commands

```bash
npm run docs:dev         # Dev server (auto-generates rule docs first)
npm run docs:build       # Production build
npm run docs:preview     # Preview production build locally
npm run docs:generate    # Regenerate rule docs from source metadata
```

## Auto-Generated Pages

**Do NOT hand-edit files in `website/rules/` — they are generated from source metadata.**

Run `npm run docs:generate` to regenerate. This creates:

- `rules/**/*.md` — one page per rule, from `rule.meta.docs`
- `rules/_sidebar.json` — sidebar nav structure
- `data/rule-stats.json` — rule counts used by `<RuleCount />` component

To change rule documentation, edit the rule's `meta.docs` fields in `src/rules/<category>/<rule-name>.ts`.

## Custom Vue Components

Available in `website/.vitepress/theme/components/`:

| Component | Purpose |
|-----------|---------|
| `<CodeTabs />` | Tabbed code examples |
| `<ConfigExample />` | Configuration file examples |
| `<FeatureGrid />` | Feature cards on landing page |
| `<RuleBadge />` | Severity/category badge for rules |
| `<RuleCard />` | Rule summary card |
| `<RuleCount />` | Dynamic rule count from `data/rule-stats.json` |
| `<RuleHeader />` | Standardized rule page header |
| `<TerminalDemo />` | Animated terminal on homepage |
| `<ValidatorDiagram />` | Validator architecture diagram |

Components are registered globally in `.vitepress/theme/index.ts`.

## Theme and Styling

- Config: `website/.vitepress/config.mts`
- Main CSS: `website/.vitepress/theme/style.css`
- Syntax themes: `claude-light.json`, `claude-dark.json`
- Design: warm Anthropic-inspired palette with terracotta accent
- Heading font: Source Serif 4 (loaded from Google Fonts)
- CSS custom properties override VitePress defaults (`--vp-c-brand-*`, `--vp-c-bg-*`, etc.)

## Linting

Website files have their own lint targets:

- **Vue**: `npm run lint:vue` (ESLint with vue-eslint-parser)
- **CSS**: `npm run lint:css` (Stylelint)
- **Markdown**: runs under the global `npm run lint:md`

## Project Docs

The `docs/projects/` directory contains internal project tracking only. All user-facing documentation lives here in `website/`.
