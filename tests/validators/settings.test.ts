import { SettingsValidator } from '../../src/validators/settings';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { setupTestDir } from '../helpers/test-utils';

describe('SettingsValidator', () => {
  const { getTestDir } = setupTestDir();

  async function createSettingsFile(settings: Record<string, unknown>) {
    const settingsDir = join(getTestDir(), '.claude');
    await mkdir(settingsDir, { recursive: true });

    const filePath = join(settingsDir, 'settings.json');
    await writeFile(filePath, JSON.stringify(settings, null, 2));
    return filePath;
  }

  describe('Orchestration', () => {
    it('should validate valid settings', async () => {
      const filePath = await createSettingsFile({
        permissions: {
          ask: ['Write'],
        },
      });

      const validator = new SettingsValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle invalid JSON syntax', async () => {
      const settingsDir = join(getTestDir(), '.claude');
      await mkdir(settingsDir, { recursive: true });
      const filePath = join(settingsDir, 'settings.json');
      await writeFile(filePath, '{ invalid json }');

      const validator = new SettingsValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle schema validation errors', async () => {
      const filePath = await createSettingsFile({
        permissions: 'not-an-array',
      });

      const validator = new SettingsValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should aggregate results from complex settings', async () => {
      const filePath = await createSettingsFile({
        permissions: {
          ask: ['Write'],
          allow: ['Bash'],
        },
        hooks: {
          PreToolUse: [
            {
              hooks: [
                {
                  type: 'command',
                  command: 'echo test',
                },
              ],
            },
          ],
        },
        env: {
          API_KEY: '${SECRET_KEY}',
        },
      });

      const validator = new SettingsValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should handle missing settings files', async () => {
      const originalCwd = process.cwd();
      process.chdir(getTestDir());

      try {
        const validator = new SettingsValidator();
        const result = await validator.validate();

        // No settings found is not an error - just an empty result
        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
        expect(result.valid).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
});
