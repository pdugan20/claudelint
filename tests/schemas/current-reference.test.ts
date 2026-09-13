import {
  SettingsSchema,
  MCPServerSchema,
  PluginManifestSchema,
  MarketplacePluginEntrySchema,
  MarketplaceMetadataSchema,
} from '../../src/validators/schemas';
import { SkillFrontmatterSchema } from '../../src/schemas/skill-frontmatter.schema';
import { AgentFrontmatterSchema } from '../../src/schemas/agent-frontmatter.schema';
import { LSPConfigSchema } from '../../src/schemas/lsp-config.schema';
import { OutputStyleFrontmatterSchema } from '../../src/schemas/output-style-frontmatter.schema';

describe('current documented configuration', () => {
  it('preserves optional skill metadata and full model identifiers', () => {
    const skill = {
      model: 'claude-opus-4-6',
      'disallowed-tools': ['AskUserQuestion'],
      background: false,
      metadata: { catalogId: 'example' },
      license: 'MIT',
      compatibility: 'Requires git',
    };
    expect(SkillFrontmatterSchema.parse(skill)).toEqual(skill);
    expect(SkillFrontmatterSchema.parse({})).toEqual({});
    expect(SkillFrontmatterSchema.safeParse({ 'disallowed-tools': true }).success).toBe(false);
    expect(SkillFrontmatterSchema.safeParse({ compatibility: 'x'.repeat(501) }).success).toBe(
      false
    );
  });
  it.each(['http', 'sse', 'ws', 'streamable-http'])(
    'preserves remote MCP options for %s',
    (type) => {
      const input = {
        type,
        url: 'https://example.com/mcp',
        headersHelper: 'get-headers',
        timeout: 30000,
        alwaysLoad: true,
        oauth: {
          clientId: 'app',
          callbackPort: 12345,
          authServerMetadataUrl: 'https://example.com/auth',
          scopes: 'read write',
        },
      };
      expect(MCPServerSchema.parse(input)).toEqual(input);
      expect(MCPServerSchema.safeParse({ ...input, headersHelper: [] }).success).toBe(false);
      expect(MCPServerSchema.safeParse({ ...input, oauth: { scopes: ['read'] } }).success).toBe(
        false
      );
    }
  );
  it('preserves stdio timeout and tool loading options', () => {
    const input = { command: 'node', args: ['server.js'], alwaysLoad: true, timeout: 5000 };
    expect(MCPServerSchema.parse(input)).toEqual(input);
    expect(MCPServerSchema.safeParse({ ...input, alwaysLoad: 'yes' }).success).toBe(false);
  });
  it('accepts newer plugin and marketplace fields', () => {
    const plugin = {
      name: 'example',
      displayName: 'Example',
      defaultEnabled: false,
      metadata: { catalogId: 1 },
      experimental: { themes: './themes', monitors: ['./monitors'], evals: './evals' },
      workflows: './workflows',
    };
    expect(PluginManifestSchema.parse(plugin)).toEqual(plugin);
    const entry = {
      ...plugin,
      source: { source: 'archive', url: 'https://example.com/plugin.zip', sha256: 'a'.repeat(64) },
      headers: { Authorization: 'placeholder' },
      headersHelper: 'get-headers',
      relevance: {},
    };
    expect(MarketplacePluginEntrySchema.parse(entry)).toEqual(entry);
    const marketplace = {
      name: 'example',
      owner: { name: 'Example' },
      plugins: [entry],
      renames: { old: 'example', removed: null },
    };
    expect(MarketplaceMetadataSchema.parse(marketplace)).toEqual(marketplace);
    expect(
      MarketplaceMetadataSchema.safeParse({ ...marketplace, renames: { old: false } }).success
    ).toBe(false);
    expect(PluginManifestSchema.safeParse({ ...plugin, defaultEnabled: 'false' }).success).toBe(
      false
    );
  });
  it('supports command plugin sources without executing the command', () => {
    const entry = {
      name: 'example',
      source: { source: 'command', command: 'get-plugin-path', mode: 'link', timeout: 120 },
    };
    expect(MarketplacePluginEntrySchema.parse(entry)).toEqual(entry);
    expect(
      MarketplacePluginEntrySchema.safeParse({
        ...entry,
        source: { ...entry.source, timeout: 601 },
      }).success
    ).toBe(false);
  });
  it('requires the documented archive and command source fields', () => {
    for (const source of [
      { source: 'archive' },
      { source: 'archive', url: 'http://example.com/plugin.zip' },
      { source: 'command' },
      { source: 'command', command: 'print    path' },
    ])
      expect(MarketplacePluginEntrySchema.safeParse({ name: 'example', source }).success).toBe(
        false
      );
  });

  it('preserves the documented agent, LSP and output-style options', () => {
    const agent = {
      name: 'example',
      description: 'Reviews application code',
      experimental: { cacheTtl: '1h' },
    };
    expect(AgentFrontmatterSchema.parse(agent)).toEqual(agent);
    expect(
      AgentFrontmatterSchema.safeParse({ ...agent, experimental: { cacheTtl: 'forever' } }).success
    ).toBe(false);
    const lsp = {
      example: {
        command: 'server',
        extensionToLanguage: { '.ts': 'typescript' },
        diagnostics: false,
        restartOnCrash: true,
      },
    };
    expect(LSPConfigSchema.parse(lsp)).toEqual(lsp);
    expect(OutputStyleFrontmatterSchema.parse({ 'force-for-plugin': true })).toEqual({
      'force-for-plugin': true,
    });
  });
  it('validates nested settings values instead of silently discarding them', () => {
    const settings = {
      attribution: { sessionUrl: false },
      permissions: { blockReadsOutsideWorkingDirectories: true },
      worktree: { baseRef: 'fresh', bgIsolation: 'none' },
      strictPluginOnlyCustomization: true,
      workflowSizeGuideline: 'small',
      sandbox: {
        credentials: {
          files: [
            {
              path: '~/.token',
              mode: 'mask',
              extract: 'token=(.*)',
              onExtractNoMatch: 'deny',
              injectHosts: ['example.com'],
            },
          ],
        },
      },
    };
    expect(SettingsSchema.parse(settings)).toEqual(settings);
    for (const invalid of [
      { attribution: { sessionUrl: 'false' } },
      { worktree: { baseRef: 'default' } },
      {
        sandbox: {
          credentials: { files: [{ path: '~/.token', mode: 'mask', injectHosts: true }] },
        },
      },
      { policyHelper: { path: '/opt/policy', timeoutMs: 500 } },
      { modelPricing: { multiplier: 1.5 } },
    ])
      expect(SettingsSchema.safeParse(invalid).success).toBe(false);
  });
});
