/**
 * Tests for skill-multi-script-missing-readme rule
 */

import { rule } from '../../../src/rules/skills/skill-multi-script-missing-readme';
import { RuleContext } from '../../../src/types/rule';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { setupTestDir } from '../../helpers/test-utils';

const { getTestDir } = setupTestDir();

describe('skill-multi-script-missing-readme', () => {
  async function createSkillWithScripts(
    skillName: string,
    scriptCount: number,
    includeReadme: boolean
  ): Promise<string> {
    const skillDir = join(getTestDir(), '.claude', 'skills', skillName);
    await mkdir(skillDir, { recursive: true });

    // Create SKILL.md
    const skillMdPath = join(skillDir, 'SKILL.md');
    await writeFile(
      skillMdPath,
      `---
name: ${skillName}
description: Test skill
---

# Usage

Test skill with ${scriptCount} scripts.`
    );

    // Create script files
    for (let i = 0; i < scriptCount; i++) {
      const scriptPath = join(skillDir, `script${i}.sh`);
      await writeFile(scriptPath, `#!/bin/bash\necho "script ${i}"`);
    }

    // Create README if requested
    if (includeReadme) {
      const readmePath = join(skillDir, 'README.md');
      await writeFile(readmePath, '# Skill README\n\nSetup and usage instructions.');
    }

    return skillMdPath;
  }

  async function runRule(filePath: string, content: string, options = {}) {
    const errors: Array<{ message: string }> = [];
    const context: RuleContext = {
      filePath,
      fileContent: content,
      options,
      report: ({ message }) => {
        errors.push({ message });
      },
    };

    await rule.validate(context);
    return errors;
  }

  it('should pass when skill has 3 or fewer scripts', async () => {
    const filePath = await createSkillWithScripts('test-skill-1', 3, false);
    const content = await require('fs/promises').readFile(filePath, 'utf-8');
    const errors = await runRule(filePath, content);
    expect(errors).toHaveLength(0);
  });

  it('should pass when skill has many scripts but includes README', async () => {
    const filePath = await createSkillWithScripts('test-skill-2', 5, true);
    const content = await require('fs/promises').readFile(filePath, 'utf-8');
    const errors = await runRule(filePath, content);
    expect(errors).toHaveLength(0);
  });

  it('should error when skill has 4+ scripts but no README', async () => {
    const filePath = await createSkillWithScripts('test-skill-3', 4, false);
    const content = await require('fs/promises').readFile(filePath, 'utf-8');
    const errors = await runRule(filePath, content);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('Skill has 4 scripts but no README.md');
  });

  it('should respect custom maxScripts option', async () => {
    const filePath = await createSkillWithScripts('test-skill-4', 2, false);
    const content = await require('fs/promises').readFile(filePath, 'utf-8');
    const errors = await runRule(filePath, content, { maxScripts: 1 });
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('threshold: 1');
  });

  it('should count different script extensions', async () => {
    const skillName = 'test-skill-5';
    const skillDir = join(getTestDir(), '.claude', 'skills', skillName);
    await mkdir(skillDir, { recursive: true });

    const skillMdPath = join(skillDir, 'SKILL.md');
    await writeFile(
      skillMdPath,
      `---
name: ${skillName}
description: Test skill
---

# Usage

Test skill with mixed scripts.`
    );

    // Create mixed script files (.sh, .py, .js) - only supported extensions
    await writeFile(join(skillDir, 'script1.sh'), '#!/bin/bash\necho "test"');
    await writeFile(join(skillDir, 'script2.py'), '#!/usr/bin/env python3\nprint("test")');
    await writeFile(join(skillDir, 'script3.js'), 'console.log("test");');
    await writeFile(join(skillDir, 'script4.js'), 'console.log("test2");');

    const content = await require('fs/promises').readFile(skillMdPath, 'utf-8');
    const errors = await runRule(skillMdPath, content);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('Skill has 4 scripts but no README.md');
  });

  it('should skip validation for non-SKILL.md files', async () => {
    const skillDir = join(getTestDir(), '.claude', 'skills', 'test-skill-6');
    await mkdir(skillDir, { recursive: true });

    const readmePath = join(skillDir, 'README.md');
    await writeFile(readmePath, '# README\n\nNot a SKILL.md file.');

    const content = await require('fs/promises').readFile(readmePath, 'utf-8');
    const errors = await runRule(readmePath, content);
    expect(errors).toHaveLength(0);
  });
});
