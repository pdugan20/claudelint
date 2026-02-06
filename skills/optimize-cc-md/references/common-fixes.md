# Common Fixes

Quick reference for the most common CLAUDE.md issues and their solutions.
For the full optimization workflow, see the [main skill](../SKILL.md).

## File Size Violations

**30KB warning threshold**: Your CLAUDE.md is getting large. Consider:

- Moving project-specific rules to .claude/rules/ with @import
- Removing generic advice that doesn't add value
- Consolidating similar sections

**50KB error threshold**: Your CLAUDE.md is too large. You must:

- Split content into multiple @import files
- Remove all generic/obvious content
- Reorganize into focused, scoped rules

See [size optimization](./size-optimization.md) for detailed strategies.

## Import Issues

**Missing imports**: Fix broken @import paths:

```text
Error: .claude/rules/missing.md not found
Fix: Create the file or remove the @import
```

**Circular imports**: A imports B, B imports A:

```text
Error: Circular import detected
Fix: Restructure imports to be hierarchical, not circular
```

**Depth exceeded**: Too many nested imports (limit: 3 levels):

```text
Error: Import depth exceeded (4 levels)
Fix: Flatten import hierarchy or consolidate files
```

See [import patterns](./import-patterns.md) for @import best practices.

## Organization Problems

**Too many sections**: CLAUDE.md has 20+ top-level headings:

- Group related sections together
- Move specific topics to @import files
- Use .claude/rules/ for scoped rules

**Generic content**: Remove obvious advice:

- "Always write clean code" (too generic)
- "Follow best practices" (adds no value)
- "Use proper error handling" (obvious)

**Config duplication**: Don't repeat .claude/settings.json in CLAUDE.md:

- If permissions are in settings.json, don't duplicate in CLAUDE.md
- If environment variables are in settings.json, remove from CLAUDE.md

See [organization guide](./organization-guide.md) for structural guidance.
