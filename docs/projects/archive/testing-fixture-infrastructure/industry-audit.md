# Industry Audit: Testing Infrastructure Patterns

**Purpose:** Document how ESLint, markdownlint, and stylelint structure their testing infrastructure, and what patterns we should adopt for claudelint.

---

## ESLint

### Architecture

ESLint uses a `RuleTester` class that provides a structured way to test rules with valid/invalid arrays.

```javascript
const ruleTester = new RuleTester();

ruleTester.run("no-unused-vars", rule, {
    valid: [
        "var a = 1; console.log(a);",
        { code: "var a = 1;", options: [{ vars: "local" }] }
    ],
    invalid: [
        {
            code: "var a = 1;",
            errors: [{ messageId: "unusedVar", data: { varName: "a" } }]
        }
    ]
});
```

### Key Patterns

- **Inline strings as primary test format:** Most rule tests use inline code strings, not file-based fixtures. This keeps tests self-contained and easy to read.
- **File fixtures as supplementary:** Complex rules (like import resolution) use file-based fixtures in `tests/fixtures/` directories.
- **messageId enforcement:** Tests assert on structured `messageId` values, not raw error message strings. This prevents tests from breaking when error wording changes.
- **Config comments in fixtures:** Test fixtures use `/* eslint-disable */` comments to control which rules run against specific files.
- **Per-rule test files:** Each rule has its own test file (e.g., `tests/lib/rules/no-unused-vars.js`).

### What We Adopted

- `ClaudeLintRuleTester` (our `tests/helpers/rule-tester.ts`) follows this valid/invalid pattern.
- Each rule has a dedicated test file in `tests/unit/rules/<category>/`.

### What We Didn't Adopt

- ESLint's inline config comments (we use `.claudelintrc.json` per-directory instead).
- ESLint's messageId pattern (our rules use rule IDs for identification).

---

## markdownlint

### Architecture

markdownlint uses file-based fixtures with marker annotations and paired config files.

```text
tests/
  fixtures/
    MD001/
      correct.md          # Valid fixture
      incorrect.md        # Invalid fixture
      incorrect.json      # Expected errors for incorrect.md
```

### Key Patterns

- **{MD###} marker annotations:** Error markers in fixture files indicate where violations occur: `{MD001}`.
- **Paired JSON config files:** Each test fixture has a JSON file describing expected errors (line numbers, rule IDs, error counts).
- **100% coverage enforcement:** Every rule must have both valid and invalid test fixtures.
- **Rule-specific directories:** Each rule gets its own fixture directory (e.g., `tests/fixtures/MD001/`).
- **Snapshot-based assertions:** Expected output is stored in JSON files alongside fixtures.

### What We Adopted

- Rule-specific test coverage via `ClaudeLintRuleTester` valid/invalid arrays (analogous to their correct/incorrect fixtures).

### What We Didn't Adopt

- Marker annotations in fixture files (our errors are identified by rule ID in test assertions).
- Paired JSON config files (our tests use programmatic assertions).
- Per-rule fixture directories (we use fluent builders for programmatic fixture generation).

---

## stylelint

### Architecture

stylelint uses per-test-directory configuration with isolated configs. This is the most robust approach to the "Fixture Breakage Problem."

```text
system-tests/
  001/
    .stylelintrc.json    # Only rules relevant to THIS test
    .testrc.json         # Test metadata (expected exit code, etc.)
    styles.css           # Test input
  002/
    .stylelintrc.json
    .testrc.json
    styles.css
```

### Key Patterns

- **Per-directory config isolation:** Each test directory has its own `.stylelintrc.json` with an explicit rule allow-list. New rules added to the codebase never affect existing tests because they aren't listed in existing configs.
- **Numbered test directories:** System tests are numbered sequentially for easy reference.
- **`testRule` global helper:** A shared test utility that runs stylelint against a directory and asserts on accept/reject outcomes.
- **accept/reject arrays:** Tests declare which inputs should be accepted (no errors) and rejected (expected errors).
- **Forward-compatibility by design:** Adding a new rule to stylelint requires adding a new test directory with its own config. Existing test directories are unaffected.

### What We Are Adopting

- **Per-directory `.claudelintrc.json` configs** for each fixture project (Phase 5). Each fixture project gets a config listing only the rules it is designed to test. This is the primary solution to the Fixture Breakage Problem.
- **Explicit rule allow-lists** instead of implicit "run everything" behavior.

### What We Didn't Adopt

- Numbered test directories (we use descriptive names: `valid-complete`, `invalid-all-categories`).
- `testRule` global helper (we use `ClaudeLintRuleTester` for unit tests and raw CLI execution for integration tests).

---

## Comparative Summary

| Feature | ESLint | markdownlint | stylelint | claudelint (current) | claudelint (planned) |
|---------|--------|-------------|-----------|---------------------|---------------------|
| Unit test format | valid/invalid arrays | fixture files + JSON | accept/reject arrays | valid/invalid arrays | No change |
| Fixture generation | Inline strings | Static files | Static files | Fluent builders + static | Extend builders (Phases 1-3) |
| Config isolation | Inline comments | Per-rule directories | Per-directory config | None | Per-directory config (Phase 5) |
| Forward-compatible | Partial (comments) | Yes (per-rule dirs) | Yes (per-dir config) | No | Yes (Phase 5) |
| Rule ID assertions | messageId | Marker annotations | Rule names | Rule IDs (partial) | Specific rule IDs (Phase 5) |
| Error count pinning | Per-test | Per-fixture JSON | Per-test | No | Yes (Phase 5) |

---

## Key Insight

**Stylelint's per-directory-config approach is the most robust solution to the Fixture Breakage Problem.** In claudelint's case:

1. Each fixture project gets a `.claudelintrc.json` with an explicit rule allow-list.
2. When we add new rules (Milestones 5b, 6, 7, 8), they don't run against existing fixtures unless we explicitly add them to that fixture's config.
3. Adding a new rule requires either creating a new fixture project or adding the rule ID to an existing fixture's config.
4. Integration tests become stable and predictable -- error counts can be pinned because the set of rules is fixed per fixture.

This pattern is adopted in Phase 5 of this milestone.
