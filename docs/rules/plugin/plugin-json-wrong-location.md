# Rule: plugin-json-wrong-location

**Severity**: Error
**Fixable**: No
**Validator**: Plugin
**Category**: Best Practices

plugin.json must be in .claude-plugin/ directory, not at repository root

## Rule Details

The `plugin.json` file must be located at `.claude-plugin/plugin.json` to be properly discovered by Claude Code. It should not be placed at the repository root or in any other directory. Claude Code's plugin discovery mechanism looks for plugin.json inside the `.claude-plugin/` directory.

Correct placement ensures:

- **Plugin discovery**: Claude Code can automatically detect and load the plugin
- **Installation success**: Plugin installation scripts find the manifest
- **Marketplace compatibility**: Marketplace indexing expects .claude-plugin/plugin.json
- **Standard conventions**: All plugins follow the same file structure
- **Development tools**: IDEs and tools expect manifests in .claude-plugin/

This rule checks if `plugin.json` is located at the repository root or any location other than `.claude-plugin/` and reports an error if found.

### Incorrect

plugin.json at repository root:

```text
my-plugin/
├── plugin.json            # Wrong location
├── README.md
├── skills/
├── agents/
└── hooks/
```

plugin.json in wrong subdirectory:

```text
my-plugin/
├── README.md
├── config/
│   └── plugin.json        # Wrong location
└── skills/
```

### Correct

plugin.json in .claude-plugin/ directory:

```text
my-plugin/
├── .claude-plugin/
│   └── plugin.json        # Correct location
├── README.md
├── skills/
├── agents/
└── hooks/
```

Complete correct structure:

```text
my-plugin/
├── .claude-plugin/
│   └── plugin.json        # Plugin manifest
├── skills/                # Skills at root level
│   └── my-skill/
│       └── SKILL.md
├── agents/                # Agents at root level
│   └── reviewer.md
├── hooks/                 # Hooks at root level
│   └── hooks.json
├── README.md
└── LICENSE
```

## How To Fix

To move plugin.json to the correct location:

1. **Find the current location** of plugin.json:

   ```bash
   find . -name "plugin.json" -type f
   ```

2. **Create .claude-plugin directory** if it doesn't exist:

   ```bash
   mkdir -p .claude-plugin
   ```

3. **Move to .claude-plugin/** if in wrong location:

   ```bash
   # If at repository root
   mv plugin.json .claude-plugin/plugin.json
   ```

4. **Verify location** is correct:

   ```bash
   ls -la .claude-plugin/ | grep plugin.json
   ```

5. **Update any references** in documentation or scripts:

   ```bash
   # Search for hardcoded paths
   grep -r "plugin.json" .
   # Update to use .claude-plugin/plugin.json
   ```

6. **Check file permissions**:

   ```bash
   # Ensure plugin.json is readable
   chmod 644 .claude-plugin/plugin.json
   ```

7. **Verify with git** if using version control:

   ```bash
   # Check that plugin.json is tracked in .claude-plugin/
   git ls-files | grep "^\.claude-plugin/plugin\.json$"
   ```

8. **Run validation**:

   ```bash
   claudelint validate-plugin
   ```

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. Claude Code requires `plugin.json` to be at `.claude-plugin/plugin.json`:

- Plugins with misplaced manifests cannot be discovered by Claude Code
- Installation will fail if plugin.json is not found at the expected location
- Marketplace submission requires .claude-plugin/plugin.json
- Plugin loading will fail with validation errors

Always place `plugin.json` at `.claude-plugin/plugin.json` rather than disabling validation. There are no valid use cases for placing plugin.json in other locations.

## Related Rules

- [plugin-components-wrong-location](./plugin-components-wrong-location.md) - Validates component directory locations
- [plugin-invalid-manifest](./plugin-invalid-manifest.md) - Validates manifest structure
- [plugin-missing-file](./plugin-missing-file.md) - Ensures referenced files exist

## Resources

- [Rule Implementation](../../src/rules/plugin/plugin-json-wrong-location.ts)
- [Claude Code Plugin Reference](https://code.claude.com/docs/en/plugins-reference#plugin-directory-structure)

## Version

Available since: v0.2.0
