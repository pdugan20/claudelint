import { LSPValidator } from '../../src/validators/lsp';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { setupTestDir } from '../helpers/test-utils';

describe('LSPValidator', () => {
  const { getTestDir } = setupTestDir();

  async function createLspConfig(config: Record<string, unknown>) {
    const claudeDir = join(getTestDir(), '.claude');
    await mkdir(claudeDir, { recursive: true });
    const filePath = join(claudeDir, 'lsp.json');
    await writeFile(filePath, JSON.stringify(config, null, 2));
    return filePath;
  }

  describe('Valid configurations', () => {
    it('should pass for valid inline server config', async () => {
      const filePath = await createLspConfig({
        servers: {
          'typescript-language-server': {
            command: 'typescript-language-server',
            args: ['--stdio'],
            transport: 'stdio',
          },
        },
      });

      const validator = new LSPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass for valid file-based server config', async () => {
      const filePath = await createLspConfig({
        servers: {
          'python-lsp': {
            configFile: './python-lsp.json',
          },
        },
      });

      const validator = new LSPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass for config with extension mappings', async () => {
      const filePath = await createLspConfig({
        servers: {
          'typescript-language-server': {
            command: 'typescript-language-server',
            args: ['--stdio'],
          },
        },
        extensionMapping: {
          '.ts': 'typescript',
          '.tsx': 'typescriptreact',
        },
      });

      const validator = new LSPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });
  });

  describe('Server configuration validation', () => {
    it('should error when both command and configFile are specified', async () => {
      const filePath = await createLspConfig({
        servers: {
          'test-server': {
            command: 'test-lsp',
            configFile: './config.json',
          },
        },
      });

      const validator = new LSPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) =>
          e.message.includes('cannot have both inline config (command) and configFile')
        )
      ).toBe(true);
    });

    it('should error when neither command nor configFile are specified', async () => {
      const filePath = await createLspConfig({
        servers: {
          'test-server': {},
        },
      });

      const validator = new LSPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) => e.message.includes('must have either command or configFile'))
      ).toBe(true);
    });

    it('should warn when server name is too short', async () => {
      const filePath = await createLspConfig({
        servers: {
          a: {
            command: 'test-lsp',
          },
        },
      });

      const validator = new LSPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.warnings.some((w) => w.message.includes('too short'))).toBe(true);
    });

    it('should warn when command is not in PATH or absolute', async () => {
      const filePath = await createLspConfig({
        servers: {
          'test-server': {
            command: 'typescript-language-server',
          },
        },
      });

      const validator = new LSPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.warnings.some((w) => w.message.includes('should be in PATH'))).toBe(true);
    });

    it('should error for invalid transport type', async () => {
      const filePath = await createLspConfig({
        servers: {
          'test-server': {
            command: 'test-lsp',
            transport: 'http',
          },
        },
      });

      const validator = new LSPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      // Schema validation catches invalid enum value
      expect(
        result.errors.some((e) => e.message.includes('Invalid enum') || e.message.includes('http'))
      ).toBe(true);
    });

    it('should warn when configFile is not a JSON file', async () => {
      const filePath = await createLspConfig({
        servers: {
          'test-server': {
            configFile: './config.txt',
          },
        },
      });

      const validator = new LSPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.warnings.some((w) => w.message.includes('should be a JSON file'))).toBe(true);
    });

    it('should warn for relative configFile paths', async () => {
      const filePath = await createLspConfig({
        servers: {
          'test-server': {
            configFile: 'config.json',
          },
        },
      });

      const validator = new LSPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.warnings.some((w) => w.message.includes('relative path'))).toBe(true);
    });
  });

  describe('Extension mapping validation', () => {
    it('should error when extension does not start with dot', async () => {
      const filePath = await createLspConfig({
        servers: {
          'test-server': {
            command: 'test-lsp',
          },
        },
        extensionMapping: {
          ts: 'typescript',
        },
      });

      const validator = new LSPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('Extension must start with'))).toBe(true);
    });

    it('should error when language ID is empty', async () => {
      const filePath = await createLspConfig({
        servers: {
          'test-server': {
            command: 'test-lsp',
          },
        },
        extensionMapping: {
          '.ts': '',
        },
      });

      const validator = new LSPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('cannot be empty'))).toBe(true);
    });

    it('should warn when language ID is not lowercase', async () => {
      const filePath = await createLspConfig({
        servers: {
          'test-server': {
            command: 'test-lsp',
          },
        },
        extensionMapping: {
          '.ts': 'TypeScript',
        },
      });

      const validator = new LSPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.warnings.some((w) => w.message.includes('should be lowercase'))).toBe(true);
    });
  });

  describe('No LSP config found', () => {
    it('should warn when no lsp.json files exist', async () => {
      // Create a validator without a specific path - it will search in the test directory
      // We need to temporarily change the working directory
      const originalCwd = process.cwd();
      try {
        process.chdir(getTestDir());
        const validator = new LSPValidator();
        const result = await validator.validate();

        expect(result.valid).toBe(true);
        expect(result.warnings.some((w) => w.message.includes('No lsp.json files found'))).toBe(
          true
        );
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
});
