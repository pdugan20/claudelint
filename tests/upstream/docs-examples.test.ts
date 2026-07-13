import { execFile } from 'child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, join } from 'path';
import { promisify } from 'util';
import {
  classify,
  extractExamples,
  assertMinExamples,
  MIN_EXAMPLES,
  type DocExample,
} from '../../scripts/upstream/examples';

/**
 * The docs are the authority. Every config example the official docs print is, by
 * definition, valid config -- so claudelint must not error on any of them.
 *
 * This is the gate the field-name conformance check cannot be. `check:upstream` compares
 * schema fields to documented fields, which is blind to a field whose documented SHAPE we
 * reject: `tools` appears in both the docs and the schema, so it reads as conformant while
 * `tools: Read, Glob, Grep` -- the docs' own canonical sub-agent -- fails to lint.
 *
 * Warnings are allowed. They are claudelint's stylistic opinions ("body too short"), and
 * docs examples are abridged by nature. An ERROR means "this config is invalid", and
 * saying that about config upstream tells users to write is always claudelint's bug.
 *
 * NOTE ON MECHANISM: this materializes each example as a real file in a throwaway project
 * and runs the SHIPPED CLI over it. That is deliberately the slow, unglamorous option --
 * it is also the only one that tests what a user actually gets. Three in-process shortcuts
 * were tried first and every one of them silently validated NOTHING:
 *
 *   - `lintText` / `lintFiles` (the public API) hand each validator a FILE path where the
 *     validator expects a PROJECT ROOT to glob inside, so nothing ever matches and every
 *     input comes back clean. A first cut of this harness used it and reported 89 green
 *     tests while linting nothing at all.
 *   - Driving `ValidatorRegistry` directly needs the validators imported for their
 *     self-registration side effect, or the registry is simply empty.
 *   - The CLI's `--stdin` path skips rule execution for settings (it still reads the file
 *     from disk) and cannot match `.claude-plugin/plugin.json` at all.
 *
 * All three are tracked separately. The `anti-vacuity` test below exists because of them:
 * never trust a green run from this suite without proving the mechanism still bites.
 */

const BASELINE = join(__dirname, '../../docs-baseline');
const CLI = join(__dirname, '../../bin/claudelint');
const execFileAsync = promisify(execFile);

interface Failure {
  ruleId?: string;
  message: string;
}

interface CliReport {
  validators?: Array<{ errors?: Array<{ message: string; ruleId?: string }> }>;
}

/** Lint one example exactly as a user would: a real file, in a real project, via the CLI. */
async function lintExample(example: DocExample): Promise<Failure[]> {
  const project = mkdtempSync(join(tmpdir(), 'claudelint-docs-example-'));

  try {
    const file = join(project, example.filePath);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, example.code, 'utf8');

    let stdout: string;
    try {
      ({ stdout } = await execFileAsync('node', [CLI, 'check-all', '--format', 'json'], {
        cwd: project,
      }));
    } catch (error) {
      // A non-zero exit is the NORMAL path here: findings mean exit 1. The JSON report is
      // still on stdout, so read it rather than treating the exit code as a crash.
      const failed = error as { stdout?: string; message?: string };
      if (!failed.stdout) throw error;
      stdout = failed.stdout;
    }

    const report = JSON.parse(stdout) as CliReport;

    return (report.validators ?? [])
      .flatMap((v) => (v.errors ?? []).map((e) => ({ ruleId: e.ruleId, message: e.message })))
      .filter((e) => !(e.ruleId && PROJECT_CONTEXT_RULES.has(e.ruleId)));
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
}

/** Render a failure the reader can act on: what broke, and the source upstream published. */
function describeFailure(example: DocExample, errors: Failure[]): string {
  const source = example.code
    .split('\n')
    .slice(0, 8)
    .map((l) => `    | ${l}`)
    .join('\n');
  const reported = errors.map((e) => `    ${e.ruleId ?? '(schema)'}: ${e.message}`).join('\n');

  return (
    `\n  docs-baseline/${example.page}:${example.line} (linted as ${example.filePath})\n` +
    `  claudelint rejects an example the official docs print:\n${reported}\n${source}\n`
  );
}

/**
 * Rules that assert something about the PROJECT AROUND a file, not about the file's own
 * shape: does the skill this agent references exist, is the hook script on disk, does the
 * path in this manifest resolve. A docs example ships no project, so these fire on
 * perfectly valid config and say nothing about conformance.
 *
 * This is a scope boundary, not a mute button. Every rule here is one whose finding is
 * "the surrounding repo is missing a file", and the surrounding repo is a temp directory
 * this harness created. A rule that rejects the CONTENT of an example -- a bad enum, a
 * wrong type, a field the docs use and we do not -- must never be added to this list.
 */
const PROJECT_CONTEXT_RULES = new Set([
  'plugin-missing-file',
  'plugin-marketplace-files-not-found',
  'agent-skills-not-found',
  'skill-referenced-file-not-found',
  'skill-cross-reference-invalid',
  'settings-file-path-not-found',
  'claude-md-file-not-found',
  'hooks-missing-script',
]);

interface Fragment {
  example: string;
  reason: string;
}

/**
 * Abridged fragments upstream prints, which are correctly rejected because they are only
 * PART of a file. Suppressing one asserts "a user copying this verbatim would rightly get
 * an error" -- never "claudelint is wrong but we would rather be green".
 */
const FRAGMENTS: Fragment[] = (
  JSON.parse(readFileSync(join(BASELINE, 'examples-ignore.json'), 'utf8')) as {
    fragments: Fragment[];
  }
).fragments;

function isFragment(example: DocExample): boolean {
  return FRAGMENTS.some((f) => f.example === `${example.page}:${example.line}`);
}

describe('documented examples lint clean', () => {
  const examples = extractExamples(BASELINE);

  it('every suppressed fragment still exists and carries a reason', () => {
    // A stale suppression is a silent hole: upstream edits the page, the line moves, and
    // the entry now excuses nothing while looking like diligence.
    for (const fragment of FRAGMENTS) {
      expect(fragment.reason.trim().length).toBeGreaterThan(0);
      expect(examples.map((e) => `${e.page}:${e.line}`)).toContain(fragment.example);
    }
  });

  it('finds config examples across the baseline', () => {
    // Not a formality. If classification silently degrades toward zero, every assertion
    // below passes vacuously -- which is exactly how the lintText cut of this harness
    // reported 89 green tests while validating nothing. Pin the floor.
    expect(examples.length).toBeGreaterThanOrEqual(40);
  });

  it('the linter actually reports errors on known-bad config (anti-vacuity)', async () => {
    // If the mechanism silently stops validating, every test in this file goes green and
    // says the docs conform. Prove the mechanism bites before trusting a pass.
    const errors = await lintExample({
      page: 'control.md',
      line: 0,
      filePath: '.claude/settings.json',
      code: '{"permissions":{"defaultMode":"definitely-not-a-real-mode"}}',
    });

    expect(errors.length).toBeGreaterThan(0);
  });

  it.each(examples.map((e) => [`${e.page}:${e.line}`, e] as const))(
    'lints %s without error',
    async (_label, example) => {
      if (isFragment(example)) return;

      const errors = await lintExample(example);

      if (errors.length > 0) {
        throw new Error(describeFailure(example, errors));
      }
    },
    15000
  );
});

describe('example extractor guards', () => {
  it('throws when a page yields fewer examples than its floor', () => {
    // Upstream restyles its fences, or the extractor breaks: either way the page yields
    // nothing and every conformance assertion above would pass vacuously.
    expect(() => assertMinExamples('sub-agents.md', 0)).toThrow(/Example extractor guard tripped/);
  });

  it('does not guard a page with no declared floor', () => {
    expect(() => assertMinExamples('some-new-page.md', 0)).not.toThrow();
  });

  it('throws when there is no baseline at all', () => {
    expect(() => extractExamples(join(__dirname, 'fixtures/does-not-exist'))).toThrow();
  });

  it('every page with a declared floor still meets it', () => {
    const examples = extractExamples(BASELINE);

    for (const page of Object.keys(MIN_EXAMPLES)) {
      const count = examples.filter((e) => e.page === page).length;
      expect(count).toBeGreaterThanOrEqual(MIN_EXAMPLES[page]);
    }
  });
});

describe('classify', () => {
  it('skips a hook payload rather than linting it as settings', () => {
    // hooks.md documents both settings-with-hooks AND the hook input/output payloads.
    // Misclassifying a payload produces a phantom failure, which erodes trust in the gate
    // faster than a missed example does.
    expect(
      classify('hooks.md', {
        lang: 'json',
        line: 1,
        code: '{ "session_id": "abc", "tool_name": "Bash", "hook_event_name": "PreToolUse" }',
      })
    ).toBeNull();
  });

  it('classifies a hooks.md block that carries a hooks key', () => {
    expect(
      classify('hooks.md', { lang: 'json', line: 1, code: '{ "hooks": { "PreToolUse": [] } }' })
    ).toMatchObject({ filePath: '.claude/settings.json' });
  });

  it('lifts a ws server out of a `claude mcp add-json` shell command', () => {
    // The ONLY place upstream documents the `ws` transport is a bash fence. A
    // JSON-fences-only extractor cannot see it -- so this gate would have gone green on
    // exactly the drift it exists to catch.
    const fence = {
      lang: 'bash',
      line: 1,
      code: 'claude mcp add-json events \'{"type":"ws","url":"wss://x/socket"}\'',
    };
    const result = classify('mcp.md', fence);

    expect(result).toMatchObject({ filePath: '.mcp.json' });
    expect(JSON.parse(result!.code)).toEqual({
      mcpServers: { events: { type: 'ws', url: 'wss://x/socket' } },
    });
  });

  it('classifies any settings.md JSON block by its page', () => {
    // An earlier cut gated this on an allowlist of "recognized" settings keys -- i.e. it
    // inferred which keys are settings, the same guess-from-prose mistake that put
    // `websocket` in the transport enum. It caught 1 of settings.md's 26 blocks.
    expect(
      classify('settings.md', { lang: 'json', line: 1, code: '{ "attribution": { "co": true } }' })
    ).toMatchObject({ filePath: '.claude/settings.json' });
  });

  it('skips an abridged snippet that is not valid JSON', () => {
    expect(
      classify('settings.md', { lang: 'json', line: 1, code: '{ "hooks": { ... } }' })
    ).toBeNull();
  });

  it('routes frontmatter to the validator for its page', () => {
    const fm = { lang: 'yaml', line: 1, code: '---\nname: demo\n---' };

    expect(classify('sub-agents.md', fm)).toMatchObject({ filePath: '.claude/agents/demo.md' });
    expect(classify('skills.md', fm)).toMatchObject({
      filePath: '.claude/skills/demo/SKILL.md',
    });
  });
});
