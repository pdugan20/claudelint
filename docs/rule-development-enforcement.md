# Rule Development Enforcement

This document defines the requirements and automated checks for rule development in claudelint.

## Documentation Requirements

### Required File Structure

Every rule MUST have a documentation file at:

```text
docs/rules/{validator}/{rule-id}.md
```

Example: `docs/rules/skills/skill-missing-shebang.md`

### Required Documentation Sections

All rule documentation MUST include these sections in order:

1. **Title** (H1) - Format: `# Rule: {rule-id}`
2. **Summary** (paragraph) - One-sentence description
3. **Rule Details** (H2) - Detailed explanation
4. **Examples of incorrect** (within Rule Details) - At least 2 code examples
5. **Examples of correct** (within Rule Details) - At least 2 code examples
6. **Options** (H2) - Configuration options or "This rule has no configuration options."
7. **When Not To Use It** (H2) - Guidance on when to disable
8. **Related Rules** (H2) - Links to related rules (or "None" if standalone)
9. **Version** (H2) - Availability info
10. **Metadata** (H2) - Category, Severity, Fixable, Validator

### Documentation Quality Standards

- **Examples**: Must use fenced code blocks with language identifiers
- **Code blocks**: Must be valid syntax for the language
- **Incorrect examples**: Must have comments explaining WHY they're wrong
- **Correct examples**: Must demonstrate best practices
- **Links**: Related rules must link to actual .md files
- **Consistency**: Metadata must match implementation

### Metadata Requirements

```markdown
## Metadata

- **Category**: {One of: Schema Validation, Cross-Reference, File System, etc.}
- **Severity**: {error|warning}
- **Fixable**: {Yes|No}
- **Validator**: {CLAUDE.md|Skills|Agents|Settings|Hooks|MCP|Plugin|Commands|LSP|Output Styles}
```

## Code Requirements

### Rule ID Registration

Every rule MUST be registered in `src/rules/rule-ids.ts`:

1. **Added to type union**:

   ```typescript
   export type SkillsRuleId =
     | 'skill-missing-shebang'
     | 'skill-missing-comments'
     // ... etc
   ```

2. **Added to ALL_RULE_IDS constant**:

   ```typescript
   export const ALL_RULE_IDS = [
     'skill-missing-shebang',
     'skill-missing-comments',
     // ... etc
   ] as const;
   ```

3. **Type must match validator**:
   - Skills rules → `SkillsRuleId`
   - Agents rules → `AgentsRuleId`
   - etc.

### Implementation Requirements

**Schema Rules** (Defined in Zod schema):

- Must be enforced by schema validation in `src/schemas/`
- Should use built-in Zod methods (`.min()`, `.max()`, `.email()`, etc.)
- Should be ≤5 lines of code

**Refinement Rules** (Custom Zod refinements):

- Must use shared refinement functions from `src/schemas/refinements.ts`
- Should be ≤20 lines of code
- Must call `reportError` or `reportWarning` with correct rule ID

**Logic Rules** (Validator methods):

- Implemented in validator class methods
- Should be ≤50 lines of code
- Must call `reportError` or `reportWarning` with correct rule ID
- Should extract reusable logic to helper methods

### Error Reporting Requirements

All `reportError` and `reportWarning` calls MUST:

1. **Use registered rule IDs**:

   ```typescript
   // GOOD
   this.reportError('Message', filePath, line, 'skill-missing-shebang');

   // BAD - Unregistered rule ID
   this.reportError('Message', filePath, line, 'skill-no-shebang');
   ```

2. **Match severity**:
   - `reportError()` → severity: error in docs
   - `reportWarning()` → severity: warning in docs

3. **Include context**:
   - File path (always)
   - Line number (when applicable)
   - Column (when applicable)

## Test Requirements

### Test Coverage

Every rule MUST have:

1. **At least one test** that triggers the rule
2. **At least one test** that passes the rule
3. **Edge case tests** for complex rules

### Test Structure

Tests MUST:

1. **Use test builders** (after Phase 6 migration):

   ```typescript
   const skill = await createSkill({
     frontmatter: { name: 'test', description: 'Test skill', version: '1.0.0' },
     body: 'Test content'
   });
   ```

2. **Use custom matchers**:

   ```typescript
   expect(result).toHaveError('skill-missing-shebang');
   expect(result).toHaveWarning('skill-dangerous-command');
   expect(result).toHaveNoErrors();
   ```

3. **Test rule IDs**:

   ```typescript
   const error = result.errors[0];
   expect(error.ruleId).toBe('skill-missing-shebang');
   ```

### Test Organization

Tests should be organized:

```text
tests/
├── validators/
│   ├── skills.test.ts       # Validator-level tests
│   └── agents.test.ts
├── rules/
│   ├── skills/
│   │   ├── skill-missing-shebang.test.ts  # Rule-specific tests
│   │   └── skill-dangerous-command.test.ts
│   └── agents/
└── integration/
    └── cli.test.ts
```

## Consistency Requirements

### Filename Consistency

Rule documentation filename MUST match rule ID:

```text
Rule ID: skill-missing-shebang
Doc file: docs/rules/skills/skill-missing-shebang.md ✓

Rule ID: skill-missing-shebang
Doc file: docs/rules/skills/missing-shebang.md ✗
```

### Severity Consistency

Severity in code MUST match docs:

```typescript
// In validator:
this.reportError('...', file, line, 'skill-missing-shebang');

// In docs metadata:
- **Severity**: error ✓
```

### Category Consistency

Validator name in metadata MUST match actual validator:

```markdown
<!-- In docs/rules/skills/skill-missing-shebang.md -->
- **Validator**: Skills ✓

<!-- WRONG -->
- **Validator**: Skill ✗
```

## Automated Enforcement

### Pre-Commit Checks

The following checks MUST pass before commit:

1. **Rule ID Registry Check**
   - Verify all rule IDs in `reportError`/`reportWarning` calls are registered
   - Verify no duplicate rule IDs
   - Command: `npm run check:rule-ids`

2. **Documentation Completeness Check**
   - Verify all registered rules have documentation
   - Verify all docs have required sections
   - Command: `npm run check:rule-docs`

3. **Test Coverage Check**
   - Verify all rules have at least one test
   - Verify test coverage meets threshold (>80%)
   - Command: `npm run check:test-coverage`

4. **Consistency Check**
   - Verify severity matches between code and docs
   - Verify filename matches rule ID
   - Command: `npm run check:consistency`

5. **Example Validation**
   - Verify code examples in docs are valid syntax
   - Verify examples use correct language identifiers
   - Command: `npm run check:examples`

### CI/CD Checks

The following checks run in CI:

1. **Full Test Suite** - `npm test`
2. **Rule Registry Validation** - `npm run check:rule-ids`
3. **Documentation Completeness** - `npm run check:rule-docs`
4. **Consistency Validation** - `npm run check:consistency`
5. **TypeScript Compilation** - `npm run build`
6. **Linting** - `npm run lint`

### PR Requirements

Pull requests adding new rules MUST:

1. Include rule documentation
2. Include test coverage
3. Update RULE-TRACKER.md
4. Pass all automated checks
5. Include examples in PR description

## Violation Handling

### Documentation Violations

**Missing documentation**:

-  BLOCK: Cannot merge PR without docs
- Fix: Create docs file following template

**Incomplete documentation**:

-  WARN: Missing sections
- Fix: Add missing sections

**Inconsistent metadata**:

-  BLOCK: Severity/validator mismatch
- Fix: Update docs or code to match

### Code Violations

**Unregistered rule ID**:

-  BLOCK: Cannot use unregistered rule ID
- Fix: Add to rule-ids.ts

**Missing test coverage**:

-  BLOCK: All rules must have tests
- Fix: Add test cases

**Severity mismatch**:

-  BLOCK: Code severity must match docs
- Fix: Update reportError/reportWarning call

### Process Violations

**Updating tracker**:

-  WARN: RULE-TRACKER.md not updated
- Fix: Mark rule as implemented

**Breaking changes**:

-  BLOCK: Cannot change rule ID
- Fix: Create new rule, deprecate old

## Quality Metrics

### Rule Quality Score

Each rule is scored on:

- Documentation completeness (0-40 points)
- Test coverage (0-30 points)
- Code quality (0-20 points)
- Example quality (0-10 points)

**Scoring:**

- 90-100: Excellent
- 80-89: Good
- 70-79: Acceptable
- <70: Needs improvement

### Project-Level Metrics

Track these metrics:

- **Documentation coverage**: % of rules with complete docs
- **Test coverage**: % of rules with tests
- **Consistency score**: % of rules passing consistency checks
- **Average rule quality score**

Target: All metrics >95%

## Enforcement Tools

### Planned Tooling

1. **Rule ID Validator** (`scripts/check-rule-ids.ts`)
   - Scans validator code for reportError/reportWarning calls
   - Verifies all rule IDs are registered
   - Reports orphaned rule IDs

2. **Documentation Validator** (`scripts/check-rule-docs.ts`)
   - Scans docs/rules/ directory
   - Verifies required sections exist
   - Validates metadata format
   - Checks for missing docs

3. **Consistency Validator** (`scripts/check-consistency.ts`)
   - Compares code severity with docs
   - Validates filename matches rule ID
   - Checks validator name consistency

4. **Example Validator** (`scripts/check-examples.ts`)
   - Extracts code blocks from docs
   - Validates syntax using appropriate parser
   - Ensures language identifiers are present

5. **Coverage Reporter** (`scripts/check-coverage.ts`)
   - Lists rules without tests
   - Lists rules without docs
   - Generates quality score report

### Integration

Add to `package.json`:

```json
{
  "scripts": {
    "check:rule-ids": "ts-node scripts/check-rule-ids.ts",
    "check:rule-docs": "ts-node scripts/check-rule-docs.ts",
    "check:consistency": "ts-node scripts/check-consistency.ts",
    "check:examples": "ts-node scripts/check-examples.ts",
    "check:coverage": "ts-node scripts/check-coverage.ts",
    "check:all": "npm run check:rule-ids && npm run check:rule-docs && npm run check:consistency && npm run check:examples && npm run check:coverage"
  }
}
```

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run check:all
npm run lint
npm test
```

## Future Enhancements

1. **Auto-generate rule docs** from code annotations
2. **Auto-generate tests** from doc examples
3. **Quality dashboard** showing metrics per rule
4. **Rule deprecation system** with automatic warnings
5. **Documentation translation** for i18n support
