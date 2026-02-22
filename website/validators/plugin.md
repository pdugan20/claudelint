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

| Rule | Severity | Description |
|------|----------|-------------|
| [plugin-name-required](/rules/plugin/plugin-name-required) | error | Plugin name is required |
| [plugin-version-required](/rules/plugin/plugin-version-required) | error | Plugin version is required |
| [plugin-invalid-version](/rules/plugin/plugin-invalid-version) | error | Invalid semantic version |
| [plugin-missing-file](/rules/plugin/plugin-missing-file) | error | Referenced file not found |
| [plugin-invalid-marketplace-manifest](/rules/plugin/plugin-invalid-marketplace-manifest) | error | Invalid marketplace manifest schema |

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
