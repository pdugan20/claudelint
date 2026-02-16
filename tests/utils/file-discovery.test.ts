/**
 * Tests for recursive file discovery in monorepo-style layouts.
 *
 * Verifies that all find* functions in files.ts discover files
 * in the expected locations.
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { setupTestDir } from '../helpers/test-utils';
import {
  findClaudeMdFiles,
  findSkillDirectories,
  findAgentFiles,
  findOutputStyleFiles,
  findSettingsFiles,
  findHooksFiles,
  findMcpFiles,
  findLspFiles,
  findPluginManifests,
  findAllFormattableFiles,
} from '../../src/utils/filesystem/files';

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

    it('should find .claude/CLAUDE.md alternate location', async () => {
      const claudeDir = join(getTestDir(), '.claude');
      await mkdir(claudeDir, { recursive: true });
      await writeFile(join(claudeDir, 'CLAUDE.md'), '# Alternate');

      const files = await findClaudeMdFiles(getTestDir());
      expect(files).toHaveLength(1);
      expect(files[0]).toContain('.claude/CLAUDE.md');
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

  describe('findAgentFiles', () => {
    it('should find agents at .claude/agents/', async () => {
      const agentsDir = join(getTestDir(), '.claude', 'agents');
      await mkdir(agentsDir, { recursive: true });
      await writeFile(join(agentsDir, 'reviewer.md'), '---\nname: reviewer\n---\n# Agent');

      const files = await findAgentFiles(getTestDir());
      expect(files).toHaveLength(1);
      expect(files[0]).toContain('reviewer.md');
    });

    it('should find agents at plugin-level agents/ directory', async () => {
      const agentsDir = join(getTestDir(), 'agents');
      await mkdir(agentsDir, { recursive: true });
      await writeFile(join(agentsDir, 'helper.md'), '---\nname: helper\n---\n# Agent');

      const files = await findAgentFiles(getTestDir());
      expect(files).toHaveLength(1);
      expect(files[0]).toContain('helper.md');
    });

    it('should exclude node_modules', async () => {
      const nmAgentsDir = join(
        getTestDir(),
        'node_modules',
        'pkg',
        '.claude',
        'agents'
      );
      await mkdir(nmAgentsDir, { recursive: true });
      await writeFile(join(nmAgentsDir, 'nm-agent.md'), '# Ignored');

      const files = await findAgentFiles(getTestDir());
      expect(files).toHaveLength(0);
    });
  });

  describe('findOutputStyleFiles', () => {
    it('should find output styles at .claude/output-styles/', async () => {
      const styleDir = join(getTestDir(), '.claude', 'output-styles', 'concise');
      await mkdir(styleDir, { recursive: true });
      await writeFile(join(styleDir, 'style.md'), '---\nname: concise\n---\n# Style');

      const files = await findOutputStyleFiles(getTestDir());
      expect(files).toHaveLength(1);
      expect(files[0]).toContain('concise/style.md');
    });

    it('should find output styles at plugin-level output-styles/', async () => {
      const styleDir = join(getTestDir(), 'output-styles', 'verbose');
      await mkdir(styleDir, { recursive: true });
      await writeFile(join(styleDir, 'style.md'), '---\nname: verbose\n---\n# Style');

      const files = await findOutputStyleFiles(getTestDir());
      expect(files).toHaveLength(1);
      expect(files[0]).toContain('verbose/style.md');
    });
  });

  describe('findSettingsFiles', () => {
    it('should find settings.json', async () => {
      const claudeDir = join(getTestDir(), '.claude');
      await mkdir(claudeDir, { recursive: true });
      await writeFile(join(claudeDir, 'settings.json'), '{}');

      const files = await findSettingsFiles(getTestDir());
      expect(files).toHaveLength(1);
      expect(files[0]).toContain('settings.json');
    });

    it('should find settings.local.json', async () => {
      const claudeDir = join(getTestDir(), '.claude');
      await mkdir(claudeDir, { recursive: true });
      await writeFile(join(claudeDir, 'settings.json'), '{}');
      await writeFile(join(claudeDir, 'settings.local.json'), '{}');

      const files = await findSettingsFiles(getTestDir());
      expect(files).toHaveLength(2);
      expect(files.some((f) => f.includes('settings.local.json'))).toBe(true);
    });
  });

  describe('findHooksFiles', () => {
    it('should not find .claude/hooks.json (hooks live in settings.json)', async () => {
      const claudeDir = join(getTestDir(), '.claude');
      await mkdir(claudeDir, { recursive: true });
      await writeFile(join(claudeDir, 'hooks.json'), '{}');

      const files = await findHooksFiles(getTestDir());
      expect(files).toHaveLength(0);
    });

    it('should find hooks/hooks.json (plugin location)', async () => {
      const hooksDir = join(getTestDir(), 'hooks');
      await mkdir(hooksDir, { recursive: true });
      await writeFile(join(hooksDir, 'hooks.json'), '{}');

      const files = await findHooksFiles(getTestDir());
      expect(files).toHaveLength(1);
      expect(files[0]).toContain('hooks/hooks.json');
    });
  });

  describe('findMcpFiles', () => {
    it('should find .mcp.json at project root', async () => {
      await writeFile(join(getTestDir(), '.mcp.json'), '{}');

      const files = await findMcpFiles(getTestDir());
      expect(files).toHaveLength(1);
      expect(files[0]).toContain('.mcp.json');
    });

    it('should not find .claude/mcp.json (wrong location)', async () => {
      const claudeDir = join(getTestDir(), '.claude');
      await mkdir(claudeDir, { recursive: true });
      await writeFile(join(claudeDir, 'mcp.json'), '{}');

      const files = await findMcpFiles(getTestDir());
      // mcp.json inside .claude/ should not match
      expect(files.every((f) => !f.endsWith('.claude/mcp.json'))).toBe(true);
    });
  });

  describe('findLspFiles', () => {
    it('should find .claude/lsp.json', async () => {
      const claudeDir = join(getTestDir(), '.claude');
      await mkdir(claudeDir, { recursive: true });
      await writeFile(join(claudeDir, 'lsp.json'), '{}');

      const files = await findLspFiles(getTestDir());
      expect(files).toHaveLength(1);
      expect(files[0]).toContain('lsp.json');
    });
  });

  describe('findPluginManifests', () => {
    it('should find plugin.json at root', async () => {
      await writeFile(join(getTestDir(), 'plugin.json'), '{}');

      const files = await findPluginManifests(getTestDir());
      expect(files).toHaveLength(1);
      expect(files[0]).toContain('plugin.json');
    });

    it('should find .claude-plugin/plugin.json (legacy)', async () => {
      const pluginDir = join(getTestDir(), '.claude-plugin');
      await mkdir(pluginDir, { recursive: true });
      await writeFile(join(pluginDir, 'plugin.json'), '{}');

      const files = await findPluginManifests(getTestDir());
      expect(files).toHaveLength(1);
      expect(files[0]).toContain('.claude-plugin/plugin.json');
    });

    it('should find both root and legacy locations', async () => {
      await writeFile(join(getTestDir(), 'plugin.json'), '{}');
      const pluginDir = join(getTestDir(), '.claude-plugin');
      await mkdir(pluginDir, { recursive: true });
      await writeFile(join(pluginDir, 'plugin.json'), '{}');

      const files = await findPluginManifests(getTestDir());
      expect(files).toHaveLength(2);
    });
  });

  describe('findAllFormattableFiles', () => {
    it('should return categorized results', async () => {
      // Create markdown files
      await writeFile(join(getTestDir(), 'CLAUDE.md'), '# Root');

      // Create JSON files
      const claudeDir = join(getTestDir(), '.claude');
      await mkdir(claudeDir, { recursive: true });
      await writeFile(join(claudeDir, 'settings.json'), '{}');

      // Create shell files
      await writeFile(join(claudeDir, 'test.sh'), '#!/bin/bash\necho hello');

      const result = await findAllFormattableFiles(getTestDir());

      expect(result).toHaveProperty('markdown');
      expect(result).toHaveProperty('json');
      expect(result).toHaveProperty('yaml');
      expect(result).toHaveProperty('shell');

      expect(result.markdown.length).toBeGreaterThanOrEqual(1);
      expect(result.json.length).toBeGreaterThanOrEqual(1);
      expect(result.shell.length).toBeGreaterThanOrEqual(1);
    });

    it('should find nested CLAUDE.md files', async () => {
      await writeFile(join(getTestDir(), 'CLAUDE.md'), '# Root');
      await mkdir(join(getTestDir(), 'src'), { recursive: true });
      await writeFile(join(getTestDir(), 'src', 'CLAUDE.md'), '# Src');

      const result = await findAllFormattableFiles(getTestDir());
      const claudeFiles = result.markdown.filter((f) => f.includes('CLAUDE.md'));
      expect(claudeFiles.length).toBeGreaterThanOrEqual(2);
    });

    it('should find skill files', async () => {
      const skillDir = join(getTestDir(), '.claude', 'skills', 'my-skill');
      await mkdir(skillDir, { recursive: true });
      await writeFile(join(skillDir, 'SKILL.md'), '---\nname: test\n---\n# Skill');

      const result = await findAllFormattableFiles(getTestDir());
      expect(result.markdown.some((f) => f.includes('SKILL.md'))).toBe(true);
    });

    it('should find agent files', async () => {
      const agentsDir = join(getTestDir(), '.claude', 'agents');
      await mkdir(agentsDir, { recursive: true });
      await writeFile(join(agentsDir, 'helper.md'), '---\nname: helper\n---\n# Agent');

      const result = await findAllFormattableFiles(getTestDir());
      expect(result.markdown.some((f) => f.includes('agents/helper.md'))).toBe(true);
    });

    it('should exclude node_modules', async () => {
      const nmDir = join(getTestDir(), 'node_modules', 'pkg');
      await mkdir(nmDir, { recursive: true });
      await writeFile(join(nmDir, 'CLAUDE.md'), '# Ignored');

      const result = await findAllFormattableFiles(getTestDir());
      expect(result.markdown.length).toBe(0);
    });
  });
});
