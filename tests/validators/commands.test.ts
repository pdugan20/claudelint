import { CommandsValidator } from '../../src/validators/commands';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { setupTestDir } from '../helpers/test-utils';

describe('CommandsValidator', () => {
  const { getTestDir } = setupTestDir();

  describe('Deprecated commands directory detection', () => {
    it('should warn when .claude/commands directory exists', async () => {
      const commandsDir = join(getTestDir(), '.claude', 'commands');
      await mkdir(commandsDir, { recursive: true });

      const validator = new CommandsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('deprecated'))).toBe(true);
      expect(result.warnings.some((w) => w.ruleId === 'commands-deprecated-directory')).toBe(true);
    });

    it('should suggest migration to skills', async () => {
      const commandsDir = join(getTestDir(), '.claude', 'commands');
      await mkdir(commandsDir, { recursive: true });

      const validator = new CommandsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('migrate'))).toBe(true);
      expect(result.warnings.some((w) => w.ruleId === 'commands-migrate-to-skills')).toBe(true);
    });

    it('should pass when no commands directory exists', async () => {
      const validator = new CommandsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });
});
