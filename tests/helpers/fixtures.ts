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
  private referenceFiles: Array<{ name: string; content: string }> = [];

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
   * Add $ARGUMENTS usage to body content with optional argument-hint frontmatter (B6)
   */
  withArguments(inContent: string, hint?: string): this {
    this.content += `\n\n${inContent}`;
    if (hint) {
      this.frontmatter['argument-hint'] = hint;
    }
    return this;
  }

  /**
   * Set disable-model-invocation frontmatter (B7)
   */
  withDisableModelInvocation(value: boolean): this {
    this.frontmatter['disable-model-invocation'] = value;
    return this;
  }

  /**
   * Set allowed-tools to side-effect tools: Bash + Write (convenience for B7 testing)
   */
  withSideEffectTools(): this {
    this.frontmatter['allowed-tools'] = ['Bash', 'Write'];
    return this;
  }

  /**
   * Add reference files to a references/ subdirectory (M4, M7)
   */
  withReferences(files: Array<{ name: string; content: string }>): this {
    this.referenceFiles = [...this.referenceFiles, ...files];
    return this;
  }

  /**
   * Add MCP tool reference in body content using server:tool format (M11)
   */
  withMCPToolReference(server: string, tool: string): this {
    this.content += `\n\nUse the \`${server}:${tool}\` MCP tool for this operation.`;
    return this;
  }

  /**
   * Set shell script with or without error handling (M9)
   */
  withErrorHandling(enabled: boolean): this {
    if (enabled) {
      this.shellScript = `#!/bin/bash\nset -euo pipefail\n\necho "Running with error handling"`;
    } else {
      this.shellScript = `#!/bin/bash\n\necho "Running without error handling"\nrm -rf /tmp/test`;
    }
    return this;
  }

  /**
   * Set shell script with a hardcoded absolute path (M10)
   */
  withHardcodedPath(path: string): this {
    this.shellScript = `#!/bin/bash\nset -euo pipefail\n\ncat ${path}\necho "Done"`;
    return this;
  }

  /**
   * Set shell script with a hardcoded secret (M13)
   */
  withHardcodedSecret(type: 'api-key' | 'token' | 'password'): this {
    const secrets: Record<string, string> = {
      'api-key': 'API_KEY="sk-1234567890abcdef"',
      token: 'AUTH_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"',
      password: 'DB_PASSWORD="super-secret-password-123"',
    };
    this.shellScript = `#!/bin/bash\nset -euo pipefail\n\n${secrets[type]}\necho "Using secret"`;
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

    // Write reference files if any
    if (this.referenceFiles.length > 0) {
      const refsDir = join(skillDir, 'references');
      await mkdir(refsDir, { recursive: true });
      for (const ref of this.referenceFiles) {
        await writeFile(join(refsDir, ref.name), ref.content);
      }
    }

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
   * Add hooks to plugin manifest, optionally using ${CLAUDE_PLUGIN_ROOT} (B8)
   */
  withHooks(
    hooks: Record<string, Array<{ matcher?: string; hooks: Array<{ type: string; command: string }> }>>,
    usePluginRoot = true
  ): this {
    if (usePluginRoot) {
      this.manifest.hooks = hooks;
    } else {
      // Rewrite commands to use relative paths (missing ${CLAUDE_PLUGIN_ROOT})
      const rewritten: Record<string, unknown> = {};
      for (const [event, entries] of Object.entries(hooks)) {
        rewritten[event] = entries.map((entry) => ({
          ...entry,
          hooks: entry.hooks.map((h) => ({
            ...h,
            command: h.command.replace(/\$\{CLAUDE_PLUGIN_ROOT\}\//g, './'),
          })),
        }));
      }
      this.manifest.hooks = rewritten;
    }
    return this;
  }

  /**
   * Add component paths to plugin manifest (B9)
   */
  withComponentPaths(skills?: string, agents?: string): this {
    if (skills !== undefined) {
      this.manifest.skills = skills;
    }
    if (agents !== undefined) {
      this.manifest.agents = agents;
    }
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
 * Fluent builder for AGENT.md files
 */
export class AgentBuilder {
  private frontmatter: Record<string, unknown> = {};
  private content = '# Agent\n\nThis agent handles tasks.';

  constructor(
    private baseDir: string,
    private agentName: string
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
   * Create a minimal valid agent (required fields only)
   */
  withMinimalFields(): this {
    this.frontmatter = {
      name: this.agentName,
      description: 'A test agent for validation purposes',
    };
    this.content = `# ${this.agentName}

This agent handles automated tasks for the project.

## System Prompt

You are a helpful assistant. Follow the project conventions and provide clear feedback.`;
    return this;
  }

  /**
   * Create a complete valid agent with all fields
   */
  withAllFields(): this {
    this.frontmatter = {
      name: this.agentName,
      description: 'A comprehensive test agent for validation',
      model: 'sonnet',
      tools: ['Bash', 'Read', 'Write'],
      skills: ['test-skill'],
      permissionMode: 'default',
    };
    this.content = `# ${this.agentName}

This agent handles automated tasks for the project.

## System Prompt

You are a helpful assistant. Follow the project conventions and provide clear feedback.`;
    return this;
  }

  /**
   * Write the agent files and return the agent directory path
   */
  async build(): Promise<string> {
    const agentDir = join(this.baseDir, '.claude', 'agents', this.agentName);
    await mkdir(agentDir, { recursive: true });

    const yamlLines = Object.entries(this.frontmatter)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}:\n${value.map((v) => `  - ${v}`).join('\n')}`;
        }
        return `${key}: ${JSON.stringify(value)}`;
      })
      .join('\n');

    const agentContent = `---
${yamlLines}
---

${this.content}`;

    await writeFile(join(agentDir, 'AGENT.md'), agentContent);
    return agentDir;
  }
}

/**
 * Fluent builder for output style .md files
 */
export class OutputStyleBuilder {
  private frontmatter: Record<string, unknown> = {};
  private content = '# Output Style\n\n## Guidelines\n\n- Be clear and concise';

  constructor(
    private baseDir: string,
    private styleName: string
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
   * Create a minimal valid output style
   */
  withMinimalFields(): this {
    this.frontmatter = {
      name: this.styleName,
      description: 'A test output style for validation',
    };
    this.content = `# ${this.styleName}

## Guidelines

- Keep responses clear and direct
- Use consistent formatting
- Focus on actionable information`;
    return this;
  }

  /**
   * Create a complete valid output style with all fields
   */
  withAllFields(): this {
    this.frontmatter = {
      name: this.styleName,
      description: 'A comprehensive test output style',
      'keep-coding-instructions': true,
    };
    this.content = `# ${this.styleName}

## Guidelines

- Keep responses clear and direct
- Use consistent formatting
- Focus on actionable information
- Provide examples when helpful`;
    return this;
  }

  /**
   * Write the output style file and return the style directory path
   */
  async build(): Promise<string> {
    const styleDir = join(this.baseDir, '.claude', 'output-styles', this.styleName);
    await mkdir(styleDir, { recursive: true });

    const yamlLines = Object.entries(this.frontmatter)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join('\n');

    const styleContent = `---
${yamlLines}
---

${this.content}`;

    await writeFile(join(styleDir, `${this.styleName}.md`), styleContent);
    return styleDir;
  }
}

/**
 * Fluent builder for .claude/lsp.json files
 */
export class LSPBuilder {
  private servers: Record<string, Record<string, unknown>> = {};

  constructor(private baseDir: string) {}

  /**
   * Add an LSP server
   */
  addServer(name: string, config: Record<string, unknown>): this {
    this.servers[name] = config;
    return this;
  }

  /**
   * Set all servers
   */
  withServers(servers: Record<string, Record<string, unknown>>): this {
    this.servers = { ...this.servers, ...servers };
    return this;
  }

  /**
   * Create minimal valid LSP configuration (one server)
   */
  withMinimalConfig(): this {
    this.servers = {
      'typescript-server': {
        command: 'typescript-language-server',
        args: ['--stdio'],
        extensionToLanguage: {
          '.ts': 'typescript',
        },
      },
    };
    return this;
  }

  /**
   * Create complete LSP configuration (multiple servers with all fields)
   */
  withCompleteConfig(): this {
    this.servers = {
      'typescript-server': {
        command: 'typescript-language-server',
        args: ['--stdio'],
        transport: 'stdio',
        extensionToLanguage: {
          '.ts': 'typescript',
          '.tsx': 'typescriptreact',
        },
        env: { NODE_ENV: 'development' },
        initializationOptions: {},
        settings: {},
        restartOnCrash: true,
        maxRestarts: 3,
      },
      'python-server': {
        command: 'pylsp',
        args: [],
        extensionToLanguage: {
          '.py': 'python',
        },
      },
    };
    return this;
  }

  /**
   * Write the file and return its path
   */
  async build(): Promise<string> {
    const claudeDir = join(this.baseDir, '.claude');
    await mkdir(claudeDir, { recursive: true });

    const filePath = join(claudeDir, 'lsp.json');
    await writeFile(filePath, JSON.stringify(this.servers, null, 2));
    return filePath;
  }

  /**
   * Write invalid JSON (for error testing)
   */
  async buildInvalid(): Promise<string> {
    const claudeDir = join(this.baseDir, '.claude');
    await mkdir(claudeDir, { recursive: true });

    const filePath = join(claudeDir, 'lsp.json');
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

export function agent(baseDir: string, agentName: string): AgentBuilder {
  return new AgentBuilder(baseDir, agentName);
}

export function outputStyle(baseDir: string, styleName: string): OutputStyleBuilder {
  return new OutputStyleBuilder(baseDir, styleName);
}

export function lsp(baseDir: string): LSPBuilder {
  return new LSPBuilder(baseDir);
}
