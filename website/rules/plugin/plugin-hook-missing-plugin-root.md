---
description: "Plugin hooks must use ${CLAUDE_PLUGIN_ROOT} when referencing scripts to ensure portability"
---

# plugin-hook-missing-plugin-root

<RuleHeader description="Plugin hooks must use ${CLAUDE_PLUGIN_ROOT} when referencing scripts to ensure portability" severity="error" :fixable="false" :configurable="false" category="Plugin" />

## Rule Details

Plugin hooks that reference script files via relative paths (e.g., ./scripts/lint.sh) will break when the plugin is installed in a different location. This rule ensures that hook commands use the ${CLAUDE_PLUGIN_ROOT} variable to form absolute paths that resolve correctly regardless of where the plugin is installed.

### Incorrect

Hook using a relative script path without ${CLAUDE_PLUGIN_ROOT}

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My plugin",
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/post-tool.sh"
          }
        ]
      }
    ]
  }
}
```

### Correct

Hook using ${CLAUDE_PLUGIN_ROOT} for the script path

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My plugin",
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/post-tool.sh"
          }
        ]
      }
    ]
  }
}
```

## How To Fix

Replace relative script paths in hook commands with paths that start with ${CLAUDE_PLUGIN_ROOT}. For example, change "./scripts/lint.sh" to "${CLAUDE_PLUGIN_ROOT}/scripts/lint.sh".

## Options

This rule does not have any configuration options.

## Related Rules

- [`plugin-missing-file`](/rules/plugin/plugin-missing-file)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/plugin/plugin-hook-missing-plugin-root.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/plugin/plugin-hook-missing-plugin-root.test.ts)

## Version

Available since: v0.2.0
