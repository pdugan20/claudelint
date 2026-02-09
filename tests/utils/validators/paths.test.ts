import {
  validateFileExists,
  validateDirectoryExists,
  validateForwardSlashes,
} from '../../../src/utils/validators/paths';

describe('path validators', () => {
  describe('validateFileExists', () => {
    it('should return null for existing file', async () => {
      // package.json always exists at the project root
      const result = await validateFileExists(`${process.cwd()}/package.json`);
      expect(result).toBeNull();
    });

    it('should return error for non-existing file', async () => {
      const result = await validateFileExists('/nonexistent/file.txt');

      expect(result).not.toBeNull();
      expect(result!.severity).toBe('error');
      expect(result!.message).toContain('not found');
      expect(result!.message).toContain('/nonexistent/file.txt');
    });

    it('should use custom context in error message', async () => {
      const result = await validateFileExists('/missing.md', 'Skill file');

      expect(result!.message).toContain('Skill file');
    });

    it('should use default context when not specified', async () => {
      const result = await validateFileExists('/missing.md');

      expect(result!.message).toContain('File');
    });
  });

  describe('validateDirectoryExists', () => {
    it('should return null for existing directory', async () => {
      const result = await validateDirectoryExists(process.cwd());
      expect(result).toBeNull();
    });

    it('should return error for non-existing directory', async () => {
      const result = await validateDirectoryExists('/nonexistent/dir');

      expect(result).not.toBeNull();
      expect(result!.severity).toBe('error');
      expect(result!.message).toContain('not found');
    });

    it('should use custom context in error message', async () => {
      const result = await validateDirectoryExists('/missing', 'Plugin directory');

      expect(result!.message).toContain('Plugin directory');
    });
  });

  describe('validateForwardSlashes', () => {
    it('should return null for forward slash paths', () => {
      expect(validateForwardSlashes('src/utils/test.ts')).toBeNull();
    });

    it('should return null for paths without slashes', () => {
      expect(validateForwardSlashes('file.ts')).toBeNull();
    });

    it('should return warning for backslash paths', () => {
      const result = validateForwardSlashes('src\\utils\\test.ts');

      expect(result).not.toBeNull();
      expect(result!.severity).toBe('warning');
      expect(result!.message).toContain('forward slashes');
    });
  });
});
