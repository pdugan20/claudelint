# Rule: claude-md-content-too-many-sections

**Severity**: Warning
**Fixable**: No
**Validator**: CLAUDE.md
**Category**: File System

CLAUDE.md has too many sections making it hard to navigate

## Rule Details

This rule warns when a CLAUDE.md file contains too many markdown heading sections (default: 20). Files with excessive sections become difficult to navigate, understand, and maintain. This is a signal that the file should be organized into separate topic-specific files using the import system.

The rule counts all markdown headings (`# Heading`, `## Heading`, etc.) in the main CLAUDE.md file. It does not count headings in imported files. Having too many sections suggests poor organization and makes it hard for developers to find specific guidelines.

### Incorrect

CLAUDE.md with 25 sections:

```markdown
# Project Guidelines

## Git Workflow
## Branch Naming
## Commit Messages
## Pull Requests
## Code Review
## API Design
## REST Endpoints
## Authentication
## Error Handling
## Testing Strategy
## Unit Tests
## Integration Tests
## E2E Tests
## Deployment
## CI/CD
## Environment Variables
## Logging
## Monitoring
## Database
## Migrations
## Performance
## Security
## Documentation
## Troubleshooting
## FAQ
```

### Correct

CLAUDE.md with organized imports:

```markdown
# Project Guidelines

Import: @.claude/rules/git-workflow.md
Import: @.claude/rules/api-design.md
Import: @.claude/rules/testing.md
Import: @.claude/rules/deployment.md
Import: @.claude/rules/database.md
Import: @.claude/rules/security.md

## Quick Reference

Key principles and links to detailed guidelines above.
```

Each imported file contains related sections:

```markdown
# .claude/rules/git-workflow.md

## Branch Naming
## Commit Messages
## Pull Requests
## Code Review
```

## How To Fix

To reduce section count:

1. **Identify logical groupings** of related sections:

   ```text
   Git-related: workflow, branches, commits, PRs
   API-related: design, endpoints, auth, errors
   Testing-related: unit, integration, e2e
   ```

2. **Create separate files** for each group:

   ```bash
   mkdir -p .claude/rules
   # Extract sections to files
   touch .claude/rules/git-workflow.md
   touch .claude/rules/api-design.md
   touch .claude/rules/testing.md
   ```

3. **Move content** to the new files:

   ```markdown
   # .claude/rules/git-workflow.md

   ## Branch Naming
   [content here]

   ## Commit Messages
   [content here]
   ```

4. **Update CLAUDE.md** to import the files:

   ```markdown
   # CLAUDE.md

   Import: @.claude/rules/git-workflow.md
   Import: @.claude/rules/api-design.md
   Import: @.claude/rules/testing.md
   ```

5. **Verify section count**:

   ```bash
   grep -c "^#" .claude/CLAUDE.md
   # Should be <= 20
   ```

## Options

### `maxSections`

Maximum number of sections (markdown headings) allowed before warning.

- Type: `number`
- Default: `20`

Example configuration:

```json
{
  "rules": {
    "claude-md-content-too-many-sections": ["warn", { "maxSections": 15 }]
  }
}
```

To allow more sections:

```json
{
  "rules": {
    "claude-md-content-too-many-sections": ["warn", { "maxSections": 30 }]
  }
}
```

## When Not To Use It

Consider disabling if your project genuinely requires many top-level sections in a single file and splitting would reduce clarity. However, most projects benefit from organized, topic-focused files that are easier to navigate and maintain.

## Related Rules

- [claude-md-size-warning](./claude-md-size-warning.md) - Warns when file approaches size limit
- [claude-md-size-error](./claude-md-size-error.md) - Errors when file exceeds size limit

## Resources

- [Rule Implementation](../../src/rules/claude-md/claude-md-content-too-many-sections.ts)
- [Rule Tests](../../tests/validators/claude-md.test.ts)

## Version

Available since: v0.2.0
