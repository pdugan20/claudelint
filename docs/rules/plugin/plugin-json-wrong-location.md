# Rule: plugin-json-wrong-location

**Severity**: Error
**Fixable**: No
**Validator**: Plugin
**Category**: Best Practices

plugin.json should be at repository root, not inside .claude-plugin/

## Rule Details

The `plugin.json` file must be located at the repository root to be properly discovered by Claude Code. It should not be placed inside the `.claude-plugin/` directory or any subdirectory. Claude Code's plugin discovery mechanism looks for `plugin.json` at the root level of plugin repositories.

Correct placement ensures:

- **Plugin discovery**: Claude Code can automatically detect and load the plugin
- **Installation success**: Plugin installation scripts find the manifest
- **Marketplace compatibility**: Marketplace indexing expects root-level plugin.json
- **Standard conventions**: All plugins follow the same file structure
- **Development tools**: IDEs and tools expect manifests at repository root

This rule checks if `plugin.json` is located inside `.claude-plugin/` or any other subdirectory and reports an error if found. The file must be at the top level of the repository.

### Incorrect

plugin.json in wrong location:

```text
my-plugin/
├── README.md
├── .claude/
│   └── skills/
└── .claude-plugin/
    └── plugin.json        # Wrong location
```

plugin.json in subdirectory:

```text
my-plugin/
├── README.md
├── config/
│   └── plugin.json        # Wrong location
└── .claude/
    └── skills/
```

### Correct

plugin.json at repository root:

```text
my-plugin/
├── plugin.json            # Correct location
├── README.md
├── .claude/
│   ├── skills/
│   ├── agents/
│   └── hooks/
└── .claude-plugin/
    └── cache/
```

Complete correct structure:

```text
my-plugin/
├── plugin.json            # Plugin manifest at root
├── marketplace.json       # Optional marketplace metadata
├── README.md
├── LICENSE
├── .claude/               # Plugin components
│   ├── skills/
│   │   └── build/
│   │       └── SKILL.md
│   ├── agents/
│   │   └── reviewer.md
│   └── hooks/
│       └── pre-commit.json
└── .claude-plugin/        # Plugin internal data
    ├── cache/
    └── state/
```

## How To Fix

To move plugin.json to the correct location:

1. **Find the current location** of plugin.json:

   ```bash
   # Search for plugin.json
   find . -name "plugin.json" -type f
   ```

2. **Move to repository root** if in wrong location:

   ```bash
   # If in .claude-plugin/ directory
   mv .claude-plugin/plugin.json ./plugin.json
   ```

3. **Verify location** is at root:

   ```bash
   # Check that plugin.json is at root level
   ls -la | grep plugin.json
   ```

4. **Update any references** in documentation or scripts:

   ```bash
   # Search for hardcoded paths
   grep -r ".claude-plugin/plugin.json" .
   # Update to use ./plugin.json or plugin.json
   ```

5. **Check file permissions**:

   ```bash
   # Ensure plugin.json is readable
   chmod 644 plugin.json
   ```

6. **Verify with git** if using version control:

   ```bash
   # Check that plugin.json is tracked at root
   git ls-files | grep "^plugin.json$"
   ```

7. **Run validation**:

   ```bash
   claudelint check-plugin
   ```

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. Claude Code requires `plugin.json` to be at the repository root:

- Plugins with misplaced manifests cannot be discovered by Claude Code
- Installation will fail if plugin.json is not found at the expected location
- Marketplace submission requires root-level plugin.json
- Other plugins depending on your plugin cannot resolve it correctly

Always place `plugin.json` at the repository root rather than disabling validation. There are no valid use cases for placing plugin.json in subdirectories.

## Related Rules

- [plugin-components-wrong-location](./plugin-components-wrong-location.md) - Validates component directory locations
- [plugin-invalid-manifest](./plugin-invalid-manifest.md) - Validates manifest structure
- [plugin-missing-file](./plugin-missing-file.md) - Ensures referenced files exist

## Resources

- [Rule Implementation](../../src/rules/plugin/plugin-json-wrong-location.ts)
- [Rule Tests](../../tests/rules/plugin/plugin-json-wrong-location.test.ts)
- [Plugin Development Guide](https://github.com/anthropics/claude-code)

## Version

Available since: v1.0.0
