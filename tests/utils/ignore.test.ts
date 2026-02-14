import {
  parseIgnoreFile,
  createIgnoreFilter,
  isIgnored,
  filterIgnored,
  DEFAULT_IGNORES,
} from '../../src/utils/config/ignore';
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

  describe('DEFAULT_IGNORES', () => {
    it('should include all standard directories', () => {
      expect(DEFAULT_IGNORES).toContain('node_modules');
      expect(DEFAULT_IGNORES).toContain('.git');
      expect(DEFAULT_IGNORES).toContain('dist');
      expect(DEFAULT_IGNORES).toContain('build');
      expect(DEFAULT_IGNORES).toContain('coverage');
    });
  });

  describe('createIgnoreFilter', () => {
    it('should create a filter with default ignores', () => {
      const testDir = getTestDir();
      const ig = createIgnoreFilter(testDir);

      expect(ig.ignores('node_modules/foo/bar.js')).toBe(true);
      expect(ig.ignores('.git/config')).toBe(true);
      expect(ig.ignores('dist/bundle.js')).toBe(true);
      expect(ig.ignores('build/output.js')).toBe(true);
      expect(ig.ignores('coverage/lcov.info')).toBe(true);
      expect(ig.ignores('src/main.ts')).toBe(false);
    });

    it('should load custom patterns from .claudelintignore', async () => {
      const testDir = getTestDir();
      await writeFile(
        join(testDir, '.claudelintignore'),
        `.cache/
*.log
temp/**
`
      );

      const ig = createIgnoreFilter(testDir);

      expect(ig.ignores('.cache/data.json')).toBe(true);
      expect(ig.ignores('error.log')).toBe(true);
      expect(ig.ignores('temp/foo/bar.txt')).toBe(true);
      expect(ig.ignores('src/main.ts')).toBe(false);
    });

    it('should handle trailing-slash directory patterns', async () => {
      const testDir = getTestDir();
      await writeFile(
        join(testDir, '.claudelintignore'),
        `tests/fixtures/
examples/
`
      );

      const ig = createIgnoreFilter(testDir);

      // Trailing slash in .gitignore means "match directory contents"
      expect(ig.ignores('tests/fixtures/project/CLAUDE.md')).toBe(true);
      expect(ig.ignores('tests/fixtures/deep/nested/file.ts')).toBe(true);
      expect(ig.ignores('examples/demo/config.json')).toBe(true);
      expect(ig.ignores('src/tests/fixtures.ts')).toBe(false);
    });

    it('should handle negation patterns', async () => {
      const testDir = getTestDir();
      await writeFile(
        join(testDir, '.claudelintignore'),
        `*.log
!important.log
`
      );

      const ig = createIgnoreFilter(testDir);

      expect(ig.ignores('error.log')).toBe(true);
      expect(ig.ignores('debug.log')).toBe(true);
      expect(ig.ignores('important.log')).toBe(false);
    });
  });

  describe('isIgnored', () => {
    it('should check if a relative path is ignored', () => {
      const testDir = getTestDir();

      expect(isIgnored('node_modules/foo/bar.js', testDir)).toBe(true);
      expect(isIgnored('src/main.ts', testDir)).toBe(false);
    });

    it('should respect custom .claudelintignore', async () => {
      const testDir = getTestDir();
      await writeFile(join(testDir, '.claudelintignore'), 'secret/\n');

      expect(isIgnored('secret/keys.json', testDir)).toBe(true);
      expect(isIgnored('public/index.html', testDir)).toBe(false);
    });
  });

  describe('filterIgnored', () => {
    it('should filter out ignored absolute paths', () => {
      const testDir = getTestDir();
      const paths = [
        join(testDir, 'src/main.ts'),
        join(testDir, 'node_modules/foo/index.js'),
        join(testDir, 'dist/bundle.js'),
        join(testDir, 'src/utils.ts'),
      ];

      const result = filterIgnored(paths, testDir);

      expect(result).toEqual([
        join(testDir, 'src/main.ts'),
        join(testDir, 'src/utils.ts'),
      ]);
    });

    it('should keep paths outside baseDir', () => {
      const testDir = getTestDir();
      const outsidePath = '/some/other/project/file.ts';
      const insidePath = join(testDir, 'node_modules/foo.js');

      const result = filterIgnored([outsidePath, insidePath], testDir);

      expect(result).toEqual([outsidePath]);
    });

    it('should respect .claudelintignore patterns', async () => {
      const testDir = getTestDir();
      await writeFile(
        join(testDir, '.claudelintignore'),
        `tests/fixtures/
`
      );

      const paths = [
        join(testDir, 'src/main.ts'),
        join(testDir, 'tests/fixtures/project/CLAUDE.md'),
        join(testDir, 'tests/unit/main.test.ts'),
      ];

      const result = filterIgnored(paths, testDir);

      expect(result).toEqual([
        join(testDir, 'src/main.ts'),
        join(testDir, 'tests/unit/main.test.ts'),
      ]);
    });
  });
});
