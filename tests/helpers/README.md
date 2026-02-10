# Test Helpers

This directory contains shared test utilities and fixture builders to reduce test duplication and improve test readability.

## Available Helpers

### Fixtures (`fixtures.ts`)

Fluent builders for creating test files with consistent, chainable API.

### Rule Tester (`rule-tester.ts`)

ClaudeLintRuleTester class for testing rules (ESLint-style testing).

### Test Utils (`test-utils.ts`)

Utilities for test directory setup and cleanup.

## Fixtures

The `fixtures.ts` module provides fluent builders for creating test files. All builders follow a consistent API pattern:

```typescript
import { claudeMd, skill, settings, hooks, mcp, plugin, agent, outputStyle, lsp } from './fixtures';

// Create files in a test directory
const testDir = '/path/to/test/dir';
```

### ClaudeMdBuilder

Create CLAUDE.md files for testing:

```typescript
// Minimal content
await claudeMd(testDir)
  .withMinimalContent()
  .build();

// Custom content
await claudeMd(testDir)
  .withContent('# My Project\n\nInstructions here.')
  .build();

// Specific size (for testing size limits)
await claudeMd(testDir)
  .withSize(40000) // 40KB
  .build();

// Custom filename
await claudeMd(testDir)
  .withContent('# Test')
  .build('CUSTOM.md');
```

### SkillBuilder

Create skills with SKILL.md and shell script:

```typescript
// Minimal skill
await skill(testDir, 'my-skill')
  .withMinimalFields()
  .build();

// Complete skill
await skill(testDir, 'my-skill')
  .withAllFields()
  .build();

// Custom skill
await skill(testDir, 'custom-skill')
  .with('name', 'custom-skill')
  .with('description', 'Custom description')
  .with('tools', ['Bash', 'Read'])
  .withScript('#!/bin/bash\necho "Custom script"')
  .build();

// Skill with $ARGUMENTS and hint (for B6 rule testing)
await skill(testDir, 'args-skill')
  .withMinimalFields()
  .withArguments('$ARGUMENTS', 'Pass a file path')
  .build();

// Skill with side-effect tools (for B7 rule testing)
await skill(testDir, 'side-effect-skill')
  .withMinimalFields()
  .withSideEffectTools()
  .withDisableModelInvocation(true)
  .build();

// Skill with references subdirectory (for M4, M7 testing)
await skill(testDir, 'ref-skill')
  .withMinimalFields()
  .withReferences([{ name: 'guide.md', content: '# Guide' }])
  .build();

// Skill with MCP tool reference (for M11 testing)
await skill(testDir, 'mcp-skill')
  .withMinimalFields()
  .withMCPToolReference('firebase', 'deploy')
  .build();

// Shell script variants (for M9, M10, M13 testing)
await skill(testDir, 'safe-skill')
  .withMinimalFields()
  .withErrorHandling(true)  // adds set -euo pipefail
  .build();

await skill(testDir, 'bad-path-skill')
  .withMinimalFields()
  .withHardcodedPath('/Users/me/config.txt')
  .build();

await skill(testDir, 'bad-secret-skill')
  .withMinimalFields()
  .withHardcodedSecret('api-key')  // also: 'token', 'password'
  .build();
```

### SettingsBuilder

Create settings.json files:

```typescript
// Minimal settings
await settings(testDir)
  .withMinimalSettings()
  .build();

// Complete settings
await settings(testDir)
  .withAllSettings()
  .build();

// Custom settings
await settings(testDir)
  .with('model', 'opus')
  .with('maxTokens', 2000)
  .build();

// Invalid JSON (for error testing)
await settings(testDir).buildInvalid();
```

### HooksBuilder

Create hooks.json files:

```typescript
// Minimal hooks
await hooks(testDir)
  .withMinimalHooks()
  .build();

// All lifecycle hooks
await hooks(testDir)
  .withAllHooks()
  .build();

// Custom hooks
await hooks(testDir)
  .addHook('SessionStart', 'echo "Starting"')
  .addHook('CustomHook', 'echo "Custom"')
  .build();

// Invalid JSON
await hooks(testDir).buildInvalid();
```

### MCPBuilder

Create .mcp.json files:

```typescript
// Minimal MCP config
await mcp(testDir)
  .withMinimalConfig()
  .build();

// Complete MCP config
await mcp(testDir)
  .withCompleteConfig()
  .build();

// Custom servers
await mcp(testDir)
  .addServer('my-server', {
    command: 'node',
    args: ['server.js'],
  })
  .build();

// Invalid JSON
await mcp(testDir).buildInvalid();
```

### PluginBuilder

Create plugin.json files:

```typescript
// Minimal plugin
await plugin(testDir)
  .withMinimalManifest()
  .build();

// Complete plugin
await plugin(testDir)
  .withCompleteManifest()
  .build();

// Custom plugin
await plugin(testDir)
  .with('name', 'my-plugin')
  .with('version', '2.0.0')
  .with('skills', ['skill1', 'skill2'])
  .build();

// Invalid JSON
await plugin(testDir).buildInvalid();

// Custom filename
await plugin(testDir)
  .withMinimalManifest()
  .build('custom.json');

// Plugin with hooks using ${CLAUDE_PLUGIN_ROOT} (for B8 testing)
await plugin(testDir)
  .withMinimalManifest()
  .withHooks({
    SessionStart: [{ hooks: [{ type: 'command', command: '${CLAUDE_PLUGIN_ROOT}/scripts/init.sh' }] }]
  }, true)  // true = use ${CLAUDE_PLUGIN_ROOT} prefix
  .build();

// Plugin with component paths (for B9 testing)
await plugin(testDir)
  .withMinimalManifest()
  .withComponentPaths('./skills', './agents')
  .build();
```

### AgentBuilder

Create AGENT.md files for testing:

```typescript
// Minimal agent
await agent(testDir, 'my-agent')
  .withMinimalFields()
  .build();

// Complete agent with all fields
await agent(testDir, 'my-agent')
  .withAllFields()
  .build();

// Custom frontmatter
await agent(testDir, 'custom-agent')
  .withFrontmatter({
    name: 'custom-agent',
    description: 'Custom agent',
    model: 'sonnet',
    tools: ['Read', 'Grep'],
  })
  .withContent('## System Prompt\n\nCustom instructions here.')
  .build();
```

### OutputStyleBuilder

Create output style .md files for testing:

```typescript
// Minimal output style
await outputStyle(testDir, 'my-style')
  .withMinimalFields()
  .build();

// Complete output style
await outputStyle(testDir, 'my-style')
  .withAllFields()
  .build();

// Custom frontmatter and content
await outputStyle(testDir, 'custom-style')
  .withFrontmatter({
    name: 'custom-style',
    description: 'Custom output style',
    'keep-coding-instructions': true,
  })
  .withContent('## Guidelines\n\nBe concise and direct.')
  .build();
```

### LSPBuilder

Create .claude/lsp.json files for testing:

```typescript
// Minimal LSP config (one server)
await lsp(testDir)
  .withMinimalConfig()
  .build();

// Complete config (multiple servers + extensionToLanguage)
await lsp(testDir)
  .withCompleteConfig()
  .build();

// Custom servers
await lsp(testDir)
  .addServer('pyright', {
    command: 'pyright-langserver',
    args: ['--stdio'],
  })
  .addServer('gopls', {
    command: 'gopls',
    args: ['serve'],
  })
  .build();

// Invalid JSON (for error testing)
await lsp(testDir).buildInvalid();
```

## Rule Tester

The `rule-tester.ts` module provides an ESLint-style testing framework for rules:

```typescript
import { ClaudeLintRuleTester } from './rule-tester';
import { myRule } from '../../src/rules/my-rule';

const ruleTester = new ClaudeLintRuleTester();

ruleTester.run('my-rule', myRule, {
  valid: [
    {
      name: 'valid case',
      content: '# Valid Content',
    },
  ],
  invalid: [
    {
      name: 'invalid case',
      content: '# Invalid Content',
      errors: [{ message: 'Expected error message' }],
    },
  ],
});
```

## Test Utils

The `test-utils.ts` module provides test directory management:

```typescript
import { setupTestDir } from './test-utils';

describe('MyValidator', () => {
  const { getTestDir, cleanupTestDir } = setupTestDir();

  afterAll(async () => {
    await cleanupTestDir();
  });

  it('should validate file', async () => {
    const testDir = getTestDir();
    // Use testDir for creating test files
  });
});
```

## Usage Example

Here's a complete example using fixtures and test utils:

```typescript
import { settings } from '../helpers/fixtures';
import { SettingsValidator } from '../../src/validators/settings';
import { setupTestDir } from '../helpers/test-utils';

describe('SettingsValidator', () => {
  const { getTestDir } = setupTestDir();

  it('should validate minimal settings', async () => {
    const filePath = await settings(getTestDir())
      .withMinimalSettings()
      .build();

    const validator = new SettingsValidator({ path: filePath });
    const result = await validator.validate();

    expect(result.valid).toBe(true);
  });

  it('should reject invalid model', async () => {
    const filePath = await settings(getTestDir())
      .with('model', 'invalid-model')
      .build();

    const validator = new SettingsValidator({ path: filePath });
    const result = await validator.validate();

    expect(result.valid).toBe(false);
  });

  it('should handle invalid JSON', async () => {
    const filePath = await settings(getTestDir()).buildInvalid();

    const validator = new SettingsValidator({ path: filePath });
    const result = await validator.validate();

    expect(result.valid).toBe(false);
  });
});
```

## Builder Coverage

All 9 config types have fluent builders:

| Builder | Config Type | Factory Function |
|---------|------------|------------------|
| ClaudeMdBuilder | CLAUDE.md | `claudeMd()` |
| SkillBuilder | SKILL.md + shell scripts | `skill()` |
| AgentBuilder | AGENT.md | `agent()` |
| OutputStyleBuilder | Output style .md | `outputStyle()` |
| LSPBuilder | .claude/lsp.json | `lsp()` |
| SettingsBuilder | settings.json | `settings()` |
| HooksBuilder | hooks.json | `hooks()` |
| MCPBuilder | .mcp.json | `mcp()` |
| PluginBuilder | plugin.json | `plugin()` |

## Benefits

- **Fluent API**: Chainable methods make tests readable
- **Consistent**: All builders follow the same pattern
- **Type-safe**: Full TypeScript support with autocomplete
- **Flexible**: Support for minimal, complete, and custom configurations
- **Error testing**: Built-in support for creating invalid files
- **Less duplication**: Reusable across all test files
- **Future-rule ready**: SkillBuilder and PluginBuilder have methods for testing planned rules (B6-B9, M9-M13)
