# Rule: skill-missing-examples

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: Cross-Reference

SKILL.md lacks usage examples

## Rule Details

This rule triggers when SKILL.md lacks both code blocks (fenced with backticks) and a section titled "Example", "Examples", or "Usage". Examples are critical because they teach by showing (clearer than prose), reduce support burden (users self-serve), prevent misuse (show correct patterns), and speed adoption (copy-paste and adapt).

Without examples, users don't know how to invoke the skill, what arguments are accepted, or what output to expect. This hurts usability and adoption. The rule checks for either dedicated example sections or inline code blocks demonstrating usage.

### Incorrect

SKILL.md without examples:

````markdown
---
name: deploy
description: Deploys the application to production
---

# Deploy Skill

This skill handles deployment to production servers.

## Options

This rule does not have configuration options.

## When Not To Use It

Consider disabling if your skill is self-explanatory with no arguments, examples exist in separate README.md (though SKILL.md is preferred), or your skill is internal and well-understood by the team. However, examples benefit all skills, even simple ones.

## Related Rules

- [skill-missing-changelog](./skill-missing-changelog.md) - Skills should track changes
- [skill-missing-version](./skill-missing-version.md) - Skills should have version numbers
- [skill-missing-comments](./skill-missing-comments.md) - Scripts should have comments

## Resources

- [Implementation](../../../src/validators/skills.ts)
- [Tests](../../../tests/validators/skills.test.ts)

## Version

Available since: v1.0.0
