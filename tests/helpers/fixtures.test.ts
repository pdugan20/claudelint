import {
  claudeMd,
  skill,
  settings,
  hooks,
  mcp,
  plugin,
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
      expect(content).toContain('description: "A test skill for validation"');
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
      expect(Array.isArray(content.hooks)).toBe(true);
      expect(content.hooks.length).toBe(1);
      expect(content.hooks[0].event).toBe('SessionStart');
      expect(content.hooks[0].type).toBe('command');
    });

    it('should create hooks with all lifecycle events', async () => {
      const path = await hooks(testDir)
        .withAllHooks()
        .build();

      const content = JSON.parse(await readFile(path, 'utf-8'));
      expect(Array.isArray(content.hooks)).toBe(true);
      expect(content.hooks.length).toBe(5);
      const events = content.hooks.map((h: any) => h.event);
      expect(events).toContain('SessionStart');
      expect(events).toContain('SessionEnd');
      expect(events).toContain('BeforeToolUse');
    });

    it('should support adding custom hooks', async () => {
      const path = await hooks(testDir)
        .addHook('CustomHook', 'echo "custom"')
        .addHook('AnotherHook', 'echo "another"')
        .build();

      const content = JSON.parse(await readFile(path, 'utf-8'));
      expect(Array.isArray(content.hooks)).toBe(true);
      expect(content.hooks.length).toBe(2);
      expect(content.hooks[0].event).toBe('CustomHook');
      expect(content.hooks[0].command).toBe('echo "custom"');
      expect(content.hooks[1].event).toBe('AnotherHook');
      expect(content.hooks[1].command).toBe('echo "another"');
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
  });
});
