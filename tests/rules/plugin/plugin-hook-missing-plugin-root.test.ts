/**
 * Tests for plugin-hook-missing-plugin-root rule
 *
 * The rule validates inline hook objects in plugin.json, checking that
 * command-type hooks use ${CLAUDE_PLUGIN_ROOT} for script paths.
 * String/array hook file paths do NOT require ${CLAUDE_PLUGIN_ROOT}.
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/plugin/plugin-hook-missing-plugin-root';

const ruleTester = new ClaudeLintRuleTester();

describe('plugin-hook-missing-plugin-root', () => {
  describe('string hook paths (should always pass)', () => {
    it('should pass for string path without ${CLAUDE_PLUGIN_ROOT}', async () => {
      await ruleTester.run('plugin-hook-missing-plugin-root', rule, {
        valid: [
          {
            content: JSON.stringify({
              name: 'my-plugin',
              hooks: './hooks/hooks.json',
            }),
            filePath: '/test/plugin.json',
          },
        ],
        invalid: [],
      });
    });

    it('should pass for string path with ${CLAUDE_PLUGIN_ROOT}', async () => {
      await ruleTester.run('plugin-hook-missing-plugin-root', rule, {
        valid: [
          {
            content: JSON.stringify({
              name: 'my-plugin',
              hooks: '${CLAUDE_PLUGIN_ROOT}/hooks/hooks.json',
            }),
            filePath: '/test/plugin.json',
          },
        ],
        invalid: [],
      });
    });
  });

  describe('array hook paths (should always pass)', () => {
    it('should pass for array paths without ${CLAUDE_PLUGIN_ROOT}', async () => {
      await ruleTester.run('plugin-hook-missing-plugin-root', rule, {
        valid: [
          {
            content: JSON.stringify({
              name: 'my-plugin',
              hooks: ['./config/extra-hooks.json', './config/more-hooks.json'],
            }),
            filePath: '/test/plugin.json',
          },
        ],
        invalid: [],
      });
    });

    it('should pass for array paths with ${CLAUDE_PLUGIN_ROOT}', async () => {
      await ruleTester.run('plugin-hook-missing-plugin-root', rule, {
        valid: [
          {
            content: JSON.stringify({
              name: 'my-plugin',
              hooks: [
                '${CLAUDE_PLUGIN_ROOT}/config/extra-hooks.json',
                '${CLAUDE_PLUGIN_ROOT}/config/more-hooks.json',
              ],
            }),
            filePath: '/test/plugin.json',
          },
        ],
        invalid: [],
      });
    });
  });

  describe('inline object hooks', () => {
    it('should pass for inline hook with ${CLAUDE_PLUGIN_ROOT} in command', async () => {
      await ruleTester.run('plugin-hook-missing-plugin-root', rule, {
        valid: [
          {
            content: JSON.stringify({
              name: 'my-plugin',
              hooks: {
                PostToolUse: [
                  {
                    matcher: 'Write',
                    hooks: [
                      {
                        type: 'command',
                        command: '${CLAUDE_PLUGIN_ROOT}/scripts/post-tool.sh',
                      },
                    ],
                  },
                ],
              },
            }),
            filePath: '/test/plugin.json',
          },
        ],
        invalid: [],
      });
    });

    it('should pass for inline hook with non-path command', async () => {
      await ruleTester.run('plugin-hook-missing-plugin-root', rule, {
        valid: [
          {
            content: JSON.stringify({
              name: 'my-plugin',
              hooks: {
                PostToolUse: [
                  {
                    matcher: 'Write',
                    hooks: [
                      {
                        type: 'command',
                        command: 'echo "done"',
                      },
                    ],
                  },
                ],
              },
            }),
            filePath: '/test/plugin.json',
          },
        ],
        invalid: [],
      });
    });

    it('should pass for inline hook with prompt type (no command)', async () => {
      await ruleTester.run('plugin-hook-missing-plugin-root', rule, {
        valid: [
          {
            content: JSON.stringify({
              name: 'my-plugin',
              hooks: {
                PreToolUse: [
                  {
                    matcher: 'Bash',
                    hooks: [
                      {
                        type: 'prompt',
                        prompt: 'Review this bash command for safety',
                      },
                    ],
                  },
                ],
              },
            }),
            filePath: '/test/plugin.json',
          },
        ],
        invalid: [],
      });
    });

    it('should report inline hook command with relative path missing ${CLAUDE_PLUGIN_ROOT}', async () => {
      await ruleTester.run('plugin-hook-missing-plugin-root', rule, {
        valid: [],
        invalid: [
          {
            content: JSON.stringify({
              name: 'my-plugin',
              hooks: {
                PostToolUse: [
                  {
                    matcher: 'Write',
                    hooks: [
                      {
                        type: 'command',
                        command: './scripts/post-tool.sh',
                      },
                    ],
                  },
                ],
              },
            }),
            filePath: '/test/plugin.json',
            errors: [{ message: '${CLAUDE_PLUGIN_ROOT}' }],
          },
        ],
      });
    });

    it('should report multiple inline hook commands with missing ${CLAUDE_PLUGIN_ROOT}', async () => {
      await ruleTester.run('plugin-hook-missing-plugin-root', rule, {
        valid: [],
        invalid: [
          {
            content: JSON.stringify({
              name: 'my-plugin',
              hooks: {
                PostToolUse: [
                  {
                    matcher: 'Write',
                    hooks: [
                      {
                        type: 'command',
                        command: './scripts/post-tool.sh',
                      },
                    ],
                  },
                ],
                PreToolUse: [
                  {
                    matcher: 'Bash',
                    hooks: [
                      {
                        type: 'command',
                        command: './scripts/pre-tool.sh',
                      },
                    ],
                  },
                ],
              },
            }),
            filePath: '/test/plugin.json',
            errors: [
              { message: '${CLAUDE_PLUGIN_ROOT}' },
              { message: '${CLAUDE_PLUGIN_ROOT}' },
            ],
          },
        ],
      });
    });
  });

  describe('edge cases', () => {
    it('should skip non-plugin.json files', async () => {
      await ruleTester.run('plugin-hook-missing-plugin-root', rule, {
        valid: [
          {
            content: JSON.stringify({ hooks: './scripts/setup.sh' }),
            filePath: '/test/config.json',
          },
        ],
        invalid: [],
      });
    });

    it('should skip when no hooks field', async () => {
      await ruleTester.run('plugin-hook-missing-plugin-root', rule, {
        valid: [
          {
            content: JSON.stringify({ name: 'my-plugin' }),
            filePath: '/test/plugin.json',
          },
        ],
        invalid: [],
      });
    });

    it('should skip invalid JSON', async () => {
      await ruleTester.run('plugin-hook-missing-plugin-root', rule, {
        valid: [
          {
            content: 'not json{',
            filePath: '/test/plugin.json',
          },
        ],
        invalid: [],
      });
    });
  });
});
