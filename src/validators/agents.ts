import { FileValidator, ValidationResult, BaseValidatorOptions } from './file-validator';
import { findAgentDirectories, readFileContent, fileExists } from '../utils/filesystem/files';
import { validateFrontmatterWithSchema } from '../utils/formats/schema';
import { AgentFrontmatterWithRefinements } from '../schemas/agent-frontmatter.schema';
import { basename, join } from 'path';
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
 * Validates Claude Code agents for structure and frontmatter
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
    const agentDirs = await this.findAgentDirs();
    const agentFiles = agentDirs.map((dir) => join(dir, 'AGENT.md'));
    this.trackValidatedFiles(agentFiles);

    if (agentDirs.length === 0) {
      this.markSkipped('no .claude/agents/');
      return this.getResult();
    }

    this.markScanned(agentFiles);

    for (const agentDir of agentDirs) {
      await this.validateAgent(agentDir);
    }

    return this.getResult();
  }

  private async findAgentDirs(): Promise<string[]> {
    const allAgentDirs = await findAgentDirectories(this.basePath);

    if (this.specificAgent) {
      // Filter to specific agent
      return allAgentDirs.filter((dir) => basename(dir) === this.specificAgent);
    }

    return allAgentDirs;
  }

  private async validateAgent(agentDir: string): Promise<void> {
    const agentMdPath = join(agentDir, 'AGENT.md');

    // Check AGENT.md exists
    const exists = await fileExists(agentMdPath);
    if (!exists) {
      throw new Error(`AGENT.md not found in agent directory: ${agentDir}`);
    }

    // Read content
    const content = await readFileContent(agentMdPath);

    // Parse disable comments
    this.parseDisableComments(agentMdPath, content);

    // Validate frontmatter
    this.validateFrontmatter(agentMdPath, content);

    // Execute ALL Agents rules via category-based discovery
    await this.executeRulesForCategory('Agents', agentMdPath, content);

    // Report unused disable directives if configured
    if (this.options.config?.reportUnusedDisableDirectives) {
      this.reportUnusedDisables(agentMdPath);
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
    description: 'Validates Claude Code agent structure and frontmatter',
    filePatterns: ['**/.claude/agents/*/AGENT.md'],
    enabled: true,
  },
  (options) => new AgentsValidator(options)
);
