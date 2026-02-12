# plugin-json-wrong-location

<RuleHeader description="plugin.json must be in .claude-plugin/ directory, not at repository root" severity="error" :fixable="false" category="Plugin" />

## Rule Details

The plugin.json manifest must be located at .claude-plugin/plugin.json for Claude Code to discover the plugin. Placing it at the repository root or any other location will cause the plugin to not be recognized. This rule checks whether the file path includes the .claude-plugin/ directory segment.

### Incorrect

plugin.json placed at the repository root

```yaml
my-plugin/
  plugin.json        <-- wrong location
  .claude/
    skills/
```

### Correct

plugin.json inside .claude-plugin/ directory

```yaml
my-plugin/
  .claude-plugin/
    plugin.json      <-- correct location
  .claude/
    skills/
```

## How To Fix

Move plugin.json to the .claude-plugin/ directory at the root of your plugin repository so it resides at .claude-plugin/plugin.json.

## Options

This rule does not have any configuration options.

## Related Rules

- [`plugin-components-wrong-location`](/rules/plugin/plugin-components-wrong-location)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/plugin/plugin-json-wrong-location.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/plugin/plugin-json-wrong-location.test.ts)

## Version

Available since: v0.2.0
