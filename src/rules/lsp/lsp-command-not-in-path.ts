/**
 * Rule: lsp-command-not-in-path
 *
 * Validates that LSP server commands are in PATH or use absolute paths
 *
 * Commands should either be in the system PATH or use absolute paths
 * to ensure portability and avoid runtime errors.
 */

import { Rule, RuleContext } from '../../types/rule';
import { safeParseJSON } from '../../utils/formats/json';
import { hasProperty, isObject, isString } from '../../utils/type-guards';

export const rule: Rule = {
  meta: {
    id: 'lsp-command-not-in-path',
    name: 'LSP Command Not In PATH',
    description: 'LSP server commands should be in PATH or use absolute paths',
    category: 'LSP',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/lsp/lsp-command-not-in-path',
    docs: {
      summary: 'Warns when LSP server commands are not in PATH or lack absolute paths.',
      rationale:
        'PATH-dependent commands may fail in CI, containers, or other environments with different PATH configurations.',
      details:
        'This rule checks each LSP server entry in `lsp.json` for its `command` field ' +
        'and warns when the command does not start with `/` (absolute path) or `./` ' +
        '(explicit relative path). Commands that rely on being in the system PATH may ' +
        'fail in environments where PATH is configured differently, such as CI systems, ' +
        "containers, or other developers' machines.",
      examples: {
        incorrect: [
          {
            description: 'Server command relies on PATH resolution',
            code:
              '{\n' +
              '  "typescript-server": {\n' +
              '    "command": "typescript-language-server --stdio"\n' +
              '  }\n' +
              '}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Server command uses absolute path',
            code:
              '{\n' +
              '  "typescript-server": {\n' +
              '    "command": "/usr/local/bin/typescript-language-server --stdio"\n' +
              '  }\n' +
              '}',
            language: 'json',
          },
          {
            description: 'Server command uses explicit relative path',
            code:
              '{\n' +
              '  "typescript-server": {\n' +
              '    "command": "./node_modules/.bin/typescript-language-server --stdio"\n' +
              '  }\n' +
              '}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Replace bare command names with absolute paths (e.g., `/usr/local/bin/my-server`) ' +
        'or explicit relative paths (e.g., `./node_modules/.bin/my-server`). ' +
        'You can find the absolute path with `which <command>`.',
      whenNotToUse:
        'Disable this rule if you have consistent PATH configuration across all ' +
        'environments and prefer shorter command references.',
      relatedRules: ['lsp-server-name-too-short', 'lsp-extension-missing-dot'],
    },
  },
  validate: (context: RuleContext) => {
    const { filePath, fileContent } = context;

    // Only validate lsp.json files
    if (!filePath.endsWith('lsp.json')) {
      return;
    }

    const config = safeParseJSON(fileContent);
    if (!isObject(config)) {
      return; // Invalid JSON handled by schema validation
    }

    // Check each server with inline command (servers are top-level keys)
    for (const [serverName, serverConfig] of Object.entries(config)) {
      if (!isObject(serverConfig)) {
        continue;
      }

      if (!hasProperty(serverConfig, 'command') || !isString(serverConfig.command)) {
        continue;
      }

      // Extract command name (first part before space)
      const commandName = serverConfig.command.split(' ')[0];

      // Warn if command doesn't start with / or ./
      if (!commandName.startsWith('/') && !commandName.startsWith('./')) {
        context.report({
          message: `Command "${commandName}" not found for server "${serverName}"`,
        });
      }
    }
  },
};
