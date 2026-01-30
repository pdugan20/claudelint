# Hard Rules Implementation Guide

**Category**: Phase 3
**Count**: 15 rules
**Effort**: 2-3 weeks
**Complexity**: External service integration, LLM evaluation, advanced tooling

These rules require:

- MCP registry API integration
- Claude API for LLM-based evaluation
- External tool integration (shellcheck, pylint, markdownlint)
- Complexity analysis algorithms
- Graceful degradation patterns

---

## Architecture Patterns

### Graceful Degradation

All hard rules must implement graceful degradation when external services are unavailable.

```typescript
export const rule: Rule = {
  meta: {
    type: 'skill',
    category: 'integration',
    severity: 'warning',
    source: 'anthropic-guide',
    guideReference: 'p11',
  },
  validate: async (context: SkillValidationContext) => {
    const config = context.config.skills || {};

    // Check if feature is enabled
    if (!config.enableMcpValidation) {
      context.reportInfo(
        'MCP validation skipped (not enabled in config)',
        { file: 'SKILL.md', line: 0, column: 0 }
      );
      return;
    }

    // Check if service is available
    const service = await getExternalService();
    if (!service.isAvailable()) {
      context.reportWarning(
        'MCP validation skipped (service unavailable)',
        { file: 'SKILL.md', line: 0, column: 0 }
      );
      return;
    }

    // Proceed with validation
    // ...
  },
};
```

### Configuration Schema

Add to `src/config/schema.ts`:

```typescript
export interface SkillsConfig {
  // MCP validation
  enableMcpValidation?: boolean;
  mcpRegistryUrl?: string;
  mcpCacheDuration?: number; // minutes

  // LLM validation
  enableLlmValidation?: boolean;
  claudeApiKey?: string;
  llmBudget?: {
    maxRequestsPerDay?: number;
    maxCostPerMonth?: number;
  };

  // External tools
  enableExternalTools?: boolean;
  externalToolPaths?: {
    shellcheck?: string;
    pylint?: string;
    markdownlint?: string;
  };
}
```

---

## Tier 1: MCP Integration

### H1: skill-mcp-server-exists

**Priority**: CRITICAL
**Effort**: 5 hours (+ MCP client architecture)
**Guide Reference**: p11
**Dependencies**: MCP registry API access

#### Description

Validate that referenced MCP servers actually exist in the registry.

#### Architecture

**Step 1**: Create MCP registry client

```typescript
// src/integrations/mcp-registry.ts

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

interface MCPServer {
  name: string;
  version: string;
  tools: string[];
}

export class MCPRegistryClient {
  private cache: Map<string, MCPServer> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private cacheDuration: number;
  private registryUrl: string;

  constructor(config: { registryUrl: string; cacheDuration?: number }) {
    this.registryUrl = config.registryUrl;
    this.cacheDuration = config.cacheDuration || 60; // minutes
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.registryUrl}/health`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async getServer(serverName: string): Promise<MCPServer | null> {
    // Check cache
    const cached = this.cache.get(serverName);
    const expiry = this.cacheExpiry.get(serverName);

    if (cached && expiry && Date.now() < expiry) {
      return cached;
    }

    // Fetch from registry
    try {
      const response = await axios.get(
        `${this.registryUrl}/servers/${serverName}`,
        { timeout: 10000 }
      );

      const server: MCPServer = response.data;

      // Update cache
      this.cache.set(serverName, server);
      this.cacheExpiry.set(
        serverName,
        Date.now() + this.cacheDuration * 60 * 1000
      );

      return server;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null; // Server not found
      }
      throw error; // Other errors (network, timeout, etc.)
    }
  }
}
```

**Step 2**: Implement rule

```typescript
import { MCPRegistryClient } from '../../integrations/mcp-registry';

export const rule: Rule = {
  meta: {
    type: 'skill',
    category: 'integration',
    severity: 'error',
    source: 'anthropic-guide',
    guideReference: 'p11',
  },
  validate: async (context: SkillValidationContext) => {
    const config = context.config.skills || {};

    if (!config.enableMcpValidation) {
      return;
    }

    const client = new MCPRegistryClient({
      registryUrl: config.mcpRegistryUrl || 'https://registry.mcp.anthropic.com',
      cacheDuration: config.mcpCacheDuration || 60,
    });

    if (!(await client.isAvailable())) {
      context.reportWarning(
        'MCP server validation skipped (registry unavailable)',
        { file: 'SKILL.md', line: 0, column: 0 }
      );
      return;
    }

    // Extract MCP server references from body
    const { bodyContent } = context;
    const serverPattern = /`([a-z][a-z0-9-]+)::[a-z][a-z0-9-]+`/g;
    const servers = new Set<string>();

    let match;
    while ((match = serverPattern.exec(bodyContent)) !== null) {
      servers.add(match[1]);
    }

    // Validate each server
    for (const serverName of servers) {
      try {
        const server = await client.getServer(serverName);

        if (!server) {
          context.reportError(
            `MCP server "${serverName}" not found in registry`,
            { file: 'SKILL.md', line: 0, column: 0 }
          );
        }
      } catch (error) {
        context.reportWarning(
          `Could not validate MCP server "${serverName}": ${error.message}`,
          { file: 'SKILL.md', line: 0, column: 0 }
        );
      }
    }
  },
};
```

#### Fallback Strategy

If MCP registry API is not public, use local registry file:

```json
{
  "servers": [
    {
      "name": "github",
      "version": "1.0.0",
      "tools": ["search-repos", "create-issue", "list-prs"]
    }
  ]
}
```

---

### H2: skill-mcp-tool-exists

**Priority**: CRITICAL
**Effort**: 4 hours
**Guide Reference**: p11
**Dependencies**: H1

#### Description

Validate that referenced MCP tools exist on the specified server.

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
  validate: async (context: SkillValidationContext) => {
    const config = context.config.skills || {};

    if (!config.enableMcpValidation) {
      return;
    }

    const client = new MCPRegistryClient({
      registryUrl: config.mcpRegistryUrl || 'https://registry.mcp.anthropic.com',
      cacheDuration: config.mcpCacheDuration || 60,
    });

    if (!(await client.isAvailable())) {
      return;
    }

    // Extract MCP tool references (server::tool)
    const { bodyContent } = context;
    const toolPattern = /`([a-z][a-z0-9-]+)::([a-z][a-z0-9-]+)`/g;
    const toolRefs: Array<{ server: string; tool: string }> = [];

    let match;
    while ((match = toolPattern.exec(bodyContent)) !== null) {
      toolRefs.push({ server: match[1], tool: match[2] });
    }

    // Validate each tool
    for (const { server, tool } of toolRefs) {
      try {
        const serverData = await client.getServer(server);

        if (!serverData) {
          // Server doesn't exist (will be caught by H1)
          continue;
        }

        if (!serverData.tools.includes(tool)) {
          context.reportError(
            `MCP tool "${tool}" not found on server "${server}". Available tools: ${serverData.tools.join(', ')}`,
            { file: 'SKILL.md', line: 0, column: 0 }
          );
        }
      } catch (error) {
        context.reportWarning(
          `Could not validate MCP tool "${server}::${tool}": ${error.message}`,
          { file: 'SKILL.md', line: 0, column: 0 }
        );
      }
    }
  },
};
```

---

## Tier 2: LLM-Based Validation

### LLM Client Architecture

**Step 1**: Create Claude API client

```typescript
// src/integrations/claude-api.ts

import Anthropic from '@anthropic-ai/sdk';

export interface LLMEvaluationRequest {
  prompt: string;
  context?: string;
}

export interface LLMEvaluationResponse {
  score: number; // 0-100
  feedback: string;
  suggestions: string[];
}

export class ClaudeEvaluator {
  private client: Anthropic;
  private budget: {
    requestsToday: number;
    costThisMonth: number;
    maxRequestsPerDay: number;
    maxCostPerMonth: number;
  };

  constructor(apiKey: string, budget?: any) {
    this.client = new Anthropic({ apiKey });
    this.budget = {
      requestsToday: 0,
      costThisMonth: 0,
      maxRequestsPerDay: budget?.maxRequestsPerDay || 100,
      maxCostPerMonth: budget?.maxCostPerMonth || 10.0,
    };
  }

  async evaluate(request: LLMEvaluationRequest): Promise<LLMEvaluationResponse> {
    // Check budget
    if (this.budget.requestsToday >= this.budget.maxRequestsPerDay) {
      throw new Error('Daily request budget exceeded');
    }
    if (this.budget.costThisMonth >= this.budget.maxCostPerMonth) {
      throw new Error('Monthly cost budget exceeded');
    }

    const response = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: request.prompt + (request.context ? `\n\nContext:\n${request.context}` : ''),
        },
      ],
    });

    this.budget.requestsToday++;
    this.budget.costThisMonth += this.estimateCost(response);

    // Parse response
    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    return this.parseEvaluation(content);
  }

  private parseEvaluation(content: string): LLMEvaluationResponse {
    // Parse structured response from LLM
    const scoreMatch = content.match(/score:\s*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;

    const feedbackMatch = content.match(/feedback:\s*(.+?)(?=\nsuggestions:|$)/is);
    const feedback = feedbackMatch ? feedbackMatch[1].trim() : content;

    const suggestionsMatch = content.match(/suggestions:\s*(.+)/is);
    const suggestions = suggestionsMatch
      ? suggestionsMatch[1]
          .split('\n')
          .filter((s) => s.trim().length > 0)
      : [];

    return { score, feedback, suggestions };
  }

  private estimateCost(response: any): number {
    // Rough cost estimation
    const inputTokens = response.usage?.input_tokens || 0;
    const outputTokens = response.usage?.output_tokens || 0;
    return (inputTokens * 0.003 + outputTokens * 0.015) / 1000;
  }
}
```

---

### H3: skill-trigger-phrase-quality

**Priority**: HIGH
**Effort**: 6 hours
**Guide Reference**: p9-10

#### Description

Use Claude API to evaluate trigger phrase effectiveness.

#### Implementation

```typescript
import { ClaudeEvaluator } from '../../integrations/claude-api';

const EVALUATION_PROMPT = `You are evaluating a Claude skill description for trigger phrase effectiveness.

A good description should:
- Start with an action verb (format, search, generate, etc.)
- Include specific technology/tool names (Python, AWS, JSON, etc.)
- Be concise and focused (one sentence)
- Avoid meta-language ("This skill...", "Use this to...")
- Help Claude understand WHEN to invoke the skill

Evaluate this description and provide:
1. Score (0-100): How effective is this for triggering?
2. Feedback: What works well / what doesn't
3. Suggestions: Specific improvements

Description: "{description}"

Respond in this format:
Score: [0-100]
Feedback: [your analysis]
Suggestions:
- [suggestion 1]
- [suggestion 2]
`;

export const rule: Rule = {
  meta: {
    type: 'skill',
    category: 'quality',
    severity: 'warning',
    source: 'anthropic-guide',
    guideReference: 'p9-10',
  },
  validate: async (context: SkillValidationContext) => {
    const config = context.config.skills || {};

    if (!config.enableLlmValidation || !config.claudeApiKey) {
      context.reportInfo(
        'LLM-based validation skipped (not enabled or API key missing)',
        { file: 'SKILL.md', line: 1, column: 0 }
      );
      return;
    }

    const evaluator = new ClaudeEvaluator(
      config.claudeApiKey,
      config.llmBudget
    );

    try {
      const { description } = context.frontmatter;

      const result = await evaluator.evaluate({
        prompt: EVALUATION_PROMPT.replace('{description}', description),
      });

      // Report based on score
      if (result.score < 50) {
        context.reportError(
          `Description trigger phrase effectiveness is low (${result.score}/100). ${result.feedback}`,
          { file: 'SKILL.md', line: 1, column: 0 }
        );

        for (const suggestion of result.suggestions) {
          context.reportInfo(`Suggestion: ${suggestion}`, {
            file: 'SKILL.md',
            line: 1,
            column: 0,
          });
        }
      } else if (result.score < 70) {
        context.reportWarning(
          `Description trigger phrase effectiveness could be improved (${result.score}/100). ${result.feedback}`,
          { file: 'SKILL.md', line: 1, column: 0 }
        );
      }
    } catch (error) {
      if (error.message.includes('budget exceeded')) {
        context.reportWarning(
          `LLM evaluation skipped: ${error.message}`,
          { file: 'SKILL.md', line: 1, column: 0 }
        );
      } else {
        throw error;
      }
    }
  },
};
```

---

### H4: skill-description-clarity

**Priority**: HIGH
**Effort**: 3 hours

#### Description

LLM evaluation of overall description clarity and effectiveness.

#### Implementation

Similar to H3, with different prompt:

```typescript
const CLARITY_PROMPT = `Evaluate this Claude skill description for clarity and effectiveness.

Criteria:
- Is it immediately clear what this skill does?
- Is the language precise and unambiguous?
- Would a developer understand when to use this?

Description: "{description}"

Score: [0-100]
Feedback: [analysis]
Suggestions: [improvements]
`;
```

---

### H5: skill-body-relevance

**Priority**: Medium
**Effort**: 3 hours
**Dependencies**: M1

#### Description

LLM check that body content aligns with description promise.

#### Implementation

```typescript
const RELEVANCE_PROMPT = `Compare this skill's description with its body content.

Check if:
- Body content delivers on description's promise
- There's no significant topic drift
- Body provides appropriate detail level

Description: "{description}"
Body: "{body}"

Score: [0-100]
Feedback: [analysis]
Suggestions: [improvements]
`;
```

---

## Tier 3: External Tool Integration

### H10: skill-shellcheck-validation

**Priority**: HIGH
**Effort**: 5 hours
**Guide Reference**: p12

#### Description

Run shellcheck on bash scripts to catch common issues.

#### Architecture

**Step 1**: Create external tool wrapper

```typescript
// src/integrations/external-tools.ts

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ExternalToolResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export class ExternalToolRunner {
  async isAvailable(toolPath: string): Promise<boolean> {
    try {
      await execAsync(`which ${toolPath}`);
      return true;
    } catch {
      return false;
    }
  }

  async run(
    toolPath: string,
    args: string[],
    options?: { timeout?: number }
  ): Promise<ExternalToolResult> {
    const cmd = `${toolPath} ${args.join(' ')}`;

    try {
      const { stdout, stderr } = await execAsync(cmd, {
        timeout: options?.timeout || 30000,
      });

      return { exitCode: 0, stdout, stderr };
    } catch (error: any) {
      return {
        exitCode: error.code || 1,
        stdout: error.stdout || '',
        stderr: error.stderr || '',
      };
    }
  }
}
```

**Step 2**: Implement rule

```typescript
export const rule: Rule = {
  meta: {
    type: 'skill',
    category: 'quality',
    severity: 'warning',
    source: 'anthropic-guide',
    guideReference: 'p12',
  },
  validate: async (context: SkillValidationContext) => {
    if (!context.scriptPath) return;

    const config = context.config.skills || {};

    if (!config.enableExternalTools) {
      return;
    }

    const shellcheckPath =
      config.externalToolPaths?.shellcheck || 'shellcheck';

    const runner = new ExternalToolRunner();

    if (!(await runner.isAvailable(shellcheckPath))) {
      context.reportInfo(
        'shellcheck validation skipped (not installed)',
        { file: path.basename(context.scriptPath), line: 0, column: 0 }
      );
      return;
    }

    // Check if script is bash
    const scriptContent = fs.readFileSync(context.scriptPath, 'utf-8');
    if (!scriptContent.startsWith('#!/bin/bash') && !scriptContent.startsWith('#!/usr/bin/env bash')) {
      return;
    }

    // Run shellcheck with JSON output
    const result = await runner.run(shellcheckPath, [
      '-f',
      'json',
      context.scriptPath,
    ]);

    if (result.exitCode === 0) {
      return; // No issues
    }

    // Parse JSON output
    try {
      const issues = JSON.parse(result.stdout);

      for (const issue of issues) {
        const severity =
          issue.level === 'error' ? 'error' : 'warning';

        const message = `shellcheck: ${issue.message} [SC${issue.code}]`;

        if (severity === 'error') {
          context.reportError(message, {
            file: path.basename(context.scriptPath),
            line: issue.line,
            column: issue.column,
          });
        } else {
          context.reportWarning(message, {
            file: path.basename(context.scriptPath),
            line: issue.line,
            column: issue.column,
          });
        }
      }
    } catch (parseError) {
      context.reportWarning(
        `Could not parse shellcheck output: ${parseError.message}`,
        { file: path.basename(context.scriptPath), line: 0, column: 0 }
      );
    }
  },
};
```

---

### H11: skill-pylint-validation

**Priority**: HIGH
**Effort**: 5 hours

#### Description

Run pylint on Python scripts.

#### Implementation

Similar to H10, using pylint with JSON output:

```bash
pylint --output-format=json script.py
```

---

### H12: skill-markdownlint-body

**Priority**: Medium
**Effort**: 3 hours

#### Description

Validate SKILL.md body with markdownlint.

#### Implementation

```typescript
// Use markdownlint-cli2 programmatically
import markdownlint from 'markdownlint';

export const rule: Rule = {
  meta: {
    type: 'skill',
    category: 'quality',
    severity: 'warning',
    source: 'anthropic-guide',
    guideReference: 'p10',
  },
  validate: (context: SkillValidationContext) => {
    const results = markdownlint.sync({
      files: [context.skillMdPath],
      config: {
        default: true,
        MD013: false, // Disable line length (we have word count)
      },
    });

    const issues = results[context.skillMdPath] || [];

    for (const issue of issues) {
      context.reportWarning(
        `markdownlint: ${issue.ruleDescription} [${issue.ruleNames[0]}]`,
        {
          file: 'SKILL.md',
          line: issue.lineNumber,
          column: 0,
        }
      );
    }
  },
};
```

---

## Tier 4: Advanced Analysis (H6-H9, H13-H15)

### Summary

Due to length constraints, here are the remaining hard rules in summary:

**H6: skill-complexity-score** - Calculate cyclomatic complexity of scripts

**H7: skill-dependency-validation** - Parse and validate external tool dependencies

**H8: skill-performance-check** - Detect slow operations without async patterns

**H9: skill-test-coverage** - Check for test files in tests/ directory

**H13: skill-accessibility-check** - Validate screen reader friendly output

**H14: skill-internationalization** - Warn on hardcoded English strings

**H15: skill-semantic-versioning** - Validate version field follows semver

---

## Configuration Example

```json
{
  "skills": {
    "enableMcpValidation": true,
    "mcpRegistryUrl": "https://registry.mcp.anthropic.com",
    "mcpCacheDuration": 60,

    "enableLlmValidation": false,
    "claudeApiKey": "sk-ant-...",
    "llmBudget": {
      "maxRequestsPerDay": 100,
      "maxCostPerMonth": 10.0
    },

    "enableExternalTools": true,
    "externalToolPaths": {
      "shellcheck": "/usr/local/bin/shellcheck",
      "pylint": "/usr/local/bin/pylint",
      "markdownlint": "markdownlint"
    }
  }
}
```

---

## Implementation Timeline

### Week 3: MCP Integration (Days 14-18)

**Day 14**: MCP client architecture + caching
**Day 15**: H1 (server exists), H2 (tool exists)

### Week 4: LLM Validation (Days 16-20)

**Day 16**: Claude API client + prompt templates
**Day 17-18**: H3 (trigger phrase quality)
**Day 19**: H4 (description clarity), H5 (body relevance)

### Week 5: External Tools (Days 21-25)

**Day 21**: External tool wrapper architecture
**Day 22-23**: H10 (shellcheck), H11 (pylint)
**Day 24**: H12 (markdownlint)

### Week 6: Advanced Analysis (Days 25-28)

**Day 25**: H6 (complexity), H7 (dependencies)
**Day 26**: H8 (performance), H9 (test coverage)
**Day 27**: H13 (accessibility), H14 (i18n), H15 (semver)
**Day 28**: Integration testing + documentation

---

## Testing Strategy

### External Service Mocking

```typescript
// Mock MCP registry for tests
class MockMCPRegistry {
  private servers = new Map([
    ['github', { name: 'github', version: '1.0.0', tools: ['search-repos'] }],
  ]);

  async getServer(name: string) {
    return this.servers.get(name) || null;
  }
}
```

### LLM Response Mocking

```typescript
// Mock Claude API for tests
class MockClaudeEvaluator {
  async evaluate(request: LLMEvaluationRequest) {
    // Return deterministic responses for tests
    if (request.prompt.includes('Format Python')) {
      return { score: 85, feedback: 'Good', suggestions: [] };
    }
    return { score: 50, feedback: 'Needs work', suggestions: ['Add action verb'] };
  }
}
```

### External Tool Mocking

```typescript
// Mock shellcheck for tests
class MockExternalToolRunner {
  async run(toolPath: string, args: string[]) {
    if (toolPath === 'shellcheck') {
      return {
        exitCode: 1,
        stdout: JSON.stringify([
          { code: 2086, level: 'warning', message: 'Quote variables' },
        ]),
        stderr: '',
      };
    }
  }
}
```

---

## Success Criteria

### Per Rule

- [ ] Implements graceful degradation
- [ ] Has opt-in configuration
- [ ] Handles timeouts and network errors
- [ ] Caches results appropriately
- [ ] Respects budget limits (for LLM rules)
- [ ] Zero false positives on official examples

### Overall Phase 3

- [ ] All 15 hard rules implemented
- [ ] External service integrations tested
- [ ] Configuration documentation complete
- [ ] Cost estimation tools for LLM usage
- [ ] Performance <2 seconds per skill (with caching)
- [ ] Graceful degradation tested for all failure modes
