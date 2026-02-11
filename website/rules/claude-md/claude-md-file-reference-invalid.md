# Rule: claude-md-file-reference-invalid

**Severity**: Warning
**Fixable**: No
**Validator**: CLAUDE.md
**Category**: File System

File path referenced in CLAUDE.md does not exist

## Rule Details

This rule warns when CLAUDE.md references file paths (in inline code or bash code blocks) that do not exist on disk. It checks paths that look like real file references (containing a dot extension or ending with `/`) and resolves them relative to the CLAUDE.md file's directory.

The rule intelligently skips URLs, glob patterns, template variables, npm scopes, version strings, and `node_modules`/`dist` paths.

### Incorrect

CLAUDE.md referencing a file that does not exist:

```markdown
# Development

See `src/utils/old-helper.ts` for the helper functions.
```

If `src/utils/old-helper.ts` has been deleted or renamed, this rule fires.

### Correct

CLAUDE.md referencing files that exist:

```markdown
# Development

See `src/utils/helper.ts` for the helper functions.
```

## How To Fix

1. **Update the path** to point to the correct file:

   ```markdown
   # Before (file was renamed)
   See `src/utils/old-name.ts`

   # After
   See `src/utils/new-name.ts`
   ```

2. **Remove the reference** if the file was intentionally deleted.

3. **Create the file** if the reference is correct but the file is missing.

## Options

This rule does not have configuration options.

## When Not To Use It

Disable this rule if your CLAUDE.md references files that are generated at build time or only exist in certain environments.

```json
{
  "rules": {
    "claude-md-file-reference-invalid": "off"
  }
}
```

## Related Rules

- [claude-md-file-not-found](./claude-md-file-not-found.md) - CLAUDE.md file itself is missing
- [claude-md-import-missing](./claude-md-import-missing.md) - Imported files must exist

## Resources

- [Rule Implementation](../../src/rules/claude-md/claude-md-file-reference-invalid.ts)
- [Rule Tests](../../tests/rules/claude-md/claude-md-file-reference-invalid.test.ts)

## Version

Available since: v1.0.0
