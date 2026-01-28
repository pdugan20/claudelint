import { ClaudeMdValidator } from '../../src/validators/claude-md';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { setupTestDir } from '../helpers/test-utils';

describe('ClaudeMdValidator', () => {
  const { getTestDir } = setupTestDir();

  describe('File size validation', () => {
    it('should pass for files under size limit', async () => {
      const filePath = join(getTestDir(), 'CLAUDE.md');
      await writeFile(filePath, '# Small File\n\nContent here.');

      const validator = new ClaudeMdValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should warn for files approaching size limit', async () => {
      const filePath = join(getTestDir(), 'CLAUDE.md');
      const largeContent = '# Large File\n\n' + 'x'.repeat(36000);
      await writeFile(filePath, largeContent);

      const validator = new ClaudeMdValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].message).toContain('approaching size limit');
    });

    it('should error for files exceeding size limit', async () => {
      const filePath = join(getTestDir(), 'CLAUDE.md');
      const hugeContent = '# Huge File\n\n' + 'x'.repeat(45000);
      await writeFile(filePath, hugeContent);

      const validator = new ClaudeMdValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('exceeds');
    });
  });

  describe('Frontmatter validation', () => {
    it('should validate frontmatter in rules files', async () => {
      const rulesDir = join(getTestDir(), '.claude', 'rules');
      await mkdir(rulesDir, { recursive: true });

      const filePath = join(rulesDir, 'typescript.md');
      await writeFile(
        filePath,
        `---
paths:
  - "src/**/*.ts"
  - "!src/**/*.test.ts"
---

# TypeScript Rules

Content here.`
      );

      const validator = new ClaudeMdValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should error for invalid paths field type', async () => {
      const rulesDir = join(getTestDir(), '.claude', 'rules');
      await mkdir(rulesDir, { recursive: true });

      const filePath = join(rulesDir, 'typescript.md');
      await writeFile(
        filePath,
        `---
paths: "src/**/*.ts"
---

# TypeScript Rules`
      );

      const validator = new ClaudeMdValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      // Zod reports "Expected array, received string"
      expect(result.errors.some((e) => e.message.includes('Expected array'))).toBe(true);
    });
  });

  describe('Import validation', () => {
    it('should error for non-existent imports', async () => {
      const filePath = join(getTestDir(), 'CLAUDE.md');
      await writeFile(
        filePath,
        '# Main\n\nImport: @missing-file.md\n\nContent here.'
      );

      const validator = new ClaudeMdValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('not found'))).toBe(true);
    });

    it('should validate existing imports', async () => {
      const filePath = join(getTestDir(), 'CLAUDE.md');
      const importedFile = join(getTestDir(), 'imported.md');

      await writeFile(importedFile, '# Imported Content');
      await writeFile(
        filePath,
        '# Main\n\nImport: @imported.md\n\nContent here.'
      );

      const validator = new ClaudeMdValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should error when import is inside code block', async () => {
      const filePath = join(getTestDir(), 'CLAUDE.md');
      await writeFile(
        filePath,
        `# Main

Some content here.

\`\`\`markdown
Import: @example.md
\`\`\`

More content.`
      );

      const validator = new ClaudeMdValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('inside code block'))).toBe(true);
    });

    it('should pass when import is outside code block', async () => {
      const filePath = join(getTestDir(), 'CLAUDE.md');
      const importedFile = join(getTestDir(), 'imported.md');

      await writeFile(importedFile, '# Imported Content');
      await writeFile(
        filePath,
        `# Main

Import: @imported.md

Some content here.

\`\`\`markdown
Example of import syntax (not actual import)
\`\`\``
      );

      const validator = new ClaudeMdValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should warn for case-sensitive filename collisions', async () => {
      const filePath = join(getTestDir(), 'CLAUDE.md');
      const import1 = join(getTestDir(), 'File.md');
      const import2 = join(getTestDir(), 'file.md');

      await writeFile(import1, '# File 1');
      await writeFile(import2, '# File 2');
      await writeFile(
        filePath,
        `# Main

Import: @File.md

Import: @file.md`
      );

      const validator = new ClaudeMdValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('Case-sensitive'))).toBe(true);
      expect(result.warnings.some((w) => w.ruleId === 'filename-case-sensitive')).toBe(true);
    });
  });

  describe('Content organization checks', () => {
    it('should warn when CLAUDE.md has too many sections', async () => {
      const filePath = join(getTestDir(), 'CLAUDE.md');
      // Create content with 25 sections (headings) - 1 H1 + 25 H2 = 26 total
      const sections = Array.from({ length: 25 }, (_, i) => `## Section ${i + 1}\n\nContent here.`);
      await writeFile(filePath, '# Main Title\n\n' + sections.join('\n\n'));

      const validator = new ClaudeMdValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some((w) => w.message.includes('sections'))).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('.claude/rules/'))).toBe(true);
    });

    it('should not warn when CLAUDE.md has reasonable number of sections', async () => {
      const filePath = join(getTestDir(), 'CLAUDE.md');
      // Create content with 10 sections (headings)
      const sections = Array.from({ length: 10 }, (_, i) => `## Section ${i + 1}\n\nContent here.`);
      await writeFile(filePath, '# Main Title\n\n' + sections.join('\n\n'));

      const validator = new ClaudeMdValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBe(0);
    });
  });
});
