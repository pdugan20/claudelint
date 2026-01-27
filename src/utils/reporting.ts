import chalk from 'chalk';
import { ValidationError, ValidationWarning, ValidationResult } from '../validators/base';

export interface ReportingOptions {
  verbose?: boolean;
  warningsAsErrors?: boolean;
}

/**
 * Formats and displays validation results to the console
 */
export class Reporter {
  private options: ReportingOptions;

  constructor(options: ReportingOptions = {}) {
    this.options = options;
  }

  /**
   * Report a validation result to the console
   */
  report(result: ValidationResult, validatorName: string): void {
    if (this.options.verbose) {
      console.log(chalk.blue(`\n${validatorName} Validation Results:\n`));
    }

    // Report errors
    if (result.errors.length > 0) {
      result.errors.forEach((error) => this.reportError(error));
    }

    // Report warnings
    if (result.warnings.length > 0) {
      result.warnings.forEach((warning) => this.reportWarning(warning));
    }

    // Summary
    const totalIssues = result.errors.length + result.warnings.length;
    if (totalIssues === 0) {
      console.log(chalk.green('✓ All checks passed!'));
    } else {
      console.log();
      this.reportSummary(result.errors.length, result.warnings.length);
    }
  }

  /**
   * Report a single error
   */
  private reportError(error: ValidationError): void {
    const location = this.formatLocation(error.file, error.line);
    console.log(chalk.red(`✗ Error: ${error.message}`));
    if (location) {
      console.log(chalk.gray(`  at: ${location}`));
    }
  }

  /**
   * Report a single warning
   */
  private reportWarning(warning: ValidationWarning): void {
    const location = this.formatLocation(warning.file, warning.line);
    console.log(chalk.yellow(`! Warning: ${warning.message}`));
    if (location) {
      console.log(chalk.gray(`  at: ${location}`));
    }
  }

  /**
   * Report summary of errors and warnings
   */
  private reportSummary(errorCount: number, warningCount: number): void {
    const parts: string[] = [];

    if (errorCount > 0) {
      parts.push(chalk.red(`${errorCount} error${errorCount === 1 ? '' : 's'}`));
    }

    if (warningCount > 0) {
      parts.push(chalk.yellow(`${warningCount} warning${warningCount === 1 ? '' : 's'}`));
    }

    console.log(parts.join(', '));
  }

  /**
   * Format file location for display
   */
  private formatLocation(file?: string, line?: number): string | null {
    if (!file) {
      return null;
    }
    return line ? `${file}:${line}` : file;
  }

  /**
   * Get appropriate exit code based on validation result
   */
  getExitCode(result: ValidationResult): number {
    if (result.errors.length > 0) {
      return 2; // Errors
    }
    if (result.warnings.length > 0 && this.options.warningsAsErrors) {
      return 1; // Warnings treated as errors
    }
    if (result.warnings.length > 0) {
      return 1; // Warnings
    }
    return 0; // Success
  }

  /**
   * Report verbose progress message
   */
  progress(message: string): void {
    if (this.options.verbose) {
      console.log(chalk.gray(`  ${message}`));
    }
  }

  /**
   * Report section header
   */
  section(title: string): void {
    if (this.options.verbose) {
      console.log(chalk.blue(`\n${title}`));
    }
  }

  /**
   * Report success message
   */
  success(message: string): void {
    if (this.options.verbose) {
      console.log(chalk.green(`  ✓ ${message}`));
    }
  }
}
