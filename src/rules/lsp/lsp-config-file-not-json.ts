/**
 * Rule: lsp-config-file-not-json
 *
 * Validates that LSP configFile paths end with .json
 *
 * Config files should use the .json extension to indicate their format
 * and improve editor support.
 */

import { Rule, RuleContext } from '../../types/rule';
import { safeParseJSON } from '../../utils/json-helpers';

export const rule: Rule = {
  meta: {
    id: 'lsp-config-file-not-json',
    name: 'LSP Config File Not JSON',
    description: 'LSP configFile should end with .json extension',
    category: 'LSP',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/lsp/lsp-config-file-not-json.md',
  },
  validate: (context: RuleContext) => {
    const { filePath, fileContent } = context;

    // Only validate lsp.json files
    if (!filePath.endsWith('lsp.json')) {
      return;
    }

    const config = safeParseJSON(fileContent);
    if (!config || !config.servers) {
      return; // Invalid JSON handled by schema validation
    }

    // Check each server with configFile specified
    for (const [serverName, serverConfig] of Object.entries(config.servers)) {
      if (!serverConfig || typeof serverConfig !== 'object') {
        continue;
      }

      const configFile = (serverConfig as any).configFile;
      if (!configFile || typeof configFile !== 'string') {
        continue;
      }

      if (!configFile.endsWith('.json')) {
        context.report({
          message: `LSP server "${serverName}" configFile "${configFile}" should be a JSON file.`,
        });
      }
    }
  },
};
