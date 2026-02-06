# Implementation Guide

Technical details for each improvement in the dogfood-and-improvements project. Reference this when picking up a task from [PROGRESS-TRACKER.md](./PROGRESS-TRACKER.md).

---

## Sprint 1: Quick Wins

### T1-1: Fix broken docs links

**Difficulty**: Trivial (find-and-replace)

Four files reference the old `validators.md` filename. The file was renamed to `validation-reference.md` but these references were not updated.

**Changes:**

| File | Line | Old | New |
|------|------|-----|-----|
| `docs/debugging.md` | 299 | `[Validators](validators.md)` | `[Validators](validation-reference.md)` |
| `docs/getting-started.md` | 181 | `[Validators](validators.md)` | `[Validators](validation-reference.md)` |
| `docs/inline-disables.md` | 113 | `[Validators](validators.md)` | `[Validators](validation-reference.md)` |
| `docs/inline-disables.md` | 389 | `[Validators](validators.md)` | `[Validators](validation-reference.md)` |
| `docs/hooks.md` | 202 | `[Validators Documentation](./validators.md)` | `[Validators Documentation](./validation-reference.md)` |

**Verification**: `grep -r "validators\.md" docs/ --include="*.md"` should return only references in project planning docs (vitepress-docs), not in active documentation.

---

### T1-2: Trim optimize-cc-md under 500 lines

**Difficulty**: Low (content extraction)

Current state: `skills/optimize-cc-md/SKILL.md` is 535 lines. Target: under 500 lines.

**Strategy**: Extract two large sections into reference files, replace with links.

### Section 1: Common Fixes (lines 152-214, ~63 lines)

Create `skills/optimize-cc-md/references/common-fixes.md`:

- Move the entire "Common Fixes" section (File Size Violations, Import Issues, Organization Problems)
- Each subsection already links to more detailed reference files
- In SKILL.md, replace with a brief summary + link

### Section 2: Troubleshooting (lines 394-507, ~114 lines)

Create `skills/optimize-cc-md/references/troubleshooting.md`:

- Move all 7 troubleshooting entries
- Each has Problem/Cause/Solution structure - perfect for a reference file
- In SKILL.md, replace with a one-line link

**Replacement text in SKILL.md** (replaces ~177 lines with ~10 lines):

```markdown
## Common Fixes

For detailed fix strategies, see:

- [Common fixes reference](./references/common-fixes.md) - File size, imports, organization
- [Troubleshooting guide](./references/troubleshooting.md) - Solutions for common problems

Quick reference:

- **Size violations**: Move content to @imports, remove generic advice
- **Import issues**: Check paths, avoid circular imports, limit depth to 3
- **Organization**: Group related sections, use .claude/rules/ for scoped rules
```

**Expected result**: ~535 - 177 + 10 = ~368 lines (well under 500).

---

### T1-5: Wire up new reference files

**Difficulty**: Trivial (add links)

After Sprint 2 creates `quality-criteria.md` and `templates.md`, add them to:

1. **`skills/optimize-cc-md/SKILL.md`** Reference Files section (line ~529-535):

```markdown
### Reference Files

For detailed strategies, see:

- [size optimization](./references/size-optimization.md) - How to reduce CLAUDE.md file size
- [import patterns](./references/import-patterns.md) - Best practices for organizing @imports
- [organization guide](./references/organization-guide.md) - Structural organization principles
- [quality criteria](./references/quality-criteria.md) - Manual review checklist for CLAUDE.md quality
- [templates](./references/templates.md) - Annotated examples of well-structured CLAUDE.md files
- [file type taxonomy](./references/file-type-taxonomy.md) - Complete Claude Code config ecosystem
```

1. **`skills/validate-skills/SKILL.md`** See Also section:

```markdown
## See Also

- [validate-all](../validate-all/SKILL.md) - Run all validators
- [optimize-cc-md](../optimize-cc-md/SKILL.md) - Optimize CLAUDE.md files
```

---

## Sprint 2: Reference Content

### T1-3: Create quality-criteria.md

**Difficulty**: Medium (content authoring)

See [CONTENT-SPECS.md](./CONTENT-SPECS.md#quality-criteriamd) for the full specification.

**Key design principle**: This is a manual review checklist, NOT a scoring rubric. It covers aspects that programmatic linting cannot evaluate.

**File**: `skills/optimize-cc-md/references/quality-criteria.md`

---

### T1-4: Create templates.md

**Difficulty**: Medium (content authoring)

See [CONTENT-SPECS.md](./CONTENT-SPECS.md#templatesmd) for the full specification.

**Key design principle**: Provide annotated, copy-paste-ready templates at different complexity levels. Each template should explain WHY each section exists, not just WHAT it contains.

**File**: `skills/optimize-cc-md/references/templates.md`

---

### T4-18: Create file-type-taxonomy.md

**Difficulty**: Low (documentation)

See [CONTENT-SPECS.md](./CONTENT-SPECS.md#file-type-taxonomymd) for the full specification.

**File**: `skills/optimize-cc-md/references/file-type-taxonomy.md`

---

## Sprint 3: Skill Workflow Restructure

### T2-6: Restructure optimize-cc-md

**Difficulty**: Medium (content restructure + workflow design)

Transform the current monolithic workflow into a clear 3-phase process.

**Current structure** (SKILL.md):

```text
## Core Workflow
  Step 1-8: Linear validation-and-fix flow
## Common Fixes (-> moved to reference in T1-2)
## Examples (3 examples)
## Troubleshooting (-> moved to reference in T1-2)
## Important Notes
```

**Target structure** (SKILL.md):

```text
## Workflow Overview
  Brief description of 3-phase approach

## Phase A: Validate
  Step 1: Run claudelint validation
  Step 2: Read CLAUDE.md
  Step 3: Present results conversationally

## Phase B: Assess Quality
  Step 4: Check against quality criteria (-> references/quality-criteria.md)
  Step 5: Identify improvement opportunities
  Step 6: Present assessment to user

## Phase C: Guided Improvement
  Step 7: Ask user what to fix (prioritized list)
  Step 8: Make changes (edit, split, create @imports)
  Step 9: Verify improvements (re-run validation)

## Examples
  (Keep existing 3 examples, restructured around 3 phases)

## Reference Files
  (Links to all reference files)
```

**Constraints**:

- Must stay under 500 lines
- All detailed content should live in reference files
- Each phase should be self-contained with clear entry/exit criteria
- Examples should demonstrate the full 3-phase flow

---

## Sprint 4: New Rules

### General Pattern for New Rules

Every new rule requires 3 files:

1. **Rule**: `src/rules/skills/<rule-name>.ts`
2. **Test**: `tests/rules/skills/<rule-name>.test.ts`
3. **Doc**: `docs/rules/skills/<rule-name>.md`

After creating, run `npm run generate:types` to auto-register in `src/rules/index.ts` and `src/rules/rule-ids.ts`.

**Rule template** (from `src/types/rule.ts`):

```typescript
import { Rule, RuleContext } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'skill-rule-name',
    name: 'Skill Rule Name',
    description: 'Brief description',
    category: 'Skills',
    severity: 'warn', // or 'error'
    fixable: false,
    deprecated: false,
    since: '0.3.0', // current version
    docUrl: 'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-rule-name.md',
  },
  validate: (context: RuleContext) => {
    const { filePath, fileContent } = context;

    // Only validate SKILL.md files
    if (!filePath.endsWith('SKILL.md')) {
      return;
    }

    // Rule logic here
    // context.report({ message: '...' });
  },
};
```

**Test template** (from `tests/helpers/rule-tester.ts`):

```typescript
import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-rule-name';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-rule-name', () => {
  it('should pass for valid cases', async () => {
    await ruleTester.run('skill-rule-name', rule, {
      valid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: `valid content here`,
        },
      ],
      invalid: [],
    });
  });

  it('should flag invalid cases', async () => {
    await ruleTester.run('skill-rule-name', rule, {
      valid: [],
      invalid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: `invalid content here`,
          errors: [{ message: 'Expected error message' }],
        },
      ],
    });
  });
});
```

---

### E1: skill-readme-forbidden

**Logic**: Check if a `README.md` file exists in the same directory as `SKILL.md`. Anthropic explicitly states that skills should use `SKILL.md`, not `README.md`.

**Implementation**:

```typescript
import * as path from 'path';
import * as fs from 'fs';

// In validate():
const skillDir = path.dirname(filePath);
const readmePath = path.join(skillDir, 'README.md');
if (fs.existsSync(readmePath)) {
  context.report({
    message: 'Skills must use SKILL.md, not README.md. Remove README.md from skill directory.',
  });
}
```

**Severity**: `error`

---

### E6: skill-body-word-count

**Logic**: Count words in SKILL.md body (after frontmatter). Warn if over 5,000 words. Anthropic's guide uses word count, not line count, as the metric.

**Implementation**:

```typescript
// Strip frontmatter
const bodyMatch = fileContent.match(/^---[\s\S]*?---\s*([\s\S]*)$/);
const body = bodyMatch ? bodyMatch[1] : fileContent;

// Count words (split on whitespace, filter empties)
const wordCount = body.split(/\s+/).filter(w => w.length > 0).length;

const maxWords = (options.maxWords as number) ?? 5000;
if (wordCount > maxWords) {
  context.report({
    message: `SKILL.md body is ${wordCount} words (max: ${maxWords}). Move detailed content to reference files.`,
  });
}
```

**Severity**: `warn`
**Options**: `maxWords` (default: 5000)

---

### E3/E5: skill-xml-tags-anywhere

**Logic**: Detect XML-like tags in SKILL.md. These can cause prompt injection issues since Claude interprets XML tags as structural delimiters.

**Implementation**:

```typescript
// Strip fenced code blocks first (XML in examples is OK)
const contentWithoutCode = fileContent
  .replace(/```[\s\S]*?```/g, '')
  .replace(/`[^`]+`/g, '');

// Match XML tags (but not markdown-like patterns or HTML entities)
const xmlTagRegex = /<\/?[a-zA-Z][a-zA-Z0-9_-]*(?:\s[^>]*)?>/g;

// Allowlist common markdown/HTML tags
const allowed = new Set(['br', 'hr', 'img', 'a', 'b', 'i', 'em', 'strong', 'code', 'pre', 'p', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'details', 'summary', 'blockquote', 'div', 'span', 'sub', 'sup']);
```

**Severity**: `error`

---

### E8: skill-frontmatter-unknown-keys

**Logic**: Parse YAML frontmatter and warn for keys not in the known schema.

**Known keys**: `name`, `description`, `version`, `tags`, `dependencies`, `allowed-tools`, `model`, `context`, `agent`

**Implementation**: Parse frontmatter with existing YAML parser, compare keys against known set.

**Severity**: `warn`

---

### E4: skill-description-max-length

**Logic**: Check frontmatter `description` field length. Warn if over 500 characters.

**Implementation**: Parse frontmatter, check `description.length > 500`.

**Severity**: `warn`

---

### T2-11: Cross-skill reference validation

**Logic**: Find markdown links in SKILL.md that point to other skill files (e.g., `../validate-all/SKILL.md`). Verify the target file exists.

**Implementation**:

```typescript
// Match relative links to SKILL.md files
const crossRefRegex = /\[([^\]]+)\]\((\.\.\/[^)]+\/SKILL\.md)\)/g;

let match;
while ((match = crossRefRegex.exec(fileContent)) !== null) {
  const refPath = path.resolve(path.dirname(filePath), match[2]);
  if (!fs.existsSync(refPath)) {
    context.report({
      message: `Cross-reference to non-existent skill: ${match[2]}`,
    });
  }
}
```

**Severity**: `warn`

---

## Sprint 5: Developer Experience

### T2-9: Pre-commit hook optimization

**Difficulty**: Medium

**Approach**:

1. In pre-commit script, get staged files: `git diff --cached --name-only`
2. Map file paths to validator categories:
   - `*.CLAUDE.md` or `.claude/CLAUDE.md` -> CLAUDE.md validator
   - `.claude/skills/*/SKILL.md` or `skills/*/SKILL.md` -> Skills validator
   - `.claude/settings.json` -> Settings validator
   - `.mcp.json` -> MCP validator
   - `plugin.json` -> Plugin validator
   - etc.
3. Run only the relevant validators
4. Add `--all` flag to force full validation

**Files**:

- Modify pre-commit hook scripts in `scripts/` or `.husky/`
- May need a new utility: `src/utils/changed-file-router.ts`

---

### T2-10: Validation caching

**Difficulty**: Medium

**Approach**:

1. Before validating a file, compute content hash (SHA-256 of file content + rule version)
2. Check `.claudelint-cache/results.json` for matching hash
3. If found, return cached results
4. If not found, validate normally and store results

**Cache invalidation**:

- File content changes -> hash changes -> cache miss
- Rule version changes -> include rule version in hash key
- `claudelint --no-cache` flag to bypass

**File**: `src/utils/cache.ts` (new)

```typescript
interface CacheEntry {
  contentHash: string;
  ruleVersion: string;
  results: ValidationResult[];
  timestamp: number;
}
```

---

### T2-12: SARIF output

**Difficulty**: Medium

**SARIF** (Static Analysis Results Interchange Format) is the standard format for GitHub Code Scanning.

**File**: `src/formatters/sarif.ts` (new)

**Structure**: Map validation results to SARIF schema:

- `tool.driver.name` = "claudelint"
- `tool.driver.rules[]` = rule metadata
- `results[]` = validation issues with locations

**CLI**: Add `--format sarif|json|stylish` option (stylish is current default)

---

## Sprint 6: Auto-fix

### T2-7: Auto-fix infrastructure

**Difficulty**: Medium-High

The `AutoFix` interface already exists in `src/validators/file-validator.ts`:

```typescript
export interface AutoFix {
  ruleId: RuleId;
  description: string;
  filePath: string;
  apply: (currentContent: string) => string;
}
```

**Implementation steps**:

1. Add `--fix` flag to CLI command parser
2. Collect all `autoFix` objects from rule issues
3. Group fixes by file path
4. Apply fixes sequentially (order matters for overlapping edits)
5. Write modified files
6. Re-validate to confirm fixes resolved issues

**Example fix implementation** (skill-missing-shebang):

```typescript
// In rule:
context.report({
  message: 'Shell script missing shebang line',
  autoFix: {
    ruleId: 'skill-missing-shebang',
    description: 'Add #!/bin/bash shebang',
    filePath: context.filePath,
    apply: (content) => `#!/bin/bash\n${content}`,
  },
});
```

---

## Testing Conventions

All new rules should follow these testing patterns:

1. **Valid cases**: At least 2 (normal case + edge case)
2. **Invalid cases**: At least 2 (simple violation + complex violation)
3. **Non-applicable files**: Test that rule skips non-SKILL.md files
4. **Edge cases**: Empty files, missing frontmatter, Unicode content

Use the existing `ClaudeLintRuleTester` from `tests/helpers/rule-tester.ts`.

**Naming**: Test file must match rule file: `skill-foo.ts` -> `skill-foo.test.ts`

**Location**: `tests/rules/skills/` for skill rules

---

## Verification Checklist

After any sprint, run this full verification:

```bash
# Build
npm run build

# Tests
npm test

# Lint
npm run lint

# Dogfood
./bin/claudelint validate-skills --path skills

# Type generation (if new rules added)
npm run generate:types
```
