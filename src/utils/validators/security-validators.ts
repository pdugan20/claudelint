/**
 * Security validation utilities
 */
import { ValidationIssue } from '../validation-helpers';
import { DANGEROUS_COMMANDS } from '../../validators/constants';

/**
 * Check for dangerous shell commands
 * Used by: skill-dangerous-command
 */
export function validateNoDangerousCommands(content: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const cmd of DANGEROUS_COMMANDS) {
    if (cmd.pattern.test(content)) {
      issues.push({
        message: `Dangerous command detected: ${cmd.message}`,
        severity: 'error',
      });
    }
  }

  return issues;
}

/**
 * Check for eval/exec usage
 * Used by: skill-eval-usage
 */
export function validateNoEval(content: string): ValidationIssue | null {
  if (/\b(eval|exec)\s*\(/.test(content)) {
    return {
      message: 'Use of eval/exec detected - potential security risk',
      severity: 'warning',
    };
  }
  return null;
}

/**
 * Check for path traversal patterns
 * Used by: skill-path-traversal, hooks-path-traversal-risk
 */
export function validateNoPathTraversal(path: string): ValidationIssue | null {
  if (path.includes('..')) {
    return {
      message: 'Path contains ".." which could enable path traversal',
      severity: 'warning',
    };
  }
  return null;
}
