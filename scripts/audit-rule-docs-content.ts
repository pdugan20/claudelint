#!/usr/bin/env ts-node
/**
 * Audit rule documentation CONTENT completeness (companion to audit-rule-docs.ts)
 *
 * While audit-rule-docs.ts checks formatting compliance,
 * this script assesses content depth and identifies work needed:
 * - Placeholder vs full content detection
 * - Missing sections (Rule Details, examples, How To Fix)
 * - Option documentation (if rule has options in code, are they documented?)
 * - Completeness scores (0-100)
 * - Work prioritization for Task 2.7.13
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface RuleContentAudit {
  ruleId: string;
  category: string;
  rulePath: string;
  docPath: string;
  score: number;
  issues: string[];
  hasOptionsInCode: boolean;
  couldHaveOptions: boolean;
  docStats: {
    lineCount: number;
    isPlaceholder: boolean;
    hasRuleDetails: boolean;
    hasIncorrectExample: boolean;
    hasCorrectExample: boolean;
    hasHowToFix: boolean;
    hasOptionsSection: boolean;
    ruleDetailsLength: number; // lines in Rule Details section
  };
}

interface ContentAuditSummary {
  totalRules: number;
  byCategory: Record<string, { total: number; avgScore: number; needsWork: number }>;
  avgScore: number;
  scoreDistribution: {
    placeholder: number; // 0-30
    incomplete: number; // 31-60
    good: number; // 61-85
    excellent: number; // 86-100
  };
  rulesNeedingWork: number;
  placeholders: number;
  rulesWithOptions: number;
  rulesMissingExamples: number;
  easyOptionsOpportunities: number;
}

/**
 * Check if rule has options in code
 */
function hasOptionsInCode(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.includes('schema:') && content.includes('defaultOptions:');
  } catch {
    return false;
  }
}

/**
 * Determine if rule could benefit from options
 */
function couldHaveOptions(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Skip if already has options
    if (hasOptionsInCode(filePath)) {
      return false;
    }

    // Rules with hardcoded numeric thresholds
    const hasHardcodedNumbers = [
      /\bconst\s+\w*(?:max|min|limit|threshold)\w*\s*=\s*\d+/i,
      /\b(?:max|min)(?:Size|Lines|Depth|Files|Length|Count)\s*=\s*\d+/i,
      /if\s*\([^)]*(?:>|<|===)\s*\d+\)/,
    ].some((pattern) => pattern.test(content));

    // Rules with hardcoded patterns/arrays that could be configurable
    const hasHardcodedPatterns =
      /const\s+(?:dangerous|forbidden|restricted|invalid)\w+\s*=\s*\[/.test(content);

    // Rules with boolean checks that could be toggleable
    const hasToggleableLogic =
      /\/\/\s*TODO:.*(?:configurable|option)/i.test(content) ||
      /\/\/\s*Consider making this configurable/i.test(content);

    return hasHardcodedNumbers || hasHardcodedPatterns || hasToggleableLogic;
  } catch {
    return false;
  }
}

/**
 * Parse documentation file for content analysis
 */
function parseDocContent(docPath: string): RuleContentAudit['docStats'] {
  if (!fs.existsSync(docPath)) {
    return {
      lineCount: 0,
      isPlaceholder: true,
      hasRuleDetails: false,
      hasIncorrectExample: false,
      hasCorrectExample: false,
      hasHowToFix: false,
      hasOptionsSection: false,
      ruleDetailsLength: 0,
    };
  }

  const content = fs.readFileSync(docPath, 'utf-8');
  const lines = content.split('\n');

  // Check for sections
  const hasRuleDetails = content.includes('## Rule Details');
  const hasIncorrectExample = /###\s+Incorrect/i.test(content);
  const hasCorrectExample = /###\s+Correct/i.test(content);
  const hasHowToFix = content.includes('## How To Fix');
  const hasOptionsSection = content.includes('## Options');

  // Calculate Rule Details section length
  let ruleDetailsLength = 0;
  if (hasRuleDetails) {
    const ruleDetailsStart = content.indexOf('## Rule Details');
    const nextHeading = content.indexOf('\n## ', ruleDetailsStart + 1);
    const ruleDetailsSection =
      nextHeading > -1
        ? content.substring(ruleDetailsStart, nextHeading)
        : content.substring(ruleDetailsStart);
    ruleDetailsLength = ruleDetailsSection.split('\n').length;
  }

  // Placeholder detection: docs with minimal content
  const isPlaceholder =
    lines.length < 25 ||
    (!hasRuleDetails &&
      !hasIncorrectExample &&
      !hasCorrectExample &&
      !hasHowToFix) ||
    ruleDetailsLength < 5;

  return {
    lineCount: lines.length,
    isPlaceholder,
    hasRuleDetails,
    hasIncorrectExample,
    hasCorrectExample,
    hasHowToFix,
    hasOptionsSection,
    ruleDetailsLength,
  };
}

/**
 * Calculate completeness score (0-100)
 */
function calculateContentScore(
  docStats: RuleContentAudit['docStats'],
  hasOptionsInCode: boolean
): number {
  let score = 0;

  // Not a placeholder (30 points)
  if (!docStats.isPlaceholder) {
    score += 30;
  }

  // Rule Details section with substantial content (25 points)
  if (docStats.hasRuleDetails) {
    if (docStats.ruleDetailsLength >= 10) {
      score += 25; // Substantial explanation
    } else if (docStats.ruleDetailsLength >= 5) {
      score += 15; // Minimal explanation
    } else {
      score += 5; // Just a heading
    }
  }

  // Examples (30 points total - most important!)
  if (docStats.hasIncorrectExample) {
    score += 15;
  }
  if (docStats.hasCorrectExample) {
    score += 15;
  }

  // How To Fix section (10 points)
  if (docStats.hasHowToFix) {
    score += 10;
  }

  // Options documentation if needed (5 points)
  if (hasOptionsInCode) {
    if (docStats.hasOptionsSection) {
      score += 5;
    }
  } else {
    // Bonus for not having unnecessary options section
    if (!docStats.hasOptionsSection) {
      score += 5;
    }
  }

  return Math.min(score, 100);
}

/**
 * Audit a single rule
 */
function auditRuleContent(rulePath: string): RuleContentAudit {
  const parts = rulePath.split('/');
  const category = parts[2]; // src/rules/{category}/*.ts
  const ruleId = path.basename(rulePath, '.ts');
  const docPath = `docs/rules/${category}/${ruleId}.md`;

  const hasOptions = hasOptionsInCode(rulePath);
  const couldHave = couldHaveOptions(rulePath);
  const docStats = parseDocContent(docPath);
  const score = calculateContentScore(docStats, hasOptions);

  const issues: string[] = [];

  // Check for issues
  if (docStats.isPlaceholder) {
    issues.push('PLACEHOLDER - needs full documentation with examples and explanations');
  }

  if (!docStats.hasRuleDetails) {
    issues.push('Missing "Rule Details" section');
  } else if (docStats.ruleDetailsLength < 5) {
    issues.push('Rule Details section is too short (needs explanation of when/why)');
  }

  if (!docStats.hasIncorrectExample) {
    issues.push('Missing "Incorrect" code example');
  }

  if (!docStats.hasCorrectExample) {
    issues.push('Missing "Correct" code example');
  }

  if (!docStats.hasHowToFix) {
    issues.push('Missing "How To Fix" section');
  }

  if (hasOptions && !docStats.hasOptionsSection) {
    issues.push('Rule has configurable options but docs do not document them');
  }

  if (couldHave && !hasOptions) {
    issues.push('OPPORTUNITY: Could add configurable options (has hardcoded values)');
  }

  return {
    ruleId,
    category,
    rulePath,
    docPath,
    score,
    issues,
    hasOptionsInCode: hasOptions,
    couldHaveOptions: couldHave,
    docStats,
  };
}

/**
 * Generate summary statistics
 */
function generateContentSummary(audits: RuleContentAudit[]): ContentAuditSummary {
  const byCategory: Record<string, { total: number; avgScore: number; needsWork: number }> =
    {};
  let totalScore = 0;
  const scoreDistribution = {
    placeholder: 0,
    incomplete: 0,
    good: 0,
    excellent: 0,
  };

  for (const audit of audits) {
    // Initialize category
    if (!byCategory[audit.category]) {
      byCategory[audit.category] = { total: 0, avgScore: 0, needsWork: 0 };
    }

    // Count by category
    byCategory[audit.category].total++;
    byCategory[audit.category].avgScore += audit.score;
    if (audit.score < 86) {
      byCategory[audit.category].needsWork++;
    }

    // Total score
    totalScore += audit.score;

    // Score distribution
    if (audit.score <= 30) {
      scoreDistribution.placeholder++;
    } else if (audit.score <= 60) {
      scoreDistribution.incomplete++;
    } else if (audit.score <= 85) {
      scoreDistribution.good++;
    } else {
      scoreDistribution.excellent++;
    }
  }

  // Calculate average scores per category
  for (const category in byCategory) {
    byCategory[category].avgScore = Math.round(
      byCategory[category].avgScore / byCategory[category].total
    );
  }

  return {
    totalRules: audits.length,
    byCategory,
    avgScore: Math.round(totalScore / audits.length),
    scoreDistribution,
    rulesNeedingWork: audits.filter((a) => a.score < 86).length,
    placeholders: audits.filter((a) => a.docStats.isPlaceholder).length,
    rulesWithOptions: audits.filter((a) => a.hasOptionsInCode).length,
    rulesMissingExamples: audits.filter(
      (a) => !a.docStats.hasIncorrectExample || !a.docStats.hasCorrectExample
    ).length,
    easyOptionsOpportunities: audits.filter((a) => a.couldHaveOptions && !a.hasOptionsInCode)
      .length,
  };
}

/**
 * Format audit report
 */
function formatContentReport(audits: RuleContentAudit[], summary: ContentAuditSummary): string {
  const lines: string[] = [];

  lines.push('================================================================================');
  lines.push('              Rule Documentation CONTENT Audit Report');
  lines.push('                   (Content Depth & Completeness)');
  lines.push('================================================================================');
  lines.push('');

  // Summary
  lines.push('EXECUTIVE SUMMARY');
  lines.push('-----------------');
  lines.push(`Total Rules: ${summary.totalRules}`);
  lines.push(`Average Content Score: ${summary.avgScore}/100`);
  lines.push('');
  lines.push('Content Quality Distribution:');
  lines.push(
    `  Placeholder (0-30):   ${summary.scoreDistribution.placeholder} rules (${Math.round((summary.scoreDistribution.placeholder / summary.totalRules) * 100)}%)`
  );
  lines.push(
    `  Incomplete (31-60):   ${summary.scoreDistribution.incomplete} rules (${Math.round((summary.scoreDistribution.incomplete / summary.totalRules) * 100)}%)`
  );
  lines.push(
    `  Good (61-85):         ${summary.scoreDistribution.good} rules (${Math.round((summary.scoreDistribution.good / summary.totalRules) * 100)}%)`
  );
  lines.push(
    `  Excellent (86-100):   ${summary.scoreDistribution.excellent} rules (${Math.round((summary.scoreDistribution.excellent / summary.totalRules) * 100)}%)`
  );
  lines.push('');
  lines.push(
    `Rules Needing Work: ${summary.rulesNeedingWork} (${Math.round((summary.rulesNeedingWork / summary.totalRules) * 100)}%)`
  );
  lines.push(`  - Placeholders: ${summary.placeholders}`);
  lines.push(`  - Missing Examples: ${summary.rulesMissingExamples}`);
  lines.push('');
  lines.push(`Rules with Configurable Options: ${summary.rulesWithOptions}`);
  lines.push(
    `Easy Option Opportunities: ${summary.easyOptionsOpportunities} (rules with hardcoded values)`
  );
  lines.push('');

  // By Category
  lines.push('BY CATEGORY');
  lines.push('-----------');
  const categories = Object.keys(summary.byCategory).sort();
  for (const category of categories) {
    const stats = summary.byCategory[category];
    lines.push(
      `  ${category.padEnd(20)} ${stats.total} rules | avg: ${stats.avgScore}/100 | needs work: ${stats.needsWork}`
    );
  }
  lines.push('');

  // Recommended batches for Task 2.7.13
  lines.push('================================================================================');
  lines.push('RECOMMENDED BATCHES FOR TASK 2.7.13');
  lines.push('================================================================================');
  lines.push('');

  // Batch A: Small categories (pilot)
  const smallCats = categories.filter((c) => summary.byCategory[c].total <= 5);
  if (smallCats.length > 0) {
    lines.push('BATCH A: Small Categories (Pilot - ~' + smallCats.reduce((sum, c) => sum + summary.byCategory[c].total, 0) + ' rules)');
    lines.push('Start here to establish workflow, then scale to larger categories');
    lines.push('');
    for (const cat of smallCats) {
      lines.push(`  ${cat}: ${summary.byCategory[cat].total} rules (avg: ${summary.byCategory[cat].avgScore}/100)`);
    }
    lines.push('');
  }

  // Batch B: Medium categories
  const mediumCats = categories.filter(
    (c) => summary.byCategory[c].total > 5 && summary.byCategory[c].total <= 15
  );
  if (mediumCats.length > 0) {
    lines.push('BATCH B: Medium Categories (~' + mediumCats.reduce((sum, c) => sum + summary.byCategory[c].total, 0) + ' rules)');
    lines.push('');
    for (const cat of mediumCats) {
      lines.push(`  ${cat}: ${summary.byCategory[cat].total} rules (avg: ${summary.byCategory[cat].avgScore}/100)`);
    }
    lines.push('');
  }

  // Batch C: Large categories
  const largeCats = categories.filter((c) => summary.byCategory[c].total > 15);
  if (largeCats.length > 0) {
    lines.push('BATCH C: Large Categories (~' + largeCats.reduce((sum, c) => sum + summary.byCategory[c].total, 0) + ' rules)');
    lines.push('Save for last after workflow is optimized');
    lines.push('');
    for (const cat of largeCats) {
      lines.push(`  ${cat}: ${summary.byCategory[cat].total} rules (avg: ${summary.byCategory[cat].avgScore}/100)`);
    }
    lines.push('');
  }

  // Priority list: worst scores first
  lines.push('================================================================================');
  lines.push('PRIORITY LIST: Rules Needing Work (Sorted by Score)');
  lines.push('================================================================================');
  lines.push('');

  const needsWork = audits
    .filter((a) => a.score < 86)
    .sort((a, b) => a.score - b.score);

  for (const audit of needsWork) {
    const label = audit.docStats.isPlaceholder ? '[PLACEHOLDER]' : '[INCOMPLETE]';
    lines.push(`${label} [${audit.score}/100] ${audit.ruleId} (${audit.category})`);
    for (const issue of audit.issues) {
      lines.push(`  - ${issue}`);
    }
    lines.push('');
  }

  lines.push('================================================================================');
  lines.push('');

  return lines.join('\n');
}

/**
 * Main
 */
function main(): void {
  console.log('Auditing rule documentation content...\n');

  // Get all rule files
  const ruleFiles = glob.sync('src/rules/**/*.ts', {
    ignore: ['**/index.ts', '**/rule-ids.ts'],
  });

  console.log(`Analyzing ${ruleFiles.length} rules\n`);

  // Audit each rule
  const audits: RuleContentAudit[] = [];
  for (const ruleFile of ruleFiles) {
    const audit = auditRuleContent(ruleFile);
    audits.push(audit);
  }

  // Generate summary
  const summary = generateContentSummary(audits);

  // Print report
  const report = formatContentReport(audits, summary);
  console.log(report);

  // Write detailed JSON report
  const jsonReport = {
    summary,
    audits: audits.sort((a, b) => a.score - b.score),
    generatedAt: new Date().toISOString(),
  };

  const outputPath = 'docs/projects/validator-refactor-phase-2/RULE-DOCS-CONTENT-AUDIT.json';
  fs.writeFileSync(outputPath, JSON.stringify(jsonReport, null, 2));
  console.log(`Detailed audit saved to: ${outputPath}`);
  console.log('');

  // Summary for next steps
  if (summary.rulesNeedingWork === 0) {
    console.log('[SUCCESS] All rule documentation is excellent!');
  } else {
    const pct = Math.round((summary.rulesNeedingWork / summary.totalRules) * 100);
    console.log(
      `[ACTION NEEDED] ${summary.rulesNeedingWork}/${summary.totalRules} rules (${pct}%) need documentation work`
    );
    console.log(
      `  - ${summary.placeholders} placeholders need full content`
    );
    console.log(
      `  - ${summary.rulesMissingExamples} need examples`
    );
    console.log(
      `  - ${summary.easyOptionsOpportunities} could have options added`
    );
  }
  console.log('');

  process.exit(0);
}

main();
