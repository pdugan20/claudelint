/**
 * Test fixture builders for creating test files
 * Provides a fluent API for building configuration files and skills
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

/**
 * Fluent builder for CLAUDE.md files
 */
export class ClaudeMdBuilder {
  private content = '';

  constructor(private baseDir: string) {}

  /**
   * Set the content of the CLAUDE.md file
   */
  withContent(content: string): this {
    this.content = content;
    return this;
  }

  /**
   * Set content size in characters (useful for size limit testing)
   */
  withSize(size: number, prefix = '# Test File\n\n'): this {
    const paddingSize = Math.max(0, size - prefix.length);
    this.content = prefix + 'x'.repeat(paddingSize);
    return this;
  }

  /**
   * Create CLAUDE.md with minimal valid content
   */
  withMinimalContent(): this {
    this.content = '# Project Instructions\n\nBasic instructions here.';
    return this;
  }

  /**
   * Write the file and return its path
   */
  async build(filename = 'CLAUDE.md'): Promise<string> {
    await mkdir(this.baseDir, { recursive: true });
    const filePath = join(this.baseDir, filename);
    await writeFile(filePath, this.content);
    return filePath;
  }
}

/**
 * Fluent builder for SKILL.md files
 */
export class SkillBuilder {
  private frontmatter: Record<string, unknown> = {};
  private content = '# Skill Content';
  private shellScript = '#!/bin/bash\necho "Hello"';

  constructor(
    private baseDir: string,
    private skillName: string
  ) {}

  /**
   * Set frontmatter field
   */
  with(key: string, value: unknown): this {
    this.frontmatter[key] = value;
    return this;
  }

  /**
   * Set multiple frontmatter fields
   */
  withFrontmatter(frontmatter: Record<string, unknown>): this {
    this.frontmatter = { ...this.frontmatter, ...frontmatter };
    return this;
  }

  /**
   * Set markdown content
   */
  withContent(content: string): this {
    this.content = content;
    return this;
  }

  /**
   * Set shell script content
   */
  withScript(script: string): this {
    this.shellScript = script;
    return this;
  }

  /**
   * Create a minimal valid skill (includes all required fields to avoid warnings)
   */
  withMinimalFields(): this {
    this.frontmatter = {
      name: this.skillName,
      description: 'A test skill for validation',
      version: '1.0.0',
    };
    this.content = `# ${this.skillName}

## Usage

\`\`\`bash
${this.skillName} arg1
\`\`\``;
    return this;
  }

  /**
   * Create a complete valid skill with all fields
   */
  withAllFields(): this {
    this.frontmatter = {
      name: this.skillName,
      description: 'A comprehensive test skill',
      version: '1.0.0',
      tags: ['test', 'example'],
      'allowed-tools': ['Bash', 'Read', 'Write'],
    };
    return this;
  }

  /**
   * Write the skill files and return the skill directory path
   */
  async build(): Promise<string> {
    const skillDir = join(this.baseDir, '.claude', 'skills', this.skillName);
    await mkdir(skillDir, { recursive: true });

    // Build SKILL.md with frontmatter
    const yamlLines = Object.entries(this.frontmatter)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}:\n${value.map((v) => `  - ${v}`).join('\n')}`;
        }
        return `${key}: ${JSON.stringify(value)}`;
      })
      .join('\n');

    const skillContent = `---
${yamlLines}
---

${this.content}`;

    await writeFile(join(skillDir, 'SKILL.md'), skillContent);

    // Write shell script
    await writeFile(join(skillDir, `${this.skillName}.sh`), this.shellScript);

    // Write CHANGELOG.md (to avoid warnings)
    const version = this.frontmatter.version || '1.0.0';
    await writeFile(
      join(skillDir, 'CHANGELOG.md'),
      `# Changelog\n\n## ${version}\n- Initial release\n`
    );

    return skillDir;
  }
}

/**
 * Fluent builder for settings.json files
 */
export class SettingsBuilder {
  private settings: Record<string, unknown> = {};

  constructor(private baseDir: string) {}

  /**
   * Set a settings field
   */
  with(key: string, value: unknown): this {
    this.settings[key] = value;
    return this;
  }

  /**
   * Set multiple settings fields
   */
  withSettings(settings: Record<string, unknown>): this {
    this.settings = { ...this.settings, ...settings };
    return this;
  }

  /**
   * Create minimal valid settings
   */
  withMinimalSettings(): this {
    this.settings = {
      model: 'sonnet',
    };
    return this;
  }

  /**
   * Create complete settings with all fields
   */
  withAllSettings(): this {
    this.settings = {
      model: 'sonnet',
      apiKey: 'test-api-key',
      maxTokens: 1000,
      temperature: 0.7,
      permissions: [
        {
          tool: 'Bash',
          prompt: 'run tests',
          allow: true,
        },
      ],
    };
    return this;
  }

  /**
   * Write the file and return its path
   */
  async build(filename = 'settings.json'): Promise<string> {
    const claudeDir = join(this.baseDir, '.claude');
    await mkdir(claudeDir, { recursive: true });

    const filePath = join(claudeDir, filename);
    await writeFile(filePath, JSON.stringify(this.settings, null, 2));
    return filePath;
  }

  /**
   * Write invalid JSON (for error testing)
   */
  async buildInvalid(): Promise<string> {
    const claudeDir = join(this.baseDir, '.claude');
    await mkdir(claudeDir, { recursive: true });

    const filePath = join(claudeDir, 'settings.json');
    await writeFile(filePath, '{ invalid json }');
    return filePath;
  }
}

/**
 * Fluent builder for hooks.json files (object-keyed-by-event format)
 */
export class HooksBuilder {
  private hooksObj: Record<
    string,
    Array<{ matcher?: string; hooks: Array<Record<string, unknown>> }>
  > = {};

  constructor(private baseDir: string) {}

  /**
   * Add a hook to an event
   */
  addHook(event: string, command: string, type: 'command' | 'prompt' | 'agent' = 'command'): this {
    const handler: Record<string, unknown> = { type };
    if (type === 'command') handler.command = command;
    else if (type === 'prompt') handler.prompt = command;
    else if (type === 'agent') handler.agent = command;

    if (!this.hooksObj[event]) {
      this.hooksObj[event] = [];
    }
    this.hooksObj[event].push({ hooks: [handler] });
    return this;
  }

  /**
   * Set hooks object directly
   */
  withHooksObj(
    hooksObj: Record<
      string,
      Array<{ matcher?: string; hooks: Array<Record<string, unknown>> }>
    >
  ): this {
    this.hooksObj = { ...this.hooksObj, ...hooksObj };
    return this;
  }

  /**
   * Create minimal valid hooks
   */
  withMinimalHooks(): this {
    this.hooksObj = {
      SessionStart: [
        {
          hooks: [{ type: 'command', command: 'echo "Session started"' }],
        },
      ],
    };
    return this;
  }

  /**
   * Create complete hooks with multiple lifecycle events
   */
  withAllHooks(): this {
    this.hooksObj = {
      SessionStart: [
        { hooks: [{ type: 'command', command: 'echo "Session started"' }] },
      ],
      SessionEnd: [
        { hooks: [{ type: 'command', command: 'echo "Session ended"' }] },
      ],
      PreToolUse: [
        { hooks: [{ type: 'command', command: 'echo "Before tool use"' }] },
      ],
      PostToolUse: [
        { hooks: [{ type: 'command', command: 'echo "After tool use"' }] },
      ],
      UserPromptSubmit: [
        { hooks: [{ type: 'command', command: 'echo "Before prompt submit"' }] },
      ],
    };
    return this;
  }

  /**
   * Write the file and return its path
   */
  async build(): Promise<string> {
    const hooksDir = join(this.baseDir, '.claude', 'hooks');
    await mkdir(hooksDir, { recursive: true });

    const filePath = join(hooksDir, 'hooks.json');
    await writeFile(filePath, JSON.stringify({ hooks: this.hooksObj }, null, 2));
    return filePath;
  }

  /**
   * Write invalid JSON (for error testing)
   */
  async buildInvalid(): Promise<string> {
    const hooksDir = join(this.baseDir, '.claude', 'hooks');
    await mkdir(hooksDir, { recursive: true });

    const filePath = join(hooksDir, 'hooks.json');
    await writeFile(filePath, '{ invalid json }');
    return filePath;
  }
}

/**
 * Fluent builder for .mcp.json files
 */
export class MCPBuilder {
  private mcpServers: Record<string, unknown> = {};

  constructor(private baseDir: string) {}

  /**
   * Add an MCP server
   */
  addServer(name: string, config: Record<string, unknown>): this {
    this.mcpServers[name] = config;
    return this;
  }

  /**
   * Set all servers
   */
  withServers(servers: Record<string, unknown>): this {
    this.mcpServers = { ...this.mcpServers, ...servers };
    return this;
  }

  /**
   * Create minimal valid MCP configuration
   */
  withMinimalConfig(): this {
    this.mcpServers = {
      'test-server': {
        type: 'stdio',
        command: 'node',
        args: ['server.js'],
      },
    };
    return this;
  }

  /**
   * Create complete MCP configuration
   */
  withCompleteConfig(): this {
    this.mcpServers = {
      'test-server': {
        type: 'stdio',
        command: 'node',
        args: ['server.js'],
        env: {
          NODE_ENV: 'test',
        },
      },
      'another-server': {
        type: 'stdio',
        command: 'python',
        args: ['-m', 'server'],
      },
    };
    return this;
  }

  /**
   * Write the file and return its path
   */
  async build(): Promise<string> {
    await mkdir(this.baseDir, { recursive: true });
    const filePath = join(this.baseDir, '.mcp.json');
    await writeFile(filePath, JSON.stringify({ mcpServers: this.mcpServers }, null, 2));
    return filePath;
  }

  /**
   * Write invalid JSON (for error testing)
   */
  async buildInvalid(): Promise<string> {
    await mkdir(this.baseDir, { recursive: true });
    const filePath = join(this.baseDir, '.mcp.json');
    await writeFile(filePath, '{ invalid json }');
    return filePath;
  }
}

/**
 * Fluent builder for plugin.json files
 */
export class PluginBuilder {
  private manifest: Record<string, unknown> = {};

  constructor(private baseDir: string) {}

  /**
   * Set a manifest field
   */
  with(key: string, value: unknown): this {
    this.manifest[key] = value;
    return this;
  }

  /**
   * Set multiple manifest fields
   */
  withManifest(manifest: Record<string, unknown>): this {
    this.manifest = { ...this.manifest, ...manifest };
    return this;
  }

  /**
   * Create minimal valid plugin manifest
   */
  withMinimalManifest(): this {
    this.manifest = {
      name: 'test-plugin',
      version: '1.0.0',
      description: 'A test plugin for validation',
    };
    return this;
  }

  /**
   * Create complete plugin manifest
   */
  withCompleteManifest(): this {
    this.manifest = {
      name: 'test-plugin',
      version: '1.0.0',
      description: 'A test plugin',
      author: 'Test Author',
      skills: ['skill1', 'skill2'],
      settings: {
        apiKey: 'test-key',
      },
    };
    return this;
  }

  /**
   * Write the file and return its path
   * Plugin manifest must be in .claude-plugin/ directory
   */
  async build(filename = 'plugin.json'): Promise<string> {
    const pluginDir = join(this.baseDir, '.claude-plugin');
    await mkdir(pluginDir, { recursive: true });
    const filePath = join(pluginDir, filename);
    await writeFile(filePath, JSON.stringify(this.manifest, null, 2));
    return filePath;
  }

  /**
   * Write invalid JSON (for error testing)
   */
  async buildInvalid(): Promise<string> {
    const pluginDir = join(this.baseDir, '.claude-plugin');
    await mkdir(pluginDir, { recursive: true });
    const filePath = join(pluginDir, 'plugin.json');
    await writeFile(filePath, '{ invalid json }');
    return filePath;
  }
}

/**
 * Factory functions for creating builders
 */
export function claudeMd(baseDir: string): ClaudeMdBuilder {
  return new ClaudeMdBuilder(baseDir);
}

export function skill(baseDir: string, skillName: string): SkillBuilder {
  return new SkillBuilder(baseDir, skillName);
}

export function settings(baseDir: string): SettingsBuilder {
  return new SettingsBuilder(baseDir);
}

export function hooks(baseDir: string): HooksBuilder {
  return new HooksBuilder(baseDir);
}

export function mcp(baseDir: string): MCPBuilder {
  return new MCPBuilder(baseDir);
}

export function plugin(baseDir: string): PluginBuilder {
  return new PluginBuilder(baseDir);
}
