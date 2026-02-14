/**
 * Tests for the `claudelint explain <rule-id>` subcommand (Tier 3)
 *
 * Tests the explain command output via CLI subprocess execution
 * to verify the full documentation is rendered correctly.
 */

import { spawnSync } from 'child_process';
import { join } from 'path';

const projectRoot = join(__dirname, '../..');
const claudelintBin = join(projectRoot, 'bin/claudelint');

/** Run the explain command and return output */
function runExplain(ruleId: string): { stdout: string; stderr: string; exitCode: number } {
  const result = spawnSync(claudelintBin, ['explain', ruleId], {
    cwd: projectRoot,
    encoding: 'utf-8',
  });
  return {
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    exitCode: result.status ?? 1,
  };
}

describe('explain command', () => {
  it('should print full documentation for a valid rule', () => {
    const { stdout, exitCode } = runExplain('skill-frontmatter-unknown-keys');

    expect(exitCode).toBe(0);

    // Title
    expect(stdout).toContain('skill-frontmatter-unknown-keys');
    expect(stdout).toContain('======');

    // Summary
    expect(stdout).toContain('Warns when SKILL.md frontmatter contains unrecognized keys.');

    // Details
    expect(stdout).toContain('SKILL.md frontmatter supports a specific set of known keys');

    // How to fix
    expect(stdout).toContain('How to fix:');

    // Examples
    expect(stdout).toContain('Examples:');
    expect(stdout).toContain('Incorrect');
    expect(stdout).toContain('Correct');

    // Metadata
    expect(stdout).toContain('Severity:');
    expect(stdout).toContain('Category:');
    expect(stdout).toContain('Fixable:');
    expect(stdout).toContain('Since:');
    expect(stdout).toContain('Docs:');
    expect(stdout).toContain('https://claudelint.com/rules/skills/skill-frontmatter-unknown-keys');

    // Related rules
    expect(stdout).toContain('Related rules:');
  });

  it('should exit with code 1 for an invalid rule', () => {
    const { stderr, exitCode } = runExplain('nonexistent-rule');

    expect(exitCode).toBe(1);
    expect(stderr).toContain('Error: Rule "nonexistent-rule" not found.');
    expect(stderr).toContain('Available rules:');
    expect(stderr).toContain('claudelint list-rules');
  });

  it('should include metadata fields in output', () => {
    const { stdout, exitCode } = runExplain('claude-md-size-error');

    expect(exitCode).toBe(0);
    expect(stdout).toContain('error');
    expect(stdout).toContain('CLAUDE.md');
    expect(stdout).toContain('no'); // fixable: no
  });

  it('should word-wrap long details text', () => {
    const { stdout, exitCode } = runExplain('skill-frontmatter-unknown-keys');

    expect(exitCode).toBe(0);

    // Verify the output contains the details text but word-wrapped
    // (no single line should exceed ~80-120 chars in the details section)
    const lines = stdout.split('\n');
    const longLines = lines.filter((line) => line.length > 120);
    // Allow some tolerance for rule ID lines and URLs
    const nonUrlLongLines = longLines.filter(
      (line) => !line.includes('http') && !line.includes('=====')
    );
    expect(nonUrlLongLines.length).toBe(0);
  });

  it('should show whenNotToUse section when present', () => {
    const { stdout, exitCode } = runExplain('claude-md-import-missing');

    expect(exitCode).toBe(0);
    expect(stdout).toContain('When not to use:');
  });

  it('should generate correct docs URL for different categories', () => {
    // Skills category
    const skills = runExplain('skill-name');
    expect(skills.stdout).toContain('https://claudelint.com/rules/skills/skill-name');

    // CLAUDE.md category
    const claudeMd = runExplain('claude-md-size-error');
    expect(claudeMd.stdout).toContain(
      'https://claudelint.com/rules/claude-md/claude-md-size-error'
    );

    // MCP category
    const mcp = runExplain('mcp-invalid-transport');
    expect(mcp.stdout).toContain('https://claudelint.com/rules/mcp/mcp-invalid-transport');
  });
});
