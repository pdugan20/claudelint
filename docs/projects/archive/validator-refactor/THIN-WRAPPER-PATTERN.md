# Thin Wrapper Pattern for Schema-Based Rules

## Overview

The **thin wrapper pattern** is an architectural approach for implementing validation rules that delegate to Zod schema validators instead of duplicating validation logic.

This pattern emerged during Phase 2.3 of the validator refactor project as a solution to avoid duplicating validation logic between Zod schemas and ESLint-style rules.

## The Problem

During Phase 2, we discovered that Skills, Agents, and Output-styles validators had 23 "stub rules" with empty `validate()` functions:

```typescript
// Before: Stub rule with no implementation
export const rule: Rule = {
  meta: {
    id: 'skill-name',
    name: 'Skill Name Format',
    description: 'Skill name must be lowercase-with-hyphens',
    category: 'Skills',
    severity: 'error',
  },
  validate: () => {
    // No-op: Validation implemented in SkillFrontmatterSchema
  },
};
```

The validation logic existed in Zod schemas:

```typescript
// Validation logic in schema
export const SkillFrontmatterSchema = z.object({
  name: lowercaseHyphens()
    .max(64, 'Skill name must be 64 characters or less')
    .refine(noXMLTags().check, { message: noXMLTags().message })
    .refine(noReservedWords().check, { message: noReservedWords().message }),
});
```

### Options Considered

**Option A: Full Duplication**
- Implement rules with complete validation logic
- Remove validation from Zod schemas
- **Downside:** 100% duplication, maintenance nightmare

**Option B: Keep Stubs**
- Leave stub rules as placeholders
- Keep validation in schemas only
- **Downside:** Rules can't be individually controlled, poor error context

**Option C: Thin Wrappers** (CHOSEN)
- Keep Zod schema validation
- Fill in stub rules to delegate to schemas
- **Benefits:** Single source of truth, individual rule control, better error messages

## The Solution: Thin Wrapper Pattern

### Core Principles

1. **Keep Zod schemas WITH validation logic** - No changes to schema definitions
2. **Rules delegate to schema validators** - Call `schema.shape.fieldName.safeParse()`
3. **Rules provide context** - Add line numbers, better error messages
4. **Single source of truth** - Validation logic lives in schemas
5. **Individual rule control** - Each rule can be enabled/disabled independently

### Implementation Pattern

```typescript
// 1. Schema contains validation logic (unchanged)
export const SkillFrontmatterSchema = z.object({
  name: lowercaseHyphens()
    .max(64, 'Skill name must be 64 characters or less')
    .refine(noXMLTags().check, { message: noXMLTags().message }),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .refine(thirdPerson().check, { message: thirdPerson().message }),
});

// 2. Rule delegates to schema validator
import { SkillFrontmatterSchema } from '../../schemas/skill-frontmatter.schema';

export const rule: Rule = {
  meta: {
    id: 'skill-name',
    name: 'Skill Name Format',
    description: 'Skill name must be lowercase-with-hyphens, under 64 characters',
    category: 'Skills',
    severity: 'error',
    fixable: false,
  },
  validate: (content: string, filePath: string, context: RuleContext) => {
    // Extract frontmatter
    const { data: frontmatter } = parseFrontmatter(content);

    // Check if field exists
    if (!frontmatter?.name) {
      return; // Field not present - let other rules handle missing fields
    }

    // Delegate to Zod schema validator for this specific field
    const nameSchema = SkillFrontmatterSchema.shape.name;
    const result = nameSchema.safeParse(frontmatter.name);

    if (!result.success) {
      // Report with proper context
      const line = getFrontmatterLineNumber(content, 'name');
      context.report({
        message: result.error.issues[0].message,
        line,
        column: 1,
      });
    }
  },
};
```

### Benefits

#### 1. Single Source of Truth
Validation logic stays in Zod schemas. Update once, all rules automatically reflect changes.

```typescript
// Update schema
export const SkillFrontmatterSchema = z.object({
  name: lowercaseHyphens()
    .max(100, 'Skill name must be 100 characters or less'), // Changed from 64 to 100
});

// Rules automatically use new validation - no code changes needed
```

#### 2. Individual Rule Control
Users can disable specific validations:

```json
{
  "rules": {
    "skill-name": "off",           // Disable name validation
    "skill-description": "warn"    // Keep description as warning
  }
}
```

#### 3. Better Error Messages
Rules can provide context that generic schema errors can't:

```typescript
// Without wrapper (schema-only)
Error: Skill name must be lowercase-with-hyphens
  at file.md

// With wrapper (rule-based)
Error: Skill name must be lowercase-with-hyphens
  at file.md:3:1
  Rule: skill-name (error)
```

#### 4. Proper Metadata
Each rule has description, category, severity, documentation URL:

```typescript
meta: {
  id: 'skill-name',
  name: 'Skill Name Format',
  description: 'Skill name must be lowercase-with-hyphens, under 64 characters',
  category: 'Skills',
  severity: 'error',
  docUrl: 'https://github.com/.../docs/rules/skills/skill-name.md',
}
```

#### 5. No Duplication
Validation logic isn't duplicated. Rules just call schema validators.

## When to Use This Pattern

### Use Thin Wrapper Pattern When:

- Validating a **single frontmatter field**
- Field has a **corresponding Zod schema definition**
- Validation is **format/type checking** (length, regex, enum, refinements)
- You want to maintain a **single source of truth**

### Don't Use Thin Wrapper Pattern When:

- Validating **file-level properties** (size, encoding, structure)
- Checking **cross-references** (does imported file exist?)
- Detecting **patterns across multiple fields**
- Implementing **complex logic** that doesn't fit in schemas
- Validation requires **external I/O** (file system, network)

### Examples by Category

**Use Thin Wrapper (Schema-Delegating):**
- `skill-name` - Validates name field format
- `skill-description` - Validates description field
- `agent-model` - Validates model enum value
- `output-style-examples` - Validates examples array

**Standalone Validation:**
- `claude-md-size-error` - File size limit (file-level)
- `claude-md-import-circular` - Import cycle detection (cross-file)
- `agent-skills-not-found` - Cross-reference validation
- `mcp-server-key-mismatch` - Cross-field validation

## Implementation Guidelines

### Step 1: Identify the Schema Field

Find the Zod schema field this rule validates:

```typescript
// src/schemas/skill-frontmatter.schema.ts
export const SkillFrontmatterSchema = z.object({
  name: lowercaseHyphens().max(64), // <-- This field
  description: z.string().min(10),
});
```

### Step 2: Extract and Validate

In the rule, extract the field and call the schema validator:

```typescript
validate: (content: string, filePath: string, context: RuleContext) => {
  // 1. Parse frontmatter
  const { data: frontmatter } = parseFrontmatter(content);

  // 2. Check if field exists
  if (!frontmatter?.name) {
    return; // Not present
  }

  // 3. Get schema validator for this field
  const nameSchema = SkillFrontmatterSchema.shape.name;

  // 4. Validate
  const result = nameSchema.safeParse(frontmatter.name);

  // 5. Report if validation fails
  if (!result.success) {
    const line = getFrontmatterLineNumber(content, 'name');
    context.report({
      message: result.error.issues[0].message,
      line,
      column: 1,
    });
  }
}
```

### Step 3: Write Tests

Test both valid and invalid cases:

```typescript
import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-name';

const ruleTester = new ClaudeLintRuleTester();

ruleTester.run('skill-name', rule, {
  valid: [
    {
      content: '---\nname: my-skill\n---\n# Skill',
      filePath: '/test/SKILL.md',
    },
  ],
  invalid: [
    {
      content: '---\nname: MySkill\n---\n# Skill',
      filePath: '/test/SKILL.md',
      errors: [{ message: 'must be lowercase-with-hyphens' }],
    },
  ],
});
```

## Migration Plan

Phase 2.3 implements this pattern for:

### Task 2.3.1: Skills (10 rules)
- skill-name
- skill-description
- skill-version
- skill-model
- skill-context
- skill-agent
- skill-allowed-tools
- skill-disallowed-tools
- skill-tags
- skill-dependencies

### Task 2.3.2: Agents (10 rules)
- agent-name
- agent-description
- agent-model
- agent-tools
- agent-disallowed-tools
- agent-events
- agent-skills
- agent-hooks
- agent-skills-not-found
- agent-hooks-invalid-schema

### Task 2.3.3: Output-styles (3 rules)
- output-style-name
- output-style-description
- output-style-examples

**Total:** 23 stub rules converted to thin wrappers

## Testing Strategy

Each wrapper rule gets its own test file:

```typescript
// tests/rules/skills/skill-name.test.ts
describe('skill-name', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-name', rule, {
      valid: [
        { content: '---\nname: my-skill\n---', filePath: '/test/SKILL.md' },
        { content: '---\nname: api-client\n---', filePath: '/test/SKILL.md' },
      ],
      invalid: [
        {
          content: '---\nname: MySkill\n---',
          filePath: '/test/SKILL.md',
          errors: [{ message: 'lowercase-with-hyphens' }],
        },
        {
          content: '---\nname: skill_name\n---',
          filePath: '/test/SKILL.md',
          errors: [{ message: 'lowercase-with-hyphens' }],
        },
      ],
    });
  });
});
```

## Architecture Decision Record

**Date:** 2026-01-29

**Status:** Accepted

**Context:** Phase 2.3 required implementing 23 stub rules. Options were full duplication, keep stubs, or thin wrappers.

**Decision:** Use thin wrapper pattern - rules delegate to Zod schemas.

**Consequences:**
- **Positive:** Single source of truth, no duplication, individual rule control
- **Positive:** Better error messages with context, proper metadata
- **Negative:** Slight indirection (rules call schemas)
- **Negative:** Mixed patterns across categories (some use wrappers, some don't)

**Alternatives Considered:**
- Full duplication: Rejected due to maintenance burden
- Keep stubs: Rejected due to lack of individual control

## References

- Implementation Tracker: `docs/projects/validator-refactor-phase-2/IMPLEMENTATION-TRACKER.md`
- Architecture Doc: `docs/architecture.md#rule-implementation-patterns`
- Schema Helpers: `src/utils/schema-helpers.ts`
- Example Stub Rule: `src/rules/skills/skill-name.ts`
- Example Schema: `src/schemas/skill-frontmatter.schema.ts`
