import { readFileSync } from 'fs';
import { join } from 'path';
import { WATCHLIST } from '../../src/upstream/watchlist';
import { rule as directory } from '../../src/rules/commands/commands-deprecated-directory';
import { rule as plugin } from '../../src/rules/plugin/plugin-commands-deprecated';

// The commands page catalogs built-in slash commands. These two migration advisories
// are instead governed by the already-watched skills and plugin references.
describe('legacy command documentation authority', () => {
  it('retains upstream evidence that legacy command files and plugin paths work', () => {
    const skills = readFileSync(join(__dirname, '../../docs-baseline/skills.md'), 'utf8');
    const plugins = readFileSync(
      join(__dirname, '../../docs-baseline/plugins-reference.md'),
      'utf8'
    );
    expect(WATCHLIST.map((entry) => entry.id)).toEqual(
      expect.arrayContaining(['skills', 'plugins-reference'])
    );
    expect(skills).toMatch(/Your existing `\.claude\/commands\/` files keep working/);
    expect(plugins).toMatch(/\| `commands`\s*\| string\\\|array\s*\| Custom flat/);
  });
  it.each([directory, plugin])('keeps $meta.id an optional supported-format advisory', (rule) => {
    expect(rule.meta.severity).toBe('warn');
    expect(rule.meta.docs?.details).toMatch(/remains? supported/);
    expect(rule.meta.docs?.rationale).not.toMatch(/deprecated|no longer/);
  });
});
