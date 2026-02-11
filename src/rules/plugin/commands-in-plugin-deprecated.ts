/**
 * Rule: commands-in-plugin-deprecated
 *
 * Warns that the commands field in plugin.json is deprecated.
 */

import { Rule } from '../../types/rule';
import { PluginManifestSchema } from '../../validators/schemas';
import { z } from 'zod';

type PluginManifest = z.infer<typeof PluginManifestSchema>;

/**
 * Validates that plugin doesn't use deprecated commands field
 */
export const rule: Rule = {
  meta: {
    id: 'commands-in-plugin-deprecated',
    name: 'Commands In Plugin Deprecated',
    description: 'The commands field in plugin.json is deprecated',
    category: 'Plugin',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/plugin/commands-in-plugin-deprecated.md',
    docs: {
      recommended: true,
      summary: 'Warns when plugin.json uses the deprecated commands field.',
      details:
        'The "commands" field in plugin.json is deprecated and has been replaced by "skills". ' +
        'Skills provide better structure, versioning, and documentation capabilities. This rule ' +
        'warns when a non-empty commands array is found so that plugin authors can migrate to ' +
        'the skills-based approach.',
      examples: {
        incorrect: [
          {
            description: 'Plugin using the deprecated commands field',
            code: '{\n  "name": "my-plugin",\n  "version": "1.0.0",\n  "description": "A sample plugin",\n  "commands": [\n    "./commands/greet.md"\n  ]\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Plugin using skills instead of commands',
            code: '{\n  "name": "my-plugin",\n  "version": "1.0.0",\n  "description": "A sample plugin",\n  "skills": [\n    "./.claude/skills"\n  ]\n}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Replace the "commands" field with "skills" and convert each command to the skills format. ' +
        'Skills support SKILL.md files with structured metadata, versioning, and usage examples.',
      whenNotToUse:
        'Disable this rule if you are maintaining a legacy plugin that must support older ' +
        'versions of Claude Code that do not recognize the skills field.',
      relatedRules: ['plugin-missing-file'],
    },
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    // Only validate plugin.json files
    if (!filePath.endsWith('plugin.json')) {
      return;
    }

    let plugin: PluginManifest;
    try {
      plugin = JSON.parse(fileContent) as PluginManifest;
    } catch {
      return; // JSON parse errors handled by schema validation
    }

    // Warn if commands field is present and non-empty
    if (plugin.commands && plugin.commands.length > 0) {
      context.report({
        message:
          'The "commands" field in plugin.json is deprecated. Please migrate to "skills" instead. ' +
          'Skills provide better structure, versioning, and documentation.',
      });
    }
  },
};
