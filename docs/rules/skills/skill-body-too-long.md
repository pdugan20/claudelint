# Rule: skill-body-too-long

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: File System

SKILL.md body should not exceed 500 lines

## Rule Details

This rule triggers when the body content of a SKILL.md file (excluding frontmatter and title) exceeds 500 lines. Long documentation files become difficult to maintain, navigate, and understand. Users struggle to find relevant information in lengthy documents.

The rule counts only the body lines after the second frontmatter delimiter (`---`) and the H1 title. A skill with 500+ lines should be split into multiple focused files or reorganized with a clear table of contents.

### Incorrect

SKILL.md with 600 lines of content:

```markdown
---
name: mega-skill
---

# Mega Skill

## Options

This rule does not have any configuration options.

## When Not To Use It

Consider disabling this rule if your skill is genuinely complex and requires comprehensive inline documentation. However, most skills should be broken down into focused, digestible pieces rather than single large files.

## Related Rules

- [skill-large-reference-no-toc](./skill-large-reference-no-toc.md) - Large skills should have a table of contents
- [skill-time-sensitive-content](./skill-time-sensitive-content.md) - Avoid time-sensitive language

## Resources

- [Rule Implementation](../../src/validators/skills.ts#L532)
- [Rule Tests](../../tests/validators/skills.test.ts)

## Version

Available since: v1.0.0
