/**
 * Rule: lsp-config-file-relative-path
 *
 * Validates that LSP configFile paths use absolute or explicit relative paths
 *
 * Config file paths should be explicit (starting with / or ./) to avoid
 * ambiguity and improve portability across different working directories.
 */

import { Rule, RuleContext } from '../../types/rule';
import { safeParseJSON } from '../../utils/formats/json';
import { hasProperty, isObject, isString } from '../../utils/type-guards';

export const rule: Rule = {
  meta: {
    id: 'lsp-config-file-relative-path',
    name: 'LSP Config File Relative Path',
    description:
      'LSP configFile should use absolute or explicit relative paths (DEPRECATED: configFile is not in official spec)',
    category: 'LSP',
    severity: 'warn',
    fixable: false,
    deprecated: true,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/lsp/lsp-config-file-relative-path.md',
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

    // Check each server with configFile specified (servers are top-level keys)
    for (const [serverName, serverConfig] of Object.entries(config)) {
      if (!isObject(serverConfig)) {
        continue;
      }

      if (!hasProperty(serverConfig, 'configFile') || !isString(serverConfig.configFile)) {
        continue;
      }

      // Warn if path doesn't start with / or .
      if (!serverConfig.configFile.startsWith('/') && !serverConfig.configFile.startsWith('.')) {
        context.report({
          message: `LSP server "${serverName}" configFile "${serverConfig.configFile}" uses relative path. Consider using absolute or explicit relative path (./...).`,
        });
      }
    }
  },
};
