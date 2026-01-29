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
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-naming-inconsistent.md',
    schema: z.object({
      minFiles: z.number().positive().int().optional(),
    }),
    defaultOptions: {
      minFiles: DEFAULT_MIN_FILES,
    },
  },

  validate: async (context) => {
    const { filePath, options } = context;
    const minFiles = (options.minFiles as number | undefined) ?? DEFAULT_MIN_FILES;

    // Only check SKILL.md files
    if (!filePath.endsWith('SKILL.md')) {
      return;
    }

    try {
      const skillDir = dirname(filePath);
      const entries = await readdir(skillDir, { withFileTypes: true });
      const files = entries.filter((entry) => entry.isFile());

      // Check for inconsistent naming patterns
      const kebabCase = files.filter((f) =>
        /^[a-z0-9]+(-[a-z0-9]+)*\.(sh|py|js|md)$/.test(f.name)
      );
      const snakeCase = files.filter((f) =>
        /^[a-z0-9]+(_[a-z0-9]+)+\.(sh|py|js|md)$/.test(f.name)
      );
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
            message:
              `Inconsistent file naming conventions detected: ${conventions.join(', ')}. ` +
              'Choose one naming convention (kebab-case recommended) and apply it consistently.',
          });
        }
      }
    } catch (error) {
      // Silently ignore directory read errors
    }
  },
};
