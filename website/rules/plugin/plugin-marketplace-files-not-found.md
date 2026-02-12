# plugin-marketplace-files-not-found

<RuleHeader description="Referenced marketplace file does not exist" severity="warn" :fixable="false" :configurable="false" category="Plugin" />

## Rule Details

Plugins can include a marketplace.json file that references assets such as an icon, screenshots, a readme, and a changelog. This rule checks that each referenced file path resolves to an existing file relative to the directory containing marketplace.json. Missing files will cause broken links or images in the marketplace listing.

### Incorrect

marketplace.json referencing a non-existent icon file

```json
{
  "icon": "./assets/icon.png",
  "screenshots": ["./assets/screenshot1.png"],
  "readme": "./README.md"
}
```

### Correct

marketplace.json with all referenced files present

```json
{
  "icon": "./assets/icon.png",
  "screenshots": ["./assets/screenshot1.png"],
  "readme": "./README.md",
  "changelog": "./CHANGELOG.md"
}
```

## How To Fix

Ensure all files referenced in marketplace.json exist at the specified paths relative to the marketplace.json file. Create any missing assets or correct the paths.

## Options

This rule does not have any configuration options.

## Related Rules

- [`plugin-missing-file`](/rules/plugin/plugin-missing-file)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/plugin/plugin-marketplace-files-not-found.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/plugin/plugin-marketplace-files-not-found.test.ts)

## Version

Available since: v0.2.0
