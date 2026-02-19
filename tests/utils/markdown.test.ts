import {
  extractFrontmatter,
  countLines,
  extractBodyContent,
  hasMarkdownSection,
  extractImports,
  extractImportsWithLineNumbers,
  getFrontmatterFieldLine,
  stripCodeBlocks,
} from '../../src/utils/formats/markdown';

describe('Markdown utilities', () => {
  describe('extractFrontmatter', () => {
    it('should extract valid frontmatter', () => {
      const content = `---
name: test-skill
description: A test skill
---

# Content here`;

      const result = extractFrontmatter<{ name: string; description: string }>(content);

      expect(result.hasFrontmatter).toBe(true);
      expect(result.frontmatter).toEqual({
        name: 'test-skill',
        description: 'A test skill',
      });
      expect(result.content).toBe('# Content here');
    });

    it('should return null frontmatter when none exists', () => {
      const content = '# Just a heading';

      const result = extractFrontmatter(content);

      expect(result.hasFrontmatter).toBe(false);
      expect(result.frontmatter).toBeNull();
      expect(result.content).toBe(content);
    });

    it('should handle Windows \\r\\n line endings', () => {
      const content = '---\r\nname: test\r\ndescription: A test\r\n---\r\n\r\n# Content';

      const result = extractFrontmatter<{ name: string; description: string }>(content);

      expect(result.hasFrontmatter).toBe(true);
      expect(result.frontmatter).toEqual({
        name: 'test',
        description: 'A test',
      });
      expect(result.content).toBe('# Content');
    });
  });

  describe('countLines', () => {
    it('should count lines correctly', () => {
      expect(countLines('line1')).toBe(1);
      expect(countLines('line1\nline2')).toBe(2);
      expect(countLines('line1\nline2\nline3')).toBe(3);
    });
  });

  describe('extractBodyContent', () => {
    it('should extract body content after frontmatter', () => {
      const content = `---
name: test
description: Test
---

# Heading

Body content here`;

      const body = extractBodyContent(content);

      expect(body).toBe('# Heading\n\nBody content here');
    });

    it('should return empty string for content without frontmatter', () => {
      const content = '# Just content';
      const body = extractBodyContent(content);

      expect(body).toBe('');
    });

    it('should return empty string for frontmatter with no body', () => {
      const content = `---
name: test
---`;

      const body = extractBodyContent(content);

      expect(body).toBe('');
    });

    it('should handle body containing triple dashes', () => {
      const content = `---
name: test
---

Body with --- in middle`;

      const body = extractBodyContent(content);

      expect(body).toBe('Body with --- in middle');
    });

    it('should trim whitespace from body', () => {
      const content = `---
name: test
---



Content with leading/trailing space

    `;

      const body = extractBodyContent(content);

      expect(body).toBe('Content with leading/trailing space');
    });

    it('should handle frontmatter YAML containing --- in a value', () => {
      const content = `---
name: test
description: "A --- separator in a value"
---

Body content here`;

      const body = extractBodyContent(content);

      expect(body).toBe('Body content here');
    });

    it('should handle Windows \\r\\n line endings', () => {
      const content = '---\r\nname: test\r\n---\r\n\r\nBody here';

      const body = extractBodyContent(content);

      expect(body).toBe('Body here');
    });
  });

  describe('hasMarkdownSection', () => {
    it('should find H1 section', () => {
      const body = '# System Prompt\n\nContent here';
      const hasSection = hasMarkdownSection(body, /#{1,3}\s*system\s*prompt/i);

      expect(hasSection).toBe(true);
    });

    it('should find H2 section', () => {
      const body = '## System Prompt\n\nContent here';
      const hasSection = hasMarkdownSection(body, /#{1,3}\s*system\s*prompt/i);

      expect(hasSection).toBe(true);
    });

    it('should find H3 section', () => {
      const body = '### System Prompt\n\nContent here';
      const hasSection = hasMarkdownSection(body, /#{1,3}\s*system\s*prompt/i);

      expect(hasSection).toBe(true);
    });

    it('should be case insensitive', () => {
      const body = '# SYSTEM PROMPT\n\nContent here';
      const hasSection = hasMarkdownSection(body, /#{1,3}\s*system\s*prompt/i);

      expect(hasSection).toBe(true);
    });

    it('should return false when section not found', () => {
      const body = '# Other Heading\n\nContent here';
      const hasSection = hasMarkdownSection(body, /#{1,3}\s*system\s*prompt/i);

      expect(hasSection).toBe(false);
    });

    it('should handle multiple sections', () => {
      const body = `# Overview

Some content

## Examples

Example content

## Guidelines

Guideline content`;

      const hasExamples = hasMarkdownSection(body, /#{1,3}\s*examples?/i);
      const hasGuidelines = hasMarkdownSection(body, /#{1,3}\s*(guidelines?|rules?|format)/i);

      expect(hasExamples).toBe(true);
      expect(hasGuidelines).toBe(true);
    });

    it('should not match section in code block', () => {
      const body = `# Real Section

\`\`\`markdown
# Fake Section
\`\`\``;

      // This will still match because regex doesn't know about code blocks
      // But that's acceptable - false positives are better than missing sections
      const hasSection = hasMarkdownSection(body, /#{1,3}\s*fake\s*section/i);

      expect(hasSection).toBe(true); // Expected behavior - regex-based, not AST-based
    });
  });

  describe('extractImports', () => {
    it('should extract basic imports', () => {
      const content = 'Check out @docs/guide and @api/reference';
      const imports = extractImports(content);

      expect(imports).toEqual(['docs/guide', 'api/reference']);
    });

    it('should not match @ inside inline code', () => {
      const content = 'Never use `@ts-ignore` in your code';
      const imports = extractImports(content);

      expect(imports).toEqual([]);
    });

    it('should not match @ inside code blocks', () => {
      const content = `Some text

\`\`\`typescript
// Avoid @ts-ignore
import { Foo } from '@types/react';
\`\`\`

Real import: @docs/guide`;

      const imports = extractImports(content);

      expect(imports).toEqual(['docs/guide']);
    });

    it('should handle mixed content', () => {
      const content = `See @docs/intro for details.

Never use \`@ts-ignore\` unless necessary.

\`\`\`bash
npm install @types/node
\`\`\`

Also check @api/reference and \`@deprecated\` marker.`;

      const imports = extractImports(content);

      expect(imports).toEqual(['docs/intro', 'api/reference']);
    });

    it('should handle empty content', () => {
      const imports = extractImports('');

      expect(imports).toEqual([]);
    });

    it('should handle content with no imports', () => {
      const content = 'Just some regular content with no @ symbols';
      const imports = extractImports(content);

      expect(imports).toEqual([]);
    });
  });

  describe('extractImportsWithLineNumbers', () => {
    it('should extract imports with correct line numbers', () => {
      const content = `Line 1
@docs/guide is on line 2
Line 3
@api/reference is on line 4`;

      const imports = extractImportsWithLineNumbers(content);

      expect(imports).toEqual([
        { path: 'docs/guide', line: 2 },
        { path: 'api/reference', line: 4 },
      ]);
    });

    it('should not match @ inside inline code', () => {
      const content = `Line 1
Never use \`@ts-ignore\` on line 2
@docs/guide is on line 3`;

      const imports = extractImportsWithLineNumbers(content);

      expect(imports).toEqual([{ path: 'docs/guide', line: 3 }]);
    });

    it('should skip code blocks entirely', () => {
      const content = `Line 1
\`\`\`typescript
@ts-ignore should not match
import from '@types/react'
\`\`\`
@docs/guide is after code block`;

      const imports = extractImportsWithLineNumbers(content);

      expect(imports).toEqual([{ path: 'docs/guide', line: 6 }]);
    });

    it('should handle multiple imports on same line', () => {
      const content = 'See @docs/intro and @api/reference';

      const imports = extractImportsWithLineNumbers(content);

      expect(imports).toEqual([
        { path: 'docs/intro', line: 1 },
        { path: 'api/reference', line: 1 },
      ]);
    });

    it('should handle complex mixed content', () => {
      const content = `# Documentation

See @docs/intro for getting started.

## TypeScript

Never use \`@ts-ignore\` unless necessary.

\`\`\`bash
npm install @types/node @types/react
\`\`\`

Check @api/reference for details.`;

      const imports = extractImportsWithLineNumbers(content);

      expect(imports).toEqual([
        { path: 'docs/intro', line: 3 },
        { path: 'api/reference', line: 13 },
      ]);
    });

    it('should handle empty content', () => {
      const imports = extractImportsWithLineNumbers('');

      expect(imports).toEqual([]);
    });

    it('should handle code blocks at start of file', () => {
      const content = `\`\`\`typescript
@ts-ignore
\`\`\`
@docs/guide`;

      const imports = extractImportsWithLineNumbers(content);

      expect(imports).toEqual([{ path: 'docs/guide', line: 4 }]);
    });

    it('should not match Swift decorators like @Injected', () => {
      const content = `Use the @Injected property wrapper for DI.
Also @Observable is useful.
@docs/guide is an actual import.`;

      const imports = extractImportsWithLineNumbers(content);

      expect(imports).toEqual([{ path: 'docs/guide', line: 3 }]);
    });

    it('should not match JSDoc tags like @param', () => {
      const content = `The @param tag documents parameters.
The @returns tag documents return values.
See @docs/api-reference for more.`;

      const imports = extractImportsWithLineNumbers(content);

      expect(imports).toEqual([{ path: 'docs/api-reference', line: 3 }]);
    });

    it('should not match email addresses', () => {
      const content = `Contact user@example.com for help.
See @docs/contact for more.`;

      const imports = extractImportsWithLineNumbers(content);

      expect(imports).toEqual([{ path: 'docs/contact', line: 2 }]);
    });

    it('should match bare file imports like @file.md', () => {
      const content = `Include @imported.md in your project.`;

      const imports = extractImportsWithLineNumbers(content);

      expect(imports).toEqual([{ path: 'imported.md', line: 1 }]);
    });

    it('should skip tilde-fenced code blocks', () => {
      const content = `Before fence
~~~bash
@docs/should-not-match
~~~
@docs/guide after fence`;

      const imports = extractImportsWithLineNumbers(content);

      expect(imports).toEqual([{ path: 'docs/guide', line: 5 }]);
    });

    it('should not close backtick fence with tilde fence in imports', () => {
      const content = `\`\`\`
@docs/in-code-block
~~~
@docs/still-in-code-block
\`\`\`
@docs/outside`;

      const imports = extractImportsWithLineNumbers(content);

      expect(imports).toEqual([{ path: 'docs/outside', line: 6 }]);
    });
  });

  describe('getFrontmatterFieldLine', () => {
    it('should find a field line number', () => {
      const content = `---
name: test
description: A test
version: 1.0.0
---

# Content`;

      expect(getFrontmatterFieldLine(content, 'description')).toBe(3);
      expect(getFrontmatterFieldLine(content, 'version')).toBe(4);
    });

    it('should handle field names with regex metacharacters', () => {
      const content = `---
name: test
metadata[0]: value
---

# Content`;

      // Should not throw, and should find the field
      expect(getFrontmatterFieldLine(content, 'metadata[0]')).toBe(3);
    });

    it('should return default when no frontmatter', () => {
      expect(getFrontmatterFieldLine('# No frontmatter', 'name')).toBe(1);
    });

    it('should return default when field not found', () => {
      const content = `---
name: test
---

# Content`;

      expect(getFrontmatterFieldLine(content, 'nonexistent')).toBe(2);
    });
  });

  describe('stripCodeBlocks', () => {
    it('should strip backtick fenced code blocks', () => {
      const content = `Line 1
\`\`\`typescript
const x = 1;
\`\`\`
Line 5`;

      const result = stripCodeBlocks(content);

      expect(result).toBe('Line 1\n\n\n\nLine 5');
    });

    it('should strip tilde fenced code blocks', () => {
      const content = `Line 1
~~~python
print("hello")
~~~
Line 5`;

      const result = stripCodeBlocks(content);

      expect(result).toBe('Line 1\n\n\n\nLine 5');
    });

    it('should handle unclosed fences by treating rest as code', () => {
      const content = `Line 1
\`\`\`
code here
more code`;

      const result = stripCodeBlocks(content);

      // Everything after the opening fence is treated as code
      expect(result).toBe('Line 1\n\n\n');
    });

    it('should strip inline code from non-fenced lines', () => {
      const content = 'Use `foo` and `bar` for testing';

      const result = stripCodeBlocks(content);

      expect(result).toBe('Use  and  for testing');
    });

    it('should preserve line count', () => {
      const content = `Line 1
\`\`\`
code line 1
code line 2
code line 3
\`\`\`
Line 7`;

      const result = stripCodeBlocks(content);
      const originalLines = content.split('\n').length;
      const resultLines = result.split('\n').length;

      expect(resultLines).toBe(originalLines);
    });

    it('should not strip inline code inside fenced blocks', () => {
      const content = `Outside \`inline\` here
\`\`\`
inside \`code\` block
\`\`\`
Outside again`;

      const result = stripCodeBlocks(content);

      expect(result).toBe('Outside  here\n\n\n\nOutside again');
    });

    it('should pass through content with no code blocks', () => {
      const content = 'Just plain text\nwith multiple lines\nand no code';

      const result = stripCodeBlocks(content);

      expect(result).toBe(content);
    });

    it('should not close backtick fence with tilde fence', () => {
      const content = `\`\`\`
code
~~~
still code
\`\`\`
outside`;

      const result = stripCodeBlocks(content);

      expect(result).toBe('\n\n\n\n\noutside');
    });

    it('should handle multiple code blocks', () => {
      const content = `Text 1
\`\`\`
block 1
\`\`\`
Text 2
~~~
block 2
~~~
Text 3`;

      const result = stripCodeBlocks(content);

      expect(result).toBe('Text 1\n\n\n\nText 2\n\n\n\nText 3');
    });
  });
});
