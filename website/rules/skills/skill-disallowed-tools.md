---
description: "Skill disallowed-tools must be an array of tool names"
---

# skill-disallowed-tools

<RuleHeader description="Skill disallowed-tools must be an array of tool names" severity="error" :fixable="false" :configurable="false" category="Skills" />

## Rule Details

The `disallowed-tools` field specifies tools that the skill must not use during execution. It must be a YAML array of valid tool name strings. Malformed values (e.g., a single string or non-string entries) will cause validation errors. This rule delegates to the Zod schema for validation. Note that `disallowed-tools` and `allowed-tools` are mutually exclusive; that constraint is enforced by the skill-allowed-tools rule.

### Incorrect

disallowed-tools as a single string instead of an array

```yaml
---
name: read-only
description: Read-only analysis skill
disallowed-tools: Write
---
```

### Correct

Valid disallowed-tools array

```yaml
---
name: read-only
description: Read-only analysis skill
disallowed-tools:
  - Write
  - Bash
---
```

No disallowed-tools field (optional)

```yaml
---
name: deploy
description: Deploys the application
---
```

## How To Fix

Ensure the `disallowed-tools` field is a YAML array where each entry is a string tool name. Remove the field entirely if no tools need to be denied.

## Options

This rule does not have any configuration options.

## Related Rules

- [`skill-allowed-tools`](/rules/skills/skill-allowed-tools)
- [`skill-mcp-tool-qualified-name`](/rules/skills/skill-mcp-tool-qualified-name)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-disallowed-tools.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-disallowed-tools.test.ts)

## Version

Available since: v0.2.0
