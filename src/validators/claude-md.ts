import { BaseValidator, ValidationResult } from './base';
import {
  findClaudeMdFiles,
  readFileContent,
  getFileSize,
  fileExists,
  resolvePath,
} from '../utils/file-system';
import { extractFrontmatter, extractImportsWithLineNumbers } from '../utils/markdown';
import {
  CLAUDE_MD_SIZE_WARNING_THRESHOLD,
  CLAUDE_MD_SIZE_ERROR_THRESHOLD,
  CLAUDE_MD_MAX_IMPORT_DEPTH,
} from './constants';
import { dirname } from 'path';
import { RuleRegistry } from '../utils/rule-registry';

interface ClaudeRuleFrontmatter {
  paths?: string | string[];
  [key: string]: unknown;
}

// Register CLAUDE.md rules
RuleRegistry.register({
  id: 'size-error',
  name: 'File Size Error',
  description: 'CLAUDE.md exceeds maximum file size limit (40KB)',
  category: 'CLAUDE.md',
  severity: 'error',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'size-warning',
  name: 'File Size Warning',
  description: 'CLAUDE.md approaching file size limit (35KB)',
  category: 'CLAUDE.md',
  severity: 'warning',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'import-missing',
  name: 'Missing Import',
  description: '@import directive points to non-existent file',
  category: 'CLAUDE.md',
  severity: 'error',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'import-circular',
  name: 'Circular Import',
  description: 'Circular @import dependencies detected',
  category: 'CLAUDE.md',
  severity: 'error',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

interface ClaudeMdValidatorOptions {
  path?: string;
  verbose?: boolean;
  warningsAsErrors?: boolean;
}

/**
 * Validates CLAUDE.md files for size, format, and structure
 */
export class ClaudeMdValidator extends BaseValidator {
  private basePath: string;
  private processedImports = new Set<string>();

  constructor(options: ClaudeMdValidatorOptions = {}) {
    super(options);
    this.basePath = options.path || process.cwd();
  }

  async validate(): Promise<ValidationResult> {
    const files = await this.findFiles();

    for (const file of files) {
      await this.validateFile(file);
    }

    return this.getResult();
  }

  private async findFiles(): Promise<string[]> {
    if (this.options.path) {
      // If specific path provided, validate just that file
      const exists = await fileExists(this.options.path);
      if (!exists) {
        this.reportError(`File not found: ${this.options.path}`);
        return [];
      }
      return [this.options.path];
    }

    // Otherwise find all CLAUDE.md files
    return findClaudeMdFiles(this.basePath);
  }

  private async validateFile(filePath: string): Promise<void> {
    // Read content first
    const content = await readFileContent(filePath);

    // Parse disable comments
    this.parseDisableComments(filePath, content);

    // Check file size
    await this.checkFileSize(filePath);

    // Check for frontmatter (only in .claude/rules/*.md files)
    if (filePath.includes('.claude/rules/')) {
      this.checkFrontmatter(filePath, content);
    }

    // Content organization checks (for main CLAUDE.md files)
    if (filePath.endsWith('CLAUDE.md') && !filePath.includes('.claude/rules/')) {
      this.checkContentOrganization(filePath, content);
    }

    // Check imports and validate recursively
    await this.checkImports(filePath, content);

    // Report unused disable directives if configured
    if (this.options.config?.reportUnusedDisableDirectives) {
      this.reportUnusedDisables(filePath);
    }
  }

  private async checkFileSize(filePath: string): Promise<void> {
    const size = await getFileSize(filePath);

    if (size >= CLAUDE_MD_SIZE_ERROR_THRESHOLD) {
      this.reportError(
        `File exceeds ${CLAUDE_MD_SIZE_ERROR_THRESHOLD / 1000}KB limit (${size} bytes)`,
        filePath,
        undefined,
        'size-error',
        {
          explanation:
            'Claude Code has a context window limit. Large files cause performance issues, ' +
            "slow context loading, and may exceed the model's context window.",
          howToFix:
            '1. Create separate files in .claude/rules/ directory\n' +
            '2. Move topic-specific content to: .claude/rules/git.md, .claude/rules/api.md, etc.\n' +
            '3. Import them in CLAUDE.md with: Import: @.claude/rules/git.md',
          fix: `Split content into smaller files in .claude/rules/ and use @imports`,
        }
      );
    } else if (size >= CLAUDE_MD_SIZE_WARNING_THRESHOLD) {
      this.reportWarning(
        `File approaching size limit (${size} bytes)`,
        filePath,
        undefined,
        'size-warning',
        {
          explanation:
            'Large CLAUDE.md files slow down context loading and make the file harder to maintain.',
          howToFix:
            '1. Identify logical sections (e.g., Git rules, API guidelines, Testing practices)\n' +
            '2. Create .claude/rules/ directory: mkdir -p .claude/rules\n' +
            '3. Move sections to separate files: .claude/rules/git.md\n' +
            '4. Import in CLAUDE.md: Import: @.claude/rules/git.md',
          fix: 'Consider organizing content into .claude/rules/ directory with @imports',
        }
      );
    }
  }

  private checkContentOrganization(filePath: string, content: string): void {
    // Count sections (markdown headings)
    const headingRegex = /^#{1,6}\s+.+$/gm;
    const headings = content.match(headingRegex) || [];
    const sectionCount = headings.length;

    // Warn if too many sections
    if (sectionCount > 20) {
      this.reportWarning(
        `CLAUDE.md has ${sectionCount} sections (>${20} is hard to navigate). ` +
          `Consider organizing content into separate files in .claude/rules/ directory. ` +
          `For example: .claude/rules/git.md, .claude/rules/api.md, .claude/rules/testing.md`,
        filePath
      );
    }
  }

  private checkFrontmatter(filePath: string, content: string): void {
    try {
      const { frontmatter, hasFrontmatter } = extractFrontmatter<ClaudeRuleFrontmatter>(content);

      if (!hasFrontmatter) {
        // Frontmatter is optional for rules files
        return;
      }

      if (!frontmatter) {
        this.reportError('Invalid frontmatter YAML syntax', filePath);
        return;
      }

      // Validate paths field if present
      if (frontmatter.paths) {
        this.validatePathsField(filePath, frontmatter.paths);
      }

      // Check for unknown fields
      const knownFields = ['paths'];
      const unknownFields = Object.keys(frontmatter).filter((key) => !knownFields.includes(key));

      if (unknownFields.length > 0) {
        this.reportWarning(`Unknown frontmatter fields: ${unknownFields.join(', ')}`, filePath);
      }
    } catch (error) {
      this.reportError(
        `Failed to parse frontmatter: ${error instanceof Error ? error.message : String(error)}`,
        filePath
      );
    }
  }

  private validatePathsField(filePath: string, paths: string | string[]): void {
    if (typeof paths === 'string') {
      this.reportError('paths field must be an array, not a string', filePath);
      return;
    }

    if (!Array.isArray(paths)) {
      this.reportError('paths field must be an array', filePath);
      return;
    }

    // Basic validation of glob patterns
    for (const pattern of paths) {
      if (typeof pattern !== 'string') {
        this.reportError(`Invalid path pattern (must be string): ${String(pattern)}`, filePath);
      }
      // Could add more sophisticated glob validation here
    }
  }

  private async checkImports(filePath: string, content: string, depth = 0): Promise<void> {
    if (depth > CLAUDE_MD_MAX_IMPORT_DEPTH) {
      this.reportError(
        `Import depth exceeds maximum of ${CLAUDE_MD_MAX_IMPORT_DEPTH}. Possible circular import.`,
        filePath
      );
      return;
    }

    const imports = extractImportsWithLineNumbers(content);

    for (const importInfo of imports) {
      // Resolve import path relative to current file
      const baseDir = dirname(filePath);
      const resolvedPath = resolvePath(baseDir, importInfo.path);

      // Check for circular imports
      if (this.processedImports.has(resolvedPath)) {
        this.reportWarning(
          `Circular import detected: ${importInfo.path}`,
          filePath,
          importInfo.line,
          'import-circular'
        );
        continue;
      }

      // Check if imported file exists
      const exists = await fileExists(resolvedPath);
      if (!exists) {
        this.reportError(
          `Imported file not found: ${importInfo.path}`,
          filePath,
          importInfo.line,
          'import-missing',
          {
            explanation:
              'Claude Code cannot load the imported file. This will cause the context to be incomplete ' +
              'and may result in unexpected behavior.',
            howToFix:
              `1. Check if the file path is correct: ${resolvedPath}\n` +
              `2. Create the missing file if needed\n` +
              `3. Fix the import path in ${filePath}\n` +
              `4. Import paths are relative to the current file's directory`,
            fix: `Create the file at ${resolvedPath} or fix the import path`,
          }
        );
        continue;
      }

      // Mark as processed and validate recursively
      this.processedImports.add(resolvedPath);

      try {
        const importedContent = await readFileContent(resolvedPath);
        await this.checkImports(resolvedPath, importedContent, depth + 1);
      } catch (error) {
        this.reportError(
          `Failed to read imported file: ${error instanceof Error ? error.message : String(error)}`,
          filePath,
          importInfo.line
        );
      }
    }
  }
}
