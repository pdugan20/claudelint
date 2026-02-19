/**
 * Shared validation helper functions for validators
 */

import { VALID_HOOK_EVENTS, VALID_HOOK_TYPES } from '../../schemas/constants';
import { RuleId } from '../../rules/rule-ids';

/**
 * Validation issue returned by helper functions
 */
export interface ValidationIssue {
  message: string;
  severity: 'error' | 'warning';
  ruleId?: RuleId;
}

/**
 * Formats an error object into a string message
 * Handles Error instances, strings, and other types consistently
 *
 * @param error - The error to format
 * @returns Formatted error message
 */
export function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Checks if a path contains shell variable expansion syntax.
 *
 * Broader than `containsEnvVar()` from `utils/patterns` — matches any `$`
 * in the string, including lowercase vars, positional params (`$1`), and
 * default-value syntax (`${VAR:-default}`). Used for file path validation
 * in settings where any variable expansion should skip existence checks.
 *
 * For env-var-specific checks (uppercase `$VAR` / `${VAR}`), use
 * `containsEnvVar()` from `utils/patterns` instead.
 *
 * @param path - The path to check
 * @returns True if the path contains variable expansion
 */
export function hasVariableExpansion(path: string): boolean {
  return path.includes('${') || path.includes('$');
}

/**
 * Validates hooks in object-keyed format (used by both hooks.json and settings.json)
 * Event names are object keys, each containing an array of matcher groups
 *
 * @param hooks - Hooks object with event names as keys
 * @returns Array of validation issues found
 */
export function validateSettingsHooks(
  hooks: Record<
    string,
    Array<{
      matcher?: string;
      hooks: Array<{
        type: string;
        command?: string;
        prompt?: string;
        agent?: string;
        timeout?: number;
      }>;
    }>
  >
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const [eventName, hookMatchers] of Object.entries(hooks)) {
    // Validate event name
    if (!(VALID_HOOK_EVENTS as readonly string[]).includes(eventName)) {
      issues.push({
        message: `Unknown hook event: ${eventName}. Valid events: ${VALID_HOOK_EVENTS.join(', ')}`,
        severity: 'warning',
      });
    }

    // Validate each hook matcher
    for (const hookMatcher of hookMatchers) {
      // Validate each hook in the hooks array
      for (const hook of hookMatcher.hooks) {
        // Validate hook type
        if (!(VALID_HOOK_TYPES as readonly string[]).includes(hook.type)) {
          issues.push({
            message: `Invalid hook type: ${hook.type}. Must be one of: ${VALID_HOOK_TYPES.join(', ')}`,
            severity: 'error',
          });
        }

        // Validate hook has required field for its type
        if (hook.type === 'command' && !hook.command) {
          issues.push({
            message: 'Hook with type "command" must have "command" field',
            severity: 'error',
          });
        }

        if (hook.type === 'prompt' && !hook.prompt) {
          issues.push({
            message: 'Hook with type "prompt" must have "prompt" field',
            severity: 'error',
          });
        }

        if (hook.type === 'agent' && !hook.agent) {
          issues.push({
            message: 'Hook with type "agent" must have "agent" field',
            severity: 'error',
          });
        }

        // Validate mutual exclusivity
        const fieldCount = [hook.command, hook.prompt, hook.agent].filter(Boolean).length;
        if (fieldCount > 1) {
          issues.push({
            message: 'Hook cannot have multiple handler fields (command, prompt, agent)',
            severity: 'error',
          });
        }

        // Validate timeout if present
        if (hook.timeout !== undefined) {
          if (hook.timeout <= 0) {
            issues.push({
              message: `Invalid timeout value: ${hook.timeout}. Must be positive`,
              severity: 'error',
            });
          }
        }
      }
    }
  }

  return issues;
}
