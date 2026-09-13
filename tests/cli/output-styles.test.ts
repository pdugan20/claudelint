import { spawnSync } from 'child_process';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { setupTestDir } from '../helpers/test-utils';

const bin = join(__dirname, '../../bin/claudelint');
const content = `---
name: Diagrams first
description: Explain with clear diagrams
---

# Diagrams

## Guidelines

Lead each explanation with a diagram and describe the important relationships.

## Examples

Show the request moving from the client to the server and back again.
`;

describe('flat output styles through the CLI', () => {
  const { getTestDir } = setupTestDir();

  function run(args: string[], input?: string) {
    return spawnSync('node', [bin, ...args, '--rule', 'output-style-body-too-short:error'], {
      cwd: getTestDir(),
      encoding: 'utf8',
      input,
    });
  }

  it.each(['.claude/output-styles/concise.md', 'output-styles/concise.md'])(
    'lints stdin for %s and accepts a name override',
    (filename) => {
      const valid = run(['check-all', '--stdin', '--stdin-filename', filename], content);
      expect(valid.stdout + valid.stderr).toContain('No problems found');
      expect(valid.status).toBe(0);

      const invalid = run(
        ['check-all', '--stdin', '--stdin-filename', filename],
        '---\nname: concise\n---\nshort'
      );
      expect(invalid.stdout + invalid.stderr).toContain('output-style-body-too-short');
      expect(invalid.status).toBe(1);
    }
  );

  it('discovers and validates a flat file with a name override', async () => {
    const dir = join(getTestDir(), '.claude', 'output-styles');
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'concise.md'), '---\nname: concise\n---\nshort');
    const invalid = run(['check-all']);
    expect(invalid.stdout + invalid.stderr).toContain('output-style-body-too-short');
    expect(invalid.status).toBe(1);

    await writeFile(join(dir, 'concise.md'), content);
    const selected = run(['check-all']);
    expect(selected.status).toBe(0);
  });
});
