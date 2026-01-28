import { BaseValidator, ValidationResult, BaseValidatorOptions } from './base';
import {
  findClaudeMdFiles,
  readFileContent,
  getFileSize,
  fileExists,
  resolvePath,
} from '../utils/file-system';
import { lstat, readlink } from 'fs/promises';
import { basename } from 'path';
import { extractImportsWithLineNumbers } from '../utils/markdown';
import { validateFrontmatterWithSchema } from '../utils/schema-helpers';
import { ClaudeMdFrontmatterSchema } from '../schemas/claude-md-frontmatter.schema';
import { formatError } from '../utils/validation-helpers';
import {
  CLAUDE_MD_SIZE_WARNING_THRESHOLD,
  CLAUDE_MD_SIZE_ERROR_THRESHOLD,
  CLAUDE_MD_MAX_IMPORT_DEPTH,
  CLAUDE_MD_MAX_SECTIONS,
} from './constants';
import { dirname } from 'path';
// Import rules to ensure they're registered
import '../rules';
import { ValidatorRegistry } from '../utils/validator-factory';

/**
 * Options specific to CLAUDE.md validator
 * Extends BaseValidatorOptions with no additional options
 */
export interface ClaudeMdValidatorOptions extends BaseValidatorOptions {
  // No additional options specific to CLAUDE.md validator
}

/**
 * Validates CLAUDE.md files for size, format, and structure
 */
export class ClaudeMdValidator extends BaseValidator {
  private basePath: string;
  private processedImports = new Set<string>();
  private caseInsensitivePathMap = new Map<string, string>(); // normalized path -> actual path

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
      await this.checkFrontmatter(filePath, content);
    }

    // Content organization checks (for main CLAUDE.md files)
    if (filePath.endsWith('CLAUDE.md') && !filePath.includes('.claude/rules/')) {
      this.checkContentOrganization(filePath, content);
    }

    // Check for imports in code blocks (they won't be processed)
    this.checkImportsInCodeBlocks(filePath, content);

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
    if (sectionCount > CLAUDE_MD_MAX_SECTIONS) {
      this.reportWarning(
        `CLAUDE.md has ${sectionCount} sections (>${CLAUDE_MD_MAX_SECTIONS} is hard to navigate). ` +
          `Consider organizing content into separate files in .claude/rules/ directory. ` +
          `For example: .claude/rules/git.md, .claude/rules/api.md, .claude/rules/testing.md`,
        filePath
      );
    }
  }

  private async checkFrontmatter(filePath: string, content: string): Promise<void> {
    // Use schema-based validation
    const { data: frontmatter, result } = await validateFrontmatterWithSchema(
      content,
      ClaudeMdFrontmatterSchema,
      filePath,
      'claude-md'
    );

    // Merge schema validation results
    this.errors.push(...result.errors);
    this.warnings.push(...result.warnings);

    // If no frontmatter, that's okay - it's optional for rules files
    if (!frontmatter) {
      return;
    }

    // Additional validation: Check for glob pattern validity
    if (frontmatter.paths) {
      for (const pattern of frontmatter.paths) {
        this.validateGlobPattern(filePath, pattern);
      }
    }
  }

  private validateGlobPattern(filePath: string, pattern: string): void {
    // Warn about common mistakes in glob patterns
    if (pattern.includes('\\')) {
      this.reportWarning(
        `Path pattern uses backslashes: ${pattern}. Use forward slashes even on Windows.`,
        filePath
      );
    }

    // Warn if pattern looks like it might be too broad
    if (pattern === '**' || pattern === '*') {
      this.reportWarning(
        `Path pattern is very broad: ${pattern}. Consider being more specific.`,
        filePath
      );
    }
  }

  private checkImportsInCodeBlocks(filePath: string, content: string): void {
    // Find all fenced code blocks (``` or ~~~)
    const fencedBlockRegex = /^```[\s\S]*?^```|^~~~[\s\S]*?^~~~/gm;
    const codeBlocks: Array<{ start: number; end: number }> = [];

    let match;
    while ((match = fencedBlockRegex.exec(content)) !== null) {
      codeBlocks.push({
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    // Check if any imports fall within code blocks
    const imports = extractImportsWithLineNumbers(content);

    for (const importInfo of imports) {
      // Calculate the character position of this import
      const lines = content.split('\n');
      let charPos = 0;
      for (let i = 0; i < importInfo.line - 1; i++) {
        charPos += lines[i].length + 1; // +1 for newline
      }

      // Check if this import is inside any code block
      for (const block of codeBlocks) {
        if (charPos >= block.start && charPos <= block.end) {
          this.reportError(
            `Import statement found inside code block: ${importInfo.path}. ` +
              `Imports in code blocks are not processed by Claude Code. ` +
              `Move the import outside of the code block.`,
            filePath,
            importInfo.line,
            'import-in-code-block'
          );
          break;
        }
      }
    }
  }

  /**
   * Check if a path is involved in a circular symlink chain
   */
  private async checkSymlinkCycle(filePath: string, _originPath: string): Promise<boolean> {
    try {
      const stats = await lstat(filePath);

      if (!stats.isSymbolicLink()) {
        return false;
      }

      const visited = new Set<string>();
      let currentPath = filePath;
      visited.add(currentPath);

      // Follow symlink chain
      while (true) {
        const linkStats = await lstat(currentPath);

        if (!linkStats.isSymbolicLink()) {
          break;
        }

        const targetPath = await readlink(currentPath);
        const resolvedTarget = resolvePath(dirname(currentPath), targetPath);

        // Check if we've created a cycle
        if (visited.has(resolvedTarget)) {
          return true;
        }

        visited.add(resolvedTarget);
        currentPath = resolvedTarget;

        // Safety limit to prevent infinite loops
        if (visited.size > 100) {
          return true;
        }
      }

      return false;
    } catch (error) {
      // If we can't read the symlink, it might be broken but not circular
      return false;
    }
  }

  /**
   * Check for case-sensitive filename collisions
   */
  private checkCaseSensitivity(filePath: string, originPath: string): void {
    const normalized = filePath.toLowerCase();
    const existingPath = this.caseInsensitivePathMap.get(normalized);

    if (existingPath && existingPath !== filePath) {
      this.reportWarning(
        `Case-sensitive filename collision detected: "${basename(filePath)}" and "${basename(existingPath)}" differ only in case. ` +
        `This may cause issues on case-insensitive filesystems (macOS, Windows).`,
        originPath,
        undefined,
        'filename-case-sensitive'
      );
    } else {
      this.caseInsensitivePathMap.set(normalized, filePath);
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

      // Check for case-sensitive filename collisions
      this.checkCaseSensitivity(resolvedPath, filePath);

      // Check for circular symlinks
      const hasSymlinkCycle = await this.checkSymlinkCycle(resolvedPath, filePath);
      if (hasSymlinkCycle) {
        this.reportError(
          `Circular symlink detected: ${importInfo.path}`,
          filePath,
          importInfo.line,
          'rules-circular-symlink'
        );
        continue;
      }

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
          `Failed to read imported file: ${formatError(error)}`,
          filePath,
          importInfo.line
        );
      }
    }
  }
}

// Register validator with factory
ValidatorRegistry.register(
  {
    id: 'claude-md',
    name: 'CLAUDE.md Validator',
    description: 'Validates CLAUDE.md files for size, format, and structure',
    filePatterns: ['**/CLAUDE.md', '**/.claude/rules/*.md'],
    enabled: true,
  },
  (options) => new ClaudeMdValidator(options)
);
