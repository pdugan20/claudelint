import { ConfigResolver } from '../../src/utils/config/resolver';
import { RuleRegistry } from '../../src/utils/rules/registry';
import { ClaudeLintConfig } from '../../src/utils/config/types';
import { RuleId } from '../../src/rules/rule-ids';
import { DiagnosticCollector } from '../../src/utils/diagnostics';
import { z } from 'zod';

describe('ConfigResolver', () => {
  // Register test rules before all tests
  beforeAll(() => {
    // Clear any existing rules
    RuleRegistry.clear();

    // Register test rules using actual rule IDs for testing
    RuleRegistry.register({
      id: 'claude-md-size-error',
      name: 'Size Error',
      description: 'Test rule without options',
      category: 'CLAUDE.md',
      severity: 'error',
      fixable: false,
      deprecated: false,
      since: '1.0.0',
    });

    RuleRegistry.register({
      id: 'claude-md-size-warning',
      name: 'Size Warning',
      description: 'Test rule with options',
      category: 'CLAUDE.md',
      severity: 'warn',
      fixable: false,
      deprecated: false,
      since: '1.0.0',
      schema: z.object({
        maxSize: z.number().positive().optional(),
        enabled: z.boolean().optional(),
      }),
      defaultOptions: {
        maxSize: 100,
        enabled: true,
      },
    });

    RuleRegistry.register({
      id: 'skill-missing-shebang',
      name: 'Skill Missing Shebang',
      description: 'Test rule for overrides',
      category: 'Skills',
      severity: 'error',
      fixable: false,
      deprecated: false,
      since: '1.0.0',
    });
  });

  afterAll(() => {
    RuleRegistry.clear();
  });

  describe('resolveForFile', () => {
    it('should resolve base rules for a file', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-error': 'error',
          'claude-md-size-warning': 'warn',
        },
      };

      const resolver = new ConfigResolver(config);
      const resolved = resolver.resolveForFile('CLAUDE.md');

      expect(resolved.size).toBe(2);
      expect(resolved.get('claude-md-size-error')).toEqual({
        ruleId: 'claude-md-size-error',
        severity: 'error',
        options: [],
      });
      expect(resolved.get('claude-md-size-warning')).toEqual({
        ruleId: 'claude-md-size-warning',
        severity: 'warn',
        options: [],
      });
    });

    it('should apply file-specific overrides', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-error': 'error',
          'claude-md-size-warning': 'warn',
        },
        overrides: [
          {
            files: ['**/*.skill.md'],
            rules: {
              'claude-md-size-error': 'off',
              'skill-missing-shebang': 'error',
            },
          },
        ],
      };

      const resolver = new ConfigResolver(config);
      const resolved = resolver.resolveForFile('test.skill.md');

      expect(resolved.get('claude-md-size-error')?.severity).toBe('off');
      expect(resolved.get('claude-md-size-warning')?.severity).toBe('warn');
      expect(resolved.get('skill-missing-shebang')?.severity).toBe('error');
    });

    it('should respect override priority (last override wins)', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-error': 'error',
        },
        overrides: [
          {
            files: ['**/*.md'],
            rules: {
              'claude-md-size-error': 'warn',
            },
          },
          {
            files: ['docs/**/*.md'],
            rules: {
              'claude-md-size-error': 'off',
            },
          },
        ],
      };

      const resolver = new ConfigResolver(config);

      // First override matches
      const resolved1 = resolver.resolveForFile('README.md');
      expect(resolved1.get('claude-md-size-error')?.severity).toBe('warn');

      // Both overrides match, last one wins
      const resolved2 = resolver.resolveForFile('docs/guide.md');
      expect(resolved2.get('claude-md-size-error')?.severity).toBe('off');
    });

    it('should cache resolved configurations', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-error': 'error',
        },
      };

      const resolver = new ConfigResolver(config);

      const resolved1 = resolver.resolveForFile('test.md');
      const resolved2 = resolver.resolveForFile('test.md');

      // Same instance = cached
      expect(resolved1).toBe(resolved2);

      const stats = resolver.getCacheStats();
      expect(stats.size).toBe(1);
      expect(stats.files).toContain('test.md');
    });
  });

  describe('glob pattern matching', () => {
    it('should match exact filenames', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-error': 'error',
        },
        overrides: [
          {
            files: ['CLAUDE.md'],
            rules: {
              'claude-md-size-error': 'off',
            },
          },
        ],
      };

      const resolver = new ConfigResolver(config);

      const resolved1 = resolver.resolveForFile('CLAUDE.md');
      expect(resolved1.get('claude-md-size-error')?.severity).toBe('off');

      const resolved2 = resolver.resolveForFile('README.md');
      expect(resolved2.get('claude-md-size-error')?.severity).toBe('error');
    });

    it('should match wildcard patterns', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-error': 'error',
        },
        overrides: [
          {
            files: ['*.skill.md'],
            rules: {
              'claude-md-size-error': 'off',
            },
          },
        ],
      };

      const resolver = new ConfigResolver(config);

      const resolved1 = resolver.resolveForFile('test.skill.md');
      expect(resolved1.get('claude-md-size-error')?.severity).toBe('off');

      const resolved2 = resolver.resolveForFile('test.md');
      expect(resolved2.get('claude-md-size-error')?.severity).toBe('error');
    });

    it('should match recursive patterns', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-error': 'error',
        },
        overrides: [
          {
            files: ['**/*.skill.md'],
            rules: {
              'claude-md-size-error': 'off',
            },
          },
        ],
      };

      const resolver = new ConfigResolver(config);

      const resolved1 = resolver.resolveForFile('skills/example.skill.md');
      expect(resolved1.get('claude-md-size-error')?.severity).toBe('off');

      const resolved2 = resolver.resolveForFile('skills/nested/deep/test.skill.md');
      expect(resolved2.get('claude-md-size-error')?.severity).toBe('off');
    });

    it('should match directory patterns', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-error': 'error',
        },
        overrides: [
          {
            files: ['docs/**'],
            rules: {
              'claude-md-size-error': 'warn',
            },
          },
        ],
      };

      const resolver = new ConfigResolver(config);

      const resolved1 = resolver.resolveForFile('docs/guide.md');
      expect(resolved1.get('claude-md-size-error')?.severity).toBe('warn');

      const resolved2 = resolver.resolveForFile('README.md');
      expect(resolved2.get('claude-md-size-error')?.severity).toBe('error');
    });
  });

  describe('option parsing', () => {
    it('should parse string severity format', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-error': 'error',
          'claude-md-size-warning': 'warn',
          'skill-missing-shebang': 'off',
        },
      };

      const resolver = new ConfigResolver(config);
      const resolved = resolver.resolveForFile('test.md');

      expect(resolved.get('claude-md-size-error')).toEqual({
        ruleId: 'claude-md-size-error',
        severity: 'error',
        options: [],
      });
      expect(resolved.get('claude-md-size-warning')).toEqual({
        ruleId: 'claude-md-size-warning',
        severity: 'warn',
        options: [],
      });
      expect(resolved.get('skill-missing-shebang')).toEqual({
        ruleId: 'skill-missing-shebang',
        severity: 'off',
        options: [],
      });
    });

    it('should parse object format with options', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-warning': {
            severity: 'error',
            options: {
              maxSize: 200,
              enabled: false,
            },
          },
        },
      };

      const resolver = new ConfigResolver(config);
      const resolved = resolver.resolveForFile('test.md');

      expect(resolved.get('claude-md-size-warning')).toEqual({
        ruleId: 'claude-md-size-warning',
        severity: 'error',
        options: [{ maxSize: 200, enabled: false }],
      });
    });

    it('should wrap options in array following ESLint convention', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-warning': {
            severity: 'error',
            options: { maxSize: 150 },
          },
        },
      };

      const resolver = new ConfigResolver(config);
      const resolved = resolver.resolveForFile('test.md');

      const options = resolved.get('claude-md-size-warning')?.options;
      expect(Array.isArray(options)).toBe(true);
      expect(options).toEqual([{ maxSize: 150 }]);
    });
  });

  describe('schema validation', () => {
    it('should validate options against schema', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-warning': {
            severity: 'error',
            options: {
              maxSize: 200,
              enabled: true,
            },
          },
        },
      };

      const resolver = new ConfigResolver(config);

      // Should not throw with valid options
      expect(() => resolver.resolveForFile('test.md')).not.toThrow();
    });

    it('should reject invalid options that fail schema validation', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-warning': {
            severity: 'error',
            options: {
              maxSize: -100, // Invalid: must be positive
              enabled: true,
            },
          },
        },
      };

      const diagnostics = new DiagnosticCollector();
      const resolver = new ConfigResolver(config, diagnostics);
      const resolved = resolver.resolveForFile('test.md');

      // Should collect warning and disable rule (not throw)
      const warnings = diagnostics.getWarnings();
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0].message).toContain('Invalid options');
      expect(warnings[0].message).toContain('claude-md-size-warning');
      expect(warnings[0].source).toBe('ConfigResolver');
      expect(warnings[0].code).toBe('CONFIG_INVALID_OPTIONS');
      expect(resolved.has('claude-md-size-warning')).toBe(false);
    });

    it('should reject options with wrong types', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-warning': {
            severity: 'error',
            options: {
              maxSize: 'not a number', // Invalid: should be number
            },
          },
        },
      };

      const diagnostics = new DiagnosticCollector();
      const resolver = new ConfigResolver(config, diagnostics);
      const resolved = resolver.resolveForFile('test.md');

      // Should collect warning and disable rule
      const warnings = diagnostics.getWarnings();
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0].message).toContain('Invalid options');
      expect(warnings[0].message).toContain('claude-md-size-warning');
      expect(warnings[0].source).toBe('ConfigResolver');
      expect(warnings[0].code).toBe('CONFIG_INVALID_OPTIONS');
      expect(resolved.has('claude-md-size-warning')).toBe(false);
    });

    it('should allow valid partial options', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-warning': {
            severity: 'error',
            options: {
              maxSize: 150, // Only one of two optional fields
            },
          },
        },
      };

      const resolver = new ConfigResolver(config);

      expect(() => resolver.resolveForFile('test.md')).not.toThrow();
      const resolved = resolver.resolveForFile('test.md');
      expect(resolved.get('claude-md-size-warning')?.options).toEqual([{ maxSize: 150 }]);
    });
  });

  describe('isRuleEnabled', () => {
    it('should return true for enabled rules', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-error': 'error',
          'claude-md-size-warning': 'warn',
        },
      };

      const resolver = new ConfigResolver(config);

      expect(resolver.isRuleEnabled('claude-md-size-error', 'test.md')).toBe(true);
      expect(resolver.isRuleEnabled('claude-md-size-warning', 'test.md')).toBe(true);
    });

    it('should return false for disabled rules', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-error': 'off',
        },
      };

      const resolver = new ConfigResolver(config);

      expect(resolver.isRuleEnabled('claude-md-size-error', 'test.md')).toBe(false);
    });

    it('should return true for unconfigured rules that exist in registry', () => {
      const config: ClaudeLintConfig = {
        rules: {},
      };

      const resolver = new ConfigResolver(config);

      // Rule exists in registry but not configured = enabled by default
      expect(resolver.isRuleEnabled('claude-md-size-error', 'test.md')).toBe(true);
    });

    it('should return false for unconfigured rules that do not exist in registry', () => {
      const config: ClaudeLintConfig = {
        rules: {},
      };

      const resolver = new ConfigResolver(config);

      // Explicitly testing runtime behavior with invalid rule ID (could happen with plugins)
      const invalidRuleId = 'non-existent-rule' as RuleId;
      expect(resolver.isRuleEnabled(invalidRuleId, 'test.md')).toBe(false);
    });

    it('should respect file-specific overrides', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-error': 'error',
        },
        overrides: [
          {
            files: ['**/*.skill.md'],
            rules: {
              'claude-md-size-error': 'off',
            },
          },
        ],
      };

      const resolver = new ConfigResolver(config);

      expect(resolver.isRuleEnabled('claude-md-size-error', 'README.md')).toBe(true);
      expect(resolver.isRuleEnabled('claude-md-size-error', 'test.skill.md')).toBe(false);
    });
  });

  describe('getRuleOptions', () => {
    it('should return configured options', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-warning': {
            severity: 'error',
            options: {
              maxSize: 200,
              enabled: false,
            },
          },
        },
      };

      const resolver = new ConfigResolver(config);
      const options = resolver.getRuleOptions('claude-md-size-warning', 'test.md');

      expect(options).toEqual([{ maxSize: 200, enabled: false }]);
    });

    it('should return default options for unconfigured rules', () => {
      const config: ClaudeLintConfig = {
        rules: {},
      };

      const resolver = new ConfigResolver(config);
      const options = resolver.getRuleOptions('claude-md-size-warning', 'test.md');

      // Should return default options from registry
      expect(options).toEqual([{ maxSize: 100, enabled: true }]);
    });

    it('should return empty array for rules without options', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-error': 'error',
        },
      };

      const resolver = new ConfigResolver(config);
      const options = resolver.getRuleOptions('claude-md-size-error', 'test.md');

      expect(options).toEqual([]);
    });

    it('should return empty array for unconfigured rules without defaults', () => {
      const config: ClaudeLintConfig = {
        rules: {},
      };

      const resolver = new ConfigResolver(config);
      const options = resolver.getRuleOptions('claude-md-size-error', 'test.md');

      expect(options).toEqual([]);
    });

    it('should respect file-specific override options', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-warning': {
            severity: 'error',
            options: {
              maxSize: 100,
            },
          },
        },
        overrides: [
          {
            files: ['**/*.skill.md'],
            rules: {
              'claude-md-size-warning': {
                severity: 'warn',
                options: {
                  maxSize: 300,
                },
              },
            },
          },
        ],
      };

      const resolver = new ConfigResolver(config);

      const options1 = resolver.getRuleOptions('claude-md-size-warning', 'README.md');
      expect(options1).toEqual([{ maxSize: 100 }]);

      const options2 = resolver.getRuleOptions('claude-md-size-warning', 'test.skill.md');
      expect(options2).toEqual([{ maxSize: 300 }]);
    });
  });

  describe('config caching', () => {
    it('should cache resolved configurations per file', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-error': 'error',
        },
      };

      const resolver = new ConfigResolver(config);

      resolver.resolveForFile('file1.md');
      resolver.resolveForFile('file2.md');
      resolver.resolveForFile('file1.md'); // Cached

      const stats = resolver.getCacheStats();
      expect(stats.size).toBe(2);
      expect(stats.files).toContain('file1.md');
      expect(stats.files).toContain('file2.md');
    });

    it('should clear cache when requested', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-error': 'error',
        },
      };

      const resolver = new ConfigResolver(config);

      resolver.resolveForFile('file1.md');
      resolver.resolveForFile('file2.md');

      expect(resolver.getCacheStats().size).toBe(2);

      resolver.clearCache();

      expect(resolver.getCacheStats().size).toBe(0);
    });

    it('should provide accurate cache statistics', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-error': 'error',
        },
      };

      const resolver = new ConfigResolver(config);

      resolver.resolveForFile('a.md');
      resolver.resolveForFile('b.md');
      resolver.resolveForFile('c.md');

      const stats = resolver.getCacheStats();
      expect(stats.size).toBe(3);
      expect(stats.files).toEqual(['a.md', 'b.md', 'c.md']);
    });
  });
});
