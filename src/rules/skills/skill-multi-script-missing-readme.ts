/**
 * Rule: skill-multi-script-missing-readme
 *
 * Validates that skills with multiple scripts include a README.md
 *
 * Complex skills with many script files should include a README.md documenting:
 * - Setup and installation instructions
 * - Usage examples for each script
 * - Dependencies and requirements
 * - Troubleshooting guidance
 *
 * Options:
 * - maxScripts: Maximum script count before README required (default: 3)
 */

import { Rule, RuleContext } from '../../types/rule';
import { dirname } from 'path';
import { readdir } from 'fs/promises';
import { fileExists } from '../../utils/file-system';
import { SCRIPT_EXTENSIONS } from '../../schemas/constants';
import { z } from 'zod';

/**
 * Options for skill-multi-script-missing-readme rule
 */
export interface SkillMultiScriptMissingReadmeOptions {
  /** Maximum script count before README required (default: 3) */
  maxScripts?: number;
}

export const rule: Rule = {
  meta: {
    id: 'skill-multi-script-missing-readme',
    name: 'Skill Multi-Script Missing README',
    description: 'Skills with multiple scripts should include a README.md',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-multi-script-missing-readme.md',
    schema: z.object({
      maxScripts: z.number().positive().int().optional(),
    }),
    defaultOptions: {
      maxScripts: 3,
    },
  },
  validate: async (context: RuleContext) => {
    const { filePath, options } = context;

    // Only validate SKILL.md files
    if (!filePath.endsWith('SKILL.md')) {
      return;
    }

    const ruleOptions = options as SkillMultiScriptMissingReadmeOptions;
    const maxScripts = ruleOptions?.maxScripts ?? 3;

    // Get skill directory
    const skillDir = dirname(filePath);

    try {
      // Count script files in directory
      const entries = await readdir(skillDir, { withFileTypes: true });
      const scriptFiles = entries.filter(
        (entry) => entry.isFile() && SCRIPT_EXTENSIONS.some((ext) => entry.name.endsWith(ext))
      );

      // If skill has multiple scripts, check for README.md
      if (scriptFiles.length > maxScripts) {
        const readmePath = `${skillDir}/README.md`;
        const readmeExists = await fileExists(readmePath);

        if (!readmeExists) {
          context.report({
            message: `Skill has ${scriptFiles.length} scripts but no README.md. Complex skills should include a README with setup and usage instructions. (threshold: ${maxScripts})`,
          });
        }
      }
    } catch (error) {
      // Intentionally ignore directory read errors
      // This is an optional documentation check - if we can't read the directory,
      // we skip this check rather than failing validation
    }
  },
};
