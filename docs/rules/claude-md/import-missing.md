# Missing Import

An `@import` directive references a file that does not exist.

## Rule Details

This rule detects when a CLAUDE.md file contains an import directive that points to a non-existent file. When Claude Code processes the CLAUDE.md file, it will fail to load the imported content, resulting in an incomplete context.

Import paths are resolved relative to the directory containing the CLAUDE.md file with the import directive.

**Category**: CLAUDE.md
**Severity**: error
**Fixable**: No
**Since**: v1.0.0

### Violation Examples

Import pointing to a file that doesn't exist:

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

Import with incorrect relative path:

```markdown
# project/.claude/rules/main.md

Import: @../git.md
^^^^^^^^^ Incorrect - file is in same directory
```

### Correct Examples

All imported files exist:

```markdown
# CLAUDE.md

Import: @.claude/rules/git.md
Import: @.claude/rules/api-guidelines.md
Import: @.claude/rules/testing.md
Import: @.claude/rules/deployment.md
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
      deployment.md
```

Using relative imports within `.claude/rules/`:

```markdown
# .claude/rules/main.md

Import: @./git.md
Import: @./testing.md
```

## How To Fix

When you encounter this error:

1. **Check the error message** for the exact path that's missing:

   ```text
   Error: Imported file not found: .claude/rules/api-guidlines.md
   ```

2. **Verify the file exists:**

   ```bash
   ls -la .claude/rules/
   ```

3. **Fix the issue** using one of these approaches:

   **Option A: Fix the typo in the import path**

   ```markdown
   # Before

   Import: @.claude/rules/api-guidlines.md

   # After

   Import: @.claude/rules/api-guidelines.md
   ```

   **Option B: Create the missing file**

   ```bash
   mkdir -p .claude/rules
   touch .claude/rules/api-guidelines.md
   # Add content to the file
   ```

   **Option C: Remove the import**

   If the import is no longer needed, simply delete the line.

## Import Path Resolution

Import paths are resolved as follows:

- `@` represents the directory containing the current file
- Paths are relative to the current file's directory
- Nested imports are resolved relative to each importing file

Example:

```text
project/
  CLAUDE.md                     # Base file
  .claude/
    rules/
      main.md                   # Imported from CLAUDE.md
      git.md                    # Imported from main.md
```

In `CLAUDE.md`:

```markdown
Import: @.claude/rules/main.md
```

In `.claude/rules/main.md`:

```markdown
Import: @./git.md # Resolves to .claude/rules/git.md
```

## Options

This rule does not have any configuration options.

## When Not To Use It

You should **not** disable this rule. Missing imports will cause Claude Code to fail loading context, resulting in:

- Incomplete or incorrect context
- Missing rules and guidelines
- Unexpected behavior
- Confusion about why context isn't working

Always fix the import path or create the missing file rather than disabling this rule.

## Configuration

This rule should not be disabled, but if needed:

```json
{
  "rules": {
    "import-missing": "off"
  }
}
```

To change to a warning (not recommended):

```json
{
  "rules": {
    "import-missing": "warning"
  }
}
```

## Related Rules

- [import-circular](./import-circular.md) - Circular import dependencies

## Resources

- [Claude Code Documentation: CLAUDE.md Imports](https://github.com/anthropics/claude-code)
- [Organizing Large Context Files](https://github.com/anthropics/claude-code)

## Version

Available since: v1.0.0
