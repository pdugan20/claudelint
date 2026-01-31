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

````

### Correct

SKILL.md with code block examples:

````markdown
---
name: deploy
description: Deploys applications to production
---

# Deploy Skill

This skill handles deployment to production servers.

## Usage

```bash
# Deploy to production
claude deploy production us-east-1

# Deploy to staging
claude deploy staging us-west-2
```

## Arguments

- `environment` - Target environment (production, staging)
- `region` - AWS region for deployment
````

SKILL.md with Examples section:

````markdown
---
name: deploy
description: Deploys applications
---

# Deploy Skill

## Examples

Deploy to production:

```bash
./deploy.sh production
```

Deploy with custom configuration:

```bash
./deploy.sh staging --config custom.yml
```
````

## How To Fix

Add usage examples to SKILL.md:

1. Add a code block showing basic usage
2. Or add an "Examples" section with multiple use cases
3. Include expected output when helpful
4. Show common argument combinations

Example additions:

```markdown
## Usage

```bash
claude skill-name arg1 arg2
```

```

Or:

```markdown
## Examples

Basic usage:
```bash
./script.sh input.txt
```

Advanced usage:

```bash
./script.sh input.txt --verbose --output result.txt
```

```

## Options

This rule does not have configuration options.

## When Not To Use It

Consider disabling if your skill is self-explanatory with no arguments, examples exist in separate README.md (though SKILL.md is preferred), or your skill is internal and well-understood by the team. However, examples benefit all skills, even simple ones.

## Related Rules

- [skill-missing-changelog](./skill-missing-changelog.md) - Skills should track changes
- [skill-missing-version](./skill-missing-version.md) - Skills should have version numbers
- [skill-missing-comments](./skill-missing-comments.md) - Scripts should have comments

## Resources

- [Rule Implementation](../../src/rules/skills/skill-missing-examples.ts)
- [Rule Tests](../../tests/rules/skills/skill-missing-examples.test.ts)

## Version

Available since: v1.0.0
