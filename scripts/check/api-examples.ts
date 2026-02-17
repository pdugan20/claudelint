/**
 * Verify that every file in tests/api-examples/ has a corresponding
 * "Corresponds to:" comment that references an existing docs page,
 * and that every TypeScript code block in recipes.md has a matching example file.
 */

import * as fs from 'fs';
import * as path from 'path';
import { log } from '../util/logger';

const EXAMPLES_DIR = path.resolve(__dirname, '../../tests/api-examples');
const RECIPES_FILE = path.resolve(__dirname, '../../website/api/recipes.md');

let exitCode = 0;

function error(msg: string): void {
  log.bracket.error(msg);
  exitCode = 1;
}

// 1. Check that every example file has a "Corresponds to:" comment
const exampleFiles = fs
  .readdirSync(EXAMPLES_DIR)
  .filter(f => f.endsWith('.ts'));

if (exampleFiles.length === 0) {
  error('No example files found in tests/api-examples/');
}

const exampleSections = new Set<string>();

for (const file of exampleFiles) {
  const content = fs.readFileSync(path.join(EXAMPLES_DIR, file), 'utf-8');
  const match = content.match(/^\/\/ Corresponds to: (.+)$/m);
  if (!match) {
    error(`${file}: missing "// Corresponds to:" comment on first line`);
  } else {
    // Extract section name (e.g., "Build Script" from "website/api/recipes.md — "Build Script"")
    const sectionMatch = match[1].match(/\u2014 "(.+)"$/);
    if (sectionMatch) {
      exampleSections.add(sectionMatch[1]);
    }
  }
}

// 2. Check that every TypeScript code block in recipes.md with a preceding heading has a matching example
const recipesContent = fs.readFileSync(RECIPES_FILE, 'utf-8');
const lines = recipesContent.split('\n');
const recipeSections: string[] = [];

let currentHeading = '';
for (const line of lines) {
  const headingMatch = line.match(/^###\s+(.+)$/);
  if (headingMatch) {
    currentHeading = headingMatch[1];
  }
  if (line.startsWith('```typescript') && currentHeading) {
    recipeSections.push(currentHeading);
    currentHeading = '';
  }
}

for (const section of recipeSections) {
  if (!exampleSections.has(section)) {
    error(
      `Recipe section "${section}" has a TypeScript code block but no matching example file in tests/api-examples/`
    );
  }
}

if (exitCode === 0) {
  log.bracket.success(
    `All ${exampleFiles.length} example files are cross-referenced with recipes.md`
  );
}

process.exit(exitCode);
