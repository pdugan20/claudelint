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
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/lsp/lsp-command-not-in-path.md',
  },
  validate: (context: RuleContext) => {
    const { filePath, fileContent } = context;

    // Only validate lsp.json files
    if (!filePath.endsWith('lsp.json')) {
      return;
    }

    const config = safeParseJSON(fileContent);
    if (!hasProperty(config, 'servers') || !isObject(config.servers)) {
      return; // Invalid JSON handled by schema validation
    }

    // Check each server with inline command
    for (const [serverName, serverConfig] of Object.entries(config.servers)) {
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
          message: `LSP server "${serverName}" command "${commandName}" should be in PATH or use absolute path.`,
        });
      }
    }
  },
};
