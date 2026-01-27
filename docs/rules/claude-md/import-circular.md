# Circular Import

Circular `@import` dependencies create an infinite loop.

## Rule Details

This rule detects circular import dependencies where file A imports file B, which imports file C, which imports file A (or any variation of this pattern). Circular imports cause infinite loops and will prevent Claude Code from loading the context properly.

The validator tracks all processed imports and detects when the same file is encountered multiple times in an import chain.

**Category**: CLAUDE.md
**Severity**: error
**Fixable**: No
**Since**: v1.0.0

### Violation Examples

Simple circular import (A → B → A):

```markdown
# CLAUDE.md

Import: @.claude/rules/main.md
```

```markdown
# .claude/rules/main.md

Import: @../../CLAUDE.md ← Circular: back to CLAUDE.md
```

Complex circular import (A → B → C → A):

```markdown
# CLAUDE.md

Import: @.claude/rules/git.md
```

```markdown
# .claude/rules/git.md

Import: @./deployment.md
```

```markdown
# .claude/rules/deployment.md

Import: @../../CLAUDE.md ← Circular: back to CLAUDE.md
```

Self-referential import:

```markdown
# .claude/rules/main.md

Import: @./main.md ← Circular: imports itself
```

### Correct Examples

Linear import chain (no cycles):

```markdown
# CLAUDE.md

Import: @.claude/rules/main.md
Import: @.claude/rules/git.md
Import: @.claude/rules/testing.md
```

```markdown
# .claude/rules/main.md

Import: @./shared.md
Import: @./utilities.md
```

```markdown
# .claude/rules/shared.md

# No imports - leaf node
```

Hierarchical structure:

```text
CLAUDE.md
  └─ .claude/rules/main.md
      ├─ .claude/rules/git.md
      ├─ .claude/rules/api.md
      └─ .claude/rules/shared.md
```

No file is imported more than once in any path from root to leaf.

## How To Fix

When you encounter a circular import:

1. **Identify the cycle** from the error message:

   ```text
   Error: Circular import detected: .claude/rules/main.md
   Already processed in chain: CLAUDE.md → main.md
   ```

2. **Trace the import chain:**

   ```bash
   # Follow the imports to find the cycle
   grep -r "Import:" CLAUDE.md .claude/
   ```

3. **Break the cycle** using one of these approaches:

   **Option A: Remove the circular import**

   Simply delete the import that creates the cycle:

   ```markdown
   # .claude/rules/deployment.md

   # Before

   Import: @../../CLAUDE.md ← Remove this

   # After

   # (no import to CLAUDE.md)
   ```

   **Option B: Restructure imports**

   Create a shared file that both files can import:

   ```markdown
   # CLAUDE.md

   Import: @.claude/rules/shared.md
   Import: @.claude/rules/main.md
   ```

   ```markdown
   # .claude/rules/main.md

   Import: @./shared.md ← Both import shared, no cycle
   ```

   **Option C: Consolidate files**

   If files have circular dependencies, they might be too tightly coupled. Consider merging them:

   ```markdown
   # .claude/rules/main-and-deployment.md

   # (Content from both files combined)
   ```

## Import Chain Limits

To prevent infinite loops from undetected circular imports, claudelint enforces a maximum import depth. If the import chain exceeds this depth, validation will fail even if no cycle is detected.

Default maximum depth: 10 levels

## Options

This rule does not have any configuration options.

## When Not To Use It

You should **never** disable this rule. Circular imports will cause:

- Infinite loops during context loading
- Stack overflow errors
- Claude Code failure to load context
- Undefined behavior

Always fix the circular dependency structure rather than disabling this rule.

## Configuration

This rule should not be disabled, but if absolutely necessary:

```json
{
  "rules": {
    "import-circular": "off"
  }
}
```

To change to a warning (not recommended):

```json
{
  "rules": {
    "import-circular": "warning"
  }
}
```

## Related Rules

- [import-missing](./import-missing.md) - Missing import files

## Resources

- [Claude Code Documentation: CLAUDE.md Imports](https://github.com/anthropics/claude-code)
- [Organizing Large Context Files](https://github.com/anthropics/claude-code)
- [Dependency Graph Best Practices](https://en.wikipedia.org/wiki/Circular_dependency)

## Version

Available since: v1.0.0
