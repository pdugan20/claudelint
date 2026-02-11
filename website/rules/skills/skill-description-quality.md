# Rule: skill-description-quality

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: Skills

Skill description should start with an action verb and include sufficient context

## Rule Details

This rule warns when a skill description does not start with an action verb in imperative or third-person mood, or when the description is too brief to provide meaningful context. Good descriptions follow the pattern: `[Action Verb] [what it does] [context/technology]`.

The rule checks two quality criteria:

1. **Action verb start**: The first word must be a recognized action verb (e.g., "Validate", "Run", "Generate"). Both imperative ("Validate") and third-person ("Validates") forms are accepted.
2. **Sufficient context**: The description must contain at least 4 words to provide meaningful information about what the skill does and in what domain.

### Incorrect

Description not starting with an action verb:

```yaml
description: This skill validates project configuration files
```

Description too brief:

```yaml
description: Run all tests
```

Description with both problems:

```yaml
description: I do it
```

### Correct

Description with action verb and context:

```yaml
description: Validate Claude Code project configuration files
```

Third-person form also accepted:

```yaml
description: Validates project settings and reports issues
```

Using "Use this to" pattern:

```yaml
description: Use this to run the complete test suite for the project
```

## How To Fix

1. Start the description with an action verb like "Validate", "Run", "Generate", "Deploy", "Analyze"
2. Include at least 4 words describing what the skill does and the domain/technology it targets
3. Both imperative ("Validate") and third-person ("Validates") forms work

## Options

This rule does not have any configuration options.

## When Not To Use It

Disable this rule only if your skill descriptions intentionally use a non-standard format for a specific reason.

## Related Rules

- [skill-description](./skill-description.md) - Basic description validation (min length, no XML)
- [skill-description-missing-trigger](./skill-description-missing-trigger.md) - Checks for trigger phrases

## Resources

- [Rule Implementation](../../src/rules/skills/skill-description-quality.ts)
- [Rule Tests](../../tests/rules/skills/skill-description-quality.test.ts)

## Version

Available since: v1.0.0
