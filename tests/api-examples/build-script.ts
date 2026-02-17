// Corresponds to: website/api/recipes.md — "Build Script"
import { lint, formatResults } from 'claude-code-lint';

async function validateProject() {
  console.log('Validating Claude Code files...');

  const results = await lint(['**/*.md']);
  const hasErrors = results.some(r => r.errorCount > 0);

  if (hasErrors) {
    const output = await formatResults(results, 'stylish');
    console.error(output);
    process.exit(1);
  }

  console.log('Validation passed!');
}

validateProject();
