# Official Spec Alignment

**Status:** Not started
**Created:** 2026-02-06
**Priority:** High (fixes actively wrong linter results)

---

## Summary

Audit of claudelint's skill frontmatter schema, validation rules, and plugin against the official Claude Code specification from three authoritative sources:

1. **code.claude.com/docs/en/skills** - Technical reference (frontmatter fields, behavior)
2. **code.claude.com/docs/en/plugins-reference** - Plugin manifest schema
3. **Anthropic Skills Guide PDF** - Best practices, field requirements, description patterns

The audit found that our linter's `KNOWN_KEYS` set is actively producing wrong results (false positives on official fields, missing warnings on non-official fields), our description max-length default contradicts Anthropic's guidance, and our schema is missing three official fields.

## Problem Statement

### Wrong results being produced today

- `skill-frontmatter-unknown-keys` warns on 5 official fields (`argument-hint`, `disable-model-invocation`, `user-invocable`, `hooks`, `disallowed-tools`) - false positives
- `skill-frontmatter-unknown-keys` does NOT warn on 3 non-official fields (`tags`, `dependencies`, `version`) that Claude Code ignores
- `skill-description-max-length` defaults to 500 chars but Anthropic's guide says 1024

### Missing from schema

- `license` - official per Skills Guide PDF
- `compatibility` - official per Skills Guide PDF (1-500 chars)
- `metadata` - official per Skills Guide PDF (key-value pairs)

### Our own plugin doesn't follow best practices

- Skills use non-official `tags` and `dependencies` frontmatter
- Validation skills with side effects lack `disable-model-invocation: true`
- `allowed-tools` uses broad `Bash` instead of scoped `Bash(claudelint:*)`

## Research Sources

- Official docs fetched 2026-02-06 from code.claude.com
- Skills Guide PDF: `resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf`
- Official plugins repo: `github.com/anthropics/claude-plugins-official`

## Deliverables

1. **Critical fixes** (items 1-4): Fix wrong linter output
2. **New rules** (items 5-9): Catch best-practice violations
3. **Self-fixes** (items 10-14): Fix our own plugin to be exemplary
4. **Milestone 6 reconciliation**: Update M15/M16/M17 based on findings

See [tracker.md](./tracker.md) for detailed task list.

## Related

- [spec-comparison.md](./spec-comparison.md) - Three-source field comparison table
- [milestone-6-overlap.md](./milestone-6-overlap.md) - Impact on existing Milestone 6 rules
- [roadmap.md](../roadmap.md) - Milestones 5a and 5b
