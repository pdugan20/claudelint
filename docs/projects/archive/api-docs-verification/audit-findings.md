# API Docs Audit Findings

Complete audit of `website/api/` documentation pages vs actual source code in `src/api/` and `src/index.ts`.

**Audit Date:** 2026-02-16

## Critical Issues

### C1. RuleMetadata type mismatch

`getRules()` and `getRulesMetaForResults()` in `src/api/claudelint.ts` import `RuleMetadata` from `src/types/rule.ts` (internal type), but the public API types file (`src/api/types.ts`) and docs define a completely different `RuleMetadata`.

**Internal type (`src/types/rule.ts`):**

- `id: RuleId` (not `ruleId`)
- `name: string` (not in public type)
- `severity: 'off' | 'warn' | 'error'` (not `'error' | 'warning'`)
- `deprecated?: boolean | DeprecationInfo` (not in public type)
- `since: string` (not in public type)
- `docUrl?: string` (docs call it `docs?: string`)
- `schema?: z.ZodType` (not in public type)
- `defaultOptions?: Record<string, unknown>` (not in public type)
- `docs?: RuleDocumentation` (different type than public)

**Public type (`src/api/types.ts` and docs):**

- `ruleId: string`
- `description: string`
- `category: string`
- `severity: 'error' | 'warning'`
- `fixable: boolean`
- `explanation?: string`
- `docs?: string`

**Resolution options:**

- A) Add a mapping layer in `getRules()`/`getRulesMetaForResults()` that converts internal type to the documented public type
- B) Update the public type to match internal and update docs

Option A is correct -- the public API should present a clean, stable interface.

### C2. sarif formatter documented but not implemented in API

`BUILTIN_FORMATTERS` includes `'sarif'` and `claudelint-class.md` documents it as a built-in formatter name, but `loadBuiltinFormatter()` in `src/api/formatter.ts` has no `sarif` case. Calling `loadFormatter('sarif')` throws at runtime.

SARIF works CLI-only via `Reporter.reportAllSARIF()` in `src/utils/reporting/reporting.ts`.

**Resolution:** Either implement `src/api/formatters/sarif.ts` as a proper API formatter, or remove `sarif` from `BUILTIN_FORMATTERS` and document it as CLI-only.

### C3. FixInfo always returns placeholder values

`convertAutoFixToFixInfo()` in `src/api/message-builder.ts` always returns `{ range: [0, 0], text: '' }`. The documented semantics (character offsets and replacement text) are never actually provided to API consumers.

**Resolution:** Either implement real FixInfo population, or document the limitation and clarify that `fix` being present just signals fixability (the actual fix is applied internally via `outputFixes()`).

## Moderate Issues

### M1. BaseFormatter.getSummary() return type wrong

**Docs say:** `{ errors: number; warnings: number; fixable: number }`

**Code returns:** `{ fileCount: number; errorCount: number; warningCount: number; fixableErrorCount: number; fixableWarningCount: number; totalIssues: number }`

**Resolution:** Update docs to match code.

### M2. ClaudeLintConfig.output type mismatch

**Docs say:** `format` is `string`

**Code uses:** `format: 'stylish' | 'json' | 'compact' | 'sarif' | 'github'`

Code also has undocumented `collapseRepetitive?: boolean` field.

**Resolution:** Update docs to show the union type and document `collapseRepetitive`.

### M3. github formatter undocumented in class docs

The `github` formatter exists in `src/api/formatters/github.ts` and is in `BUILTIN_FORMATTERS`, but `claudelint-class.md` only lists `stylish`, `json`, `compact`, `sarif` as built-in names.

**Resolution:** Add `github` to the documented list.

### M4. Overview table: functional API progress callbacks

The overview table claims functional API has no progress callbacks. This is wrong -- `lint()` accepts `LintOptions` (= `ClaudeLintOptions`) which includes `onStart`, `onProgress`, `onComplete`.

**Resolution:** Update the overview table.

### M5. ClaudeLintConfig.rules type

**Docs say:** `Record<string, RuleConfig>`

**Code allows:** `Record<string, RuleConfig | 'off' | 'warn' | 'error'>` (shorthand strings in the union)

Same issue applies to `ConfigOverride.rules`.

**Resolution:** Update docs to show the shorthand is accepted.

## Minor Issues

### m1. DeprecatedRuleUsage type undocumented

Referenced in `LintResult.deprecatedRulesUsed` docs but never defined on the types page.

**Resolution:** Add the type definition to the types page. Fields: `ruleId`, `reason`, `replacedBy?`, `deprecatedSince?`, `removeInVersion?`, `url?`.

### m2. endLine/endColumn/suggestions never populated

`LintMessage.endLine`, `endColumn`, and `suggestions` are defined in the type but never populated by `buildLintMessage()`. Always `undefined` at runtime.

**Resolution:** Add a note in the types docs that these are reserved for future use.

### m3. formatResults options type mismatch

**Docs say:** `FormatterOptions` (has `cwd` and `color`)

**Code uses:** `{ cwd?: string }` (no `color`)

**Resolution:** Update docs to match code, or add `color` support to the function.

### m4. Exported but undocumented

These are exported from `src/index.ts` but not on any docs page:

- `loadFormatter` (standalone function)
- `BUILTIN_FORMATTERS` (constant array)
- `BuiltinFormatterName` (type)

**Resolution:** Add to functional API or types page.

### m5. LintOptions type undocumented

Exported as `type LintOptions = ClaudeLintOptions`. Mentioned in passing but not defined on the types page.

**Resolution:** Add to types page (even if just as an alias note).

### m6. resolveConfig and getFileInfo options types

Docs reference named types (`ConfigOptions`, `FileInfoOptions`), code uses inline `{ cwd?: string }`.

**Resolution:** Minor -- docs are technically correct since the named types exist in `src/api/types.ts`. No action needed.
