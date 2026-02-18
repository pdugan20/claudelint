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
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/plugin/plugin-missing-file',
    docs: {
      recommended: true,
      summary: 'Validates that files and directories referenced in plugin.json exist on disk.',
      rationale:
        'Missing referenced files cause the plugin to fail at runtime when Claude Code tries to load them.',
      details:
        'This rule checks that every path referenced in plugin.json actually exists. It validates ' +
        'skills, agents, commands, hooks, mcpServers, lspServers, and outputStyles paths. ' +
        'Missing referenced files will cause the plugin to fail at runtime when Claude Code tries ' +
        'to load the referenced resources.',
      examples: {
        incorrect: [
          {
            description: 'Plugin referencing a skills directory that does not exist',
            code: '{\n  "name": "my-plugin",\n  "version": "1.0.0",\n  "description": "My plugin",\n  "skills": [\n    "./.claude/skills"\n  ]\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Plugin with all referenced paths existing on disk',
            code: '{\n  "name": "my-plugin",\n  "version": "1.0.0",\n  "description": "My plugin",\n  "skills": [\n    "./.claude/skills"\n  ],\n  "hooks": "./.claude/hooks.json"\n}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Create the missing files or directories at the paths specified in plugin.json. ' +
        'Alternatively, remove or correct any stale references that point to files that have ' +
        'been moved or deleted.',
      relatedRules: [
        'plugin-missing-component-paths',
        'plugin-marketplace-files-not-found',
        'plugin-components-wrong-location',
      ],
    },
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

    // Helper to normalize string|array to array
    const toArray = (value: string | string[] | undefined): string[] => {
      if (!value) return [];
      return Array.isArray(value) ? value : [value];
    };

    // Validate skills references (string or array of paths)
    for (const skillPath of toArray(plugin.skills)) {
      const resolvedPath = join(pluginRoot, skillPath);
      if (!(await fileExists(resolvedPath))) {
        context.report({
          message: `Referenced skill path not found: ${skillPath}`,
        });
      }
    }

    // Validate agents references (string or array of paths)
    for (const agentPath of toArray(plugin.agents)) {
      const resolvedPath = join(pluginRoot, agentPath);
      if (!(await fileExists(resolvedPath))) {
        context.report({
          message: `Referenced agent path not found: ${agentPath}`,
        });
      }
    }

    // Validate commands references (string or array of paths)
    for (const commandPath of toArray(plugin.commands)) {
      const resolvedPath = join(pluginRoot, commandPath);
      if (!(await fileExists(resolvedPath))) {
        context.report({
          message: `Referenced command path not found: ${commandPath}`,
        });
      }
    }

    // Validate hooks references (string path or array of paths)
    for (const hookPath of toArray(plugin.hooks)) {
      const resolvedPath = join(pluginRoot, hookPath);
      if (!(await fileExists(resolvedPath))) {
        context.report({
          message: `Referenced hooks config not found: ${hookPath}`,
        });
      }
    }

    // Validate MCP servers reference (string path or inline object)
    if (plugin.mcpServers && typeof plugin.mcpServers === 'string') {
      const mcpPath = join(pluginRoot, plugin.mcpServers);
      if (!(await fileExists(mcpPath))) {
        context.report({
          message: `Referenced MCP config not found: ${plugin.mcpServers}`,
        });
      }
    }

    // Validate LSP servers reference (string path or inline object)
    if (plugin.lspServers && typeof plugin.lspServers === 'string') {
      const lspPath = join(pluginRoot, plugin.lspServers);
      if (!(await fileExists(lspPath))) {
        context.report({
          message: `Referenced LSP config not found: ${plugin.lspServers}`,
        });
      }
    }

    // Validate output styles references (string or array of paths)
    for (const stylePath of toArray(plugin.outputStyles)) {
      const resolvedPath = join(pluginRoot, stylePath);
      if (!(await fileExists(resolvedPath))) {
        context.report({
          message: `Referenced output style path not found: ${stylePath}`,
        });
      }
    }
  },
};
