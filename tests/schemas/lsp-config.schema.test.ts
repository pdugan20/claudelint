/**
 * Tests for LSP config schema
 */

import { LSPConfigSchema } from '../../src/schemas/lsp-config.schema';

describe('LSPConfigSchema', () => {
  describe('server configuration', () => {
    it('should accept valid server config', () => {
      const result = LSPConfigSchema.safeParse({
        typescript: {
          command: 'typescript-language-server',
          args: ['--stdio'],
          extensionToLanguage: {
            '.ts': 'typescript',
            '.tsx': 'typescriptreact',
          },
        },
      });
      expect(result.success).toBe(true);
    });

    it('should accept server with env vars', () => {
      const result = LSPConfigSchema.safeParse({
        rust: {
          command: 'rust-analyzer',
          extensionToLanguage: {
            '.rs': 'rust',
          },
          env: {
            RUST_LOG: 'info',
          },
        },
      });
      expect(result.success).toBe(true);
    });

    it('should accept server with transport type', () => {
      const result = LSPConfigSchema.safeParse({
        python: {
          command: 'pylsp',
          transport: 'stdio',
          extensionToLanguage: {
            '.py': 'python',
          },
        },
      });
      expect(result.success).toBe(true);
    });

    it('should accept server with optional fields', () => {
      const result = LSPConfigSchema.safeParse({
        typescript: {
          command: 'typescript-language-server',
          extensionToLanguage: {
            '.ts': 'typescript',
          },
          initializationOptions: {
            preferences: {
              quotePreference: 'single',
            },
          },
          settings: {
            typescript: {
              format: {
                semicolons: 'insert',
              },
            },
          },
          workspaceFolder: '/path/to/workspace',
          startupTimeout: 5000,
          shutdownTimeout: 2000,
          restartOnCrash: true,
          maxRestarts: 3,
        },
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty command', () => {
      const result = LSPConfigSchema.safeParse({
        typescript: {
          command: '',
          extensionToLanguage: {
            '.ts': 'typescript',
          },
        },
      });
      expect(result.success).toBe(false);
    });

    it('should reject server without extensionToLanguage', () => {
      const result = LSPConfigSchema.safeParse({
        typescript: {
          command: 'typescript-language-server',
        },
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid transport type', () => {
      const result = LSPConfigSchema.safeParse({
        python: {
          command: 'pylsp',
          transport: 'http',
          extensionToLanguage: {
            '.py': 'python',
          },
        },
      });
      expect(result.success).toBe(false);
    });
  });

  describe('extension mapping', () => {
    it('should accept valid extension to language mapping', () => {
      const result = LSPConfigSchema.safeParse({
        typescript: {
          command: 'typescript-language-server',
          extensionToLanguage: {
            '.ts': 'typescript',
            '.tsx': 'typescriptreact',
            '.js': 'javascript',
            '.jsx': 'javascriptreact',
          },
        },
      });
      expect(result.success).toBe(true);
    });

    it('should reject extensions without leading dot', () => {
      const result = LSPConfigSchema.safeParse({
        typescript: {
          command: 'typescript-language-server',
          extensionToLanguage: {
            ts: 'typescript',
          },
        },
      });
      expect(result.success).toBe(false);
    });

    it('should reject uppercase extensions', () => {
      const result = LSPConfigSchema.safeParse({
        typescript: {
          command: 'typescript-language-server',
          extensionToLanguage: {
            '.TS': 'typescript',
          },
        },
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty language ID', () => {
      const result = LSPConfigSchema.safeParse({
        typescript: {
          command: 'typescript-language-server',
          extensionToLanguage: {
            '.ts': '',
          },
        },
      });
      expect(result.success).toBe(false);
    });
  });

  describe('multiple servers', () => {
    it('should accept multiple server configurations', () => {
      const result = LSPConfigSchema.safeParse({
        typescript: {
          command: 'typescript-language-server',
          args: ['--stdio'],
          extensionToLanguage: {
            '.ts': 'typescript',
            '.tsx': 'typescriptreact',
          },
        },
        rust: {
          command: 'rust-analyzer',
          extensionToLanguage: {
            '.rs': 'rust',
          },
        },
        python: {
          command: 'pylsp',
          extensionToLanguage: {
            '.py': 'python',
          },
        },
      });
      expect(result.success).toBe(true);
    });
  });
});
