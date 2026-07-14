---
description: "Cross-marketplace dependency requires allowCrossMarketplaceDependenciesOn"
---

# plugin-dependency-not-allowlisted

<RuleHeader description="Cross-marketplace dependency requires allowCrossMarketplaceDependenciesOn" severity="error" :fixable="false" :configurable="false" category="Plugin" />

## Rule Details

Only the root marketplace allowlist is consulted - the marketplace hosting the plugin being installed - so trust does not chain through intermediate marketplaces. This rule can only fire when the marketplace manifest is present in the scanned tree; a plugin published from a separate repository cannot be checked here.

### Incorrect

Dependency on another marketplace with no allowlist

```json
{
  "name": "acme-tools",
  "owner": { "name": "Acme" },
  "plugins": [
    {
      "name": "deploy-kit",
      "source": "./deploy-kit",
      "dependencies": [{ "name": "audit-logger", "marketplace": "acme-shared" }]
    }
  ]
}
```

### Correct

Target marketplace listed in the allowlist

```json
{
  "name": "acme-tools",
  "owner": { "name": "Acme" },
  "allowCrossMarketplaceDependenciesOn": ["acme-shared"],
  "plugins": [
    {
      "name": "deploy-kit",
      "source": "./deploy-kit",
      "dependencies": [{ "name": "audit-logger", "marketplace": "acme-shared" }]
    }
  ]
}
```

## How To Fix

Add the target marketplace name to allowCrossMarketplaceDependenciesOn in marketplace.json.

## Options

This rule does not have any configuration options.

## Related Rules

- [`plugin-dependency-string-with-marketplace`](/rules/plugin/plugin-dependency-string-with-marketplace)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/plugin/plugin-dependency-not-allowlisted.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/plugin/plugin-dependency-not-allowlisted.test.ts)

## Version

Available since: v0.6.0
