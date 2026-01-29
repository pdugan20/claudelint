import { BaseValidator, ValidationResult, BaseValidatorOptions } from './base';
import { ValidatorRegistry } from '../utils/validator-factory';

// Auto-register all rules
import '../rules';

// Import new-style rules
import { rule as commandsDeprecatedDirectoryRule } from '../rules/commands/commands-deprecated-directory';
import { rule as commandsMigrateToSkillsRule } from '../rules/commands/commands-migrate-to-skills';

/**
 * Options specific to Commands validator
 */
export interface CommandsValidatorOptions extends BaseValidatorOptions {}

/**
 * Validates deprecated Commands usage and suggests migration to Skills
 *
 * Commands were deprecated in favor of Skills. This validator:
 * - Detects .claude/commands directory usage
 * - Warns about commands in plugin.json
 * - Suggests migration path to skills
 */
export class CommandsValidator extends BaseValidator {
  private basePath: string;

  constructor(options: CommandsValidatorOptions = {}) {
    super(options);
    this.basePath = options.path || process.cwd();
  }

  async validate(): Promise<ValidationResult> {
    // NEW: Execute deprecation warning rules
    // Use basePath as filePath since these rules check the project structure
    await this.executeRule(commandsDeprecatedDirectoryRule, this.basePath, '');
    await this.executeRule(commandsMigrateToSkillsRule, this.basePath, '');

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
