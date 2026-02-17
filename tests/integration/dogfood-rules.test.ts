/**
 * Dogfood Rules Integration Tests
 *
 * Verifies that the project's own custom rules in .claudelint/rules/:
 * 1. Load successfully from the actual project directory
 * 2. Have correct metadata
 * 3. Actually detect violations when given bad input
 * 4. Pass cleanly on the project's own CLAUDE.md and SKILL.md files (no false positives)
 */

import { CustomRuleLoader } from '../../src/utils/rules/loader';
import { Rule, RuleIssue } from '../../src/types/rule';
import { readFileSync } from 'fs';
import { join } from 'path';

const projectRoot = join(__dirname, '../..');

/** Helper: run a rule's validate function and collect reported issues */
async function collectIssues(
  rule: Rule,
  filePath: string,
  fileContent: string,
  options: Record<string, unknown> = {}
): Promise<RuleIssue[]> {
  const issues: RuleIssue[] = [];
  await rule.validate({
    filePath,
    fileContent,
    options,
    report: (issue) => issues.push(issue),
  });
  return issues;
}

describe('Dogfood Custom Rules', () => {
  let loader: CustomRuleLoader;
  let rules: Rule[];

  beforeAll(async () => {
    loader = new CustomRuleLoader({
      customRulesPath: '.claudelint/rules',
      enableCustomRules: true,
    });
    await loader.loadCustomRules(projectRoot);
    rules = loader.getLoadedRules();
  });

  afterAll(() => {
    loader.clear();
  });

  describe('Loading', () => {
    it('should load all 4 dogfood rules', () => {
      expect(rules).toHaveLength(4);
    });

    it('should have correct IDs', () => {
      const ids = rules.map((r) => r.meta.id as string).sort();
      expect(ids).toEqual([
        'max-section-depth',
        'no-user-paths',
        'normalize-code-fences',
        'require-skill-see-also',
      ]);
    });
  });

  describe('require-skill-see-also', () => {
    let rule: Rule;

    beforeAll(() => {
      rule = rules.find((r) => (r.meta.id as string) === 'require-skill-see-also')!;
    });

    it('should have Skills category', () => {
      expect(rule.meta.category).toBe('Skills');
    });

    it('should report violation when ## See Also heading is missing', async () => {
      const content = '---\nname: my-skill\ndescription: A skill\n---\n\n# My Skill\n\nDoes stuff.';
      const issues = await collectIssues(rule, '/test/skills/my-skill/SKILL.md', content);
      expect(issues).toHaveLength(1);
      expect(issues[0].message).toContain('See Also');
    });

    it('should pass when ## See Also heading exists', async () => {
      const content =
        '---\nname: my-skill\ndescription: A skill\n---\n\n# My Skill\n\n## See Also\n\n- other-skill';
      const issues = await collectIssues(rule, '/test/skills/my-skill/SKILL.md', content);
      expect(issues).toHaveLength(0);
    });

    it('should skip non-SKILL.md files', async () => {
      const issues = await collectIssues(rule, '/test/README.md', '# No see also');
      expect(issues).toHaveLength(0);
    });

    it('should skip CLAUDE.md files', async () => {
      const issues = await collectIssues(rule, '/test/CLAUDE.md', '# No see also');
      expect(issues).toHaveLength(0);
    });
  });

  describe('no-user-paths', () => {
    let rule: Rule;

    beforeAll(() => {
      rule = rules.find((r) => (r.meta.id as string) === 'no-user-paths')!;
    });

    it('should detect /Users/name/ paths', async () => {
      const issues = await collectIssues(
        rule,
        '/test/CLAUDE.md',
        '# Project\n\nPath: /Users/john/code/project'
      );
      expect(issues).toHaveLength(1);
      expect(issues[0].message).toContain('/Users/john');
      expect(issues[0].line).toBe(3);
    });

    it('should detect /home/name/ paths', async () => {
      const issues = await collectIssues(
        rule,
        '/test/CLAUDE.md',
        '# Project\n\nPath: /home/user/app'
      );
      expect(issues).toHaveLength(1);
      expect(issues[0].message).toContain('/home/user');
    });

    it('should pass when no user paths exist', async () => {
      const issues = await collectIssues(
        rule,
        '/test/CLAUDE.md',
        '# Project\n\nUse `./relative/path`'
      );
      expect(issues).toHaveLength(0);
    });

    it('should skip non-CLAUDE.md files', async () => {
      const issues = await collectIssues(rule, '/test/README.md', '/Users/john/test');
      expect(issues).toHaveLength(0);
    });
  });

  describe('normalize-code-fences', () => {
    let rule: Rule;

    beforeAll(() => {
      rule = rules.find((r) => (r.meta.id as string) === 'normalize-code-fences')!;
    });

    it('should detect bare code fences without language', async () => {
      const content = '# Project\n\n```\necho hello\n```\n';
      const issues = await collectIssues(rule, '/test/CLAUDE.md', content);
      expect(issues).toHaveLength(1);
      expect(issues[0].message).toContain('language');
      expect(issues[0].line).toBe(3);
    });

    it('should provide autoFix', async () => {
      const content = '# Project\n\n```\necho hello\n```\n';
      const issues = await collectIssues(rule, '/test/CLAUDE.md', content);
      expect(issues[0].autoFix).toBeDefined();
      expect(issues[0].autoFix!.range).toEqual([11, 14]);
      expect(issues[0].autoFix!.text).toBe('```text');
      // Verify fix produces correct output when applied
      const fix = issues[0].autoFix!;
      const result = content.slice(0, fix.range[0]) + fix.text + content.slice(fix.range[1]);
      expect(result).toBe('# Project\n\n```text\necho hello\n```\n');
    });

    it('should pass when all fences have languages', async () => {
      const content = '# Project\n\n```bash\necho hello\n```\n';
      const issues = await collectIssues(rule, '/test/CLAUDE.md', content);
      expect(issues).toHaveLength(0);
    });

    it('should skip non-CLAUDE.md files', async () => {
      const issues = await collectIssues(rule, '/test/README.md', '```\ncode\n```');
      expect(issues).toHaveLength(0);
    });
  });

  describe('max-section-depth', () => {
    let rule: Rule;

    beforeAll(() => {
      rule = rules.find((r) => (r.meta.id as string) === 'max-section-depth')!;
    });

    it('should detect headings exceeding default max depth (4)', async () => {
      const content = '# Top\n\n## Second\n\n### Third\n\n#### Fourth\n\n##### Too Deep\n';
      const issues = await collectIssues(rule, '/test/CLAUDE.md', content, { maxDepth: 4 });
      expect(issues).toHaveLength(1);
      expect(issues[0].message).toContain('Too Deep');
      expect(issues[0].message).toContain('exceeds max depth 4');
    });

    it('should respect custom maxDepth option', async () => {
      const content = '# Top\n\n## Second\n\n### Third\n';
      const issues = await collectIssues(rule, '/test/CLAUDE.md', content, { maxDepth: 2 });
      expect(issues).toHaveLength(1);
      expect(issues[0].message).toContain('exceeds max depth 2');
    });

    it('should pass when headings are within depth limit', async () => {
      const content = '# Top\n\n## Second\n\n### Third\n';
      const issues = await collectIssues(rule, '/test/CLAUDE.md', content, { maxDepth: 4 });
      expect(issues).toHaveLength(0);
    });

    it('should skip non-CLAUDE.md files', async () => {
      const content = '###### Very Deep\n';
      const issues = await collectIssues(rule, '/test/README.md', content, { maxDepth: 4 });
      expect(issues).toHaveLength(0);
    });
  });

  describe('No false positives on project files', () => {
    it('should produce zero violations on root CLAUDE.md', async () => {
      const content = readFileSync(join(projectRoot, 'CLAUDE.md'), 'utf-8');
      const allIssues: RuleIssue[] = [];
      for (const rule of rules) {
        const issues = await collectIssues(rule, join(projectRoot, 'CLAUDE.md'), content, {
          maxDepth: 4,
        });
        allIssues.push(...issues);
      }
      expect(allIssues).toHaveLength(0);
    });

    it('should produce zero violations on src/CLAUDE.md', async () => {
      const content = readFileSync(join(projectRoot, 'src/CLAUDE.md'), 'utf-8');
      const allIssues: RuleIssue[] = [];
      for (const rule of rules) {
        const issues = await collectIssues(rule, join(projectRoot, 'src/CLAUDE.md'), content, {
          maxDepth: 4,
        });
        allIssues.push(...issues);
      }
      expect(allIssues).toHaveLength(0);
    });

    it('should produce zero violations on website/CLAUDE.md', async () => {
      const content = readFileSync(join(projectRoot, 'website/CLAUDE.md'), 'utf-8');
      const allIssues: RuleIssue[] = [];
      for (const rule of rules) {
        const issues = await collectIssues(
          rule,
          join(projectRoot, 'website/CLAUDE.md'),
          content,
          { maxDepth: 4 }
        );
        allIssues.push(...issues);
      }
      expect(allIssues).toHaveLength(0);
    });

    it('should produce zero violations on project SKILL.md files', async () => {
      const skillPath = join(projectRoot, 'skills/validate-all/SKILL.md');
      const content = readFileSync(skillPath, 'utf-8');
      const allIssues: RuleIssue[] = [];
      for (const rule of rules) {
        const issues = await collectIssues(rule, skillPath, content, { maxDepth: 4 });
        allIssues.push(...issues);
      }
      expect(allIssues).toHaveLength(0);
    });
  });
});
