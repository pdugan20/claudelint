/**
 * Reporter Output Snapshot Tests
 *
 * Captures exact column alignment, spacing, and formatting of reporter output.
 * Any formatting regression causes the snapshot to fail.
 */

import { Reporter } from '../../src/utils/reporting/reporting';
import { ValidationResult } from '../../src/validators/file-validator';

describe('Reporter snapshot', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  function captureOutput(fn: () => void): string {
    fn();
    return consoleLogSpy.mock.calls.map((args: unknown[]) => args.join(' ')).join('\n');
  }

  it('should produce stable stylish output for a mixed set of issues', () => {
    const reporter = new Reporter({ format: 'stylish', color: false });

    const result: ValidationResult = {
      errors: [
        {
          message: 'File exceeds 40KB limit (50001 bytes)',
          file: '/project/CLAUDE.md',
          severity: 'error',
          ruleId: 'claude-md-size-error',
        },
        {
          message: 'Imported file not found: config.md',
          file: '/project/CLAUDE.md',
          line: 12,
          severity: 'error',
          ruleId: 'claude-md-import-missing',
        },
        {
          message: 'Imported file not found: rules.md',
          file: '/project/CLAUDE.md',
          line: 15,
          severity: 'error',
          ruleId: 'claude-md-import-missing',
        },
        {
          message: 'Imported file not found: extra.md',
          file: '/project/CLAUDE.md',
          line: 20,
          severity: 'error',
          ruleId: 'claude-md-import-missing',
        },
      ],
      warnings: [
        {
          message: 'Too many sections (21, max 20)',
          file: '/project/CLAUDE.md',
          severity: 'warning',
          ruleId: 'claude-md-content-too-many-sections',
        },
      ],
      valid: false,
    };

    const output = captureOutput(() => reporter.report(result, 'claude-md'));
    expect(output).toMatchSnapshot();
  });

  it('should produce stable output with mixed line numbers and no-line issues', () => {
    const reporter = new Reporter({ format: 'stylish', color: false });

    const result: ValidationResult = {
      errors: [
        {
          message: 'Must contain only lowercase letters',
          file: '/project/.claude/skills/my-skill/SKILL.md',
          line: 2,
          severity: 'error',
          ruleId: 'skill-name',
        },
        {
          message: 'Description must be at least 10 characters',
          file: '/project/.claude/skills/my-skill/SKILL.md',
          severity: 'error',
          ruleId: 'skill-description',
        },
      ],
      warnings: [
        {
          message: 'Missing "## Usage" section',
          file: '/project/.claude/skills/my-skill/SKILL.md',
          line: 8,
          severity: 'warning',
          ruleId: 'skill-body-missing-usage-section',
        },
      ],
      valid: false,
    };

    const output = captureOutput(() => reporter.report(result, 'skills'));
    expect(output).toMatchSnapshot();
  });

  it('should produce stable explain mode output', () => {
    const reporter = new Reporter({ format: 'stylish', color: false, explain: true });

    const result: ValidationResult = {
      errors: [
        {
          message: 'File exceeds 40KB limit (50001 bytes)',
          file: '/project/CLAUDE.md',
          severity: 'error',
          ruleId: 'claude-md-size-error',
          explanation: 'Oversized files cause slow loading and may exceed context window limits.',
          fix: 'Split content into smaller files in .claude/rules/ and use @imports',
        },
      ],
      warnings: [
        {
          message: 'Too many sections (21, max 20)',
          file: '/project/CLAUDE.md',
          severity: 'warning',
          ruleId: 'claude-md-content-too-many-sections',
          explanation: 'A bloated CLAUDE.md is hard for both humans and AI to navigate.',
          howToFix: 'Split content into topic-specific files in .claude/rules/ directory',
        },
      ],
      valid: false,
    };

    const output = captureOutput(() => reporter.report(result, 'claude-md'));
    expect(output).toMatchSnapshot();
  });

  it('should produce stable output with collapse rows', () => {
    const reporter = new Reporter({ format: 'stylish', color: false });

    const result: ValidationResult = {
      errors: [],
      warnings: [
        {
          message: 'File reference "src/rules/" does not exist',
          file: '/project/CLAUDE.md',
          line: 10,
          severity: 'warning',
          ruleId: 'claude-md-file-reference-invalid',
        },
        {
          message: 'File reference "docs/api/" does not exist',
          file: '/project/CLAUDE.md',
          line: 20,
          severity: 'warning',
          ruleId: 'claude-md-file-reference-invalid',
        },
        {
          message: 'File reference "tests/" does not exist',
          file: '/project/CLAUDE.md',
          line: 30,
          severity: 'warning',
          ruleId: 'claude-md-file-reference-invalid',
        },
        {
          message: 'File reference "lib/" does not exist',
          file: '/project/CLAUDE.md',
          line: 40,
          severity: 'warning',
          ruleId: 'claude-md-file-reference-invalid',
        },
        {
          message: 'File reference "config/" does not exist',
          file: '/project/CLAUDE.md',
          line: 50,
          severity: 'warning',
          ruleId: 'claude-md-file-reference-invalid',
        },
      ],
      valid: true,
    };

    const output = captureOutput(() => reporter.report(result, 'claude-md'));
    expect(output).toMatchSnapshot();
  });

  it('should produce stable compact format output', () => {
    const reporter = new Reporter({ format: 'compact', color: false });

    const result: ValidationResult = {
      errors: [
        {
          message: 'Test error message',
          file: '/project/CLAUDE.md',
          line: 5,
          severity: 'error',
          ruleId: 'claude-md-size-error',
        },
      ],
      warnings: [
        {
          message: 'Test warning message',
          file: '/project/CLAUDE.md',
          line: 10,
          severity: 'warning',
          ruleId: 'claude-md-size-warning',
        },
      ],
      valid: false,
    };

    const output = captureOutput(() => reporter.report(result, 'claude-md'));
    expect(output).toMatchSnapshot();
  });

  it('should produce stable output with message truncation', () => {
    const reporter = new Reporter({ format: 'stylish', color: false });

    const longMessage =
      'This is a very long error message that exceeds the eighty character truncation limit and should be cut off with an ellipsis';

    const result: ValidationResult = {
      errors: [
        {
          message: longMessage,
          file: '/project/CLAUDE.md',
          line: 1,
          severity: 'error',
          ruleId: 'claude-md-size-error',
        },
      ],
      warnings: [],
      valid: false,
    };

    const output = captureOutput(() => reporter.report(result, 'test'));
    expect(output).toMatchSnapshot();
  });
});
