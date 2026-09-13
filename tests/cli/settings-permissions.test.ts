import { spawnSync } from 'child_process';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { setupTestDir } from '../helpers/test-utils';

const cli = join(__dirname, '../../bin/claudelint');
const invalid = JSON.stringify({ permissions: { allow: ['Bassh(npm run build)'] } });

describe.each(['settings.json', 'settings.local.json'])('%s CLI permissions', (filename) => {
  const { getTestDir } = setupTestDir();
  it('discovers and flags invalid permission names on disk', async () => {
    await mkdir(join(getTestDir(), '.claude'));
    await writeFile(join(getTestDir(), '.claude', filename), invalid);
    const result = spawnSync(process.execPath, [cli, 'check-all', '--strict', '--no-cache'], {
      cwd: getTestDir(),
      encoding: 'utf8',
    });
    expect(result.status).toBe(1);
    expect(result.stdout).toContain('settings-invalid-permission');
    expect(result.stdout).toContain(filename);
    expect(result.stdout).not.toContain('Rule execution failed');
  });
  it.each([
    { severity: 'off', status: 0, reported: false },
    { severity: 'warn', status: 1, reported: true },
    { severity: 'error', status: 1, reported: true },
  ])('honors $severity for stdin', ({ severity, status, reported }) => {
    const result = spawnSync(
      process.execPath,
      [
        cli,
        'check-all',
        '--stdin',
        '--stdin-filename',
        `.claude/${filename}`,
        '--strict',
        '--rule',
        `settings-invalid-permission:${severity}`,
      ],
      {
        cwd: getTestDir(),
        input: invalid,
        encoding: 'utf8',
      }
    );
    expect(result.status).toBe(status);
    expect(result.stdout.includes('Invalid tool name')).toBe(reported);
  });
});
