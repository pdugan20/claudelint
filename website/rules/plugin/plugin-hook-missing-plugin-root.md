# Rule: plugin-hook-missing-plugin-root

**Severity**: Error
**Fixable**: No
**Validator**: Plugin
**Category**: Portability

Plugin hook references a script path without using ${CLAUDE_PLUGIN_ROOT}

## Rule Details

This rule errors when a plugin hook configuration references a script path that does not use the `${CLAUDE_PLUGIN_ROOT}` variable. Plugins are installed in dynamic locations that vary between users and systems. Hardcoded or relative paths break when the plugin is installed somewhere other than where it was developed.

The `${CLAUDE_PLUGIN_ROOT}` variable resolves to the plugin's installation directory at runtime, ensuring hook scripts are found regardless of where the plugin is installed. All script paths in hook configurations must use this variable as a prefix.

### Incorrect

Hardcoded relative path:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "type": "command",
        "command": "./scripts/pre-tool-check.sh"
      }
    ]
  }
}
```

Hardcoded absolute path:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "type": "command",
        "command": "/home/user/plugins/my-plugin/scripts/post-tool.sh"
      }
    ]
  }
}
```

Path without variable prefix:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "type": "command",
        "command": "scripts/validate.sh"
      }
    ]
  }
}
```

### Correct

Using ${CLAUDE_PLUGIN_ROOT}:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "type": "command",
        "command": "${CLAUDE_PLUGIN_ROOT}/scripts/pre-tool-check.sh"
      }
    ]
  }
}
```

Multiple hooks with correct paths:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "type": "command",
        "command": "${CLAUDE_PLUGIN_ROOT}/scripts/validate.sh"
      }
    ],
    "PostToolUse": [
      {
        "type": "command",
        "command": "${CLAUDE_PLUGIN_ROOT}/scripts/report.sh"
      }
    ]
  }
}
```

## How To Fix

Replace hardcoded paths with `${CLAUDE_PLUGIN_ROOT}`:

1. Identify all `command` values in hook configurations
2. Replace the path prefix with `${CLAUDE_PLUGIN_ROOT}/`
3. Ensure the script path is relative to the plugin root

Examples:

- `./scripts/check.sh` -> `${CLAUDE_PLUGIN_ROOT}/scripts/check.sh`
- `/absolute/path/scripts/check.sh` -> `${CLAUDE_PLUGIN_ROOT}/scripts/check.sh`
- `scripts/check.sh` -> `${CLAUDE_PLUGIN_ROOT}/scripts/check.sh`

## Options

This rule does not have any configuration options.

## When Not To Use It

Disable this rule only if the plugin is designed to run exclusively in a fixed location and will never be distributed. For any plugin intended for sharing or installation by others, this rule should remain enabled to ensure portability across environments.

## Related Rules

- [plugin-name-required](./plugin-name-required.md) - Plugin manifest must include a name
- [plugin-missing-file](./plugin-missing-file.md) - Referenced files must exist in the plugin

## Resources

- [Rule Implementation](../../src/rules/plugin/plugin-hook-missing-plugin-root.ts)
- [Rule Tests](../../tests/rules/plugin/plugin-hook-missing-plugin-root.test.ts)

## Version

Available since: v1.0.0
