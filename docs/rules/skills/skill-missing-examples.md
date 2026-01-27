# Missing Examples

Skills should include usage examples in SKILL.md.

## Rule Details

This rule enforces that Claude Code skills include usage examples in their SKILL.md file. Examples help users understand how to invoke and use the skill, what arguments it accepts, and what output to expect.

Without examples:

- Users don't know how to invoke the skill
- It's unclear what arguments are accepted
- The expected behavior is ambiguous
- Adoption and usability suffer
- Debugging becomes more difficult

This rule triggers when SKILL.md lacks both:

1. Code blocks (fenced with backticks)
2. A section titled "Example", "Examples", or "Usage"

**Category**: Skills
**Severity**: warning
**Fixable**: No
**Since**: v1.0.0

### Violation Example

SKILL.md without examples:

```markdown
---
name: deploy
description: Deploys the application to production
---

# Deploy Skill

This skill handles deployment to production servers.

## Features

- Automated deployment
- Rollback support
- Health checks

## Requirements

- Valid API credentials
- Network access to production
```text
### Correct Examples

SKILL.md with Example section:

```markdown
---
name: deploy
description: Deploys the application to production
---

# Deploy Skill

This skill handles deployment to production servers.

## Example

To deploy to production:

```bash
/deploy production
```text
To deploy with a specific version:

```bash
/deploy production --version 1.2.3
```text
To rollback to previous version:

```bash
/deploy rollback
```text
```text
SKILL.md with Usage section and code blocks:

```markdown
---
name: test-runner
description: Runs project test suite
---

# Test Runner Skill

Executes the test suite with various options.

## Usage

Run all tests:

```bash
/test-runner
```text
Run specific test file:

```bash
/test-runner tests/auth.test.ts
```text
Run with coverage:

```bash
/test-runner --coverage
```text
## Options

- `--coverage`: Generate coverage report
- `--watch`: Watch mode for development
- `--bail`: Stop on first failure

```text
SKILL.md with inline code examples:

```markdown
---
name: git-commit
description: Creates formatted git commits
---

# Git Commit Skill

Creates well-formatted git commits following conventional commits.

Basic usage: `/git-commit "Add user authentication"`

With type: `/git-commit "feat: Add user authentication"`

With scope: `/git-commit "feat(auth): Add user authentication"`
```text
## Why Examples Matter

Examples are critical because they:

1. **Teach by showing**: Code examples are clearer than prose
2. **Reduce support burden**: Users can self-serve
3. **Prevent misuse**: Show correct usage patterns
4. **Speed adoption**: Users can copy-paste and adapt
5. **Document edge cases**: Show how to handle special situations
6. **Aid debugging**: Provide known-good invocations for comparison

## How To Fix

Add examples to your SKILL.md file using one of these approaches:

### Option 1: Add an Examples section

```markdown
## Examples

Basic usage:

```bash
/your-skill argument
```text
With options:

```bash
/your-skill --flag value
```text
```text
### Option 2: Add a Usage section

```markdown
## Usage

```bash
# Short description
/your-skill [options] <arguments>
```text
Available options:

- `--verbose`: Enable detailed output
- `--dry-run`: Preview without executing

```text
### Option 3: Add inline code examples

```markdown
## Description

Invoke the skill with `/your-skill <target>` to process the target.

For example: `/your-skill production` or `/your-skill staging --verbose`
```text
## Good Example Practices

### Show common use cases

```markdown
## Examples

Deploy to staging:
```bash
/deploy staging
```text
Deploy to production with confirmation:

```bash
/deploy production --confirm
```text
Rollback last deployment:

```bash
/deploy rollback
```text
```text
### Include expected output

```markdown
## Example

```bash
$ /test-runner tests/

Running test suite...
✓ auth.test.ts (12 tests)
✓ api.test.ts (8 tests)
✓ utils.test.ts (15 tests)

Total: 35 tests passed
```text
```text
### Show error cases

```markdown
## Examples

Success case:
```bash
$ /deploy production
✓ Deployment successful
```text
Error case:

```bash
$ /deploy production
✗ Error: Missing API credentials
  Set DEPLOY_TOKEN environment variable
```text
```text
### Explain arguments

```markdown
## Usage

```bash
/backup <source> <destination> [--compress]
```text
Arguments:

- `source`: Directory to backup
- `destination`: Backup location
- `--compress`: Optional compression flag

Example:

```bash
/backup /var/www /backups --compress
```text
```text
## What to Include in Examples

At minimum, include:

1. **Basic invocation**: Simplest way to use the skill
2. **Common arguments**: Most frequently used options
3. **Expected output**: What users should see

Optionally include:

4. **Advanced usage**: Complex scenarios
5. **Error examples**: How failures look
6. **Troubleshooting**: Common issues and solutions

## Options

This rule does not have any configuration options.

## When Not To Use It

You might disable this rule if:

- Your skill is self-explanatory and requires no arguments
- Examples exist in separate README.md (though SKILL.md is preferred)
- Your skill is internal and well-understood by the team

However, examples benefit all skills, even simple ones.

## Configuration

To disable this rule:

```json
{
  "rules": {
    "skill-missing-examples": "off"
  }
}
```text
To escalate to an error:

```json
{
  "rules": {
    "skill-missing-examples": "error"
  }
}
```text
## Related Rules

- [skill-missing-changelog](./skill-missing-changelog.md) - Skills should track changes
- [skill-missing-version](./skill-missing-version.md) - Skills should have version numbers
- [skill-missing-comments](./skill-missing-comments.md) - Scripts should have comments

## Resources

- [Writing Great Documentation](https://documentation.divio.com/)
- [README Best Practices](https://github.com/matiassingers/awesome-readme)

## Version

Available since: v1.0.0
