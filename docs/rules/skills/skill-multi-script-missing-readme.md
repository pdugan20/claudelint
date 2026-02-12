# Rule: skill-multi-script-missing-readme

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: Cross-Reference

Skills with multiple scripts should include a README.md

## Rule Details

This rule triggers when a skill directory contains more than 3 script files but lacks a `README.md` file. Complex skills with multiple executable scripts become difficult to understand without documentation explaining how they work together, which script to run first, and how they interact.

The rule counts scripts with extensions `.sh`, `.py`, `.js`, `.ts` and other executable file types. When the count exceeds the threshold (default: 3), users need additional documentation beyond SKILL.md to understand the setup process, usage patterns for each script, dependencies between scripts, and troubleshooting steps.

### Incorrect

Skill with 5 scripts but no README.md:

```text
.claude/skills/deploy/
├── SKILL.md
├── deploy.sh
├── rollback.sh
├── health-check.sh
├── validate.sh
└── notify.sh

5 scripts, no README.md
```

### Correct

Skill with README.md explaining script organization:

```text
.claude/skills/deploy/
├── SKILL.md
├── README.md          ✓ Explains all scripts
├── deploy.sh
├── rollback.sh
├── health-check.sh
├── validate.sh
└── notify.sh
```

Sample README.md content:

```markdown
# Deploy Skill

## Scripts

- `deploy.sh` - Main deployment script (run this first)
- `rollback.sh` - Rollback to previous version
- `health-check.sh` - Verify deployment health
- `validate.sh` - Pre-deployment validation
- `notify.sh` - Send deployment notifications

## Setup

1. Configure API credentials in `.env`
2. Run `validate.sh` to check configuration
3. Execute `deploy.sh` to deploy

## Dependencies

- curl
- jq
- AWS CLI
```

## How To Fix

Add a README.md to your skill directory that includes:

1. Create `README.md` in the skill directory
2. List all scripts with brief descriptions
3. Document the execution order
4. Explain setup and dependencies
5. Include troubleshooting tips

## Options

### `maxScripts`

Maximum number of scripts before README is required.

Type: `number`
Default: `3`

Example configuration:

```json
{
  "rules": {
    "skill-multi-script-missing-readme": ["warn", { "maxScripts": 5 }]
  }
}
```

## When Not To Use It

Consider disabling this rule if:

- All scripts are self-explanatory single-purpose utilities
- Your skill has comprehensive SKILL.md documentation covering all scripts
- Scripts are auto-generated and change frequently
- You're using a different documentation format (Wiki, external docs)

However, README.md is the standard location users expect to find setup instructions.

## Related Rules

- [skill-missing-examples](./skill-missing-examples.md) - SKILL.md should have usage examples
- [skill-too-many-files](./skill-too-many-files.md) - Too many files at root level

## Resources

- [Rule Implementation](../../src/rules/skills/skill-multi-script-missing-readme.ts)
- [Rule Tests](../../tests/rules/skills/skill-multi-script-missing-readme.test.ts)

## Version

Available since: v0.2.0
