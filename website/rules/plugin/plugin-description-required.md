# plugin-description-required

<RuleHeader description="Plugin description is required and cannot be empty" severity="error" :fixable="false" category="Plugin" />

## Rule Details

The description field in plugin.json tells users what the plugin does. This rule ensures the field is present, is a string, and is not empty or whitespace-only. A clear description is essential for plugin discoverability and for users evaluating whether to install the plugin.

### Incorrect

Plugin with a missing description

```json
{
  "name": "my-plugin",
  "version": "1.0.0"
}
```

Plugin with an empty description

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": ""
}
```

Plugin with a whitespace-only description

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "   "
}
```

### Correct

Plugin with a meaningful description

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "Provides code review skills for TypeScript projects"
}
```

## How To Fix

Add a description field with a clear, concise summary of what the plugin provides. Aim for one to two sentences that help users understand the plugin's purpose.

## Options

This rule does not have any configuration options.

## Related Rules

- [`plugin-invalid-version`](/rules/plugin/plugin-invalid-version)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/plugin/plugin-description-required.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/plugin/plugin-description-required.test.ts)

## Version

Available since: v0.2.0
