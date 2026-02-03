#!/usr/bin/env ts-node

/**
 * Check that rule option interfaces follow naming standards
 *
 * Validates:
 * 1. Rules with options have an interface
 * 2. Interface name matches {RuleIdInPascalCase}Options pattern
 * 3. Interface is exported
 * 4. Interface has JSDoc comment
 * 5. Each option property has JSDoc
 * 6. Interface properties match schema properties
 */

import * as fs from 'fs';
import * as path from 'path';
import { log } from '../util/logger';

interface RuleInfo {
  ruleId: string;
  filePath: string;
  hasSchema: boolean;
  schemaProps: string[];
  hasInterface: boolean;
  interfaceName: string | null;
  isExported: boolean;
  hasInterfaceJSDoc: boolean;
  propsWithJSDoc: string[];
  propsWithoutJSDoc: string[];
}

interface Issue {
  ruleId: string;
  severity: 'error' | 'warning';
  message: string;
}

/**
 * Convert kebab-case to PascalCase
 */
function kebabToPascalCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Parse a rule file and extract option interface information
 */
function parseRuleFile(filePath: string): RuleInfo {
  const content = fs.readFileSync(filePath, 'utf-8');
  const ruleId = path.basename(filePath, '.ts');

  // Check for schema
  const hasSchema = /schema:\s*z\.object\(/m.test(content);

  // Extract schema properties
  const schemaProps: string[] = [];
  const schemaMatch = content.match(/schema:\s*z\.object\(\{([^}]+)\}\)/s);
  if (schemaMatch) {
    const schemaBody = schemaMatch[1];
    const propMatches = schemaBody.matchAll(/(\w+):/g);
    for (const match of propMatches) {
      schemaProps.push(match[1]);
    }
  }

  // Check for interface
  const interfaceMatch = content.match(/^(export\s+)?interface\s+(\w+Options)\s*\{/m);
  const hasInterface = !!interfaceMatch;
  const isExported = interfaceMatch ? interfaceMatch[1] !== undefined : false;
  const interfaceName = interfaceMatch ? interfaceMatch[2] : null;

  // Check for interface JSDoc (look for /** comment before interface line)
  let hasInterfaceJSDoc = false;
  if (hasInterface && interfaceMatch) {
    const beforeInterface = content.substring(0, interfaceMatch.index);
    hasInterfaceJSDoc = /\/\*\*[\s\S]*?\*\/\s*$/.test(beforeInterface);
  }

  // Extract interface properties and check for JSDoc
  const propsWithJSDoc: string[] = [];
  const propsWithoutJSDoc: string[] = [];

  if (hasInterface && interfaceName) {
    // Find the interface block
    const interfaceRegex = new RegExp(
      `interface\\s+${interfaceName}\\s*\\{([\\s\\S]*?)\\}`,
      'm'
    );
    const interfaceBodyMatch = content.match(interfaceRegex);
    if (interfaceBodyMatch) {
      const interfaceBody = interfaceBodyMatch[1];
      const lines = interfaceBody.split('\n');

      let lastLineHadJSDoc = false;
      for (const line of lines) {
        const propMatch = line.match(/^\s*(\w+)\??:/);
        if (propMatch) {
          const propName = propMatch[1];
          if (lastLineHadJSDoc) {
            propsWithJSDoc.push(propName);
          } else {
            propsWithoutJSDoc.push(propName);
          }
          lastLineHadJSDoc = false;
        } else if (line.trim().startsWith('/**')) {
          lastLineHadJSDoc = true;
        } else if (!line.trim() || line.trim().startsWith('*')) {
          // Keep JSDoc state for multi-line comments
        } else {
          lastLineHadJSDoc = false;
        }
      }
    }
  }

  return {
    ruleId,
    filePath,
    hasSchema,
    schemaProps,
    hasInterface,
    interfaceName,
    isExported,
    hasInterfaceJSDoc,
    propsWithJSDoc,
    propsWithoutJSDoc,
  };
}

/**
 * Validate a rule's interface against standards
 */
function validateRule(info: RuleInfo): Issue[] {
  const issues: Issue[] = [];
  const expectedName = kebabToPascalCase(info.ruleId) + 'Options';

  // Rule has schema but no interface
  if (info.hasSchema && !info.hasInterface) {
    issues.push({
      ruleId: info.ruleId,
      severity: 'error',
      message: `Rule has schema but no interface. Expected interface: ${expectedName}`,
    });
    return issues; // Can't check further without interface
  }

  // Rule has interface but no schema (shouldn't happen, but check anyway)
  if (info.hasInterface && !info.hasSchema) {
    issues.push({
      ruleId: info.ruleId,
      severity: 'warning',
      message: 'Rule has interface but no schema',
    });
  }

  // Interface exists - validate it
  if (info.hasInterface && info.interfaceName) {
    // Check naming convention
    if (info.interfaceName !== expectedName) {
      issues.push({
        ruleId: info.ruleId,
        severity: 'error',
        message: `Interface name "${info.interfaceName}" does not match expected "${expectedName}"`,
      });
    }

    // Check if exported
    if (!info.isExported) {
      issues.push({
        ruleId: info.ruleId,
        severity: 'error',
        message: `Interface "${info.interfaceName}" is not exported`,
      });
    }

    // Check for interface JSDoc
    if (!info.hasInterfaceJSDoc) {
      issues.push({
        ruleId: info.ruleId,
        severity: 'warning',
        message: `Interface "${info.interfaceName}" is missing JSDoc comment`,
      });
    }

    // Check for property JSDoc
    if (info.propsWithoutJSDoc.length > 0) {
      issues.push({
        ruleId: info.ruleId,
        severity: 'warning',
        message: `Properties missing JSDoc: ${info.propsWithoutJSDoc.join(', ')}`,
      });
    }

    // Check that interface props match schema props
    const interfaceProps = [...info.propsWithJSDoc, ...info.propsWithoutJSDoc];
    const missingInInterface = info.schemaProps.filter(p => !interfaceProps.includes(p));
    const extraInInterface = interfaceProps.filter(p => !info.schemaProps.includes(p));

    if (missingInInterface.length > 0) {
      issues.push({
        ruleId: info.ruleId,
        severity: 'error',
        message: `Interface is missing schema properties: ${missingInInterface.join(', ')}`,
      });
    }

    if (extraInInterface.length > 0) {
      issues.push({
        ruleId: info.ruleId,
        severity: 'warning',
        message: `Interface has extra properties not in schema: ${extraInInterface.join(', ')}`,
      });
    }
  }

  return issues;
}

/**
 * Find all rule files
 */
function findRuleFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findRuleFiles(fullPath));
    } else if (
      entry.name.endsWith('.ts') &&
      !entry.name.endsWith('.test.ts') &&
      entry.name !== 'index.ts' &&
      entry.name !== 'rule-ids.ts'
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

function main() {
  const rulesDir = path.join(__dirname, '../../src/rules');

  log.info('Checking rule option interface naming standards...');
  log.blank();

  // Find all rule files
  const ruleFiles = findRuleFiles(rulesDir);
  log.info(`Found ${ruleFiles.length} rule files`);
  log.blank();

  // Parse and validate each rule
  const allIssues: Issue[] = [];
  let rulesWithOptions = 0;
  let rulesWithIssues = 0;

  for (const ruleFile of ruleFiles) {
    const info = parseRuleFile(ruleFile);

    // Only check rules with options
    if (!info.hasSchema) {
      continue;
    }

    rulesWithOptions++;
    const issues = validateRule(info);

    if (issues.length > 0) {
      rulesWithIssues++;
      allIssues.push(...issues);
    }
  }

  // Report results
  log.divider();
  log.bold('INTERFACE NAMING STANDARDS CHECK');
  log.divider();
  log.blank();
  log.info(`Total rules: ${ruleFiles.length}`);
  log.info(`Rules with options: ${rulesWithOptions}`);
  log.info(`Rules passing: ${rulesWithOptions - rulesWithIssues}`);
  log.info(`Rules with issues: ${rulesWithIssues}`);
  log.blank();

  if (allIssues.length === 0) {
    log.pass('All rule option interfaces follow naming standards!');
    log.blank();
    process.exit(0);
  }

  // Group issues by severity
  const errors = allIssues.filter(i => i.severity === 'error');
  const warnings = allIssues.filter(i => i.severity === 'warning');

  log.divider();
  log.bold('ISSUES FOUND');
  log.divider();
  log.blank();

  if (errors.length > 0) {
    log.info(`ERRORS (${errors.length}):`);
    log.blank();
    for (const error of errors) {
      log.bracket.fail(error.ruleId);
      log.info(`       ${error.message}`);
      log.blank();
    }
  }

  if (warnings.length > 0) {
    log.info(`WARNINGS (${warnings.length}):`);
    log.blank();
    for (const warning of warnings) {
      log.bracket.warn(warning.ruleId);
      log.info(`       ${warning.message}`);
      log.blank();
    }
  }

  // Exit with error if there are errors
  process.exit(errors.length > 0 ? 1 : 0);
}

main();
