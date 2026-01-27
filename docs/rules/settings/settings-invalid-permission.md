# Invalid Permission

Permission rule has invalid action or pattern.

## Rule Details

This rule enforces that permission rules in `settings.json` have valid actions and patterns. Permission rules control which tools Claude Code can use and under what conditions.

A valid permission rule must have:

- A valid `tool` name (e.g., "Bash", "Write", "Read")
- A valid `action`: "allow", "ask", or "deny"
- A non-empty `pattern` (if specified)

**Category**: Settings
**Severity**: error
**Fixable**: No
**Since**: v1.0.0

### Violation Examples

Invalid action:

```json
{
  "permissions": [
    {
      "tool": "Bash",
      "action": "grant"   Invalid action (must be: allow, ask, deny)
    }
  ]
}
```

Multiple invalid actions:

```json
{
  "permissions": [
    {
      "tool": "Write",
      "action": "permit"   Invalid
    },
    {
      "tool": "Read",
      "action": "approve"   Invalid
    }
  ]
}
```

Empty pattern:

```json
{
  "permissions": [
    {
      "tool": "Bash",
      "action": "allow",
      "pattern": ""   Empty pattern
    }
  ]
}
```

Invalid tool name:

```json
{
  "permissions": [
    {
      "tool": "InvalidTool",   Unknown tool
      "action": "allow"
    }
  ]
}
```

### Correct Examples

Valid permission rules:

```json
{
  "permissions": [
    {
      "tool": "Bash",
      "action": "allow",
      "pattern": "npm *"
    },
    {
      "tool": "Write",
      "action": "ask",
      "pattern": "src/**/*.ts"
    },
    {
      "tool": "Read",
      "action": "allow"
    }
  ]
}
```

Allow all bash commands:

```json
{
  "permissions": [
    {
      "tool": "Bash",
      "action": "allow"
    }
  ]
}
```

Ask for confirmation before writes:

```json
{
  "permissions": [
    {
      "tool": "Write",
      "action": "ask",
      "pattern": "**/*.ts"
    }
  ]
}
```

Deny dangerous operations:

```json
{
  "permissions": [
    {
      "tool": "Bash",
      "action": "deny",
      "pattern": "rm -rf *"
    }
  ]
}
```

## Valid Actions

### `"allow"`

Automatically allow the tool to be used:

```json
{
  "tool": "Read",
  "action": "allow",
  "pattern": "src/**/*.ts"
}
```

- Tool executes without prompting user
- Use for safe, non-destructive operations
- Be careful with broad patterns

### `"ask"`

Prompt user before using the tool:

```json
{
  "tool": "Write",
  "action": "ask",
  "pattern": "**/*.ts"
}
```

- User sees confirmation dialog
- User can approve or deny each use
- Recommended for potentially destructive operations

### `"deny"`

Block the tool from being used:

```json
{
  "tool": "Bash",
  "action": "deny",
  "pattern": "rm -rf /"
}
```

- Tool usage is prevented
- Use for dangerous or unwanted operations
- More specific denies override broader allows

## Valid Tools

Common tool names:

- `Bash` - Execute shell commands
- `Read` - Read files
- `Write` - Write files
- `Edit` - Edit files
- `Glob` - Find files by pattern
- `Grep` - Search file contents
- `WebFetch` - Fetch web content
- `WebSearch` - Search the web
- `Task` - Launch sub-agents

## Pattern Syntax

Patterns use glob syntax:

```json
{
  "pattern": "npm *"           // Match npm followed by anything
}
```

```json
{
  "pattern": "src/**/*.ts"     // Match all .ts files in src/
}
```

```json
{
  "pattern": "*.{js,ts}"       // Match .js or .ts files
}
```

```json
{
  "pattern": "**test**.js"     // Match files with "test" in name
}
```

## How To Fix

### Option 1: Fix invalid actions

```json
# Before - invalid action
{
  "tool": "Bash",
  "action": "grant"  // Invalid
}

# After - valid action
{
  "tool": "Bash",
  "action": "allow"  // Valid: allow, ask, or deny
}
```

### Option 2: Remove empty patterns

```json
# Before - empty pattern
{
  "tool": "Bash",
  "action": "allow",
  "pattern": ""  // Empty
}

# After - remove pattern or add value
{
  "tool": "Bash",
  "action": "allow"
  // No pattern means all uses
}
```

Or:

```json
{
  "tool": "Bash",
  "action": "allow",
  "pattern": "npm *"  // Specific pattern
}
```

### Option 3: Fix tool names

```json
# Before - invalid tool
{
  "tool": "ShellCommand",  // Wrong
  "action": "allow"
}

# After - correct tool name
{
  "tool": "Bash",  // Correct
  "action": "allow"
}
```

## Permission Priority

When multiple rules match, more specific rules take precedence:

```json
{
  "permissions": [
    {
      "tool": "Bash",
      "action": "allow"  // Default: allow all
    },
    {
      "tool": "Bash",
      "action": "deny",
      "pattern": "rm -rf *"  // Specific: deny dangerous commands
    }
  ]
}
```

Result: Most Bash commands allowed, but `rm -rf` is denied.

## Common Patterns

### Safe development workflow

```json
{
  "permissions": [
    {
      "tool": "Read",
      "action": "allow"
    },
    {
      "tool": "Write",
      "action": "ask",
      "pattern": "src/**/*"
    },
    {
      "tool": "Bash",
      "action": "allow",
      "pattern": "npm *"
    },
    {
      "tool": "Bash",
      "action": "deny",
      "pattern": "rm -rf *"
    }
  ]
}
```

### Production safety

```json
{
  "permissions": [
    {
      "tool": "Read",
      "action": "allow"
    },
    {
      "tool": "Write",
      "action": "ask"
    },
    {
      "tool": "Bash",
      "action": "ask"
    }
  ]
}
```

### Maximum security

```json
{
  "permissions": [
    {
      "tool": "Read",
      "action": "allow",
      "pattern": "src/**/*"
    },
    {
      "tool": "Write",
      "action": "deny"
    },
    {
      "tool": "Bash",
      "action": "deny"
    }
  ]
}
```

## Options

This rule does not have any configuration options.

## When Not To Use It

You should **never** disable this rule. Invalid permissions will cause:

- Settings to be ignored
- Fallback to default permissions
- Unexpected behavior
- Security vulnerabilities

Always fix invalid permission rules rather than disabling this rule.

## Configuration

This rule should not be disabled, but if absolutely necessary:

```json
{
  "rules": {
    "settings-invalid-permission": "off"
  }
}
```

To change to a warning (not recommended):

```json
{
  "rules": {
    "settings-invalid-permission": "warning"
  }
}
```

## Related Rules

- [settings-invalid-schema](./settings-invalid-schema.md) - Settings file schema validation
- [settings-invalid-env-var](./settings-invalid-env-var.md) - Environment variable validation

## Resources

- [Claude Code Permissions Documentation](https://github.com/anthropics/claude-code)
- [Glob Pattern Syntax](https://github.com/isaacs/node-glob#glob-primer)

## Version

Available since: v1.0.0
