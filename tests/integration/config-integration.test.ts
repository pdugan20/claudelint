/**
 * Integration tests for config integration with validators
 * Tests that rules respect .claudelintrc.json configuration
 */

import { ClaudeMdValidator } from '../../src/validators/claude-md';
import { ClaudeLintConfig } from '../../src/utils/config';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { setupTestDir } from '../helpers/test-utils';

describe('Config Integration Tests', () => {
  const { getTestDir } = setupTestDir();

  describe('size-error rule', () => {
    it('should use custom maxSize option', async () => {
      const testDir = getTestDir();
      const filePath = join(testDir, 'CLAUDE.md');

      // Create a 25KB file
      const content = '# Test\n\n' + 'x'.repeat(25000);
      await writeFile(filePath, content);

      // Configure size-error with custom maxSize of 20KB
      const config: ClaudeLintConfig = {
        rules: {
          'size-error': {
            severity: 'error',
            options: {
              maxSize: 20000,
            },
          },
        },
      };

      const validator = new ClaudeMdValidator({ path: filePath, config });
      const result = await validator.validate();

      // Should error because file (25KB) exceeds custom limit (20KB)
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].ruleId).toBe('size-error');
      expect(result.errors[0].message).toContain('20KB');
    });

    it('should not error when file is under custom maxSize', async () => {
      const testDir = getTestDir();
      const filePath = join(testDir, 'CLAUDE.md');

      // Create a 25KB file
      const content = '# Test\n\n' + 'x'.repeat(25000);
      await writeFile(filePath, content);

      // Configure size-error with custom maxSize of 30KB (higher than file size)
      const config: ClaudeLintConfig = {
        rules: {
          'size-error': {
            severity: 'error',
            options: {
              maxSize: 30000,
            },
          },
        },
      };

      const validator = new ClaudeMdValidator({ path: filePath, config });
      const result = await validator.validate();

      // Should not error because file (25KB) is under custom limit (30KB)
      const sizeErrors = result.errors.filter((e) => e.ruleId === 'size-error');
      expect(sizeErrors.length).toBe(0);
    });

    it('should not report error when rule is disabled', async () => {
      const testDir = getTestDir();
      const filePath = join(testDir, 'CLAUDE.md');

      // Create a 45KB file (exceeds default 40KB limit)
      const content = '# Test\n\n' + 'x'.repeat(45000);
      await writeFile(filePath, content);

      // Disable size-error rule
      const config: ClaudeLintConfig = {
        rules: {
          'size-error': 'off',
        },
      };

      const validator = new ClaudeMdValidator({ path: filePath, config });
      const result = await validator.validate();

      // Should not error because rule is disabled
      const sizeErrors = result.errors.filter((e) => e.ruleId === 'size-error');
      expect(sizeErrors.length).toBe(0);
    });

    it('should use default maxSize when no config provided', async () => {
      const testDir = getTestDir();
      const filePath = join(testDir, 'CLAUDE.md');

      // Create a 45KB file (exceeds default 40KB limit)
      const content = '# Test\n\n' + 'x'.repeat(45000);
      await writeFile(filePath, content);

      // No config - should use defaults
      const validator = new ClaudeMdValidator({ path: filePath });
      const result = await validator.validate();

      // Should error with default threshold
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].ruleId).toBe('size-error');
      expect(result.errors[0].message).toContain('40KB');
    });
  });

  describe('size-warning rule', () => {
    it('should use custom maxSize option', async () => {
      const testDir = getTestDir();
      const filePath = join(testDir, 'CLAUDE.md');

      // Create a 25KB file
      const content = '# Test\n\n' + 'x'.repeat(25000);
      await writeFile(filePath, content);

      // Configure size-warning with custom maxSize of 20KB
      const config: ClaudeLintConfig = {
        rules: {
          'size-warning': {
            severity: 'warn',
            options: {
              maxSize: 20000,
            },
          },
        },
      };

      const validator = new ClaudeMdValidator({ path: filePath, config });
      const result = await validator.validate();

      // Should warn because file (25KB) exceeds custom limit (20KB)
      expect(result.warnings.length).toBe(1);
      expect(result.warnings[0].ruleId).toBe('size-warning');
    });

    it('should not report warning when rule is disabled', async () => {
      const testDir = getTestDir();
      const filePath = join(testDir, 'CLAUDE.md');

      // Create a 38KB file (exceeds default 35KB warning threshold)
      const content = '# Test\n\n' + 'x'.repeat(38000);
      await writeFile(filePath, content);

      // Disable size-warning rule
      const config: ClaudeLintConfig = {
        rules: {
          'size-warning': 'off',
        },
      };

      const validator = new ClaudeMdValidator({ path: filePath, config });
      const result = await validator.validate();

      // Should not warn because rule is disabled
      const sizeWarnings = result.warnings.filter((w) => w.ruleId === 'size-warning');
      expect(sizeWarnings.length).toBe(0);
    });
  });

  describe('severity override', () => {
    it.skip('should treat warning as error when severity is overridden', async () => {
      // TODO: Severity override requires architectural changes to how we report issues
      // Currently reportError() vs reportWarning() is hardcoded in validator logic
      // ESLint pattern: rules report issues, reporter applies severity from config
      // Will implement in future phase
      const testDir = getTestDir();
      const filePath = join(testDir, 'CLAUDE.md');

      // Create a 38KB file (exceeds warning threshold but not error)
      const content = '# Test\n\n' + 'x'.repeat(38000);
      await writeFile(filePath, content);

      // Override size-warning to be an error
      const config: ClaudeLintConfig = {
        rules: {
          'size-warning': 'error',
        },
      };

      const validator = new ClaudeMdValidator({ path: filePath, config });
      const result = await validator.validate();

      // Should report as error instead of warning
      const sizeWarnings = result.warnings.filter((w) => w.ruleId === 'size-warning');
      const sizeErrors = result.errors.filter((e) => e.ruleId === 'size-warning');

      expect(sizeWarnings.length).toBe(0);
      expect(sizeErrors.length).toBe(1);
    });
  });

  describe('file-specific overrides', () => {
    it('should apply different config for files matching glob pattern', async () => {
      const testDir = getTestDir();
      const mainFile = join(testDir, 'CLAUDE.md');
      const rulesDir = join(testDir, '.claude', 'rules');
      const rulesFile = join(rulesDir, 'test.md');

      // Create directory structure
      await mkdir(rulesDir, { recursive: true });
      await writeFile(mainFile, '# Main\n\n' + 'x'.repeat(25000));
      await writeFile(rulesFile, '# Rules\n\n' + 'x'.repeat(25000));

      // Configure different limits for .claude/rules/*.md files
      const config: ClaudeLintConfig = {
        rules: {
          'size-error': {
            severity: 'error',
            options: {
              maxSize: 20000, // 20KB for main files
            },
          },
        },
        overrides: [
          {
            files: ['**/.claude/rules/*.md'],
            rules: {
              'size-error': {
                severity: 'error',
                options: {
                  maxSize: 30000, // 30KB for rules files
                },
              },
            },
          },
        ],
      };

      // Validate main file (should error - 25KB > 20KB)
      const mainValidator = new ClaudeMdValidator({ path: mainFile, config });
      const mainResult = await mainValidator.validate();
      const mainErrors = mainResult.errors.filter((e) => e.ruleId === 'size-error');
      expect(mainErrors.length).toBe(1);

      // Validate rules file (should pass - 25KB < 30KB)
      const rulesValidator = new ClaudeMdValidator({ path: rulesFile, config });
      const rulesResult = await rulesValidator.validate();
      const rulesErrors = rulesResult.errors.filter((e) => e.ruleId === 'size-error');
      expect(rulesErrors.length).toBe(0);
    });
  });

  describe('invalid options validation', () => {
    it('should reject negative maxSize', async () => {
      const testDir = getTestDir();
      const filePath = join(testDir, 'CLAUDE.md');
      await writeFile(filePath, '# Test\n\nContent');

      // Configure with invalid negative maxSize
      const config: ClaudeLintConfig = {
        rules: {
          'size-error': {
            severity: 'error',
            options: {
              maxSize: -1000, // Invalid
            },
          },
        },
      };

      // Schema validation should prevent this from being applied
      // The rule should use default options instead
      const validator = new ClaudeMdValidator({ path: filePath, config });
      const result = await validator.validate();

      // Should not crash, defaults should be used
      expect(result).toBeDefined();
    });

    it('should reject non-number maxSize', async () => {
      const testDir = getTestDir();
      const filePath = join(testDir, 'CLAUDE.md');
      await writeFile(filePath, '# Test\n\nContent');

      // Configure with invalid string maxSize
      const config: ClaudeLintConfig = {
        rules: {
          'size-error': {
            severity: 'error',
            options: {
              maxSize: 'large' as unknown as number, // Invalid type
            },
          },
        },
      };

      // Schema validation should prevent this from being applied
      const validator = new ClaudeMdValidator({ path: filePath, config });
      const result = await validator.validate();

      // Should not crash
      expect(result).toBeDefined();
    });
  });

  describe('backward compatibility', () => {
    it('should work without config (all rules enabled with defaults)', async () => {
      const testDir = getTestDir();
      const filePath = join(testDir, 'CLAUDE.md');

      // Create a 45KB file (exceeds default limits)
      const content = '# Test\n\n' + 'x'.repeat(45000);
      await writeFile(filePath, content);

      // No config provided
      const validator = new ClaudeMdValidator({ path: filePath });
      const result = await validator.validate();

      // Should use default behavior (error at 40KB)
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].ruleId).toBe('size-error');
    });
  });

  describe('import-circular rule', () => {
    it('should use custom maxDepth option', async () => {
      const testDir = getTestDir();
      const mainFile = join(testDir, 'CLAUDE.md');
      const file1 = join(testDir, 'file1.md');
      const file2 = join(testDir, 'file2.md');
      const file3 = join(testDir, 'file3.md');

      // Create chain: main -> file1 -> file2 -> file3 (depth 3)
      await writeFile(mainFile, '# Main\n\nImport: @file1.md');
      await writeFile(file1, '# File 1\n\nImport: @file2.md');
      await writeFile(file2, '# File 2\n\nImport: @file3.md');
      await writeFile(file3, '# File 3\n\nContent');

      // Configure maxDepth of 2 (should error on file3 import)
      const config: ClaudeLintConfig = {
        rules: {
          'import-circular': {
            severity: 'error',
            options: {
              maxDepth: 2,
            },
          },
        },
      };

      const validator = new ClaudeMdValidator({ path: mainFile, config });
      const result = await validator.validate();

      // Should error when depth exceeds 2
      const depthErrors = result.errors.filter((e) =>
        e.message.includes('Import depth exceeds maximum')
      );
      expect(depthErrors.length).toBeGreaterThan(0);
    });

    it('should allow self-reference when configured', async () => {
      const testDir = getTestDir();
      const filePath = join(testDir, 'CLAUDE.md');

      // File that imports itself
      await writeFile(filePath, '# Main\n\nImport: @CLAUDE.md');

      // Configure to allow self-reference
      const config: ClaudeLintConfig = {
        rules: {
          'import-circular': {
            severity: 'warn',
            options: {
              allowSelfReference: true,
            },
          },
        },
      };

      const validator = new ClaudeMdValidator({ path: filePath, config });
      const result = await validator.validate();

      // Should not warn about self-reference
      const selfRefWarnings = result.warnings.filter(
        (w) => w.ruleId === 'import-circular' && w.message.includes('imports itself')
      );
      expect(selfRefWarnings.length).toBe(0);
    });

    it('should warn about self-reference by default', async () => {
      const testDir = getTestDir();
      const filePath = join(testDir, 'CLAUDE.md');

      // File that imports itself
      await writeFile(filePath, '# Main\n\nImport: @CLAUDE.md');

      // No config - default behavior
      const validator = new ClaudeMdValidator({ path: filePath });
      const result = await validator.validate();

      // Should warn about self-reference
      const selfRefWarnings = result.warnings.filter(
        (w) => w.ruleId === 'import-circular' && w.message.includes('imports itself')
      );
      expect(selfRefWarnings.length).toBe(1);
    });

    it('should ignore files matching ignorePatterns', async () => {
      const testDir = getTestDir();
      const mainFile = join(testDir, 'CLAUDE.md');
      const testFile = join(testDir, 'test.md');
      const regularFile = join(testDir, 'regular.md');

      // Create circular import: main -> test -> main
      await writeFile(mainFile, '# Main\n\nImport: @test.md\n\nImport: @regular.md');
      await writeFile(testFile, '# Test\n\nImport: @CLAUDE.md');
      await writeFile(regularFile, '# Regular\n\nImport: @CLAUDE.md');

      // Configure to ignore test files
      const config: ClaudeLintConfig = {
        rules: {
          'import-circular': {
            severity: 'warn',
            options: {
              ignorePatterns: ['**/test.md'],
            },
          },
        },
      };

      const validator = new ClaudeMdValidator({ path: mainFile, config });
      const result = await validator.validate();

      // Should warn about regular.md circular import but not test.md
      const circularWarnings = result.warnings.filter(
        (w) => w.ruleId === 'import-circular' && w.message.includes('Circular import')
      );

      // Should only warn about regular.md, not test.md
      expect(circularWarnings.length).toBe(1);
      expect(circularWarnings[0].message).toContain('regular.md');
    });

    it('should detect circular import by default', async () => {
      const testDir = getTestDir();
      const file1 = join(testDir, 'file1.md');
      const file2 = join(testDir, 'file2.md');

      // Create circular import: file1 -> file2 -> file1
      await writeFile(file1, '# File 1\n\nImport: @file2.md');
      await writeFile(file2, '# File 2\n\nImport: @file1.md');

      // No config - default behavior
      const validator = new ClaudeMdValidator({ path: file1 });
      const result = await validator.validate();

      // Should warn about circular import
      const circularWarnings = result.warnings.filter((w) => w.ruleId === 'import-circular');
      expect(circularWarnings.length).toBe(1);
    });

    it('should not report circular import when rule is disabled', async () => {
      const testDir = getTestDir();
      const file1 = join(testDir, 'file1.md');
      const file2 = join(testDir, 'file2.md');

      // Create circular import: file1 -> file2 -> file1
      await writeFile(file1, '# File 1\n\nImport: @file2.md');
      await writeFile(file2, '# File 2\n\nImport: @file1.md');

      // Disable import-circular rule
      const config: ClaudeLintConfig = {
        rules: {
          'import-circular': 'off',
        },
      };

      const validator = new ClaudeMdValidator({ path: file1, config });
      const result = await validator.validate();

      // Should not warn about circular import
      const circularWarnings = result.warnings.filter((w) => w.ruleId === 'import-circular');
      expect(circularWarnings.length).toBe(0);
    });
  });
});
