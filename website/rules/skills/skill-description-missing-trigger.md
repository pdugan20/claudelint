---
description: "Skill description should include trigger phrases so the model knows when to load the skill"
---

# skill-description-missing-trigger

<RuleHeader description="Skill description should include trigger phrases so the model knows when to load the skill" severity="warn" :fixable="false" :configurable="false" category="Skills" />

## Rule Details

Per the Anthropic skills guide, descriptions should include trigger phrases such as "Use when...", "Use for...", "Use this to...", or quoted trigger words so the AI model can determine when to automatically load and invoke the skill. Without trigger phrases, the model may not activate the skill at the right time. The rule checks for common trigger patterns including "use when", "use for", "use this", "use to", and quoted phrases.

### Incorrect

Description without any trigger phrases

```yaml
---
name: deploy
description: Deploys the application to production environments
---
```

### Correct

Description with "Use when" trigger phrase

```yaml
---
name: deploy
description: Deploys the application. Use when the user asks to ship or release code.
---
```

Description with quoted trigger phrases

```yaml
---
name: deploy
description: Deploys the application. Responds to "deploy", "ship", or "release" commands.
---
```

Description with "Use for" trigger phrase

```yaml
---
name: lint
description: Use for validating code style and catching common errors
---
```

## How To Fix

Add trigger phrases to the description. Use patterns like "Use when the user asks to...", "Use for validating...", or include quoted trigger words that should activate the skill.

## Options

This rule does not have any configuration options.

## Related Rules

- [`skill-description`](/rules/skills/skill-description)
- [`skill-description-quality`](/rules/skills/skill-description-quality)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-description-missing-trigger.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-description-missing-trigger.test.ts)

## Version

Available since: v0.2.0
