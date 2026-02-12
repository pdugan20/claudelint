# Hooks Integration

claudelint provides hooks that can automatically validate your Claude Code project at key moments in your workflow.

## SessionStart Hook

The SessionStart hook runs validation when a Claude Code session starts, giving you immediate feedback about your project's health.

### Setup

Create `.claude/hooks/hooks.json` in your project:

```json
{
  "hooks": [
    {
      "event": "session-start",
      "type": "command",
      "command": "claudelint check-all --format compact",
      "description": "Validate Claude Code project files at session start"
    }
  ]
}
```

### What It Does

When you start a Claude Code session, the hook will:

1. Run `claudelint check-all` automatically
2. Show a compact summary of errors and warnings
3. Complete in ~20-120ms depending on project size

### Output Formats

Choose the format that works best for you:

**Compact format (recommended for hooks):**

```json
"command": "claudelint check-all --format compact"
```

Output:

```text
.claude/skills/my-skill/SKILL.md:15:1 - Warning: Missing CHANGELOG.md [missing-changelog]
.claude/settings.json:8:3 - Error: Invalid tool name "CustomTool" [unknown-tool]
```

**Stylish format (more detailed):**

```json
"command": "claudelint check-all --format stylish"
```

**JSON format (for programmatic parsing):**

```json
"command": "claudelint check-all --format json"
```

### Silent Mode

If you only want to see errors (suppress warnings):

```json
"command": "claudelint check-all --format compact 2>&1 | grep -E '^.*Error:'"
```

Or configure rules in `.claudelintrc.json` to turn off specific warnings.

## Performance

Hook performance based on project size:

| Skills | Files | Typical Time |
|--------|-------|--------------|
| 5-10   | 20-50 | 20-40ms      |
| 10-20  | 50-100| 40-60ms      |
| 20-50  | 100-200| 60-120ms    |
| 50+    | 200+  | 120-200ms    |

The SessionStart hook is fast enough that it won't noticeably delay session startup.

## Disabling the Hook

To temporarily disable validation:

1. **Remove the hook** - Delete `.claude/hooks/hooks.json`
2. **Comment out the hook** - Not supported in JSON, but you can rename the file to `hooks.json.disabled`
3. **Configure rules** - Set rules to `"off"` in `.claudelintrc.json`

## Hook Examples

### Basic Validation

Run all validators with compact output:

```json
{
  "hooks": [
    {
      "event": "session-start",
      "type": "command",
      "command": "claudelint check-all --format compact"
    }
  ]
}
```

### Validation with Explanations

Show detailed explanations for any issues:

```json
{
  "hooks": [
    {
      "event": "session-start",
      "type": "command",
      "command": "claudelint check-all --explain"
    }
  ]
}
```

### Strict Mode

Treat warnings as errors:

```json
{
  "hooks": [
    {
      "event": "session-start",
      "type": "command",
      "command": "claudelint check-all --warnings-as-errors"
    }
  ]
}
```

### Validate Specific Components

Only validate CLAUDE.md files:

```json
{
  "hooks": [
    {
      "event": "session-start",
      "type": "command",
      "command": "claudelint check-claude-md"
    }
  ]
}
```

### Multiple Hooks

Run validation and formatting:

```json
{
  "hooks": [
    {
      "event": "session-start",
      "type": "command",
      "command": "claudelint check-all --format compact"
    },
    {
      "event": "session-start",
      "type": "command",
      "command": "claudelint format --check"
    }
  ]
}
```

## Best Practices

1. **Use compact format** - Less verbose output for hooks
2. **Fast validation** - SessionStart hooks should complete in <200ms
3. **Configure rules** - Turn off noisy warnings in `.claudelintrc.json`
4. **Test first** - Run commands manually before adding to hooks
5. **Version control** - Commit `.claude/hooks/hooks.json` to your repo

## Troubleshooting

### Hook doesn't run

- Check that `claudelint` is installed globally or in your project
- Verify the command works when run manually
- Check hook syntax in `.claude/hooks/hooks.json`

### Hook is too slow

- Use `--fast` mode: `claudelint check-all --fast`
- Disable expensive checks in `.claudelintrc.json`
- Use `.claudelintignore` to skip large directories

### Too many warnings

- Configure rules in `.claudelintrc.json`
- Use `--format compact` to reduce verbosity
- Set `maxWarnings` threshold in config

## See Also

- [Configuration Guide](/guide/configuration) - Customize validation rules
- [CLI Reference](/guide/cli-reference) - All available commands and flags
- [Rules Reference](/rules/overview) - What gets validated
