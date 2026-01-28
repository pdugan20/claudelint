import { SkillsValidator } from '../../src/validators/skills';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { setupTestDir } from '../helpers/test-utils';

describe('SkillsValidator', () => {
  const { getTestDir } = setupTestDir();

  async function createSkill(
    skillName: string,
    frontmatter: Record<string, unknown>,
    content = '# Skill Content'
  ) {
    const skillDir = join(getTestDir(), '.claude', 'skills', skillName);
    await mkdir(skillDir, { recursive: true });

    const yamlLines = Object.entries(frontmatter)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}:\n${value.map((v) => `  - ${v}`).join('\n')}`;
        }
        return `${key}: ${JSON.stringify(value)}`;
      })
      .join('\n');

    const skillContent = `---
${yamlLines}
---

${content}`;

    await writeFile(join(skillDir, 'SKILL.md'), skillContent);
    return skillDir;
  }

  describe('Required fields validation', () => {
    it('should pass for valid minimal skill', async () => {
      await createSkill('test-skill', {
        name: 'test-skill',
        description: 'A test skill for validation',
      });

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should error when name is missing', async () => {
      await createSkill('test-skill', {
        description: 'A test skill',
      });

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('Required'))).toBe(true);
    });

    it('should error when description is missing', async () => {
      await createSkill('test-skill', {
        name: 'test-skill',
      });

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('Required'))).toBe(true);
    });
  });

  describe('Name validation', () => {
    it('should error for invalid name format', async () => {
      await createSkill('test-skill', {
        name: 'TestSkill',
        description: 'Invalid name with uppercase',
      });

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) =>
          e.message.includes('Must contain only lowercase letters, numbers, and hyphens')
        )
      ).toBe(true);
    });

    it('should error when name does not match directory', async () => {
      await createSkill('test-skill', {
        name: 'different-name',
        description: 'Name mismatch',
      });

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('does not match directory name'))).toBe(
        true
      );
    });

    it('should error for name exceeding 64 characters', async () => {
      const longName = 'a'.repeat(65);
      await createSkill(longName, {
        name: longName,
        description: 'Too long name',
      });

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('64 characters or less'))).toBe(true);
    });
  });

  describe('allowed-tools validation', () => {
    it('should pass for valid tools', async () => {
      await createSkill('test-skill', {
        name: 'test-skill',
        description: 'Test skill',
        'allowed-tools': ['Bash', 'Read', 'Write'],
      });

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should error if allowed-tools is not an array', async () => {
      await createSkill('test-skill', {
        name: 'test-skill',
        description: 'Test skill',
        'allowed-tools': 'Bash',
      });

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('Expected array'))).toBe(true);
    });

    it('should warn for unknown tools', async () => {
      await createSkill('test-skill', {
        name: 'test-skill',
        description: 'Test skill',
        'allowed-tools': ['Bash', 'UnknownTool'],
      });

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.warnings.some((w) => w.message.includes('Unknown tool: UnknownTool'))).toBe(
        true
      );
    });
  });

  describe('model validation', () => {
    it('should pass for valid model', async () => {
      await createSkill('test-skill', {
        name: 'test-skill',
        description: 'Test skill',
        model: 'sonnet',
      });

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });

    it('should error for invalid model', async () => {
      await createSkill('test-skill', {
        name: 'test-skill',
        description: 'Test skill',
        model: 'gpt-4',
      });

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      // Zod enum error typically includes "Invalid enum value" or lists valid options
      expect(
        result.errors.some((e) => e.message.includes('enum') || e.message.includes('gpt-4'))
      ).toBe(true);
    });
  });

  describe('Referenced files validation', () => {
    it('should error for non-existent referenced files', async () => {
      const content = `# Test Skill

See [template](./template.md) for examples.`;

      await createSkill('test-skill', {
        name: 'test-skill',
        description: 'Test skill',
      }, content);

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('Referenced file not found'))).toBe(
        true
      );
    });

    it('should pass when referenced files exist', async () => {
      const content = `# Test Skill

See [template](./template.md) for examples.`;

      const skillDir = await createSkill('test-skill', {
        name: 'test-skill',
        description: 'Test skill',
      }, content);

      // Create the referenced file
      await writeFile(join(skillDir, 'template.md'), '# Template');

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
    });
  });

  describe('Specific skill validation', () => {
    it('should validate only the specified skill', async () => {
      await createSkill('skill-one', {
        name: 'skill-one',
        description: 'First skill',
      });

      await createSkill('skill-two', {
        name: 'wrong-name',
        description: 'Second skill with error',
      });

      const validator = new SkillsValidator({ path: getTestDir(), skill: 'skill-one' });
      const result = await validator.validate();

      // Should only validate skill-one, which is valid
      expect(result.valid).toBe(true);
    });
  });

  describe('No skills found', () => {
    it('should warn when no skill directories exist', async () => {
      // Don't create any skills
      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      // No errors, but should warn about no skills found
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('No skill directories found'))).toBe(
        true
      );
    });
  });

  describe('Directory organization checks', () => {
    it('should warn when skill has too many loose files', async () => {
      const skillDir = await createSkill('complex-skill', {
        name: 'complex-skill',
        description: 'Skill with many files',
      });

      // Create 15 loose files at root level
      for (let i = 1; i <= 15; i++) {
        await writeFile(join(skillDir, `script-${i}.sh`), '#!/bin/bash\necho test');
      }

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some((w) => w.message.includes('15 files at root level'))).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('subdirectories'))).toBe(true);
    });

    it('should not warn when skill has reasonable number of files', async () => {
      const skillDir = await createSkill('simple-skill', {
        name: 'simple-skill',
        description: 'Skill with few files',
        version: '1.0.0',
      }, 'Example:\n```bash\n./main.sh\n```');

      // Create just 3 files
      await writeFile(join(skillDir, 'main.sh'), '#!/bin/bash\necho test');
      await writeFile(join(skillDir, 'helper.sh'), '#!/bin/bash\necho helper');
      await writeFile(join(skillDir, 'README.md'), '# Readme');
      await writeFile(join(skillDir, 'CHANGELOG.md'), '# Changelog');

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBe(0);
    });

    it('should warn when skill has excessive directory nesting', async () => {
      const skillDir = await createSkill('nested-skill', {
        name: 'nested-skill',
        description: 'Skill with deep nesting',
      });

      // Create deeply nested directories (6 levels)
      const deepPath = join(skillDir, 'level1', 'level2', 'level3', 'level4', 'level5');
      await mkdir(deepPath, { recursive: true });
      await writeFile(join(deepPath, 'script.sh'), '#!/bin/bash\necho test');

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some((w) => w.message.includes('levels of nesting'))).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('flattening'))).toBe(true);
    });

    it('should not warn for reasonable directory depth', async () => {
      const skillDir = await createSkill('organized-skill', {
        name: 'organized-skill',
        description: 'Well organized skill',
        version: '1.0.0',
      }, 'Example:\n```bash\n./bin/main.sh\n```');

      // Create reasonable 2-level structure
      await mkdir(join(skillDir, 'bin'), { recursive: true });
      await mkdir(join(skillDir, 'lib'), { recursive: true });
      await writeFile(join(skillDir, 'bin', 'main.sh'), '#!/bin/bash\necho test');
      await writeFile(join(skillDir, 'lib', 'helper.sh'), '#!/bin/bash\necho helper');
      await writeFile(join(skillDir, 'CHANGELOG.md'), '# Changelog');

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBe(0);
    });
  });

  describe('Documentation checks', () => {
    it('should warn when CHANGELOG.md is missing', async () => {
      await createSkill('no-changelog-skill', {
        name: 'no-changelog-skill',
        description: 'Skill without changelog',
      });

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('CHANGELOG.md'))).toBe(true);
    });

    it('should warn when SKILL.md lacks usage examples', async () => {
      await createSkill('no-examples-skill', {
        name: 'no-examples-skill',
        description: 'Skill without examples',
      }, 'Just some text without code blocks or example sections.');

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('usage examples'))).toBe(true);
    });

    it('should not warn when SKILL.md has code blocks', async () => {
      await createSkill('with-code-skill', {
        name: 'with-code-skill',
        description: 'Skill with code examples',
        version: '1.0.0',
      }, 'Usage:\n\n```bash\n./script.sh\n```');

      // Add CHANGELOG.md
      const skillDir = join(getTestDir(), '.claude', 'skills', 'with-code-skill');
      await writeFile(join(skillDir, 'CHANGELOG.md'), '# Changelog');

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBe(0);
    });

    it('should warn when multi-script skill lacks README.md', async () => {
      const skillDir = await createSkill('multi-script-skill', {
        name: 'multi-script-skill',
        description: 'Skill with many scripts',
      });

      // Create 5 scripts
      for (let i = 1; i <= 5; i++) {
        await writeFile(join(skillDir, `script-${i}.sh`), '#!/bin/bash\necho test');
      }

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('README.md'))).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('5 scripts'))).toBe(true);
    });

    it('should warn when skill lacks version field', async () => {
      await createSkill('no-version-skill', {
        name: 'no-version-skill',
        description: 'Skill without version',
      });

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('version'))).toBe(true);
    });
  });

  describe('Best practices checks', () => {
    it('should warn when shell script lacks shebang', async () => {
      const skillDir = await createSkill('no-shebang-skill', {
        name: 'no-shebang-skill',
        description: 'Skill with script without shebang',
      });

      await writeFile(join(skillDir, 'script.sh'), 'echo "Hello"');

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('shebang'))).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('script.sh'))).toBe(true);
    });

    it('should warn when shell script lacks explanatory comments', async () => {
      const skillDir = await createSkill('no-comments-skill', {
        name: 'no-comments-skill',
        description: 'Skill with uncommented script',
      });

      // Create a script with 15 lines but no comments
      const scriptContent = '#!/bin/bash\n' + 'echo "line"\n'.repeat(14);
      await writeFile(join(skillDir, 'long-script.sh'), scriptContent);

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('no explanatory comments'))).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('long-script.sh'))).toBe(true);
    });

    it('should not warn for well-documented shell script', async () => {
      const skillDir = await createSkill('good-script-skill', {
        name: 'good-script-skill',
        description: 'Skill with well-documented script',
        version: '1.0.0',
      }, 'Example:\n```bash\n./script.sh\n```');

      const scriptContent = `#!/bin/bash
# This script does something useful
# Usage: ./script.sh <arg>

echo "Starting"
# Process the argument
ARG=$1
# Do the work
echo "Working on $ARG"
# Finish up
echo "Done"
`;
      await writeFile(join(skillDir, 'script.sh'), scriptContent);
      await writeFile(join(skillDir, 'CHANGELOG.md'), '# Changelog');

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBe(0);
    });

    it('should warn for inconsistent naming conventions', async () => {
      const skillDir = await createSkill('mixed-naming-skill', {
        name: 'mixed-naming-skill',
        description: 'Skill with mixed naming conventions',
      });

      // Create files with different naming conventions
      await writeFile(join(skillDir, 'kebab-case-script.sh'), '#!/bin/bash\necho test');
      await writeFile(join(skillDir, 'snake_case_script.sh'), '#!/bin/bash\necho test');
      await writeFile(join(skillDir, 'camelCaseScript.sh'), '#!/bin/bash\necho test');

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('Inconsistent file naming'))).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('kebab-case'))).toBe(true);
    });

    it('should not warn for consistent naming conventions', async () => {
      const skillDir = await createSkill('consistent-naming-skill', {
        name: 'consistent-naming-skill',
        description: 'Skill with consistent naming',
        version: '1.0.0',
      }, 'Example:\n```bash\n./main-script.sh\n```');

      // All kebab-case
      await writeFile(join(skillDir, 'main-script.sh'), '#!/bin/bash\n# Main\necho test');
      await writeFile(join(skillDir, 'helper-script.sh'), '#!/bin/bash\n# Helper\necho helper');
      await writeFile(join(skillDir, 'CHANGELOG.md'), '# Changelog');

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBe(0);
    });
  });

  describe('Security and safety checks', () => {
    it('should error for dangerous rm -rf / command', async () => {
      const skillDir = await createSkill('dangerous-skill', {
        name: 'dangerous-skill',
        description: 'Skill with dangerous command',
      });

      await writeFile(join(skillDir, 'dangerous.sh'), '#!/bin/bash\nrm -rf /\n');

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('Dangerous command'))).toBe(true);
      expect(result.errors.some((e) => e.message.includes('rm -rf /'))).toBe(true);
    });

    it('should warn for eval usage in shell script', async () => {
      const skillDir = await createSkill('eval-skill', {
        name: 'eval-skill',
        description: 'Skill using eval',
      });

      await writeFile(join(skillDir, 'eval-script.sh'), '#!/bin/bash\neval "$COMMAND"\n');

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('eval'))).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('security risks'))).toBe(true);
    });

    it('should warn for eval/exec in Python script', async () => {
      const skillDir = await createSkill('python-eval-skill', {
        name: 'python-eval-skill',
        description: 'Python skill using eval',
      });

      await writeFile(join(skillDir, 'eval-script.py'), '#!/usr/bin/env python3\neval(user_input)\n');

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('eval() or exec()'))).toBe(true);
    });

    it('should warn for path traversal patterns', async () => {
      const skillDir = await createSkill('traversal-skill', {
        name: 'traversal-skill',
        description: 'Skill with path traversal',
      });

      await writeFile(join(skillDir, 'script.sh'), '#!/bin/bash\ncat ../../secrets.txt\n');

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('path traversal'))).toBe(true);
    });

    it('should not warn for safe relative paths', async () => {
      const skillDir = await createSkill('safe-skill', {
        name: 'safe-skill',
        description: 'Skill with safe paths',
        version: '1.0.0',
      }, 'Example:\n```bash\n./script.sh\n```');

      await writeFile(join(skillDir, 'script.sh'), '#!/bin/bash\n# Safe script\ncat ./data.txt\n');
      await writeFile(join(skillDir, 'CHANGELOG.md'), '# Changelog');

      const validator = new SkillsValidator({ path: getTestDir() });
      const result = await validator.validate();

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBe(0);
    });
  });
});
