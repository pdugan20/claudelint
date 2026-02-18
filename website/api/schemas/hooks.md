---
description: "Schema reference for hooks.json configuration including events, matchers, and handler types."
---

# Hooks Configuration

<SchemaRef
  validator="Hooks" validator-link="/validators/hooks"
  docs="Hooks" docs-link="https://code.claude.com/docs/en/hooks"
/>

Hooks run commands or prompts in response to Claude Code events. Each key is a [hook event](/api/schemas#hook-events) name (PascalCase), mapping to an array of matchers.

## Fields

Top-level hooks object (standalone `hooks.json`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | string | no | Human-readable description |
| `hooks` | object | yes | Event-keyed hooks configuration |

## Hook Matcher

Each event maps to an array of matcher objects:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `matcher` | string | no | Pattern to match against (e.g., tool name for PreToolUse) |
| `hooks` | object[] | yes | Array of [hook handlers](#hook-handler) |

## Hook Handler

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | yes | `command`, `prompt`, or `agent` ([valid values](/api/schemas#hook-types)) |
| `command` | string | no | Shell command (when type is `command`) |
| `prompt` | string | no | Prompt text (when type is `prompt`) |
| `agent` | string | no | Agent name (when type is `agent`) |
| `timeout` | number | no | Timeout in milliseconds |
| `statusMessage` | string | no | Status message shown during execution |
| `once` | boolean | no | Run only once per session |
| `model` | string | no | Model override for this hook |

## Example

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Bash tool invoked'",
            "timeout": 5000
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "Review the project README before starting work."
          }
        ]
      }
    ]
  }
}
```
