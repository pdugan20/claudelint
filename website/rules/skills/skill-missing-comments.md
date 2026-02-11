# Rule: skill-missing-comments

**Severity**: Warn
**Fixable**: No
**Validator**: Skills

Shell script lacks explanatory comments

## Rule Details

Shell scripts that are longer than a configurable threshold (default: 10 non-empty lines) should include comments explaining their purpose, approach, and any non-obvious logic. This rule counts non-empty lines and comment lines (lines starting with `#`). If the script exceeds the threshold but has at most one comment line (typically just the shebang), the rule reports a warning. Comments improve maintainability and help other developers (and AI models) understand the script without executing it.

### Incorrect

Long script with no explanatory comments

```bash
#!/bin/bash
npm install
npm run build
npm run test
npm run lint
cp dist/* /var/www/
systemctl restart app
curl -s http://localhost/health
echo "Done"
rm -rf tmp/
exit 0
```

### Correct

Script with explanatory comments

```bash
#!/bin/bash
# Deploy script: builds, tests, and deploys the application
npm install
npm run build
npm run test

# Copy artifacts and restart the service
cp dist/* /var/www/
systemctl restart app

# Verify the deployment
curl -s http://localhost/health
```

## How To Fix

Add comments to the script explaining what it does, why certain steps are needed, and any non-obvious logic. At minimum, add a header comment describing the script purpose.

## Options

Default options:

```json
{
  "minLines": 10
}
```

Require comments only for scripts longer than 20 lines:

```json
{
  "minLines": 20
}
```

Require comments for any script longer than 5 lines:

```json
{
  "minLines": 5
}
```

## When Not To Use It

Disable this rule for auto-generated scripts where comments would be immediately overwritten.

## Related Rules

- [`skill-missing-shebang`](/rules/skills/skill-missing-shebang)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-missing-comments.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-missing-comments.test.ts)

## Version

Available since: v1.0.0
