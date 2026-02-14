# Rule Reliability & Parsing Hardening

**Status**: Complete
**Created**: 2026-02-14
**Last Updated**: 2026-02-14
**Target Release**: 0.3.0

---

## Problem

A comprehensive audit of all 116 rules revealed systemic reliability issues in how rules parse and validate content. The most significant problems fall into three categories:

1. **Hand-rolled parsing**: Several rules duplicate frontmatter extraction with inline regex instead of using the shared `extractFrontmatter()` utility backed by js-yaml. One rule (`skill-frontmatter-unknown-keys`) parses YAML keys with a regex that misses quoted keys, comments, and nested structures -- despite js-yaml already being a dependency.

2. **Fragile code block stripping**: Two rules strip Markdown code blocks with a regex (`/```[\s\S]*?```/g`) that fails on unclosed backticks, `~~~` fences, and nested structures. The correct line-by-line state-tracking approach already exists in `extractImportsWithLineNumbers()` but isn't extracted as a reusable utility.

3. **Regex correctness bugs**: The `$VARIABLE` substitution detector matches partial tokens inside `${VARIABLE}` syntax. Global regex patterns use manual `lastIndex` resets instead of `matchAll()`. The `getFrontmatterFieldLine` helper injects unescaped user input into `new RegExp()`. The `extractBodyContent` function splits on `---` naively, breaking when frontmatter YAML contains that string.

Additionally: the directory traversal in `skill-deep-nesting` has no symlink loop protection, secret detection skips only shell comments (missing `//` and `/* */`), MCP URL validation uses overly broad `$` detection, and `ajv`/`ajv-formats` are dead devDependencies.

## Documents

- [Progress Tracker](progress-tracker.md) -- Central tracker with discrete phases and tasks
- [Audit Findings](audit-findings.md) -- Full audit report with file paths and line numbers

## Design Principles

1. **Use what exists**: The shared `extractFrontmatter()` utility and js-yaml are already correct -- rules should use them instead of hand-rolling regex.
2. **Extract, don't duplicate**: Where multiple rules need the same operation (code block stripping), extract a shared utility tested once.
3. **Fix the regex, don't add a library**: Most regex issues are anchoring or escaping bugs, not cases where a full parser library is needed.
4. **Test the edge cases**: Every fix adds test cases for the specific inputs that were previously broken.
5. **No behavior changes for passing inputs**: Rules should produce identical results for well-formed inputs. Only broken edge cases change.

## Phases

| Phase | Focus | Tasks | Status |
|-------|-------|-------|--------|
| 1 | Shared utility hardening | 4 | Complete |
| 2 | Consolidate hand-rolled parsing | 5 | Complete |
| 3 | Regex correctness fixes | 3 | Complete |
| 4 | Filesystem & security hardening | 3 | Complete |
| 5 | Cleanup, tests & documentation | 4 | Complete |
| 6 | Banned-pattern CI script | 4 | Complete |
| 7 | ESLint rule-scoped restrictions | 2 | Complete |
| 8 | Rule authoring documentation | 1 | Complete |
| 9 | Enrich RuleContext with pre-parsed data | 3 | Complete |
| 10 | Pre-commit integration & verification | 2 | Complete |

**Total**: 30 tasks

## Key Files

### Shared Utilities (Phase 1)

- `src/utils/formats/markdown.ts` -- Frontmatter extraction, body extraction, code block stripping (new)

### Rules Modified (Phases 2-4, 6a)

- `src/rules/skills/skill-frontmatter-unknown-keys.ts`
- `src/rules/skills/skill-description-max-length.ts`
- `src/rules/skills/skill-body-word-count.ts`
- `src/rules/skills/skill-xml-tags-anywhere.ts`
- `src/rules/skills/skill-unknown-string-substitution.ts`
- `src/rules/skills/skill-deep-nesting.ts`
- `src/rules/skills/skill-hardcoded-secrets.ts`
- `src/rules/skills/skill-reference-not-linked.ts` (Phase 6a)
- `src/rules/skills/skill-referenced-file-not-found.ts` (Phase 6a)
- `src/rules/claude-md/claude-md-file-reference-invalid.ts`
- `src/rules/mcp/mcp-websocket-invalid-url.ts`
- `src/rules/mcp/mcp-http-invalid-url.ts`

### Regression Prevention (Phases 6-10)

- `scripts/check/rule-patterns.ts` -- Banned anti-pattern scanner (Phase 6)
- `.eslintrc.json` -- `no-restricted-syntax` / `no-restricted-imports` overrides (Phase 7)
- `src/CLAUDE.md` -- Rule authoring utility docs (Phase 8)
- `src/types/rule.ts` -- Enriched RuleContext with pre-parsed data (Phase 9)
- `src/validators/file-validator.ts` -- Lazy getter population (Phase 9)
- `tests/validators/rule-context.test.ts` -- RuleContext enrichment tests (Phase 9)

### Tests

- `tests/utils/markdown.test.ts` -- New/expanded tests for shared utilities
- `tests/rules/skill-frontmatter-unknown-keys.test.ts`
- `tests/rules/skill-description-max-length.test.ts`
- `tests/rules/skill-body-word-count.test.ts`
- `tests/rules/skill-xml-tags-anywhere.test.ts`
- `tests/rules/skill-unknown-string-substitution.test.ts`
- `tests/rules/skill-deep-nesting.test.ts`
- `tests/rules/skill-hardcoded-secrets.test.ts`
- `tests/rules/claude-md-file-reference-invalid.test.ts`
- `tests/rules/mcp-websocket-invalid-url.test.ts`
- `tests/rules/mcp-http-invalid-url.test.ts`
- `tests/validators/rule-context.test.ts` (Phase 9, new)

### Cleanup

- `package.json` -- Remove dead `ajv` / `ajv-formats` devDependencies

### Website (Auto-Generated)

- Rule documentation pages are auto-generated from `rule.meta.docs` via `npm run docs:generate`
- No manual website edits needed unless rule descriptions or examples change substantively

## Verification

```bash
npm run build
npm test
npm run check:self
npm run lint
npm run docs:generate
```
