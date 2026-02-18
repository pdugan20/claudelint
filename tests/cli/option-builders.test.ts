/**
 * Tests for CLI option builder functions
 */

import { Command } from 'commander';
import {
  addCommonOptions,
  addOutputOptions,
  addEnforcementOptions,
  addCacheOptions,
  addFixOptions,
  addFileSelectionOptions,
  addWorkspaceOptions,
} from '../../src/cli/utils/option-builders';

function getOptionFlags(cmd: Command): string[] {
  return cmd.options.map((o) => o.long || o.short).filter(Boolean) as string[];
}

describe('option-builders', () => {
  describe('addCommonOptions', () => {
    it('registers expected flags', () => {
      const cmd = new Command();
      addCommonOptions(cmd);
      const flags = getOptionFlags(cmd);

      expect(flags).toContain('--cwd');
      expect(flags).toContain('--verbose');
      expect(flags).toContain('--config');
      expect(flags).toContain('--no-config');
      expect(flags).toContain('--debug-config');
      expect(flags).toContain('--warnings-as-errors');
      expect(flags).toContain('--max-warnings');
      expect(flags).toContain('--rule');
    });

    it('includes -v shorthand for verbose', () => {
      const cmd = new Command();
      addCommonOptions(cmd);
      const shorts = cmd.options.map((o) => o.short).filter(Boolean);
      expect(shorts).toContain('-v');
    });

    it('includes -c shorthand for config', () => {
      const cmd = new Command();
      addCommonOptions(cmd);
      const shorts = cmd.options.map((o) => o.short).filter(Boolean);
      expect(shorts).toContain('-c');
    });
  });

  describe('addOutputOptions', () => {
    it('registers expected flags', () => {
      const cmd = new Command();
      addOutputOptions(cmd);
      const flags = getOptionFlags(cmd);

      expect(flags).toContain('--format');
      expect(flags).toContain('--output-file');
      expect(flags).toContain('--quiet');
      expect(flags).toContain('--color');
      expect(flags).toContain('--no-color');
      expect(flags).toContain('--explain');
      expect(flags).toContain('--no-collapse');
      expect(flags).toContain('--timing');
      expect(flags).toContain('--show-docs-url');
      expect(flags).toContain('--stats');
    });

    it('includes -q shorthand for quiet', () => {
      const cmd = new Command();
      addOutputOptions(cmd);
      const shorts = cmd.options.map((o) => o.short).filter(Boolean);
      expect(shorts).toContain('-q');
    });
  });

  describe('addEnforcementOptions', () => {
    it('registers expected flags', () => {
      const cmd = new Command();
      addEnforcementOptions(cmd);
      const flags = getOptionFlags(cmd);

      expect(flags).toContain('--strict');
      expect(flags).toContain('--no-deprecated-warnings');
      expect(flags).toContain('--error-on-deprecated');
      expect(flags).toContain('--allow-empty-input');
    });
  });

  describe('addCacheOptions', () => {
    it('registers expected flags', () => {
      const cmd = new Command();
      addCacheOptions(cmd);
      const flags = getOptionFlags(cmd);

      expect(flags).toContain('--cache');
      expect(flags).toContain('--no-cache');
      expect(flags).toContain('--cache-location');
      expect(flags).toContain('--cache-strategy');
    });
  });

  describe('addFixOptions', () => {
    it('registers expected flags', () => {
      const cmd = new Command();
      addFixOptions(cmd);
      const flags = getOptionFlags(cmd);

      expect(flags).toContain('--fix');
      expect(flags).toContain('--fix-dry-run');
      expect(flags).toContain('--fix-type');
    });
  });

  describe('addFileSelectionOptions', () => {
    it('registers expected flags', () => {
      const cmd = new Command();
      addFileSelectionOptions(cmd);
      const flags = getOptionFlags(cmd);

      expect(flags).toContain('--ignore-pattern');
      expect(flags).toContain('--no-ignore');
      expect(flags).toContain('--changed');
      expect(flags).toContain('--since');
      expect(flags).toContain('--stdin');
      expect(flags).toContain('--stdin-filename');
    });
  });

  describe('addWorkspaceOptions', () => {
    it('registers expected flags', () => {
      const cmd = new Command();
      addWorkspaceOptions(cmd);
      const flags = getOptionFlags(cmd);

      expect(flags).toContain('--workspace');
      expect(flags).toContain('--workspaces');
    });
  });

  describe('composition', () => {
    it('option groups do not register duplicate long flags', () => {
      const cmd = new Command();
      addCommonOptions(cmd);
      addOutputOptions(cmd);
      addEnforcementOptions(cmd);
      addCacheOptions(cmd);
      addFixOptions(cmd);
      addFileSelectionOptions(cmd);
      addWorkspaceOptions(cmd);

      // Use long flag names for uniqueness check (--no-X pairs share attribute names by design)
      const longFlags = cmd.options.map((o) => o.long).filter(Boolean);
      const uniqueFlags = new Set(longFlags);
      expect(longFlags.length).toBe(uniqueFlags.size);
    });

    it('composing all groups yields expected total option count', () => {
      const cmd = new Command();
      addCommonOptions(cmd);
      addOutputOptions(cmd);
      addEnforcementOptions(cmd);
      addCacheOptions(cmd);
      addFixOptions(cmd);
      addFileSelectionOptions(cmd);
      addWorkspaceOptions(cmd);

      // 9 common + 10 output + 4 enforcement + 4 cache + 3 fix + 6 file selection + 2 workspace = 38
      expect(cmd.options.length).toBe(38);
    });
  });
});
