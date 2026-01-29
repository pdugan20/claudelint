/**
 * Shared validation helper functions for validators
 */

import { VALID_HOOK_EVENTS, VALID_HOOK_TYPES } from '../schemas/constants';
import { z } from 'zod';
import { HookSchema } from '../validators/schemas';
import { RuleId } from '../rules/rule-ids';

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
 * Checks if a path contains variable expansion syntax
 * Variable expansion includes ${VAR} or $VAR patterns
 *
 * @param path - The path to check
 * @returns True if the path contains variable expansion
 */
export function hasVariableExpansion(path: string): boolean {
  return path.includes('${') || path.includes('$');
}

/**
 * Validates a hook configuration for common issues
 * Returns array of validation issues to be reported by the caller
 *
 * Note: This function does NOT validate:
 * - Command script file existence (requires async file I/O)
 * - Tool name validation (requires validator context)
 * These should be validated by the caller after calling this function
 *
 * @param hook - Hook configuration to validate
 * @returns Array of validation issues found
 */
export function validateHook(hook: z.infer<typeof HookSchema>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Validate event name
  if (!(VALID_HOOK_EVENTS as readonly string[]).includes(hook.event)) {
    issues.push({
      message: `Unknown hook event: ${hook.event}. Valid events: ${VALID_HOOK_EVENTS.join(', ')}`,
      severity: 'warning',
    });
  }

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

  // Validate matcher pattern if present
  if (hook.matcher?.pattern) {
    try {
      new RegExp(hook.matcher.pattern);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      issues.push({
        message: `Invalid regex pattern in matcher: ${errorMsg}`,
        severity: 'error',
      });
    }
  }

  return issues;
}
