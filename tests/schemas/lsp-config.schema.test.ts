/**
 * Tests for LSP config schema
 */

import { LSPConfigSchema } from '../../src/schemas/lsp-config.schema';

describe('LSPConfigSchema', () => {
  describe('inline server config', () => {
    it('should accept valid inline server config', () => {
      const result = LSPConfigSchema.safeParse({
        servers: {
          typescript: {
            command: 'typescript-language-server',
            args: ['--stdio'],
          },
        },
      });
      expect(result.success).toBe(true);
    });

    it('should accept server with env vars', () => {
      const result = LSPConfigSchema.safeParse({
        servers: {
          rust: {
            command: 'rust-analyzer',
            env: {
              RUST_LOG: 'info',
            },
          },
        },
      });
      expect(result.success).toBe(true);
    });

    it('should accept server with transport type', () => {
      const result = LSPConfigSchema.safeParse({
        servers: {
          python: {
            command: 'pylsp',
            transport: 'stdio',
          },
        },
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty command', () => {
      const result = LSPConfigSchema.safeParse({
        servers: {
          typescript: {
            command: '',
          },
        },
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid transport type', () => {
      const result = LSPConfigSchema.safeParse({
        servers: {
          python: {
            command: 'pylsp',
            transport: 'http',
          },
        },
      });
      expect(result.success).toBe(false);
    });
  });

  describe('file-based server config', () => {
    it('should accept valid file-based config', () => {
      const result = LSPConfigSchema.safeParse({
        servers: {
          java: {
            configFile: '/path/to/jdtls-config.json',
          },
        },
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty config file path', () => {
      const result = LSPConfigSchema.safeParse({
        servers: {
          java: {
            configFile: '',
          },
        },
      });
      expect(result.success).toBe(false);
    });
  });

  describe('extension mapping', () => {
    it('should accept valid extension mapping', () => {
      const result = LSPConfigSchema.safeParse({
        servers: {
          typescript: {
            command: 'typescript-language-server',
          },
        },
        extensionMapping: {
          '.ts': 'typescript',
          '.tsx': 'typescriptreact',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should reject extensions without leading dot', () => {
      const result = LSPConfigSchema.safeParse({
        servers: {
          typescript: {
            command: 'typescript-language-server',
          },
        },
        extensionMapping: {
          ts: 'typescript',
        },
      });
      expect(result.success).toBe(false);
    });

    it('should reject uppercase extensions', () => {
      const result = LSPConfigSchema.safeParse({
        servers: {
          typescript: {
            command: 'typescript-language-server',
          },
        },
        extensionMapping: {
          '.TS': 'typescript',
        },
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty language ID', () => {
      const result = LSPConfigSchema.safeParse({
        servers: {
          typescript: {
            command: 'typescript-language-server',
          },
        },
        extensionMapping: {
          '.ts': '',
        },
      });
      expect(result.success).toBe(false);
    });
  });

  describe('cross-field validation', () => {
    it('should reject server with both command and configFile', () => {
      const result = LSPConfigSchema.safeParse({
        servers: {
          hybrid: {
            command: 'lsp-server',
            configFile: '/path/to/config.json',
          },
        },
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('inline');
      }
    });
  });

  describe('multiple servers', () => {
    it('should accept multiple server configurations', () => {
      const result = LSPConfigSchema.safeParse({
        servers: {
          typescript: {
            command: 'typescript-language-server',
            args: ['--stdio'],
          },
          rust: {
            command: 'rust-analyzer',
          },
          java: {
            configFile: '/path/to/jdtls.json',
          },
        },
        extensionMapping: {
          '.ts': 'typescript',
          '.rs': 'rust',
          '.java': 'java',
        },
      });
      expect(result.success).toBe(true);
    });
  });
});
