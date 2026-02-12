# skill-body-missing-usage-section

<RuleHeader description="SKILL.md body lacks a ## Usage section" severity="warn" :fixable="false" :configurable="false" category="Skills" />

## Rule Details

A dedicated `## Usage` section helps users and AI models understand how to invoke and interact with the skill. This rule checks the body content of SKILL.md files for a level-2 heading that starts with "Usage". Without this section, users must read through the entire file to figure out how to use the skill, reducing discoverability and usability.

### Incorrect

SKILL.md body without a Usage section

```markdown
---
name: deploy
description: Deploys the application
---

# Deploy

This skill deploys the app.

## Configuration

Set environment variables.
```

### Correct

SKILL.md body with a Usage section

```markdown
---
name: deploy
description: Deploys the application
---

# Deploy

## Usage

Run `/deploy staging` to deploy to the staging environment.

## Configuration

Set environment variables.
```

## How To Fix

Add a `## Usage` section to the body of your SKILL.md file. Include invocation examples, expected arguments, and any flags or options the skill supports.

## Options

This rule does not have any configuration options.

## Related Rules

- [`skill-body-too-long`](/rules/skills/skill-body-too-long)
- [`skill-body-word-count`](/rules/skills/skill-body-word-count)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-body-missing-usage-section.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-body-missing-usage-section.test.ts)

## Version

Available since: v0.2.0
