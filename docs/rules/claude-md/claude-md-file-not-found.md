# Rule: claude-md-file-not-found

**Severity**: Error
**Fixable**: No
**Validator**: CLAUDE.md
**Category**: File System

Specified CLAUDE.md file path does not exist

## Rule Details

This rule validates that the CLAUDE.md file specified for validation actually exists on the filesystem. When running `claude-code-lint check-claude-md <file>`, the linter must be able to locate and read the target file. If the file path is incorrect, mistyped, or points to a non-existent location, validation cannot proceed.

This is a fundamental sanity check that prevents wasted time debugging validation errors when the root cause is simply that the file doesn't exist. It provides clear feedback about the missing file path so you can quickly correct the issue.

### Incorrect

Attempting to validate a non-existent file:

```bash
claude-code-lint check-claude-md /path/to/nonexistent/CLAUDE.md
```

Error output:

```text
Error: File not found: /path/to/nonexistent/CLAUDE.md
```

Typo in file path:

```bash
claude-code-lint check-claude-md ./CLUADE.md
                                ^^^^^^^ Typo: should be CLAUDE.md
```

Wrong directory:

```bash
claude-code-lint check-claude-md ../other-project/CLAUDE.md
```

When the file is actually in the current directory.

### Correct

Validating an existing file with absolute path:

```bash
claude-code-lint check-claude-md /Users/username/project/CLAUDE.md
```

Validating with relative path:

```bash
claude-code-lint check-claude-md ./CLAUDE.md
```

Validating from project root:

```bash
cd /path/to/project
claude-code-lint check-claude-md CLAUDE.md
```

## How To Fix

To resolve file not found errors:

1. **Verify the file exists**:

   ```bash
   ls -la /path/to/CLAUDE.md
   ```

2. **Check for typos** in the file name or path:

   ```bash
   # Wrong
   claude-code-lint check-claude-md CLUADE.md

   # Correct
   claude-code-lint check-claude-md CLAUDE.md
   ```

3. **Use absolute paths** to avoid confusion:

   ```bash
   # Get absolute path
   pwd
   # /Users/username/project

   # Use full path
   claude-code-lint check-claude-md /Users/username/project/CLAUDE.md
   ```

4. **Check current directory**:

   ```bash
   pwd
   ls -la | grep CLAUDE.md
   ```

5. **Create the file** if it should exist but doesn't:

   ```bash
   touch CLAUDE.md
   # Add content to the file
   ```

6. **Verify file permissions** - ensure the file is readable:

   ```bash
   chmod 644 CLAUDE.md
   ```

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. If a file doesn't exist, validation cannot proceed. This rule provides essential feedback about file system issues. Rather than disabling the rule, fix the file path or create the missing file.

## Related Rules

- [claude-md-import-missing](./claude-md-import-missing.md) - Missing imported files
- [claude-md-import-read-failed](./claude-md-import-read-failed.md) - Failed to read files

## Resources

- [Rule Implementation](../../src/rules/claude-md/claude-md-file-not-found.ts)
- [Rule Tests](../../tests/validators/claude-md.test.ts)

## Version

Available since: v1.0.0
