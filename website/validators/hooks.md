---
description: Validate Claude Code hooks.json files for schema compliance, valid event names, hook types, script file existence, and matcher pattern syntax.
---

# Hooks Validator

The Hooks validator checks hooks configuration files for schema compliance, event validity, and script references. It discovers `hooks/hooks.json` at the plugin root (auto-loaded by Claude Code) and any additional hooks files referenced in plugin.json.

## What It Checks

- hooks.json schema validation
- Valid event names (PreToolUse, PostToolUse, SessionStart, etc.)
- Hook type correctness
- Script file existence
- Matcher pattern syntax

## Rules

This validator includes <RuleCount category="hooks" /> rules. See the [Hooks rules category](/rules/hooks/hooks-invalid-config) for the complete list.

| Rule | Severity | Description |
|------|----------|-------------|
| [hooks-missing-script](/rules/hooks/hooks-missing-script) | error | Hook script not found |
| [hooks-invalid-event](/rules/hooks/hooks-invalid-event) | error | Invalid hook event name |
| [hooks-invalid-config](/rules/hooks/hooks-invalid-config) | error | Invalid hooks.json schema |

## CLI Usage

```bash
claudelint validate-hooks
claudelint validate-hooks --verbose
```

## Plugin Skill

If you have the [claudelint plugin](/integrations/claude-code-plugin) installed, you can run this validator inside Claude Code with `/validate-hooks` or by asking "Why is my hook not firing?"

## See Also

- [Claude Code Hooks](https://code.claude.com/docs/en/hooks) - Official hooks documentation
- [Claude Code Hooks Integration](/integrations/hooks) - Using hooks with claudelint
