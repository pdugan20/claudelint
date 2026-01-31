# Medium Rules Implementation Guide

**Category**: Phase 2
**Count**: 17 rules
**Effort**: 1-2 weeks
**Complexity**: Parsing, NLP, cross-file validation

These rules require more complex logic including:

- Natural language processing
- Cross-file validation
- Content structure parsing
- Keyword extraction
- Security pattern detection

---

## Tier 1: Description Quality (MOST CRITICAL)

These three rules have the BIGGEST impact on skill triggering reliability.

### M1: skill-description-trigger-phrases

**Priority**: CRITICAL (Highest impact!)
**Effort**: 6 hours
**Guide Reference**: p9-10

#### Description

Validate that description includes effective trigger phrases that help Claude recognize when to invoke the skill.

#### Rationale

From the guide (p9): "The description is the most important field for triggering your skill. A poorly written description means Claude won't invoke your skill when users need it."

#### Implementation Strategy

**Step 1**: Build trigger phrase library (JSON file)

```json
{
  "actionVerbs": [
    "format", "search", "generate", "deploy", "analyze", "validate",
    "convert", "extract", "transform", "migrate", "backup", "sync",
    "parse", "build", "test", "lint", "optimize", "compress"
  ],
  "technologies": [
    "python", "javascript", "typescript", "rust", "go", "java",
    "docker", "kubernetes", "aws", "github", "git", "npm"
  ],
  "fileTypes": [
    "json", "yaml", "yml", "csv", "markdown", "md", "xml", "html",
    "toml", "ini", "conf", "config"
  ],
  "operations": [
    "install", "configure", "setup", "initialize", "create",
    "delete", "update", "modify", "check", "verify", "inspect"
  ]
}
```

**Step 2**: Implement rule with keyword extraction

```typescript
import * as fs from 'fs';
import * as path from 'path';

interface TriggerPhrases {
  actionVerbs: string[];
  technologies: string[];
  fileTypes: string[];
  operations: string[];
}

export const rule: Rule = {
  meta: {
    type: 'skill',
    category: 'quality',
    severity: 'error',
    source: 'anthropic-guide',
    guideReference: 'p9-10',
  },
  validate: (context: SkillValidationContext) => {
    const { description } = context.frontmatter;

    // Load trigger phrase library
    const libraryPath = path.join(__dirname, 'trigger-phrases.json');
    const library: TriggerPhrases = JSON.parse(
      fs.readFileSync(libraryPath, 'utf-8')
    );

    // Tokenize description (lowercase, split on non-alphanumeric)
    const tokens = description
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length > 0);

    // Count trigger phrases by category
    const counts = {
      actionVerbs: 0,
      technologies: 0,
      fileTypes: 0,
      operations: 0,
    };

    for (const token of tokens) {
      if (library.actionVerbs.includes(token)) counts.actionVerbs++;
      if (library.technologies.includes(token)) counts.technologies++;
      if (library.fileTypes.includes(token)) counts.fileTypes++;
      if (library.operations.includes(token)) counts.operations++;
    }

    // Validation criteria:
    // - Must have at least 1 action verb OR operation
    // - Should have at least 1 technology OR file type (context)
    const hasAction = counts.actionVerbs > 0 || counts.operations > 0;
    const hasContext = counts.technologies > 0 || counts.fileTypes > 0;

    if (!hasAction) {
      context.reportError(
        'Description should include an action verb (format, search, generate, etc.) to help Claude understand when to trigger this skill.',
        { file: 'SKILL.md', line: 1, column: 0 }
      );
    }

    if (!hasContext) {
      context.reportWarning(
        'Description should include specific technology or file type to provide context (Python, JSON, AWS, etc.).',
        { file: 'SKILL.md', line: 1, column: 0 }
      );
    }

    // Calculate overall trigger phrase density
    const totalTriggerPhrases = Object.values(counts).reduce((a, b) => a + b, 0);
    const totalWords = tokens.length;
    const density = totalTriggerPhrases / totalWords;

    // Optimal density: 20-40% (too low = vague, too high = keyword stuffing)
    if (density < 0.2) {
      context.reportWarning(
        `Description has low trigger phrase density (${(density * 100).toFixed(0)}%). Consider adding more specific terms.`,
        { file: 'SKILL.md', line: 1, column: 0 }
      );
    }
  },
};
```

#### Test Cases

```typescript
describe('skill-description-trigger-phrases', () => {
  it('should pass with effective trigger phrases', () => {
    // "Format Python code using Black formatter"
    // Has action verb (format) + technology (Python) + context (Black)
  });

  it('should fail with no action verb', () => {
    // "A Python code tool"
    // Missing action verb
  });

  it('should warn with no context', () => {
    // "Format code files"
    // Has action but no specific technology/file type
  });

  it('should warn with low trigger phrase density', () => {
    // "This is a really useful utility that helps with various tasks"
    // Many words, few trigger phrases
  });

  it('should pass official Anthropic examples', () => {
    // Test against examples from guide
  });
});
```

---

### M2: skill-description-structure

**Priority**: CRITICAL
**Effort**: 3 hours
**Guide Reference**: p9

#### Description

Validate description follows the pattern: `[Action Verb] + [Use Case/Context]`

#### Implementation

```typescript
export const rule: Rule = {
  meta: {
    type: 'skill',
    category: 'quality',
    severity: 'error',
    source: 'anthropic-guide',
    guideReference: 'p9',
  },
  validate: (context: SkillValidationContext) => {
    const { description } = context.frontmatter;

    // Check for imperative mood (starts with verb)
    const words = description.split(/\s+/);
    const firstWord = words[0]?.toLowerCase();

    // Common action verbs (base form)
    const actionVerbs = [
      'format', 'search', 'generate', 'deploy', 'analyze', 'validate',
      'convert', 'extract', 'transform', 'migrate', 'backup', 'sync',
      'parse', 'build', 'test', 'lint', 'optimize', 'compress', 'create',
      'delete', 'update', 'modify', 'check', 'verify', 'inspect', 'install',
      'configure', 'setup', 'initialize', 'run', 'execute', 'process',
    ];

    if (!actionVerbs.includes(firstWord)) {
      context.reportError(
        `Description should start with an action verb in imperative mood. Found: "${firstWord}"`,
        { file: 'SKILL.md', line: 1, column: 0 }
      );
    }

    // Check for sufficient context (at least 4 words)
    if (words.length < 4) {
      context.reportWarning(
        'Description is too short. Include use case or context after the action verb.',
        { file: 'SKILL.md', line: 1, column: 0 }
      );
    }

    // Check for "using" pattern (common in good descriptions)
    // Example: "Format Python code using Black formatter"
    const hasUsing = /\b(using|with|via|through)\b/i.test(description);
    const hasTechnology = /\b[A-Z][a-z]+\b/.test(description); // Capitalized words (tool names)

    if (!hasUsing && hasTechnology) {
      context.reportInfo(
        'Consider using "using", "with", or "via" to connect action with tool/technology.',
        { file: 'SKILL.md', line: 1, column: 0 }
      );
    }
  },
};
```

---

### M3: skill-description-avoid-meta

**Priority**: HIGH
**Effort**: 2 hours
**Guide Reference**: p10

#### Description

Detect and flag meta-language in descriptions ("This skill...", "Use this to...").

#### Implementation

```typescript
export const rule: Rule = {
  meta: {
    type: 'skill',
    category: 'quality',
    severity: 'warning',
    source: 'anthropic-guide',
    guideReference: 'p10',
  },
  validate: (context: SkillValidationContext) => {
    const { description } = context.frontmatter;

    const metaPatterns = [
      { pattern: /^this skill/i, suggestion: 'Remove "This skill" and start with action verb' },
      { pattern: /^this tool/i, suggestion: 'Remove "This tool" and start with action verb' },
      { pattern: /^use this to/i, suggestion: 'Remove "Use this to" and start with action verb' },
      { pattern: /^use this for/i, suggestion: 'Remove "Use this for" and start with action verb' },
      { pattern: /helps you/i, suggestion: 'Remove "helps you" - Claude knows it\'s helpful' },
      { pattern: /allows you to/i, suggestion: 'Remove "allows you to" and start with action verb' },
      { pattern: /a script that/i, suggestion: 'Remove "a script that" and start with action verb' },
      { pattern: /a utility for/i, suggestion: 'Remove "a utility for" and start with action verb' },
      { pattern: /this is a/i, suggestion: 'Remove "this is a" and start with action verb' },
    ];

    for (const { pattern, suggestion } of metaPatterns) {
      if (pattern.test(description)) {
        const match = description.match(pattern);
        context.reportWarning(
          `Meta-language detected: "${match?.[0]}". ${suggestion}`,
          { file: 'SKILL.md', line: 1, column: 0 }
        );
      }
    }
  },
};
```

---

## Tier 2: Security & Integration

### M13: skill-hardcoded-secrets

**Priority**: CRITICAL (Security)
**Effort**: 6 hours
**Guide Reference**: p12

#### Description

Detect hardcoded API keys, tokens, passwords, and other secrets in scripts.

#### Implementation

```typescript
import * as fs from 'fs';
import * as crypto from 'crypto';

interface SecretPattern {
  name: string;
  pattern: RegExp;
  severity: 'error' | 'warning';
}

const SECRET_PATTERNS: SecretPattern[] = [
  // API Keys with known prefixes
  { name: 'Anthropic API Key', pattern: /sk-ant-[a-zA-Z0-9-_]{95,}/, severity: 'error' },
  { name: 'OpenAI API Key', pattern: /sk-[a-zA-Z0-9]{32,}/, severity: 'error' },
  { name: 'GitHub Token', pattern: /ghp_[a-zA-Z0-9]{36,}/, severity: 'error' },
  { name: 'GitHub OAuth', pattern: /gho_[a-zA-Z0-9]{36,}/, severity: 'error' },
  { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/, severity: 'error' },
  { name: 'Stripe API Key', pattern: /sk_live_[a-zA-Z0-9]{24,}/, severity: 'error' },

  // Generic patterns
  { name: 'Generic API Key', pattern: /api[_-]?key\s*=\s*["']([^"']{20,})["']/i, severity: 'warning' },
  { name: 'Generic Token', pattern: /token\s*=\s*["']([^"']{20,})["']/i, severity: 'warning' },
  { name: 'Generic Password', pattern: /password\s*=\s*["']([^"']{8,})["']/i, severity: 'error' },
  { name: 'Generic Secret', pattern: /secret\s*=\s*["']([^"']{20,})["']/i, severity: 'warning' },

  // JWT tokens
  { name: 'JWT Token', pattern: /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/, severity: 'warning' },

  // Private keys
  { name: 'Private Key', pattern: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/, severity: 'error' },
];

export const rule: Rule = {
  meta: {
    type: 'skill',
    category: 'security',
    severity: 'error',
    source: 'anthropic-guide',
    guideReference: 'p12',
  },
  validate: (context: SkillValidationContext) => {
    if (!context.scriptPath) return;

    const scriptContent = fs.readFileSync(context.scriptPath, 'utf-8');
    const lines = scriptContent.split('\n');

    for (const { name, pattern, severity } of SECRET_PATTERNS) {
      const match = scriptContent.match(pattern);
      if (match) {
        // Find line number
        let lineNum = 0;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(match[0])) {
            lineNum = i + 1;
            break;
          }
        }

        const message = `Hardcoded secret detected: ${name}. Use environment variables instead.`;
        if (severity === 'error') {
          context.reportError(message, {
            file: path.basename(context.scriptPath),
            line: lineNum,
            column: 0,
          });
        } else {
          context.reportWarning(message, {
            file: path.basename(context.scriptPath),
            line: lineNum,
            column: 0,
          });
        }
      }
    }

    // High-entropy string detection (potential secrets)
    const entropyThreshold = 4.5; // bits per character
    const minLength = 20;

    const stringPattern = /["']([a-zA-Z0-9+/=_-]{20,})["']/g;
    let stringMatch;

    while ((stringMatch = stringPattern.exec(scriptContent)) !== null) {
      const str = stringMatch[1];
      const entropy = calculateEntropy(str);

      if (entropy > entropyThreshold && str.length >= minLength) {
        context.reportWarning(
          `High-entropy string detected (${entropy.toFixed(2)} bits/char). Potential secret: "${str.substring(0, 20)}..."`,
          { file: path.basename(context.scriptPath), line: 0, column: 0 }
        );
      }
    }
  },
};

function calculateEntropy(str: string): number {
  const charCounts = new Map<string, number>();
  for (const char of str) {
    charCounts.set(char, (charCounts.get(char) || 0) + 1);
  }

  let entropy = 0;
  for (const count of charCounts.values()) {
    const probability = count / str.length;
    entropy -= probability * Math.log2(probability);
  }

  return entropy;
}
```

#### Test Cases

```typescript
describe('skill-hardcoded-secrets', () => {
  it('should detect Anthropic API key', () => {});
  it('should detect GitHub token', () => {});
  it('should detect AWS access key', () => {});
  it('should detect generic API key pattern', () => {});
  it('should detect JWT tokens', () => {});
  it('should detect private keys', () => {});
  it('should detect high-entropy strings', () => {});
  it('should not flag environment variable references', () => {
    // ${API_KEY} or $API_KEY should be OK
  });
});
```

---

### M11: skill-mcp-tool-qualified-name

**Priority**: HIGH
**Effort**: 5 hours
**Guide Reference**: p11

#### Description

MCP tools must use qualified names (server::tool) to avoid ambiguity.

#### Implementation

```typescript
export const rule: Rule = {
  meta: {
    type: 'skill',
    category: 'integration',
    severity: 'error',
    source: 'anthropic-guide',
    guideReference: 'p11',
  },
  validate: (context: SkillValidationContext) => {
    const { bodyContent } = context;

    // Pattern to detect MCP tool references
    // Look for: "use the `tool-name` tool" or "invoke `tool-name`"
    const toolReferencePattern = /(?:use|invoke|call)\s+(?:the\s+)?`([a-z0-9-]+)`\s+tool/gi;

    let match;
    while ((match = toolReferencePattern.exec(bodyContent)) !== null) {
      const toolName = match[1];

      // Check if it's already qualified (contains ::)
      if (!toolName.includes('::')) {
        context.reportError(
          `MCP tool "${toolName}" should use qualified name format (server::tool). Example: \`github::${toolName}\``,
          { file: 'SKILL.md', line: 0, column: 0 }
        );
      }
    }

    // Also check for tool references in code blocks
    const codeBlockPattern = /```(?:bash|sh|shell)\n([\s\S]*?)```/g;
    let codeMatch;

    while ((codeMatch = codeBlockPattern.exec(bodyContent)) !== null) {
      const codeContent = codeMatch[1];

      // Look for mcp_tool or similar patterns
      const mcpToolPattern = /mcp[_-]tool\s+([a-z0-9-]+)/gi;
      let mcpMatch;

      while ((mcpMatch = mcpToolPattern.exec(codeContent)) !== null) {
        const toolName = mcpMatch[1];

        if (!toolName.includes('::')) {
          context.reportError(
            `MCP tool "${toolName}" in code block should use qualified name format (server::tool)`,
            { file: 'SKILL.md', line: 0, column: 0 }
          );
        }
      }
    }
  },
};
```

---

## Tier 3: Progressive Disclosure & Structure

### M4: skill-progressive-disclosure

**Priority**: HIGH
**Effort**: 4 hours
**Guide Reference**: p10
**Dependencies**: E11

#### Description

Validate 3-level information hierarchy: frontmatter → body → references/

#### Implementation

```typescript
export const rule: Rule = {
  meta: {
    type: 'skill',
    category: 'structure',
    severity: 'warning',
    source: 'anthropic-guide',
    guideReference: 'p10',
  },
  validate: (context: SkillValidationContext) => {
    const { frontmatter, bodyContent } = context;

    // Check for description duplication in body
    const descriptionWords = frontmatter.description.toLowerCase().split(/\s+/);
    const bodyWords = bodyContent.toLowerCase().split(/\s+/);

    // If description is verbatim repeated in body (>80% word overlap)
    const overlap = descriptionWords.filter((word) =>
      bodyWords.includes(word)
    ).length;
    const overlapPercentage = overlap / descriptionWords.length;

    if (overlapPercentage > 0.8) {
      context.reportWarning(
        'Description content is duplicated in body. Body should provide HOW details, not repeat WHAT.',
        { file: 'SKILL.md', line: 0, column: 0 }
      );
    }

    // Check if implementation details leaked into description
    const implementationKeywords = [
      'configuration',
      'line length',
      'default settings',
      'options',
      'flags',
      'parameters',
    ];

    for (const keyword of implementationKeywords) {
      if (frontmatter.description.toLowerCase().includes(keyword)) {
        context.reportWarning(
          `Description contains implementation detail: "${keyword}". Move to body section.`,
          { file: 'SKILL.md', line: 1, column: 0 }
        );
      }
    }

    // Check if body references external documentation
    const hasReferencesDir = fs.existsSync(
      path.join(path.dirname(context.skillMdPath), 'references')
    );

    if (hasReferencesDir) {
      // Body should mention "See references/" or link to files
      if (!/references\//i.test(bodyContent)) {
        context.reportWarning(
          'references/ directory exists but is not referenced in body. Link to detailed docs.',
          { file: 'SKILL.md', line: 0, column: 0 }
        );
      }
    }
  },
};
```

---

### M5: skill-body-structure-quality

**Priority**: Medium
**Effort**: 3 hours
**Guide Reference**: p10

#### Description

Validate presence and quality of required sections: Usage, Examples, Notes.

#### Implementation

```typescript
export const rule: Rule = {
  meta: {
    type: 'skill',
    category: 'structure',
    severity: 'warning',
    source: 'anthropic-guide',
    guideReference: 'p10',
  },
  validate: (context: SkillValidationContext) => {
    const { bodyContent } = context;

    // Required sections
    const requiredSections = [
      { name: 'Usage', pattern: /^##\s+Usage/im },
      { name: 'Examples', pattern: /^##\s+Examples?/im },
    ];

    // Recommended sections
    const recommendedSections = [
      { name: 'Notes', pattern: /^##\s+Notes?/im },
      { name: 'Prerequisites', pattern: /^##\s+Prerequisites?/im },
    ];

    for (const { name, pattern } of requiredSections) {
      if (!pattern.test(bodyContent)) {
        context.reportError(
          `Missing required section: "## ${name}"`,
          { file: 'SKILL.md', line: 0, column: 0 }
        );
      }
    }

    for (const { name, pattern } of recommendedSections) {
      if (!pattern.test(bodyContent)) {
        context.reportWarning(
          `Missing recommended section: "## ${name}"`,
          { file: 'SKILL.md', line: 0, column: 0 }
        );
      }
    }

    // Check section order (Usage should come before Examples)
    const usageIndex = bodyContent.search(/^##\s+Usage/im);
    const examplesIndex = bodyContent.search(/^##\s+Examples?/im);

    if (usageIndex > -1 && examplesIndex > -1 && examplesIndex < usageIndex) {
      context.reportWarning(
        'Sections should be ordered: Usage, Examples, Notes',
        { file: 'SKILL.md', line: 0, column: 0 }
      );
    }
  },
};
```

---

### M6-M17: Additional Medium Rules

Due to length constraints, here are the remaining medium rules in summary form:

**M6: skill-examples-quality** - Detect placeholder patterns like `<your-file>`, `[path]`

**M7: skill-cross-reference-validation** - Validate files referenced in body exist in references/

**M8: skill-usage-section-clarity** - Ensure Usage section has code blocks

**M9: skill-body-readability** - Flesch-Kincaid readability scoring

**M10: skill-keyword-density** - Extract and validate domain keywords

**M12: skill-argument-documentation** - Parse script for args, validate documentation

**M14: skill-output-format-documentation** - Check for output format docs

**M15: skill-error-handling-documentation** - Validate error condition docs

**M16: skill-duplicate-content-check** - Compare frontmatter vs body

**M17: skill-version-compatibility-check** - Validate compatibility field format

---

## Implementation Priority

**Week 1** (Days 4-8):

1. **M1** - Description trigger phrases (Day 4) ← HIGHEST IMPACT
2. **M2** - Description structure (Day 5 AM)
3. **M3** - Avoid meta-language (Day 5 PM)
4. **M4** - Progressive disclosure (Day 6 AM)
5. **M5** - Body structure (Day 6 PM)
6. **M8** - Usage section (Day 7)
7. **M6** - Examples quality (Day 8 AM)
8. **M9** - Readability (Day 8 PM)

**Week 2** (Days 9-13):

1. **M13** - Hardcoded secrets (Day 9) ← SECURITY CRITICAL
2. **M11** - MCP qualified names (Day 10)
3. **M7** - Cross-reference validation (Day 11 AM)
4. **M10** - Keyword density (Day 11 PM)
5. **M12** - Argument docs (Day 12 AM)
6. **M14** - Output format docs (Day 12 PM)
7. **M15** - Error docs (Day 13 AM)
8. **M16** - Duplicate content (Day 13 PM)
9. **M17** - Version compatibility (Day 13 PM)

---

## Common Utilities

### Trigger Phrase Library

Create `src/utils/trigger-phrases.json`:

```json
{
  "actionVerbs": ["format", "search", "generate", "..."],
  "technologies": ["python", "javascript", "..."],
  "fileTypes": ["json", "yaml", "..."],
  "operations": ["install", "configure", "..."]
}
```

### Secret Patterns Library

Create `src/utils/secret-patterns.ts`:

```typescript
export const SECRET_PATTERNS = [
  // As shown in M13
];
```

### Readability Scorer

Use existing library: `npm install readability-score`

```typescript
import { readabilityScore } from 'readability-score';

const score = readabilityScore(text);
```

---

## Testing Strategy

Each rule should have:

- DONE Valid examples (pass)
- MISSING Invalid examples (fail with correct message)
- Official Anthropic examples (zero false positives)
- Edge cases
- Performance tests (rules should execute in <100ms)
