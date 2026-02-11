# Rule: skill-description-quality

**Severity**: Warn
**Fixable**: No
**Validator**: Skills

Skill description should start with an action verb and include sufficient context

## Rule Details

Good skill descriptions follow the pattern "[Action Verb] [what it does] [context/technology]". This rule performs two checks: (1) the description must start with a recognized action verb in imperative or third-person form (e.g., "Deploy", "Validates", "Run"), and (2) the description must contain at least 4 words to provide meaningful context. This consolidates the former skill-description-structure and skill-description-missing-context rules.

### Incorrect

Description not starting with an action verb

```yaml
---
name: deploy
description: The deployment pipeline for production
---
```

Description too brief (fewer than 4 words)

```yaml
---
name: deploy
description: Deploy app
---
```

### Correct

Starts with action verb and has sufficient context

```yaml
---
name: deploy
description: Deploys the application to the staging environment
---
```

Third-person verb form with technology context

```yaml
---
name: lint
description: Validates TypeScript code against project style guidelines
---
```

## How To Fix

Rewrite the description to start with an imperative or third-person action verb (e.g., "Deploy", "Generate", "Validates") and include enough words to describe what the skill does and what technology or domain it targets.

## Options

This rule does not have any configuration options.

## Related Rules

- [`skill-description`](/rules/skills/skill-description)
- [`skill-description-missing-trigger`](/rules/skills/skill-description-missing-trigger)
- [`skill-description-max-length`](/rules/skills/skill-description-max-length)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-description-quality.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-description-quality.test.ts)

## Version

Available since: v1.0.0
