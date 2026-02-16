/**
 * Tests for centralized pattern constants.
 *
 * Verifies that WATCH_TRIGGERS and VALIDATOR_FILE_PATTERNS cover all
 * registered validator IDs and that patterns are well-formed.
 */

import {
  WATCH_TRIGGERS,
  VALIDATOR_FILE_PATTERNS,
  CLAUDE_MD_PATTERNS,
  SKILL_PATTERNS,
  AGENT_PATTERNS,
  OUTPUT_STYLE_PATTERNS,
  SETTINGS_PATTERNS,
  HOOKS_PATTERNS,
  MCP_PATTERNS,
  LSP_PATTERNS,
  PLUGIN_PATTERNS,
  COMMANDS_PATTERNS,
  FORMATTABLE_MARKDOWN,
  FORMATTABLE_JSON,
  FORMATTABLE_YAML,
  FORMATTABLE_SHELL,
  INIT_DETECTION_PATHS,
} from '../../src/utils/filesystem/patterns';

/** All registered validator IDs (keep in sync with src/validators/) */
const VALIDATOR_IDS = [
  'claude-md',
  'skills',
  'hooks',
  'mcp',
  'settings',
  'agents',
  'output-styles',
  'plugin',
  'lsp',
  'commands',
];

describe('Centralized Pattern Constants', () => {
  describe('WATCH_TRIGGERS', () => {
    it('should have entries for all validator IDs', () => {
      for (const id of VALIDATOR_IDS) {
        expect(WATCH_TRIGGERS).toHaveProperty(id);
        expect(WATCH_TRIGGERS[id].length).toBeGreaterThan(0);
      }
    });

    it('should not have entries for unknown validator IDs', () => {
      for (const id of Object.keys(WATCH_TRIGGERS)) {
        expect(VALIDATOR_IDS).toContain(id);
      }
    });
  });

  describe('VALIDATOR_FILE_PATTERNS', () => {
    it('should have entries for all validator IDs', () => {
      for (const id of VALIDATOR_IDS) {
        expect(VALIDATOR_FILE_PATTERNS).toHaveProperty(id);
        expect(VALIDATOR_FILE_PATTERNS[id].length).toBeGreaterThan(0);
      }
    });

    it('should not have entries for unknown validator IDs', () => {
      for (const id of Object.keys(VALIDATOR_FILE_PATTERNS)) {
        expect(VALIDATOR_IDS).toContain(id);
      }
    });
  });

  describe('pattern well-formedness', () => {
    const allPatterns = [
      ...CLAUDE_MD_PATTERNS,
      ...SKILL_PATTERNS,
      ...AGENT_PATTERNS,
      ...OUTPUT_STYLE_PATTERNS,
      ...SETTINGS_PATTERNS,
      ...HOOKS_PATTERNS,
      ...MCP_PATTERNS,
      ...LSP_PATTERNS,
      ...PLUGIN_PATTERNS,
      ...COMMANDS_PATTERNS,
      ...FORMATTABLE_MARKDOWN,
      ...FORMATTABLE_JSON,
      ...FORMATTABLE_YAML,
      ...FORMATTABLE_SHELL,
    ];

    it('should not contain double slashes', () => {
      for (const pattern of allPatterns) {
        expect(pattern).not.toMatch(/\/\//);
      }
    });

    it('should not contain trailing slashes', () => {
      for (const pattern of allPatterns) {
        expect(pattern).not.toMatch(/\/$/);
      }
    });

    it('should not be empty strings', () => {
      for (const pattern of allPatterns) {
        expect(pattern.length).toBeGreaterThan(0);
      }
    });
  });

  describe('MCP_PATTERNS', () => {
    it('should use .mcp.json at root, not inside .claude/', () => {
      expect(MCP_PATTERNS).toContain('.mcp.json');
      for (const pattern of MCP_PATTERNS) {
        expect(pattern).not.toContain('.claude/mcp.json');
      }
    });
  });

  describe('HOOKS_PATTERNS', () => {
    it('should include hooks/hooks.json for plugins', () => {
      expect(HOOKS_PATTERNS).toContain('hooks/hooks.json');
    });

    it('should not include .claude/hooks.json (hooks live in settings.json)', () => {
      expect(HOOKS_PATTERNS).not.toContain('.claude/hooks.json');
    });
  });

  describe('CLAUDE_MD_PATTERNS', () => {
    it('should include .claude/CLAUDE.md alternate location', () => {
      expect(CLAUDE_MD_PATTERNS).toContain('**/.claude/CLAUDE.md');
    });

    it('should include CLAUDE.local.md', () => {
      expect(CLAUDE_MD_PATTERNS).toContain('**/CLAUDE.local.md');
    });
  });

  describe('INIT_DETECTION_PATHS', () => {
    it('should have paths for all detectable project features', () => {
      expect(INIT_DETECTION_PATHS.claudeDir).toBe('.claude');
      expect(INIT_DETECTION_PATHS.skills).toBe('.claude/skills');
      expect(INIT_DETECTION_PATHS.settings).toBe('.claude/settings.json');
      expect(INIT_DETECTION_PATHS.hooks).toBe('hooks/hooks.json');
      expect(INIT_DETECTION_PATHS.mcp).toBe('.mcp.json');
      expect(INIT_DETECTION_PATHS.plugin).toBe('plugin.json');
      expect(INIT_DETECTION_PATHS.claudeMd).toBe('CLAUDE.md');
    });
  });

  describe('FORMATTABLE_MARKDOWN', () => {
    it('should cover all markdown file types', () => {
      const patterns = [...FORMATTABLE_MARKDOWN];
      // CLAUDE.md variants
      expect(patterns.some((p) => p.includes('CLAUDE.md'))).toBe(true);
      // Skills
      expect(patterns.some((p) => p.includes('SKILL.md'))).toBe(true);
      // Agents
      expect(patterns.some((p) => p.includes('agents/'))).toBe(true);
      // Output styles
      expect(patterns.some((p) => p.includes('output-styles'))).toBe(true);
    });
  });
});
