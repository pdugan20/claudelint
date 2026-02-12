# Why claudelint?

claudelint validates your Claude Code project configuration to catch issues early, enforce best practices, and improve developer experience.

## The Problem

Claude Code projects involve many configuration files — CLAUDE.md, skills, settings, hooks, MCP servers, plugins, and more. These files have no built-in validation, so mistakes stay hidden until something breaks:

- A misspelled hook event name like `PreToolUse` → `preToolUse` silently does nothing
- A skill with `eval` or `rm -rf` in its script creates a security hole
- A missing `description` field in AGENT.md means Claude Code can't determine when to use the agent
- An `.mcp.json` with `type: "sse"` uses a deprecated transport that may stop working
- A CLAUDE.md that exceeds the context window size limit degrades Claude's performance

These aren't hypotheticals — they're the kinds of issues claudelint catches every day.

## What It Catches

```text
CLAUDE.md
  1:1  error  File size (42KB) exceeds 40KB limit  claude-md-size-error

skills/deploy/SKILL.md
  3:1  error  Missing required 'description' field  skill-description

.claude/hooks/hooks.json
  5:1  error  Invalid hook event 'preToolUse' (did you mean 'PreToolUse'?)  hooks-invalid-event

skills/cleanup/cleanup.sh
  8:1  error  Dangerous command detected: rm -rf  skill-dangerous-command

4 problems (4 errors, 0 warnings)
```

## Key Features

- **Comprehensive** - <RuleCount category="total" /> rules across CLAUDE.md, skills, settings, hooks, MCP, plugins, agents, LSP, output styles, and commands
- **Fast** - Parallel validation with smart caching
- **Auto-fix** - Automatically fix common issues with `--fix`
- **Configurable** - Per-rule severity, inline disables, `.claudelintrc.json` config
- **Multiple Formats** - Stylish, JSON, SARIF, and compact output
- **CI-Ready** - Exit codes, SARIF output, GitHub Actions integration
- **Monorepo Support** - Config inheritance, workspace detection, parallel validation

## Next Steps

- [Introduction](/guide/getting-started) - Install and run your first check
- [Configuration](/guide/configuration) - Customize rules for your project
- [Rules Reference](/rules/overview) - Browse all <RuleCount category="total" /> rules
