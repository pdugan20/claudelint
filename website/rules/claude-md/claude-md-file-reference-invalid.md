# claude-md-file-reference-invalid

<RuleHeader description="File path referenced in CLAUDE.md does not exist" severity="warn" :fixable="false" category="CLAUDE.md" />

## Rule Details

CLAUDE.md files often reference project files using inline code (backticks) or in bash code blocks. When these file paths point to files that do not exist, the instructions become misleading -- Claude Code may attempt to read or modify non-existent files. This rule extracts file-like paths from inline code and bash/shell code blocks, resolves them relative to the CLAUDE.md location, and verifies they exist on disk. It intelligently skips URLs, glob patterns, template variables, version strings, and common non-path patterns to minimize false positives.

### Incorrect

Inline code referencing a file that does not exist

```markdown
# Project Setup

Configuration is in `src/config/settigns.ts` (check for typos).
```

Bash code block referencing a non-existent script

````markdown
# Testing

```bash
./scripts/run-tets.sh
```
````

### Correct

Inline code referencing a file that exists

```markdown
# Project Setup

Configuration is in `src/config/settings.ts`.
```

Bash code block referencing an existing script

````markdown
# Testing

```bash
./scripts/run-tests.sh
```
````

## How To Fix

Verify the file path is correct. Check for typos in the filename or directory. If the file was moved or renamed, update the reference to match the new location. If the file was intentionally deleted, remove the reference from CLAUDE.md.

## Options

This rule does not have any configuration options.

## When Not To Use It

Disable this rule if your CLAUDE.md intentionally references files that will be generated later (e.g., build outputs) or if you reference example paths that are illustrative rather than literal.

## Related Rules

- [`claude-md-file-not-found`](/rules/claude-md/claude-md-file-not-found)
- [`claude-md-npm-script-not-found`](/rules/claude-md/claude-md-npm-script-not-found)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/claude-md/claude-md-file-reference-invalid.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/claude-md/claude-md-file-reference-invalid.test.ts)

## Version

Available since: v0.2.0
