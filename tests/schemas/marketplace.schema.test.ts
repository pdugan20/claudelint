/**
 * Tests for marketplace schema
 *
 * Validates MarketplaceMetadataSchema against the official spec:
 * https://code.claude.com/docs/en/plugin-marketplaces#marketplace-schema
 *
 * Verified against real-world examples:
 * - https://github.com/anthropics/claude-code/blob/main/.claude-plugin/marketplace.json
 * - https://github.com/anthropics/claude-plugins-official/blob/main/.claude-plugin/marketplace.json
 */

import {
  MarketplaceMetadataSchema,
  MarketplacePluginEntrySchema,
  MarketplacePluginSourceSchema,
  MarketplaceOwnerSchema,
} from '../../src/validators/schemas';

describe('MarketplaceMetadataSchema', () => {
  describe('required fields', () => {
    it('should accept minimal valid marketplace', () => {
      const result = MarketplaceMetadataSchema.safeParse({
        name: 'my-marketplace',
        owner: { name: 'Test Owner' },
        plugins: [],
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing name', () => {
      const result = MarketplaceMetadataSchema.safeParse({
        owner: { name: 'Test Owner' },
        plugins: [],
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing owner', () => {
      const result = MarketplaceMetadataSchema.safeParse({
        name: 'my-marketplace',
        plugins: [],
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing plugins array', () => {
      const result = MarketplaceMetadataSchema.safeParse({
        name: 'my-marketplace',
        owner: { name: 'Test Owner' },
      });
      expect(result.success).toBe(false);
    });
  });

  describe('optional fields', () => {
    it('should accept $schema field', () => {
      const result = MarketplaceMetadataSchema.safeParse({
        $schema: 'https://anthropic.com/claude-code/marketplace.schema.json',
        name: 'my-marketplace',
        owner: { name: 'Test Owner' },
        plugins: [],
      });
      expect(result.success).toBe(true);
    });

    it('should accept description and version', () => {
      const result = MarketplaceMetadataSchema.safeParse({
        name: 'my-marketplace',
        description: 'A test marketplace',
        version: '1.0.0',
        owner: { name: 'Test Owner' },
        plugins: [],
      });
      expect(result.success).toBe(true);
    });

    it('should accept metadata object', () => {
      const result = MarketplaceMetadataSchema.safeParse({
        name: 'my-marketplace',
        owner: { name: 'Test Owner' },
        plugins: [],
        metadata: {
          description: 'Extra description',
          version: '2.0.0',
          pluginRoot: './plugins',
        },
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Anthropic bundled marketplace structure', () => {
    it('should accept structure matching anthropics/claude-code marketplace', () => {
      const result = MarketplaceMetadataSchema.safeParse({
        $schema: 'https://anthropic.com/claude-code/marketplace.schema.json',
        name: 'claude-code-plugins',
        version: '1.0.0',
        description: 'Bundled plugins for Claude Code',
        owner: {
          name: 'Anthropic',
          email: 'support@anthropic.com',
        },
        plugins: [
          {
            name: 'code-review',
            description: 'Automated PR code review',
            version: '1.0.0',
            author: {
              name: 'Anthropic',
              email: 'support@anthropic.com',
            },
            source: './plugins/code-review',
            category: 'development',
          },
        ],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Anthropic official directory structure', () => {
    it('should accept external plugin via git URL source', () => {
      const result = MarketplaceMetadataSchema.safeParse({
        name: 'claude-plugins-official',
        owner: { name: 'Anthropic' },
        plugins: [
          {
            name: 'atlassian',
            description: 'Connect to Atlassian products',
            category: 'productivity',
            source: {
              source: 'url',
              url: 'https://github.com/atlassian/atlassian-mcp-server.git',
            },
            homepage: 'https://github.com/atlassian/atlassian-mcp-server',
          },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('should accept plugin with strict mode and lspServers', () => {
      const result = MarketplaceMetadataSchema.safeParse({
        name: 'official',
        owner: { name: 'Anthropic' },
        plugins: [
          {
            name: 'typescript-lsp',
            description: 'TypeScript language server',
            version: '1.0.0',
            source: './plugins/typescript-lsp',
            category: 'development',
            strict: false,
            lspServers: {
              typescript: {
                command: 'typescript-language-server',
                args: ['--stdio'],
                extensionToLanguage: { '.ts': 'typescript' },
              },
            },
          },
        ],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('rejects old fabricated schema format', () => {
    it('should reject flat format with icon/screenshots/readme/changelog', () => {
      const result = MarketplaceMetadataSchema.safeParse({
        name: 'my-plugin',
        description: 'Test plugin',
        version: '1.0.0',
        author: 'John Doe',
        icon: 'icon.png',
        screenshots: ['screenshot1.png'],
        readme: './README.md',
        changelog: './CHANGELOG.md',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('MarketplaceOwnerSchema', () => {
  it('should require name', () => {
    const result = MarketplaceOwnerSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should accept name only', () => {
    const result = MarketplaceOwnerSchema.safeParse({ name: 'Test' });
    expect(result.success).toBe(true);
  });

  it('should accept name and email', () => {
    const result = MarketplaceOwnerSchema.safeParse({
      name: 'Test',
      email: 'test@example.com',
    });
    expect(result.success).toBe(true);
  });
});

describe('MarketplacePluginEntrySchema', () => {
  it('should require name and source', () => {
    const result = MarketplacePluginEntrySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should reject missing source', () => {
    const result = MarketplacePluginEntrySchema.safeParse({
      name: 'my-plugin',
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing name', () => {
    const result = MarketplacePluginEntrySchema.safeParse({
      source: './plugins/my-plugin',
    });
    expect(result.success).toBe(false);
  });

  it('should accept minimal entry with relative path source', () => {
    const result = MarketplacePluginEntrySchema.safeParse({
      name: 'my-plugin',
      source: './plugins/my-plugin',
    });
    expect(result.success).toBe(true);
  });

  it('should accept entry with all optional fields', () => {
    const result = MarketplacePluginEntrySchema.safeParse({
      name: 'enterprise-tools',
      source: { source: 'github', repo: 'company/plugin' },
      description: 'Enterprise workflow tools',
      version: '2.1.0',
      author: { name: 'Enterprise Team', email: 'dev@company.com' },
      homepage: 'https://docs.example.com',
      repository: 'https://github.com/company/plugin',
      license: 'MIT',
      keywords: ['enterprise', 'workflow'],
      category: 'productivity',
      tags: ['community-managed'],
      strict: false,
    });
    expect(result.success).toBe(true);
  });

  it('should accept entry with component overrides', () => {
    const result = MarketplacePluginEntrySchema.safeParse({
      name: 'my-plugin',
      source: './plugins/my-plugin',
      commands: ['./commands/core/', './commands/enterprise/'],
      agents: ['./agents/reviewer.md'],
      hooks: {
        PostToolUse: [
          {
            matcher: 'Write|Edit',
            hooks: [{ type: 'command', command: 'echo test' }],
          },
        ],
      },
    });
    expect(result.success).toBe(true);
  });
});

describe('MarketplacePluginSourceSchema', () => {
  it('should accept relative path string', () => {
    const result = MarketplacePluginSourceSchema.safeParse('./plugins/my-plugin');
    expect(result.success).toBe(true);
  });

  it('should accept github source', () => {
    const result = MarketplacePluginSourceSchema.safeParse({
      source: 'github',
      repo: 'owner/repo',
    });
    expect(result.success).toBe(true);
  });

  it('should accept github source with ref and sha', () => {
    const result = MarketplacePluginSourceSchema.safeParse({
      source: 'github',
      repo: 'owner/repo',
      ref: 'v2.0.0',
      sha: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
    });
    expect(result.success).toBe(true);
  });

  it('should accept url (git) source', () => {
    const result = MarketplacePluginSourceSchema.safeParse({
      source: 'url',
      url: 'https://gitlab.com/team/plugin.git',
    });
    expect(result.success).toBe(true);
  });

  it('should accept npm source', () => {
    const result = MarketplacePluginSourceSchema.safeParse({
      source: 'npm',
      package: '@scope/my-plugin',
      version: '^1.0.0',
    });
    expect(result.success).toBe(true);
  });

  it('should accept pip source', () => {
    const result = MarketplacePluginSourceSchema.safeParse({
      source: 'pip',
      package: 'my-plugin',
      version: '>=1.0.0',
    });
    expect(result.success).toBe(true);
  });

  it('should accept npm source with custom registry', () => {
    const result = MarketplacePluginSourceSchema.safeParse({
      source: 'npm',
      package: 'my-plugin',
      registry: 'https://npm.company.com',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid source type', () => {
    const result = MarketplacePluginSourceSchema.safeParse({
      source: 'invalid',
      repo: 'owner/repo',
    });
    expect(result.success).toBe(false);
  });
});
