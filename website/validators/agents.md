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

This validator includes <RuleCount category="agents" /> rules. See the [Agents rules category](/rules/agents/agent-body-too-short) for the complete list.

| Rule | Severity | Description |
|------|----------|-------------|
| [agent-name](/rules/agents/agent-name) | error | Invalid agent name format |
| [agent-description](/rules/agents/agent-description) | error | Missing or invalid description |
| [agent-model](/rules/agents/agent-model) | error | Invalid model configuration |
| [agent-name-directory-mismatch](/rules/agents/agent-name-directory-mismatch) | error | Name does not match directory |
| [agent-skills-not-found](/rules/agents/agent-skills-not-found) | error | Referenced skill not found |

## CLI Usage

```bash
claudelint check-all
claudelint check-all --verbose
```

## See Also

- [Rules Reference](/rules/overview) - All validation rules
- [Configuration](/guide/configuration) - Customize rule severity
