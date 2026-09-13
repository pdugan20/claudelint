import { execFileSync } from 'child_process';
import { chmodSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { load } from 'js-yaml';

type Step = { name: string; run?: string };
const workflow = load(
  readFileSync(join(__dirname, '../../.github/workflows/publish.yml'), 'utf8')
) as {
  jobs: { 'github-release': { steps: Step[] } };
};
function script(name: string): string {
  const step = workflow.jobs['github-release'].steps.find((entry) => entry.name === name);
  if (!step?.run) throw new Error(`Missing release step: ${name}`);
  return step.run;
}

describe('release tag handling', () => {
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'claudelint-release-tag-'));
    writeFileSync(join(directory, 'gh'), '#!/bin/sh\nprintf "%s\\n" "$@" > release-args.txt\n');
    chmodSync(join(directory, 'gh'), 0o755);
  });

  afterEach(() => rmSync(directory, { recursive: true, force: true }));

  function run(source: string, tag: string): void {
    execFileSync('bash', ['-e', '-c', source], {
      cwd: directory,
      env: { ...process.env, PATH: `${directory}:${process.env.PATH}`, GITHUB_REF_NAME: tag },
    });
  }

  it('extracts the tagged version notes from the changelog', () => {
    writeFileSync(
      join(directory, 'CHANGELOG.md'),
      '# Changelog\n\n## [0.9.0]\n\nNew release notes.\n\n## [0.8.2]\n\nOld notes.\n'
    );
    run(script('Extract release notes from CHANGELOG.md'), 'v0.9.0');
    const notes = readFileSync(join(directory, 'release-notes.md'), 'utf8');
    expect(notes).toContain('New release notes.');
    expect(notes).not.toContain('Old notes.');
  });

  it.each(['v0.9.0', 'v0.9.0-beta.0'])('passes %s as a quoted argument', (tag) => {
    run(script('Create GitHub Release'), tag);
    const args = readFileSync(join(directory, 'release-args.txt'), 'utf8').trim().split('\n');
    expect(args.slice(0, 5)).toEqual(['release', 'create', tag, '--title', tag]);
    expect(args.includes('--prerelease')).toBe(tag.includes('-'));
    expect(args).toContain('claudelint-plugin.zip');
  });

  it('does not execute shell syntax embedded in a tag', () => {
    const tag = 'v0.9.0$(touch${IFS}sentinel)';
    run(script('Create GitHub Release'), tag);
    expect(existsSync(join(directory, 'sentinel'))).toBe(false);
    expect(readFileSync(join(directory, 'release-args.txt'), 'utf8')).toContain(tag);
  });
});
