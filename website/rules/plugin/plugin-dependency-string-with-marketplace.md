---
description: "Bare-string dependency must be a plugin name and cannot contain \"@\""
---

# plugin-dependency-string-with-marketplace

<RuleHeader description="Bare-string dependency must be a plugin name and cannot contain &quot;@&quot;" severity="error" :fixable="false" :configurable="false" category="Plugin" />

## Rule Details

The "name@marketplace" form is valid CLI syntax (claude plugin install foo@bar), which is why it looks correct in a manifest. It is not valid manifest syntax. To depend on a plugin in another marketplace, use the object form with an explicit marketplace field, and ensure the root marketplace lists that marketplace in allowCrossMarketplaceDependenciesOn. Dependencies can be declared in two places and break identically in both: a plugin.json, and a plugin entry inside marketplace.json. This rule checks both.

### Incorrect

CLI syntax used in a plugin.json dependency string

```json
{
  "name": "mintlify-docs",
  "dependencies": ["mintlify@claude-plugins-official"]
}
```

The same string inside a marketplace.json plugin entry

```json
{
  "name": "acme-tools",
  "owner": { "name": "Acme" },
  "plugins": [
    {
      "name": "mintlify-docs",
      "source": "./mintlify-docs",
      "dependencies": ["mintlify@claude-plugins-official"]
    }
  ]
}
```

### Correct

Object form with an explicit marketplace

```json
{
  "name": "mintlify-docs",
  "dependencies": [
    { "name": "mintlify", "marketplace": "claude-plugins-official" }
  ]
}
```

Bare string for a plugin in the same marketplace

```json
{
  "name": "deploy-kit",
  "dependencies": ["audit-logger"]
}
```

## How To Fix

Replace the string with an object: { "name": "<plugin>", "marketplace": "<marketplace>" }. Then add the target marketplace to allowCrossMarketplaceDependenciesOn in the root marketplace.json, or the install will fail with a cross-marketplace error.

## Options

This rule does not have any configuration options.

## Related Rules

- [`plugin-dependency-not-allowlisted`](/rules/plugin/plugin-dependency-not-allowlisted)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/plugin/plugin-dependency-string-with-marketplace.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/plugin/plugin-dependency-string-with-marketplace.test.ts)

## Version

Available since: v0.6.0
