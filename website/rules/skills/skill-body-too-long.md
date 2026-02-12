# skill-body-too-long

<RuleHeader description="SKILL.md body should not exceed 500 lines" severity="warn" :fixable="false" category="Skills" />

## Rule Details

This rule checks the body content of SKILL.md files (everything after the YAML frontmatter) and warns when it exceeds a configurable line count threshold. Overly long skill files are harder to maintain and slower for AI models to process. Detailed reference material should be extracted into separate files in a `references/` directory and linked from the main SKILL.md for progressive disclosure.

### Incorrect

SKILL.md with an excessively long body section

```yaml
---
name: my-skill
---

# My Skill

... (600+ lines of content) ...
```

### Correct

SKILL.md with a concise body that links to reference files

```yaml
---
name: my-skill
---

# My Skill

Core instructions here.

See [detailed API reference](references/api.md) for more.
```

## How To Fix

Move detailed documentation, long code examples, and reference material into separate files under a `references/` directory. Link to these files from your SKILL.md so the AI model can load them on demand.

## Options

Default options:

```json
{
  "maxLines": 500
}
```

Allow up to 800 lines in the body:

```json
{
  "maxLines": 800
}
```

Enforce a stricter 300-line limit:

```json
{
  "maxLines": 300
}
```

## When Not To Use It

Disable this rule if your skill genuinely requires a large inline body and splitting into reference files would harm usability.

## Related Rules

- [`skill-body-word-count`](/rules/skills/skill-body-word-count)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-body-too-long.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-body-too-long.test.ts)

## Version

Available since: v0.2.0
