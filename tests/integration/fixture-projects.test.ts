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

import { spawnSync } from 'child_process';
import { join } from 'path';

const projectRoot = join(__dirname, '../..');
const claudelintBin = join(projectRoot, 'bin/claudelint');
const fixturesDir = join(projectRoot, 'tests/fixtures/projects');

/** Timeout for CLI subprocess execution (ms) */
const CLI_TIMEOUT = 60_000;

function runClaudelint(fixturePath: string): { output: string; exitCode: number } {
  const result = spawnSync(claudelintBin, ['check-all', '--no-cache'], {
    cwd: fixturePath,
    encoding: 'utf-8',
    timeout: CLI_TIMEOUT,
    maxBuffer: 10 * 1024 * 1024,
  });

  if (result.signal) {
    throw new Error(
      `CLI process was killed (signal: ${result.signal}). ` +
        `This usually means the ${CLI_TIMEOUT}ms timeout was exceeded under heavy load.`
    );
  }

  if (result.error) {
    throw result.error;
  }

  // Combine stdout and stderr for end-to-end assertions
  // (stdout has lint results, stderr has status/summary messages)
  const output = (result.output || '') + (result.stderr || '');

  return {
    output,
    exitCode: result.status ?? 1,
  };
}

describe('Fixture Project Integration Tests', () => {
  describe('valid-complete', () => {
    const fixturePath = join(fixturesDir, 'valid-complete');
    let result: { output: string; exitCode: number };

    beforeAll(() => {
      result = runClaudelint(fixturePath);
    });

    it('should exit 0', () => {
      expect(result.exitCode).toBe(0);
    });

    it('should produce zero errors and zero warnings', () => {
      expect(result.output).toContain('No problems found.');
    });

    it('should show summary line with file counts and categories', () => {
      // Summary line format: "Checked N files across M categories (...) in Xms."
      expect(result.output).toMatch(/Checked \d+ files? across \d+ categor(?:y|ies) \(/);
      expect(result.output).toMatch(/in \d+ms\./);
    });

    it('should validate all active config categories', () => {
      // With quiet success, per-validator lines are suppressed on clean runs.
      // The summary line lists all active (non-skipped) categories by validator ID.
      expect(result.output).toMatch(/across \d+ categor(?:y|ies) \(/);
      expect(result.output).toContain('claude-md');
      expect(result.output).toContain('skills');
      expect(result.output).toContain('agents');
      expect(result.output).toContain('output-styles');
      expect(result.output).toContain('lsp');
      expect(result.output).toContain('settings');
      expect(result.output).toContain('hooks');
      expect(result.output).toContain('mcp');
      expect(result.output).toContain('plugin');
    });
  });

  describe('invalid-all-categories', () => {
    const fixturePath = join(fixturesDir, 'invalid-all-categories');
    let result: { output: string; exitCode: number };

    beforeAll(() => {
      result = runClaudelint(fixturePath);
    });

    it('should exit 1', () => {
      expect(result.exitCode).toBe(1);
    });

    // Pinned counts -- update intentionally when adding new rules or fixture content
    it('should report expected error count', () => {
      expect(result.output).toContain('25 errors');
    });

    it('should report expected warning count', () => {
      expect(result.output).toContain('34 warnings');
    });

    it('should show summary line with problem count', () => {
      // ESLint-style summary: "N problems (X errors, Y warnings)"
      expect(result.output).toMatch(/\d+ problems? \(\d+ errors?, \d+ warnings?\)/);
    });

    // Per-category rule ID assertions (specific, not vague)
    it('should detect errors in CLAUDE.md', () => {
      expect(result.output).toContain('claude-md-import-missing');
    });

    it('should detect errors in skills', () => {
      expect(result.output).toContain('skill-name');
      expect(result.output).toContain('skill-description');
      expect(result.output).toContain('skill-name-directory-mismatch');
      expect(result.output).toContain('skill-agent');
      expect(result.output).toContain('skill-allowed-tools');
    });

    it('should detect warnings in skills', () => {
      expect(result.output).toContain('skill-missing-version');
      expect(result.output).toContain('skill-missing-examples');
      expect(result.output).toContain('skill-missing-changelog');
      expect(result.output).toContain('skill-frontmatter-unknown-keys');
      expect(result.output).toContain('skill-missing-shebang');
      expect(result.output).toContain('skill-description-missing-trigger');
      expect(result.output).toContain('skill-arguments-without-hint');
      expect(result.output).toContain('skill-side-effects-without-disable-model');
      expect(result.output).toContain('skill-body-missing-usage-section');
      expect(result.output).toContain('skill-shell-script-no-error-handling');
      expect(result.output).toContain('skill-shell-script-hardcoded-paths');
      expect(result.output).toContain('skill-description-quality');
      expect(result.output).toContain('skill-allowed-tools-not-used');
      expect(result.output).toContain('skill-mcp-tool-qualified-name');
    });

    it('should detect security errors in skills', () => {
      expect(result.output).toContain('skill-hardcoded-secrets');
    });

    it('should detect errors in agents', () => {
      expect(result.output).toContain('agent-name-filename-mismatch');
      expect(result.output).toContain('agent-description');
      expect(result.output).toContain('agent-tools');
      expect(result.output).toContain('agent-skills-not-found');
    });

    it('should detect warnings in agents', () => {
      expect(result.output).toContain('agent-body-too-short');
    });

    it('should detect errors in output styles', () => {
      expect(result.output).toContain('output-style-name-directory-mismatch');
    });

    it('should detect warnings in output styles', () => {
      expect(result.output).toContain('output-style-missing-guidelines');
      expect(result.output).toContain('output-style-body-too-short');
    });

    it('should detect errors in LSP config', () => {
      expect(result.output).toContain('Invalid key in record');
      expect(result.output).toContain('Language ID cannot be empty');
    });

    it('should detect errors in settings', () => {
      expect(result.output).toContain('settings-invalid-permission');
      expect(result.output).toContain('settings-permission-invalid-rule');
    });

    it('should detect warnings in settings', () => {
      expect(result.output).toContain('settings-invalid-env-var');
      expect(result.output).toContain('settings-permission-empty-pattern');
    });

    it('should detect errors in hooks', () => {
      expect(result.output).toContain('hooks-invalid-config');
    });

    it('should detect warnings in hooks', () => {
      expect(result.output).toContain('hooks-invalid-event');
    });

    it('should detect errors in MCP config', () => {
      expect(result.output).toContain('mcp');
      expect(result.output).toContain('bad-transport');
    });

    it('should detect errors in plugin manifest', () => {
      expect(result.output).toContain('expected string, received undefined');
      expect(result.output).toContain('Invalid semantic version format');
    });

    it('should detect warnings for deprecated commands', () => {
      expect(result.output).toContain('commands-deprecated-directory');
      expect(result.output).toContain('commands-migrate-to-skills');
    });
  });

  describe('custom-rules-violation', () => {
    const fixturePath = join(fixturesDir, 'custom-rules-violation');
    let result: { output: string; exitCode: number };

    beforeAll(() => {
      result = runClaudelint(fixturePath);
    });

    it('should exit 0 (custom rule is warn-level)', () => {
      expect(result.exitCode).toBe(0);
    });

    it('should load the custom rule', () => {
      // The custom rule must have loaded and executed (not silently skipped)
      expect(result.output).toContain('require-commands-section');
    });

    it('should report the custom rule violation', () => {
      expect(result.output).toContain('Missing ## Commands section');
    });

    it('should report exactly 1 warning', () => {
      expect(result.output).toMatch(/1 problem.*0 errors.*1 warning/);
    });
  });
});
