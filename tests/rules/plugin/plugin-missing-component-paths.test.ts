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
              message: '"skills/validate-all" should start with "./"',
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
              message: '"skills" should start with "./"',
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
              message: 'skills path "skills/lint"',
            },
            {
              message: 'agents path "agents/reviewer"',
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
              message: '"skills/invalid" should start with "./"',
            },
          ],
        },
      ],
    });
  });
});
