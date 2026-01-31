import { execSync } from 'child_process';
import { join } from 'path';
import { readFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';

describe('Plugin Integration Tests', () => {
  const projectRoot = join(__dirname, '../..');
  const pluginJsonPath = join(projectRoot, 'plugin.json');
  const claudelintBin = join(projectRoot, 'bin/claudelint');

  describe('Plugin Manifest', () => {
    it('should have valid plugin.json at repository root', () => {
      expect(() => {
        const content = readFileSync(pluginJsonPath, 'utf-8');
        JSON.parse(content);
      }).not.toThrow();
    });

    it('should reference all created skills', () => {
      const plugin = JSON.parse(readFileSync(pluginJsonPath, 'utf-8'));
      const expectedSkills = [
        'validate',
        'validate-claude-md',
        'validate-skills',
        'validate-settings',
        'validate-hooks',
        'validate-mcp',
        'validate-plugin',
        'format',
      ];

      expect(plugin.skills).toBeDefined();
      expect(plugin.skills.length).toBe(expectedSkills.length);

      for (const skill of expectedSkills) {
        expect(plugin.skills).toContain(skill);
      }
    });

    it('should validate successfully', () => {
      const result = execSync(`${claudelintBin} validate-plugin`, {
        cwd: projectRoot,
        encoding: 'utf-8',
      });

      expect(result).toContain('All checks passed');
    });
  });

  describe('Skills Validation', () => {
    const skills = [
      'validate',
      'validate-claude-md',
      'validate-skills',
      'validate-settings',
      'validate-hooks',
      'validate-mcp',
      'validate-plugin',
      'format',
    ];

    skills.forEach((skillName) => {
      describe(`${skillName} skill`, () => {
        const skillPath = join(projectRoot, '.claude/skills', skillName);

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
      const result = execSync(`${claudelintBin} validate-hooks`, {
        cwd: projectRoot,
        encoding: 'utf-8',
      });

      expect(result).toContain('All checks passed');
    });

    it('should have SessionStart hook', () => {
      const hooksPath = join(projectRoot, '.claude/hooks/hooks.json');
      const hooks = JSON.parse(readFileSync(hooksPath, 'utf-8'));

      expect(hooks.hooks).toBeDefined();
      expect(hooks.hooks.length).toBeGreaterThan(0);

      const sessionStartHook = hooks.hooks.find((h: any) => h.event === 'SessionStart');
      expect(sessionStartHook).toBeDefined();
      expect(sessionStartHook.type).toBe('command');
      expect(sessionStartHook.command).toContain('claudelint check-all');
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
        'check-claude-md',
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
        // Run command and redirect output to file
        execSync(`${claudelintBin} check-all --format json > "${tempFile}" 2>&1 || true`, {
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
      try {
        const result = execSync(`${claudelintBin} check-all --verbose`, {
          cwd: projectRoot,
          encoding: 'utf-8',
          stdio: 'pipe',
        }).toString();

        expect(result).toContain('Timing breakdown');
      } catch (error: any) {
        // Even with errors, verbose should show timing
        const output = error.stdout || '';
        expect(output).toContain('Timing breakdown');
      }
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
