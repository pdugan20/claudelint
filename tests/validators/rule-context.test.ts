import { FileValidator, ValidationResult } from '../../src/validators/file-validator';
import { RuleRegistry } from '../../src/utils/rules/registry';
import { RuleContext, Rule } from '../../src/types/rule';
import { RuleId } from '../../src/rules/rule-ids';

// Test validator that exposes executeRule for testing
class TestValidator extends FileValidator {
  validate(): Promise<ValidationResult> {
    return Promise.resolve(this.getResult());
  }

  public async testExecuteRule(
    rule: Rule,
    filePath: string,
    fileContent: string
  ): Promise<void> {
    await this.executeRule(rule, filePath, fileContent);
  }
}

const RULE_ID = 'skill-name' as RuleId;

let capturedContext: RuleContext | null = null;

const testRule: Rule = {
  meta: {
    id: RULE_ID,
    name: 'Test Rule',
    description: 'Captures context for testing',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    since: '0.2.0',
  },
  validate: (context) => {
    capturedContext = context;
  },
};

const SKILL_CONTENT = `---
name: test-skill
description: A test skill
version: "1.0"
---

# Test Skill

This is the body content.

\`\`\`bash
echo "hello world"
\`\`\`

Some more text after code.
`;

const JSON_CONTENT = `{
  "mcpServers": {
    "test": { "command": "node", "args": ["server.js"] }
  }
}`;

describe('RuleContext enrichment', () => {
  beforeAll(() => {
    RuleRegistry.clear();
    RuleRegistry.register(testRule);
  });

  afterAll(() => {
    RuleRegistry.clear();
  });

  beforeEach(() => {
    capturedContext = null;
  });

  describe('context.frontmatter', () => {
    it('should return parsed YAML frontmatter for Markdown files', async () => {
      const validator = new TestValidator();
      await validator.testExecuteRule(testRule, '/test/SKILL.md', SKILL_CONTENT);

      expect(capturedContext).not.toBeNull();
      expect(capturedContext!.frontmatter).toBeDefined();
      expect(capturedContext!.frontmatter!.name).toBe('test-skill');
      expect(capturedContext!.frontmatter!.description).toBe('A test skill');
      expect(capturedContext!.frontmatter!.version).toBe('1.0');
    });

    it('should return undefined for files without frontmatter', async () => {
      const validator = new TestValidator();
      await validator.testExecuteRule(testRule, '/test/SKILL.md', '# No Frontmatter\n\nJust content.');

      expect(capturedContext).not.toBeNull();
      expect(capturedContext!.frontmatter).toBeUndefined();
    });

    it('should return undefined for JSON files', async () => {
      const validator = new TestValidator();
      await validator.testExecuteRule(testRule, '/test/.mcp.json', JSON_CONTENT);

      expect(capturedContext).not.toBeNull();
      expect(capturedContext!.frontmatter).toBeUndefined();
    });
  });

  describe('context.bodyContent', () => {
    it('should return body content after frontmatter', async () => {
      const validator = new TestValidator();
      await validator.testExecuteRule(testRule, '/test/SKILL.md', SKILL_CONTENT);

      expect(capturedContext).not.toBeNull();
      expect(capturedContext!.bodyContent).toBeDefined();
      expect(capturedContext!.bodyContent).toContain('# Test Skill');
      expect(capturedContext!.bodyContent).toContain('Some more text after code.');
    });

    it('should return undefined for files without frontmatter', async () => {
      const validator = new TestValidator();
      await validator.testExecuteRule(testRule, '/test/SKILL.md', '# No Frontmatter');

      expect(capturedContext).not.toBeNull();
      expect(capturedContext!.bodyContent).toBeUndefined();
    });
  });

  describe('context.contentWithoutCode', () => {
    it('should return content with code blocks stripped', async () => {
      const validator = new TestValidator();
      await validator.testExecuteRule(testRule, '/test/SKILL.md', SKILL_CONTENT);

      expect(capturedContext).not.toBeNull();
      expect(capturedContext!.contentWithoutCode).toBeDefined();
      expect(capturedContext!.contentWithoutCode).toContain('# Test Skill');
      expect(capturedContext!.contentWithoutCode).toContain('Some more text after code.');
      // Code block content should be stripped
      expect(capturedContext!.contentWithoutCode).not.toContain('echo "hello world"');
    });

    it('should preserve line count after stripping', async () => {
      const validator = new TestValidator();
      await validator.testExecuteRule(testRule, '/test/SKILL.md', SKILL_CONTENT);

      expect(capturedContext).not.toBeNull();
      const originalLines = SKILL_CONTENT.split('\n').length;
      const strippedLines = capturedContext!.contentWithoutCode!.split('\n').length;
      expect(strippedLines).toBe(originalLines);
    });
  });

  describe('lazy evaluation', () => {
    it('should not throw when lazy fields are not accessed', async () => {
      // Override validate to NOT access any lazy fields
      const origValidate = testRule.validate;
      testRule.validate = (context) => {
        expect(context.filePath).toBe('/test/SKILL.md');
        expect(context.fileContent).toBe(SKILL_CONTENT);
      };

      const validator = new TestValidator();
      await validator.testExecuteRule(testRule, '/test/SKILL.md', SKILL_CONTENT);

      // Restore
      testRule.validate = origValidate;
    });

    it('should cache results on repeated access', async () => {
      const validator = new TestValidator();
      await validator.testExecuteRule(testRule, '/test/SKILL.md', SKILL_CONTENT);

      expect(capturedContext).not.toBeNull();
      const first = capturedContext!.frontmatter;
      const second = capturedContext!.frontmatter;
      // Should be the same object reference (cached)
      expect(first).toBe(second);
    });
  });
});
