import { spawnSync } from 'child_process';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { setupTestDir } from '../helpers/test-utils';

const cli = join(__dirname, '../../bin/claudelint');
const invalidEvent = JSON.stringify({
  hooks: { PoToolUse: [{ matcher: 'Bash', hooks: [{ type: 'command', command: 'echo ok' }] }] },
});

describe('settings hook diagnostics through the CLI', () => {
  const { getTestDir } = setupTestDir();

  it.each(['settings.json', 'settings.local.json'])(
    'discovers %s and reports its unknown event',
    async (filename) => {
      await mkdir(join(getTestDir(), '.claude'));
      await writeFile(join(getTestDir(), '.claude', filename), invalidEvent);
      const result = spawnSync(process.execPath, [cli, 'check-all', '--no-cache'], {
        cwd: getTestDir(),
        encoding: 'utf8',
      });
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('hooks-invalid-event');
      expect(result.stdout).toContain(filename);
      expect(result.stdout.match(/Unknown hook event: PoToolUse/g)).toHaveLength(1);
    }
  );

  it.each([
    { args: ['--strict'], status: 1, reported: true },
    { args: ['--rule', 'hooks-invalid-event:off', '--strict'], status: 0, reported: false },
  ])('honors $args for a piped settings file', ({ args, status, reported }) => {
    const result = spawnSync(
      process.execPath,
      [cli, 'check-all', '--stdin', '--stdin-filename', '.claude/settings.json', ...args],
      { cwd: getTestDir(), input: invalidEvent, encoding: 'utf8' }
    );
    expect(result.status).toBe(status);
    expect(result.stdout.includes('Unknown hook event: PoToolUse')).toBe(reported);
  });
});
