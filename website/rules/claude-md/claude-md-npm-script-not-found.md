# claude-md-npm-script-not-found

<RuleHeader description="npm run script referenced in CLAUDE.md does not exist in package.json" severity="error" :fixable="false" :configurable="false" category="CLAUDE.md" />

## Rule Details

CLAUDE.md files frequently instruct Claude Code to run npm scripts for testing, linting, or building. If a referenced script does not exist in the nearest `package.json`, Claude Code will fail when attempting to run it. This rule extracts all `npm run <script>` references from the markdown content, locates the nearest `package.json` by walking up the directory tree, and verifies each referenced script exists in the `scripts` field. Common causes include typos in script names, renamed scripts, or referencing scripts from a different package in a monorepo.

### Incorrect

Referencing a script that does not exist in package.json

````markdown
# Testing

Run the tests:

```bash
npm run tets
```
````

### Correct

Referencing a script that exists in package.json

````markdown
# Testing

Run the tests:

```bash
npm run test
```
````

## How To Fix

Verify the script name matches exactly what is defined in `package.json` scripts. Check for typos. If the script was renamed, update the reference in CLAUDE.md. If the script needs to be created, add it to the `scripts` field in `package.json`.

## Options

This rule does not have any configuration options.

## When Not To Use It

Disable this rule if your CLAUDE.md references scripts from a different package.json than the nearest one (e.g., in a monorepo where CLAUDE.md is at the root but scripts are in a sub-package).

## Related Rules

- [`claude-md-file-reference-invalid`](/rules/claude-md/claude-md-file-reference-invalid)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/claude-md/claude-md-npm-script-not-found.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/claude-md/claude-md-npm-script-not-found.test.ts)

## Version

Available since: v0.2.0
