import { existsSync } from 'fs';
import { join } from 'path';
import { FileValidator, ValidationResult, BaseValidatorOptions } from './file-validator';
import { ValidatorRegistry } from '../utils/validators/factory';

// Auto-register all rules
import '../rules';

/**
 * Options specific to Commands validator
 */
export type CommandsValidatorOptions = BaseValidatorOptions;

/**
 * Validates deprecated Commands usage and suggests migration to Skills
 *
 * Commands were deprecated in favor of Skills. This validator:
 * - Detects .claude/commands directory usage
 * - Warns about commands in plugin.json
 * - Suggests migration path to skills
 */
export class CommandsValidator extends FileValidator {
  private basePath: string;

  constructor(options: CommandsValidatorOptions = {}) {
    super(options);
    this.basePath = options.path || process.cwd();
  }

  async validate(): Promise<ValidationResult> {
    // Check if commands directory exists for scan metadata
    const commandsDir = join(this.basePath, '.claude', 'commands');
    if (existsSync(commandsDir)) {
      this.markScanned([commandsDir]);
    } else {
      this.markSkipped('no .claude/commands/');
    }

    // Execute ALL Commands rules via category-based discovery
    // Use basePath as filePath since these rules check the project structure
    await this.executeRulesForCategory('Commands', this.basePath, '');

    return this.getResult();
  }
}

// Register validator with factory
ValidatorRegistry.register(
  {
    id: 'commands',
    name: 'Commands Validator',
    description: 'Detects deprecated Commands usage and suggests migration to Skills',
    filePatterns: ['**/.claude/commands/**/*'],
    enabled: true,
  },
  (options) => new CommandsValidator(options)
);
