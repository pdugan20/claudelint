/**
 * Rule: plugin-missing-file
 *
 * Validates that files referenced in plugin.json exist.
 */

import { Rule } from '../../types/rule';
import { fileExists } from '../../utils/filesystem/files';
import { dirname, join } from 'path';
import { PluginManifestSchema } from '../../validators/schemas';
import { z } from 'zod';

type PluginManifest = z.infer<typeof PluginManifestSchema>;

/**
 * Validates that all referenced files exist
 */
export const rule: Rule = {
  meta: {
    id: 'plugin-missing-file',
    name: 'Plugin Missing File',
    description: 'Files referenced in plugin.json must exist',
    category: 'Plugin',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/plugin/plugin-missing-file.md',
  },

  validate: async (context) => {
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

    const pluginRoot = dirname(filePath);

    // Validate skills references
    if (plugin.skills) {
      for (const skillName of plugin.skills) {
        const skillPath = join(pluginRoot, '.claude', 'skills', skillName, 'SKILL.md');
        if (!(await fileExists(skillPath))) {
          context.report({
            message: `Referenced skill not found: ${skillName} (expected at ${skillPath})`,
          });
        }
      }
    }

    // Validate agents references
    if (plugin.agents) {
      for (const agentName of plugin.agents) {
        const agentPath = join(pluginRoot, '.claude', 'agents', `${agentName}.md`);
        if (!(await fileExists(agentPath))) {
          context.report({
            message: `Referenced agent not found: ${agentName} (expected at ${agentPath})`,
          });
        }
      }
    }

    // Validate hooks references
    if (plugin.hooks) {
      for (const hookName of plugin.hooks) {
        const hookPath = join(pluginRoot, '.claude', 'hooks', `${hookName}.json`);
        if (!(await fileExists(hookPath))) {
          context.report({
            message: `Referenced hook not found: ${hookName} (expected at ${hookPath})`,
          });
        }
      }
    }

    // Validate commands references
    if (plugin.commands) {
      for (const commandName of plugin.commands) {
        const commandPath = join(pluginRoot, '.claude', 'commands', `${commandName}.md`);
        if (!(await fileExists(commandPath))) {
          context.report({
            message: `Referenced command not found: ${commandName} (expected at ${commandPath})`,
          });
        }
      }
    }

    // Validate MCP servers references
    if (plugin.mcpServers) {
      for (const mcpServerName of plugin.mcpServers) {
        const mcpConfigPath = join(pluginRoot, '.mcp.json');
        if (!(await fileExists(mcpConfigPath))) {
          context.report({
            message: `Referenced MCP server ${mcpServerName} but .mcp.json not found`,
          });
          break; // Only report once for missing .mcp.json
        }
      }
    }
  },
};
