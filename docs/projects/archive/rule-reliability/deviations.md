# Rule Reliability -- Implementation Deviations

Tracks any deviations from the original plan during implementation.

---

## Phase 1: Shared Utility Hardening

No deviations. All 4 tasks implemented as planned.

---

## Phase 2: Consolidate Hand-Rolled Parsing

No deviations. All 5 tasks implemented as planned.

---

## Phase 3: Regex Correctness Fixes

**P3-1**: Also switched to `matchAll()` in the same task (the two-pass approach naturally uses `for...of` with `matchAll` instead of `while...exec`). This is consistent with P3-2's intent.

---

## Phase 4: Filesystem & Security Hardening

**P4-2**: The original plan called for adding "test", "fake", "dummy", "mock" as whole-line exemption words. During implementation, the existing test case `AKIAIOSFODNN7EXAMPLE` (AWS's canonical example key) contained "EXAMPLE" embedded in the key value itself, causing a false negative.

**Revised approach**: Instead of matching exemption words anywhere on the line, the filter now:

1. Checks exemption words only in comment-only lines (shell `#`, JS `//`, block `/* */`, HTML `<!-- -->`)
2. For non-comment lines, strips the matched secret pattern first, then checks if the *surrounding context* contains "fake", "dummy", "mock", "sample", or "placeholder"
3. Removed "test" and "example" from the non-comment exemption list since these appear too frequently in real secret values (e.g., `EXAMPLE` in AWS keys, `test` in `test_key_abc123`)

This preserves detection of real secrets while still filtering obvious fixture/mock lines.

---

## Phase 5: Cleanup, Tests & Documentation

**P5-3/P5-4**: Deferred docs regeneration and troubleshooting review. No rule `meta.docs` content was changed (only internal implementation), so auto-generated pages are unaffected. No user-facing behavior changes for well-formed inputs -- all fixes only affect edge cases that were previously silently wrong.

---

## Phase 6: Banned-Pattern CI Script

**P6-1**: The script caught 5 additional violations in rules not covered by the original Phase 2-4 audit:

- `skill-body-too-long.ts` and `skill-time-sensitive-content.ts` used `fileContent.split('---')` -- migrated to `extractBodyContent()`
- `mcp-sse-invalid-url.ts` and `mcp-websocket-invalid-protocol.ts` used `url.includes('$')` -- migrated to specific env var regex
- `hooks-missing-script.ts` used `command.includes('$')` -- migrated to specific env var regex

All 5 were the same class of bugs fixed in Phases 2 and 4. The script proved its value immediately by catching what the manual audit missed.

---

## Phase 7: ESLint Rule-Scoped Restrictions

No deviations. Both tasks implemented as planned.

---

## Phase 8: Rule Authoring Documentation

No deviations. Added forward reference to Phase 9 context fields.

---

## Phase 9: Enrich RuleContext

**P9-2**: Used inline ES getters with null-sentinel caching instead of `Object.defineProperty`. The original plan called for `Object.defineProperty` with `get()`, but inline getters on the context object literal are simpler and achieve the same lazy evaluation. The null sentinel (`null` = not yet computed, `undefined` = computed but empty) avoids re-computing on repeated access.
