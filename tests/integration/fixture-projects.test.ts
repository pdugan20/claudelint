/**
 * Fixture Project Integration Tests
 *
 * Runs `claudelint check-all` against pre-built fixture projects to validate
 * the full pipeline: file discovery -> parsing -> validation -> reporting.
 *
 * - valid-complete: All 10 config types present and valid. Expects zero issues.
 * - invalid-all-categories: Intentional errors in every category. Expects errors from all 10 validators.
 */

import { execSync } from 'child_process';
import { join } from 'path';

const projectRoot = join(__dirname, '../..');
const claudelintBin = join(projectRoot, 'bin/claudelint');
const fixturesDir = join(projectRoot, 'tests/fixtures/projects');

/** Timeout for CLI subprocess execution (ms) */
const CLI_TIMEOUT = 60_000;

function runClaudelint(fixturePath: string): { stdout: string; exitCode: number } {
  try {
    const stdout = execSync(`${claudelintBin} check-all --no-cache`, {
      cwd: fixturePath,
      encoding: 'utf-8',
      timeout: CLI_TIMEOUT,
    });
    return { stdout, exitCode: 0 };
  } catch (error: unknown) {
    const execError = error as {
      stdout?: string;
      stderr?: string;
      status?: number | null;
      killed?: boolean;
      signal?: string;
    };

    // Detect timeout kills -- fail fast with clear message
    if (execError.killed || execError.signal === 'SIGTERM') {
      throw new Error(
        `CLI process was killed (signal: ${execError.signal}). ` +
          `This usually means the ${CLI_TIMEOUT}ms timeout was exceeded under heavy load.`
      );
    }

    return {
      stdout: execError.stdout || execError.stderr || '',
      exitCode: execError.status ?? 1,
    };
  }
}

describe('Fixture Project Integration Tests', () => {
  describe('valid-complete', () => {
    const fixturePath = join(fixturesDir, 'valid-complete');
    let result: { stdout: string; exitCode: number };

    beforeAll(() => {
      result = runClaudelint(fixturePath);
    });

    it('should exit 0', () => {
      expect(result.exitCode).toBe(0);
    });

    it('should produce zero errors and zero warnings', () => {
      expect(result.stdout).toContain('Total errors: 0');
      expect(result.stdout).toContain('Total warnings: 0');
    });

    it('should validate all 10 config categories', () => {
      expect(result.stdout).toContain('CLAUDE.md Validator');
      expect(result.stdout).toContain('Skills Validator');
      expect(result.stdout).toContain('Agents Validator');
      expect(result.stdout).toContain('Output Styles Validator');
      expect(result.stdout).toContain('LSP Validator');
      expect(result.stdout).toContain('Settings Validator');
      expect(result.stdout).toContain('Hooks Validator');
      expect(result.stdout).toContain('MCP Validator');
      expect(result.stdout).toContain('Plugin Validator');
      expect(result.stdout).toContain('Commands Validator');
    });
  });

  describe('invalid-all-categories', () => {
    const fixturePath = join(fixturesDir, 'invalid-all-categories');
    let result: { stdout: string; exitCode: number };

    beforeAll(() => {
      result = runClaudelint(fixturePath);
    });

    it('should exit 1', () => {
      expect(result.exitCode).toBe(1);
    });

    it('should detect errors in CLAUDE.md', () => {
      expect(result.stdout).toContain('claude-md-import-missing');
    });

    it('should detect errors in skills', () => {
      expect(result.stdout).toContain('skill-name');
      expect(result.stdout).toContain('skill-description');
    });

    it('should detect errors in agents', () => {
      expect(result.stdout).toContain('agent-name-directory-mismatch');
      expect(result.stdout).toContain('agent-description');
    });

    it('should detect errors in output styles', () => {
      expect(result.stdout).toContain('output-style-name-directory-mismatch');
    });

    it('should detect errors in LSP config', () => {
      expect(result.stdout).toContain('LSP Validator');
      expect(result.stdout).toContain('Invalid');
    });

    it('should detect errors in settings', () => {
      expect(result.stdout).toContain('settings-invalid-permission');
      expect(result.stdout).toContain('settings-invalid-env-var');
    });

    it('should detect errors in hooks', () => {
      expect(result.stdout).toContain('Hooks Validator');
      expect(result.stdout).toContain('Invalid option');
    });

    it('should detect errors in MCP config', () => {
      expect(result.stdout).toContain('MCP Validator');
      expect(result.stdout).toContain('Invalid input');
    });

    it('should detect errors in plugin manifest', () => {
      expect(result.stdout).toContain('Plugin Validator');
      expect(result.stdout).toContain('expected string, received undefined');
    });

    it('should detect warnings for deprecated commands', () => {
      expect(result.stdout).toContain('commands-deprecated-directory');
    });
  });
});
