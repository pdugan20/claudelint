/**
 * Rule: skill-too-many-files
 *
 * Warns when skill directories have too many files at root level, making them
 * hard to maintain. Suggests organizing scripts into subdirectories.
 */

import { Rule } from '../../types/rule';
import { readdir } from 'fs/promises';
import { dirname } from 'path';
import { z } from 'zod';

const DEFAULT_MAX_FILES = 10;

/**
 * Too many files validation rule implementation
 */
export const rule: Rule = {
  meta: {
    id: 'skill-too-many-files',
    name: 'Skill Too Many Files',
    description: 'Skill directory has too many files at root level',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-too-many-files.md',
    schema: z.object({
      maxFiles: z.number().positive().int().optional(),
    }),
    defaultOptions: {
      maxFiles: DEFAULT_MAX_FILES,
    },
  },

  validate: async (context) => {
    const { filePath, options } = context;
    const maxFiles = (options.maxFiles as number | undefined) ?? DEFAULT_MAX_FILES;

    // Only check SKILL.md files
    if (!filePath.endsWith('SKILL.md')) {
      return;
    }

    try {
      const skillDir = dirname(filePath);
      const entries = await readdir(skillDir, { withFileTypes: true });

      // Count files at root level (excluding known documentation files)
      const rootFiles = entries.filter((entry) => {
        if (entry.isDirectory()) return false;
        const name = entry.name;
        const knownFiles = ['SKILL.md', 'README.md', 'CHANGELOG.md', '.gitignore', '.DS_Store'];
        return !knownFiles.includes(name);
      });

      // Warn if more than max allowed loose files
      if (rootFiles.length > maxFiles) {
        context.report({
          message:
            `Skill directory has ${rootFiles.length} files at root level (>${maxFiles} is hard to maintain). ` +
            `Consider organizing scripts into subdirectories like: bin/, lib/, tests/`,
        });
      }
    } catch (error) {
      // Silently ignore directory read errors
    }
  },
};
