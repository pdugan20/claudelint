# Rule Reliability Audit -- Findings

**Date**: 2026-02-14
**Scope**: All 116 rules in `src/rules/`, shared utilities in `src/utils/formats/`, `package.json` dependencies
**Method**: Manual code review of every rule file, regex catalog, dependency analysis

---

## Finding 1: Hand-Rolled YAML Parsing (HIGH)

**File**: `src/rules/skills/skill-frontmatter-unknown-keys.ts:96`

The rule parses YAML top-level keys with regex instead of using the existing js-yaml-backed `extractFrontmatter()` utility:

```typescript
const keyRegex = /^([a-zA-Z][a-zA-Z0-9_-]*):/gm;
```

**What it misses:**

- Quoted keys: `"my-key": value`
- Keys with special characters
- Comment lines containing colons (e.g., `# Note: this is a comment`)

**What exists but isn't used:** `src/utils/formats/markdown.ts` exports `extractFrontmatter()` which calls `js-yaml.load()` and returns a properly parsed object. 30+ other rules already use it.

**Fix**: Replace regex with `extractFrontmatter()` + `Object.keys()`.

---

## Finding 2: Fragile Code Block Stripping (HIGH)

**Files**: `src/rules/skills/skill-xml-tags-anywhere.ts:136`, `src/rules/skills/skill-unknown-string-substitution.ts:79`

Both rules strip code blocks with:

```typescript
fileContent.replace(/```[\s\S]*?```/g, '').replace(/`[^`]+`/g, '');
```

**Failure modes:**

1. **Unclosed backtick fence**: The lazy `*?` quantifier finds no match, leaving the entire "code block" content to be scanned as regular text -- producing false positives.
2. **Tilde fences** (`~~~`): Valid Markdown but not matched at all.
3. **Inline code edge case**: `` `[^`]+` `` requires at least one character between backticks, so empty inline code ``` `` ``` would leave the backtick characters in the output.

**What exists but isn't extracted:** `extractImportsWithLineNumbers()` in `markdown.ts:74-108` already does correct line-by-line code block tracking with state management.

**Fix**: Extract `stripCodeBlocks()` utility using the line-by-line approach.

---

## Finding 3: `extractBodyContent` Naive Splitting (MEDIUM)

**File**: `src/utils/formats/markdown.ts:158-168`

```typescript
export function extractBodyContent(content: string): string {
  const parts = content.split('---');
  if (parts.length < 3) return '';
  return parts.slice(2).join('---').trim();
}
```

`split('---')` breaks when frontmatter YAML contains `---`:

```yaml
---
name: test
description: "A --- separator in a value"
---
Body content here
```

Produces 5 parts instead of 3. `slice(2).join('---')` returns `separator in a value"\n---\nBody content here` -- incorrect.

**Fix**: Use the frontmatter regex (which handles this correctly with lazy matching) instead of naive splitting.

---

## Finding 4: Regex Injection in `getFrontmatterFieldLine` (MEDIUM)

**File**: `src/utils/formats/markdown.ts:134`

```typescript
const fieldRegex = new RegExp(`^\\s*${fieldName}\\s*:`);
```

`fieldName` is injected into `new RegExp()` without escaping. Currently safe because known field names (e.g., `allowed-tools`) don't contain regex metacharacters, but this is a latent bug.

**Fix**: Escape metacharacters before constructing the regex.

---

## Finding 5: Windows Line Endings in Frontmatter Regex (LOW)

**File**: `src/utils/formats/markdown.ts:19`

```typescript
const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
```

Uses `\n` explicitly. Files with `\r\n` endings will include `\r` in captured groups. While js-yaml tolerates this, downstream comparisons may be affected.

**Fix**: Normalize `\r\n` to `\n` at the entry point of `extractFrontmatter()`.

---

## Finding 6: `$VARIABLE` Detection Matches Partial Tokens (MEDIUM)

**File**: `src/rules/skills/skill-unknown-string-substitution.ts:84`

```typescript
const invalidSubstitutionRegex = /\$[A-Z_]+(?!\{)/g;
```

The negative lookahead `(?!\{)` is intended to exclude `${VAR}` syntax, but the regex still matches partial tokens. In `${VARIABLE}`, `$V` matches because the character after `V` is `A` (not `{`), so the lookahead passes.

**Fix**: Two-pass approach -- strip `${...}` first, then scan for bare `$UPPERCASE`.

---

## Finding 7: Global Regex `lastIndex` State (LOW)

**File**: `src/rules/claude-md/claude-md-file-reference-invalid.ts:85`

```typescript
FILE_PATH_REGEX.lastIndex = 0;
while ((match = FILE_PATH_REGEX.exec(line)) !== null) {
```

Manual `lastIndex` resets on a module-level global regex are error-prone. If the reset is omitted (e.g., during refactoring), the regex silently skips matches.

**Fix**: Use `String.prototype.matchAll()` which creates a fresh iterator.

---

## Finding 8: XML Tag Regex Backtracking (LOW)

**File**: `src/rules/skills/skill-xml-tags-anywhere.ts:139`

```typescript
const xmlTagRegex = /<\/?([a-zA-Z][a-zA-Z0-9_-]*)\b[^>]*\/?>/g;
```

`[^>]*` can cause backtracking on malformed input containing `>` inside quoted attributes. Risk is low since code blocks are stripped first, but defense-in-depth via a length cap is worthwhile.

**Fix**: Add reasonable length limit: `[^>]{0,200}`.

---

## Finding 9: Symlink Loop in Directory Traversal (MEDIUM)

**File**: `src/rules/skills/skill-deep-nesting.ts:26-43`

```typescript
const subdirs = entries.filter(
  (entry) => entry.isDirectory() && entry.name !== 'node_modules'
);
```

No symlink check. A symlink loop causes infinite recursion until stack overflow. The `withFileTypes: true` option already provides `isSymbolicLink()` on Dirent entries.

**Fix**: Add `!entry.isSymbolicLink()` to the filter. Add a hard recursion cap as defense-in-depth.

---

## Finding 10: Secret Detection Comment Filter Too Narrow (MEDIUM)

**File**: `src/rules/skills/skill-hardcoded-secrets.ts:120`

```typescript
if (/^\s*#.*example|^\s*#.*placeholder|^\s*\/\//i.test(line)) {
  continue;
}
```

Only skips shell comments (`#`) and bare `//` prefixes. Misses:

- Inline comments: `key = "sk-ant-..." # example key`
- Lines with "test", "fake", "dummy", "mock" indicators
- Block comments (`/* */`, `<!-- -->`)

**Fix**: Expand the exemption patterns to cover common false-positive indicators.

---

## Finding 11: Overly Broad URL Variable Detection (LOW)

**Files**: `src/rules/mcp/mcp-http-invalid-url.ts:64`, `src/rules/mcp/mcp-websocket-invalid-url.ts:70`

```typescript
if (url.includes('${') || url.includes('$'))
```

`url.includes('$')` matches any URL containing `$`, including legitimate ones like `http://example.com?price=$100`.

**Fix**: Replace with a specific env var pattern: `/\$\{[A-Z_]+\}|\$[A-Z_]+/`.

---

## Finding 12: Dead Dependencies (LOW)

**File**: `package.json`

`ajv` (8.17.1) and `ajv-formats` (3.0.1) are in devDependencies but never imported. All schema validation uses Zod. Confirmed by grepping all `src/` and `tests/` files.

**Fix**: Remove both dependencies.

---

## Finding 13: Duplicated Frontmatter Extraction (LOW)

**Files**: `src/rules/skills/skill-description-max-length.ts:81`, `src/rules/skills/skill-body-word-count.ts:93`

Both hand-roll frontmatter extraction regex inline instead of using the shared `extractFrontmatter()` utility that 30+ other rules already use.

**Fix**: Replace with shared utility calls.

---

## Findings NOT Acted On

The following audit findings were evaluated and intentionally **not included** in the project scope:

| Finding | Reason for exclusion |
|---------|---------------------|
| Replace regex Markdown parsing with `remark`/`markdown-it` AST | Overkill for current needs. Line-by-line state tracking is sufficient and avoids a new dependency. |
| Replace secret detection with `detect-secrets` library | Out of scope. Our patterns cover common API key formats. A full secret scanner is beyond a linting tool for config files. |
| Use `gray-matter` for frontmatter parsing | Marginal improvement. Our regex + js-yaml approach works correctly. |
| Cross-platform path handling with `path.normalize()` | Low risk. The tool is designed for Claude Code which runs on macOS/Linux. Windows support is out of current scope. |
| Runtime schema validation of rule options | Rules use TypeScript types + Zod schemas. Adding runtime validation on every rule invocation adds overhead for minimal benefit. |
| File reference detection heuristics | The current `shouldSkipPath()` heuristics are reasonable. Improving them further has diminishing returns and risk of new false positives. |

---

## Methodology

1. **Regex catalog**: Grepped all `src/rules/` files for `/regex/` patterns, `new RegExp()`, `.match()`, `.test()`, `.replace()` to build a complete inventory of regex usage.
2. **Dependency analysis**: Cross-referenced `package.json` dependencies with actual imports across `src/` and `tests/`.
3. **Utility adoption check**: Compared shared utilities in `src/utils/formats/` against inline implementations in rules to find duplication.
4. **Edge case analysis**: For each regex pattern, constructed inputs that could cause false positives, false negatives, or performance issues (catastrophic backtracking).
5. **Security review**: Checked for injection vectors (regex injection, path traversal via symlinks), unvalidated external input, and insufficient secret filtering.
