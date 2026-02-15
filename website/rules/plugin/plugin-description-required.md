# plugin-description-required

<RuleHeader description="Plugin description is recommended and should not be empty" severity="warn" :fixable="false" :configurable="false" category="Plugin" />

## Rule Details

The description field in plugin.json tells users what the plugin does. This rule checks that the field is present, is a string, and is not empty or whitespace-only. While only `name` is strictly required by Claude Code, a clear description is strongly recommended for plugin discoverability and for users evaluating whether to install the plugin.

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

Add a description field with a clear, concise summary of what the plugin provides. Aim for one to two sentences that help users understand the plugin's purpose. While optional per the spec, it is strongly recommended.

## Options

This rule does not have any configuration options.

## Related Rules

- [`plugin-invalid-version`](/rules/plugin/plugin-invalid-version)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/plugin/plugin-description-required.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/plugin/plugin-description-required.test.ts)

## Version

Available since: v0.2.0
