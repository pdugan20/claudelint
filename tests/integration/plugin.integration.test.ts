import { execSync, spawnSync } from 'child_process';
import { join } from 'path';
import { readFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';

/** Run CLI and return combined stdout+stderr output with exit code */
function runCLI(
  bin: string,
  args: string[],
  cwd: string
): { output: string; stdout: string; stderr: string; exitCode: number } {
  const result = spawnSync(bin, args, { cwd, encoding: 'utf-8' });
  return {
    output: (result.stdout || '') + (result.stderr || ''),
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    exitCode: result.status ?? 1,
  };
}

describe('Plugin Integration Tests', () => {
  const projectRoot = join(__dirname, '../..');
  const pluginJsonPath = join(projectRoot, '.claude-plugin/plugin.json');
  const claudelintBin = join(projectRoot, 'bin/claudelint');

  describe('Plugin Manifest', () => {
    it('should have valid plugin.json in .claude-plugin directory', () => {
      expect(() => {
        const content = readFileSync(pluginJsonPath, 'utf-8');
        JSON.parse(content);
      }).not.toThrow();
    });

    it('should have required plugin fields', () => {
      const plugin = JSON.parse(readFileSync(pluginJsonPath, 'utf-8'));

      // Plugin manifest no longer lists skills - they're auto-discovered from skills/ directory
      expect(plugin.name).toBe('claudelint');
      expect(plugin.description).toBeDefined();
      expect(plugin.version).toBeDefined();
    });

    it('should validate successfully', () => {
      const { output } = runCLI(claudelintBin, ['validate-plugin'], projectRoot);

      expect(output).toContain('All checks passed');
    });
  });

  describe('Skills Validation', () => {
    const skills = [
      'validate-all',
      'validate-cc-md',
      'validate-skills',
      'validate-settings',
      'validate-hooks',
      'validate-mcp',
      'validate-plugin',
      'format-cc',
      'optimize-cc-md',
    ];

    skills.forEach((skillName) => {
      describe(`${skillName} skill`, () => {
        const skillPath = join(projectRoot, 'skills', skillName);

        it('should have SKILL.md file', () => {
          const skillMdPath = join(skillPath, 'SKILL.md');
          expect(() => {
            readFileSync(skillMdPath, 'utf-8');
          }).not.toThrow();
        });

        it('should have valid frontmatter', () => {
          const skillMdPath = join(skillPath, 'SKILL.md');
          const content = readFileSync(skillMdPath, 'utf-8');

          expect(content).toMatch(/^---/);
          expect(content).toMatch(/name:/);
          expect(content).toMatch(/description:/);
          expect(content).toMatch(/version:/);
        });

        it('should have executable shell script', () => {
          const scriptPath = join(skillPath, `${skillName}.sh`);
          expect(() => {
            readFileSync(scriptPath, 'utf-8');
          }).not.toThrow();
        });

        it('should have shebang in shell script', () => {
          const scriptPath = join(skillPath, `${skillName}.sh`);
          const content = readFileSync(scriptPath, 'utf-8');
          expect(content).toMatch(/^#!/);
        });
      });
    });
  });

  describe('Hooks Configuration', () => {
    it('should have valid hooks.json', () => {
      const hooksPath = join(projectRoot, '.claude/hooks/hooks.json');
      expect(() => {
        const content = readFileSync(hooksPath, 'utf-8');
        JSON.parse(content);
      }).not.toThrow();
    });

    it('should validate successfully', () => {
      const { output } = runCLI(claudelintBin, ['validate-hooks'], projectRoot);

      expect(output).toContain('All checks passed');
    });

    it('should have SessionStart hook', () => {
      const hooksPath = join(projectRoot, '.claude/hooks/hooks.json');
      const hooksConfig = JSON.parse(readFileSync(hooksPath, 'utf-8'));

      expect(hooksConfig.hooks).toBeDefined();
      expect(hooksConfig.hooks.SessionStart).toBeDefined();
      expect(hooksConfig.hooks.SessionStart.length).toBeGreaterThan(0);

      const firstMatcherGroup = hooksConfig.hooks.SessionStart[0];
      expect(firstMatcherGroup.hooks).toBeDefined();
      expect(firstMatcherGroup.hooks[0].type).toBe('command');
      expect(firstMatcherGroup.hooks[0].command).toContain('claudelint check-all');
    });
  });

  describe('CLI Commands', () => {
    it('should run check-all successfully', () => {
      try {
        const result = execSync(`${claudelintBin} check-all --format compact`, {
          cwd: projectRoot,
          encoding: 'utf-8',
          stdio: 'pipe',
        }).toString();

        // Should complete without crashing
        expect(result).toBeDefined();
      } catch (error: any) {
        // Exit code 1 or 2 is OK (warnings/errors found), just not crash
        expect(error.status).toBeLessThan(3);
        expect(error.stdout || error.stderr).toBeDefined();
      }
    });

    it('should run validate commands', () => {
      const commands = [
        'validate-claude-md',
        'validate-skills',
        'validate-settings',
        'validate-hooks',
        'validate-mcp',
        'validate-plugin',
      ];

      for (const cmd of commands) {
        try {
          execSync(`${claudelintBin} ${cmd}`, {
            cwd: projectRoot,
            encoding: 'utf-8',
            stdio: 'pipe',
          });
        } catch (error: any) {
          // Exit code 1 or 2 is OK (warnings/errors found), just not crash
          expect(error.status).toBeLessThan(3);
          expect(error.stdout || error.stderr).toBeDefined();
        }
      }
    });

    it('should support --format json', () => {
      // Write output to a temp file to avoid buffer size limits
      const tempFile = join(tmpdir(), 'claudelint-test-output.json');

      try {
        // Run command and redirect stdout only to file (stderr has status messages)
        execSync(`${claudelintBin} check-all --format json > "${tempFile}" 2>/dev/null || true`, {
          cwd: projectRoot,
          encoding: 'utf-8',
        });

        // Read the full output from file
        const output = readFileSync(tempFile, 'utf-8');

        expect(() => {
          JSON.parse(output);
        }).not.toThrow();
      } finally {
        // Clean up temp file
        try {
          unlinkSync(tempFile);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    });

    it('should support --verbose flag', () => {
      const { output } = runCLI(claudelintBin, ['check-all', '--verbose'], projectRoot);

      // Even with errors, verbose should show timing
      expect(output).toContain('Timing:');
    });
  });

  describe('Configuration Files', () => {
    it('should have example configuration files', () => {
      const exampleConfigPath = join(projectRoot, '.claudelintrc.example.json');
      const exampleIgnorePath = join(projectRoot, '.claudelintignore.example');

      expect(() => {
        readFileSync(exampleConfigPath, 'utf-8');
      }).not.toThrow();

      expect(() => {
        readFileSync(exampleIgnorePath, 'utf-8');
      }).not.toThrow();
    });

    it('should have valid example config JSON', () => {
      const exampleConfigPath = join(projectRoot, '.claudelintrc.example.json');
      const content = readFileSync(exampleConfigPath, 'utf-8');

      expect(() => {
        JSON.parse(content);
      }).not.toThrow();

      const config = JSON.parse(content);
      expect(config.rules).toBeDefined();
      expect(config.output).toBeDefined();
    });
  });
});
