import { MCPValidator } from '../../src/validators/mcp';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { setupTestDir } from '../helpers/test-utils';

describe('MCPValidator', () => {
  const { getTestDir } = setupTestDir();

  async function createMCPFile(config: unknown) {
    const configDir = join(getTestDir(), '.claude');
    await mkdir(configDir, { recursive: true });

    const filePath = join(configDir, 'mcp.json');
    await writeFile(filePath, JSON.stringify(config, null, 2));
    return filePath;
  }

  describe('Orchestration', () => {
    it('should validate valid MCP configuration', async () => {
      const filePath = await createMCPFile({
        mcpServers: {
          myServer: {
            name: 'myServer',
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

    it('should handle invalid JSON syntax', async () => {
      const configDir = join(getTestDir(), '.claude');
      await mkdir(configDir, { recursive: true });
      const filePath = join(configDir, 'mcp.json');
      await writeFile(filePath, '{ invalid json }');

      const validator = new MCPValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should aggregate results from multiple servers', async () => {
      const filePath = await createMCPFile({
        mcpServers: {
          server1: {
            name: 'server1',
            transport: {
              type: 'stdio',
              command: 'node',
              args: ['server1.js'],
            },
          },
          server2: {
            name: 'server2',
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

      expect(result.valid).toBe(true);
    });

    it('should handle missing MCP files', async () => {
      const originalCwd = process.cwd();
      process.chdir(getTestDir());

      try {
        const validator = new MCPValidator();
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
