# Rule: plugin-marketplace-files-not-found

**Severity**: Warning
**Fixable**: No
**Validator**: Plugin
**Category**: Cross-Reference

Referenced marketplace file does not exist

## Rule Details

When a plugin includes an optional `marketplace.json` file, any assets referenced in it (icon, screenshots, readme, changelog) must exist at the specified paths. While `marketplace.json` itself is optional, if present, all referenced files must be valid and accessible. Missing files will cause marketplace listing failures and poor user experience.

The `marketplace.json` file can reference:

- **icon**: Plugin icon displayed in the marketplace (PNG, JPG, SVG)
- **screenshots**: Array of screenshot paths showcasing the plugin
- **readme**: Path to extended documentation (typically README.md)
- **changelog**: Path to version history (typically CHANGELOG.md)

This rule validates each referenced file path and reports warnings for any missing files. File paths are resolved relative to the repository root where `marketplace.json` is located.

### Incorrect

marketplace.json with missing icon:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "A useful plugin",
  "icon": "assets/icon.png"
}
```

```text
# Error: assets/icon.png does not exist
```

Missing screenshot files:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "A useful plugin",
  "screenshots": [
    "docs/screenshot1.png",
    "docs/screenshot2.png"
  ]
}
```

```text
# Error: docs/screenshot1.png not found
# Error: docs/screenshot2.png not found
```

Missing readme and changelog:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "A useful plugin",
  "readme": "docs/extended-readme.md",
  "changelog": "HISTORY.md"
}
```

```text
# Error: docs/extended-readme.md not found
# Error: HISTORY.md not found
```

### Correct

marketplace.json with all files present:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "A useful plugin",
  "icon": "assets/icon.png",
  "screenshots": [
    "docs/screenshot1.png",
    "docs/screenshot2.png"
  ],
  "readme": "README.md",
  "changelog": "CHANGELOG.md"
}
```

Directory structure with all referenced files:

```text
my-plugin/
├── plugin.json
├── marketplace.json
├── README.md
├── CHANGELOG.md
├── assets/
│   └── icon.png
└── docs/
    ├── screenshot1.png
    └── screenshot2.png
```

Minimal marketplace.json (no optional files):

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "A useful plugin"
}
```

## How To Fix

To resolve missing marketplace file errors:

1. **Check which files are missing** from the validation error:

   ```bash
   claudelint check-plugin
   ```

2. **Create missing icon file**:

   ```bash
   # Create assets directory
   mkdir -p assets

   # Add icon file (PNG recommended, 512x512px)
   # Copy your icon to the path specified in marketplace.json
   cp /path/to/icon.png assets/icon.png
   ```

3. **Create missing screenshot files**:

   ```bash
   # Create docs directory
   mkdir -p docs

   # Add screenshots (PNG or JPG, 1920x1080 recommended)
   cp /path/to/screenshot1.png docs/screenshot1.png
   cp /path/to/screenshot2.png docs/screenshot2.png
   ```

4. **Ensure README exists** if referenced:

   ```bash
   # Check if README exists
   ls README.md

   # Create if missing
   cat > README.md << 'EOF'
   # My Plugin

   Extended documentation for my plugin.
   EOF
   ```

5. **Ensure CHANGELOG exists** if referenced:

   ```bash
   # Create CHANGELOG.md
   cat > CHANGELOG.md << 'EOF'
   # Changelog

   ## [1.0.0] - 2026-01-30
   - Initial release
   EOF
   ```

6. **Or remove the references** if files aren't needed:

   ```bash
   # Edit marketplace.json to remove icon reference
   jq 'del(.icon)' marketplace.json > marketplace.json.tmp
   mv marketplace.json.tmp marketplace.json

   # Remove screenshots array
   jq 'del(.screenshots)' marketplace.json > marketplace.json.tmp
   mv marketplace.json.tmp marketplace.json
   ```

7. **Verify file paths** are relative to repository root:

   ```bash
   # All paths in marketplace.json should be relative
   # Good: "assets/icon.png"
   # Bad:  "/Users/name/my-plugin/assets/icon.png"
   ```

8. **Run validation**:

   ```bash
   claudelint check-plugin
   ```

## Options

This rule does not have configuration options.

## When Not To Use It

You may suppress this warning if:

- You're developing locally and plan to add marketplace assets before publishing
- You're maintaining a private plugin that won't be published to the marketplace
- You're in the process of updating assets and temporarily have broken references

However, if you plan to publish your plugin to the marketplace, all referenced files must exist. The marketplace submission process requires all assets to be present and valid. Consider removing references to non-existent files from `marketplace.json` rather than disabling validation.

## Related Rules

- [plugin-missing-file](./plugin-missing-file.md) - Validates component files exist
- [plugin-invalid-manifest](./plugin-invalid-manifest.md) - Validates manifest structure

## Resources

- [Rule Implementation](../../src/rules/plugin/plugin-marketplace-files-not-found.ts)
- [Rule Tests](../../tests/rules/plugin/plugin-marketplace-files-not-found.test.ts)
- [Plugin Development Guide](https://github.com/anthropics/claude-code)

## Version

Available since: v1.0.0
