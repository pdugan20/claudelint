/**
 * Tests for mcp-stdio-empty-command rule
 */
import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/mcp/mcp-stdio-empty-command';
const ruleTester = new ClaudeLintRuleTester();
describe('mcp-stdio-empty-command', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('mcp-stdio-empty-command', rule, {
      valid: [
        // Valid stdio command
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'stdio',
                  command: 'node',
                },
            },
          }),
          filePath: 'test.mcp.json',
        },
        // Valid stdio command with args
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'stdio',
                  command: 'node server.js',
                },
            },
          }),
          filePath: 'config.mcp.json',
        },
        // Non-stdio transport (should be ignored)
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'sse',
                  url: 'http://localhost:3000',
                },
            },
          }),
          filePath: 'test.mcp.json',
        },
        // Not an MCP file (should be ignored)
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'stdio',
                  command: '',
                },
            },
          }),
          filePath: 'package.json',
        },
      ],
      invalid: [
        // Empty command
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'stdio',
                  command: '',
                },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'MCP stdio transport command cannot be empty',
            },
          ],
        },
        // Whitespace-only command
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'stdio',
                  command: '   ',
                },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'command cannot be empty',
            },
          ],
        },
        // Missing command field
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'stdio',
                },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'command cannot be empty',
            },
          ],
        },
        // Multiple servers with empty commands
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'stdio',
                  command: '',
                },
              server2: {
                  type: 'stdio',
                  command: '  ',
                },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'command cannot be empty',
            },
            {
              message: 'command cannot be empty',
            },
          ],
        },
      ],
    });
  });
});
