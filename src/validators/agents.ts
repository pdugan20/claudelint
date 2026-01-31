import { BaseValidator, ValidationResult, BaseValidatorOptions } from './base';
import { findAgentDirectories, readFileContent, fileExists } from '../utils/filesystem/files';
import { validateFrontmatterWithSchema } from '../utils/formats/schema';
import { AgentFrontmatterWithRefinements } from '../schemas/agent-frontmatter.schema';
import { basename, join } from 'path';
import { validateHook } from '../utils/validators/helpers';
import { HookSchema } from './schemas';
import { z } from 'zod';
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
export class AgentsValidator extends BaseValidator {
  private basePath: string;
  private specificAgent?: string;

  constructor(options: AgentsValidatorOptions = {}) {
    super(options);
    this.basePath = options.path || process.cwd();
    this.specificAgent = options.agent;
  }

  async validate(): Promise<ValidationResult> {
    const agentDirs = await this.findAgentDirs();

    if (agentDirs.length === 0) {
      return this.getResult();
    }

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
    // Note: Hook rules (hooks-invalid-config, hooks-invalid-event) only run on hooks.json
    // Agent hooks in frontmatter are validated here using validateHook() utility
    if (frontmatter.hooks) {
      this.validateHooks(filePath, frontmatter.hooks);
    }
  }

  private validateHooks(filePath: string, hooks: z.infer<typeof HookSchema>[]): void {
    for (const hook of hooks) {
      // Use shared validation utility for common checks
      const issues = validateHook(hook);
      for (const issue of issues) {
        this.report(issue.message, filePath, undefined, issue.ruleId);
      }

      // Note: We don't validate command scripts for agent hooks since they may be
      // resolved relative to the agent directory or use agent-specific context
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
