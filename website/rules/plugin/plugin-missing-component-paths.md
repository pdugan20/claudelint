# Rule: plugin-missing-component-paths

**Severity**: Warning
**Fixable**: Yes
**Validator**: Plugin
**Category**: Best Practices

Plugin component paths in plugin.json should start with ./

## Rule Details

This rule warns when component paths declared in `plugin.json` do not start with `./`. Component paths for skills, agents, hooks, and commands should use explicit relative paths prefixed with `./` to make it clear they are relative to the plugin root directory. Omitting the prefix can lead to ambiguity about whether the path is relative, absolute, or a module name.

When fixable, the linter can automatically prepend `./` to bare component path references.

### Incorrect

Bare component names without ./ prefix:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My plugin",
  "skills": ["format-code", "run-tests"]
}
```

Mixed paths:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My plugin",
  "skills": ["./format-code", "run-tests"],
  "agents": ["reviewer"]
}
```

### Correct

All paths with ./ prefix:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My plugin",
  "skills": ["./format-code", "./run-tests"]
}
```

All component types with ./ prefix:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My plugin",
  "skills": ["./format-code", "./run-tests"],
  "agents": ["./reviewer"],
  "hooks": ["./pre-commit"],
  "commands": ["./deploy"]
}
```

## How To Fix

Prepend `./` to any component path that lacks it:

1. Open `plugin.json`
2. Find component arrays (`skills`, `agents`, `hooks`, `commands`)
3. Add `./` prefix to any bare path

Examples:

- `"format-code"` -> `"./format-code"`
- `"agents/reviewer"` -> `"./agents/reviewer"`

Or run the linter with `--fix` to apply this automatically:

```bash
claudelint check-plugin --fix
```

## Options

This rule does not have any configuration options.

## When Not To Use It

Disable this rule if your plugin tooling resolves bare component names through a custom lookup mechanism that does not rely on relative paths. For standard Claude Code plugins, always use the `./` prefix for clarity.

## Related Rules

- [plugin-components-wrong-location](./plugin-components-wrong-location.md) - Components must be in .claude/ not .claude-plugin/

## Resources

- [Rule Implementation](../../src/rules/plugin/plugin-missing-component-paths.ts)
- [Rule Tests](../../tests/rules/plugin/plugin-missing-component-paths.test.ts)

## Version

Available since: v1.0.0
