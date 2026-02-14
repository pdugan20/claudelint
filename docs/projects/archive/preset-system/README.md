# Preset System Project (Slim)

**Status**: Complete
**Target Release**: 0.3.0
**Last Updated**: 2026-02-14

---

## Background

claudelint currently enables all 116 rules at their source-defined severity. Every new rule ships "on" for everyone, which creates noise for new users and makes CI upgrades risky. The `recommended` field already exists on 89 of 116 rules via `docs.recommended`, but nothing consumes it at runtime.

### Decision: Slim Kernel First

We evaluated full preset systems across ESLint, Biome, stylelint, and Prettier. The consistent pattern: presets are added after users demonstrate need, not before launch. A full 7-phase preset project (metadata migration, severity override maps, CI quality gates) is premature for a tool that hasn't shipped its first stable release.

**Instead, we're shipping the minimum viable preset layer:**

1. Generate `presets/recommended.json` and `presets/all.json` from existing `docs.recommended` flags at build time
2. Add `claudelint:` prefix resolution to `extends.ts`
3. Bundle presets in the npm package
4. Document in website configuration guide

This gives users `{ "extends": "claudelint:recommended" }` on day one with zero metadata refactoring.

---

## Scope

### In Scope

- Preset JSON generation script (`scripts/generate/presets.ts`)
- `claudelint:recommended` and `claudelint:all` resolution in config loader
- `presets/` directory bundled in npm package
- Init wizard option for preset selection
- Website documentation (configuration.md, getting-started.md)
- Tests (unit + integration)

### Out of Scope (Future Work)

- Moving `recommended` from `docs.recommended` to `meta.recommended` (unnecessary refactoring)
- Severity override map (recommended preset uses source severities)
- Third-party/shareable preset packages
- Category-based presets (`claudelint:skills-strict`)
- `--preset` CLI flag
- CI quality gates for preset freshness
- "Recommended" badge on website rule pages

---

## Key Facts

- **89 of 116 rules** already have `recommended: true` in `docs.recommended`
- **27 rules** have no `recommended` flag (treated as not-recommended)
- Init wizard already uses `buildRulesFromRegistry()` checking `docs?.recommended`
- `extends.ts` already handles relative paths and node_modules — just needs `claudelint:` prefix
- No config = all rules (backward compatible, unchanged)

---

## File Summary

| Document | Purpose |
|----------|---------|
| [README.md](./README.md) | This file -- project overview |
| [design.md](./design.md) | Technical design |
| [tracker.md](./tracker.md) | Task tracker with checkboxes |

---

## Related Documents

- [Configuration guide](../../website/guide/configuration.md) -- current extends behavior
- [`src/utils/config/extends.ts`](../../src/utils/config/extends.ts) -- config resolution
- [`src/cli/init-wizard.ts`](../../src/cli/init-wizard.ts) -- init wizard with recommended logic
