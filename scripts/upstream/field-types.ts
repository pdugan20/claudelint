/**
 * Type conformance: do claudelint's schemas ACCEPT the values the docs print?
 *
 * The third gate, and the seam the first two leave open.
 *
 *   - `check:upstream` compares field NAMES. `allowUnsandboxedCommands` is present in both
 *     the docs and the schema, so a name diff calls it conformant -- while the docs say it
 *     is a boolean and claudelint demanded a `string[]`.
 *   - The docs-example gate (tests/upstream/docs-examples.test.ts) lints whole EXAMPLES.
 *     No example uses that field; it is documented only in a table.
 *
 * Neither reads the types in the tables. This does, and it does it without inventing a type
 * system: every settings table upstream publishes carries an **Example** column, and a value
 * the docs print as the example for a field is, by definition, a valid value for that field.
 * So build `{ sandbox: { allowUnsandboxedCommands: false } }` from the row and parse it. If
 * the schema rejects it, claudelint is wrong -- not the docs.
 *
 * Rows are relative to the object their section documents, so SECTION_BINDINGS says which
 * settings key each table hangs under. A section we cannot bind is skipped rather than
 * guessed at; MIN_TYPED_FIELDS is what stops "skipped" from quietly becoming "all of them".
 */

import { readFileSync } from 'fs';
import { join } from 'path';

export interface FieldExample {
  /** Settings key the row's table hangs under, e.g. `sandbox`. Empty for top-level. */
  section: string;
  /** Field path within that section, e.g. `network.allowedDomains`. */
  field: string;
  /** The value the docs print in the Example column, parsed. */
  example: unknown;
  /** 1-based line of the table row, for a clickable failure. */
  line: number;
}

/**
 * Which settings key each documented table hangs under. `''` means the table's rows are
 * top-level keys of settings.json.
 *
 * `Available settings` is bound now that the surface it documents is actually modelled:
 * every one of its 117 rows is checked against the schema, so the additions are verified
 * against upstream's own example values rather than trusted.
 *
 * `Global config settings` is deliberately NOT bound, and must never be: those keys live in
 * `~/.claude.json`, and the docs are explicit that "adding them to settings.json will
 * trigger a schema validation error". Binding that table would assert the opposite of what
 * upstream says.
 */
export const SECTION_BINDINGS: Record<string, string> = {
  'Available settings': '',
  'Sandbox settings': 'sandbox',
  'Permission settings': 'permissions',
  'Attribution settings': 'attribution',
};

/**
 * Below this, assume the table parser broke rather than that upstream deleted its tables.
 * Never lower this to make a red build pass.
 */
export const MIN_TYPED_FIELDS = 20;

/**
 * Parse the Example cell into a real value.
 *
 * Returns `undefined` when the cell is not a self-contained literal -- prose, an ellipsis,
 * a `<placeholder>`. Those are skipped: a cell we cannot parse is not evidence of anything,
 * and pretending otherwise would produce phantom findings.
 */
export function parseExample(cell: string): unknown {
  const trimmed = cell.trim().replace(/^`|`$/g, '').trim();
  if (!trimmed) return undefined;

  try {
    return JSON.parse(trimmed);
  } catch {
    return undefined;
  }
}

/** Section heading -> settings key, for the heading currently in effect. */
function sectionFor(heading: string | null): string | null {
  if (!heading) return null;
  return SECTION_BINDINGS[heading] ?? null;
}

/**
 * Table rows with a parseable Example cell, grouped under the section they appear in.
 *
 * Matches `| \`field\` | description | \`example\` |` -- three cells, first backtick-quoted.
 * A dotted first cell (`network.allowedDomains`) is a nested path within the section.
 */
export function extractFieldExamples(markdown: string): FieldExample[] {
  const out: FieldExample[] = [];
  const lines = markdown.split('\n');
  let heading: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const headingMatch = /^#{2,4}\s+(.+?)\s*$/.exec(lines[i]);
    if (headingMatch) {
      heading = headingMatch[1];
      continue;
    }

    const section = sectionFor(heading);
    if (section === null) continue;

    // `| `field` | ... | `example` |`
    const row = /^\|\s*`([A-Za-z][A-Za-z0-9_.-]*)`\s*\|(.*)\|([^|]*)\|\s*$/.exec(lines[i]);
    if (!row) continue;

    const example = parseExample(row[3]);
    if (example === undefined) continue;

    out.push({ section, field: row[1], example, line: i + 1 });
  }

  return out;
}

/** Build the minimal settings document that places `example` at `section.field`. */
export function toSettingsDocument(entry: FieldExample): Record<string, unknown> {
  const path = entry.field.split('.');
  const leaf: Record<string, unknown> = {};

  let cursor = leaf;
  for (let i = 0; i < path.length - 1; i++) {
    const next: Record<string, unknown> = {};
    cursor[path[i]] = next;
    cursor = next;
  }
  cursor[path[path.length - 1]] = entry.example;

  return entry.section ? { [entry.section]: leaf } : leaf;
}

export function loadSettingsDoc(baselineDir: string): string {
  return readFileSync(join(baselineDir, 'settings.md'), 'utf8');
}

export function assertMinTypedFields(count: number): void {
  if (count < MIN_TYPED_FIELDS) {
    throw new Error(
      `Type-conformance guard tripped: only ${count} documented field examples were parsed ` +
        `(floor: ${MIN_TYPED_FIELDS}). Upstream likely restyled its settings tables. Fix the ` +
        `parser - do not lower MIN_TYPED_FIELDS to make this pass.`
    );
  }
}
