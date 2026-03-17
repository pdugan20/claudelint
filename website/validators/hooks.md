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

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin: 16px 0;">

<RuleCard
  rule-id="hooks-missing-script"
  description="Hook references a command script that does not exist"
  severity="error"
  category="Hooks"
  link="/rules/hooks/hooks-missing-script"
/>

<RuleCard
  rule-id="hooks-invalid-event"
  description="Hook uses an unrecognized event name"
  severity="error"
  category="Hooks"
  link="/rules/hooks/hooks-invalid-event"
/>

<RuleCard
  rule-id="hooks-invalid-config"
  description="hooks.json does not match the expected schema"
  severity="error"
  category="Hooks"
  link="/rules/hooks/hooks-invalid-config"
/>

</div>

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
