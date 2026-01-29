# Rule: plugin-invalid-version

**Severity**: Error
**Fixable**: No
**Validator**: Plugin
**Category**: Schema Validation

Plugin version must follow semantic versioning format

## Rule Details

Plugin versions must follow the semver format `MAJOR.MINOR.PATCH` with all three numeric components required. Optional pre-release identifiers (e.g., `-alpha`, `-beta.1`) and build metadata (e.g., `+build.123`) are allowed following semver 2.0.0 specification.

This rule detects invalid semver formats including missing version parts, non-numeric components, `v` prefixes, wrong separators (underscores instead of dots), and text versions like "latest".

### Incorrect

Missing version parts:

```json
{
  "version": "1.0"
}
```

Invalid prefix or text:

```json
{
  "version": "v1.0.0"
}
```

```json
{
  "version": "latest"
}
```

### Correct

Standard semver:

```json
{
  "version": "1.0.0"
}
```

With pre-release and build metadata:

```json
{
  "version": "2.1.0-beta.1"
}
```

```json
{
  "version": "3.0.0-rc.1+build.123"
}
```

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. Invalid version numbers cause plugin installation failures, dependency resolution problems, marketplace submission rejection, and update mechanism failures. Always use valid semver versions rather than disabling validation.

## Related Rules

- [plugin-invalid-manifest](./plugin-invalid-manifest.md) - Manifest schema validation
- [plugin-missing-file](./plugin-missing-file.md) - Referenced file validation

## Resources

- [Implementation](../../../src/validators/plugin.ts)
- [Tests](../../../tests/validators/plugin.test.ts)
- [Semantic Versioning 2.0.0](https://semver.org/)
- [NPM Semver](https://docs.npmjs.com/about-semantic-versioning)

## Version

Available since: v1.0.0
