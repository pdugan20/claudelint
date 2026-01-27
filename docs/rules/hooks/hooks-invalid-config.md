# Invalid Configuration

Hook configuration is malformed.

## Rule Details

This rule enforces that hook configurations are properly structured with all required fields and valid values. Each hook must have a valid type and the corresponding required fields for that type.

Hook configuration errors include:

- Invalid hook type (must be "command", "prompt", or "agent")
- Missing required fields for the hook type
- Invalid tool names in matchers
- Invalid regex patterns in matchers

**Category**: Hooks
**Severity**: error
**Fixable**: No
**Since**: v1.0.0

### Violation Examples

Invalid hook type:

```json
{
  "hooks": [
    {
      "event": "PreToolUse",
      "type": "script",   Invalid type (must be: command, prompt, or agent)
      "command": "./pre-tool.sh"
    }
  ]
}
```

Missing required field (command type):

```json
{
  "hooks": [
    {
      "event": "PreToolUse",
      "type": "command"   Missing "command" field
    }
  ]
}
```

Missing required field (prompt type):

```json
{
  "hooks": [
    {
      "event": "PermissionRequest",
      "type": "prompt"   Missing "prompt" field
    }
  ]
}
```

Missing required field (agent type):

```json
{
  "hooks": [
    {
      "event": "SubagentStart",
      "type": "agent"   Missing "agent" field
    }
  ]
}
```

Invalid regex in matcher:

```json
{
  "hooks": [
    {
      "event": "PreToolUse",
      "type": "command",
      "command": "echo 'test'",
      "matcher": {
        "pattern": "[invalid("   Invalid regex pattern
      }
    }
  ]
}
```

### Correct Examples

Valid command hook:

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

Valid prompt hook:

```json
{
  "hooks": [
    {
      "event": "PermissionRequest",
      "type": "prompt",
      "prompt": "Custom permission prompt: {{tool}}"  
    }
  ]
}
```

Valid agent hook:

```json
{
  "hooks": [
    {
      "event": "SubagentStart",
      "type": "agent",
      "agent": "monitoring-agent"  
    }
  ]
}
```

Hook with valid matcher:

```json
{
  "hooks": [
    {
      "event": "PreToolUse",
      "type": "command",
      "command": "./scripts/validate-bash.sh",
      "matcher": {
        "tool": "Bash",
        "pattern": "^npm"   Valid regex
      }
    }
  ]
}
```

## Hook Types

### Type: "command"

Executes a shell command when the event fires.

**Required fields:**

- `command`: String - Command to execute

**Example:**

```json
{
  "event": "PreToolUse",
  "type": "command",
  "command": "./scripts/log-tool.sh"
}
```

### Type: "prompt"

Displays a custom prompt when the event fires.

**Required fields:**

- `prompt`: String - Prompt text to display

**Example:**

```json
{
  "event": "PermissionRequest",
  "type": "prompt",
  "prompt": "Allow {{tool}} to execute {{command}}?"
}
```

### Type: "agent"

Launches a subagent when the event fires.

**Required fields:**

- `agent`: String - Agent identifier

**Example:**

```json
{
  "event": "SubagentStart",
  "type": "agent",
  "agent": "monitoring-agent"
}
```

## Matcher Configuration

Matchers allow conditional hook execution based on tool name and pattern matching.

### Matcher Structure

```typescript
{
  tool?: string,      // Optional: tool name to match
  pattern?: string    // Optional: regex pattern to match command
}
```

### Valid Matcher Examples

Match specific tool:

```json
{
  "matcher": {
    "tool": "Bash"
  }
}
```

Match command pattern:

```json
{
  "matcher": {
    "pattern": "^git"  // Match git commands
  }
}
```

Match tool and pattern:

```json
{
  "matcher": {
    "tool": "Bash",
    "pattern": "^(npm|yarn|pnpm)"  // Match package managers
  }
}
```

### Invalid Matcher Examples

Invalid tool name:

```json
{
  "matcher": {
    "tool": "InvalidTool"   Unknown tool
  }
}
```

Invalid regex:

```json
{
  "matcher": {
    "pattern": "[unclosed"   Invalid regex
  }
}
```

## How To Fix

### Option 1: Fix invalid type

```json
# Before - invalid type
{
  "type": "script"
}

# After - valid type
{
  "type": "command"
}
```

### Option 2: Add required field

```json
# Before - missing command field
{
  "event": "PreToolUse",
  "type": "command"
}

# After - has command field
{
  "event": "PreToolUse",
  "type": "command",
  "command": "./scripts/pre-tool.sh"
}
```

### Option 3: Fix regex pattern

```json
# Before - invalid regex
{
  "matcher": {
    "pattern": "[unclosed"
  }
}

# After - valid regex
{
  "matcher": {
    "pattern": "^test"
  }
}
```

### Option 4: Fix tool name

```json
# Before - invalid tool
{
  "matcher": {
    "tool": "ShellCommand"
  }
}

# After - valid tool
{
  "matcher": {
    "tool": "Bash"
  }
}
```

## Complete Hook Examples

### Command hook with matcher

```json
{
  "hooks": [
    {
      "event": "PreToolUse",
      "type": "command",
      "command": "./scripts/validate-npm.sh",
      "matcher": {
        "tool": "Bash",
        "pattern": "^npm"
      }
    }
  ]
}
```

### Prompt hook

```json
{
  "hooks": [
    {
      "event": "PermissionRequest",
      "type": "prompt",
      "prompt": "This will execute: {{command}}\nProceed?"
    }
  ]
}
```

### Agent hook

```json
{
  "hooks": [
    {
      "event": "SubagentStart",
      "type": "agent",
      "agent": "performance-monitor"
    }
  ]
}
```

### Multi-hook configuration

```json
{
  "hooks": [
    {
      "event": "PreToolUse",
      "type": "command",
      "command": "echo 'Pre-tool' >> hooks.log"
    },
    {
      "event": "PostToolUse",
      "type": "command",
      "command": "echo 'Post-tool' >> hooks.log"
    },
    {
      "event": "PostToolUseFailure",
      "type": "command",
      "command": "./scripts/alert-failure.sh"
    }
  ]
}
```

## Common Mistakes

### Mistake 1: Wrong type for use case

```json
# Wrong - using "command" for a prompt
{
  "type": "command",
  "command": "Do you want to proceed?"  // This is a prompt, not a command
}

# Correct - using "prompt" type
{
  "type": "prompt",
  "prompt": "Do you want to proceed?"
}
```

### Mistake 2: Missing required field

```json
# Wrong - command type without command field
{
  "event": "PreToolUse",
  "type": "command",
  "script": "./pre-tool.sh"  // Wrong field name
}

# Correct - command field present
{
  "event": "PreToolUse",
  "type": "command",
  "command": "./pre-tool.sh"
}
```

### Mistake 3: Invalid regex escaping

```json
# Wrong - unescaped special characters
{
  "pattern": "file.txt"  // Dot should be escaped
}

# Correct - properly escaped
{
  "pattern": "file\\.txt"
}
```

## Validation Checklist

Before deploying hooks, verify:

- [ ] Hook type is one of: "command", "prompt", "agent"
- [ ] Required field for type is present and non-empty
- [ ] If using matcher, tool name is valid
- [ ] If using matcher, regex pattern is valid
- [ ] Event name is valid (checked by hooks-invalid-event rule)
- [ ] Script files exist (checked by hooks-missing-script rule)

## Options

This rule does not have any configuration options.

## When Not To Use It

You should **never** disable this rule. Invalid hook configuration will cause:

- Hook failures at runtime
- Silent configuration errors
- Unexpected behavior
- Difficult debugging

Always fix configuration issues rather than disabling this rule.

## Configuration

This rule should not be disabled, but if absolutely necessary:

```json
{
  "rules": {
    "hooks-invalid-config": "off"
  }
}
```

To change to a warning (not recommended):

```json
{
  "rules": {
    "hooks-invalid-config": "warning"
  }
}
```

## Related Rules

- [hooks-invalid-event](./hooks-invalid-event.md) - Hook event name must be valid
- [hooks-missing-script](./hooks-missing-script.md) - Hook script files must exist

## Resources

- [Claude Code Hooks Documentation](https://github.com/anthropics/claude-code)
- [Regular Expressions Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)

## Version

Available since: v1.0.0
