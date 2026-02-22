---
description: Check for deprecated .claude/commands/ directory usage and get migration guidance for moving to the skills-based approach with claudelint's Commands validator.
---

# Commands Validator

The Commands validator checks for deprecated command directory usage and helps migrate to the newer skills-based approach.

## What It Checks

- Deprecated `.claude/commands/` directory detection
- Migration guidance to skills

## Rules

This validator includes <RuleCount category="commands" /> rules. See the [Commands rules category](/rules/commands/commands-deprecated-directory) for the complete list.

| Rule | Severity | Description |
|------|----------|-------------|
| [commands-deprecated-directory](/rules/commands/commands-deprecated-directory) | warn | Deprecated commands directory detected |

## CLI Usage

```bash
# Check for deprecated commands
claudelint validate-commands

# Verbose output
claudelint validate-commands --verbose
```

## See Also

- [Claude Code Slash Commands](https://code.claude.com/docs/en/slash-commands) - Official commands documentation
- [Configuration](/guide/configuration) - Customize rule severity
