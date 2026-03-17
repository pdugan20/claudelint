---
description: Validate .claude/settings.json files for schema compliance, permission rule syntax, environment variable names, and file path references with claudelint.
---

# Settings Validator

The Settings validator checks `.claude/settings.json` files for schema compliance, permission rules, and environment variable configuration.

## What It Checks

- JSON schema validation
- Permission rule syntax and validity
- Environment variable names
- File path references
- Tool name validity

## Rules

This validator includes <RuleCount category="settings" /> rules. See the [Settings rules category](/rules/settings/settings-file-path-not-found) for the complete list.

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin: 16px 0;">

<RuleCard
  rule-id="settings-file-path-not-found"
  description="Referenced path does not exist on disk"
  severity="error"
  category="Settings"
  link="/rules/settings/settings-file-path-not-found"
/>

<RuleCard
  rule-id="settings-invalid-permission"
  description="Permission rule has invalid structure or syntax"
  severity="error"
  category="Settings"
  link="/rules/settings/settings-invalid-permission"
/>

<RuleCard
  rule-id="settings-invalid-env-var"
  description="Environment variable name is invalid"
  severity="warning"
  category="Settings"
  link="/rules/settings/settings-invalid-env-var"
/>

<RuleCard
  rule-id="settings-permission-invalid-rule"
  description="Permission rule format does not match expected pattern"
  severity="error"
  category="Settings"
  link="/rules/settings/settings-permission-invalid-rule"
/>

</div>

## CLI Usage

```bash
claudelint validate-settings
claudelint validate-settings --verbose
```

## Plugin Skill

If you have the [claudelint plugin](/integrations/claude-code-plugin) installed, you can run this validator inside Claude Code with `/validate-settings` or by asking "Check my settings."

## See Also

- [Claude Code Settings](https://code.claude.com/docs/en/settings) - Official settings documentation
- [Configuration](/guide/configuration) - Customize rule severity
