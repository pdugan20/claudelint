# Rule: skill-referenced-file-not-found

**Severity**: Error
**Fixable**: No
**Validator**: Skills
**Category**: Cross-Reference

Referenced file in markdown link does not exist

## Rule Details

This rule validates that all relative file references in markdown links within SKILL.md actually exist. Broken links create a poor user experience, lead to confusion when documentation points to missing files, waste time troubleshooting, and reduce confidence in the skill quality.

The rule checks relative markdown links using the pattern `[text](./path/to/file)`. Absolute URLs, anchor links, and non-relative paths are not validated by this rule.

### Incorrect

SKILL.md with broken file references:

```markdown
---
name: deploy
description: Deploys applications
---

# Deploy Skill

See [configuration guide](./docs/config.md) for setup.    # File doesn't exist

For examples, check [examples](./examples/basic.sh).      # File doesn't exist

Troubleshooting: [FAQ](./FAQ.md)                          # File doesn't exist
```

### Correct

SKILL.md with valid file references:

```markdown
---
name: deploy
description: Deploys applications
---

# Deploy Skill

See [configuration guide](./docs/config.md) for setup.    # File exists

For examples, check [deploy script](./deploy.sh).         # File exists

## Related Files

- [Health Check Script](./health-check.sh)
- [Rollback Script](./rollback.sh)
- [README](./README.md)
```

External links (not validated):

```markdown
See the [official documentation](https://example.com/docs).
Check the [GitHub repository](https://github.com/org/repo).
```

## How To Fix

Fix broken file references:

1. Create the referenced file
2. Update the path to point to the correct location
3. Remove the broken link if the file is no longer needed
4. Use absolute URLs for external resources

Examples:

- `[guide](./missing.md)` → Create `missing.md` or update path
- `[script](./scripts/deploy.sh)` → Move file to correct location
- `[docs](./old-docs.md)` → Remove link if obsolete

## Options

This rule does not have any configuration options.

## When Not To Use It

Consider disabling this rule if:

- Your skill references files that are generated at runtime
- You're working with template files that will be created during skill execution
- The skill is part of a larger system where files exist in a different repository

Use inline disable comments for specific cases rather than disabling entirely.

## Related Rules

- [skill-multi-script-missing-readme](./skill-multi-script-missing-readme.md) - Multiple scripts need README
- [skill-missing-examples](./skill-missing-examples.md) - Skills should have examples

## Resources

- [Rule Implementation](../../src/rules/skills/skill-referenced-file-not-found.ts)
- [Rule Tests](../../tests/rules/skills/skill-referenced-file-not-found.test.ts)

## Version

Available since: v1.0.0
