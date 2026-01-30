# Rule: plugin-circular-dependency

**Severity**: Error
**Fixable**: No
**Validator**: Plugin
**Category**: Cross-Reference

Plugin must not have circular dependencies

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

To resolve circular dependency errors:

1. **Identify the circular reference** in your plugin.json:
   ```bash
   # Check dependencies section
   cat plugin.json | jq '.dependencies'
   ```

2. **Remove direct self-dependencies**:
   ```json
   # Before (incorrect)
   {
     "name": "my-plugin",
     "dependencies": {
       "my-plugin": "^1.0.0"
     }
   }

   # After (correct)
   {
     "name": "my-plugin",
     "dependencies": {
       "other-plugin": "^1.0.0"
     }
   }
   ```

3. **Restructure indirect circular dependencies**:
   - If plugin-a depends on plugin-b and plugin-b depends on plugin-a
   - Extract shared code into a third plugin (plugin-common)
   - Have both plugin-a and plugin-b depend on plugin-common
   ```text
   # Bad: A <-> B (circular)
   # Good: A -> Common <- B (acyclic)
   ```

4. **Run validation**:
   ```bash
   claudelint check-plugin
   ```

## Options

This rule does not have any configuration options.

## When Not To Use It

You should not disable this rule. Circular dependencies will always cause plugin loading failures. Restructure your plugin dependencies instead.

## Related Rules

- [plugin-dependency-invalid-version](./plugin-dependency-invalid-version.md) - Validates dependency version syntax
- [plugin-invalid-manifest](./plugin-invalid-manifest.md) - Validates plugin manifest structure

## Resources

- [Rule Implementation](../../src/rules/plugin/plugin-circular-dependency.ts)
- [Rule Tests](../../tests/rules/plugin/plugin-circular-dependency.test.ts)

## Version

Available since: v1.0.0
