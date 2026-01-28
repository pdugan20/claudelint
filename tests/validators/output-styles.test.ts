import { OutputStylesValidator } from '../../src/validators/output-styles';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { setupTestDir } from '../helpers/test-utils';

describe('OutputStylesValidator', () => {
  const { getTestDir } = setupTestDir();

  async function createOutputStyle(
    styleName: string,
    frontmatter: Record<string, unknown>,
    content = '# Examples\n\nExample output in this style.\n\n# Guidelines\n\nRules for this style.'
  ) {
    const styleDir = join(getTestDir(), '.claude', 'output_styles', styleName);
    await mkdir(styleDir, { recursive: true });

    const yamlLines = Object.entries(frontmatter)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}:\n${value.map((v) => `  - ${v}`).join('\n')}`;
        }
        return `${key}: ${JSON.stringify(value)}`;
      })
      .join('\n');

    const styleContent = `---
${yamlLines}
---

${content}`;

    await writeFile(join(styleDir, 'OUTPUT_STYLE.md'), styleContent);
    return styleDir;
  }

  describe('Required fields validation', () => {
    it('should pass for valid minimal output style', async () => {
      await createOutputStyle('test-style', {
        name: 'test-style',
        description: 'A test output style for validation',
      });

      const validator = new OutputStylesValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should error when name is missing', async () => {
      await createOutputStyle('test-style', {
        description: 'A test style',
      });

      const validator = new OutputStylesValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('Required'))).toBe(true);
    });

    it('should error when description is missing', async () => {
      await createOutputStyle('test-style', {
        name: 'test-style',
      });

      const validator = new OutputStylesValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('Required'))).toBe(true);
    });
  });

  describe('Name validation', () => {
    it('should error for invalid name format', async () => {
      await createOutputStyle('test-style', {
        name: 'TestStyle',
        description: 'Invalid name with uppercase',
      });

      const validator = new OutputStylesValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) =>
          e.message.includes('Must contain only lowercase letters, numbers, and hyphens')
        )
      ).toBe(true);
    });

    it('should error when name does not match directory', async () => {
      await createOutputStyle('test-style', {
        name: 'different-name',
        description: 'Name mismatch',
      });

      const validator = new OutputStylesValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('does not match directory name'))).toBe(
        true
      );
    });

    it('should error for name exceeding 64 characters', async () => {
      const longName = 'a'.repeat(65);
      await createOutputStyle(longName, {
        name: longName,
        description: 'Too long name',
      });

      const validator = new OutputStylesValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('64 characters or less'))).toBe(true);
    });
  });

  describe('Body content validation', () => {
    it('should warn when body content is too short', async () => {
      await createOutputStyle('test-style', {
        name: 'test-style',
        description: 'Test style',
      }, 'Short content');

      const validator = new OutputStylesValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.warnings.some((w) => w.message.includes('body content is very short'))).toBe(
        true
      );
    });

    it('should warn when Examples section is missing', async () => {
      await createOutputStyle('test-style', {
        name: 'test-style',
        description: 'Test style',
      }, '# Guidelines\n\nSome guidelines without examples. This content is long enough to not trigger the short content warning.');

      const validator = new OutputStylesValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.warnings.some((w) => w.message.includes('Examples'))).toBe(true);
    });

    it('should warn when Guidelines section is missing', async () => {
      await createOutputStyle('test-style', {
        name: 'test-style',
        description: 'Test style',
      }, '# Examples\n\nSome examples without guidelines. This content is long enough to not trigger the short content warning.');

      const validator = new OutputStylesValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.warnings.some((w) => w.message.includes('Guidelines'))).toBe(true);
    });

    it('should pass when both Examples and Guidelines sections are present', async () => {
      await createOutputStyle('test-style', {
        name: 'test-style',
        description: 'Test style',
      }, '# Examples\n\nExample output.\n\n# Guidelines\n\nFormatting rules.');

      const validator = new OutputStylesValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.warnings.some((w) => w.message.includes('Examples'))).toBe(false);
      expect(result.warnings.some((w) => w.message.includes('Guidelines'))).toBe(false);
    });
  });

  describe('Specific output style validation', () => {
    it('should validate only the specified output style', async () => {
      await createOutputStyle('test-style-1', {
        name: 'test-style-1',
        description: 'Valid style',
      });

      await createOutputStyle('test-style-2', {
        name: 'invalid',
        description: 'Invalid style',
      });

      const validator = new OutputStylesValidator({ path: getTestDir(), outputStyle: 'test-style-1' });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });
  });

  describe('No output styles found', () => {
    it('should warn when no output style directories exist', async () => {
      const validator = new OutputStylesValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.warnings.some((w) => w.message.includes('No output style directories found'))).toBe(
        true
      );
    });
  });
});
