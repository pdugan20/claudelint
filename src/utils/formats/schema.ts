/**
 * Utilities for converting Zod validation results to ValidationResult format
 */
import { z } from 'zod';
import { ValidationResult, ValidationError } from '../../validators/base';
import { RuleId, isRuleId } from '../../rules/rule-ids';
import { extractFrontmatter } from './markdown';

/**
 * Convert Zod validation error to ValidationResult
 */
export function zodErrorToValidationResult(
  error: z.ZodError,
  filePath?: string,
  ruleIdPrefix?: string
): ValidationResult {
  const errors: ValidationError[] = error.issues.map((issue) => {
    // Generate rule ID from path
    const path = issue.path.join('-');
    const generatedId = ruleIdPrefix ? `${ruleIdPrefix}-${path}` : path;

    // Validate that the generated ID is a real rule ID
    // If not, this indicates a missing schema-based rule file
    if (!isRuleId(generatedId)) {
      console.warn(
        `Schema validation generated invalid rule ID: '${generatedId}'\n` +
          `This indicates a missing schema-based rule file.\n` +
          `Create: src/rules/${ruleIdPrefix}/${generatedId}.ts`
      );
    }

    return {
      message: issue.message,
      file: filePath,
      severity: 'error' as const,
      // Only include ruleId if it's valid - otherwise undefined
      ruleId: isRuleId(generatedId) ? generatedId : undefined,
    };
  });

  return {
    valid: false,
    errors,
    warnings: [],
  };
}

/**
 * Validate data against Zod schema and return ValidationResult
 */
export function validateWithSchema<T extends z.ZodType>(
  schema: T,
  data: unknown,
  options: {
    filePath?: string;
    ruleIdPrefix?: string;
  } = {}
): ValidationResult {
  const result = schema.safeParse(data);

  if (!result.success) {
    return zodErrorToValidationResult(result.error, options.filePath, options.ruleIdPrefix);
  }

  return {
    valid: true,
    errors: [],
    warnings: [],
  };
}

/**
 * Extract and validate frontmatter using schema
 */
export function validateFrontmatterWithSchema<T extends z.ZodType>(
  content: string,
  schema: T,
  filePath: string,
  ruleIdPrefix: string
): { data: z.infer<T> | null; result: ValidationResult } {
  const { frontmatter, hasFrontmatter } = extractFrontmatter(content);

  if (!hasFrontmatter) {
    return {
      data: null,
      result: {
        valid: false,
        errors: [
          {
            message: 'Missing frontmatter',
            file: filePath,
            severity: 'error',
            ruleId: `${ruleIdPrefix}-missing-frontmatter` as RuleId,
          },
        ],
        warnings: [],
      },
    };
  }

  const validationResult = validateWithSchema(schema, frontmatter, {
    filePath,
    ruleIdPrefix,
  });

  return {
    data: validationResult.valid ? (frontmatter as z.infer<T>) : null,
    result: validationResult,
  };
}
