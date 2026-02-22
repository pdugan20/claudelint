---
description: "Inline hook commands must use ${CLAUDE_PLUGIN_ROOT} for portable script paths"
---

# plugin-hook-missing-plugin-root

<RuleHeader description="Inline hook commands must use ${CLAUDE_PLUGIN_ROOT} for portable script paths" severity="error" :fixable="false" :configurable="false" category="Plugin" />

## Rule Details

This rule checks inline hook definitions in plugin.json for command-type hooks that reference script files via relative paths. These commands must use ${CLAUDE_PLUGIN_ROOT} to form absolute paths that resolve correctly regardless of where the plugin is installed. String and array hook file paths are resolved by the plugin system and do not need this variable.

### Incorrect

Inline hook command using a relative path without ${CLAUDE_PLUGIN_ROOT}

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

Inline hook command using ${CLAUDE_PLUGIN_ROOT}

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

Replace relative script paths in inline hook commands with paths that start with ${CLAUDE_PLUGIN_ROOT}. For example, change `./scripts/lint.sh` to `${CLAUDE_PLUGIN_ROOT}/scripts/lint.sh`.

## Options

This rule does not have any configuration options.

## Related Rules

- [`plugin-missing-file`](/rules/plugin/plugin-missing-file)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/plugin/plugin-hook-missing-plugin-root.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/plugin/plugin-hook-missing-plugin-root.test.ts)

## Version

Available since: v0.2.0
