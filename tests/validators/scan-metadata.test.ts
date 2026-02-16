/**
 * Tests for scanMetadata population across all validators.
 *
 * Verifies that each validator correctly populates scanMetadata to distinguish
 * "clean" (files checked, no issues) from "not applicable" (no files to check).
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { setupTestDir } from '../helpers/test-utils';
import { ClaudeMdValidator } from '../../src/validators/claude-md';
import { SkillsValidator } from '../../src/validators/skills';
import { AgentsValidator } from '../../src/validators/agents';
import { OutputStylesValidator } from '../../src/validators/output-styles';
import { CommandsValidator } from '../../src/validators/commands';
import { ScanMetadata } from '../../src/validators/file-validator';

// Schema validators
import { HooksValidator } from '../../src/validators/hooks';
import { SettingsValidator } from '../../src/validators/settings';
import { MCPValidator } from '../../src/validators/mcp';
import { PluginValidator } from '../../src/validators/plugin';
import { LSPValidator } from '../../src/validators/lsp';

describe('ScanMetadata', () => {
  const { getTestDir } = setupTestDir();

  describe('ClaudeMdValidator', () => {
    it('should mark as scanned when CLAUDE.md files exist', async () => {
      const filePath = join(getTestDir(), 'CLAUDE.md');
      await writeFile(filePath, '# Project\n\nContent here.');

      const validator = new ClaudeMdValidator({ path: filePath });
      const result = await validator.validate();

      expect(result.scanMetadata).toBeDefined();
      const meta = result.scanMetadata as ScanMetadata;
      expect(meta.skipped).toBe(false);
      expect(meta.filesScanned).toBe(1);
      expect(meta.filesFound).toHaveLength(1);
      expect(meta.filesFound[0]).toContain('CLAUDE.md');
    });

    it('should mark as skipped when no CLAUDE.md files found', async () => {
      const originalCwd = process.cwd();
      process.chdir(getTestDir());

      try {
        const validator = new ClaudeMdValidator();
        const result = await validator.validate();

        expect(result.scanMetadata).toBeDefined();
        const meta = result.scanMetadata as ScanMetadata;
        expect(meta.skipped).toBe(true);
        expect(meta.skipReason).toContain('no CLAUDE.md');
        expect(meta.filesScanned).toBe(0);
        expect(meta.filesFound).toHaveLength(0);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('SkillsValidator', () => {
    it('should mark as scanned when skill directories exist', async () => {
      const skillDir = join(getTestDir(), '.claude', 'skills', 'test-skill');
      await mkdir(skillDir, { recursive: true });
      await writeFile(
        join(skillDir, 'SKILL.md'),
        '---\nname: test-skill\ndescription: A test skill for testing scanMetadata\n---\n\n# Test Skill\n\nThis skill is for testing.'
      );

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.scanMetadata).toBeDefined();
      const meta = result.scanMetadata as ScanMetadata;
      expect(meta.skipped).toBe(false);
      expect(meta.filesScanned).toBe(1);
      expect(meta.filesFound[0]).toContain('SKILL.md');
    });

    it('should mark as skipped when no skill directories found', async () => {
      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.scanMetadata).toBeDefined();
      const meta = result.scanMetadata as ScanMetadata;
      expect(meta.skipped).toBe(true);
      expect(meta.skipReason).toContain('no .claude/skills/');
      expect(meta.filesScanned).toBe(0);
    });
  });

  describe('AgentsValidator', () => {
    it('should mark as scanned when agent files exist', async () => {
      const agentsDir = join(getTestDir(), '.claude', 'agents');
      await mkdir(agentsDir, { recursive: true });
      await writeFile(
        join(agentsDir, 'test-agent.md'),
        '---\nname: test-agent\ndescription: A test agent for testing scanMetadata\ntools:\n  - Bash\n---\n\nThis agent is for testing purposes only and provides comprehensive validation of scanMetadata.'
      );

      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.scanMetadata).toBeDefined();
      const meta = result.scanMetadata as ScanMetadata;
      expect(meta.skipped).toBe(false);
      expect(meta.filesScanned).toBe(1);
      expect(meta.filesFound[0]).toContain('test-agent.md');
    });

    it('should mark as skipped when no agent files found', async () => {
      const validator = new AgentsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.scanMetadata).toBeDefined();
      const meta = result.scanMetadata as ScanMetadata;
      expect(meta.skipped).toBe(true);
      expect(meta.skipReason).toContain('no agent files');
    });
  });

  describe('OutputStylesValidator', () => {
    it('should mark as skipped when no output style files found', async () => {
      const validator = new OutputStylesValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.scanMetadata).toBeDefined();
      const meta = result.scanMetadata as ScanMetadata;
      expect(meta.skipped).toBe(true);
      expect(meta.skipReason).toContain('no output styles');
    });
  });

  describe('CommandsValidator', () => {
    it('should mark as skipped when no .claude/commands/ directory', async () => {
      const validator = new CommandsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.scanMetadata).toBeDefined();
      const meta = result.scanMetadata as ScanMetadata;
      expect(meta.skipped).toBe(true);
      expect(meta.skipReason).toContain('no .claude/commands/');
    });

    it('should mark as scanned when .claude/commands/ directory exists', async () => {
      const commandsDir = join(getTestDir(), '.claude', 'commands');
      await mkdir(commandsDir, { recursive: true });

      const validator = new CommandsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.scanMetadata).toBeDefined();
      const meta = result.scanMetadata as ScanMetadata;
      expect(meta.skipped).toBe(false);
      expect(meta.filesScanned).toBe(1);
    });
  });

  describe('Schema Validators', () => {
    // Schema validators use cwd for file discovery when no specific file path is given.
    // We must chdir to the test directory so they search in an empty directory.
    let originalCwd: string;

    beforeEach(() => {
      originalCwd = process.cwd();
      process.chdir(getTestDir());
    });

    afterEach(() => {
      process.chdir(originalCwd);
    });

    describe('SettingsValidator', () => {
      it('should mark as scanned when settings files exist', async () => {
        const settingsDir = join(getTestDir(), '.claude');
        await mkdir(settingsDir, { recursive: true });
        await writeFile(
          join(settingsDir, 'settings.json'),
          JSON.stringify({ permissions: {} })
        );

        const validator = new SettingsValidator();
        const result = await validator.validate();

        expect(result.scanMetadata).toBeDefined();
        const meta = result.scanMetadata as ScanMetadata;
        expect(meta.skipped).toBe(false);
        expect(meta.filesScanned).toBe(1);
      });

      it('should mark as skipped when no settings files found', async () => {
        const validator = new SettingsValidator();
        const result = await validator.validate();

        expect(result.scanMetadata).toBeDefined();
        const meta = result.scanMetadata as ScanMetadata;
        expect(meta.skipped).toBe(true);
        expect(meta.skipReason).toBeDefined();
      });
    });

    describe('HooksValidator', () => {
      it('should mark as skipped when no hooks files found', async () => {
        const validator = new HooksValidator();
        const result = await validator.validate();

        expect(result.scanMetadata).toBeDefined();
        const meta = result.scanMetadata as ScanMetadata;
        expect(meta.skipped).toBe(true);
        expect(meta.skipReason).toBeDefined();
      });
    });

    describe('MCPValidator', () => {
      it('should mark as skipped when no mcp files found', async () => {
        const validator = new MCPValidator();
        const result = await validator.validate();

        expect(result.scanMetadata).toBeDefined();
        const meta = result.scanMetadata as ScanMetadata;
        expect(meta.skipped).toBe(true);
        expect(meta.skipReason).toBeDefined();
      });
    });

    describe('PluginValidator', () => {
      it('should mark as skipped when no plugin files found', async () => {
        const validator = new PluginValidator();
        const result = await validator.validate();

        expect(result.scanMetadata).toBeDefined();
        const meta = result.scanMetadata as ScanMetadata;
        expect(meta.skipped).toBe(true);
        expect(meta.skipReason).toBeDefined();
      });
    });

    describe('LSPValidator', () => {
      it('should mark as skipped when no lsp files found', async () => {
        const validator = new LSPValidator();
        const result = await validator.validate();

        expect(result.scanMetadata).toBeDefined();
        const meta = result.scanMetadata as ScanMetadata;
        expect(meta.skipped).toBe(true);
        expect(meta.skipReason).toBeDefined();
      });
    });
  });
});
