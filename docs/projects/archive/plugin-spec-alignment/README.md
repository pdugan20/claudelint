# Plugin Spec Alignment

**Created:** 2026-02-17
**Status:** Active
**Tracker:** [tracker.md](./tracker.md)

## Problem

During pre-release testing, we discovered that plugin installation documentation throughout the codebase referenced syntax that never existed in Claude Code (`/plugin install --source .`, `/plugin install github:owner/repo`). Investigating further revealed that the `MarketplaceMetadataSchema` in our Zod schemas and the two rules that use it (`plugin-invalid-manifest`, `plugin-marketplace-files-not-found`) were built against a completely fabricated spec that does not match the official Claude Code documentation.

## Root Cause

The marketplace.json schema was written based on assumptions rather than the official spec. No reference JSON schema was ever created for it (unlike our 8 other schemas), so it was never validated by schema drift detection in CI.

## Scope

### What is correct (no changes needed)

- `PluginManifestSchema` (Zod) matches the official spec
- `plugin-manifest.schema.json` (JSON reference schema) matches the official spec
- 10 of 12 plugin rules validate plugin.json correctly
- npm package includes `.claude-plugin/` and `skills/` in the `files` array
- Plugin directory structure (`.claude-plugin/plugin.json` at root, `skills/` at root) is correct

### What is broken

1. **Install syntax in 10 files** -- referenced non-existent `/plugin install --source` and `github:owner/repo` syntax. Already fixed (unstaged).

2. **`MarketplaceMetadataSchema`** (`src/validators/schemas.ts:296-307`) -- completely wrong. Our schema has `{ name, description, version, author (string), tags, category, icon, screenshots, readme, changelog }`. The real marketplace.json has `{ name, owner (object), plugins[] (array), metadata? (object) }`. Fields `icon`, `screenshots`, `readme`, `changelog` do not exist in the spec at all.

3. **`plugin-invalid-manifest` rule** (`src/rules/plugin/plugin-invalid-manifest.ts`) -- validates marketplace.json against the fabricated schema. Version matching logic checks a top-level `version` field that doesn't exist in the real format (version is per-plugin in the `plugins[]` array).

4. **`plugin-marketplace-files-not-found` rule** (`src/rules/plugin/plugin-marketplace-files-not-found.ts`) -- checks for `icon`, `screenshots`, `readme`, `changelog` fields that don't exist. Needs to validate real marketplace.json fields instead (e.g., relative `source` paths in plugin entries).

5. **No reference JSON schema** for marketplace.json -- unlike our 8 other schemas, marketplace has no `schemas/marketplace.schema.json` and is not covered by schema drift detection.

6. **Tests are skeletal** -- both rule test files only test edge cases and happy paths. No invalid test cases exist due to filesystem dependency.

## Official Spec References

All three official docs pages were reviewed:

- <https://code.claude.com/docs/en/plugins> -- plugin creation guide
- <https://code.claude.com/docs/en/plugins-reference> -- plugin.json schema, component specs
- <https://code.claude.com/docs/en/plugin-marketplaces> -- marketplace.json schema, distribution

Real-world examples verified against:

- <https://github.com/anthropics/claude-code/blob/main/.claude-plugin/marketplace.json> -- Anthropic's bundled plugins (15 plugins)
- <https://github.com/anthropics/claude-plugins-official/blob/main/.claude-plugin/marketplace.json> -- Anthropic's official directory (50+ plugins)

## Plugin Installation Methods

These are the only installation methods that exist in Claude Code:

| Method | Command | Persistence |
|--------|---------|-------------|
| Local dev/testing | `claude --plugin-dir ./path/to/plugin` | Session only |
| From marketplace | `/plugin marketplace add owner/repo` then `/plugin install name@marketplace` | Persistent |

Marketplace plugin sources support: relative paths (`./plugins/x`), GitHub repos, git URLs, npm packages, and pip packages.

## Related Files

| File | Role |
|------|------|
| `src/validators/schemas.ts` | Zod schemas (PluginManifestSchema correct, MarketplaceMetadataSchema wrong) |
| `schemas/plugin-manifest.schema.json` | Reference JSON schema for plugin.json (correct) |
| `src/rules/plugin/plugin-invalid-manifest.ts` | Rule validating marketplace.json (wrong schema) |
| `src/rules/plugin/plugin-marketplace-files-not-found.ts` | Rule checking marketplace file refs (wrong fields) |
| `tests/rules/plugin/plugin-invalid-manifest.test.ts` | Tests (skeletal) |
| `tests/rules/plugin/plugin-marketplace-files-not-found.test.ts` | Tests (skeletal, validates fake fields) |
