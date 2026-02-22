---
description: "Tools listed in allowed-tools are never referenced in the skill body"
---

# skill-allowed-tools-not-used

<RuleHeader description="Tools listed in allowed-tools are never referenced in the skill body" severity="warn" :fixable="false" :configurable="false" category="Skills" />

## Rule Details

This rule checks the `allowed-tools` frontmatter array against the SKILL.md body content. If none of the listed tools appear anywhere in the body, the list is likely stale or copy-pasted. If at least one tool is referenced, the list is considered intentional. Supports both plain tool names and MCP-qualified names (`mcp__server__tool`).

### Incorrect

Tools listed in allowed-tools but none referenced in body

```yaml
---
name: build
description: Builds the project
allowed-tools:
  - Bash
  - Read
  - WebFetch
---

## Usage

Run the build pipeline and check the output for errors.
```

### Correct

All allowed tools are referenced in the body

```yaml
---
name: build
description: Builds the project
allowed-tools:
  - Bash
  - Read
---

## Usage

Use `Bash` to run the build command.
Use `Read` to inspect configuration files.
```

## How To Fix

Remove unused tools from the `allowed-tools` list, or add instructions in the skill body that reference the tool so the AI model knows when and how to use it.

## Options

This rule does not have any configuration options.

## Related Rules

- [`skill-allowed-tools`](/rules/skills/skill-allowed-tools)
- [`skill-mcp-tool-qualified-name`](/rules/skills/skill-mcp-tool-qualified-name)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-allowed-tools-not-used.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-allowed-tools-not-used.test.ts)

## Version

Available since: v0.2.0
