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

This validator includes <RuleCount category="plugin" /> rules. See the [Plugin rules category](/rules/plugin/commands-in-plugin-deprecated) for the complete list.

| Rule | Severity | Description |
|------|----------|-------------|
| [plugin-name-required](/rules/plugin/plugin-name-required) | error | Plugin name is required |
| [plugin-version-required](/rules/plugin/plugin-version-required) | error | Plugin version is required |
| [plugin-invalid-version](/rules/plugin/plugin-invalid-version) | error | Invalid semantic version |
| [plugin-missing-file](/rules/plugin/plugin-missing-file) | error | Referenced file not found |
| [plugin-invalid-manifest](/rules/plugin/plugin-invalid-manifest) | error | Invalid manifest schema |

## CLI Usage

```bash
claudelint validate-plugin
claudelint validate-plugin --verbose
```

## See Also

- [Rules Reference](/rules/overview) - All validation rules
- [Claude Code Plugin Integration](/integrations/claude-code-plugin) - Plugin usage guide
