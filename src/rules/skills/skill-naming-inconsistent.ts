/**
 * Rule: skill-naming-inconsistent
 *
 * Warns when skill directories have files with inconsistent naming conventions
 * (mixing kebab-case, snake_case, and camelCase). Recommends choosing one
 * convention (preferably kebab-case) and applying it consistently.
 */

import { Rule } from '../../types/rule';
import { readdir } from 'fs/promises';
import { dirname } from 'path';
import { z } from 'zod';

const DEFAULT_MIN_FILES = 3;

/**
 * Options for skill-naming-inconsistent rule
 */
export interface SkillNamingInconsistentOptions {
  /** Minimum file count before checking for consistency (default: 3) */
  minFiles?: number;
}

/**
 * Naming inconsistency validation rule implementation
 */
export const rule: Rule = {
  meta: {
    id: 'skill-naming-inconsistent',
    name: 'Skill Naming Inconsistent',
    description: 'Skill has inconsistent file naming conventions',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/skills/skill-naming-inconsistent',
    docs: {
      summary: 'Warns when files in a skill directory mix different naming conventions.',
      rationale:
        'Mixed naming conventions (e.g. camelCase and kebab-case) reduce readability and predictability.',
      details:
        'Consistent file naming improves readability and predictability. This rule scans the skill ' +
        'directory for files using `.sh`, `.py`, `.js`, and `.md` extensions, classifies them as ' +
        'kebab-case, snake_case, or camelCase, and warns if multiple conventions are present. ' +
        'The check only fires when the total number of classifiable files reaches the configured ' +
        'minimum threshold (default: 3). Kebab-case is the recommended convention.',
      examples: {
        incorrect: [
          {
            description: 'Skill directory mixing kebab-case and snake_case',
            code:
              'my-skill/\n' +
              '  SKILL.md\n' +
              '  build-app.sh\n' +
              '  run_tests.sh\n' +
              '  deploy-prod.sh',
            language: 'text',
          },
        ],
        correct: [
          {
            description: 'Skill directory using consistent kebab-case',
            code:
              'my-skill/\n' +
              '  SKILL.md\n' +
              '  build-app.sh\n' +
              '  run-tests.sh\n' +
              '  deploy-prod.sh',
            language: 'text',
          },
        ],
      },
      howToFix:
        'Rename files to use a single naming convention. Kebab-case (e.g., `my-script.sh`) is recommended. ' +
        'Ensure all `.sh`, `.py`, `.js`, and `.md` files in the skill directory follow the same pattern.',
      optionExamples: [
        {
          description: 'Only check consistency when 5 or more files exist',
          config: { minFiles: 5 },
        },
      ],
      whenNotToUse:
        'If the skill directory contains files from different ecosystems with established naming ' +
        'conventions (e.g., Python snake_case alongside shell kebab-case), you may disable this rule.',
      relatedRules: ['skill-name', 'skill-too-many-files'],
    },
    schema: z.object({
      minFiles: z.number().positive().int().optional(),
    }),
    defaultOptions: {
      minFiles: DEFAULT_MIN_FILES,
    },
  },

  validate: async (context) => {
    const { filePath, options } = context;
    const minFiles = (options as SkillNamingInconsistentOptions).minFiles ?? DEFAULT_MIN_FILES;

    // Only check SKILL.md files
    if (!filePath.endsWith('SKILL.md')) {
      return;
    }

    try {
      const skillDir = dirname(filePath);
      const entries = await readdir(skillDir, { withFileTypes: true });
      const files = entries.filter((entry) => entry.isFile());

      // Check for inconsistent naming patterns
      const kebabCase = files.filter((f) => /^[a-z0-9]+(-[a-z0-9]+)*\.(sh|py|js|md)$/.test(f.name));
      const snakeCase = files.filter((f) => /^[a-z0-9]+(_[a-z0-9]+)+\.(sh|py|js|md)$/.test(f.name));
      const camelCase = files.filter(
        (f) => /^[a-z][a-zA-Z0-9]*\.(sh|py|js|md)$/.test(f.name) && /[A-Z]/.test(f.name)
      );

      const totalNamed = kebabCase.length + snakeCase.length + camelCase.length;

      // Warn if multiple naming conventions are mixed
      if (totalNamed >= minFiles) {
        const conventions = [];
        if (kebabCase.length > 0) conventions.push(`kebab-case (${kebabCase.length})`);
        if (snakeCase.length > 0) conventions.push(`snake_case (${snakeCase.length})`);
        if (camelCase.length > 0) conventions.push(`camelCase (${camelCase.length})`);

        if (conventions.length > 1) {
          context.report({
            message: `Inconsistent naming: ${conventions.join(', ')}`,
          });
        }
      }
    } catch {
      // Silently ignore directory read errors
    }
  },
};
