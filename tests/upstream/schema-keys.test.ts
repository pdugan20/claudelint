import { readFileSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';
import { SCHEMA_REGISTRY } from '../../src/schemas/registry';
import { SettingsHookSchema } from '../../src/validators/schemas';
import { extractFrontmatterKeys } from '../../scripts/upstream/extract';
import { extractExamples } from '../../scripts/upstream/examples';
import { keyDifferences, schemaPaths, tableKeys } from '../../scripts/upstream/schema-keys';
import { documentedSettingsPaths } from '../../scripts/upstream/settings-keys';

const baseline = join(__dirname, '../../docs-baseline');
const doc = (page: string) => readFileSync(join(baseline, `${page}.md`), 'utf8');
const fields = (page: string, heading: string, min: number, prefix = '') =>
  tableKeys(doc(page), [{ heading, min, prefix }]);
const roots = (paths: Iterable<string>) => [...new Set([...paths].map((p) => p.split('.')[0]))];
const rootFields = (name: string) =>
  roots(schemaPaths(SCHEMA_REGISTRY.find((s) => s.name === name)!.zodSchema));

const bindings: Array<[string, string[], Record<string, string>]> = [
  [
    'SkillFrontmatterSchema',
    fields('skills', 'Frontmatter reference', 17),
    {
      version: 'claudelint extension for plugin version tracking.',
      tags: 'claudelint extension for skill categorization.',
    },
  ],
  ['AgentFrontmatterSchema', fields('sub-agents', 'Supported frontmatter fields', 16), {}],
  ['OutputStyleFrontmatterSchema', fields('output-styles', 'Frontmatter', 3), {}],
  [
    'PluginManifestSchema',
    roots(
      tableKeys(doc('plugins-reference'), [
        { heading: 'Required fields', min: 1 },
        { heading: 'Metadata fields', min: 9 },
        { heading: 'Component path fields', min: 10 },
      ])
    ),
    {
      themes:
        'plugins-reference#experimental-components explicitly retains the top-level compatibility form.',
      monitors:
        'plugins-reference#experimental-components explicitly retains the top-level compatibility form.',
    },
  ],
  [
    'MarketplaceMetadataSchema',
    roots(
      tableKeys(doc('plugin-marketplaces'), [
        { heading: 'Required fields', parent: 'Marketplace schema', min: 3 },
        { heading: 'Optional fields', parent: 'Marketplace schema', min: 5 },
      ])
    ),
    {},
  ],
  [
    'RulesFrontmatterSchema',
    extractFrontmatterKeys(doc('memory')).map((key) => key.replace('frontmatter-key:', '')),
    {},
  ],
  [
    'HooksConfigSchema',
    ['hooks'],
    {
      description:
        'Optional descriptive wrapper used by plugin hooks.json; not a hook-handler field.',
    },
  ],
  ['MCPConfigSchema', ['mcpServers'], {}],
];

describe('upstream schema key conformance', () => {
  it.each(bindings)(
    '%s matches its scoped documentation in both directions',
    (name, documented, extensions) => {
      expect(keyDifferences(documented, rootFields(name), extensions)).toEqual({
        missing: [],
        undocumented: [],
      });
      for (const reason of Object.values(extensions)) expect(reason.length).toBeGreaterThan(10);
    }
  );

  it('covers all registered schemas (settings and LSP use dedicated path checks)', () => {
    expect([...bindings.map(([name]) => name), 'SettingsSchema', 'LSPConfigSchema'].sort()).toEqual(
      SCHEMA_REGISTRY.map((entry) => entry.name).sort()
    );
  });

  it('models LSP fields, without treating the nearby plugin catalog as schema keys', () => {
    const documented = fields('plugins-reference', 'LSP servers', 12, '*.');
    const modeled = schemaPaths(
      SCHEMA_REGISTRY.find((s) => s.name === 'LSPConfigSchema')!.zodSchema
    );
    expect(keyDifferences(documented, modeled)).toEqual({ missing: [], undocumented: [] });
  });

  it('models hook handler fields, excluding runtime input/output payload fields', () => {
    const documented = tableKeys(doc('hooks'), [
      { heading: 'Common fields', min: 5 },
      { heading: 'Command hook fields', min: 5 },
      { heading: 'HTTP hook fields', min: 3 },
      { heading: 'MCP tool hook fields', min: 3 },
      { heading: 'Prompt and agent hook fields', min: 2 },
    ]);
    expect(keyDifferences(documented, Object.keys(SettingsHookSchema.shape))).toEqual({
      missing: [],
      undocumented: [],
    });
  });

  it('models indexed settings paths and the credential mask sub-key tables', () => {
    const markdown = doc('settings-reference');
    // These index entries describe MEMBERS of an array, not object properties. The
    // parent section explicitly documents true | string[]. Check that shape separately.
    const conceptual = new Set(
      ['skills', 'agents', 'hooks', 'mcp'].map((key) => `strictPluginOnlyCustomization.${key}`)
    );
    const documented = [
      ...documentedSettingsPaths(markdown).filter((key) => !conceptual.has(key)),
      ...tableKeys(markdown, [
        { heading: 'Fields for `modelPicker`', prefix: 'modelPicker.', min: 2 },
        { heading: 'Fields for `modelPricing`', prefix: 'modelPricing.', min: 2 },
        { heading: 'Mask fields for files', prefix: 'sandbox.credentials.files.*.', min: 6 },
        {
          heading: 'Mask fields for environment variables',
          prefix: 'sandbox.credentials.envVars.*.',
          min: 5,
        },
      ]),
    ];
    const modeled = schemaPaths(
      SCHEMA_REGISTRY.find((s) => s.name === 'SettingsSchema')!.zodSchema
    );
    expect(documented.filter((key) => !modeled.has(key))).toEqual([]);
  });

  it('models each documented MCP server and OAuth example key', () => {
    const modeled = schemaPaths(
      SCHEMA_REGISTRY.find((s) => s.name === 'MCPConfigSchema')!.zodSchema
    );
    const documented = new Set<string>();
    for (const example of extractExamples(baseline).filter(
      (e) => e.page === 'mcp.md' && e.filePath === '.mcp.json'
    )) {
      const servers = JSON.parse(example.code).mcpServers;
      for (const server of Object.values(servers) as Array<Record<string, unknown>>) {
        for (const key of Object.keys(server)) documented.add(`mcpServers.*.${key}`);
        for (const key of Object.keys((server.oauth ?? {}) as object))
          documented.add(`mcpServers.*.oauth.${key}`);
      }
    }
    expect(documented.size).toBeGreaterThanOrEqual(10);
    expect([...documented].filter((key) => !modeled.has(key))).toEqual([]);
  });
});

describe('schema key gate anti-vacuity', () => {
  const table = '## Fields\n| Field | Type |\n| --- | --- |\n| `nested.value` | string |';
  it('detects missing nested properties even when a record silently accepts them', () => {
    const documented = tableKeys(table, [{ heading: 'Fields', min: 1 }]);
    expect(
      keyDifferences(
        documented,
        schemaPaths(z.object({ nested: z.record(z.string(), z.unknown()) }))
      ).missing
    ).toEqual(['nested.value']);
  });
  it('detects invented fields', () => {
    expect(keyDifferences(['real'], ['real', 'invented']).undocumented).toEqual(['invented']);
  });
  it('fails closed when a bound table disappears', () => {
    expect(() => tableKeys('', [{ heading: 'Fields', min: 1 }])).toThrow('Schema-key guard');
  });
  it('ignores fenced headings and unrelated tables', () => {
    const text =
      table + '\n```md\n## Wrong heading\n```\n| Plugin | Description |\n| `invented` | text |';
    expect(tableKeys(text, [{ heading: 'Fields', min: 1 }])).toEqual(['nested.value']);
  });
});
