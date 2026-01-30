# Rule: claude-md-import-depth-exceeded

**Severity**: Error
**Fixable**: No
**Validator**: CLAUDE.md
**Category**: Cross-Reference

Import depth exceeds maximum, possible circular import

## Rule Details

This rule enforces a maximum import depth for CLAUDE.md files (default: 5 levels). When file A imports file B, which imports file C, and so on, the depth increases with each level. Excessive import depth causes performance issues, makes the structure hard to understand, and can mask circular dependencies.

Deep import chains slow down context loading, make debugging difficult, and often indicate poor file organization. A depth limit protects against infinite loops from undetected circular imports and encourages flatter, more maintainable file structures.

### Incorrect

Import chain exceeding depth limit (assuming maxDepth: 5):

```text
CLAUDE.md (depth 0)
  └─ rules/main.md (depth 1)
      └─ rules/git.md (depth 2)
          └─ rules/commits.md (depth 3)
              └─ rules/commit-format.md (depth 4)
                  └─ rules/commit-examples.md (depth 5)
                      └─ rules/commit-detailed.md (depth 6) ← ERROR
```

### Correct

Flatter import structure:

```text
CLAUDE.md (depth 0)
  ├─ rules/git-workflow.md (depth 1)
  ├─ rules/api-design.md (depth 1)
  └─ rules/testing.md (depth 1)
      ├─ rules/unit-tests.md (depth 2)
      └─ rules/integration-tests.md (depth 2)
```

Or reorganized hierarchy:

```text
CLAUDE.md
  └─ rules/main.md
      ├─ rules/git.md
      │   └─ rules/commit-format.md (includes all commit details)
      ├─ rules/api.md
      └─ rules/testing.md
```

## How To Fix

To reduce import depth:

1. **Flatten the structure** - import files directly from CLAUDE.md:
   ```markdown
   # Instead of nested imports
   Import: @.claude/rules/main.md
   # Which then imports everything else

   # Import directly
   Import: @.claude/rules/git.md
   Import: @.claude/rules/api.md
   Import: @.claude/rules/testing.md
   ```

2. **Consolidate related content** into single files:
   ```bash
   # Instead of: git.md → commits.md → format.md → examples.md
   # Create: git-complete.md with all commit guidelines
   ```

3. **Remove unnecessary intermediate files**:
   ```markdown
   # Remove wrapper files that only import other files
   # Bad: main.md that only does imports
   # Good: Direct imports from CLAUDE.md
   ```

4. **Check current depth**:
   ```bash
   claudelint check-claude-md
   # Shows import chain and depth for each file
   ```

5. **Verify the fix**:
   ```bash
   # Ensure no import chain exceeds the limit
   claudelint check-claude-md
   ```

## Options

### `maxDepth`

Maximum allowed import depth before error.

- Type: `number`
- Default: `5`

Example configuration:

```json
{
  "rules": {
    "claude-md-import-depth-exceeded": ["error", { "maxDepth": 3 }]
  }
}
```

To allow deeper nesting (not recommended):

```json
{
  "rules": {
    "claude-md-import-depth-exceeded": ["error", { "maxDepth": 10 }]
  }
}
```

## When Not To Use It

Never disable this rule. Excessive import depth causes performance issues, makes debugging nearly impossible, and often masks circular dependencies. Always fix the structure by flattening the import hierarchy rather than increasing the limit.

## Related Rules

- [claude-md-import-circular](./claude-md-import-circular.md) - Detects circular import dependencies
- [claude-md-import-missing](./claude-md-import-missing.md) - Validates imported files exist

## Resources

- [Rule Implementation](../../src/rules/claude-md/claude-md-import-depth-exceeded.ts)
- [Rule Tests](../../tests/validators/claude-md.test.ts)

## Version

Available since: v1.0.0
