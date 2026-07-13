/**
 * Marketplace Discovery Integration Tests
 *
 * Drives the real PluginValidator (discovery -> schema routing -> rule execution) over
 * marketplace.json fixtures written to disk.
 *
 * These tests exist because the marketplace rules were dead code: PluginValidator never
 * discovered marketplace.json, so no rule guarded by `filePath.endsWith('marketplace.json')`
 * ever ran. A unit test cannot catch that — it hands the rule a synthetic filePath and skips
 * discovery entirely. Everything asserted here must go through the validator.
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { PluginValidator } from '../../src/validators/plugin';
import { ValidationResult } from '../../src/validators/file-validator';

const VALID_PLUGIN = { name: 'demo', version: '1.0.0', description: 'Demo plugin' };

describe('Marketplace discovery (real validator)', () => {
  const tempDirs: string[] = [];
  const originalCwd = process.cwd();

  /** Write a temp project containing .claude-plugin/{marketplace,plugin}.json */
  function createProject(marketplace: unknown, plugin: unknown = VALID_PLUGIN): string {
    const root = mkdtempSync(join(tmpdir(), 'claudelint-marketplace-'));
    tempDirs.push(root);
    mkdirSync(join(root, '.claude-plugin'));
    writeFileSync(
      join(root, '.claude-plugin/marketplace.json'),
      JSON.stringify(marketplace, null, 2)
    );
    writeFileSync(join(root, '.claude-plugin/plugin.json'), JSON.stringify(plugin, null, 2));
    return root;
  }

  /** Run the validator the way the CLI does: discovery rooted at the current directory */
  async function validateProject(root: string): Promise<ValidationResult> {
    process.chdir(root);
    try {
      return await new PluginValidator().validate();
    } finally {
      process.chdir(originalCwd);
    }
  }

  function ruleIds(result: ValidationResult): string[] {
    return [...result.errors, ...result.warnings].map((issue) => issue.ruleId as string);
  }

  afterAll(() => {
    process.chdir(originalCwd);
    for (const dir of tempDirs) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('discovers marketplace.json and reports nothing for a valid file', async () => {
    const root = createProject({
      name: 'demo-marketplace',
      owner: { name: 'Pat Dugan' },
      plugins: [{ name: 'demo', source: './' }],
    });

    const result = await validateProject(root);

    // The file must actually be scanned — this is the regression the fix addresses
    expect(result.scanMetadata?.filesFound.some((f) => f.endsWith('marketplace.json'))).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it('fires plugin-invalid-marketplace-manifest when owner is missing', async () => {
    const root = createProject({ name: 'broken-mp', plugins: [] });

    const result = await validateProject(root);

    expect(ruleIds(result)).toContain('plugin-invalid-marketplace-manifest');
    expect(result.errors.some((e) => e.message.includes('owner'))).toBe(true);
    // marketplace.json must not be judged against PluginManifestSchema: every reported error
    // carries a rule ID, so none came from the plugin-manifest schema step
    expect(result.errors.every((e) => e.ruleId !== undefined)).toBe(true);
  });

  it('fires plugin-dependency-not-allowlisted for a cross-marketplace dependency', async () => {
    const root = createProject({
      name: 'pdugan20-plugins',
      owner: { name: 'Pat Dugan' },
      plugins: [
        {
          name: 'mintlify-docs',
          source: './mintlify-docs',
          dependencies: [{ name: 'mintlify', marketplace: 'claude-plugins-official' }],
        },
      ],
    });
    // Give the source a real plugin directory so only the dependency rule can fire
    mkdirSync(join(root, 'mintlify-docs/.claude-plugin'), { recursive: true });
    writeFileSync(
      join(root, 'mintlify-docs/.claude-plugin/plugin.json'),
      JSON.stringify({ name: 'mintlify-docs', version: '1.0.0', description: 'Docs' })
    );

    const result = await validateProject(root);

    expect(ruleIds(result)).toContain('plugin-dependency-not-allowlisted');
    expect(
      result.errors.some((e) => e.message.includes('claude-plugins-official'))
    ).toBe(true);
  });

  it('stays quiet when the dependency marketplace is allowlisted', async () => {
    const root = createProject({
      name: 'pdugan20-plugins',
      owner: { name: 'Pat Dugan' },
      allowCrossMarketplaceDependenciesOn: ['claude-plugins-official'],
      plugins: [
        {
          name: 'demo',
          source: './',
          dependencies: [{ name: 'mintlify', marketplace: 'claude-plugins-official' }],
        },
      ],
    });

    const result = await validateProject(root);

    expect(ruleIds(result)).not.toContain('plugin-dependency-not-allowlisted');
  });

  it('resolves relative sources against the marketplace root, not .claude-plugin/', async () => {
    // "./" means the marketplace root, which holds .claude-plugin/plugin.json. Resolving
    // against .claude-plugin/ would look for .claude-plugin/.claude-plugin/plugin.json and
    // report a false positive.
    const root = createProject({
      name: 'demo-marketplace',
      owner: { name: 'Pat Dugan' },
      plugins: [{ name: 'demo', source: './' }],
    });

    const result = await validateProject(root);

    expect(ruleIds(result)).not.toContain('plugin-marketplace-files-not-found');
  });

  it('still fires plugin-marketplace-files-not-found for a genuinely missing source', async () => {
    const root = createProject({
      name: 'demo-marketplace',
      owner: { name: 'Pat Dugan' },
      plugins: [{ name: 'ghost', source: './plugins/ghost' }],
    });

    const result = await validateProject(root);

    expect(ruleIds(result)).toContain('plugin-marketplace-files-not-found');
  });

  it('does not warn on a missing plugin.json when the entry sets strict: false', async () => {
    // Per https://code.claude.com/docs/en/plugin-marketplaces#strict-mode, strict: false means
    // the marketplace entry is the entire definition — the plugin does not need its own
    // plugin.json. The source directory itself still needs to exist (checked below).
    const root = createProject({
      name: 'demo-marketplace',
      owner: { name: 'Pat Dugan' },
      plugins: [{ name: 'raw-files', source: './raw-files', strict: false }],
    });
    mkdirSync(join(root, 'raw-files'), { recursive: true });
    writeFileSync(join(root, 'raw-files/README.md'), '# raw-files\n');

    const result = await validateProject(root);

    expect(ruleIds(result)).not.toContain('plugin-marketplace-files-not-found');
  });

  it('still fires plugin-marketplace-files-not-found for strict: false when the source directory itself is missing', async () => {
    // A missing source directory is a different problem than a missing manifest — strict: false
    // must not swallow it.
    const root = createProject({
      name: 'demo-marketplace',
      owner: { name: 'Pat Dugan' },
      plugins: [{ name: 'ghost', source: './plugins/ghost', strict: false }],
    });

    const result = await validateProject(root);

    expect(ruleIds(result)).toContain('plugin-marketplace-files-not-found');
    expect(
      result.warnings.some((w) => w.message.includes('source directory not found'))
    ).toBe(true);
  });

  it('honors metadata.pluginRoot when resolving relative sources', async () => {
    const root = createProject({
      name: 'demo-marketplace',
      owner: { name: 'Pat Dugan' },
      metadata: { pluginRoot: './plugins' },
      plugins: [{ name: 'nested', source: './nested' }],
    });
    mkdirSync(join(root, 'plugins/nested/.claude-plugin'), { recursive: true });
    writeFileSync(
      join(root, 'plugins/nested/.claude-plugin/plugin.json'),
      JSON.stringify({ name: 'nested', version: '1.0.0', description: 'Nested' })
    );

    const result = await validateProject(root);

    expect(ruleIds(result)).not.toContain('plugin-marketplace-files-not-found');
  });
});
