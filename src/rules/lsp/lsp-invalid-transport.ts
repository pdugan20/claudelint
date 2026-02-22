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
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/lsp/lsp-invalid-transport',
    docs: {
      recommended: true,
      summary: 'Validates that LSP server transport types are either "stdio" or "socket".',
      rationale:
        'An invalid transport type causes a runtime error when Claude Code tries to start the LSP server.',
      details:
        'This rule checks the transport field of each server defined in lsp.json. Only "stdio" and ' +
        '"socket" are valid transport types. If the transport field is omitted, the server defaults to ' +
        'stdio, which is acceptable. An invalid transport type will cause a runtime error when Claude ' +
        'Code tries to start the LSP server, as it will not know how to communicate with the process.',
      examples: {
        incorrect: [
          {
            description: 'LSP server with an invalid transport type',
            code: '{\n  "typescript": {\n    "command": "typescript-language-server",\n    "args": ["--stdio"],\n    "transport": "http"\n  }\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'LSP server with stdio transport',
            code: '{\n  "typescript": {\n    "command": "typescript-language-server",\n    "args": ["--stdio"],\n    "transport": "stdio"\n  }\n}',
            language: 'json',
          },
          {
            description: 'LSP server with transport omitted (defaults to stdio)',
            code: '{\n  "typescript": {\n    "command": "typescript-language-server",\n    "args": ["--stdio"]\n  }\n}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Set the transport field to either "stdio" or "socket". If the server communicates over ' +
        'standard input/output, use "stdio". If it communicates over a TCP socket, use "socket". ' +
        'Omit the field entirely to default to "stdio".',
      relatedRules: ['lsp-command-bare-name', 'lsp-extension-missing-dot'],
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

    // Check each server with transport specified (servers are top-level keys)
    for (const [serverName, serverConfig] of Object.entries(config)) {
      if (!isObject(serverConfig)) {
        continue;
      }

      if (!hasProperty(serverConfig, 'transport')) {
        continue; // No transport specified is OK (defaults to stdio)
      }

      const transport = serverConfig.transport;
      if (isString(transport) && !VALID_TRANSPORTS.includes(transport)) {
        context.report({
          message: `Invalid transport "${transport}" for server "${serverName}"`,
        });
      }
    }
  },
};
