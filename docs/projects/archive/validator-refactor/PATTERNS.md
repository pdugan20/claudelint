# Phase 2 Architectural Patterns

**Last Updated:** 2026-01-29

## Overview

This document defines the new architectural patterns introduced in Phase 2 to eliminate code duplication and establish consistent validator behavior.

**CRITICAL ARCHITECTURAL PRINCIPLE:** Validators are orchestrators, NOT validators. All validation logic MUST live in rule files. Validators should NEVER call `reportError()` or `reportWarning()` - these methods will be deprecated and removed entirely.

## Validator vs Rule Responsibilities

### Validators (Orchestrators)
- Find files to validate
- Read file contents
- Execute rules via `executeRulesForCategory()`
- Return validation results
- **NEVER contain validation logic**

### Rules (Validators)
- Contain ALL validation logic in `validate()` function
- Report issues via `context.report()`
- Are configurable by users (enable/disable, severity)
- Are auto-discovered by RuleRegistry

---

## Pattern 1: Rule Discovery via RuleRegistry

### Problem

Validators manually import and execute rules:

```typescript
// BAD: Manual imports create tight coupling
import { rule as sizeErrorRule } from '../rules/claude-md/claude-md-size-error';
import { rule as sizeWarningRule } from '../rules/claude-md/claude-md-size-warning';
import { rule as contentRule } from '../rules/claude-md/claude-md-content-too-many-sections';

async validate() {
  for (const file of files) {
    const content = await readFileContent(file);
    await this.executeRule(sizeErrorRule, file, content);
    await this.executeRule(sizeWarningRule, file, content);
    await this.executeRule(contentRule, file, content);
    // ... 10 more executeRule calls
  }
}
```

**Issues:**
- Adding new rules requires editing validator
- No way to see which rules apply to a validator
- Manual import maintenance burden

### Solution

Use RuleRegistry to discover rules automatically:

```typescript
// GOOD: Auto-discovery via registry
async validate() {
  const files = await this.findFiles();

  for (const file of files) {
    const content = await readFileContent(file);

    // Executes ALL rules for this category automatically
    await this.executeRulesForCategory('CLAUDE.md', file, content);
  }

  return this.getResult();
}
```

### Implementation

**In `src/utils/rule-registry.ts`:**

```typescript
export class RuleRegistry {
  private static rules = new Map<RuleId, Rule>();

  /**
   * Get all rules for a specific category
   */
  static getRulesByCategory(category: RuleCategory): Rule[] {
    const rules: Rule[] = [];

    for (const rule of this.rules.values()) {
      if (rule.meta.category === category) {
        rules.push(rule);
      }
    }

    return rules;
  }

  /**
   * Get rules by validator ID (maps category to rules)
   */
  static getRulesForValidator(validatorId: string): Rule[] {
    const categoryMap: Record<string, RuleCategory> = {
      'claude-md': 'CLAUDE.md',
      'skills': 'Skills',
      'agents': 'Agents',
      'mcp': 'MCP',
      'hooks': 'Hooks',
      'settings': 'Settings',
      'plugin': 'Plugin',
      'commands': 'Commands',
      'output-styles': 'OutputStyles',
      'lsp': 'LSP',
    };

    const category = categoryMap[validatorId];
    return category ? this.getRulesByCategory(category) : [];
  }
}
```

**In `src/validators/base.ts`:**

```typescript
/**
 * Execute all rules for a category on a file
 *
 * Discovers rules via RuleRegistry and executes them all.
 * Respects config for enabling/disabling and severity.
 *
 * @param category - Rule category (e.g., 'CLAUDE.md', 'Skills')
 * @param filePath - Path to file being validated
 * @param fileContent - Content of file being validated
 */
protected async executeRulesForCategory(
  category: RuleCategory,
  filePath: string,
  fileContent: string
): Promise<void> {
  const rules = RuleRegistry.getRulesByCategory(category);

  for (const rule of rules) {
    await this.executeRule(rule, filePath, fileContent);
  }
}
```

### Benefits

- [YES] Adding new rules doesn't require editing validators
- [YES] Rules auto-discovered from filesystem
- [YES] Clear separation: validators orchestrate, rules validate
- [YES] Zero manual imports in validators

### Migration Steps

1. Remove all manual rule imports from validator
2. Remove all individual `executeRule()` calls
3. Add single `executeRulesForCategory()` call
4. Test that all rules still execute

---

## Pattern 2: Frontmatter Parsing Abstraction

### Problem

4 validators duplicate frontmatter parsing and structure logic:

```typescript
// Duplicated in agents.ts, skills.ts, output-styles.ts, claude-md.ts
private async parseFrontmatter(filePath: string, content: string) {
  const { data: frontmatter, result } = validateFrontmatterWithSchema(...);
  this.mergeSchemaValidationResult(result);

  if (!frontmatter) return null;

  return frontmatter;
}
```

### Solution

**IMPORTANT:** This abstraction is for **parsing and schema validation**, NOT for business logic validation like name matching. Name matching validation should be in a rule.

Extract to BaseValidator:

```typescript
// In src/validators/base.ts
protected async validateFrontmatterWithNameCheck<T>(
  filePath: string,
  content: string,
  schema: z.ZodType,
  expectedName: string,
  entityType: string,
  ruleIdPrefix: string
): Promise<T | null> {
  const { data: frontmatter, result } = validateFrontmatterWithSchema(
    content,
    schema,
    filePath,
    ruleIdPrefix
  );

  this.mergeSchemaValidationResult(result);

  if (!frontmatter) {
    return null;
  }

  // NOTE: Name validation should ideally be in a rule, not here
  // This is a temporary abstraction for common validator orchestration
  // TODO Phase 3: Move name validation to rules like `{category}-name-mismatch`
  if (frontmatter.name !== expectedName) {
    this.reportError(
      `${entityType} name "${frontmatter.name}" does not match directory name "${expectedName}"`,
      filePath,
      undefined,
      `${ruleIdPrefix}-name-mismatch` as RuleId
    );
  }

  return frontmatter as T;
}
```

**Future Improvement:** The name validation inside this method should be extracted to category-specific rules. This abstraction is pragmatic for Phase 2 but violates the "no validation in validators" principle.

### Usage

```typescript
// In agents.ts
const frontmatter = await this.validateFrontmatterWithNameCheck<AgentFrontmatter>(
  agentMdPath,
  content,
  AgentFrontmatterSchema,
  agentName,
  'Agent',
  'agent'
);

if (!frontmatter) return;

// Use frontmatter...
```

### Benefits

- [YES] Single implementation, multiple uses
- [YES] Consistent error messages
- [YES] Proper ruleIds for all frontmatter errors
- [YES] ~80 lines of duplication removed

---

## Pattern 3: Body Content Validation Abstraction (Deprecated Pattern)

**NOTE:** This pattern is being deprecated in favor of rules. Body content validations should be in rule files, not validator abstractions.

### Problem

3 validators duplicate body content checks:

```typescript
// Duplicated in agents.ts, skills.ts, output-styles.ts
const body = extractBody(content);

if (body.length < 50) {
  this.reportWarning('Body content is very short (less than 50 characters)', filePath);
}

const hasSection = /#{1,3}\s*section\s*name/i.test(body);
if (!hasSection) {
  this.reportWarning('Missing required section', filePath);
}
```

### Solution

Extract configurable abstraction:

```typescript
// In src/validators/base.ts
protected validateBodyContentStructure(
  filePath: string,
  content: string,
  rules: {
    minLength?: {
      threshold: number;
      ruleId: RuleId;
      message: string;
    };
    requiredSections?: Array<{
      name: string;
      pattern: RegExp;
      ruleId: RuleId;
      message: string;
    }>;
  }
): void {
  const body = this.extractBody(content);

  // Min length check
  if (rules.minLength && body.length < rules.minLength.threshold) {
    this.reportWarning(
      rules.minLength.message,
      filePath,
      undefined,
      rules.minLength.ruleId
    );
  }

  // Required sections check
  if (rules.requiredSections) {
    for (const section of rules.requiredSections) {
      if (!section.pattern.test(body)) {
        this.reportWarning(
          section.message,
          filePath,
          undefined,
          section.ruleId
        );
      }
    }
  }
}

private extractBody(content: string): string {
  const parts = content.split('---');
  return parts.length >= 3 ? parts.slice(2).join('---').trim() : content;
}
```

### Usage

```typescript
// In agents.ts
this.validateBodyContentStructure(agentMdPath, content, {
  minLength: {
    threshold: 50,
    ruleId: 'agent-body-too-short',
    message: 'Agent body content is very short (less than 50 characters). Consider adding more detail.',
  },
  requiredSections: [
    {
      name: 'System Prompt',
      pattern: /#{1,3}\s*system\s*prompt/i,
      ruleId: 'agent-missing-system-prompt',
      message: 'Agent should include a "System Prompt" section describing the agent\'s instructions.',
    },
  ],
});

// In output-styles.ts
this.validateBodyContentStructure(styleMdPath, content, {
  minLength: {
    threshold: 50,
    ruleId: 'output-style-body-too-short',
    message: 'Output style body content is very short (less than 50 characters).',
  },
  requiredSections: [
    {
      name: 'Examples',
      pattern: /#{1,3}\s*examples/i,
      ruleId: 'output-style-missing-examples',
      message: 'Output style should include an "Examples" section.',
    },
    {
      name: 'Guidelines',
      pattern: /#{1,3}\s*guidelines/i,
      ruleId: 'output-style-missing-guidelines',
      message: 'Output style should include a "Guidelines" section.',
    },
  ],
});
```

### Benefits

- [YES] Configurable per validator needs
- [YES] Proper ruleIds for each check
- [YES] Consistent pattern across validators
- [YES] ~60 lines of duplication removed

### Deprecation Notice

**This pattern is being deprecated.** Body content validations (min length, required sections) should be converted to individual rule files instead of using this abstraction:

```typescript
// BETTER APPROACH: Create rules instead
// src/rules/agents/agent-body-too-short.ts
// src/rules/agents/agent-missing-system-prompt.ts
// src/rules/skills/skill-body-too-short.ts
// etc.
```

**Rationale:** Validation logic should be in rules, not in validator abstractions. This allows:
- Users to disable specific validations
- Better separation of concerns
- No reportError/reportWarning calls in validators

**Phase 3 Goal:** Convert all body content validations to rules and remove this abstraction entirely.

---

## Pattern 4: File Walking Abstraction

### Problem

Skills validator has 3 methods with identical file-walking patterns:

```typescript
// Pattern repeated 3 times in skills.ts
try {
  const entries = await readdir(skillDir, { withFileTypes: true });
  const scriptFiles = entries.filter(e => e.isFile() && e.name.endsWith('.sh'));

  for (const file of scriptFiles) {
    const filePath = join(skillDir, file.name);
    const content = await readFileContent(filePath);
    await this.executeRule(someRule, filePath, content);
  }
} catch (error) {
  // Silently ignore - optional check
}
```

### Solution

Extract generic file walking pattern:

```typescript
// In src/validators/base.ts
protected async validateFilesInDirectory(
  dirPath: string,
  filter: (entry: fs.Dirent) => boolean,
  processor: (filePath: string, content: string) => Promise<void>,
  context: 'optional' | 'required' = 'optional'
): Promise<void> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const matching = entries.filter(filter);

    for (const entry of matching) {
      const filePath = path.join(dirPath, entry.name);
      const content = await readFileContent(filePath);
      await processor(filePath, content);
    }
  } catch (error) {
    if (context === 'required') {
      this.reportError(
        `Failed to read directory: ${formatError(error)}`,
        dirPath
      );
    }
    // Optional checks fail silently
  }
}

/**
 * Helper for common case: execute rules on matching files
 */
protected async executeRulesOnMatchingFiles(
  dirPath: string,
  filter: (entry: fs.Dirent) => boolean,
  category: RuleCategory,
  context: 'optional' | 'required' = 'optional'
): Promise<void> {
  await this.validateFilesInDirectory(
    dirPath,
    filter,
    async (filePath, content) => {
      await this.executeRulesForCategory(category, filePath, content);
    },
    context
  );
}
```

### Usage

```typescript
// In skills.ts - check shell scripts
await this.executeRulesOnMatchingFiles(
  skillDir,
  (entry) => entry.isFile() && entry.name.endsWith('.sh'),
  'Skills',
  'optional'
);

// More complex case with custom processing
await this.validateFilesInDirectory(
  skillDir,
  (entry) => entry.isFile() && entry.name.endsWith('.py'),
  async (filePath, content) => {
    // Custom validation logic
    if (content.includes('eval(')) {
      this.reportWarning('Python eval() detected', filePath, undefined, 'skill-eval-usage');
    }
  },
  'optional'
);
```

### Benefits

- [YES] Single implementation for file walking
- [YES] Consistent error handling
- [YES] Clear intent with 'optional' vs 'required'
- [YES] ~70 lines of duplication removed

---

## Pattern 5: Directory Filtering Abstraction

### Problem

3 validators duplicate directory filtering logic:

```typescript
// Duplicated in agents.ts, skills.ts, output-styles.ts
private async findDirs(): Promise<string[]> {
  const allDirs = await findDirectories(this.basePath);

  if (this.specificName) {
    return allDirs.filter((dir) => basename(dir) === this.specificName);
  }

  return allDirs;
}
```

### Solution

Extract to BaseValidator:

```typescript
// In src/validators/base.ts
protected filterDirectoriesByName(
  directories: string[],
  filterName?: string
): string[] {
  if (!filterName) {
    return directories;
  }

  return directories.filter((dir) => path.basename(dir) === filterName);
}
```

### Usage

```typescript
// In agents.ts
private async findAgentDirs(): Promise<string[]> {
  const allDirs = await findAgentDirectories(this.basePath);
  return this.filterDirectoriesByName(allDirs, this.specificAgent);
}

// In skills.ts
private async findSkillDirs(): Promise<string[]> {
  const allDirs = await findSkillDirectories(this.basePath);
  return this.filterDirectoriesByName(allDirs, this.specificSkill);
}
```

### Benefits

- [YES] Trivial extraction, big impact
- [YES] Consistent behavior across validators
- [YES] ~30 lines of duplication removed

---

## Pattern 6: Optional Check Error Handling

### Problem

Inconsistent error handling for optional checks:

```typescript
// Some validators do this:
try {
  const entries = await readdir(dir);
  // process entries
} catch (error) {
  // Silently ignore
}

// Others do this:
try {
  const entries = await readdir(dir);
  // process entries
} catch (error) {
  // Intentionally ignore directory read errors
  // This is an optional documentation check...
}

// Others do this:
try {
  const entries = await readdir(dir);
  // process entries
} catch (error) {
  this.reportWarning(`Could not read directory: ${formatError(error)}`, dir);
}
```

### Solution

Standardize with helper:

```typescript
// In src/validators/base.ts
protected async tryReadDirectory(
  dirPath: string,
  context: 'optional' | 'required' = 'required'
): Promise<fs.Dirent[] | null> {
  try {
    return await fs.readdir(dirPath, { withFileTypes: true });
  } catch (error) {
    if (context === 'required') {
      this.reportError(
        `Failed to read directory: ${formatError(error)}`,
        dirPath
      );
    }
    return null;
  }
}

protected async tryReadFile(
  filePath: string,
  context: 'optional' | 'required' = 'required'
): Promise<string | null> {
  try {
    return await readFileContent(filePath);
  } catch (error) {
    if (context === 'required') {
      this.reportError(
        `Failed to read file: ${formatError(error)}`,
        filePath
      );
    }
    return null;
  }
}
```

### Usage

```typescript
// Optional check - fails silently
const entries = await this.tryReadDirectory(skillDir, 'optional');
if (!entries) return;

// Required check - reports error
const content = await this.tryReadFile(requiredFile, 'required');
if (!content) return;
```

### Benefits

- [YES] Consistent error handling
- [YES] Clear intent: optional vs required
- [YES] No try/catch boilerplate
- [YES] Easier to audit error handling

---

## Summary

### Patterns Applied

| Pattern | Validators Affected | Lines Saved | Complexity | Status |
|---------|---------------------|-------------|------------|--------|
| Rule Discovery | All (7) | ~38 imports | Medium | Permanent |
| Frontmatter Parsing | 4 | ~80 lines | Medium | Temporary* |
| Body Content Validation | 3 | ~60 lines | Low | **Deprecated** |
| File Walking | 1 (Skills) | ~70 lines | Medium | Permanent |
| Directory Filtering | 3 | ~30 lines | Low | Permanent |
| Error Handling | All | ~40 lines | Low | Permanent |
| **Total** | **All** | **~318 lines** | **Medium** | Mixed |

*Temporary patterns contain validation logic and will be deprecated in Phase 3

### Code Quality Impact

**Before Phase 2:**
- 38 manual rule imports
- 66 ghost rules (unconfigurable)
- ~200 lines of duplicated code
- Inconsistent error handling
- Validation logic in validators

**After Phase 2:**
- 0 manual rule imports ✓
- 0 ghost rules (all configurable) ✓
- ~50 lines of duplicated code (unavoidable) ✓
- Consistent error handling ✓
- **Most validation logic in rules** (some abstractions remain)

**After Phase 3 (Future):**
- Zero validation logic in validators
- Zero reportError/reportWarning calls
- Pure orchestration pattern

### Validator Complexity

| Validator | Before | After | Phase 3 Target |
|-----------|--------|-------|----------------|
| skills.ts | 400 lines | 280 lines | ~200 lines |
| agents.ts | 250 lines | 180 lines | ~120 lines |
| claude-md.ts | 350 lines | 260 lines | ~180 lines |
| mcp.ts | 220 lines | 150 lines | ~100 lines |
| Others | Varies | Varies | -40-50% |

### Maintainability Score

**Before:** 4/10 (lots of duplication, ghost rules, manual imports, validation in validators)
**After Phase 2:** 7/10 (clean abstractions, most rules configurable, auto-discovery, some validation still in validators)
**After Phase 3:** 10/10 (pure orchestration, zero validation logic, complete rule-based architecture)

### Phase 3 Goals

1. Convert frontmatter name validation to rules
2. Convert body content validations to rules
3. Remove `reportError()`/`reportWarning()` methods entirely
4. Remove validation abstractions from BaseValidator
5. Pure orchestration: find files → execute rules → return results

---

## Implementation Priority

1. **Pattern 1 (Rule Discovery)** - Highest impact, enables other patterns
2. **Pattern 6 (Error Handling)** - Quick win, improves code quality
3. **Pattern 5 (Directory Filtering)** - Trivial extraction
4. **Pattern 2 (Frontmatter)** - High duplication savings
5. **Pattern 3 (Body Content)** - Medium duplication savings
6. **Pattern 4 (File Walking)** - Skills-specific, medium savings
