import { join } from 'path';
import { SettingsSchema } from '../../src/validators/schemas';
import {
  documentedSettingsKeys,
  assertMinDocumentedSettings,
  loadSettingsDoc,
  KNOWN_SETTINGS_EXTENSIONS,
  MUST_NOT_MODEL,
  MIN_DOCUMENTED_SETTINGS,
} from '../../scripts/upstream/settings-keys';

/**
 * Name conformance for settings.json, in BOTH directions.
 *
 * The `modeled-not-documented` direction is the hallucination guard, and it is the reason
 * this exists. Four fabricated fields shipped in this schema (`sandbox.network.allowedHosts`,
 * `allowedPorts`, `ignoreViolations`, marketplace `enabled`), invented from prose and
 * validated by nothing. Once this gate is green, a fifth cannot be written without either
 * a doc row to point at or an explicit, reasoned entry in KNOWN_SETTINGS_EXTENSIONS.
 */

const BASELINE = join(__dirname, '../../docs-baseline');

const documented = documentedSettingsKeys(loadSettingsDoc(BASELINE));
const modeled = Object.keys(SettingsSchema.shape);

describe('settings key conformance', () => {
  it('parses the documented settings surface', () => {
    // A parser that silently finds nothing would make every assertion below vacuous.
    assertMinDocumentedSettings(documented.length);
    expect(documented.length).toBeGreaterThanOrEqual(MIN_DOCUMENTED_SETTINGS);
  });

  it('models every documented setting', () => {
    const missing = documented.filter((key) => !modeled.includes(key));

    // Unmodelled keys are not harmless: SettingsSchema is non-strict, so they are stripped
    // silently -- the user gets no validation, and a typo gets no warning.
    expect(missing).toEqual([]);
  });

  it('documents every modeled setting (the hallucination guard)', () => {
    const invented = modeled
      .filter((key) => !documented.includes(key))
      .filter((key) => !KNOWN_SETTINGS_EXTENSIONS[key]);

    // A field here is one claudelint asserts exists and upstream has never documented.
    // Either point at a doc row, or declare it in KNOWN_SETTINGS_EXTENSIONS with a reason.
    // Do not simply add it to that map to make this pass -- that is how `allowedHosts`
    // survived three releases.
    expect(invented).toEqual([]);
  });

  it('every declared extension carries a reason', () => {
    for (const [key, reason] of Object.entries(KNOWN_SETTINGS_EXTENSIONS)) {
      expect(typeof reason).toBe('string');
      expect(reason.trim().length).toBeGreaterThan(10);
      expect(modeled).toContain(key);
    }
  });

  it('never models a key that belongs somewhere other than settings.json', () => {
    // `~/.claude.json` keys and the policy-helper stdout envelope. Modelling one would make
    // claudelint bless config that Claude Code actively rejects -- the docs say adding the
    // global keys to settings.json "will trigger a schema validation error".
    for (const key of MUST_NOT_MODEL) {
      expect(modeled).not.toContain(key);
    }
  });
});

describe('documentedSettingsKeys', () => {
  it('takes rows from the top-level table only', () => {
    const md = [
      '### Available settings',
      '',
      '| `realSetting` | desc | `true` |',
      '',
      '### Global config settings',
      '',
      '| `notASetting` | desc | `true` |',
    ].join('\n');

    const keys = documentedSettingsKeys(md);

    expect(keys).toContain('realSetting');
    expect(keys).not.toContain('notASetting');
  });

  it('skips a dotted row, which is a nested key rather than a top-level one', () => {
    const md = ['### Available settings', '', '| `autoMode.classifyAllShell` | d | `true` |'].join(
      '\n'
    );

    expect(documentedSettingsKeys(md)).not.toContain('autoMode.classifyAllShell');
  });

  it('includes keys documented by their own section', () => {
    expect(documentedSettingsKeys('')).toContain('sandbox');
  });
});

describe('assertMinDocumentedSettings', () => {
  it('throws when the table parser yields almost nothing', () => {
    expect(() => assertMinDocumentedSettings(0)).toThrow(/Settings-key guard tripped/);
  });
});
