/**
 * Tests for stdin support
 */

import { spawnSync } from 'child_process';
import { join } from 'path';

// Import validators for VirtualFile/stdin tests
import '../../src/validators';
import { ValidatorRegistry } from '../../src/utils/validators/factory';

const claudelintBin = join(__dirname, '../../bin/claudelint');

describe('stdin support', () => {
  describe('--stdin and --stdin-filename flags', () => {
    it('--stdin and --stdin-filename appear in help', () => {
      const result = spawnSync('node', [claudelintBin, 'check-all', '--help'], {
        encoding: 'utf-8',
      });
      const output = result.stdout + result.stderr;
      expect(output).toContain('--stdin');
      expect(output).toContain('--stdin-filename');
    });
  });

  describe('stdin with CLAUDE.md content', () => {
    it('validates piped CLAUDE.md content', () => {
      const content = '# CLAUDE.md\n\nSome instructions for Claude.\n';
      const result = spawnSync(
        'node',
        [claudelintBin, '--stdin', '--stdin-filename', 'CLAUDE.md', '--format', 'json'],
        {
          input: content,
          encoding: 'utf-8',
        }
      );

      // Should produce valid JSON output (or at least not crash)
      const output = result.stdout + result.stderr;
      expect(output).not.toContain('No validator matches');
    });

    it('validates piped CLAUDE.md via --format json', () => {
      const content = '# Project\n\nBuild with `npm run build`.\n';
      const result = spawnSync(
        'node',
        [claudelintBin, '--stdin', '--stdin-filename', 'CLAUDE.md', '--format', 'json'],
        {
          input: content,
          encoding: 'utf-8',
        }
      );

      // Output should contain JSON
      const output = result.stdout;
      if (output.trim()) {
        expect(() => JSON.parse(output)).not.toThrow();
      }
    });
  });

  describe('stdin with unknown filename', () => {
    it('shows error for unrecognized filename', () => {
      const result = spawnSync(
        'node',
        [claudelintBin, '--stdin', '--stdin-filename', 'unknown-file.xyz'],
        {
          input: 'some content',
          encoding: 'utf-8',
        }
      );

      const output = result.stdout + result.stderr;
      expect(output).toContain('No validator matches');
      expect(result.status).toBe(2);
    });
  });

  describe('validator file pattern matching', () => {
    it('claude-md validator matches CLAUDE.md', () => {
      const meta = ValidatorRegistry.getAllMetadata().find((m) => m.id === 'claude-md');
      expect(meta).toBeDefined();
      expect(meta!.filePatterns).toContain('**/CLAUDE.md');
    });

    it('settings validator matches .claude/settings.json', () => {
      const meta = ValidatorRegistry.getAllMetadata().find((m) => m.id === 'settings');
      expect(meta).toBeDefined();
      expect(meta!.filePatterns).toContain('**/.claude/settings.json');
    });
  });

  describe('VirtualFile support in validators', () => {
    it('ClaudeMdValidator accepts stdinContent', async () => {
      const { ClaudeMdValidator } = await import('../../src/validators/claude-md');
      const validator = new ClaudeMdValidator({
        stdinContent: '# CLAUDE.md\n\nInstructions here.\n',
        stdinFilename: 'CLAUDE.md',
      });

      const result = await validator.validate();
      // Should complete validation without trying to read from disk
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
    });
  });
});

/**
 * Regressions: stdin mode used to lint the wrong thing, or nothing at all.
 *
 * Each case here piped VALID-looking content and got a misleading result, because the
 * validator either could not be matched or ignored the piped content and read the disk.
 * Assert BEHAVIOR (a finding about the piped document), never just an exit code.
 */
describe('stdin lints the piped document, not the filesystem', () => {
  function pipe(filename: string, content: string) {
    const result = spawnSync(
      'node',
      [claudelintBin, 'check-all', '--stdin', '--stdin-filename', filename],
      { encoding: 'utf-8', input: content }
    );
    return result.stdout + result.stderr;
  }

  it('matches a plugin manifest at its canonical dot-directory path', () => {
    // minimatch's `**` will not cross a dot-directory without `{ dot: true }`, so the plugin
    // validator's `**/plugin.json` never matched `.claude-plugin/plugin.json` and this
    // printed "No validator matches filename".
    const output = pipe(
      '.claude-plugin/plugin.json',
      '{"name":"demo","version":"not-semver","description":"A demo plugin for testing."}'
    );

    expect(output).not.toContain('No validator matches');
    expect(output).toContain('Invalid semantic version format');
  });

  it('runs RULES against the piped content, not against the file on disk', () => {
    // The settings validator re-read `filePath` from disk inside validateSemantics, so the
    // schema saw the piped content while the rules saw whatever was on disk at that path --
    // a blend of two documents, or an ENOENT when nothing was there.
    const output = pipe('.claude/settings.json', '{"permissions":{"defaultMode":"bogus-mode"}}');

    expect(output).toContain('defaultMode');
    expect(output).not.toContain('ENOENT');
  });

  it('validates a piped agent (validator used to ignore stdin and glob the filesystem)', () => {
    const output = pipe(
      '.claude/agents/demo.md',
      '---\nname: demo\ndescription: Short\n---\n\nBody.\n'
    );

    expect(output).toContain('agent-description');
  });

  it('validates a piped SKILL.md without requiring the directory to exist on disk', () => {
    const output = pipe(
      '.claude/skills/demo/SKILL.md',
      '---\nname: NOT_KEBAB\ndescription: Formats currency values for display in reports.\n---\n\n## Usage\n\nx\n'
    );

    expect(output).not.toContain('SKILL.md not found');
    expect(output).toContain('skill-name');
  });
});

/**
 * The stdin path computed its own exit code and consulted neither --strict nor
 * --max-warnings, so piped content printed its problems and still exited 0 -- which made
 * --stdin unusable as a CI or pre-commit gate.
 *
 * `--rule` pins the severity so these assertions do not depend on the ambient config.
 */
describe('stdin honors enforcement flags when setting the exit code', () => {
  const WARNING_CONTENT =
    '---\nname: demo\ndescription: Demonstrates the stdin exit-code path with a description long enough to pass.\n---\n\n# Demo\n\n## Howdy\n\nNo usage section here.\n';

  function run(args: string[]) {
    return spawnSync(
      'node',
      [
        claudelintBin,
        'check-all',
        '--stdin',
        '--stdin-filename',
        '.claude/skills/demo/SKILL.md',
        '--rule',
        'skill-body-missing-usage-section:warn',
        ...args,
      ],
      { encoding: 'utf-8', input: WARNING_CONTENT }
    );
  }

  it('reports the warning and exits 0 without enforcement flags', () => {
    const result = run([]);

    expect(result.stdout + result.stderr).toContain('skill-body-missing-usage-section');
    expect(result.status).toBe(0);
  });

  it('exits 1 on a warning under --strict', () => {
    const result = run(['--strict']);

    expect(result.stdout + result.stderr).toContain('skill-body-missing-usage-section');
    expect(result.status).toBe(1);
  });

  it('exits 1 when --max-warnings is exceeded', () => {
    const result = run(['--max-warnings', '0']);

    expect(result.stdout + result.stderr).toContain('Warning limit exceeded');
    expect(result.status).toBe(1);
  });
});
