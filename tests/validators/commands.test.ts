import { CommandsValidator } from '../../src/validators/commands';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { setupTestDir } from '../helpers/test-utils';

describe('CommandsValidator', () => {
  const { getTestDir } = setupTestDir();

  describe('Orchestration', () => {
    it('should execute rules when commands directory exists', async () => {
      const commandsDir = join(getTestDir(), '.claude', 'commands');
      await mkdir(commandsDir, { recursive: true });

      const validator = new CommandsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should handle missing commands directory', async () => {
      const validator = new CommandsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });
});
