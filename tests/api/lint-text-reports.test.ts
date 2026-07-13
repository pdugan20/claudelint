import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, join } from 'path';
import { lint, lintText } from '../../src/api/functions';

/**
 * The public API must actually report problems.
 *
 * `lintText` and `lintFiles` returned ZERO messages for every input -- including
 * definitively invalid config in every category -- because they handed each validator a
 * FILE path where the validator expects a PROJECT ROOT to glob inside. Nothing ever
 * matched, so every caller was told their config was clean.
 *
 * It survived because the existing tests only assert the SHAPE of the result:
 *
 *   expect(Array.isArray(results)).toBe(true);
 *   expect(results[0].source).toBe(code);
 *
 * Every one of those passes against a function hardcoded to return a clean result. A shape
 * assertion cannot tell a working linter from a stub.
 *
 * So these tests assert BEHAVIOR: a known-bad input must produce a message naming the
 * rule or field at fault. Do not "simplify" any of them into a shape check.
 */

/** Each case is config the CLI rejects. The API must reject it too. */
const KNOWN_BAD: Array<{ what: string; filePath: string; code: string; expect: RegExp }> = [
  {
    what: 'settings with an undefined permission mode',
    filePath: '.claude/settings.json',
    code: '{"permissions":{"defaultMode":"definitely-not-a-real-mode"}}',
    expect: /defaultMode|Invalid option/i,
  },
  {
    what: 'an MCP server with a transport that does not exist',
    filePath: '.mcp.json',
    code: '{"mcpServers":{"x":{"type":"carrier-pigeon","url":"http://example.com"}}}',
    expect: /Invalid input|transport/i,
  },
  {
    what: 'a skill whose name is not kebab-case',
    filePath: '.claude/skills/demo/SKILL.md',
    code: '---\nname: NOT_KEBAB_CASE\ndescription: Formats currency values for display in reports.\n---\n\n## Usage\n\nRun it.\n',
    expect: /lowercase|kebab|name/i,
  },
  {
    what: 'an agent whose description is too short',
    filePath: '.claude/agents/demo.md',
    code: '---\nname: demo\ndescription: Short\n---\n\nThis agent body is long enough to avoid the body-length warning entirely.\n',
    expect: /description/i,
  },
];

describe('lintText reports real problems', () => {
  it.each(KNOWN_BAD)('reports on $what', async ({ filePath, code, expect: pattern }) => {
    const results = await lintText(code, { filePath });
    const messages = results.flatMap((r) => r.messages);

    expect(messages.length).toBeGreaterThan(0);
    expect(messages.map((m) => m.message).join('\n')).toMatch(pattern);
  });

  it('still reports clean for VALID config (not just "reports something always")', async () => {
    // The mirror image of the bug: a fix that reports on everything is no better than one
    // that reports on nothing. Pin both directions.
    const results = await lintText('{"permissions":{"defaultMode":"acceptEdits"}}', {
      filePath: '.claude/settings.json',
    });

    expect(results.flatMap((r) => r.messages.filter((m) => m.severity === 'error'))).toEqual([]);
  });

  it('applies the validator for the given filePath, not every validator', async () => {
    // A settings document linted AS a settings file must not be dragged through the skill
    // or agent validators -- that is what `getApplicableValidators` is for, and it used to
    // ignore its filePath argument entirely and return all of them.
    const results = await lintText('{"permissions":{"defaultMode":"acceptEdits"}}', {
      filePath: '.claude/settings.json',
    });

    const ruleIds = results.flatMap((r) => r.messages.map((m) => m.ruleId ?? ''));
    expect(ruleIds.filter((id) => id.startsWith('skill-') || id.startsWith('agent-'))).toEqual([]);
  });
});

describe('lintFiles reports real problems', () => {
  let project: string;

  beforeEach(() => {
    project = mkdtempSync(join(tmpdir(), 'claudelint-api-'));
  });

  afterEach(() => {
    rmSync(project, { recursive: true, force: true });
  });

  function write(relPath: string, content: string): string {
    const file = join(project, relPath);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, content, 'utf8');
    return file;
  }

  it('reports errors for a bad settings file on disk', async () => {
    const file = write('.claude/settings.json', '{"permissions":{"defaultMode":"not-a-mode"}}');

    const results = await lint([file], { cwd: project });
    const messages = results.flatMap((r) => r.messages);

    expect(messages.length).toBeGreaterThan(0);
  });

  it('reports errors for a bad skill on disk', async () => {
    const file = write(
      '.claude/skills/demo/SKILL.md',
      '---\nname: NOT_KEBAB\ndescription: Formats currency values for display in reports.\n---\n\n## Usage\n\nx\n'
    );

    const results = await lint([file], { cwd: project });

    expect(results.flatMap((r) => r.messages).length).toBeGreaterThan(0);
  });
});
