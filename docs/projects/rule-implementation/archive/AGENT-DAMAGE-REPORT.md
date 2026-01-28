# Agent Damage Report - Previous Agent Errors

## Summary

The previous agent made systematic errors across multiple rule documentation files. These errors fall into three distinct patterns.

## Error Pattern 1: Code Fence Closing Bug

### Issue

The agent used ` ```text` for BOTH opening AND closing code blocks. Closing fences should be just ` ``` ` (three backticks, no language identifier).

### Impact

- Creates unclosed code blocks
- Breaks markdown rendering
- Violates markdownlint rules
- Causes validation failures

### Files Affected

1. **docs/rules/skills/skill-deep-nesting.md**
   - 31 instances of ` ```text`
   - 0 instances of bare ` ``` `
   - Every single closing fence is wrong

2. **docs/rules/skills/skill-eval-usage.md**
   - 19 instances of ` ```text`
   - Multiple closing fences are wrong

3. **docs/rules/skills/skill-missing-examples.md**
   - 30 instances of ` ```text`
   - Multiple closing fences are wrong

### Example

**Incorrect (what the agent wrote):**

````markdown
```bash
echo "hello"
```text            ← WRONG: Should be just ```

Next section...

```bash
echo "world"
```text            ← WRONG: Opens a new text block instead of closing bash block
````

**Correct:**

````markdown
```bash
echo "hello"
```                ← CORRECT: Just three backticks

Next section...

```bash
echo "world"
```                ← CORRECT
````

## Error Pattern 2: Empty Version Section

### Issue

The agent created empty "## Version" sections and placed the version content AFTER the "## Metadata" section instead of under Version.

### Impact

- Version section is empty
- Content appears in wrong location
- Violates documentation structure requirements
- Confusing for readers

### Files Affected

1. **docs/rules/skills/skill-missing-shebang.md**
   - Line 131: `## Version` (empty)
   - Line 133: `## Metadata` (with content)
   - Line 140: `Available since: v1.0.0` (should be under Version)

2. **docs/rules/claude-md/size-warning.md**
   - Line 133: `## Version` (empty)
   - Line 135: `## Metadata` (with content)
   - Line 142: `Available since: v1.0.0` (should be under Version)

### Example

**Incorrect (what the agent wrote):**

```markdown
## Version

## Metadata

- **Category**: Security
- **Severity**: warning
- **Fixable**: No
- **Validator**: Skills

Available since: v1.0.0    ← WRONG: Should be under Version section
```

**Correct:**

```markdown
## Version

Available since: v1.0.0    ← CORRECT: Under Version section

## Metadata

- **Category**: Security
- **Severity**: warning
- **Fixable**: No
- **Validator**: Skills
```

## Error Pattern 3: Missing Metadata Section

### Issue

The agent completely omitted the "## Metadata" section from some files.

### Impact

- Missing required section
- Validation failures
- No machine-readable metadata
- Fails `check:rule-docs` validation

### Files Affected

1. **docs/rules/skills/skill-deep-nesting.md**
   - Has `## Version` section at line 291
   - Missing `## Metadata` section entirely
   - Has bare metadata text at lines 19-22 (wrong format, wrong location)

### Example

**skill-deep-nesting.md lines 19-22:**

```text
**Category**: Skills
**Severity**: warning
**Fixable**: No
**Since**: v1.0.0
```

This metadata is:
- In the middle of the file (should be at the end)
- Not in a proper "## Metadata" section
- Missing the "Validator" field
- Using "Since" instead of appearing in the Version section

## Error Pattern 4: Completely Broken Files

### Issue

Some files were left in a completely broken state with missing required sections.

### Files Affected

1. **docs/rules/claude-md/size-error.md**
   - ONLY contains "## Metadata" section
   - Missing: Title, Rule Details, Options, When Not To Use It, Version
   - Essentially an empty file stub

### Example

**Entire contents of size-error.md:**

```markdown

## Metadata

- **Category**: Best Practices
- **Severity**: error
- **Fixable**: No
- **Validator**: CLAUDE.md

```

## Validation Failures

Running `npm run check:rule-docs` produces:

### Critical Errors (11 violations)

1. **size-error.md** - 5 violations
   - Missing H1 title
   - Missing Rule Details section
   - Missing Options section
   - Missing When Not To Use It section
   - Missing Version section

2. **skill-deep-nesting.md** - 6 violations
   - Wrong H1 title format (`# Deep Nesting` instead of `# Rule: skill-deep-nesting`)
   - Missing Metadata section
   - Missing Category metadata field
   - Missing Severity metadata field
   - Missing Fixable metadata field
   - Missing Validator metadata field

### Warnings (42 files)

Most warnings are for "missing code examples" but many are false positives due to the validation script being too strict. However, the three files with the code fence bug will legitimately have broken examples.

## Root Cause Analysis

### Why did this happen?

1. **Code Fence Bug**: The agent likely used a pattern like "replace all ` ``` ` with ` ```text`" without distinguishing between opening and closing fences.

2. **Version Section**: The agent may have used a template or script that separated the version content from the section heading.

3. **Missing Metadata**: The agent either:
   - Didn't complete the file
   - Used an old template
   - Lost track of required sections during editing

## Fix Strategy

### Priority 1: Fix Broken Files (Now)

1. **size-error.md** - Complete rewrite using TEMPLATE.md
2. **skill-deep-nesting.md** - Multiple fixes:
   - Change title to `# Rule: skill-deep-nesting`
   - Replace all closing ` ```text` with ` ``` `
   - Remove bare metadata text from lines 19-22
   - Add proper Metadata section at end
3. **skill-eval-usage.md** - Fix code fences
4. **skill-missing-examples.md** - Fix code fences
5. **skill-missing-shebang.md** - Move version content to Version section
6. **size-warning.md** - Move version content to Version section

### Priority 2: Prevent Recurrence

1. Add pre-commit hook for `check:rule-docs`
2. Create a checklist for documentation changes
3. Document the correct code fence usage

## Checklist for Fixes

### For Code Fence Fixes

- [ ] Find all ` ```text` that should be closing fences
- [ ] Replace with bare ` ``` `
- [ ] Verify markdown renders correctly
- [ ] Run `markdownlint` to confirm

### For Version Section Fixes

- [ ] Move "Available since:" under ## Version
- [ ] Ensure Version comes before Metadata
- [ ] Verify section is not empty

### For Metadata Section Fixes

- [ ] Add ## Metadata section at end (after Version)
- [ ] Include all required fields: Category, Severity, Fixable, Validator
- [ ] Match validator name to filename path
- [ ] Remove any duplicate metadata from file body

## Files Requiring Immediate Attention

### Critical (Blocks Validation)

1. `docs/rules/claude-md/size-error.md` - Complete rewrite
2. `docs/rules/skills/skill-deep-nesting.md` - Multiple fixes
3. `docs/rules/skills/skill-eval-usage.md` - Code fence fixes
4. `docs/rules/skills/skill-missing-examples.md` - Code fence fixes
5. `docs/rules/skills/skill-missing-shebang.md` - Version section fix
6. `docs/rules/claude-md/size-warning.md` - Version section fix

### Verification Steps

After fixing each file:

```bash
# 1. Run rule docs checker
npm run check:rule-docs

# 2. Run markdownlint
npm run lint:md docs/rules/

# 3. Verify rendering
# Open the file in a markdown preview
```

## Estimated Effort

- **size-error.md**: 15-20 minutes (complete rewrite)
- **skill-deep-nesting.md**: 10-15 minutes (multiple fixes)
- **skill-eval-usage.md**: 5-10 minutes (code fences)
- **skill-missing-examples.md**: 5-10 minutes (code fences)
- **skill-missing-shebang.md**: 2-3 minutes (move content)
- **size-warning.md**: 2-3 minutes (move content)

**Total**: ~40-60 minutes to fix all critical issues

## Prevention

### Pre-commit Hook

Add to `.husky/pre-commit`:

```bash
npm run check:rule-docs || {
  echo "Rule documentation validation failed"
  echo "Run 'npm run check:rule-docs' to see details"
  exit 1
}
```

### Documentation Guidelines

Add to contribution guide:

1. **Always use bare ` ``` ` for closing code fences** (no language identifier)
2. **Version content goes under ## Version section** (not after Metadata)
3. **Metadata section is always last** (after Version)
4. **Run validation before committing**: `npm run check:rule-docs`
