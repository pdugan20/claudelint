# Rule: agent-name

**Severity**: Error
**Fixable**: No
**Validator**: Agents
**Category**: Schema Validation

Agent name must be lowercase-with-hyphens, under 64 characters, with no XML tags

## Rule Details

Agent names must follow a strict naming convention: lowercase letters with hyphens as separators, maximum 64 characters, and no XML/HTML tags. This ensures consistency, compatibility with file systems, and proper parsing.

The naming convention matches Claude Code's kebab-case standard used throughout the framework for agents, skills, and other components.

### Incorrect

Uppercase letters:

```markdown
---
name: CodeReviewer
description: Reviews code changes
---
```

Spaces instead of hyphens:

```markdown
---
name: code reviewer
description: Reviews code changes
---
```

Underscores instead of hyphens:

```markdown
---
name: code_reviewer
description: Reviews code changes
---
```

Contains XML tags:

```markdown
---
name: <agent>reviewer</agent>
description: Reviews code changes
---
```

Too long (over 64 characters):

```markdown
---
name: super-advanced-intelligent-code-reviewer-and-analyzer-with-many-features
description: Reviews code changes
---
```

### Correct

Proper kebab-case:

```markdown
---
name: code-reviewer
description: Reviews code changes
---
```

Single word:

```markdown
---
name: reviewer
description: Reviews code changes
---
```

Multiple hyphens:

```markdown
---
name: security-vulnerability-scanner
description: Scans for security vulnerabilities
---
```

## How To Fix

To fix agent name issues:

1. **Convert to lowercase**: Change all letters to lowercase
   - Wrong: `CodeReviewer`
   - Right: `code-reviewer`

2. **Replace separators with hyphens**: Convert spaces, underscores, or other separators
   - Wrong: `code_reviewer` or `code reviewer`
   - Right: `code-reviewer`

3. **Remove XML/HTML tags**: Strip all XML/HTML markup
   - Wrong: `<code>reviewer</code>`
   - Right: `reviewer`

4. **Shorten if needed**: Keep names under 64 characters
   - Abbreviate long words
   - Remove unnecessary words
   - Focus on the agent's primary purpose

5. **Match directory name**: Ensure the name matches the parent directory (see [agent-name-directory-mismatch](./agent-name-directory-mismatch.md))

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. Valid agent names are required for:

- File system compatibility across platforms
- Proper agent discovery and loading
- Consistent naming throughout Claude Code
- Integration with CLI commands
- URL-safe identifiers

Invalid names will cause runtime errors and prevent agents from loading correctly.

## Related Rules

- [agent-name-directory-mismatch](./agent-name-directory-mismatch.md) - Validates name matches directory
- [agent-description](./agent-description.md) - Validates description format
- [skill-name](../skills/skill-name.md) - Similar validation for skills

## Resources

- [Rule Implementation](../../src/rules/agents/agent-name.ts)
- [Rule Tests](../../tests/rules/agents/agent-name.test.ts)

## Version

Available since: v0.2.0
