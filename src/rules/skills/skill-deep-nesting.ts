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
// P4-1: Hard safety cap to prevent stack overflow from unexpected deep structures
const MAX_RECURSION_DEPTH = 20;

async function getMaxDirectoryDepth(dir: string, currentDepth = 0): Promise<number> {
  // P4-1: Hard recursion cap independent of configurable maxDepth
  if (currentDepth >= MAX_RECURSION_DEPTH) {
    return currentDepth;
  }

  try {
    const entries = await readdir(dir, { withFileTypes: true });
    // P4-1: Skip symlinks to prevent infinite loops from symlink cycles
    const subdirs = entries.filter(
      (entry) => entry.isDirectory() && !entry.isSymbolicLink() && entry.name !== 'node_modules'
    );

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
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/skills/skill-deep-nesting',
    schema: z.object({
      maxDepth: z.number().positive().int().optional(),
    }),
    defaultOptions: {
      maxDepth: DEFAULT_MAX_DEPTH,
    },
    docs: {
      strict: true,
      summary: 'Warns when a skill directory has excessive nesting depth.',
      rationale:
        'Deep directory nesting makes skill contents harder to discover and increases path complexity.',
      details:
        'This rule measures the maximum directory nesting depth within a skill directory starting from ' +
        'where the SKILL.md file resides. Deeply nested directories are harder to navigate, slower to scan, ' +
        'and often indicate an overly complex structure that should be flattened. ' +
        'The `node_modules` directory is excluded from the depth calculation.',
      examples: {
        incorrect: [
          {
            description: 'Skill directory with 4 levels of nesting (exceeds default max of 3)',
            code: 'my-skill/\n  SKILL.md\n  src/\n    utils/\n      helpers/\n        deep/\n          file.ts',
            language: 'text',
          },
        ],
        correct: [
          {
            description: 'Skill directory with flat structure',
            code: 'my-skill/\n  SKILL.md\n  run.sh\n  references/\n    api.md',
            language: 'text',
          },
        ],
      },
      howToFix:
        'Flatten the directory structure by reducing unnecessary nesting levels. ' +
        'Move deeply nested files closer to the skill root or consolidate subdirectories.',
      optionExamples: [
        {
          description: 'Allow up to 5 levels of nesting',
          config: { maxDepth: 5 },
        },
        {
          description: 'Enforce strict 2-level nesting limit',
          config: { maxDepth: 2 },
        },
      ],
      whenNotToUse:
        'Disable this rule if your skill has a legitimate reason for deep nesting, such as mirroring ' +
        'an external project structure that cannot be flattened.',
      relatedRules: ['skill-body-too-long'],
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
          message: `Nesting too deep (${depth}/${maxDepth} levels)`,
        });
      }
    } catch {
      // Silently ignore directory read errors
    }
  },
};
