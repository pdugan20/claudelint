# Commands Validator

The Commands validator checks for deprecated command directory usage and helps migrate to the newer skills-based approach.

## What It Checks

- Deprecated `.claude/commands/` directory detection
- Migration guidance to skills

## Rules

This validator includes <RuleCount category="commands" /> rules. See the [Commands rules category](/rules/overview) for the complete list.

| Rule | Severity | Description |
|------|----------|-------------|
| [commands-deprecated-directory](/rules/commands/commands-deprecated-directory) | warn | Deprecated commands directory detected |
| [commands-migrate-to-skills](/rules/commands/commands-migrate-to-skills) | warn | Migrate commands to skills |

## CLI Usage

```bash
claudelint check-all
claudelint check-all --verbose
```

## See Also

- [Rules Reference](/rules/overview) - All validation rules
- [Configuration](/guide/configuration) - Customize rule severity
