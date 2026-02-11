# Rule: hooks-invalid-config

**Severity**: Error
**Fixable**: No
**Validator**: Hooks
**Recommended**: Yes

Hook configuration must be valid

## Rule Details

This rule validates the structure of hook definitions inside settings files. It checks that each hook handler has a valid type (command, prompt, or agent), includes the required field for its type, does not specify multiple handler fields simultaneously, and has a valid timeout value if one is provided. Malformed hook configurations will cause runtime errors when Claude Code attempts to execute them.

### Incorrect

Hook with invalid type

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "invalid",
        "command": "echo hello"
      }]
    }]
  }
}
```

Hook missing required command field

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command"
      }]
    }]
  }
}
```

Hook with multiple handler fields

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "echo hello",
        "prompt": "also do this"
      }]
    }]
  }
}
```

### Correct

Valid command hook

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": "echo Pre-tool check"
      }]
    }]
  }
}
```

Valid prompt hook with timeout

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write",
      "hooks": [{
        "type": "prompt",
        "prompt": "Review the written file",
        "timeout": 30000
      }]
    }]
  }
}
```

## How To Fix

Ensure each hook has a valid `type` (command, prompt, or agent) and includes the corresponding handler field. Remove any extra handler fields so only one is present. If a timeout is specified, ensure it is a positive number.

## Options

This rule does not have any configuration options.

## Related Rules

- [`agent-hooks-invalid-schema`](/rules/agents/agent-hooks-invalid-schema)
- [`agent-hooks`](/rules/agents/agent-hooks)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/hooks/hooks-invalid-config.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/hooks/hooks-invalid-config.test.ts)

## Version

Available since: v1.0.0
