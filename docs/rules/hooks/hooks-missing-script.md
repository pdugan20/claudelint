# Rule: hooks-missing-script

**Severity**: Error
**Fixable**: No
**Validator**: Hooks
**Category**: File System

Validates that command hooks reference script files that exist relative to the hooks.json location.

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

1. **Create the missing script**: Use `mkdir -p .claude/scripts` and `touch .claude/scripts/hook.sh` with `chmod +x`
2. **Fix the path**: Correct path to match actual script location (e.g., `./hook.sh` → `./scripts/hook.sh`)
3. **Fix filename typo**: Correct spelling to match actual filename
4. **Use inline command**: Replace file reference with inline command if script is simple
5. **Ensure script is executable**: Run `chmod +x <script-path>` for shell scripts

**Path Resolution:** Paths are resolved relative to `hooks.json` location (typically `.claude/hooks.json`)

**What Gets Validated:**

- `./script.sh` ✓
- `../scripts/hook.sh` ✓
- `echo 'test'` ✗ (inline command)
- `/usr/bin/notify` ✗ (absolute path)
- `npm run build` ✗ (PATH command)
- `${SCRIPT_PATH}` ✗ (variable)

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
