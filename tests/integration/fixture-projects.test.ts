/**
 * Fixture Project Integration Tests
 *
 * Runs `claudelint check-all` against pre-built fixture projects to validate
 * the full pipeline: file discovery -> parsing -> validation -> reporting.
 *
 * - valid-complete: All 10 config types present and valid. Expects zero issues.
 * - invalid-all-categories: Intentional errors in every category. Expects errors from all 10 validators.
 *
 * Forward-compatibility: Error and warning counts are pinned. If a new rule is added
 * and fires against these fixtures, the pinned counts will change and this test will
 * fail — forcing an intentional update. This prevents silent test pollution.
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

    // Pinned counts -- update intentionally when adding new rules or fixture content
    it('should report expected error count', () => {
      expect(result.stdout).toContain('Total errors: 29');
    });

    it('should report expected warning count', () => {
      expect(result.stdout).toContain('Total warnings: 20');
    });

    // Per-category rule ID assertions (specific, not vague)
    it('should detect errors in CLAUDE.md', () => {
      expect(result.stdout).toContain('claude-md-import-missing');
    });

    it('should detect errors in skills', () => {
      expect(result.stdout).toContain('skill-name');
      expect(result.stdout).toContain('skill-description');
      expect(result.stdout).toContain('skill-name-directory-mismatch');
      expect(result.stdout).toContain('skill-agent');
      expect(result.stdout).toContain('skill-allowed-tools');
    });

    it('should detect warnings in skills', () => {
      expect(result.stdout).toContain('skill-missing-version');
      expect(result.stdout).toContain('skill-missing-examples');
      expect(result.stdout).toContain('skill-missing-changelog');
      expect(result.stdout).toContain('skill-frontmatter-unknown-keys');
      expect(result.stdout).toContain('skill-missing-shebang');
    });

    it('should detect errors in agents', () => {
      expect(result.stdout).toContain('agent-name-directory-mismatch');
      expect(result.stdout).toContain('agent-description');
      expect(result.stdout).toContain('agent-tools');
    });

    it('should detect warnings in agents', () => {
      expect(result.stdout).toContain('agent-body-too-short');
      expect(result.stdout).toContain('agent-missing-system-prompt');
    });

    it('should detect errors in output styles', () => {
      expect(result.stdout).toContain('output-style-name-directory-mismatch');
    });

    it('should detect warnings in output styles', () => {
      expect(result.stdout).toContain('output-style-missing-guidelines');
      expect(result.stdout).toContain('output-style-body-too-short');
    });

    it('should detect errors in LSP config', () => {
      expect(result.stdout).toContain('Invalid key in record');
      expect(result.stdout).toContain('Language ID cannot be empty');
    });

    it('should detect errors in settings', () => {
      expect(result.stdout).toContain('settings-invalid-permission');
      expect(result.stdout).toContain('settings-permission-invalid-rule');
    });

    it('should detect warnings in settings', () => {
      expect(result.stdout).toContain('settings-invalid-env-var');
      expect(result.stdout).toContain('settings-permission-empty-pattern');
    });

    it('should detect errors in hooks', () => {
      expect(result.stdout).toContain('hooks-invalid-config');
    });

    it('should detect warnings in hooks', () => {
      expect(result.stdout).toContain('hooks-invalid-event');
    });

    it('should detect errors in MCP config', () => {
      expect(result.stdout).toContain('MCP Validator');
      expect(result.stdout).toContain('bad-transport');
    });

    it('should detect errors in plugin manifest', () => {
      expect(result.stdout).toContain('expected string, received undefined');
      expect(result.stdout).toContain('Must be valid semantic version');
    });

    it('should detect warnings for deprecated commands', () => {
      expect(result.stdout).toContain('commands-deprecated-directory');
      expect(result.stdout).toContain('commands-migrate-to-skills');
    });
  });
});
