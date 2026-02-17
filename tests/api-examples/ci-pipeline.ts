// Corresponds to: website/api/recipes.md — "CI/CD Pipeline"
import { writeFile } from 'fs/promises';
import { lint, formatResults } from 'claude-code-lint';

async function ciValidation() {
  const results = await lint(['**/*.md']);

  // Human-readable output
  const stylish = await formatResults(results, 'stylish');
  console.log(stylish);

  // JSON report for artifacts
  const json = await formatResults(results, 'json');
  await writeFile('lint-report.json', json);

  // SARIF for GitHub Code Scanning
  const sarif = await formatResults(results, 'sarif');
  await writeFile('lint-report.sarif', sarif);

  const hasErrors = results.some(r => r.errorCount > 0);
  process.exit(hasErrors ? 1 : 0);
}

ciValidation();
