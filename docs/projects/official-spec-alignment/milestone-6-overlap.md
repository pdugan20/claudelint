# Milestone 6 Overlap Analysis

**Created:** 2026-02-06

This document tracks how the official spec alignment work affects existing Milestone 6 (Medium Skill Rules) in the ROADMAP.

---

## Direct Overlaps

### M1: skill-description-missing-trigger-phrases -> Our B5

ROADMAP M1 and our B5 (`skill-description-missing-trigger`) are the same rule. The spec in `medium-rules.md` includes a detailed implementation strategy with a trigger phrase library.

**Recommendation:** Implement as B5 during spec alignment work. Remove M1 from Milestone 6 or mark as "done via official-spec-alignment". The implementation should reference both the medium-rules.md spec AND the Anthropic guide's description structure (`[What it does] + [When to use it] + [Key capabilities]`).

---

## Rules Affected by Spec Findings

### M15: skill-frontmatter-missing-tags

The ROADMAP lists this as warning when `tags` is missing. However, `tags` is **not an official frontmatter field** in either code.claude.com or the Anthropic Skills Guide PDF. Claude Code silently ignores this field.

**Recommendation:** Remove M15 from Milestone 6. Instead, consider a low-priority informational rule that notes `tags` is non-standard. Do not warn on its absence.

### M16: skill-frontmatter-missing-version

The ROADMAP lists this as warning when `version` is missing. However, `version` is **not an official top-level frontmatter field**. The Anthropic guide suggests version should live under `metadata: { version: "1.0.0" }`.

**Recommendation:** Rethink M16. Options:

1. Remove it entirely (version is not required by any official source)
2. Change to suggest `metadata.version` instead of top-level `version`
3. Keep as a soft best-practice suggestion rather than a warning

### M17: skill-version-compatibility-check

The medium-rules.md spec defines this as validating the `compatibility` field format. This aligns with our finding that `compatibility` is an official field (1-500 chars per the Skills Guide PDF).

**Recommendation:** Keep M17 but implement after A4 (adding `compatibility` to the schema). A4 adds the field to the schema; M17 validates its content.

---

## ROADMAP Name Discrepancy

The ROADMAP Milestone 6 task list uses different rule names than the archived `medium-rules.md` spec for M15-M17:

| Position | ROADMAP Name | medium-rules.md Name |
|----------|-------------|---------------------|
| M15 | skill-frontmatter-missing-tags | skill-error-handling-documentation |
| M16 | skill-frontmatter-missing-version | skill-duplicate-content-check |
| M17 | skill-description-missing-context | skill-version-compatibility-check |

The ROADMAP appears to have been updated with different rules than the original spec. When reconciling, use the ROADMAP names as current intent, but verify against the original specs for implementation details.

---

## Summary of Changes to Milestone 6

| Rule | Action |
|------|--------|
| M1 | Remove from M6 (implemented in spec-alignment B5) |
| M15 | Remove or deprioritize (`tags` is non-official) |
| M16 | Rethink (top-level `version` is non-official) |
| M17 | Keep, depends on A4 schema update |
| All others | No change |

Net effect: Milestone 6 drops from 17 to 14-15 rules.
