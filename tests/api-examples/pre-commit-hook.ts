// Corresponds to: website/api/recipes.md — "Pre-commit Hook"
import { execSync } from 'child_process';
import { lint, formatResults } from 'claude-code-lint';

async function validateStaged() {
  const stagedFiles = execSync('git diff --cached --name-only --diff-filter=ACM')
    .toString()
    .split('\n')
    .filter(f => f.endsWith('.md'));

  if (stagedFiles.length === 0) return;

  const results = await lint(stagedFiles, {
    errorOnUnmatchedPattern: false,
  });

  const hasErrors = results.some(r => r.errorCount > 0);

  if (hasErrors) {
    const output = await formatResults(results, 'compact');
    console.error('Validation failed:');
    console.error(output);
    process.exit(1);
  }
}

validateStaged();
