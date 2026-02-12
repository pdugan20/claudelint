# settings-file-path-not-found

<RuleHeader description="Referenced file path does not exist" severity="warn" :fixable="false" :configurable="false" category="Settings" />

## Rule Details

This rule validates that file paths in `settings.json` properties such as `apiKeyHelper` and `outputStyle` point to files that actually exist on disk. Missing files will cause runtime errors when Claude Code tries to use them. Paths containing variable expansion syntax (e.g., `${HOME}/...`) are skipped since they cannot be resolved statically.

### Incorrect

Settings referencing a non-existent script

```json
{
  "apiKeyHelper": "/scripts/get-api-key.sh",
  "outputStyle": "./styles/missing-style.md"
}
```

### Correct

Settings referencing existing files

```json
{
  "apiKeyHelper": "./scripts/get-api-key.sh",
  "outputStyle": ".claude/styles/concise.md"
}
```

Settings using variable expansion (skipped)

```json
{
  "apiKeyHelper": "${HOME}/.config/claude/api-key-helper.sh"
}
```

## How To Fix

Verify that the file paths in `settings.json` are correct and the files exist. Check for typos in the path, ensure the file has been created, and confirm the path is relative to the correct base directory.

## Options

This rule does not have any configuration options.

## Related Rules

- [`settings-invalid-env-var`](/rules/settings/settings-invalid-env-var)
- [`settings-permission-empty-pattern`](/rules/settings/settings-permission-empty-pattern)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/settings/settings-file-path-not-found.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/settings/settings-file-path-not-found.test.ts)

## Version

Available since: v0.2.0
