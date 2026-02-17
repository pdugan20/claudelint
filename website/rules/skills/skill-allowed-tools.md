---
description: "Skill allowed-tools must be an array of tool names, cannot be used with disallowed-tools"
---

# skill-allowed-tools

<RuleHeader description="Skill allowed-tools must be an array of tool names, cannot be used with disallowed-tools" severity="error" :fixable="false" :configurable="false" category="Skills" />

## Rule Details

This rule enforces two constraints on the `allowed-tools` frontmatter field. First, it must be an array of valid tool name strings. Second, `allowed-tools` and `disallowed-tools` are mutually exclusive -- specifying both creates an ambiguous permission model. The rule delegates to the Zod schema for format validation and uses cross-field refinements to check mutual exclusivity.

### Incorrect

allowed-tools is not an array

```yaml
---
name: deploy
description: Deploys the app
allowed-tools: Bash
---
```

Both allowed-tools and disallowed-tools specified

```yaml
---
name: deploy
description: Deploys the app
allowed-tools:
  - Bash
  - Read
disallowed-tools:
  - WebFetch
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

Using only disallowed-tools (no conflict)

```yaml
---
name: deploy
description: Deploys the app
disallowed-tools:
  - WebFetch
---
```

## How To Fix

Ensure `allowed-tools` is a YAML array of tool name strings. If you also have `disallowed-tools`, remove one of the two fields. Use `allowed-tools` for an allowlist approach or `disallowed-tools` for a denylist approach, but not both.

## Options

This rule does not have any configuration options.

## Related Rules

- [`skill-disallowed-tools`](/rules/skills/skill-disallowed-tools)
- [`skill-allowed-tools-not-used`](/rules/skills/skill-allowed-tools-not-used)
- [`skill-mcp-tool-qualified-name`](/rules/skills/skill-mcp-tool-qualified-name)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-allowed-tools.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-allowed-tools.test.ts)

## Version

Available since: v0.2.0
