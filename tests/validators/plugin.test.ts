import { PluginValidator } from '../../src/validators/plugin';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { setupTestDir } from '../helpers/test-utils';

describe('PluginValidator', () => {
  const { getTestDir } = setupTestDir();

  async function createPluginFile(manifest: unknown) {
    const filePath = join(getTestDir(), 'plugin.json');
    await writeFile(filePath, JSON.stringify(manifest, null, 2));
    return filePath;
  }

  describe('Orchestration', () => {
    it('should validate valid plugin manifest', async () => {
      const filePath = await createPluginFile({
        name: 'test-plugin',
        version: '1.0.0',
        description: 'Test plugin',
      });

      const validator = new PluginValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle invalid JSON syntax', async () => {
      const filePath = join(getTestDir(), 'plugin.json');
      await writeFile(filePath, '{ invalid json }');

      const validator = new PluginValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle missing plugin files', async () => {
      const originalCwd = process.cwd();
      process.chdir(getTestDir());

      try {
        const validator = new PluginValidator();
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
