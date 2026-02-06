/**
 * Tests for SARIF formatter
 */

import { toSarif } from '../../src/utils/reporting/sarif';
import { ValidationResult } from '../../src/validators/file-validator';

describe('SARIF Formatter', () => {
  it('should produce valid SARIF v2.1.0 structure', () => {
    const results: Array<{ validator: string; result: ValidationResult }> = [];

    const output = JSON.parse(toSarif(results, '1.0.0'));

    expect(output.$schema).toContain('sarif-schema-2.1.0');
    expect(output.version).toBe('2.1.0');
    expect(output.runs).toHaveLength(1);
    expect(output.runs[0].tool.driver.name).toBe('claudelint');
    expect(output.runs[0].tool.driver.version).toBe('1.0.0');
    expect(output.runs[0].results).toEqual([]);
    expect(output.runs[0].tool.driver.rules).toEqual([]);
  });

  it('should include errors with correct level', () => {
    const results = [
      {
        validator: 'Skills',
        result: {
          valid: false,
          errors: [
            {
              message: 'Missing shebang line',
              file: '/project/skills/deploy/deploy.sh',
              line: 1,
              severity: 'error' as const,
              ruleId: 'skill-missing-shebang' as const,
            },
          ],
          warnings: [],
        },
      },
    ];

    const output = JSON.parse(toSarif(results, '1.0.0'));

    expect(output.runs[0].results).toHaveLength(1);
    const result = output.runs[0].results[0];
    expect(result.ruleId).toBe('skill-missing-shebang');
    expect(result.level).toBe('error');
    expect(result.message.text).toBe('Missing shebang line');
    expect(result.locations).toHaveLength(1);
    expect(result.locations[0].physicalLocation.region.startLine).toBe(1);
  });

  it('should include warnings with correct level', () => {
    const results = [
      {
        validator: 'Skills',
        result: {
          valid: true,
          errors: [],
          warnings: [
            {
              message: 'Body exceeds 500 lines',
              file: '/project/skills/deploy/SKILL.md',
              severity: 'warning' as const,
              ruleId: 'skill-body-too-long' as const,
            },
          ],
        },
      },
    ];

    const output = JSON.parse(toSarif(results, '1.0.0'));

    expect(output.runs[0].results).toHaveLength(1);
    const result = output.runs[0].results[0];
    expect(result.level).toBe('warning');
    expect(result.ruleId).toBe('skill-body-too-long');
  });

  it('should register unique rules in driver.rules', () => {
    const results = [
      {
        validator: 'Skills',
        result: {
          valid: false,
          errors: [
            {
              message: 'Error 1',
              severity: 'error' as const,
              ruleId: 'skill-name' as const,
            },
            {
              message: 'Error 2',
              severity: 'error' as const,
              ruleId: 'skill-name' as const,
            },
          ],
          warnings: [
            {
              message: 'Warn 1',
              severity: 'warning' as const,
              ruleId: 'skill-description' as const,
            },
          ],
        },
      },
    ];

    const output = JSON.parse(toSarif(results, '1.0.0'));

    // 2 unique rules, not 3
    expect(output.runs[0].tool.driver.rules).toHaveLength(2);
    expect(output.runs[0].tool.driver.rules.map((r: { id: string }) => r.id)).toEqual([
      'skill-name',
      'skill-description',
    ]);
    // 3 results total
    expect(output.runs[0].results).toHaveLength(3);
  });

  it('should handle results from multiple validators', () => {
    const results = [
      {
        validator: 'Skills',
        result: {
          valid: false,
          errors: [
            {
              message: 'Skill error',
              severity: 'error' as const,
              ruleId: 'skill-name' as const,
            },
          ],
          warnings: [],
        },
      },
      {
        validator: 'CLAUDE.md',
        result: {
          valid: false,
          errors: [
            {
              message: 'Size error',
              severity: 'error' as const,
              ruleId: 'claude-md-size-error' as const,
            },
          ],
          warnings: [],
        },
      },
    ];

    const output = JSON.parse(toSarif(results, '1.0.0'));

    expect(output.runs[0].results).toHaveLength(2);
    expect(output.runs[0].tool.driver.rules).toHaveLength(2);
  });

  it('should handle issues without file location', () => {
    const results = [
      {
        validator: 'Skills',
        result: {
          valid: false,
          errors: [
            {
              message: 'No file',
              severity: 'error' as const,
              ruleId: 'skill-name' as const,
            },
          ],
          warnings: [],
        },
      },
    ];

    const output = JSON.parse(toSarif(results, '1.0.0'));

    const result = output.runs[0].results[0];
    expect(result.locations).toBeUndefined();
  });

  it('should handle issues without ruleId', () => {
    const results = [
      {
        validator: 'Skills',
        result: {
          valid: false,
          errors: [
            {
              message: 'Unknown rule error',
              severity: 'error' as const,
            },
          ],
          warnings: [],
        },
      },
    ];

    const output = JSON.parse(toSarif(results, '1.0.0'));

    const result = output.runs[0].results[0];
    expect(result.ruleId).toBe('unknown');
  });
});
