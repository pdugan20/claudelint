import { MCPValidator } from '../../src/validators/mcp';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { setupTestDir } from '../helpers/test-utils';

describe('MCPValidator', () => {
  const { getTestDir } = setupTestDir();

  async function createMCPFile(config: unknown) {
    const filePath = join(getTestDir(), '.mcp.json');
    await writeFile(filePath, JSON.stringify(config, null, 2));
    return filePath;
  }

  describe('Schema validation', () => {
    it('should pass for valid MCP config with stdio transport', async () => {
      const filePath = await createMCPFile({
        mcpServers: {
          'test-server': {
            name: 'test-server',
            transport: {
              type: 'stdio',
              command: 'node',
              args: ['server.js'],
            },
          },
        },
      });

      const validator = new MCPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass for valid MCP config with SSE transport', async () => {
      const filePath = await createMCPFile({
        mcpServers: {
          'sse-server': {
            name: 'sse-server',
            transport: {
              type: 'sse',
              url: 'http://localhost:3000/sse',
            },
          },
        },
      });

      const validator = new MCPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should error for invalid JSON syntax', async () => {
      const filePath = join(getTestDir(), '.mcp.json');
      await writeFile(filePath, '{ invalid json }');

      const validator = new MCPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('Invalid JSON'))).toBe(true);
    });

    it('should error for missing mcpServers field', async () => {
      const filePath = await createMCPFile({});

      const validator = new MCPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('mcpServers'))).toBe(true);
    });
  });

  describe('Server name validation', () => {
    it('should error for duplicate server names', async () => {
      const filePath = await createMCPFile({
        mcpServers: {
          'server-one': {
            name: 'duplicate-name',
            transport: {
              type: 'stdio',
              command: 'node',
              args: ['server1.js'],
            },
          },
          'server-two': {
            name: 'duplicate-name',
            transport: {
              type: 'stdio',
              command: 'node',
              args: ['server2.js'],
            },
          },
        },
      });

      const validator = new MCPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('Duplicate MCP server name'))).toBe(
        true
      );
    });

    it('should warn when server key does not match server name', async () => {
      const filePath = await createMCPFile({
        mcpServers: {
          'server-key': {
            name: 'different-name',
            transport: {
              type: 'stdio',
              command: 'node',
            },
          },
        },
      });

      const validator = new MCPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('does not match'))).toBe(true);
    });
  });

  describe('Transport type validation', () => {
    it('should pass for stdio transport type', async () => {
      const filePath = await createMCPFile({
        mcpServers: {
          stdio: {
            name: 'stdio',
            transport: {
              type: 'stdio',
              command: 'npm',
              args: ['run', 'server'],
            },
          },
        },
      });

      const validator = new MCPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should pass for sse transport type', async () => {
      const filePath = await createMCPFile({
        mcpServers: {
          sse: {
            name: 'sse',
            transport: {
              type: 'sse',
              url: 'https://api.example.com/sse',
            },
          },
        },
      });

      const validator = new MCPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });
  });

  describe('Stdio transport validation', () => {
    it('should error for empty command', async () => {
      const filePath = await createMCPFile({
        mcpServers: {
          test: {
            name: 'test',
            transport: {
              type: 'stdio',
              command: '',
            },
          },
        },
      });

      const validator = new MCPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('command cannot be empty'))).toBe(true);
    });

    it('should pass for command with args', async () => {
      const filePath = await createMCPFile({
        mcpServers: {
          test: {
            name: 'test',
            transport: {
              type: 'stdio',
              command: 'python',
              args: ['-m', 'server', '--port', '8080'],
            },
          },
        },
      });

      const validator = new MCPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });
  });

  describe('SSE transport validation', () => {
    it('should error for empty URL', async () => {
      const filePath = await createMCPFile({
        mcpServers: {
          test: {
            name: 'test',
            transport: {
              type: 'sse',
              url: '',
            },
          },
        },
      });

      const validator = new MCPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('URL cannot be empty'))).toBe(true);
    });

    it('should error for invalid URL format', async () => {
      const filePath = await createMCPFile({
        mcpServers: {
          test: {
            name: 'test',
            transport: {
              type: 'sse',
              url: 'not-a-valid-url',
            },
          },
        },
      });

      const validator = new MCPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('Invalid URL'))).toBe(true);
    });

    it('should pass for valid HTTP URL', async () => {
      const filePath = await createMCPFile({
        mcpServers: {
          test: {
            name: 'test',
            transport: {
              type: 'sse',
              url: 'http://localhost:3000/events',
            },
          },
        },
      });

      const validator = new MCPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should pass for valid HTTPS URL', async () => {
      const filePath = await createMCPFile({
        mcpServers: {
          test: {
            name: 'test',
            transport: {
              type: 'sse',
              url: 'https://api.example.com:8443/sse',
            },
          },
        },
      });

      const validator = new MCPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });
  });

  describe('Variable expansion validation', () => {
    it('should pass for ${VAR} expansion', async () => {
      const filePath = await createMCPFile({
        mcpServers: {
          test: {
            name: 'test',
            transport: {
              type: 'stdio',
              command: '${NODE_PATH}/node',
              args: ['${SERVER_SCRIPT}'],
            },
          },
        },
      });

      const validator = new MCPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should pass for ${VAR:-default} expansion', async () => {
      const filePath = await createMCPFile({
        mcpServers: {
          test: {
            name: 'test',
            transport: {
              type: 'sse',
              url: '${API_URL:-http://localhost:3000}/sse',
            },
          },
        },
      });

      const validator = new MCPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should pass for ${CLAUDE_PLUGIN_ROOT} usage', async () => {
      const filePath = await createMCPFile({
        mcpServers: {
          plugin: {
            name: 'plugin',
            transport: {
              type: 'stdio',
              command: '${CLAUDE_PLUGIN_ROOT}/bin/server',
            },
          },
        },
      });

      const validator = new MCPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should warn for simple $VAR expansion', async () => {
      const filePath = await createMCPFile({
        mcpServers: {
          test: {
            name: 'test',
            transport: {
              type: 'stdio',
              command: '$NODE_PATH/node',
            },
          },
        },
      });

      const validator = new MCPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('Simple variable expansion'))).toBe(
        true
      );
    });
  });

  describe('Environment variables validation', () => {
    it('should pass for valid environment variables', async () => {
      const filePath = await createMCPFile({
        mcpServers: {
          test: {
            name: 'test',
            transport: {
              type: 'stdio',
              command: 'node',
              env: {
                NODE_ENV: 'production',
                PORT: '3000',
              },
            },
          },
        },
      });

      const validator = new MCPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should warn for empty environment variable values', async () => {
      const filePath = await createMCPFile({
        mcpServers: {
          test: {
            name: 'test',
            transport: {
              type: 'stdio',
              command: 'node',
              env: {
                EMPTY_VAR: '',
              },
            },
          },
        },
      });

      const validator = new MCPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('Empty value'))).toBe(true);
    });

    it('should pass for environment variables with expansion', async () => {
      const filePath = await createMCPFile({
        mcpServers: {
          test: {
            name: 'test',
            transport: {
              type: 'stdio',
              command: 'node',
              env: {
                API_KEY: '${SECRET_KEY}',
                BASE_URL: '${API_URL:-http://localhost}',
              },
            },
          },
        },
      });

      const validator = new MCPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });
  });

  describe('Complex configurations', () => {
    it('should validate multiple MCP servers', async () => {
      const filePath = await createMCPFile({
        mcpServers: {
          'server-one': {
            name: 'server-one',
            transport: {
              type: 'stdio',
              command: 'npm',
              args: ['run', 'server-one'],
            },
          },
          'server-two': {
            name: 'server-two',
            transport: {
              type: 'sse',
              url: 'http://localhost:3000/sse',
            },
          },
          'server-three': {
            name: 'server-three',
            transport: {
              type: 'stdio',
              command: '${CLAUDE_PLUGIN_ROOT}/bin/server',
              env: {
                NODE_ENV: 'production',
              },
            },
          },
        },
      });

      const validator = new MCPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });
  });

  describe('No MCP files found', () => {
    it('should warn when no .mcp.json files exist', async () => {
      // Create a validator without a specific path - it will search in the test directory
      // We need to temporarily change the working directory
      const originalCwd = process.cwd();
      try {
        process.chdir(getTestDir());
        const validator = new MCPValidator();
        const result = await validator.validate();

        expect(result.valid).toBe(true);
        expect(result.warnings.some((w) => w.message.includes('No .mcp.json files found'))).toBe(
          true
        );
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
});
