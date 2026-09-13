import { ClaudeLintRuleTester } from '../helpers/rule-tester';
import { rule as names } from '../../src/rules/settings/settings-invalid-permission';
import { rule as syntax } from '../../src/rules/settings/settings-permission-invalid-rule';
import { rule as empty } from '../../src/rules/settings/settings-permission-empty-pattern';
import { rule as env } from '../../src/rules/settings/settings-invalid-env-var';
import { rule as paths } from '../../src/rules/settings/settings-file-path-not-found';

const tester = new ClaudeLintRuleTester();

describe.each(['settings.json', 'settings.local.json'])('%s semantics', (filename) => {
  const filePath = `/test/.claude/${filename}`;

  it.each([
    {
      rule: names,
      value: { permissions: { allow: ['Bassh(npm run build)'] } },
      message: 'Invalid tool name',
    },
    { rule: syntax, value: { permissions: { deny: ['Bash(missing'] } }, message: 'Invalid syntax' },
    { rule: empty, value: { permissions: { ask: ['Read()'] } }, message: 'Empty inline pattern' },
    { rule: env, value: { env: { EMPTY: '' } }, message: 'Empty value' },
    {
      rule: paths,
      value: { apiKeyHelper: '/missing/claudelint-test-helper.sh' },
      message: 'file not found',
    },
  ])('runs $rule.meta.id', async ({ rule, value, message }) => {
    await tester.run(rule.meta.id, rule, {
      valid: [],
      invalid: [{ filePath, content: JSON.stringify(value), errors: [{ message }] }],
    });
  });

  it.each([names, syntax, empty, env])(
    'does not crash on malformed raw containers ($meta.id)',
    async (rule) => {
      await tester.run(rule.meta.id, rule, {
        valid: [
          null,
          [],
          { permissions: null },
          { permissions: { allow: 42, deny: [null, 1, {}] } },
          { env: [null] },
          { env: { BROKEN: null, NUMBER: 4 } },
        ].map((value) => ({ filePath, content: JSON.stringify(value) })),
        invalid: [],
      });
    }
  );

  it('accepts documented literal parentheses, globs and Cd permission targets', async () => {
    const content = JSON.stringify({
      permissions: {
        allow: ['Read(./Finance (2024)/**)', 'Bash(echo "(")', 'mcp__github__get_*'],
        deny: ['*', 'B*', 'mcp__*', 'Cd(./private/**)'],
        ask: ['*', 'mcp__*'],
      },
    });
    for (const rule of [names, syntax, empty]) {
      await tester.run(rule.meta.id, rule, { valid: [{ filePath, content }], invalid: [] });
    }
  });

  it('rejects unanchored allow globs and MCP specifiers in settings', async () => {
    await tester.run(names.meta.id, names, {
      valid: [],
      invalid: ['*', 'B*', 'mcp__*', 'mcp__server*__tool'].map((name) => ({
        filePath,
        content: JSON.stringify({ permissions: { allow: [name] } }),
        errors: [{ message: 'Invalid tool name' }],
      })),
    });
    await tester.run(syntax.meta.id, syntax, {
      valid: [],
      invalid: ['allow', 'deny', 'ask'].map((list) => ({
        filePath,
        content: JSON.stringify({ permissions: { [list]: [' mcp__server__tool(value)'] } }),
        errors: [{ message: 'MCP permission specifiers are ignored' }],
      })),
    });
  });
});
