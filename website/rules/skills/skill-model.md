# Rule: skill-model

**Severity**: Error
**Fixable**: No
**Validator**: Skills
**Recommended**: Yes

Skill model must be one of: sonnet, opus, haiku, inherit

## Rule Details

The `model` frontmatter field controls which Claude model executes the skill. Only a fixed set of values is valid: `sonnet`, `opus`, `haiku`, or `inherit`. An invalid model value will cause the skill to fail at runtime. This rule validates the field against the allowed values defined in the skill frontmatter schema.

### Incorrect

Invalid model value

```yaml
---
name: deploy-app
model: gpt-4
---
```

Misspelled model name

```yaml
---
name: deploy-app
model: sonnett
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

Set the `model` field to one of the allowed values: `sonnet`, `opus`, `haiku`, or `inherit`. If you do not need to specify a model, remove the field entirely since it is optional.

## Options

This rule does not have any configuration options.

## Related Rules

- [`skill-name`](/rules/skills/skill-name)
- [`skill-version`](/rules/skills/skill-version)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-model.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-model.test.ts)

## Version

Available since: v1.0.0
