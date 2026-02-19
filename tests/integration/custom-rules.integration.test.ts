/**
 * Integration tests for custom rules loading
 * Tests end-to-end custom rule functionality
 */

import { CustomRuleLoader } from '../../src/utils/rules/loader';
import { RuleRegistry } from '../../src/utils/rules/registry';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('Custom Rules Integration', () => {
  let testDir: string;

  beforeEach(() => {
    // Create temp directory outside the project tree
    testDir = join(tmpdir(), `claudelint-integration-${Date.now()}`);
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
          category: 'CLAUDE.md',
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
    expect(metadata?.category).toBe('CLAUDE.md');

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
          category: 'CLAUDE.md',
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
          category: 'CLAUDE.md',
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
          category: 'CLAUDE.md',
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
          category: 'CLAUDE.md',
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
          category: 'CLAUDE.md',
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
          category: 'CLAUDE.md',
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
          category: 'CLAUDE.md',
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

  it('should execute custom rule and produce violations via context.report', async () => {
    const rulesDir = join(testDir, '.claudelint/rules');
    mkdirSync(rulesDir, { recursive: true });

    // Create a rule that reports violations for CLAUDE.md files missing a heading
    writeFileSync(
      join(rulesDir, 'require-heading.js'),
      `
      module.exports.rule = {
        meta: {
          id: 'execution-test-rule',
          name: 'Execution Test Rule',
          description: 'Reports violation when content lacks heading',
          category: 'CLAUDE.md',
          severity: 'error',
          fixable: false,
          deprecated: false,
          since: '1.0.0',
        },
        validate: async (context) => {
          if (!context.fileContent.includes('# ')) {
            context.report({
              message: 'Missing heading',
              line: 1,
              fix: 'Add a heading',
            });
          }
        },
      };
    `
    );

    const loader = new CustomRuleLoader();
    const results = await loader.loadCustomRules(testDir);
    expect(results[0].success).toBe(true);

    // Execute the rule's validate function directly
    const rule = results[0].rule!;
    const issues: Array<{ message: string; line?: number; fix?: string }> = [];

    await rule.validate({
      filePath: '/fake/CLAUDE.md',
      fileContent: 'No heading here, just text.',
      options: {},
      report: (issue) => issues.push(issue),
    });

    expect(issues).toHaveLength(1);
    expect(issues[0].message).toBe('Missing heading');
    expect(issues[0].line).toBe(1);

    // Verify no violation when heading exists
    const issues2: Array<{ message: string }> = [];
    await rule.validate({
      filePath: '/fake/CLAUDE.md',
      fileContent: '# My Project\nSome content.',
      options: {},
      report: (issue) => issues2.push(issue),
    });

    expect(issues2).toHaveLength(0);

    loader.clear();
  });

  it('should support configurable options via meta.schema and context.options', async () => {
    const rulesDir = join(testDir, '.claudelint/rules');
    mkdirSync(rulesDir, { recursive: true });

    // Create a rule with configurable options
    writeFileSync(
      join(rulesDir, 'max-lines.js'),
      `
      module.exports.rule = {
        meta: {
          id: 'options-test-rule',
          name: 'Options Test Rule',
          description: 'Configurable max lines rule',
          category: 'CLAUDE.md',
          severity: 'warn',
          fixable: false,
          deprecated: false,
          since: '1.0.0',
          defaultOptions: { maxLines: 10 },
        },
        validate: async (context) => {
          const maxLines = context.options.maxLines || 10;
          const lineCount = context.fileContent.split('\\n').length;
          if (lineCount > maxLines) {
            context.report({
              message: 'File exceeds ' + maxLines + ' lines (' + lineCount + ')',
              line: maxLines + 1,
            });
          }
        },
      };
    `
    );

    const loader = new CustomRuleLoader();
    const results = await loader.loadCustomRules(testDir);
    expect(results[0].success).toBe(true);

    const rule = results[0].rule!;

    // Test with default options (maxLines: 10)
    const issues1: Array<{ message: string }> = [];
    const lines = Array.from({ length: 15 }, (_, i) => `Line ${i + 1}`);
    const content = lines.join('\n');
    await rule.validate({
      filePath: '/fake/CLAUDE.md',
      fileContent: content,
      options: { maxLines: 10 },
      report: (issue) => issues1.push(issue),
    });

    expect(issues1).toHaveLength(1);
    expect(issues1[0].message).toContain('exceeds 10 lines');

    // Test with custom options (maxLines: 20)
    const issues2: Array<{ message: string }> = [];
    await rule.validate({
      filePath: '/fake/CLAUDE.md',
      fileContent: content,
      options: { maxLines: 20 },
      report: (issue) => issues2.push(issue),
    });

    expect(issues2).toHaveLength(0);

    loader.clear();
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
          category: 'CLAUDE.md',
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

describe('Custom rule using claude-code-lint/utils barrel', () => {
  type Issue = { message: string; line?: number };

  it('should work with utilities imported from the public utils barrel', async () => {
    // Import the fixture rule that uses hasHeading, extractFrontmatter, etc.
    const { rule } = await import('../fixtures/custom-rules/utils-consumer-rule');

    expect(rule.meta.id).toBe('require-changelog-heading');

    // Test: missing Changelog heading triggers report
    const issues1: Issue[] = [];
    await rule.validate({
      filePath: '/fake/CLAUDE.md',
      fileContent: '# My Project\nSome content without changelog.',
      options: {},
      report: (issue: Issue) => issues1.push(issue),
    });
    expect(issues1).toHaveLength(1);
    expect(issues1[0].message).toBe('Missing Changelog heading');

    // Test: with Changelog heading, no report
    const issues2: Issue[] = [];
    await rule.validate({
      filePath: '/fake/CLAUDE.md',
      fileContent: '# My Project\n## Changelog\n- Fixed bug',
      options: {},
      report: (issue: Issue) => issues2.push(issue),
    });
    expect(issues2).toHaveLength(0);

    // Test: "Change Log" variant also accepted
    const issues3: Issue[] = [];
    await rule.validate({
      filePath: '/fake/CLAUDE.md',
      fileContent: '# My Project\n## Change Log\n- v1.0.0',
      options: {},
      report: (issue: Issue) => issues3.push(issue),
    });
    expect(issues3).toHaveLength(0);
  });

  it('should detect invalid version in frontmatter via utils', async () => {
    const { rule } = await import('../fixtures/custom-rules/utils-consumer-rule');

    const issues: Issue[] = [];
    await rule.validate({
      filePath: '/fake/CLAUDE.md',
      fileContent: '---\nversion: not-a-version\n---\n# Project\n## Changelog\n- Entry',
      options: {},
      report: (issue: Issue) => issues.push(issue),
    });
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toBe('Invalid version in frontmatter');
  });
});
