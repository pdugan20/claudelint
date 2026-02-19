# Developer Experience & Defaults Overhaul - Progress Tracker

**Status:** Complete
**Created:** 2026-02-18
**Last Updated:** 2026-02-18

---

## Context

Running claudelint against a real-world project (nextup-backend, 22 skills) produced 175 findings -- most of which were noise. Root causes:

1. No config file = all 120 rules run (should default to recommended 89-rule preset)
2. No `strict` preset tier between `recommended` and `all`
3. Two bug-level false positives in recommended rules
4. Several rules with thresholds too low or detection too naive
5. Four useful rules missing from the recommended preset

This project fixes defaults, adds a strict tier, fixes bugs, improves noisy rules, and updates docs -- making claudelint behave like a mature, opinionated linter out of the box.

---

## Phase 1: Bug Fixes

Pure correctness fixes. No behavior changes for correctly-written code.

### 1.1 Fix `skill-xml-tags-anywhere` URL false positive

`<https://example.com>` flagged as XML tag. Regex doesn't exclude markdown autolinks.

- [x] Add CommonMark autolink spec regex (`/^[a-zA-Z][a-zA-Z0-9+.-]{1,31}:[^<>\x00-\x20]*$/`) to skip URI autolinks
- [x] Test: valid cases for `<https://...>`, `<http://...>`, `<mailto:...>`, `<ftp://...>`
- [x] Test: invalid case for `<https-instructions>` (not a URL)

### 1.2 Fix `claude-md-import-in-code-block` false positive

Regex `/@([^\s]+)/g` matches emails, decorators, JSDoc tags -- not just `@import` directives.

- [x] Narrow regex to require path separator (`/`) -- real imports are `@./path/file.md`
- [x] Test: valid cases for emails, decorators, JSDoc
- [x] Test: invalid cases for real imports still caught

### 1.3 Fix `skill-name-directory-mismatch` template exclusion

`_template/SKILL.md` with `name: skill-name` flagged as mismatch.

- [x] Early return when directory name starts with `_`
- [x] Test: valid case for `_template/SKILL.md`

### 1.4 Verify Phase 1

- [x] `npm test` full suite passes
- [x] `npm run check:self` passes

---

## Phase 2: Rule Improvements

Reduce noise, improve signal. Each is independent.

### 2.1 `skill-body-missing-usage-section` -- accept more headings

Currently only `## Usage` or `## Instructions`. Real skills use many conventions.

- [x] Expand regex to accept: `Usage`, `Instructions`, `Quick Workflow`, `Quick Start`, `Getting Started`, `How to Use`, `Examples`
- [x] Update `meta.docs` description, details, examples
- [x] Test: valid cases for each new accepted heading

### 2.2 `skill-time-sensitive-content` -- add `maxAgeDays` option

Flags ALL dates including recent ones. Should only flag stale dates.

- [x] Add Zod schema with `maxAgeDays` option (default: 180)
- [x] For date-pattern matches, parse date and skip if within threshold
- [x] Relative words (`today`, `yesterday`, `this week`) always flagged
- [x] Test: recent dates (valid), old dates (invalid), relative words (always invalid), custom `maxAgeDays`

### 2.3 `skill-allowed-tools-not-used` -- reduce noise

Reports every unused tool individually. 35 hits on nextup-backend.

- [x] Only report if NONE of the listed tools are referenced in the body
- [x] If at least one tool is referenced, the list is intentional -- skip
- [x] Test: some tools referenced (valid), no tools referenced (invalid)

### 2.4 `claude-md-content-too-many-sections` -- raise default threshold

Default `maxSections=20` too low for real projects (nextup-backend has 53).

- [x] Change `defaultOptions.maxSections` from 20 to 40
- [x] Update docs text
- [x] Update any tests relying on old default

### 2.5 `skill-body-long-code-block` -- raise default threshold

Default `maxLines=20` too strict for skills with code examples.

- [x] Change `defaultOptions.maxLines` from 20 to 40
- [x] Update docs text
- [x] Update any tests relying on old default

### 2.6 Verify Phase 2

- [x] `npm test` passes
- [x] `npm run check:self` passes

---

## Phase 3: Default Behavior Change

The core product change: no config = recommended preset.

### 3.1 Update preset generation to include ALL rules

Currently presets only list included rules. Non-included rules fall through to "enabled at registry default" in the resolver.

- [x] For each preset, iterate ALL registered rules
- [x] Rules in preset get their severity; rules NOT in preset get `"off"`
- [x] `presets/recommended.json` goes from 89 entries to ~120 entries

### 3.2 Load recommended preset when no config found

- [x] `src/cli/utils/config-loader.ts`: when `findConfigFile()` returns null, load `presets/recommended.json`
- [x] `src/api/claudelint.ts`: same change for the programmatic API path
- [x] Backward compatibility: users with `.claudelintrc.json` completely unaffected

### 3.3 Add `--all` CLI flag

- [x] Add `--all` flag that loads `claudelint:all` instead of recommended default
- [x] Ensures the "all rules" behavior is still easily accessible

### 3.4 Tests

- [x] Config-loader returns recommended rules when no config file exists
- [x] `--all` flag overrides the default
- [x] Explicit `.claudelintrc.json` is still respected
- [x] Integration test: unconfigured run produces fewer findings than `--all`

### 3.5 Verify Phase 3

- [x] `npm run validate` passes
- [x] Manual test against nextup-backend: ~30 findings instead of 175

---

## Phase 4: Strict Preset & Membership Changes

### 4.1 Add `strict` field to rule metadata

- [x] Add `strict?: boolean` to `RuleDocumentation` interface in `src/types/rule-metadata.ts`

### 4.2 Annotate rules with `strict: true`

Mark these rules (currently not in recommended) as strict:

- [x] `skill-missing-version`
- [x] `skill-side-effects-without-disable-model`
- [x] `skill-time-sensitive-content`
- [x] `skill-body-long-code-block`
- [x] `skill-allowed-tools-not-used`
- [x] `skill-description-missing-trigger`
- [x] `skill-missing-changelog`
- [x] `skill-body-word-count`
- [x] `skill-body-too-long`
- [x] `skill-deep-nesting`
- [x] `skill-description-max-length`
- [x] `skill-naming-inconsistent`
- [x] `skill-too-many-files`
- [x] `skill-description-quality` (move from recommended to strict -- opinionated)
- [x] Review remaining ~14 non-deprecated, non-recommended rules for strict candidacy

### 4.3 Add rules to recommended preset

Set `recommended: true` on:

- [x] `skill-reference-not-linked` (warn)
- [x] `skill-body-missing-usage-section` (warn)
- [x] `skill-arguments-without-hint` (warn)
- [x] `skill-cross-reference-invalid` (warn)

### 4.4 Update preset generation

- [x] Add `strict.json` generation: includes rules where `docs.recommended || docs.strict`
- [x] Same exhaustive format (non-included rules set to `"off"`)

### 4.5 Register `claudelint:strict` preset

- [x] Add to `BUILTIN_PRESETS` dict in `src/utils/config/extends.ts`

### 4.6 Update init wizard

- [x] Add `strict` as a config choice between recommended and all in `src/cli/init-wizard.ts`

### 4.7 Tests

- [x] Preset generation test: verify strict.json contains expected rules
- [x] Extends test: verify `claudelint:strict` resolves correctly
- [x] Init wizard test: verify strict option appears

### 4.8 Verify Phase 4

- [x] `npm run generate:types && npm run generate:presets && npm test`

---

## Phase 5: Documentation & Website

### 5.1 Update configuration guide

- [x] Add `claudelint:strict` to built-in presets section in `website/guide/configuration.md`
- [x] Note that `recommended` is the default when no config exists
- [x] Show when to use each tier: recommended (getting started), strict (quality-focused), all (maximum)

### 5.2 Update rules overview

- [x] Add preset comparison section showing rule counts per tier in `website/guide/rules-overview.md`
- [x] Update any references to default behavior

### 5.3 Update getting-started guide

- [x] Note sensible defaults (recommended preset) in `website/guide/getting-started.md`
- [x] Show how to opt into stricter checking

### 5.4 Regenerate rule docs

- [x] Run `npm run docs:generate` -- auto-updates all rule pages from metadata changes

### 5.5 Verify Phase 5

- [x] `npm run docs:build` passes
- [x] `npm run lint:md` passes
- [x] Visual review in dev server

---

## Final Verification

After all phases:

- [x] `npm run validate` -- lint + format + build + test all pass
- [x] `npm run check:self` -- dogfood passes
- [x] Run `claudelint` (no config) against nextup-backend -- ~30 actionable findings, not 175
- [x] Run `claudelint --all` against nextup-backend -- ~120+ findings (old behavior preserved)
- [x] `{ "extends": "claudelint:strict" }` against nextup-backend -- ~60 findings
- [x] `claudelint init` offers three preset choices
- [x] `npm run docs:build` -- website builds cleanly
- [x] Review generated rule pages for updated options/descriptions

---

## Key Files

| File | Changes |
|------|---------|
| `src/rules/skills/skill-xml-tags-anywhere.ts` | Bug fix: URL exclusion |
| `src/rules/claude-md/claude-md-import-in-code-block.ts` | Bug fix: narrow regex |
| `src/rules/skills/skill-name-directory-mismatch.ts` | Skip `_` prefix dirs |
| `src/rules/skills/skill-body-missing-usage-section.ts` | Expand accepted headings, add to recommended |
| `src/rules/skills/skill-time-sensitive-content.ts` | Add `maxAgeDays` option |
| `src/rules/skills/skill-allowed-tools-not-used.ts` | Smarter detection logic |
| `src/rules/claude-md/claude-md-content-too-many-sections.ts` | Raise default to 40 |
| `src/rules/skills/skill-body-long-code-block.ts` | Raise default to 40 |
| `scripts/generate/presets.ts` | Exhaustive presets + strict generation |
| `src/cli/utils/config-loader.ts` | Default to recommended when no config |
| `src/api/claudelint.ts` | Same default change for API |
| `src/utils/config/extends.ts` | Register `claudelint:strict` |
| `src/types/rule-metadata.ts` | Add `strict` field |
| `src/cli/init-wizard.ts` | Add strict option |
| `website/guide/configuration.md` | Document strict preset + default behavior |
| `website/guide/rules-overview.md` | Preset comparison |
| `website/guide/getting-started.md` | Updated defaults note |
| ~25 rule files | Add `strict: true` or `recommended: true` to metadata |
| ~10 test files | New/updated test cases |

---

## Industry Standards

- **Preset naming:** Follows TypeScript-ESLint pattern: `recommended` -> `strict` -> `all`
- **Autolink detection:** Uses CommonMark spec regex from `markdown-it`
- **Config resolution:** ESLint-modeled extends system with built-in presets
- **Rule options:** Zod schemas, same pattern as ESLint rule options
