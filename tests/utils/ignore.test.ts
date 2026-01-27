import { parseIgnoreFile, shouldIgnore, loadIgnorePatterns } from '../../src/utils/ignore';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { setupTestDir } from '../helpers/test-utils';

describe('Ignore utilities', () => {
  const { getTestDir } = setupTestDir();

  describe('parseIgnoreFile', () => {
    it('should parse ignore patterns from file', async () => {
      const testDir = getTestDir();
      const ignoreFilePath = join(testDir, '.claudelintignore');
      await writeFile(
        ignoreFilePath,
        `# Comment line
.cache/
*.log

# Another comment
temp/**
`
      );

      const patterns = parseIgnoreFile(ignoreFilePath);
      expect(patterns).toEqual(['.cache/', '*.log', 'temp/**']);
    });

    it('should return empty array if file does not exist', () => {
      const testDir = getTestDir();
      const ignoreFilePath = join(testDir, '.claudelintignore');

      const patterns = parseIgnoreFile(ignoreFilePath);
      expect(patterns).toEqual([]);
    });

    it('should skip empty lines', async () => {
      const testDir = getTestDir();
      const ignoreFilePath = join(testDir, '.claudelintignore');
      await writeFile(
        ignoreFilePath,
        `pattern1

pattern2


pattern3
`
      );

      const patterns = parseIgnoreFile(ignoreFilePath);
      expect(patterns).toEqual(['pattern1', 'pattern2', 'pattern3']);
    });
  });

  describe('shouldIgnore', () => {
    it('should match default ignore patterns', () => {
      expect(shouldIgnore('node_modules/foo/bar.js', [])).toBe(true);
      expect(shouldIgnore('.git/config', [])).toBe(true);
      expect(shouldIgnore('dist/bundle.js', [])).toBe(true);
      expect(shouldIgnore('build/output.js', [])).toBe(true);
    });

    it('should match custom patterns', () => {
      const patterns = ['.cache/', '*.log', 'temp/**'];

      expect(shouldIgnore('.cache/data.json', patterns)).toBe(true);
      expect(shouldIgnore('error.log', patterns)).toBe(true);
      expect(shouldIgnore('temp/foo/bar.txt', patterns)).toBe(true);
      expect(shouldIgnore('src/main.ts', patterns)).toBe(false);
    });

    it('should match wildcard patterns', () => {
      const patterns = ['*.tmp', 'test-*.js'];

      expect(shouldIgnore('data.tmp', patterns)).toBe(true);
      expect(shouldIgnore('test-unit.js', patterns)).toBe(true);
      expect(shouldIgnore('data.txt', patterns)).toBe(false);
    });

    it('should match directory patterns', () => {
      const patterns = ['logs/', 'temp/'];

      expect(shouldIgnore('logs/', patterns)).toBe(true);
      expect(shouldIgnore('logs/error.log', patterns)).toBe(true);
      expect(shouldIgnore('temp/data.json', patterns)).toBe(true);
      expect(shouldIgnore('src/logs.ts', patterns)).toBe(false);
    });

    it('should match double-star patterns', () => {
      const patterns = ['**/*.test.js', 'src/**/*.tmp'];

      expect(shouldIgnore('foo/bar/baz.test.js', patterns)).toBe(true);
      expect(shouldIgnore('src/components/header.tmp', patterns)).toBe(true);
      expect(shouldIgnore('src/main.js', patterns)).toBe(false);
    });
  });

  describe('loadIgnorePatterns', () => {
    it('should load patterns from .claudelintignore file', async () => {
      const testDir = getTestDir();
      const ignoreFilePath = join(testDir, '.claudelintignore');
      await writeFile(
        ignoreFilePath,
        `.cache/
*.log
temp/**
`
      );

      const patterns = loadIgnorePatterns(testDir);
      expect(patterns).toEqual(['.cache/', '*.log', 'temp/**']);
    });

    it('should return empty array if no ignore file exists', () => {
      const testDir = getTestDir();

      const patterns = loadIgnorePatterns(testDir);
      expect(patterns).toEqual([]);
    });
  });
});
