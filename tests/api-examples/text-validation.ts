// Corresponds to: website/api/recipes.md — "Text Validation"
import { lintText } from 'claude-code-lint';

async function validateGeneratedContent(content: string) {
  const results = await lintText(content, {
    filePath: 'CLAUDE.md',
  });

  const issues = results[0].messages;

  if (issues.length > 0) {
    console.log('Content has issues:');
    for (const issue of issues) {
      console.log(`Line ${issue.line}: ${issue.message}`);
    }
    return false;
  }

  return true;
}

validateGeneratedContent('# Test');
