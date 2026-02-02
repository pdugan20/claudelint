# Skill Naming Guidelines

When creating custom skills for Claude Code, follow these naming best practices to avoid triggering issues and namespace pollution.

## The Problem with Generic Names

Generic skill names cause Claude Code to trigger skills on unrelated queries. For example, a skill named `format` might activate when you ask Claude to "format a date string" even though your skill formats configuration files.

This leads to:

- **Wrong skill triggers** - Skills activate on irrelevant queries
- **Namespace pollution** - Generic names conflict with common words
- **Confusion** - Unclear what the skill actually does

## Rule: skill-overly-generic-name (E10)

claudelint enforces naming best practices through the `skill-overly-generic-name` rule, which flags:

1. **Single-word verbs** - `format`, `validate`, `test`, `build`, `deploy`
2. **Generic keywords only** - `helper`, `utils`, `tool`, `manager`

## Good Naming Patterns

**Be specific about what the skill does:**

- Use suffixes to clarify scope:
  - `-all` for comprehensive actions (`validate-all`)
  - `-cc` for Claude Code operations (`format-cc`, `validate-cc-md`)
  - Specific targets: `-hooks`, `-settings`, `-skills`
- Multi-word names preferred over single words
- Include the domain or file type being processed

**Examples:**

```text
validate-all        (not: validate)
format-cc           (not: format)
validate-cc-md      (not: validate-agents-md)
optimize-cc-md      (not: optimize)
test-api-endpoints  (not: test)
build-docker-image  (not: build)
```

## Forbidden Patterns

**Reserved words** (Anthropic policy):

- Cannot use: `claude`, `anthropic`
- These are reserved for official Anthropic skills only

**Generic patterns that trigger the E10 rule:**

```text
format              Too generic - what does it format?
validate            Too generic - what does it validate?
test                Too generic - what does it test?
utils               Too generic - what utilities?
helper              Too generic - helps with what?
```

## How to Fix Violations

If you see a `skill-overly-generic-name` warning, make the name more specific:

```bash
skill-overly-generic-name: Skill name "format" is too generic
Fix: Rename to "format-cc", "format-config", or "format-markdown"

skill-overly-generic-name: Skill name "validate" is too generic
Fix: Rename to "validate-all", "validate-schemas", or "validate-api"

skill-overly-generic-name: Skill name "utils" is too generic
Fix: Rename to "project-utils", "date-utils", or describe specific function
```

## References

- [skill-overly-generic-name rule documentation](rules/skills/skill-overly-generic-name.md)
- [The Complete Guide to Building Skills for Claude](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf) (see page 11 on naming best practices)
