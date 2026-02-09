import { CompactFormatter } from '../../../src/api/formatters/compact';
import { LintResult } from '../../../src/api/types';

describe('CompactFormatter', () => {
  const formatter = new CompactFormatter();

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

  it('should format an error with location', () => {
    const results: LintResult[] = [
      {
        filePath: '/path/to/file.md',
        messages: [
          {
            ruleId: 'claude-md-size-error',
            severity: 'error',
            message: 'File too large',
            line: 10,
            column: 5,
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

    expect(output).toBe('/path/to/file.md:10:5: Error - File too large (claude-md-size-error)\n');
  });

  it('should format a warning without column', () => {
    const results: LintResult[] = [
      {
        filePath: '/file.md',
        messages: [
          {
            ruleId: null,
            severity: 'warning',
            message: 'Minor issue',
            line: 3,
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

    expect(output).toBe('/file.md:3:0: Warning - Minor issue\n');
  });

  it('should format a message without location', () => {
    const results: LintResult[] = [
      {
        filePath: '/file.md',
        messages: [
          {
            ruleId: null,
            severity: 'error',
            message: 'General error',
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

    expect(output).toBe('/file.md: Error - General error\n');
  });

  it('should format multiple messages across multiple files', () => {
    const results: LintResult[] = [
      {
        filePath: '/a.md',
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
        filePath: '/b.md',
        messages: [
          { ruleId: null, severity: 'error', message: 'Error 2', line: 5 },
        ],
        suppressedMessages: [],
        errorCount: 1,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
      },
    ];

    const output = formatter.format(results);
    const lines = output.trim().split('\n');

    expect(lines).toHaveLength(3);
    expect(lines[0]).toContain('/a.md');
    expect(lines[1]).toContain('/a.md');
    expect(lines[2]).toContain('/b.md');
  });
});
