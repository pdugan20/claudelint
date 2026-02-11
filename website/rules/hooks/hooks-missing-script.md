# Rule: hooks-missing-script

**Severity**: Error
**Fixable**: No
**Validator**: Hooks
**Recommended**: Yes

Hook scripts must reference existing files

## Rule Details

This rule checks that hook commands pointing to relative script paths (starting with ./ or ../) reference files that actually exist on disk. It skips validation for inline shell commands (containing spaces or shell operators), commands with variable expansions, and absolute paths or commands expected to be in PATH. A missing script will cause the hook to fail at runtime, breaking the intended automation workflow.

### Incorrect

Hook referencing a script that does not exist

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "*",
        "hooks": [{ "type": "command", "command": "./scripts/missing.sh" }]
      }
    ]
  }
}
```

### Correct

Hook referencing an existing script file

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "*",
        "hooks": [{ "type": "command", "command": "./scripts/lint.sh" }]
      }
    ]
  }
}
```

## How To Fix

Verify the script path is correct and the file exists. Create the missing script file if needed, or update the command to point to the correct location.

## Options

This rule does not have any configuration options.

## Related Rules

- [`hooks-invalid-event`](/rules/hooks/hooks-invalid-event)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/hooks/hooks-missing-script.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/hooks/hooks-missing-script.test.ts)

## Version

Available since: v1.0.0
