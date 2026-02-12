# skill-name

<RuleHeader description="Skill name must be lowercase-with-hyphens, under 64 characters, with no XML tags or reserved words" severity="error" :fixable="false" category="Skills" />

## Rule Details

Skill names serve as identifiers throughout the Claude Code ecosystem. This rule validates that the `name` field in SKILL.md frontmatter follows a strict format: lowercase letters and hyphens only, no longer than 64 characters, and free of XML tags or reserved words. Consistent naming prevents conflicts and ensures skills are discoverable and portable across projects.

### Incorrect

Name with uppercase letters

```yaml
---
name: My-Skill
---
```

Name with spaces

```yaml
---
name: my skill name
---
```

Name exceeding 64 characters

```yaml
---
name: this-is-an-extremely-long-skill-name-that-exceeds-the-sixty-four-character-limit
---
```

### Correct

Valid lowercase hyphenated name

```yaml
---
name: deploy-to-staging
---
```

Short single-word name

```yaml
---
name: lint
---
```

## How To Fix

Rename the skill to use only lowercase letters and hyphens. Remove any uppercase letters, spaces, underscores, or special characters. Ensure the name is under 64 characters.

## Options

This rule does not have any configuration options.

## Related Rules

- [`skill-name-directory-mismatch`](/rules/skills/skill-name-directory-mismatch)
- [`skill-description`](/rules/skills/skill-description)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-name.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-name.test.ts)

## Version

Available since: v0.2.0
