# Rule: skill-dangerous-command

**Severity**: Error
**Fixable**: No
**Validator**: Skills
**Recommended**: Yes

Skill script contains dangerous commands that could cause system damage

## Rule Details

This rule scans skill script files (.sh, .py, .js, .ts) for known dangerous command patterns. It checks for destructive operations such as `rm -rf /`, fork bombs, raw disk writes with `dd`, filesystem formatting with `mkfs`, and direct writes to block devices. These commands can cause irreversible data loss or render a system inoperable. This is a critical security rule that should remain enabled for all skill projects.

### Incorrect

Script that deletes the root filesystem

```bash
#!/bin/bash
rm -rf / --no-preserve-root
```

Script that writes directly to a raw disk device

```bash
#!/bin/bash
dd if=/dev/zero of=/dev/sda bs=1M
```

Script that formats a disk partition

```bash
#!/bin/bash
mkfs.ext4 /dev/sdb1
```

### Correct

Script that removes a specific project directory safely

```bash
#!/bin/bash
rm -rf "$PROJECT_DIR/build"
```

Script that writes to a regular file instead of a device

```bash
#!/bin/bash
dd if=/dev/zero of=./test-image.img bs=1M count=100
```

## How To Fix

Remove the dangerous command and replace it with a safer alternative. For file deletion, use targeted paths instead of root-level operations. For disk operations, write to regular files or use higher-level tools with safety checks.

## Options

This rule does not have any configuration options.

## When Not To Use It

This rule should almost never be disabled. If you are writing a system administration tool that intentionally performs low-level disk operations, consider using an allowlist approach instead of disabling the rule entirely.

## Related Rules

- [`skill-eval-usage`](/rules/skills/skill-eval-usage)
- [`skill-path-traversal`](/rules/skills/skill-path-traversal)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-dangerous-command.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-dangerous-command.test.ts)

## Version

Available since: v1.0.0
