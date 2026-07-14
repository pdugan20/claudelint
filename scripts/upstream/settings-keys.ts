/**
 * Which top-level keys does `settings.json` actually document?
 *
 * The name half of settings conformance, and the last of the three lenses:
 *
 *   - `check:upstream` (hook events)          -- names, hooks only
 *   - tests/upstream/docs-examples.test.ts    -- whole documents
 *   - tests/upstream/field-types.test.ts      -- documented example VALUES
 *   - this                                     -- documented settings KEY NAMES
 *
 * Deriving the documented set is the entire difficulty, and getting it wrong invents a
 * hallucination rather than catching one. settings.md carries several tables and JSON
 * examples that look like settings and are not:
 *
 *   - `### Global config settings` -- these live in `~/.claude.json`, and the docs say
 *     outright that "adding them to settings.json will trigger a schema validation error".
 *   - The policy-helper ENVELOPE (`managedSettings`, `appendSystemPrompt`) -- keys of a JSON
 *     document a helper executable writes to stdout, not keys of settings.json.
 *   - Sub-key tables (`### Sandbox settings`) -- rows like `enabled` and `network.allowedDomains`
 *     are nested under `sandbox`, not top-level.
 *
 * So the documented set is built from the ONE table that documents top-level settings, plus
 * an explicit list of keys documented in their own sections. A naive union of every
 * backtick in the page would have modelled the envelope keys -- which is exactly the class
 * of mistake this gate exists to prevent.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

/** The table whose rows ARE the top-level keys of settings.json. */
const TOP_LEVEL_TABLE = 'Available settings';

/**
 * Top-level settings keys documented by a dedicated section rather than by a row in the
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
  'workflowSizeGuideline',
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
  return readFileSync(join(baselineDir, 'settings.md'), 'utf8');
}
