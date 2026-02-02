import { LSPValidator } from '../../src/validators/lsp';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { setupTestDir } from '../helpers/test-utils';

describe('LSPValidator', () => {
  const { getTestDir } = setupTestDir();

  async function createLSPFile(config: unknown) {
    const configDir = join(getTestDir(), '.claude');
    await mkdir(configDir, { recursive: true });

    const filePath = join(configDir, 'lsp.json');
    await writeFile(filePath, JSON.stringify(config, null, 2));
    return filePath;
  }

  describe('Orchestration', () => {
    it('should validate valid LSP configuration', async () => {
      const filePath = await createLSPFile({
        typescript: {
          command: 'typescript-language-server',
          args: ['--stdio'],
          transport: 'stdio',
          extensionToLanguage: {
            '.ts': 'typescript',
            '.tsx': 'typescriptreact',
          },
        },
      });

      const validator = new LSPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle invalid JSON syntax', async () => {
      const configDir = join(getTestDir(), '.claude');
      await mkdir(configDir, { recursive: true });
      const filePath = join(configDir, 'lsp.json');
      await writeFile(filePath, '{ invalid json }');

      const validator = new LSPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle missing LSP files', async () => {
      const originalCwd = process.cwd();
      process.chdir(getTestDir());

      try {
        const validator = new LSPValidator();
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
