---
description: "Skill description should start with an action verb and include sufficient context"
---

# skill-description-quality

<RuleHeader description="Skill description should start with an action verb and include sufficient context" severity="warn" :fixable="false" :configurable="true" category="Skills" />

## Rule Details

Good skill descriptions follow the pattern "[Action Verb] [what it does] [context/technology]". This rule performs two checks: (1) the description must not start with an article, pronoun, or filler word (e.g., "The", "This", "A", "Just"), and (2) the description must contain at least 6 words (configurable via `minWords`) to provide meaningful context.

### Incorrect

Description starting with an article

```yaml
---
name: deploy
description: The deployment pipeline for production
---
```

Description too brief (fewer than 6 words)

```yaml
---
name: deploy
description: Deploy the app
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

## Related Rules

- [`skill-description`](/rules/skills/skill-description)
- [`skill-description-missing-trigger`](/rules/skills/skill-description-missing-trigger)
- [`skill-description-max-length`](/rules/skills/skill-description-max-length)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-description-quality.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-description-quality.test.ts)

## Version

Available since: v0.2.0
