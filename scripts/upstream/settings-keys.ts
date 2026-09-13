/**
 * Settings-key evidence from the authoritative reference index. Global config and
 * policy-helper output are different documents. The legacy table reader remains for
 * fixtures; the current baseline uses linked paths and explicit scope columns.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

/** The table whose rows ARE the top-level keys of settings.json. */
const TOP_LEVEL_TABLE = 'Available settings';

/**
 * Legacy top-level settings keys documented by a dedicated section rather than by a row in the
 * `Available settings` table. Each is the parent of its own sub-key table or example.
 */
export const SECTION_DOCUMENTED_KEYS = [
  'sandbox', // ### Sandbox settings
  'enabledPlugins', // documented via the plugin examples
  'extraKnownMarketplaces', // ### (marketplace examples)
  'strictKnownMarketplaces', // ### strictKnownMarketplaces
];

/**
 * Modeled but not documented, on purpose. Anything here must carry a reason -- an
 * unexplained entry is indistinguishable from a hallucination, which is the thing this
 * gate exists to catch.
 */
export const KNOWN_SETTINGS_EXTENSIONS: Record<string, string> = {
  $schema:
    'JSON Schema convention key, not a Claude Code setting. Editors use it to resolve completions.',
};

/**
 * Keys upstream documents but that must NEVER appear in SettingsSchema.
 *
 * `~/.claude.json` keys: "These settings are stored in `~/.claude.json` rather than
 * `settings.json`. Adding them to `settings.json` will trigger a schema validation error."
 * Modelling one would make claudelint bless config that Claude Code actively rejects.
 *
 * Policy-helper envelope keys: the JSON a `policyHelper` executable writes to stdout.
 * `policyHelper` itself IS a setting; the keys of its output are not.
 */
export const MUST_NOT_MODEL = [
  // ~/.claude.json only
  'autoConnectIde',
  'autoInstallIdeExtension',
  'externalEditorContext',
  'teammateDefaultModel',
  // policy-helper stdout envelope
  'managedSettings',
  'appendSystemPrompt',
];

/**
 * Below this, assume the table parser broke rather than that upstream deleted its settings.
 * Never lower this to make a red build pass.
 */
export const MIN_DOCUMENTED_SETTINGS = 90;

/** Top-level keys documented for settings.json. */
export function documentedSettingsKeys(markdown: string): string[] {
  if (/^## Settings index$/m.test(markdown)) {
    return [...new Set(documentedSettingsPaths(markdown).map((key) => key.split('.')[0]))].sort();
  }
  const keys = new Set<string>(SECTION_DOCUMENTED_KEYS);
  let heading: string | null = null;

  for (const line of markdown.split('\n')) {
    const headingMatch = /^#{2,4}\s+(.+?)\s*$/.exec(line);
    if (headingMatch) {
      heading = headingMatch[1];
      continue;
    }
    if (heading !== TOP_LEVEL_TABLE) continue;

    const row = /^\|\s*`([A-Za-z][A-Za-z0-9_.-]*)`\s*\|/.exec(line);
    // A dotted row (`autoMode.classifyAllShell`) is a NESTED key, not a top-level one.
    if (row && !row[1].includes('.')) keys.add(row[1]);
  }

  return [...keys].sort();
}

/** Settings paths from the authoritative index, excluding ~/.claude.json-only keys. */
export function documentedSettingsPaths(markdown: string): string[] {
  const paths = new Set<string>();
  let inIndex = false;
  for (const line of markdown.split('\n')) {
    if (/^## /.test(line)) inIndex = line === '## Settings index';
    if (!inIndex) continue;
    const row = /^\|\s*\[`([A-Za-z][A-Za-z0-9_.-]*)`\]\([^)]*\)\s*\|.*\|\s*([^|]+)\s*\|$/.exec(
      line
    );
    if (row && row[2].trim() !== 'Global config') paths.add(row[1]);
  }
  return [...paths].sort();
}

export function assertMinDocumentedSettings(count: number): void {
  if (count < MIN_DOCUMENTED_SETTINGS) {
    throw new Error(
      `Settings-key guard tripped: only ${count} documented settings were parsed ` +
        `(floor: ${MIN_DOCUMENTED_SETTINGS}). Upstream likely restyled the "${TOP_LEVEL_TABLE}" ` +
        `table. Fix the parser - do not lower MIN_DOCUMENTED_SETTINGS to make this pass.`
    );
  }
}

export function loadSettingsDoc(baselineDir: string): string {
  return readFileSync(join(baselineDir, 'settings-reference.md'), 'utf8');
}
