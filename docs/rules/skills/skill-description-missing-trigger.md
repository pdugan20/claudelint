# Rule: skill-description-missing-trigger

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: Best Practices

Skill description lacks trigger phrases that help Claude match user intent to the skill

## Rule Details

This rule warns when a skill description does not contain trigger phrases that guide Claude on when to invoke the skill. Trigger phrases such as "Use when", "Use for", or quoted example phrases help Claude's natural language matching determine the right skill for a user's request. Without them, skills may not be invoked even when the user's intent clearly matches.

Recognized trigger patterns include phrases starting with "Use when", "Use for", "Use to", "Invoke when", "Run when", or quoted phrases (single or double quotes) that serve as example invocations.

### Incorrect

Description without trigger phrases:

```markdown
---
name: deploy
description: Deploys applications to production servers
---
```

```markdown
---
name: format-code
description: Formats source code according to project style guidelines
---
```

### Correct

Description with "Use when" trigger:

```markdown
---
name: deploy
description: Deploys applications to production servers. Use when the user asks to ship, release, or push code to production.
---
```

Description with quoted trigger phrases:

```markdown
---
name: format-code
description: Formats source code according to project style guidelines. Use when asked to "format code", "fix formatting", or "lint and fix".
---
```

Description with "Use for" trigger:

```markdown
---
name: run-tests
description: Runs the project test suite. Use for running unit tests, integration tests, or the full test suite.
---
```

## How To Fix

Add trigger phrases to the skill description:

1. Append a sentence starting with "Use when" describing the situations that should trigger the skill
2. Or include quoted example phrases that a user might say
3. Or use "Use for" followed by a list of matching intents

Examples:

- `Deploys applications` -> `Deploys applications. Use when the user asks to deploy or release.`
- `Runs tests` -> `Runs tests. Use for "run tests", "test my code", or "check tests".`

## Options

This rule does not have any configuration options.

## When Not To Use It

Disable this rule if your skills are invoked exclusively through explicit slash commands and never through natural language matching. In most cases, adding trigger phrases improves skill discoverability and should be preferred.

## Related Rules

- [skill-description](./skill-description.md) - Skill description format and length validation
- [skill-description-max-length](./skill-description-max-length.md) - Skill description maximum length

## Resources

- [Rule Implementation](../../src/rules/skills/skill-description-missing-trigger.ts)
- [Rule Tests](../../tests/rules/skills/skill-description-missing-trigger.test.ts)

## Version

Available since: v0.2.0
