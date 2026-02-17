---
description: "Path pattern is overly broad"
---

# claude-md-glob-pattern-too-broad

<RuleHeader description="Path pattern is overly broad" severity="warn" :fixable="false" :configurable="false" category="CLAUDE.md" />

## Rule Details

Files in `.claude/rules/` include YAML frontmatter with a `paths` field that controls which files the rule applies to. Using `**` or `*` as a path pattern matches every file in the project, which is almost never the intended behavior for a scoped rule. Overly broad patterns defeat the purpose of file-scoped rules and can cause Claude Code to apply guidelines in contexts where they are not relevant. This rule flags bare `**` and `*` patterns and suggests more specific alternatives.

### Incorrect

Frontmatter with a catch-all glob pattern

```markdown
---
paths:
  - "**"
---

These guidelines apply to React components.
```

Frontmatter with a single-star catch-all

```markdown
---
paths:
  - "*"
---

TypeScript coding standards.
```

### Correct

Frontmatter with a specific glob pattern

```markdown
---
paths:
  - src/components/**/*.tsx
---

These guidelines apply to React components.
```

## How To Fix

Replace the broad pattern with a more specific glob that targets the files the rule should apply to. For example, use `src/**/*.ts` for all TypeScript files or `src/components/**/*.tsx` for React components.

## Options

This rule does not have any configuration options.

## When Not To Use It

Disable this rule if you intentionally want a rule file to apply to every file in the project. In that case, consider placing the content in the main CLAUDE.md instead.

## Related Rules

- [`claude-md-glob-pattern-backslash`](/rules/claude-md/claude-md-glob-pattern-backslash)
- [`claude-md-paths`](/rules/claude-md/claude-md-paths)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/claude-md/claude-md-glob-pattern-too-broad.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/claude-md/claude-md-glob-pattern-too-broad.test.ts)

## Version

Available since: v0.2.0
