import { execFileSync } from 'child_process';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import emojiRegex from 'emoji-regex';

describe('release changelog configuration', () => {
  let directory: string;

  function git(...args: string[]): void {
    execFileSync('git', args, { cwd: directory, stdio: 'pipe' });
  }

  function commit(message: string): void {
    git(
      '-c',
      'user.name=Release Fixture',
      '-c',
      'user.email=fixture@example.com',
      '-c',
      'commit.gpgsign=false',
      'commit',
      '--allow-empty',
      '-m',
      message
    );
  }

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'claudelint-changelog-'));
    git('init', '--quiet');
    commit('chore: initial fixture');
    git('tag', 'v0.1.0');
  });

  afterEach(() => rmSync(directory, { recursive: true, force: true }));

  function generate(): { notes: string; releaseType?: string | null } {
    return JSON.parse(
      execFileSync(
        process.execPath,
        [
          '--input-type=module',
          '-e',
          `
      import config from './.release-it.cjs';
      import { ConventionalChangelog } from 'conventional-changelog';
      import { Bumper } from 'conventional-recommended-bump';
      const preset = config.plugins['@release-it/conventional-changelog'].preset;
      const directory = process.argv[1];
      const generator = new ConventionalChangelog(directory).loadPreset(preset)
        .context({version: '0.2.0'}).commits({from: 'v0.1.0'});
      let notes = '';
      for await (const chunk of generator.write()) notes += chunk;
      const bump = await new Bumper(directory).loadPreset(preset).tag('v0.1.0').bump();
      process.stdout.write(JSON.stringify({notes, releaseType: bump.releaseType}));
    `,
          directory,
        ],
        { cwd: resolve(__dirname, '../..'), encoding: 'utf8' }
      )
    );
  }

  it('renders breaking notes without emojis, groups fixes, and hides routine chores', () => {
    commit('chore: routine dependency maintenance');
    commit('fix: retain local settings validation');
    commit('docs: explain runtime upgrade\n\nBREAKING CHANGE: Node.js 22.13.0 is now required.');
    const result = generate();
    expect(result.notes).toContain('### BREAKING CHANGES');
    expect(result.notes).toContain('Node.js 22.13.0 is now required.');
    expect(result.notes).toContain('### Bug Fixes');
    expect(result.notes).toContain('retain local settings validation');
    expect(result.notes).toContain('### Documentation');
    expect(result.notes).not.toContain('routine dependency maintenance');
    expect(result.notes).not.toMatch(emojiRegex());
    expect(result.releaseType).toBe('major');
  });

  it('includes ordinary documentation without recommending a version bump', () => {
    commit('docs: clarify setup instructions');
    commit('chore: routine dependency maintenance');
    const result = generate();
    expect(result.notes).toContain('clarify setup instructions');
    expect(result.notes).not.toContain('routine dependency maintenance');
    expect(result.releaseType).toBeFalsy();
  });
});
