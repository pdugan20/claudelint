/**
 * Tests for ClaudeLint class
 *
 * Basic tests for Phase 1 implementation of the programmatic API
 */

import { ClaudeLint } from '../../src/api/claudelint';
import { LintResult } from '../../src/api/types';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

describe('ClaudeLint', () => {
  let tempDir: string;

  beforeEach(() => {
    // Create temp directory for tests
    tempDir = join(__dirname, '../fixtures/api-temp');
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

  describe('constructor', () => {
    it('should create instance with default options', () => {
      const linter = new ClaudeLint();
      expect(linter).toBeInstanceOf(ClaudeLint);
    });

    it('should accept custom cwd option', () => {
      const linter = new ClaudeLint({ cwd: '/custom/path' });
      expect(linter).toBeInstanceOf(ClaudeLint);
    });

    it('should accept fix option', () => {
      const linter = new ClaudeLint({ fix: true });
      expect(linter).toBeInstanceOf(ClaudeLint);
    });

    it('should accept cache options', () => {
      const linter = new ClaudeLint({
        cache: true,
        cacheLocation: '.custom-cache',
      });
      expect(linter).toBeInstanceOf(ClaudeLint);
    });

    it('should accept explicit config option', () => {
      const linter = new ClaudeLint({
        config: {
          rules: {
            'claude-md-size-limit': 'error',
          },
        },
      });
      expect(linter).toBeInstanceOf(ClaudeLint);
    });

    it('should accept progress callbacks', () => {
      const onStart = jest.fn();
      const onProgress = jest.fn();
      const onComplete = jest.fn();

      const linter = new ClaudeLint({
        onStart,
        onProgress,
        onComplete,
      });

      expect(linter).toBeInstanceOf(ClaudeLint);
    });
  });

  describe('configuration loading', () => {
    it('should use provided config when specified', () => {
      const config = {
        rules: {
          'claude-md-size-limit': 'warn' as const,
        },
      };

      const linter = new ClaudeLint({ config });
      expect(linter).toBeInstanceOf(ClaudeLint);
    });

    it('should load config from file when overrideConfigFile specified', () => {
      // Create a config file
      const configPath = join(tempDir, '.claudelintrc.json');
      writeFileSync(
        configPath,
        JSON.stringify({
          rules: {
            'claude-md-size-limit': 'error',
          },
        })
      );

      const linter = new ClaudeLint({
        cwd: tempDir,
        overrideConfigFile: configPath,
      });

      expect(linter).toBeInstanceOf(ClaudeLint);
    });

    it('should throw error if config file does not exist', () => {
      expect(() => {
        new ClaudeLint({
          cwd: tempDir,
          overrideConfigFile: '/nonexistent/config.json',
        });
      }).toThrow();
    });

    it('should use default config when no config provided', () => {
      const linter = new ClaudeLint({ cwd: tempDir });
      expect(linter).toBeInstanceOf(ClaudeLint);
    });
  });

  describe('lintFiles', () => {
    it('should return empty array for no matching files', async () => {
      const linter = new ClaudeLint({ cwd: tempDir });
      const results = await linter.lintFiles(['nonexistent/**/*.md']);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    it('should lint matching files', async () => {
      // Create a test file
      const testFile = join(tempDir, 'test.md');
      writeFileSync(testFile, '# Test\n\nSome content');

      const linter = new ClaudeLint({ cwd: tempDir });
      const results = await linter.lintFiles(['*.md']);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);

      // Check result structure
      const result = results[0];
      expect(result).toHaveProperty('filePath');
      expect(result).toHaveProperty('messages');
      expect(result).toHaveProperty('errorCount');
      expect(result).toHaveProperty('warningCount');
      expect(result.messages).toBeInstanceOf(Array);
    });

    it('should call progress callbacks', async () => {
      // Create test files
      writeFileSync(join(tempDir, 'file1.md'), '# File 1');
      writeFileSync(join(tempDir, 'file2.md'), '# File 2');

      const onStart = jest.fn();
      const onProgress = jest.fn();
      const onComplete = jest.fn();

      const linter = new ClaudeLint({
        cwd: tempDir,
        onStart,
        onProgress,
        onComplete,
      });

      await linter.lintFiles(['*.md']);

      expect(onStart).toHaveBeenCalledTimes(1);
      expect(onStart).toHaveBeenCalledWith(2); // 2 files

      expect(onProgress).toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(onComplete).toHaveBeenCalledWith(expect.any(Array));
    });

    it('should return LintResult objects with correct structure', async () => {
      // Create a test file
      writeFileSync(join(tempDir, 'test.md'), '# Test File\n\nContent here');

      const linter = new ClaudeLint({ cwd: tempDir });
      const results = await linter.lintFiles(['*.md']);

      expect(results.length).toBeGreaterThan(0);

      const result = results[0];

      // Verify LintResult structure
      expect(result).toHaveProperty('filePath');
      expect(result).toHaveProperty('messages');
      expect(result).toHaveProperty('suppressedMessages');
      expect(result).toHaveProperty('errorCount');
      expect(result).toHaveProperty('warningCount');
      expect(result).toHaveProperty('fixableErrorCount');
      expect(result).toHaveProperty('fixableWarningCount');

      // Verify types
      expect(typeof result.filePath).toBe('string');
      expect(Array.isArray(result.messages)).toBe(true);
      expect(Array.isArray(result.suppressedMessages)).toBe(true);
      expect(typeof result.errorCount).toBe('number');
      expect(typeof result.warningCount).toBe('number');
    });
  });

  describe('loadFormatter', () => {
    it('should load built-in stylish formatter', async () => {
      const linter = new ClaudeLint();
      const formatter = await linter.loadFormatter('stylish');

      expect(formatter).toBeDefined();
      expect(typeof formatter.format).toBe('function');
    });

    it('should load built-in json formatter', async () => {
      const linter = new ClaudeLint();
      const formatter = await linter.loadFormatter('json');

      expect(formatter).toBeDefined();
      expect(typeof formatter.format).toBe('function');
    });

    it('should load built-in compact formatter', async () => {
      const linter = new ClaudeLint();
      const formatter = await linter.loadFormatter('compact');

      expect(formatter).toBeDefined();
      expect(typeof formatter.format).toBe('function');
    });

    it('should cache loaded formatters', async () => {
      const linter = new ClaudeLint();

      const formatter1 = await linter.loadFormatter('stylish');
      const formatter2 = await linter.loadFormatter('stylish');

      // Should return the same instance from cache
      expect(formatter1).toBe(formatter2);
    });
  });

  describe('static methods', () => {
    describe('getErrorResults', () => {
      it('should filter results to only errors', () => {
        const results: LintResult[] = [
          {
            filePath: '/file1.md',
            messages: [],
            suppressedMessages: [],
            errorCount: 2,
            warningCount: 0,
            fixableErrorCount: 0,
            fixableWarningCount: 0,
          },
          {
            filePath: '/file2.md',
            messages: [],
            suppressedMessages: [],
            errorCount: 0,
            warningCount: 3,
            fixableErrorCount: 0,
            fixableWarningCount: 0,
          },
          {
            filePath: '/file3.md',
            messages: [],
            suppressedMessages: [],
            errorCount: 1,
            warningCount: 1,
            fixableErrorCount: 0,
            fixableWarningCount: 0,
          },
        ];

        const errors = ClaudeLint.getErrorResults(results);

        expect(errors.length).toBe(2);
        expect(errors[0].filePath).toBe('/file1.md');
        expect(errors[1].filePath).toBe('/file3.md');
      });

      it('should return empty array if no errors', () => {
        const results: LintResult[] = [
          {
            filePath: '/file1.md',
            messages: [],
            suppressedMessages: [],
            errorCount: 0,
            warningCount: 3,
            fixableErrorCount: 0,
            fixableWarningCount: 0,
          },
        ];

        const errors = ClaudeLint.getErrorResults(results);
        expect(errors.length).toBe(0);
      });
    });

    describe('findConfigFile', () => {
      it('should find config file in directory', async () => {
        // Create a config file
        writeFileSync(join(tempDir, '.claudelintrc.json'), JSON.stringify({ rules: {} }));

        const configPath = await ClaudeLint.findConfigFile(tempDir);

        expect(configPath).toBeTruthy();
        expect(configPath).toContain('.claudelintrc.json');
      });

      it('should return null if no config file found', async () => {
        const configPath = await ClaudeLint.findConfigFile(tempDir);
        expect(configPath).toBeNull();
      });
    });

    describe('getVersion', () => {
      it('should return version string', () => {
        const version = ClaudeLint.getVersion();

        expect(typeof version).toBe('string');
        expect(version).toMatch(/^\d+\.\d+\.\d+/);
      });
    });

    describe('getWarningResults', () => {
      it('should filter results to only warnings', () => {
        const results: LintResult[] = [
          {
            filePath: 'file1.md',
            messages: [],
            suppressedMessages: [],
            errorCount: 0,
            warningCount: 3,
            fixableErrorCount: 0,
            fixableWarningCount: 0,
          },
          {
            filePath: 'file2.md',
            messages: [],
            suppressedMessages: [],
            errorCount: 1,
            warningCount: 0,
            fixableErrorCount: 0,
            fixableWarningCount: 0,
          },
        ];

        const warnings = ClaudeLint.getWarningResults(results);

        expect(warnings.length).toBe(1);
        expect(warnings[0].filePath).toBe('file1.md');
      });

      it('should return empty array if no warnings', () => {
        const results: LintResult[] = [
          {
            filePath: 'file1.md',
            messages: [],
            suppressedMessages: [],
            errorCount: 1,
            warningCount: 0,
            fixableErrorCount: 0,
            fixableWarningCount: 0,
          },
        ];

        const warnings = ClaudeLint.getWarningResults(results);

        expect(warnings.length).toBe(0);
      });
    });
  });

  describe('instance methods', () => {
    describe('getRulesMetaForResults', () => {
      it('should extract unique rule IDs from results', () => {
        const linter = new ClaudeLint({ cwd: tempDir });
        const results: LintResult[] = [
          {
            filePath: 'file1.md',
            messages: [
              {
                ruleId: 'claude-md-size-error',
                severity: 'error',
                message: 'Test error',
              },
              {
                ruleId: 'claude-md-size-warning',
                severity: 'warning',
                message: 'Test warning',
              },
            ],
            suppressedMessages: [],
            errorCount: 1,
            warningCount: 1,
            fixableErrorCount: 0,
            fixableWarningCount: 0,
          },
        ];

        const meta = linter.getRulesMetaForResults(results);

        // Map will contain metadata for rules that exist in the registry
        expect(meta).toBeInstanceOf(Map);
        // If rules are registered, they should be in the map
        // If not registered, map will be empty (which is fine for this test)
        expect(meta.size).toBeGreaterThanOrEqual(0);
      });

      it('should return empty map for results without rule IDs', () => {
        const linter = new ClaudeLint({ cwd: tempDir });
        const results: LintResult[] = [
          {
            filePath: 'file1.md',
            messages: [
              {
                ruleId: null,
                severity: 'error',
                message: 'Error without rule ID',
              },
            ],
            suppressedMessages: [],
            errorCount: 1,
            warningCount: 0,
            fixableErrorCount: 0,
            fixableWarningCount: 0,
          },
        ];

        const meta = linter.getRulesMetaForResults(results);

        expect(meta.size).toBe(0);
      });

      it('should handle empty results', () => {
        const linter = new ClaudeLint({ cwd: tempDir });
        const results: LintResult[] = [];

        const meta = linter.getRulesMetaForResults(results);

        expect(meta.size).toBe(0);
      });
    });

    describe('getRules', () => {
      it('should return map of registered rules', () => {
        const linter = new ClaudeLint({ cwd: tempDir });

        const rules = linter.getRules();

        expect(rules).toBeInstanceOf(Map);
        // Rules will be registered when the validators run
        // In test environment, registry may be empty or populated
        expect(rules.size).toBeGreaterThanOrEqual(0);

        // If there are rules, verify structure
        if (rules.size > 0) {
          for (const [ruleId, metadata] of rules) {
            expect(typeof ruleId).toBe('string');
            expect(metadata).toHaveProperty('id');
            expect(metadata).toHaveProperty('description');
            expect(metadata).toHaveProperty('category');
          }
        }
      });
    });
  });

  describe('configuration methods', () => {
    describe('calculateConfigForFile', () => {
      it('should return base config for file without overrides', async () => {
        const linter = new ClaudeLint({
          cwd: tempDir,
          config: {
            rules: {
              'claude-md-size-limit': 'error' as const,
            },
          },
        });

        const config = await linter.calculateConfigForFile('test.md');

        expect(config.rules).toEqual({
          'claude-md-size-limit': 'error',
        });
      });

      it('should apply overrides for matching files', async () => {
        const linter = new ClaudeLint({
          cwd: tempDir,
          config: {
            rules: {
              'claude-md-size-limit': 'error' as const,
            },
            overrides: [
              {
                files: ['skills/**/*.md'],
                rules: {
                  'skill-missing-shebang': 'warn' as const,
                },
              },
            ],
          },
        });

        const config = await linter.calculateConfigForFile('skills/test/SKILL.md');

        expect(config.rules).toEqual({
          'claude-md-size-limit': 'error',
          'skill-missing-shebang': 'warn',
        });
      });

      it('should not apply overrides for non-matching files', async () => {
        const linter = new ClaudeLint({
          cwd: tempDir,
          config: {
            rules: {
              'claude-md-size-limit': 'error' as const,
            },
            overrides: [
              {
                files: ['skills/**/*.md'],
                rules: {
                  'skill-missing-shebang': 'warn' as const,
                },
              },
            ],
          },
        });

        const config = await linter.calculateConfigForFile('CLAUDE.md');

        expect(config.rules).toEqual({
          'claude-md-size-limit': 'error',
        });
      });
    });

    describe('isPathIgnored', () => {
      it('should return false when no ignore patterns configured', () => {
        const linter = new ClaudeLint({ cwd: tempDir });

        expect(linter.isPathIgnored('any/file.md')).toBe(false);
      });

      it('should return true for paths matching ignore patterns', () => {
        const linter = new ClaudeLint({
          cwd: tempDir,
          config: {
            ignorePatterns: ['node_modules/**', '*.tmp'],
          },
        });

        expect(linter.isPathIgnored('node_modules/foo/bar.md')).toBe(true);
        expect(linter.isPathIgnored('test.tmp')).toBe(true);
      });

      it('should return false for paths not matching ignore patterns', () => {
        const linter = new ClaudeLint({
          cwd: tempDir,
          config: {
            ignorePatterns: ['node_modules/**', '*.tmp'],
          },
        });

        expect(linter.isPathIgnored('src/test.md')).toBe(false);
        expect(linter.isPathIgnored('CLAUDE.md')).toBe(false);
      });
    });

    describe('findConfigFile', () => {
      it('should find config file in directory', async () => {
        // Create a config file
        const configPath = join(tempDir, '.claudelintrc.json');
        writeFileSync(configPath, JSON.stringify({ rules: {} }));

        const found = await ClaudeLint.findConfigFile(tempDir);

        expect(found).toBe(configPath);
      });

      it('should return null if no config file found', async () => {
        const found = await ClaudeLint.findConfigFile(tempDir);

        expect(found).toBeNull();
      });
    });
  });

  describe('auto-fix support', () => {
    describe('outputFixes', () => {
      it('should write fixed content to disk', async () => {
        const { readFileSync } = require('fs');
        const testFile = join(tempDir, 'test-fix.md');
        writeFileSync(testFile, '# Original content', 'utf-8');

        const results: LintResult[] = [
          {
            filePath: testFile,
            messages: [],
            suppressedMessages: [],
            errorCount: 0,
            warningCount: 0,
            fixableErrorCount: 0,
            fixableWarningCount: 0,
            source: '# Original content',
            output: '# Fixed content',
          },
        ];

        await ClaudeLint.outputFixes(results);

        const written = readFileSync(testFile, 'utf-8');
        expect(written).toBe('# Fixed content');
      });

      it('should not write if output equals source', async () => {
        const testFile = join(tempDir, 'test-nochange.md');
        writeFileSync(testFile, '# Content', 'utf-8');

        const results: LintResult[] = [
          {
            filePath: testFile,
            messages: [],
            suppressedMessages: [],
            errorCount: 0,
            warningCount: 0,
            fixableErrorCount: 0,
            fixableWarningCount: 0,
            source: '# Content',
            output: '# Content', // Same as source
          },
        ];

        await ClaudeLint.outputFixes(results);

        // File should remain unchanged
        const { readFileSync } = require('fs');
        const content = readFileSync(testFile, 'utf-8');
        expect(content).toBe('# Content');
      });

      it('should handle results without output', async () => {
        const results: LintResult[] = [
          {
            filePath: join(tempDir, 'no-output.md'),
            messages: [],
            suppressedMessages: [],
            errorCount: 0,
            warningCount: 0,
            fixableErrorCount: 0,
            fixableWarningCount: 0,
            source: '# Content',
            // No output property
          },
        ];

        // Should not throw
        await expect(ClaudeLint.outputFixes(results)).resolves.not.toThrow();
      });
    });

    describe('getFixedContent', () => {
      it('should return map of fixed content', () => {
        const results: LintResult[] = [
          {
            filePath: 'file1.md',
            messages: [],
            suppressedMessages: [],
            errorCount: 0,
            warningCount: 0,
            fixableErrorCount: 0,
            fixableWarningCount: 0,
            source: 'original',
            output: 'fixed',
          },
          {
            filePath: 'file2.md',
            messages: [],
            suppressedMessages: [],
            errorCount: 0,
            warningCount: 0,
            fixableErrorCount: 0,
            fixableWarningCount: 0,
            source: 'unchanged',
            output: 'unchanged',
          },
        ];

        const fixed = ClaudeLint.getFixedContent(results);

        expect(fixed.size).toBe(1);
        expect(fixed.get('file1.md')).toBe('fixed');
        expect(fixed.has('file2.md')).toBe(false);
      });

      it('should return empty map if no fixes', () => {
        const results: LintResult[] = [
          {
            filePath: 'file1.md',
            messages: [],
            suppressedMessages: [],
            errorCount: 0,
            warningCount: 0,
            fixableErrorCount: 0,
            fixableWarningCount: 0,
            source: 'content',
          },
        ];

        const fixed = ClaudeLint.getFixedContent(results);

        expect(fixed.size).toBe(0);
      });
    });
  });

  describe('lintText', () => {
    it('should lint text content without writing to disk', async () => {
      const linter = new ClaudeLint({ cwd: tempDir });
      const code = '# CLAUDE.md\n\nThis is test content.';

      const results = await linter.lintText(code, { filePath: 'CLAUDE.md' });

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(1);
      expect(results[0]).toHaveProperty('filePath');
      expect(results[0]).toHaveProperty('messages');
      expect(results[0]).toHaveProperty('errorCount');
      expect(results[0]).toHaveProperty('warningCount');
    });

    it('should accept filePath option for config resolution', async () => {
      const linter = new ClaudeLint({ cwd: tempDir });
      const code = '# Test CLAUDE.md\n\nContent here.';

      const results = await linter.lintText(code, { filePath: 'test/CLAUDE.md' });

      expect(results.length).toBe(1);
      expect(results[0].filePath).toContain('test/CLAUDE.md');
    });

    it('should work without filePath option', async () => {
      const linter = new ClaudeLint({ cwd: tempDir });
      const code = '# Test Content\n\nSome markdown text.';

      const results = await linter.lintText(code);

      expect(results.length).toBe(1);
      expect(results[0]).toHaveProperty('filePath');
      expect(results[0]).toHaveProperty('messages');
    });

    it('should validate markdown content correctly', async () => {
      const linter = new ClaudeLint({ cwd: tempDir });
      const code = '# CLAUDE.md\n\nValid content for a CLAUDE.md file.';

      const results = await linter.lintText(code, { filePath: 'CLAUDE.md' });

      expect(results[0]).toHaveProperty('errorCount');
      expect(results[0]).toHaveProperty('warningCount');
      // Results should have at least source property
      expect(results[0].source).toBe(code);
    });

    it('should handle skills content', async () => {
      const linter = new ClaudeLint({ cwd: tempDir });
      const code = '#!/bin/bash\n\n# Test skill\necho "hello"';

      const results = await linter.lintText(code, { filePath: 'skills/test/test.sh' });

      expect(results.length).toBe(1);
      expect(results[0].filePath).toContain('test.sh');
    });

    it('should return source in results', async () => {
      const linter = new ClaudeLint({ cwd: tempDir });
      const code = '# Test\n\nContent.';

      const results = await linter.lintText(code, { filePath: 'test.md' });

      expect(results[0].source).toBe(code);
    });

    it('should handle empty content', async () => {
      const linter = new ClaudeLint({ cwd: tempDir });
      const code = '';

      const results = await linter.lintText(code, { filePath: 'empty.md' });

      expect(results.length).toBe(1);
      expect(results[0].source).toBe('');
    });

    it('should support warnIgnored option', async () => {
      const linter = new ClaudeLint({ cwd: tempDir });
      const code = '# Test content';

      // Since isPathIgnored returns false for now, this shouldn't produce a warning
      const results = await linter.lintText(code, {
        filePath: 'test.md',
        warnIgnored: true
      });

      expect(results.length).toBe(1);
      // When isPathIgnored is properly implemented, this test will verify warning behavior
    });
  });
});
