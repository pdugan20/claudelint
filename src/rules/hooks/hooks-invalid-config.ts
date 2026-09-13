/**
 * Rule: hooks-invalid-config
 *
 * Validates hook configuration structure and requirements.
 */

import { Rule } from '../../types/rule';
import { VALID_HOOK_TYPES } from '../../schemas/constants';
import { isObject } from '../../utils/type-guards';

/**
 * Validates hook configuration structure
 */
export const rule: Rule = {
  meta: {
    id: 'hooks-invalid-config',
    name: 'Hooks Invalid Config',
    description: 'Hook configuration must be valid',
    category: 'Hooks',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/hooks/hooks-invalid-config',
    docs: {
      recommended: true,
      summary: 'Validates hook configuration structure and required fields.',
      rationale:
        'Malformed hook configs cause runtime errors when Claude Code tries to execute them.',
      details:
        'This rule validates the structure of hook definitions inside settings files. ' +
        'It checks that each hook handler has a recognized type, ' +
        'includes the required field for its type, does not specify multiple handler fields ' +
        'simultaneously, and has a valid timeout value if one is provided. ' +
        'Both prompt and agent hooks use the `prompt` field. ' +
        'Malformed hook configurations will cause runtime errors when Claude Code ' +
        'attempts to execute them.',
      examples: {
        incorrect: [
          {
            description: 'Hook with invalid type',
            code:
              '{\n' +
              '  "hooks": {\n' +
              '    "PreToolUse": [{\n' +
              '      "matcher": "*",\n' +
              '      "hooks": [{\n' +
              '        "type": "invalid",\n' +
              '        "command": "echo hello"\n' +
              '      }]\n' +
              '    }]\n' +
              '  }\n' +
              '}',
            language: 'json',
          },
          {
            description: 'Hook missing required command field',
            code:
              '{\n' +
              '  "hooks": {\n' +
              '    "PreToolUse": [{\n' +
              '      "matcher": "*",\n' +
              '      "hooks": [{\n' +
              '        "type": "command"\n' +
              '      }]\n' +
              '    }]\n' +
              '  }\n' +
              '}',
            language: 'json',
          },
          {
            description: 'Hook with multiple handler fields',
            code:
              '{\n' +
              '  "hooks": {\n' +
              '    "PreToolUse": [{\n' +
              '      "matcher": "*",\n' +
              '      "hooks": [{\n' +
              '        "type": "command",\n' +
              '        "command": "echo hello",\n' +
              '        "prompt": "also do this"\n' +
              '      }]\n' +
              '    }]\n' +
              '  }\n' +
              '}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Valid command hook',
            code:
              '{\n' +
              '  "hooks": {\n' +
              '    "PreToolUse": [{\n' +
              '      "matcher": "Bash",\n' +
              '      "hooks": [{\n' +
              '        "type": "command",\n' +
              '        "command": "echo Pre-tool check"\n' +
              '      }]\n' +
              '    }]\n' +
              '  }\n' +
              '}',
            language: 'json',
          },
          {
            description: 'Valid prompt hook with timeout',
            code:
              '{\n' +
              '  "hooks": {\n' +
              '    "PostToolUse": [{\n' +
              '      "matcher": "Write",\n' +
              '      "hooks": [{\n' +
              '        "type": "prompt",\n' +
              '        "prompt": "Review the written file",\n' +
              '        "timeout": 30000\n' +
              '      }]\n' +
              '    }]\n' +
              '  }\n' +
              '}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Ensure each hook has a valid `type` (command, http, prompt, or agent) and includes ' +
        'the corresponding handler field. Remove any extra handler fields so only one ' +
        'is present. If a timeout is specified, ensure it is a positive number.',
      relatedRules: ['agent-hooks-invalid-schema', 'agent-hooks'],
    },
  },

  validate: (context) => {
    const { fileContent } = context;

    // Parse JSON
    let config: Record<string, unknown>;
    try {
      config = JSON.parse(fileContent) as Record<string, unknown>;
    } catch {
      // JSON parse errors are handled by schema validation
      return;
    }

    // Validate each hook in the object-keyed format
    if (isObject(config) && isObject(config.hooks)) {
      const hooksObj = config.hooks;
      for (const matcherGroups of Object.values(hooksObj)) {
        if (!Array.isArray(matcherGroups)) continue;
        for (const matcherGroup of matcherGroups) {
          if (!isObject(matcherGroup)) continue;
          const handlers = matcherGroup.hooks;
          if (!Array.isArray(handlers)) continue;
          for (const hook of handlers) {
            if (!isObject(hook)) continue;
            validateHookHandler(context, hook);
          }
        }
      }
    }
  },
};

function validateHookHandler(
  context: Parameters<Rule['validate']>[0],
  hook: Record<string, unknown>
): void {
  // Validate hook type
  if (!(VALID_HOOK_TYPES as readonly string[]).includes(hook.type as string)) {
    context.report({
      message: `Invalid hook type: ${String(hook.type)}`,
    });
  }

  // Validate hook has required field for its type
  if (hook.type === 'command' && !hook.command) {
    context.report({
      message: 'Hook with type "command" must have "command" field',
    });
  }

  if (hook.type === 'prompt' && !hook.prompt) {
    context.report({
      message: 'Hook with type "prompt" must have "prompt" field',
    });
  }

  if (hook.type === 'http' && !hook.url) {
    context.report({
      message: 'Hook with type "http" must have "url" field',
    });
  }

  // docs-baseline/hooks.md, "Prompt and agent hook fields": `prompt` is required
  // for both types. An `agent` field is not a substitute for the prompt.
  if (hook.type === 'agent' && !hook.prompt) {
    context.report({
      message: 'Hook with type "agent" must have "prompt" field',
    });
  }

  // Validate mutual exclusivity of handler fields
  const fieldCount = [hook.command, hook.url, hook.prompt].filter(Boolean).length;
  if (fieldCount > 1) {
    context.report({
      message: 'Hook cannot have multiple handler fields (command, url, prompt)',
    });
  }

  // Validate timeout if present
  if (hook.timeout !== undefined && typeof hook.timeout === 'number' && hook.timeout <= 0) {
    context.report({
      message: `Invalid timeout: ${hook.timeout}`,
    });
  }
}
