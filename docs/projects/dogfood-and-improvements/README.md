# Dogfood and Improvements Project

**Status**: Phase 1 Complete, Phase 2 Ready
**Progress**: Phase 1 complete (7/7 tasks), Phase 2 ready (0/24 tasks)
**Last Updated**: 2026-02-06

---

## Background

During a review of Anthropic's official `claude-md-management` plugin, we discovered that our own linter **could not validate its own bundled skills**. The root cause was `findSkillDirectories` hardcoding `.claude/skills/*/SKILL.md` as the only search pattern, missing root-level `skills/` directories used by plugins (including ours).

This cascaded into discovering 5 additional linter bugs and numerous skill content quality issues that had gone undetected because the dogfood pipeline was silently passing with zero skills found.

Phase 1 fixed all blocking bugs and content issues. This document catalogs every remaining improvement identified during the audit, plus additional enhancements discovered through analysis, stack-ranked by usefulness and implementation difficulty.

---

## Phase 1: Linter Bug Fixes (COMPLETE)

All 7 tasks completed and committed (`cf4d7d5`, `2ab4160`).

| # | Fix | Files Changed |
|---|-----|---------------|
| 1 | Multi-pattern skill/agent/output-style discovery | `src/utils/filesystem/files.ts` |
| 2 | Dogfood script path `.claude/skills` -> `skills` | `scripts/test/skills/validate-self.sh` |
| 3 | `skill-body-too-long` threshold 400 -> 500 | `src/rules/skills/skill-body-too-long.ts`, doc |
| 4 | `skill-referenced-file-not-found` regex for `./` optional + URL exclusion | `src/rules/skills/skill-referenced-file-not-found.ts`, doc |
| 5 | New rule: `skill-reference-not-linked` | New rule, test, doc |
| 6 | Fix all skill content issues (descriptions, links, code blocks) | All 9 `skills/*/SKILL.md` |
| 7 | Fix `skill-unknown-string-substitution` false positives in code blocks | `src/rules/skills/skill-unknown-string-substitution.ts` |

**Dogfood result after Phase 1**: 0 errors, 1 warning (`skill-body-too-long` on optimize-cc-md at 535 lines)

---

## Phase 2: Improvements Catalog

All improvements identified across the audit, prior session recommendations, and new analysis. Stack-ranked within each tier by a combined usefulness/difficulty score.

### Scoring Key

- **Usefulness**: How much value this adds to the project (1-5)
- **Difficulty**: Implementation effort (1=hours, 2=half-day, 3=1-2 days, 4=3-5 days, 5=1+ week)
- **Priority Score**: Usefulness / Difficulty (higher = do first)

---

### Tier 1: Quick Wins (Priority Score >= 2.0)

High value, low effort. Should be done first.

| # | Improvement | Usefulness | Difficulty | Score | Est. Time |
|---|-------------|:---:|:---:|:---:|-----------|
| 1 | Fix 4 broken `validators.md` links in docs/ | 4 | 1 | 4.0 | 15 min |
| 2 | Trim `optimize-cc-md` under 500 lines | 3 | 1 | 3.0 | 30 min |
| 3 | Add `quality-criteria.md` reference file | 4 | 2 | 2.0 | 2 hrs |
| 4 | Add `templates.md` reference with good CLAUDE.md examples | 4 | 2 | 2.0 | 2 hrs |
| 5 | Add `templates.md` reference to skill, update See Also sections | 3 | 1 | 3.0 | 15 min |

**Details:**

#### T1-1: Fix broken docs links

Four files in `docs/` reference `validators.md` which was renamed to `validation-reference.md`:

- `docs/debugging.md` (line 299)
- `docs/getting-started.md` (line 181)
- `docs/inline-disables.md` (lines 113, 389)
- `docs/hooks.md` (line 202)

Also 2 references in vitepress docs (lower priority, project not active).

#### T1-2: Trim optimize-cc-md under 500 lines

Currently 535 lines. Move these sections to `references/` files:

- "Common Fixes and Improvements" section -> `references/common-fixes.md`
- "Troubleshooting" section -> `references/troubleshooting.md`
- Add markdown links from main SKILL.md to new reference files

This follows Anthropic's progressive disclosure pattern: keep SKILL.md under 500 lines, use reference files for detailed content.

#### T1-3: Add quality-criteria.md reference file

A slim manual review checklist for skill quality, complementing programmatic validation. NOT a scoring rubric. Covers aspects that can't be easily linted:

- Is the description specific enough to trigger correctly?
- Are examples realistic and diverse?
- Does the skill do one thing well?
- Is the error handling appropriate?
- Would a new user understand the skill from its description alone?

#### T1-4: Add templates.md reference file

Provide annotated examples of well-structured CLAUDE.md files:

- Minimal project (5-10 lines)
- Standard project (30-50 lines)
- Complex project with sections and imports
- Monorepo root with workspace references

#### T1-5: Wire up new references in skill

Add references to T1-3 and T1-4 files in `optimize-cc-md/SKILL.md` and cross-reference from `validate-skills/SKILL.md`.

---

### Tier 2: Core Enhancements (Priority Score 1.0-1.99)

High value, moderate effort. The main body of Phase 2 work.

| # | Improvement | Usefulness | Difficulty | Score | Est. Time |
|---|-------------|:---:|:---:|:---:|-----------|
| 6 | Restructure optimize-cc-md into 3-phase workflow | 4 | 3 | 1.33 | 1-2 days |
| 7 | Implement auto-fix for simple rules | 5 | 4 | 1.25 | 3-4 days |
| 8 | Begin skills-quality-validation Easy rules (12 rules) | 5 | 4 | 1.25 | 3-5 days |
| 9 | Pre-commit hook optimization (changed files only) | 4 | 3 | 1.33 | 1-2 days |
| 10 | Validation caching for unchanged files | 4 | 3 | 1.33 | 1-2 days |
| 11 | Cross-skill reference validation | 3 | 2 | 1.50 | 3 hrs |
| 12 | SARIF/JSON output for CI integration | 4 | 3 | 1.33 | 1-2 days |

**Details:**

#### T2-6: Restructure optimize-cc-md into 3-phase workflow

Transform from a monolithic "run one command" skill into a guided workflow:

1. **Phase A: Validate** - Run `claudelint validate` and present results
2. **Phase B: Assess** - Evaluate quality against criteria checklist (references `quality-criteria.md`)
3. **Phase C: Improve** - Make targeted improvements with explanations

This mirrors how Anthropic's `claude-md-improver` works but with our linter as the foundation.

#### T2-7: Implement auto-fix for simple rules

Add `fixable: true` and `fix()` functions to rules where corrections are deterministic:

- `skill-name` (kebab-case conversion)
- `skill-missing-shebang` (prepend `#!/bin/bash`)
- `skill-reference-not-linked` (convert backtick to markdown link)
- `skill-name-directory-mismatch` (rename frontmatter to match dir)
- `claude-md-filename-case-sensitive` (rename file)

Requires adding `--fix` flag to CLI and `fix` property to rule type.

#### T2-8: Begin skills-quality-validation Easy rules

Top priorities from the existing [skills-quality-validation](../archive/skills-quality-validation/) project:

- `skill-readme-forbidden` (E1) - Anthropic explicitly forbids README.md in skill dirs
- `skill-body-word-count` (E6) - Word count check (guide uses words, not lines)
- `skill-xml-tags-anywhere` (E3) - Security: detect XML injection in skills
- `skill-description-max-length` (E4) - Description under 500 chars
- `skill-frontmatter-unknown-keys` (E8) - Warn on unrecognized YAML keys

#### T2-9: Pre-commit hook optimization

Current pre-commit validates everything on every commit. Optimize to only validate changed files:

- Parse `git diff --cached --name-only` to get staged files
- Run only relevant validators based on changed file paths
- Full validation available via `--all` flag

#### T2-10: Validation caching

Cache validation results keyed by file content hash:

- Store in `.claudelint-cache/` (already gitignored)
- Invalidate when file content changes or rule versions change
- Skip re-validation of unchanged files

#### T2-11: Cross-skill reference validation

Validate "See Also" sections in SKILL.md files:

- Check that referenced skill paths exist (`../validate-all/SKILL.md`)
- Check that referenced skill names match actual directory names
- Warn on dead cross-references

#### T2-12: SARIF/JSON output for CI

Add `--format sarif` output for GitHub Code Scanning integration:

- SARIF format for GitHub Advanced Security
- JSON format for custom CI pipelines
- Enables inline PR annotations from linter results

---

### Tier 3: Advanced Analysis (Priority Score 0.5-0.99)

High value but requires significant effort.

| # | Improvement | Usefulness | Difficulty | Score | Est. Time |
|---|-------------|:---:|:---:|:---:|-----------|
| 13 | Codebase cross-referencing | 5 | 5 | 1.00 | 1+ week |
| 14 | Skills-quality-validation Medium rules (17 rules) | 5 | 5 | 1.00 | 1-2 weeks |
| 15 | Red flags detection | 4 | 4 | 1.00 | 3-5 days |
| 16 | Progressive disclosure validation | 4 | 4 | 1.00 | 3-5 days |
| 17 | Additive guidance engine | 4 | 5 | 0.80 | 1+ week |

**Details:**

#### T3-13: Codebase cross-referencing

Verify that commands and file references in CLAUDE.md actually work:

- Check that `npm run <script>` references match `package.json` scripts
- Check that file paths in instructions point to real files
- Check that command names (`claudelint`, `prettier`, etc.) are available
- Flag stale instructions referencing renamed/removed resources

#### T3-14: Skills-quality-validation Medium rules

From the existing [skills-quality-validation](../archive/skills-quality-validation/) project Phase 2:

- Description trigger phrase validation (M1-M3) - most impactful
- Hardcoded secrets detection (M13) - security critical
- MCP tool qualified name validation (M7)
- Progressive disclosure enforcement (M14)

#### T3-15: Red flags detection

Scan CLAUDE.md files for patterns indicating staleness:

- References to deleted files or renamed directories
- Commands that don't exist in package.json
- TODOs older than 30 days
- Version numbers that don't match current
- Dead links to external resources

#### T3-16: Progressive disclosure validation

Enforce Anthropic's 3-level content hierarchy:

1. YAML frontmatter (metadata only, no instructions)
2. SKILL.md body (core instructions, under 500 lines/2000 words)
3. Reference files (detailed content, templates, examples)

Validate that content is at the right level (e.g., long code examples should be in references, not inline).

#### T3-17: Additive guidance engine

Instead of only flagging what's wrong, suggest what's missing:

- "Consider adding error handling examples"
- "This skill could benefit from a troubleshooting section"
- "Add example inputs/outputs for complex operations"
- Powered by heuristics, not LLM (keeps it fast and deterministic)

---

### Tier 4: Polish and Ecosystem (Priority Score < 0.5)

Nice-to-have improvements for long-term quality.

| # | Improvement | Usefulness | Difficulty | Score | Est. Time |
|---|-------------|:---:|:---:|:---:|-----------|
| 18 | File type taxonomy documentation | 3 | 2 | 1.50 | 2 hrs |
| 19 | CI/CD integration guide | 3 | 2 | 1.50 | 3 hrs |
| 20 | Watch mode for continuous validation | 3 | 3 | 1.00 | 1-2 days |
| 21 | Skills-quality-validation Hard rules (12 rules) | 4 | 5 | 0.80 | 2-3 weeks |
| 22 | Skill version drift detection | 2 | 2 | 1.00 | 2 hrs |
| 23 | Rule usage analytics | 2 | 3 | 0.67 | 1-2 days |
| 24 | Custom rule plugin API | 3 | 5 | 0.60 | 1+ week |

**Details:**

#### T4-18: File type taxonomy documentation

Document the complete Claude Code configuration ecosystem in one reference:

- `.claude/CLAUDE.md` (project instructions)
- `.claude/settings.json` (permissions, MCP, hooks)
- `.claude/skills/*/SKILL.md` (skills)
- `.claude/agents/*/AGENT.md` (agents)
- `.claude/output_styles/*/OUTPUT_STYLE.md` (output styles)
- `.mcp.json` (MCP servers)
- `plugin.json` (plugin manifest)

Useful for both our own docs and as a reference file for optimize-cc-md.

#### T4-19: CI/CD integration guide

Step-by-step guides for integrating claudelint into:

- GitHub Actions workflow
- Pre-commit hooks (already supported but underdocumented)
- GitLab CI
- Local development workflow

#### T4-20: Watch mode

`claudelint --watch` for continuous validation during development:

- Use `chokidar` or `fs.watch` to monitor file changes
- Re-validate only changed files
- Clear terminal and show updated results

#### T4-21: Skills-quality-validation Hard rules

From the existing project Phase 3. Requires external integrations:

- MCP server existence validation (H1-H2)
- LLM-based trigger phrase quality evaluation (H3)
- Dependency availability checking (H4-H6)

#### T4-22: Skill version drift detection

Warn when skill `version` in frontmatter falls behind package.json version, suggesting skills may need updating after releases.

#### T4-23: Rule usage analytics

Track which rules fire most frequently to prioritize rule improvements:

- Aggregate anonymous counts of rule violations
- Identify rules that never trigger (potential false negatives)
- Identify rules that always trigger (potential false positives or too strict)

#### T4-24: Custom rule plugin API

Let users write their own rules:

- Define rule format and API surface
- Plugin discovery from `.claudelintrc.json`
- Documentation and examples

---

## Coordination with Existing Projects

### skills-quality-validation

The [skills-quality-validation](../archive/skills-quality-validation/) project planned 41 new rules. Items T2-8, T3-14, and T4-21 in this catalog directly correspond to its Phase 1-3. Implementation should follow that project's existing rule specs but be prioritized according to this document's stack-ranking.

### logging-architecture

The [logging-architecture](../logging-architecture/) project's DiagnosticCollector work would benefit T2-12 (SARIF output) since structured diagnostics are a prerequisite for structured output formats.

### plugin-and-md-management

The [plugin-and-md-management](../plugin-and-md-management/) project's plugin infrastructure work overlaps with T4-24 (custom rule API) since plugin architecture patterns should be consistent.

---

## Recommended Implementation Order

Based on priority scores, dependencies, and practical sequencing:

### Sprint 1: Quick Wins (1-2 hours)

- [T1-1] Fix broken docs links
- [T1-2] Trim optimize-cc-md under 500 lines
- [T1-5] Wire up new reference files

### Sprint 2: Reference Content (half day)

- [T1-3] Create quality-criteria.md
- [T1-4] Create templates.md
- [T4-18] File type taxonomy documentation

### Sprint 3: Skill Workflow (1-2 days)

- [T2-6] Restructure optimize-cc-md 3-phase workflow

### Sprint 4: New Rules (3-5 days)

- [T2-8] Easy rules from skills-quality-validation (top 5)
- [T2-11] Cross-skill reference validation

### Sprint 5: Developer Experience (3-5 days)

- [T2-9] Pre-commit optimization
- [T2-10] Validation caching
- [T2-12] SARIF/JSON output

### Sprint 6: Auto-fix (3-4 days)

- [T2-7] Auto-fix for simple rules

### Sprint 7+: Advanced (ongoing)

- [T3-13 through T3-17] Advanced analysis features
- [T4-19 through T4-24] Ecosystem improvements
- [T3-14, T4-21] Remaining skills-quality-validation rules

---

## Success Metrics

- Dogfood result: 0 errors, 0 warnings on all bundled skills
- False positive rate < 5% on Anthropic's official example skills
- All cross-references in docs/ and skills/ validated and working
- Auto-fix available for at least 10 rules
- CI integration documented with working GitHub Actions example

---

## Related Documents

- [Phase 1 Plan](../../../.claude/plans/piped-imagining-axolotl.md) (completed)
- [skills-quality-validation Project](../archive/skills-quality-validation/)
- [Rule Implementation Roadmap](../rule-implementation/)
- [Anthropic Best Practices Summary](../archive/skills-quality-validation/ANTHROPIC-BEST-PRACTICES-SUMMARY.md)
