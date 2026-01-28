# Documentation Enforcement Plan

**Context**: After manually rewriting all 28 docs to follow the new template, we need programmatic enforcement to prevent quality regression.

## Two-Phase Approach

### Phase 1: Detection (What's Wrong)

Use custom scripts to detect violations.

### Phase 2: Enforcement (Prevent Bad Docs)

Use pre-commit hooks + CI to block violations.

---

## Phase 1: Detection Scripts

### 1.1 Existing: audit-rule-docs.ts 

**Already built**: `npm run audit:rule-docs`

**What it detects**:
- Missing metadata badges at top
- Old metadata table format
- Line count violations
- Excessive examples
- Redundant sections
- Missing source links

**Action**: Keep as-is, already comprehensive.

### 1.2 Enhancement: Stricter Checks

After all docs are rewritten, make audit script stricter:

```typescript
// Current: warnings for line count
// After rewrite: errors for line count

if (result.lineCount > target) {
  result.issues.push({
    severity: 'error', // Change from 'warning'
    issue: `Exceeds ${result.complexity} rule target`,
  });
}
```

**Action**: Update after all docs are compliant.

### 1.3 New: Metadata Format Validator

**Purpose**: Ensure badges are formatted correctly

**What to check**:
```markdown
# Correct format:
**Severity**: Error | Warning
**Fixable**: Yes | No
**Validator**: Skills
**Category**: Security

# Wrong formats to detect:
Severity: Error            (missing **)
**Severity:** Error        (colon inside bold)
**severity**: Error        (lowercase)
- **Severity**: Error      (bullet point)
```

**Add to**: `audit-rule-docs.ts` as additional check

### 1.4 New: Example Count Enforcer

**Purpose**: Strictly enforce 2 example limit

**Current**: Warning
**After rewrite**: Error

```typescript
if (result.exampleCount.incorrect > 2) {
  result.issues.push({
    severity: 'error', // Change from 'warning'
    issue: 'Exceeds maximum of 2 incorrect examples',
  });
}
```

**Action**: Update after all docs are compliant.

### 1.5 New: Prohibited Section Detector

**Purpose**: Flag sections that should never exist

**Prohibited sections**:
- "## Benefits"
- "## Benefits of..."
- "## Why It Matters"
- "## Why [X] Matters"
- "## Good Directory Patterns"
- "## Common Directory Structures"
- "## Migration Steps" (outside of "How To Fix")
- "## Restructuring Example"

**Implementation**: Already in `audit-rule-docs.ts`, make it an error:

```typescript
if (result.redundantSections.length > 0) {
  result.issues.push({
    severity: 'error', // Change from 'warning'
    issue: `Has prohibited sections: ${result.redundantSections.join(', ')}`,
  });
}
```

---

## Phase 2: Markdown Lint Rules

### 2.1 Existing: .markdownlint.json

**Current rules** (already enforced):
- MD041: First line must be H1
- MD032: Blank lines around lists
- MD031: Blank lines around code blocks
- MD040: Code blocks need language
- MD022: Blank lines around headings

**Action**: Keep existing rules, they're good.

### 2.2 New: Custom Markdown Lint Rules

**Option A**: Use markdownlint-cli2 with custom rules
**Option B**: Write our own markdown validator
**Recommendation**: Option B (we already have audit-rule-docs.ts)

### 2.3 Line Length Limits

**Question**: Should we enforce max line length in prose?

**ESLint docs**: No hard line length limit
**Our docs**: No hard line length limit
**Recommendation**: Don't enforce (let text wrap naturally)

### 2.4 Heading Hierarchy

**Enforce**:
- Must have exactly one H1 (title)
- Must have H2s (## Rule Details, etc.)
- H3s only under H2s (### Incorrect under ## Rule Details)
- No H4+ in docs

**Implementation**: Add to audit-rule-docs.ts:

```typescript
function validateHeadingHierarchy(lines: string[]): Issue[] {
  let h1Count = 0;
  let currentH2 = '';
  const issues: Issue[] = [];

  for (const line of lines) {
    if (line.startsWith('# ')) h1Count++;
    if (line.startsWith('## ')) currentH2 = line;
    if (line.startsWith('### ') && !currentH2) {
      issues.push({ issue: 'H3 without parent H2' });
    }
    if (line.startsWith('#### ')) {
      issues.push({ issue: 'H4+ not allowed in rule docs' });
    }
  }

  if (h1Count !== 1) {
    issues.push({ issue: `Must have exactly 1 H1, found ${h1Count}` });
  }

  return issues;
}
```

---

## Phase 3: Pre-commit Hooks

### 3.1 Current: .husky/pre-commit

**Existing hooks** (if any):
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint
npm test
```

### 3.2 Add: Documentation Checks

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Get list of changed files
CHANGED_RULE_DOCS=$(git diff --cached --name-only --diff-filter=ACM | grep 'docs/rules/.*\.md$' | grep -v 'TEMPLATE.md' || true)

if [ -n "$CHANGED_RULE_DOCS" ]; then
  echo "Validating changed rule documentation..."

  # Run audit on changed docs
  npm run audit:rule-docs

  if [ $? -ne 0 ]; then
    echo " Rule documentation validation failed"
    echo "Run 'npm run audit:rule-docs' to see issues"
    exit 1
  fi

  # Run markdownlint on changed docs
  npm run lint:md -- $CHANGED_RULE_DOCS

  if [ $? -ne 0 ]; then
    echo " Markdown lint failed"
    exit 1
  fi

  echo " Documentation validation passed"
fi

# Continue with other checks
npm run lint
npm test
```

### 3.3 Fast Pre-commit

**Problem**: Running full audit on every commit is slow.

**Solution**: Only audit changed files.

**Implementation**: Add `--files` flag to audit-rule-docs.ts:

```typescript
// Usage: npm run audit:rule-docs -- --files docs/rules/skills/skill-*.md

if (process.argv.includes('--files')) {
  const fileArgs = process.argv.slice(process.argv.indexOf('--files') + 1);
  // Only audit specified files
  ruleDocs = fileArgs.filter(f => f.endsWith('.md'));
} else {
  // Audit all files
  ruleDocs = findRuleDocs(rulesDir);
}
```

**Pre-commit becomes**:
```bash
CHANGED_RULE_DOCS=$(git diff --cached --name-only --diff-filter=ACM | grep 'docs/rules/.*\.md$' | grep -v 'TEMPLATE.md' || true)

if [ -n "$CHANGED_RULE_DOCS" ]; then
  npm run audit:rule-docs -- --files $CHANGED_RULE_DOCS
fi
```

---

## Phase 4: CI Checks (GitHub Actions)

### 4.1 Create: .github/workflows/docs-validation.yml

```yaml
name: Documentation Validation

on:
  pull_request:
    paths:
      - 'docs/rules/**/*.md'
  push:
    branches:
      - main
    paths:
      - 'docs/rules/**/*.md'

jobs:
  validate-docs:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run documentation audit
        run: npm run audit:rule-docs

      - name: Run markdown lint
        run: npm run lint:md

      - name: Check rule documentation
        run: npm run check:rule-docs

      - name: Check consistency
        run: npm run check:consistency
```

### 4.2 Create: .github/workflows/comprehensive-checks.yml

```yaml
name: Comprehensive Checks

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  all-checks:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run all validation checks
        run: npm run check:all

      - name: Run tests
        run: npm test

      - name: Run lint
        run: npm run lint
```

---

## Phase 5: Documentation

### 5.1 Update: CONTRIBUTING.md

Add section on documentation standards:

```markdown
## Documentation Standards

### Rule Documentation

All rule documentation must follow the template in `docs/rules/TEMPLATE.md`.

**Requirements:**
- Metadata badges at top (not bottom table)
- Line count targets: 80-120 (simple), 150-250 (complex)
- Maximum 2 incorrect examples
- Maximum 2 correct examples
- Source code links required
- No redundant sections

**Validation:**

Before committing rule documentation:

\```bash
npm run audit:rule-docs
npm run check:rule-docs
npm run lint:md docs/rules/
\```

All checks must pass.

**Reference Example:**

See `docs/rules/skills/skill-deep-nesting-simplified.md` for a well-formed example.
```

### 5.2 Update: docs/rule-development-enforcement.md

Add section on enforcement:

```markdown
## Automated Enforcement

Rule documentation is validated automatically:

**Pre-commit**: Changed docs are validated before commit
**CI**: All docs are validated on every PR and push
**Scripts**: Run manually anytime

### Validation Scripts

- `npm run audit:rule-docs` - Template compliance check
- `npm run check:rule-docs` - Content and structure check
- `npm run check:consistency` - Code/docs consistency
- `npm run lint:md` - Markdown formatting

### Enforcement Points

1. **Pre-commit hook**: Validates changed rule docs
2. **CI check**: Validates all rule docs on PR
3. **Required check**: PR cannot merge if docs fail validation

### Bypassing Checks (Not Recommended)

If absolutely necessary:

\```bash
git commit --no-verify
\```

However, the PR will still fail CI checks and cannot be merged.
```

### 5.3 Create: docs/rules/README.md

```markdown
# Rule Documentation

This directory contains documentation for all claudelint rules.

## Documentation Standards

All rule docs must follow `TEMPLATE.md` and pass validation.

### Quick Start

1. **Copy the template**:
   \```bash
   cp docs/rules/TEMPLATE.md docs/rules/validator-name/rule-id.md
   \```

2. **Fill in the template** following the guidelines

3. **Validate your doc**:
   \```bash
   npm run audit:rule-docs
   \```

4. **Fix any issues** until validation passes

### Reference Example

See `docs/rules/skills/skill-deep-nesting-simplified.md` for a complete example.

### Validation

Docs are automatically validated:
- Before commit (pre-commit hook)
- On pull requests (CI)
- Manually with `npm run audit:rule-docs`

### Common Issues

**Line count too high**:
- Cut redundant sections
- Limit to 2 examples per type
- Consolidate explanations

**Missing metadata badges**:
- Must be within first 10 lines
- Must use `**Field**: Value` format

**Too many examples**:
- Maximum 2 incorrect
- Maximum 2 correct
- Choose most common/severe cases

See `TEMPLATE.md` for full guidelines.
```

---

## Implementation Schedule

### After All Docs Are Rewritten

**Week 1**: Enhance detection
- [ ] Update audit-rule-docs.ts (warnings → errors)
- [ ] Add stricter checks
- [ ] Add heading hierarchy validation
- [ ] Test on all 28 docs (should all pass)

**Week 2**: Add enforcement
- [ ] Add `--files` flag to audit script
- [ ] Create pre-commit hook
- [ ] Test pre-commit hook locally
- [ ] Create GitHub Actions workflows
- [ ] Test in CI

**Week 3**: Documentation & rollout
- [ ] Update CONTRIBUTING.md
- [ ] Update rule-development-enforcement.md
- [ ] Create docs/rules/README.md
- [ ] Announce new standards to team
- [ ] Monitor for issues

---

## Testing Strategy

### Test Detection Scripts

```bash
# Should pass (compliant docs)
npm run audit:rule-docs

# Should fail (create test doc with violations)
echo "# Rule: test\nToo short, no metadata" > docs/rules/test.md
npm run audit:rule-docs
rm docs/rules/test.md
```

### Test Pre-commit Hook

```bash
# Create test violation
echo "Bad content" >> docs/rules/skills/skill-missing-shebang.md

# Try to commit (should fail)
git add docs/rules/skills/skill-missing-shebang.md
git commit -m "test"

# Should see validation error
# Fix and try again
git restore docs/rules/skills/skill-missing-shebang.md
```

### Test CI

```bash
# Create PR with doc violation
# CI should fail
# Fix violation
# CI should pass
```

---

## Success Criteria

**Detection**:
-  audit-rule-docs.ts detects all violations
-  Errors for critical issues (line count, format, prohibited sections)
-  Fast enough for pre-commit (<5 seconds for changed files)

**Enforcement**:
-  Pre-commit hook blocks bad commits
-  CI blocks bad PRs
-  Can bypass locally but CI still enforces
-  Clear error messages for developers

**Documentation**:
-  CONTRIBUTING.md explains standards
-  docs/rules/README.md provides quick start
-  Examples show good vs bad
-  Enforcement is transparent

---

## Maintenance

### When to Update Enforcement

**Update detection when**:
- New template requirements added
- New prohibited patterns discovered
- Performance issues in validation

**Update docs when**:
- Template changes
- New validation rules added
- Common mistakes identified

### Monitoring

Track metrics over time:
- Average line count per doc
- % docs within target
- % docs with violations
- Time to validate (performance)

Keep enforcement lean and fast.
