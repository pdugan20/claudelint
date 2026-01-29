import { ClaudeMdValidator } from '../../src/validators/claude-md';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { setupTestDir } from '../helpers/test-utils';

describe('ClaudeMdValidator', () => {
  const { getTestDir } = setupTestDir();

  describe('Orchestration', () => {
    it('should validate valid CLAUDE.md file', async () => {
      const filePath = join(getTestDir(), 'CLAUDE.md');
      await writeFile(filePath, '# Project Instructions\n\nContent here.');

      const validator = new ClaudeMdValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate CLAUDE.md with imports', async () => {
      const filePath = join(getTestDir(), 'CLAUDE.md');
      const importedFile = join(getTestDir(), 'imported.md');

      await writeFile(importedFile, '# Imported Content\n\nDetails here.');
      await writeFile(
        filePath,
        '# Main\n\nImport: @imported.md\n\nMore content here.'
      );

      const validator = new ClaudeMdValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should handle missing CLAUDE.md files', async () => {
      const originalCwd = process.cwd();
      process.chdir(getTestDir());

      try {
        const validator = new ClaudeMdValidator();
        const result = await validator.validate();

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should validate rules files with frontmatter', async () => {
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
  });
});
