---
description: "Skill model must be a string"
---

# skill-model

<RuleHeader description="Skill model must be a string" severity="error" :fixable="false" :configurable="false" category="Skills" />

## Rule Details

The `model` frontmatter field controls which Claude model executes the skill. Use a model alias such as `sonnet`, a full model identifier, or `inherit`. Available models depend on the account and provider. This rule validates the value type without rejecting custom model identifiers.

### Incorrect

Numeric model value

```yaml
---
name: deploy-app
model: 42
---
```

List instead of a model identifier

```yaml
---
name: deploy-app
model: [sonnet, opus]
---
```

### Correct

Valid model: sonnet

```yaml
---
name: deploy-app
model: sonnet
---
```

Valid model: inherit (uses parent context model)

```yaml
---
name: deploy-app
model: inherit
---
```

## How To Fix

Set `model` to a string containing a model alias, full identifier, or `inherit`. If you do not need to specify a model, remove the field entirely since it is optional.

## Options

This rule does not have any configuration options.

## Related Rules

- [`skill-name`](/rules/skills/skill-name)
- [`skill-version`](/rules/skills/skill-version)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-model.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-model.test.ts)

## Version

Available since: v0.2.0
