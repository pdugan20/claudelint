import { GitHubFormatter } from '../../../src/api/formatters/github';
import { LintResult } from '../../../src/api/types';

describe('GitHubFormatter', () => {
  const formatter = new GitHubFormatter();

  it('should return empty string for empty results', () => {
    expect(formatter.format([])).toBe('');
  });

  it('should return empty string for results with no messages', () => {
    const results: LintResult[] = [
      {
        filePath: '/file.md',
        messages: [],
        suppressedMessages: [],
        errorCount: 0,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
      },
    ];

    expect(formatter.format(results)).toBe('');
  });

  it('should format an error with file and line', () => {
    const results: LintResult[] = [
      {
        filePath: 'CLAUDE.md',
        messages: [
          {
            ruleId: 'claude-md-size-error',
            severity: 'error',
            message: 'File too large',
            line: 10,
            column: 1,
          },
        ],
        suppressedMessages: [],
        errorCount: 1,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
      },
    ];

    const output = formatter.format(results);

    expect(output).toBe(
      '::error file=CLAUDE.md,line=10,col=1,title=claude-md-size-error::File too large'
    );
  });

  it('should format a warning with file only (no line)', () => {
    const results: LintResult[] = [
      {
        filePath: '.claude/settings.json',
        messages: [
          {
            ruleId: 'settings-invalid-env-var',
            severity: 'warning',
            message: 'Invalid environment variable',
          },
        ],
        suppressedMessages: [],
        errorCount: 0,
        warningCount: 1,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
      },
    ];

    const output = formatter.format(results);

    expect(output).toBe(
      '::warning file=.claude/settings.json,title=settings-invalid-env-var::Invalid environment variable'
    );
  });

  it('should use severity as title when no ruleId', () => {
    const results: LintResult[] = [
      {
        filePath: 'file.md',
        messages: [
          {
            ruleId: null,
            severity: 'error',
            message: 'Something went wrong',
            line: 5,
          },
        ],
        suppressedMessages: [],
        errorCount: 1,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
      },
    ];

    const output = formatter.format(results);

    expect(output).toBe('::error file=file.md,line=5,title=error::Something went wrong');
  });

  it('should escape special characters in file paths', () => {
    const results: LintResult[] = [
      {
        filePath: 'path:with:colons,and,commas',
        messages: [
          {
            ruleId: 'test-rule',
            severity: 'error',
            message: 'Test',
          },
        ],
        suppressedMessages: [],
        errorCount: 1,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
      },
    ];

    const output = formatter.format(results);

    // Colons and commas should be escaped in property values
    expect(output).toContain('file=path%3Awith%3Acolons%2Cand%2Ccommas');
  });

  it('should escape special characters in messages', () => {
    const results: LintResult[] = [
      {
        filePath: 'file.md',
        messages: [
          {
            ruleId: null,
            severity: 'warning',
            message: 'Line 1\nLine 2\r\nWith 100% certainty',
          },
        ],
        suppressedMessages: [],
        errorCount: 0,
        warningCount: 1,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
      },
    ];

    const output = formatter.format(results);

    // Newlines and percent should be escaped in message data
    expect(output).toContain('::Line 1%0ALine 2%0D%0AWith 100%25 certainty');
  });

  it('should format multiple messages across multiple files', () => {
    const results: LintResult[] = [
      {
        filePath: 'CLAUDE.md',
        messages: [
          { ruleId: 'r1', severity: 'error', message: 'Error 1', line: 1 },
          { ruleId: 'r2', severity: 'warning', message: 'Warning 1', line: 2 },
        ],
        suppressedMessages: [],
        errorCount: 1,
        warningCount: 1,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
      },
      {
        filePath: '.claude/settings.json',
        messages: [
          { ruleId: 'r3', severity: 'error', message: 'Error 2', line: 5 },
        ],
        suppressedMessages: [],
        errorCount: 1,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
      },
    ];

    const output = formatter.format(results);
    const lines = output.split('\n');

    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe('::error file=CLAUDE.md,line=1,title=r1::Error 1');
    expect(lines[1]).toBe('::warning file=CLAUDE.md,line=2,title=r2::Warning 1');
    expect(lines[2]).toBe('::error file=.claude/settings.json,line=5,title=r3::Error 2');
  });
});
