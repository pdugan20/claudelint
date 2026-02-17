---
description: "Import statement found inside code block"
---

# claude-md-import-in-code-block

<RuleHeader description="Import statement found inside code block" severity="error" :fixable="false" :configurable="false" category="CLAUDE.md" />

## Rule Details

Claude Code processes `@import` directives to include content from other files. However, when an `@import` appears inside a fenced code block (``` or ~~~), it is treated as literal text and will not be resolved. This is almost always a mistake -- the author intended the import to be active but accidentally placed it inside a code fence. This rule scans for `@` references inside code blocks and reports them so the import can be moved outside the fence.

### Incorrect

An @import inside a fenced code block (will not be processed)

````markdown
# CLAUDE.md

```markdown
@import .claude/rules/testing.md
```
````

### Correct

An @import outside of code blocks (will be processed)

```markdown
# CLAUDE.md

@import .claude/rules/testing.md
```

Documenting import syntax in a code block with explanatory text

````markdown
# CLAUDE.md

@import .claude/rules/testing.md

Import syntax example:

```text
# This is just documentation, not an active import
```
````

## How To Fix

Move the `@import` directive outside of the code block. If the import is inside a code block as documentation or an example, this is a false positive and the warning can be ignored.

## Options

This rule does not have any configuration options.

## When Not To Use It

Disable this rule if your CLAUDE.md includes code block examples that intentionally show import syntax for documentation purposes.

## Related Rules

- [`claude-md-import-missing`](/rules/claude-md/claude-md-import-missing)
- [`claude-md-import-circular`](/rules/claude-md/claude-md-import-circular)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/claude-md/claude-md-import-in-code-block.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/claude-md/claude-md-import-in-code-block.test.ts)

## Version

Available since: v0.2.0
