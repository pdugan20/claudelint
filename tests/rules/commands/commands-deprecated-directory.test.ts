import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { setupTestDir } from '../../helpers/test-utils';
import { rule } from '../../../src/rules/commands/commands-deprecated-directory';

const tester = new ClaudeLintRuleTester();

describe('commands-deprecated-directory', () => {
  const { getTestDir } = setupTestDir();
  it('accepts a project using skills without legacy commands', async () => {
    await mkdir(join(getTestDir(), '.claude/skills/greet'), { recursive: true });
    await tester.run(rule.meta.id, rule, {
      valid: [{ content: '', filePath: getTestDir() }],
      invalid: [],
    });
  });
  it('reports a migration advisory for supported legacy commands', async () => {
    await mkdir(join(getTestDir(), '.claude/commands'), { recursive: true });
    await writeFile(join(getTestDir(), '.claude/commands/greet.md'), 'Greet the user.\n');
    await tester.run(rule.meta.id, rule, {
      valid: [],
      invalid: [
        { content: '', filePath: getTestDir(), errors: [{ message: 'Legacy commands directory' }] },
      ],
    });
    expect(rule.meta.severity).toBe('warn');
  });
});
