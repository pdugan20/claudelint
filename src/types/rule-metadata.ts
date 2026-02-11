/**
 * Rule Documentation Metadata Types
 *
 * Types for auto-generating rule documentation from source code.
 * Rules include a `docs` property in their `meta` object that
 * drives the generation of VitePress documentation pages.
 *
 * @see scripts/generate/rule-docs.ts - Generation script
 * @see scripts/generators/rule-page.ts - Page template generator
 */

/**
 * Documentation metadata for a rule
 *
 * Added as `meta.docs` on rule definitions. Used by the generation
 * script to produce consistent, high-quality documentation pages.
 */
export interface RuleDocumentation {
  /** Whether this rule is included in the recommended config */
  recommended?: boolean;

  /** One-sentence summary for search indexes and overview pages */
  summary: string;

  /**
   * Detailed explanation of the rule.
   * Supports markdown. Should explain:
   * - When the rule triggers
   * - Why it exists
   * - What problems it prevents
   */
  details: string;

  /** Code examples showing incorrect and correct usage */
  examples: {
    incorrect: ExampleBlock[];
    correct: ExampleBlock[];
  };

  /** Step-by-step fix instructions */
  howToFix?: string;

  /**
   * JSON schema for rule options.
   * Used to document configurable behavior.
   */
  options?: Record<string, unknown>;

  /** Example configurations showing how to configure the rule */
  optionExamples?: ConfigExample[];

  /** Guidance on when to disable this rule */
  whenNotToUse?: string;

  /** IDs of related rules */
  relatedRules?: string[];

  /** External links for further reading */
  furtherReading?: Link[];
}

/**
 * A code example block for rule documentation
 */
export interface ExampleBlock {
  /** Description of what this example demonstrates */
  description: string;

  /** The example code */
  code: string;

  /** Syntax highlighting language (default: 'yaml') */
  language?: string;
}

/**
 * A configuration example for rule options documentation
 */
export interface ConfigExample {
  /** Description of what this configuration does */
  description: string;

  /** The configuration object */
  config: Record<string, unknown>;
}

/**
 * An external link for further reading
 */
export interface Link {
  /** Display text for the link */
  title: string;

  /** URL (can be absolute or relative to site root) */
  url: string;
}
