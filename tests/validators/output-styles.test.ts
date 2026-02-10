import { OutputStylesValidator } from '../../src/validators/output-styles';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { setupTestDir } from '../helpers/test-utils';

describe('OutputStylesValidator', () => {
  const { getTestDir } = setupTestDir();

  async function createOutputStyle(styleName: string, frontmatter: Record<string, unknown>) {
    const styleDir = join(getTestDir(), '.claude', 'output-styles', styleName);
    await mkdir(styleDir, { recursive: true });

    const styleMd = join(styleDir, 'style.md');
    const content = `---
${Object.entries(frontmatter)
  .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
  .join('\n')}
---

# ${frontmatter.name}

## Examples

Example output here.

## Guidelines

Guidelines for this output style.
`;
    await writeFile(styleMd, content);
    return styleMd;
  }

  describe('Orchestration', () => {
    it('should validate valid output style', async () => {
      await createOutputStyle('test-style', {
        name: 'test-style',
        description: 'Test output style',
      });

      const validator = new OutputStylesValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should aggregate results from multiple output styles', async () => {
      await createOutputStyle('style-one', {
        name: 'style-one',
        description: 'First style',
      });

      await createOutputStyle('style-two', {
        name: 'style-two',
        description: 'Second style',
      });

      const validator = new OutputStylesValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should handle missing output-styles directory', async () => {
      const validator = new OutputStylesValidator({ path: getTestDir() });
      const result = await validator.validate();

      // No output styles found is not an error - just an empty result
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

  });
});
