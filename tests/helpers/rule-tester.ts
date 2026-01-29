/**
 * ClaudeLintRuleTester - Test utility for rule validation
 *
 * Inspired by ESLint's RuleTester, provides declarative testing for rules.
 * Automatically verifies that rules execute correctly and report expected errors.
 */

import { Rule, RuleContext, RuleIssue } from '../../src/types/rule';

/**
 * Test case for a rule
 */
interface BaseTestCase {
  /** Content to validate */
  content: string;
  /** Optional file path (determines file type) */
  filePath?: string;
  /** Optional rule options */
  options?: Record<string, unknown>;
}

/**
 * Valid test case - should produce no errors
 */
interface ValidTestCase extends BaseTestCase {}

/**
 * Invalid test case - should produce errors
 */
interface InvalidTestCase extends BaseTestCase {
  /** Expected errors */
  errors: Array<{
    /** Expected error message (exact match or substring) */
    message: string;
    /** Optional expected line number */
    line?: number;
  }>;
}

/**
 * Test cases for a rule
 */
interface TestCases {
  /** Test cases that should pass (no errors) */
  valid: ValidTestCase[];
  /** Test cases that should fail (with specific errors) */
  invalid: InvalidTestCase[];
}

/**
 * RuleTester for declarative rule testing
 */
export class ClaudeLintRuleTester {
  /**
   * Run tests for a rule
   *
   * @param ruleName - Name of the rule being tested
   * @param rule - The rule implementation
   * @param tests - Valid and invalid test cases
   */
  async run(ruleName: string, rule: Rule, tests: TestCases): Promise<void> {
    // Test valid cases
    for (let i = 0; i < tests.valid.length; i++) {
      const testCase = tests.valid[i];
      await this.runValidTest(ruleName, rule, testCase, i);
    }

    // Test invalid cases
    for (let i = 0; i < tests.invalid.length; i++) {
      const testCase = tests.invalid[i];
      await this.runInvalidTest(ruleName, rule, testCase, i);
    }
  }

  /**
   * Run a valid test case (should produce no errors)
   */
  private async runValidTest(
    ruleName: string,
    rule: Rule,
    testCase: ValidTestCase,
    index: number
  ): Promise<void> {
    const issues = await this.executeRule(rule, testCase);

    if (issues.length > 0) {
      const errorMessages = issues.map((issue) => issue.message).join('\n  - ');
      throw new Error(
        `Rule "${ruleName}" valid test case #${index} should not report errors, but got ${issues.length}:\n  - ${errorMessages}\n\nTest case:\n${testCase.content}`
      );
    }
  }

  /**
   * Run an invalid test case (should produce expected errors)
   */
  private async runInvalidTest(
    ruleName: string,
    rule: Rule,
    testCase: InvalidTestCase,
    index: number
  ): Promise<void> {
    const issues = await this.executeRule(rule, testCase);

    // Check error count
    if (issues.length !== testCase.errors.length) {
      const actualMessages = issues.map((issue) => issue.message).join('\n  - ');
      const expectedMessages = testCase.errors.map((e) => e.message).join('\n  - ');
      throw new Error(
        `Rule "${ruleName}" invalid test case #${index} should report ${testCase.errors.length} error(s), but got ${issues.length}\n\n` +
          `Expected:\n  - ${expectedMessages}\n\n` +
          `Actual:\n  - ${actualMessages || '(none)'}\n\n` +
          `Test case:\n${testCase.content}`
      );
    }

    // Check each error matches expectations
    for (let i = 0; i < testCase.errors.length; i++) {
      const expectedError = testCase.errors[i];
      const actualIssue = issues[i];

      // Check message
      if (!actualIssue.message.includes(expectedError.message)) {
        throw new Error(
          `Rule "${ruleName}" invalid test case #${index} error #${i} message mismatch\n\n` +
            `Expected message to contain: "${expectedError.message}"\n` +
            `Actual message: "${actualIssue.message}"\n\n` +
            `Test case:\n${testCase.content}`
        );
      }

      // Check line number if specified
      if (expectedError.line !== undefined) {
        if (actualIssue.line !== expectedError.line) {
          throw new Error(
            `Rule "${ruleName}" invalid test case #${index} error #${i} line number mismatch\n\n` +
              `Expected line: ${expectedError.line}\n` +
              `Actual line: ${actualIssue.line ?? '(not specified)'}\n` +
              `Message: "${actualIssue.message}"\n\n` +
              `Test case:\n${testCase.content}`
          );
        }
      }
    }
  }

  /**
   * Execute a rule and capture reported issues
   */
  private async executeRule(rule: Rule, testCase: BaseTestCase): Promise<RuleIssue[]> {
    const issues: RuleIssue[] = [];

    // Create mock context
    const context: RuleContext = {
      filePath: testCase.filePath ?? 'test-file.json',
      fileContent: testCase.content,
      options: testCase.options ?? {},
      report: (issue: RuleIssue) => {
        issues.push(issue);
      },
    };

    // Execute rule
    try {
      const result = rule.validate(context);

      // Handle async rules
      if (result && typeof result.then === 'function') {
        await result;
      }
    } catch (error) {
      // If rule throws, treat as test failure
      throw new Error(
        `Rule validation threw an error: ${error instanceof Error ? error.message : String(error)}\n\n` +
        `Test case:\n${testCase.content}`
      );
    }

    return issues;
  }
}
