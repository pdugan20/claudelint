# Rule: skill-description

**Severity**: Error
**Fixable**: No
**Validator**: Skills
**Recommended**: Yes

Skill description must be at least 10 characters, written in third person, with no XML tags

## Rule Details

Every skill should include a meaningful description so users and Claude understand its purpose. This rule validates that the `description` field in SKILL.md frontmatter is present, at least 10 characters long, written in third person, and free of XML tags. A good description improves discoverability and helps users decide whether a skill fits their needs.

### Incorrect

Description too short

```yaml
---
name: deploy
description: Deploys
---
```

Description with XML tags

```yaml
---
name: deploy
description: <b>Deploys the app</b> to production
---
```

### Correct

Clear third-person description

```yaml
---
name: deploy
description: Deploys the application to the staging environment
---
```

Detailed description

```yaml
---
name: test-runner
description: Runs the full test suite and reports coverage metrics
---
```

## How To Fix

Add or update the `description` field in your SKILL.md frontmatter. Use at least 10 characters, write in third person (e.g., "Deploys the app" not "I deploy the app"), and avoid HTML or XML markup.

## Options

This rule does not have any configuration options.

## Related Rules

- [`skill-name`](/rules/skills/skill-name)
- [`skill-description-quality`](/rules/skills/skill-description-quality)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-description.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-description.test.ts)

## Version

Available since: v1.0.0
