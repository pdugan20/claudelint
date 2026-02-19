---
description: "Learn how claudelint's rule system works: the Rule interface, schema-delegating and standalone validation patterns, rule registry, and how validators execute rules."
---

# Rule System

claudelint's rule system is modeled after ESLint. Rules are self-contained modules that export metadata and a validation function. This page covers rule implementation patterns, the rule registry, and how validators execute rules.

## Rule Interface

Every rule implements the [`Rule` interface](https://github.com/pdugan20/claudelint/blob/main/src/types/rule.ts):

```typescript
// src/types/rule.ts
export interface Rule {
  meta: RuleMetadata;
  validate: (context: RuleContext) => Promise<void> | void;
}

export interface RuleMetadata {
  id: RuleId;
  name: string;
  description: string;
  category: RuleCategory;
  severity: RuleSeverity;      // 'off' | 'warn' | 'error'
  fixable: boolean;
  deprecated?: boolean | DeprecationInfo;
  since: string;
  schema?: z.ZodType;          // Zod schema for rule options
  defaultOptions?: Record<string, unknown>;
  docs?: RuleDocumentation;    // Auto-generates doc pages
}

export interface RuleContext {
  filePath: string;
  fileContent: string;
  options: Record<string, unknown>;
  report: (issue: RuleIssue) => void;
}

export interface RuleIssue {
  message: string;
  line?: number;
  fix?: string;
  autoFix?: AutoFix;
}
```

## Rule Implementation Patterns

claudelint supports two primary patterns for implementing rules.

### Schema-Delegating Rules

The "thin wrapper" pattern — use when validating individual frontmatter fields that have Zod schema definitions.

Rules delegate to Zod schema validators instead of duplicating validation logic. This is the actual pattern from [`skill-allowed-tools.ts`](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-allowed-tools.ts):

```typescript
export const rule: Rule = {
  meta: {
    id: 'skill-allowed-tools',
    name: 'Skill Allowed Tools Format',
    description:
      'Skill allowed-tools must be an array of tool names, cannot be used with disallowed-tools',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    since: '0.2.0',
    docs: { /* ... */ },
  },
  validate: (context: RuleContext) => {
    const { data: frontmatter } = extractFrontmatter(context.fileContent);
    if (!frontmatter?.['allowed-tools']) return;

    // Delegate to schema validator
    const result = SkillFrontmatterWithRefinements.safeParse(frontmatter);
    if (!result.success) {
      // Report issues with line numbers
    }
  },
};
```

**Categories using this pattern:** Skills, Agents, Output Styles

### Standalone Validation

**Use when:** Validating file-level properties, cross-references, or complex logic that doesn't fit in schemas.

This is the actual pattern from [`claude-md-size.ts`](https://github.com/pdugan20/claudelint/blob/main/src/rules/claude-md/claude-md-size.ts):

```typescript
export const rule: Rule = {
  meta: {
    id: 'claude-md-size',
    name: 'CLAUDE.md File Size',
    description: 'CLAUDE.md exceeds maximum file size limit',
    category: 'CLAUDE.md',
    severity: 'warn',
    fixable: false,
    since: '0.2.0',
    schema: z.object({
      maxSize: z.number().positive().int().optional(),
    }),
    defaultOptions: { maxSize: 40000 },
    docs: { /* ... */ },
  },
  validate: async (context) => {
    const maxSize = (context.options.maxSize as number) ?? 40000;
    const fileSize = await getFileSize(context.filePath);

    if (fileSize >= maxSize) {
      context.report({
        message: `File size (${fileSize} bytes) exceeds limit (${maxSize} bytes)`,
        line: 1,
      });
    }
  },
};
```

**Categories using this pattern:** CLAUDE.md, MCP, Settings, Hooks

### Choosing the Right Pattern

**Use Schema-Delegating when:**

- Validating a single frontmatter field
- Field has corresponding Zod schema definition
- Validation is format/type checking (length, regex, enum)

**Use Standalone Validation when:**

- Validating file-level properties (size, encoding)
- Checking cross-references (does imported file exist?)
- Detecting patterns across multiple fields
- Implementing complex logic that doesn't fit in schemas

## Rule Registry

The [Rule Registry](https://github.com/pdugan20/claudelint/blob/main/src/utils/rules/registry.ts) is a centralized store for all validation rules. Rules self-register at module load time when their module is imported. The auto-generated [`src/rules/index.ts`](https://github.com/pdugan20/claudelint/blob/main/src/rules/index.ts) imports all rule modules, triggering registration.

See the [Rules Reference](/rules/overview) for the full list of rules organized by category.

## Validator Registry

The [Validator Registry](https://github.com/pdugan20/claudelint/blob/main/src/utils/validators/factory.ts) manages validator discovery and instantiation using a factory pattern. Validators self-register at module load, similar to rules:

```typescript
// src/validators/skills.ts (end of file)
ValidatorRegistry.register(
  {
    id: 'skills',
    name: 'Skills Validator',
    description: 'Validates Claude Code skill files',
    filePatterns: ['SKILL.md'],
    enabled: true,
  },
  (options) => new SkillsValidator(options)
);
```

## Validator vs Rule Responsibilities

### Validators

Validators are orchestrators. They:

- Find files matching patterns
- Read file content
- Parse files (JSON, YAML, Markdown)
- Execute rules via `executeRulesForCategory()`
- Aggregate and report results
- Handle **operational messages only** (e.g., "No files found")

### Rules

Rules own all validation logic:

- ALL validation logic
- Individual field checks and cross-field validation
- File existence checks and body content validation
- **Everything users might want to configure/disable**

### Operational Messages

These are the only non-configurable messages (not rules):

- "No skill directories found"
- "No agent directories found"
- "SKILL.md not found in skill directory"
- "File not found: {path}" (when user specifies --path)

These are **discovery/parsing failures**, not validation failures.

### What MUST Be a Rule

If a user might disagree with the check or want to disable it, it MUST be a rule:

```json
// .claudelintrc.json
{
  "rules": {
    "lsp-server-name-too-short": "off"
  }
}
```

This matches ESLint, Prettier, and all modern linting tools.

## Custom Rules

Custom rules are loaded from `.claudelint/rules/` and integrate seamlessly with built-in rules. The [`CustomRuleLoader`](https://github.com/pdugan20/claudelint/blob/main/src/utils/rules/loader.ts) discovers, validates, and registers custom rules alongside built-in ones.

See the [Custom Rules Guide](/development/custom-rules) for complete documentation.
