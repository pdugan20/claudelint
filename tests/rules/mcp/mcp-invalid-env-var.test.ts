/**
 * Tests for mcp-invalid-env-var rule
 */
import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/mcp/mcp-invalid-env-var';
const ruleTester = new ClaudeLintRuleTester();
describe('mcp-invalid-env-var', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('mcp-invalid-env-var', rule, {
      valid: [
        // Valid variable expansion ${VAR}
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'stdio',
                  command: '${BIN_DIR}/server',
                },
            },
          }),
          filePath: 'test.mcp.json',
        },
        // Valid variable expansion with default ${VAR:-default}
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'stdio',
                  command: '${NODE_PATH:-/usr/local/bin/node}',
                },
            },
          }),
          filePath: 'test.mcp.json',
        },
        // CLAUDE_PLUGIN_ROOT is allowed
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'stdio',
                  command: '${CLAUDE_PLUGIN_ROOT}/bin/server',
                },
            },
          }),
          filePath: 'test.mcp.json',
        },
        // Valid environment variables
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'stdio',
                  command: 'node',
                  env: {
                    PATH: '/usr/local/bin',
                    NODE_ENV: 'production',
                },
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
                  command: '$VAR',
                },
            },
          }),
          filePath: 'package.json',
        },
      ],
      invalid: [
        // Simple variable expansion $VAR (should warn)
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'stdio',
                  command: '$HOME/bin/server',
                },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'Simple variable expansion $HOME',
            },
          ],
        },
        // Empty environment variable value
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'stdio',
                  command: 'node',
                  env: {
                    API_KEY: '',
                },
              },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'Empty value for environment variable: API_KEY',
            },
          ],
        },
        // Whitespace-only environment variable value
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'stdio',
                  command: 'node',
                  env: {
                    TOKEN: '   ',
                },
              },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'Empty value for environment variable: TOKEN',
            },
          ],
        },
        // Multiple issues
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'stdio',
                  command: '$BIN/server',
                  env: {
                    KEY1: '',
                    KEY2: '   ',
                },
              },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'Simple variable expansion $BIN',
            },
            {
              message: 'Empty value for environment variable: KEY1',
            },
            {
              message: 'Empty value for environment variable: KEY2',
            },
          ],
        },
      ],
    });
  });
  it('should validate variable names against custom pattern', async () => {
    await ruleTester.run('mcp-invalid-env-var', rule, {
      valid: [
        // Matches custom pattern (lowercase allowed)
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'stdio',
                  command: '${my_var}/bin/server',
                },
            },
          }),
          filePath: 'test.mcp.json',
          options: { pattern: '^[a-z_][a-z0-9_]*$' },
        },
      ],
      invalid: [
        // Doesn't match custom pattern
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'stdio',
                  command: '${MY_VAR}/bin/server',
                },
            },
          }),
          filePath: 'test.mcp.json',
          options: { pattern: '^[a-z_][a-z0-9_]*$' },
          errors: [
            {
              message: 'Environment variable name "MY_VAR" in command does not match pattern: ^[a-z_][a-z0-9_]*$',
            },
          ],
        },
      ],
    });
  });
  it('should validate variable names against default pattern', async () => {
    await ruleTester.run('mcp-invalid-env-var', rule, {
      valid: [
        // Matches default pattern (uppercase)
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'stdio',
                  command: '${MY_VAR}/bin/server',
                },
            },
          }),
          filePath: 'test.mcp.json',
        },
      ],
      invalid: [
        // Doesn't match default pattern (lowercase)
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'stdio',
                  command: '${my_var}/bin/server',
                },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'Environment variable name "my_var" in command does not match pattern: ^[A-Z_][A-Z0-9_]*$',
            },
          ],
        },
      ],
    });
  });
  it('should validate variable names in ${VAR:-default} syntax', async () => {
    await ruleTester.run('mcp-invalid-env-var', rule, {
      valid: [],
      invalid: [
        // Invalid variable name even with default value
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'stdio',
                  command: '${my_var:-/default/path}',
                },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'Environment variable name "my_var" in command does not match pattern: ^[A-Z_][A-Z0-9_]*$',
            },
          ],
        },
      ],
    });
  });
  it('should skip CLAUDE_PLUGIN_ROOT from pattern validation', async () => {
    await ruleTester.run('mcp-invalid-env-var', rule, {
      valid: [
        // CLAUDE_PLUGIN_ROOT should not be validated against pattern
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'stdio',
                  command: '${CLAUDE_PLUGIN_ROOT}/bin/server',
                },
            },
          }),
          filePath: 'test.mcp.json',
          options: { pattern: '^MY_PREFIX_[A-Z_]+$' }, // CLAUDE_PLUGIN_ROOT doesn't match this but should pass
        },
      ],
      invalid: [],
    });
  });
});
