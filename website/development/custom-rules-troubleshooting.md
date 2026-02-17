# Custom Rules Troubleshooting

Common issues when developing [custom rules](/development/custom-rules) and how to resolve them.

## Rule Not Loading

**Problem:** Custom rule doesn't appear in output

**Solutions:**

- Verify file is in `.claudelint/rules/` directory
- Check file extension is `.ts` or `.js` (not `.d.ts`, `.test.ts`, etc.)
- Export a named `rule` object using `export const rule`
- Check for syntax errors in the rule file

## Rule ID Conflicts

**Problem:** `Error: Rule ID conflicts with existing rule`

**Solutions:**

- Choose a unique ID that doesn't match built-in rules
- Check for duplicate IDs across your custom rules
- Prefix custom rules with a namespace (e.g., `team-no-profanity`)

## TypeScript Errors

**Problem:** `Parameter 'context' implicitly has an 'any' type`

**Solutions:**

- Both `.ts` and `.js` files are supported
- Add type annotations to resolve implicit `any` errors:

```typescript
import type { Rule, RuleContext } from 'claude-code-lint';

export const rule: Rule = {
  // ...
  validate: async (context: RuleContext) => {
    // ...
  },
};
```

## Rule Not Executing

**Problem:** Rule loads but doesn't report violations

**Solutions:**

- Check rule is enabled in `.claudelintrc.json`
- Verify `context.report()` is being called
- Add debug logging to validate function
- Ensure file being checked matches your rule's logic

## Helper Functions Not Found

**Problem:** `Cannot find module 'claudelint/utils'`

**Solutions:**

- Use `import { ... } from 'claudelint/utils'` for utility functions
- Import types separately: `import type { RuleContext } from 'claude-code-lint'`
- Ensure you're using the helpers within the `validate` function
- Check that helpers are exported from your rule file

Example:

```typescript
import { hasHeading, extractFrontmatter } from 'claudelint/utils';
import type { Rule } from 'claude-code-lint';

export const rule: Rule = {
  validate: async (context) => {
    const fm = extractFrontmatter(context.fileContent);
    // ...
  },
};
```

## Auto-Fix Not Working

**Problem:** Auto-fix doesn't apply when using `--fix` flag

**Solutions:**

- Verify `meta.fixable: true` in rule metadata
- Ensure `autoFix` object is passed to `context.report()`
- Check that `apply()` function returns modified content
- Make sure `apply()` is pure (doesn't mutate input)
- Test `apply()` function independently

Example:

```typescript
meta: {
  fixable: true,  // Required for auto-fix
  // ...
},
validate: async (context) => {
  context.report({
    message: 'Issue found',
    autoFix: {
      ruleId: 'my-rule',
      description: 'Fix description',
      filePath: context.filePath,
      apply: (content) => {
        return content.replace(/old/g, 'new');
      },
    },
  });
},
```

## Regex Issues

**Problem:** Pattern doesn't match expected content

**Solutions:**

- Test regex at [regex101.com](https://regex101.com) first
- Use `matchesPattern()` for quick existence checks
- Use `findLinesMatching()` to get line numbers
- Remember: `.` doesn't match newlines by default
- Use `\s` for whitespace, `\S` for non-whitespace
- Escape special characters: `\.`, `\?`, `\*`, etc.

Example:

```typescript
// Find all TODO comments with line numbers
const todos = findLinesMatching(context.fileContent, /TODO:/gi);
todos.forEach(match => {
  context.report({
    message: 'Found TODO comment',
    line: match.line,
  });
});
```

## Frontmatter Parsing

**Problem:** `extractFrontmatter()` returns `null`

**Solutions:**

- Verify frontmatter has `---` delimiters at start/end
- Check YAML syntax is valid (no tabs, proper indentation)
- Ensure frontmatter is at the very beginning of file
- Test YAML at [yamllint.com](http://www.yamllint.com)

Valid frontmatter format:

```yaml
---
name: My File
version: 1.0.0
tags: [example, test]
---
```

## File Existence Checks

**Problem:** `fileExists()` returns false for existing files

**Solutions:**

- Use absolute paths, not relative paths
- Join paths with `path.join()` for cross-platform compatibility
- Get file directory with `path.dirname(context.filePath)`
- Check for typos in file path

Example:

```typescript
import { join, dirname } from 'path';
import { fileExists } from 'claudelint/utils';

const dir = dirname(context.filePath);
const targetFile = join(dir, '../README.md');

if (!(await fileExists(targetFile))) {
  context.report({ message: 'README.md not found' });
}
```

## Async/Await Errors

**Problem:** `await is only valid in async function`

**Solutions:**

- Mark `validate` function as `async`
- Use `await` for async helpers like `readFileContent()` and `fileExists()`
- Don't use `await` with sync helpers (parseJSON, parseYAML, matchesPattern, etc.)

Example:

```typescript
validate: async (context) => {  // Note: async keyword
  const content = await readFileContent('./config.json');
  const exists = await fileExists('./README.md');  // await needed
  const data = parseJSON(content);  // No await needed (sync)
},
```

## Performance Issues

**Problem:** Rule is slow on large files

**Solutions:**

- Use `matchesPattern()` before expensive operations
- Early return if file type doesn't match
- Avoid calling `split('\n')` multiple times (cache it)
- Use `findLinesMatching()` instead of manual iteration
- Limit regex backtracking with atomic groups

Example:

```typescript
validate: async (context) => {
  // Early exit for irrelevant files
  if (!context.filePath.endsWith('.md')) {
    return;
  }

  // Quick check before expensive operation
  if (!matchesPattern(context.fileContent, /TODO:/)) {
    return;  // No TODOs, skip detailed analysis
  }

  // Only parse frontmatter if needed
  const fm = extractFrontmatter(context.fileContent);
  // ...
},
```

## Debugging Tips

**Problem:** Can't figure out why rule isn't working

**Solutions:**

1. Add console.log statements:

```typescript
validate: async (context) => {
  console.log('Validating:', context.filePath);
  const fm = extractFrontmatter(context.fileContent);
  console.log('Frontmatter:', fm);
  // ...
},
```

1. Test rule in isolation:

```typescript
// test-my-rule.ts
import { rule } from './.claudelint/rules/my-rule';

const mockContext = {
  filePath: './test.md',
  fileContent: '---\nversion: 1.0.0\n---\n# Test',
  options: {},
  report: (issue) => console.log('Issue:', issue),
};

rule.validate(mockContext);
```

1. Check file is being validated:

```bash
claudelint check-all --verbose
```

1. Verify rule loads successfully:

```typescript
import { CustomRuleLoader } from 'claudelint/utils';

const loader = new CustomRuleLoader();
const results = await loader.loadCustomRules('.');
console.log(results);
```
