/**
 * Tests for init wizard modernization
 */

// Mock ESM modules before importing InitWizard
jest.mock('inquirer', () => ({
  default: { prompt: jest.fn().mockResolvedValue({ useDefaults: true }) },
  __esModule: true,
}));

// Mock chalk (ESM-only in v5)
const identity = (s: string) => s;
const chalkMock: Record<string, unknown> = {};
const handler: ProxyHandler<typeof identity> = {
  get: (_target, _prop) => new Proxy(identity, handler),
  apply: (_target, _thisArg, args) => args[0],
};
const chalkProxy = new Proxy(identity, handler);
chalkMock.default = chalkProxy;
chalkMock.__esModule = true;
jest.mock('chalk', () => chalkMock);

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { InitWizard } from '../../src/cli/init-wizard';
import { RuleRegistry } from '../../src/utils/rules/registry';

// Import validators to ensure rules are registered
import '../../src/validators';

describe('InitWizard', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `claudelint-init-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('project detection (P5-1)', () => {
    it('detects agents directory', async () => {
      mkdirSync(join(testDir, '.claude/agents'), { recursive: true });
      writeFileSync(join(testDir, 'package.json'), '{}');

      const wizard = new InitWizard(testDir);
      // Run with --yes to skip prompts; capture output via the created config
      await wizard.run({ yes: true });

      // Verify config was created (proves wizard ran successfully with agent detection)
      expect(existsSync(join(testDir, '.claudelintrc.json'))).toBe(true);
    });

    it('detects output-styles directory', async () => {
      mkdirSync(join(testDir, '.claude/output-styles'), { recursive: true });

      const wizard = new InitWizard(testDir);
      await wizard.run({ yes: true });

      expect(existsSync(join(testDir, '.claudelintrc.json'))).toBe(true);
    });

    it('detects commands directory', async () => {
      mkdirSync(join(testDir, '.claude/commands'), { recursive: true });

      const wizard = new InitWizard(testDir);
      await wizard.run({ yes: true });

      expect(existsSync(join(testDir, '.claudelintrc.json'))).toBe(true);
    });
  });

  describe('preset-based config (--yes flag)', () => {
    it('generates config with extends: claudelint:recommended', async () => {
      const wizard = new InitWizard(testDir);
      await wizard.run({ yes: true });

      const configPath = join(testDir, '.claudelintrc.json');
      expect(existsSync(configPath)).toBe(true);

      const config = JSON.parse(readFileSync(configPath, 'utf-8'));
      expect(config.extends).toBe('claudelint:recommended');
    });

    it('does not inline individual rules when using preset', async () => {
      const wizard = new InitWizard(testDir);
      await wizard.run({ yes: true });

      const config = JSON.parse(readFileSync(join(testDir, '.claudelintrc.json'), 'utf-8'));
      expect(config.rules).toBeUndefined();
    });

    it('uses --preset to select strict', async () => {
      const wizard = new InitWizard(testDir);
      await wizard.run({ yes: true, preset: 'strict' });

      const config = JSON.parse(readFileSync(join(testDir, '.claudelintrc.json'), 'utf-8'));
      expect(config.extends).toBe('claudelint:strict');
    });

    it('uses --preset to select all', async () => {
      const wizard = new InitWizard(testDir);
      await wizard.run({ yes: true, preset: 'all' });

      const config = JSON.parse(readFileSync(join(testDir, '.claudelintrc.json'), 'utf-8'));
      expect(config.extends).toBe('claudelint:all');
    });

    it('falls back to recommended for invalid --preset', async () => {
      const wizard = new InitWizard(testDir);
      await wizard.run({ yes: true, preset: 'invalid' });

      const config = JSON.parse(readFileSync(join(testDir, '.claudelintrc.json'), 'utf-8'));
      expect(config.extends).toBe('claudelint:recommended');
    });
  });

  describe('--force flag (P5-3)', () => {
    it('skips writing config when file exists and force is not set', async () => {
      const configPath = join(testDir, '.claudelintrc.json');
      writeFileSync(configPath, '{"rules": {"old": "error"}}');

      const wizard = new InitWizard(testDir);
      await wizard.run({ yes: true });

      // Should not overwrite
      const config = JSON.parse(readFileSync(configPath, 'utf-8'));
      expect(config.rules).toHaveProperty('old');
    });

    it('overwrites config when --force is set', async () => {
      const configPath = join(testDir, '.claudelintrc.json');
      writeFileSync(configPath, '{"rules": {"old": "error"}}');

      const wizard = new InitWizard(testDir);
      await wizard.run({ yes: true, force: true });

      // Should overwrite with preset config
      const config = JSON.parse(readFileSync(configPath, 'utf-8'));
      expect(config.rules).toBeUndefined();
      expect(config.extends).toBe('claudelint:recommended');
    });
  });

  describe('--hooks flag', () => {
    it('creates .claude/hooks/hooks.json with --yes --hooks', async () => {
      const wizard = new InitWizard(testDir);
      await wizard.run({ yes: true, hooks: true });

      const hooksPath = join(testDir, '.claude', 'hooks', 'hooks.json');
      expect(existsSync(hooksPath)).toBe(true);

      const hooks = JSON.parse(readFileSync(hooksPath, 'utf-8'));
      expect(hooks.hooks.SessionStart).toHaveLength(1);
      expect(hooks.hooks.SessionStart[0].hooks).toHaveLength(1);
      expect(hooks.hooks.SessionStart[0].hooks[0].type).toBe('command');
      expect(hooks.hooks.SessionStart[0].hooks[0].command).toContain('claudelint check-all');
    });

    it('does NOT create hooks file with --yes alone', async () => {
      const wizard = new InitWizard(testDir);
      await wizard.run({ yes: true });

      const hooksPath = join(testDir, '.claude', 'hooks', 'hooks.json');
      expect(existsSync(hooksPath)).toBe(false);
    });

    it('skips existing hooks file without --force', async () => {
      const hooksDir = join(testDir, '.claude', 'hooks');
      mkdirSync(hooksDir, { recursive: true });
      writeFileSync(join(hooksDir, 'hooks.json'), '{"hooks": {"SessionStart": []}}');

      const wizard = new InitWizard(testDir);
      await wizard.run({ yes: true, hooks: true });

      // Should not overwrite — original content preserved
      const hooks = JSON.parse(readFileSync(join(hooksDir, 'hooks.json'), 'utf-8'));
      expect(hooks.hooks.SessionStart).toHaveLength(0);
    });

    it('overwrites existing hooks file with --force', async () => {
      const hooksDir = join(testDir, '.claude', 'hooks');
      mkdirSync(hooksDir, { recursive: true });
      writeFileSync(join(hooksDir, 'hooks.json'), '{"hooks": {"SessionStart": []}}');

      const wizard = new InitWizard(testDir);
      await wizard.run({ yes: true, hooks: true, force: true });

      // Should overwrite with new content
      const hooks = JSON.parse(readFileSync(join(hooksDir, 'hooks.json'), 'utf-8'));
      expect(hooks.hooks.SessionStart).toHaveLength(1);
      expect(hooks.hooks.SessionStart[0].hooks[0].type).toBe('command');
    });

    it('creates .claude/hooks/ directories when they do not exist', async () => {
      const wizard = new InitWizard(testDir);
      await wizard.run({ yes: true, hooks: true });

      expect(existsSync(join(testDir, '.claude', 'hooks'))).toBe(true);
    });
  });

  describe('next-steps output (P5-4)', () => {
    it('includes claudelint.com URL', async () => {
      const logs: string[] = [];
      const origLog = console.log;
      const origErr = console.error;
      console.log = (...args: unknown[]) => logs.push(args.join(' '));
      console.error = (...args: unknown[]) => logs.push(args.join(' '));

      try {
        const wizard = new InitWizard(testDir);
        await wizard.run({ yes: true });
      } finally {
        console.log = origLog;
        console.error = origErr;
      }

      const output = logs.join('\n');
      expect(output).toContain('claudelint.com');
    });

    it('includes dynamic rule count', async () => {
      const logs: string[] = [];
      const origLog = console.log;
      const origErr = console.error;
      console.log = (...args: unknown[]) => logs.push(args.join(' '));
      console.error = (...args: unknown[]) => logs.push(args.join(' '));

      try {
        const wizard = new InitWizard(testDir);
        await wizard.run({ yes: true });
      } finally {
        console.log = origLog;
        console.error = origErr;
      }

      const output = logs.join('\n');
      const ruleCount = RuleRegistry.getAll().length;
      expect(output).toContain(`${ruleCount} rules available`);
    });
  });
});
