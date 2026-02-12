# skill-body-word-count

<RuleHeader description="SKILL.md body exceeds recommended word count" severity="warn" :fixable="false" category="Skills" />

## Rule Details

This rule counts the words in the body of SKILL.md files (everything after the YAML frontmatter) and warns when the count exceeds a configurable threshold. Anthropic recommends keeping skills concise so AI models can process them efficiently. Lengthy content should be moved to reference files for progressive disclosure, allowing the model to load detailed information only when needed.

### Incorrect

SKILL.md with a body exceeding 5,000 words

```yaml
---
name: my-skill
---

# My Skill

... (5,000+ words of inline content) ...
```

### Correct

SKILL.md with concise body and references to external files

```yaml
---
name: my-skill
---

# My Skill

Brief overview and core instructions.

For details, see [reference docs](references/details.md).
```

## How To Fix

Extract verbose sections, long examples, and reference material into separate files under a `references/` directory. Keep the SKILL.md body focused on essential instructions and link to the extracted files.

## Options

Default options:

```json
{
  "maxWords": 5000
}
```

Allow up to 8,000 words in the body:

```json
{
  "maxWords": 8000
}
```

Enforce a stricter 3,000-word limit:

```json
{
  "maxWords": 3000
}
```

## When Not To Use It

Disable this rule if your skill requires extensive inline documentation and splitting into reference files would reduce clarity or usability.

## Related Rules

- [`skill-body-too-long`](/rules/skills/skill-body-too-long)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-body-word-count.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-body-word-count.test.ts)

## Version

Available since: v0.3.0
