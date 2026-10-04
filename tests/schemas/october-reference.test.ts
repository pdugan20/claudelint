import { PluginManifestSchema, SettingsSchema } from '../../src/validators/schemas';
import { LSPConfigSchema } from '../../src/schemas/lsp-config.schema';

describe('October upstream contracts', () => {
  const choice = {
    type: 'string',
    title: 'Tone',
    description: 'Reply tone',
    options: ['warm', 'formal'],
    default: 'warm',
  };
  it('accepts current plugin forms without stripping them', () => {
    const input = {
      name: 'probe',
      version: 'release-2026',
      documentationUrl: 'https://example.com/docs',
      settings: { agent: 'reviewer', subagentStatusLine: { type: 'command', command: 'status' } },
      commands: { status: { source: './status.md' }, about: { content: 'Describe this plugin' } },
      hooks: ['./hooks.json', { SessionStart: [] }],
      mcpServers: ['./mcp.json', { local: { command: 'server' } }],
      lspServers: [
        './lsp.json',
        {
          ts: {
            command: 'server',
            extensionToLanguage: { '.ts': 'typescript' },
            requestTimeout: 1000,
          },
        },
      ],
      experimental: {
        monitors: [
          {
            name: 'status',
            description: 'Status',
            command: 'watch',
            when: 'on-skill-invoke:review',
          },
        ],
      },
      userConfig: { tone: choice },
    };
    expect(PluginManifestSchema.parse(input)).toEqual(input);
  });
  it.each([
    { ...choice, default: 'unknown' },
    { ...choice, multiple: true },
    { ...choice, sensitive: true },
    { ...choice, typo: true },
    { ...choice, options: ['x'.repeat(65)] },
    { ...choice, default: undefined },
  ])('rejects invalid fixed-choice configuration %#', (option) => {
    expect(
      PluginManifestSchema.safeParse({ name: 'probe', userConfig: { tone: option } }).success
    ).toBe(false);
  });
  it.each([{ source: './x.md', content: 'x' }, {}])('requires one command source %#', (command) => {
    expect(
      PluginManifestSchema.safeParse({ name: 'probe', commands: { x: command } }).success
    ).toBe(false);
  });
  it('rejects unknown channel and LSP keys and invalid timeout values', () => {
    expect(
      PluginManifestSchema.safeParse({ name: 'probe', channels: [{ server: 'chat', typo: true }] })
        .success
    ).toBe(false);
    const server = { command: 'server', extensionToLanguage: { '.ts': 'typescript' } };
    expect(LSPConfigSchema.safeParse({ ts: { ...server, typo: true } }).success).toBe(false);
    expect(LSPConfigSchema.safeParse({ ts: { ...server, requestTimeout: 0 } }).success).toBe(false);
    expect(
      PluginManifestSchema.safeParse({
        name: 'probe',
        lspServers: { ts: { ...server, typo: true } },
      }).success
    ).toBe(false);
  });
  it.each([
    { maxProseWidth: 39 },
    { maxProseWidth: 40.5 },
    { availableModelsMatch: 'loose' },
    { allowedProviders: ['unknown'] },
    { gatewayInternalNetworks: ['10.0.0.0/8'] },
    { gatewayInternalNetworks: ['203.0.113.0/24', '203.0.113.128/25'] },
    { gatewayInternalNetworks: ['192.0.0.0/7'] },
  ])('rejects invalid documented setting constraints %#', (input) => {
    expect(SettingsSchema.safeParse(input).success).toBe(false);
  });
  it('accepts public gateway ranges and a required selection without a default', () => {
    expect(
      SettingsSchema.parse({ gatewayInternalNetworks: ['203.0.113.0/24', '198.51.100.0/24'] })
    ).toEqual({ gatewayInternalNetworks: ['203.0.113.0/24', '198.51.100.0/24'] });
    expect(
      PluginManifestSchema.safeParse({
        name: 'probe',
        userConfig: { tone: { ...choice, default: undefined, required: true } },
      }).success
    ).toBe(true);
  });
});
