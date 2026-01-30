# Rule: claude-md-import-missing

**Severity**: Error
**Fixable**: No
**Validator**: CLAUDE.md
**Category**: Cross-Reference

Imported file does not exist

## Rule Details

This rule triggers when a CLAUDE.md file contains an import directive pointing to a non-existent file. When Claude Code processes CLAUDE.md, it will fail to load the imported content, resulting in incomplete context, missing rules and guidelines, and unexpected behavior.

Import paths are resolved relative to the directory containing the file with the import directive. The `@` symbol represents the current file's directory. Nested imports are resolved relative to each importing file. For example, in `CLAUDE.md`: `@.claude/rules/main.md` resolves to `.claude/rules/main.md`. In `.claude/rules/main.md`: `@./git.md` resolves to `.claude/rules/git.md`.

### Incorrect

Import pointing to non-existent file:

```markdown
# CLAUDE.md
Import: @.claude/rules/git.md
Import: @.claude/rules/api-guidlines.md
            ^^^^^^^^^^^^ Typo: should be "guidelines"
Import: @.claude/rules/testing.md
```

Import with wrong path:

```markdown
# CLAUDE.md
Import: @rules/deployment.md
         ^^^^^^ Missing .claude/ prefix
```

### Correct

All imported files exist:

```markdown
# CLAUDE.md
Import: @.claude/rules/git.md
Import: @.claude/rules/api-guidelines.md
Import: @.claude/rules/testing.md
```

With directory structure:

```text
project/
  CLAUDE.md
  .claude/
    rules/
      git.md
      api-guidelines.md
      testing.md
```

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. Missing imports cause Claude Code to fail loading context, resulting in incomplete or incorrect context, missing rules and guidelines, and confusion about why context isn't working. Always fix the import path or create the missing file rather than disabling the rule.

## Related Rules

- [import-circular](./import-circular.md) - Circular import dependencies

## Resources

- [Implementation](../../../src/validators/claude-md.ts)
- [Tests](../../../tests/validators/claude-md.test.ts)

## Version

Available since: v1.0.0
