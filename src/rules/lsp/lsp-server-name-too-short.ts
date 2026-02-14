/**
 * Rule: lsp-server-name-too-short
 *
 * Validates that LSP server names are descriptive
 *
 * Server names should be descriptive to improve readability and
 * maintainability of LSP configuration files.
 *
 * Options:
 * - minLength: Minimum server name length (default: 2)
 */

import { Rule, RuleContext } from '../../types/rule';
import { safeParseJSON } from '../../utils/formats/json';
import { isObject } from '../../utils/type-guards';
import { z } from 'zod';

/**
 * Options for lsp-server-name-too-short rule
 */
export interface LspServerNameTooShortOptions {
  /** Minimum server name length (default: 2) */
  minLength?: number;
}

export const rule: Rule = {
  meta: {
    id: 'lsp-server-name-too-short',
    name: 'LSP Server Name Too Short',
    description: 'LSP server names should be descriptive',
    category: 'LSP',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/lsp/lsp-server-name-too-short.md',
    schema: z.object({
      minLength: z.number().positive().int().optional(),
    }),
    defaultOptions: {
      minLength: 2,
    },
    docs: {
      summary: 'Warns when LSP server names are too short to be descriptive.',
      rationale: 'Short, cryptic server names make LSP configurations hard to maintain and debug.',
      details:
        'This rule checks the top-level keys in `lsp.json`, which serve as server names, ' +
        'and warns when any name is shorter than the configured minimum length. ' +
        'Descriptive server names like `typescript-language-server` or `python-lsp` ' +
        'improve readability and maintainability of LSP configuration files. ' +
        'Single-character or very short names make it hard to identify which ' +
        'language server is being configured.',
      examples: {
        incorrect: [
          {
            description: 'Server name that is too short',
            code: '{\n' + '  "t": {\n' + '    "command": "/usr/bin/tsserver"\n' + '  }\n' + '}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Descriptive server name',
            code:
              '{\n' +
              '  "typescript-server": {\n' +
              '    "command": "/usr/bin/tsserver"\n' +
              '  }\n' +
              '}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Rename the server key to a more descriptive name that identifies the ' +
        'language or purpose, such as `typescript-server`, `python-lsp`, or `rust-analyzer`.',
      options: {
        minLength: {
          type: 'number',
          description: 'Minimum server name length',
          default: 2,
        },
      },
      optionExamples: [
        {
          description: 'Require server names of at least 3 characters',
          config: { minLength: 3 },
        },
        {
          description: 'Allow single-character server names',
          config: { minLength: 1 },
        },
      ],
      whenNotToUse:
        'Disable this rule if you have an established convention using short ' +
        'abbreviations for server names that are well-understood by your team.',
      relatedRules: ['lsp-command-not-in-path', 'lsp-extension-missing-dot'],
    },
  },
  validate: (context: RuleContext) => {
    const { filePath, fileContent, options } = context;

    // Only validate lsp.json files
    if (!filePath.endsWith('lsp.json')) {
      return;
    }

    const ruleOptions = options as LspServerNameTooShortOptions;
    const minLength = ruleOptions?.minLength ?? 2;

    const config = safeParseJSON(fileContent);
    if (!isObject(config)) {
      return; // Invalid JSON handled by schema validation
    }

    // Check each server name (servers are top-level keys)
    for (const serverName of Object.keys(config)) {
      if (serverName.length < minLength) {
        context.report({
          message: `Server name too short (${serverName.length}/${minLength} characters): "${serverName}"`,
        });
      }
    }
  },
};
