/**
 * Integration tests for custom rules loading
 * Tests end-to-end custom rule functionality
 */

import { CustomRuleLoader } from '../../src/utils/custom-rule-loader';
import { RuleRegistry } from '../../src/utils/rule-registry';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';

describe('Custom Rules Integration', () => {
  let testDir: string;

  beforeEach(() => {
    // Create temp directory
    testDir = join(__dirname, '../__temp__', `integration-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up
    if (testDir) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should load custom rules and register them with RuleRegistry', async () => {
    const rulesDir = join(testDir, '.claudelint/rules');
    mkdirSync(rulesDir, { recursive: true });

    // Create a custom rule
    writeFileSync(
      join(rulesDir, 'integration-rule.js'),
      `
      module.exports.rule = {
        meta: {
          id: 'integration-test-rule',
          name: 'Integration Test Rule',
          description: 'Tests integration with RuleRegistry',
          category: 'Custom',
          severity: 'error',
          fixable: false,
          deprecated: false,
          since: '1.0.0',
        },
        validate: async (context) => {
          if (context.fileContent.includes('ERROR')) {
            context.report({ message: 'Found ERROR keyword' });
          }
        },
      };
    `
    );

    const loader = new CustomRuleLoader();
    const results = await loader.loadCustomRules(testDir);

    // Verify rule loaded
    expect(results).toHaveLength(1);
    if (!results[0].success) {
      console.log('Error:', results[0].error);
    }
    expect(results[0].success).toBe(true);

    // Verify rule registered with RuleRegistry
    expect(RuleRegistry.exists('integration-test-rule')).toBe(true);
    const metadata = RuleRegistry.get('integration-test-rule');
    expect(metadata?.category).toBe('Custom');

    // Cleanup
    loader.clear();
  });

  it('should load multiple custom rules from subdirectories', async () => {
    const rulesDir = join(testDir, '.claudelint/rules');
    const teamDir = join(rulesDir, 'team');
    const projectDir = join(rulesDir, 'project');

    mkdirSync(teamDir, { recursive: true });
    mkdirSync(projectDir, { recursive: true });

    // Create rules in different subdirectories
    writeFileSync(
      join(rulesDir, 'root-rule.js'),
      `
      module.exports.rule = {
        meta: {
          id: 'root-custom-rule',
          name: 'Root Custom Rule',
          description: 'From root directory',
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
      join(teamDir, 'team-rule.js'),
      `
      module.exports.rule = {
        meta: {
          id: 'team-custom-rule',
          name: 'Team Custom Rule',
          description: 'From team directory',
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

    writeFileSync(
      join(projectDir, 'project-rule.js'),
      `
      module.exports.rule = {
        meta: {
          id: 'project-custom-rule',
          name: 'Project Custom Rule',
          description: 'From project directory',
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

    const loader = new CustomRuleLoader();
    const results = await loader.loadCustomRules(testDir);

    // Verify all rules loaded
    expect(results).toHaveLength(3);
    expect(results.filter((r) => r.success)).toHaveLength(3);

    // Verify all registered
    expect(RuleRegistry.exists('root-custom-rule')).toBe(true);
    expect(RuleRegistry.exists('team-custom-rule')).toBe(true);
    expect(RuleRegistry.exists('project-custom-rule')).toBe(true);

    // Cleanup
    loader.clear();
  });

  it('should handle mix of valid and invalid rules gracefully', async () => {
    const rulesDir = join(testDir, '.claudelint/rules');
    mkdirSync(rulesDir, { recursive: true });

    // Valid rule
    writeFileSync(
      join(rulesDir, 'valid-rule.js'),
      `
      module.exports.rule = {
        meta: {
          id: 'valid-mixed-rule',
          name: 'Valid Mixed Rule',
          description: 'This one is valid',
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

    // Invalid rule (no meta)
    writeFileSync(
      join(rulesDir, 'invalid-rule.js'),
      `
      module.exports.rule = {
        validate: async () => {},
      };
    `
    );

    // Another valid rule
    writeFileSync(
      join(rulesDir, 'another-valid.js'),
      `
      module.exports.rule = {
        meta: {
          id: 'another-valid-rule',
          name: 'Another Valid Rule',
          description: 'Also valid',
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

    const loader = new CustomRuleLoader();
    const results = await loader.loadCustomRules(testDir);

    // Verify mixed results
    expect(results).toHaveLength(3);
    expect(results.filter((r) => r.success)).toHaveLength(2);
    expect(results.filter((r) => !r.success)).toHaveLength(1);

    // Valid rules should be registered
    expect(RuleRegistry.exists('valid-mixed-rule')).toBe(true);
    expect(RuleRegistry.exists('another-valid-rule')).toBe(true);

    // Cleanup
    loader.clear();
  });

  it('should respect custom rules path configuration', async () => {
    const customPath = 'my-custom-rules';
    const rulesDir = join(testDir, customPath);
    mkdirSync(rulesDir, { recursive: true });

    writeFileSync(
      join(rulesDir, 'custom-path-rule.js'),
      `
      module.exports.rule = {
        meta: {
          id: 'custom-path-rule',
          name: 'Custom Path Rule',
          description: 'Loaded from custom path',
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

    const loader = new CustomRuleLoader({ customRulesPath: customPath });
    const results = await loader.loadCustomRules(testDir);

    expect(results).toHaveLength(1);
    expect(results[0].success).toBe(true);
    expect(RuleRegistry.exists('custom-path-rule')).toBe(true);

    // Cleanup
    loader.clear();
  });

  it('should not load rules when disabled', async () => {
    const rulesDir = join(testDir, '.claudelint/rules');
    mkdirSync(rulesDir, { recursive: true });

    writeFileSync(
      join(rulesDir, 'disabled-rule.js'),
      `
      module.exports.rule = {
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

    const loader = new CustomRuleLoader({ enableCustomRules: false });
    const results = await loader.loadCustomRules(testDir);

    expect(results).toHaveLength(0);
    expect(RuleRegistry.exists('disabled-rule')).toBe(false);
  });

  it('should filter out non-rule files correctly', async () => {
    const rulesDir = join(testDir, '.claudelint/rules');
    mkdirSync(rulesDir, { recursive: true });

    // Create various non-rule files
    writeFileSync(join(rulesDir, 'types.d.ts'), 'export type CustomRule = any;');
    writeFileSync(join(rulesDir, 'helper.test.ts'), 'test helper');
    writeFileSync(join(rulesDir, 'utils.spec.ts'), 'spec file');
    writeFileSync(join(rulesDir, 'README.md'), '# Rules');

    // Create one valid rule
    writeFileSync(
      join(rulesDir, 'actual-rule.js'),
      `
      module.exports.rule = {
        meta: {
          id: 'actual-rule',
          name: 'Actual Rule',
          description: 'The only real rule',
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

    const loader = new CustomRuleLoader();
    const results = await loader.loadCustomRules(testDir);

    // Should only load the actual rule
    expect(results).toHaveLength(1);
    expect(results[0].rule?.meta.id).toBe('actual-rule');

    // Cleanup
    loader.clear();
  });
});
