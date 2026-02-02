/**
 * Rule: lsp-invalid-transport
 *
 * Validates that LSP transport type is valid
 *
 * Transport type must be either "stdio" or "socket".
 * Invalid transport types will cause runtime errors.
 */

import { Rule, RuleContext } from '../../types/rule';
import { safeParseJSON } from '../../utils/formats/json';
import { hasProperty, isObject, isString } from '../../utils/type-guards';

const VALID_TRANSPORTS = ['stdio', 'socket'];

export const rule: Rule = {
  meta: {
    id: 'lsp-invalid-transport',
    name: 'LSP Invalid Transport',
    description: 'LSP transport type must be "stdio" or "socket"',
    category: 'LSP',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/lsp/lsp-invalid-transport.md',
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

    // Check each server with transport specified
    for (const [serverName, serverConfig] of Object.entries(config.servers)) {
      if (!isObject(serverConfig)) {
        continue;
      }

      if (!hasProperty(serverConfig, 'transport')) {
        continue; // No transport specified is OK (defaults to stdio)
      }

      const transport = serverConfig.transport;
      if (isString(transport) && !VALID_TRANSPORTS.includes(transport)) {
        context.report({
          message: `Invalid transport type "${transport}" for server "${serverName}". Must be "stdio" or "socket".`,
        });
      }
    }
  },
};
