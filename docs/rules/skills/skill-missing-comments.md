# Rule: skill-missing-comments

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: Completeness

Enforces that shell scripts with more than 10 lines include explanatory comments to aid understanding and maintenance.

## Rule Details

This rule triggers when a shell script has more than 10 non-empty lines but contains no explanatory comments (or only a shebang line). Comments help developers understand what the script does, why certain decisions were made, and how to use or modify it. Scripts without comments are harder to understand at a glance, maintain and debug, modify safely, and review in pull requests.

The rule counts non-empty lines and checks for comment lines starting with `#` (excluding shebang). Scripts with 10 lines or fewer are exempt since they're typically self-explanatory. The 10-line threshold balances avoiding noise in trivial scripts with ensuring documentation in non-trivial ones.

### Incorrect

Script with 15 lines but no explanatory comments:

```bash
#!/usr/bin/env bash

set -e

API_URL="https://api.example.com"
TOKEN=$(cat ~/.api-token)

response=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/deploy")

if [ $? -ne 0 ]; then
  echo "Deployment failed"
  exit 1
fi

echo "Deployment successful"
```

### Correct

Same script with explanatory comments:

```bash
#!/usr/bin/env bash

# Deploy application to production environment
# Usage: ./deploy.sh
# Requires: API token in ~/.api-token

set -e

# API configuration
API_URL="https://api.example.com"
TOKEN=$(cat ~/.api-token)

# Trigger deployment via API
response=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/deploy")

# Check for errors
if [ $? -ne 0 ]; then
  echo "Deployment failed"
  exit 1
fi

echo "Deployment successful"
```

## How To Fix

1. **Add file header**: Describe what the script does, how to use it, and any prerequisites (tokens, environment variables, dependencies)
2. **Add section comments**: Mark major logical sections (validation, configuration, main operation, cleanup)
3. **Comment complex logic**: Explain non-obvious behavior, tricky operations, or why specific approaches were chosen
4. **Document configuration**: Explain why certain values are used or where they come from
5. **Clarify error handling**: Explain what errors mean and how to resolve them

**Comment Guidelines:**

DO explain why code exists (not just what), non-obvious behavior, complex algorithms, prerequisites and dependencies, usage examples and parameters, error conditions.

DON'T restate the code, state the obvious, or let comments become outdated.

**Minimum Example:**

```bash
#!/usr/bin/env bash

# Backup database to S3
# Usage: ./backup-db.sh [database-name]

# Validation
if [ -z "$1" ]; then
  echo "Error: database name required"
  exit 1
fi

# Backup operation
pg_dump "$1" | gzip | aws s3 cp - "s3://backups/$1-$(date +%Y%m%d).sql.gz"

# Cleanup old backups (keep last 7 days)
aws s3 ls s3://backups/ | head -n -7 | xargs -I {} aws s3 rm "s3://backups/{}"
```

## Options

This rule does not have configuration options. The threshold of 10 lines is fixed.

## When Not To Use It

Consider disabling if your code is genuinely trivial and self-documenting, you have comprehensive external documentation, or your team has a different commenting standard. However, comments are generally beneficial even for "simple" scripts.

## Related Rules

- [skill-missing-shebang](./skill-missing-shebang.md) - Scripts need shebang lines
- [skill-missing-examples](./skill-missing-examples.md) - Skills need usage examples

## Resources

- [Implementation](../../../src/validators/skills.ts)
- [Tests](../../../tests/validators/skills.test.ts)
- [Google Shell Style Guide](https://google.github.io/styleguide/shellguide.html)

## Version

Available since: v1.0.0
