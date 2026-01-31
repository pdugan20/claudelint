/**
 * Tests for functional API
 */

import { lint, lintText, resolveConfig, formatResults, getFileInfo } from '../../src/api/functions';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

describe('Functional API', () => {
  let tempDir: string;

  beforeEach(() => {
    // Create temp directory for tests
    tempDir = join(__dirname, '../fixtures/func-api-temp');
    mkdirSync(tempDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up temp directory
    if (tempDir) {
      try {
        rmSync(tempDir, { recursive: true, force: true });
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  describe('lint', () => {
    it('should lint files using patterns', async () => {
      // Create test file
      const testFile = join(tempDir, 'test.md');
      writeFileSync(testFile, '# Test content', 'utf-8');

      const results = await lint([`${tempDir}/**/*.md`]);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty('filePath');
      expect(results[0]).toHaveProperty('messages');
    });

    it('should accept options', async () => {
      const testFile = join(tempDir, 'test.md');
      writeFileSync(testFile, '# Test', 'utf-8');

      const results = await lint([`${tempDir}/**/*.md`], {
        fix: true,
      });

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle empty patterns', async () => {
      const results = await lint([`${tempDir}/nonexistent/**/*.md`], {
        errorOnUnmatchedPattern: false,
      });

      expect(results).toEqual([]);
    });
  });

  describe('lintText', () => {
    it('should lint text content', async () => {
      const code = '# CLAUDE.md\n\nTest content';

      const results = await lintText(code, { filePath: 'CLAUDE.md' });

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(1);
      expect(results[0]).toHaveProperty('filePath');
      expect(results[0].source).toBe(code);
    });

    it('should work without options', async () => {
      const code = '# Test content';

      const results = await lintText(code);

      expect(results.length).toBe(1);
    });
  });

  describe('resolveConfig', () => {
    it('should resolve config for a file path', async () => {
      const config = await resolveConfig('test.md');

      expect(config).toBeDefined();
      expect(typeof config).toBe('object');
    });

    it('should accept cwd option', async () => {
      const config = await resolveConfig('test.md', { cwd: tempDir });

      expect(config).toBeDefined();
    });
  });

  describe('formatResults', () => {
    it('should format results using default formatter', async () => {
      const results = [
        {
          filePath: 'test.md',
          messages: [],
          suppressedMessages: [],
          errorCount: 0,
          warningCount: 0,
          fixableErrorCount: 0,
          fixableWarningCount: 0,
        },
      ];

      const output = await formatResults(results);

      expect(typeof output).toBe('string');
    });

    it('should format using specified formatter', async () => {
      const results = [
        {
          filePath: 'test.md',
          messages: [
            {
              ruleId: 'test-rule',
              severity: 'error' as const,
              message: 'Test error',
            },
          ],
          suppressedMessages: [],
          errorCount: 1,
          warningCount: 0,
          fixableErrorCount: 0,
          fixableWarningCount: 0,
        },
      ];

      const output = await formatResults(results, 'json');

      expect(typeof output).toBe('string');
      // JSON formatter should produce valid JSON
      expect(() => JSON.parse(output)).not.toThrow();
    });

    it('should accept cwd option', async () => {
      const results = [
        {
          filePath: 'test.md',
          messages: [],
          suppressedMessages: [],
          errorCount: 0,
          warningCount: 0,
          fixableErrorCount: 0,
          fixableWarningCount: 0,
        },
      ];

      const output = await formatResults(results, 'stylish', { cwd: tempDir });

      expect(typeof output).toBe('string');
    });
  });

  describe('getFileInfo', () => {
    it('should return file info', async () => {
      const info = await getFileInfo('test.md');

      expect(info).toHaveProperty('ignored');
      expect(info).toHaveProperty('validators');
      expect(typeof info.ignored).toBe('boolean');
      expect(Array.isArray(info.validators)).toBe(true);
    });

    it('should accept cwd option', async () => {
      const info = await getFileInfo('test.md', { cwd: tempDir });

      expect(info).toBeDefined();
    });

    it('should indicate when file is ignored', async () => {
      // File info with no ignore patterns - should not be ignored
      const info = await getFileInfo('test.md');

      expect(info.ignored).toBe(false);
    });
  });

  describe('stateless behavior', () => {
    it('should not share state between calls', async () => {
      const code1 = '# Test 1';
      const code2 = '# Test 2';

      const results1 = await lintText(code1, { filePath: 'test1.md' });
      const results2 = await lintText(code2, { filePath: 'test2.md' });

      expect(results1[0].filePath).toContain('test1.md');
      expect(results2[0].filePath).toContain('test2.md');
      expect(results1[0].source).toBe(code1);
      expect(results2[0].source).toBe(code2);
    });

    it('should create new instances for each call', async () => {
      // Multiple calls should work independently
      const config1 = await resolveConfig('file1.md');
      const config2 = await resolveConfig('file2.md');

      expect(config1).toBeDefined();
      expect(config2).toBeDefined();
    });
  });
});
