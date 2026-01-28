import { BaseValidator, ValidationResult, BaseValidatorOptions } from './base';
import { directoryExists, resolvePath } from '../utils/file-system';
import { join } from 'path';
// Import rules to ensure they're registered
import '../rules';
import { ValidatorRegistry } from '../utils/validator-factory';

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
    await this.checkCommandsDirectory();
    return this.getResult();
  }

  private async checkCommandsDirectory(): Promise<void> {
    const claudeDir = resolvePath(this.basePath, '.claude');
    const commandsDir = join(claudeDir, 'commands');

    const exists = await directoryExists(commandsDir);
    if (exists) {
      this.reportWarning(
        'Commands directory (.claude/commands) is deprecated. Please migrate to Skills (.claude/skills). ' +
        'Skills provide better structure, versioning, and documentation. ' +
        'See: https://docs.anthropic.com/claude-code/skills',
        commandsDir,
        undefined,
        'commands-deprecated-directory'
      );

      this.reportWarning(
        'To migrate: 1) Create skill directories in .claude/skills/<skill-name>, ' +
        '2) Move command scripts to <skill-name>/<skill-name>.sh, ' +
        '3) Add SKILL.md with frontmatter and documentation, ' +
        '4) Update plugin.json to reference skills instead of commands',
        commandsDir,
        undefined,
        'commands-migrate-to-skills'
      );
    }
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
