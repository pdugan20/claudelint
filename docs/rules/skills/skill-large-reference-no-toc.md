# Rule: skill-large-reference-no-toc

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: Cross-Reference

Large SKILL.md files should include a table of contents

## Rule Details

This rule triggers when a SKILL.md file body exceeds 100 lines but does not include a table of contents section. Large documentation files without a TOC are difficult to navigate, forcing users to scroll through the entire document to find relevant information.

The rule checks for a heading containing "table of contents", "toc", or "contents" (case-insensitive). Adding a TOC improves the user experience by providing quick navigation to specific sections.

### Incorrect

SKILL.md with 150 lines but no TOC:

```markdown
---
name: complex-skill
---

# Complex Skill

## Options

This rule does not have any configuration options.

## When Not To Use It

Consider disabling this rule if your documentation tool automatically generates a table of contents, or if your skill files are structured in a way where sequential reading is expected (like a tutorial). However, most reference-style documentation benefits from an explicit TOC.

## Related Rules

- [skill-body-too-long](./skill-body-too-long.md) - SKILL.md body should not exceed 500 lines
- [skill-time-sensitive-content](./skill-time-sensitive-content.md) - Avoid time-sensitive language

## Resources

- [Rule Implementation](../../src/validators/skills.ts#L543)
- [Rule Tests](../../tests/validators/skills.test.ts)

## Version

Available since: v1.0.0
