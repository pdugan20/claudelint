# Rule: skill-frontmatter-unknown-keys

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: Best Practices

SKILL.md frontmatter should only contain recognized keys

## Rule Details

This rule triggers when SKILL.md contains YAML frontmatter keys that are not recognized by the Anthropic skill specification. Unknown keys may indicate typos, deprecated configuration, or misunderstanding of the skill format.

The recognized frontmatter keys are:

- `name` - Unique identifier for the skill
- `description` - Human-readable description of what the skill does
- `version` - Semantic version of the skill
- `tags` - Categories and labels for the skill
- `dependencies` - Required tools, libraries, or other skills
- `allowed-tools` - Whitelist of permitted tools
- `model` - Preferred Claude model for the skill
- `context` - Context requirements for the skill
- `agent` - Agent configuration settings

Any keys outside this list will trigger a warning, helping catch typos and configuration errors.

### Incorrect

Frontmatter with unknown keys:

```markdown
---
name: deploy
description: Deploys applications
vers: 1.0.0                          # Typo: should be 'version'
dependency: docker                   # Typo: should be 'dependencies' (array)
tag: deployment                      # Typo: should be 'tags' (array)
author: John Doe                      # Unknown key
license: MIT                          # Unknown key
maintained: true                      # Unknown key
---
```

Mixed recognized and unknown keys:

```markdown
---
name: api-client
description: Provides API utilities
version: 1.0.0
author-email: user@example.com       # Unknown key
repo-url: https://example.com        # Unknown key
maintainers:                         # Unknown key (not 'author')
  - John Doe
---
```

### Correct

Frontmatter with only recognized keys:

```markdown
---
name: deploy
description: Deploys applications to production servers
version: 1.0.0
tags:
  - deployment
  - production
dependencies:
  - docker
  - kubectl
---
```

Example with all recognized keys:

```markdown
---
name: api-client
description: Provides utilities for interacting with external APIs
version: 2.0.0
tags:
  - api
  - integration
  - http
dependencies:
  - curl
  - jq
allowed-tools:
  - bash
  - http
model: claude-opus-4
context: |
  This skill is designed for API integration tasks.
  Always validate API endpoints before use.
agent: true
---
```

Minimal valid frontmatter:

```markdown
---
name: simple-skill
description: Performs a simple operation
version: 1.0.0
---
```

## How To Fix

1. **Check for typos**: Review key names carefully against the recognized list
2. **Remove unknown keys**: Delete any keys not in the recognized list
3. **Use correct key names**: Ensure spelling and hyphenation match exactly

Common typos to watch for:

- `vers` → `version`
- `dependency` → `dependencies` (note: array format)
- `tag` → `tags` (note: array format)
- `tool` → `allowed-tools` (note: array format)
- `author` → Not recognized (use `context` if needed)
- `license` → Not recognized
- `repo` → Not recognized
- `maintainer` → Not recognized

Example fixes:

```markdown
# Before (with typos)
---
name: deploy
vers: 1.0.0
dependency: docker
tag: deployment
author: user@example.com
---

# After (corrected)
---
name: deploy
version: 1.0.0
dependencies:
  - docker
tags:
  - deployment
---
```

If you need to document additional metadata:

- Use the `context` field for implementation notes
- Add documentation to SKILL.md body
- Use `references/` directory for extended information

## Options

This rule does not have any configuration options.

## When Not To Use It

This is a helpful validation rule that catches configuration errors. Only disable if:

- You're using a custom extension with additional frontmatter fields
- You're migrating from a different skill format
- You understand the unknown keys and their purpose

In most cases, removing or correcting unknown keys is the proper fix.

## Related Rules

- [skill-missing-version](./skill-missing-version.md) - Skills should have version
- [skill-description](./skill-description.md) - Description validation
- [skill-tags](./skill-tags.md) - Tag format validation
- [skill-dependencies](./skill-dependencies.md) - Dependency array validation

## Resources

- [Rule Implementation](../../src/rules/skills/skill-frontmatter-unknown-keys.ts)
- [Rule Tests](../../tests/rules/skills/skill-frontmatter-unknown-keys.test.ts)
- [Anthropic Skills Specification](https://www.anthropic.com/news/building-effective-agents)
- [YAML Frontmatter Format](https://jekyllrb.com/docs/front-matter/)

## Version

Available since: v0.3.0
