# claude-md-paths

<RuleHeader description="Claude MD paths must be a non-empty array with at least one path pattern" severity="error" :fixable="false" :configurable="false" category="CLAUDE.md" />

## Rule Details

Rule files in `.claude/rules/` use YAML frontmatter to declare which file paths the rule applies to via the `paths` field. When present, this field must be a non-empty array where each element is a non-empty string (typically a glob pattern). This rule checks three conditions: (1) `paths` must be an array, not a string or other type; (2) the array must contain at least one entry; (3) each entry must be a non-empty string. If `paths` is not present at all, the rule passes silently since paths are optional in some configurations.

### Incorrect

Paths as a string instead of an array

```markdown
---
paths: src/**/*.ts
---

TypeScript coding standards.
```

Empty paths array

```markdown
---
paths: []
---

These guidelines apply to nothing.
```

Paths array with an empty string

```markdown
---
paths:
  - ""
---

Guidelines with invalid path.
```

### Correct

Paths as a properly formatted array

```markdown
---
paths:
  - src/**/*.ts
  - src/**/*.tsx
---

TypeScript coding standards.
```

## How To Fix

Ensure the `paths` field in your frontmatter is a YAML array with at least one non-empty string entry. Each entry should be a valid glob pattern describing the files the rule applies to.

## Options

This rule does not have any configuration options.

## When Not To Use It

There is no reason to disable this rule. Malformed paths always indicate a configuration error that should be corrected.

## Related Rules

- [`claude-md-glob-pattern-backslash`](/rules/claude-md/claude-md-glob-pattern-backslash)
- [`claude-md-glob-pattern-too-broad`](/rules/claude-md/claude-md-glob-pattern-too-broad)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/claude-md/claude-md-paths.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/claude-md/claude-md-paths.test.ts)

## Version

Available since: v0.2.0
