/**
 * Rule: plugin-missing-file
 *
 * Validates that files referenced in plugin.json exist.
 */

import { Rule } from '../../types/rule';
import { fileExists } from '../../utils/filesystem/files';
import { basename, dirname, join } from 'path';
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
        'Paths resolve from the plugin root, one level above .claude-plugin/plugin.json. ' +
        'Inline configuration entries and remote MCP URLs are not filesystem paths. ' +
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

    const manifestDir = dirname(filePath);
    const pluginRoot =
      basename(manifestDir) === '.claude-plugin' ? dirname(manifestDir) : manifestDir;

    // Helper to normalize string|array to array
    const toArray = (value: unknown): string[] => {
      if (typeof value === 'string') return [value];
      return Array.isArray(value)
        ? value.filter((entry): entry is string => typeof entry === 'string')
        : [];
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
    const commandPaths =
      plugin.commands && typeof plugin.commands === 'object' && !Array.isArray(plugin.commands)
        ? Object.values(plugin.commands).flatMap((command) => toArray(command?.source))
        : toArray(plugin.commands);
    for (const commandPath of commandPaths) {
      const resolvedPath = join(pluginRoot, commandPath);
      if (!(await fileExists(resolvedPath))) {
        context.report({
          message: `Referenced command path not found: ${commandPath}`,
        });
      }
    }

    // Validate hooks references (string path or array of paths; skip inline objects)
    const hooksValue =
      typeof plugin.hooks === 'object' && !Array.isArray(plugin.hooks) ? undefined : plugin.hooks;
    for (const hookPath of toArray(hooksValue)) {
      const resolvedPath = join(pluginRoot, hookPath);
      if (!(await fileExists(resolvedPath))) {
        context.report({
          message: `Referenced hooks config not found: ${hookPath}`,
        });
      }
    }

    // Validate MCP servers reference (string path or inline object)
    for (const reference of toArray(plugin.mcpServers)) {
      if (reference.startsWith('https://')) continue;
      const mcpPath = join(pluginRoot, reference);
      if (!(await fileExists(mcpPath))) {
        context.report({
          message: `Referenced MCP config not found: ${reference}`,
        });
      }
    }

    // Validate LSP servers reference (string path or inline object)
    for (const reference of toArray(plugin.lspServers)) {
      const lspPath = join(pluginRoot, reference);
      if (!(await fileExists(lspPath))) {
        context.report({
          message: `Referenced LSP config not found: ${reference}`,
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
