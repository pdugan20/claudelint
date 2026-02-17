---
description: "marketplace.json must be valid and reference existing files"
---

# plugin-invalid-manifest

<RuleHeader description="marketplace.json must be valid and reference existing files" severity="error" :fixable="false" :configurable="false" category="Plugin" />

## Rule Details

This rule checks the marketplace.json file that accompanies a plugin.json. It verifies that marketplace.json contains valid JSON, conforms to the MarketplaceMetadataSchema, and that its version field matches the version declared in plugin.json. If marketplace.json does not exist, the rule is skipped since it is optional. A mismatched version or invalid schema will cause marketplace publishing issues.

### Incorrect

marketplace.json with version mismatch

```json
// plugin.json
{
  "name": "my-plugin",
  "version": "1.2.0"
}

// marketplace.json
{
  "name": "my-plugin",
  "version": "1.0.0"
}
```

### Correct

marketplace.json with matching version

```json
// plugin.json
{
  "name": "my-plugin",
  "version": "1.2.0"
}

// marketplace.json
{
  "name": "my-plugin",
  "version": "1.2.0",
  "description": "A useful plugin"
}
```

## How To Fix

Ensure marketplace.json is valid JSON, follows the expected schema, and has a version that matches plugin.json. Update the version in marketplace.json whenever you bump plugin.json.

## Options

This rule does not have any configuration options.

## Related Rules

- [`plugin-name-required`](/rules/plugin/plugin-name-required)
- [`plugin-version-required`](/rules/plugin/plugin-version-required)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/plugin/plugin-invalid-manifest.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/plugin/plugin-invalid-manifest.test.ts)

## Version

Available since: v0.2.0
