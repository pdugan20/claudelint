import { FileValidator, ValidationResult, BaseValidatorOptions } from './file-validator';
import { findAgentFiles, readFileContent } from '../utils/filesystem/files';
import { validateFrontmatterWithSchema } from '../utils/formats/schema';
import { AgentFrontmatterWithRefinements } from '../schemas/agent-frontmatter.schema';
import { basename } from 'path';
import { validateSettingsHooks } from '../utils/validators/helpers';
import { ValidatorRegistry } from '../utils/validators/factory';

// Auto-register all rules
import '../rules';

/**
 * Options specific to Agents validator
 */
export interface AgentsValidatorOptions extends BaseValidatorOptions {
  /** Validate only a specific agent by name */
  agent?: string;
}

/**
 * Validates Claude Code agent files for structure and frontmatter.
 *
 * Agents are flat .md files (e.g., code-reviewer.md) in .claude/agents/ or agents/.
 * See https://code.claude.com/docs/en/sub-agents#write-subagent-files
 */
export class AgentsValidator extends FileValidator {
  private basePath: string;
  private specificAgent?: string;

  constructor(options: AgentsValidatorOptions = {}) {
    super(options);
    this.basePath = options.path || process.cwd();
    this.specificAgent = options.agent;
  }

  async validate(): Promise<ValidationResult> {
    const agentFiles = await this.findAgentFilePaths();
    this.trackValidatedFiles(agentFiles);

    if (agentFiles.length === 0) {
      this.markSkipped('no agent files');
      return this.getResult();
    }

    this.markScanned(agentFiles);

    for (const agentFile of agentFiles) {
      await this.validateAgent(agentFile);
    }

    return this.getResult();
  }

  private async findAgentFilePaths(): Promise<string[]> {
    const allAgentFiles = await findAgentFiles(this.basePath);

    if (this.specificAgent) {
      return allAgentFiles.filter((file) => basename(file, '.md') === this.specificAgent);
    }

    return allAgentFiles;
  }

  private async validateAgent(filePath: string): Promise<void> {
    // Read content
    const content = await readFileContent(filePath);

    // Parse disable comments
    this.parseDisableComments(filePath, content);

    // Validate frontmatter
    this.validateFrontmatter(filePath, content);

    // Execute ALL Agents rules via category-based discovery
    await this.executeRulesForCategory('Agents', filePath, content);

    // Report unused disable directives if configured
    if (this.options.config?.reportUnusedDisableDirectives) {
      this.reportUnusedDisables(filePath);
    }
  }

  private validateFrontmatter(filePath: string, content: string): void {
    // Use schema-based validation
    const { data: frontmatter, result } = validateFrontmatterWithSchema(
      content,
      AgentFrontmatterWithRefinements,
      filePath,
      'agent'
    );

    // Merge schema validation results (not configurable)
    this.mergeSchemaValidationResult(result);

    // If no frontmatter parsed, schema validation already reported the error
    if (!frontmatter) {
      return;
    }

    // Custom validation: Validate hooks if present
    // Agent hooks in frontmatter use the object-keyed format
    if (frontmatter.hooks) {
      const issues = validateSettingsHooks(
        frontmatter.hooks as Parameters<typeof validateSettingsHooks>[0]
      );
      for (const issue of issues) {
        this.report(issue.message, filePath, undefined, issue.ruleId);
      }
    }
  }
}

// Register validator with factory
ValidatorRegistry.register(
  {
    id: 'agents',
    name: 'Agents Validator',
    description: 'Validates Claude Code agent files for structure and frontmatter',
    filePatterns: ['**/.claude/agents/*.md', 'agents/*.md'],
    enabled: true,
  },
  (options) => new AgentsValidator(options)
);
