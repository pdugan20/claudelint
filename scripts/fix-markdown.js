#!/usr/bin/env node

/**
 * Fix common markdown lint issues
 */

const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  // Fix MD040 - Add language to code blocks without one
  // Match ``` at start of line (with optional leading whitespace) not followed by a language
  const codeBlockRegex = /^(\s*)```\s*$/gm;
  if (codeBlockRegex.test(content)) {
    content = content.replace(codeBlockRegex, '$1```text');
    modified = true;
  }

  // Fix MD036 - Convert bold emphasis to proper headings
  // Match lines that are just bold text (common patterns)
  // **Step 1: ...** or **Option 1: ...** or **Depth 0-2: ...**
  const emphasisHeadingPatterns = [
    // Step/Option/Phase patterns at start of line
    /^\*\*((?:Step|Option|Phase|Depth)\s+[^*]+)\*\*\s*$/gm,
    // Numbered list items that are bold
    /^(\*\*\d+\.\s+[^*]+\*\*)\s*$/gm,
  ];

  for (const pattern of emphasisHeadingPatterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, (match, group1) => {
        // Remove the ** markers and make it a heading
        const text = group1 || match.replace(/\*\*/g, '');
        return `#### ${text}`;
      });
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Fixed: ${filePath}`);
    return true;
  }
  return false;
}

// Get files from command line args
const files = process.argv.slice(2);

if (files.length === 0) {
  console.log('Usage: node fix-markdown.js <file1> <file2> ...');
  process.exit(1);
}

let fixedCount = 0;
for (const file of files) {
  if (fs.existsSync(file)) {
    if (fixFile(file)) {
      fixedCount++;
    }
  } else {
    console.error(`File not found: ${file}`);
  }
}

console.log(`\nFixed ${fixedCount} files`);
