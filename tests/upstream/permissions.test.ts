import { readFileSync } from 'fs';
import { join } from 'path';
import {
  extractPermissionRules,
  checkPermissionExamples,
  MIN_PERMISSION_EXAMPLES,
} from '../../scripts/upstream/permissions';

const markdown = readFileSync(join(__dirname, '../../docs-baseline/permissions.md'), 'utf8');

describe('permission semantic conformance', () => {
  it('extracts real positive examples and runs them through both settings scopes', async () => {
    const facts = extractPermissionRules(markdown);
    expect(facts.length).toBeGreaterThanOrEqual(MIN_PERMISSION_EXAMPLES);
    expect(facts).toContain('permission-rule:["deny","mcp__*"]');
    expect(facts).toContain('permission-rule:["allow","PowerShell(Get-ChildItem *)"]');
    await expect(checkPermissionExamples(facts)).resolves.toEqual([]);
  });

  it('rejects a missing example source rather than passing vacuously', async () => {
    await expect(checkPermissionExamples([])).rejects.toThrow('expected >=');
  });

  it('detects an unsupported documented example through actual rules in both scopes', async () => {
    const findings = await checkPermissionExamples([
      ...extractPermissionRules(markdown),
      'permission-rule:["allow","ImaginaryTool"]',
    ]);
    expect(findings).toHaveLength(2);
    expect(
      findings.some((value) => value.includes('settings.json: settings-invalid-permission'))
    ).toBe(true);
    expect(
      findings.some((value) => value.includes('settings.local.json: settings-invalid-permission'))
    ).toBe(true);
  });

  it.each([
    { permissions: null },
    { permissions: { allow: 'Bash' } },
    { permissions: { deny: [42] } },
  ])('does not silently drop a malformed source example', (config) => {
    expect(() => extractPermissionRules('```json\n' + JSON.stringify(config) + '\n```')).toThrow(
      'Malformed permissions'
    );
  });

  it('extracts only rule/example tables and preserves literal parentheses', () => {
    const source = [
      '| Rule | Matches |',
      '| :--- | :--- |',
      '| `Read(./Finance (2024)/**)` | Folder |',
      '',
      '| Unrelated | Description |',
      '| --- | --- |',
      '| `Bogus` | Other field |',
      '',
      '```json',
      '{"permissions":{"ask":["*"],"allow":["Bash"]}}',
      '```',
    ].join('\n');
    expect(extractPermissionRules(source)).toEqual([
      'permission-rule:["allow","Bash"]',
      'permission-rule:["ask","*"]',
      'permission-rule:["deny","Read(./Finance (2024)/**)"]',
    ]);
  });
});
