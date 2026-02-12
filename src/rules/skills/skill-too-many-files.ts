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
 * Options for skill-too-many-files rule
 */
export interface SkillTooManyFilesOptions {
  /** Maximum file count at root level before warning (default: 10) */
  maxFiles?: number;
}

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
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-too-many-files.md',
    docs: {
      summary: 'Warns when a skill directory has too many files at the root level.',
      details:
        'Skill directories with a large number of loose files become difficult to navigate and maintain. ' +
        'This rule counts files at the root level of the skill directory (excluding known documentation ' +
        'files like SKILL.md, README.md, CHANGELOG.md, .gitignore, and .DS_Store) and warns when the ' +
        'count exceeds the configured threshold (default: 10). The suggestion is to organize scripts ' +
        'into subdirectories such as `bin/`, `lib/`, and `tests/`.',
      examples: {
        incorrect: [
          {
            description: 'Skill directory with too many root-level files',
            code:
              'my-skill/\n' +
              '  SKILL.md\n' +
              '  build.sh\n  test.sh\n  deploy.sh\n  lint.sh\n' +
              '  format.sh\n  validate.sh\n  setup.sh\n  clean.sh\n' +
              '  migrate.sh\n  backup.sh\n  restore.sh',
            language: 'text',
          },
        ],
        correct: [
          {
            description: 'Skill directory organized into subdirectories',
            code:
              'my-skill/\n' +
              '  SKILL.md\n' +
              '  bin/\n' +
              '    build.sh\n    deploy.sh\n    clean.sh\n' +
              '  lib/\n' +
              '    format.sh\n    validate.sh\n' +
              '  tests/\n' +
              '    test.sh\n    lint.sh',
            language: 'text',
          },
          {
            description: 'Simple skill with few files (under threshold)',
            code: 'my-skill/\n' + '  SKILL.md\n' + '  run.sh\n' + '  config.json',
            language: 'text',
          },
        ],
      },
      howToFix:
        'Organize files into subdirectories. Common patterns include `bin/` for executables, ' +
        '`lib/` for libraries, and `tests/` for test scripts.',
      optionExamples: [
        {
          description: 'Allow up to 15 root-level files before warning',
          config: { maxFiles: 15 },
        },
      ],
      whenNotToUse:
        'If the skill intentionally provides many standalone scripts that are each invoked independently, ' +
        'you may increase the threshold or disable this rule.',
      relatedRules: ['skill-multi-script-missing-readme', 'skill-naming-inconsistent'],
    },
    schema: z.object({
      maxFiles: z.number().positive().int().optional(),
    }),
    defaultOptions: {
      maxFiles: DEFAULT_MAX_FILES,
    },
  },

  validate: async (context) => {
    const { filePath, options } = context;
    const maxFiles = (options as SkillTooManyFilesOptions).maxFiles ?? DEFAULT_MAX_FILES;

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
    } catch {
      // Silently ignore directory read errors
    }
  },
};
