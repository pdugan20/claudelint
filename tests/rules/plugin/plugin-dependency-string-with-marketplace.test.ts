/**
 * Tests for plugin-dependency-string-with-marketplace rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/plugin/plugin-dependency-string-with-marketplace';

const ruleTester = new ClaudeLintRuleTester();

describe('plugin-dependency-string-with-marketplace', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('plugin-dependency-string-with-marketplace', rule, {
      valid: [
        // Bare string naming a plugin in the same marketplace
        {
          content: JSON.stringify({ name: 'deploy-kit', dependencies: ['audit-logger'] }),
          filePath: '/test/plugin.json',
        },
        // Object form with an explicit marketplace: the correct way to cross marketplaces
        {
          content: JSON.stringify({
            name: 'mintlify-docs',
            dependencies: [{ name: 'mintlify', marketplace: 'claude-plugins-official' }],
          }),
          filePath: '/test/plugin.json',
        },
        // Object form with a version constraint
        {
          content: JSON.stringify({
            name: 'deploy-kit',
            dependencies: [{ name: 'secrets-vault', version: '~2.1.0' }],
          }),
          filePath: '/test/plugin.json',
        },
        // No dependencies at all
        {
          content: JSON.stringify({ name: 'claudelint' }),
          filePath: '/test/plugin.json',
        },
        // Not a plugin manifest
        {
          content: JSON.stringify({ dependencies: ['left-pad@1.0.0'] }),
          filePath: '/test/package.json',
        },
      ],
      invalid: [
        // The real mintlify-docs bug
        {
          content: JSON.stringify({
            name: 'mintlify-docs',
            dependencies: ['mintlify@claude-plugins-official'],
          }),
          filePath: '/test/plugin.json',
          errors: [
            { message: 'Dependency "mintlify@claude-plugins-official" is not a valid plugin name' },
          ],
        },
        // Multiple offenders report separately
        {
          content: JSON.stringify({
            name: 'deploy-kit',
            dependencies: ['a@one', 'audit-logger', 'b@two'],
          }),
          filePath: '/test/plugin.json',
          errors: [
            { message: 'Dependency "a@one" is not a valid plugin name' },
            { message: 'Dependency "b@two" is not a valid plugin name' },
          ],
        },
      ],
    });
  });
});
