# Official Spec Alignment Tracker

**Status:** Not started
**Created:** 2026-02-06

---

## Phase A: Critical Fixes (Wrong Results)

These items fix actively incorrect linter output.

### A1: Update KNOWN_KEYS in skill-frontmatter-unknown-keys

- **File:** `src/rules/skills/skill-frontmatter-unknown-keys.ts`
- **Problem:** Missing 5 official fields, causing false-positive warnings
- **Action:** Add `argument-hint`, `disable-model-invocation`, `user-invocable`, `hooks`, `disallowed-tools`, `license`, `compatibility`, `metadata` to `KNOWN_KEYS`
- **Status:** Not started

### A2: Update skill-description-max-length default

- **File:** `src/rules/skills/skill-description-max-length.ts`
- **Problem:** Default is 500 chars, Anthropic guide says 1024
- **Action:** Change default from 500 to 1024
- **Status:** Not started

### A3: Review thirdPerson() refinement

- **File:** `src/schemas/skill-frontmatter.schema.ts` and `src/schemas/refinements.ts`
- **Problem:** Anthropic guide examples use mixed voice ("Analyzes... Use when..."), our refinement may reject valid patterns
- **Action:** Verify the refinement accepts guide-style descriptions; relax if needed
- **Status:** Not started

### A4: Add license, compatibility, metadata to schema

- **File:** `src/schemas/skill-frontmatter.schema.ts`
- **Problem:** Three official fields from Skills Guide PDF not in our schema
- **Action:** Add `license: z.string().optional()`, `compatibility: z.string().max(500).optional()`, `metadata: z.record(z.unknown()).optional()`
- **Status:** Not started

---

## Phase B: New Rules

### B5: skill-description-missing-trigger

- **New file:** `src/rules/skills/skill-description-missing-trigger.ts`
- **Problem:** Descriptions without trigger phrases cause skills to never load automatically
- **Action:** Warn when description lacks "Use when", "Use for", or quoted trigger phrases
- **Note:** Overlaps with Milestone 6 M1. See [milestone-6-overlap.md](./milestone-6-overlap.md)
- **Status:** Not started

### B6: skill-arguments-without-hint

- **New file:** `src/rules/skills/skill-arguments-without-hint.ts`
- **Problem:** Skills using `$ARGUMENTS` / `$0` / `$1` without `argument-hint` have poor autocomplete UX
- **Action:** Warn when SKILL.md content contains argument substitutions but frontmatter lacks `argument-hint`
- **Status:** Not started

### B7: skill-side-effects-without-disable-model

- **New file:** `src/rules/skills/skill-side-effects-without-disable-model.ts`
- **Problem:** Skills with `Bash` or `Write` in `allowed-tools` can auto-trigger with side effects
- **Action:** Warn when `allowed-tools` includes side-effect tools and `disable-model-invocation` is not `true`
- **Status:** Not started

### B8: plugin-hook-missing-plugin-root

- **New file:** `src/rules/plugin/plugin-hook-missing-plugin-root.ts`
- **Problem:** Plugin hooks without `${CLAUDE_PLUGIN_ROOT}` break after installation to cache
- **Action:** Error when plugin hooks reference scripts without the variable
- **Status:** Not started

### B9: plugin-missing-component-paths

- **New file:** `src/rules/plugin/plugin-missing-component-paths.ts`
- **Problem:** Plugin manifest paths that don't start with `./` or point to non-existent locations
- **Action:** Warn when plugin.json component path fields use invalid paths
- **Status:** Not started

---

## Phase C: Self-Fixes (Our Own Plugin)

### C10: Remove tags and dependencies from skill frontmatter

- **Files:** All 9 `skills/*/SKILL.md` files
- **Problem:** `tags` and `dependencies` are not official frontmatter fields
- **Action:** Remove these fields from all skill frontmatter blocks
- **Status:** Not started

### C11: Add disable-model-invocation to validation skills

- **Files:** All 7 validation skill SKILL.md files + format-cc
- **Problem:** CLI-wrapping skills should not auto-trigger
- **Action:** Add `disable-model-invocation: true` to frontmatter
- **Status:** Not started

### C12: Move verbose sections to references

- **Files:** `skills/validate-all/SKILL.md`, `skills/validate-skills/SKILL.md`
- **Problem:** Long "Common Issues" and "Configuration" sections inline
- **Action:** Move to `references/` subdirectories, link from SKILL.md
- **Status:** Not started

### C13: Scope allowed-tools to specific Bash prefixes

- **Files:** All 9 `skills/*/SKILL.md` files
- **Problem:** Broad `Bash` allows any command, causes permission prompts
- **Action:** Change to `Bash(claudelint:*)` or `Bash(npx claude-code-lint:*)`
- **Status:** Not started

### C14: Consider skill-description-negative-trigger hint

- **New file:** `src/rules/skills/skill-description-negative-trigger.ts`
- **Problem:** Skills without negative triggers may overtrigger
- **Action:** Low-priority suggestion rule for descriptions that could benefit from "Do NOT use for..." patterns
- **Status:** Not started

---

## Post-Implementation

- [ ] Run `npm run generate:types` to regenerate rule index
- [ ] Run `npm test` to verify no regressions
- [ ] Run `npm run build` to verify compilation
- [ ] Run `claudelint check-all` against our own project to verify self-fixes
- [ ] Create rule doc files in `docs/rules/skills/` and `docs/rules/plugin/` for new rules
- [ ] Update Milestone 6 in ROADMAP.md per [milestone-6-overlap.md](./milestone-6-overlap.md)
