import { BaseValidator, ValidationResult, BaseValidatorOptions } from './base';
import {
  findSkillDirectories,
  readFileContent,
  fileExists,
  resolvePath,
} from '../utils/file-system';
import { extractFrontmatter } from '../utils/markdown';
import { validateFrontmatterWithSchema } from '../utils/schema-helpers';
import { SkillFrontmatterWithRefinements } from '../schemas/skill-frontmatter.schema';
import {
  SKILL_MAX_ROOT_FILES,
  SKILL_MAX_DIRECTORY_DEPTH,
  SKILL_MAX_SCRIPT_FILES,
  SKILL_MIN_COMMENT_LINES,
  SKILL_MIN_NAMING_CONSISTENCY,
  MARKDOWN_LINK_REGEX,
  SHELL_EVAL_REGEX,
  PYTHON_EVAL_EXEC_REGEX,
  PATH_TRAVERSAL_REGEX,
  DANGEROUS_COMMANDS,
} from './constants';
import { SCRIPT_EXTENSIONS } from '../schemas/constants';
import { basename, dirname, join } from 'path';
import { readdir } from 'fs/promises';
import { Dirent } from 'fs';
// Import rules to ensure they're registered
import '../rules';
import { ValidatorRegistry } from '../utils/validator-factory';

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
 * Options specific to Skills validator
 */
export interface SkillsValidatorOptions extends BaseValidatorOptions {
  /** Validate only a specific skill by name */
  skill?: string;
}

/**
 * Validates Claude Code skills for structure and frontmatter
 */
export class SkillsValidator extends BaseValidator {
  private basePath: string;
  private specificSkill?: string;

  constructor(options: SkillsValidatorOptions = {}) {
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

    // Analyze body content
    this.analyzeBodyContent(skillMdPath, content);

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
    // Use schema-based validation
    const { data: frontmatter, result } = await validateFrontmatterWithSchema(
      content,
      SkillFrontmatterWithRefinements,
      filePath,
      'skill'
    );

    // Merge schema validation results (not configurable)
    this.mergeSchemaValidationResult(result);

    // If no frontmatter parsed, schema validation already reported the error
    if (!frontmatter) {
      return;
    }

    // Custom validation: Check name matches directory
    if (frontmatter.name !== skillName) {
      this.reportError(
        `Skill name "${frontmatter.name}" does not match directory name "${skillName}"`,
        filePath
      );
    }

    // Custom validation: Check referenced files exist
    await this.validateReferencedFiles(filePath, frontmatter);
  }

  private async validateReferencedFiles(
    filePath: string,
    frontmatter: SkillFrontmatter
  ): Promise<void> {
    // Custom validation: Check allowed-tools are valid tool names
    if (frontmatter['allowed-tools']) {
      for (const tool of frontmatter['allowed-tools']) {
        this.validateToolName(tool, filePath);
      }
    }

    // Validate referenced files in markdown links exist
    const skillDir = dirname(filePath);
    const content = await readFileContent(filePath);

    // Extract markdown links: [text](./file.md)
    // Reset lastIndex since MARKDOWN_LINK_REGEX is a global regex
    MARKDOWN_LINK_REGEX.lastIndex = 0;
    let match;

    while ((match = MARKDOWN_LINK_REGEX.exec(content)) !== null) {
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

      // Warn if more than max allowed loose files
      if (rootFiles.length > SKILL_MAX_ROOT_FILES) {
        this.reportWarning(
          `Skill directory has ${rootFiles.length} files at root level (>${SKILL_MAX_ROOT_FILES} is hard to maintain). ` +
            `Consider organizing scripts into subdirectories like: bin/, lib/, tests/`,
          skillDir,
          undefined,
          'skill-too-many-files'
        );
      }

      // Check for excessive nesting in subdirectories
      const maxDepth = await this.getMaxDirectoryDepth(skillDir);
      if (maxDepth > SKILL_MAX_DIRECTORY_DEPTH) {
        this.reportWarning(
          `Skill directory has ${maxDepth} levels of nesting (>${SKILL_MAX_DIRECTORY_DEPTH} is hard to navigate). ` +
            `Consider flattening the directory structure.`,
          skillDir,
          undefined,
          'skill-deep-nesting'
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
        skillMdPath,
        undefined,
        'skill-missing-examples'
      );
    }

    // Check for README.md if skill has multiple scripts
    try {
      const entries = await readdir(skillDir, { withFileTypes: true });
      const scriptFiles = entries.filter(
        (entry) =>
          entry.isFile() && SCRIPT_EXTENSIONS.some((ext) => entry.name.endsWith(ext))
      );

      if (scriptFiles.length > SKILL_MAX_SCRIPT_FILES) {
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
      // Intentionally ignore directory read errors here
      // This is an optional documentation check - if we can't read the directory,
      // we skip this check rather than failing validation
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

        // If script has more than threshold lines but no comments (except shebang), warn
        if (nonEmptyLines.length > SKILL_MIN_COMMENT_LINES && commentLines.length <= 1) {
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
      // Intentionally ignore directory/file read errors here
      // Best practices checks are optional - if we can't read files,
      // we skip these checks rather than failing validation
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
    if (totalNamed >= SKILL_MIN_NAMING_CONSISTENCY) {
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

  private analyzeBodyContent(filePath: string, content: string): void {
    // Extract body content (everything after frontmatter)
    const parts = content.split('---');
    if (parts.length < 3) {
      return; // No body content or invalid frontmatter
    }

    const body = parts.slice(2).join('---');
    const lines = body.split('\n');

    // Check for time-sensitive content
    const timeSensitivePatterns = [
      /\btoday\b/i,
      /\byesterday\b/i,
      /\btomorrow\b/i,
      /\bthis (week|month|year)\b/i,
      /\blast (week|month|year)\b/i,
      /\bnext (week|month|year)\b/i,
      /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+20\d{2}\b/i,
      /\b20\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/, // ISO date format
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const pattern of timeSensitivePatterns) {
        if (pattern.test(line)) {
          this.reportWarning(
            `Time-sensitive content detected: "${line.trim()}". ` +
              'Avoid using specific dates or time references that become outdated. ' +
              'Use relative terms like "recent versions" or update the content regularly.',
            filePath,
            i + 1,
            'skill-time-sensitive-content'
          );
          break; // Only warn once per line
        }
      }
    }

    // Check if body is too long (>500 lines)
    if (lines.length > 500) {
      this.reportWarning(
        `SKILL.md body is very long (${lines.length} lines, >500 is hard to maintain). ` +
          'Consider splitting into multiple files or adding a table of contents.',
        filePath,
        undefined,
        'skill-body-too-long'
      );
    }

    // Check if large skill (>100 lines) lacks table of contents
    if (lines.length > 100) {
      const hasTOC = /^#{1,6}\s*(table of contents|toc|contents)/i.test(body);
      if (!hasTOC) {
        this.reportWarning(
          `SKILL.md is large (${lines.length} lines) but lacks a table of contents. ` +
            'Add a TOC section to help users navigate the document.',
          filePath,
          undefined,
          'skill-large-reference-no-toc'
        );
      }
    }
  }

  private async checkSecurityAndSafety(skillDir: string): Promise<void> {
    try {
      const entries = await readdir(skillDir, { withFileTypes: true });
      const scriptFiles = entries.filter(
        (entry) =>
          entry.isFile() && SCRIPT_EXTENSIONS.some((ext) => entry.name.endsWith(ext))
      );

      for (const script of scriptFiles) {
        const scriptPath = join(skillDir, script.name);
        const content = await readFileContent(scriptPath);

        // Check for dangerous shell commands
        for (const { pattern, message } of DANGEROUS_COMMANDS) {
          if (pattern.test(content)) {
            this.reportError(
              `Dangerous command detected in "${script.name}": ${message}. ` +
                'This command could cause data loss or system damage.',
              scriptPath,
              undefined,
              'skill-dangerous-command'
            );
          }
        }

        // Check for eval/exec usage
        if (script.name.endsWith('.sh')) {
          if (SHELL_EVAL_REGEX.test(content)) {
            this.reportWarning(
              `Shell script "${script.name}" uses "eval" command. ` +
                'Avoid eval as it can execute arbitrary code and poses security risks.',
              scriptPath,
              undefined,
              'skill-eval-usage'
            );
          }
        } else if (script.name.endsWith('.py')) {
          if (PYTHON_EVAL_EXEC_REGEX.test(content)) {
            this.reportWarning(
              `Python script "${script.name}" uses eval() or exec(). ` +
                'These functions can execute arbitrary code and pose security risks.',
              scriptPath
            );
          }
        }

        // Check for path traversal in file operations
        if (PATH_TRAVERSAL_REGEX.test(content)) {
          this.reportWarning(
            `Potential path traversal detected in "${script.name}" (../ or ..\\). ` +
              'Ensure file paths are properly validated to prevent directory traversal attacks.',
            scriptPath,
            undefined,
            'skill-path-traversal'
          );
        }
      }
    } catch (error) {
      // Directory read error - ignore
    }
  }
}

// Register validator with factory
ValidatorRegistry.register(
  {
    id: 'skills',
    name: 'Skills Validator',
    description: 'Validates Claude Code skill directories and SKILL.md files',
    filePatterns: ['**/.claude/skills/*/SKILL.md'],
    enabled: true,
  },
  (options) => new SkillsValidator(options)
);
