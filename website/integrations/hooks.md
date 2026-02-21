---
description: Set up Claude Code SessionStart hooks to automatically validate your project configuration every time a Claude Code session begins.
---

# Claude Code Hooks

claudelint can automatically validate your Claude Code project when a session starts using Claude Code hooks.

## How It Works

SessionStart `command` hooks run a shell command when a Claude Code session begins. The command's stdout is fed into Claude's context — not displayed in your terminal. This means Claude is silently made aware of any validation issues and can proactively mention them when you start chatting.

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

- Check that `claudelint` is installed globally or in your project
- Verify the command works when run manually: `claudelint check-all --format json`
- Check hook syntax in `.claude/hooks/hooks.json`
- Ensure event names are PascalCase (e.g., `SessionStart`, not `session-start`)

### Too many warnings

- Configure rules in `.claudelintrc.json`
- Use `.claudelintignore` to skip large directories

## See Also

- [Configuration Guide](/guide/configuration) - Customize validation rules
- [CLI Reference](/guide/cli-reference) - All available commands and flags
- [Rules Reference](/rules/overview) - What gets validated
