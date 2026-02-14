# Why claudelint?

claudelint validates your Claude Code project configuration to catch issues early, enforce best practices, and improve developer experience.

## The Problem

### Configuration sprawl

A serious Claude Code setup quickly becomes a project inside your project. What starts as a single CLAUDE.md grows into a tree of interconnected files:

```text
.claude/
  settings.json
  settings.local.json
  hooks/hooks.json
  rules/*.md
  skills/
    deploy/SKILL.md, deploy.sh
    test-runner/SKILL.md, run-tests.sh
    code-review/SKILL.md
  agents/
    reviewer/AGENT.md
    planner/AGENT.md
.mcp.json
.lsp.json
CLAUDE.md
```

These files reference each other — skills declare tool permissions, agents reference skills by name, hooks trigger on specific tool events, and plugins bundle all of it together. Rename a skill, and the agent that references it breaks. Change a hook event name, and automation stops firing. None of these failures produce an error message — hooks with unmatched matchers are silently ignored, and misconfigured skills or settings fall back to defaults without warning.

### No built-in guardrails

Claude Code doesn't validate most of this at setup time. While it provides JSON schemas for editor-side checking, there's no runtime schema enforcement, no cross-file reference checking, and no warnings when configuration drifts. Mistakes stay hidden until something fails silently or breaks at runtime:

- A misspelled hook event name like `PreToolUse` → `preToolUse` is silently ignored — the matcher never matches
- A skill with `eval` or `rm -rf` in its script creates a security hole
- A missing `description` field in AGENT.md means Claude can't determine when to use the agent — no error, just degraded behavior
- An `.mcp.json` with `type: "sse"` uses a deprecated transport that may stop working
- A CLAUDE.md that exceeds the context window size limit degrades Claude's performance

### Keeping skills aligned

Skills are particularly hard to manage at scale. Each skill has frontmatter (name, description, version, tags, allowed tools), script files, and optional documentation. As you add more skills, inconsistencies creep in — mismatched names and directories, missing changelogs, outdated versions, descriptions that don't explain when the skill should trigger. Without a linter, the only way to catch these is manual review.

## How claudelint Helps

claudelint treats your Claude Code configuration as a first-class codebase. It validates every file against <RuleCount category="total" /> rules, checks cross-file references, enforces naming conventions, and flags security issues — the same way ESLint checks your JavaScript or SwiftLint checks your Swift.

Because it's a standard CLI tool, you can run it in CI alongside your existing linters and tests. Instead of discovering a broken hook or misconfigured skill days later when someone triggers it, your pipeline catches the issue on the pull request that introduced it. Configuration problems become build failures — visible, blocking, and fixable before they reach your team.

## What It Catches

```text
CLAUDE.md (1 error)
  0  error  File size (42KB) exceeds 40KB limit  claude-md-size-error

skills/deploy/SKILL.md (1 error)
  0  error  Missing required 'description' field  skill-description

.claude/hooks/hooks.json (1 error)
  5  error  Invalid hook event 'preToolUse' (did you mean 'PreToolUse'?)  hooks-invalid-event

skills/cleanup/cleanup.sh (1 error)
  8  error  Dangerous command detected: rm -rf  skill-dangerous-command

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
