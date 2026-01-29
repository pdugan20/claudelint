# Rule: skill-dangerous-command

**Severity**: Error
**Fixable**: No
**Validator**: Skills
**Category**: Security

Skill script contains dangerous commands that could cause system damage

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
