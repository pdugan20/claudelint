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

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin: 16px 0;">

<RuleCard
  rule-id="agent-name"
  description="Agent name does not follow naming conventions"
  severity="error"
  category="Agents"
  link="/rules/agents/agent-name"
/>

<RuleCard
  rule-id="agent-name-filename-mismatch"
  description="Agent name in frontmatter does not match the filename"
  severity="error"
  category="Agents"
  link="/rules/agents/agent-name-filename-mismatch"
/>

<RuleCard
  rule-id="agent-skills-not-found"
  description="Referenced skill does not exist in the project"
  severity="error"
  category="Agents"
  link="/rules/agents/agent-skills-not-found"
/>

<RuleCard
  rule-id="agent-body-too-short"
  description="Agent system prompt should have meaningful content"
  severity="warning"
  category="Agents"
  link="/rules/agents/agent-body-too-short"
/>

</div>

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
