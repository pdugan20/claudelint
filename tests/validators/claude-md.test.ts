import { ClaudeMdValidator } from '../../src/validators/claude-md';
import { writeFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

describe('ClaudeMdValidator', () => {
  let testDir: string;

  beforeEach(async () => {
    // Create temporary test directory
    testDir = join(tmpdir(), `claude-validator-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test directory
    await rm(testDir, { recursive: true, force: true });
  });

  describe('File size validation', () => {
    it('should pass for files under size limit', async () => {
      const filePath = join(testDir, 'CLAUDE.md');
      await writeFile(filePath, '# Small File\n\nContent here.');

      const validator = new ClaudeMdValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should warn for files approaching size limit', async () => {
      const filePath = join(testDir, 'CLAUDE.md');
      const largeContent = '# Large File\n\n' + 'x'.repeat(36000);
      await writeFile(filePath, largeContent);

      const validator = new ClaudeMdValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].message).toContain('approaching size limit');
    });

    it('should error for files exceeding size limit', async () => {
      const filePath = join(testDir, 'CLAUDE.md');
      const hugeContent = '# Huge File\n\n' + 'x'.repeat(45000);
      await writeFile(filePath, hugeContent);

      const validator = new ClaudeMdValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('exceeds');
    });
  });

  describe('Markdown structure validation', () => {
    it('should warn if file does not start with H1', async () => {
      const filePath = join(testDir, 'CLAUDE.md');
      await writeFile(filePath, 'Some text\n\n## Not H1');

      const validator = new ClaudeMdValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.warnings.some((w) => w.message.includes('top-level heading'))).toBe(true);
    });

    it('should pass for files starting with H1', async () => {
      const filePath = join(testDir, 'CLAUDE.md');
      await writeFile(filePath, '# Title\n\nContent here.');

      const validator = new ClaudeMdValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });
  });

  describe('Frontmatter validation', () => {
    it('should validate frontmatter in rules files', async () => {
      const rulesDir = join(testDir, '.claude', 'rules');
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
      const rulesDir = join(testDir, '.claude', 'rules');
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
      expect(result.errors.some((e) => e.message.includes('must be an array'))).toBe(true);
    });
  });

  describe('Import validation', () => {
    it('should error for non-existent imports', async () => {
      const filePath = join(testDir, 'CLAUDE.md');
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
      const filePath = join(testDir, 'CLAUDE.md');
      const importedFile = join(testDir, 'imported.md');

      await writeFile(importedFile, '# Imported Content');
      await writeFile(
        filePath,
        '# Main\n\nImport: @imported.md\n\nContent here.'
      );

      const validator = new ClaudeMdValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });
  });
});
