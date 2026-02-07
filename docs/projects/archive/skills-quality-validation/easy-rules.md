# Easy Rules Implementation Guide

**Category**: Phase 1
**Count**: 12 rules
**Effort**: 2-3 days
**Complexity**: Simple pattern matching, minimal logic

These rules are straightforward to implement and provide quick wins. They primarily involve:

- File existence/absence checks
- Simple regex patterns
- Basic string operations
- Frontmatter schema additions

---

## E1: skill-readme-forbidden

**Priority**: CRITICAL
**Effort**: 30 minutes
**Guide Reference**: p8

### Description

Skills must use SKILL.md only. README.md in skill folders is explicitly forbidden.

### Rationale

From the guide (p8): "Use SKILL.md as your documentation file. Do not create a README.md in your skill folder as it will not be read by Claude."

### Implementation

```typescript
import type { Rule } from '../../types';
import type { SkillValidationContext } from '../../validators/skills';
import * as path from 'path';
import * as fs from 'fs';

export const rule: Rule = {
  meta: {
    type: 'skill',
    category: 'structure',
    severity: 'error',
    source: 'anthropic-guide',
    guideReference: 'p8',
  },
  validate: (context: SkillValidationContext) => {
    const skillDir = path.dirname(context.skillMdPath);
    const readmePath = path.join(skillDir, 'README.md');

    if (fs.existsSync(readmePath)) {
      context.reportError(
        'README.md is forbidden in skill folders. Use SKILL.md only.',
        { file: 'README.md', line: 0, column: 0 }
      );
    }
  },
};
```

### Test Cases

```typescript
describe('skill-readme-forbidden', () => {
  it('should pass when no README.md exists', () => {
    // Skill folder with only SKILL.md and script
  });

  it('should fail when README.md exists', () => {
    // Create skill folder with README.md
    // Expect error
  });

  it('should allow README.md in subdirectories', () => {
    // README.md in references/ folder is OK
  });
});
```

---

## E2: skill-missing-compatibility

**Priority**: HIGH
**Effort**: 30 minutes
**Guide Reference**: p9

### Description

Frontmatter must include a `compatibility` field specifying supported platforms.

### Rationale

Users need to know if a skill works on their system (macOS, Linux, Windows, etc.)

### Implementation

**Step 1**: Update schema in `src/schemas/skill-frontmatter.schema.ts`

```typescript
export const SkillFrontmatterSchema = z.object({
  // ... existing fields
  compatibility: z
    .array(z.enum(['macos', 'linux', 'windows', 'unix']))
    .min(1, 'At least one platform must be specified')
    .optional(),
  // ... other fields
});
```

**Step 2**: Create validation rule

```typescript
import type { Rule } from '../../types';
import type { SkillValidationContext } from '../../validators/skills';

export const rule: Rule = {
  meta: {
    type: 'skill',
    category: 'frontmatter',
    severity: 'warning',
    source: 'anthropic-guide',
    guideReference: 'p9',
  },
  validate: (context: SkillValidationContext) => {
    const { frontmatter } = context;

    if (!frontmatter.compatibility || frontmatter.compatibility.length === 0) {
      context.reportWarning(
        'Frontmatter should include a "compatibility" field specifying supported platforms (macos, linux, windows, unix)',
        { file: 'SKILL.md', line: 1, column: 0 }
      );
    }
  },
};
```

### Test Cases

```typescript
describe('skill-missing-compatibility', () => {
  it('should pass when compatibility field is present', () => {
    const frontmatter = {
      name: 'test-skill',
      compatibility: ['macos', 'linux'],
    };
  });

  it('should warn when compatibility field is missing', () => {
    const frontmatter = {
      name: 'test-skill',
      // no compatibility
    };
  });

  it('should warn when compatibility array is empty', () => {
    const frontmatter = {
      name: 'test-skill',
      compatibility: [],
    };
  });
});
```

---

## E3: skill-missing-license

**Priority**: Medium
**Effort**: 30 minutes
**Guide Reference**: p9

### Description

Frontmatter should include a `license` field for clear licensing terms.

### Implementation

**Step 1**: Update schema

```typescript
export const SkillFrontmatterSchema = z.object({
  // ... existing fields
  license: z
    .enum(['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'ISC', 'Unlicense'])
    .optional(),
  // ... other fields
});
```

**Step 2**: Create rule

```typescript
export const rule: Rule = {
  meta: {
    type: 'skill',
    category: 'frontmatter',
    severity: 'warning',
    source: 'anthropic-guide',
    guideReference: 'p9',
  },
  validate: (context: SkillValidationContext) => {
    if (!context.frontmatter.license) {
      context.reportWarning(
        'Frontmatter should include a "license" field (MIT, Apache-2.0, GPL-3.0, etc.)',
        { file: 'SKILL.md', line: 1, column: 0 }
      );
    }
  },
};
```

---

## E4: skill-multiple-scripts

**Priority**: HIGH
**Effort**: 45 minutes
**Guide Reference**: p8

### Description

Only one executable script is allowed per skill. Multiple scripts cause ambiguity.

### Implementation

```typescript
import * as fs from 'fs';
import * as path from 'path';

export const rule: Rule = {
  meta: {
    type: 'skill',
    category: 'structure',
    severity: 'error',
    source: 'anthropic-guide',
    guideReference: 'p8',
  },
  validate: (context: SkillValidationContext) => {
    const skillDir = path.dirname(context.skillMdPath);
    const files = fs.readdirSync(skillDir);

    // Find all executable files (excluding SKILL.md)
    const executables = files.filter((file) => {
      if (file === 'SKILL.md' || file.startsWith('.')) return false;

      const filePath = path.join(skillDir, file);
      const stats = fs.statSync(filePath);

      // Check if file is executable
      if (!stats.isFile()) return false;

      try {
        fs.accessSync(filePath, fs.constants.X_OK);
        return true;
      } catch {
        return false;
      }
    });

    if (executables.length > 1) {
      context.reportError(
        `Only one executable script is allowed per skill. Found: ${executables.join(', ')}`,
        { file: 'SKILL.md', line: 0, column: 0 }
      );
    } else if (executables.length === 0) {
      context.reportError(
        'Skill must have at least one executable script',
        { file: 'SKILL.md', line: 0, column: 0 }
      );
    }
  },
};
```

### Test Cases

```typescript
describe('skill-multiple-scripts', () => {
  it('should pass with exactly one executable script', () => {});

  it('should fail with multiple executable scripts', () => {});

  it('should fail with no executable scripts', () => {});

  it('should ignore non-executable files', () => {});
});
```

---

## E5: skill-xml-tags-anywhere

**Priority**: CRITICAL (Security)
**Effort**: 1 hour
**Guide Reference**: p10

### Description

XML tags are forbidden ANYWHERE in the skill (frontmatter, body, script comments).

### Rationale

XML tags can interfere with Claude's parsing and cause skills to malfunction.

### Implementation

**Extend existing rule** to check all files, not just description.

```typescript
import * as fs from 'fs';

export const rule: Rule = {
  meta: {
    type: 'skill',
    category: 'security',
    severity: 'error',
    source: 'anthropic-guide',
    guideReference: 'p10',
  },
  validate: (context: SkillValidationContext) => {
    const xmlTagPattern = /<[a-zA-Z][^>]*>/;

    // Check frontmatter (all string fields)
    const checkFrontmatter = (obj: any, path: string = 'frontmatter') => {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string' && xmlTagPattern.test(value)) {
          context.reportError(
            `XML tags are forbidden. Found in ${path}.${key}: ${value.match(xmlTagPattern)?.[0]}`,
            { file: 'SKILL.md', line: 1, column: 0 }
          );
        }
      }
    };
    checkFrontmatter(context.frontmatter);

    // Check body content
    if (xmlTagPattern.test(context.bodyContent)) {
      const match = context.bodyContent.match(xmlTagPattern);
      context.reportError(
        `XML tags are forbidden in skill body. Found: ${match?.[0]}`,
        { file: 'SKILL.md', line: 0, column: 0 }
      );
    }

    // Check script content
    if (context.scriptPath) {
      const scriptContent = fs.readFileSync(context.scriptPath, 'utf-8');
      if (xmlTagPattern.test(scriptContent)) {
        const match = scriptContent.match(xmlTagPattern);
        context.reportError(
          `XML tags are forbidden in script files. Found: ${match?.[0]}`,
          { file: path.basename(context.scriptPath), line: 0, column: 0 }
        );
      }
    }
  },
};
```

### Test Cases

```typescript
describe('skill-xml-tags-anywhere', () => {
  it('should pass when no XML tags exist', () => {});

  it('should fail when XML tag in frontmatter description', () => {});

  it('should fail when XML tag in body content', () => {});

  it('should fail when XML tag in script comments', () => {});

  it('should allow markdown code blocks with XML examples', () => {
    // XML in ```xml code blocks should be OK
  });
});
```

---

## E6: skill-body-word-count

**Priority**: HIGH
**Effort**: 1 hour
**Guide Reference**: p10

### Description

Body content must be less than 5,000 words (not lines).

### Rationale

Guide explicitly says "5,000 words", but current implementation checks line count.

### Implementation

**Replace** `skill-body-line-count` with this:

```typescript
export const rule: Rule = {
  meta: {
    type: 'skill',
    category: 'content',
    severity: 'error',
    source: 'anthropic-guide',
    guideReference: 'p10',
  },
  validate: (context: SkillValidationContext) => {
    const { bodyContent } = context;

    // Count words (split on whitespace, filter empty)
    const words = bodyContent
      .split(/\s+/)
      .filter((word) => word.trim().length > 0);

    const wordCount = words.length;
    const maxWords = 5000;

    if (wordCount > maxWords) {
      context.reportError(
        `Body content exceeds maximum word count. Found: ${wordCount} words, maximum: ${maxWords} words`,
        { file: 'SKILL.md', line: 0, column: 0 }
      );
    }
  },
};
```

### Test Cases

```typescript
describe('skill-body-word-count', () => {
  it('should pass with body under 5000 words', () => {});

  it('should fail with body over 5000 words', () => {});

  it('should count words correctly (not lines)', () => {
    // 100 lines with 10 words each = 1000 words (should pass)
    // 100 lines with 60 words each = 6000 words (should fail)
  });

  it('should handle code blocks correctly', () => {
    // Words in code blocks should count
  });
});
```

---

## E7: skill-placeholder-content

**Priority**: Medium
**Effort**: 45 minutes
**Guide Reference**: p11

### Description

Detect placeholder content like TODO, FIXME, or generic examples.

### Implementation

```typescript
export const rule: Rule = {
  meta: {
    type: 'skill',
    category: 'quality',
    severity: 'warning',
    source: 'anthropic-guide',
    guideReference: 'p11',
  },
  validate: (context: SkillValidationContext) => {
    const placeholderPatterns = [
      /\bTODO\b/i,
      /\bFIXME\b/i,
      /\bXXX\b/,
      /\bHACK\b/i,
      /\bNOTE:\s*placeholder/i,
      /\bComing soon\b/i,
      /\bTo be implemented\b/i,
    ];

    const { bodyContent } = context;

    for (const pattern of placeholderPatterns) {
      const match = bodyContent.match(pattern);
      if (match) {
        context.reportWarning(
          `Placeholder content detected: "${match[0]}". Remove before publishing.`,
          { file: 'SKILL.md', line: 0, column: 0 }
        );
      }
    }
  },
};
```

---

## E8: skill-name-first-person

**Priority**: Medium
**Effort**: 45 minutes
**Guide Reference**: p9

### Description

Skill names should be descriptive, not first-person references.

### Implementation

```typescript
export const rule: Rule = {
  meta: {
    type: 'skill',
    category: 'naming',
    severity: 'warning',
    source: 'anthropic-guide',
    guideReference: 'p9',
  },
  validate: (context: SkillValidationContext) => {
    const { name } = context.frontmatter;

    const firstPersonPatterns = [
      /^my-/i,
      /^personal-/i,
      /-mine$/i,
      /^i-/i,
    ];

    for (const pattern of firstPersonPatterns) {
      if (pattern.test(name)) {
        context.reportWarning(
          `Skill name should be descriptive, not first-person. Found: "${name}"`,
          { file: 'SKILL.md', line: 1, column: 0 }
        );
        break;
      }
    }
  },
};
```

---

## E9: skill-single-sentence-description

**Priority**: HIGH
**Effort**: 1 hour
**Guide Reference**: p9

### Description

Description should be a single, focused sentence.

### Implementation

```typescript
export const rule: Rule = {
  meta: {
    type: 'skill',
    category: 'description',
    severity: 'warning',
    source: 'anthropic-guide',
    guideReference: 'p9',
  },
  validate: (context: SkillValidationContext) => {
    const { description } = context.frontmatter;

    // Count sentence-ending punctuation
    const sentences = description.split(/[.!?]+/).filter((s) => s.trim().length > 0);

    if (sentences.length > 1) {
      context.reportWarning(
        `Description should be a single sentence. Found ${sentences.length} sentences.`,
        { file: 'SKILL.md', line: 1, column: 0 }
      );
    }

    // Check for sentence fragments (no ending punctuation)
    if (!description.trim().match(/[.!?]$/)) {
      context.reportWarning(
        'Description should end with a period.',
        { file: 'SKILL.md', line: 1, column: 0 }
      );
    }
  },
};
```

---

## E10: skill-overly-generic-name

**Priority**: Medium
**Effort**: 1 hour
**Guide Reference**: p11

### Description

Flag generic skill names that don't describe what the skill does.

### Implementation

```typescript
export const rule: Rule = {
  meta: {
    type: 'skill',
    category: 'naming',
    severity: 'warning',
    source: 'anthropic-guide',
    guideReference: 'p11',
  },
  validate: (context: SkillValidationContext) => {
    const { name } = context.frontmatter;

    const genericKeywords = [
      'helper',
      'util',
      'utils',
      'tool',
      'tools',
      'script',
      'manager',
      'handler',
      'processor',
      'service',
    ];

    // Check if name is ONLY a generic keyword
    const nameParts = name.split('-');
    const isOnlyGeneric = nameParts.every((part) =>
      genericKeywords.includes(part.toLowerCase())
    );

    if (isOnlyGeneric) {
      context.reportWarning(
        `Skill name is too generic: "${name}". Use descriptive names that indicate functionality.`,
        { file: 'SKILL.md', line: 1, column: 0 }
      );
    }
  },
};
```

---

## E11: skill-references-directory-structure

**Priority**: Medium
**Effort**: 1 hour
**Guide Reference**: p10

### Description

If references/ directory exists, validate its structure.

### Implementation

```typescript
import * as path from 'path';
import * as fs from 'fs';

export const rule: Rule = {
  meta: {
    type: 'skill',
    category: 'structure',
    severity: 'warning',
    source: 'anthropic-guide',
    guideReference: 'p10',
  },
  validate: (context: SkillValidationContext) => {
    const skillDir = path.dirname(context.skillMdPath);
    const referencesDir = path.join(skillDir, 'references');

    if (!fs.existsSync(referencesDir)) {
      return; // No references directory is fine
    }

    // If references/ exists, check it's a directory
    const stats = fs.statSync(referencesDir);
    if (!stats.isDirectory()) {
      context.reportError(
        'references/ must be a directory',
        { file: 'SKILL.md', line: 0, column: 0 }
      );
      return;
    }

    // Check it contains at least one markdown file
    const files = fs.readdirSync(referencesDir);
    const mdFiles = files.filter((f) => f.endsWith('.md'));

    if (mdFiles.length === 0) {
      context.reportWarning(
        'references/ directory exists but contains no markdown files',
        { file: 'SKILL.md', line: 0, column: 0 }
      );
    }
  },
};
```

---

## E12: skill-frontmatter-field-order

**Priority**: Low
**Effort**: 1 hour
**Guide Reference**: p9

### Description

Enforce recommended field order in frontmatter for consistency.

### Implementation

```typescript
export const rule: Rule = {
  meta: {
    type: 'skill',
    category: 'style',
    severity: 'warning',
    source: 'anthropic-guide',
    guideReference: 'p9',
  },
  validate: (context: SkillValidationContext) => {
    const recommendedOrder = [
      'name',
      'description',
      'version',
      'compatibility',
      'license',
      'authors',
      'tags',
    ];

    const actualFields = Object.keys(context.frontmatter);

    // Check if fields that exist are in recommended order
    const relevantFields = actualFields.filter((f) =>
      recommendedOrder.includes(f)
    );

    for (let i = 1; i < relevantFields.length; i++) {
      const prevIndex = recommendedOrder.indexOf(relevantFields[i - 1]);
      const currIndex = recommendedOrder.indexOf(relevantFields[i]);

      if (currIndex < prevIndex) {
        context.reportWarning(
          `Frontmatter fields should follow recommended order: ${recommendedOrder.join(', ')}`,
          { file: 'SKILL.md', line: 1, column: 0 }
        );
        break;
      }
    }
  },
};
```

---

## Summary

### Implementation Checklist

**Day 1** (Core structural rules):

- [ ] E1: skill-readme-forbidden
- [ ] E4: skill-multiple-scripts
- [ ] E5: skill-xml-tags-anywhere
- [ ] E6: skill-body-word-count

**Day 2** (Frontmatter enhancements):

- [ ] E2: skill-missing-compatibility
- [ ] E3: skill-missing-license
- [ ] E9: skill-single-sentence-description
- [ ] E12: skill-frontmatter-field-order

**Day 3** (Content quality basics):

- [ ] E7: skill-placeholder-content
- [ ] E8: skill-name-first-person
- [ ] E10: skill-overly-generic-name
- [ ] E11: skill-references-directory-structure

### Dependencies

- **E11** must complete before **M4** (progressive-disclosure) and **M7** (cross-reference-validation)

### Testing Strategy

For each rule:

1. Create test file: `tests/rules/skills/[rule-name].test.ts`
2. Test against valid skills (should pass)
3. Test against invalid skills (should fail with correct message)
4. Test edge cases
5. Test against official Anthropic examples (zero false positives)

### Common Patterns

**File system operations**:

```typescript
import * as fs from 'fs';
import * as path from 'path';

const skillDir = path.dirname(context.skillMdPath);
const filePath = path.join(skillDir, 'README.md');
const exists = fs.existsSync(filePath);
```

**Regex matching**:

```typescript
const pattern = /regex-pattern/i;
const match = content.match(pattern);
if (match) {
  context.reportError(`Found: ${match[0]}`, location);
}
```

**Schema updates**:

```typescript
// In src/schemas/skill-frontmatter.schema.ts
export const SkillFrontmatterSchema = z.object({
  newField: z.string().optional(),
  // ...
});
```
