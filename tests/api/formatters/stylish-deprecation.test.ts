/**
 * Tests for StylishFormatter deprecation warnings
 */

import { StylishFormatter } from '../../../src/api/formatters/stylish';
import { LintResult } from '../../../src/api/types';
import { RuleId } from '../../../src/rules/rule-ids';

describe('StylishFormatter - Deprecation Warnings', () => {
  const formatter = new StylishFormatter();

  it('should display deprecation warnings for deprecated rules', () => {
    const results: LintResult[] = [
      {
        filePath: '/test/file.md',
        messages: [],
        suppressedMessages: [],
        errorCount: 0,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        deprecatedRulesUsed: [
          {
            ruleId: 'plugin-circular-dependency' as RuleId,
            reason: 'This rule has been deprecated',
          },
        ],
      },
    ];

    const output = formatter.format(results);

    expect(output).toContain('No issues found');
    expect(output).toContain('Deprecated rules used:');
    expect(output).toContain('plugin-circular-dependency: This rule has been deprecated');
  });

  it('should display replacement information for deprecated rules', () => {
    const results: LintResult[] = [
      {
        filePath: '/test/file.md',
        messages: [],
        suppressedMessages: [],
        errorCount: 0,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        deprecatedRulesUsed: [
          {
            ruleId: 'plugin-dependency-invalid-version' as RuleId,
            reason: 'This rule validates a field that does not exist in the official spec',
            replacedBy: ['plugin-invalid-marketplace-manifest' as RuleId],
            deprecatedSince: '0.3.0',
            removeInVersion: '1.0.0',
            url: 'https://github.com/pdugan20/claudelint/blob/main/docs/migrations/old-to-new.md',
          },
        ],
      },
    ];

    const output = formatter.format(results);

    expect(output).toContain('Deprecated rules used:');
    expect(output).toContain(
      'plugin-dependency-invalid-version: This rule validates a field that does not exist in the official spec'
    );
    expect(output).toContain('(use plugin-invalid-marketplace-manifest instead)');
    expect(output).toContain('[will be removed in 1.0.0]');
    expect(output).toContain('Migration guide: https://github.com/pdugan20/claudelint');
  });

  it('should display multiple replacement rules', () => {
    const results: LintResult[] = [
      {
        filePath: '/test/file.md',
        messages: [],
        suppressedMessages: [],
        errorCount: 0,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        deprecatedRulesUsed: [
          {
            ruleId: 'plugin-circular-dependency' as RuleId,
            reason: 'Split into multiple focused rules',
            replacedBy: [
              'plugin-invalid-marketplace-manifest' as RuleId,
              'plugin-name-invalid' as RuleId,
              'plugin-version-invalid' as RuleId,
            ],
          },
        ],
      },
    ];

    const output = formatter.format(results);

    expect(output).toContain('Deprecated rules used:');
    expect(output).toContain('plugin-circular-dependency: Split into multiple focused rules');
    expect(output).toContain(
      '(use plugin-invalid-marketplace-manifest, plugin-name-invalid, plugin-version-invalid instead)'
    );
  });

  it('should deduplicate deprecated rules across multiple files', () => {
    const results: LintResult[] = [
      {
        filePath: '/test/file1.md',
        messages: [],
        suppressedMessages: [],
        errorCount: 0,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        deprecatedRulesUsed: [
          {
            ruleId: 'plugin-circular-dependency' as RuleId,
            reason: 'This rule has been deprecated',
          },
        ],
      },
      {
        filePath: '/test/file2.md',
        messages: [],
        suppressedMessages: [],
        errorCount: 0,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        deprecatedRulesUsed: [
          {
            ruleId: 'plugin-circular-dependency' as RuleId,
            reason: 'This rule has been deprecated',
          },
        ],
      },
    ];

    const output = formatter.format(results);

    expect(output).toContain('Deprecated rules used:');
    // Should only appear once even though it was used in multiple files
    const matches = (output.match(/plugin-circular-dependency:/g) || []).length;
    expect(matches).toBe(1);
  });

  it('should show deprecation warnings even when there are validation issues', () => {
    const results: LintResult[] = [
      {
        filePath: '/test/file.md',
        messages: [
          {
            ruleId: 'some-rule',
            severity: 'error',
            message: 'File has an error',
            line: 10,
          },
        ],
        suppressedMessages: [],
        errorCount: 1,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        deprecatedRulesUsed: [
          {
            ruleId: 'plugin-circular-dependency' as RuleId,
            reason: 'This rule has been deprecated',
          },
        ],
      },
    ];

    const output = formatter.format(results);

    expect(output).toContain('1 errors, 0 warnings');
    expect(output).toContain('Deprecated rules used:');
    expect(output).toContain('plugin-circular-dependency: This rule has been deprecated');
  });

  it('should not show deprecation section when no deprecated rules used', () => {
    const results: LintResult[] = [
      {
        filePath: '/test/file.md',
        messages: [],
        suppressedMessages: [],
        errorCount: 0,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
      },
    ];

    const output = formatter.format(results);

    expect(output).toContain('No issues found');
    expect(output).not.toContain('Deprecated rules used:');
  });

  it('should handle removeInVersion: null correctly', () => {
    const results: LintResult[] = [
      {
        filePath: '/test/file.md',
        messages: [],
        suppressedMessages: [],
        errorCount: 0,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        deprecatedRulesUsed: [
          {
            ruleId: 'plugin-circular-dependency' as RuleId,
            reason: 'Deprecated but kept for compatibility',
            removeInVersion: null,
          },
        ],
      },
    ];

    const output = formatter.format(results);

    expect(output).toContain('Deprecated rules used:');
    expect(output).toContain('plugin-circular-dependency: Deprecated but kept for compatibility');
    expect(output).not.toContain('[will be removed in');
  });
});
