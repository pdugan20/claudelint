# Rule: skill-missing-comments

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: Cross-Reference

Shell script lacks explanatory comments

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
