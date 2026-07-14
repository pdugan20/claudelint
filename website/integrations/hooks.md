---
description: Set up Claude Code SessionStart hooks to automatically validate your project configuration every time a Claude Code session begins.
---

# Claude Code Hooks

claudelint can automatically validate your Claude Code project when a session starts using Claude Code hooks.

## How It Works

SessionStart `command` hooks run a shell command when a Claude Code session begins. The command's stdout is fed into Claude's context — not displayed in your terminal. This means Claude is silently made aware of any validation issues and can proactively mention them when you start chatting.

## What It Looks Like

Because the hook's stdout goes into Claude's context rather than your terminal, you never see the validation output directly. What you see is Claude bringing it up:

```text
> Can you add a skill for deploying to staging?

I can do that. First though — claudelint flagged two problems in this project
when the session started, and one of them will affect the skill I'm about to write:

  .claude/skills/deploy/SKILL.md
    error    Skill description missing trigger phrases   skill-description-missing-trigger
  .claude/settings.json
    warning  Permission rule has empty pattern: Bash()   settings-permission-empty-pattern

The existing deploy skill has the same description problem I'd be copying, so
let me fix that first, then add the staging skill.
```

Claude gets the findings before you type anything, so it can factor them into what it does next rather than reporting them and moving on. The `--format json` flag is what makes this reliable: structured output means Claude parses rule IDs and file paths exactly, instead of guessing at a table.

If you would rather see the results yourself at session start, use the [prompt hook](#alternative-prompt-hook) below.

## Quick Setup

Run `claudelint init` with the `--hooks` flag to create the hook file automatically:

<CodeTabs :tabs="[
  { label: 'New project', code: 'claudelint init --hooks' },
  { label: 'Existing project', code: 'claudelint init --yes --hooks' },
]" />

## Manual Setup

Alternatively, create `.claude/hooks/hooks.json` in your project manually:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "npx claudelint check-all --format json"
          }
        ]
      }
    ]
  }
}
```

When you start a Claude Code session, the hook runs `claudelint check-all` in the background. Claude receives the JSON results and can inform you about any errors or warnings in your project's Claude Code configuration.

The `--format json` flag produces structured output that is easy for Claude to parse and act on.

## Alternative: Prompt Hook

If you want Claude to actively run validation and report results (instead of receiving them silently), use a `prompt` hook:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "Run npx claudelint check-all and briefly report any issues."
          }
        ]
      }
    ]
  }
}
```

This costs an extra turn at session start — Claude will run the command itself and show you the results before you begin working.

## Troubleshooting

### Hook doesn't run

**Problem:** The SessionStart hook doesn't execute when you start a Claude Code session.

**Solution:**

1. Check that `claudelint` is installed globally or in your project
2. Verify the command works manually: `claudelint check-all --format json`
3. Check hook syntax in `.claude/hooks/hooks.json`
4. Ensure event names are PascalCase (e.g., `SessionStart`, not `session-start`)

### Too many warnings

**Problem:** The hook produces a large volume of warnings that clutter Claude's context.

**Solution:**

1. Configure rules in `.claudelintrc.json` to disable noisy rules
2. Use `.claudelintignore` to skip large or irrelevant directories

## See Also

- [Configuration Guide](/guide/configuration) - Customize validation rules
- [CLI Reference](/guide/cli-reference) - All available commands and flags
- [Rules Reference](/rules/overview) - What gets validated
