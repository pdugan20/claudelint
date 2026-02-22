---
description: Validate Claude Code agent definitions for naming conventions, required fields, model configuration, tool references, and skill references with claudelint.
---

# Agents Validator

The Agents validator checks Claude Code agent definitions for correctness, including names, descriptions, tools, and model configuration.

## What It Checks

- Agent frontmatter schema compliance
- Required fields (name, description)
- Name/filename consistency
- Tool references
- Model configuration
- Skill references
- Hook configuration
- Body content length

## Rules

This validator includes <RuleCount category="agents" /> rules. See the [Agents rules category](/rules/agents/agent-body-too-short) for the complete list.

| Rule | Severity | Description |
|------|----------|-------------|
| [agent-name](/rules/agents/agent-name) | error | Invalid agent name format |
| [agent-description](/rules/agents/agent-description) | error | Missing or invalid description |
| [agent-name-filename-mismatch](/rules/agents/agent-name-filename-mismatch) | error | Name does not match filename |
| [agent-skills-not-found](/rules/agents/agent-skills-not-found) | error | Referenced skill not found |
| [agent-body-too-short](/rules/agents/agent-body-too-short) | warn | Agent body content below minimum length |

## CLI Usage

```bash
# Validate all agents
claudelint validate-agents

# Verbose output
claudelint validate-agents --verbose
```

::: info Agent files vs AGENTS.md
Claude Code agent files (`.claude/agents/<name>.md`) are single markdown files with YAML frontmatter that define sub-agents. Not to be confused with OpenAI's [AGENTS.md](https://developers.openai.com/codex/guides/agents-md/), which provides project-wide instructions for Codex agents (similar to Claude Code's `CLAUDE.md`).
:::

## See Also

- [Claude Code Sub-agents](https://code.claude.com/docs/en/sub-agents) - Official sub-agents documentation
- [Configuration](/guide/configuration) - Customize rule severity
