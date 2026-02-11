# Rule: claude-md-npm-script-not-found

**Severity**: Error
**Fixable**: No
**Validator**: CLAUDE.md
**Category**: File System

npm run script referenced in CLAUDE.md does not exist in package.json

## Rule Details

This rule errors when CLAUDE.md references `npm run <script>` but the script does not exist in the nearest `package.json`. It walks up from the CLAUDE.md file's directory to find the closest `package.json` and checks its `scripts` field.

This catches stale instructions that tell Claude to run scripts that have been renamed or removed.

### Incorrect

CLAUDE.md referencing a script that does not exist:

```markdown
# Build

Run `npm run compile` to build the project.
```

If `package.json` has no `compile` script, this rule fires.

### Correct

CLAUDE.md referencing scripts that exist in package.json:

```markdown
# Build

Run `npm run build` to build the project.
```

```json
{
  "scripts": {
    "build": "tsc"
  }
}
```

## How To Fix

1. **Update the CLAUDE.md reference** to match the actual script name:

   ```markdown
   # Before (script was renamed)
   Run `npm run compile`

   # After
   Run `npm run build`
   ```

2. **Add the missing script** to `package.json` if the reference is correct:

   ```json
   {
     "scripts": {
       "compile": "tsc"
     }
   }
   ```

## Options

This rule does not have configuration options.

## When Not To Use It

Disable this rule if your CLAUDE.md references scripts from a different package.json (e.g., in a monorepo where CLAUDE.md is at the root but scripts are in a sub-package).

```json
{
  "rules": {
    "claude-md-npm-script-not-found": "off"
  }
}
```

## Related Rules

- [claude-md-file-reference-invalid](./claude-md-file-reference-invalid.md) - File paths must exist
- [claude-md-file-not-found](./claude-md-file-not-found.md) - CLAUDE.md file itself is missing

## Resources

- [Rule Implementation](../../src/rules/claude-md/claude-md-npm-script-not-found.ts)
- [Rule Tests](../../tests/rules/claude-md/claude-md-npm-script-not-found.test.ts)

## Version

Available since: v1.0.0
