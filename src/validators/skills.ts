import { BaseValidator, ValidationResult } from './base';
import {
  findSkillDirectories,
  readFileContent,
  fileExists,
  resolvePath,
} from '../utils/file-system';
import { extractFrontmatter } from '../utils/markdown';
import {
  VALID_MODELS,
  VALID_CONTEXTS,
  SKILL_NAME_MAX_LENGTH,
  SKILL_NAME_PATTERN,
} from './constants';
import { basename, dirname, join } from 'path';
import { readdir } from 'fs/promises';
import { Dirent } from 'fs';
import { RuleRegistry } from '../utils/rule-registry';

// Register Skills rules
RuleRegistry.register({
  id: 'skill-missing-shebang',
  name: 'Missing Shebang',
  description: 'Shell script missing shebang line',
  category: 'Skills',
  severity: 'warning',
  fixable: true,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'skill-missing-comments',
  name: 'Missing Comments',
  description: 'File lacks explanatory comments',
  category: 'Skills',
  severity: 'warning',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'skill-dangerous-command',
  name: 'Dangerous Command',
  description: 'Dangerous shell command detected (rm -rf, dd, mkfs)',
  category: 'Skills',
  severity: 'error',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'skill-eval-usage',
  name: 'Eval Usage',
  description: 'Use of eval/exec detected',
  category: 'Skills',
  severity: 'warning',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'skill-path-traversal',
  name: 'Path Traversal',
  description: 'Potential path traversal vulnerability',
  category: 'Skills',
  severity: 'warning',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'skill-missing-changelog',
  name: 'Missing CHANGELOG',
  description: 'Skill missing CHANGELOG.md',
  category: 'Skills',
  severity: 'warning',
  fixable: true,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'skill-missing-examples',
  name: 'Missing Examples',
  description: 'Skill missing usage examples',
  category: 'Skills',
  severity: 'warning',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'skill-missing-version',
  name: 'Missing Version',
  description: 'Skill missing version field',
  category: 'Skills',
  severity: 'warning',
  fixable: true,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'skill-too-many-files',
  name: 'Too Many Files',
  description: 'Too many loose files in skill directory',
  category: 'Skills',
  severity: 'warning',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'skill-deep-nesting',
  name: 'Deep Nesting',
  description: 'Excessive directory nesting in skill',
  category: 'Skills',
  severity: 'warning',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'skill-naming-inconsistent',
  name: 'Inconsistent Naming',
  description: 'Inconsistent naming conventions',
  category: 'Skills',
  severity: 'warning',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

interface SkillFrontmatter {
  name: string;
  description: string;
  version?: string;
  'argument-hint'?: string;
  'disable-model-invocation'?: boolean;
  'user-invocable'?: boolean;
  'allowed-tools'?: string[];
  model?: 'sonnet' | 'opus' | 'haiku' | 'inherit';
  context?: 'fork' | 'inline' | 'auto';
  agent?: string;
  hooks?: unknown;
  [key: string]: unknown;
}

/**
 * Validates Claude Code skills for structure and frontmatter
 */
export class SkillsValidator extends BaseValidator {
  private basePath: string;
  private specificSkill?: string;

  constructor(
    options: { path?: string; skill?: string; verbose?: boolean; warningsAsErrors?: boolean } = {}
  ) {
    super(options);
    this.basePath = options.path || process.cwd();
    this.specificSkill = options.skill;
  }

  async validate(): Promise<ValidationResult> {
    const skillDirs = await this.findSkillDirs();

    if (skillDirs.length === 0) {
      this.reportWarning('No skill directories found');
      return this.getResult();
    }

    for (const skillDir of skillDirs) {
      await this.validateSkill(skillDir);
    }

    return this.getResult();
  }

  private async findSkillDirs(): Promise<string[]> {
    const allSkillDirs = await findSkillDirectories(this.basePath);

    if (this.specificSkill) {
      // Filter to specific skill
      return allSkillDirs.filter((dir) => basename(dir) === this.specificSkill);
    }

    return allSkillDirs;
  }

  private async validateSkill(skillDir: string): Promise<void> {
    const skillName = basename(skillDir);
    const skillMdPath = join(skillDir, 'SKILL.md');

    // Check SKILL.md exists
    const exists = await fileExists(skillMdPath);
    if (!exists) {
      this.reportError(`SKILL.md not found in skill directory`, skillDir);
      return;
    }

    // Read content
    const content = await readFileContent(skillMdPath);

    // Parse disable comments
    this.parseDisableComments(skillMdPath, content);

    // Validate frontmatter
    await this.validateFrontmatter(skillMdPath, content, skillName);

    // Validate string substitutions
    this.validateStringSubstitutions(skillMdPath, content);

    // Check directory organization
    await this.checkDirectoryOrganization(skillDir);

    // Check documentation completeness
    await this.checkDocumentation(skillDir, skillMdPath, content);

    // Check best practices
    await this.checkBestPractices(skillDir);

    // Check security and safety
    await this.checkSecurityAndSafety(skillDir);

    // Report unused disable directives if configured
    if (this.options.config?.reportUnusedDisableDirectives) {
      this.reportUnusedDisables(skillMdPath);
    }
  }

  private async validateFrontmatter(
    filePath: string,
    content: string,
    skillName: string
  ): Promise<void> {
    try {
      const { frontmatter, hasFrontmatter } = extractFrontmatter<SkillFrontmatter>(content);

      if (!hasFrontmatter) {
        this.reportError('Missing frontmatter in SKILL.md', filePath);
        return;
      }

      if (!frontmatter) {
        this.reportError('Invalid frontmatter YAML syntax', filePath);
        return;
      }

      // Check required fields
      this.validateRequiredFields(filePath, frontmatter);

      // Check optional fields
      await this.validateOptionalFields(filePath, frontmatter, skillName);

      // Check name matches directory
      if (frontmatter.name !== skillName) {
        this.reportError(
          `Skill name "${frontmatter.name}" does not match directory name "${skillName}"`,
          filePath
        );
      }
    } catch (error) {
      this.reportError(
        `Failed to parse frontmatter: ${error instanceof Error ? error.message : String(error)}`,
        filePath
      );
    }
  }

  private validateRequiredFields(filePath: string, frontmatter: SkillFrontmatter): void {
    // name is required
    if (!frontmatter.name) {
      this.reportError('Missing required field: name', filePath);
    } else {
      // Validate name format
      if (!SKILL_NAME_PATTERN.test(frontmatter.name)) {
        this.reportError('Skill name must be lowercase with hyphens only (a-z, 0-9, -)', filePath);
      }

      if (frontmatter.name.length > SKILL_NAME_MAX_LENGTH) {
        this.reportError(
          `Skill name must be ${SKILL_NAME_MAX_LENGTH} characters or less`,
          filePath
        );
      }
    }

    // description is required
    if (!frontmatter.description) {
      this.reportError('Missing required field: description', filePath);
    } else if (typeof frontmatter.description !== 'string') {
      this.reportError('description must be a string', filePath);
    } else if (frontmatter.description.length < 10) {
      this.reportWarning('description should be at least 10 characters', filePath);
    }
  }

  private async validateOptionalFields(
    filePath: string,
    frontmatter: SkillFrontmatter,
    skillName: string
  ): Promise<void> {
    // allowed-tools validation
    if (frontmatter['allowed-tools']) {
      if (!Array.isArray(frontmatter['allowed-tools'])) {
        this.reportError('allowed-tools must be an array', filePath);
      } else {
        for (const tool of frontmatter['allowed-tools']) {
          if (typeof tool !== 'string') {
            this.reportError(`Invalid tool name (must be string): ${String(tool)}`, filePath);
          } else {
            this.validateToolName(tool, filePath);
          }
        }
      }
    }

    // model validation
    if (frontmatter.model) {
      if (!VALID_MODELS.includes(frontmatter.model)) {
        this.reportError(
          `Invalid model: ${frontmatter.model}. Must be one of: ${VALID_MODELS.join(', ')}`,
          filePath
        );
      }
    }

    // context validation
    if (frontmatter.context) {
      if (!VALID_CONTEXTS.includes(frontmatter.context)) {
        this.reportError(
          `Invalid context: ${frontmatter.context}. Must be one of: ${VALID_CONTEXTS.join(', ')}`,
          filePath
        );
      }
    }

    // disable-model-invocation validation
    if (
      frontmatter['disable-model-invocation'] !== undefined &&
      typeof frontmatter['disable-model-invocation'] !== 'boolean'
    ) {
      this.reportError('disable-model-invocation must be a boolean', filePath);
    }

    // user-invocable validation
    if (
      frontmatter['user-invocable'] !== undefined &&
      typeof frontmatter['user-invocable'] !== 'boolean'
    ) {
      this.reportError('user-invocable must be a boolean', filePath);
    }

    // Validate referenced files exist
    await this.validateReferencedFiles(filePath, skillName);
  }

  private async validateReferencedFiles(filePath: string, _skillName: string): Promise<void> {
    const skillDir = dirname(filePath);
    const content = await readFileContent(filePath);

    // Extract markdown links: [text](./file.md)
    const linkRegex = /\[([^\]]+)\]\(\.\/([^)]+)\)/g;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      const [, , referencedPath] = match;
      const fullPath = resolvePath(skillDir, referencedPath);

      const exists = await fileExists(fullPath);
      if (!exists) {
        this.reportError(`Referenced file not found: ${referencedPath}`, filePath);
      }
    }
  }

  private validateStringSubstitutions(filePath: string, content: string): void {
    // Valid substitutions: $ARGUMENTS, $0, $1, etc., ${CLAUDE_SESSION_ID}
    const invalidSubstitutionRegex = /\$[A-Z_]+(?!\{)/g;
    const validSubstitutions = ['$ARGUMENTS'];

    let match;
    while ((match = invalidSubstitutionRegex.exec(content)) !== null) {
      const substitution = match[0];
      if (!validSubstitutions.includes(substitution) && !/^\$\d+$/.test(substitution)) {
        this.reportWarning(
          `Unknown string substitution: ${substitution}. ` +
            `Valid substitutions: $ARGUMENTS, $0-$9, \${VARIABLE}`,
          filePath
        );
      }
    }
  }

  private async checkDirectoryOrganization(skillDir: string): Promise<void> {
    try {
      const entries = await readdir(skillDir, { withFileTypes: true });

      // Count files at root level (excluding SKILL.md, README.md, CHANGELOG.md)
      const rootFiles = entries.filter((entry) => {
        if (entry.isDirectory()) return false;
        const name = entry.name;
        const knownFiles = ['SKILL.md', 'README.md', 'CHANGELOG.md', '.gitignore', '.DS_Store'];
        return !knownFiles.includes(name);
      });

      // Warn if more than 10 loose files
      if (rootFiles.length > 10) {
        this.reportWarning(
          `Skill directory has ${rootFiles.length} files at root level (>10 is hard to maintain). ` +
            `Consider organizing scripts into subdirectories like: bin/, lib/, tests/`,
          skillDir
        );
      }

      // Check for excessive nesting in subdirectories
      const maxDepth = await this.getMaxDirectoryDepth(skillDir);
      if (maxDepth > 4) {
        this.reportWarning(
          `Skill directory has ${maxDepth} levels of nesting (>4 is hard to navigate). ` +
            `Consider flattening the directory structure.`,
          skillDir
        );
      }
    } catch (error) {
      // Directory read error - already reported elsewhere
    }
  }

  private async getMaxDirectoryDepth(dir: string, currentDepth = 0): Promise<number> {
    try {
      const entries = await readdir(dir, { withFileTypes: true });
      const subdirs = entries.filter(
        (entry) => entry.isDirectory() && entry.name !== 'node_modules'
      );

      if (subdirs.length === 0) {
        return currentDepth;
      }

      const depths = await Promise.all(
        subdirs.map((subdir) => this.getMaxDirectoryDepth(join(dir, subdir.name), currentDepth + 1))
      );

      return Math.max(...depths);
    } catch (error) {
      return currentDepth;
    }
  }

  private async checkDocumentation(
    skillDir: string,
    skillMdPath: string,
    content: string
  ): Promise<void> {
    // Check for CHANGELOG.md
    const changelogPath = join(skillDir, 'CHANGELOG.md');
    const changelogExists = await fileExists(changelogPath);
    if (!changelogExists) {
      const skillName = basename(skillDir);
      this.reportWarning(
        'Skill directory lacks CHANGELOG.md',
        skillDir,
        undefined,
        'skill-missing-changelog',
        {
          explanation:
            'A changelog helps users understand what changed between versions and track the evolution of the skill.',
          howToFix:
            '1. Create a changelog file in the skill directory\n' +
            '2. Document all changes, fixes, and new features\n' +
            '3. Follow Keep a Changelog format: https://keepachangelog.com',
          fix: 'Create CHANGELOG.md',
          autoFix: {
            ruleId: 'skill-missing-changelog',
            description: 'Create CHANGELOG.md file',
            filePath: changelogPath,
            apply: (_currentContent: string) => {
              // Return template for new CHANGELOG.md
              return `# Changelog

All notable changes to ${skillName} will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial skill implementation

## [1.0.0] - ${new Date().toISOString().split('T')[0]}

### Added
- Initial release
`;
            },
          },
        }
      );
    }

    // Check for usage examples in SKILL.md
    const hasCodeBlocks = /```[\s\S]*?```/.test(content);
    const hasExampleSection = /##?\s+(Example|Usage|Examples)/i.test(content);
    if (!hasCodeBlocks && !hasExampleSection) {
      this.reportWarning(
        'SKILL.md lacks usage examples. ' +
          'Add code blocks or an "Example" section to help users understand how to use this skill.',
        skillMdPath
      );
    }

    // Check for README.md if skill has multiple scripts
    try {
      const entries = await readdir(skillDir, { withFileTypes: true });
      const scriptFiles = entries.filter(
        (entry) =>
          entry.isFile() &&
          (entry.name.endsWith('.sh') || entry.name.endsWith('.py') || entry.name.endsWith('.js'))
      );

      if (scriptFiles.length > 3) {
        const readmePath = join(skillDir, 'README.md');
        const readmeExists = await fileExists(readmePath);
        if (!readmeExists) {
          this.reportWarning(
            `Skill has ${scriptFiles.length} scripts but no README.md. ` +
              'Complex skills should include a README with setup and usage instructions.',
            skillDir
          );
        }
      }
    } catch (error) {
      // Directory read error - ignore
    }

    // Check for version field in frontmatter
    const { frontmatter } = extractFrontmatter<SkillFrontmatter>(content);
    if (frontmatter && !frontmatter.version) {
      this.reportWarning(
        'Skill frontmatter lacks "version" field',
        skillMdPath,
        undefined,
        'skill-missing-version',
        {
          explanation:
            'Version numbers help users and Claude track skill updates and ensure compatibility.',
          howToFix:
            '1. Add a version field to the frontmatter\n' +
            '2. Use semantic versioning (e.g., 1.0.0)\n' +
            '3. Update the version when making changes\n' +
            '4. Document changes in CHANGELOG.md',
          fix: 'Add "version: 1.0.0" to the SKILL.md frontmatter',
          autoFix: {
            ruleId: 'skill-missing-version',
            description: 'Add version field to frontmatter',
            filePath: skillMdPath,
            apply: (currentContent: string) => {
              // Find the frontmatter closing tag
              const match = currentContent.match(/^---\n([\s\S]*?)\n---/);
              if (match) {
                const frontmatterContent = match[1];
                const newFrontmatter = frontmatterContent + '\nversion: "1.0.0"';
                return currentContent.replace(match[0], `---\n${newFrontmatter}\n---`);
              }
              return currentContent;
            },
          },
        }
      );
    }
  }

  private async checkBestPractices(skillDir: string): Promise<void> {
    try {
      const entries = await readdir(skillDir, { withFileTypes: true });
      const shellScripts = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.sh'));

      for (const script of shellScripts) {
        const scriptPath = join(skillDir, script.name);
        const content = await readFileContent(scriptPath);

        // Check for shebang
        if (!content.startsWith('#!')) {
          this.reportWarning(
            `Shell script "${script.name}" lacks shebang line. ` +
              'Add "#!/bin/bash" or "#!/usr/bin/env bash" as the first line.',
            scriptPath,
            undefined,
            'skill-missing-shebang',
            {
              fix: 'Add #!/usr/bin/env bash as first line',
              autoFix: {
                ruleId: 'skill-missing-shebang',
                description: 'Add shebang line to shell script',
                filePath: scriptPath,
                apply: (currentContent: string) => {
                  return '#!/usr/bin/env bash\n' + currentContent;
                },
              },
            }
          );
        }

        // Check for explanatory comments
        const lines = content.split('\n');
        const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
        const commentLines = nonEmptyLines.filter((line) => line.trim().startsWith('#'));

        // If script has more than 10 lines but no comments (except shebang), warn
        if (nonEmptyLines.length > 10 && commentLines.length <= 1) {
          this.reportWarning(
            `Shell script "${script.name}" has ${nonEmptyLines.length} lines but no explanatory comments. ` +
              'Add comments to explain what the script does.',
            scriptPath,
            undefined,
            'skill-missing-comments'
          );
        }
      }

      // Check naming conventions
      this.checkNamingConventions(skillDir, entries);
    } catch (error) {
      // Directory read error - ignore
    }
  }

  private checkNamingConventions(skillDir: string, entries: Dirent[]): void {
    const files = entries.filter((entry) => entry.isFile());

    // Check for inconsistent naming patterns
    const kebabCase = files.filter((f) => /^[a-z0-9]+(-[a-z0-9]+)*\.(sh|py|js|md)$/.test(f.name));
    const snakeCase = files.filter((f) => /^[a-z0-9]+(_[a-z0-9]+)+\.(sh|py|js|md)$/.test(f.name));
    const camelCase = files.filter(
      (f) => /^[a-z][a-zA-Z0-9]*\.(sh|py|js|md)$/.test(f.name) && /[A-Z]/.test(f.name)
    );

    const totalNamed = kebabCase.length + snakeCase.length + camelCase.length;

    // Warn if multiple naming conventions are mixed
    if (totalNamed >= 3) {
      const conventions = [];
      if (kebabCase.length > 0) conventions.push(`kebab-case (${kebabCase.length})`);
      if (snakeCase.length > 0) conventions.push(`snake_case (${snakeCase.length})`);
      if (camelCase.length > 0) conventions.push(`camelCase (${camelCase.length})`);

      if (conventions.length > 1) {
        this.reportWarning(
          `Inconsistent file naming conventions detected: ${conventions.join(', ')}. ` +
            'Choose one naming convention (kebab-case recommended) and apply it consistently.',
          skillDir
        );
      }
    }
  }

  private async checkSecurityAndSafety(skillDir: string): Promise<void> {
    try {
      const entries = await readdir(skillDir, { withFileTypes: true });
      const scriptFiles = entries.filter(
        (entry) =>
          entry.isFile() &&
          (entry.name.endsWith('.sh') || entry.name.endsWith('.py') || entry.name.endsWith('.js'))
      );

      for (const script of scriptFiles) {
        const scriptPath = join(skillDir, script.name);
        const content = await readFileContent(scriptPath);

        // Check for dangerous shell commands
        const dangerousCommands = [
          {
            pattern: /rm\s+-rf\s+\/(?!\s*\$|[a-zA-Z])/,
            message: 'rm -rf / (deletes entire filesystem)',
          },
          { pattern: /:\(\)\{.*\|.*&\s*\}/, message: 'fork bomb pattern' },
          {
            pattern: /dd\s+if=.*of=\/dev\/[sh]d[a-z]/,
            message: 'dd writing to raw disk (data loss risk)',
          },
          { pattern: /mkfs\.[a-z]+\s+\/dev/, message: 'mkfs (formats disk, data loss risk)' },
          { pattern: />\s*\/dev\/[sh]d[a-z]/, message: 'writing to raw disk device' },
        ];

        for (const { pattern, message } of dangerousCommands) {
          if (pattern.test(content)) {
            this.reportError(
              `Dangerous command detected in "${script.name}": ${message}. ` +
                'This command could cause data loss or system damage.',
              scriptPath
            );
          }
        }

        // Check for eval/exec usage
        if (script.name.endsWith('.sh')) {
          if (/\beval\s+/.test(content)) {
            this.reportWarning(
              `Shell script "${script.name}" uses "eval" command. ` +
                'Avoid eval as it can execute arbitrary code and poses security risks.',
              scriptPath
            );
          }
        } else if (script.name.endsWith('.py')) {
          if (/\beval\s*\(/.test(content) || /\bexec\s*\(/.test(content)) {
            this.reportWarning(
              `Python script "${script.name}" uses eval() or exec(). ` +
                'These functions can execute arbitrary code and pose security risks.',
              scriptPath
            );
          }
        }

        // Check for path traversal in file operations
        const pathTraversalPattern = /\.\.[/\\]/;
        if (pathTraversalPattern.test(content)) {
          this.reportWarning(
            `Potential path traversal detected in "${script.name}" (../ or ..\\). ` +
              'Ensure file paths are properly validated to prevent directory traversal attacks.',
            scriptPath
          );
        }
      }
    } catch (error) {
      // Directory read error - ignore
    }
  }
}
