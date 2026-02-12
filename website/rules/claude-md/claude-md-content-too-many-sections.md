# claude-md-content-too-many-sections

<RuleHeader description="CLAUDE.md has too many sections making it hard to navigate" severity="warn" :fixable="false" category="CLAUDE.md" />

## Rule Details

Large CLAUDE.md files with many sections become difficult for both humans and Claude Code to navigate. When the number of markdown headings exceeds the configured threshold (default: 20), this rule warns that the file should be reorganized. The recommended approach is to split content into topic-specific files under `.claude/rules/` and use `@import` directives to include them. This keeps each file focused and easier to maintain. The rule only checks top-level CLAUDE.md files, not files already in the `.claude/rules/` directory.

### Incorrect

A CLAUDE.md with too many sections (over 20 headings)

```markdown
# Project Instructions

## Git Workflow
...

## Code Style
...

## Testing
...

## API Guidelines
...

## Database
...

## Auth
...

## Logging
...

## Error Handling
...

## Deployment
...

## Monitoring
...

## Security
...

## Performance
...

## Accessibility
...

## i18n
...

## CI/CD
...

## Docker
...

## Kubernetes
...

## AWS
...

## Terraform
...

## Documentation
...

## Reviews
...
```

### Correct

A CLAUDE.md that imports topic-specific rule files

```markdown
# Project Instructions

## Overview

Brief project description.

@import .claude/rules/git.md
@import .claude/rules/code-style.md
@import .claude/rules/testing.md
@import .claude/rules/deployment.md
```

## How To Fix

Split the CLAUDE.md file into smaller, topic-specific files in the `.claude/rules/` directory. Use `@import` directives in the main CLAUDE.md to include them. For example, move git-related instructions to `.claude/rules/git.md` and testing guidelines to `.claude/rules/testing.md`.

## Options

Default options:

```json
{
  "maxSections": 20
}
```

Allow up to 30 sections before warning:

```json
{
  "maxSections": 30
}
```

Strict mode: warn after 10 sections:

```json
{
  "maxSections": 10
}
```

## When Not To Use It

Disable this rule if your project intentionally maintains a single large CLAUDE.md file and the team finds the flat structure easier to manage.

## Related Rules

- [`claude-md-import-missing`](/rules/claude-md/claude-md-import-missing)
- [`claude-md-size-warning`](/rules/claude-md/claude-md-size-warning)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/claude-md/claude-md-content-too-many-sections.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/claude-md/claude-md-content-too-many-sections.test.ts)

## Version

Available since: v0.2.0
