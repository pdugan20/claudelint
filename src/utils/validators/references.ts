/**
 * Cross-reference validation utilities
 * For validating references between files (skills, tools, etc.)
 */
import { ValidationIssue } from './helpers';
import { VALID_TOOLS } from '../../schemas/constants';

/**
 * Validate tool name exists in registry
 * Used by: skill-frontmatter-allowed-tools-invalid, agent-tools-invalid-tool
 */
export function validateToolName(toolName: string): ValidationIssue | null {
  // Extract base tool from parameterized syntax: Task(agent-name) -> Task
  const baseTool = toolName.includes('(') ? toolName.split('(')[0] : toolName;
  if (!(VALID_TOOLS as readonly string[]).includes(baseTool)) {
    return {
      message: `Unknown tool: ${baseTool}. Valid tools: ${VALID_TOOLS.join(', ')}`,
      severity: 'error',
    };
  }
  return null;
}

/**
 * Validate multiple tool names
 * Returns array of validation issues for all invalid tools
 */
export function validateToolNames(toolNames: string[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const toolName of toolNames) {
    const issue = validateToolName(toolName);
    if (issue) {
      issues.push(issue);
    }
  }

  return issues;
}
