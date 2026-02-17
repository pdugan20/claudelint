---
description: "Skill description exceeds maximum character length"
---

# skill-description-max-length

<RuleHeader description="Skill description exceeds maximum character length" severity="warn" :fixable="false" :configurable="true" category="Skills" />

## Rule Details

Long descriptions reduce readability in skill listings and menus. This rule checks the `description` field in SKILL.md frontmatter and reports when it exceeds the configurable maximum character count (default: 1024). Descriptions should be concise summaries; detailed documentation belongs in the body or reference files.

### Incorrect

Description exceeding 1024 characters

```yaml
---
name: deploy
description: This is an extremely long description that goes on and on about every detail of the deployment process including all edge cases, error handling, rollback procedures, monitoring setup, and more until it far exceeds the maximum allowed length...
---
```

### Correct

Concise description within the limit

```yaml
---
name: deploy
description: Deploys the application to the specified environment with rollback support
---
```

## How To Fix

Shorten the `description` field to a concise summary. Move detailed information to the SKILL.md body or reference files.

## Options

Default options:

```json
{
  "maxLength": 1024
}
```

Allow up to 2048 characters:

```json
{
  "maxLength": 2048
}
```

Enforce a strict 256-character limit:

```json
{
  "maxLength": 256
}
```

## When Not To Use It

Disable this rule if your skill requires a longer description for adequate trigger phrase coverage and you accept reduced readability in listings.

## Related Rules

- [`skill-description`](/rules/skills/skill-description)
- [`skill-description-quality`](/rules/skills/skill-description-quality)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-description-max-length.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-description-max-length.test.ts)

## Version

Available since: v0.3.0
