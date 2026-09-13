import { execFileSync } from 'child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';

const root = resolve(__dirname, '../..');

/** Exercise the emitted Node modules without Jest's module transforms or mocks. */
function run(code: string, args: string[] = []): string {
  return execFileSync(process.execPath, ['-e', code, ...args], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, FORCE_COLOR: '0' },
  });
}

describe('built runtime dependencies', () => {
  it('preserves unified fix previews without writing during a dry run', () => {
    const directory = mkdtempSync(join(tmpdir(), 'claudelint-diff-'));
    const file = join(directory, 'example.md');
    writeFileSync(file, 'before\n');
    try {
      const result = JSON.parse(
        run(
          `
        const { Fixer } = require('./dist/utils/rules/fixer.js');
        const fixer = new Fixer({ dryRun: true });
        fixer.registerFix({ filePath: process.argv[1], ruleId: 'test-rule',
          description: 'replace text', range: [0, 6], text: 'after' });
        console.log(JSON.stringify(fixer.applyFixes()));
      `,
          [file]
        )
      );
      expect(result.fixesApplied).toBe(1);
      expect(result.diff.split(file).join('example.md')).toBe(
        'Index: example.md\n' +
          '===================================================================\n' +
          '--- example.md\toriginal\n+++ example.md\tfixed\n' +
          '@@ -1,1 +1,1 @@\n-before\n+after\n'
      );
      expect(readFileSync(file, 'utf8')).toBe('before\n');
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('loads CommonJS and ESM formatters from paths containing URL characters', () => {
    const directory = mkdtempSync(join(tmpdir(), 'claudelint # formatter '));
    try {
      const cjs = join(directory, 'custom %.cjs');
      const esm = join(directory, 'custom %.mjs');
      writeFileSync(cjs, 'module.exports = { format: () => "commonjs" };');
      writeFileSync(esm, 'export default { format: () => "esm" };');
      expect(
        run(
          `
        const { loadFormatter } = require('./dist/api/formatter.js');
        (async () => {
          for (const file of process.argv.slice(1)) {
            const formatter = await loadFormatter(file);
            console.log(await formatter.format([]));
          }
        })().catch(error => { console.error(error); process.exitCode = 1; });
      `,
          [cjs, esm]
        )
      ).toBe('commonjs\nesm\n');
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('preserves parsed option defaults and positive/negative flags', () => {
    expect(
      run(`
      const assert = require('node:assert/strict');
      const { Command } = require('commander');
      const builders = require('./dist/cli/utils/option-builders.js');
      for (const [args, expected] of [
        [[], { cache: undefined, color: undefined, config: undefined, collapse: true }],
        [['--cache', '--color'], { cache: true, color: true, config: undefined, collapse: true }],
        [['--no-cache', '--no-color', '--no-config', '--no-collapse'],
          { cache: false, color: false, config: false, collapse: false }]
      ]) {
        const command = new Command();
        builders.addCommonOptions(command);
        builders.addOutputOptions(command);
        builders.addCacheOptions(command);
        command.parse(args, { from: 'user' });
        for (const [key, value] of Object.entries(expected)) assert.equal(command.opts()[key], value);
      }
      console.log('passed');
    `)
    ).toBe('passed\n');
  });

  it('loads the real prompt and color modules', () => {
    expect(
      run(`
      const assert = require('node:assert/strict');
      const chalk = require('chalk').default;
      const inquirer = require('inquirer').default;
      assert.equal(chalk.green('hello'), 'hello');
      assert.equal(typeof inquirer.prompt, 'function');
      console.log('passed');
    `)
    ).toBe('passed\n');
  });
});
