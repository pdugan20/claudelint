# Missing Script

Hook references a non-existent script file.

## Rule Details

This rule enforces that hooks with `type: "command"` reference script files that actually exist. When a hook specifies a command as a relative file path (e.g., `./scripts/hook.sh`), the validator checks that the file exists relative to the `hooks.json` file.

Missing script files will cause:

- Hook failures at runtime
- Silent hook failures (hook won't execute)
- Confusing debugging when hooks don't fire
- Broken automation

**Category**: Hooks
**Severity**: error
**Fixable**: No
**Since**: v1.0.0

### Violation Examples

Script file doesn't exist:

```json
{
  "hooks": [
    {
      "event": "PreToolUse",
      "type": "command",
      "command": "./scripts/pre-tool.sh"   File doesn't exist
    }
  ]
}
```

Wrong path to existing script:

```json
{
  "hooks": [
    {
      "event": "SessionStart",
      "type": "command",
      "command": "./hook.sh"   Script is in ./scripts/hook.sh
    }
  ]
}
```

Typo in filename:

```json
{
  "hooks": [
    {
      "event": "PostToolUse",
      "type": "command",
      "command": "./scripts/post-tool-cleanup.sh"   Typo: should be post-tool.sh
    }
  ]
}
```

### Correct Examples

Script exists at specified path:

```json
{
  "hooks": [
    {
      "event": "PreToolUse",
      "type": "command",
      "command": "./scripts/pre-tool.sh"   File exists
    }
  ]
}
```

With directory structure:

```text
.claude/
├── hooks.json
└── scripts/
    └── pre-tool.sh   Referenced file exists
```

Using inline commands (not validated):

```json
{
  "hooks": [
    {
      "event": "SessionStart",
      "type": "command",
      "command": "echo 'Session started' >> session.log"   Inline command, not a file
    }
  ]
}
```

Using PATH commands (not validated):

```json
{
  "hooks": [
    {
      "event": "PostToolUse",
      "type": "command",
      "command": "notify-send 'Tool completed'"   Command in PATH, not validated
    }
  ]
}
```

## What Gets Validated

### File paths (validated)

```json
{
  "command": "./script.sh"        // Relative path - VALIDATED
}
```

```json
{
  "command": "../scripts/hook.sh" // Relative path - VALIDATED
}
```

### Commands (not validated)

```json
{
  "command": "echo 'Hello'"       // Inline command - NOT validated
}
```

```json
{
  "command": "npm run build"      // Command with args - NOT validated
}
```

```json
{
  "command": "/usr/bin/notify"    // Absolute path - NOT validated
}
```

```json
{
  "command": "${SCRIPT_PATH}"     // Variable expansion - NOT validated
}
```

The validator only checks files for:

- Paths starting with `./` or `../`
- Without shell operators (`&&`, `||`, `|`)
- Without variables (`$`, `${}`)
- Without spaces (indicating arguments)

## Path Resolution

Paths are resolved relative to the `hooks.json` file location:

```text
.claude/
├── hooks.json                 # Hook config here
├── scripts/
│   └── pre-tool.sh           # ./scripts/pre-tool.sh
└── shared/
    └── common.sh             # ./shared/common.sh
```

```json
{
  "hooks": [
    {
      "event": "PreToolUse",
      "type": "command",
      "command": "./scripts/pre-tool.sh"  // Relative to .claude/
    }
  ]
}
```

## How To Fix

### Option 1: Create the missing script

```bash
# Create the directory if needed
mkdir -p .claude/scripts

# Create the script
touch .claude/scripts/pre-tool.sh
chmod +x .claude/scripts/pre-tool.sh

# Add content
cat > .claude/scripts/pre-tool.sh << 'EOF'
#!/usr/bin/env bash
echo "Pre-tool hook executed"
EOF
```

### Option 2: Fix the path

```json
# Before - wrong path
{
  "command": "./hook.sh"
}

# After - correct path
{
  "command": "./scripts/hook.sh"
}
```

### Option 3: Fix the filename

```json
# Before - typo
{
  "command": "./scripts/pre-tool-check.sh"
}

# After - correct filename
{
  "command": "./scripts/pre-tool.sh"
}
```

### Option 4: Use inline command instead

If you don't need a separate file:

```json
# Before - file reference
{
  "command": "./scripts/simple-log.sh"
}

# After - inline command
{
  "command": "echo 'Tool used' >> tool-usage.log"
}
```

## Example Hook Setup

### 1. Create script directory

```bash
mkdir -p .claude/scripts
```

### 2. Create hook script

```bash
cat > .claude/scripts/pre-tool-validator.sh << 'EOF'
#!/usr/bin/env bash

# Pre-tool validation hook
# Validates environment before tool execution

set -e

echo "[Hook] Pre-tool validation starting..."

# Check required environment variables
if [ -z "$PROJECT_ROOT" ]; then
  echo "Error: PROJECT_ROOT not set"
  exit 1
fi

# Validate project state
if [ ! -f "package.json" ]; then
  echo "Error: Not in a Node.js project"
  exit 1
fi

echo "[Hook] Pre-tool validation passed"
EOF

chmod +x .claude/scripts/pre-tool-validator.sh
```

### 3. Configure hook

```json
{
  "hooks": [
    {
      "event": "PreToolUse",
      "type": "command",
      "command": "./scripts/pre-tool-validator.sh"
    }
  ]
}
```

### 4. Verify setup

```bash
# Check file exists
ls -la .claude/scripts/pre-tool-validator.sh

# Test script
.claude/scripts/pre-tool-validator.sh

# Validate hooks config
claudelint check-hooks
```

## Common Patterns

### Development logging

```json
{
  "hooks": [
    {
      "event": "PreToolUse",
      "type": "command",
      "command": "./scripts/log-tool-start.sh"
    },
    {
      "event": "PostToolUse",
      "type": "command",
      "command": "./scripts/log-tool-end.sh"
    }
  ]
}
```

### Error handling

```json
{
  "hooks": [
    {
      "event": "PostToolUseFailure",
      "type": "command",
      "command": "./scripts/handle-error.sh"
    }
  ]
}
```

### Session management

```json
{
  "hooks": [
    {
      "event": "SessionStart",
      "type": "command",
      "command": "./scripts/init-session.sh"
    },
    {
      "event": "SessionEnd",
      "type": "command",
      "command": "./scripts/cleanup-session.sh"
    }
  ]
}
```

## Options

This rule does not have any configuration options.

## When Not To Use It

You should **never** disable this rule. Missing script files will cause:

- Runtime errors when hooks fire
- Silent failures
- Debugging difficulties
- Broken automation

Always ensure referenced scripts exist rather than disabling this rule.

## Configuration

This rule should not be disabled, but if absolutely necessary:

```json
{
  "rules": {
    "hooks-missing-script": "off"
  }
}
```

To change to a warning (not recommended):

```json
{
  "rules": {
    "hooks-missing-script": "warning"
  }
}
```

## Related Rules

- [hooks-invalid-event](./hooks-invalid-event.md) - Hook event name must be valid
- [hooks-invalid-config](./hooks-invalid-config.md) - Hook configuration must be valid

## Resources

- [Claude Code Hooks Documentation](https://github.com/anthropics/claude-code)
- [Bash Scripting Guide](https://www.gnu.org/software/bash/manual/bash.html)

## Version

Available since: v1.0.0
