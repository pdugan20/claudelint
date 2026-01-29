# Rule: hooks-missing-script

**Severity**: Error
**Fixable**: No
**Validator**: Hooks
**Category**: Cross-Reference

Hook scripts must reference existing files

## Rule Details

Hooks with `type: "command"` that reference relative file paths (starting with `./` or `../`) must point to existing files. The validator checks file existence for paths without shell operators, variables, or spaces indicating arguments.

This rule detects missing script files, wrong paths to existing scripts, and typos in filenames. Missing scripts cause hook failures at runtime, silent failures where hooks don't execute, and confusing debugging. The validator only checks relative file paths, not inline commands, PATH commands, absolute paths, or variable expansions.

**Validated:** Paths starting with `./` or `../` without operators, variables, or spaces
**Not Validated:** Inline commands (`echo`), PATH commands (`npm`), absolute paths (`/usr/bin`), variables (`${VAR}`)

### Incorrect

Script doesn't exist:

```json
{
  "hooks": [
    {
      "event": "PreToolUse",
      "type": "command",
      "command": "./scripts/pre-tool.sh"
    }
  ]
}
```

Wrong path:

```json
{
  "hooks": [
    {
      "event": "SessionStart",
      "type": "command",
      "command": "./hook.sh"
    }
  ]
}
```

### Correct

Script exists at path:

```json
{
  "hooks": [
    {
      "event": "PreToolUse",
      "type": "command",
      "command": "./scripts/pre-tool.sh"
    }
  ]
}
```

Directory structure:

```text
.claude/
├── hooks.json
└── scripts/
    └── pre-tool.sh
```

Using inline commands (not validated):

```json
{
  "hooks": [
    {
      "event": "SessionStart",
      "type": "command",
      "command": "echo 'Session started' >> session.log"
    }
  ]
}
```

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. Missing script files cause runtime errors when hooks fire, silent failures, debugging difficulties, and broken automation. Always ensure referenced scripts exist rather than disabling validation.

## Related Rules

- [hooks-invalid-event](./hooks-invalid-event.md) - Hook event name validation
- [hooks-invalid-config](./hooks-invalid-config.md) - Hook configuration validation

## Resources

- [Implementation](../../../src/validators/hooks.ts)
- [Tests](../../../tests/validators/hooks.test.ts)
- [Hooks Documentation](https://github.com/anthropics/claude-code)

## Version

Available since: v1.0.0
