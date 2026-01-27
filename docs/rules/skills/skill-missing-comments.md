# Missing Comments

Shell scripts should include explanatory comments.

## Rule Details

This rule enforces that shell scripts with more than 10 lines of code include explanatory comments. Comments help other developers (and your future self) understand what the script does, why certain decisions were made, and how to use or modify it.

Scripts without comments are harder to:

- Understand at a glance
- Maintain and debug
- Modify safely
- Use correctly
- Review in pull requests

This rule triggers when a shell script has more than 10 non-empty lines but contains only a shebang line (or no comments at all).

**Category**: Skills
**Severity**: warning
**Fixable**: No
**Since**: v1.0.0

### Violation Example

Shell script with 15 lines but no explanatory comments:

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

### Correct Example

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

Better example with more detailed comments:

```bash
#!/usr/bin/env bash

# Deploy application to production environment
#
# This script triggers a deployment via the company API. It reads the
# authentication token from ~/.api-token and makes a POST request to
# the deployment endpoint.
#
# Prerequisites:
#   - Valid API token in ~/.api-token
#   - curl installed
#   - Network access to api.example.com
#
# Usage:
#   ./deploy.sh
#
# Exit codes:
#   0 - Success
#   1 - Deployment failed

set -e  # Exit on any error

# Configuration
API_URL="https://api.example.com"

# Load authentication token
# Token should be generated from the admin panel
TOKEN=$(cat ~/.api-token)

# Trigger deployment
# This makes a POST request to /deploy endpoint
response=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/deploy")

# Verify deployment succeeded
if [ $? -ne 0 ]; then
  echo "Deployment failed"
  exit 1
fi

echo "Deployment successful"
```

## How To Fix

Add comments to explain:

1. **File header**: What the script does, usage, and prerequisites
2. **Sections**: Major logical sections of the script
3. **Complex logic**: Non-obvious code or tricky operations
4. **Configuration**: Why certain values are used
5. **Error handling**: What errors mean and how to resolve them

### Comment Guidelines

**DO write comments that explain:**

- Why code exists (not just what it does)
- Non-obvious behavior or side effects
- Complex algorithms or logic
- Prerequisites and dependencies
- Usage examples and parameters
- Error conditions and recovery

**DON'T write comments that:**

- Simply restate the code
- State the obvious
- Become outdated (keep them current!)

Example of bad vs good comments:

```bash
# Bad: i = i + 1 (states the obvious)
i=$((i + 1))

# Good: Skip the header row in CSV processing
i=$((i + 1))
```

## Minimum Comment Requirements

For scripts over 10 lines, include at minimum:

1. **File header comment** describing purpose and usage
2. **Section comments** for logical groupings
3. **Complex operation comments** for non-obvious code

Example minimum comments:

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
aws s3 ls s3://backups/ | awk '{print $4}' | head -n -7 | xargs -I {} aws s3 rm "s3://backups/{}"
```

## Options

This rule does not have any configuration options. The threshold of 10 lines is fixed.

## When Not To Use It

You might disable this rule if:

- Your code is self-documenting and truly trivial
- You have external documentation that covers the script
- Your team has a different commenting standard

However, comments are generally beneficial even for "simple" scripts.

## Configuration

To disable this rule:

```json
{
  "rules": {
    "skill-missing-comments": "off"
  }
}
```

To escalate to an error:

```json
{
  "rules": {
    "skill-missing-comments": "error"
  }
}
```

## Related Rules

- [skill-missing-shebang](./skill-missing-shebang.md) - Scripts need shebang lines
- [skill-missing-examples](./skill-missing-examples.md) - Skills need usage examples

## Resources

- [Google Shell Style Guide](https://google.github.io/styleguide/shellguide.html)
- [Best Practices for Writing Bash Scripts](https://bertvv.github.io/cheat-sheets/Bash.html)
- [The Art of Readable Code](https://www.oreilly.com/library/view/the-art-of/9781449318482/)

## Version

Available since: v1.0.0
