# Rule: claude-md-import-read-failed

**Severity**: Error
**Fixable**: No
**Validator**: CLAUDE.md
**Category**: Cross-Reference

Failed to read imported file

## Rule Details

This rule detects when an imported file exists on the filesystem but cannot be read due to permission errors, file system issues, or other access problems. This is distinct from the `claude-md-import-missing` rule, which checks if the file exists at all.

When Claude Code processes CLAUDE.md files, it needs to read imported files to include their content. If a file exists but is unreadable, the import will fail silently or cause errors during context loading. Common causes include:

- Permission denied (file is not readable)
- File is locked by another process
- File system errors or corruption
- Symbolic link pointing to an inaccessible location
- Network file system issues (for network-mounted drives)

The validator attempts to read each imported file and reports an error if the read operation fails for any reason other than the file not existing.

### Incorrect

File exists but has restrictive permissions:

```markdown
# CLAUDE.md
Import: @.claude/rules/secrets.md
```

```bash
# File exists but is not readable
ls -la .claude/rules/secrets.md
---------- 1 user staff 1234 Jan 29 secrets.md
           ^^^ No read permissions
```

File locked by another process:

```markdown
# CLAUDE.md
Import: @.claude/rules/database.md
```

The file exists but is currently being written to by another process and cannot be read simultaneously.

Broken symbolic link:

```markdown
# CLAUDE.md
Import: @.claude/rules/shared.md
```

```bash
# Symbolic link exists but target is inaccessible
ls -la .claude/rules/shared.md
lrwxr-xr-x 1 user staff 50 Jan 29 shared.md -> /restricted/path/shared.md
                                                 ^^^^^^^^^^^^^ Cannot access
```

### Correct

File exists and is readable:

```markdown
# CLAUDE.md
Import: @.claude/rules/git.md
Import: @.claude/rules/testing.md
Import: @.claude/rules/api.md
```

```bash
# Files exist with proper read permissions
ls -la .claude/rules/
-rw-r--r-- 1 user staff 2048 Jan 29 git.md
-rw-r--r-- 1 user staff 1536 Jan 29 testing.md
-rw-r--r-- 1 user staff 3072 Jan 29 api.md
```

Proper file permissions:

```bash
# All imported files are readable
chmod 644 .claude/rules/*.md
```

Working symbolic links:

```bash
# Symbolic link points to accessible file
ln -s ../shared/common.md .claude/rules/shared.md
ls -la ../shared/common.md
-rw-r--r-- 1 user staff 1024 Jan 29 common.md
```

## How To Fix

To resolve file read failures:

1. **Check file permissions**:

   ```bash
   ls -la .claude/rules/problematic-file.md
   ```

2. **Make the file readable**:

   ```bash
   chmod 644 .claude/rules/problematic-file.md
   # or
   chmod +r .claude/rules/problematic-file.md
   ```

3. **Verify ownership** - ensure you own the file or have permission to read it:

   ```bash
   # Check ownership
   ls -la .claude/rules/file.md

   # Change ownership if needed (requires sudo)
   sudo chown $USER .claude/rules/file.md
   ```

4. **Check for file locks**:

   ```bash
   # On macOS/Linux, check if file is open by another process
   lsof .claude/rules/file.md

   # Close the other process or wait for it to finish
   ```

5. **Verify symbolic links** point to accessible locations:

   ```bash
   # Check where symlink points
   ls -la .claude/rules/shared.md

   # Verify target exists and is readable
   readlink .claude/rules/shared.md
   ls -la $(readlink .claude/rules/shared.md)
   ```

6. **Check file system health**:

   ```bash
   # On macOS
   diskutil verifyVolume /

   # On Linux
   fsck -n /dev/sda1
   ```

7. **For network drives**, ensure the mount is accessible:

   ```bash
   # Check mount status
   mount | grep your-network-drive
   ```

8. **Verify the fix**:

   ```bash
   # Test if file is readable
   cat .claude/rules/file.md

   # Run validation
   claudelint check-claude-md
   ```

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. If an imported file cannot be read, Claude Code cannot load its content, resulting in incomplete context, missing rules and guidelines, and undefined behavior. Always fix the file permissions or access issues rather than disabling the rule.

The rule distinguishes between files that don't exist (handled by `claude-md-import-missing`) and files that exist but cannot be read (this rule), providing specific guidance for each scenario.

## Related Rules

- [claude-md-import-missing](./claude-md-import-missing.md) - Missing imported files
- [claude-md-file-not-found](./claude-md-file-not-found.md) - Main file not found

## Resources

- [Rule Implementation](../../src/rules/claude-md/claude-md-import-read-failed.ts)
- [Rule Tests](../../tests/validators/claude-md.test.ts)

## Version

Available since: v1.0.0
