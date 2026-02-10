import {
  claudeMd,
  skill,
  settings,
  hooks,
  mcp,
  plugin,
  agent,
  outputStyle,
  lsp,
} from './fixtures';
import { readFile, rm } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

describe('Test Fixtures', () => {
  const testDir = join(__dirname, '../__temp__', `fixtures-test-${Date.now()}`);

  afterEach(async () => {
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  describe('ClaudeMdBuilder', () => {
    it('should create CLAUDE.md with custom content', async () => {
      const path = await claudeMd(testDir)
        .withContent('# My Project\n\nInstructions here.')
        .build();

      expect(existsSync(path)).toBe(true);
      const content = await readFile(path, 'utf-8');
      expect(content).toContain('# My Project');
      expect(content).toContain('Instructions here.');
    });

    it('should create CLAUDE.md with specific size', async () => {
      const path = await claudeMd(testDir)
        .withSize(1000)
        .build();

      const content = await readFile(path, 'utf-8');
      expect(content.length).toBe(1000);
    });

    it('should create CLAUDE.md with minimal content', async () => {
      const path = await claudeMd(testDir)
        .withMinimalContent()
        .build();

      const content = await readFile(path, 'utf-8');
      expect(content).toContain('# Project Instructions');
    });

    it('should support custom filename', async () => {
      const path = await claudeMd(testDir)
        .withMinimalContent()
        .build('CUSTOM.md');

      expect(path).toContain('CUSTOM.md');
      expect(existsSync(path)).toBe(true);
    });
  });

  describe('SkillBuilder', () => {
    it('should create skill with minimal fields', async () => {
      const skillDir = await skill(testDir, 'test-skill')
        .withMinimalFields()
        .build();

      const skillMdPath = join(skillDir, 'SKILL.md');
      expect(existsSync(skillMdPath)).toBe(true);

      const content = await readFile(skillMdPath, 'utf-8');
      expect(content).toContain('name: "test-skill"');
      expect(content).toContain('description: "Use this to run a test skill for validation"');
    });

    it('should create skill with all fields', async () => {
      const skillDir = await skill(testDir, 'complete-skill')
        .withAllFields()
        .build();

      const skillMdPath = join(skillDir, 'SKILL.md');
      const content = await readFile(skillMdPath, 'utf-8');

      expect(content).toContain('name: "complete-skill"');
      expect(content).toContain('description:');
      expect(content).toContain('version:');
      expect(content).toContain('tags:');
      expect(content).toContain('allowed-tools:');
    });

    it('should create shell script', async () => {
      const skillDir = await skill(testDir, 'script-skill')
        .withMinimalFields()
        .withScript('#!/bin/bash\necho "Custom script"')
        .build();

      const scriptPath = join(skillDir, 'script-skill.sh');
      expect(existsSync(scriptPath)).toBe(true);

      const content = await readFile(scriptPath, 'utf-8');
      expect(content).toContain('#!/bin/bash');
      expect(content).toContain('echo "Custom script"');
    });

    it('should support custom frontmatter', async () => {
      const skillDir = await skill(testDir, 'custom-skill')
        .with('name', 'custom-skill')
        .with('description', 'Custom description')
        .with('customField', 'custom value')
        .build();

      const skillMdPath = join(skillDir, 'SKILL.md');
      const content = await readFile(skillMdPath, 'utf-8');

      expect(content).toContain('customField: "custom value"');
    });

    it('should add $ARGUMENTS with hint via withArguments', async () => {
      const skillDir = await skill(testDir, 'args-skill')
        .withMinimalFields()
        .withArguments('Process $ARGUMENTS here', 'Provide a file path')
        .build();

      const content = await readFile(join(skillDir, 'SKILL.md'), 'utf-8');
      expect(content).toContain('$ARGUMENTS');
      expect(content).toContain('argument-hint: "Provide a file path"');
    });

    it('should add $ARGUMENTS without hint via withArguments', async () => {
      const skillDir = await skill(testDir, 'args-no-hint')
        .withMinimalFields()
        .withArguments('Process $ARGUMENTS here')
        .build();

      const content = await readFile(join(skillDir, 'SKILL.md'), 'utf-8');
      expect(content).toContain('$ARGUMENTS');
      expect(content).not.toContain('argument-hint');
    });

    it('should set disable-model-invocation via withDisableModelInvocation', async () => {
      const skillDir = await skill(testDir, 'disable-model')
        .withMinimalFields()
        .withDisableModelInvocation(true)
        .build();

      const content = await readFile(join(skillDir, 'SKILL.md'), 'utf-8');
      expect(content).toContain('disable-model-invocation: true');
    });

    it('should set side-effect tools via withSideEffectTools', async () => {
      const skillDir = await skill(testDir, 'side-effects')
        .withMinimalFields()
        .withSideEffectTools()
        .build();

      const content = await readFile(join(skillDir, 'SKILL.md'), 'utf-8');
      expect(content).toContain('allowed-tools:');
      expect(content).toContain('  - Bash');
      expect(content).toContain('  - Write');
    });

    it('should create references directory via withReferences', async () => {
      const skillDir = await skill(testDir, 'ref-skill')
        .withMinimalFields()
        .withReferences([
          { name: 'common-issues.md', content: '# Common Issues\n\nList of issues.' },
          { name: 'examples.md', content: '# Examples\n\nUsage examples.' },
        ])
        .build();

      const refPath = join(skillDir, 'references', 'common-issues.md');
      expect(existsSync(refPath)).toBe(true);
      const content = await readFile(refPath, 'utf-8');
      expect(content).toContain('# Common Issues');

      expect(existsSync(join(skillDir, 'references', 'examples.md'))).toBe(true);
    });

    it('should add MCP tool reference via withMCPToolReference', async () => {
      const skillDir = await skill(testDir, 'mcp-ref')
        .withMinimalFields()
        .withMCPToolReference('firebase', 'deploy')
        .build();

      const content = await readFile(join(skillDir, 'SKILL.md'), 'utf-8');
      expect(content).toContain('`firebase:deploy`');
    });

    it('should generate script with error handling via withErrorHandling', async () => {
      const skillDir = await skill(testDir, 'err-handling')
        .withMinimalFields()
        .withErrorHandling(true)
        .build();

      const script = await readFile(join(skillDir, 'err-handling.sh'), 'utf-8');
      expect(script).toContain('set -euo pipefail');
    });

    it('should generate script without error handling via withErrorHandling(false)', async () => {
      const skillDir = await skill(testDir, 'no-err')
        .withMinimalFields()
        .withErrorHandling(false)
        .build();

      const script = await readFile(join(skillDir, 'no-err.sh'), 'utf-8');
      expect(script).not.toContain('set -e');
      expect(script).toContain('rm -rf');
    });

    it('should generate script with hardcoded path via withHardcodedPath', async () => {
      const skillDir = await skill(testDir, 'hardcoded')
        .withMinimalFields()
        .withHardcodedPath('/Users/username/project/config.txt')
        .build();

      const script = await readFile(join(skillDir, 'hardcoded.sh'), 'utf-8');
      expect(script).toContain('/Users/username/project/config.txt');
    });

    it('should generate script with hardcoded API key secret', async () => {
      const skillDir = await skill(testDir, 'secret-key')
        .withMinimalFields()
        .withHardcodedSecret('api-key')
        .build();

      const script = await readFile(join(skillDir, 'secret-key.sh'), 'utf-8');
      expect(script).toContain('API_KEY="sk-');
    });

    it('should generate script with hardcoded token secret', async () => {
      const skillDir = await skill(testDir, 'secret-token')
        .withMinimalFields()
        .withHardcodedSecret('token')
        .build();

      const script = await readFile(join(skillDir, 'secret-token.sh'), 'utf-8');
      expect(script).toContain('AUTH_TOKEN="ghp_');
    });

    it('should generate script with hardcoded password secret', async () => {
      const skillDir = await skill(testDir, 'secret-pwd')
        .withMinimalFields()
        .withHardcodedSecret('password')
        .build();

      const script = await readFile(join(skillDir, 'secret-pwd.sh'), 'utf-8');
      expect(script).toContain('DB_PASSWORD=');
    });
  });

  describe('SettingsBuilder', () => {
    it('should create settings with minimal config', async () => {
      const path = await settings(testDir)
        .withMinimalSettings()
        .build();

      const content = JSON.parse(await readFile(path, 'utf-8'));
      expect(content.model).toBe('sonnet');
    });

    it('should create settings with all fields', async () => {
      const path = await settings(testDir)
        .withAllSettings()
        .build();

      const content = JSON.parse(await readFile(path, 'utf-8'));
      expect(content.model).toBe('sonnet');
      expect(content.apiKey).toBeDefined();
      expect(content.maxTokens).toBeDefined();
      expect(content.permissions).toBeDefined();
    });

    it('should support custom settings', async () => {
      const path = await settings(testDir)
        .with('model', 'opus')
        .with('customField', 'value')
        .build();

      const content = JSON.parse(await readFile(path, 'utf-8'));
      expect(content.model).toBe('opus');
      expect(content.customField).toBe('value');
    });

    it('should create invalid JSON for testing', async () => {
      const path = await settings(testDir).buildInvalid();

      const content = await readFile(path, 'utf-8');
      expect(content).toBe('{ invalid json }');
    });
  });

  describe('HooksBuilder', () => {
    it('should create hooks with minimal config', async () => {
      const path = await hooks(testDir)
        .withMinimalHooks()
        .build();

      const content = JSON.parse(await readFile(path, 'utf-8'));
      expect(content.hooks).toBeDefined();
      expect(typeof content.hooks).toBe('object');
      expect(content.hooks.SessionStart).toBeDefined();
      expect(content.hooks.SessionStart[0].hooks[0].type).toBe('command');
    });

    it('should create hooks with all lifecycle events', async () => {
      const path = await hooks(testDir)
        .withAllHooks()
        .build();

      const content = JSON.parse(await readFile(path, 'utf-8'));
      expect(typeof content.hooks).toBe('object');
      const events = Object.keys(content.hooks);
      expect(events.length).toBe(5);
      expect(events).toContain('SessionStart');
      expect(events).toContain('SessionEnd');
      expect(events).toContain('PreToolUse');
    });

    it('should support adding custom hooks', async () => {
      const path = await hooks(testDir)
        .addHook('CustomHook', 'echo "custom"')
        .addHook('AnotherHook', 'echo "another"')
        .build();

      const content = JSON.parse(await readFile(path, 'utf-8'));
      expect(typeof content.hooks).toBe('object');
      expect(Object.keys(content.hooks).length).toBe(2);
      expect(content.hooks.CustomHook[0].hooks[0].command).toBe('echo "custom"');
      expect(content.hooks.AnotherHook[0].hooks[0].command).toBe('echo "another"');
    });

    it('should create invalid JSON for testing', async () => {
      const path = await hooks(testDir).buildInvalid();

      const content = await readFile(path, 'utf-8');
      expect(content).toBe('{ invalid json }');
    });
  });

  describe('MCPBuilder', () => {
    it('should create MCP config with minimal settings', async () => {
      const path = await mcp(testDir)
        .withMinimalConfig()
        .build();

      const content = JSON.parse(await readFile(path, 'utf-8'));
      expect(content.mcpServers['test-server']).toBeDefined();
      expect(content.mcpServers['test-server'].type).toBe('stdio');
      expect(content.mcpServers['test-server'].command).toBe('node');
    });

    it('should create MCP config with complete settings', async () => {
      const path = await mcp(testDir)
        .withCompleteConfig()
        .build();

      const content = JSON.parse(await readFile(path, 'utf-8'));
      expect(content.mcpServers['test-server']).toBeDefined();
      expect(content.mcpServers['another-server']).toBeDefined();
      expect(content.mcpServers['test-server'].env).toBeDefined();
      expect(content.mcpServers['test-server'].env.NODE_ENV).toBe('test');
    });

    it('should support adding custom servers', async () => {
      const path = await mcp(testDir)
        .addServer('custom-server', {
          name: 'custom-server',
          transport: {
            type: 'stdio',
            command: 'python',
            args: ['custom.py'],
          },
        })
        .build();

      const content = JSON.parse(await readFile(path, 'utf-8'));
      expect(content.mcpServers['custom-server']).toBeDefined();
      expect(content.mcpServers['custom-server'].name).toBe('custom-server');
      expect(content.mcpServers['custom-server'].transport.command).toBe('python');
    });

    it('should create invalid JSON for testing', async () => {
      const path = await mcp(testDir).buildInvalid();

      const content = await readFile(path, 'utf-8');
      expect(content).toBe('{ invalid json }');
    });
  });

  describe('PluginBuilder', () => {
    it('should create plugin manifest with minimal fields', async () => {
      const path = await plugin(testDir)
        .withMinimalManifest()
        .build();

      const content = JSON.parse(await readFile(path, 'utf-8'));
      expect(content.name).toBe('test-plugin');
      expect(content.version).toBe('1.0.0');
    });

    it('should create plugin manifest with complete fields', async () => {
      const path = await plugin(testDir)
        .withCompleteManifest()
        .build();

      const content = JSON.parse(await readFile(path, 'utf-8'));
      expect(content.name).toBe('test-plugin');
      expect(content.description).toBeDefined();
      expect(content.skills).toBeDefined();
      expect(content.settings).toBeDefined();
    });

    it('should support custom fields', async () => {
      const path = await plugin(testDir)
        .with('name', 'custom-plugin')
        .with('version', '2.0.0')
        .with('customField', 'custom value')
        .build();

      const content = JSON.parse(await readFile(path, 'utf-8'));
      expect(content.name).toBe('custom-plugin');
      expect(content.version).toBe('2.0.0');
      expect(content.customField).toBe('custom value');
    });

    it('should create invalid JSON for testing', async () => {
      const path = await plugin(testDir).buildInvalid();

      const content = await readFile(path, 'utf-8');
      expect(content).toBe('{ invalid json }');
    });

    it('should support custom filename', async () => {
      const path = await plugin(testDir)
        .withMinimalManifest()
        .build('custom-plugin.json');

      expect(path).toContain('custom-plugin.json');
      expect(existsSync(path)).toBe(true);
    });

    it('should add hooks with ${CLAUDE_PLUGIN_ROOT} via withHooks', async () => {
      const path = await plugin(testDir)
        .withMinimalManifest()
        .withHooks({
          SessionStart: [{
            hooks: [{ type: 'command', command: '${CLAUDE_PLUGIN_ROOT}/scripts/init.sh' }],
          }],
        })
        .build();

      const content = JSON.parse(await readFile(path, 'utf-8'));
      expect(content.hooks).toBeDefined();
      expect(content.hooks.SessionStart[0].hooks[0].command).toContain('${CLAUDE_PLUGIN_ROOT}');
    });

    it('should add hooks without ${CLAUDE_PLUGIN_ROOT} via withHooks(hooks, false)', async () => {
      const path = await plugin(testDir)
        .withMinimalManifest()
        .withHooks({
          SessionStart: [{
            hooks: [{ type: 'command', command: '${CLAUDE_PLUGIN_ROOT}/scripts/init.sh' }],
          }],
        }, false)
        .build();

      const content = JSON.parse(await readFile(path, 'utf-8'));
      expect(content.hooks.SessionStart[0].hooks[0].command).toBe('./scripts/init.sh');
      expect(content.hooks.SessionStart[0].hooks[0].command).not.toContain('${CLAUDE_PLUGIN_ROOT}');
    });

    it('should add component paths via withComponentPaths', async () => {
      const path = await plugin(testDir)
        .withMinimalManifest()
        .withComponentPaths('./skills', './agents')
        .build();

      const content = JSON.parse(await readFile(path, 'utf-8'));
      expect(content.skills).toBe('./skills');
      expect(content.agents).toBe('./agents');
    });

    it('should add component paths without ./ prefix for invalid testing', async () => {
      const path = await plugin(testDir)
        .withMinimalManifest()
        .withComponentPaths('skills', 'agents')
        .build();

      const content = JSON.parse(await readFile(path, 'utf-8'));
      expect(content.skills).toBe('skills');
      expect(content.agents).toBe('agents');
    });

    it('should add only skills component path', async () => {
      const path = await plugin(testDir)
        .withMinimalManifest()
        .withComponentPaths('./skills')
        .build();

      const content = JSON.parse(await readFile(path, 'utf-8'));
      expect(content.skills).toBe('./skills');
      expect(content.agents).toBeUndefined();
    });
  });

  describe('AgentBuilder', () => {
    it('should create agent with minimal fields', async () => {
      const agentDir = await agent(testDir, 'test-agent')
        .withMinimalFields()
        .build();

      const agentMdPath = join(agentDir, 'AGENT.md');
      expect(existsSync(agentMdPath)).toBe(true);

      const content = await readFile(agentMdPath, 'utf-8');
      expect(content).toContain('name: "test-agent"');
      expect(content).toContain('description: "A test agent for validation purposes"');
    });

    it('should create agent with all fields', async () => {
      const agentDir = await agent(testDir, 'complete-agent')
        .withAllFields()
        .build();

      const agentMdPath = join(agentDir, 'AGENT.md');
      const content = await readFile(agentMdPath, 'utf-8');

      expect(content).toContain('name: "complete-agent"');
      expect(content).toContain('model: "sonnet"');
      expect(content).toContain('tools:');
      expect(content).toContain('  - Bash');
      expect(content).toContain('skills:');
      expect(content).toContain('permissionMode: "default"');
    });

    it('should support custom frontmatter', async () => {
      const agentDir = await agent(testDir, 'custom-agent')
        .with('name', 'custom-agent')
        .with('description', 'Custom agent description')
        .with('model', 'opus')
        .build();

      const agentMdPath = join(agentDir, 'AGENT.md');
      const content = await readFile(agentMdPath, 'utf-8');

      expect(content).toContain('model: "opus"');
    });

    it('should support custom content', async () => {
      const agentDir = await agent(testDir, 'content-agent')
        .withMinimalFields()
        .withContent('# Custom Agent\n\nCustom system prompt here.')
        .build();

      const agentMdPath = join(agentDir, 'AGENT.md');
      const content = await readFile(agentMdPath, 'utf-8');

      expect(content).toContain('# Custom Agent');
      expect(content).toContain('Custom system prompt here.');
    });

    it('should write to correct directory structure', async () => {
      const agentDir = await agent(testDir, 'dir-agent')
        .withMinimalFields()
        .build();

      expect(agentDir).toContain(join('.claude', 'agents', 'dir-agent'));
      expect(existsSync(join(agentDir, 'AGENT.md'))).toBe(true);
    });
  });

  describe('OutputStyleBuilder', () => {
    it('should create output style with minimal fields', async () => {
      const styleDir = await outputStyle(testDir, 'brief')
        .withMinimalFields()
        .build();

      const stylePath = join(styleDir, 'brief.md');
      expect(existsSync(stylePath)).toBe(true);

      const content = await readFile(stylePath, 'utf-8');
      expect(content).toContain('name: "brief"');
      expect(content).toContain('description: "A test output style for validation"');
    });

    it('should create output style with all fields', async () => {
      const styleDir = await outputStyle(testDir, 'detailed')
        .withAllFields()
        .build();

      const stylePath = join(styleDir, 'detailed.md');
      const content = await readFile(stylePath, 'utf-8');

      expect(content).toContain('name: "detailed"');
      expect(content).toContain('description:');
      expect(content).toContain('keep-coding-instructions: true');
    });

    it('should support custom frontmatter', async () => {
      const styleDir = await outputStyle(testDir, 'custom-style')
        .with('name', 'custom-style')
        .with('description', 'A custom style')
        .with('keep-coding-instructions', false)
        .build();

      const stylePath = join(styleDir, 'custom-style.md');
      const content = await readFile(stylePath, 'utf-8');

      expect(content).toContain('keep-coding-instructions: false');
    });

    it('should support custom content', async () => {
      const styleDir = await outputStyle(testDir, 'verbose')
        .withMinimalFields()
        .withContent('# Verbose Style\n\n## Guidelines\n\n- Explain everything in detail')
        .build();

      const stylePath = join(styleDir, 'verbose.md');
      const content = await readFile(stylePath, 'utf-8');

      expect(content).toContain('# Verbose Style');
      expect(content).toContain('Explain everything in detail');
    });

    it('should write to correct directory structure', async () => {
      const styleDir = await outputStyle(testDir, 'terse')
        .withMinimalFields()
        .build();

      expect(styleDir).toContain(join('.claude', 'output-styles', 'terse'));
      expect(existsSync(join(styleDir, 'terse.md'))).toBe(true);
    });
  });

  describe('LSPBuilder', () => {
    it('should create LSP config with minimal settings', async () => {
      const path = await lsp(testDir)
        .withMinimalConfig()
        .build();

      const content = JSON.parse(await readFile(path, 'utf-8'));
      expect(content['typescript-server']).toBeDefined();
      expect(content['typescript-server'].command).toBe('typescript-language-server');
      expect(content['typescript-server'].extensionToLanguage['.ts']).toBe('typescript');
    });

    it('should create LSP config with complete settings', async () => {
      const path = await lsp(testDir)
        .withCompleteConfig()
        .build();

      const content = JSON.parse(await readFile(path, 'utf-8'));
      expect(content['typescript-server']).toBeDefined();
      expect(content['python-server']).toBeDefined();
      expect(content['typescript-server'].transport).toBe('stdio');
      expect(content['typescript-server'].restartOnCrash).toBe(true);
      expect(content['typescript-server'].extensionToLanguage['.tsx']).toBe('typescriptreact');
    });

    it('should support adding custom servers', async () => {
      const path = await lsp(testDir)
        .addServer('rust-analyzer', {
          command: 'rust-analyzer',
          args: [],
          extensionToLanguage: { '.rs': 'rust' },
        })
        .build();

      const content = JSON.parse(await readFile(path, 'utf-8'));
      expect(content['rust-analyzer']).toBeDefined();
      expect(content['rust-analyzer'].command).toBe('rust-analyzer');
      expect(content['rust-analyzer'].extensionToLanguage['.rs']).toBe('rust');
    });

    it('should create invalid JSON for testing', async () => {
      const path = await lsp(testDir).buildInvalid();

      const content = await readFile(path, 'utf-8');
      expect(content).toBe('{ invalid json }');
    });

    it('should write to correct path', async () => {
      const path = await lsp(testDir)
        .withMinimalConfig()
        .build();

      expect(path).toContain(join('.claude', 'lsp.json'));
      expect(existsSync(path)).toBe(true);
    });
  });
});
