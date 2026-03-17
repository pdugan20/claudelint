---
description: Validate Claude Code plugin.json manifest files for schema compliance, semantic versioning, required fields, and component file references with claudelint.
---

# Plugin Validator

The Plugin validator checks `.claude-plugin/plugin.json` manifest files for schema compliance, versioning, and component references.

## What It Checks

- plugin.json schema validation
- Semantic versioning format
- Required fields (name, version, description)
- Skill, agent, and hook references
- Component file existence
- Directory structure
- marketplace.json schema

## Rules

This validator includes <RuleCount category="plugin" /> rules. See the [Plugin rules category](/rules/plugin/plugin-commands-deprecated) for the complete list.

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin: 16px 0;">

<RuleCard
  rule-id="plugin-name-required"
  description="Plugin manifest is missing the required name field"
  severity="error"
  category="Plugin"
  link="/rules/plugin/plugin-name-required"
/>

<RuleCard
  rule-id="plugin-invalid-version"
  description="Version string does not follow semantic versioning"
  severity="error"
  category="Plugin"
  link="/rules/plugin/plugin-invalid-version"
/>

<RuleCard
  rule-id="plugin-missing-file"
  description="Referenced component file does not exist"
  severity="error"
  category="Plugin"
  link="/rules/plugin/plugin-missing-file"
/>

<RuleCard
  rule-id="plugin-invalid-marketplace-manifest"
  description="Marketplace manifest has structural errors"
  severity="error"
  category="Plugin"
  link="/rules/plugin/plugin-invalid-marketplace-manifest"
/>

</div>

## CLI Usage

```bash
claudelint validate-plugin
claudelint validate-plugin --verbose
```

## Plugin Skill

If you have the [claudelint plugin](/integrations/claude-code-plugin) installed, you can run this validator inside Claude Code with `/validate-plugin` or by asking "Check my plugin manifest."

## See Also

- [Claude Code Plugins Reference](https://code.claude.com/docs/en/plugins-reference) - Official plugin documentation
- [Claude Code Plugin Integration](/integrations/claude-code-plugin) - Plugin usage guide
