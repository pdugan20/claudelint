import { ClaudeMdValidator } from '../../src/validators/claude-md';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { setupTestDir } from '../helpers/test-utils';

describe('Inline rule disabling', () => {
  const { getTestDir } = setupTestDir();

  describe('claudelint-disable-file', () => {
    it('should disable rule for entire file', async () => {
      const filePath = join(getTestDir(), 'CLAUDE.md');
      const content = `<!-- claudelint-disable-file size-warning -->
# Large File

${'x'.repeat(36000)}`;
      await writeFile(filePath, content);

      const validator = new ClaudeMdValidator({ path: filePath });
      const result = await validator.validate();

      // Should not have size warning since it's disabled
      expect(result.warnings.length).toBe(0);
    });
  });

  describe('claudelint-disable-next-line', () => {
    it('should disable rule for next line only', async () => {
      const filePath = join(getTestDir(), 'CLAUDE.md');
      const content = `# Test

<!-- claudelint-disable-next-line import-missing -->
Import: @nonexistent.md

Content here.`;
      await writeFile(filePath, content);

      const validator = new ClaudeMdValidator({ path: filePath });
      const result = await validator.validate();

      // Should not error for missing import since it's disabled
      expect(result.errors.length).toBe(0);
    });
  });

  describe('claudelint-disable-line', () => {
    it('should disable rule for current line', async () => {
      const filePath = join(getTestDir(), 'CLAUDE.md');
      const content = `# Test

Import: @nonexistent.md <!-- claudelint-disable-line import-missing -->

Content here.`;
      await writeFile(filePath, content);

      const validator = new ClaudeMdValidator({ path: filePath });
      const result = await validator.validate();

      // Should not error for missing import since it's disabled
      expect(result.errors.length).toBe(0);
    });
  });

  describe('claudelint-disable and claudelint-enable', () => {
    it('should disable rule for range', async () => {
      const filePath = join(getTestDir(), 'CLAUDE.md');
      const content = `# Test

<!-- claudelint-disable import-missing -->
Import: @nonexistent1.md
Import: @nonexistent2.md
<!-- claudelint-enable import-missing -->

Import: @nonexistent3.md

Content here.`;
      await writeFile(filePath, content);

      const validator = new ClaudeMdValidator({ path: filePath });
      const result = await validator.validate();

      // Should only error for the third import (outside disabled range)
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].message).toContain('nonexistent3.md');
    });
  });
});
