# Ghost Rule to Real Rule Migration Guide

**Last Updated:** 2026-01-29

## Overview

This guide explains how to convert "ghost rules" (validations without ruleIds) into proper, configurable rules that users can control via `.claudelintrc.json`.

**CRITICAL ARCHITECTURAL PRINCIPLE:** All validation logic MUST live in rule files. Validators should ONLY orchestrate (discover files, execute rules). Validators should NEVER call `reportError()` or `reportWarning()` - these methods will be deprecated and removed.

## Quick Reference

```typescript
// BEFORE (Ghost Rule - Bad)
// Validation logic in validator:
this.reportError('MCP stdio transport command cannot be empty', filePath);

// AFTER (Real Rule - Good)
// 1. Create rule file: src/rules/mcp/mcp-stdio-empty-command.ts with ALL validation logic
// 2. Remove reportError call AND validation logic from validator entirely
// 3. Use executeRulesForCategory('MCP', filePath, content)
```

## Step-by-Step Conversion

### Step 1: Identify the Ghost Rule

Look for `reportError()` or `reportWarning()` calls WITHOUT a ruleId parameter:

```typescript
// Ghost rule - No ruleId parameter (4th parameter is undefined)
this.reportError(
  'MCP stdio transport command cannot be empty',
  filePath,
  undefined,  // ← line number
  undefined   // ← NO ruleId!
);

// or even simpler (only 2 parameters):
this.reportError('Error message', filePath);
```

### Step 2: Extract Validation Information

From the ghost rule, extract:

1. **Message:** What error/warning text is shown
2. **Severity:** Is it reportError (error) or reportWarning (warn)?
3. **Context:** What file type is being validated?
4. **Condition:** What triggers this validation?

**Example:**

```typescript
// In src/validators/mcp.ts:102
if (!transport.command || transport.command.trim().length === 0) {
  this.reportError('MCP stdio transport command cannot be empty', filePath);
  return;
}
```

**Extracted:**

- Message: "MCP stdio transport command cannot be empty"
- Severity: error
- Context: MCP stdio transport
- Condition: command is empty or whitespace

### Step 3: Create Rule ID

Follow naming convention: `{category}-{validation-type}-{specifics}`

**Examples:**

- `mcp-stdio-empty-command`
- `claude-md-import-missing`
- `skill-name-mismatch`
- `agent-body-too-short`

**Add to `src/rules/rule-ids.ts`:**

```typescript
export type RuleId =
  // ... existing rules
  | 'mcp-stdio-empty-command'  // ← Add new ID
  // ... more rules
```

### Step 4: Create Rule File

Create `src/rules/{category}/{rule-id}.ts`:

```typescript
/**
 * Rule: mcp-stdio-empty-command
 *
 * Validates that MCP stdio transport has a non-empty command.
 */

import { Rule } from '../../types/rule';
import { MCPConfigSchema, MCPStdioTransportSchema } from '../../validators/schemas';
import { z } from 'zod';

type MCPConfig = z.infer<typeof MCPConfigSchema>;

export const rule: Rule = {
  meta: {
    id: 'mcp-stdio-empty-command',
    name: 'MCP Stdio Empty Command',
    description: 'MCP stdio transport command cannot be empty',
    category: 'MCP',
    severity: 'error',  // ← Use same severity as ghost rule
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl: 'https://github.com/pdugan20/claudelint/blob/main/docs/rules/mcp/mcp-stdio-empty-command.md',
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    // Only validate .mcp.json files
    if (!filePath.endsWith('.mcp.json')) {
      return;
    }

    // Parse JSON
    let config: MCPConfig;
    try {
      config = JSON.parse(fileContent) as MCPConfig;
    } catch {
      // JSON parse errors handled by schema validation
      return;
    }

    // Validate each server's transport
    if (config.mcpServers) {
      for (const [, server] of Object.entries(config.mcpServers)) {
        if (server.transport?.type === 'stdio') {
          const transport = server.transport;

          // Apply the validation logic from the ghost rule
          if (!transport.command || transport.command.trim().length === 0) {
            context.report({
              message: 'MCP stdio transport command cannot be empty',
            });
          }
        }
      }
    }
  },
};
```

### Step 5: Remove Ghost Rule AND Validation Logic from Validator

**CRITICAL:** Remove the validation method entirely from the validator. Validation logic belongs in rule files, NOT validators.

```typescript
// BEFORE (Validator contains validation logic - WRONG)
private validateStdioTransport(
  filePath: string,
  transport: z.infer<typeof MCPStdioTransportSchema>
): void {
  if (!transport.command || transport.command.trim().length === 0) {
    this.reportError('MCP stdio transport command cannot be empty', filePath);
    return;
  }
}

// AFTER (Validator has NO validation logic - CORRECT)
// DELETE the validateStdioTransport method entirely!
// All validation logic is now in src/rules/mcp/mcp-stdio-empty-command.ts
```

**Key Point:** If the validator method ONLY contained validation logic, delete it completely. Validators should NOT contain validation logic.

### Step 6: Use Rule Discovery (Validator Orchestration Only)

Validators should ONLY:

1. Find files to validate
2. Call `executeRulesForCategory()` to run all rules
3. Return results

Validators should NOT:

- Call `reportError()` or `reportWarning()` directly
- Contain validation methods (like `validateStdioTransport()`)
- Have any validation logic whatsoever

```typescript
// CORRECT validator pattern - orchestration only
async validate(): Promise<ValidationResult> {
  const files = await this.findFiles();

  for (const filePath of files) {
    const content = await readFileContent(filePath);

    // Execute ALL rules for this category automatically
    await this.executeRulesForCategory('MCP', filePath, content);

    // NO validation methods called here!
    // NO reportError/reportWarning calls here!
  }

  return this.getResult();
}
```

**Architecture:** Validators discover files and execute rules. Rules contain all validation logic.

### Step 7: Test the Conversion

1. Run tests: `npm test`
2. Manually test the rule triggers correctly
3. Test config disable works:

   ```json
   {
     "rules": {
       "mcp-stdio-empty-command": "off"
     }
   }
   ```

4. Test severity override works:

   ```json
   {
     "rules": {
       "mcp-stdio-empty-command": "warn"
     }
   }
   ```

### Step 8: Create Rule Documentation

Create `docs/rules/{category}/{rule-id}.md`:

```markdown
# mcp-stdio-empty-command

**Severity:** error
**Fixable:** No

## Description

MCP stdio transport configuration must specify a non-empty command.

## Rationale

An empty command in stdio transport configuration will fail at runtime. The command is required to launch the MCP server process.

## Examples

### Incorrect

```json
{
  "mcpServers": {
    "my-server": {
      "transport": {
        "type": "stdio",
        "command": ""
      }
    }
  }
}
```

### Correct

```json
{
  "mcpServers": {
    "my-server": {
      "transport": {
        "type": "stdio",
        "command": "node server.js"
      }
    }
  }
}
```

## Configuration

This rule has no configuration options.

## Implementation

See [rule source code](../../../src/rules/mcp/mcp-stdio-empty-command.ts)

```

## Common Patterns

### Pattern 1: Simple Condition Check

**Ghost Rule:**
```typescript
if (value.length < 50) {
  this.reportWarning('Body content is very short', filePath);
}
```

**Converted Rule:**

```typescript
validate: (context) => {
  const { fileContent } = context;
  const body = extractBody(fileContent);

  if (body.length < 50) {
    context.report({
      message: 'Body content is very short (less than 50 characters)',
    });
  }
}
```

### Pattern 2: Missing File/Section

**Ghost Rule:**

```typescript
if (!fs.existsSync(requiredFile)) {
  this.reportError(`${fileName} not found`, dirPath);
}
```

**Converted Rule:**

```typescript
validate: async (context) => {
  const { filePath } = context;
  const dirPath = path.dirname(filePath);
  const requiredFile = path.join(dirPath, 'REQUIRED.md');

  if (!await fileExists(requiredFile)) {
    context.report({
      message: 'REQUIRED.md not found in directory',
      fix: 'Create REQUIRED.md in the directory',
    });
  }
}
```

### Pattern 3: Pattern Matching

**Ghost Rule:**

```typescript
const pattern = /#{1,3}\s*examples/i;
if (!pattern.test(content)) {
  this.reportWarning('Missing Examples section', filePath);
}
```

**Converted Rule:**

```typescript
validate: (context) => {
  const { fileContent } = context;
  const pattern = /#{1,3}\s*examples/i;

  if (!pattern.test(fileContent)) {
    context.report({
      message: 'Missing Examples section in documentation',
      fix: 'Add an "## Examples" section',
    });
  }
}
```

### Pattern 4: From Utility Function

**Ghost Rule (in utility):**

```typescript
export function validateEnvironmentVariables(env): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const [key, value] of Object.entries(env)) {
    if (!ENV_VAR_PATTERN.test(key)) {
      issues.push({
        message: `Invalid env var name: ${key}`,
        severity: 'warning',
        // NO ruleId!
      });
    }
  }

  return issues;
}
```

**Converted Rule:**

```typescript
validate: (context) => {
  const config = parseConfig(context.fileContent);

  if (config.env) {
    for (const [key, value] of Object.entries(config.env)) {
      if (!ENV_VAR_PATTERN.test(key)) {
        context.report({
          message: `Environment variable name should be uppercase with underscores: ${key}`,
          fix: `Rename to ${key.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`,
        });
      }
    }
  }
}
```

**Then remove the utility function entirely!**

### Pattern 5: Multiple Related Validations

**Ghost Rules:**

```typescript
if (!transport.url) {
  this.reportError('URL cannot be empty', filePath);
}

try {
  new URL(transport.url);
} catch (error) {
  this.reportError('Invalid URL format', filePath);
}
```

**Converted Rule (combined):**

```typescript
validate: (context) => {
  const config = parseConfig(context.fileContent);

  for (const server of Object.values(config.servers)) {
    if (server.transport.type === 'sse') {
      const url = server.transport.url;

      // Check 1: Empty URL
      if (!url || url.trim().length === 0) {
        context.report({
          message: 'SSE transport URL cannot be empty',
        });
        continue; // Skip URL validation if empty
      }

      // Check 2: Invalid URL format
      try {
        new URL(url);
      } catch (error) {
        context.report({
          message: `Invalid URL format in SSE transport: ${url}`,
          fix: 'Provide a valid HTTP/HTTPS URL',
        });
      }
    }
  }
}
```

**Decision:** One rule vs multiple rules?

- **One rule:** If validations are sequential/related (like empty check then format check)
- **Multiple rules:** If validations are independent (can disable one without affecting others)

## Edge Cases

### Edge Case 1: Validation Needs Multiple Files

**Problem:** Rule needs to check multiple files (e.g., circular imports)

**Solution:** Rules can read other files:

```typescript
validate: async (context) => {
  const { filePath, fileContent } = context;
  const imports = extractImports(fileContent);

  for (const importPath of imports) {
    const resolvedPath = resolvePath(filePath, importPath);

    // Read imported file
    if (await fileExists(resolvedPath)) {
      const importedContent = await readFileContent(resolvedPath);
      // Check for circular reference
    }
  }
}
```

### Edge Case 2: Rule Needs Validator State

**Problem:** Validation needs to track state across files (e.g., duplicate names)

**Solution:** Use closure variables:

```typescript
const seenNames = new Set<string>();

export const rule: Rule = {
  meta: { ... },
  validate: (context) => {
    const name = extractName(context.fileContent);

    if (seenNames.has(name)) {
      context.report({
        message: `Duplicate name: ${name}`,
      });
    }

    seenNames.add(name);
  }
};
```

**Note:** This pattern has limitations - state doesn't reset between runs. Consider if it's the right approach.

### Edge Case 3: "No Files Found" Warnings

**Problem:** Validator warns when no files exist to validate

**Current Ghost:**

```typescript
if (files.length === 0) {
  this.reportWarning('No skill directories found');
}
```

**Solution:** Create a rule that validators can explicitly execute:

```typescript
// In validator
if (files.length === 0) {
  await this.executeRule(noSkillsFoundRule, this.basePath, '');
  return this.getResult();
}

// In rule file
validate: (context) => {
  context.report({
    message: 'No skill directories found',
  });
}
```

**Alternative:** Skip this check entirely - if no files, no validations, no output. Silence is acceptable.

### Edge Case 4: Base Validator Utility Methods

**Problem:** `validateToolName()` is called by multiple validators with different contexts

**WRONG SOLUTION:** Add ruleId parameter to shared utility method

**CORRECT SOLUTION:** Convert to separate rules per validator category

```typescript
// REMOVE validateToolName() from base.ts entirely!

// CREATE rule files instead:
// src/rules/agents/agent-unknown-tool.ts
// src/rules/hooks/hooks-unknown-tool.ts
// src/rules/settings/settings-unknown-tool.ts

// Each rule contains its own validation logic:
export const rule: Rule = {
  meta: {
    id: 'agent-unknown-tool',
    category: 'Agents',
    severity: 'warn',
    // ...
  },
  validate: (context) => {
    const config = parseConfig(context.fileContent);

    if (config.tools) {
      for (const toolName of config.tools) {
        if (!VALID_TOOLS.includes(toolName)) {
          context.report({
            message: `Unknown tool in agent: ${toolName}`,
          });
        }
      }
    }
  }
};
```

**Key Principle:** Shared validation logic should be converted to separate rules per category, NOT shared methods with ruleId parameters. Each validator category gets its own rule with category-specific logic.

## Checklist

For each ghost rule conversion:

- [ ] Ghost rule identified in GHOST-RULES-AUDIT.md
- [ ] Rule ID chosen following naming convention
- [ ] Rule ID added to `src/rules/rule-ids.ts`
- [ ] Rule file created in `src/rules/{category}/`
- [ ] Rule metadata complete (id, name, description, severity, etc.)
- [ ] Validation logic copied from ghost rule to rule.validate()
- [ ] Ghost rule removed from validator
- [ ] Validator uses executeRulesForCategory()
- [ ] Tests pass
- [ ] Config disable tested
- [ ] Config severity override tested
- [ ] Rule documentation created in `docs/rules/`
- [ ] IMPLEMENTATION-TRACKER.md updated

## Troubleshooting

### "Tests are failing after conversion"

**Cause:** Test expectations might be checking for specific validator methods or error formats

**Fix:** Update test expectations to match new rule-based output

### "Rule doesn't trigger"

**Checklist:**

- [ ] Rule ID in `rule-ids.ts`?
- [ ] Rule file exports `rule` constant?
- [ ] Rule category matches validator category?
- [ ] `executeRulesForCategory()` called with correct category?
- [ ] File type check in rule (e.g., `.mcp.json`)?

### "Config disable doesn't work"

**Cause:** Validation logic is still in validator calling `reportError()` or `reportWarning()`

**Fix:**

1. Verify validation logic is in rule file's `validate()` function
2. Verify validator does NOT call `reportError()` or `reportWarning()`
3. Ensure validator uses `executeRulesForCategory()` to run rules
4. Delete any validation methods from validator

**Remember:** If validation logic is in the validator, it bypasses the config system entirely. ALL validation logic must be in rule files.

### "Performance regression"

**Cause:** Rule might be doing expensive operations unnecessarily

**Fix:** Add early returns, cache results, optimize file reads

## Summary

**Key Architectural Points:**

1. **ALL validation logic goes in rule files** - No exceptions
2. **Validators ONLY orchestrate** - Find files, execute rules, return results
3. **ZERO reportError/reportWarning calls in validators** - These methods will be deprecated and removed
4. **Ghost rules bypass config** - Convert all validations to real rules
5. **Real rules use context.report()** - Makes them configurable by users

**Migration Steps:**

1. Create rule file with ALL validation logic in `validate()` function
2. Delete validation logic AND reportError/reportWarning calls from validator
3. Delete validator methods that only contained validation logic
4. Use `executeRulesForCategory()` to run all rules automatically
5. Test that config disable/override works
6. Document the rule for users

**Benefits:**

- [YES] Users can disable unwanted rules
- [YES] Users can change severity
- [YES] Consistent ESLint-style architecture
- [YES] Better maintainability
- [YES] Clear separation: validators orchestrate, rules validate
- [YES] Zero coupling between validators and rules
