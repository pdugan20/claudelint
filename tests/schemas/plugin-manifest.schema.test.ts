/**
 * Tests for plugin manifest schema
 */

import {
  PluginManifestSchema,
  PluginAuthorSchema,
} from '../../src/validators/schemas';

describe('PluginManifestSchema', () => {
  describe('required fields', () => {
    it('should accept minimal valid manifest with only name', () => {
      const result = PluginManifestSchema.safeParse({
        name: 'my-plugin',
      });
      expect(result.success).toBe(true);
    });

    it('should reject manifest without name', () => {
      const result = PluginManifestSchema.safeParse({
        version: '1.0.0',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('version field', () => {
    it('should accept valid semantic version', () => {
      const result = PluginManifestSchema.safeParse({
        name: 'my-plugin',
        version: '1.2.3',
      });
      expect(result.success).toBe(true);
    });

    it('should accept version with prerelease', () => {
      const result = PluginManifestSchema.safeParse({
        name: 'my-plugin',
        version: '1.2.3-beta.1',
      });
      expect(result.success).toBe(true);
    });

    it('should accept version with build metadata', () => {
      const result = PluginManifestSchema.safeParse({
        name: 'my-plugin',
        version: '1.2.3+build.123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid version format', () => {
      const result = PluginManifestSchema.safeParse({
        name: 'my-plugin',
        version: 'v1.2.3',
      });
      expect(result.success).toBe(false);
    });

    it('should reject non-semver version', () => {
      const result = PluginManifestSchema.safeParse({
        name: 'my-plugin',
        version: '1.2',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('author field', () => {
    it('should accept author as object with name only', () => {
      const result = PluginManifestSchema.safeParse({
        name: 'my-plugin',
        author: {
          name: 'John Doe',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should accept author object with all fields', () => {
      const result = PluginManifestSchema.safeParse({
        name: 'my-plugin',
        author: {
          name: 'John Doe',
          email: 'john@example.com',
          url: 'https://example.com',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should reject author as string (not supported by Claude Code)', () => {
      const result = PluginManifestSchema.safeParse({
        name: 'my-plugin',
        author: 'John Doe',
      });
      expect(result.success).toBe(false);
    });

    it('should reject author object without name', () => {
      const result = PluginManifestSchema.safeParse({
        name: 'my-plugin',
        author: {
          email: 'john@example.com',
        },
      });
      expect(result.success).toBe(false);
    });

    it('should accept author object with extra fields (Zod allows by default)', () => {
      const result = PluginManifestSchema.safeParse({
        name: 'my-plugin',
        author: {
          name: 'John Doe',
          twitter: '@johndoe', // Extra field allowed by Zod
        },
      });
      // Zod objects allow extra properties unless using .strict()
      expect(result.success).toBe(true);
    });
  });

  describe('PluginAuthorSchema', () => {
    it('should require name field', () => {
      const result = PluginAuthorSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should accept name only', () => {
      const result = PluginAuthorSchema.safeParse({
        name: 'John Doe',
      });
      expect(result.success).toBe(true);
    });

    it('should accept email and url as optional', () => {
      const result = PluginAuthorSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        url: 'https://example.com',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('description field', () => {
    it('should accept valid description', () => {
      const result = PluginManifestSchema.safeParse({
        name: 'my-plugin',
        description: 'A useful plugin for testing',
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty description', () => {
      const result = PluginManifestSchema.safeParse({
        name: 'my-plugin',
        description: '',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('metadata fields', () => {
    it('should accept homepage URL', () => {
      const result = PluginManifestSchema.safeParse({
        name: 'my-plugin',
        homepage: 'https://example.com',
      });
      expect(result.success).toBe(true);
    });

    it('should accept repository URL', () => {
      const result = PluginManifestSchema.safeParse({
        name: 'my-plugin',
        repository: 'https://github.com/user/repo',
      });
      expect(result.success).toBe(true);
    });

    it('should accept license string', () => {
      const result = PluginManifestSchema.safeParse({
        name: 'my-plugin',
        license: 'MIT',
      });
      expect(result.success).toBe(true);
    });

    it('should accept keywords array', () => {
      const result = PluginManifestSchema.safeParse({
        name: 'my-plugin',
        keywords: ['test', 'validation', 'linting'],
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty keywords array', () => {
      const result = PluginManifestSchema.safeParse({
        name: 'my-plugin',
        keywords: [],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('component path fields', () => {
    it('should accept commands as string', () => {
      const result = PluginManifestSchema.safeParse({
        name: 'my-plugin',
        commands: './custom/commands',
      });
      expect(result.success).toBe(true);
    });

    it('should accept commands as array', () => {
      const result = PluginManifestSchema.safeParse({
        name: 'my-plugin',
        commands: ['./cmd1.md', './cmd2.md'],
      });
      expect(result.success).toBe(true);
    });

    it('should accept agents as string', () => {
      const result = PluginManifestSchema.safeParse({
        name: 'my-plugin',
        agents: './custom/agents',
      });
      expect(result.success).toBe(true);
    });

    it('should accept agents as array', () => {
      const result = PluginManifestSchema.safeParse({
        name: 'my-plugin',
        agents: ['./agent1.md', './agent2.md'],
      });
      expect(result.success).toBe(true);
    });

    it('should accept skills as string', () => {
      const result = PluginManifestSchema.safeParse({
        name: 'my-plugin',
        skills: './custom/skills',
      });
      expect(result.success).toBe(true);
    });

    it('should accept skills as array', () => {
      const result = PluginManifestSchema.safeParse({
        name: 'my-plugin',
        skills: ['./skills/skill1', './skills/skill2'],
      });
      expect(result.success).toBe(true);
    });

    it('should accept outputStyles as string', () => {
      const result = PluginManifestSchema.safeParse({
        name: 'my-plugin',
        outputStyles: './custom/styles',
      });
      expect(result.success).toBe(true);
    });

    it('should accept outputStyles as array', () => {
      const result = PluginManifestSchema.safeParse({
        name: 'my-plugin',
        outputStyles: ['./style1.md', './style2.md'],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('config path fields', () => {
    it('should accept hooks as string path', () => {
      const result = PluginManifestSchema.safeParse({
        name: 'my-plugin',
        hooks: './hooks/hooks.json',
      });
      expect(result.success).toBe(true);
    });

    it('should accept hooks as inline object', () => {
      const result = PluginManifestSchema.safeParse({
        name: 'my-plugin',
        hooks: {
          PostToolUse: [
            {
              type: 'command',
              command: 'echo test',
            },
          ],
        },
      });
      expect(result.success).toBe(true);
    });

    it('should accept mcpServers as string path', () => {
      const result = PluginManifestSchema.safeParse({
        name: 'my-plugin',
        mcpServers: './mcp-config.json',
      });
      expect(result.success).toBe(true);
    });

    it('should accept mcpServers as inline object', () => {
      const result = PluginManifestSchema.safeParse({
        name: 'my-plugin',
        mcpServers: {
          myServer: {
            command: 'node',
            args: ['server.js'],
          },
        },
      });
      expect(result.success).toBe(true);
    });

    it('should accept lspServers as string path', () => {
      const result = PluginManifestSchema.safeParse({
        name: 'my-plugin',
        lspServers: './.lsp.json',
      });
      expect(result.success).toBe(true);
    });

    it('should accept lspServers as inline object', () => {
      const result = PluginManifestSchema.safeParse({
        name: 'my-plugin',
        lspServers: {
          typescript: {
            command: 'typescript-language-server',
            extensionToLanguage: {
              '.ts': 'typescript',
            },
          },
        },
      });
      expect(result.success).toBe(true);
    });
  });

  describe('complete valid manifests', () => {
    it('should accept manifest with all fields', () => {
      const result = PluginManifestSchema.safeParse({
        name: 'my-plugin',
        version: '1.0.0',
        description: 'A comprehensive plugin',
        author: {
          name: 'John Doe',
          email: 'john@example.com',
          url: 'https://example.com',
        },
        homepage: 'https://example.com/plugin',
        repository: 'https://github.com/user/my-plugin',
        license: 'MIT',
        keywords: ['test', 'validation'],
        commands: ['./cmd1.md', './cmd2.md'],
        agents: './agents',
        skills: './skills',
        hooks: './hooks.json',
        mcpServers: './.mcp.json',
        outputStyles: './styles',
        lspServers: './.lsp.json',
      });
      expect(result.success).toBe(true);
    });
  });
});
