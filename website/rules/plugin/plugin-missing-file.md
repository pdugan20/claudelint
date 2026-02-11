# Rule: plugin-missing-file

**Severity**: Error
**Fixable**: No
**Validator**: Plugin
**Recommended**: Yes

Files referenced in plugin.json must exist

## Rule Details

This rule checks that every path referenced in plugin.json actually exists. It validates skills, agents, commands, hooks, mcpServers, lspServers, and outputStyles paths. For hooks and server configs, only string paths are checked (inline objects are skipped). Missing referenced files will cause the plugin to fail at runtime when Claude Code tries to load the referenced resources.

### Incorrect

Plugin referencing a skills directory that does not exist

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

### Correct

Plugin with all referenced paths existing on disk

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My plugin",
  "skills": [
    "./.claude/skills"
  ],
  "hooks": "./.claude/hooks.json"
}
```

## How To Fix

Create the missing files or directories at the paths specified in plugin.json. Alternatively, remove or correct any stale references that point to files that have been moved or deleted.

## Options

This rule does not have any configuration options.

## Related Rules

- [`plugin-missing-component-paths`](/rules/plugin/plugin-missing-component-paths)
- [`plugin-marketplace-files-not-found`](/rules/plugin/plugin-marketplace-files-not-found)
- [`plugin-components-wrong-location`](/rules/plugin/plugin-components-wrong-location)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/plugin/plugin-missing-file.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/plugin/plugin-missing-file.test.ts)

## Version

Available since: v1.0.0
