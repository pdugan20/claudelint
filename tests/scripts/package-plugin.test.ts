import { execFileSync } from 'child_process';
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

describe('plugin release archive', () => {
  it('includes the SessionStart hook and its executable target', () => {
    const root = mkdtempSync(join(tmpdir(), 'claudelint plugin '));
    const repo = join(__dirname, '../..');
    try {
      mkdirSync(join(root, 'scripts/util'), { recursive: true });
      cpSync(
        join(repo, 'scripts/util/package-plugin.sh'),
        join(root, 'scripts/util/package-plugin.sh')
      );
      for (const directory of ['.claude-plugin', 'hooks', 'skills']) {
        cpSync(join(repo, directory), join(root, directory), { recursive: true });
      }
      execFileSync('bash', ['scripts/util/package-plugin.sh'], { cwd: root });
      const unpacked = join(root, 'unpacked');
      execFileSync('unzip', ['-q', 'claudelint-plugin.zip', '-d', unpacked], { cwd: root });
      const hook = JSON.parse(readFileSync(join(unpacked, 'hooks/hooks.json'), 'utf8'));
      expect(hook.hooks.SessionStart[0].hooks[0].command).toBe(
        'node "${CLAUDE_PLUGIN_ROOT}/.claude-plugin/scripts/check-dependency.js"'
      );
      expect(
        readFileSync(join(unpacked, '.claude-plugin/scripts/check-dependency.js'), 'utf8')
      ).toContain('function main()');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
