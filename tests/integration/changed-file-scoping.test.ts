/**
 * End-to-end tests for --since / --changed file scoping.
 *
 * These flags were documented as limiting validation to changed files, but the changed-file
 * list was a DEAD STORE: computed, logged under --verbose, used as an emptiness gate, and
 * then never passed to a validator. Every validator globbed the whole tree, so a PR touching
 * one file was flagged for pre-existing findings in every Claude config file in the repo,
 * and `--since` output was byte-identical to an unscoped run (#115).
 *
 * It shipped because the only coverage asserted the flags appear in `--help`. So these tests
 * are behavioural: build a real git repo, commit, change one file, and assert on what is
 * actually scanned.
 */

import { execSync, spawnSync } from 'child_process';
import { join } from 'path';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { tmpdir } from 'os';

function runCLI(args: string[], cwd: string): { output: string; exitCode: number } {
  const bin = join(__dirname, '../../bin/claudelint');
  const result = spawnSync(bin, args, { cwd, encoding: 'utf-8' });
  return {
    output: (result.stdout || '') + (result.stderr || ''),
    exitCode: result.status ?? 1,
  };
}

function git(cmd: string, cwd: string): void {
  execSync(`git ${cmd}`, { cwd, stdio: 'pipe' });
}

describe('--since / --changed file scoping', () => {
  let repo: string;

  /** A CLAUDE.md with a broken @import, which reports claude-md-import-missing. */
  const DIRTY = '# Root\n\n@./does-not-exist.md\n';
  const CLEAN = '# Clean\n\nNothing wrong here.\n';

  beforeEach(() => {
    repo = join(tmpdir(), `claudelint-scope-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(join(repo, 'packages/foo'), { recursive: true });

    // The file we will NOT touch, carrying a pre-existing finding.
    writeFileSync(join(repo, 'CLAUDE.md'), DIRTY);
    // The file we WILL touch, which is clean.
    writeFileSync(join(repo, 'packages/foo/CLAUDE.md'), CLEAN);

    git('init -q', repo);
    git('config user.email "t@example.com"', repo);
    git('config user.name "t"', repo);
    git('add -A', repo);
    git('commit -qm initial', repo);
  });

  afterEach(() => {
    if (existsSync(repo)) rmSync(repo, { recursive: true, force: true });
  });

  it('--since reports only the changed file, not pre-existing findings elsewhere', () => {
    // Edit ONLY the clean file. The dirty file is untouched by this "PR".
    writeFileSync(join(repo, 'packages/foo/CLAUDE.md'), `${CLEAN}\nA new line.\n`);
    git('commit -qam "touch only the clean file"', repo);

    const { output, exitCode } = runCLI(['check-all', '--since', 'HEAD~1'], repo);

    // The whole point: a finding in a file the diff never touched must not be reported.
    expect(output).not.toContain('claude-md-import-missing');
    expect(exitCode).toBe(0);
  });

  it('--changed reports only the changed file', () => {
    writeFileSync(join(repo, 'packages/foo/CLAUDE.md'), `${CLEAN}\nUncommitted edit.\n`);

    const { output, exitCode } = runCLI(['check-all', '--changed'], repo);

    expect(output).not.toContain('claude-md-import-missing');
    expect(exitCode).toBe(0);
  });

  it('still reports a finding when the changed file is the one at fault', () => {
    // Scoping must not become a way to miss real problems in the files you did touch.
    writeFileSync(join(repo, 'packages/foo/CLAUDE.md'), '# Foo\n\n@./also-missing.md\n');
    git('commit -qam "break the changed file"', repo);

    const { output, exitCode } = runCLI(['check-all', '--since', 'HEAD~1'], repo);

    expect(output).toContain('claude-md-import-missing');
    expect(exitCode).toBe(1);
  });

  it('an unscoped run still sees the whole repo', () => {
    // Guards against "fixing" the scoping bug by simply scanning less, always.
    const { output, exitCode } = runCLI(['check-all'], repo);

    expect(output).toContain('claude-md-import-missing');
    expect(exitCode).toBe(1);
  });

  it('does not resurrect a deleted file', () => {
    // `git diff --name-only` lists deletions. Feeding a deleted path to a validator would
    // make it report on a file the PR intentionally removed.
    writeFileSync(join(repo, 'packages/foo/extra.md'), '# Extra\n');
    git('add -A', repo);
    git('commit -qm "add extra"', repo);

    rmSync(join(repo, 'packages/foo/extra.md'));
    git('commit -qam "delete extra"', repo);

    const { output, exitCode } = runCLI(['check-all', '--since', 'HEAD~1'], repo);

    expect(output).not.toContain('File not found');
    expect(exitCode).toBe(0);
  });

  it('does not claim CLAUDE.md is missing just because it is out of scope', () => {
    // Scoping filters the discovered set to nothing for CLAUDE.md here. That must read as
    // "not in scope", never as "this project has no CLAUDE.md" -- which would turn every
    // PR that happens not to touch CLAUDE.md into a false positive.
    writeFileSync(join(repo, 'unrelated.txt'), 'hello\n');
    git('add -A', repo);
    git('commit -qm "unrelated change"', repo);

    const { output, exitCode } = runCLI(['check-all', '--since', 'HEAD~1'], repo);

    expect(output).not.toContain('claude-md-file-not-found');
    expect(output).not.toContain('claude-md-import-missing');
    expect(exitCode).toBe(0);
  });

  it('brings a skill into scope when a file inside it changes, not just its SKILL.md', () => {
    // Skills are validated as a unit: rules reach into the scripts beside SKILL.md. Matching
    // skill DIRECTORIES against a list of changed FILES by exact path would match nothing
    // and silently skip every skill.
    const skillDir = join(repo, '.claude/skills/deploy');
    mkdirSync(skillDir, { recursive: true });
    writeFileSync(
      join(skillDir, 'SKILL.md'),
      '---\nname: deploy\ndescription: Deploys the application to production safely.\n---\n\n## Usage\n\nRun the deploy script.\n'
    );
    writeFileSync(join(skillDir, 'run.sh'), '#!/bin/bash\necho ok\n');
    git('add -A', repo);
    git('commit -qm "add skill"', repo);

    // Change only the script, never SKILL.md.
    writeFileSync(join(skillDir, 'run.sh'), '#!/bin/bash\necho changed\n');
    git('commit -qam "edit skill script"', repo);

    const { output } = runCLI(['check-all', '--since', 'HEAD~1', '--verbose'], repo);

    // The skill must be scanned. (It is clean, so we assert on what was scanned, not on
    // findings.) The unrelated dirty CLAUDE.md must still be out of scope.
    expect(output).toContain('SKILL.md');
    expect(output).not.toContain('claude-md-import-missing');
  });

  it('a scoped run does not poison the cache for a later unscoped run', () => {
    // A scoped run validates a SUBSET. If its result lands in the same cache entry an
    // unscoped run reads, the next full run reports "No problems found" and misses real
    // errors -- a silent false negative, which is worse than the false positive #115 was
    // about. The cache key must therefore include the scope.
    writeFileSync(join(repo, 'packages/foo/CLAUDE.md'), `${CLEAN}\nEdited.\n`);
    git('commit -qam "edit clean file"', repo);

    const scoped = runCLI(['check-all', '--since', 'HEAD~1'], repo);
    expect(scoped.exitCode).toBe(0);

    // Now a full run, against the cache the scoped run just wrote.
    const full = runCLI(['check-all'], repo);

    expect(full.output).toContain('claude-md-import-missing');
    expect(full.exitCode).toBe(1);
  });

  it('scopes correctly when run from a subdirectory of the repo', () => {
    // git reports paths relative to the GIT ROOT; validators discover them relative to cwd.
    // If the two path spaces are not reconciled, nothing matches and scoping silently
    // degrades to "scan everything" or "scan nothing".
    writeFileSync(join(repo, 'packages/foo/CLAUDE.md'), `${CLEAN}\nEdited from a subdir.\n`);
    git('commit -qam "edit from subdir"', repo);

    const { output, exitCode } = runCLI(
      ['check-all', '--since', 'HEAD~1'],
      join(repo, 'packages/foo')
    );

    expect(output).not.toContain('claude-md-import-missing');
    expect(exitCode).toBe(0);
  });
});
