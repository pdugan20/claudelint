/**
 * Tests for plugin-missing-component-paths rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/plugin/plugin-missing-component-paths';

const ruleTester = new ClaudeLintRuleTester();

describe('plugin-missing-component-paths', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('plugin-missing-component-paths', rule, {
      valid: [
        // All paths start with ./
        {
          content: JSON.stringify({
            name: 'my-plugin',
            skills: ['./skills/validate-all', './skills/lint'],
            agents: ['./agents/reviewer'],
            commands: ['./commands/deploy'],
            outputStyles: ['./output-styles/minimal'],
          }),
          filePath: '/test/plugin.json',
        },
        // String value starting with ./
        {
          content: JSON.stringify({
            name: 'my-plugin',
            skills: './skills',
          }),
          filePath: '/test/plugin.json',
        },
        // No component fields
        {
          content: JSON.stringify({ name: 'my-plugin' }),
          filePath: '/test/plugin.json',
        },
        // Non-plugin.json file
        {
          content: JSON.stringify({ skills: 'skills' }),
          filePath: '/test/config.json',
        },
      ],

      invalid: [
        // Skills path missing ./
        {
          content: JSON.stringify({
            name: 'my-plugin',
            skills: ['skills/validate-all'],
          }),
          filePath: '/test/plugin.json',
          errors: [
            {
              message: 'skills path missing "./" prefix: "skills/validate-all"',
            },
          ],
        },
        // String value missing ./
        {
          content: JSON.stringify({
            name: 'my-plugin',
            skills: 'skills',
          }),
          filePath: '/test/plugin.json',
          errors: [
            {
              message: 'skills path missing "./" prefix: "skills"',
            },
          ],
        },
        // Multiple component fields with issues
        {
          content: JSON.stringify({
            name: 'my-plugin',
            skills: ['skills/lint'],
            agents: ['agents/reviewer'],
          }),
          filePath: '/test/plugin.json',
          errors: [
            {
              message: 'skills path missing "./" prefix: "skills/lint"',
            },
            {
              message: 'agents path missing "./" prefix: "agents/reviewer"',
            },
          ],
        },
        // Mix of valid and invalid paths
        {
          content: JSON.stringify({
            name: 'my-plugin',
            skills: ['./skills/valid', 'skills/invalid'],
          }),
          filePath: '/test/plugin.json',
          errors: [
            {
              message: 'skills path missing "./" prefix: "skills/invalid"',
            },
          ],
        },
        // New component types: hooks, mcpServers, lspServers (string paths)
        {
          content: JSON.stringify({
            name: 'my-plugin',
            hooks: 'hooks.json',
            mcpServers: 'mcp.json',
            lspServers: 'lsp.json',
          }),
          filePath: '/test/plugin.json',
          errors: [
            {
              message: 'hooks path missing "./" prefix: "hooks.json"',
            },
            {
              message: 'mcpServers path missing "./" prefix: "mcp.json"',
            },
            {
              message: 'lspServers path missing "./" prefix: "lsp.json"',
            },
          ],
        },
      ],
    });
  });

  it('should skip inline object configs for hooks/mcpServers/lspServers', async () => {
    await ruleTester.run('plugin-missing-component-paths', rule, {
      valid: [
        // Inline object (not a string path) should be skipped
        {
          content: JSON.stringify({
            name: 'my-plugin',
            hooks: { PreToolUse: [] },
            mcpServers: { myServer: { command: 'node' } },
            lspServers: { tsserver: { command: 'typescript-language-server' } },
          }),
          filePath: '/test/plugin.json',
        },
      ],
      invalid: [],
    });
  });
});
