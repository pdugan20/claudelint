# Rule: claude-md-import-circular

**Severity**: Warning
**Fixable**: No
**Validator**: CLAUDE.md
**Category**: Cross-Reference

Circular import detected between Claude.md files

## Rule Details

This rule detects circular import dependencies where file A imports file B, which imports file C, which eventually imports file A again (or any variation). Circular imports cause infinite loops, stack overflow errors, and prevent Claude Code from loading context. The validator tracks all processed imports and detects when the same file is encountered multiple times in an import chain.

To prevent infinite loops from undetected circular imports, the validator enforces a maximum import depth of 10 levels. If the chain exceeds this depth, validation fails even if no explicit cycle is detected. This protects against deeply nested or complex circular patterns.

### Incorrect

Simple circular import (A → B → A):

```markdown
# CLAUDE.md
Import: @.claude/rules/main.md
```

```markdown
# .claude/rules/main.md
Import: @../../CLAUDE.md ← Circular: back to CLAUDE.md
```

Self-referential import:

```markdown
# .claude/rules/main.md
Import: @./main.md ← Circular: imports itself
```

### Correct

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

Hierarchical structure with no file imported more than once:

```text
CLAUDE.md
  └─ .claude/rules/main.md
      ├─ .claude/rules/git.md
      ├─ .claude/rules/api.md
      └─ .claude/rules/shared.md
```

## How To Fix

To resolve circular import dependencies:

1. **Identify the cycle** from the error message showing the import chain

2. **Refactor the structure** using one of these approaches:

   **a) Extract shared content to a separate file:**

   ```markdown
   # Before: A imports B, B imports A

   # After: Both import shared.md
   # A.md imports shared.md
   # B.md imports shared.md
   # shared.md has no imports (leaf node)
   ```

   **b) Consolidate into a single file** if the files are tightly coupled

   **c) Create a hierarchical structure:**

   ```text
   CLAUDE.md
     ├─ main.md (imports utilities)
     └─ utilities.md (no imports - leaf node)
   ```

3. **Remove the circular reference** - delete one of the import statements

4. **Verify the fix**:

   ```bash
   claude-code-lint check-claude-md
   ```

The key principle: imports should form a directed acyclic graph (DAG), not a cycle.

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. Circular imports will cause infinite loops, stack overflow errors, Claude Code failure to load context, and undefined behavior. Always fix the circular dependency structure rather than disabling the rule.

## Related Rules

- [import-missing](./import-missing.md) - Missing import files

## Resources

- [Rule Implementation](../../src/rules/claude-md/claude-md-import-circular.ts)
- [Rule Tests](../../tests/validators/claude-md.test.ts)

## Version

Available since: v1.0.0
