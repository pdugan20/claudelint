# SARIF Output

claudelint can output validation results in [SARIF](https://sarifweb.azurewebsites.net/) (Static Analysis Results Interchange Format) v2.1.0. This enables integration with GitHub Code Scanning, VS Code, and other SARIF-compatible tools.

## Generating SARIF Output

```bash
claudelint check-all --format sarif
```

To save to a file:

```bash
claudelint check-all --format sarif > results.sarif
```

SARIF output is only available with the `check-all` command.

## GitHub Code Scanning

Upload SARIF results to GitHub Code Scanning for inline PR annotations and the Security tab.

```yaml
# .github/workflows/claudelint.yml
name: claudelint

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    steps:
      - uses: actions/checkout@v6

      - uses: actions/setup-node@v6
        with:
          node-version: '22'

      - run: npm install -g claude-code-lint

      - name: Run claudelint
        run: claudelint check-all --format sarif > results.sarif
        continue-on-error: true

      - name: Upload SARIF
        uses: github/codeql-action/upload-sarif@v4
        with:
          sarif_file: results.sarif
```

Once uploaded, results appear as:

- Inline annotations on pull request diffs
- Entries in the repository Security tab under Code Scanning
- Filterable alerts by rule ID and severity

## VS Code SARIF Viewer

Install the [SARIF Viewer](https://marketplace.visualstudio.com/items?itemName=MS-SarifVSCode.sarif-viewer) extension, then open a `.sarif` file to navigate results inline in your editor.

```bash
# Generate SARIF file
claudelint check-all --format sarif > results.sarif

# Open in VS Code (with SARIF Viewer extension installed)
code results.sarif
```

## Output Structure

SARIF output follows the v2.1.0 schema. Each validation error or warning becomes a SARIF result with rule ID, severity level, message, and file location.

```json
{
  "$schema": "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/main/sarif-2.1/schema/sarif-schema-2.1.0.json",
  "version": "2.1.0",
  "runs": [
    {
      "tool": {
        "driver": {
          "name": "claudelint",
          "version": "0.5.0",
          "informationUri": "https://www.npmjs.com/package/claude-code-lint",
          "rules": [
            {
              "id": "skill-missing-shebang",
              "defaultConfiguration": { "level": "warning" }
            }
          ]
        }
      },
      "results": [
        {
          "ruleId": "skill-missing-shebang",
          "level": "warning",
          "message": { "text": "Shell script missing shebang line" },
          "locations": [
            {
              "physicalLocation": {
                "artifactLocation": { "uri": ".claude/skills/test/test.sh" },
                "region": { "startLine": 1 }
              }
            }
          ]
        }
      ]
    }
  ]
}
```

## Severity Mapping

claudelint severities map to SARIF levels:

| claudelint | SARIF |
|-----------|-------|
| error | `error` |
| warning | `warning` |

## See Also

- [CLI Reference](/guide/cli-reference) - All output format options
- [CI/CD Integration](/integrations/ci) - General CI setup guide
