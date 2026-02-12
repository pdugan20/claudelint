# Rule: skill-hardcoded-secrets

**Severity**: Error
**Fixable**: No
**Validator**: Skills
**Category**: Security

Detects hardcoded API keys, passwords, tokens, and private keys in skill files

## Rule Details

This rule prevents accidentally committing sensitive credentials to your codebase. It detects common patterns of hardcoded secrets including:

- API keys: `sk-ant-`, `ghp_`, `AKIA`, `sk_live_`, `pk_live_`, `rk_live_`
- Generic patterns: `password=`, `api_key=`, `token=`, `secret=`
- Private keys: `-----BEGIN PRIVATE KEY-----`, `-----BEGIN RSA PRIVATE KEY-----`
- AWS credentials: Access key IDs starting with ASIA or AKIA
- Slack tokens: `xoxb-`, `xoxp-`
- GitHub tokens: `ghp_` or `github_pat_`

Hardcoded secrets are a critical security vulnerability. Any developer who clones the repository gains access to production credentials, and if the repository is accidentally made public, credentials become immediately compromised.

### Incorrect

Hardcoded API key in shell script:

```bash
#!/bin/bash
API_KEY="sk-ant-abc123def456ghi789"
curl -H "Authorization: Bearer $API_KEY" https://api.example.com/data
```

Hardcoded password in SKILL.md:

```markdown
---
name: deploy-app
description: Deploys the application
allowed-tools:
  - Bash
---

export DATABASE_PASSWORD="super-secret-123"
bash deploy.sh
```

Hardcoded AWS credentials:

```bash
#!/bin/bash
AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
aws s3 cp file.txt s3://my-bucket/
```

Hardcoded GitHub token:

```bash
#!/bin/bash
GITHUB_TOKEN="ghp_abcdefghijklmnopqrstuvwxyz123456"
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user
```

### Correct

Use environment variables instead:

```bash
#!/bin/bash
# Reads from environment, never hardcoded
curl -H "Authorization: Bearer $API_KEY" https://api.example.com/data
```

Use environment variables in SKILL.md:

```markdown
---
name: deploy-app
description: Deploys the application
allowed-tools:
  - Bash
---

# DATABASE_PASSWORD should be set in environment before running
bash deploy.sh
```

Load secrets from secure files:

```bash
#!/bin/bash
# Load from .env file (which is .gitignored)
set -a
source ~/.aws/credentials
set +a

aws s3 cp file.txt s3://my-bucket/
```

Use credential managers:

```bash
#!/bin/bash
# Load from credential manager instead of hardcoding
GITHUB_TOKEN=$(pass github/token)
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user
```

## How To Fix

1. Never hardcode secrets in skill files or scripts
2. Use environment variables: `export SECRET_NAME="value"` before running, or `$SECRET_NAME` in scripts
3. Store secrets in `.env` files and add them to `.gitignore`
4. Use a credential manager like `pass`, `1password`, or similar
5. For CI/CD, use GitHub Secrets, GitLab CI/CD variables, or similar secure storage
6. If working with AWS, use IAM roles instead of long-lived access keys
7. Rotate any credentials that were accidentally committed

## Options

This rule does not have any configuration options.

## When Not To Use It

This rule should not be disabled. Hardcoded secrets are a critical security risk and should never appear in version control. If you have legitimate use cases for example credentials in tests, use placeholder values that are clearly not real credentials (e.g., `test-key-12345` or `fake-token-for-testing`).

## Related Rules

- [skill-side-effects-without-disable-model](./skill-side-effects-without-disable-model.md) - Ensures skills with side effects disable model invocation

## Resources

- [Rule Implementation](../../src/rules/skills/skill-hardcoded-secrets.ts)
- [Rule Tests](../../tests/rules/skills/skill-hardcoded-secrets.test.ts)
- [OWASP Secrets Management](https://owasp.org/www-community/Sensitive_Data_Exposure)

## Version

Available since: v0.2.0
