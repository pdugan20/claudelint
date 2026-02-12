# Agents Validator

The Agents validator checks Claude Code agent definitions for correctness, including names, descriptions, tools, and model configuration.

## What It Checks

- AGENT.md frontmatter schema compliance
- Required fields (name, description)
- Tool references
- Model configuration
- Skill references
- Hook configuration

## Rules

See the [Agents rules category](/rules/overview) for the complete list of 12 rules.

## CLI Usage

```bash
claudelint check-all
claudelint check-all --verbose
```

## See Also

- [Rules Reference](/rules/overview) - All validation rules
- [Configuration](/guide/configuration) - Customize rule severity
