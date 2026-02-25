---
description: "Skill allowed-tools must be an array of tool names"
---

# skill-allowed-tools

<RuleHeader description="Skill allowed-tools must be an array of tool names" severity="error" :fixable="false" :configurable="false" category="Skills" />

## Rule Details

This rule validates that the `allowed-tools` frontmatter field is an array of valid tool name strings. Malformed values (e.g., a single string or non-string entries) will cause validation errors. The rule delegates to the Zod schema for format validation.

### Incorrect

allowed-tools is not an array

```yaml
---
name: deploy
description: Deploys the app
allowed-tools: Bash
---
```

### Correct

Valid allowed-tools array

```yaml
---
name: deploy
description: Deploys the app
allowed-tools:
  - Bash
  - Read
  - Write
---
```

## How To Fix

Ensure `allowed-tools` is a YAML array of tool name strings.

## Options

This rule does not have any configuration options.

## Related Rules

- [`skill-allowed-tools-not-used`](/rules/skills/skill-allowed-tools-not-used)
- [`skill-mcp-tool-qualified-name`](/rules/skills/skill-mcp-tool-qualified-name)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-allowed-tools.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-allowed-tools.test.ts)

## Version

Available since: v0.2.0
