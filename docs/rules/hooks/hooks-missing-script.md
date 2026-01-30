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

## How To Fix

To resolve missing script errors:

1. **Create the script file**: If it doesn't exist, create it at the path specified in the hook

   ```bash
   mkdir -p .claude/scripts
   touch .claude/scripts/pre-tool.sh
   chmod +x .claude/scripts/pre-tool.sh
   ```

2. **Fix the path**: If the script exists elsewhere, update the `command` path in hooks.json

   ```json
   "command": "./path/to/actual/script.sh"
   ```

3. **Verify relative path**: Ensure the path is relative to `.claude/hooks.json`

4. **Check file permissions**: Ensure the script is executable

   ```bash
   chmod +x .claude/scripts/your-script.sh
   ```

Alternative: Use an inline command instead of a script file (not validated by this rule):

```json
"command": "echo 'Hook fired' >> hook.log"
```

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. Missing script files cause runtime errors when hooks fire, silent failures, debugging difficulties, and broken automation. Always ensure referenced scripts exist rather than disabling validation.

## Related Rules

- [hooks-invalid-event](./hooks-invalid-event.md) - Hook event name validation
- [hooks-invalid-config](./hooks-invalid-config.md) - Hook configuration validation

## Resources

- [Rule Implementation](../../src/rules/hooks/hooks-missing-script.ts)
- [Rule Tests](../../tests/validators/hooks.test.ts)
- [Hooks Documentation](https://github.com/anthropics/claude-code)

## Version

Available since: v1.0.0
