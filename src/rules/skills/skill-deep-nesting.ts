/**
 * Rule: skill-deep-nesting
 *
 * Warns when skill directories have excessive nesting depth, making them hard
 * to navigate. Suggests flattening the directory structure.
 */

import { Rule } from '../../types/rule';
import { readdir } from 'fs/promises';
import { dirname, join } from 'path';
import { z } from 'zod';

const DEFAULT_MAX_DEPTH = 3;

/**
 * Options for skill-deep-nesting rule
 */
export interface SkillDeepNestingOptions {
  /** Maximum directory nesting depth (default: 3) */
  maxDepth?: number;
}

/**
 * Get maximum directory depth recursively
 */
async function getMaxDirectoryDepth(dir: string, currentDepth = 0): Promise<number> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    const subdirs = entries.filter((entry) => entry.isDirectory() && entry.name !== 'node_modules');

    if (subdirs.length === 0) {
      return currentDepth;
    }

    const depths = await Promise.all(
      subdirs.map((subdir) => getMaxDirectoryDepth(join(dir, subdir.name), currentDepth + 1))
    );

    return Math.max(...depths);
  } catch {
    return currentDepth;
  }
}

/**
 * Deep nesting validation rule implementation
 */
export const rule: Rule = {
  meta: {
    id: 'skill-deep-nesting',
    name: 'Skill Deep Nesting',
    description: 'Skill directory has excessive directory nesting',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-deep-nesting.md',
    schema: z.object({
      maxDepth: z.number().positive().int().optional(),
    }),
    defaultOptions: {
      maxDepth: DEFAULT_MAX_DEPTH,
    },
  },

  validate: async (context) => {
    const { filePath, options } = context;
    const maxDepth = (options as SkillDeepNestingOptions).maxDepth ?? DEFAULT_MAX_DEPTH;

    // Only check SKILL.md files
    if (!filePath.endsWith('SKILL.md')) {
      return;
    }

    try {
      const skillDir = dirname(filePath);
      const depth = await getMaxDirectoryDepth(skillDir);

      if (depth > maxDepth) {
        context.report({
          message:
            `Skill directory has ${depth} levels of nesting (>${maxDepth} is hard to navigate). ` +
            `Consider flattening the directory structure.`,
        });
      }
    } catch {
      // Silently ignore directory read errors
    }
  },
};
