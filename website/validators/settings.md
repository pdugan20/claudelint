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

| Rule | Severity | Description |
|------|----------|-------------|
| [settings-file-path-not-found](/rules/settings/settings-file-path-not-found) | error | Referenced path does not exist |
| [settings-invalid-permission](/rules/settings/settings-invalid-permission) | error | Invalid permission rule |
| [settings-invalid-env-var](/rules/settings/settings-invalid-env-var) | warn | Invalid environment variable |
| [settings-permission-invalid-rule](/rules/settings/settings-permission-invalid-rule) | error | Permission rule format invalid |
| [settings-permission-empty-pattern](/rules/settings/settings-permission-empty-pattern) | warn | Empty permission pattern |

## CLI Usage

```bash
claudelint validate-settings
claudelint validate-settings --verbose
```

## See Also

- [Claude Code Settings](https://code.claude.com/docs/en/settings) - Official settings documentation
- [Configuration](/guide/configuration) - Customize rule severity
