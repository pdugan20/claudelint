# skill-hardcoded-secrets

<RuleHeader description="Skill file contains hardcoded secrets that should use environment variables" severity="error" :fixable="false" :configurable="false" category="Skills" />

## Rule Details

This rule scans SKILL.md files and associated scripts (.sh, .bash, .py, .js, .ts) for known secret patterns including Anthropic, OpenAI, GitHub, AWS, Stripe, and Slack API keys, private keys, and generic password/secret/token assignments. Hardcoded secrets are a critical security risk -- they can be leaked through version control, shared skill repositories, or AI model context. Comment lines containing "example" or "placeholder" are excluded to avoid false positives.

### Incorrect

Script with a hardcoded API key

```bash
#!/bin/bash
API_KEY="sk-ant-abc123def456ghi789jkl012mno345"
```

SKILL.md with a hardcoded password

```markdown
---
name: deploy
description: Deploys the app
---

Connect with password: "MyS3cretP@ss"
```

### Correct

Script using environment variables for secrets

```bash
#!/bin/bash
API_KEY="$ANTHROPIC_API_KEY"
```

SKILL.md referencing environment variables

```markdown
---
name: deploy
description: Deploys the app
---

Set the `DEPLOY_TOKEN` environment variable before running.
```

## How To Fix

Replace hardcoded secrets with environment variable references (e.g., `$API_KEY` or `process.env.API_KEY`). Store actual secret values in a secure secrets manager or `.env` file that is excluded from version control.

## Options

This rule does not have any configuration options.

## When Not To Use It

This rule should almost never be disabled. If you have a test fixture that contains fake/example secrets, add a comment with "example" or "placeholder" on the line to suppress the warning.

## Related Rules

- [`skill-dangerous-command`](/rules/skills/skill-dangerous-command)
- [`skill-path-traversal`](/rules/skills/skill-path-traversal)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-hardcoded-secrets.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-hardcoded-secrets.test.ts)

## Version

Available since: v0.2.0
