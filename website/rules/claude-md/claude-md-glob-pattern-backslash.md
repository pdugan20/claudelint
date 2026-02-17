---
description: "Path pattern uses backslashes instead of forward slashes"
---

# claude-md-glob-pattern-backslash

<RuleHeader description="Path pattern uses backslashes instead of forward slashes" severity="warn" :fixable="false" :configurable="false" category="CLAUDE.md" />

## Rule Details

Files in `.claude/rules/` can include YAML frontmatter with a `paths` field that specifies glob patterns for when the rule should apply. Glob patterns should always use forward slashes (`/`) as path separators, even on Windows. Backslashes (`\`) are treated as escape characters by most glob implementations and will not match paths correctly on macOS or Linux. This rule inspects the `paths` array in frontmatter and reports any pattern that contains a backslash.

### Incorrect

Frontmatter path pattern using backslashes

```markdown
---
paths:
  - src\components\**\*.tsx
---

Component guidelines here.
```

### Correct

Frontmatter path pattern using forward slashes

```markdown
---
paths:
  - src/components/**/*.tsx
---

Component guidelines here.
```

## How To Fix

Replace all backslashes (`\`) with forward slashes (`/`) in the `paths` array of your rule file frontmatter. Forward slashes work correctly on all operating systems.

## Options

This rule does not have any configuration options.

## When Not To Use It

There is no reason to disable this rule. Backslashes in glob patterns are always incorrect.

## Related Rules

- [`claude-md-glob-pattern-too-broad`](/rules/claude-md/claude-md-glob-pattern-too-broad)
- [`claude-md-paths`](/rules/claude-md/claude-md-paths)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/claude-md/claude-md-glob-pattern-backslash.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/claude-md/claude-md-glob-pattern-backslash.test.ts)

## Version

Available since: v0.2.0
