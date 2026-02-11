# Rule: skill-cross-reference-invalid

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: Cross-Reference

SKILL.md cross-references to other skills must point to existing SKILL.md files

## Rule Details

This rule triggers when SKILL.md contains cross-references (links) to other skills that point to non-existent SKILL.md files. Cross-references help users discover related skills and understand how skills work together. However, broken links create a poor user experience and indicate missing dependencies.

This rule validates relative links like `../other-skill/SKILL.md` by checking that the referenced file actually exists. It catches:

1. **Typos in skill names**: `../delpoy/SKILL.md` instead of `../deploy/SKILL.md`
2. **Deleted dependencies**: Links to skills that no longer exist
3. **Wrong relative paths**: Incorrect directory structure assumptions
4. **Case sensitivity issues**: On case-sensitive filesystems, `../Deploy/SKILL.md` won't match `../deploy/`

### Incorrect

SKILL.md with invalid cross-reference links:

```markdown
---
name: deployment-pipeline
description: Complete deployment pipeline
---

# Deployment Pipeline

This skill orchestrates the complete deployment workflow.

## Dependencies

This skill depends on:
- See `../deploy/SKILL.md` for deployment steps
- See `../health-check/SKILL.md` for validation
- See `../delpoy/SKILL.md` for raw deployment (typo - file doesn't exist)
- See `../rollback-recovery/SKILL.md` for failure handling (skill deleted)
```

Broken "See Also" section:

```markdown
---
name: api-integration
---

# API Integration Skill

## See Also

- `../api-validation/SKILL.md` - Validates API responses
- `../api-documentation/SKILL.md` - Non-existent skill
- `../../.claude/skills/http-client/SKILL.md` - Wrong relative path
```

### Correct

SKILL.md with valid cross-reference links:

```markdown
---
name: deployment-pipeline
description: Complete deployment pipeline
---

# Deployment Pipeline

This skill orchestrates the complete deployment workflow.

## Dependencies

This skill depends on:
- See `../deploy/SKILL.md` for deployment steps (file exists)
- See `../health-check/SKILL.md` for validation (file exists)
- See `../rollback/SKILL.md` for failure handling (correct spelling)
```

Related skills documentation:

```markdown
---
name: api-client
description: Provides utilities for API interactions
---

# API Client Skill

Core API interaction utilities.

## Related Skills

For complementary functionality:
- `../http-client/SKILL.md` - Low-level HTTP operations
- `../api-authentication/SKILL.md` - Authentication patterns
- `../response-parser/SKILL.md` - Response parsing utilities
```

Correct relative path structure:

```text
.claude/skills/
├── deployment-pipeline/
│   └── SKILL.md  (references ../deploy/SKILL.md)
├── deploy/
│   └── SKILL.md  (exists - reference is valid)
├── health-check/
│   └── SKILL.md  (exists - reference is valid)
└── rollback/
    └── SKILL.md  (exists - reference is valid)
```

## How To Fix

1. **Check the reference path**: Verify the relative path is correct
2. **Check the skill exists**: Confirm the target skill directory exists
3. **Check the filename**: Verify it's `SKILL.md` (exact case)
4. **Check for typos**: Look for misspellings in skill names
5. **Update or remove dead links**

Examples of fixes:

```markdown
# Before (invalid - typo)
See `../delpoy/SKILL.md` for deployment

# After (valid - typo fixed)
See `../deploy/SKILL.md` for deployment

# Before (invalid - skill deleted)
See `../old-validation/SKILL.md` for validation

# After (valid - link removed or updated to new skill)
See `../new-validation/SKILL.md` for validation

# Before (invalid - wrong path)
See `../../skills/http/SKILL.md` for HTTP operations

# After (valid - correct relative path)
See `../http-client/SKILL.md` for HTTP operations
```

When a referenced skill no longer exists:

- Remove the reference if no alternative exists
- Update to reference an existing replacement skill
- Add the missing skill as a dependency if needed

## Options

This rule does not have any configuration options.

## When Not To Use It

This is a helpful validation rule that prevents broken links. Only disable if:

- You're building skills in a non-standard directory structure
- You have external links that should not be validated
- You're in active development and haven't created dependencies yet

In most cases, fixing the broken references is the proper solution.

## Related Rules

- [skill-dependencies](./skill-dependencies.md) - Dependency format validation
- [skill-referenced-file-not-found](./skill-referenced-file-not-found.md) - File existence validation
- [skill-reference-not-linked](./skill-reference-not-linked.md) - Reference files must be linked

## Resources

- [Rule Implementation](../../src/rules/skills/skill-cross-reference-invalid.ts)
- [Rule Tests](../../tests/rules/skills/skill-cross-reference-invalid.test.ts)
- [Markdown Link Syntax](https://www.markdownguide.org/basic-syntax/#links)

## Version

Available since: v0.3.0
