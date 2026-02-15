import { toGitHub } from '../../src/utils/reporting/github';
import { ValidationResult } from '../../src/validators/file-validator';

describe('toGitHub', () => {
  it('should return empty string for no issues', () => {
    const results = [
      {
        validator: 'Test',
        result: { errors: [], warnings: [], valid: true } as ValidationResult,
      },
    ];

    expect(toGitHub(results)).toBe('');
  });

  it('should format errors as ::error annotations', () => {
    const results = [
      {
        validator: 'CLAUDE.md Validator',
        result: {
          errors: [
            {
              message: 'File exceeds size limit',
              file: 'CLAUDE.md',
              line: 1,
              severity: 'error' as const,
              ruleId: 'claude-md-size' as const,
            },
          ],
          warnings: [],
          valid: false,
        } as ValidationResult,
      },
    ];

    const output = toGitHub(results);

    expect(output).toBe(
      '::error file=CLAUDE.md,line=1,title=claude-md-size::File exceeds size limit'
    );
  });

  it('should format warnings as ::warning annotations', () => {
    const results = [
      {
        validator: 'Settings',
        result: {
          errors: [],
          warnings: [
            {
              message: 'Invalid env var name',
              file: '.claude/settings.json',
              line: 5,
              severity: 'warning' as const,
              ruleId: 'settings-invalid-env-var' as const,
            },
          ],
          valid: true,
        } as ValidationResult,
      },
    ];

    const output = toGitHub(results);

    expect(output).toBe(
      '::warning file=.claude/settings.json,line=5,title=settings-invalid-env-var::Invalid env var name'
    );
  });

  it('should handle issues without file path', () => {
    const results = [
      {
        validator: 'Test',
        result: {
          errors: [
            {
              message: 'General error',
              severity: 'error' as const,
            },
          ],
          warnings: [],
          valid: false,
        } as ValidationResult,
      },
    ];

    const output = toGitHub(results);

    expect(output).toBe('::error title=error::General error');
  });

  it('should handle issues without ruleId', () => {
    const results = [
      {
        validator: 'Test',
        result: {
          errors: [
            {
              message: 'Unknown error',
              file: 'file.md',
              severity: 'error' as const,
            },
          ],
          warnings: [],
          valid: false,
        } as ValidationResult,
      },
    ];

    const output = toGitHub(results);

    expect(output).toBe('::error file=file.md,title=error::Unknown error');
  });

  it('should combine errors and warnings from multiple validators', () => {
    const results = [
      {
        validator: 'V1',
        result: {
          errors: [
            {
              message: 'Error from V1',
              file: 'a.md',
              severity: 'error' as const,
              ruleId: 'claude-md-size' as const,
            },
          ],
          warnings: [],
          valid: false,
        } as ValidationResult,
      },
      {
        validator: 'V2',
        result: {
          errors: [],
          warnings: [
            {
              message: 'Warning from V2',
              file: 'b.json',
              severity: 'warning' as const,
              ruleId: 'settings-invalid-env-var' as const,
            },
          ],
          valid: true,
        } as ValidationResult,
      },
    ];

    const output = toGitHub(results);
    const lines = output.split('\n');

    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain('::error');
    expect(lines[0]).toContain('Error from V1');
    expect(lines[1]).toContain('::warning');
    expect(lines[1]).toContain('Warning from V2');
  });

  it('should escape special characters in messages', () => {
    const results = [
      {
        validator: 'Test',
        result: {
          errors: [
            {
              message: 'Found 100% match\nin multiple lines',
              file: 'file.md',
              severity: 'error' as const,
            },
          ],
          warnings: [],
          valid: false,
        } as ValidationResult,
      },
    ];

    const output = toGitHub(results);

    expect(output).toContain('100%25');
    expect(output).toContain('%0A');
    expect(output).not.toContain('\n');
  });
});
