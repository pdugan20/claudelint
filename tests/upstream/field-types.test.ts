import { join } from 'path';
import { SettingsSchema } from '../../src/validators/schemas';
import {
  extractFieldExamples,
  toSettingsDocument,
  parseExample,
  assertMinTypedFields,
  loadSettingsDoc,
  MIN_TYPED_FIELDS,
  type FieldExample,
} from '../../scripts/upstream/field-types';

/**
 * Every value the docs print as a field's Example must parse against claudelint's schema.
 *
 * This is the gate the other two structurally cannot be:
 *
 *   - `check:upstream` compares field NAMES, so a field present in both the docs and the
 *     schema reads as conformant even when we demand the wrong TYPE for it.
 *   - The docs-example gate lints whole documents, and only fields that appear in a
 *     worked example are covered by it.
 *
 * `sandbox.allowUnsandboxedCommands` fell through exactly that seam: documented as a
 * boolean, modelled as `string[]`, used in no example, and shipped rejecting the documented
 * usage with "expected array, received boolean". This test is what closes it.
 */

const BASELINE = join(__dirname, '../../docs-baseline');

function describeFailure(entry: FieldExample, issues: string[]): string {
  const path = entry.section ? `${entry.section}.${entry.field}` : entry.field;

  return (
    `\n  docs-baseline/settings.md:${entry.line}\n` +
    `  claudelint rejects the value the docs print for \`${path}\`:\n` +
    `    example:  ${JSON.stringify(entry.example)}\n` +
    `    rejected: ${issues.join('; ')}\n`
  );
}

describe('documented field examples parse against the schema', () => {
  const examples = extractFieldExamples(loadSettingsDoc(BASELINE));

  it('parses field examples out of the settings tables', () => {
    // If the parser silently degrades toward zero, every assertion below passes vacuously.
    assertMinTypedFields(examples.length);
    expect(examples.length).toBeGreaterThanOrEqual(MIN_TYPED_FIELDS);
  });

  it('the schema actually rejects a wrongly-typed value (anti-vacuity)', () => {
    // Prove the mechanism bites before trusting a pass. A gate that cannot fail is
    // decoration -- and this repo has already shipped three of those.
    const bogus = toSettingsDocument({
      section: 'sandbox',
      field: 'enabled',
      example: 'not-a-boolean',
      line: 0,
    });

    expect(SettingsSchema.safeParse(bogus).success).toBe(false);
  });

  it.each(examples.map((e) => [`${e.section}.${e.field}`, e] as const))(
    'accepts the documented example for %s',
    (_label, entry) => {
      const result = SettingsSchema.safeParse(toSettingsDocument(entry));

      if (!result.success) {
        throw new Error(
          describeFailure(
            entry,
            result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
          )
        );
      }
    }
  );
});

describe('parseExample', () => {
  it('parses the literal forms the docs use', () => {
    expect(parseExample('`true`')).toBe(true);
    expect(parseExample('`8080`')).toBe(8080);
    expect(parseExample('`["github.com", "*.npmjs.org"]`')).toEqual(['github.com', '*.npmjs.org']);
    expect(parseExample('`{}`')).toEqual({});
    expect(parseExample('`[{ "name": "GITHUB_TOKEN", "mode": "deny" }]`')).toEqual([
      { name: 'GITHUB_TOKEN', mode: 'deny' },
    ]);
  });

  it('skips a cell that is not a self-contained literal', () => {
    // Prose and placeholders are not evidence of a type. Guessing at them would
    // manufacture phantom findings, which erodes trust in the gate faster than a missed
    // field does.
    expect(parseExample('see below')).toBeUndefined();
    expect(parseExample('`<your-token>`')).toBeUndefined();
    expect(parseExample('')).toBeUndefined();
  });
});

describe('toSettingsDocument', () => {
  it('nests a dotted field under its section', () => {
    expect(
      toSettingsDocument({
        section: 'sandbox',
        field: 'network.allowedDomains',
        example: ['github.com'],
        line: 0,
      })
    ).toEqual({ sandbox: { network: { allowedDomains: ['github.com'] } } });
  });

  it('places a flat field directly under its section', () => {
    expect(
      toSettingsDocument({ section: 'sandbox', field: 'enabled', example: true, line: 0 })
    ).toEqual({ sandbox: { enabled: true } });
  });
});

describe('assertMinTypedFields', () => {
  it('throws when the table parser yields almost nothing', () => {
    expect(() => assertMinTypedFields(0)).toThrow(/Type-conformance guard tripped/);
  });
});
