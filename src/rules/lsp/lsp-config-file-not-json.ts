/**
 * Rule: lsp-config-file-not-json
 *
 * Validates that LSP configFile paths end with .json
 *
 * Config files should use the .json extension to indicate their format
 * and improve editor support.
 */

import { Rule, RuleContext } from '../../types/rule';
import { safeParseJSON } from '../../utils/formats/json';
import { hasProperty, isObject, isString } from '../../utils/type-guards';

export const rule: Rule = {
  meta: {
    id: 'lsp-config-file-not-json',
    name: 'LSP Config File Not JSON',
    description:
      'LSP configFile should end with .json extension (DEPRECATED: configFile is not in official spec)',
    category: 'LSP',
    severity: 'warn',
    fixable: false,
    deprecated: true,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/lsp/lsp-config-file-not-json.md',
    docs: {
      summary: 'Warns when LSP configFile paths do not end with .json extension.',
      details:
        'This deprecated rule checks the `configFile` property on LSP server entries ' +
        'in `lsp.json` and warns when the path does not end with `.json`. Config files ' +
        'using the JSON extension get better editor support with syntax highlighting ' +
        'and validation. Note: the `configFile` property is not part of the official ' +
        'LSP specification and this rule is deprecated.',
      examples: {
        incorrect: [
          {
            description: 'Config file without .json extension',
            code:
              '{\n' +
              '  "my-server": {\n' +
              '    "command": "/usr/bin/my-server",\n' +
              '    "configFile": "config/server.yaml"\n' +
              '  }\n' +
              '}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Config file with .json extension',
            code:
              '{\n' +
              '  "my-server": {\n' +
              '    "command": "/usr/bin/my-server",\n' +
              '    "configFile": "config/server.json"\n' +
              '  }\n' +
              '}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Rename the configuration file to use the `.json` extension and update ' +
        'the `configFile` path in `lsp.json` accordingly.',
      whenNotToUse:
        'This rule is deprecated because `configFile` is not part of the official LSP ' +
        'specification. Disable it if your LSP server requires a non-JSON config format.',
      relatedRules: ['lsp-config-file-relative-path'],
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

    // Check each server with configFile specified (servers are top-level keys)
    for (const [serverName, serverConfig] of Object.entries(config)) {
      if (!isObject(serverConfig)) {
        continue;
      }

      if (!hasProperty(serverConfig, 'configFile') || !isString(serverConfig.configFile)) {
        continue;
      }

      if (!serverConfig.configFile.endsWith('.json')) {
        context.report({
          message: `LSP server "${serverName}" configFile "${serverConfig.configFile}" should be a JSON file.`,
        });
      }
    }
  },
};
