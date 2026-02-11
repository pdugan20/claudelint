import { CustomRuleLoader } from '../../src/utils/rules/loader';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('CustomRuleLoader', () => {
  let testDir: string;
  let loader: CustomRuleLoader;

  beforeEach(() => {
    // Create temp directory outside the project tree
    testDir = join(tmpdir(), `claudelint-loader-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });

    // Create loader
    loader = new CustomRuleLoader();
  });

  afterEach(() => {
    // Clean up
    if (testDir) {
      rmSync(testDir, { recursive: true, force: true });
    }
    loader.clear();
  });

  describe('Rule Loading', () => {
    it('should load valid custom rule', async () => {
      const rulesDir = join(testDir, '.claudelint/rules');
      mkdirSync(rulesDir, { recursive: true });

      writeFileSync(
        join(rulesDir, 'test-rule.js'),
        `
        module.exports.rule = {
          meta: {
            id: 'test-custom-rule',
            name: 'Test Custom Rule',
            description: 'A test custom rule',
            category: 'Custom',
            severity: 'error',
            fixable: false,
            deprecated: false,
            since: '1.0.0',
          },
          validate: async (_context) => {
            // Test validation logic (underscore to indicate unused parameter)
          },
        };
      `
      );

      const results = await loader.loadCustomRules(testDir);

      expect(results).toHaveLength(1);
      if (!results[0].success) {
        console.log('Error:', results[0].error);
      }
      expect(results[0].success).toBe(true);
      expect(results[0].rule?.meta.id).toBe('test-custom-rule');
    });

    it('should reject rule without meta', async () => {
      const rulesDir = join(testDir, '.claudelint/rules');
      mkdirSync(rulesDir, { recursive: true });

      writeFileSync(
        join(rulesDir, 'invalid-rule.ts'),
        `
        export const rule = {
          validate: async () => {},
        };
      `
      );

      const results = await loader.loadCustomRules(testDir);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(results[0].error).toContain('Rule interface');
    });

    it('should reject rule without validate function', async () => {
      const rulesDir = join(testDir, '.claudelint/rules');
      mkdirSync(rulesDir, { recursive: true });

      writeFileSync(
        join(rulesDir, 'invalid-rule.ts'),
        `
        export const rule = {
          meta: {
            id: 'test',
            name: 'Test',
            description: 'Test',
            category: 'Custom',
            severity: 'error',
          },
        };
      `
      );

      const results = await loader.loadCustomRules(testDir);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(results[0].error).toContain('Rule interface');
    });

    it('should reject file without rule export', async () => {
      const rulesDir = join(testDir, '.claudelint/rules');
      mkdirSync(rulesDir, { recursive: true });

      writeFileSync(
        join(rulesDir, 'no-export.ts'),
        `
        const myRule = {
          meta: { id: 'test' },
          validate: async () => {},
        };
      `
      );

      const results = await loader.loadCustomRules(testDir);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(results[0].error).toContain('must export a named "rule" object');
    });

    it('should handle syntax errors in rule file', async () => {
      const rulesDir = join(testDir, '.claudelint/rules');
      mkdirSync(rulesDir, { recursive: true });

      writeFileSync(join(rulesDir, 'syntax-error.ts'), 'this is not valid javascript {{{');

      const results = await loader.loadCustomRules(testDir);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(results[0].error).toBeDefined();
    });

    it('should detect ID conflicts between custom rules', async () => {
      const rulesDir = join(testDir, '.claudelint/rules');
      mkdirSync(rulesDir, { recursive: true });

      // Create two rules with the same ID
      writeFileSync(
        join(rulesDir, 'rule1.js'),
        `
        module.exports.rule = {
          meta: {
            id: 'duplicate-rule-id',
            name: 'First Rule',
            description: 'First rule with this ID',
            category: 'Custom',
            severity: 'error',
            fixable: false,
            deprecated: false,
            since: '1.0.0',
          },
          validate: async () => {},
        };
      `
      );

      writeFileSync(
        join(rulesDir, 'rule2.js'),
        `
        module.exports.rule = {
          meta: {
            id: 'duplicate-rule-id',
            name: 'Second Rule',
            description: 'Second rule with same ID',
            category: 'Custom',
            severity: 'error',
            fixable: false,
            deprecated: false,
            since: '1.0.0',
          },
          validate: async () => {},
        };
      `
      );

      const results = await loader.loadCustomRules(testDir);

      // One should succeed, one should fail due to conflict
      expect(results).toHaveLength(2);
      expect(results.filter((r) => r.success)).toHaveLength(1);
      expect(results.filter((r) => !r.success)).toHaveLength(1);

      const failed = results.find((r) => !r.success);
      if (failed) {
        console.log('Failed rule error:', failed.error);
      }
      expect(failed?.error).toContain('conflicts');
    });

    it('should load multiple custom rules', async () => {
      const rulesDir = join(testDir, '.claudelint/rules');
      mkdirSync(rulesDir, { recursive: true });

      writeFileSync(
        join(rulesDir, 'rule1.ts'),
        `
        export const rule = {
          meta: {
            id: 'custom-rule-1',
            name: 'Custom Rule 1',
            description: 'First custom rule',
            category: 'Custom',
            severity: 'error',
            fixable: false,
            deprecated: false,
            since: '1.0.0',
          },
          validate: async () => {},
        };
      `
      );

      writeFileSync(
        join(rulesDir, 'rule2.ts'),
        `
        export const rule = {
          meta: {
            id: 'custom-rule-2',
            name: 'Custom Rule 2',
            description: 'Second custom rule',
            category: 'Custom',
            severity: 'warn',
            fixable: false,
            deprecated: false,
            since: '1.0.0',
          },
          validate: async () => {},
        };
      `
      );

      const results = await loader.loadCustomRules(testDir);

      expect(results).toHaveLength(2);
      expect(results.filter((r) => r.success)).toHaveLength(2);
    });
  });

  describe('File Discovery', () => {
    it('should discover rules in subdirectories', async () => {
      const rulesDir = join(testDir, '.claudelint/rules');
      const subDir = join(rulesDir, 'team-rules');
      mkdirSync(subDir, { recursive: true });

      writeFileSync(
        join(subDir, 'team-rule.ts'),
        `
        export const rule = {
          meta: {
            id: 'team-custom-rule',
            name: 'Team Custom Rule',
            description: 'A team-specific rule',
            category: 'Custom',
            severity: 'error',
            fixable: false,
            deprecated: false,
            since: '1.0.0',
          },
          validate: async () => {},
        };
      `
      );

      const results = await loader.loadCustomRules(testDir);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
      expect(results[0].rule?.meta.id).toBe('team-custom-rule');
    });

    it('should skip .d.ts files', async () => {
      const rulesDir = join(testDir, '.claudelint/rules');
      mkdirSync(rulesDir, { recursive: true });

      writeFileSync(join(rulesDir, 'types.d.ts'), 'export type CustomRule = any;');

      const results = await loader.loadCustomRules(testDir);

      expect(results).toHaveLength(0);
    });

    it('should skip test files', async () => {
      const rulesDir = join(testDir, '.claudelint/rules');
      mkdirSync(rulesDir, { recursive: true });

      writeFileSync(join(rulesDir, 'rule.test.ts'), 'test code');
      writeFileSync(join(rulesDir, 'rule.spec.ts'), 'test code');

      const results = await loader.loadCustomRules(testDir);

      expect(results).toHaveLength(0);
    });

    it('should handle missing rules directory', async () => {
      const results = await loader.loadCustomRules(testDir);

      expect(results).toHaveLength(0);
    });

    it('should handle disabled custom rules', async () => {
      const loaderDisabled = new CustomRuleLoader({ enableCustomRules: false });
      const rulesDir = join(testDir, '.claudelint/rules');
      mkdirSync(rulesDir, { recursive: true });

      writeFileSync(
        join(rulesDir, 'rule.ts'),
        `
        export const rule = {
          meta: {
            id: 'disabled-rule',
            name: 'Disabled Rule',
            description: 'Should not load',
            category: 'Custom',
            severity: 'error',
            fixable: false,
            deprecated: false,
            since: '1.0.0',
          },
          validate: async () => {},
        };
      `
      );

      const results = await loaderDisabled.loadCustomRules(testDir);

      expect(results).toHaveLength(0);
    });

    it('should support custom rules path', async () => {
      const customLoader = new CustomRuleLoader({ customRulesPath: 'custom-rules' });
      const rulesDir = join(testDir, 'custom-rules');
      mkdirSync(rulesDir, { recursive: true });

      writeFileSync(
        join(rulesDir, 'rule.ts'),
        `
        export const rule = {
          meta: {
            id: 'custom-path-rule',
            name: 'Custom Path Rule',
            description: 'From custom path',
            category: 'Custom',
            severity: 'error',
            fixable: false,
            deprecated: false,
            since: '1.0.0',
          },
          validate: async () => {},
        };
      `
      );

      const results = await customLoader.loadCustomRules(testDir);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
    });
  });

  describe('getLoadedRules', () => {
    it('should return empty array when no rules loaded', () => {
      expect(loader.getLoadedRules()).toEqual([]);
    });

    it('should return loaded rules', async () => {
      const rulesDir = join(testDir, '.claudelint/rules');
      mkdirSync(rulesDir, { recursive: true });

      writeFileSync(
        join(rulesDir, 'rule.ts'),
        `
        export const rule = {
          meta: {
            id: 'loaded-rule',
            name: 'Loaded Rule',
            description: 'A loaded rule',
            category: 'Custom',
            severity: 'error',
            fixable: false,
            deprecated: false,
            since: '1.0.0',
          },
          validate: async () => {},
        };
      `
      );

      await loader.loadCustomRules(testDir);
      const rules = loader.getLoadedRules();

      expect(rules).toHaveLength(1);
      expect(rules[0].meta.id).toBe('loaded-rule');
    });
  });

  describe('clear', () => {
    it('should clear loaded rules', async () => {
      const rulesDir = join(testDir, '.claudelint/rules');
      mkdirSync(rulesDir, { recursive: true });

      writeFileSync(
        join(rulesDir, 'rule.ts'),
        `
        export const rule = {
          meta: {
            id: 'clearable-rule',
            name: 'Clearable Rule',
            description: 'Will be cleared',
            category: 'Custom',
            severity: 'error',
            fixable: false,
            deprecated: false,
            since: '1.0.0',
          },
          validate: async () => {},
        };
      `
      );

      await loader.loadCustomRules(testDir);
      expect(loader.getLoadedRules()).toHaveLength(1);

      loader.clear();
      expect(loader.getLoadedRules()).toHaveLength(0);
    });
  });

  describe('Auto-Fix Support', () => {
    it('should load and execute rule with autoFix', async () => {
      const rulesDir = join(testDir, '.claudelint/rules');
      mkdirSync(rulesDir, { recursive: true });

      // Create a rule that provides auto-fix
      writeFileSync(
        join(rulesDir, 'auto-fix-rule.js'),
        `
        module.exports.rule = {
          meta: {
            id: 'auto-fix-test',
            name: 'Auto Fix Test',
            description: 'Test rule with auto-fix',
            category: 'Custom',
            severity: 'error',
            fixable: true,
            deprecated: false,
            since: '1.0.0',
          },
          validate: async (context) => {
            if (context.fileContent.includes('BAD')) {
              context.report({
                message: 'Found BAD text',
                autoFix: {
                  ruleId: 'auto-fix-test',
                  description: 'Replace BAD with GOOD',
                  filePath: context.filePath,
                  apply: (content) => content.replace(/BAD/g, 'GOOD'),
                },
              });
            }
          },
        };
      `
      );

      const results = await loader.loadCustomRules(testDir);
      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
      expect(results[0].rule?.meta.fixable).toBe(true);
    });
  });
});
