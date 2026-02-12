# Preset System — Task Tracker

**Last Updated**: 2026-02-11
**Status**: Planned
**Progress**: 0/28 (0%)

---

## How to Use This Tracker

- Mark tasks with `[x]` when complete
- Update phase progress after each task
- Update "Last Updated" date when you make changes
- Link to commits/PRs in Notes where applicable

---

## Phase 1: Rule Audit (Foundation)

**Progress**: 0/6 (0%)
**Estimated Time**: 2-3 hours
**Depends on**: Nothing

Decide which of the 120 rules belong in `recommended`. This must happen first because everything else depends on it.

- [ ] **P1-1**: Define recommended criteria (document in `rule-audit.md`)
  - Correctness-focused, low false-positive, stable, broadly applicable
  - Notes: Criteria already drafted in design.md, formalize in rule-audit.md

- [ ] **P1-2**: Audit CLAUDE.md rules (16 rules)
  - File: `rule-audit.md` — CLAUDE.md section
  - Action: Mark each rule recommended/not with rationale

- [ ] **P1-3**: Audit Skills rules (46 rules)
  - File: `rule-audit.md` — Skills section
  - Action: Mark each rule recommended/not with rationale

- [ ] **P1-4**: Audit remaining categories (58 rules)
  - Categories: Settings (5), Hooks (3), MCP (13), Plugin (12), Commands (2), Agents (12), OutputStyles (3), LSP (8)
  - File: `rule-audit.md` — remaining sections

- [ ] **P1-5**: Identify severity overrides for recommended preset
  - Action: List rules where recommended severity should differ from source severity
  - File: `rule-audit.md` — overrides section

- [ ] **P1-6**: Final review — ensure recommended set is coherent
  - Target: 60-80 rules in recommended (~50-65% of total)
  - Verify no critical correctness rules are excluded
  - Verify no noisy/subjective rules are included

**Phase 1 Verification:**

- [ ] `rule-audit.md` complete with all 120 rules categorized and rationales

---

## Phase 2: Metadata Migration

**Progress**: 0/5 (0%)
**Estimated Time**: 2-3 hours
**Depends on**: Phase 1

Move `recommended` from `docs.recommended` to top-level `meta.recommended` on every rule.

- [ ] **P2-1**: Add `recommended: boolean` to `RuleMetadata` interface
  - File: `src/types/rule.ts`
  - Action: Add field, make it required

- [ ] **P2-2**: Remove `recommended` from `RuleDocumentation` interface
  - File: `src/types/rule-metadata.ts`
  - Action: Remove optional field

- [ ] **P2-3**: Update all 120 rule files — move `docs.recommended` to `meta.recommended`
  - Files: `src/rules/**/*.ts` (120 files)
  - Action: Set `recommended: true` or `recommended: false` based on Phase 1 audit
  - Notes: Can be done with a script or bulk edit

- [ ] **P2-4**: Update rule generators to include `recommended` in output
  - Files: `scripts/generate-rule-types.ts`, any rule scaffolding templates
  - Action: Ensure new rules get `recommended: false` by default

- [ ] **P2-5**: Update tests — fix any type errors from metadata change
  - Files: `tests/**/*.ts` as needed
  - Action: Add `recommended` field to test fixtures and builders

**Phase 2 Verification:**

- [ ] `npm run build` passes with zero type errors
- [ ] `npm test` passes — all existing tests green
- [ ] Every rule has exactly one `recommended` field at meta level (not docs level)

---

## Phase 3: Preset Generation

**Progress**: 0/5 (0%)
**Estimated Time**: 3-4 hours
**Depends on**: Phase 2

Build the preset JSON generator and output files.

- [ ] **P3-1**: Create preset generator script
  - New file: `scripts/generate/presets.ts`
  - Action: Generate `presets/recommended.json` and `presets/all.json` from registry
  - Include severity override map for recommended preset

- [ ] **P3-2**: Create `presets/` directory and add to package.json `files`
  - Files: `package.json`, `.gitignore` (if needed)
  - Action: Ensure `presets/` is included in npm package

- [ ] **P3-3**: Wire generator into build pipeline
  - File: `package.json`
  - Action: Add `generate:presets` script, call from `build` and `docs:generate`

- [ ] **P3-4**: Add preset snapshot tests
  - New file: `tests/presets/preset-generation.test.ts`
  - Action: Verify generated JSON matches expected rule list
  - Include snapshot of recommended rules for regression detection

- [ ] **P3-5**: Generate initial preset files
  - Action: Run generator, commit output files
  - Verify: `presets/recommended.json` has expected rule count
  - Verify: `presets/all.json` has all 120 rules

**Phase 3 Verification:**

- [ ] `npm run generate:presets` produces correct JSON files
- [ ] `npm pack --dry-run` includes `presets/` directory
- [ ] Snapshot tests pass

---

## Phase 4: Config Resolution

**Progress**: 0/5 (0%)
**Estimated Time**: 3-4 hours
**Depends on**: Phase 3

Wire built-in preset resolution into the config loading pipeline.

- [ ] **P4-1**: Add built-in preset resolution to `extends.ts`
  - File: `src/utils/config/extends.ts`
  - Action: Resolve `claudelint:recommended` and `claudelint:all` to bundled JSON
  - Handle: Error message if preset name is invalid (`claudelint:unknown`)

- [ ] **P4-2**: Add config loader tests for preset extends
  - File: `tests/utils/config/extends.test.ts` (existing or new)
  - Cases:
    - `claudelint:recommended` resolves to file
    - `claudelint:all` resolves to file
    - `claudelint:unknown` throws clear error
    - Preset + user overrides merge correctly
    - Preset + relative extends chain works

- [ ] **P4-3**: Integration test — recommended preset only runs recommended rules
  - File: `tests/integration/presets.test.ts` (new)
  - Action: Lint a fixture project with `extends: "claudelint:recommended"`, verify only recommended rules fire

- [ ] **P4-4**: Integration test — all preset matches no-config behavior
  - File: `tests/integration/presets.test.ts`
  - Action: Compare results of no-config vs `extends: "claudelint:all"` — must be identical

- [ ] **P4-5**: Integration test — preset + overrides
  - File: `tests/integration/presets.test.ts`
  - Action: Extend recommended, turn off one rule, turn on one extra — verify both overrides apply

**Phase 4 Verification:**

- [ ] All unit and integration tests pass
- [ ] `claudelint --config` with preset extends works end-to-end

---

## Phase 5: Init Wizard Update

**Progress**: 0/3 (0%)
**Estimated Time**: 1-2 hours
**Depends on**: Phase 4

Update the init wizard to offer preset selection instead of hardcoded rules.

- [ ] **P5-1**: Update init wizard prompts
  - File: `src/cli/init-wizard.ts`
  - Action: Replace hardcoded rule config with preset selection menu
  - Options: Recommended (default), All rules, Manual

- [ ] **P5-2**: Generate correct config for each option
  - Recommended: `{ "extends": "claudelint:recommended" }`
  - All rules: `{ "extends": "claudelint:all" }`
  - Manual: `{ "rules": {} }` (empty, user adds rules)

- [ ] **P5-3**: Update init wizard tests
  - File: `tests/cli/init-wizard.test.ts` (existing or new)
  - Action: Test each selection generates correct config

**Phase 5 Verification:**

- [ ] `claudelint init` interactive flow works for all three options
- [ ] Generated config files are valid and loadable

---

## Phase 6: Documentation

**Progress**: 0/6 (0%)
**Estimated Time**: 3-4 hours
**Depends on**: Phase 4

Document presets for users, the website, and rule authors.

- [ ] **P6-1**: Update `docs/configuration.md` — add Presets section
  - Cover: built-in presets, extends syntax, override patterns, examples

- [ ] **P6-2**: Update `website/guide/getting-started.md` — add preset quickstart
  - Action: After install, show `claudelint init` with preset selection

- [ ] **P6-3**: Update `website/guide/rules-overview.md` — explain recommended vs all
  - Action: Section explaining what "recommended" means and how to use it

- [ ] **P6-4**: Add "Recommended" badge back to `<RuleHeader>` component
  - File: `website/.vitepress/theme/components/RuleHeader.vue`
  - Action: Add optional `recommended` prop, show green badge when true
  - File: `scripts/generators/rule-page.ts`
  - Action: Pass `recommended` prop from rule metadata

- [ ] **P6-5**: Update rule author documentation
  - File: `CONTRIBUTING.md` or rule author guide
  - Action: Document `recommended` field, criteria for inclusion, review process

- [ ] **P6-6**: Update `docs/custom-rules.md`
  - Action: Note that custom rules can set `recommended` field

**Phase 6 Verification:**

- [ ] `npm run docs:build` passes with no dead links
- [ ] Website rule pages show "Recommended" badge for recommended rules
- [ ] Configuration docs are accurate and complete

---

## Phase 7: CI & Quality Gates

**Progress**: 0/4 (0%)
**Estimated Time**: 1-2 hours
**Depends on**: Phase 3

Ensure presets stay in sync and correct over time.

- [ ] **P7-1**: Add CI check — preset files are up to date
  - File: `.github/workflows/ci.yml`
  - Action: Run `npm run generate:presets` and `git diff --exit-code presets/`
  - Pattern: Same as existing `docs:generate` freshness check

- [ ] **P7-2**: Add pre-commit hook — auto-regenerate presets on rule changes
  - File: `.husky/pre-commit`
  - Action: If `src/rules/**` files changed, regenerate presets and auto-stage

- [ ] **P7-3**: Add check — every rule has `recommended` field set
  - File: `scripts/check/` (new check or extend consistency check)
  - Action: Fail if any rule is missing `recommended: boolean`

- [ ] **P7-4**: Add check — recommended preset count is within expected range
  - Action: Warn if recommended count drops below 50 or exceeds 100
  - Purpose: Catch accidental mass-inclusion or mass-exclusion

**Phase 7 Verification:**

- [ ] CI pipeline runs preset checks alongside existing checks
- [ ] Committing a new rule without `recommended` field fails pre-commit

---

## Summary

| Phase | Tasks | Estimated Time | Depends On |
|-------|-------|---------------|------------|
| 1. Rule Audit | 6 | 2-3 hours | Nothing |
| 2. Metadata Migration | 5 | 2-3 hours | Phase 1 |
| 3. Preset Generation | 5 | 3-4 hours | Phase 2 |
| 4. Config Resolution | 5 | 3-4 hours | Phase 3 |
| 5. Init Wizard Update | 3 | 1-2 hours | Phase 4 |
| 6. Documentation | 6 | 3-4 hours | Phase 4 |
| 7. CI & Quality Gates | 4 | 1-2 hours | Phase 3 |
| **Total** | **34** | **~2-3 days** | |

Phases 5, 6, and 7 can run in parallel after Phase 4 completes.

---

**Last Updated**: 2026-02-11
