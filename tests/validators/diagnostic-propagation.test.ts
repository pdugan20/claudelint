/**
 * Integration tests for diagnostic propagation
 * Ensures diagnostics from components flow through to ValidationResult
 */

import { ClaudeMdValidator } from '../../src/validators/claude-md';
import { ClaudeLintConfig } from '../../src/utils/config/types';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { setupTestDir } from '../helpers/test-utils';

describe('Diagnostic Propagation', () => {
  const { getTestDir } = setupTestDir();

  describe('ConfigResolver warnings', () => {
    it('should propagate config warnings to ValidationResult', async () => {
      const testDir = getTestDir();
      const filePath = join(testDir, 'CLAUDE.md');

      // Create a valid file
      await writeFile(filePath, '# Test\n\nValid content.');

      // Setup config with invalid rule options (schema validation should fail)
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-warning': {
            severity: 'error',
            options: {
              maxSize: -100, // Invalid: must be positive
            },
          },
        },
      };

      const validator = new ClaudeMdValidator({ path: filePath, config });
      const result = await validator.validate();

      // Config warning should be in result.warnings
      expect(result.warnings.length).toBeGreaterThan(0);
      const configWarning = result.warnings.find((w) => w.message.includes('Invalid options'));
      expect(configWarning).toBeDefined();
      expect(configWarning?.message).toContain('claude-md-size-warning');
    });

    it('should propagate warnings for multiple invalid rules', async () => {
      const testDir = getTestDir();
      const filePath = join(testDir, 'CLAUDE.md');

      await writeFile(filePath, '# Test\n\nValid content.');

      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-warning': {
            severity: 'error',
            options: {
              maxSize: -100, // Invalid
            },
          },
          'claude-md-size-error': {
            severity: 'error',
            options: {
              maxSize: 'not a number', // Invalid type
            },
          },
        },
      };

      const validator = new ClaudeMdValidator({ path: filePath, config });
      const result = await validator.validate();

      // Should have warnings for both invalid rules
      expect(result.warnings.length).toBeGreaterThanOrEqual(2);
      const messages = result.warnings.map((w) => w.message).join(' ');
      expect(messages).toContain('claude-md-size-warning');
      expect(messages).toContain('claude-md-size-error');
    });
  });

  describe('Console output verification', () => {
    it('should not output to console during validation', async () => {
      const testDir = getTestDir();
      const filePath = join(testDir, 'CLAUDE.md');

      // Create file that will trigger config warning
      await writeFile(filePath, '# Test\n\nContent.');

      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-warning': {
            severity: 'error',
            options: {
              maxSize: -1, // Invalid - triggers warning
            },
          },
        },
      };

      // Spy on console methods (excluding console.log which Reporter may use)
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      try {
        const validator = new ClaudeMdValidator({ path: filePath, config });
        await validator.validate();

        // Library code should NOT use console
        expect(warnSpy).not.toHaveBeenCalled();
        expect(errorSpy).not.toHaveBeenCalled();
      } finally {
        warnSpy.mockRestore();
        errorSpy.mockRestore();
      }
    });

    it('should handle multiple validators without console output', async () => {
      const testDir = getTestDir();
      const file1 = join(testDir, 'CLAUDE.md');
      const file2 = join(testDir, 'test2.md');

      await writeFile(file1, '# Test 1\n');
      await writeFile(file2, '# Test 2\n');

      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-warning': {
            severity: 'error',
            options: { maxSize: -1 },
          },
        },
      };

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      try {
        const validator1 = new ClaudeMdValidator({ path: file1, config });
        const validator2 = new ClaudeMdValidator({ path: file2, config });

        await Promise.all([validator1.validate(), validator2.validate()]);

        expect(warnSpy).not.toHaveBeenCalled();
        expect(errorSpy).not.toHaveBeenCalled();
      } finally {
        warnSpy.mockRestore();
        errorSpy.mockRestore();
      }
    });
  });

  describe('Diagnostic context preservation', () => {
    it('should preserve diagnostic source and code', async () => {
      const testDir = getTestDir();
      const filePath = join(testDir, 'CLAUDE.md');

      await writeFile(filePath, '# Test\n');

      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-warning': {
            severity: 'error',
            options: { maxSize: -1 },
          },
        },
      };

      const validator = new ClaudeMdValidator({ path: filePath, config });
      const result = await validator.validate();

      const configWarning = result.warnings.find((w) => w.message.includes('Invalid options'));
      expect(configWarning).toBeDefined();

      // Verify diagnostic metadata is preserved
      expect(configWarning).toHaveProperty('message');
      expect(configWarning).toHaveProperty('severity', 'warning');
    });
  });
});
