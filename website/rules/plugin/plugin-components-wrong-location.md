# Rule: plugin-components-wrong-location

**Severity**: Warn
**Fixable**: No
**Validator**: Plugin
**Recommended**: Yes

Plugin components should be in .claude/ not .claude-plugin/

## Rule Details

Plugin components such as skills, agents, hooks, and commands should be located in the .claude/ directory. The .claude-plugin/ directory is reserved for plugin metadata like plugin.json and marketplace.json. Placing components in .claude-plugin/ may cause them to not be discovered correctly by Claude Code.

### Incorrect

Skills placed in .claude-plugin/ directory

```yaml
my-plugin/
  .claude-plugin/
    plugin.json
    skills/         <-- wrong location
      my-skill/
```

### Correct

Skills placed in .claude/ directory

```yaml
my-plugin/
  .claude-plugin/
    plugin.json
  .claude/
    skills/           <-- correct location
      my-skill/
```

## How To Fix

Move the component directories (skills, agents, hooks, commands) from .claude-plugin/ to .claude/ and update any path references in plugin.json accordingly.

## Options

This rule does not have any configuration options.

## Related Rules

- [`plugin-json-wrong-location`](/rules/plugin/plugin-json-wrong-location)
- [`plugin-missing-file`](/rules/plugin/plugin-missing-file)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/plugin/plugin-components-wrong-location.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/plugin/plugin-components-wrong-location.test.ts)

## Version

Available since: v1.0.0
