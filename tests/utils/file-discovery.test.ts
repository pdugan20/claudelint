/**
 * Tests for recursive file discovery in monorepo-style layouts.
 *
 * Verifies that findClaudeMdFiles() and findSkillDirectories() discover
 * files in nested subdirectories, not just at the project root.
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { setupTestDir } from '../helpers/test-utils';
import { findClaudeMdFiles, findSkillDirectories } from '../../src/utils/filesystem/files';

describe('Recursive File Discovery', () => {
  const { getTestDir } = setupTestDir();

  describe('findClaudeMdFiles', () => {
    it('should find CLAUDE.md at root', async () => {
      await writeFile(join(getTestDir(), 'CLAUDE.md'), '# Root');

      const files = await findClaudeMdFiles(getTestDir());
      expect(files).toHaveLength(1);
      expect(files[0]).toContain('CLAUDE.md');
    });

    it('should find CLAUDE.md in subdirectories', async () => {
      await writeFile(join(getTestDir(), 'CLAUDE.md'), '# Root');
      await mkdir(join(getTestDir(), 'src'), { recursive: true });
      await writeFile(join(getTestDir(), 'src', 'CLAUDE.md'), '# Src');
      await mkdir(join(getTestDir(), 'website'), { recursive: true });
      await writeFile(join(getTestDir(), 'website', 'CLAUDE.md'), '# Website');

      const files = await findClaudeMdFiles(getTestDir());
      expect(files).toHaveLength(3);

      const names = files.map((f) => f.replace(getTestDir() + '/', ''));
      expect(names).toContain('CLAUDE.md');
      expect(names).toContain('src/CLAUDE.md');
      expect(names).toContain('website/CLAUDE.md');
    });

    it('should find CLAUDE.md in deeply nested monorepo packages', async () => {
      const pkgDir = join(getTestDir(), 'packages', 'api');
      await mkdir(pkgDir, { recursive: true });
      await writeFile(join(pkgDir, 'CLAUDE.md'), '# API Package');

      const files = await findClaudeMdFiles(getTestDir());
      expect(files).toHaveLength(1);
      expect(files[0]).toContain('packages/api/CLAUDE.md');
    });

    it('should find CLAUDE.local.md in subdirectories', async () => {
      await writeFile(join(getTestDir(), 'CLAUDE.local.md'), '# Local root');
      const pkgDir = join(getTestDir(), 'packages', 'web');
      await mkdir(pkgDir, { recursive: true });
      await writeFile(join(pkgDir, 'CLAUDE.local.md'), '# Local web');

      const files = await findClaudeMdFiles(getTestDir());
      const localFiles = files.filter((f) => f.includes('CLAUDE.local.md'));
      expect(localFiles).toHaveLength(2);
    });

    it('should find .claude/rules/*.md files', async () => {
      const rulesDir = join(getTestDir(), '.claude', 'rules');
      await mkdir(rulesDir, { recursive: true });
      await writeFile(join(rulesDir, 'security.md'), '---\npaths: ["src/**"]\n---\n# Security');

      const files = await findClaudeMdFiles(getTestDir());
      expect(files).toHaveLength(1);
      expect(files[0]).toContain('.claude/rules/security.md');
    });

    it('should deduplicate results', async () => {
      // CLAUDE.md at root could match multiple patterns; verify no duplicates
      await writeFile(join(getTestDir(), 'CLAUDE.md'), '# Root');

      const files = await findClaudeMdFiles(getTestDir());
      expect(files).toHaveLength(1);
    });

    it('should exclude node_modules', async () => {
      const nmDir = join(getTestDir(), 'node_modules', 'some-pkg');
      await mkdir(nmDir, { recursive: true });
      await writeFile(join(nmDir, 'CLAUDE.md'), '# Should be ignored');

      const files = await findClaudeMdFiles(getTestDir());
      expect(files).toHaveLength(0);
    });
  });

  describe('findSkillDirectories', () => {
    it('should find skills at root .claude/skills/', async () => {
      const skillDir = join(getTestDir(), '.claude', 'skills', 'test-skill');
      await mkdir(skillDir, { recursive: true });
      await writeFile(join(skillDir, 'SKILL.md'), '---\nname: test-skill\n---\n# Test');

      const dirs = await findSkillDirectories(getTestDir());
      expect(dirs).toHaveLength(1);
      expect(dirs[0]).toContain('test-skill');
    });

    it('should find skills in nested monorepo package .claude/skills/', async () => {
      // Root skill
      const rootSkill = join(getTestDir(), '.claude', 'skills', 'root-skill');
      await mkdir(rootSkill, { recursive: true });
      await writeFile(join(rootSkill, 'SKILL.md'), '---\nname: root-skill\n---\n# Root');

      // Nested package skill
      const pkgSkill = join(getTestDir(), 'packages', 'frontend', '.claude', 'skills', 'pkg-skill');
      await mkdir(pkgSkill, { recursive: true });
      await writeFile(join(pkgSkill, 'SKILL.md'), '---\nname: pkg-skill\n---\n# Pkg');

      const dirs = await findSkillDirectories(getTestDir());
      expect(dirs).toHaveLength(2);

      const names = dirs.map((d) => d.split('/').pop());
      expect(names).toContain('root-skill');
      expect(names).toContain('pkg-skill');
    });

    it('should find skills in plugin-level skills/ directory', async () => {
      const skillDir = join(getTestDir(), 'skills', 'my-skill');
      await mkdir(skillDir, { recursive: true });
      await writeFile(join(skillDir, 'SKILL.md'), '---\nname: my-skill\n---\n# Skill');

      const dirs = await findSkillDirectories(getTestDir());
      expect(dirs).toHaveLength(1);
      expect(dirs[0]).toContain('my-skill');
    });

    it('should exclude node_modules', async () => {
      const nmSkill = join(getTestDir(), 'node_modules', 'pkg', '.claude', 'skills', 'nm-skill');
      await mkdir(nmSkill, { recursive: true });
      await writeFile(join(nmSkill, 'SKILL.md'), '---\nname: nm-skill\n---\n# Ignored');

      const dirs = await findSkillDirectories(getTestDir());
      expect(dirs).toHaveLength(0);
    });
  });
});
