# Rule: skill-description-max-length

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: Best Practices

Skill description should not exceed configured maximum length

## Rule Details

This rule triggers when a skill's description exceeds the configured maximum length (default 500 characters). Concise descriptions help with:

1. **Skill Listings**: Skills are displayed in listings and searches where space is limited
2. **Readability**: Short descriptions are easier to understand at a glance
3. **Mobile Compatibility**: Truncated text on small screens is avoided
4. **Accessibility**: Shorter text improves readability for users with screen readers

While descriptions can contain useful information, they should be concise and focused on the primary purpose. Detailed information about capabilities, parameters, and examples should be in the SKILL.md body or in reference files.

### Incorrect

Description exceeding default 500 character limit:

```markdown
---
name: deploy
description: This skill deploys applications to production servers with comprehensive support for Docker containers, Kubernetes orchestration, AWS services, Azure cloud platform, and Google Cloud Platform. It includes health checks, rollback capability, automated scaling, load balancing, monitoring integration, and detailed logging. You can use it for staging, production, canary deployments, blue-green deployments, rolling updates, and more. It also supports custom pre-deployment and post-deployment hooks, environment variable management, secrets handling, and compliance checking.    # 450+ characters - too long
---
```

### Correct

Concise description under 500 characters:

```markdown
---
name: deploy
description: Deploys applications to production servers with health checks, rollback capability, and support for Docker and Kubernetes
---
```

Another example:

```markdown
---
name: database-backup
description: Backs up PostgreSQL and MySQL databases to S3 with encryption and retention policies
---
```

Extended information in SKILL.md body:

```markdown
---
name: deploy
description: Deploys applications to production servers
version: 1.0.0
---

# Deploy Skill

## Features

This skill provides comprehensive deployment capabilities:

- Docker container support
- Kubernetes orchestration
- Multi-cloud support (AWS, Azure, GCP)
- Health checks and validation
- Automatic rollback on failure
- Custom hooks for pre/post deployment
- Environment variable and secrets management

## Detailed documentation continues here...
```

## How To Fix

To reduce description length:

1. **Keep it focused on primary purpose**: What does the skill do at its core?
2. **Remove lists of features**: Save detailed features for SKILL.md body
3. **Use simple language**: Avoid marketing speak and unnecessary adjectives
4. **Remove version/platform details**: These belong in dependencies or tags

Examples of reduction:

- `This skill deploys applications to production servers with comprehensive support for Docker containers, Kubernetes orchestration, AWS services, and more` → `Deploys applications to production servers with Docker and Kubernetes support`
- `Backs up databases to multiple cloud providers including AWS S3, Azure Blob Storage, and Google Cloud Storage with automatic encryption` → `Backs up databases to cloud storage with encryption`

## Options

This rule has the following configuration options:

### `maxLength`

Maximum number of characters allowed in the description. Must be a positive integer.

**Type**: `number`
**Default**: `500`

**Schema**:

```typescript
{
  maxLength: number // positive integer
}
```

**Example configuration**:

```json
{
  "rules": {
    "skill-description-max-length": ["warn", { "maxLength": 750 }]
  }
}
```

## When Not To Use It

You may increase the threshold if your skill requires a more detailed description:

```json
{
  "rules": {
    "skill-description-max-length": ["warn", { "maxLength": 800 }]
  }
}
```

However, consider whether additional details truly belong in the description or if they should be in SKILL.md instead.

## Related Rules

- [skill-description](./skill-description.md) - Skill descriptions must be valid
- [skill-body-too-long](./skill-body-too-long.md) - SKILL.md body length validation
- [skill-tags](./skill-tags.md) - Tag validation for categorization

## Resources

- [Rule Implementation](../../src/rules/skills/skill-description-max-length.ts)
- [Rule Tests](../../tests/rules/skills/skill-description-max-length.test.ts)

## Version

Available since: v0.3.0
