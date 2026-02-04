# Fixtures Directory Assessment

## Current Structure

```text
tests/fixtures/
├── claude-md/              # CLAUDE.md validation test fixtures
├── custom-rules/           # Custom rule examples for testing
├── manual/                 # OLD manual testing fixtures (DEPRECATED)
├── projects/               # NEW realistic project fixtures
└── skills/                 # Skill validation fixtures (UNUSED)
```

## Usage Analysis

### claude-md/ - ACTIVELY USED ✓

**Purpose:** Test fixtures for CLAUDE.md file validation rules

**Used By:**

- `tests/api/claudelint.test.ts`
- `tests/integration/cli.test.ts`
- `tests/integration/config-integration.test.ts`
- `tests/integration/plugin.integration.test.ts`
- `tests/integration/workspace-cli.test.ts`

**Files:**

- `valid.md` - Valid CLAUDE.md
- `oversized.md` - Tests size limits
- `circular-import.md` - Tests circular import detection
- `missing-import.md` - Tests missing import detection
- `invalid-frontmatter.md` - Tests frontmatter parsing
- `.claude/rules/*.md` - Import target files

**Status:** KEEP - Essential for validation testing

**Organization:** ✓ Good - Clear naming, documented purpose

### custom-rules/ - ACTIVELY USED ✓

**Purpose:** Test fixtures for custom rule loading and execution

**Used By:**

- `tests/integration/custom-rules.integration.test.ts`
- `tests/utils/custom-rule-loader.test.ts`

**Files:**

- `valid-custom-rule.ts` - Example of correct custom rule
- `invalid-no-meta.ts` - Tests error handling (missing meta)
- `invalid-no-validate.ts` - Tests error handling (missing validate)
- `team-conventions.ts` - Example team-specific rule
- `README.md` - Documentation

**Status:** KEEP - Essential for custom rule testing

**Organization:** ✓ Good - Clear naming, has README

### manual/ - DEPRECATED ⚠️

**Purpose:** OLD manual testing approach (standalone files)

**Used By:**

- `scripts/test/manual/task-1-optimize-without-skill/setup.sh`
- `scripts/test/manual/task-1-optimize-without-skill/verify.sh`

**Files:**

- `bloated-realistic.md` - Old bloated CLAUDE.md
- `bloated-realistic-expected.md` - Expected result
- `README.md` - Documents old approach

**Status:** DEPRECATE - Replaced by `projects/`

**Issues:**

- Standalone file approach is broken (no project context)
- Task 1 still uses this (needs updating)
- Superseded by realistic fixture projects

**Recommendation:**

1. Update Task 1 to use projects/ fixtures
2. Add deprecation notice to README.md
3. Remove in future cleanup (after Task 1 updated)

### projects/ - NEW & ACTIVELY USED ✓

**Purpose:** Realistic project fixtures for manual testing

**Used By:**

- `scripts/test/manual/task-2-optimize-with-skill/setup.sh`
- `scripts/test/manual/task-2-optimize-with-skill/verify.sh`

**Structure:**

```text
projects/
├── README.md                     # Comprehensive documentation
└── react-typescript-bloated/     # Primary fixture
    ├── README.md                 # Fixture documentation
    ├── package.json              # Real dependencies
    ├── tsconfig.json             # TS configuration
    ├── src/                      # Real code
    │   ├── App.tsx
    │   └── index.tsx
    ├── CLAUDE.md                 # Bloated (13KB)
    └── .expected/                # Expected outputs
        ├── CLAUDE.md             # Optimized (3KB)
        └── .claude/rules/        # @import files
```

**Status:** KEEP - New industry-standard approach

**Organization:** ✓ Excellent

- Complete project with real code
- Comprehensive documentation
- Expected outputs for validation
- Follows ESLint/TypeScript-ESLint patterns

### skills/ - UNUSED ❌

**Purpose:** Skill validation test fixtures

**Used By:** NONE (0 references found)

**Files:**

- `valid/SKILL.md` - Example valid skill
- `dangerous-command/` - Example dangerous skill
- `no-version/` - Example skill missing version

**Status:** REMOVE or DOCUMENT USAGE

**Issues:**

- No tests reference these fixtures
- Unclear purpose vs actual skill tests
- May be orphaned from old architecture

**Recommendation:**

1. Check if these were supposed to be used
2. If needed, create tests that use them
3. If not needed, remove them

## Best Practices Compliance

### ✓ Following Best Practices

1. **Organized by Purpose** - Each directory serves a specific test domain
2. **Documentation** - Most directories have README files
3. **Realistic Fixtures** - `projects/` follows ESLint patterns
4. **Expected Outputs** - `projects/` includes `.expected/` for validation
5. **Minimal but Complete** - Each fixture includes only what's needed

### ⚠️ Areas for Improvement

1. **Deprecation Path** - `manual/` needs clear deprecation timeline
2. **Unused Fixtures** - `skills/` appears orphaned
3. **Inconsistent Documentation** - Not all directories have READMEs
4. **Task 1 Dependency** - Still uses deprecated `manual/` fixtures

## Recommendations

### High Priority

1. **Deprecate manual/ properly**

   ```bash
   # Add to manual/README.md
   # DEPRECATED: This fixture approach is replaced by tests/fixtures/projects/
   # See: tests/fixtures/projects/README.md
   ```

2. **Update Task 1 to use projects/ fixtures**
   - Task 1 tests without skill loaded
   - Should still use realistic project (just different workflow)
   - Update `task-1-optimize-without-skill/setup.sh`

3. **Remove or document skills/ fixtures**
   - Either create tests that use them
   - Or remove if truly orphaned

### Medium Priority

1. **Add README to claude-md/**
   - Document what each fixture tests
   - Explain naming conventions
   - List which tests use which fixtures

2. **Consider .gitignore for fixtures**
   - Add `**/node_modules/` to avoid accidental commits
   - Already handled for `projects/` (not committed)

### Low Priority

1. **Consistent naming**
   - `manual/` → `legacy/` (clearer deprecation signal)
   - All fixture dirs use consistent casing

## Proposed Structure (After Cleanup)

```text
tests/fixtures/
├── README.md                # Overview of all fixtures
├── claude-md/               # CLAUDE.md validation tests
│   └── README.md            # Documents each fixture
├── custom-rules/            # Custom rule examples
│   └── README.md            # (already exists)
├── projects/                # Realistic project fixtures
│   └── README.md            # (already exists)
└── legacy/                  # Old fixtures (to be removed)
    └── DEPRECATED.md        # Deprecation notice
```

## Action Items

- [ ] Add deprecation notice to `manual/README.md`
- [ ] Create `claude-md/README.md`
- [ ] Investigate `skills/` usage (remove if unused)
- [ ] Update Task 1 to use `projects/` fixtures
- [ ] Add top-level `tests/fixtures/README.md`
- [ ] Consider renaming `manual/` → `legacy/`
- [ ] Schedule cleanup (remove `legacy/` after Task 1 updated)

## Industry Comparison

**ESLint** (`tests/fixtures/`):

- Organizes by feature/rule category
- Each fixture is minimal but complete
- Clear naming conventions
- Documentation for complex fixtures

**TypeScript-ESLint** (`packages/*/tests/fixtures/`):

- One fixture per test scenario
- Kebab-case naming
- Each fixture hyper-focused
- README for non-obvious cases

**Our Approach:**

- ✓ Organized by purpose (validation, custom rules, projects)
- ✓ Minimal but complete fixtures
- ✓ Clear naming in `projects/`
- ⚠️ Mixed naming in older fixtures
- ⚠️ Some orphaned/deprecated fixtures
- ✓ Good documentation for new fixtures

**Overall Grade:** B+ (Good, with room for cleanup)

## Conclusion

The fixtures directory is **mostly well-organized** with some legacy issues:

**Strengths:**

- New `projects/` directory follows best practices
- Clear separation of concerns
- Good documentation for new work

**Weaknesses:**

- Deprecated `manual/` still in use by Task 1
- Possibly unused `skills/` fixtures
- Inconsistent documentation across fixtures

**Next Steps:** Focus on deprecating `manual/` and updating Task 1, then cleanup can proceed.
