---
description: Learn why claudelint exists, what problems it solves in Claude Code projects, and how it catches silent misconfigurations before they cause failures.
---

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

Claude Code's `/doctor` command checks runtime health, but it doesn't validate cross-file references, naming conventions, or security issues. Mistakes stay hidden until something fails silently:

- A hook event misspelled as `preToolUse` instead of `PreToolUse` — silently ignored, never fires
- A skill script containing `eval` or `rm -rf` — no security warning
- A CLAUDE.md that exceeds the context window size limit — degrades performance with no error
- A missing agent `description` — Claude can't determine when to use it, just degraded behavior

## How claudelint Helps

claudelint treats your Claude Code configuration as a first-class codebase. It validates every file against <RuleCount category="total" /> rules, checks cross-file references, enforces naming conventions, and flags security issues — the same way ESLint checks your JavaScript or SwiftLint checks your Swift.

```bash
npx claude-code-lint check-all
```

Because it's a standard CLI tool, you can [run it in CI](/integrations/ci) alongside your existing linters and tests. Configuration problems become build failures — caught on the pull request that introduced them, not days later when someone triggers a broken hook.

## What It Catches

```text
CLAUDE.md (1 error)
  0  error  File exceeds 40KB limit (42000 bytes)  claude-md-size

skills/deploy/SKILL.md (1 error)
  3  error  Description must be at least 10 characters  skill-description

.claude/hooks/hooks.json (1 warning)
  0  warning  Unknown hook event: preToolUse  hooks-invalid-event

skills/cleanup/cleanup.sh (1 error)
  8  error  Dangerous command in "cleanup.sh": rm -rf / (deletes entire filesystem)  skill-dangerous-command

4 problems (3 errors, 1 warning)
```

## Next Steps

- [Getting Started](/guide/getting-started) - Install and run your first check
- [Rules Reference](/rules/overview) - Browse all <RuleCount category="total" /> rules across 10 categories
- [Auto-fix](/guide/auto-fix) - Automatically fix common issues with `--fix`
- [Configuration](/guide/configuration) - Per-rule severity, [inline disables](/guide/inline-disables), and `.claudelintrc.json` config
- [CI/CD Integration](/integrations/ci) - GitHub Actions annotations, [SARIF](/integrations/sarif) upload, and git hooks
- [Monorepo Support](/integrations/monorepos) - Config inheritance, workspace detection, parallel validation
- [CLI Reference](/guide/cli-reference) - All commands, output formats, and options
