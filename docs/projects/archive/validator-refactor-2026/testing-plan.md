# Testing Plan

This document outlines the comprehensive testing strategy for the validator refactoring project.

## Testing Objectives

1. [x] Ensure no breaking changes to public API
2. [x] Verify all validators work correctly after refactoring
3. [x] Confirm composition framework removal doesn't break functionality
4. [x] Validate that all 324 rules still function
5. [x] Ensure performance is maintained or improved

---

## Pre-Refactoring Baseline

### Establish Baseline Metrics

**Before starting Phase 1, run:**

```bash
# Run full test suite
npm test -- --coverage > baseline-tests.txt

# Run linter
npm run lint > baseline-lint.txt

# Run type checker
npm run type-check > baseline-types.txt

# Build project
npm run build > baseline-build.txt

# Run on claudelint itself
npm run claudelint . > baseline-claudelint.txt

# Measure performance
time npm test > baseline-perf.txt
```

**Record:**

- Total test count:
- Passing tests:
- Coverage percentage:
- Build time:
- Test execution time:

---

## Phase 1 Testing: Foundation

### After Composition Framework Removal (Task 1.2.2)

**Test:** Verify no broken imports

```bash
# Should succeed (composition imports removed)
npm run build
```

**Expected:** Build succeeds after removing composition imports from json-config-base.ts

### After Simplifying SchemaValidator (Task 1.3.1)

**Test:** Verify JSON validation still works

```bash
# Create test JSON file
echo '{"invalid": json}' > /tmp/test-invalid.json

# Run MCP validator (uses SchemaValidator)
npm run claudelint -- /tmp/test-invalid.json
```

**Expected:** Should report JSON syntax error

### After Renaming Validators (Task 1.4.x)

**Test:** Verify imports resolve correctly

```bash
npm run build
```

**Expected:** Build succeeds with no module resolution errors

### After Updating All Validators (Task 1.6.x)

**Test:** Run all validators

```bash
# Test each validator category
npm run claudelint .
```

**Expected:** All validators execute without errors

### Phase 1 Complete Validation (Task 1.7.x)

**Test suite:**

```bash
# Full build
npm run build

# Full test suite
npm test

# Linter
npm run lint

# Type checker
npm run type-check
```

**Expected:**

- [x] All tests pass
- [x] Build succeeds
- [x] No lint errors
- [x] No type errors

---

## Phase 2 Testing: Standardization

### After Pattern Migration (Task 2.2.x)

**Test:** Verify all validators use executeRulesForCategory

```bash
# Search for any manual rule imports
grep -r "import.*from.*rules/" src/validators/

# Should find imports in rule files, not validator files
```

**Expected:** Validators don't manually import rules (they use category-based execution)

### After Adding JSDoc (Task 2.3.x, 2.4.x)

**Test:** Verify documentation appears in IDE

1. Open `src/validators/file-validator.ts` in IDE
2. Hover over `FileValidator` class
3. Verify JSDoc appears with examples

**Expected:** Comprehensive documentation visible in IDE hover

### Phase 2 Complete Validation (Task 2.5.x)

```bash
npm run build && npm test
```

**Expected:** All tests pass, build succeeds

---

## Phase 3 Testing: Documentation

### After Creating validation-architecture.md (Task 3.1.x)

**Test:** Verify markdown formatting

```bash
# Run markdownlint on new doc
npm run lint:md docs/validation-architecture.md
```

**Expected:** No markdown lint errors

### After Updating Existing Docs (Task 3.2.x)

**Test:** Verify all links work

```bash
# Check for broken internal links
grep -r "BaseValidator\|JSONConfigValidator" docs/

# Should find references only in historical/changelog docs
```

**Expected:** Only intentional references to old names remain

### Phase 3 Complete Validation (Task 3.4.x)

**Manual review:**

- [ ] Read validation-architecture.md completely
- [ ] Verify examples are correct
- [ ] Test code examples compile
- [ ] Check all internal links work

---

## Phase 4 Testing: Final Validation

### Unit Tests (Task 4.1.1)

**Run with coverage:**

```bash
npm test -- --coverage
```

**Verify:**

- [ ] All tests pass
- [ ] Coverage maintained or improved
- [ ] No skipped tests
- [ ] No test timeouts

**Expected coverage:**

- Overall: ≥80%
- Validators: ≥90%
- Core logic: ≥95%

### Integration Tests (Task 4.1.2-4.1.4)

**Linting:**

```bash
npm run lint
```

**Expected:** No errors

**Type checking:**

```bash
npm run type-check
# or
npx tsc --noEmit
```

**Expected:** No type errors

**Build:**

```bash
npm run build
```

**Expected:** Clean build with no warnings

### Validator Category Testing (Task 4.2.2)

**Test each validator type:**

#### 1. CLAUDE.md Validator (FileValidator)

```bash
# Test valid CLAUDE.md
cat > /tmp/test-claude.md <<'EOF'
# Test CLAUDE.md

This is a test file.
EOF

npm run claudelint -- /tmp/test-claude.md
```

**Expected:** No errors for valid file

**Test invalid:**

```bash
# Create oversized CLAUDE.md (>40KB)
yes "test content" | head -n 5000 > /tmp/test-large-claude.md

npm run claudelint -- /tmp/test-large-claude.md
```

**Expected:** Size error reported

#### 2. Skills Validator (FileValidator)

```bash
# Test valid skill
mkdir -p /tmp/test-skill
cat > /tmp/test-skill/SKILL.md <<'EOF'
---
name: test-skill
description: Test skill for validation
---

# Usage

Test skill content that is long enough to pass validation requirements.
This needs to be at least 50 characters to meet the minimum length.
EOF

npm run claudelint -- /tmp/test-skill
```

**Expected:** No errors

#### 3. MCP Validator (SchemaValidator)

```bash
# Test valid MCP config
cat > /tmp/test.mcp.json <<'EOF'
{
  "mcpServers": {
    "test-server": {
      "command": "node",
      "args": ["server.js"]
    }
  }
}
EOF

npm run claudelint -- /tmp/test.mcp.json
```

**Expected:** No errors

**Test invalid schema:**

```bash
# Missing required field
cat > /tmp/test-invalid.mcp.json <<'EOF'
{
  "mcpServers": {
    "test-server": {
      "args": ["server.js"]
    }
  }
}
EOF

npm run claudelint -- /tmp/test-invalid.mcp.json
```

**Expected:** Schema validation error (missing 'command')

#### 4. Settings Validator (SchemaValidator)

```bash
# Test valid settings.json
cat > /tmp/settings.json <<'EOF'
{
  "permissions": {
    "bash": {
      "allow": ["npm", "git"]
    }
  }
}
EOF

npm run claudelint -- /tmp/settings.json
```

**Expected:** No errors

#### 5. Hooks Validator (SchemaValidator)

```bash
# Test valid hooks.json
cat > /tmp/hooks.json <<'EOF'
{
  "hooks": [
    {
      "event": "pre-commit",
      "command": "npm test"
    }
  ]
}
EOF

npm run claudelint -- /tmp/hooks.json
```

**Expected:** No errors

#### 6. Plugin Validator (SchemaValidator)

**Test on existing plugins in test fixtures**

#### 7. LSP Validator (SchemaValidator)

**Test on existing LSP configs**

#### 8. Agents Validator (FileValidator)

**Test on agent directories**

#### 9. Output Styles Validator (FileValidator)

**Test on output style files**

#### 10. Commands Validator (FileValidator)

```bash
# Should warn about deprecation
```

**Expected:** Deprecation warning

### Real Project Testing (Task 4.2.3)

**Test on claudelint itself:**

```bash
cd /path/to/claudelint
npm run claudelint .
```

**Expected:** All validations pass

**Test on external project (if available):**

```bash
cd /path/to/external/claude/project
/path/to/claudelint/bin/claudelint .
```

**Expected:** Validators work correctly

---

## Regression Testing

### Test Cases That Must Still Work

#### 1. Config Resolution

**Test:** Rule options from .claudelintrc.json

```bash
# Create config
cat > /tmp/.claudelintrc.json <<'EOF'
{
  "rules": {
    "claude-md-size-error": ["error", { "maxSize": 50000 }]
  }
}
EOF

# Create oversized file (45KB, under custom limit)
yes "test" | head -n 11000 > /tmp/CLAUDE.md

cd /tmp
npm run claudelint -- CLAUDE.md
```

**Expected:** No error (custom limit is 50KB)

#### 2. Inline Disable Comments

**Test:** claudelint-disable works

```bash
cat > /tmp/CLAUDE.md <<'EOF'
# Test

<!-- claudelint-disable claude-md-size-error -->
(Very large content here would normally trigger error)
<!-- claudelint-enable claude-md-size-error -->
EOF

npm run claudelint -- /tmp/CLAUDE.md
```

**Expected:** Rule disabled, no error

#### 3. Multiple Files

**Test:** Batch validation

```bash
mkdir -p /tmp/batch-test/.claude/skills
echo "# CLAUDE.md" > /tmp/batch-test/CLAUDE.md
echo "---\nname: skill1\n---\n# Skill" > /tmp/batch-test/.claude/skills/skill1.md

npm run claudelint -- /tmp/batch-test
```

**Expected:** Both files validated

#### 4. Error Output Format

**Test:** Errors formatted correctly

```bash
npm run claudelint -- /tmp/invalid-file.json 2>&1 | tee error-output.txt
```

**Expected:**

- File path shown
- Line numbers (if applicable)
- Rule IDs
- Clear error messages

#### 5. Exit Codes

**Test:** Proper exit codes

```bash
# Valid file
npm run claudelint -- /tmp/valid.md
echo "Exit code: $?"  # Should be 0

# Invalid file
npm run claudelint -- /tmp/invalid.md
echo "Exit code: $?"  # Should be 1
```

---

## Performance Testing

### Test Execution Speed

**Before refactoring:**

```bash
time npm test
# Record: X seconds
```

**After refactoring:**

```bash
time npm test
# Record: Y seconds
# Compare: Should be ≤ X (ideally faster)
```

### Large File Handling

**Test:** Validate large project

```bash
# Create many files
mkdir -p /tmp/large-project/.claude/skills
for i in {1..100}; do
  echo "---\nname: skill$i\n---\n# Skill $i" > /tmp/large-project/.claude/skills/skill$i.md
done

time npm run claudelint -- /tmp/large-project
```

**Expected:** Completes in reasonable time (<10 seconds for 100 files)

---

## Automated Testing Checklist

Run before marking any phase complete:

```bash
#!/bin/bash
# test-validator-refactor.sh

set -e  # Exit on error

echo " Running Validator Refactoring Test Suite..."

echo ""
echo "1. Building project..."
npm run build

echo ""
echo "2. Running unit tests..."
npm test

echo ""
echo "3. Running linter..."
npm run lint

echo ""
echo "4. Running type checker..."
npm run type-check

echo ""
echo "5. Testing on claudelint itself..."
npm run claudelint .

echo ""
echo "[x] All tests passed!"
```

**Usage:**

```bash
chmod +x test-validator-refactor.sh
./test-validator-refactor.sh
```

---

## Test Results Documentation

### Phase 1 Results

**Date:**
**Tester:**

- [ ] Build succeeded
- [ ] Tests passed (X/Y)
- [ ] No type errors
- [ ] No lint errors
- [ ] Composition framework deleted
- [ ] Validators renamed successfully

**Notes:**

### Phase 2 Results

**Date:**
**Tester:**

- [ ] Build succeeded
- [ ] Tests passed (X/Y)
- [ ] All validators use consistent patterns
- [ ] JSDoc added and visible

**Notes:**

### Phase 3 Results

**Date:**
**Tester:**

- [ ] Documentation complete
- [ ] All links work
- [ ] Examples verified
- [ ] Markdown lint passed

**Notes:**

### Phase 4 Results

**Date:**
**Tester:**

- [ ] Full test suite passed
- [ ] Integration tests passed
- [ ] All 10 validator categories tested
- [ ] Real project testing successful
- [ ] Performance maintained/improved
- [ ] Exit codes correct
- [ ] Error messages clear

**Notes:**

---

## Known Issues & Workarounds

*Document any known issues discovered during testing*

### Issue 1

**Description:**
**Workaround:**
**Tracked in:**

---

## Sign-Off

### Testing Complete

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All validator categories tested
- [ ] Performance acceptable
- [ ] Regression tests pass
- [ ] Documentation reviewed

**Tested by:**
**Date:**
**Notes:**
