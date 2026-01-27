# Plugin and Custom Rule Feasibility Analysis

This document analyzes the feasibility of adding plugin and custom rule support to claudelint, based on research of how other popular linting tools implement these features.

## Table of Contents

- [Executive Summary](#executive-summary)
- [Current Architecture Analysis](#current-architecture-analysis)
- [Proposed Approaches](#proposed-approaches)
- [Implementation Difficulty Assessment](#implementation-difficulty-assessment)
- [Recommended Approach](#recommended-approach)
- [Implementation Phases](#implementation-phases)
- [Trade-offs and Considerations](#trade-offs-and-considerations)

## Executive Summary

### Verdict: Moderately Easy to Implement

Adding plugin and custom rule support to claudelint is **moderately easy** due to:

**Existing Infrastructure:**

- BaseValidator class provides foundation for custom rules
- RuleRegistry already tracks rule metadata
- Configuration system supports rule-level config
- Inline disable comments already implemented

  **Missing Components:**

- Plugin discovery and loading mechanism
- Public rule API and context objects
- Helper utilities for common operations
- Namespace system for third-party rules

**Estimated Effort:**

- **Custom Rules (Simple)**: 2-3 weeks
- **Full Plugin System**: 4-6 weeks
- **Total with Testing/Docs**: 6-8 weeks

**Recommended Path:** Start with simple custom rules (like SwiftLint's regex approach), then evolve to full plugin support (like markdownlint's approach).

## Current Architecture Analysis

### Strengths for Extensibility

#### 1. BaseValidator Pattern

claudelint already uses a clean inheritance pattern:

````typescript
abstract class BaseValidator {
  protected options: ValidatorOptions;
  protected errors: ValidationError[] = [];
  protected warnings: ValidationWarning[] = [];

  abstract validate(): Promise<ValidationResult>;

  protected reportError(message, file?, line?, ruleId?): void;
  protected reportWarning(message, file?, line?, ruleId?): void;
}
```text
**Analysis:** This is 80% of what we need for custom rules. Just need to expose it as a public API.

#### 2. Rule Registry System

Already has centralized rule metadata:

```typescript
interface RuleMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: 'error' | 'warning';
  fixable: boolean;
  deprecated: boolean;
  // ...
}
```text
**Analysis:** Perfect foundation. Just need to make it pluggable.

#### 3. Configuration System

Has rule-level configuration:

```typescript
interface ClaudeLintConfig {
  rules?: Record<string, RuleConfig | 'off' | 'warn' | 'error'>;
  overrides?: ConfigOverride[];
  // ...
}
```text
**Analysis:** Already supports enabling/disabling rules by ID. Can easily extend to plugin rules.

#### 4. Auto-fix Infrastructure

Already has AutoFix interface:

```typescript
interface AutoFix {
  ruleId: string;
  description: string;
  filePath: string;
  apply: (currentContent: string) => string;
}
```text
**Analysis:** Modern and well-designed. Comparable to ESLint's fixer API.

### Gaps to Address

#### 1. No Plugin Loading

Currently, validators are hardcoded:

```typescript
// src/cli.ts
import { ClaudeMdValidator } from './validators/claude-md';
import { SkillsValidator } from './validators/skills';
// ... etc
```text
**Need:** Dynamic import/require mechanism like ESLint or markdownlint.

#### 2. No Public Rule API

BaseValidator is internal infrastructure, not a public API. Custom rules need:

- Clear interface contract
- Context object with utilities
- Documentation for rule authors

#### 3. No Helper Utilities

Other tools provide helpers:

- markdownlint: `markdownlint-rule-helpers`
- Stylelint: `utils` from stylelint package
- ESLint: `context.sourceCode` utilities

**Need:** Helper package for common Claude-specific operations.

#### 4. No Namespace System

All rules currently use simple IDs like `size-error`, `import-missing`.

**Need:** Namespace system like `@scope/plugin/rule-name` to prevent conflicts.

## Proposed Approaches

### Option 1: Simple Custom Rules (SwiftLint Style)

**Inspired by:** SwiftLint's regex-based custom rules

**Implementation:**

```json
{
  "customRules": {
    "no-hardcoded-model": {
      "pattern": "model:\\s*[\"']claude-[^\"']+[\"']",
      "message": "Use environment variable for model names",
      "severity": "warning",
      "filePattern": "**/*.md"
    },
    "no-todo-without-ticket": {
      "pattern": "TODO(?!.*JIRA-\\d+)",
      "message": "TODO comments must reference a ticket",
      "severity": "error"
    }
  }
}
```text
**Pros:**

- Very simple to implement (~1-2 weeks)
- No npm packages required
- Configuration-only (no code)
- Good for 80% of simple use cases
- No compilation/build step

**Cons:**

- Limited to regex patterns
- No AST access
- No complex logic
- No auto-fix support

**Difficulty:**  **Easy** (2-3 weeks with testing)

### Option 2: Lightweight Plugin System (markdownlint Style)

**Inspired by:** markdownlint's custom rule system

**Implementation:**

```typescript
// Custom rule file: .claude/rules/my-rule.ts
import { CustomRule } from '@pdugan20/claudelint';

export default {
  names: ['custom-model-check', 'CM001'],
  description: 'Validate model configuration',
  category: 'Settings',
  severity: 'warning',

  async validate(params: RuleParams): Promise<RuleViolation[]> {
    const violations = [];

    if (params.fileType === 'settings') {
      const settings = JSON.parse(params.content);
      if (settings.model?.includes('claude-2')) {
        violations.push({
          line: findLineNumber(params.content, 'model'),
          message: 'Deprecated model version',
          fix: 'Update to claude-3 or later'
        });
      }
    }

    return violations;
  }
} as CustomRule;
```text
**Configuration:**

```json
{
  "customRules": [
    "./.claude/rules/my-rule.ts",
    "claudelint-rule-teamname"
  ],
  "rules": {
    "custom-model-check": "error"
  }
}
```text
**Pros:**

- Full programmatic control
- Can use npm packages OR local files
- Async support for network/file operations
- Access to full file content
- Simple API (similar to current validators)
- Can provide helper utilities

**Cons:**

- Requires TypeScript/JavaScript knowledge
- No AST access (just raw content)
- Users need to compile TypeScript rules

**Difficulty:**  **Moderate** (3-4 weeks with testing)

### Option 3: Full Plugin System (ESLint Style)

**Inspired by:** ESLint's flat config plugin system

**Implementation:**

```typescript
// Plugin package: claudelint-plugin-company
import { ClaudePlugin, RuleContext } from '@pdugan20/claudelint';

const myRule = {
  meta: {
    name: 'no-sensitive-data',
    description: 'Prevent sensitive data in CLAUDE.md',
    category: 'Security',
    severity: 'error',
    fixable: true,
    docs: 'https://example.com/rules/no-sensitive-data'
  },

  create(context: RuleContext) {
    return {
      // Hook into specific file types
      'CLAUDE.md': (params) => {
        const sensitivePatterns = [
          /api[_-]?key/i,
          /password/i,
          /secret/i
        ];

        params.lines.forEach((line, index) => {
          sensitivePatterns.forEach(pattern => {
            if (pattern.test(line)) {
              context.report({
                line: index + 1,
                message: 'Possible sensitive data detected',
                fix: context.createFix({
                  description: 'Remove sensitive data',
                  apply: (content) => {
                    return content.replace(line, '<!-- REDACTED -->');
                  }
                })
              });
            }
          });
        });
      }
    };
  }
};

export default {
  meta: {
    name: 'claudelint-plugin-company',
    version: '1.0.0',
    namespace: 'company'
  },
  rules: {
    'no-sensitive-data': myRule
  },
  configs: {
    recommended: {
      rules: {
        'company/no-sensitive-data': 'error'
      }
    }
  }
} as ClaudePlugin;
```text
**Configuration:**

```javascript
// claudelint.config.js
import companyPlugin from 'claudelint-plugin-company';

export default {
  plugins: {
    company: companyPlugin
  },
  rules: {
    'company/no-sensitive-data': 'error'
  }
};
```text
**Pros:**

- Most powerful and flexible
- Full ecosystem support (npm packages)
- Namespaced rules prevent conflicts
- Can bundle multiple rules
- Can provide shareable configs
- Professional plugin development experience
- Can integrate with existing validators

**Cons:**

- Most complex to implement
- Requires significant API design
- Need comprehensive documentation
- Plugin authors need to learn API

**Difficulty:**  **Moderate-Hard** (5-6 weeks with testing)

## Implementation Difficulty Assessment

### Difficulty Comparison Table

| Feature | Option 1 (Regex) | Option 2 (Lightweight) | Option 3 (Full Plugins) |
|---------|------------------|------------------------|-------------------------|
| **Plugin Discovery** | N/A | Easy | Moderate |
| **Plugin Loading** | N/A | Easy (require/import) | Easy (require/import) |
| **Rule Registration** | Easy (config parsing) | Easy | Moderate |
| **Rule API Design** | N/A | Easy | Moderate |
| **Context/Utilities** | N/A | Moderate | Complex |
| **Namespace System** | N/A | Optional | Required |
| **Testing** | Easy | Moderate | Complex |
| **Documentation** | Easy | Moderate | Extensive |
| **Migration Path** | N/A | Easy | Moderate |
| **Overall Difficulty** |  **Easy** |  **Moderate** |  **Moderate-Hard** |
| **Time Estimate** | 2-3 weeks | 3-4 weeks | 5-6 weeks |

### Detailed Complexity Analysis

#### Option 1: Regex Rules

**Easy Parts:**

- Config parsing (already have config system)
- Regex matching (standard library)
- Basic violation reporting (already implemented)

**Code estimate:** ~300-400 lines

**Key files to modify:**

- `src/validators/custom-rules.ts` (new, ~200 lines)
- `src/utils/config.ts` (add ~50 lines)
- `src/cli.ts` (add ~50 lines)

#### Option 2: Lightweight Plugin System

**Easy Parts:**

- Dynamic imports (`import()` or `require()`)
- Rule interface (extend BaseValidator pattern)
- Basic context object

**Moderate Parts:**

- Helper utility design
- Error handling for user code
- TypeScript compilation support

**Code estimate:** ~800-1000 lines

**Key files to create:**

- `src/plugins/loader.ts` (~200 lines)
- `src/plugins/rule-interface.ts` (~150 lines)
- `src/plugins/context.ts` (~200 lines)
- `src/plugins/helpers.ts` (~250 lines)
- Update existing validators (~200 lines)

#### Option 3: Full Plugin System

**Moderate Parts:**

- Plugin metadata and validation
- Namespace resolution system
- Config merging with plugins
- Shareable configs support

**Complex Parts:**

- Comprehensive context API
- Visitor pattern for file types
- Plugin lifecycle hooks
- Extensive helper utilities
- Version compatibility system

**Code estimate:** ~1500-2000 lines

**Key files to create:**

- `src/plugins/` directory (~1000 lines)
  - `loader.ts`
  - `registry.ts`
  - `namespace.ts`
  - `context.ts`
  - `helpers/` directory
- `src/api/` directory (~500 lines)
  - Public API exports
  - Types and interfaces
- Update all validators (~500 lines)

## Recommended Approach

### Phase 1: Start with Regex Rules (Option 1)

**Why start here:**

1. Quick win - delivers value in 2-3 weeks
2. Validates user demand for custom rules
3. No API commitment - can evolve later
4. Solves 80% of simple use cases
5. Low maintenance burden

**Deliverables:**

- Regex-based custom rules in config
- File pattern matching
- Line-based matching
- Basic severity levels

### Phase 2: Add Lightweight Plugins (Option 2)

**Build on Phase 1:**

- Keep regex rules for simple cases
- Add programmatic rules for complex cases
- Provide migration path from regex to code

**Why this evolution:**

1. Users can graduate from regex to code naturally
2. Provides full power when needed
3. Can experiment with API design
4. Team-specific rules stay internal (no npm needed)

**Deliverables:**

- Local rule file support (`.claude/rules/`)
- npm package support (`claudelint-rule-*`)
- Rule interface and context object
- Helper utilities package
- Rule development guide

### Phase 3: Full Plugin Ecosystem (Option 3) - Optional

**Only if there's demand:**

- Wait for community feedback
- See if users need multi-rule plugins
- Assess need for shareable configs

**Why wait:**

1. Significant commitment
2. Need to maintain API forever
3. Most users satisfied with Phases 1-2
4. Can learn from community needs first

## Implementation Phases

### Phase 1: Regex Rules (Weeks 1-3)

#### Week 1: Core Implementation

- [ ] Add `customRules` to config schema
- [ ] Implement regex rule validator
- [ ] Add file pattern matching
- [ ] Basic violation reporting

#### Week 2: Features & Testing

- [ ] Multi-pattern support
- [ ] Severity levels
- [ ] Unit tests (80% coverage)
- [ ] Integration tests

#### Week 3: Documentation & Polish

- [ ] User guide for custom rules
- [ ] Example regex rules
- [ ] CLI output formatting
- [ ] Release v1.1.0

**Code additions:**

```typescript
// src/validators/custom-regex-rules.ts
export class CustomRegexRulesValidator extends BaseValidator {
  async validate(): Promise<ValidationResult> {
    // Implementation
  }
}

// src/utils/config.ts - add to ClaudeLintConfig
interface ClaudeLintConfig {
  // ... existing fields
  customRules?: Record<string, RegexRuleConfig>;
}

interface RegexRuleConfig {
  pattern: string;
  message: string;
  severity: 'error' | 'warning';
  filePattern?: string;
  excludePattern?: string;
}
```text
### Phase 2: Lightweight Plugins (Weeks 4-7)

#### Week 4: Plugin Loader

- [ ] Dynamic import support (TS/JS)
- [ ] npm package resolution
- [ ] Local file support
- [ ] Plugin validation

#### Week 5: Rule API

- [ ] RuleContext interface
- [ ] Rule metadata schema
- [ ] Violation reporting API
- [ ] Basic helper utilities

#### Week 6: Testing & Integration

- [ ] Plugin loader tests
- [ ] Example plugins
- [ ] Integration with existing validators
- [ ] Performance testing

#### Week 7: Documentation & Release

- [ ] Plugin development guide
- [ ] API reference documentation
- [ ] Migration guide (regex to plugins)
- [ ] Release v1.2.0

**Code structure:**

```typescript
// @pdugan20/claudelint/plugin-api
export interface CustomRule {
  names: string[];
  description: string;
  category: string;
  severity: 'error' | 'warning';
  validate(params: RuleParams): Promise<RuleViolation[]>;
}

export interface RuleParams {
  filePath: string;
  fileType: 'claude-md' | 'skill' | 'settings' | 'hooks' | 'mcp' | 'plugin';
  content: string;
  lines: string[];
  config: unknown; // User's rule config
}

export interface RuleViolation {
  line?: number;
  message: string;
  fix?: string;
  autoFix?: AutoFix;
}
```text
### Phase 3: Full Plugin System (Optional - Weeks 8-14)

Only pursue if community demand exists. See [Option 3](#option-3-full-plugin-system-eslint-style) for details.

## Trade-offs and Considerations

### Approach Comparison

| Aspect | Regex Rules | Lightweight Plugins | Full Plugin System |
|--------|-------------|---------------------|-------------------|
| **Time to Market** |  Fast (2-3 weeks) |  Moderate (3-4 weeks) |  Slow (5-6 weeks) |
| **User Complexity** |  Very simple |  Moderate |  High |
| **Power/Flexibility** |  Limited |  Good |  Excellent |
| **Maintenance Burden** |  Low |  Moderate |  High |
| **API Stability** |  N/A |  Some commitment |  Long-term commitment |
| **Ecosystem Potential** |  None |  Small |  Large |
| **Breaking Changes Risk** |  Low |  Moderate |  High |

### Key Decisions

#### 1. JavaScript vs TypeScript Plugins

**Recommendation:** Support both, prefer TypeScript

**Rationale:**

- claudelint is written in TypeScript
- Better developer experience with types
- But don't force users to use TS

**Implementation:**

```typescript
// Support both
import('my-rule.ts') // TypeScript via ts-node
import('my-rule.js') // JavaScript
```text
#### 2. Peer Dependencies Version Strategy

**Recommendation:** Use `>=` with current major version

```json
{
  "peerDependencies": {
    "@pdugan20/claudelint": ">=1.0.0"
  }
}
```text
**Rationale:**

- Follows ESLint/markdownlint pattern
- Allows forward compatibility
- Plugin breaks loudly if incompatible

#### 3. Helper Package Strategy

**Option A:** Separate package (`@pdugan20/claudelint-rule-helpers`)

- Pros: Can version independently, optional dependency
- Cons: More packages to maintain

**Option B:** Export from main package (`@pdugan20/claudelint/helpers`)

- Pros: Simpler, guaranteed version sync
- Cons: Increases main package size

**Recommendation:** Option B for Phase 2, consider Option A if helpers grow large.

#### 4. Namespace Strategy

**Phase 1 (Regex):** No namespaces - just rule IDs

```json
{ "no-hardcoded-urls": "error" }
```text
**Phase 2 (Plugins):** Optional namespaces for npm packages

```json
{ "my-rule": "error" } // Local rule
{ "teamname/my-rule": "error" } // Plugin rule
```text
**Phase 3 (Full):** Required namespaces for all plugins

```json
{ "company/no-secrets": "error" }
```text
#### 5. AST Access

**Recommendation:** Start without AST, add later if needed

**Rationale:**

- claudelint validators currently don't use full ASTs
- Markdown parsing (CLAUDE.md) uses simple line-by-line
- YAML/JSON use object parsing, not AST traversal
- Adding AST support is a major undertaking

**Future consideration:**

- If plugins need AST access, provide parsed objects
- CLAUDE.md → Markdown AST (unified/remark)
- SKILL.md → YAML AST + Markdown AST
- settings.json → JSON object

### Risk Mitigation

#### Risk 1: API Breaking Changes

**Mitigation:**

- Start with minimal API surface
- Use semantic versioning strictly
- Provide deprecation warnings
- Maintain compatibility layer

#### Risk 2: Plugin Security

**Mitigation:**

- Document security considerations
- Don't execute plugins in CI without review
- Consider sandboxing (future)
- Warn about npm package trust

#### Risk 3: Plugin Performance

**Mitigation:**

- Provide performance testing guide
- Implement plugin timeouts
- Cache plugin results
- Profile and optimize common operations

#### Risk 4: Support Burden

**Mitigation:**

- Clear plugin development guide
- Good error messages
- Active examples repository
- Community support channels

## Comparison with Other Tools

### How claudelint Compares

| Feature | ESLint | markdownlint | SwiftLint | claudelint (Proposed) |
|---------|--------|--------------|-----------|----------------------|
| **Regex Rules** |  No |  No |  Yes |  Phase 1 |
| **Simple Plugins** |  No |  Yes |  Limited |  Phase 2 |
| **Full Plugins** |  Yes |  No |  Requires compilation |  Phase 3 (optional) |
| **Local Rules** |  Yes |  Yes |  Yes |  Phase 1-2 |
| **npm Plugins** |  Yes |  Yes |  No |  Phase 2+ |
| **Auto-fix** |  Yes |  Yes |  No |  Already has |
| **Async Rules** |  Yes |  Yes |  No |  Phase 2+ |
| **Helper Utils** |  Yes |  Yes |  No |  Phase 2+ |

### Competitive Advantages

claudelint's phased approach offers:

1. **Quick Wins:** Regex rules deliver value immediately
2. **Gradual Complexity:** Users can grow from simple to complex
3. **Best of Both Worlds:** Combines SwiftLint's simplicity with markdownlint's flexibility
4. **Modern API:** Learn from ESLint/markdownlint mistakes
5. **TypeScript First:** Better DX than JavaScript-only tools

## Success Criteria

### Phase 1 Success Metrics

- [ ] Users can add 5+ custom rules via config
- [ ] Documentation has 3+ real-world examples
- [ ] Zero regression in existing validation
- [ ] < 5% performance impact

### Phase 2 Success Metrics

- [ ] 2+ example plugins in repo
- [ ] Plugin development guide < 15 min read
- [ ] 1+ community plugin published
- [ ] Plugin API stable enough for 1.0

### Phase 3 Success Metrics (if pursued)

- [ ] 5+ npm plugins published
- [ ] Shareable configs being used
- [ ] Active plugin developer community
- [ ] Plugin marketplace/registry

## Conclusion

**Implementation Recommendation:**

1. **Start with Phase 1 (Regex Rules)** - Low risk, quick value, validates demand
2. **Evaluate community feedback** after 1-2 months
3. **Proceed to Phase 2 (Lightweight Plugins)** if demand exists
4. **Defer Phase 3 (Full Plugins)** until proven necessary

**Key Success Factors:**

- Strong existing foundation (BaseValidator, RuleRegistry)
- Clear upgrade path (regex → lightweight → full)
- Low commitment (can stop at any phase)
- Competitive advantages (TypeScript, modern API)

**Estimated Total Effort:**

- Phase 1 only: **2-3 weeks**
- Phases 1-2: **5-7 weeks**
- All phases: **12-14 weeks**

**Risk Level:**  **Low** for Phase 1,  **Moderate** for Phase 2,  **Moderate-High** for Phase 3

The phased approach allows you to deliver value quickly while keeping options open for future expansion based on actual user needs rather than speculation.
````
