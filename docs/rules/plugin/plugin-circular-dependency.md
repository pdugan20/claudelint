# Rule: plugin-circular-dependency

**Severity**: Error
**Fixable**: No
**Validator**: Plugin
**Category**: Dependencies

Detects circular dependencies between plugins that would cause infinite loops or loading failures.

## Rule Details

This rule triggers when Claude Code detects circular dependency chains in plugin manifests. A circular dependency occurs when:
- A plugin depends on itself directly: `plugin-a → plugin-a`
- A plugin depends on another that depends back: `plugin-a → plugin-b → plugin-a`
- Multiple plugins form a dependency cycle: `plugin-a → plugin-b → plugin-c → plugin-a`

Circular dependencies prevent plugins from loading correctly because each plugin waits for the other to load first, creating a deadlock.

### Incorrect

plugin-manifest.json with direct self-dependency:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "dependencies": {
    "my-plugin": "^1.0.0"
  }
}
```

Or with indirect circular dependency:

```json
{
  "name": "plugin-a",
  "version": "1.0.0",
  "dependencies": {
    "plugin-b": "^1.0.0"
  }
}
```

Where plugin-b depends on plugin-a:

```json
{
  "name": "plugin-b",
  "version": "1.0.0",
  "dependencies": {
    "plugin-a": "^1.0.0"
  }
}
```

### Correct

plugin-manifest.json with acyclic dependencies:

```json
{
  "name": "plugin-a",
  "version": "1.0.0",
  "dependencies": {
    "plugin-utils": "^1.0.0",
    "plugin-helpers": "^2.0.0"
  }
}
```

Where plugin-utils and plugin-helpers don't depend on plugin-a.

## How To Fix

1. **Direct self-dependency**: Remove the plugin from its own dependencies list
2. **Indirect cycle**: Identify the cycle and break it by:
   - Extracting shared code into a separate common plugin
   - Restructuring dependencies to flow in one direction
   - Using dependency injection or events instead of direct dependencies
3. **Visualize dependencies**: Draw a dependency graph to identify cycles
4. **Restructure**: Organize plugins in layers where each layer only depends on lower layers

Example restructuring:

```text
Before (circular):
plugin-a -> plugin-b -> plugin-a

After (hierarchical):
plugin-a \
          plugin-common
plugin-b /
```

## Options

This rule does not have any configuration options.

## When Not To Use It

You should not disable this rule. Circular dependencies will always cause plugin loading failures. Restructure your plugin dependencies instead.

## Related Rules

- [plugin-dependency-invalid-version](./plugin-dependency-invalid-version.md) - Validates dependency version syntax
- [plugin-invalid-manifest](./plugin-invalid-manifest.md) - Validates plugin manifest structure

## Resources

- [Rule Implementation](../../src/validators/plugin.ts#L250)
- [Rule Tests](../../tests/validators/plugin.test.ts)

## Version

Available since: v1.0.0
