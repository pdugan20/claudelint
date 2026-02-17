---
description: "Plugin component paths should start with ./ to be explicit about their location"
---

# plugin-missing-component-paths

<RuleHeader description="Plugin component paths should start with ./ to be explicit about their location" severity="warn" :fixable="false" :configurable="false" category="Plugin" />

## Rule Details

Component paths in plugin.json (skills, agents, commands, outputStyles, hooks, mcpServers, lspServers) should start with "./" to make it explicit that they are relative to the plugin root. Paths without the leading "./" prefix are ambiguous and may be misinterpreted. This rule is auto-fixable and will prepend "./" to paths that lack it.

### Incorrect

Skills path missing the ./ prefix

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My plugin",
  "skills": [
    ".claude/skills"
  ]
}
```

### Correct

Skills path with the ./ prefix

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My plugin",
  "skills": [
    "./.claude/skills"
  ]
}
```

## How To Fix

Prepend "./" to any component path that does not already start with it. For example, change ".claude/skills" to "./.claude/skills".

## Options

This rule does not have any configuration options.

## Related Rules

- [`plugin-missing-file`](/rules/plugin/plugin-missing-file)
- [`plugin-components-wrong-location`](/rules/plugin/plugin-components-wrong-location)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/plugin/plugin-missing-component-paths.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/plugin/plugin-missing-component-paths.test.ts)

## Version

Available since: v0.2.0
