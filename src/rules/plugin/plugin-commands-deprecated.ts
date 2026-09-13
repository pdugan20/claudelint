/**
 * Rule: plugin-commands-deprecated
 *
 * Advises using skills for new work while the commands field remains supported.
 * Authority: docs-baseline/plugins-reference.md and docs-baseline/skills.md.
 */

import { Rule } from '../../types/rule';
import { PluginManifestSchema } from '../../validators/schemas';
import { z } from 'zod';

type PluginManifest = z.infer<typeof PluginManifestSchema>;

/**
 * Identifies use of the legacy commands field
 */
export const rule: Rule = {
  meta: {
    id: 'plugin-commands-deprecated',
    name: 'Plugin Legacy Commands',
    description: 'The commands field uses the legacy flat-file format',
    category: 'Plugin',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/plugin/plugin-commands-deprecated',
    docs: {
      recommended: true,
      summary: 'Advises using skills for new work when plugin.json uses commands.',
      rationale:
        'The commands field remains supported. Skills add a directory for supporting files and are preferred for new work.',
      details:
        'The "commands" field in plugin.json remains supported for flat Markdown files. ' +
        'Skills add a directory for supporting files. This optional advisory ' +
        'warns when a non-empty commands path or array is found so that plugin authors can migrate to ' +
        'the skills-based approach.',
      examples: {
        incorrect: [
          {
            description: 'Plugin using the legacy commands field',
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
        'Disable this advisory when intentionally retaining supported command files on ' +
        'current or older versions of Claude Code.',
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
        message: '"commands" uses the legacy flat-file format',
      });
    }
  },
};
