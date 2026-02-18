---
description: "marketplace.json must conform to the marketplace schema"
---

# plugin-invalid-manifest

<RuleHeader description="marketplace.json must conform to the marketplace schema" severity="error" :fixable="false" :configurable="false" category="Plugin" />

## Rule Details

This rule validates marketplace.json files against the official Claude Code marketplace schema. A valid marketplace.json requires a name, owner (with name), and plugins array. Each plugin entry must have a name and source. The rule checks JSON syntax, schema conformance, and that each plugin entry has the required fields.

### Incorrect

marketplace.json missing required owner field

```json
{
  "name": "my-marketplace",
  "plugins": []
}
```

Plugin entry missing required source field

```json
{
  "name": "my-marketplace",
  "owner": { "name": "Dev Team" },
  "plugins": [
    { "name": "my-plugin" }
  ]
}
```

### Correct

Valid marketplace.json with relative path source

```json
{
  "name": "my-marketplace",
  "owner": { "name": "Dev Team" },
  "plugins": [
    {
      "name": "my-plugin",
      "source": "./plugins/my-plugin",
      "description": "A useful plugin"
    }
  ]
}
```

Valid marketplace.json with GitHub source

```json
{
  "name": "my-marketplace",
  "owner": { "name": "Dev Team" },
  "plugins": [
    {
      "name": "my-plugin",
      "source": { "source": "github", "repo": "owner/repo" }
    }
  ]
}
```

## How To Fix

Ensure marketplace.json has the required fields: name (string), owner (object with name), and plugins (array). Each plugin entry needs name and source. See the [official docs](https://code.claude.com/docs/en/plugin-marketplaces#marketplace-schema).

## Options

This rule does not have any configuration options.

## Related Rules

- [`plugin-marketplace-files-not-found`](/rules/plugin/plugin-marketplace-files-not-found)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/plugin/plugin-invalid-manifest.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/plugin/plugin-invalid-manifest.test.ts)

## Version

Available since: v0.2.0
