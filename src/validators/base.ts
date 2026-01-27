// Base validator class that all validators extend

export interface ValidationError {
  message: string;
  file?: string;
  line?: number;
  severity: 'error';
}

export interface ValidationWarning {
  message: string;
  file?: string;
  line?: number;
  severity: 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidatorOptions {
  path?: string;
  verbose?: boolean;
  warningsAsErrors?: boolean;
}

export abstract class BaseValidator {
  protected options: ValidatorOptions;
  protected errors: ValidationError[] = [];
  protected warnings: ValidationWarning[] = [];

  constructor(options: ValidatorOptions = {}) {
    this.options = options;
  }

  abstract validate(): Promise<ValidationResult>;

  protected reportError(message: string, file?: string, line?: number): void {
    this.errors.push({
      message,
      file,
      line,
      severity: 'error',
    });
  }

  protected reportWarning(message: string, file?: string, line?: number): void {
    this.warnings.push({
      message,
      file,
      line,
      severity: 'warning',
    });
  }

  protected getResult(): ValidationResult {
    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
    };
  }
}
