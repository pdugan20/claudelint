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
