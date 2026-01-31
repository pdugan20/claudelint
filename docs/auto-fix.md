# Auto-fix

claude-code-lint can automatically fix certain validation issues.

## Overview

Auto-fix capability allows you to:

- Preview fixes before applying them (`--fix-dry-run`)
- Automatically resolve fixable issues (`--fix`)
- Choose which severity levels to fix (`--fix-type`)
- See unified diffs of proposed changes

**Safety:** Auto-fix uses atomic file writes and can be previewed before applying.

## Usage

### Preview Fixes

See what would be fixed without modifying files:

```bash
claude-code-lint check-all --fix-dry-run
```

**Output:**

```text
 Previewing 3 fixes...

Proposed changes:
Index: .claude/skills/my-skill/test.sh
===================================================================
--- .claude/skills/my-skill/test.sh original
+++ .claude/skills/my-skill/test.sh fixed
@@ -1,1 +1,2 @@
+#!/usr/bin/env bash
 echo "Hello"

✓ 3 fixes would be applied to 3 files
```

### Apply Fixes

Automatically fix all fixable issues:

```bash
claude-code-lint check-all --fix
```

**Output:**

```text
 Applying 3 fixes...

✓ 3 fixes applied to 3 files

 Run validation again to check for remaining issues
```

### Fix Specific Types

Fix only errors, warnings, or all issues:

```bash
# Fix only errors
claude-code-lint check-all --fix --fix-type errors

# Fix only warnings
claude-code-lint check-all --fix --fix-type warnings

# Fix all (default)
claude-code-lint check-all --fix --fix-type all
```

## Fixable Rules

### Skills

**skill-missing-shebang** (warning, fixable)

Adds `#!/usr/bin/env bash` as the first line of shell scripts.

**Before:**

```bash
echo "Hello"
```

**After:**

```bash
#!/usr/bin/env bash
echo "Hello"
```

**skill-missing-version** (warning, fixable)

Adds `version: "1.0.0"` to SKILL.md frontmatter.

**Before:**

```markdown
---
name: my-skill
description: A test skill
---
```

**After:**

```markdown
---
name: my-skill
description: A test skill
version: '1.0.0'
---
```

**skill-missing-changelog** (warning, fixable)

Creates CHANGELOG.md with Keep a Changelog template.

**Created file:**

```markdown
# Changelog

All notable changes to my-skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial skill implementation

## [1.0.0] - 2026-01-27

### Added

- Initial release
```

## Common Workflows

### Safe Workflow

1. **Preview** fixes to see what will change:

   ```bash
   claude-code-lint check-all --fix-dry-run
   ```

2. **Review** the proposed changes

3. **Apply** fixes if changes look correct:

   ```bash
   claude-code-lint check-all --fix
   ```

4. **Validate** again to check for remaining issues:

   ```bash
   claude-code-lint check-all
   ```

5. **Commit** the auto-fixed files:

   ```bash
   git add .
   git commit -m "fix: auto-fix validation issues"
   ```

### CI/CD Integration

```yaml
# .github/workflows/lint.yml
name: Lint

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install -g claude-code-lint

      # Validate and auto-fix
      - run: claude-code-lint check-all --fix

      # Commit fixes (optional)
      - uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: 'fix: auto-fix linting issues'
```

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Auto-fix issues before committing
claude-code-lint check-all --fix

# Re-stage fixed files
git add -u

# Run validation
claude-code-lint check-all
```

## How Auto-fix Works

1. **Validation** runs all validators and collects fixable issues

2. **Collection** gathers all `autoFix` objects from errors and warnings

3. **Application** applies fixes to files:
   - Reads current file content
   - Applies fix function
   - Writes updated content atomically

4. **Reporting** shows results with file counts and diffs

## Safety Features

### Atomic Writes

Files are written atomically - if an error occurs, the file remains unchanged.

### Dry-run Mode

Preview changes without modifying files:

```bash
claude-code-lint check-all --fix-dry-run
```

### Unified Diffs

See exactly what will change in a standard diff format.

### No Backup Files

Auto-fix does not create `.bak` files. Use version control (git) for safety:

```bash
# Before fixing
git status  # Check for uncommitted changes
git stash   # Stash changes if needed

# Apply fixes
claude-code-lint check-all --fix

# Review changes
git diff

# Revert if needed
git checkout .
```

## Limitations

### Not All Rules Are Fixable

Some issues require human judgment:

- `skill-missing-comments` - Requires understanding script purpose
- `skill-missing-examples` - Requires understanding skill usage
- `import-circular` - Requires restructuring imports

Use `claude-code-lint list-rules` to see which rules support auto-fix.

### Caching Disabled with --fix

Auto-fix disables caching to preserve fix functions (functions can't be serialized to JSON).

This means validation runs slower with `--fix`, but ensures fixes work correctly.

### Sequential Fixes

Fixes are applied sequentially to each file. If multiple fixes modify the same line, later fixes see the result of earlier fixes.

## Troubleshooting

### Fixes Not Applied

**Problem:** `--fix` runs but files aren't modified

**Solutions:**

1. Check file permissions:

   ```bash
   ls -l .claude/skills/my-skill/
   ```

2. Verify files aren't read-only

3. Use `--fix-dry-run` to see if fixes are detected

### Fixes Failed

**Problem:** "N fixes failed" message appears

**Causes:**

- File doesn't exist (for file creation fixes)
- Invalid file content (can't parse frontmatter)
- Permission denied

**Solution:**

Run with `--verbose` to see detailed error messages.

### Changes Look Wrong

**Problem:** Auto-fix makes unexpected changes

**Solution:**

1. Use `--fix-dry-run` first to preview

2. Review diffs carefully

3. Use version control to revert:

   ```bash
   git checkout .
   ```

4. Report issue if fix is incorrect:

   ```bash
   # Include:
   # - Original file content
   # - Expected fix
   # - Actual fix (from --fix-dry-run)
   ```

### No Fixable Issues Found

**Problem:** "No auto-fixable issues found" despite validation errors

**Explanation:**

Not all rules support auto-fix. Only mechanical changes that don't require context can be auto-fixed.

**Solution:**

Fix remaining issues manually based on error messages.

## Best Practices

### Use Dry-run First

Always preview changes before applying:

```bash
claude-code-lint check-all --fix-dry-run | less
```

### Commit Before Fixing

Ensure you can revert if needed:

```bash
git status
# Commit or stash changes first
claude-code-lint check-all --fix
```

### Fix in Batches

Fix one type at a time for easier review:

```bash
claude-code-lint check-all --fix --fix-type warnings
git diff
git add -p  # Review each change
```

### Validate After Fixing

Always run validation again:

```bash
claude-code-lint check-all --fix
claude-code-lint check-all  # Verify all issues resolved
```

### Review Auto-fixes in PRs

When auto-fixes are applied in CI:

- Review the changes in the PR
- Ensure fixes are correct
- Don't blindly merge auto-fix commits

## Examples

### Fix All Issues

```bash
claude-code-lint check-all --fix
```

### Preview Only Errors

```bash
claude-code-lint check-all --fix-dry-run --fix-type errors
```

### Fix Warnings Only

```bash
claude-code-lint check-all --fix --fix-type warnings
```

### Combine with Other Options

```bash
# Verbose output + auto-fix
claude-code-lint check-all --fix --verbose

# Specific config + auto-fix
claude-code-lint check-all --fix --config .claudelintrc.custom.json

# No cache + auto-fix (cache is auto-disabled with --fix)
claude-code-lint check-all --fix --no-cache
```

## See Also

- [Validators](validation-reference.md) - See which rules are fixable
- [Configuration](configuration.md) - Configure validation rules
- [CLI Reference](../README.md#usage) - All command-line options
