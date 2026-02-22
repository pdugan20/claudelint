---
description: "Relative plugin source path does not resolve to a valid plugin directory"
---

# plugin-marketplace-files-not-found

<RuleHeader description="Relative plugin source path does not resolve to a valid plugin directory" severity="warn" :fixable="false" :configurable="false" category="Plugin" />

## Rule Details

When a marketplace.json lists plugins with relative path sources (e.g., "./plugins/my-plugin"), this rule checks that the referenced directory exists and contains a .claude-plugin/plugin.json manifest. External sources (github, url, npm, pip) are skipped since they cannot be validated locally.

### Incorrect

Plugin source points to non-existent directory

```json
{
  "name": "my-marketplace",
  "owner": { "name": "Dev Team" },
  "plugins": [
    {
      "name": "my-plugin",
      "source": "./plugins/missing-plugin"
    }
  ]
}
```

### Correct

Plugin source points to valid plugin directory

```json
{
  "name": "my-marketplace",
  "owner": { "name": "Dev Team" },
  "plugins": [
    {
      "name": "my-plugin",
      "source": "./plugins/my-plugin"
    }
  ]
}
```

## How To Fix

Ensure relative source paths in plugin entries point to existing directories that contain a .claude-plugin/plugin.json manifest. Create the plugin directory structure or correct the source path.

## Options

This rule does not have any configuration options.

## Related Rules

- [`plugin-invalid-marketplace-manifest`](/rules/plugin/plugin-invalid-marketplace-manifest)
- [`plugin-missing-file`](/rules/plugin/plugin-missing-file)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/plugin/plugin-marketplace-files-not-found.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/plugin/plugin-marketplace-files-not-found.test.ts)

## Version

Available since: v0.2.0
