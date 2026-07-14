import { join } from 'path';
import { ToolNames } from '../../src/schemas/constants';
import {
  documentedToolNames,
  assertMinDocumentedTools,
  loadToolsDoc,
  KNOWN_TOOL_EXTENSIONS,
  MIN_DOCUMENTED_TOOLS,
} from '../../scripts/upstream/tool-names';

/**
 * Name conformance for the tool list, in BOTH directions.
 *
 * The `documented-not-modeled` direction is why this exists. `tools-reference` was never on
 * the watchlist, so nothing asserted anything about the tool names, and the list silently
 * fell 18 documented tools behind. Every one of those was a live false positive:
 * `settings-invalid-permission` told users that `Artifact`, `TodoWrite`, `Workflow` and 15
 * others were "invalid tool names" (#122).
 *
 * The `modeled-not-documented` direction is the hallucination guard, same as settings keys.
 */

const BASELINE = join(__dirname, '../../docs-baseline');

const documented = documentedToolNames(loadToolsDoc(BASELINE));
const modeled: string[] = [...ToolNames.options];

describe('tool name conformance', () => {
  it('parses the documented tool surface', () => {
    // A parser that silently finds nothing would make every assertion below vacuous.
    assertMinDocumentedTools(documented.length);
    expect(documented.length).toBeGreaterThanOrEqual(MIN_DOCUMENTED_TOOLS);
  });

  it('models every documented tool', () => {
    const missing = documented.filter((name) => !modeled.includes(name));

    // A documented tool we do not model is a false positive by definition: the user writes
    // a real tool name in permissions.allow and claudelint calls it invalid.
    expect(missing).toEqual([]);
  });

  it('documents every modeled tool (the hallucination guard)', () => {
    const invented = modeled
      .filter((name) => !documented.includes(name))
      .filter((name) => !KNOWN_TOOL_EXTENSIONS[name]);

    // A name here is one claudelint asserts is a tool and upstream has never documented.
    // Either point at a table row, or declare it in KNOWN_TOOL_EXTENSIONS with a reason.
    expect(invented).toEqual([]);
  });

  it('every declared extension carries a reason', () => {
    for (const [name, reason] of Object.entries(KNOWN_TOOL_EXTENSIONS)) {
      expect(typeof reason).toBe('string');
      expect(reason.trim().length).toBeGreaterThan(10);
      expect(modeled).toContain(name);
    }
  });
});

describe('documentedToolNames', () => {
  it('takes rows from the tool table only', () => {
    const md = [
      '| Tool | Description |',
      '| :--- | :---------- |',
      '| `Bash` | Executes shell commands |',
      '',
      '## Configure tools with permission rules and hooks',
      '',
      '| Rule format | Applies to |',
      '| :---------- | :--------- |',
      '| `Read(~/secrets/**)` | Read, Grep, Glob, LSP |',
    ].join('\n');

    const names = documentedToolNames(md);

    expect(names).toContain('Bash');
    // The permission-rule table's first column looks like a tool but is a RULE. Modelling
    // one would invent a tool name out of an example.
    expect(names).not.toContain('Read(~/secrets/**)');
    expect(names).toEqual(['Bash']);
  });

  it('never mistakes a permission rule for a tool name', () => {
    const md = ['| Tool | Description |', '| :--- | :--- |', '| `Bash(npm run *)` | rule |'].join(
      '\n'
    );

    expect(documentedToolNames(md)).toEqual([]);
  });
});

describe('assertMinDocumentedTools', () => {
  it('throws when the table parser yields almost nothing', () => {
    expect(() => assertMinDocumentedTools(0)).toThrow(/Tool-name guard tripped/);
  });
});
