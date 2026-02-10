import { HooksValidator } from '../../src/validators/hooks';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { setupTestDir } from '../helpers/test-utils';

describe('HooksValidator', () => {
  const { getTestDir } = setupTestDir();

  async function createHooksFile(hooksObj: unknown) {
    const hooksDir = join(getTestDir(), '.claude', 'hooks');
    await mkdir(hooksDir, { recursive: true });

    const filePath = join(hooksDir, 'hooks.json');
    await writeFile(filePath, JSON.stringify({ hooks: hooksObj }, null, 2));
    return filePath;
  }

  describe('Orchestration', () => {
    it('should validate valid hooks configuration', async () => {
      const filePath = await createHooksFile({
        PreToolUse: [
          {
            matcher: 'Bash',
            hooks: [
              {
                type: 'command',
                command: 'echo test',
                timeout: 30000,
              },
            ],
          },
        ],
      });

      const validator = new HooksValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle invalid JSON syntax', async () => {
      const hooksDir = join(getTestDir(), '.claude', 'hooks');
      await mkdir(hooksDir, { recursive: true });
      const filePath = join(hooksDir, 'hooks.json');
      await writeFile(filePath, '{ invalid json }');

      const validator = new HooksValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle schema validation errors', async () => {
      const hooksDir = join(getTestDir(), '.claude', 'hooks');
      await mkdir(hooksDir, { recursive: true });
      const filePath = join(hooksDir, 'hooks.json');
      await writeFile(filePath, JSON.stringify({ foo: 'bar' }));

      const validator = new HooksValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should aggregate results from multiple events', async () => {
      const filePath = await createHooksFile({
        PreToolUse: [
          {
            matcher: 'Write',
            hooks: [{ type: 'command', command: 'npm run lint' }],
          },
        ],
        PostToolUse: [
          {
            hooks: [{ type: 'prompt', prompt: 'Success!' }],
          },
        ],
        Stop: [
          {
            hooks: [{ type: 'command', command: 'echo "Done"' }],
          },
        ],
      });

      const validator = new HooksValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should handle missing hooks files', async () => {
      const originalCwd = process.cwd();
      process.chdir(getTestDir());

      try {
        const validator = new HooksValidator();
        const result = await validator.validate();

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
});
