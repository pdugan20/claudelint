# Dangerous Command

Detects dangerous shell commands that could cause data loss or system damage.

## Rule Details

This rule detects potentially destructive shell commands in skill scripts. These commands can cause catastrophic data loss, system damage, or denial of service if executed accidentally or maliciously.

Dangerous commands detected:

- `rm -rf /` - Deletes entire filesystem
- `:(){ :|:& };:` - Fork bomb (crashes system)
- `dd if=... of=/dev/sda` - Writes to raw disk (data loss)
- `mkfs /dev/...` - Formats disk (data loss)
- `> /dev/sda` - Writes to raw disk device

These commands should **never** appear in Claude Code skills, as they pose severe security and safety risks.

**Category**: Skills
**Severity**: error
**Fixable**: No
**Since**: v1.0.0

### Violation Examples

Dangerous rm command:

```bash
#!/usr/bin/env bash

# DANGEROUS: This could delete the entire filesystem
rm -rf /
```

Dangerous dd command:

```bash
#!/usr/bin/env bash

# DANGEROUS: This writes to raw disk, destroying all data
dd if=/dev/zero of=/dev/sda bs=1M
```

Dangerous mkfs command:

```bash
#!/usr/bin/env bash

# DANGEROUS: This formats the disk, destroying all data
mkfs.ext4 /dev/sda1
```

Fork bomb:

```bash
#!/usr/bin/env bash

# DANGEROUS: This creates infinite processes, crashing the system
:(){ :|:& };:
```

Writing to raw disk:

```bash
#!/usr/bin/env bash

# DANGEROUS: This writes directly to disk, corrupting data
echo "data" > /dev/sda
```

### Correct Examples

Safe file deletion with specific path:

```bash
#!/usr/bin/env bash

# Safe: Deletes only files in a specific directory
rm -rf "$PROJECT_DIR/build"
```

Safe cleanup with validation:

```bash
#!/usr/bin/env bash

# Safe: Validates path before deletion
if [[ "$TEMP_DIR" =~ ^/tmp/.* ]]; then
  rm -rf "$TEMP_DIR"
else
  echo "Error: Invalid temp directory"
  exit 1
fi
```

Safe disk operations using proper tools:

```bash
#!/usr/bin/env bash

# Safe: Uses proper backup tools instead of dd
rsync -av /source/ /backup/
```

## Why These Commands Are Dangerous

### `rm -rf /`

Recursively deletes everything on the filesystem:

- Destroys operating system
- Deletes all user data
- Makes system unbootable
- Often irreversible

### Fork Bomb `:(){ :|:& };:`

Creates exponentially growing processes:

- Consumes all system resources
- Crashes the system
- Requires hard reboot
- Can affect other users on shared systems

### `dd` to raw disk

Writes data directly to disk device:

- Bypasses filesystem protections
- Destroys partition tables
- Corrupts all data on disk
- Cannot be undone

### `mkfs`

Formats disk or partition:

- Destroys all existing data
- Cannot be undone
- Affects entire partition
- Risk of wrong device specification

## How To Fix

### Option 1: Remove the dangerous command

If the command isn't necessary, remove it entirely:

```bash
# Before
rm -rf /

# After
# (removed)
```

### Option 2: Make the command safe

Add proper validation and specificity:

```bash
# Before
rm -rf $BUILD_DIR

# After: Validate path and use safer pattern
if [[ -z "$BUILD_DIR" ]]; then
  echo "Error: BUILD_DIR not set"
  exit 1
fi

if [[ ! "$BUILD_DIR" =~ ^/home/.*build$ ]]; then
  echo "Error: Invalid build directory"
  exit 1
fi

rm -rf "${BUILD_DIR:?}"  # :? ensures variable is set
```

### Option 3: Use safer alternatives

Replace dangerous commands with safer tools:

```bash
# Instead of dd for backup
# Use: rsync, tar, or dedicated backup tools

# Instead of mkfs
# Use: dedicated disk management tools with confirmations

# Instead of rm -rf
# Use: trash-cli, safe-rm, or move to trash first
```

## Security Best Practices

1. **Never use absolute paths with rm -rf**: Always use relative paths or validated variables
2. **Always validate input**: Check paths before destructive operations
3. **Use parameter expansion safeguards**: `${VAR:?error}` fails if VAR is unset
4. **Prefer safer tools**: Use high-level tools instead of low-level commands
5. **Add confirmation prompts**: For destructive operations, ask for confirmation
6. **Test in sandbox**: Test destructive scripts in containers or VMs first

Example with safeguards:

```bash
#!/usr/bin/env bash

set -euo pipefail  # Exit on error, undefined variable, pipe failure

# Validate directory is set and non-empty
: "${BUILD_DIR:?BUILD_DIR must be set}"

# Validate directory matches expected pattern
if [[ ! "$BUILD_DIR" =~ ^/tmp/build-[0-9]+$ ]]; then
  echo "Error: BUILD_DIR doesn't match expected pattern" >&2
  exit 1
fi

# Validate directory exists
if [[ ! -d "$BUILD_DIR" ]]; then
  echo "Error: BUILD_DIR doesn't exist: $BUILD_DIR" >&2
  exit 1
fi

# Safe deletion with safeguards
rm -rf "${BUILD_DIR:?}"
```

## Options

This rule does not have any configuration options. Dangerous commands should never be used.

## When Not To Use It

You should **almost never** disable this rule. The commands detected are dangerous by design.

Only disable if:

- You're writing a system administration tool that requires these commands
- You have extensive safeguards and testing in place
- You fully understand the risks and consequences

Even then, consider whether the command truly needs to be in a Claude Code skill.

## Configuration

To disable this rule (not recommended):

```json
{
  "rules": {
    "skill-dangerous-command": "off"
  }
}
```

To change to a warning (not recommended):

```json
{
  "rules": {
    "skill-dangerous-command": "warning"
  }
}
```

## Related Rules

- [skill-eval-usage](./skill-eval-usage.md) - Detects eval/exec security risks
- [skill-path-traversal](./skill-path-traversal.md) - Detects path traversal vulnerabilities

## Resources

- [OWASP Command Injection](https://owasp.org/www-community/attacks/Command_Injection)
- [Bash Pitfalls](https://mywiki.wooledge.org/BashPitfalls)
- [Safe Bash Scripting](https://sipb.mit.edu/doc/safe-shell/)

## Version

Available since: v1.0.0
