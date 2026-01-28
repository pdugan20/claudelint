# Rule: skill-dangerous-command

**Severity**: Error
**Fixable**: No
**Validator**: Skills
**Category**: Security

Detects dangerous shell commands that could cause catastrophic data loss, system damage, or denial of service.

## Rule Details

This rule detects potentially destructive commands that should never appear in Claude Code skills: `rm -rf /` (deletes entire filesystem), `:(){ :|:& };:` (fork bomb crashes system), `dd if=... of=/dev/sda` (writes to raw disk causing data loss), `mkfs /dev/...` (formats disk destroying data), `> /dev/sda` (writes to raw disk device).

These commands destroy operating systems, delete all user data, make systems unbootable, consume all resources crashing systems, bypass filesystem protections, and corrupt partition tables. Effects are often irreversible and can affect other users on shared systems.

### Incorrect

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

### Correct

Safe deletion with validation:

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

Safe operations using proper tools:

```bash
#!/usr/bin/env bash

# Safe: Uses proper backup tools instead of dd
rsync -av /source/ /backup/
```

## How To Fix

1. **Remove the command**: If unnecessary, delete it entirely
2. **Add validation**: Check paths before destructive operations, use pattern matching to validate variables
3. **Use parameter expansion safeguards**: `${VAR:?error}` fails if VAR is unset
4. **Use safer alternatives**: Replace `dd` with `rsync`/`tar`, `mkfs` with GUI tools, `rm -rf` with `trash-cli`
5. **Add confirmation prompts**: For destructive operations, require explicit confirmation
6. **Test in sandbox**: Test destructive scripts in containers or VMs first

**Validation Example:**

```bash
# Validate variable is set and non-empty
: "${BUILD_DIR:?BUILD_DIR must be set}"

# Validate directory matches expected pattern
if [[ ! "$BUILD_DIR" =~ ^/tmp/build-[0-9]+$ ]]; then
  echo "Error: Invalid directory pattern"
  exit 1
fi

# Safe deletion with safeguards
rm -rf "${BUILD_DIR:?}"
```

**Best Practices:**

- Never use absolute paths with `rm -rf`
- Always validate input before destructive operations
- Prefer high-level tools over low-level commands
- Use `set -euo pipefail` for safer scripts

## Options

This rule does not have configuration options. Dangerous commands should never be used.

## When Not To Use It

Almost never disable this rule. Only consider disabling if writing system administration tools requiring these commands, with extensive safeguards and testing, and full understanding of risks. Even then, question whether the command belongs in a Claude Code skill.

## Related Rules

- [skill-eval-usage](./skill-eval-usage.md) - Eval/exec security risk detection
- [skill-path-traversal](./skill-path-traversal.md) - Path traversal vulnerability detection

## Resources

- [Implementation](../../../src/validators/skills.ts)
- [Tests](../../../tests/validators/skills.test.ts)
- [OWASP Command Injection](https://owasp.org/www-community/attacks/Command_Injection)
- [Bash Pitfalls](https://mywiki.wooledge.org/BashPitfalls)

## Version

Available since: v1.0.0
