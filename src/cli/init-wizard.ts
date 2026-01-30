/**
 * Interactive Init Wizard
 *
 * Guides users through setting up claudelint configuration.
 */

import inquirer from 'inquirer';
import { existsSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import { ClaudeLintConfig } from '../utils/config';
import { logger } from './utils/logger';

interface ProjectInfo {
  hasClaudeDir: boolean;
  hasSkills: boolean;
  hasSettings: boolean;
  hasHooks: boolean;
  hasMCP: boolean;
  hasPlugin: boolean;
  hasCLAUDEmd: boolean;
  hasPackageJson: boolean;
}

interface WizardAnswers {
  useDefaults: boolean;
  ignorePatterns?: string[];
  customIgnorePattern?: string;
  outputFormat?: 'stylish' | 'json' | 'compact';
  addNpmScripts?: boolean;
}

export class InitWizard {
  private cwd: string;

  constructor(cwd: string = process.cwd()) {
    this.cwd = cwd;
  }

  /**
   * Run the init wizard
   */
  async run(options: { yes?: boolean } = {}): Promise<void> {
    logger.section('Welcome to claudelint configuration wizard!');

    // Detect project structure
    const projectInfo = this.detectProject();
    this.displayProjectInfo(projectInfo);

    // Use defaults if --yes flag
    if (options.yes) {
      logger.newline();
      logger.info('Using default configuration (--yes flag)...');
      this.createDefaultConfig(projectInfo);
      logger.success('Configuration created successfully!');
      this.displayNextSteps();
      return;
    }

    // Interactive prompts
    const answers = await this.promptConfiguration(projectInfo);

    // Generate files
    this.generateConfig(answers, projectInfo);

    logger.newline();
    logger.success('Configuration created successfully!');
    this.displayNextSteps();
  }

  /**
   * Detect existing Claude Code project structure
   */
  private detectProject(): ProjectInfo {
    return {
      hasClaudeDir: existsSync(join(this.cwd, '.claude')),
      hasSkills: existsSync(join(this.cwd, '.claude/skills')),
      hasSettings: existsSync(join(this.cwd, '.claude/settings.json')),
      hasHooks: existsSync(join(this.cwd, '.claude/hooks')),
      hasMCP: existsSync(join(this.cwd, '.mcp.json')),
      hasPlugin: existsSync(join(this.cwd, 'plugin.json')),
      hasCLAUDEmd: existsSync(join(this.cwd, 'CLAUDE.md')),
      hasPackageJson: existsSync(join(this.cwd, 'package.json')),
    };
  }

  /**
   * Display detected project information
   */
  private displayProjectInfo(info: ProjectInfo): void {
    logger.log(chalk.bold('Detected project structure:'));
    logger.log(`   ${info.hasCLAUDEmd ? chalk.green('[YES]') : chalk.gray('[NO]')} CLAUDE.md`);
    logger.log(`   ${info.hasClaudeDir ? chalk.green('[YES]') : chalk.gray('[NO]')} .claude/ directory`);
    logger.log(`   ${info.hasSkills ? chalk.green('[YES]') : chalk.gray('[NO]')} Skills`);
    logger.log(`   ${info.hasSettings ? chalk.green('[YES]') : chalk.gray('[NO]')} Settings`);
    logger.log(`   ${info.hasHooks ? chalk.green('[YES]') : chalk.gray('[NO]')} Hooks`);
    logger.log(`   ${info.hasMCP ? chalk.green('[YES]') : chalk.gray('[NO]')} MCP servers`);
    logger.log(`   ${info.hasPlugin ? chalk.green('[YES]') : chalk.gray('[NO]')} Plugin manifest`);
    logger.newline();
  }

  /**
   * Prompt user for configuration choices
   */
  private async promptConfiguration(info: ProjectInfo): Promise<WizardAnswers> {
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'useDefaults',
        message: 'Use recommended defaults?',
        default: true,
      },
      {
        type: 'checkbox',
        name: 'ignorePatterns',
        message: 'Additional patterns to ignore:',
        choices: [
          { name: 'coverage/', value: 'coverage/', checked: true },
          { name: 'dist/', value: 'dist/', checked: true },
          { name: 'build/', value: 'build/', checked: true },
          { name: '*.log', value: '*.log', checked: true },
          { name: 'Custom pattern...', value: '__custom__' },
        ],
        when: (answers: Partial<WizardAnswers>) => !answers.useDefaults,
      },
      {
        type: 'input',
        name: 'customIgnorePattern',
        message: 'Enter custom ignore pattern:',
        when: (answers: Partial<WizardAnswers>) =>
          answers.ignorePatterns && answers.ignorePatterns.includes('__custom__'),
      },
      {
        type: 'list',
        name: 'outputFormat',
        message: 'Default output format:',
        choices: ['stylish', 'compact', 'json'],
        default: 'stylish',
        when: (answers: Partial<WizardAnswers>) => !answers.useDefaults,
      },
      {
        type: 'confirm',
        name: 'addNpmScripts',
        message: 'Add npm scripts to package.json?',
        default: info.hasPackageJson,
        when: (_answers: Partial<WizardAnswers>) => info.hasPackageJson,
      },
    ]);

    return answers as WizardAnswers;
  }

  /**
   * Create default configuration
   */
  private createDefaultConfig(_info: ProjectInfo): void {
    // Generate .claudelintrc.json
    const config: ClaudeLintConfig = {
      rules: {
        'size-error': 'error',
        'size-warning': 'warn',
        'import-missing': 'error',
        'skill-dangerous-command': 'error',
        'skill-missing-changelog': 'off',
      },
      output: {
        format: 'stylish',
        verbose: false,
      },
    };

    this.writeConfig(config);
    this.writeIgnoreFile([]);

    if (_info.hasPackageJson) {
      this.addNpmScripts();
    }
  }

  /**
   * Generate configuration files from answers
   */
  private generateConfig(answers: WizardAnswers, _info: ProjectInfo): void {
    // Build config from answers
    const config: ClaudeLintConfig = {
      rules: {
        'size-error': 'error',
        'size-warning': 'warn',
        'import-missing': 'error',
        'skill-dangerous-command': 'error',
        'skill-missing-changelog': 'off',
      },
      output: {
        format: answers.outputFormat || 'stylish',
        verbose: false,
      },
    };

    this.writeConfig(config);

    // Build ignore patterns
    let ignorePatterns: string[] = [];
    if (answers.ignorePatterns) {
      ignorePatterns = answers.ignorePatterns.filter((p: string) => p !== '__custom__');
      if (answers.customIgnorePattern) {
        ignorePatterns.push(answers.customIgnorePattern);
      }
    }

    this.writeIgnoreFile(ignorePatterns);

    // Add npm scripts if requested
    if (answers.addNpmScripts) {
      this.addNpmScripts();
    }
  }

  /**
   * Write .claudelintrc.json
   */
  private writeConfig(config: ClaudeLintConfig): void {
    const configPath = join(this.cwd, '.claudelintrc.json');

    if (existsSync(configPath)) {
      logger.newline();
      logger.warn('.claudelintrc.json already exists, skipping...');
      return;
    }

    writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
    logger.success('Created .claudelintrc.json');
  }

  /**
   * Write .claudelintignore
   */
  private writeIgnoreFile(additionalPatterns: string[]): void {
    const ignorePath = join(this.cwd, '.claudelintignore');

    if (existsSync(ignorePath)) {
      logger.warn('.claudelintignore already exists, skipping...');
      return;
    }

    const defaultPatterns = [
      '# Dependencies',
      'node_modules/',
      'vendor/',
      '',
      '# Build outputs',
      'dist/',
      'build/',
      '',
      '# Testing',
      'coverage/',
      '*.log',
    ];

    if (additionalPatterns.length > 0) {
      defaultPatterns.push('', '# Custom patterns', ...additionalPatterns);
    }

    writeFileSync(ignorePath, defaultPatterns.join('\n') + '\n', 'utf-8');
    logger.success('Created .claudelintignore');
  }

  /**
   * Add npm scripts to package.json
   */
  private addNpmScripts(): void {
    const pkgPath = join(this.cwd, 'package.json');

    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as {
        scripts?: Record<string, string>;
      };

      if (!pkg.scripts) {
        pkg.scripts = {};
      }

      // Add scripts if they don't exist
      const scriptsToAdd: Record<string, string> = {
        'lint:claude': 'claudelint check-all',
        'lint:claude:fix': 'claudelint format --fix',
      };

      let added = false;
      for (const [name, script] of Object.entries(scriptsToAdd)) {
        if (!pkg.scripts[name]) {
          pkg.scripts[name] = script;
          added = true;
        }
      }

      if (added) {
        writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
        logger.success('Added npm scripts to package.json');
      } else {
        logger.warn('npm scripts already exist, skipping...');
      }
    } catch (error) {
      logger.error(`Failed to update package.json: ${error}`);
    }
  }

  /**
   * Display next steps
   */
  private displayNextSteps(): void {
    logger.log(chalk.bold('Next steps:'));
    logger.newline();
    logger.log('   1. Review .claudelintrc.json and customize rules');
    logger.log('   2. Run validation: claudelint check-all');
    logger.log('   3. See docs: https://github.com/pdugan20/claudelint#readme');
    logger.newline();
    logger.info('Tip: Use "claudelint list-rules" to see all available rules');
    logger.newline();
  }
}
