/**
 * Tests for plugin-dependency-not-allowlisted rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/plugin/plugin-dependency-not-allowlisted';

const ruleTester = new ClaudeLintRuleTester();

const owner = { name: 'Acme' };

describe('plugin-dependency-not-allowlisted', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('plugin-dependency-not-allowlisted', rule, {
      valid: [
        // Cross-marketplace dependency, correctly allowlisted
        {
          content: JSON.stringify({
            name: 'acme-tools',
            owner,
            allowCrossMarketplaceDependenciesOn: ['acme-shared'],
            plugins: [
              {
                name: 'deploy-kit',
                source: './deploy-kit',
                dependencies: [{ name: 'audit-logger', marketplace: 'acme-shared' }],
              },
            ],
          }),
          filePath: '/test/.claude-plugin/marketplace.json',
        },
        // Same-marketplace dependency needs no allowlist
        {
          content: JSON.stringify({
            name: 'acme-tools',
            owner,
            plugins: [
              {
                name: 'deploy-kit',
                source: './deploy-kit',
                dependencies: [{ name: 'audit-logger', marketplace: 'acme-tools' }],
              },
            ],
          }),
          filePath: '/test/.claude-plugin/marketplace.json',
        },
        // Bare-string dependency: no marketplace to cross
        {
          content: JSON.stringify({
            name: 'acme-tools',
            owner,
            plugins: [
              { name: 'deploy-kit', source: './deploy-kit', dependencies: ['audit-logger'] },
            ],
          }),
          filePath: '/test/.claude-plugin/marketplace.json',
        },
        // No dependencies
        {
          content: JSON.stringify({
            name: 'acme-tools',
            owner,
            plugins: [{ name: 'deploy-kit', source: './deploy-kit' }],
          }),
          filePath: '/test/.claude-plugin/marketplace.json',
        },
      ],
      invalid: [
        // Cross-marketplace dependency with no allowlist at all
        {
          content: JSON.stringify({
            name: 'pdugan20-plugins',
            owner,
            plugins: [
              {
                name: 'mintlify-docs',
                source: './mintlify-docs',
                dependencies: [{ name: 'mintlify', marketplace: 'claude-plugins-official' }],
              },
            ],
          }),
          filePath: '/test/.claude-plugin/marketplace.json',
          errors: [
            {
              message:
                'Dependency on marketplace "claude-plugins-official" is not allowlisted',
            },
          ],
        },
        // Allowlist present but missing this marketplace
        {
          content: JSON.stringify({
            name: 'acme-tools',
            owner,
            allowCrossMarketplaceDependenciesOn: ['some-other'],
            plugins: [
              {
                name: 'deploy-kit',
                source: './deploy-kit',
                dependencies: [{ name: 'audit-logger', marketplace: 'acme-shared' }],
              },
            ],
          }),
          filePath: '/test/.claude-plugin/marketplace.json',
          errors: [{ message: 'Dependency on marketplace "acme-shared" is not allowlisted' }],
        },
      ],
    });
  });
});
