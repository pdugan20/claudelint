/**
 * Example claudelint validator plugin
 * Demonstrates how to create a custom validator
 */

import {
  BaseValidator,
  BaseValidatorOptions,
  ValidationResult,
} from '@pdugan20/claudelint/dist/validators/base';
import { ValidatorRegistry } from '@pdugan20/claudelint/dist/utils/validator-factory';
import { ValidatorPlugin } from '@pdugan20/claudelint/dist/utils/plugin-loader';
import { glob } from 'glob';
import { readFileSync } from 'fs';

/**
 * Custom validator that checks for TODO comments in code
 */
class TodoValidator extends BaseValidator {
  async validate(): Promise<ValidationResult> {
    const files = await glob('**/*.{ts,js,tsx,jsx}', {
      cwd: this.options.path || process.cwd(),
      ignore: ['node_modules/**', 'dist/**', 'build/**'],
    });

    for (const file of files) {
      await this.validateFile(file);
    }

    return this.getResult();
  }

  private async validateFile(filePath: string): Promise<void> {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Check for TODO comments
      if (line.includes('// TODO') || line.includes('/* TODO')) {
        this.reportWarning(
          `Found TODO comment: ${line.trim()}`,
          filePath,
          index + 1,
          'todo-comment'
        );
      }

      // Check for FIXME comments
      if (line.includes('// FIXME') || line.includes('/* FIXME')) {
        this.reportError(
          `Found FIXME comment that must be addressed: ${line.trim()}`,
          filePath,
          index + 1,
          'fixme-comment'
        );
      }
    });
  }
}

/**
 * Plugin export
 * This is what claudelint will load
 */
const plugin: ValidatorPlugin = {
  name: 'claudelint-plugin-example',
  version: '1.0.0',

  register(registry: typeof ValidatorRegistry): void {
    // Register the custom validator
    registry.register(
      {
        id: 'todo-validator',
        name: 'TODO Comment Validator',
        description: 'Checks for TODO and FIXME comments in code',
        filePatterns: ['**/*.ts', '**/*.js', '**/*.tsx', '**/*.jsx'],
        enabled: true,
      },
      (options?: BaseValidatorOptions) => new TodoValidator(options)
    );
  },
};

export default plugin;
